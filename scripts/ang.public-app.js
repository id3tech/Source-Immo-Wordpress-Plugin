var ImmoDbApp = angular.module('ImmoDb', ['ngSanitize']);

ImmoDbApp
.controller('publicCtrl', function($scope,$rootScope,$immodbApi, $immodbDictionary){
    $scope.model = null;

    $scope.init = function($ref_type, $ref_number){
        
    }

    
    $scope.getCaption = function($key, $domain, $asAbbr){
        return $immodbDictionary.getCaption($key, $domain, $asAbbr);
    }

    $rootScope.formatPrice = function($item){
        let lResult = [];
        console.log('$item.status', $item.status);
        if($item.status=='SOLD'){
            if($item.price.sell != undefined){
                lResult.push('Sold'.translate());
            }
            else{
                lResult.push('Leased'.translate());
            }
            return lResult.join('');
        }
        for(let $key in $item.price){
            if(['sell','lease'].indexOf($key) >=0 ){
                let lPart = [$item.price[$key].amount.formatPrice()];
                if($item.price[$key].taxable){
                    lPart[0] += '+tx';
                }

                if($item.price[$key].unit){
                    lPart.push($scope.getCaption($item.price[$key].unit,'price_unit',true))
                }

                lResult.push(lPart.join('/'));
            }
        }
        
        let lSeperator = ' or '.translate();

        return lResult.join(lSeperator);
    }

    $scope.scrollTo = function($target){
        let opt = {
            "duration": 250,
            "easing": 'swing'
          };
        let position = angular.element($target).offset().top;
        angular.element("html, body").animate({
            "scrollTop": position
          }, opt);


    }

});


ImmoDbApp
.controller('singleListingCtrl', function($scope,$q,$immodbApi, $immodbDictionary){
    $scope.model = null;
    $scope.sections = {
        addendum : {opened:true},
        building : {opened:false},
        lot : {opened:false},
        other: {opened: false},
        in_exclusions:{opened:false}
    }
    $scope.selected_media = 'pictures';
    $scope.calculator_result = {};
    $scope.message_model = {};

    $scope.init = function($ref_type, $ref_number){
        if($ref_number != undefined){
            console.log($ref_type, $ref_number)
            //$scope['load' + $ref_type + 'Data']
            $scope.loadSingleData($ref_type, $ref_number);
        }
    }

    $scope.loadSingleData = function($ref_type, $ref_number){
        $immodbApi.getDefaultDataView().then(function($viewId){

            $immodbApi.api("{0}/view/{1}/{2}/items/ref_number/{3}".format($scope.toSingleRefType($ref_type),$viewId,immodbApiSettings.locale,$ref_number)).then(function($data){
                $scope.model = $data;
                $immodbDictionary.source = $data.dictionary;

                $scope.preprocess();
                $scope.message_model.subject = 'Request information for : {0} ({1})'.translate().format($scope.fullAddress($scope.model),$scope.model.ref_number);
                console.log($scope.model);
            });
        });
    }

    $scope.preprocess = function(){
        // set basic information from dictionary
        $scope.model.location.city      = $scope.getCaption($scope.model.location.city_code, 'city');
        $scope.model.location.region    = $scope.getCaption($scope.model.location.region_code, 'region');
        $scope.model.location.country   = $scope.getCaption($scope.model.location.country_code, 'country');
        $scope.model.location.state     = $scope.getCaption($scope.model.location.state_code, 'state');
        $scope.model.category           = $scope.getCaption($scope.model.category, 'listing_category');
        $scope.model.subcategory        = $scope.getCaption($scope.model.subcategory, 'listing_subcategory');
        $scope.model.addendum           = $scope.model.addendum.trim();

        $scope.model.building.attributes = [];
        $scope.model.lot = {attributes : []};
        $scope.model.other = {attributes : []};
        $scope.model.important_flags = [];

        // from main unit
        let lMainUnit = $scope.model.units.find(function($u){return $u.category=='MAIN'});
        if(lMainUnit!=null){
            if(lMainUnit.bedroom_count) $scope.model.important_flags.push({icon: 'bed', value: lMainUnit.bedroom_count, caption:'Bedroom'.translate()});
            if(lMainUnit.bathroom_count) $scope.model.important_flags.push({icon: 'bath', value: lMainUnit.bathroom_count, caption: 'Bathroom'.translate()});
            if(lMainUnit.waterroom_count) $scope.model.important_flags.push({icon: 'hand-holding-water', value: lMainUnit.waterroom_count, caption: 'Water room'.translate()});
        }

        // from attributes
        $scope.model.attributes.forEach(function($e){
            $e.caption = $scope.getCaption($e.code, 'attribute');
            $e.values.forEach(function($v){
                $v.caption = $scope.getCaption($v.code,'attribute_value');
                if($v.count){
                    $v.caption = $v.caption.concat(' ({0})'.format($v.count));
                }
                if($v.details){
                    $v.caption = $v.details;
                }
            });

            // append to rightful domains
            // Building
            if(['CUPBOARD','WINDOWS',
                'WINDOW TYPE','ROOFING','FOUNDATION',
                'GARAGE','SIDING','BATHR./WASHR','BASEMENT'].includes($e.code)){
                $scope.model.building.attributes.push($e);
            }
            // Lot
            else if(['LANDSCAPING','DRIVEWAY','PARKING','POOL',
                     'TOPOGRAPHY','VIEW','ZONING','PROXIMITY'].includes($e.code)){
                $scope.model.lot.attributes.push($e);
            }
            // other
            else if(['HEATING SYSTEM','HEATING ENERGY','HEART STOVE','WATER SUPPLY','SEWAGE SYST.','EQUIP. AVAIL'].includes($e.code)){
                $scope.model.other.attributes.push($e);
            }

            if($e.code=='PARKING'){
                let lParkingCount = 0;
                $e.values.forEach(function($v){lParkingCount += $v.count;});
                if(lParkingCount > 0) $scope.model.important_flags.push({icon: 'car', value: lParkingCount, caption: $e.caption});
            }
            if($e.code=='POOL'){
                $scope.model.important_flags.push({icon: 'swimmer', value: 0, caption: $e.caption});
            }
            if($e.code=='HEART STOVE'){
                $scope.model.important_flags.push({icon: 'fire', value: 0, caption: $e.caption});
            }
        });

        
    }

    $scope.sectionOpened = function($section){
        return $scope.sections[$section].opened;
    }
    $scope.toggleSection = function($section){
        $scope.sections[$section].opened = !$scope.sections[$section].opened;
    }

    $scope.toSingleRefType = function($ref_type){
        switch($ref_type){
            case 'cities':
                return 'city';
                break;    
        }

        return $ref_type.substring(0,$ref_type.length-1);
    }


    $scope.fullAddress = function($item){
        if($item==null) return '';
        let lResult = '{0} {1}, {2}'.format(
                            $item.location.address.street_number,
                            $item.location.address.street_name,
                            $immodbDictionary.getCaption($item.location.city_code,'city')
                        );
        return lResult;
    }  
    
    $scope.longPrice = function($item){
        if($item==null) return '';

        let lResult = [];
        if($item.status == "SOLD"){
            $lStatus = {
                sell : 'Sold',
                lease : 'Leased'
            }
            for(let $key in $item.price){
                if(['sell','lease'].indexOf($key) >=0 ){
                    lResult.push($lStatus[$key].translate());
                }
            }
        }
        else{    
            for(let $key in $item.price){
                if(['sell','lease'].indexOf($key) >=0 ){
                    let lPart = [$item.price[$key].amount.formatPrice()];
                    if($item.price[$key].taxable){
                        lPart[0] += '+tx';
                    }

                    if($item.price[$key].unit){
                        lPart.push($scope.getCaption($item.price[$key].unit,'price_unit',true))
                    }
                    let lStart = 'for {0} for '.format($key).translate();
                    lResult.push(lStart + lPart.join('/'));
                }
            }    
        }

        return lResult.join(' or '.translate());
    }

    $scope.mortgageChange = function($calculatorResult){
        console.log('Mortage calculation changed', $calculatorResult);
        $scope.calculator_result = $calculatorResult;
    }

    $scope.sendMessage = function(){
        console.log('message data:', $scope.message_model);
    }
});


