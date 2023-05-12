

siApp
.factory('$siSearchContext', ['$rootScope','$filter', function $siSearchContext($rootScope,$filter){
    const $scope = {};

    let lToday = new Date().round();    // save today
    let lNow = new Date();

    $scope.slaves = [];

    $scope.main_filters = {
        listings : {
            'RES' : {field: 'market_codes', operator: 'array_contains', value: 'RES', type: 'market'},
            'COM' : {field: 'market_codes', operator: 'array_contains', value: 'COM', type: 'market'},
            'for-sale' : {field: 'for_sale_flag', operator: 'equal', value: true, type: 'flag'},
            'for-rent' : {field: 'for_rent_flag', operator: 'equal', value: true, type: 'flag'}
        }
    }
    
    // listing states
    $scope.listing_states = [
        {
            key: 'sale',
            caption: 'For sale'.translate(), 
            filter : {field: 'for_sale_flag', operator: 'equal', value: true}
        },
        {
            key: 'rent',
            caption: 'For rent'.translate(),
            filter : {field: 'for_rent_flag', operator: 'equal', value: true}
        }            
    ]

    // listing states
    $scope.listing_flags = [
        {
            key: 'sold',
            caption : 'Sold',
            filter : {field: 'status_code', operator: 'not_equal_to', value: 'AVAILABLE'}
        },
        {
            key: 'available',
            caption : 'On the market',
            filter : {field: 'status_code', operator: 'equal', value: 'AVAILABLE'}
        },
        {
            key: 'open_house',
            caption: 'Open house',
            filter : {field: 'open_houses[0].end_date', operator: 'greater_or_equal_to', value: 'udf.now()'}
        },
        {
            key: 'foreclosure',
            caption: 'Foreclosure',
            filter : {field: 'price.foreclosure', operator: 'equal', value: true}
        },
        {
            key: 'virtual_tour',
            caption: 'With virtual tour',
            filter : {field: 'virtual_tour_flag', operator: 'equal', value: true}
        },
        {
            key: 'video',
            caption: 'With video',
            filter : {field: 'video_flag', operator: 'equal', value: true}
        }
    ]
    // listing ages or timespan filters
    $scope.listing_ages = [
        {
            key: '24h',
            caption: '24 hours'.translate(), 
            filter : {field: 'contract.start_date', operator: 'greater_than', value: lNow.addDays(-1).toJSON()}
        },
        {
            key: '48h',
            caption: '48 hours'.translate(), 
            filter : {field: 'contract.start_date', operator: 'greater_than', value: lNow.addDays(-2).toJSON()}
        },
        {
            key: '7d',
            caption: '7 days'.translate(), 
            filter : {field: 'contract.start_date', operator: 'greater_than', value: lToday.addDays(-7).toJSON()}
        },
        {
            key: '2w',
            caption: '2 weeks'.translate(), 
            filter : {field: 'contract.start_date', operator: 'greater_than', value: lToday.addDays(-14).toJSON()}
        },
        {
            key: '1m',
            caption: '1 month'.translate(),
            filter : {field: 'contract.start_date', operator: 'greater_than', value: lToday.addMonths(-1).toJSON()}
        },
        {
            key: '3m',
            caption: '3 months'.translate(),
            filter : {field: 'contract.start_date', operator: 'greater_than', value: lToday.addMonths(-3).toJSON()}
        },
        {
            key: '6m',
            caption: '6 months'.translate(),
            filter : {field: 'contract.start_date', operator: 'greater_than', value: lToday.addMonths(-6).toJSON()}
        },
        {
            key: '1y',
            caption: '1 year'.translate(),
            filter : {field: 'contract.start_date', operator: 'greater_than', value: lToday.addYears(-1).toJSON()}
        },
        {
            key: '',
            caption : 'More than a year'.translate(),
            filter : {field: 'contract.start_date', operator: 'greater_than', value: ''}
        },
    ];

    $scope.market_types = [
        {key: 'RES', caption: 'Residential'.translate(), filter: {field: 'market_codes', operator: 'array_contains', value: 'RES'} },
        {key: 'COM', caption: 'Commercial'.translate(), filter: {field: 'market_codes', operator: 'array_contains', value: 'COM'} }
    ]

    // listing land areas
    $scope.land_areas = Array.from(Array(3)).map(function($e,$i){
        return { caption: '{0} sqft'.translate().siFormat(5000 * ($i+1)), value: 5000 * ($i+1)}
    });
    $scope.land_areas = $scope.land_areas.concat(Array.from(Array(10)).map(function($e,$i){
        return { caption: '{0} sqft'.translate().siFormat(20000 * ($i+1)), value: 20000 * ($i+1)}
    }));


    // listing available areas
    $scope.available_areas = Array.from(Array(6)).map(function($e,$i){
        return { caption: '{0} sqft'.translate().siFormat(250 * ($i+2)), value: 200 * ($i+2)}
    });
    $scope.available_areas = $scope.available_areas.concat(Array.from(Array(9)).map(function($e,$i){
        return { caption: '{0} sqft'.translate().siFormat($filter('number')(1000 * ($i+2))), value: 1000 * ($i+2)}
    }));
    $scope.available_areas = $scope.available_areas.concat(Array.from(Array(5)).map(function($e,$i){
        return { caption: '{0} sqft'.translate().siFormat($filter('number')(2000 * ($i+6))), value: 2000 * ($i+6)}
    }));
    $scope.available_areas = $scope.available_areas.concat(Array.from(Array(6)).map(function($e,$i){
        return { caption: '{0} sqft'.translate().siFormat($filter('number')(5000 * ($i+5))), value: 5000 * ($i+5)}
    }));
    $scope.available_areas = $scope.available_areas.concat(Array.from(Array(4)).map(function($e,$i){
        return { caption: '{0} sqft'.translate().siFormat($filter('number')(10000 * ($i+6))), value: 10000 * ($i+6)}
    }));
    $scope.available_areas = $scope.available_areas.concat(Array.from(Array(9)).map(function($e,$i){
        return { caption: '{0} sqft'.translate().siFormat($filter('number')( 50000 * ($i+2)) ), value: 50000 * ($i+3)}
    }));

    $scope.bedroomSuggestions = {buildFrom: { buildCountedList : ['{0}+ bedrooms',5]}}
    $scope.bathroomSuggestions = {buildFrom: { buildCountedList : ['{0}+ bathrooms',5]}}
    $scope.garageSuggestions = {buildFrom: { buildCountedList : ['{0}+ garages',5]}}
    $scope.parkingSuggestions = {buildFrom: { buildCountedList : ['{0} spaces or +',5,1,'1 space or +']}}

    // listing attributes
    $scope.listing_attributes = [
        {
            key: 'pool',
            caption: 'Pool', 
            field: 'attributes.POOL',
            tags: ['residential']
        },
        {
            key: 'fireplace',
            caption: 'Fireplace', 
            field: 'attributes.HEART_STOVE',
            tags: ['residential']
        },
        {
            key: 'elevator',
            caption: 'Elevator', 
            field: 'attributes.ELEVATOR'
        },
        {
            key: 'garage',
            caption: 'Garage', 
            field: 'attributes.GARAGE'
        },
        {
            key: 'waterfront',
            caption: 'Water front', 
            field: 'attributes.WATER_FRONT',
            tags: ['residential']
        },
        {
            key: 'panoramicview',
            caption: 'Panoramic view', 
            field: 'attributes.PANORAMIC_VIEW',
            tags: ['residential']
        }
    ]

    $scope.buildCountedList = function($name,$labelFormat, $iteration, $step, $singleLabelFormat){
        //console.log('buildCountedList', $name,$labelFormat, $iteration, $step, $singleLabelFormat)
        $step = $step == undefined ? 1 : $step;
        $singleLabelFormat = $singleLabelFormat == undefined ? $labelFormat : $singleLabelFormat;

        const fnNewItem = function($i){
            return {
                value: $i,
                label : ($i == 1 ? $singleLabelFormat : $labelFormat).translate().siFormat($i),
                caption : ($i == 1 ? $singleLabelFormat : $labelFormat).translate().siFormat($i)
            }
        }

        $scope[$name] = Array.from(new Array($iteration))
                            .map(function($e,$i){
                                return fnNewItem( ($i + 1) * $step );
                            });
    }

    $scope.extendTo = function($target){
        $scope.slaves.push($target);

        $scope.updateLists($target);
    }

    $scope.updateLists = function($target){
        //$scope.buildDynamicLists();

        Object.keys($scope)
        .forEach(function($att){
            // make sure it's a clean slate
            delete $target[$att];
        })

        Object.keys($scope)
        .filter(function($att){
            // filter "slaves" attribute
            if(['slaves','main_filters'].includes($att)) return false;             

            // filter local function
            if(typeof($scope[$att]) == 'function') return false;    

            // Bailout when viewFilters is null
            if($target.viewFilters == null) return true;            

            // Bailout when filtering with viewFilters returns false
            if($scope.filterListByKey($att, $target.viewFilters) == false) return false;
            
            return true;
        })
        .forEach(function($att){
            // Copy original
            const lAttr = angular.copy($scope[$att]);

            if(lAttr.buildFrom != undefined){
                const fnName = Object.keys(lAttr.buildFrom)[0];
                const fnParams = lAttr.buildFrom[fnName];
                fnParams.splice(0,0,$att);
                $target[$att] = $scope[fnName].apply(null,fnParams);
            }
            else{
                //console.log(lAttr);
                $target[$att] = lAttr.filter(function($item){
                    if($target.viewFilters == null) return true;
                    return $scope.filterListItem($item, $target.viewFilters);
                })
            }
        });
    }

    $scope.filterListByKey = function($att, $viewFilters){
        return $viewFilters.every(function($f){
            if($f.field=='StatusCode' && $f.value== 'SOLD'){
                return !['listing_states'].includes($att);
            }

            if(['SellPrice','LeasePrice'].includes($f.field)){
                return !['listing_states'].includes($att);
            }

            return true;
        })

    }

    $scope.filterListItem = function($item, $viewFilters){
        // all filter must return true to display the item
        return $viewFilters.every(function($f){

            // search for SOLD filter and display only if not found
            if($f.field=='StatusCode' && $f.value== 'SOLD'){
                // item key must NOT be one of these
                return !['sold','available','open_house','foreclosure'].includes($item.key);
            }

            // search for AVAILABLE filter and display only if not found
            if($f.field=='StatusCode' && $f.value== 'AVAILABLE'){
                // item key must NOT be one of these
                return !['sold','available'].includes($item.key);
            }
            if(['SellPrice','LeasePrice'].includes($f.field)){
                return !['sold','available'].includes($item.key);
            }


            if($f.field=='MarketCodes' && $f.value=='COM'){
                return !['pool','fireplace','waterfront','panoramicview'].includes($item.key);
            }

            return true;
        });
    }

    $rootScope.$on('si/viewMeta:change', function($event, $alias, $viewMeta){
        // respawn list based on meta 
        $scope.slaves
            .filter( function($s){return $s.alias == $alias})
            .forEach(function($slave){
                $scope.updateLists($slave);
            });
    })

    

    return $scope;
}]);



/**
 * DIRECTIVE: SEARCH
 * usage: <si-search></si-search>
 * @param {string} siAlias List alias name. Required
 * @param {string} class CSS class to add to template
 * @param {object} siConfigs List Config object. When omitted, will load it from alias name
 * @param {object} siDictionary Dictionary object. When omitted, will load it from alias name
 * @param {string} siResultUrl Url to display the search result. When configured, will display a button to trigger to search
 */
