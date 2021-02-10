
siApp
.factory('$siFilters', ['$q','$siApi','$siUtils',
function $siFilters($q,$siApi,$siUtils){
    $scope = {
        filters:{}
    }

    $scope.with = function($alias,$context, $resolve){
        if(typeof $alias == 'undefined') return new FilterManager();

        if(typeof $scope.filters[$alias] == 'undefined'){
            //console.log('with return FilterManager', $alias, $context);
            $scope.filters[$alias] = new FilterManager($alias,$context);
        }

        if(typeof $resolve == 'function') $resolve($scope.filters[$alias]);
        
        return $scope.filters[$alias];
    }


    

    function FilterManager($alias,$context){
        
        let $fm = {
            result_url: null,
            alias : $alias,
            query_text: null,
            sort_fields : [],
            filter_group : {
                operator: 'and',
                filters: null,
                filter_groups: null
            },
            main_filter: null,
            price_parts: ['sell','lease'],
            data: {
                keyword : '',
                min_price: null,
                max_price: null,
                location: null,
                transaction_type: null,
                attributes:  [],
                states:[],
                building_categories: [],
                categories: [],
                subcategories: [],
                cities: [],
                regions: [],
                parkings: null,
                contract: null,
                bedrooms: null,
                bathrooms: null,
                land_min: null,
                land_max: null,
                available_min: null,
                available_max: null,
                favorites: null,
                letters: null,
                licenses: [],
                offices: [],
                languages: null,
            },
            configs : null,
            state_loaded: false
        }


        $fm.mainFilterMap = {
            listings : {
                'RES' : {field: 'market_codes', operator: 'array_contains', value: 'RES', type: 'market'},
                'COM' : {field: 'market_codes', operator: 'array_contains', value: 'COM', type: 'market'},
                'for-sale' : {field: 'for_sale_flag', operator: 'equal', value: true, shadows: 'transaction_type'},
                'for-rent' : {field: 'for_rent_flag', operator: 'equal', value: true, shadows: 'transaction_type'}
            }
        }

        $fm.dataFilterMap = {
            transaction_type: function($value){ 
                                if ($value=='sale') return [{field: 'for_sale_flag', operator: 'equal', value: true},{field: 'for_rent_flag', operator: 'equal', value: ''}];
                                if ($value=='rent') return [{field: 'for_rent_flag', operator: 'equal', value: true},{field: 'for_sale_flag', operator: 'equal', value: ''}];
                                return [{field: 'for_rent_flag', operator: 'equal', value: ''},{field: 'for_sale_flag', operator: 'equal', value: ''}]
                            },
            parkings: {field:'attributes.PARKING', operator:'greater_than'},
            contract: function($value){
                            if($context.listing_ages == null) return null;
                            if($value == null) return {field: 'contract.start_date', operator:'greater_than', value: ''};
                            return $context.listing_ages.find(function($age){ return $age.key == $value}).filter;
                        },
            land_min: {field:'land.dimension.area_sf', operator: 'greater_or_equal_to'},
            land_max: {field:'land.dimension.area_sf', operator: 'less_or_equal_to'},
            available_min: {field:'available_area_sf', operator: 'greater_or_equal_to'},
            available_max: {field:'available_area_sf', operator: 'less_or_equal_to'},
            min_price: function($value){
                            //console.log('min_price filter',$value);
                            return {field: $fm.price_parts.map(function($p) {return 'price.' + $p + '.amount'}), operator: 'greater_or_equal_to', value: $value}
                        },
            max_price: function($value){
                            return {field: $fm.price_parts.map(function($p) {return 'price.' + $p + '.amount'}), operator: 'less_or_equal_to', value: $value}
                        },
            building_categories: function($values){
                            return {field: 'building.category_code', operator: 'in', value: $values};
                        },
            attributes: function($value){
                            if($context.listing_attributes == null) return null;

                            return Object.keys($context.listing_attributes).map(function($k){
                                const lItem = $context.listing_attributes[$k];
                                const lValue = $value == null 
                                                ? ''
                                                : $value.includes(lItem.field) 
                                                    ? true 
                                                    : '';

                                return {field: lItem.field, operator : 'equal', value: lValue}
                            });                     
                        },
            states: function($value){
                            if($context.listing_flags == null) return null;

                            const lResult = $context.listing_flags
                                .map(function($flag){
                                    
                                    const lItem = $flag.filter;
                                    
                                    const lValue = $value == null 
                                                    ? ''
                                                    : $value.includes($flag.key) 
                                                        ? lItem.value 
                                                        : '';

                                    return {field: lItem.field, operator : lItem.operator, value: lValue}
                                });      

                            
                            return lResult;               
                        },
            categories: {field: 'category_code','operator': 'in'},
            subcategories : {field: 'subcategory_code',operator: 'in'},
            bedrooms: {field: 'main_unit.bedroom_count',operator: 'greater_or_equal_to'},
            bathrooms: {field: 'main_unit.bathroom_count',operator: 'greater_or_equal_to'},
            cities: {field: 'location.city_code', operator: 'in'},
            regions: {field: 'location.region_code', operator: 'in'},
            favorites: {field: 'ref_number', operator: 'in'},
            letters: { field: 'last_name',operator : 'starts_with' },
            licenses: {field: 'license_type_code', operator: 'in'},
            offices: {field: 'office_ref_number', operator: 'in'},
            languages: {field:'languages',operator:'array_contains'},
            market_type: {field: 'market_codes', operator: 'array_contains'}
        }

        $fm._buildFiltersDebounce = null;
        $fm._events_listener = {};
        // events 
        $fm.on = function($event_key){
            if(typeof $fm._events_listener[$event_key] == 'undefined'){
                $fm._events_listener[$event_key] = [];
            }

            let lResult = {
                _callback :null,
                then : function($fn){
                    this._callback = $fn;
                },
                resolve: function(){
                    //console.log('on resolve',this._callback)
                    this._callback.apply(undefined, arguments);
                }
            }

            $fm._events_listener[$event_key].push(function(){
                lResult.resolve.apply(lResult, arguments);
            });

            return lResult;
        }

        $fm.trigger = function($event_key){
            if(typeof $fm._events_listener[$event_key] == 'undefined') return;
            const $params = Array.prototype.slice.call(arguments,1);
            $fm._events_listener[$event_key].forEach(function($e) {return $e.apply(undefined, $params)});
        }

        $fm.searchByKeyword = function($keyword){
            $fm.resetFilters(false);

            $fm.query_text = $keyword;
            $fm.data.keyword = $keyword;
            
            $fm.saveState();
            $fm.buildFilters();
        }

        $fm.setLetter = function($letter){
            $fm.data.letters = $letter;

            $fm.update();
            $fm.trigger('update');
        }

        

        // --------------------------------------
        // #region FILTERS HANDLING
        // --------------------------------------

        $fm.count = function(){
            return Object.keys($fm.data).reduce(function($acc, $k){
                if(Array.isArray($fm.data[$k])){
                    return ($fm.data[$k].length > 0) ? $acc+1 : $acc;
                }
                if($k == 'min_price'){
                    return ($fm.data[$k] != null && $fm.data[$k] > 0) ? $acc + 1 : $acc;
                }
                return ($fm.data[$k] != null && $fm.data[$k] != '') ? $acc + 1 : $acc;
            },0);
        }

        /**
         * Check wether there's any filter or not
         * @return {boolean}
         */
        $fm.hasFilters = function($customCheck){
            //console.log('hasFilters',$fm.filter_group.filter_groups, $fm.filter_group.filters);
            return Object.keys($fm.data)
                .filter(function($k){
                    return !['keyword','location'].includes($k);
                })
                .some(function($k){
                    if(Array.isArray($fm.data[$k])){
                        return $fm.data[$k].length > 0;
                    }
                    if($k == 'min_price'){
                        return $fm.data[$k] != null && $fm.data[$k] > 0;
                    }
                    if($k == 'max_price'){
                        return $fm.data[$k] != null && $fm.data[$k] > 0;
                    }
                    return $fm.data[$k] != null && $fm.data[$k] != '';
                });
        }


        /**
         * Check if a filter matches a name
         * @param {string} $fieldname Name of the filter
         * @return {boolean} 
         */
        $fm.hasFilter = function($fieldname){
            if($fm.hasFilters()){
                let lFields = $fieldname
                if(!Array.isArray(lFields)){
                    lFields = [$fieldname];
                }
                
                return lFields.some(function($f) {
                    if($fm.data[$f] != undefined){
                        if(Array.isArray($fm.data[$f])) return $fm.data[$f].length > 0;
                        if(!isNaN($fm.data[$f])){
                            return $fm.data[$f] > 0 ;
                        }

                        return $fm.data[$f] != null;
                    }
                    
                    return $fm.getFilterByFieldName($f) != null
                });
            }
            else{
                return false;
            }
        }

        $fm.sublistHasFilters = function($parent_code, $list, $selections){
            
            if($selections == null) return false;
            if(!Array.isArray($selections)) return false;
            if($selections.length == 0) return false;


            return $list
                .filter(function($item){
                    return $item.parent == $parent_code;
                })
                .some(function($item){
                    return $selections.includes($item.__$obj_key)
                });
        }

        $fm.sublistClearFilters = function($parent_code, $list, $selections){
            if($selections == null) return;
            if(!Array.isArray($selections)) return;
            if($selections.length == 0) return;

            $list
                .filter(function($item){
                    return $item.parent == $parent_code;
                })
                .forEach(function($item){
                    const lItemIndex = $selections.findIndex(function($i){ return $i == $item.__$obj_key});
                    if(lItemIndex >= 0 ){
                        $selections.splice(lItemIndex, 1);
                    }
                })
        }

        /**
         * Get the value stored in a filter
         * @param {string} $fieldname Name of the filter
         * @return {*} Return the value when found, null otherwise
         */
        $fm.getFilterValue = function($fieldname){
            let lFilter = $fm.getFilterByFieldName($fieldname);
            if(lFilter!=null){
                return lFilter.value;
            }
            return null;
        }

        $fm.getFilterCaption = function($fieldname, $default){
            let lFilter = $fm.getFilterByFieldName($fieldname);
            if(lFilter!=null){
                //console.log('filter found for caption', lFilter);
                $default = typeof($default)=='undefined' ? lFilter.value:$default;
                return lFilter.label;
            }

            $default = typeof($default)=='undefined' ? '':$default;
            return $default;
        }

        $fm.getFilterCaptionFromList = function($fieldname,$list,$default){
            let lValue = null;

            if(typeof $fieldname == 'object'){
                const lKey = Object.keys($fieldname)[0];
                lValue = $fm[lKey][$fieldname[lKey]]
            }
            else{
                lValue = $fm.getFilterValue($fieldname);
            }
            
            if(lValue == null){
                return $default;
            }
            let lItem = null;
            if($list.some(function($e){ return $e.filter != undefined})){
                lItem = $list.find(function($e) {return $e.filter.value == lValue});
            }
            else{
                lItem = $list.find(function($e){return $e.value == lValue});
            }
            
            if(lItem == null){
                return $default;
            }
            
            if(lItem.label != undefined){
                return lItem.label;
            }
            if(lItem.name != undefined){
                return lItem.name;
            }
            return lItem.caption;
        }
        
        /**
         * Get a filter by the field name associated to it
         * @param {string} $fieldname Name of the filter
         * @return {*} Return the filter when found, null otherwise
         */
        $fm.getFilterByFieldName = function($fieldname, $group){    
            let lResult = null;
            $group = (typeof $group == 'undefined') ? $fm.filter_group : $group;

            if($group.filters != null){
                $group.filters.some(function($e){
                    if($fieldname.indexOf('*')>=0){
                        if($e.field.indexOf($fieldname.replace("*",""))>=0){
                            lResult = $e;
                            return true;
                        }
                    }
                    else{
                        if($e.field == $fieldname){
                            lResult = $e;
                            return true;
                        }
                    }
                });
            }

            if(lResult == null && $group.filter_groups != null){
                $group.filter_groups.some(function($group){
                    let lGroupResult = $fm.getFilterByFieldName($fieldname, $group);
                    if(lGroupResult != null){
                        lResult = lGroupResult;
                        return true;
                    }
                });
            }

            return lResult;
            
        }


        $fm.setMainFilter = function($type, $filterKey){
            $fm.main_filter = {type: $type, key: $filterKey};
        }

        /**
         * Add a filter to the list
         * @param {*} $field Field name (or array of field name) on which the filter is applied
         * @param {string} $operator Operand for the filter
         * @param {*} $value Value to filter
         * @param {*} $label Caption for the filter hint
         * @param {*} $reverseFunc Function to remove the filter
         */
        $fm.addFilter = function($field,$operator,$value, $label, $reverseFunc){
            if($fm._buildFiltersDebounce!= null){
                window.clearTimeout($fm._buildFiltersDebounce);
            }

            // if(typeof $fm.$parent.addFilter == 'function'){
            //     $fm.$parent.addFilter($field,$operator,$value,$label,$reverseFunc);
            //     return;
            // }
            $fm.resetKeywordSearch();

            // When field is and array
            if(Array.isArray($field)){
                $fm.addFilterGroup($field, $operator, $value, $label);
            }
            else{
                $fm.setFilter($field, $operator, $value, $fm.filter_group, $label,$reverseFunc);
            }

            // save filters to localStorage
            $fm.saveState();

            $fm._buildFiltersDebounce = window.setTimeout(function(){
                $fm.buildFilters();
            }, 100); 
        }

        $fm.toggleFilter = function($field,$operator,$value, $label, $reverseFunc){
            if($fm.hasFilter($field) && $fm.getFilterValue($field) == $value){
                $fm.addFilter($field,$operator,null);
            }
            else{
                $fm.addFilter($field,$operator,$value, $label, $reverseFunc)
            }
        }

        $fm.addGeoFilter = function(){
            $q(function($resolve,$reject){
                if($fm.data.location != null){
                    $fm.data.location = null;
                    
                    $resolve();
                }
                else{
                    navigator.geolocation.getCurrentPosition(function($position){
                        //console.log($position);
                        $fm.data.location = {
                            latitude: $position.coords.latitude,
                            longitude: $position.coords.longitude,
                            distance : 5000 // set radius to 5Km
                        };
    
                        $resolve();
                    });
                }
            }).then(function(){
                $fm.saveState();
                $fm.buildFilters();
                $fm.trigger('update');
            });
            
        }

        /**
         * Add a filter from an attribute
         * @param {object} $attr 
         */
        $fm.addAttributeFilter = function($attr){
            let lValue = $attr.selected ? true : '';

            $fm.addFilter(
                $attr.field, 
                'equal', 
                lValue, 
                $attr.caption.translate(),
                function(){
                    //console.log('reversin attr',$attr);
                    $attr.selected=false;
                    $fm.addFilter($attr.field,'equal','');
                }
            );
        }


        $fm.addFilterGroup = function($fields,$operator,$value, $label){
            let lGroupName = $fields.join('-') + '-' + $operator;
            let parentFilterGroup = $fm.getFieldGroup(lGroupName,$fm.filter_group);
            
            if(parentFilterGroup==null){
                parentFilterGroup = {
                    operator: 'or',
                    name: lGroupName,
                    filters: null,
                    filter_groups: null
                };

                if($fm.filter_group.filter_groups==null) $fm.filter_group.filter_groups = [];
                $fm.filter_group.filter_groups.push(parentFilterGroup);
            }
            
            $fields.forEach(function($f,$index){
                let lValue = $value;
                if($value != null){
                    if(typeof($value.push) == 'function'){
                        if($value.length>$index){
                            lValue = $value[$index];
                        }
                        else{
                            lValue = null;
                        }
                    }
                    $fm.setFilter($f,$operator,lValue,parentFilterGroup, $label);
                }
            });

            if(parentFilterGroup.filters==null){
                $fm.filter_group.filter_groups.forEach(function($g,$i){
                    if($g.name==parentFilterGroup.name){
                        $fm.filter_group.filter_groups.splice($i,1);
                    }
                });
            }
            if($fm.filter_group.filter_groups.length==0){
                $fm.filter_group.filter_groups = null;
            }

        };

        $fm.setFilter = function($field, $operator, $value, $group,$label,$reverseFunc){
            if($group.filters == null){
                $group.filters = [];
            }
            let lFilterIndex = 0;
            let lNewFilter = {
                field: $field,
                operator: $operator,
                value: $value,
                label: $label,
                reverse: $reverseFunc || function(){
                    $fm.addFilter($field,$operator, '');
                }
            };

            lFilterIndex = $group.filters.findIndex(function($gf){
                if($gf.field == $field && $gf.operator == $operator) return true;
            });

            // for(lFilterIndex = 0; lFilterIndex < $group.filters.length; lFilterIndex++){
            //     if($group.filters[lFilterIndex].field == $field){
            //         break;
            //     }
            // }
            
            //console.log('setFilter', lNewFilter, lFilterIndex, $group.filters);

            if(lFilterIndex >= 0){
                if($value==='' || $value==null){
                    //console.log('remove filter', $field);
                    $fm.removeFilter(lFilterIndex, $group);
                }
                else if (Array.isArray($value) && $value.length == 0){
                    //console.log('remove filter (array)', $field);
                    $fm.removeFilter(lFilterIndex, $group);
                }
                else{
                    //console.log('update filter', $field);
                    $fm.updateFilter(lNewFilter, lFilterIndex, $group);
                }
            }
            else {
                if($value !== '' && $value !== null){
                    //console.log('add filter', $field,$operator,$value);
                    $group.filters.push(lNewFilter);
                }
            }
            
        }

        $fm.updateFilter = function($filter,$index, $group){
            //console.log('update filter', $filter );
            $group.filters[$index] = $filter;
        }

        $fm.removeFilter = function($index, $group){
            //console.log('remove filter', $index );
            $group.filters.splice($index,1);
            if($group.filters.length == 0){
                $group.filters=null;
            }

            //$fm.clean();
        }


        $fm.getFieldGroup = function($groupName, $parent){
            if($parent.name==$groupName){
                return $parent;
            }
            else{
                if($parent.filter_groups!=null){
                    let lResult = $parent.filter_groups.find(function($g){
                        return $g.name == $groupName;
                    });

                    if(lResult == null){
                        $parent.filter_groups.some(function($g){
                            lResult = $fm.getFieldGroup($groupName, $g);
                            return lResult==null;
                        });
                    }
                    
                    return lResult;
                }
            }

            return null;
        }

        // --------------------------------------
        // #endregion
        // --------------------------------------

        // --------------------------------------
        //#region FILTERS BUILDING
        // --------------------------------------

        /**
         * Update filters from data object
         */
        $fm.update = function(){
            const lDataKeys = Object.keys($fm.data);
            
            lDataKeys.forEach(function($key){ 
                
                const lFilterMap = $fm.dataFilterMap[$key];
                const lDataValue = $fm.data[$key];
                if(lFilterMap == undefined) return;
                //if(lMainFilter != null && lMainFilter.shadows === $key) return; // skip this filter if MainFilter shadows it
                
                const lFilter = typeof(lFilterMap) == 'function' ? lFilterMap(lDataValue) : lFilterMap;
                if(lFilter == null) return;

                if(isNullOrEmpty(lDataValue)){
                    // remove filter
                    if(Array.isArray(lFilter)){
                        lFilter.forEach(function($f){
                            $fm.addFilter($f.field,$f.operator,'');
                        });
                    }
                    else{   
                        $fm.addFilter(lFilter.field,lFilter.operator,'');
                    }
                }
                else{
                    // add filter
                    if(Array.isArray(lFilter)){
                        lFilter.forEach(function($f){
                            const lFilterValue = $f.value == undefined ? lDataValue : $f.value;
                            $fm.addFilter($f.field,$f.operator,lFilterValue);
                        });
                    }
                    else{
                        const lFilterValue = lFilter.value == undefined ? lDataValue : lFilter.value;
                        $fm.addFilter(lFilter.field,lFilter.operator, lFilterValue);  
                    }
                }
            });
        }

        /**
        * Reset all filter to nothing
        */
        $fm.resetFilters = function($triggerUpdate){
            const lArrayAttr = ['categories','attributes','states','cities','regions','building_categories','subcategories','licenses','offices'];
            $triggerUpdate = (typeof $triggerUpdate == 'undefined') ? true : $triggerUpdate;
            
            $fm.main_filter = null;
            $fm.filter_group = {
                operator: 'and',
                filters: null,
                filter_groups: null
            };
            $fm.query_text = null;
            // $fm.data.min_price = null;
            // $fm.data.max_price = null;
            // $fm.data.location = null;
            Object.keys($fm.data).forEach(function($k){
                if(Array.isArray($fm.data[$k])){
                    $fm.data[$k] = [];
                }
                else{
                    $fm.data[$k] = null;
                }
                
            });
            // lArrayAttr.forEach(function($k){
            //     $fm.data[$k] = [];
            // })

            $fm.data.keyword = '';
            $fm.trigger('reset');

            // save filters to localStorage
            $fm.clearState();
            
            //$fm.buildFilters();
            if($triggerUpdate){
                //$fm.trigger('update');
                
                $fm.getConfigs().then(function($configs){
                    $fm.trigger('filterTokenChanged');
                    // if($configs.search_token!=''){
                    //     //$fm.trigger('filterTokenChanged');
                    //     //$rootScope.$broadcast($scope.alias + 'FilterTokenChanged', $configs.search_token);

                    //     // if($scope.onTokenChange!=undefined){
                    //     //     $scope.onTokenChange();
                    //     // }
                    // }
                    // else{
                    //     // reset the filter manager last
                    //     // this will trigger the UI update
                        
                    // }
                    $fm.trigger('update');
                });
            }
        }

        $fm.resetKeywordSearch = function(){
            let lKey = 'si.' + $fm.alias + '.{0}';

            $fm.query_text = null;
            $fm.data.keyword = '';

            sessionStorage.removeItem(lKey.format('query'));
        }

        $fm.resetSpecificFilters = function($filters, $update){
            $update = $update === undefined ? true : $update;

            Object
                .keys($fm.data)
                .filter(function($k){
                    return $filters.includes($k);
                })
                .forEach(function($k){
                    if(Array.isArray($fm.data[$k])){
                        $fm.data[$k] = [];
                    }
                    else{
                        $fm.data[$k] = null;
                    }
                });

            if($update){
                $fm.getConfigs().then(function($configs){
                    $fm.trigger('filterTokenChanged');
                    $fm.trigger('update');
                    $fm.update();
                });
            }
        }

        /**
         * Remove all 'selected' attribute from list elements
         * @param {object} $list List to reset
         */
        $fm.resetListSelections = function($list){
            for(let $subkey in $list){
                delete $list[$subkey].selected;
            }
        }

        $fm.setPricePart = function($pricePart){
            $fm.addFilter($fm.price_parts.map(function($p) {return 'price.' + $p + '.amount'}), 'greater_or_equal_to', '');
            $fm.addFilter($fm.price_parts.map(function($p) {return 'price.' + $p + '.amount'}), 'less_or_equal_to', '');

            $fm.price_parts = $pricePart;
        }

        /**
         * Build the object to send as search parameters
         */
        
        $fm.buildFilters = function(){
            
            let lResult = null;
            let lPromise = $q(function($resolve, $reject){
                
                $fm.getConfigs().then(function($configs){
                    if(
                        !$fm.hasFilters()
                        && $fm.query_text == null
                        && $fm.sort_fields.length == 0
                        && $fm.data.location == null
                    ){
                        $fm.clearState();
                        $fm.resetFilters();
                        return;
                    }

                    if($configs.limit>0){
                        lResult = {
                            max_item_count : $configs.limit
                        }
                    }
                    
                    if($configs.filter_group != null || $fm.hasFilters()){
                        $fm.clean();
                    }

                    if($fm.hasFilters()){
                        if(lResult==null) lResult = {};
                        lResult.filter_group = {filters:[]};
                        if($configs.filter_group != null){
                            lResult.filter_group = angular.copy($configs.filter_group)
                        }
        
                        if($fm.hasFilters()){
                            if(lResult.filter_group.filter_groups == undefined) lResult.filter_group.filter_groups = [];

                            lResult.filter_group.filter_groups.push($fm.filter_group);
                        }
                        
                        lResult.filter_group = $fm.normalizeFilterGroup(lResult.filter_group);
                    }
                    
                    lResult.sort_fields = null;
                    if($fm.sort_fields.length > 0 && $fm.sort_fields.filter(function($f) {return !isNullOrEmpty($f.field)}).length > 0){
                        lResult.sort_fields = $fm.sort_fields.filter(function($f){return !isNullOrEmpty($f.field)});
                    }
                    else if($configs.sort != 'auto' &&  !isNullOrEmpty($configs.sort) ){
                        lResult.sort_fields = [{field: $configs.sort, desc: $configs.sort_reverse}];
                    }
                    
                    
                    if($fm.query_text != null){
                        lResult.query_text = $fm.query_text;
                        lResult.filter_group = null;
                    }

                    if($fm.data.location != null){
                        lResult.proximity_filter = $fm.data.location;
                    }
                    
                    $fm.getSearchToken(lResult).then(function($token){
                      
                        if($token!=''){
                            
                            $fm.saveState('st', $token);
                            
                            //$rootScope.$broadcast($fm.alias + 'FilterTokenChanged', $token);
                            $fm.trigger('filterTokenChanged', $token);
                          
                            if($fm.result_url != null){
                                $fm.saveState()
                                window.location = $fm.result_url;
                            }
                            else{
                                $resolve($token);
                            }
                        }
                        else{
                            $reject();
                        }
                    })
                });
            });

            return lPromise;
        }

        /**
         * Synchronize list selection to filter
         * @param {object} $filter Filter bound to list
         * @param {object} $list List object or array
         */
        $fm.syncToList = function($filter, $list){
            // make sure list is an array
            let lListArray = $siUtils.toArray($list);
            //console.log($list, $filter);

            lListArray.forEach(function($e){
                // when filter is an array of value and item key is contained in that list
                if($filter.operator=='in' && ($filter.value.indexOf($e.__$obj_key)>=0)){
                    if($list[$e.__$obj_key].selected == undefined || !$list[$e.__$obj_key].selected) $list[$e.__$obj_key].selected=true;
                }
                // when item field matches filter field
                else if($e.field==$filter.field){
                    if(!$e.selected) $e.selected=true; // set selection on the list item
                }
                // when item has a filter attribute which the field 
                else if(($e.filter != undefined) && $e.filter.field == $filter.field){
                    if(!$e.selected) $e.selected=true; // set selection on the list item
                }
            });
        }

        /**
         * Loop through object attributes and return a list of key that are marked as "selected"
         * @param {object} $list 
         */
        $fm.getSelection = function($list){
            let lResult = [];
            for (let lKey in $list) {
                if($list[lKey].selected==true){
                    lResult.push(lKey);
                }
            }
            
            return lResult;
        }

        

        /**
         * Normalize values for all filters and sub group filters
         * @param {object} $filter_group Group to be normalize
         */
        $fm.normalizeFilterGroup = function($filter_group){
            if($filter_group.filters){
                $filter_group.filters.forEach(function($filter){
                    // When in or not_in, value should be an array
                    if(['in','not_in'].indexOf($filter.operator) >= 0){
                        // if value is not an array, split it to one
                        if(typeof($filter.value.split)=='function'){
                            $filter.value = $filter.value.split(",");
                        }
                        
                        // loop through values to fix type
                        $filter.value.forEach(function($val){
                            if(typeof($val) !== typeof(true)){
                                if(!isNaN($val)){
                                    $val = Number($val)
                                }
                            }
                        });
                    }
                    else{
                        // When value is a number, make it an authentic one
                        if(typeof($filter.value) !== typeof(true)){

                            if(!isNaN($filter.value)){
                                $filter.value = Number($filter.value);
                            }
                        }
                    }
                });
            }
            
            if($filter_group.filter_groups){
                // loop through sub group to apply normalization
                $filter_group.filter_groups.forEach(function($group){
                    $fm.normalizeFilterGroup($group);
                });
            }

            return $filter_group;
        }

        // --------------------------------------
        //#endregion
        // --------------------------------------
    

        // --------------------------------------
        //#region STATE HANDLING
        // --------------------------------------

        $fm.saveState = function($item_key, $data){
            
            let lKey = 'si.' + $fm.alias + '.{0}';
            
            if($item_key == undefined){
                $fm.state_loaded = false;
                sessionStorage.setItem(lKey.format('filter_group'), JSON.stringify($fm.filter_group));
                if($fm.query_text!=null){
                    sessionStorage.setItem(lKey.format('query'), $fm.query_text);
                }
                sessionStorage.setItem(lKey.format('mainFilter'), JSON.stringify($fm.main_filter));
                sessionStorage.setItem(lKey.format('data'), JSON.stringify($fm.data));
            }
            else{
                let lValue = $data;
                if(typeof(lValue) == 'object'){
                    lValue = JSON.stringify(lValue);
                }
                sessionStorage.setItem(lKey.format($item_key), lValue);
            }
            

        }
        $fm.clearState = function($item_key){
            //console.log('filterManager.clearState');
            let lKey = 'si.' + $fm.alias + '.{0}';

            if($item_key == undefined){
                $fm.state_loaded = false;
                sessionStorage.removeItem(lKey.format('filter_group'));
                sessionStorage.removeItem(lKey.format('data'));
                sessionStorage.removeItem(lKey.format('mainFilter'));
                sessionStorage.removeItem(lKey.format('query'));
                sessionStorage.removeItem(lKey.format('st'));
            }
            else{
                sessionStorage.removeItem(lKey.format($item_key));
            }
        }

        $fm.loadState = function($item_key){
            //console.log('filterManager.loadState');
            $key = 'si.' + $fm.alias + '.{0}';
            if($item_key == undefined && !$fm.state_loaded){
                const lSessionFilterGroup = sessionStorage.getItem($key.format('filter_group'));
                const lSessionData = sessionStorage.getItem($key.format('data'));
                const lMainFilterData = sessionStorage.getItem($key.format('mainFilter'));
                const lQuery = sessionStorage.getItem($key.format('query'));

                //let lSessionSearchKeyword = sessionStorage.getItem($key.format('search-keyword'));
                if(lSessionFilterGroup != null){
                    $fm.filter_group = JSON.parse(lSessionFilterGroup);
                }
                if(lSessionData != null){
                    let lData = JSON.parse(lSessionData);
                    $fm.data = angular.merge($fm.data, lData); 
                }

                if(lMainFilterData != null){
                    const lMainFilter = JSON.parse(lMainFilterData);
                    $fm.main_filter = lMainFilter;
                }


                if(lQuery != null){
                    $fm.query_text = lQuery;
                    $fm.data.keyword = lQuery;
                }
                else{
                    $fm.data.keyword = '';
                }
                $fm.state_loaded = true;
            }
            else{
                let lResult = sessionStorage.getItem($key.format($item_key));
                try {
                    lResult = JSON.parse(lResult);
                } catch (error) {
                    
                }
                return lResult;
            }
        }

        // --------------------------------------
        //#endregion
        // --------------------------------------

        $fm.clean = function($group){
            $group = ($group == undefined) ? $fm.filter_group : $group;
            
            if($group.filters != null){
                if($group.filters.length == 0) {
                    $group.filters = null;
                }
            }

            if($group.filter_groups != null){
                if($group.filter_groups.length > 0){
                    $group.filter_groups.forEach(function($g){
                        $fm.clean($g);
                    });

                    if($group.filter_groups.every(function($g){
                        return $g.filters == null;
                    })){
                        $group.filter_groups = null;
                    }
                }

                if($group.filter_groups != null && $group.filter_groups.length == 0) {
                    $group.filter_groups = null;
                }
            }
        }


        //#region FILTER CAPTION

        $fm.getCaption = function($attr, $format){
            $format = ($format == undefined) ? '{0}' : $format;

            if(Array.isArray($attr)){
                return $format.format.apply(null, $attr);
            }
            else{
                return $format.format($attr);
            }
        }

        $fm.getPriceRangeCaption = function(){
            const lMin = $fm.data.min_price == null || $fm.data.min_price == 0 ? 'Min' : $fm.data.min_price.formatPrice();
            const lMax = $fm.data.max_price == null ? 'Max' : $fm.data.max_price.formatPrice();

            return $fm.getCaption([lMin,lMax], '{0} - {1}');
        }

        //#endregion

        /**
         * Get a new search token from the api
         * @param {object} $filters 
         * @return {object} Promise
         */
        $fm.getSearchToken = function($filters){
            //console.log('getSearchToken', $filters);
            // $filters.sort_fields = $filters.sort_fields.filter($sf => $sf.field!='');
            // if($filters.sort_fields.length == 0) delete $filters.sort_fields;
            if($filters == null) return $q.resolve();
            
            $fm.normalize($filters.filter_group);
            
            let lPromise =  $q(function($resolve, $reject){    
                if($filters != null){
                    $siApi.api('utils/search_encode', $filters).then(function($response){
                        $resolve($response);
                    });
                }
                else{
                    $resolve('');
                }
            
            });
            return lPromise;
        }

        $fm.normalize = function($filterGroup){
            const lNewGroup = [];
            if($filterGroup==null) return;
            
            if($filterGroup.filter_groups){
                $filterGroup.filter_groups.forEach( function ($f,$i) {
                    if($f.filter_groups != null){
                        $fm.normalize($f);
                    }
                    if($f.filter_groups != null){
                        lNewGroup.push($f);
                    }
                    else if ($f.filters != null){
                        lNewGroup.push($f);
                    }
                });
                

                $filterGroup.filter_groups = lNewGroup;
            }
        }

        $fm.getConfigs = function(){
            return $q(function($resolve,$reject){
                if($fm.configs != null){
                    $resolve($fm.configs);
                }
            })
        }

        return $fm;
    }


    return $scope;
}]);