/* ------------------------------- 
        DIRECTIVES
-------------------------------- */

ImmoDbApp
.directive('immodbList', function(){
    let dir_controller = function ($scope, $q,$immodbApi,$rootScope) {
        $scope.configs = null;
        $scope.list = [];
        $scope.page = 1;
        $scope.meta = null;
        $scope.dictionary = {};
        $scope.auth_token = null;
        $scope.is_ready = false;
        //$scope.client = ClientClass($scope);
        $scope.page_index = 0;
        $scope.is_loading_data = false;
        $scope.client = {
            search_token : null
        }

        $scope.$watch("alias", function(){
            if($scope.alias){
                $scope.init();
            }
        });


        /**
         * Initialize the controller
         */
        $scope.init = function(){
            console.log('initializing list for ' + $scope.alias);
            
            $immodbApi.getListConfigs($scope.alias).then(function($configs){
                $scope.configs = $configs;
                $immodbApi.renewToken().then(function(){
                    if($scope.configs.source=='default'){
                        $scope.configs.source = $immodbApi.auth_token.view_ids[0];
                    }
                    $scope.start();
                });
            });
        
            $rootScope.$on($scope.alias + 'FilterTokenChanged', $scope.onFilterTokenChanged);
        }

        /**
         * Start the loading process
         */
        $scope.start = function(){
            console.log('starting list with ', $scope.configs);
            $immodbApi.getViewMeta($scope.configs.type,$scope.configs.source).then(function($response){
                $scope.dictionary = $response.dictionary;
                console.log($scope.dictionary);
                $scope.is_ready = true;
                $scope.getList();
            });
        }

        /**
         * Main entry function to get the list
         * Will update the searchToken if required by client overrides
         */
        $scope.getList = function(){
            $scope.search($scope.getSearchToken());
        }

        /**
         * Get the search token
         * Request a new one if client has input some filters or sort of his own
         */
        $scope.getSearchToken = function(){
            if($scope.client.search_token != null){
                return $scope.client.search_token;
            }
            return $scope.configs.search_token;
        }

        $scope.onFilterTokenChanged = function($event, $newToken){
            $scope.client.search_token = $newToken;
            $scope.isReady().then(function(){
                $scope.getList();
            })
        }

        $scope.isReady = function(){
            return $q(function($resolve, $reject){
                if($scope.is_ready){
                    $resolve();
                }
                else{
                    let lIntervalHnd = null;
                    lIntervalHnd = window.setInterval(function(){
                        if($scope.is_ready){
                            window.clearInterval(lIntervalHnd);
                            $resolve();
                        }
                    },500);
                }
            });
        }


        /**
         * Call the API and return the list 
         * @param {string} $token Search token
         */
        $scope.search = function($token){
            lParams = {'st': $token};
            $scope.page_index = 0;
            $scope.is_loading_data = true;
            $immodbApi.api($scope.getEndpoint() + '/items', lParams,{method:'GET'}).then(function($response){
                $scope.list = $response[$scope.configs.type];
                $scope.listMeta = $response.metadata;

                console.log($scope.list);
                $scope.is_loading_data = false;
            })
            
        }

        $scope.checkNextPage = function(){
            if($scope.page_index<2 && $scope.listMeta.next_token){
                $scope.showNextPage();
            }
        }

        /**
         * Load next page datas and append it to the list
         */
        $scope.showNextPage = function(){
            lParams = {
                'st': $scope.listMeta.search_token,
                'nt': $scope.listMeta.next_token
            };
            if(!$scope.is_loading_data){
                $scope.is_loading_data = true;
                console.log('loading page', $scope.page_index + 1);
                $immodbApi.api($scope.getEndpoint() + '/items', lParams,{method:'GET'}).then(function($response){
                    $scope.list = $scope.list.concat($response[$scope.configs.type]);
                    $scope.listMeta = $response.metadata;
                    $scope.page_index++;
                    $scope.is_loading_data = false;

                    console.log($scope.listMeta);
                });
            }
            
        }


        /**
         * Get the api endpoint matching the config type
         */
        $scope.getEndpoint = function(){
            let lOrigin = $scope.configs.type;
            switch(lOrigin){
                case 'listings':
                    lOrigin = 'listing';break;
                case 'brokers':
                    lOrigin = 'broker';break;
                case 'cities':
                    lOrigin = 'city';break;
            }
            return lOrigin.concat('/view/',$scope.configs.source,'/',immodbApiSettings.locale);
        }


        //
        // UTILITY FUNCTIONS
        //


        $scope.getFieldValue = function($item, $field){
            let lResult = undefined;
            try{
                eval('lResult = $item.' + $field);
            }
            catch($e){}

            return lResult;
        }

        /**
         * Just a reminder of things to do
         */
        $scope.todo = function(){
            alert('TODO');
        }

        /**
         * Change list order by price
         * @param {bool} $more_to_least From 
         */
        $scope.sortByPrice = function($more_to_least){
            let lNewSortFields = {field: 'price.sell.amount', desc: $more_to_least};
            $rootScope.$broadcast($scope.alias + 'SortDataChanged', lNewSortFields);
        }

        /**
         * Change list order by price
         * @param {bool} $more_to_least From 
         */
        $scope.sortByDate = function($more_to_least){
            let lNewSortFields = {field: 'contract.start_date', desc: $more_to_least};
            $rootScope.$broadcast($scope.alias + 'SortDataChanged', lNewSortFields);
        }


        /**
         * Get the caption matching key and domain from the dictionary
         * @param {string} $key Key code of the dictionary item
         * @param {string} $domain Group key that (should) hold the item
         * @return {string} Caption matched or the key in case the something's missing or went wrong
         */
        $scope.getCaption = function($key, $domain, $asAbbr){
            let lResult = $key;
            $asAbbr = ($asAbbr==undefined)?false:$asAbbr;

            if($scope.dictionary && $scope.dictionary[$domain]){
                if($scope.dictionary[$domain][$key] != undefined){
                    if($asAbbr){
                        lResult = $scope.dictionary[$domain][$key].abbr;
                    }
                    else{
                        lResult = $scope.dictionary[$domain][$key].caption;
                    }
                }
            }
            return lResult;
        }

        $scope.formatPrice = function($item){
            return $rootScope.formatPrice($item);
        }

        $scope.getClassList = function($item){
            let lResult = [];
            
            if($item.status=='SOLD'){
                lResult.push('sold');
            }

            return lResult.join(' ');
        }

        $scope.getCity = function($item, $sanitize){
            $sanitize = ($sanitize==undefined)?true:$sanitize;
            let lResult = $scope.getCaption($item.location.city_code, 'city');

            if($sanitize){
                lResult = $scope.sanitize(lResult);
            }

            return lResult;
        }

        $scope.getRegion = function($item, $sanitize){
            $sanitize = ($sanitize==undefined)?true:$sanitize;
            let lResult =  $scope.getCaption($item.location.region_code, 'region');

            if($sanitize){
                lResult = $scope.sanitize(lResult);
            }
            
            return lResult;
        }

        $scope.getTransaction = function($item, $sanitize){
            $sanitize = ($sanitize==undefined)?false:$sanitize;

            for(var $key in $item.price){
                return $key;
            }
        }


        $scope.sanitize = function($value){
            if(!$value) return '-';

            let lResult = $value.toLowerCase();
            lResult = lResult.replace(/(\s|\+)/gm, '-');
            lResult = lResult.replace(/('|"|\(|\))/gm, '');
            lResult = lResult.replace(/(é|è|ë|ê)/gm, 'e');
            lResult = lResult.replace(/(à|â|ä)/gm, 'a');
            lResult = lResult.replace(/(ì|î|ï)/gm, 'i');
            lResult = lResult.replace(/(ù|û|ü)/gm, 'u');
            return lResult;
        }
    };
    
    return {
        restrict: 'E',
        scope: {
            alias: '@immodbAlias',
            class: '@immodbClass'
        },
        controllerAs: 'ctrl',
        template: '<div ng-include="\'immodb-template-for-\' + alias" class="{{class}}"></div>',
        controller: dir_controller
    };
});


/**
 * DIRECTIVE: SEARCH
 * usage: <immodb-search></immodb-search>
 * @param {string} immodbAlias List alias name. Required
 * @param {string} class CSS class to add to template
 * @param {object} immodbConfigs List Config object. When omitted, will load it from alias name
 * @param {object} immodbDictionary Dictionary object. When omitted, will load it from alias name
 * @param {string} immodbResultUrl Url to display the search result. When configured, will display a button to trigger to search
 */
ImmoDbApp
.directive('immodbSearch', function(){
    let dir_controller = 
    function($scope, $q, $immodbApi, $rootScope){
        $scope.sort_fields = [];
        $scope.keyword = '';
        $scope.minPriceSuggestions = [];
        $scope.maxPriceSuggestions = [];
        $scope.bedroomSuggestions = [];
        $scope.filterHints = [];
        $scope.suggestions = [];
        $scope.query_text = null;

        $scope.data = {
            keyword : '',
            min_price: null,
            max_price: null
        }

        $scope.filter_group = {
            operator: 'and',
            filters: null,
            filter_groups: null
        }

        $scope.listing_states = {
            sell : {
                caption: 'To sell'.translate(), 
                filter : {field: 'price.sell.amount', operator: 'greater_than', value: 0}
            },
            lease : {
                caption: 'To lease'.translate(),
                filter : {field: 'price.lease.amount', operator: 'greater_than', value: 0}
            },
            open_house : {
                caption: 'Open house'.translate(),
                filter : {field: 'price.sell.amount', operator: 'greater_than', value: 0}
            },
            forclosure : {
                caption: 'Foreclosure'.translate(),
                filter : {field: 'price.foreclosure', operator: 'equal', value: true}
            }
        }

        /**
         * Directive initialization
         */
        $scope.init = function(){
            // bind events
            $rootScope.$on($scope.alias + 'SortDataChanged', $scope.onSortDataChanged);

            // prebuild suggestions
            $scope.buildDropdownSuggestions();
            $scope.loadState();
            let lStoredSearchToken = $scope.loadState('st');
            if(lStoredSearchToken){
                $rootScope.$broadcast($scope.alias + 'FilterTokenChanged', lStoredSearchToken);
            }
            
            $scope.late_init().then(function(){
                if($scope.hasFilters()){
                    $scope.buildHints();
                }
            });
        }

        $scope.late_init = function(){
            let lPromise = $q(function($resolve,$reject){
                // start a timer for late initialization
                window.setTimeout(function(){
                    if($scope.dictionary==null){
                        $scope.getConfigs().then(function($configs){
                            console.log('getting view metas');
                            $immodbApi.getViewMeta($configs.type,$configs.source).then(function($response){
                                $scope.dictionary = $response.dictionary;
                                $resolve();
                            });
                        });
                    }
                    else{
                        $resolve();
                    }
                }, 1000);
            });
            return lPromise;
        }

        //// HELPERS 

        /**
         * Build dropdowns suggestions
         */
        $scope.buildDropdownSuggestions = function(){
            // Prices
            $scope.updatePriceSuggestions();

            // Bedrooms
            for(let i=1; i<6; i++){
                $scope.bedroomSuggestions.push({value:i, label: '{0}+ bedrooms'.translate().format(i)})
            }
        }

        /**
         * Build suggestions from user typed keywords
         * @param {*} $event 
         */
        $scope.buildSuggestions = function($event){
            
            let lResult = [];
            if($scope.trapKeyCode($event.keyCode)) return false;

            if($scope.data.keyword !=''){
                if(!isNaN($scope.data.keyword)){
                    let lValue = Number($scope.data.keyword);
                    let lPriceMedian = lValue * 2;
                    let lPriceMin = Math.max(0, lValue/2);
                    let lPriceMax = Math.min(1000000, lValue * 2);

                    console.log('suggestions for ', lValue, $scope.data.keyword);
                    lResult = [
                        {selected:true, label : 'ID is "{0}"'.translate().format(lValue), action: function(){$scope.addFilter('ref_number','equal_to',lValue,'ID is "{0}"'.translate().format(lValue) )}},
                        {label : 'Price is between {0}$ and {1}$'.translate().format(lPriceMin, lPriceMax), action: function(){
                                $scope.setMinPrice(lPriceMin);
                                $scope.setMaxPrice(lPriceMax);
                            }},
                        {label : 'Price is more than {0}$'.translate().format(lValue), action: function(){$scope.setMinPrice(lValue);}},
                        {label : 'Price is less than {0}$'.translate().format(lValue), action: function(){$scope.setMaxPrice(lValue);}},
                        
                        {label : 'Has "{0}" as civic address'.translate().format(lValue), action: function(){$scope.addFilter('location.address.street_number','equal_to',lValue, 'Has "{0}" as civic address'.translate().format(lValue))}}
                    ];
                }
                else{
                    let lValue = $scope.data.keyword.toLowerCase();
                    lResult = [
                        {selected:true, label : 'Contains "{0}"'.translate().format(lValue), action : function(){ $scope.query_text = lValue; $scope.buildFilters(); $scope.buildHints(); } }
                    ];
                    for($key in $scope.dictionary.listing_category){
                        let lElm = $scope.dictionary.listing_category[$key];
                        if(lElm.caption.toLowerCase().indexOf(lValue)>=0){
                            lResult.push({label: lElm.caption + ' (category)', action: function(){ lElm.selected=true;  $scope.addFilter('category','in',$scope.getSelection($scope.dictionary.listing_category));} }) 
                        }
                    }
                    for($key in $scope.dictionary.listing_subcategory){
                        let lElm = $scope.dictionary.listing_subcategory[$key];
                        if(lElm.caption.toLowerCase().indexOf(lValue)>=0){
                            lResult.push({label: lElm.caption + ' (subcategory)', action: function(){ lElm.selected=true;  $scope.addFilter('subcategory','in',$scope.getSelection($scope.dictionary.listing_subcategory));} }) 
                        }
                    }
                    for($key in $scope.dictionary.city){
                        let lElm = $scope.dictionary.city[$key];
                        if(lElm.caption.toLowerCase().indexOf(lValue)>=0){
                            lResult.push({label: lElm.caption + ' (city)', action: function(){ lElm.selected=true;  $scope.addFilter('location.city_code','in',$scope.getSelection($scope.dictionary.city));} }) 
                        }
                    }
                    for($key in $scope.dictionary.region){
                        let lElm = $scope.dictionary.region[$key];
                        if(lElm.caption.toLowerCase().indexOf(lValue)>=0){
                            lResult.push({label: lElm.caption + ' (region)', action: function(){ lElm.selected=true;  $scope.addFilter('location.region_code','in',$scope.getSelection($scope.dictionary.region));} }) 
                        }
                    }
                }
            }
            $scope.suggestions = lResult;

        }

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
                        console.log($i, $e.selected)
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

        /**
         * Update price suggestions shortcut. Update both min and max
         */
        $scope.updatePriceSuggestions = function(){
            $scope.minPriceSuggestions = $scope.getPriceSuggestions('min');
            $scope.maxPriceSuggestions = $scope.getPriceSuggestions('max');
        }

        /**
         * Build a price suggestions list
         * @param {string} $minOrMax Which suggestion list to build. Possible values : 'min' or 'max'
         */
        $scope.getPriceSuggestions = function($minOrMax){
            let lResult = [];
            let lMinPrice = $scope.min_price || 1000;
            let lMaxPrice = $scope.max_price || 500000;
            let lStartAt = 1000;
            let lEndsAt = Math.min(50000, lMaxPrice-50000);
            
            if($minOrMax=='max'){
                lStartAt = Math.max(lMinPrice+50000,lMaxPrice-200000);
                lEndsAt = lStartAt + 500000;
            }
            let lStep = (lEndsAt-lStartAt)/10;

            if($minOrMax=='min'){
                lResult.push({value:'', label: 'Min'});
            }

            for(let $i=lStartAt;$i<=lEndsAt;$i+=lStep){
                lResult.push({value: $i, label: $i});
            }
            
            if($minOrMax=='max'){
                lResult.push({value:'', label: 'Max'});
            }
            

            return lResult;
        }

        

        $scope.setMinPrice = function($value, $event){
            if($value == ''){
                $scope.data.min_price = undefined;
            }
            else{
                $scope.data.min_price = $value;
            }

            if($event){
                $event.stopPropagation();
            }
        }

        $scope.setMaxPrice = function($value, $event){
            if($value == ''){
                $scope.data.max_price = undefined;
            }
            else{
                $scope.data.max_price = $value;
            }

            if($event){
                $event.stopPropagation();
            }
        }

        $scope.setBedroomCount = function($item){
            $scope.bedroomSuggestions.forEach(function($e){
                $e.selected = false;
            });
            $item.selected = true;
            $scope.addFilter('main_unit.bedroom_count','greater_or_equal_to',$item.value, '{0}+ bedrooms'.translate().format($item.value));
        }

        $scope.setState = function($item){
            let lValue = $item.filter.value;
            if($item.selected!=true){
                lValue = '';
            }
            $scope.addFilter($item.filter.field, $item.filter.operator, lValue, $item.caption);
        }

        /**
         * Build a list of hints based on the filter group given as parameter
         */
        $scope.buildHints = function(){
            let lResult = [];
            lResult = $scope.buildFilterHints($scope.filter_group);
            
            // prices
            if($scope.data.min_price != undefined || $scope.data.max_price != undefined){
                let lPriceHint = ['Min','Max'];
                if($scope.data.min_price!=undefined){
                    lPriceHint[0] = $scope.data.min_price.formatPrice();
                }

                if($scope.data.max_price!=undefined){
                    lPriceHint[1] = $scope.data.max_price.formatPrice();
                }

                lResult.push({item : 'PRICE', label: lPriceHint.join(' - ')});
            }

            if($scope.query_text!=null){
                lResult.push({item: "QUERY_TEXT", label: 'Contains "{0}"'.translate().format($scope.query_text)});
            }

            console.log('hints', lResult);

            $scope.filterHints = lResult;
        }

        /**
         * Build a list of hints based on the filter group given as parameter
         * @param {filterGroup} $group 
         */
        $scope.buildFilterHints = function($group){
            let lResult = [];
            let lListSync = {
                "category" : "listing_category",
                "subcategory" : "listing_subcategory",
                "location.city_code" : "city",
                "location.region_code" : "region"
            }
            // filters that as a label
            if($group.filters != null){
                $group.filters.forEach(function($e){
                    if(lListSync[$e.field] != undefined){
                        let lDictionaryKey = lListSync[$e.field];
                        lResult = lResult.concat($scope.buildFilterHintListSync($e, $scope.dictionary[lDictionaryKey]));
                    }
                    else if($e.label){
                        lResult.push({item:$e, label: $e.label});
                    }
                })
            }

            if($group.filter_groups != null){
                $group.filter_groups.forEach(function($g){
                    let lSubGroups = $scope.buildFilterHints($g);
                    console.log('subgroup result', lSubGroups);
                    lResult.concat(lSubGroups);
                });
            }
            
            return lResult;
        }

        $scope.buildFilterHintListSync = function($filter, $list){
            
            let lResult = [];
            for($key in $list){
                if($filter.value.indexOf($key)>=0){
                    if(!$list[$key].selected) $list[$key].selected=true;
                    lResult.push({item:$key, label: $list[$key].caption});
                }
            };
            console.log('hint sync', $filter, $list, lResult);
            return lResult;
        }


        /**
         * Check wether there's filters or not
         */
        $scope.hasFilters = function(){
            return $scope.filter_group.filter_groups != null || $scope.filter_group.filters != null || $scope.query_text!=null;
        }


        //// FILTER MANAGEMENT

        $scope.getFilterByFieldName = function($fieldname){
            let lResult = null;
            if($scope.filter_group.filters != null){
                $scope.filter_group.filters.every(function($e){
                    if($e.field == $fieldname){
                        lResult = $e;
                        return false;
                    }
                    return true;
                });
            }

            return lResult;
            
        }

        $scope.resetFilters = function(){
            $scope.filter_group = {
                operator: 'and',
                filters: null,
                filter_groups: null
            };
            $scope.query_text = null;
            $scope.data.min_price = null;
            $scope.data.max_price = null;

            for(let $key in $scope.dictionary){
                $scope.resetListSelections($scope.dictionary[$key]);
            }
            $scope.resetListSelections($scope.transaction_types);



            // save filters to localStorage
            $scope.saveState();

            $scope.buildHints();
            $scope.buildFilters();
        }

        $scope.resetListSelections = function($list){
            for(let $subkey in $list){
                delete $list[$subkey].selected;
            }
        }

        $scope.addFilter = function($field,$operator,$value, $label){
            console.log('filter added',$field,$operator,$value, $label );
            
            if(typeof($field.push)=='function'){
                console.log('adding filter group')
                $scope.addFilterGroup($field, $operator, $value, $label);
            }
            else{
                console.log('adding single filter')
                $scope.setFilter($field, $operator, $value, $scope.filter_group, $label);
            }

            // save filters to localStorage
            $scope.saveState();

            $scope.buildHints();
            $scope.buildFilters();
        }

        $scope.addFilterGroup = function($field,$operator,$value, $label){
            let lGroupName = $field.join('-') + '-' + $operator;
            let parentFilterGroup = $scope.getFieldGroup(lGroupName,$scope.filter_group);
            if(parentFilterGroup==null){
                parentFilterGroup = {
                    operator: 'or',
                    name: lGroupName,
                    filters: null,
                    filter_groups: null
                };
                if($scope.filter_group.filter_groups==null) $scope.filter_group.filter_groups = [];
                $scope.filter_group.filter_groups.push(parentFilterGroup);
            }
            
            $field.forEach(function($f){
                $scope.setFilter($f,$operator,$value,parentFilterGroup, $label);
            });

            if(parentFilterGroup.filters==null){
                $scope.filter_group.filter_groups.every(function($g,$i){
                    if($g.name==parentFilterGroup.name){
                        $scope.filter_group.filter_groups.splice($i,1);
                        return false;
                    }
                })    
            }
            if($scope.filter_group.filter_groups.length==0){
                $scope.filter_group.filter_groups = null;
            }
        };

        $scope.setFilter = function($field, $operator, $value, $group,$label){
            if($group.filters == null){
                $group.filters = [];
            }
            
            let lFilterIndex = 0;
            let lNewFilter = {
                field: $field,
                operator: $operator,
                value: $value,
                label: $label
            };

            for(lFilterIndex = 0; lFilterIndex < $group.filters.length; lFilterIndex++){
                if($group.filters[lFilterIndex].field == $field){
                    break;
                }
            }
            console.log('setFilter', $value ,$value==='',$value==null,(typeof($value.push)=='function' && $value.length == 0))
            if($value==='' || $value==null || (typeof($value.push)=='function' && $value.length == 0)){
                $scope.removeFilter(lFilterIndex, $group);
            }
            else{
                $scope.updateFilter(lNewFilter, lFilterIndex, $group);
            }
            
        }

        $scope.updateFilter = function($filter,$index, $group){
            console.log('update filter', $filter );
            $group.filters[$index] = $filter;
        }

        $scope.removeFilter = function($index, $group){
            console.log('remove filter', $index );
            $group.filters.splice($index,1);
            if($group.filters.length == 0){
                $group.filters=null;
            }
        }

        $scope.saveState = function($item_key, $data){
            
            let lKey = 'immodb.' + $scope.alias + '.{0}';

            if($item_key == undefined){
                sessionStorage.setItem(lKey.format('filter_group'), JSON.stringify($scope.filter_group));
                sessionStorage.setItem(lKey.format('data'), JSON.stringify($scope.data));
            }
            else{
                let lValue = $data;
                if(typeof(lValue) == 'object'){
                    lValue = JSON.stringify(lValue);
                }
                sessionStorage.setItem(lKey.format($item_key), JSON.stringify(lValue));
            }
            

        }
        $scope.loadState = function($item_key){
            $key = 'immodb.' + $scope.alias + '.{0}';
            if($item_key == undefined){
                let lSessionFilterGroup = sessionStorage.getItem($key.format('filter_group'));
                let lSessionData = sessionStorage.getItem($key.format('data'));
                if(lSessionFilterGroup != null){
                    $scope.filter_group = JSON.parse(lSessionFilterGroup);
                }
                if(lSessionData != null){
                    $scope.data = JSON.parse(lSessionData);
                }
                
            }
            else{
                return JSON.parse(sessionStorage.getItem($key.format($item_key)));
            }
        }

        $scope.getFieldGroup = function($groupName, $parent){
            if($parent.name==$groupName){
                return $parent;
            }
            else{
                if($parent.filter_groups!=null){
                    let lResult = null;
                    $parent.filter_groups.every(function($g){
                        lResult = $scope.getFieldGroup($groupName, $g);
                        return lResult==null;
                    });
                    return lResult;
                }
            }

            return null;
        }

        //// FILTERS BUILDING

        /**
         * Build the object to send as search parameters
         */
        $scope.buildFilters = function(){
            let lResult = null;
            let lPromise = $q(function($resolve, $reject){
                $scope.getConfigs().then(function($configs){
                    if($configs.limit>0){
                        lResult = {
                            max_item_count : $configs.limit
                        }
                    }
        
                    if($configs.filter_group != null || $scope.hasFilters()){
                        if(lResult==null) lResult = {};
                        lResult.filter_group = {filters:[]};
                        if($configs.filter_group != null){
                            lResult.filter_group = angular.copy($configs.filter_group)
                        }
        
                        if($scope.hasFilters()){
                            lResult.filter_group.filter_groups.push($scope.filter_group);
                        }
                        
                        lResult.filter_group = $scope.normalizeFilterGroup(lResult.filter_group);
                    }
        
                    if($scope.sort_fields.length > 0){
                        lResult.sort_fields = $scope.sort_fields;
                    }
                    else{
                        lResult.sort_fields = [{field: $configs.sort, desc: $configs.sort_reverse}];
                    }

                    if($scope.query_text != null){
                        lResult.query_text = $scope.query_text;
                    }

                    $scope.getSearchToken(lResult).then(function($token){
                        if($token!=''){
                            
                            $scope.saveState('st', $token);

                            $rootScope.$broadcast($scope.alias + 'FilterTokenChanged', $token);
                            $resolve($token);
                        }
                        else{
                            $reject();
                        }
                    })
                });
            });

            return lPromise;
        }

        $scope.navigate = function(){
            if($scope.result_url!='' && $scope.result_url!=null){
                $scope.buildFilters().then(function($token){
                    window.location = $scope.result_url;
                });
            }
        }

        /**
         * Loop through object attributes and return a list of key that are marked as "selected"
         * @param {object} $list 
         */
        $scope.getSelection = function($list){
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
         * Get a new search token from the api
         * @param {object} $filters 
         * @return {object} Promise
         */
        $scope.getSearchToken = function($filters){
            let lPromise =  $q(function($resolve, $reject){    
                if($filters != null){
                    $immodbApi.api('utils/search_encode', $filters).then(function($response){
                        $resolve($response);
                    });
                }
                else{
                    $resolve('');
                }
            
            });
            return lPromise;
        }

        /**
         * Return valid configuration settings
         */
        $scope.getConfigs = function(){
            let lPromise = $q(function($resolve, $reject){
                if($scope.configs==null){
                    console.log($scope.alias);
                    $immodbApi.getListConfigs($scope.alias).then(function($configs){
                        $scope.configs = $configs;
                        $immodbApi.renewToken().then(function(){
                            console.log('token is renewed')
                            if($scope.configs.source=='default'){
                                $scope.configs.source = $immodbApi.auth_token.view_ids[0];
                            }
                            $resolve($scope.configs);
                        });
                        
                    });
                }
                else{
                    $resolve($scope.configs);
                }
            });

            return lPromise;
        }

        

        // EVENTS HANDLING

        /**
         * Handler for SortDataChanged event
         * @param {object} $newSortData 
         */
        $scope.onSortDataChanged = function($event, $newSortData){
            $scope.sort_fields = [$newSortData];
            console.log('sort field changed', $newSortData);
            $scope.buildFilters();
        }

        // watch for alias to be valid then init directive
        $scope.$watch("alias", function(){
            if($scope.alias!=null){
                $scope.init();
            }
        });

        $scope.$watch("data.min_price", function(newValue, oldValue){
            if(newValue != oldValue){
                console.log('min-price changed',newValue, oldValue);
                $scope.addFilter(['price.sell.amount','price.lease.amount'],'greater_or_equal_to',  $scope.data.min_price);
                $scope.updatePriceSuggestions();
            }
        });
        $scope.$watch("data.max_price", function(newValue, oldValue){
            if(newValue != oldValue){
                console.log('max-price changed',newValue, oldValue);
                $scope.addFilter(['price.sell.amount','price.lease.amount'],'less_or_equal_to', $scope.data.max_price);
                $scope.updatePriceSuggestions();
            }
        });
    }

    return {
        restrict: 'E',
        replace: true,
        scope: {
            alias: '@immodbAlias',
            class: '@class',
            configs: '=?immodbConfigs',
            dictionary: '=?immodbDictionary',
            result_url: "@immodbResultUrl"
        },
        controllerAs: 'ctrl',
        template: '<div ng-include="\'immodb-search-for-\' + alias"></div>',
        controller: dir_controller
    };
});

ImmoDbApp
.directive('onBottomReached', function ($document) {
    //This function will fire an event when the container/document is scrolled to the bottom of the page
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var raw = element[0];
            let doc = $document[0];
            console.log('loading directive on ');
            

            $document.bind('scroll', function () {
                let lTop = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
                let lBottomLimit = raw.offsetHeight + raw.offsetTop - (window.innerHeight/3*2);
                // console.log('in scroll', lTop);
                // console.log(lBottomLimit);
                if (lTop  >= lBottomLimit) {
                    // console.log("I am at the bottom");
                    scope.$apply(attrs.onBottomReached);
                }
            });
        }
    };
});

ImmoDbApp
.directive('immodbImageSlider', function(){
    let dir_controller = function ($scope, $q,$immodbApi,$rootScope) {
        $scope.expand_mode = false;

        $scope.position = {
            current_picture_index : 0
        };

        $scope.init = function(){
            $scope.index = 0;
            // window.setInterval(function(){
            //     $scope.next();
            //     $scope.$digest();
            // },4000);
            
        }

        $scope.next = function(){
            
            let lNewIndex = $scope.index+1;
            if(lNewIndex ==  $scope.pictures.length-1){
                lNewIndex= 0;
            }
            $scope.set(lNewIndex);
            
        }

        $scope.previous = function(){
            let lNewIndex = $scope.index-1;
            if(lNewIndex ==  -1){
                lNewIndex= $scope.pictures.length-2;
            }
            $scope.set(lNewIndex);
        }

        $scope.set = function($index){
            $scope.index = $index;
            try{
                $scope.$digest();
            }catch($e){}
        }

        $scope.toggleExpand = function(){
            $scope.expand_mode = !$scope.expand_mode;
        }

        $scope.getPosition = function(){
            return '-' + ($scope.position.current_picture_index * 100) + '%';
        }

        // watch for alias to be valid then init directive
        $scope.$watch("pictures", function(){
            if($scope.pictures!=null){
                $scope.init();
            }
        });
    };

    return {
        restrict: 'E',
        scope: {
            pictures: '=immodbPictures',
            dictionary: '=?immodbDictionary',
            gap: '@immodbGap',
            index: '=?immodbIndex'
        },
        controllerAs: 'ctrl',
        replace:true,
        templateUrl: immodbCtx.base_path + 'views/ang-templates/immodb-image-slider.html',
        controller: dir_controller,
        link: function (scope, element, attrs) {
            scope.$element = element[0];
            var mc = new Hammer(element[0]);
            let lPanHndl = null;
            // let the pan gesture support all directions.
            // this will block the vertical scrolling on a touch-device while on the element
            mc.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });
            mc.on("swipeleft swiperight", function(ev) {
                
                console.log( ev.type +" gesture detected.");

                    switch(ev.type){
                        case 'swipeleft':
                            scope.next();
                            break;
                        case 'swiperight':
                            scope.previous();
                            break;
                    }
                    
                
            });
        }
    };
});