siApp
.directive('siSearch', ['$siList', function siSearch($siList){
    return {
        restrict: 'E',
        replace: true,
        scope: {
            alias: '@siAlias',
            class: '@class',
            configs: '=?siConfigs',
            dictionary: '=?siDictionary',
            result_url: "@siResultUrl",
            standalone: "@siStandalone"
        },
        controllerAs: 'ctrl',
        template: '<div><div ng-include="\'si-search-for-\' + alias"></div></div>',
        link : function($scope, $element, $attrs){
            //console.log('siSearch standalone', $scope.standalone, typeof $scope.standalone)
            
            $scope.standalone = (typeof $scope.standalone == 'string') ? $scope.standalone == 'true' : $scope.standalone;
            //console.log('siSearch standalone', $scope.standalone, typeof $scope.standalone)
            //console.log('Search box element',$element[0]);
            $scope.init($element);
        },
        controller: function($scope, $q, $siApi, $rootScope,$timeout,
                                $siDictionary, $siUtils,  $siFilters,
                                $siHooks,$siFavorites,
                                $siSearchContext,$siConfig){
            

            $scope.siDictionary = $siDictionary;
            $scope.current_view = null;

            // const
            $scope.PRICE_PARTS = ['sell','lease'];
            $scope.PRICE_RANGE_MAX  = 1000000;
            $scope.PRICE_RANGE_PRECISION = 1000;
            $scope.PRICE_RANGE_FORMAT = '{0}';

            // init default values        
            $scope.tabCursor = null;
            $scope.is_ready = false;    
            $scope.tab_category = null;
            $scope.tab_region = '';
            $scope.regions = [];
            $scope.geolocation_available = navigator.geolocation!=undefined && window.location.protocol=='https:';
            $scope.sort_fields = [];
            $scope.selected_price_input = 'min';
            $scope.keyword = '';
            $scope.priceSuggestions = [];
            $scope.bedroomSuggestions = [];
            $scope.bathroomSuggestions = [];
            $scope.parkingSuggestions = [];
            $scope.garageSuggestions = [];
            $scope.filterHints = [];
            $scope.suggestions = [];
            $scope.query_text = null;
            $scope.alphaList = 'abcdefghijklmnopqrstuvwxyz'.split('');
            $scope.officeList = [];
            $scope.agencyList = [];
            $scope.priceBoundaries = {
                min: 0,
                max: 1000000
            }

            $scope.filter = null;

            // search form data
            $scope.data = {
                keyword : '',
                min_price: null,
                max_price: null,
                location: null,
                transaction_type:null,  
            }
            $scope.priceRange = [0,1,0];
            // search filters
            $scope.filter_group = {
                operator: 'and',
                filters: null,
                filter_groups: null
            }
            
            // Apply search list to current Scope
            $siSearchContext.extendTo($scope);

    
            /**
             * Directive initialization
             */
            $scope.init = function($element){
                 
                $scope._element = $element[0];
                

                const lFilterPanelContainer = angular.element('<div class="si si-filter-panel-container"></div>');
                
                angular.element(document.body).append(lFilterPanelContainer);
                $scope.filterPanelContainer = lFilterPanelContainer;
                // prevent panel click event bubble up
                lFilterPanelContainer.on('click', function($event){$event.stopPropagation();});
                $element.on('click',function($event){$event.stopPropagation();});
                $scope._element.addEventListener('mouseover', function($event){
                    $scope.updateExpandPanelPosition(true);
                    $scope.extractFilterPanels();
                },true);

                
                if($scope.standalone){
                    $scope._element.classList.add('show-trigger');
                }

                // prebuild suggestions
                $scope.buildDropdownSuggestions();
                // load state

                
                // Wait for late initialization
                // ie: Dictionnay, configs, etc are all loaded
                $scope.isReady().then(function(){
                    //console.log('Ready, carry on');
                    
                    const lSearchEngineOptions = angular.merge({type: 'full', orientation: 'h', focus_category: null},$scope.configs.search_engine_options);

                    $scope._element.classList.add('layout-' + lSearchEngineOptions.type);
                    
                    $scope._element.classList.add('orientation-' + lSearchEngineOptions.orientation);
                    if(lSearchEngineOptions.tabs != undefined && lSearchEngineOptions.tabs.length > 1){
                        $scope._element.classList.add('si-has-tabs');
                    }
                    const lListElement = $scope._element.closest('.si-list-of-' + $scope.configs.type);
                    if(lListElement != null) lListElement.classList.add('search-orientation-' + lSearchEngineOptions.orientation)
                    
                    $scope._element._rect = $scope._element.getBoundingClientRect();
                    $scope._element._computedStyle = window.getComputedStyle($scope._element);

                    if(lSearchEngineOptions.sticky === true){
                        const lAnchorElement = document.createElement('DIV');
                        lAnchorElement.classList.add('sticky-anchor');
                        $scope._element.parentNode.prepend(lAnchorElement)
                        var options = {
                            //root: document.querySelector('#scrollArea'),
                            rootMargin: '0px',
                            threshold: 1.0
                        }
                        if (typeof(IntersectionObserver) !== 'undefined') {
                            const observer = new IntersectionObserver(function(entries, observer){
                                entries.forEach(function(entry){
                                    //console.log(entry.isIntersecting);
                                    if(entry.isIntersecting){
                                        $scope._element.classList.remove('stick');
                                    }
                                    else{
                                        $scope._element.classList.add('stick');
                                    }
                                });
                            }, options);
                            observer.observe(lAnchorElement);
                        }
                    }

                    
                    let lfSyncFilter = function($filter){
                        //console.log('Filter to UI sync');
    
                        // check if there's filters stored
                        if($filter.hasFilters()){
                            // Sync UI with filters
                            //console.log('siSearch/init[isReady]:lfSyncFilter');
                            $scope.syncFiltersToUI($filter);
                            
                            // build hints
                            //$scope.buildHints();
                        }
                    }

                    $siFilters.with($scope.alias, $scope, function($filter){
                        $scope.filter = $filter;

                        
                        if(!$scope.standalone){
                            $filter.result_url = $scope.result_url;
                        }


                        $filter.loadState();
                        //console.log('siSearch/init/isReady/$siFilters=>$filter.loadState',$filter.data);
                        // set default tab
                        //$scope.applyDefaultMainFilter()
                        
                        

                        lfSyncFilter($filter);
                        
                        $scope.$watch(
                            function(){ 
                                return $scope.filter.data;
                            }, 
                            function($new, $old){
                                if(!$scope.is_ready) return;

                                if($new.min_price != $old.min_price || $new.max_price != $old.max_price){
                                    //console.log('$watch(filter.data)/changed', $new, $old);
                                    if($new.min_price == 0 && $new.max_price == null){
                                        $scope.resetPriceRange();
                                    }
                                }
                            },
                            true
                        );

                        $filter.on('update').then(function(){
                            if(!$scope.is_ready) return;

                            //console.log('filter', $scope.alias, 'update trigger');
                            lfSyncFilter($filter);

                            $timeout(function(){
                                $scope.updateExpandPanelPosition(true);
                            });
                        });

                        $filter.on('filterTokenChanged').then(function($token){
                            if(!$scope.is_ready) return;

                            //console.log('filter', $scope.alias, 'filterTokenChanged trigger');
                            lfSyncFilter($filter);
                            $rootScope.$broadcast($scope.alias + 'FilterTokenChanged', $token);

                            $timeout(function(){
                                $scope.updateExpandPanelPosition(true);
                            });
                        })
                    });
                    
                    // add listener to close the panel whenever a click occurs outside the search panel
                    angular.element(document.body).on('click', function($event){
                        $scope.closePanels();
                    });


                    window._resizeTimeoutHndl = null;
                    window.addEventListener('scroll', function(){
                        const lContainer = $scope.filterPanelContainer[0];
                        delete lContainer._relative_style;
                    });

                    const resizeObserver = new ResizeObserver( ($entries) => {
                        const elmEntry = $entries[0];
                        $scope._element._rect = elmEntry.contentRect;
                        $scope.updateExpandPanelPosition(true);
                    });

                    resizeObserver.observe($scope._element);
                    
                    const inputsContainer = $scope._element.querySelector('.si-inputs');
                    const fnApplyInputCount = _ => {
                        
                        const lValidChild = Array.from(inputsContainer.children).filter($child => !$child.classList.contains('ng-hide'));
                        console.log('fnApplyInputCount',lValidChild)
                        inputsContainer.style.setProperty('--input-count', lValidChild.length - 1);
                    }
                    fnApplyInputCount();
                    const searchInputObserver = new MutationObserver(fnApplyInputCount);
                    searchInputObserver.observe(inputsContainer,{childList:true})

                    // window.addEventListener('resize', function(){
                    //     if(window._resizeTimeoutHndl != null){
                    //         window.clearTimeout(window._resizeTimeoutHndl);
                    //     }
                    //     window._resizeTimeoutHndl = window.setTimeout(function(){
                    //         $scope._element._rect = $scope._element.getBoundingClientRect();
                    //         $scope.updateExpandPanelPosition(true);
                    //     }, 500);
                    // })

                    $scope.$on('close-everything', function(){
                        $scope.closePanels();
                    })

                    $scope.$broadcast('search-is-ready');
                    // load stored search token
                    let lStoredSearchToken = $scope.filter.loadState('st');
                    if(lStoredSearchToken && ($scope.configs.search_token != lStoredSearchToken)){
                        // broadcast new search token
                        //$rootScope.$broadcast($scope.alias + 'FilterTokenChanged', lStoredSearchToken);
                    }

                    $scope._element.classList.add('si-ready');

                });

                // bind events
                $scope.registerEvents();
            }
    
            /**
             * Wait for required data to be available
             * @return {promise}
             */
            $scope.isReady = function(){
                // check for dictionary and configs perequisits
                if($scope.dictionary!=null && $scope.configs != null){
                    //console.log('siSearch/isReady::dictionary and configs are already loaded')
                    $scope.is_ready = true; 
                    return $q.resolve();
                }
                
                // build promise
                let lPromise = $q(function($resolve,$reject){
                    if($scope.is_ready == false){
                        const lFilter = $siFilters.with($scope.alias, $scope);
                            
                        // load configs
                        $scope.getConfigs().then(function($configs){
                            
                            // Check for a stored view id
                            const lStoredView = sessionStorage.getItem('si/' + $scope.alias + '/view');
                            if(lStoredView != null){
                                $configs.current_view = lStoredView;
                            }
                            // Otherwise, select the first tab's view id
                            else if ($configs.search_engine_options.tabbed && $configs.search_engine_options.tabs.length > 0){
                                $configs.current_view = $configs.search_engine_options.tabs[0].view_id;
                            }

                            // Set the active view to the configs' current view or fall back to configs default view
                            const lActiveView = $configs.current_view !== undefined ? $configs.current_view : $configs.source.id;
                            $scope.configs = $configs;
                            lFilter.configs = $configs;
                            
                            $scope.current_view_id = lActiveView;
                            //$scope.configs.current_view = $configs.source.id;
                            //console.log('siSearch/isReady::loading view', lActiveView)
                            $scope.loadViewMeta(lActiveView,$configs.type)
                                .then(function(){
                                    $scope.is_ready = true;
                                    //console.log('View meta loaded');
                                    $resolve();
                                })
                        });
                    }
                    else{
                        $resolve();
                    }
                });
                return lPromise;
            }

            $scope.registerEvents = function(){
                $rootScope.$on($scope.alias + 'SortDataChanged', $scope.onSortDataChanged);

                $scope.$on('si-searchbox-focus', function(){
                    $scope._element.classList.add('searchbox-has-focus');
                });

                $scope.$on('si-searchbox-blur', function(){
                    $scope._element.classList.remove('searchbox-has-focus');
                })

                $scope.$on('si-searchbox-add-filter', function($event, $item){
                    //console.log($event);
                    //console.log('siSearch:si-searchbox-add-filter triggered');
                    $item._treated = true;

                    const lTypeMap = {
                        'city' : 'cities',
                        'region': 'regions'
                    }
                    const lDataProp = lTypeMap[$item.type];
                    if(lDataProp == undefined) return;

                    $timeout(function(){
                        // if($scope.filter.data[lDataProp] == undefined) {
                        //     console.log(lDataProp, 'is not defined in filter.data');
                        // }
                        $scope.filter.data[lDataProp].push($item.ref_number);
                        if($item.type == 'region'){
                            $scope.filter.sublistClearFilters($item.ref_number, $scope.city_list, $scope.filter.data.cities);
                        }
                        $scope.filter.update();

                        //console.log('si-searchbox-add-filter:triggered',lDataProp, $scope.filter.data);
                        // if this is a standalone search tool, trigger search immediately
                        if($scope.standalone){
                            $scope.showResultPage();
                        }
                    });
                });

                $scope.$on('$siDictionary/init', function($event,$lexicon,$view_id){
                    //console.log('$siDictionary/init:triggered', $siDictionary);
                    if($scope.current_view_id != $view_id) return;
                    
                    $scope.dictionary = $siDictionary.source;

                    if($scope.dictionary!=undefined && $scope.dictionary.region!=undefined){
                        let lRegionList = $siUtils.toSortedArray($scope.dictionary.region);
                        //console.log('region_list', lRegionList);
                        $scope.region_list = lRegionList;
                        $scope.tab_region = lRegionList[0].__$key;
                    }
    
                    // if($scope.dictionary!=undefined && $scope.dictionary.listing_category!=undefined){
                    //     let lCategoryList = $siUtils.toArray($scope.dictionary.listing_category);
                    //     $scope.category_list = lCategoryList;
                    // }
    
                    if($scope.dictionary!=undefined && $scope.dictionary.city!=undefined){
                        let lCityList = $siUtils.toArray($scope.dictionary.city);
                        $scope.city_list = lCityList;
                    }
    
                    if($scope.dictionary!=undefined && $scope.dictionary.listing_subcategory!=undefined){
                        let lSubcategoryList = $siUtils.toArray($scope.dictionary.listing_subcategory);
                        $scope.subcategory_list = lSubcategoryList;
                    }
    
                    if($scope.dictionary!=undefined && $scope.dictionary.listing_category!=undefined){
                        let lCategoryList = $siUtils.toArray($scope.dictionary.listing_category);
                        //console.log('category list', lCategoryList);
                        $scope.category_list = lCategoryList;
                    }
                });    

                $scope.$on('si/viewMeta:change', function viewMetaChangeHandler($event){
                    

                    const lNewPriceParts = $scope.getPriceParts();
                    let lPriceChanged = ($scope.PRICE_PARTS !== lNewPriceParts);
                    
                    //console.log('$on: si/viewMeta:change', $scope.filter);

                    $scope.PRICE_PARTS = lNewPriceParts;
                    $scope.PRICE_RANGE_MAX  = 1000000;
                    $scope.PRICE_RANGE_PRECISION = 1000;
                    $scope.PRICE_RANGE_FORMAT = '{0}';

                    if($scope.viewFilters != null && $scope.viewFilters.some(function($f){ return $f.field=='LeasePrice'})){
                        $scope.PRICE_RANGE_MAX = 5000;
                        $scope.PRICE_RANGE_PRECISION = 50;
                        $scope.PRICE_RANGE_FORMAT = '{0}/month';
                    }

                    if(lPriceChanged && $scope.is_ready){
                        $scope.updatePrice();
                    }

                    const lViewCentricFilters = ['categories','cities','regions','building_categories','subcategories','licenses','offices'];
                    if($scope.filter != undefined){
                        $scope.filter.resetSpecificFilters(lViewCentricFilters);
                    }

                    const lPanelFilterMaps = {
                        rooms: function(){$scope.filter.resetSpecificFilters(['bedrooms','bathrooms']);},
                        price: function(){$scope.resetPriceRange();}
                    }

                    Object.keys(lPanelFilterMaps).forEach(function($panelName){
                        if($scope.allowPanel($panelName)) return;

                        if($scope.filter != undefined){
                            lPanelFilterMaps[$panelName]();
                        }
                    
                        if($scope._expandedPanel== $panelName){
                            $scope.closePanels();
                        }
                    
                    })
                        
                })
            }

            $scope.showResultPage = function(){
                window.location = $scope.result_url;
            }
            



            // -------------------------------------------
            //#region UI MANAGEMENT
            // -------------------------------------------
            

            // TABS / MAIN FILTERS
            $scope.selectMainFilter = function($tab){
                //console.log('selectMainFilter', $scope.current_main_filter, $tab);
                if($tab == undefined){
                    $scope.current_main_filter = null;
                    return;
                };

                if($scope.current_main_filter == $tab) return;

                // when tab is focus on transaction, change the max price and step value
                if(['for-sale','for-rent'].includes($tab)){
                    if($tab == 'for-sale'){
                        $scope.PRICE_RANGE_MAX = 1000000;
                        $scope.PRICE_RANGE_PRECISION = 1000;
                        $scope.PRICE_RANGE_FORMAT = '{0}';
                    }
                    if($tab == 'for-rent'){
                        $scope.PRICE_RANGE_MAX = 10000;
                        $scope.PRICE_RANGE_PRECISION = 100;
                        $scope.PRICE_RANGE_FORMAT = '{0}/month';
                    }

                    // Update price range
                    $scope.updatePrice();
                }

                $scope.filter.setMainFilter($scope.configs.type, $tab);
                $scope.filter.update();

                $scope.current_main_filter = $tab;
                $scope.buildDropdownSuggestions();

                $timeout(function(){
                    $scope.alignPanelTabCursor();
                });
                

                // save current tab to session
                sessionStorage.setItem('si.currentMainFilter', $scope.current_main_filter);
            }

            $scope.isMainFiltered = function($values){
                const lMainFilter = $scope.current_main_filter == undefined ? null : $scope.current_main_filter;
                if(Array.isArray($values)) return $values.includes(lMainFilter);
                return $values == lMainFilter;
            }

            $scope.mainSubCategoryMatchFilter = function($item){
                const $category_code = $item.parent;
                if($scope.current_main_filter == undefined) return true;
                if($scope.configs == undefined) return false;
                
                const lFilter = $scope.main_filters[$scope.configs.type][$scope.current_main_filter];
                if(lFilter.type != 'category') return true;
                
                return lFilter.value.includes($category_code);
            }


            //#region VIEW MANAGEMENT
            

            $scope.selectView = function($view_id){
                if($view_id == $scope.configs.current_view) return;
                $scope.current_view_id = $view_id;

                //$scope.filter.resetFilters();
                sessionStorage.setItem('si/' + $scope.alias + '/view', $view_id);
                
                //$scope.current_view = $view_id;
                $scope.configs.current_view = $view_id;
                
                
                $scope.loadViewMeta($view_id, $scope.configs.type).then(function(){
                    //console.log('meta loaded');
                    
                    $rootScope.$broadcast('si-{0}-view-change'.siFormat($scope.alias), $view_id);
                    $rootScope.$broadcast('si/{0}:viewChanged'.siFormat($scope.alias), $view_id);
                });
                
                $timeout(function(){
                    $scope.alignPanelTabCursor();
                });
            }

            $scope.loadViewMeta = function($view_id, $type){
                //console.log('Loading view meta');

                // load office view meta
                const fnOffices = function(){
                    if($type != 'brokers') return $q.resolve();
                    return $siApi.call('office/view/' + $view_id + '/fr/items')
                }

                // load agency view meta
                const fnAgencies = function(){
                    if(!['brokers','offices'].includes($type)) return $q.resolve();
                    return $siApi.call('agency/view/' + $view_id + '/fr/items').then( function($agencies){
                        return $agencies.items;
                    })
                }

                return $q.all([
                    $siApi.getViewMeta($type,$view_id),
                    fnOffices(),
                    fnAgencies()
                ])
                .then(
                    function($results){
                        $siDictionary.init($results[0].dictionary,true,$view_id);

                        $scope.viewFilters = Object.keys($results[0])
                                                    .filter(function($k){ return $k.indexOf('filter_group')>0})
                                                    .reduce(function($acc,$k){
                                                        $results[0][$k].filters.forEach(function($f){
                                                            $acc.push($f);
                                                        });
                                                        return $acc
                                                    },[]);

                        $scope.officeList = $results[1] ? $results[1].items : [];

                        $scope.agencyList = $results[2] ? $results[2] : [];
                        $scope.agencyList.forEach(function($agency){
                            $agency.officeList = $scope.officeList.filter(function($off){
                                if($off.agency == undefined) return false;
                                return $off.agency.id == $agency.id;
                            });
                        });
                        $rootScope.$broadcast('si/list/offices', $scope.officeList.length );
                        $rootScope.$broadcast('si/list/agencies', $scope.agencyList.length );
                        
                        $rootScope.$broadcast('si/viewMeta:change', $scope.alias, $results[0]);
                    },
                    function($err){
                        if($view_id != $scope.configs.source.id){
                            sessionStorage.clear();
                            console.error("There's a view problem in the configuration. If reloading doesn't fix the problem, please check the list or global configurations");
                        }
                    }
                )              
            }

            //#endregion

            // FIELDS FILTERS
            $scope.isFieldFiltered = function($field){
                if(isNullOrEmpty($scope.configs)) return false;
                if(isNullOrEmpty($scope.configs.search_engine_options.fields)) return true;

                return $scope.configs.search_engine_options.fields.includes($field);
            }

            // ----------------------------
            //#region PANELS MANAGEMENT
            // ----------------------------

            $scope.allowPanel = function($panelName){
                if($scope.viewFilters == null) return true;

                const lPanelTests = {
                    'price' : function(){
                        return !$scope.viewFilters.some(function($f){
                            return $f.field=='StatusCode' && $f.value== 'SOLD'
                        })
                    },
                    'rooms' : function(){
                        return !$scope.viewFilters.some(function($f){
                            return $f.field=='MarketCodes' && $f.value== 'COM'
                        })
                    },
                    'areas' : function(){
                        return $scope.viewFilters.some(function($f){
                            return $f.field=='MarketCodes' && $f.value== 'COM'
                        })
                    },
                    'market': function(){
                        return !$scope.viewFilters.some(function($f){
                            return $f.field=='MarketCodes'
                        })
                    }
                };
                if(lPanelTests[$panelName] == undefined) return true;

                const lResult = lPanelTests[$panelName]();
                
                return lResult;
            }

            
            $scope.getOtherPanelFilterList = function(){
                const lList = [
                    'market_codes','transaction_type','bedrooms','bathrooms','states','attributes','parkings','contract', 'available_min','available_max','land_min','land_max',
                    'licenses', 'languages'
                ];
                return lList
                    .filter(function($item){
                        return $scope.viewFilters.every(function($f){
                            if($f.field=='StatusCode' && $f.value== 'SOLD'){
                                return !['transaction_type'].includes($item);
                            }
                
                            if(['SellPrice','LeasePrice'].includes($f.field)){
                                return !['transaction_type'].includes($item);
                            }

                            if($f.field=='MarketCodes'){
                                return !['market_codes'].includes($item);
                            }

                            if($f.field=='MarketCodes' && $f.value == 'COM'){
                                return !['available_min','available_max','land_min','land_max'].includes($item);
                            }
                
                            return true;
                        })
                    })
            }


            $scope.closePanels = function(){
                $timeout(function(){
                    $scope._expandedPanel = null;
                });

                if($scope.filterPanelContainer == null) return;

                $scope._element.classList.remove('expanded');     
                $scope.filterPanelContainer.removeClass('expanded');
                if($scope.tabCursor != null) $scope.tabCursor.style.display = 'none';
            }




            $scope._expandedPanel = null;
            $scope.toggleExpand = function($event,$key){
                // Move panels to document root
                $scope.extractFilterPanels($key).then(function(){
                    $scope._expandedPanel = ($scope._expandedPanel == $key) ? null : $key;
                    
                    if($scope._expandedPanel){            
                        $scope._element.classList.add('expanded');       
                        $scope.filterPanelContainer.addClass('expanded');
                        $scope.ensureClickTrap();
                        $scope.ensureTabCursor();
                    }
                    else{
                        $scope._element.classList.remove('expanded');       
                        $scope.filterPanelContainer.removeClass('expanded');
                        if($scope.tabCursor != null) $scope.tabCursor.style.display = 'none';
                    }
                    
                });
            }

            $scope.applyPanelFilters = function($event, $key){
                if($scope.standalone){
                    $scope.showResultPage();
                }
                else{
                    $scope.toggleExpand($event, $key);
                }
            }


            $scope.extractFilterPanels = function($key){
                return $q(function($resolve,$reject){
                    const lContainer = $scope.filterPanelContainer[0];
                    
                    if(lContainer.querySelectorAll('.filter-panel').length == 0){
                        $scope._element.querySelectorAll('.filter-panel').forEach(function($e, $i){
                        
                            lContainer.appendChild($e);
                        
                        });    
                        
                    }
                    
                    
                    $resolve();
                })
                
            }

            $scope.updateExpandPanelPosition = function($force){
                $force = ($force == undefined) ? false : $force;
                
                if($scope._element == null) return;
                const lContainer = $scope.filterPanelContainer[0];

                if($force || lContainer._relative_style == undefined){
                    //console.log('searchTool elm',$scope._element);
                    $scope._element._rect = $scope._element.getBoundingClientRect();

                    const lElmRect = $scope._element._rect; 
                    const lCompStyle = $scope._element._computedStyle;
                    const lBorderWidth = (lCompStyle != undefined) ? lCompStyle.borderWidth : 0;
                    const lTop = $scope.getElementOffset($scope._element,'offsetTop');
                    const lLeft = $scope.getElementOffset($scope._element,'offsetLeft');

                    lContainer.style.setProperty('--relative-top', Math.round(lTop) + 'px');
                    lContainer.style.setProperty('--relative-left', (lLeft) + 'px');
                    lContainer.style.setProperty('--relative-width', lElmRect.width + 'px');
                    lContainer.style.setProperty('--relative-height', lElmRect.height + 'px');
                    lContainer.style.setProperty('--relative-border-size', lBorderWidth);

                    lContainer._relative_style = true;
                }

            }

            $scope.getElementOffset = function($elm, $metric){
                let offsetValue = 0;
                do {
                    if ( !isNaN( $elm[$metric] ) ){
                        offsetValue += $elm[$metric];
                    }
                } while( $elm = $elm.offsetParent );
                

                // if the admin bar is present, add the html margin-top
                if($metric == 'offsetTop' && document.querySelector('#wpadminbar') != null){
                    const lBodyStyles = window.getComputedStyle(document.body);
                    //console.log('body position', lBodyStyles.position);

                    if(!['absolute','relative'].includes(lBodyStyles.position)){
                        const lAdminBarHeight = document.querySelector('#wpadminbar').offsetHeight;
                        offsetValue = offsetValue + lAdminBarHeight;
                    }
                }

                return offsetValue;
            }

            
            $scope.ensureClickTrap = function(){

                const lClickTrap = document.querySelector('html');

                lClickTrap.addEventListener('click',function($event){
                    $scope.closePanels();
                },{once:true});

                return lClickTrap;
            }

            $scope.ensureTabCursor = function(){
                if($scope.tabCursor == null){
                    const lCursor = document.createElement('DIV');
                    lCursor.classList.add('si-tab-cursor');
                    document.body.appendChild(lCursor);
                    
                    $scope.tabCursor = lCursor;
                }
                
                $scope.alignPanelTabCursor();
            }

            $scope.isExpanded = function($key){
                if($scope._expandedPanel == $key){
                    return 'expanded';
                }
                return '';
            }

            $scope.expandSublist = function($list, $item, $itemKey){
                const lItemKey = $itemKey || $item.__$obj_key;
                if(!Array.isArray($list)) {
                    //console.log(angular.copy($list));
                    $list = $siUtils.toArray($list);
                    //console.log($list);
                }
                $list.forEach(function($e){
                    if($e.__$obj_key == lItemKey) return;
                    delete $e.expanded;
                });

                $item.expanded = ($item.expanded != undefined)? !$item.expanded : true;
            }

            $scope.alignPanelTabCursor = function(){
                

                if($scope.tabCursor == null) return;
                const lTab = $scope._element.querySelector('.main-filter-tabs .si-tab.active');
                const lCursor = $scope.tabCursor;

                // If there's no tab, hide the cursor and bail out
                if(lTab == null) {lCursor.style.display = 'none';return;}

                // If panels are closed, hide the cursor and bail out
                if($scope._expandedPanel == null) {lCursor.style.display = 'none';return;}
                
                //console.log('alignPanelTabCursor');
                const lTabRect      = lTab.getBoundingClientRect();
                if(lTab._borderOffset === undefined){
                    const lTargetStyles = window.getComputedStyle(lTab);
                    lTab._borderOffset = ['borderLeftWidth'].reduce(function($acc,$cur){
                        return $acc + Number(lTargetStyles[$cur].replace(/\D/g,''));
                    },0);
                }
                
                const lRef = {
                    left: lTabRect.left,//$scope.getElementOffset(lTab,'offsetLeft'),
                    top: $scope.getElementOffset(lTab,'offsetTop'),
                    width: lTabRect.width,
                    border: lTab._borderOffset
                }

                // const lLeft         = $scope.getElementOffset(lTab,'offsetLeft');
                // const lTop          = $scope.getElementOffset(lTab,'offsetTop');
                // const lTabRect      = lTab.getBoundingClientRect();

                lCursor.setAttribute('style',Object.keys(lRef)
                    .map(function($k){
                        return '--ref-' + $k + ':' + lRef[$k] + 'px'
                    })
                    .join(';'));

                // lCursor.style.left  = lLeft;
                // lCursor.style.top   = lTop + 'px';
                // lCursor.style.width = Math.floor(lTabRect.width - 2) + 'px';
                lCursor.style.display = 'block';
            }

            // ----------------------------
            //#endregion PANELS MANAGEMENT
            // ----------------------------


            /**
             * Get an icon corresponding to the category
             * @param {string} $key Category code
             * @returns {string} Icon
             * TODO: Delete depricated since version 0.4.0
             */
            $scope.getCategoryIcon = function($key){
                lIconset = {
                    'RESIDENTIAL' : 'home',
                    'IND' : 'industry-alt',
                    'COM' : 'shopping-bag',
                    'FARM' : 'paw',
                    'LOT' : 'tree-alt',
                    'MULTI-FAMILY' : 'building',
                    'REVENUE PROP' : 'usd-square'
                }
    
                return lIconset[$key];
            }

            /**
             * Save current tab for category
             * @param {string} $key 
             */
            $scope.changeCategoryTab = function($key){
                $scope.tab_category = $key;
            }
            
            /**
             * Save current tab for region
             * @param {string} $key 
             */
            $scope.changeRegionTab = function($key){
                $scope.region_list.forEach(function($r){
                    if($r.__$obj_key != $key) delete $r.selected;
                })
                $scope.tab_region = $key;
            }

            // -------------------------------------------
            //#endregion
            // -------------------------------------------

            // ----------------------            
            //#region SUGGESTIONS BUILDINGS 
            // TODO: Delete depricated since version 0.4.0
            // ----------------------
            
            /**
             * Build dropdowns suggestions
             */
            $scope.buildDropdownSuggestions = function(){
                // Prices' dropdowns
                //a$scope.updatePriceSuggestions();
            }
    
            /**
             * Build suggestions from user typed keywords
             * @param {*} $event 
             */
            $scope.buildSuggestions = function($event){
                let lResult = [];
                // bail on key code trap
                if($scope.trapKeyCode($event.keyCode)) return false;
                
                // When keyword is not empty
                if($scope.data.keyword !=''){
                    // When keyword is a Number
                    if(!isNaN($scope.data.keyword)){
                        let lValue = Number($scope.data.keyword);   // typecast
                        let lPriceMin = Math.max(0, lValue/2);
                        let lPriceMax = Math.min(1000000, lValue * 2);
    
                        lResult = [
                            {selected:true, label : 'Contains "{0}"'.translate().siFormat(lValue), 
                                action : function(){ 
                                    $scope.query_text = lValue; 
                                    $scope.buildFilters();
                                    $scope.saveState();
                                } 
                            }
                        ];
                        if($scope.configs.type == 'listings'){
                            lResult = lResult.concat([
                                // Price suggestions less than, more than, between A and B
                                {label : 'Price is less than {0}'.translate().siFormat(lValue.formatPrice()), action: function(){$scope.setMaxPrice(lValue);}},
                                {label : 'Price is more than {0}'.translate().siFormat(lValue.formatPrice()), action: function(){$scope.setMinPrice(lValue);}},
                                {label : 'Price is between {0} and {1}'.translate().siFormat(lPriceMin.formatPrice(), lPriceMax.formatPrice()), action: function(){
                                    $scope.setMinPrice(lPriceMin);
                                    $scope.setMaxPrice(lPriceMax);
                                }},
                                // civic adress suggestion
                                {label : 'Has "{0}" as civic address'.translate().siFormat(lValue), action: function(){$scope.filter.addFilter('location.address.street_number','equal',lValue, 'Has "{0}" as civic address'.translate().siFormat(lValue))}}
                            ]);
                        }
                    }
                    // When keyword is String
                    else{
                        // set keyword to lowercase
                        let lValue = $filter.data.keyword.toLowerCase();
                        // first selected for query_text
                        lResult = [
                            {
                                selected:true, 
                                label : 'Contains "{0}"'.translate().siFormat(lValue), 
                                action : function(){ 
                                    $filter.query_text = lValue; 
                                    $filter.buildFilters(); 
                                    $filter.buildHints(); 
                                    $filter.saveState();
                                } 
                            }
                        ];
                        if($scope.configs.type == 'listings'){
                            // Add categories that match the keyword
                            for($key in $scope.dictionary.listing_category){
                                let lElm = $scope.dictionary.listing_category[$key];
                                if(lElm.caption.toLowerCase().indexOf(lValue)>=0){
                                    lResult.push({label: '{0} (category)'.translate().siFormat(lElm.caption), action: function(){ lElm.selected=true;  $scope.filter.addFilter('category','in',$scope.getSelection($scope.dictionary.listing_category));} }) 
                                }
                            }
                            // Add subcategories that match the keyword
                            for($key in $scope.dictionary.listing_subcategory){
                                let lElm = $scope.dictionary.listing_subcategory[$key];
                                if(lElm.caption.toLowerCase().indexOf(lValue)>=0){
                                    lResult.push({label: '{0} (subcategory)'.translate().siFormat(lElm.caption), action: function(){ lElm.selected=true;  $scope.filter.addFilter('subcategory','in',$scope.getSelection($scope.dictionary.listing_subcategory));} }) 
                                }
                            }
                            // Add regions that match the keyword
                            for($key in $scope.dictionary.region){
                                let lElm = $scope.dictionary.region[$key];
                                if(lElm.caption.toLowerCase().indexOf(lValue)>=0){
                                    lResult.push({label: '{0} (region)'.translate().siFormat(lElm.caption), action: function(){ lElm.selected=true;  $scope.filter.addFilter('location.region_code','in',$scope.getSelection($scope.dictionary.region));} }) 
                                }
                            }
                            // Add cities that match the keyword
                            for($key in $scope.dictionary.city){
                                let lElm = $scope.dictionary.city[$key];
                                if(lElm.caption.toLowerCase().indexOf(lValue)>=0){
                                    lResult.push({label: '{0} (city)'.translate().siFormat(lElm.caption), action: function(){ lElm.selected=true;  $scope.filter.addFilter('location.city_code','in',$scope.getSelection($scope.dictionary.city));} }) 
                                }
                            }
                        }
                        else if($scope.configs.type == 'brokers'){
                            lResult.push({
                                label: 'Last name is "{0}"'.translate().siFormat($scope.data.keyword), 
                                action: function(){ 
                                    $scope.filter.addFilter('last_name','equal_to',$scope.data.keyword, 'Last name is "{0}"'.translate().siFormat($scope.data.keyword));
                                    $scope.buildFilters(); $scope.buildHints();
                                } 
                            });

                            lResult.push({
                                label: 'Last name starts with "{0}"'.translate().siFormat(lValue), 
                                action: function(){ 
                                    $scope.filter.addFilter('last_name','starts_with',lValue, 'Last name starts with "{0}"'.translate().siFormat(lValue));
                                    $scope.buildFilters(); $scope.buildHints();
                                } 
                            });

                            lResult.push({
                                label: 'Last name ends with "{0}"'.translate().siFormat(lValue), 
                                action: function(){ 
                                    $scope.filter.addFilter('last_name','ends_with',lValue, 'Last name ends with "{0}"'.translate().siFormat(lValue));
                                    $scope.buildFilters(); $scope.buildHints();
                                } 
                            });


                            lResult.push({
                                label: 'First name is "{0}"'.translate().siFormat($scope.data.keyword), 
                                action: function(){ 
                                    $scope.filter.addFilter('first_name','equal_to',$scope.data.keyword, 'First name is "{0}"'.translate().siFormat($scope.data.keyword));
                                    $scope.buildFilters(); $scope.buildHints();
                                } 
                            });

                            lResult.push({
                                label: 'First name starts with "{0}"'.translate().siFormat(lValue), 
                                action: function(){ 
                                    $scope.filter.addFilter('first_name','starts_with',lValue, 'First name starts with "{0}"'.translate().siFormat(lValue));
                                    $scope.buildFilters(); $scope.buildHints();
                                } 
                            });

                            lResult.push({
                                label: 'First name ends with "{0}"'.translate().siFormat(lValue), 
                                action: function(){ 
                                    $scope.filter.addFilter('first_name','ends_with',lValue, 'First name ends with "{0}"'.translate().siFormat(lValue));
                                    $scope.buildFilters(); $scope.buildHints();
                                } 
                            });

                        }
                    }
                }
                $scope.suggestions = lResult;
    
            }
            //#endregion
            // ----------------------


            /**
             * Check for arrow up/down and enter key-down trigger
             * @param {int} $keyCode 
             */
            $scope.trapKeyCode = function($keyCode){
                let lSelectedIndex = 0;
                let lResult = false;
                switch($keyCode){
                    case 13: // on Enter, choose selection or first suggestion
                        let lPassthrough = $scope.suggestions.every(function($e,$i){
                            //console.log($i, $e.selected)
                            if($e.selected===true){
                                $e.action();
                                lResult = true;
                                return false;
                            }
                            return true;
                        });
                        if(lPassthrough){
                            $scope.suggestions[0].action();
                            lResult = true;
                        }
                        $scope.data.keyword = '';
                        $scope.suggestions = [];
                        break;
                    case 38: // move selection up
                        $scope.suggestions.every(function($e,$i){
                            if($e.selected===true){
                                lSelectedIndex = $i;
                                delete $e.selected;
                                return false;
                            }
                            return true;
                        });
                        lSelectedIndex = Math.max(lSelectedIndex-1,0);
                        $scope.suggestions[lSelectedIndex].selected=true;
                        lResult = true;
                        break;
                    case 40: // move selection down
                        $scope.suggestions.every(function($e,$i){
                            if($e.selected!=undefined && $e.selected===true){
                                lSelectedIndex = $i;
                                delete $e.selected;
                                return false;
                            }
                            return true;
                        });
                        lSelectedIndex = Math.min(lSelectedIndex+1,$scope.suggestions.length-1);
                        $scope.suggestions[lSelectedIndex].selected=true;
                        lResult = true;
                        break;
                }
                return lResult;
            }

            $scope.searchForKeyword = function(){
                $scope.filter.query_text = $scope.filter.data.keyword; 
                if($scope.filter.query_text == ''){
                    $scope.resetFilters();
                    return;
                }
                $scope.filter.saveState();
                $scope.filter.buildFilters();
            }

            $scope.lateCall = function($func){
                $siUtils.lateCall($func);
            }
            
            $scope._priceChangeDebounce = null;
            $scope.updatePrice = function(){
                if($scope._priceChangeDebounce != null) window.clearTimeout($scope._priceChangeDebounce);
                

                const lPriceParts = $siHooks.filter('search-price-parts', $scope.PRICE_PARTS);
                const lPriceMaxBoundary = $siHooks.filter('search-max-price-boundary', $scope.PRICE_RANGE_MAX);
                const lRoundPrecision = $siHooks.filter('search-round-precision', $scope.PRICE_RANGE_PRECISION);
                
                const fnRoundPrice = function($price){ return Math.round($price / lRoundPrecision) * lRoundPrecision; }
                
                const lMinPrice = fnRoundPrice(lPriceMaxBoundary * $scope.priceRange[0]);
                const lMaxPrice = fnRoundPrice(lPriceMaxBoundary * $scope.priceRange[1]);
                
                $scope._priceChangeDebounce = window.setTimeout(function(){
                    
                    $scope.filter.setPricePart(lPriceParts);
                    $scope.filter.data.min_price = lMinPrice;
                    $scope.filter.data.max_price = (lMaxPrice < lPriceMaxBoundary) ? lMaxPrice : null;
                    $scope.filter.update();
                    
                },100);
            }

            $scope.getPriceParts = function(){
                if($scope.viewFilters == null) return ['sell','lease'];
                const lResult = [];
                if(!$scope.viewFilters.some(function($f){ return ['LeasePrice','SellPrice'].includes($f.field)})) return['sell','lease'];
                if($scope.viewFilters.some(function($f){ return $f.field == 'LeasePrice'})) lResult.push('lease');
                if($scope.viewFilters.some(function($f){ return $f.field == 'SellPrice'})) lResult.push('sell');

                return lResult;
            }

            $scope.resetPriceRange = function(){
                

                $scope.priceRange = [0,1,0];
                $scope.updatePrice();
            }

            /**
             * Select this price input to build suggestion for
             * @param {string} $value Input to choose. Supported values: min|max
             */
            $scope.selectPriceInput = function($value){
                $scope.selected_price_input = $value;
                $scope.updatePriceSuggestions();
            }
    
            /**
             * Update price suggestions shortcut. Update both min and max
             */
            $scope.updatePriceSuggestions = function(){
                $scope.priceSuggestions = $scope.getPriceSuggestions($scope.selected_price_input);
                $scope.minPriceSuggestions = $scope.getPriceSuggestions('min');
                $scope.maxPriceSuggestions = $scope.getPriceSuggestions('max');
            }
    
            /**
             * Build a price suggestions list
             * @param {string} $minOrMax Which suggestion list to build. Possible values : 'min' or 'max'
             */
            $scope.getPriceSuggestions = function($minOrMax){
                let lResult = [];
                let lMinPrice = $scope.min_price || 0;
                let lMaxPrice = $scope.max_price || 500000;
                let lStartAt = lMinPrice;
                
                const lList = [5000,25000,50000,75000,100000,200000,300000, 400000];

                if($minOrMax=='max'){
                    lStartAt = lMaxPrice;
                }
                
    
                lList.forEach(function($val){
                    let lValue = $val + lStartAt;
                    lResult.push({value: lValue, label: lValue.formatPrice()});
                });

                return lResult;
            }
            

            // -------------------------------------------
            //#region INPUT HANDLING
            // -------------------------------------------
            
            $scope.applyDefaultMainFilter = function(){
                $scope.current_main_filter == null;

                if($scope.configs.search_engine_options.type=='focused') return;
                if($scope.configs.search_engine_options.tabs==undefined) return;

                $scope.current_main_filter = sessionStorage.getItem('si.currentMainFilter');
                if($scope.current_main_filter == null){
                    const lFilters = $scope.main_filters[$scope.configs.type];
                    //console.log('applyDefaultMainFilter',lFilters);

                    const lFirstFilter = Object.keys(lFilters).find(function($k){return $scope.configs.search_engine_options.tabs.includes($k)});
                    if(!isNullOrEmpty(lFirstFilter)){
                        $scope.selectMainFilter(lFirstFilter);    
                    }
                }
                else{
                    const lFilter = $scope.current_main_filter;
                    $scope.current_main_filter = undefined;
                    if(!isNullOrEmpty(lFilter)){
                        $scope.selectMainFilter(lFilter);
                    }
                }
            }


            $scope.getInputCount = function(){
                if($scope.configs == null) return 5;

                const lValueMap = {
                    'listings' : {
                        default: 5,
                        potentialInputs: function(){
                            return ['cities','prices','categories','more']
                                .filter(function($panelName){
                                    return $scope.allowPanel($panelName);
                                }).length + 1;
                        }
                    },
                    'brokers' : {
                        default: 3,
                        potentialInputs: function(){
                            if(isNullOrEmpty($scope.configs)) return null;
                            if(isNullOrEmpty($scope.configs.search_engine_options.fields)) return null;
                            
                            const lEffectiveInputs = $scope.configs.search_engine_options.fields
                                .filter(function($fieldname){
                                    if($fieldname == 'licenses') return $scope.siDictionary.count('broker_license_type') > 1;
                                    if($fieldname == 'offices') return $scope.officeList.length > 1;
                                    return true;
                                })
                            
                            return lEffectiveInputs.length;
                        }
                    },
                    'offices' : {
                        default: 1,
                        potentialInputs: function(){
                            return ['agencies']
                                .filter(function($panelName){
                                    return $scope.allowPanel($panelName);
                                }).length + 1;
                        }
                    },
                    'agencies' : {
                        default: 1,
                        potentialInputs: function(){
                            return ['agencies']
                                .filter(function($panelName){
                                    return $scope.allowPanel($panelName);
                                }).length + 1;
                        }
                    }
                }
                return lValueMap[$scope.configs.type].potentialInputs() || lValueMap[$scope.configs.type].default;

            }

            $scope.setFilterFromList = function($list, $value){
                $list.forEach(function($item){
                    $scope.filter.addFilter($item.filter.field,$item.filter.operator,null);
                });

                const lFilter = $list.find(function($item){return $item.key==$value})
                if(lFilter != null){
                    $scope.filter.addFilter(lFilter.filter.field,lFilter.filter.operator,lFilter.filter.value, lFilter.key);
                }
            }

            /**
             * Set the price for the input
             * @param {number} $value Price value to set
             * @param {*} $eventOrInput Input(String) to force value for one of the input. Event(Event) to prevent bubble up propagation
             */
            $scope.setPrice = function($value, $eventOrInput){
                let lInput = $scope.selected_price_input;
                if(typeof $eventOrInput == 'string'){
                    lInput = $eventOrInput;
                }
                
                $siFilters.with($scope.alias, function($filter){
                    let lOperators = {
                        'min' : 'greater_or_equal_to',
                        'max' : 'less_or_equal_to'
                    }

                    $scope.filter.addFilter(['price.sell.amount','price.lease.amount'], lOperators[lInput], $value);
                    
                    // $scope.filter.addFilter(['price.sell.amount','price.lease.amount'],'greater_or_equal_to',  $scope.data.min_price);
                    // $scope.filter.addFilter(['price.sell.amount','price.lease.amount'],'less_or_equal_to', $scope.data.max_price);
                    if($value == ''){
                        // will remove filter for that price boundary
                        $filter.data[lInput + '_price'] = undefined;
                    }
                    else{
                        $filter.data[lInput + '_price'] = $value;
                    }

                    if($scope.selected_price_input=='min'){       
                        if($eventOrInput && (typeof $eventOrInput != 'string')){
                            // will keep the event bubbling up for "min" input
                            $eventOrInput.stopPropagation();
                            // switch to max input
                            $scope.selectPriceInput('max');
                        }
                    }
                });
                
            }  
            
            $scope.setPriceFromRange = function($values){
                $siFilters.with($scope.alias, function($filter){

                    //console.log('set price from range', $values)

                    let lOperators = [
                        'greater_or_equal_to',
                        'less_or_equal_to'
                    ]

                    const lPriceMaxBoundary = $siHooks.filter('search-max-price-boundary', 1000000);
                    $filter.data.min_price = $values[0];
                    $filter.data.max_price = $values[1] < lPriceMaxBoundary ? $values[1] : 0;
                    
                    $values.forEach(function($e,$i){
                        //console.log($e, $filter.hasFilter(['price.sell.amount','price.lease.amount']), $filter);

                        if($e > 0 && $e < lPriceMaxBoundary){
                            $filter.addFilter(['price.sell.amount','price.lease.amount'], lOperators[$i], $e);
                        }
                        else if($filter.hasFilter(['price.sell.amount','price.lease.amount'])){
                            $filter.addFilter(['price.sell.amount','price.lease.amount'], lOperators[$i], '');
                        }
                    });
                });
            }
            
            $scope.setMinPrice = function($value){
                $scope.setPrice($value,'min');
            }
            $scope.setMaxPrice = function($value){
                $scope.setPrice($value,'max');
            }

            $scope.getPriceFromScale = function($value, $multiplier, $starting, $default_value){
                $starting = (typeof $starting == 'undefined') ? 0:$starting;
                $default_value = (typeof $default_value == 'undefined') ? $value : $default_value;
                if(!isNaN($default_value)) $default_value = $default_value.formatPrice();

                if($value == 0) return $default_value;

                $value *= 100;

                let lResult = $starting + ($value * $multiplier);

                return Math.round(lResult).formatPrice();
            }

            $scope.getMinPriceLabel = function($minLabel){
                const lPriceMaxBoundary = $siHooks.filter('search-max-price-boundary', $scope.PRICE_RANGE_MAX);
                const lRoundPrecision = $siHooks.filter('search-round-precision', $scope.PRICE_RANGE_PRECISION);
                const lResultFormat = $siHooks.filter('search-price-format', $scope.PRICE_RANGE_FORMAT);

                const fnRoundPrice = function($price){ return Math.round($price / lRoundPrecision) * lRoundPrecision; }
                
                $minLabel = ($minLabel == undefined) ? (0).formatPrice() : $minLabel;

                if($scope.priceRange[0] == 0) return $minLabel;
            
                const lResult = fnRoundPrice(lPriceMaxBoundary * $scope.priceRange[0]);
                return lResultFormat.translate().siFormat(lResult.formatPrice());
            }

            $scope.getMaxPriceLabel = function($maxLabel){
                const lPriceMaxBoundary = $siHooks.filter('search-max-price-boundary', $scope.PRICE_RANGE_MAX);
                const lRoundPrecision = $siHooks.filter('search-round-precision', $scope.PRICE_RANGE_PRECISION);
                const lResultFormat = $siHooks.filter('search-price-format', $scope.PRICE_RANGE_FORMAT);

                const fnRoundPrice = function($price){ return Math.round($price / lRoundPrecision) * lRoundPrecision; }
                
                $maxLabel = ($maxLabel == undefined) ? lPriceMaxBoundary.formatPrice() : $maxLabel;

                if($scope.priceRange[1]==1) return $maxLabel;
                const lResult = fnRoundPrice(lPriceMaxBoundary * $scope.priceRange[1]);
                return lResultFormat.translate().siFormat(lResult.formatPrice());
            }

            /**
             * Set bedroom count filter from list item and tag it as selected
             * @param {object} $item List item 
             */
            $scope.setBedroomCount = function($item){
                // reset other selected items
                $scope.bedroomSuggestions.forEach(function($e){
                    $e.selected = false;
                });
                // tag
                $item.selected = true;
                
                // add filter
                $scope.filter.addFilter(
                    'main_unit.bedroom_count',
                    'greater_or_equal_to',$item.value, '{0}+ bedrooms'.translate().siFormat($item.value),
                    function(){
                        $scope.setBedroomCount({value:''});
                    }                
                );
            }

            $scope.setGarageCount = function($item){
                // reset other selected items
                $scope.garageSuggestions.forEach(function($e){
                    $e.selected = false;
                });
                // tag
                $item.selected = true;
                // add filter
                $scope.filter.addFilter(
                    'attributes.PARKING_GARAGE',
                    'greater_or_equal_to',$item.value, $item.caption,
                    function(){
                        $scope.setGarageCount({value:''});
                    }                
                );
            }

            $scope.setParkingCount = function($item){
                // reset other selected items
                $scope.parkingSuggestions.forEach(function($e){
                    $e.selected = false;
                });
                // tag
                $item.selected = true;
                // add filter
                $scope.filter.addFilter(
                    'attributes.PARKING',
                    'greater_or_equal_to',$item.value, $item.caption,
                    function(){
                        $scope.setParkingCount({value:''});
                    }                
                );
            }

            $scope.setBathroomCount = function($item){
                // reset other selected items
                $scope.bathroomSuggestions.forEach(function($e){
                    $e.selected = false;
                });
                // tag
                $item.selected = true;
                // add filter
                $scope.filter.addFilter(
                    'main_unit.bathroom_count',
                    'greater_or_equal_to',$item.value, $item.caption,
                    function(){
                        $scope.setBathroomCount({value:''});
                    }                
                );
            }

            // -------------------------------------------
            //#endregion
            // -------------------------------------------

            $scope.syncFiltersToUI = function($filter){
                const lPriceMaxBoundary = $siHooks.filter('search-max-price-boundary', $scope.PRICE_RANGE_MAX);
                
                if($filter.data.min_price != null){
                    const lPriceRangeMin    = $filter.data.min_price / lPriceMaxBoundary;
                    $scope.priceRange[0] = lPriceRangeMin;
                }

                if($filter.data.max_price != null){
                    const lPriceRangeMax    = $filter.data.max_price==0 ? 1 : $filter.data.max_price / lPriceMaxBoundary;
                    $scope.priceRange[1] =  lPriceRangeMax;
                }
            
            }

            /**
             * Synchronize list selection to filter
             * @param {object} $filter Filter bound to list
             * @param {object} $list List object or array
             */
            $scope.syncToList = function($filter, $list){
                $siFilters.with($scope.alias, $scope).syncToList($filter, $list);
            }

    
            /**
             * Set state filter from list item
             * @param {object} $item List item
             */
            $scope.setState = function($item){
                let lValue = $item.filter.value;
                // remove value when not select to trigger filter removal
                if($item.selected!=true){
                    lValue = '';
                }
                // add filter
                $scope.filter.addFilter($item.filter.field, $item.filter.operator, lValue, $item.caption.translate(),
                    function(){
                        $item.selected = '';
                        $scope.setState($item);
                    }
                );
            }

            $scope.hasChild = function($parent_key, $list){
                for($key in $list){
                    let lData = $list[$key];
                    if(lData.parent==$parent_key){
                        return true;
                    }
                }
                
                return false;
            }

            $scope.getFavorites = function($key){
                return $siFavorites.favorites.map(function($e) {
                    return $e[$key];
                })
            }

            $scope.hasFavorites = function(){
                return !$siFavorites.isEmpty();
            }
    
            // -------------------------------------------
            //#region FILTER HINT BUILDING
            // TODO: Delete deprecated since version 0.4.0
            // -------------------------------------------
            
            /**
             * Build a list of hints based on the filter group given as parameter
             */
            $scope.buildHints = function(){
                let lResult = [];
                $siFilters.with($scope.alias, $scope, function($filter){
                    //console.log('building hints for ', $filter);

                    lResult = lResult.concat($scope.buildFilterHints($filter.filter_group));  

                    //console.log('buildHints',$filter.data);
                    // prices
                    $scope.buildPriceHint($filter,lResult);
                    $scope.buildAreasHint($filter,'land',lResult);
                    $scope.buildAreasHint($filter,'building',lResult);

                    if($filter.query_text!=null){
                        //console.log('query_text has something to say');
                        lResult.push({
                            item: "QUERY_TEXT", 
                            label: 'Contains "{0}"'.translate().siFormat($filter.query_text),
                            reverse: function(){
                                $filter.query_text = null;
                                $filter.buildFilters(); 
                                $scope.buildHints();
                                $filter.saveState();
                            }
                        });
                    }
        
                    //console.log('hint for data', $filter.data);
                    if($filter.data.location!=null){
                        lResult.push({
                            item: "NEAR_ME", 
                            label: 'Near me'.translate(),
                            reverse: function(){
                                $filter.data.location = null;
                                $filter.buildFilters(); 
                                $scope.buildHints();
                                $filter.saveState();
                            }
                        });
                    }
        
                    //console.log('hints', lResult);
        
                    $scope.filterHints = lResult;
                })
                
                
                
            }

            $scope.buildPriceHint = function($filter,$hints){
                const lResult = [];
                if(
                    ($filter.data.min_price != undefined || $filter.data.max_price != undefined) &&
                    ($filter.data.min_price != 0 || $filter.data.max_price != 0)
                ){
                    
                    let lPriceHint = ['Min','Max'];
                    if($filter.data.min_price!=undefined){
                        lPriceHint[0] = $filter.data.min_price.formatPrice();
                    }
    
                    if($filter.data.max_price!=undefined && $filter.data.max_price!=0){
                        lPriceHint[1] = $filter.data.max_price.formatPrice();
                    }
                    else{
                        lPriceHint[1] = 'Unlimited'.translate();
                    }
    
                    $hints.push({
                        item : 'PRICE', 
                        label: lPriceHint.join(' - '),
                        reverse: function(){
                            //console.log('Remove price filter');
                            $scope.priceRange = [0,1,0];
                            $scope.updatePrice();
                            // $scope.setPrice('','min');
                            // $scope.setPrice('','max');
                        }
                    });
                }
            }

            $scope.buildAreasHint = function($filter, $type, $hints){
                const lMinValue = $filter.data[$type + '_min'];
                const lMaxValue = $filter.data[$type + '_max'];
                const lTypeLabel = $type=='land' ? 'Land area' : 'Available area';

                //console.log('buildAreasHint', lMinValue, lMaxValue,$filter);

                if(
                    (lMinValue != undefined || lMaxValue != undefined) &&
                    (lMinValue != 0 || lMaxValue != 0)
                ){
                    
                    let lAreaLabels = ['Min','Max'];
                    if(lMinValue!=undefined){
                        lAreaLabels[0] = '{0} sqft'.translate().siFormat(lMinValue);
                    }
    
                    if(lMaxValue!=undefined && lMaxValue!=0){
                        lAreaLabels[1] = '{0} sqft'.translate().siFormat(lMaxValue);
                    }
    
                    $hints.push({
                        item : 'AREA', 
                        label: lTypeLabel.translate() + ' ' + lAreaLabels.join(' - '),
                        reverse: function(){
                            $filter.data[$type + '_min'] = null;
                            $filter.data[$type + '_max'] = null;
                            $scope.setArea(null, $type, 'min', '')
                            $scope.setArea(null, $type, 'max', '')
                        }
                    });
                }
            }
    
            /**
             * Build a list of hints based on the filter group given as parameter
             * @param {filterGroup} $group 
             */
            $scope.buildFilterHints = function($group){
                let lResult = [];
                let lListSync = {
                    // dictionary
                    "category_code" : "listing_category",
                    "subcategory_code" : "listing_subcategory",
                    "location.city_code" : "city",
                    "location.region_code" : "region",
                    "building.category_code" : "building_category",
                    "office_ref_number" : $scope.officeList
                }
                // filters that as a label
                if($group.filters != null){
                    $group.filters.forEach(function($e,$i){
                        let lList = null;
    
                        if(Array.isArray(lListSync[$e.field])){
                            lList = lListSync[$e.field];
                            lResult = lResult.concat($scope.buildFilterHintForList($e, lList))
                        }
                        if(lListSync[$e.field] != undefined){
                            let lDictionaryKey = lListSync[$e.field];
                            if($scope.dictionary[lDictionaryKey]){
                                lList = $scope.dictionary[lDictionaryKey];
                                lResult = lResult.concat($scope.buildFilterHintForList($e, lList))
                            }
                        }
                        else if($e.label){
                            lResult.push({
                                item:$e, 
                                label: $e.label,
                                reverse: function(){
                                    if(typeof($e.reverse)=='function'){
                                        $e.reverse();
                                    }
                                    else{
                                        $scope.filter.addFilter($e.field,$e.operator, '');
                                    }
                                }
                            });
                        }
                    })
                }
    
                // Recursively apply to sub filter groups
                if($group.filter_groups != null){
                    $group.filter_groups.forEach(function($g){
                        let lSubGroups = $scope.buildFilterHints($g);
                        lResult = lResult.concat(lSubGroups);
                    });
                }
                
                return lResult;
            }
    
            /**
             * Build filter hint from dictionary list
             * @param {object} $filter Filter object
             * @param {object} $list List of value
             */
            $scope.buildFilterHintForList = function($filter, $list){
                let lResult = [];
                if(Array.isArray($list)){
                    $list.forEach(function($e,$i) {
                        const lKey = Object.keys($e).find(function($k){return $k=='id'}) || Object.keys($e)[0];
                        if($e.selected) lResult.push({
                            item: lKey,
                            label: $e.name || $e.caption || $e.label,
                            reverse: function(){
                                delete $e.selected;
                                $scope.filter.addFilter($filter.field, 'in', $scope.getSelection($list))
                            }
                        });
                    });
                    return lResult;
                }
                
                for(let $key in $list){
                    if($filter.operator=='in' && $filter.value.indexOf($key)>=0){
                        lResult.push({
                            item:$key, 
                            label: $list[$key].caption, 
                            reverse: function(){
                                $list[$key].selected = false;
                                $scope.filter.addFilter($filter.field, 'in', $scope.getSelection($list))
                            }
                        });
                    }
                    else if ($list[$key].selected){
                        lResult.push({
                            item:$key, 
                            label: $list[$key].caption, 
                            reverse: function(){
                                $list[$key].selected = false;
                                $scope.filter.addFilter($filter.field, 'equal', '')
                            }
                        });
                    }
                };
                return lResult;
            }
            // -------------------------------------------
            //#endregion
            // -------------------------------------------
    
            /**
             * Reset all filter to nothing
             */
            $scope.resetFilters = function(){
                // for(let $key in $scope.dictionary){
                //     $scope.filter.resetListSelections($scope.dictionary[$key]);
                // }
                // for(let $key in $scope.listing_states){
                //     delete $scope.listing_states[$key].selected;
                // }
                // $scope.filterHints = [];
               
                // $scope.filter.resetListSelections($scope.listing_attributes);
                // $scope.bedroomSuggestions.forEach(function($e){delete $e.selected;});
                // $scope.bathroomSuggestions.forEach(function($e){delete $e.selected;});
                // $scope.parkingSuggestions.forEach(function($e){delete $e.selected;});
                // $scope.garageSuggestions.forEach(function($e){delete $e.selected;});
                // $scope.officeList.forEach(function($e){delete $e.selected;});
                // $scope.data.transaction_type = null;
                // $scope.data.contract = null;

                $scope.priceRange = [0,1,0];
                
                //console.log('reset office filter', $scope.officeList);

                $siHooks.do('filter-reset');

                $scope.filter.resetFilters();
                
                // reset to default main filter
                
                //$scope.applyDefaultMainFilter();

                

                //$scope.$broadcast('si-reset-filter');
                $scope.getConfigs().then(function($configs){
                    //console.log('Reset filter to', $configs.search_token);
                    if($configs.search_token!=''){
                        $rootScope.$broadcast($scope.alias + 'FilterTokenChanged', $configs.search_token);

                        if($scope.onTokenChange!=undefined){
                            $scope.onTokenChange();
                        }
                        
                    }
                    else{
                        // reset the filter manager last
                        // this will trigger the UI update
                        
                    }
                });
            }

            
            $scope.navigate = function(){
                if($scope.result_url!='' && $scope.result_url!=null){
                    $scope.buildFilters().then(function($token){
                        window.location = $scope.result_url;
                    });
                }
            }
    
            $scope.toggleAllFor = function($key, $operator, $list, $item_parent){

                for(let lKey in $list){
                    let lToggle = false;
                    if($item_parent == undefined){
                        lToggle = true;
                    } 
                    else if($list[lKey].parent == $item_parent.__$obj_key){
                        lToggle = true;
                    }
                    
                    if(lToggle == true){
                        
                        if($item_parent.selected != true){
                            delete $list[lKey].selected;
                        }
                        else{
                            $list[lKey].selected = true;
                        }
                    }
                }

                $scope.filter.addFilter($key, $operator, $scope.getSelection($list));
            }

            /**
             * Loop through object attributes and return a list of key that are marked as "selected"
             * @param {object} $list 
             */
            $scope.getSelection = function($list, $key_prop){
                let lResult = [];
                //console.log($list);
                if(Array.isArray($list)){
                    $list.forEach(function($e){
                        const lKey = $key_prop || Object.keys($e).find(function($k){return $k=='id'}) || Object.keys($e)[0];
                        if($e.selected) lResult.push($e[lKey]);
                    });
                }
                else{
                    for (let lKey in $list) {
                        if($list[lKey].selected==true){
                            lResult.push(lKey);
                        }
                    }    
                }
                
                return lResult;
            }
    
            /**
             * Normalize values for all filters and sub group filters
             * @param {object} $filter_group Group to be normalize
             */
            $scope.normalizeFilterGroup = function($filter_group){
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
                        $scope.normalizeFilterGroup($group);
                    });
                }
    
                return $filter_group;
            }
  
            /**
             * Return valid configuration settings
             */
            $scope.getConfigs = function(){
                return $siConfig.getList($scope.alias);
            }
           
    
            // EVENTS HANDLING
    
            /**
             * Handler for SortDataChanged event
             * @param {object} $newSortData 
             */
            $scope.onSortDataChanged = function($event, $newSortData){
                
                
                $scope.filter.sort_fields = [$newSortData];
                
                //console.log('sort field changed', $newSortData);
                $scope.filter.buildFilters();
                
            }

            $scope.getListType = function(){
                return $scope.configs.type;
            }
        }
    };
}]);

