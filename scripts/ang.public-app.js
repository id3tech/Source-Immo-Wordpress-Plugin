var ImmoDbApp = angular.module('ImmoDb', ['ngSanitize']);

/**
 * Global - Controller
 */
ImmoDbApp
.controller('publicCtrl', 
function publicCtrl($scope,$rootScope,$immodbDictionary, $immodbUtils){
    $scope.model = null;

    $scope.init = function(){
        
    }

    /**
     * Shorthand to $immodbDictionary.getCaption
     * See $immodbDictionary factory for details
     * @param {string} $key 
     * @param {string} $domain 
     * @param {string} $asAbbr 
     */
    $scope.getCaption = function($key, $domain, $asAbbr){
        return $immodbDictionary.getCaption($key, $domain, $asAbbr);
    }

    /**
     * Shorthand to $immodbUtils.formatPrice
     * See $immodbUtils factory for details
     * @param {object} $item 
     */
    $rootScope.formatPrice = function($item){
        return $immodbUtils.formatPrice($item);
    }

    /**
     * Smooth scroll to target element
     * @param {string} $target Path selector to target element
     */
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


/**
 * Listing Detail - Controller
 */
ImmoDbApp
.controller('singleListingCtrl', 
function singleListingCtrl($scope,$q,$immodbApi, $immodbDictionary, $immodbUtils,$immodbConfig){
    // model data container - listing
    $scope.model = null;
    $scope.permalinks = null;

    // ui - section toggles
    $scope.sections = {
        addendum : {opened:true},
        building : {opened:false},
        lot : {opened:false},
        other: {opened: false},
        in_exclusions:{opened:false}
    }
    // ui - media tabs selector
    $scope.selected_media = 'pictures';
    // calculator result
    $scope.calculator_result = {};
    // message model
    $scope.message_model = {};

    /**
     * Initialize controller
     * @param {string} $ref_number Listing reference key
     */
    $scope.init = function($ref_number){
        if($ref_number != undefined){
            console.log($ref_number);
            $scope.fetchPrerequisites().then(function(){
                $scope.loadSingleData($ref_number);
            });
            
        }
    }

    $scope.fetchPrerequisites = function(){
        let lPromise = $q(function($resolve, $reject){
            $immodbConfig.get().then(function($configs){
                $resolve({
                    brokers: $configs.broker_routes,
                    listings: $configs.listing_routes
                })
            })
        });

        return lPromise;
    }

    /**
     * Load listing data
     * @param {string} $ref_number Listing reference key
     */
    $scope.loadSingleData = function($ref_number){
        // Get the default view id for data source
        let lPromise = $q(function($resolve,$reject){
            if(typeof(immodbListingData)!='undefined'){
                $resolve(immodbListingData);
            }
            else{
                $immodbApi.getDefaultDataView().then(function($view){
                    // Load listing data from api
                    console.log($view);
                    $immodbApi.api("listing/view/{0}/{1}/items/ref_number/{2}".format($view.id,immodbApiSettings.locale,$ref_number)).then(function($data){
                        $resolve($data);
                    });
                });
            }

        });


        lPromise.then(function($data){
            $scope.model = $data;
            // set dictionary source
            $immodbDictionary.source = $data.dictionary;
            // start preprocessing of data
            $scope.preprocess();
            // prepare message subject build from data
            $scope.message_model.subject = 'Request information for : {0} ({1})'.translate().format($scope.model.location.full_address,$scope.model.ref_number);
            // print data to console for further informations
            console.log($scope.model);
        });
    }

    /**
     * Preprocess data information to create shortcut, icon list and groups
     */
    $scope.preprocess = function(){
        // set basic information from dictionary
        $scope.model.location.city      = $scope.getCaption($scope.model.location.city_code, 'city');
        $scope.model.location.region    = $scope.getCaption($scope.model.location.region_code, 'region');
        $scope.model.location.country   = $scope.getCaption($scope.model.location.country_code, 'country');
        $scope.model.location.state     = $scope.getCaption($scope.model.location.state_code, 'state');
        $scope.model.category           = $scope.getCaption($scope.model.category_code, 'listing_category');
        $scope.model.subcategory        = $scope.getCaption($scope.model.subcategory_code, 'listing_subcategory');
        $scope.model.addendum           = ($scope.model.addendum) ? $scope.model.addendum.trim() : null;
        $scope.model.location.full_address = '{0} {1}, {2}'.format(
                                                $scope.model.location.address.street_number,
                                                $scope.model.location.address.street_name,
                                                $scope.model.location.city
                                            );

        $scope.model.building.attributes = [];
        $scope.model.lot = {attributes : []};
        $scope.model.other = {attributes : []};
        $scope.model.important_flags = [];
        $scope.model.long_price = $immodbUtils.formatPrice($scope.model,'long');

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

        // set brokers detail link
        let lRoute = $scope.permalinks.brokers.find(function($r){ return $r.lang==immodbCtx.locale});
        $scope.model.brokers.forEach(function($e){
            $e.detail_link = $immodbUtils.evaluate(lRoute.route,{item:$e});
            $e.license_type = $scope.getCaption($e.license_type_code, 'broker_license_type');
        });
    }

    /**
     * Check if a section is opened
     * @param {string} $section Section key
     */
    $scope.sectionOpened = function($section){
        return $scope.sections[$section].opened;
    }
    /**
     * Toggle section open/close
     * @param {string} $section Section key
     */
    $scope.toggleSection = function($section){
        $scope.sections[$section].opened = !$scope.sections[$section].opened;
    }

    /**
     * Event handler for Mortgage Calculator onChange
     * @param {number} $calculatorResult Result that comes out of the calculator
     */
    $scope.onMortgageChange = function($calculatorResult){
        // save result
        $scope.calculator_result = $calculatorResult;
    }

    /**
     * Send message to broker via API
     * TODO
     */
    $scope.sendMessage = function(){
        console.log('message data:', $scope.message_model);
    }
});

/**
 * Broker Detail - Controller
 */
ImmoDbApp
.controller('singleBrokerCtrl', 
function singleBrokerCtrl($scope,$q,$immodbApi, $immodbDictionary, $immodbUtils){
    $scope.filter_keywords = '';

    // model data container - listing
    $scope.model = null;
    $scope.permalinks = null;

    // ui - section toggles
    $scope.sections = {
        addendum : {opened:true},
        building : {opened:false},
        lot : {opened:false},
        other: {opened: false},
        in_exclusions:{opened:false}
    }
    // ui - media tabs selector
    $scope.selected_media = 'pictures';
    // calculator result
    $scope.calculator_result = {};
    // message model
    $scope.message_model = {};

    /**
     * Initialize controller
     * @param {string} $ref_number Listing reference key
     */
    $scope.init = function($ref_number){
        if($ref_number != undefined){
            console.log($ref_number);
            $scope.fetchPrerequisites().then(function(){
                $scope.loadSingleData($ref_number);
            });
            
        }
    }

    $scope.fetchPrerequisites = function(){
        let lPromise = $q(function($resolve, $reject){
            if($scope.permalinks != null){
                $resolve();
            }
            else{
                $immodbApi.rest('permalinks').then(function($response){
                    $scope.permalinks = $response;
                    $resolve();
                });
            }
        });

        return lPromise;
    }

    /**
     * Load listing data
     * @param {string} $ref_number Listing reference key
     */
    $scope.loadSingleData = function($ref_number){
        // Get the default view id for data source
        $immodbApi.getDefaultDataView().then(function($view){
            // Load listing data from api
            console.log($view);
            $immodbApi.api("broker/view/{0}/{1}/items/ref_number/{2}".format($view.id,immodbApiSettings.locale,$ref_number)).then(function($data){
                $scope.model = $data;
                // set dictionary source
                $immodbDictionary.source = $data.dictionary;
                // start preprocessing of data
                $scope.preprocess();
                // prepare message subject build from data
                //$scope.message_model.subject = 'Request information for : {0} ({1})'.translate().format($scope.model.location.full_address,$scope.model.ref_number);
                // print data to console for further informations
                console.log($scope.model);
            });
        });
    }

    /**
     * Preprocess data information to create shortcut, icon list and groups
     */
    $scope.preprocess = function(){
        // set basic information from dictionary
        $scope.model.license_type = $scope.getCaption($scope.model.license_type_code,'broker_license_type');
        $scope.model.languages            = 'N/A'.translate();
        let lExpertises           = [];
        $scope.model.listings.forEach(function($e,$i,$arr){
            let lNewItem = $scope.getCaption($e.category, 'listing_category');
            if(lExpertises.indexOf(lNewItem)<0){
                lExpertises.push(lNewItem);
            }
        });
        $scope.model.expertises = lExpertises.join(', ');
        $scope.list = $scope.model.listings;

        // office
        $scope.model.office.location.country = $scope.getCaption($scope.model.office.location.country_code, 'country');
        $scope.model.office.location.state     = $scope.getCaption($scope.model.office.location.state_code, 'state');
        $scope.model.office.location.full_address = '{0} {1}, {2}'.format(
                                                $scope.model.office.location.address.street_number,
                                                $scope.model.office.location.address.street_name,
                                                $scope.model.office.location.city
                                            );

        $scope.model.location = $scope.model.office.location;
        $immodbUtils.compileListingList($scope.model.listings);        
    }

    $scope.getPhoneIcon = function($key){
        let lPhoneIcon = {
            'mobile' : 'mobile',
            'office' : 'building'
        }

        if(lPhoneIcon[$key] != undefined){
            return lPhoneIcon[$key];
        }
        return 'phone';
    }

    $scope.filterListings = function($listing){
        
        if($scope.filter_keywords==undefined || $scope.filter_keywords==''){
            return true;
        }

        if($listing.description && $listing.description.toLowerCase().indexOf($scope.filter_keywords.toLowerCase())>=0){
            console.log('found kw in description');
            return true;
        }
        else if($listing.price.sell && $listing.price.sell.amount.toString().indexOf($scope.filter_keywords)>=0){
            console.log('found kw in price sell');
            return true;
        }
        else if($listing.price.rent && $listing.price.rent.amount.toString().indexOf($scope.filter_keywords)>=0){
            console.log('found kw in price rent');
            return true;
        }
        else if($listing.location.city.toLowerCase().indexOf($scope.filter_keywords.toLowerCase())>=0){
            console.log('found kw in city');
            return true;
        }

        return false;
    }

    /**
     * Check if a section is opened
     * @param {string} $section Section key
     */
    $scope.sectionOpened = function($section){
        return $scope.sections[$section].opened;
    }
    /**
     * Toggle section open/close
     * @param {string} $section Section key
     */
    $scope.toggleSection = function($section){
        $scope.sections[$section].opened = !$scope.sections[$section].opened;
    }

    /**
     * Event handler for Mortgage Calculator onChange
     * @param {number} $calculatorResult Result that comes out of the calculator
     */
    $scope.onMortgageChange = function($calculatorResult){
        // save result
        $scope.calculator_result = $calculatorResult;
    }

    /**
     * Send message to broker via API
     * TODO
     */
    $scope.sendMessage = function(){
        console.log('message data:', $scope.message_model);
    }
});


/* ------------------------------- 
        DIRECTIVES
-------------------------------- */

/**
 * DIRECTIVE: SEARCH
 * usage: <immodb-list immodb-alias="default"></immodb-list>
 * @param {string} immodbAlias List alias name. Required
 * @param {string} class CSS class to add to template
 */
ImmoDbApp
.directive('immodbList', function immodbList(){
    return {
        restrict: 'E',
        scope: {
            alias: '@immodbAlias',
            class: '@immodbClass'
        },
        controllerAs: 'ctrl',
        template: '<div ng-include="\'immodb-template-for-\' + alias" class="{{class}}"></div>',
        link : function($scope){
            $scope.init();
        },
        controller: function ($scope, $q,$immodbApi,$rootScope,$immodbDictionary, $immodbUtils) {
            $scope.configs = null;
            $scope.list = [];
            $scope.page = 1;
            $scope.meta = null;
            $scope.dictionary = {};
            $scope.auth_token = null;
            $scope.is_ready = false;
            $scope.display_mode = 'list';
            $scope.page_index = 0;
            $scope.is_loading_data = false;
            $scope.client = {
                search_token : null
            }
            
            /**
             * Initialize the controller
             */
            $scope.init = function(){
                console.log('initializing list for ' + $scope.alias);
                
                $immodbApi.getListConfigs($scope.alias).then(function($configs){
                    $scope.configs = $configs;
                    $immodbApi.renewToken().then(function(){
                        $scope.start();
                    });
                });
            
                $rootScope.$on($scope.alias + 'FilterTokenChanged', $scope.onFilterTokenChanged);
            }
    
            /**
             * Start the loading process
             */
            $scope.start = function(){
                // Prepare Api
                $immodbApi.getViewMeta($scope.configs.type,$scope.configs.source.id).then(function($response){
                    // init dictionary
                    $immodbDictionary.init($response.dictionary);
                    
                    $scope.dictionary = $response.dictionary;
                    $scope.is_ready = true;
                    // load data
                    $scope.getList();
                });
            }
    
            /**
             * Load listings
             */
            $scope.getList = function(){
                // search for data with search token
                $scope.search($scope.getSearchToken());
            }
    
            /**
             * Get the search token
             * Return the client token if user has interact with the search engine
             */
            $scope.getSearchToken = function(){
                if($scope.client.search_token != null){
                    return $scope.client.search_token;
                }
                return $scope.configs.search_token;
            }
            
            /**
             * Event handler triggers when a new search token is thrown
             * @param {object} $event Event object
             * @param {string} $newToken New search token
             */
            $scope.onFilterTokenChanged = function($event, $newToken){
                console.log('Filter token changed')
                $scope.client.search_token = $newToken; // save search token
                // When ready, get data
                $scope.isReady().then(function(){
                    $scope.getList();
                })
            }
    
            /**
             * Wait until the list is initialized and ready to go forth
             * @returns {promise} Promise object
             */
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
                // set search token
                lParams = {'st': $token}; 
                // reset page index
                $scope.page_index = 0;  
                // lock loading to prevent call overlaps
                console.log("search called loading:", $scope.is_loading_data)
                if($scope.is_loading_data == false){
                    $scope.is_loading_data = true;
                    console.log('search called api')
                    $immodbApi.api($scope.getEndpoint() + '/items', lParams,{method:'GET'}).then(function($response){
                        // set list/meta
                        if($scope.configs.type=='listings'){
                            $scope.list = $immodbUtils.compileListingList($response.items);
                        }
                        else{
                            $scope.list = $response.items;
                        }
                        
                        $scope.listMeta = $response.metadata;
                        // unlock
                        $scope.is_loading_data = false;

                        // print list to console for further information
                        console.log($scope.list);
                    })
                }
            }

            /**
             * Check wether loading the next page of list is required or not
             */
            $scope.checkNextPage = function(){
                // page is under 2 and there's a token to load next page
                if($scope.listMeta!=null){
                    if($scope.page_index<2 && $scope.listMeta.next_token){
                        // load next page
                        $scope.showNextPage();
                    }
                }
            }
    
            /**
             * Load next page datas and append it to the list
             */
            $scope.showNextPage = function(){
                lParams = {
                    'st': $scope.listMeta.search_token, // set search token
                    'nt': $scope.listMeta.next_token    // set next page token
                };

                console.log($scope.is_loading_data, 'loading page', $scope.page_index+1);
                if(!$scope.is_loading_data){
                    console.log
                    // lock loading to prevent call overlaps
                    $scope.is_loading_data = true;
                    $immodbApi.api($scope.getEndpoint() + '/items', lParams,{method:'GET'}).then(function($response){
                        $scope.list = $scope.list.concat($response.items);
                        
                        $scope.listMeta = $response.metadata;
                        // increment page index
                        $scope.page_index++;
                        // unlock
                        window.setTimeout(function(){
                            $scope.is_loading_data = false;
                        },500);
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
                return lOrigin.concat('/view/',$scope.configs.source.id,'/',immodbApiSettings.locale);
            }
    
    
            //
            // UTILITY FUNCTIONS
            //
    
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
             * Change list order by price
             * @param {bool} $more_to_least From 
             */
            $scope.sortByName = function($more_to_least){
                let lNewSortFields = {field: 'last_name', desc: $more_to_least};
                $rootScope.$broadcast($scope.alias + 'SortDataChanged', lNewSortFields);
            }
    
            /**
             * Change list order by price
             * @param {bool} $more_to_least From 
             */
            $scope.sortByListingCount = function($more_to_least){
                let lNewSortFields = {field: 'listings_count', desc: $more_to_least};
                $rootScope.$broadcast($scope.alias + 'SortDataChanged', lNewSortFields);
            }
    
            /**
             * Shorthand to $immodbDictionary.getCaption
             * see $immodbDictionary factory for details
             * @param {string} $key 
             * @param {string} $domain 
             * @return {string} Caption
             */
            $scope.getCaption = function($key, $domain, $asAbbr){
                return $immodbDictionary.getCaption($key, $domain, $asAbbr);
            }
            
            /**
             * Shorthand to $immodbUtils.formatPrice
             * see $immodbUtils factory for details
             * @param {object} $item Listing item data
             */
            $scope.formatPrice = function($item){
                return $immodbUtils.formatPrice($item);
            }
    
            /**
             * Shorthand to $immodbUtils.getClassList
             * see $immodbUtils factory for details
             * @param {object} $item Listing item data
             */
            $scope.getClassList = function($item){
                return $immodbUtils.getClassList($item);
            }
    
            /**
             * Calls for display mode switch
             * @param {string} $mode New display mode
             */
            $scope.switchDisplayTo = function($mode){
                // Bail out early when mode is the same
                if($scope.display_mode == $mode) return;
                // switch mode
                $scope.display_mode = $mode;
                // broadcast the change to other component
                $rootScope.$broadcast('immodb-{0}-display-switch-{1}'.format($scope.alias,$mode));
            }
    
            /**
             * Shorthand to $immodbUtils.getCity
             * see $immodbUtils factory for details
             * @param {object} $item Listing item data
             */
            $scope.getCity = function($item, $sanitize){
                return $immodbUtils.getCity($item, $sanitize);
            }
    
            /**
             * Shorthand to $immodbUtils.getRegion
             * see $immodbUtils factory for details
             * @param {object} $item Listing item data
             */
            $scope.getRegion = function($item, $sanitize){
                return $immodbUtils.getRegion($item, $sanitize);
            }
    
            /**
             * Shorthand to $immodbUtils.getTransaction
             * see $immodbUtils factory for details
             * @param {object} $item Listing item data
             */
            $scope.getTransaction = function($item, $sanitize){
                return $immodbUtils.getTransaction($item, $sanitize);
            }
        }
    }
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
.directive('immodbSearch', function immodbSearch(){
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
        link : function($scope){
           $scope.init();
        },
        controller: function($scope, $q, $immodbApi, $rootScope,$immodbDictionary, $immodbUtils){
            let lToday = new Date().round();    // save today
            // init default values        
            $scope.is_ready = false;    
            $scope.tab_category = 'RESIDENTIAL';
            $scope.tab_region = '';
            $scope.regions = [];
            $scope.geolocation_available = navigator.geolocation!=undefined;
            $scope.sort_fields = [];
            $scope.selected_price_input = 'min';
            $scope.keyword = '';
            $scope.priceSuggestions = [];
            $scope.bedroomSuggestions = [];
            $scope.bathroomSuggestions = [];
            $scope.parkingSuggestions = [];
            $scope.filterHints = [];
            $scope.suggestions = [];
            $scope.query_text = null;
            // search form data
            $scope.data = {
                keyword : '',
                min_price: null,
                max_price: null,
                location: null
            }
            // search filters
            $scope.filter_group = {
                operator: 'and',
                filters: null,
                filter_groups: null
            }
            
            // listing states
            $scope.listing_states = {
                sold: {
                    caption : 'Sold',
                    filter : {field: 'status_code', operator: 'not_equal_to', value: 'AVAILABLE'}
                },
                sell : {
                    caption: 'To sell', 
                    filter : {field: 'price.sell.amount', operator: 'greater_than', value: 0}
                },
                lease : {
                    caption: 'To lease',
                    filter : {field: 'price.lease.amount', operator: 'greater_than', value: 0}
                },
                open_house : {
                    caption: 'Open house',
                    filter : {field: 'price.sell.amount', operator: 'greater_than', value: 0}
                },
                forclosure : {
                    caption: 'Foreclosure',
                    filter : {field: 'price.foreclosure', operator: 'equal', value: true}
                }
            }
            // listing ages or timespan filters
            $scope.listing_ages = [
                {
                    selected:true,
                    caption : 'No limit'.translate(),
                    filter : {field: 'contract.start_date', operator: 'greater_than', value: ''}
                },
                {
                    caption: '7 days'.translate(), 
                    filter : {field: 'contract.start_date', operator: 'greater_than', value: lToday.addDays(-7).toJSON()}
                },
                {
                    caption: '1 month'.translate(),
                    filter : {field: 'contract.start_date', operator: 'greater_than', value: lToday.addMonths(-1).toJSON()}
                },
                {
                    caption: '6 months'.translate(),
                    filter : {field: 'contract.start_date', operator: 'greater_than', value: lToday.addMonths(-6).toJSON()}
                },
                {
                    caption: '1 year'.translate(),
                    filter : {field: 'contract.start_date', operator: 'greater_than', value: lToday.addYears(-1).toJSON()}
                },
            ];
            // listing attributes
            $scope.listing_attributes = {
                pool : {
                    caption: 'Pool', 
                    field: 'attributes.POOL'
                },
                fireplace : {
                    caption: 'Fireplace', 
                    field: 'attributes.HEART_STOVE'
                },
                garage : {
                    caption: 'Garage', 
                    field: 'attributes.GARAGE'
                },
                waterfront : {
                    caption: 'Water front', 
                    field: 'attributes.WATER_FRONT'
                },
                panoramicview : {
                    caption: 'Panoramic view', 
                    field: 'attributes.PANORAMIC_VIEW'
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
                // load state
                $scope.loadState();

                // load stored search token
                let lStoredSearchToken = $scope.loadState('st');
                if(lStoredSearchToken){
                    // broadcast new search token
                    $rootScope.$broadcast($scope.alias + 'FilterTokenChanged', lStoredSearchToken);
                }
                // Wait for late initialization
                $scope.isReady().then(function(){
                    // Sync UI with filters
                    $scope.syncFiltersToUI();

                    // check if there's filters stored
                    if($scope.hasFilters()){
                        // build hints
                        $scope.buildHints();
                    }
                });
            }
    
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
                            // load view meta
                            $scope.configs = $configs;
                            $immodbApi.getViewMeta($configs.type,$configs.source.id).then(function($response){
                                //$immodbDictionary.init($response.dictionary);
                                $scope.dictionary = $response.dictionary; // save dictionary
                                // directive is ready
                                $scope.is_ready = true;
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
            
            /* ----------------------
            
            UI MANAGEMENT 

            ------------------------- */

            /**
             * Get an icon corresponding to the category
             * @param {string} $key Category code
             * @returns {string} Icon
             */
            $scope.getCategoryIcon = function($key){
                lIconset = {
                    'RESIDENTIAL' : 'home',
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
                $scope.tab_region = $key;
            }

            /* ----------------------
            
            SUGGESTIONS BUILDINGS 

            ------------------------- */
            
            /**
             * Build dropdowns suggestions
             */
            $scope.buildDropdownSuggestions = function(){
                // Prices' dropdowns
                $scope.updatePriceSuggestions();
                
                // Other dropdowns
                for(let i=1; i<6; i++){
                    // Bedrooms
                    $scope.bedroomSuggestions.push({value:i, label: '{0}+ bedrooms'.translate().format(i)});
                    // Bathrooms
                    $scope.bathroomSuggestions.push({value:i, label: '{0}+'.format(i), caption: '{0}+ bathrooms'.translate().format(i)});
                    // Parking
                    $scope.parkingSuggestions.push({value:i, label: '{0}+'.format(i), caption: '{0}+ parking spaces'.translate().format(i)});
                }
                
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
                            // first selected, suggestion for listing ID
                            {selected:true, label : 'ID is "{0}"'.translate().format(lValue), action: function(){$scope.addFilter('ref_number','equal_to',lValue,'ID is "{0}"'.translate().format(lValue) )}},
                        ];
                        if($scope.configs.type == 'listings'){
                            lResult = lResult.concat([
                                // Price suggestions less than, more than, between A and B
                                {label : 'Price is less than {0}'.translate().format(lValue.formatPrice()), action: function(){$scope.setMaxPrice(lValue);}},
                                {label : 'Price is more than {0}'.translate().format(lValue.formatPrice()), action: function(){$scope.setMinPrice(lValue);}},
                                {label : 'Price is between {0} and {1}'.translate().format(lPriceMin.formatPrice(), lPriceMax.formatPrice()), action: function(){
                                    $scope.setMinPrice(lPriceMin);
                                    $scope.setMaxPrice(lPriceMax);
                                }},
                                // civic adress suggestion
                                {label : 'Has "{0}" as civic address'.translate().format(lValue), action: function(){$scope.addFilter('location.address.street_number','equal_to',lValue, 'Has "{0}" as civic address'.translate().format(lValue))}}
                            ]);
                        }
                    }
                    // When keyword is String
                    else{
                        // set keyword to lowercase
                        let lValue = $scope.data.keyword.toLowerCase();
                        // first selected for query_text
                        lResult = [
                            {selected:true, label : 'Contains "{0}"'.translate().format(lValue), action : function(){ $scope.query_text = lValue; $scope.buildFilters(); $scope.buildHints(); } }
                        ];
                        if($scope.configs.type == 'listings'){
                            // Add categories that match the keyword
                            for($key in $scope.dictionary.listing_category){
                                let lElm = $scope.dictionary.listing_category[$key];
                                if(lElm.caption.toLowerCase().indexOf(lValue)>=0){
                                    lResult.push({label: '{0} (category)'.translate().format(lElm.caption), action: function(){ lElm.selected=true;  $scope.addFilter('category','in',$scope.getSelection($scope.dictionary.listing_category));} }) 
                                }
                            }
                            // Add subcategories that match the keyword
                            for($key in $scope.dictionary.listing_subcategory){
                                let lElm = $scope.dictionary.listing_subcategory[$key];
                                if(lElm.caption.toLowerCase().indexOf(lValue)>=0){
                                    lResult.push({label: '{0} (subcategory)'.translate().format(lElm.caption), action: function(){ lElm.selected=true;  $scope.addFilter('subcategory','in',$scope.getSelection($scope.dictionary.listing_subcategory));} }) 
                                }
                            }
                            // Add regions that match the keyword
                            for($key in $scope.dictionary.region){
                                let lElm = $scope.dictionary.region[$key];
                                if(lElm.caption.toLowerCase().indexOf(lValue)>=0){
                                    lResult.push({label: '{0} (region)'.translate().format(lElm.caption), action: function(){ lElm.selected=true;  $scope.addFilter('location.region_code','in',$scope.getSelection($scope.dictionary.region));} }) 
                                }
                            }
                            // Add cities that match the keyword
                            for($key in $scope.dictionary.city){
                                let lElm = $scope.dictionary.city[$key];
                                if(lElm.caption.toLowerCase().indexOf(lValue)>=0){
                                    lResult.push({label: '{0} (city)'.translate().format(lElm.caption), action: function(){ lElm.selected=true;  $scope.addFilter('location.city_code','in',$scope.getSelection($scope.dictionary.city));} }) 
                                }
                            }
                        }
                        else if($scope.configs.type == 'brokers'){
                            lResult.push({
                                label: 'Last name is "{0}"'.translate().format($scope.data.keyword), 
                                action: function(){ 
                                    $scope.addFilter('last_name','equal_to',$scope.data.keyword, 'Last name is "{0}"'.translate().format($scope.data.keyword));
                                    $scope.buildFilters(); $scope.buildHints();
                                } 
                            });

                            lResult.push({
                                label: 'Last name starts with "{0}"'.translate().format(lValue), 
                                action: function(){ 
                                    $scope.addFilter('last_name','starts_with',lValue, 'Last name starts with "{0}"'.translate().format(lValue));
                                    $scope.buildFilters(); $scope.buildHints();
                                } 
                            });

                            lResult.push({
                                label: 'Last name ends with "{0}"'.translate().format(lValue), 
                                action: function(){ 
                                    $scope.addFilter('last_name','ends_with',lValue, 'Last name ends with "{0}"'.translate().format(lValue));
                                    $scope.buildFilters(); $scope.buildHints();
                                } 
                            });


                            lResult.push({
                                label: 'First name is "{0}"'.translate().format($scope.data.keyword), 
                                action: function(){ 
                                    $scope.addFilter('first_name','equal_to',$scope.data.keyword, 'First name is "{0}"'.translate().format($scope.data.keyword));
                                    $scope.buildFilters(); $scope.buildHints();
                                } 
                            });

                            lResult.push({
                                label: 'First name starts with "{0}"'.translate().format(lValue), 
                                action: function(){ 
                                    $scope.addFilter('first_name','starts_with',lValue, 'First name starts with "{0}"'.translate().format(lValue));
                                    $scope.buildFilters(); $scope.buildHints();
                                } 
                            });

                            lResult.push({
                                label: 'First name ends with "{0}"'.translate().format(lValue), 
                                action: function(){ 
                                    $scope.addFilter('first_name','ends_with',lValue, 'First name ends with "{0}"'.translate().format(lValue));
                                    $scope.buildFilters(); $scope.buildHints();
                                } 
                            });

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
            }
    
            /**
             * Build a price suggestions list
             * @param {string} $minOrMax Which suggestion list to build. Possible values : 'min' or 'max'
             */
            $scope.getPriceSuggestions = function($minOrMax){
                let lResult = [];
                let lMinPrice = $scope.min_price || 10000;
                let lMaxPrice = $scope.max_price || 500000;
                let lStartAt = 10000;
                let lEndsAt = 100000;
                let lStep = 10000;
    
                if($minOrMax=='max'){
                    lStartAt = Math.max(lMinPrice+50000,lMaxPrice-200000);
                    lEndsAt = lStartAt + 500000;
                    lStep = (lEndsAt-lStartAt)/10;
                }
                
                if($minOrMax=='min'){
                    lResult.push({value:'', label: 'Min'});
                }
    
                for(let $i=lStartAt;$i<=lEndsAt;$i+=lStep){
                    lResult.push({value: $i, label: $i.formatPrice()});
                }
                
                if($minOrMax=='max'){
                    lResult.push({value:'', label: 'Max'});
                }
                
    
                return lResult;
            }

            /* ----------------------
            
            INPUT HANDLING

            ------------------------- */
            
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
                
                if($value == ''){
                    // will remove filter for that price boundary
                    $scope.data[lInput + '_price'] = undefined;
                }
                else{
                    $scope.data[lInput + '_price'] = $value;
                }
                
                if($scope.selected_price_input=='min'){       
                    if($eventOrInput && (typeof $eventOrInput != 'string')){
                        // will keep the event bubbling up for "min" input
                        $eventOrInput.stopPropagation();
                        // switch to max input
                        $scope.selectPriceInput('max');
                    }
                }
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
                $scope.addFilter(
                    'main_unit.bedroom_count',
                    'greater_or_equal_to',$item.value, '{0}+ bedrooms'.translate().format($item.value),
                    function(){
                        $scope.setBedroomCount({value:''});
                    }                
                );
            }

            $scope.syncFiltersToUI = function(){
                let lListSync = {
                    "category_code" : "listing_category",
                    "subcategory_code" : "listing_subcategory",
                    "location.city_code" : "city",
                    "location.region_code" : "region",
                    "building.category_code" : "building_category"
                }

                if($scope.filter_group!=null && $scope.filter_group.filters != null){
                    $scope.filter_group.filters.forEach(function($e,$i){
                        // dictionary sync
                        if(lListSync[$e.field] != undefined){
                            let lDictionaryKey = lListSync[$e.field];
                            if($scope.dictionary[lDictionaryKey]){
                                $scope.syncToList($e, $scope.dictionary[lDictionaryKey]);
                            }
                        }
                        else if($e.label){
                            // sync
                            $scope.syncToList($e, $scope.listing_attributes);
                            $scope.syncToList($e, $scope.listing_states);
                        }
                    });
                }
            }

            /**
             * Synchronize list selection to filter
             * @param {object} $filter Filter bound to list
             * @param {object} $list List object or array
             */
            $scope.syncToList = function($filter, $list){
                // make sure list is an array
                let lListArray = $immodbUtils.toArray($list);
                
                lListArray.forEach(function($e){
                    // when filter is an array of value and item key is contained in that list
                    if($filter.operator=='in' && ($filter.value.indexOf($e.__$key)>=0)){
                        if(!$list[$e.__$key].selected) $list[$e.__$key].selected=true;
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
                $scope.addFilter($item.filter.field, $item.filter.operator, lValue, $item.caption.translate(),
                    function(){
                        $item.selected = '';
                        $scope.setState($item);
                    }
                );
            }


    
            /* ----------------------
            
            FILTER HINT BUILDING

            ------------------------- */


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
    
                    lResult.push({
                        item : 'PRICE', 
                        label: lPriceHint.join(' - '),
                        reverse: function(){
                            $scope.setPrice('','min');
                            $scope.setPrice('','max');
                        }
                    });
                }
    
                if($scope.query_text!=null){
                    lResult.push({
                        item: "QUERY_TEXT", 
                        label: 'Contains "{0}"'.translate().format($scope.query_text),
                        reverse: function(){
                            $scope.query_text = null;
                            $scope.buildFilters(); $scope.buildHints();
                        }
                    });
                }
    
                console.log('hint for data', $scope.data);
                if($scope.data.location!=null){
                    lResult.push({
                        item: "NEAR_ME", 
                        label: 'Near me'.translate(),
                        reverse: function(){
                            $scope.data.location = null;
                            $scope.buildFilters(); $scope.buildHints();
                        }
                    });
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
                    // dictionary
                    "category_code" : "listing_category",
                    "subcategory_code" : "listing_subcategory",
                    "location.city_code" : "city",
                    "location.region_code" : "region",
                    "building.category_code" : "building_category"
                }
                // filters that as a label
                if($group.filters != null){
                    $group.filters.forEach(function($e,$i){
                        let lList = null;
    
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
                                        $scope.addFilter($e.field,$e.operator, '');
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
                for(let $key in $list){
                    if($filter.operator=='in' && $filter.value.indexOf($key)>=0){
                        lResult.push({
                            item:$key, 
                            label: $list[$key].caption, 
                            reverse: function(){
                                $list[$key].selected = false;
                                $scope.addFilter($filter.field, 'in', $scope.getSelection($list))
                            }
                        });
                    }
                    else if ($list[$key].selected){
                        lResult.push({
                            item:$key, 
                            label: $list[$key].caption, 
                            reverse: function(){
                                $list[$key].selected = false;
                                $scope.addFilter($filter.field, 'equal', '')
                            }
                        });
                    }
                };
                return lResult;
            }
    
    
            /* ----------------------
            
            FILTER MANAGEMENT

            ------------------------- */

    
            /**
             * Check wether there's any filter or not
             * @return {boolean}
             */
            $scope.hasFilters = function(){
                return $scope.filter_group.filter_groups != null || $scope.filter_group.filters != null || $scope.query_text!=null || $scope.data.location !=null;
            }
    
            /**
             * Check if a filter matches a name
             * @param {string} $fieldname Name of the filter
             * @return {boolean} 
             */
            $scope.hasFilter = function($fieldname){
                if($scope.hasFilters()){
                    let lFilter = $scope.getFilterByFieldName($fieldname);
                    return lFilter != null;
                }
                else{
                    return false;
                }
            }

            /**
             * Get the value stored in a filter
             * @param {string} $fieldname Name of the filter
             * @return {*} Return the value when found, null otherwise
             */
            $scope.getFilterValue = function($fieldname){
                let lFilter = $scope.getFilterByFieldName($fieldname);
                if(lFilter!=null){
                    return lFilter.value;
                }
                return null;
            }
    
            /**
             * Get a filter by the field name associated to it
             * @param {string} $fieldname Name of the filter
             * @return {*} Return the filter when found, null otherwise
             */
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
    
            /**
             * Reset all filter to nothing
             */
            $scope.resetFilters = function(){
                $scope.filter_group = {
                    operator: 'and',
                    filters: null,
                    filter_groups: null
                };
                $scope.query_text = null;
                $scope.data.min_price = null;
                $scope.data.max_price = null;
                $scope.data.location = null;
    
                for(let $key in $scope.dictionary){
                    $scope.resetListSelections($scope.dictionary[$key]);
                }
                $scope.resetListSelections($s);
    
                // save filters to localStorage
                $scope.clearState();
    
                $scope.buildHints();
                $scope.buildFilters();
            }
    
            /**
             * Remove all 'selected' attribute from list elements
             * @param {object} $list List to reset
             */
            $scope.resetListSelections = function($list){
                for(let $subkey in $list){
                    delete $list[$subkey].selected;
                }
            }
    
            /**
             * Add a filter to the list
             * @param {*} $field Field name (or array of field name) on which the filter is applied
             * @param {string} $operator Operand for the filter
             * @param {*} $value Value to filter
             * @param {*} $label Caption for the filter hint
             * @param {*} $reverseFunc Function to remove the filter
             */
            $scope.addFilter = function($field,$operator,$value, $label, $reverseFunc){
                // When field is and array
                if(typeof($field.push)=='function'){
                    $scope.addFilterGroup($field, $operator, $value, $label);
                }
                else{
                    $scope.setFilter($field, $operator, $value, $scope.filter_group, $label,$reverseFunc);
                }
    
                // save filters to localStorage
                $scope.saveState();
    
                $scope.buildHints();
                $scope.buildFilters();
            }
    
            /**
             * Add a filter from an attribute
             * @param {object} $attr 
             */
            $scope.addAttributeFilter = function($attr){
                let lValue = $attr.selected ? true : '';
    
                $scope.addFilter(
                    $attr.field, 
                    'equal', 
                    lValue, 
                    $attr.caption.translate(),
                    function(){
                        console.log('reversin attr',$attr);
                        $attr.selected=false;
                        $scope.addFilter($attr.field,'equal','');
                    }
                );
            }
    
            $scope.addGeoFilter = function(){
    
                let lSaveAndBuild = function(){
                    // save filters to localStorage
                    $scope.saveState();
    
                    $scope.buildHints();
                    $scope.buildFilters();
                }
    
                if($scope.data.location != null){
                    $scope.data.location = null;
                    
                    lSaveAndBuild();
                }
                else{
                    navigator.geolocation.getCurrentPosition(function($position){
                        console.log($position);
                        $scope.data.location = {
                            latitude: $position.coords.latitude,
                            longitude: $position.coords.longitude,
                            distance : 5000 // set radius to 5Km
                        };
    
                        lSaveAndBuild();
                    });
                }
    
                
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
                    });
                }
                if($scope.filter_group.filter_groups.length==0){
                    $scope.filter_group.filter_groups = null;
                }
            };
    
            $scope.setFilter = function($field, $operator, $value, $group,$label,$reverseFunc){
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
                        $scope.addFilter($field,$operator, '')
                    }
                };
    
                for(lFilterIndex = 0; lFilterIndex < $group.filters.length; lFilterIndex++){
                    if($group.filters[lFilterIndex].field == $field){
                        break;
                    }
                }
                
                if($value==='' || $value==null){
                    $scope.removeFilter(lFilterIndex, $group);
                }
                else if (typeof($value.push)=='function' && $value.length == 0){
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
            $scope.clearState = function($item_key){
                let lKey = 'immodb.' + $scope.alias + '.{0}';
    
                if($item_key == undefined){
                    sessionStorage.removeItem(lKey.format('filter_group'));
                    sessionStorage.removeItem(lKey.format('data'));
                    sessionStorage.removeItem(lKey.format('st'));
                }
                else{
                    let lValue = $data;
                    if(typeof(lValue) == 'object'){
                        lValue = JSON.stringify(lValue);
                    }
                    sessionStorage.removeItem(lKey.format($item_key));
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
                        $scope.data.keyword = '';
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
    
                        if($scope.data.location != null){
                            lResult.proximity_filter = $scope.data.location;
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
                            $resolve($scope.configs);
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
            // $scope.$watch("alias", function(){
            //     if($scope.alias!=null){
            //         $scope.init();
            //     }
            // });
    
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
            
            $scope.$watch("dictionary", function(newValue, oldValue){
                if($scope.dictionary!=undefined && $scope.dictionary.region!=undefined){
                    let lRegionList = $immodbUtils.toSortedArray($scope.dictionary.region);
                    console.log('lRegionList',lRegionList);
                    $scope.tab_region = lRegionList[0].__$key;
                }
            });
        }
    };
});

ImmoDbApp
.directive('immodbMap', function immodbMap( $immodbTemplate, $immodbUtils, $immodbDictionary){
    let dir_controller = 
    function($scope, $q, $immodbApi, $rootScope){
        $scope.ready = false;
        $scope.is_visible = false;
        $scope.zoom = 8;
        $scope.is_loading_data = false;
        $scope.late_init = true;
        $scope.markers = [];
        $scope.markerCluster = null;
        $scope.bounds = null;
        $scope.client = {
            search_token : null
        };

        $scope.permalink = '';

        $scope.$onInit = function(){
            console.log('init', $scope);
            if($scope.latlng!=null){
                $scope.mapInit();
            }
            else{
                $scope.$on('immodb-{0}-display-switch-map'.format($scope.alias), $scope.onSwitchToMap);
                $scope.$on('immodb-{0}-display-switch-list'.format($scope.alias), $scope.onSwitchToList);
            }

            $rootScope.$on($scope.alias + 'FilterTokenChanged', $scope.onFilterTokenChanged);
        }

        $scope.mapInit = function(){
            if($scope.ready == false){
                
                let options = {
                    center: new google.maps.LatLng(45.6025503,-73.8469538),
                    zoom: $scope.zoom,
                    //disableDefaultUI: true    
                }
                
                $scope.map = new google.maps.Map(
                    $scope.viewport_element, options
                );


                $scope.ready = true;

            }
        }

        $scope.setZoom = function($zoom){
            $scope.map.setZoom($zoom);
        }

        /**
         * Main entry function to get the list
         * Will update the searchToken if required by client overrides
         */
        $scope.getList = function(){
            if($scope.is_loading_data==false){
                $scope.search($scope.getSearchToken());
            }
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
                console.log('update list');
                $scope.getList();
            })
        }
        $scope.onSwitchToMap = function(){
            $scope.mapInit();
            console.log('map initialized');
            if($scope.bounds){
                console.log('fit to bounds', $scope.bounds);
                window.setTimeout(function(){
                    $scope.map.fitBounds($scope.bounds);
                }, 250);
            }
            if($scope.markers.length==0){
                $scope.getList();
            }
            $scope.is_visible = true;
        }
        $scope.onSwitchToList = function(){
            $scope.is_visible = false;
        }

        /**
         * Call the API and return the list 
         * @param {string} $token Search token
         */
        $scope.search = function($token){
            lParams = {'st': $token};
            $scope.page_index = 0;
            $scope.is_loading_data = true;
            $immodbApi.api($scope.getEndpoint() + 'map_markers', lParams,{method:'GET'}).then(function($response){
                $scope.list = $response.markers;
                $scope.updateMarkerList()
                console.log('marker list:', $scope.list);
                $scope.is_loading_data = false;
            })
            
        }
        
        /**
         * Get the api endpoint matching the config type
         */
        $scope.getEndpoint = function(){
            let lOrigin = $scope.getEndpointType();
            return lOrigin.concat('/view/',$scope.configs.source.id,'/');
        }

        $scope.getEndpointType = function(){
            let lResult = $scope.configs.type;
            switch(lResult){
                case 'listings':
                    lResult = 'listing';break;
                case 'brokers':
                    lResult = 'broker';break;
                case 'cities':
                    lResult = 'city';break;
            }
            return lResult;
        }

        $scope.clear = function(){
            if($scope.markers){
                $scope.markers.forEach(function($m){
                    $m.setMap(null);
                });
            }

            if($scope.markerCluster != null){
                $scope.markerCluster.clearMarkers();
            }
            $scope.markers = [];
        }

        $scope.addSingleMarker = function($location) {
            console.log('adding single marker at', $location);
            
            $scope.clear();
            $scope.markers.push(new google.maps.Marker({
                map: $scope.map,
                position: $location,
                animation: google.maps.Animation.DROP
            }));
            $scope.map.setCenter($location);
        }

        $scope.updateMarkerList = function(){
            $scope.clear();
            $scope.bounds = new google.maps.LatLngBounds();
            
            console.log($scope.list[0]);

            $scope.list.forEach(function($marker){
                let lngLat = new google.maps.LatLng($marker.latitude, $marker.longitude);
                
                $marker.marker = new ImmoDbMarker({
			    	position: lngLat,
			    	map: $scope.map,
                    obj: $marker,
			    	markerClass: ['map-marker-icon',$marker.category_code.replace(' ','_')],
			    	onPinClick: $scope.pinClick
                });
                
		    	$scope.markers.push($marker.marker);
		    	$scope.bounds.extend($marker.marker.getPosition());
            });

            if($scope.list.length>1){
		    	$scope.markerCluster = new MarkerClusterer($scope.map, $scope.markers,
                        {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
                
                if($scope.is_visible == true){
                    window.setTimeout(function(){
                        $scope.map.fitBounds($scope.bounds);
                    },250);
                }
		    }
		    else{
                $scope.map.setCenter($scope.list[0].marker.getPosition());
                $scope.map.setZoom(12);
            }
            
            console.log('Map markers updated');
        }

        $scope.pinClick = function($marker){
            console.log('Marker clicked', $marker);

            $immodbApi.api($scope.getEndpointType().concat('/',$marker.obj.id,'/',immodbApiSettings.locale)).then(function($response){
                let lInfoWindowScope = $immodbUtils;
                $immodbDictionary.source = $response.dictionary;
                lInfoWindowScope.item = $response;

                console.log(lInfoWindowScope);
                $immodbTemplate.load('views/ang-templates/immodb-map-info-window.html', lInfoWindowScope).then(function($content){
                    let infowindow = new google.maps.InfoWindow({
                        content: $content
                    });
                    
                    infowindow.open($scope.map, $marker);
                });

            });

            
        }


        $scope.isReady = function(){
            let lPromise = $q(function($resolve,$reject){
                if($scope.ready==true){
                    $resolve();
                }
                else{
                    $scope.$watch('ready', function(){
                        if($scope.ready==true){
                            $resolve();
                        }
                    });
                }
            });

            return lPromise;
        }

        $scope.$watch('latlng', function(){
            if($scope.latlng != null && $scope.latlng.lat!=undefined){
                console.log('latlng', $scope.latlng);
                $scope.isReady().then(function(){
                    $scope.addSingleMarker($scope.latlng);
                });
            }
        });

        $scope.$watch('zoom', function(){
            if($scope.zoom != null){
                $scope.isReady().then(function(){
                    $scope.setZoom(Number($scope.zoom));
                });
            }
        });


        function ImmoDbMarker(options) {

            // Initialize all properties.
            this.latlng_ = options.position;
            this.markerClass = options.markerClass;
            this.onClick = options.onPinClick;
            this.obj = options.obj;
            // Define a property to hold the image's div. We'll
            // actually create this div upon receipt of the onAdd()
            // method so we'll leave it null for now.
            this.div_ = null;
            this.title = options.title;
  
            // Explicitly call setMap on this overlay.
            this.setMap(options.map);
        }
        ImmoDbMarker.prototype = new google.maps.OverlayView();
		(function($proto){
			$proto.draw = function() {
			  	var me = this;
			    var div = this.div_;
			    

			    var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
			    if (point) {
			      div.style.left = point.x + 'px';
			      div.style.top = point.y + 'px';
			    }
			};
			
			$proto.onAdd = function() {
				var me = this;
				div = this.div_ = document.createElement('DIV');
				div.style.border = "none";
				div.style.position = "absolute";
				div.style.paddingLeft = "0px";
				div.style.cursor = 'pointer';
                //you could/should do most of the above via styling the class added below
                this.markerClass.forEach(function($c){
                    div.classList.add($c.toLowerCase());
                })
								
				google.maps.event.addDomListener(div, "click", function(event) {

					if(typeof(me.onClick)=='function'){
						me.onClick(me);
					}
					//google.maps.event.trigger(me, "click");
				});

				var panes = this.getPanes();
				panes.overlayImage.appendChild(div);
			};
			
			$proto.onRemove = function() {
				if(this.div_ != null){
					this.div_.parentNode.removeChild(this.div_);
			  		this.div_ = null;
				}
			};

			// Set the visibility to 'hidden' or 'visible'.
			$proto.hide = function() {
			  if (this.div_) {
			    // The visibility property must be a string enclosed in quotes.
			    this.div_.style.visibility = 'hidden';
			  }
			};

			$proto.show = function() {
			  if (this.div_) {
			    this.div_.style.visibility = 'visible';
			  }
			};

			$proto.toggle = function() {
			  if (this.div_) {
			    if (this.div_.style.visibility === 'hidden') {
			      this.show();
			    } else {
			      this.hide();
			    }
			  }
			};

			$proto.getPosition = function(){
				return this.latlng_;
			}

			// Detach the map from the DOM via toggleDOM().
			// Note that if we later reattach the map, it will be visible again,
			// because the containing <div> is recreated in the overlay's onAdd() method.
			$proto.toggleDOM = function() {
			  if (this.getMap()) {
			    // Note: setMap(null) calls OverlayView.onRemove()
			    this.setMap(null);
			  } else {
			    this.setMap(this.map_);
			  }
			};

		})(ImmoDbMarker.prototype);
    };


    return {
        restrict: 'E',
        replace: true,
        scope: {
            alias: '@immodbAlias',
            class: '@class',
            configs: '=?immodbConfigs',
            latlng: '=?latlng',
            zoom: '@'
        },
        controllerAs: 'ctrl',
        template: '<div><div id="map-{{alias}}" class="viewport"></div></div>',
        controller: dir_controller,
        link: function($scope, element){
            $scope.viewport_element = element.children()[0];
            $scope.$onInit();
        }
    };
});

ImmoDbApp
.directive('onBottomReached', function onBottomReached($document) {
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
.directive('immodbImageSlider', function immodbImageSlider(){
    let dir_controller = function immodbImageSliderCtrl ($scope, $q,$immodbApi,$rootScope) {
        $scope.expand_mode = false;

        $scope.position = {
            current_picture_index : 0
        };

        $scope.init = function(){
            $scope.index = 0;            
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
.directive('immodbCalculator', function immodbCalculator(){
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
        controller: function($scope, $q,$rootScope) {
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
    
            
        }
    };
});

ImmoDbApp
.directive('immodbModal', function immodbModal(){
    let dir_controller = function immodbModalCtrl($scope, $q,$immodbApi,$rootScope) {

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

ImmoDbApp
.directive('immodbContainer', function immodbContainer(){
    return {
        restrict: "E",
        replace: true,
        transclude: true,
        scope:true,
        template: '',
        controller: function($element, $transclude) {
            $element.append($transclude());
        }
    };
})


/* ------------------------------- 
        FACTORIES
-------------------------------- */
ImmoDbApp
.factory('$immodbTemplate', ["$http", "$q", "$interpolate", "$sce", 
function $immodbTemplate($http, $q, $interpolate, $sce){
        let $scope = {};

        $scope.load = function($path, $template_scope){
            let templateUrl = $sce.getTrustedResourceUrl(immodbCtx.base_path + $path);
            let lPromise = $q(function($resolve, $reject){
                $http.get(templateUrl).then(function($response) {
                    let lContent = $scope.interpolate($response.data, $template_scope);
                    $resolve(lContent);
                });
            });

            return lPromise;
        }

        $scope.interpolate = function($content,$template_scope){
            return $interpolate($content)($template_scope)
        }

        return $scope;
}]);

ImmoDbApp
.factory('$immodbApi', ["$http","$q","$immodbConfig", 
function $immodbApi($http,$q,$immodbConfig){
    let $scope = {};
    
    $scope.viewMetas = {};

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

    $scope.rest = function($path, $data, $options){
        return $scope.rest_call($path, $data, $options);
    }


    /**
     * Check wether the auth token is valid or not
     * @return {bool} Return true if the token is still valid, false otherwise
     */
    $scope.tokenIsValid = function(){
        let lNow = new Date();
        // token is not defined
        if($scope.auth_token==null){
            let lStoredToken = localStorage.getItem('immodb.auth_token');
            if(lStoredToken != null){
                $scope.auth_token = JSON.parse(lStoredToken);
            }
            else{
                return false;
            }
        }
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
                $scope.rest_call('access_token').then(function($reponse){
                    $scope.auth_token = $reponse;
                    localStorage.setItem('immodb.auth_token', JSON.stringify($scope.auth_token));
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
                $resolve(JSON.parse($response));
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
            $immodbConfig.get().then(function($configs){
                let lResult = null;
                console.log($configs);
                $configs.lists.some(function($e){
                    if($e.alias == $alias){
                        lResult = $e;
                        return true;
                    }
                });

                $resolve(lResult);
            });
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
        let lViewMetaKey = $type + '::' + $view_id;
        switch(lOrigin){
            case 'listings':
                lOrigin = 'listing';break;
            case 'brokers':
                lOrigin = 'broker';break;
            case 'cities':
                lOrigin = 'city';break;
        }
        let lEndPoint = ''.concat('view/',$view_id,'/',immodbApiSettings.locale);
        
        let lPromise = $q(function($resolve, $reject){
            // View is defined, therefor loaded
            if($scope.viewMetas[lViewMetaKey] != undefined && $scope.viewMetas[lViewMetaKey].loading==undefined){
                $resolve($scope.viewMetas[lViewMetaKey]);
            }
            // View is currently loading, wait for data
            else if ($scope.viewMetas[lViewMetaKey] != undefined && $scope.viewMetas[lViewMetaKey].loading==true){
                let fnWait = function(){
                    if($scope.viewMetas[lViewMetaKey].loading==true){
                        window.setTimeout(fnWait, 15);
                    }
                    else{
                        $resolve($scope.viewMetas[lViewMetaKey]);
                    }
                }
                fnWait();
            }
            else{
                $scope.viewMetas[lViewMetaKey] = {loading:true};
                $scope.api(lEndPoint).then(function($response){
                    $scope.viewMetas[lViewMetaKey] = $response;
                    $resolve($response);
                });
            }
            
        });

        return lPromise;        
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
            data : $data
        }, $options);


        if($options.method=='GET'){
            if($options.data!=null){
                $options.params = $options.data;
                $options.data = null;
            }
        }
        if(typeof $options.params == 'undefined'){$options.params = {};}
        $options.params.at = $scope.auth_token.key;

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

    $scope.rest_call = function($path, $data, $options){
        $options = angular.merge({
            url     : immodbApiSettings.rest_root + 'immodb/' + $path,
            method  : (typeof($data)=='undefined' || $data==null) ? 'GET' : 'POST',
            data : $data,
            headers: {
                'X-WP-Nonce': immodbApiSettings.nonce
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
.factory('$immodbDictionary', 
function $immodbDictionary(){
    let $scope = {};


    $scope.source = null;
    $scope.init = function($source){
        $scope.source = $source;
        //$scope.sortData();
    }

    $scope.sortData = function(){
        for(let lGroup in $scope.source){
            $scope.source[lGroup] = $scope.sortCollection($scope.source[lGroup]);
        }
    }

    $scope.sortCollection = function($coll){
        // turn collection into array
        let lCollArray = $scope._toArray($coll);

        // sort over caption
        lCollArray.sort(function(a,b) {
            if(a.__data.caption <= b.__data.caption){
                return -1;
            }
            else{
                return 1;
            }
        });
        console.log('immodbDictionary array sorted', lCollArray);
        
        // turn array back to collection
        let lResult = $scope._toObject(lCollArray);

        console.log('immodbDictionary sorted collection', lResult);
        return lResult;
    }

    $scope._toArray = function($object){
        let lResult = [];
        for(let $key in $object){
            lResult.push({__key: $key.toString(), __data: $object[$key]});
        }

        return lResult;
    }

    $scope._toObject = function($array){
        let lResult = {};
        $array.forEach(function($e){
            lResult[$e.__key] = $e.__data;
        });

        return lResult;
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
});

ImmoDbApp
.factory('$immodbUtils', ['$immodbDictionary', '$immodbTemplate', '$interpolate' , 
function $immodbUtils($immodbDictionary,$immodbTemplate, $interpolate){
    let $scope = {};

    $scope.configs = null;

    /** 
     * Get the caption matching key and domain from the dictionary
     * @param {string} $key Key code of the dictionary item
     * @param {string} $domain Group key that (should) hold the item
     * @return {string} Caption matched or the key in case the something's missing or went wrong
     */
    $scope.getCaption = function($key, $domain, $asAbbr){
        return $immodbDictionary.getCaption($key,$domain,$asAbbr);
    }

    /**
     * Format the price of the listing for pretty reading
     * @param {object} $item Listing data object
     * @param {string} $format Return format. Supported values short|long
     */
    $scope.formatPrice = function($item, $format){
        $format = $format!=undefined ? $format : 'short';

        let lResult = [];
        if($item.status_code=='SOLD'){
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
                    lPart.push($scope.getCaption($item.price[$key].unit_code,'price_unit',true))
                }

                if($format == 'long'){
                    let lStart = 'for {0} for '.format($key).translate();
                    lResult.push(lStart + lPart.join('/'));
                }
                else{
                    lResult.push(lPart.join('/'));
                }
            }
        }
        
        let lSeperator = ' or '.translate();

        return lResult.join(lSeperator);
    }

    /**
     * Get permalink of the listing item
     * @param {object} $item Listing data object
     */
    $scope.getPermalink = function($item){
        let lRoute = '';
        $scope.item = $item;
        immodbCtx.listing_routes.forEach(function($r){
            if($r.lang==immodbCtx.locale){
                lRoute=$r;
            }
        });

        return $immodbTemplate.interpolate(lRoute.route, $scope);
    }

    /**
     * Take a string and process it into Angular binding
     * @param {string} $text Source string to evaluate
     * @param {object} $context Scope object used for interpolation
     */
    $scope.evaluate = function($text, $context){
        return $interpolate($text)($context);
    }

    /**
     * Compile data to ease access to some values
     * @param {array} $list Array of listing item
     */
    $scope.compileListingList = function($list){
        $list.forEach(function($e){
            $e.location.city = $scope.sanitize($scope.getCaption($e.location.city_code, 'city'));
            $e.location.region = $scope.sanitize($scope.getCaption($e.location.region_code, 'region'));
            $e.transaction = $scope.getTransaction($e,true);
            $e.location.civic_address = '{0} {1}'.format(
                                                        $e.location.address.street_number,
                                                        $e.location.address.street_name
                                                    );
        });

        return $list;
    }

    /**
     * Build listing class list
     * @param {object} $item Listing data object
     */
    $scope.getClassList = function($item){
        let lResult = [];
        if($item != null){
            if($item.status_code=='SOLD'){
                lResult.push('sold');
            }
        }
        return lResult.join(' ');
    }

    /**
     * Return the city name for the listing
     * @param {object} $item Listing data object
     * @param {boolean} $sanitize Wheter or not the return value is sanitized
     */
    $scope.getCity = function($item, $sanitize){
        $sanitize = ($sanitize==undefined)?true:$sanitize;
        let lResult = $scope.getCaption($item.location.city_code, 'city');

        if($sanitize){
            lResult = $scope.sanitize(lResult);
        }

        return lResult;
    }

    /**
     * Return the region name for the listing
     * @param {object} $item Listing data object
     * @param {boolean} $sanitize Wheter or not the return value is sanitized
     */
    $scope.getRegion = function($item, $sanitize){
        $sanitize = ($sanitize==undefined)?true:$sanitize;
        let lResult =  $scope.getCaption($item.location.region_code, 'region');

        if($sanitize){
            lResult = $scope.sanitize(lResult);
        }
        
        return lResult;
    }

    /**
     * Return the transaction caption for the listing
     * @param {object} $item Listing data object
     * @param {boolean} $sanitize Wheter or not the return value is sanitized
     */
    $scope.getTransaction = function($item, $sanitize){
        $sanitize = ($sanitize==undefined)?false:$sanitize;
        let lResult = [];
        for(var $key in $item.price){
            if($key!='foreclosure'){
                let lTrans = ('To ' + $key).translate();
                if($sanitize){
                    lTrans = $scope.sanitize(lTrans);
                }
                lResult.push(lTrans);
            }
        }

        return lResult.join(' ' + 'or'.translate() + ' ');
    }

    /**
     * Remove or replace any special character
     * @param {string} $value Text to be sanitize
     */
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


    /**
     * Convert an object to an array of its attributes
     * @param {object} $object Object to convert
     */
    $scope.toArray = function($object){
        if (!angular.isObject($object)) return $object;
        let lResult = [];
        for(let objectKey in $object) {
            $object[objectKey].__$key = objectKey;
            lResult.push($object[objectKey]);
        }
        return lResult;
    }

    
    /**
     * Sort an array by the specified attribute
     * @param {object} $object Object to convert
     * @param {string} $attr Optional. Attribute to sort over. Default: caption
     */
    $scope.toSortedArray = function($object, $attr){
        $attr = ($attr==undefined) ? 'caption':$attr;
        // convert to array if the object is an object
        let lResult = $scope.toArray($object);

        lResult.sort(function(a, b){
            // Number
            if(!isNaN(a[$attr])){
                a = parseInt(a[$attr]);
                b = parseInt(b[$attr]);
                return a - b;
            }
            // String 
            else if (a[$attr] <= b[$attr]){
                return -1;
            }
            else{
                return 1;
            }
        });

        return lResult;
    }

    return $scope;
}]);

ImmoDbApp
.factory('$immodbConfig',['$http','$q',
function $immodbConfig($http, $q){
    let $scope = {};

    $scope._data = null;
    $scope._loading = false;

    $scope.init = function(){
        $scope.get();
    }

    $scope.get = function(){
        let lPromise = $q(function($resolve, $reject){
            console.log('on get $scope._data:',$scope._data,'loading:',$scope._loading);
            // in case the script is already loading, wait for data to load
            if($scope._loading==true){
                let fnWait = function(){
                    if($scope._loading==true){
                        window.setTimeout(fnWait, 50);
                    }
                    else{
                        $resolve($scope._data);
                    }
                }
                fnWait();
            }
            else{
                if($scope._data!=null){
                    $resolve($scope._data);
                }
                else{
                    $scope._loading = true;
                    $http.get(immodbCtx.config_path).then(function($response){
                        if($response.status==200){
                            $scope._data = $response.data;
                            $scope._loading = false;
    
                            $resolve($scope._data);
                        }
                        else{
                            $reject();
                        }
                    });
                }
            }
            
        });

        return lPromise;
    }

    $scope.init();


    return $scope;
}
])


/* ------------------------------- 
        FILTERS
-------------------------------- */

ImmoDbApp
.filter('range', function rangeFilter(){
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

ImmoDbApp
.filter('asArray', function asArrayFilter(){
    return function($object){
        let lResult = [];
        if($object){
            for(key in $object){
                if(typeof $object[key] !== 'function'){
                    $object[key].__$key = key;
                    lResult.push($object[key]);
                }
            }
        }
        
        return lResult;
    }
});

ImmoDbApp
.filter('orderObjectBy', function orderObjectByFilter(){
    return function(input, attribute) {
        
        if (!angular.isObject(input)) return input;
        var array = [];
        for(var objectKey in input) {
            input[objectKey].__$key = objectKey;
            array.push(input[objectKey]);
        }
   
        array.sort(function(a, b){
            if(!isNaN(a[attribute])){
                a = parseInt(a[attribute]);
                b = parseInt(b[attribute]);
                return a - b;
            }
            else if (a[attribute] <= b[attribute]){
                return -1;
            }
            else{
                return 1;
            }
        });

        return array;
    }
   });