ImmoDbApp
.directive('immodbCalculator', function(){
    let dir_controller = function ($scope, $q,$rootScope) {
        $scope.downpayment_selection = 'manual';
        
        $scope.data = {
            amount:0,
            amortization:25,
            downpayment: 20,
            interest: 3,
            frequency: 26,
            downpayment_method : 'percent'
        }
        $scope.frequencies = {
            '12' : 'Monthly',
            '26' : 'Every two weeks',
            '52' : 'Weekly'
        }
        $scope.init = function(){
            $scope.preload();

            $scope.data.amount = $scope.amount;
            $scope.process();
        }

        $scope.changeDownpaymentMethod = function($value){
            if($value != $scope.data.downpayment_method){
                $scope['convertDownpaymentTo_' + $value]();
                $scope.data.downpayment_method = $value;

                $scope.process();
            }
        }

        $scope.convertDownpaymentTo_cash = function(){
            let lResult = 0;

            lResult = Math.round($scope.data.amount * ($scope.data.downpayment / 100));

            $scope.data.downpayment = lResult;
        }

        $scope.convertDownpaymentTo_percent = function(){
            let lResult = 0;

            lResult = Math.round(100 / ($scope.data.amount / $scope.data.downpayment));

            $scope.data.downpayment = lResult;
        }

        $scope.setFrequency = function($value){
            $scope.data.frequency = $value;

            $scope.process();
        }

        $scope.process = function(){
            if($scope.downpayment_selection=='manual'){
                $scope.process_single();
            }
            else{
                $scope.process_multi();
            }

            $scope.save();
        }

        $scope.process_single = function(){
            
            // init branch
            let lBranch = {
                downpayment: 0,
                insurance: 0,
                mortgage: 0,
                amortization: $scope.data.amortization,
                rate: $scope.data.interest,
                frequency: $scope.data.frequency,
                frequency_caption : $scope.frequencies[$scope.data.frequency],
                payment: 0
            }
            let lRatio = $scope.data.downpayment_method == 'percent' ? 
                            $scope.data.downpayment / 100 : 
                            ($scope.data.downpayment / $scope.data.amount);
            console.log('ratio', lRatio);
            $scope.process_branch(lBranch, lRatio);

            let lResult = {
                mortgage : lBranch,
                transfer_tax : getTransferTax($scope.data.amount,$scope.region=='06 ')
            }

            $rootScope.$broadcast('immodb-mortgage-calculator-result-changed', lResult);
            
            if(typeof($scope.on_change) == 'function'){
                $scope.on_change({'$result' : lResult});
            }

            console.log('processing triggered', lResult);
        }

        $scope.process_branch = function (branch, downpayment_ratio) {
            branch.downpayment = getDownPayment($scope.data.amount, downpayment_ratio);
            branch.insurance = getMortgageInsurance($scope.data.amount, downpayment_ratio);
            branch.mortgage = $scope.data.amount - branch.downpayment + branch.insurance;


            var PrValue = branch.mortgage;  //Number($("input[name=calPropertyCost]").val()) - Number($("input[name=calCash]").val());
            var IntRate = branch.rate / 100; //Number($("input[name=calInterest]").val()) / 100;
            var Period = branch.amortization; //Number($("input[name=calAmortizationPeriod]").val());
            var PPay = branch.frequency; //Number($("input[name=calFreq]").val());

            var intcandebase = Math.pow((1 + IntRate / 2), (2 / PPay)) - 1;
            var paymperiobase = (PrValue * intcandebase) / (1 - (1 / Math.pow((1 + intcandebase), (Period * PPay))));
            branch.payment = paymperiobase;
        };

        getDownPayment = function (price, downpayment_ratio) {
            return price * downpayment_ratio;
        };

        getMortgageInsurance = function (price, downpayment_ratio) {
            var lResult = price - (price * downpayment_ratio);
            switch (downpayment_ratio) {
                case 0.05:
                    lResult = lResult * 0.036;
                    break;
                case 0.10:
                    lResult = lResult * 0.024;
                    break;
                case 0.15:
                    lResult = lResult * 0.018;
                    break;
                case 0.20:
                    lResult = lResult * 0;
                    break;
            }
            return lResult;
        };

        getTransferTax = function (amount, in_montreal) {
            in_montreal = (typeof (in_montreal) == 'undefined') ? false : in_montreal;
            parts = [];

            console.log('in montreal', in_montreal);

            parts.push((amount > 50000 ? 50000 : amount) * 0.005);
            if (amount > 50000) {
                parts.push((amount > 250000 ? 200000 : amount - 50000) * 0.01);

                if (in_montreal) {
                    if (amount > 250000) {
                        parts.push((amount > 500000 ? 250000 : amount - 250000) * 0.015);
                    }

                    if (amount > 500000) {
                        parts.push((amount - 500000) * 0.02);
                    }
                }
                else {
                    if (amount > 250000) {
                        parts.push((amount - 250000) * 0.015);
                    }
                }
            }

            var lResult = 0;
            for (var i = 0; i < parts.length; i++) {
                lResult += parts[i];
            }

            return lResult;
        };

        $scope.preload = function(){
            let lData = sessionStorage.getItem('immodb.mortgage-calculator');
            if(lData != null){
                $scope.data = JSON.parse(lData);
            }
        }

        $scope.save = function(){
            sessionStorage.setItem('immodb.mortgage-calculator', JSON.stringify($scope.data));
        }

        // watch for amount to be valid then init directive
        $scope.$watch("amount", function(){
            if($scope.amount!=null){
                $scope.init();
            }
        });

        
    };

    return {
        restrict: 'E',
        scope: {
            amount: '=immodbAmount',
            dictionary: '=?immodbDictionary',
            downpayment_selection: '@?immodbDownpaymentSelection',
            region: '@?immodbRegion',
            on_change: '&onChange'
        },
        controllerAs: 'ctrl',
        replace:true,
        templateUrl: immodbCtx.base_path + 'views/ang-templates/immodb-calculator.html',
        controller: dir_controller
    };
});