siApp
.directive('siSearchBox', ['$sce','$compile','$siUtils','$siFilters','$siConfig',
function siSearchBox($sce,$compile,$siUtils,$siFilters, $siConfig){
    return {
        restrict: 'E',
        replace: true,
        required: '^siSearch',
        scope: {
            alias: '@',
            placeholder: '@?',
            onTokenChange: '&onEnter',
            result_page: '@resultPage',
            persistantKeyword : '@persistantKeyword'
        },
        templateUrl: siCtx.base_path + 'views/ang-templates/si-searchbox.html?v=6',
        link : function($scope,element, attrs, siSearch){
            $scope.persistantKeyword = $scope.persistantKeyword == 'true';
            $scope._el = element[0];
            
           
            $scope.init();
        },
        controller: function($scope, $q, $element, $siApi, $rootScope, $siDictionary, $siUtils,$timeout,$siFilters, $siDataLayer){
            $scope.configs = null;
            $scope.suggestions = [];
            $scope.is_ready = false;
            $scope.keyword = '';
            $scope.query_text = null;
            $scope.sort_fields = [];
            $scope.filter = null;
            $scope.stored_suggestions = null;
            $scope._suggestion_list_el = null;

            $scope._view_id = null;

            $scope.init = function(){
                $scope.$on('si/{0}:viewChanged'.siFormat($scope.alias), function($event, $view_id){
                    //console.log('siSearchbox/init/@si/[alias]:viewChanged',$view_id);
                    $scope.updateViewMeta();
                });

                $scope.isReady().then(function(){
                    $siFilters.with($scope.alias, $scope, function ($filter){
                        $scope.filter = $filter;
                        $scope.filter.result_url = $scope.result_page;
                        
                        $filter.loadState();
                       
                        if($scope.persistantKeyword && $filter.query_text!=''){
                            $filter.data.keyword = $filter.query_text;
                        }
                        else{
                            //console.log('keywords are not persistant');
                            $filter.data.keyword = '';
                        }
                    });

                    //$scope.loadState();
                    
                    let lInput = angular.element($scope._el).find('input');

                    lInput.bind('focus', function(){
                        angular.element($scope._el).addClass('has-focus');
                        if(window.innerWidth <= 800){
                            
                            const lInputRect = $scope._el.getBoundingClientRect();
                            window.scroll({
                                top: lInputRect.top + window.scrollY - 30,
                                behavior: 'smooth'
                            });
                            
                        }

                        if($scope.filter.data.keyword != null && $scope.filter.data.keyword != ''){
                            $scope.buildSuggestions();
                            $scope.$apply();
                            
                        }

                        
                    })
                    lInput.bind('blur', function(){
                        $timeout(function(){ 
                            $scope.closeSuggestionPanel().then( function(){
                                angular.element($scope._el).removeClass('has-focus');
                                //console.log('remove focus class and clear suggestions');
                                $scope.suggestions = [];
                                $scope.stored_suggestions = null;
                                //$scope.$apply();    
                                $scope.$emit('si-searchbox-blur');
                            });
                        }, 200);
                    });
                    
                    if(typeof ResizeObserver !== 'undefined'){
                        new ResizeObserver(function(){
                            $scope.updateSuggestionPanelPosition();
                        }).observe(lInput[0]);
                    }

                    $scope.$broadcast('search-is-ready');
                });
            };

            /**
             * Wait for required data to be available
             * @return {promise}
             */
            $scope.isReady = function(){
                // check for dictionary and configs perequisits
                if($scope.dictionary!=null && $scope.configs != null){
                    $scope.is_ready = true; 
                }
                
                // build promise
                let lPromise = $q(function($resolve,$reject){
                    if($scope.is_ready == false){
                        // load configs
                        $scope.getConfigs().then(function($configs){
                            //console.log('getConfigs', $configs);
                            // load view meta
                            $scope.configs = $configs;
                            $siFilters.with($scope.alias, $scope).configs = $configs;
                            
                            $scope.placeholder = ($scope.placeholder != undefined) ? $scope.placeholder :$configs.search_engine_options.search_box_placeholder;
                            
                            $scope.updateViewMeta().then(function(){
                                $scope.is_ready = true;
                                // directive is ready
                                $resolve();
                            });
                        });
                    }
                    else{
                        $resolve();
                    }
                });
                return lPromise;
            }

            $scope.getSuggestionPosition = function(){
                if($scope._el==undefined){
                    return '';
                }
                    
                let lRect = $siUtils.absolutePosition($scope._el);
                lRect.width = Math.min($scope._el.offsetWidth, window.innerWidth);
                lRect.height = window.getComputedStyle($scope._el).getPropertyValue('height').replace('px','');

                
                return 'top:{0}px;padding-top:{1}px;left:{2}px;width:{3}px;'.siFormat(lRect.top, lRect.height - 1, lRect.left, lRect.width);
            }

            $scope.updateViewMeta = function(){
                const lViewId = ($scope.configs.current_view != undefined)
                                    ? $scope.configs.current_view
                                    : $scope.configs.source.id;

                return $q( function($resolve,$reject){
                    $siApi.getViewMeta($scope.configs.type,lViewId).then(function($response){
                        $scope.dictionary = $response.dictionary; // save dictionary
                        
                        $resolve();
                    });
                })
            }
            

            /**
             * Build suggestions from user typed keywords
             * @param {*} $event 
             */
            $scope._buildSuggestionsDebounceHndl = null;
            $scope.buildSuggestions = function($event){
                const lSUGGESTION_COUNT_LIMIT = 10;
                
                if($scope._buildSuggestionsDebounceHndl!=null){
                    window.clearTimeout($scope._buildSuggestionsDebounceHndl);
                }
            
                let lResult = [];
                // bail on key code trap
                if($event != undefined){
                    if($scope.trapKeyCode($event.keyCode)) return false;
                }
                $siFilters.with($scope.alias, $scope, function($filter){       
                    //$filter.data.keyword = $scope.keyword;     
                    // When keyword is not empty
                    if($filter.data.keyword == ''){
                        $scope.suggestions = [];
                        $scope.stored_suggestions = null;
                    }

                    if($scope.stored_suggestions == null || $scope.stored_suggestions.length==0 || $scope.stored_suggestions.length >= lSUGGESTION_COUNT_LIMIT){
                        $scope._buildSuggestionsDebounceHndl = window.setTimeout(function(){

                            

                            if($filter.data.keyword !=''){
                                // Get quick search items
                                $scope.getConfigs().then(function($configs){
                                    
                                    

                                    const lQueryParams = {
                                        q: $filter.data.keyword,
                                        c: lSUGGESTION_COUNT_LIMIT
                                    };

                                    if(typeof $scope.$parent.getListType == 'function'){
                                        const lType = $scope.$parent.getListType();
                                        const lTypeHash = {
                                            'listings' : 'listing-city-region',
                                            'brokers' : 'broker',
                                            'offices' : 'office',
                                            'agencies' : 'agency'
                                        }
                                        lQueryParams.t = (lTypeHash[lType] != undefined) ? lTypeHash[lType] : lType;
                                    }
                                    
                                    $siApi.api($scope.getEndpoint(),lQueryParams,{method: 'GET'}).then(function($qsItems){
                                        // add extra in caption
                                        $siDataLayer.pushEvent('si/search', lQueryParams);
                                        $qsItems.forEach(function($e){
                                            if(typeof $e.context != 'undefined'){
                                                Object.keys($e.context).forEach(function($k){
                                                    if($e.context[$k].match($scope.getKeywordRegEx())){
                                                        $e.caption = $e.caption + ' ' + $e.context[$k];
                                                    }
                                                });
                                                //$e.caption = $e.caption + ' ' + $e.context[0];
                                            }
                                        });
                                       
                                        if($qsItems.length > 0) {
                                            $scope.suggestions = $qsItems;
                                            $scope.stored_suggestions = $scope.suggestions;
                                            $scope.suggestions[0].selected =true;
                                            $scope.openSuggestionPanel()
                                        }
                                        else{
                                            $scope.closeSuggestionPanel().then(function(){
                                                $scope.suggestions = $qsItems;
                                                $scope.stored_suggestions = $scope.suggestions;
                                            });
                                        }
                                    });
                                });
                                
                                return;
    
                            }
                            $scope.stored_suggestions = null;
                            $scope.suggestions = lResult;
                        }, 250);
                    }
                    else{
                        $scope.suggestions = $scope.stored_suggestions.filter(function($e) {return $scope.elementMatchKeyword($e,false)});
                        //console.log('stored_suggestions filtered to', $scope.suggestions);

                        if($scope.suggestions.length > 0) $scope.suggestions[0].selected =true;
                    }
                });
            }

            $scope.openSuggestionPanel = function(){
                $scope.$emit('si-searchbox-focus');
                
                if($scope._suggestion_list_el == null){
                    $scope._suggestion_list_el =  $element[0].querySelector('.suggestion-list');
                    document.body.append($scope._suggestion_list_el);
                }
                
                $scope.updateSuggestionPanelPosition(true);


                // $scope._suggestion_list_el.style.top = (-1 + lMainElmRect.top + window.pageYOffset) + 'px';
                // $scope._suggestion_list_el.style.left = (-1 + lMainElmRect.left) + 'px';
                // $scope._suggestion_list_el.style.width = (lMainElmRect.width) + 'px';
                // $scope._suggestion_list_el.style.setProperty('--input-height', lMainElmRect.height + 'px');

                $scope._suggestion_list_el.classList.add('expanded');
                
            }

            $scope.closeSuggestionPanel = function(){
                //return;

                if($scope._suggestion_list_el==null)return $q.resolve();

                return $q(function($resolve,$reject){
                    //console.log('closing suggestion panel')
                    angular.element($scope._suggestion_list_el).on('transitionend', function(){
                        angular.element($scope._suggestion_list_el).off('transitionend')
                        //console.log('Suggestion panel close')

                        $resolve();
                    });

                    //$scope._suggestion_list_el.style.left = '0px';
                    //$scope._suggestion_list_el.style.width = '0px';
                    $scope._suggestion_list_el.classList.remove('expanded');
                });
            }

            $scope.updateSuggestionPanelPosition = function($force){
                $force = ($force == undefined) ? false : $force;
                if($scope._suggestion_list_el == null) return;
                if($force === false && !$scope._suggestion_list_el.classList.contains('expanded')) return;

                const lMainElmRect = $scope._el.getBoundingClientRect();
                const lRect = {
                    width: lMainElmRect.width,
                    height: lMainElmRect.height,
                    top: lMainElmRect.top,
                    left: lMainElmRect.left
                }
                
                Object.keys(lRect).forEach(function($k){
                    $scope._suggestion_list_el.style.setProperty('--input-' + $k, lMainElmRect[$k] + 'px');
                });
                $scope._suggestion_list_el.style.setProperty('--input-offset', window.pageYOffset + 'px');
            }

            $scope.getKeywordRegEx = function($startsWith){
                $startsWith = (typeof $startsWith == 'undefined') ? true : $startsWith;

                if($scope.filter == null) return null;
                if($scope.filter.data.keyword == '') return null;
                let lPattern = $scope.filter.data.keyword;
                let lSpecials = {
                    "a" : "(a|â|ä|à|­á)",
                    "e" : "(e|ê|ë|è|é)",
                    "i" : "(i|î|ï|ì|í)",
                    "o" : "(o|ô|ö|ò|ó)",
                    "u" : "(u|û|ü|ù|ú)",
                    "c" : "(c|ç)"
                }

                Object.keys(lSpecials).forEach(function($k){
                    lPattern = lPattern.replace(new RegExp($k,'gi'), lSpecials[$k]);
                });
                
                if($startsWith) lPattern = '^' + lPattern;

                let lResult = new RegExp(lPattern,'i');

                return lResult;
            }

            $scope.getWrapRegex = function(){
                return $scope.getKeywordRegEx(false);
            }

            $scope.getSelection = function(){
                return $scope.suggestions.find(function($e) {return $e.selected});
            }

            $scope.elementMatchKeyword = function($item, $startsWith){
                if($scope.filter == null) return false;
                
                let lMatchRegEx = $scope.getKeywordRegEx($startsWith);
                let lMathResult = $item.caption.match(lMatchRegEx);
                return lMathResult!=null && lMathResult.length > 0;
            }

            $scope.selectionMatchKeyword = function(){
                if($scope.filter == null) return false;
                if($scope.suggestions == null || $scope.suggestions.length == 0) return false;

                let lSelection = $scope.getSelection();
                if(lSelection == undefined) return false;

                return $scope.elementMatchKeyword(lSelection);
            }

            $scope.getSelectionPlaceholder = function(){
                if($scope.filter == null) return '';

                let lSelection = $scope.getSelection();
                if(lSelection == undefined) return '';

                let lCaption = lSelection.caption;
                
                let lMatchRegEx = $scope.getKeywordRegEx();

                lCaption = lSelection.caption.replace(lMatchRegEx, 
                                '<span class="matched">' + $scope.filter.data.keyword + '</span>');
                
                return lCaption;
            }

            

            $scope.getReverseSuggestions = function(){
                $siFilters.with($scope.alias, $scope, function($filter){
                        
                    let lValue = $filter.data.keyword.toLowerCase();
                    let lValueList = lValue.split(' ');

                    let lLabelResults = [];
                    let lActionResults = [];

                    // Add subcategories that match the keyword
                    for($key in $scope.dictionary.listing_subcategory){
                        let lElm = $scope.dictionary.listing_subcategory[$key];
                        let lAdded = false;

                        if(lValue.indexOf(lElm.caption.toLowerCase())>=0){
                            lLabelResults.push(lElm.caption);
                            lActionResults.push(function(){ 
                                lElm.selected=true;  
                                $filter.addFilter('subcategory','in',$filter.getSelection($scope.dictionary.listing_subcategory));
                            });
                            lAdded = true;
                        }
                        else{
                            lValueList.some(function($e){
                                if(lElm.caption.toLowerCase().indexOf($e)>=0){
                                    lLabelResults.push(lElm.caption);
                                    lActionResults.push(function(){ 
                                        lElm.selected=true;  
                                        $filter.addFilter('subcategory','in',$filter.getSelection($scope.dictionary.listing_subcategory));
                                    });
                                    lAdded = true;
                                    return true;
                                }
                            });

                        }

                        if(lAdded){
                            break;
                        }
                    }

                    let lTransactions = ['for sale', 'sale'];
                    lTransactions.some(function($e){
                        if(lValue.indexOf($e)>=0){
                            lLabelResults.push($e);
                            lActionResults.push(function(){
                                $filter.addFilter('price.sell.amount','greater_than',0);
                            });
                            
                            return true;
                        }
                    });
                    
                    lTransactions = ['for rent','rent'];
                    lTransactions.some(function($e){
                        if(lValue.indexOf($e)>=0){
                            lLabelResults.push($e);
                            lActionResults.push(function(){
                                $filter.addFilter('price.lease.amount','greater_than',0);
                            });
                            return true;
                        }
                    });

                    // Add cities that match the keyword
                    for($key in $scope.dictionary.city){
                        let lElm = $scope.dictionary.city[$key];
                        let lAdded = false;

                        if(lValue.indexOf(lElm.caption.toLowerCase())>=0){
                            lLabelResults.push('in {0}'.translate().siFormat(lElm.caption));
                            lActionResults.push(function(){ 
                                lElm.selected=true;  
                                $filter.addFilter('location.city_code','in',$filter.getSelection($scope.dictionary.city));
                            })
                        }
                        else{
                            lValueList.some(function($e){
                                if(lElm.caption.toLowerCase().indexOf($e)>=0){
                                    lLabelResults.push('in {0}'.translate().siFormat(lElm.caption));
                                    lActionResults.push(function(){ 
                                        lElm.selected=true;  
                                        $filter.addFilter('location.city_code','in',$filter.getSelection($scope.dictionary.city));
                                    });
                                    lAdded = true;
                                    return true;
                                }
                            });
                        }

                        if(lAdded){
                            break;
                        }
                    }
                });

                //console.log('reverse suggestions', lLabelResults.join(' '));

                return {
                    label: lLabelResults.join(' '),
                    action: function(){
                        lActionResult.forEach(function($lf){
                            $lf();
                        });
                        $scope.filter.buildFilters();
                    }
                }
            }

            $scope.doActionFor = function($item){
                $scope.suggestions = [];
                //console.log('item clicked',$item);
                $item.action();
            }
    
            /**
             * Check for arrow up/down and enter key-down trigger
             * @param {int} $keyCode 
             */
            $scope.trapKeyCode = function($keyCode){
                let lSelectedIndex = 0;
                let lResult = false;
                switch($keyCode){
                    case 27:
                        //console.log('escape');
                        $scope.suggestions = [];
                        $scope.stored_suggestions = [];
                        
                        //$scope.$digest();
                        lResult = true;
                        //$scope.resetFilters();

                        break;
                    case 13: // on Enter, choose selection or first suggestion
                        if($scope.filter.data.keyword==''){       
                            $scope.resetFilters();
                        }
                        else{
                            
                            let lSelection = $scope.getSelection();
                            if(lSelection != null){
                                
                                $scope.openItem(lSelection);
                                $scope.suggestions = [];
                                $scope.filter.data.keyword = '';
                                
                                
                                
                                return true;
                            }
                            else{
                                $scope.filter.query_text = $scope.filter.data.keyword;
                                
                                $scope.filter.buildFilters();
                                if(!$scope.persistantKeyword){
                                    $scope.filter.data.keyword = '';
                                }
                                $scope.filter.saveState();
                            }

                        }

                        break;
                    case 38: // move selection up
                        $scope.suggestions.every(function($e,$i){
                            if($e.selected===true){
                                lSelectedIndex = $i;
                                delete $e.selected;
                                return false;
                            }
                            return true;
                        });
                        lSelectedIndex = Math.max(lSelectedIndex-1,0);
                        $scope.suggestions[lSelectedIndex].selected=true;
                        lResult = true;
                        break;
                    case 40: // move selection down
                        $scope.suggestions.every(function($e,$i){
                            if($e.selected!=undefined && $e.selected===true){
                                lSelectedIndex = $i;
                                delete $e.selected;
                                return false;
                            }
                            return true;
                        });
                        lSelectedIndex = Math.min(lSelectedIndex+1,$scope.suggestions.length-1);
                        $scope.suggestions[lSelectedIndex].selected=true;
                        lResult = true;
                        break;
                    case 8:
                        $scope.stored_suggestions = null;
                        break;

                }
                return lResult;
            }


            /**
             * Return valid configuration settings
             */
            $scope.getConfigs = function(){
                return $siConfig.getList($scope.alias);
            }

            $scope.openItem = function($item){
                // When selected item is a listing or a broker, open the page directly
                if(['listing','broker','office','agency'].includes($item.type)){        
                    const lInput = angular.element($scope._el).find('input');
                    lInput.val('');
                    lInput.attr('placeholder','Opening...'.translate())

                    $siConfig.get().then(function($global_configs){
                        let lShortcut = $scope.getItemLinkShortcut($item.type,$global_configs);
                        let lPath = lShortcut.replace('{{item.ref_number}}',$item.ref_number);
                        //console.log('Open item @', lPath);

                        const lViewId = ($scope.configs.current_view != undefined)
                                            ? $scope.configs.current_view
                                            : $scope.configs.source.id;
                        const lViewQuery = ($global_configs.default_view != lViewId) ? '?view=' + lViewId : '';

                        //console.log('openItem', lViewId, $global_configs.default_view);

                        window.location = '/' + lPath + lViewQuery;
                    });
                    return;
                }
               
                // otherwise, try to add to filter
                $rootScope.$broadcast('si-searchbox-add-filter', $item);
            
                $scope.suggestions = [];
                $scope.stored_suggestions = null;

                
            }

            $scope.$on('si-searchbox-add-filter', function($event, $item){
                if($item._treated == true) return;

                //console.log('siSearchBox:si-searchbox-add-filter received');
                const lTypeMap = {
                    'city' : 'cities',
                    'region': 'regions'
                }
                const lDataProp = lTypeMap[$item.type];
                $timeout(function(){
                    $scope.filter.data[lDataProp].push($item.ref_number);
                    if($item.type == 'region'){
                        //$scope.filter.sublistClearFilters($item.ref_number, $scope.city_list, $scope.filter.data.cities);
                    }
                    $scope.filter.update();
                    //$scope.showResultPage();
                });
            });
            
            $scope.getItemLinkShortcut = function($type, $configs){
                let lRoute = $configs[$type + '_routes'].find(function($r){return $r.lang == siApiSettings.locale}) || 
                               $configs[$type + '_routes'][0];
                
                
                return lRoute.shortcut;
            }

            /**
            * Reset all filter to nothing
            */
            $scope.resetFilters = function(){
                $siFilters.with($scope.alias, $scope).resetFilters();

            }


            $scope.getEndpoint = function(){
                const lViewId = ($scope.configs.current_view != undefined)
                                    ? $scope.configs.current_view
                                    : $scope.configs.source.id;

                return 'view/'.concat(lViewId,'/', siApiSettings.locale + '/quick_search');
            }

            $scope.showResultPage = function(){
                window.location = $scope.result_page;
            }


        } // end controller

        
    };
}]);