ImmoDbApp
.directive('immodbModal', function(){
    let dir_controller = function ($scope, $q,$immodbApi,$rootScope) {

        $scope.options = {
            close_label : 'Close',
            ok_label: 'OK'
        }

        $scope.init = function(){
            if($scope.model==null){
                $scope.model = {};
            }
        }

        $scope.closeWithValue = function(){
            console.log('close with value',typeof($scope.onOK))
            if(typeof($scope.onOK)=='function'){
                $scope.onOK();
            }
        }


        // watch for amount to be valid then init directive
        $scope.$watch("modal_title", function(){
            if($scope.amount!=null){
                $scope.init();
            }
        });

        $scope.$watch("ok_label", function(){
            if($scope.ok_label!=null){
                $scope.options.ok_label = $scope.ok_label;
            }
        });

        
        $scope.$watch("close_label", function(){
            if($scope.close_label!=null){
                $scope.options.close_label = $scope.close_label;
            }
        });
    };

    return {
        restrict: 'E',
        scope: {
            modal_id        : '@modalId',
            modal_title     : '@modalTitle',
            onOK            : '&?onOk',
            model           : '=ngModel',
            ok_label        : '@?okLabel',
            cancel_label    : '@?cancelLabel'
        },
        controllerAs    : 'ctrl',
        replace         : true,
        transclude      : true,
        templateUrl     : immodbCtx.base_path + 'views/ang-templates/immodb-modal.html',
        controller      : dir_controller,
    };
});