siApp
.directive('siSearchFilterTags', [function siSearchFilterTags(){
    return {
        restrict: 'E',
        scope: {
            alias: '@siAlias',
        },
        template: '<div class="si-search-filter-tags"><div class="si-tag-list"><div class="si-tag-item" ng-click="doItemAction(item)" ng-repeat="item in list"><span>{{item.text}}</span> <i class="fal fa-fw fa-times"></i></div></div></div>',
        replace: true,
        link: function($scope, $element, $attrs){
            $scope.$element = $element[0];
            
            $scope.init();
        },
        controller: function($scope, $rootScope, $q, $siFilters, $siDictionary,$siSearchContext,$siList){
            // Apply search list to current Scope
            $siSearchContext.extendTo($scope);

            
            $scope.list = [];

            
            $scope.init = function(){
                $scope.isReady().then(function(){
                    $scope.$watch(
                        function(){ 
                            return $scope.filter.data;
                        }, 
                        function($new, $old){
                            $scope.updateList();
                        },
                        true
                    );
                    

                    $scope.filter.on('update').then(function(){
                        
                        $scope.updateList();
                    });

                    $scope.updateList();
                });
                
                $rootScope.$on('$siDictionary/init', function(){
                    $scope.updateList();
                });
            }

            $scope.isReady = function(){
                // check for dictionary and configs perequisits
                if($scope.dictionary!=null && $scope.configs != null){
                    return $q.resolve();
                }
                
                // build promise
                return $q(function($resolve,$reject){
                    $scope.filter = $siFilters.with($scope.alias, $scope);
                    $scope.filter.loadState();
                    $resolve();
                    // $siDictionary.onLoad().then(function(){
                    //     $siList.dictionary = $siDictionary.source;
                    //     $resolve();
                    // })
                });
            }

            $scope.reverseFilterMap = {
                'bedrooms' : function($value){
                    return {
                        text : (($value > 1) ? '{0} bedrooms' : '{0} bedroom').translate().siFormat($value),
                        remove: function(){
                            $scope.filter.data.bedrooms = null;
                            $scope.filter.update();
                        }
                    }
                },
                'bathrooms' : function($value){
                    return {
                        text: (($value > 1) ? '{0} bathrooms' : '{0} bathroom').translate().siFormat($value),
                        remove: function(){
                            $scope.filter.data.bathrooms = null;
                            $scope.filter.update();
                        }
                    }
                },
                'parkings' : function($value){
                    return {
                        text: (($value > 1) ? '{0} parkings' : '{0} parking').translate().siFormat($value),
                        remove: function(){
                            $scope.filter.data.parkings = null;
                            $scope.filter.update();
                        }
                    }
                },
                'market_type' : function($value){
                    return {
                        text: $scope.getCaptionOfFilter($value, $siSearchContext.market_types,'key').translate(),
                        remove: function(){
                            $scope.filter.data.market_type = null;
                            $scope.filter.update();
                        }
                    }
                },
                'attributes' : function($values){
                    return $values.map(function($val){
                        return {
                            text : $scope.getCaptionOfFilter($val,$scope.listing_attributes,'field').translate(),
                            remove: function(){
                                const lIndex = $scope.filter.data.attributes.indexOf($val);
                                $scope.filter.data.attributes.splice(lIndex,1);
                                $scope.filter.update();
                            }
                        }
                    })
                },
                'cities': function($values){
                    const lCities = $siList.getCityList();

                    return $values
                        .filter(function($val){
                            return $siList.contains($val,lCities);
                        })
                        .map(function($val){
                            return {
                                text: $scope.getCaptionOfFilter($val, $siList.getCityList(),'key'),
                                remove: function(){
                                    const lIndex = $scope.filter.data.cities.indexOf($val);
                                    $scope.filter.data.cities.splice(lIndex,1);
                                    $scope.filter.update();
                                }
                            }
                        })
                },
                'regions': function($values){
                    return $values.map(function($val){
                        
                        
                        return {
                            text: $scope.getCaptionOfFilter($val, $siList.getRegionList(),'key'),
                            remove:function(){
                                const lIndex = $scope.filter.data.regions.indexOf($val);
                                $scope.filter.data.regions.splice(lIndex,1);
                                $scope.filter.update();
                            }
                        }
                    })
                },
                'subcategories': function($values){
                    return $values.map(function($val){
                        
                        return {
                            text: $scope.getCaptionOfFilter($val, $siList.getSubcategoryList(),'key'),
                            remove:function(){
                                const lIndex = $scope.filter.data.subcategories.indexOf($val);
                                $scope.filter.data.subcategories.splice(lIndex,1);
                                $scope.filter.update();
                            }
                        }
                    })
                },
                'building_categories': function($values){
                    return $values.map(function($val){
                        
                        return {
                            text: $scope.getCaptionOfFilter($val, $siList.getBuildingCategoryList(),'key'),
                            remove:function(){
                                const lIndex = $scope.filter.data.building_categories.indexOf($val);
                                $scope.filter.data.building_categories.splice(lIndex,1);
                                $scope.filter.update();
                            }
                        }
                    })
                },
                'transaction_type': function($value){
                    return {
                        text: 'For {0}'.siFormat($value).translate(),
                        remove:function(){
                            $scope.filter.data.transaction_type = null;
                            $scope.filter.update();
                        }
                    }
                },
                'contract' : function($value){
                    return {
                        text: 'Online since'.translate() + ' ' + $scope.getCaptionOfFilter($value, $siSearchContext.listing_ages,'key'),
                        remove:function(){
                            $scope.filter.data.contract = null;
                            $scope.filter.update();
                        }
                    }
                },
                'states' : function($values){
                    return $values.map(function($val){
                        return {
                            text: $scope.getCaptionOfFilter($val, $siSearchContext.listing_flags,'key').translate(),
                            remove:function(){
                                const lIndex = $scope.filter.data.states.indexOf($val);
                                $scope.filter.data.states.splice(lIndex,1);
                                $scope.filter.update();
                            }
                        }
                    })
                },
                // Broker
                'letter' : function($values){
                    return $values.map(function($val){
                        return {
                            text: 'Begins with {0}'.translate().siFormat($val),
                            remove:function(){
                                $scope.filter.data.letter = null;
                                $scope.filter.update();
                            }
                        }
                    })
                },
                'office' : function($values){
                    return $values.map(function($val){
                        return {
                            text: 'Works at {0}'.translate().siFormat($val),
                            remove:function(){
                                $scope.filter.data.office = null;
                                $scope.filter.update();
                            }
                        }
                    })
                },
                'licenses' : function($values){
                    return $values.map(function($val){
                        return {
                            text: $scope.getCaptionOfFilter($val, $siSearchContext.licenses,'key').translate(),
                            remove:function(){
                                const lIndex = $scope.filter.data.licenses.indexOf($val);
                                $scope.filter.data.licenses.splice(lIndex,1);
                                $scope.filter.update();
                            }
                        }
                    })
                },
                'language' : function($values){
                    return $values.map(function($val){
                        return {
                            text: 'Speaks {0}'.translate().siFormat($val),
                            remove:function(){
                                $scope.filter.data.language = null;
                                $scope.filter.update();
                            }
                        }
                    })
                },
            }

            $scope.getCaptionOfFilter = function($filter, $list, $valueAccessor){
                const lList = Object.keys($list).map(function($k){
                    return angular.merge({key: $k}, $list[$k]);
                });

                const lItem = lList.find(function($item){
                    switch(typeof($valueAccessor)){
                        case "string": 
                            return $filter == $item[$valueAccessor];
                            break;
                        case "function":
                            return $filter == $valueAccessor($item);
                            break;
                        default:
                            return $filter == $item.value;
                    }
                });

                if(lItem == null) return $filter;
                return lItem.caption || lItem.label;
            }

            $scope.updateList = function(){
                //lList = [{text: 'allo'}];
                const lList = [];
                const lFilters = $scope.filter.data;

                Object.keys(lFilters).forEach(function($k){
                    if(isNullOrEmpty(lFilters[$k])) return;

                    if(['min_price','max_price'].includes($k)) {
                        if(lFilters[$k] == 0) return;
                        const lMinPrice = ($scope.filter.data.min_price == 0) ? 'Min' : $scope.filter.data.min_price.formatPrice();
                        const lMaxPrice = ($scope.filter.data.max_price == null) ? 'Unlimited' : $scope.filter.data.max_price.formatPrice();
                        const lPriceItem = lList.find(function($e){ return $e.key == 'price'});

                        lTextFormat = '{0} - {1}'.siFormat(lMinPrice,lMaxPrice);
                        if(lPriceItem != null){
                            lPriceItem.text = lTextFormat;
                        }
                        else{
                            
                            lList.push({
                                key: 'price',
                                text: lTextFormat,
                                remove:function(){
                                    $scope.filter.data.min_price = 0;
                                    $scope.filter.data.max_price = null;
                                    $scope.filter.update();
                                }
                            });

                        }
                        return;
                    }

                    if(['land_min','land_max'].includes($k)) {
                        $scope.addRangeItem(['land_min','land_max'], lList, {
                                srcList: $siSearchContext.land_areas,
                                textFormat: 'Land of {0} - {1}'
                            });
                        return;
                    }

                    if(['available_min','available_max'].includes($k)) {
                        $scope.addRangeItem(['available_min','available_max'], lList, {
                                srcList: $siSearchContext.available_areas,
                                textFormat: 'Available area of {0} - {1}'
                            });
                        return;
                    }

                    if($scope.reverseFilterMap[$k] != undefined){
                        const lItems = $scope.reverseFilterMap[$k](lFilters[$k]);
                        if(Array.isArray(lItems)){
                            lItems.forEach(function($e){
                                lList.push($e);
                            })
                        }
                        else{
                            lList.push(lItems);
                        }
                    }
                    
                });
                $scope.list = lList;
            }

            $scope.addRangeItem = function($keys, $targetList, $options){
                $options = angular.merge({
                        srcList: [], 
                        listKey: 'value', 
                        textFormat: '{0} - {1}',
                        min: 'Min',
                        max: 'Max'
                    },
                    $options);

                const lKeyMin = $keys[0];
                const lKeyMax = $keys[1];
                const lListKey = $keys.join('-');

                const lMin = (isNullOrEmpty($scope.filter.data[lKeyMin])) ? $options.min : $scope.getCaptionOfFilter($scope.filter.data[lKeyMin], $options.srcList,$options.listKey);
                const lMax = (isNullOrEmpty($scope.filter.data[lKeyMax])) ? $options.max : $scope.getCaptionOfFilter($scope.filter.data[lKeyMax], $options.srcList,$options.listKey);
                const lItem = $targetList.find(function($e){ return $e.key == lListKey});

                lTextFormat = $options.textFormat.translate().siFormat(lMin,lMax);

                if(lItem != null){
                    lItem.text = lTextFormat;
                }
                else{
                    $targetList.push({
                        key: lListKey,
                        text: lTextFormat,
                        remove:function(){
                            $scope.filter.data[lKeyMin] = null;
                            $scope.filter.data[lKeyMax] = null;
                            $scope.filter.update();
                        }
                    });
                }
            }

            $scope.doItemAction = function($item){
                if(typeof $item.remove == 'function'){
                    $item.remove();
                }
            }
        }
    }
}]);



siApp
.directive('siGeoFilter',[
function siGeoFilter(){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: siCtx.base_path + 'views/ang-templates/si-geo-filter.html',
        scope: {
            alias: '@siAlias'
        },
        link: function($scope,$element,$attrs){
            $scope.$element = $element[0];
            $scope.init();
        },
        controller: function($scope,$rootScope, $siFilters){
            $scope.is_available = navigator.geolocation!=undefined && window.location.protocol=='https:';
            $scope.radiusList = [
                {value: 5000, label: '5 km'},
                {value: 10000, label: '10 km'},
                {value: 20000, label: '20 km'},
                {value: 40000, label: '40 km'},
                {value: 80000, label: '80 km'},
            ];

            $scope.init = function(){
                
                $siFilters.with($scope.alias, $scope, function($filter){
                    
                    $scope.filter = $filter;
                });
               
            }

            $scope.isActive = function(){
                if($scope.filter == undefined) return false;
                return $scope.filter.data.location!=null;
            }
            $scope.getDistanceLabel = function(){
                if($scope.filter == undefined) return '';
                if($scope.filter.data.location == null) return '';

                return $scope.radiusList
                        .find(function($r){ return $r.value == $scope.filter.data.location.distance})
                        .label;
            }


            $scope.toggleGeoFilter = function(){
                $scope.filter.addGeoFilter();
            }


            $scope.changeRadius = function($radius){
                $scope.filter.data.location.distance = $radius;
                $scope.filter.update();
            }
        }
    }
}])