/* ------------------------------- 
        FACTORIES
-------------------------------- */
ImmoDbApp
.factory('$immodbApi', ["$http","$q", function($http,$q){
    let $scope = {};
    
    /**
     * API call gateway that renew token if needed
     * @param {string} $path Endpoint to the api call
     * @param {*} $data Data object to send in the request
     * @param {*} $options Options to add at the $http call
     */
    $scope.api = function($path, $data, $options){
        // check token
        let lPromise = $q(function($resolve, $reject){
            $scope.renewToken().then(function(){
                $scope.call($path, $data, $options).then(function($result){
                    $resolve($result);
                });
            });
        });

        return lPromise;
    }

    /**
     * Check wether the auth token is valid or not
     * @return {bool} Return true if the token is still valid, false otherwise
     */
    $scope.tokenIsValid = function(){
        let lNow = new Date();
        // token is not defined
        if($scope.auth_token==null){return false;}
        // token is out of date
        if(Date.parse($scope.auth_token.expire_date) < lNow){
            return false;
        }
        // everything's peachy
        return true;
    }

    /**
     * Renew the authentication token to make call to the distribution API
     * @return {AuthToken}
     */
    $scope.renewToken = function(){
        let lPromise = $q(function($resolve, $reject){
            if(!$scope.tokenIsValid()){   
                $scope.call(null,null,{
                    url : immodbApiSettings.rest_root + 'immodb/access_token',
                    headers: {
                        'X-WP-Nonce': immodbApiSettings.nonce
                    },
                }).then(function($reponse){
                    $scope.auth_token = $reponse;
                    $resolve()
                })
            }
            else{
                $resolve();
            }
        });

        return lPromise;
    }

    $scope.getDefaultDataView = function(){
        let lPromise = $q(function($resolve, $reject){
            $scope.call(null,null,{
                url : immodbApiSettings.rest_root + 'immodb/data_view',
                headers: {
                    'X-WP-Nonce': immodbApiSettings.nonce
                },
            }).then(function($response){
                $resolve($response);
            })
        
        });

        return lPromise;
    }
    
    /**
     * Get the List object configurations 
     * @param {string} $alias identifier of the list to request info
     */
    $scope.getListConfigs = function($alias){
        let lPromise = $q(function($resolve, $reject){
            $scope.call(null,{alias : $alias},{
                url : immodbApiSettings.rest_root + 'immodb/list_configs',
                method: 'GET',
                headers: {
                    'X-WP-Nonce': immodbApiSettings.nonce
                },
            }).then(function($response){
                $resolve($response);
            })
        });

        return lPromise;
    }

    /**
     * Return a promise for view meta
     * @param {string} $type Data type contains in the view
     * @param {string} $view_id ID of the view to get metas from
     */
    $scope.getViewMeta = function($type, $view_id){
        let lOrigin = $type;
        switch(lOrigin){
            case 'listings':
                lOrigin = 'listing';break;
            case 'brokers':
                lOrigin = 'broker';break;
            case 'cities':
                lOrigin = 'city';break;
        }
        let lEndPoint = lOrigin.concat('/view/',$view_id,'/',immodbApiSettings.locale);
        
        return $scope.api(lEndPoint);        
    }
        
        
    /**
     * Direct call to the API
     * 
     * Should not be call directly
     * @param {string} $path Endpoint to the api call
     * @param {*} $data Data object to send in the request
     * @param {*} $options Options to add at the $http call
     * @return {promise} Promise object
     */
    $scope.call = function($path, $data, $options){
        $options = angular.merge({
            url     : immodbApiSettings.api_root + '/api/' + $path,
            method  : (typeof($data)=='undefined' || $data==null) ? 'GET' : 'POST',
            data : $data,
            headers : {
                'auth_token' : ($scope.auth_token)?$scope.auth_token.id:''
            }
        }, $options);


        if($options.method=='GET'){
            if($options.data!=null){
                $options.params = $options.data;
                $options.data = null;
            }
        }

        // Setup promise object
        let lPromise = $q(function($resolve, $reject){
            $http($options).then(
                // On success
                function success($result){
                    if($result.status=='200'){
                        $resolve($result.data);
                    }
                    else{
                        $reject(null);
                    }
                },
                // On fail
                function fail($error){
                    console.log($error);
                }
            )
        });

        return lPromise;
    }

    return $scope;
}]);

ImmoDbApp
.factory('$immodbDictionary', function(){
    let $scope = {};


    $scope.source = null;

    /** 
     * Get the caption matching key and domain from the dictionary
     * @param {string} $key Key code of the dictionary item
     * @param {string} $domain Group key that (should) hold the item
     * @return {string} Caption matched or the key in case the something's missing or went wrong
     */
    $scope.getCaption = function($key, $domain, $asAbbr){
        let lResult = $key;
        $asAbbr = ($asAbbr==undefined)?false:$asAbbr;

        if($scope.source && $scope.source[$domain]){
            if($scope.source[$domain][$key] != undefined){
                if($asAbbr){
                    lResult = $scope.source[$domain][$key].abbr;
                }
                else{
                    lResult = $scope.source[$domain][$key].caption;
                }
            }
        }
        return lResult;
    }

    return $scope;
})


/* ------------------------------- 
        FILTERS
-------------------------------- */

ImmoDbApp
.filter('range', function(){
    return function($items, $lowerBound, $upperBound){
        if($items==null) return null;
        $items.forEach(function($e,$i){
            $e.index = $i;
        });
        let lRange = $upperBound - $lowerBound;
        
        if(lRange > $items.length){
            lRange = $items.length;
            $lowerBound = 0;
            $upperBound = $items.length - 1;
        }
        else if($lowerBound < 0){
            $lowerBound = 0;
            $upperBound = $lowerBound + lRange;
        }
        else if($upperBound > $items.length - 1){
            $upperBound = $items.length - 1;
            $lowerBound = $upperBound - lRange;
        }

        
        let lResult = $items.filter(function($e,$i){
            return ($lowerBound <= $i && $i < $upperBound);
        });
        
        return lResult;
    }
})
