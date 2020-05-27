
/* ------------------------------- 
        DIRECTIVES
-------------------------------- */




/**
 * DIRECTIVE: LIST
 * usage: <si-list si-alias="default"></si-list>
 * @param {string} siAlias List alias name. Required
 * @param {string} class CSS class to add to template
 */
siApp
.directive('siList', ['$siFavorites', '$siConfig', '$siList',
function siList(){
    return {
        restrict: 'E',
        scope: {
            alias: '@siAlias',
            class: '@siClass'
        },
        controllerAs: 'ctrl',
        template: '<div ng-include="\'si-template-for-\' + alias" class="{{class}}"></div>',
        link : function($scope){
            $scope.init();
        },
        controller: function ($scope, $q,$siApi,$rootScope,$siDictionary, $siUtils,$siFavorites,$siConfig,$siList) {
            $scope.configs = null;
            $scope._global_configs = null;
            $scope.current_view = null;
            $scope.list = null;
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
            $scope.city_list = [];
            $scope.region_list = [];
            $scope.subcategory_list = [];
            $scope.client_sort = null;
            $scope.favorites = $siFavorites;
            
            /**
             * Initialize the controller
             */
            $scope.init = function(){
                $scope.ghost_list = [];
                for(let $i = 0;$i<12; $i++){
                    $scope.ghost_list.push({
                        location :{city:'City',civic_address: '00 address', region: 'Region'},
                        price: {sell:{amount:0}},
                        
                        category: 'Category',
                        subcategory: 'Subcategory',
                        ref_number: 'XXXXXX',
                        first_name: 'First name',
                        last_name: 'Last name',
                        license_type : 'License type',
                        listing_count: 0,
                        office: {name : 'Office'},
                        email: 'email@example.com',
                        phones:{mobile:'555-555-5555'},
                        description : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.'
                        
                    });
                }
                

                $rootScope.$on($scope.alias + 'FilterTokenChanged', $scope.onFilterTokenChanged);
                
                $scope.$on('si-{0}-display-switch-map'.format($scope.alias), function(){
                    $scope.display_mode = 'map';
                });

                $scope.$on('si-{0}-display-switch-list'.format($scope.alias), function(){
                    $scope.display_mode = 'list';
                });

                $scope.$on('si-{0}-view-change'.format($scope.alias), function($event, $newView){
                    $scope.current_view = $newView;
                    $scope.getList();
                })

                $scope.$on('auth_token_refresh', function(){
                    sessionStorage.removeItem('si.list.{0}.{1}'.format($scope.configs.type,siCtx.locale));
                    sessionStorage.removeItem('si.listMeta.{0}.{1}'.format($scope.configs.type,siCtx.locale));
                    sessionStorage.removeItem('si.pageIndex.{0}.{1}'.format($scope.configs.type,siCtx.locale));
                });

                $siApi.getListConfigs($scope.alias).then(function($configs){
                    $scope.configs = $configs;
                    $scope.current_view = $configs.source.id;

                    let lClientSearchToken = sessionStorage.getItem("si.{0}.st".format($scope.configs.alias));
                    if(lClientSearchToken!=undefined){
                        $scope.client.search_token = lClientSearchToken;
                    }

                    $siApi.renewToken().then(function(){
                        $scope.start();
                    });
                });
            }

            $scope.getCurrentView = function(){
                if($scope.current_view != null) return $scope.current_view;
                if($scope.configs != null){
                    return $scope.configs.source.id;
                }
                if($scope._global_configs != null){
                    return $scope._global_configs.default_view
                }
            }

            $scope.hasMapKeyApi = function(){
                if($scope._global_configs == undefined) return false;
                if($scope._global_configs == null) return false;
                if($scope._global_configs.map_api_key == '') return false;

                return true;
            }
            
            /**
             * Start the loading process
             */
            $scope.start = function(){
                //return;
                $siConfig.get().then(function($global_configs){
                    // Prepare Api
                    $scope._global_configs = $global_configs;

                    const lPrerequisites = {};
                    lPrerequisites.meta = function(){return $siApi.getViewMeta($scope.configs.type,$scope.configs.source.id)};
                    lPrerequisites.pages = function() {
                        if(!$global_configs.enable_custom_page) return null;
                        return $siApi.rest_call('page/list',{locale: siCtx.locale, type: $scope.configs.type},{method:'GET'})
                    };
                    lPrerequisites.offices = function(){
                        if($scope.configs.type!='brokers') return null;
                        const lViewId = $scope.current_view != null ? $scope.current_view : $global_configs.default_view;
                        return $siApi.call('office/view/' + lViewId + '/fr/items');
                    }

                    $siUtils.all(lPrerequisites)
                    .then(function($responses){
                        //console.log('list Start', $responses);
                        // init dictionary
                        $siDictionary.init($responses.meta.dictionary);
                        $scope.dictionary = $responses.meta.dictionary;
                        $siUtils.page_list = $responses.pages || null;
                        $siList.offices = $responses.offices ? $responses.offices.items : [];

                        $scope.is_ready = true;
                        // load data
                        $scope.getList();
                    })
                });
            }
            /**
             * Load list
             */
            $scope.getList = function(){
                let lVer = 1;
                let lSearchToken = $scope.getSearchToken();

                // search for data with search token
                if(lSearchToken == $scope.configs.search_token 
                    && typeof $preloadDatas != 'undefined'
                    && typeof $preloadDatas[$scope.configs.alias] != 'undefined'){
                    //console.log('loading from preloaded data');
                    const lItems = $preloadDatas[$scope.configs.alias].items;

                    if(typeof $scope._preloadedList == 'undefined'){
                        //console.log('compile list');
                        if($scope.configs.type=='listings'){
                            $scope._preloadedList = $siUtils.compileListingList(lItems);
                        }
                        else{
                            $scope._preloadedList = $siUtils.compileBrokerList(lItems);
                        }
                        //console.log('compile done');
                    }
                    
                    $scope.list = $scope._preloadedList;
                    //console.log('preloaded data applied',$scope.list.length);
                    
                    $scope.ghost_list = [];

                    $scope.listMeta = $preloadDatas[$scope.configs.alias].metadata;
                    $scope.page_index = 0;
                    $rootScope.$broadcast('si-list-loaded');
                    $rootScope.$broadcast('si-' + $scope.configs.type + '-update', $scope.list,$scope.listMeta);
                    $scope.$emit('si-' + $scope.configs.type + '-update', $scope.list,$scope.listMeta);


                    return true;
                }

                $scope.search(lSearchToken);
            }
    
            /**
             * Get the search token
             * Return the client token if user has interact with the search engine
             */
            $scope.getSearchToken = function(){
                if($scope.client.search_token != null){
                    //console.log('return client st', $scope.client.search_token)
                    return $scope.client.search_token;
                }
                //console.log('return config st', $scope.configs.search_token);
                return $scope.configs.search_token;
            }
            
            /**
             * Event handler triggers when a new search token is thrown
             * @param {object} $event Event object
             * @param {string} $newToken New search token
             */
            $scope.onFilterTokenChanged = function($event, $newToken){
                if($newToken == $scope.configs.search_token){
                    $scope.client.search_token = null;
                }
                else{
                    $scope.client.search_token = $newToken; // save search token
                }
                
                // When ready, get data
                $scope.isReady().then(function(){
                    // clear list stored in session
                    if($scope.getLatestSearchToken() != $newToken){
                        //console.log('clear latest st for ', $newToken);
                        sessionStorage.removeItem('si.{0}.latestSearchToken.{1}'.format($scope.configs.alias, siCtx.locale));
                        sessionStorage.removeItem('si.list.{0}.{1}'.format($scope.configs.type,siCtx.locale));
                    }
                    
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
    
            $scope.setLoadingState = function($is_loading){
                $scope.is_loading_data = $is_loading;
                try{
                    $scope.$digest();
                }
                catch(error){}

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
                if($scope.display_mode!='list'){
                    return;
                }
                // 
                if(!$scope.loadListFromStorage($scope.configs.type)){
                    // lock loading to prevent call overlaps
                    if($scope.is_loading_data == false){
                        $scope.setLoadingState(true);
                        
                        $siApi.api($scope.getEndpoint() + '/items', lParams,{method:'GET'}).then(function($response){
                            // set list/meta
                            const lSingularType = $siUtils.getSingularType($scope.configs.type,false);
                            if(lSingularType != null){
                                const lCompileMethod = 'compile{0}List'.format(lSingularType);
                                if(typeof $siUtils[lCompileMethod] == 'function'){
                                    $siUtils[lCompileMethod]($response.items);
                                }
                            }
                            $scope.list = $response.items;
                            $scope.ghost_list = [];
                            
                            $scope.listMeta = $response.metadata;
                            // unlock
                            $scope.setLoadingState(false);
                            // broadcast new list
                            $rootScope.$broadcast('si-list-loaded');
                            $rootScope.$broadcast('si-' + $scope.configs.type + '-update', $scope.list,$scope.listMeta);
                            $scope.$emit('si-' + $scope.configs.type + '-update', $scope.list,$scope.listMeta);

                            // print list to console for further information
                            $scope.saveListToStorage($scope.configs.type);

                            // save latest search token
                            $scope.saveLatestSearchToken($token);

                        });
                    }
                }
                else{
                    $rootScope.$broadcast('si-list-loaded');
                    $rootScope.$broadcast('si-' + $scope.configs.type + '-update', $scope.list,$scope.listMeta);
                    $scope.$emit('si-' + $scope.configs.type + '-update', $scope.list,$scope.listMeta);
                }
            }

            /**
             * Check wether loading the next page of list is required or not
             */
            $scope.checkNextPage = function(){
                if($scope.display_mode!='list'){
                    return;
                }

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
            $scope.showNextPage = function($reset){
                $reset = typeof($reset)=='undefined'?false:$reset;

                lParams = {
                    'st': $scope.listMeta.search_token, // set search token
                    'nt': $scope.listMeta.next_token    // set next page token
                };

                if(!$scope.is_loading_data){
                    // lock loading to prevent call overlaps
                    $scope.setLoadingState(true);
                    $siApi.api($scope.getEndpoint() + '/items', lParams,{method:'GET'}).then(function($response){
                        let lNewItems = $response.items;
                        if($scope.configs.type=='listings'){
                            lNewItems = $siUtils.compileListingList(lNewItems);
                        }
                        else{
                            lNewItems = $siUtils.compileBrokerList(lNewItems);
                        }

                        $scope.list = $scope.list.concat(lNewItems);
                        
                        $scope.listMeta = $response.metadata;
                        // increment page index
                        $scope.page_index++;
                        // broadcast new list
                        $rootScope.$broadcast('si-list-loaded');
                        $scope.$emit('si-' + $scope.configs.type + '-update', $scope.list,$scope.listMeta);
                        // unlock
                        window.setTimeout(function(){
                            $scope.setLoadingState(false);
                        },500);

                        if($reset){
                            $scope.page_index = 0;
                        }

                        $scope.saveListToStorage($scope.configs.type);
                    });
                }
                
            }
            
            $scope.loadListFromStorage = function($type){
                let lListDate = sessionStorage.getItem('si.list.date.{0}.{1}'.format($type,siCtx.locale));
                if(lListDate==undefined){
                    return false;
                }
                else{
                    lListDate = new Date(Date.parse(lListDate));
                    let lNow = moment();
                    if(lNow.diff(lListDate,'minutes')>10){
                        return false;
                    }
                }

                let lList = sessionStorage.getItem('si.list.{0}.{1}'.format($type,siCtx.locale));
                let lListMeta = sessionStorage.getItem('si.listMeta.{0}.{1}'.format($type,siCtx.locale));
                let lPageIndex = sessionStorage.getItem('si.pageIndex.{0}.{1}'.format($type,siCtx.locale));
                
                if (lList != undefined){
                    $scope.list = JSON.parse(lList);
                    $scope.listMeta = JSON.parse(lListMeta);
                    $scope.page_index = lPageIndex;
                    
                    $rootScope.$broadcast('si-list-loaded');
                    return true;
                }
                return false;
            }

            /**
             * Save list to storage
             * @param {string} $type Type of the list
             */
            $scope.saveListToStorage = function($type){
                sessionStorage.setItem('si.list.{0}.{1}'.format($type,siCtx.locale), JSON.stringify($scope.list));
                sessionStorage.setItem('si.listMeta.{0}.{1}'.format($type,siCtx.locale), JSON.stringify($scope.listMeta));
                sessionStorage.setItem('si.pageIndex.{0}.{1}'.format($type,siCtx.locale), $scope.page_index);
            }

            $scope.getLatestSearchToken = function(){
                return sessionStorage.getItem('si.{0}.latestSearchToken.{1}'.format($scope.configs.alias,siCtx.locale));
            }

            $scope.saveLatestSearchToken = function($token){
                sessionStorage.setItem('si.{0}.latestSearchToken.{1}'.format($scope.configs.alias,siCtx.locale), $token);
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
                const lViewId = $scope.getCurrentView();
                return lOrigin.concat('/view/',lViewId,'/',siApiSettings.locale);
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
                $scope.client_sort = 'price_' + ($more_to_least ? 'desc' : 'asc');
                let lNewSortFields = {field: 'price', desc: $more_to_least};
                $rootScope.$broadcast($scope.alias + 'SortDataChanged', lNewSortFields);
            }
    
            /**
             * Change list order by price
             * @param {bool} $more_to_least From 
             */
            $scope.sortByDate = function($more_to_least){
                $scope.client_sort = 'date_' + ($more_to_least ? 'desc' : 'asc');
                let lNewSortFields = {field: 'contract_start_date', desc: $more_to_least};
                $rootScope.$broadcast($scope.alias + 'SortDataChanged', lNewSortFields);
            }
    
            /**
             * Change list order by price
             * @param {bool} $more_to_least From 
             */
            $scope.sortByName = function($more_to_least){
                $scope.client_sort = 'name_' + ($more_to_least ? 'desc' : 'asc');
                let lNewSortFields = {field: 'name', desc: $more_to_least};
                $rootScope.$broadcast($scope.alias + 'SortDataChanged', lNewSortFields);
            }
    
            /**
             * Change list order by price
             * @param {bool} $more_to_least From 
             */
            $scope.sortByListingCount = function($more_to_least){
                $scope.client_sort = 'listings_' + ($more_to_least ? 'desc' : 'asc');
                let lNewSortFields = {field: 'listings_count', desc: $more_to_least};
                $rootScope.$broadcast($scope.alias + 'SortDataChanged', lNewSortFields);
            }
    
            /**
             * Shorthand to $siDictionary.getCaption
             * see $siDictionary factory for details
             * @param {string} $key 
             * @param {string} $domain 
             * @return {string} Caption
             */
            $scope.getCaption = function($key, $domain, $asAbbr){
                return $siDictionary.getCaption($key, $domain, $asAbbr);
            }

            /**
             * Shorthand to $siUtils.formatPrice
             * see $siUtils factory for details
             * @param {object} $item Listing item data
             */
            $scope.formatPrice = function($item){
                return $siUtils.formatPrice($item);
            }
    
            /**
             * Shorthand to $siUtils.getClassList
             * see $siUtils factory for details
             * @param {object} $item Listing item data
             */
            $scope.getClassList = function($item){
                const lClassList = [$siUtils.getClassList($item)];
                if($scope.configs != null){
                    lClassList.push('img-hover-effect-' + $scope.configs.list_item_layout.image_hover_effect);
                }
                
                return lClassList.join(' ');
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
                $rootScope.$broadcast('si-{0}-display-switch-{1}'.format($scope.alias,$mode));
            }
    
            /**
             * Shorthand to $siUtils.getCity
             * see $siUtils factory for details
             * @param {object} $item Listing item data
             */
            $scope.getCity = function($item, $sanitize){
                return $siUtils.getCity($item, $sanitize);
            }
    
            /**
             * Shorthand to $siUtils.getRegion
             * see $siUtils factory for details
             * @param {object} $item Listing item data
             */
            $scope.getRegion = function($item, $sanitize){
                return $siUtils.getRegion($item, $sanitize);
            }
    
            /**
             * Shorthand to $siUtils.getTransaction
             * see $siUtils factory for details
             * @param {object} $item Listing item data
             */
            $scope.getTransaction = function($item, $sanitize){
                return $siUtils.getTransaction($item, $sanitize);
            }

            $scope.layoutAllowVar = function($item, $layer, $default){
                $default = ($default != undefined) 
                                ? $default 
                                : (typeof $layer === 'boolean') 
                                    ? $layer 
                                    : false;

                $layer = $layer == undefined
                            ? 'main'
                            : (typeof $layer === 'boolean')
                                ? 'main' 
                                : $layer;

                if($scope.configs == null) return $default;
                if($scope.configs.list_item_layout == undefined) return $default;
                
                if($scope.configs.list_item_layout.displayed_vars == undefined) return $default;
                if($scope.configs.list_item_layout.displayed_vars[$layer] == undefined) return $default;

                return $scope.configs.list_item_layout.displayed_vars[$layer].includes($item);
            }

        }
    }
}]);


siApp
.directive('siSmallList', ['$sce','$compile','$siFavorites', '$siConfig', '$siUtils','$siApi',
                            '$siFilters','$siDictionary','$q','$siList','$timeout',
function siSmallList($sce,$compile,$siFavorites, $siConfig, $siUtils,$siApi, $siFilters,$siDictionary,$q,$siList,$timeout){
    return {
        restrict: 'E',
        scope: {
            type: '@siType',
            filters: '=siFilters',
            options: '=?siOptions'
        },
        template: '<div class="list-header" ng-show="options.show_header">' + 
                        '<h3 ng-cloak>{{getListTitle()}}</h3>' +
                        '<div class="search-input" ng-show="list.length > 10"><input placeholder="Filtrez la liste par mots-clés" ng-model="filter_keywords"><i class="far fa-search"></i></div>' + 
                    '</div>' +
                    '<div class="loader"><i class="fal fa-spinner fa-spin"></i></div>' +
                    '<div class="list-container"  si-lazy-load><div ng-include="getItemTemplateInclude()" include-replace ng-repeat="item in list | filter : filter_keywords"></div></div>',
        link: function($scope, $element, $attrs){
            $scope.init($element);
        },
        controller:function($scope,$rootScope){
            $scope.view_id = null;
            $scope.list = [];
            $scope._element = null;

            $scope.typesHash = {
                'listings' : 'Listing',
                'brokers' : 'Broker',
                'offices' : 'Office',
                'cities' : 'City'
            }
            $scope.$watch('filters', function($new, $old){
                if($new == null) return;
                if($old == null){
                    $scope.fetchList();
                    return;
                }

                if($new.value == $old.value) return;
                $scope.fetchList();
            });

            $scope.$watch('filter_keywords', function($new, $old){
                if($new == $old) return;

                $timeout(function(){
                    $rootScope.$broadcast('si-list-loaded');
                })
            });

            $scope.getItemTemplateInclude = function(){
                if($scope.options.item_template != undefined) return $scope.options.item_template.replace('~', siCtx.base_path + '/views');
                return 'si-template-for-' + $scope.type;
            }

            $scope.init = function($element){
                $scope._element = $element;
                $siConfig.get().then(function($configs){
                    $scope.configs = $configs;
                });

                $siApi.getDefaultDataView().then(function($view_id){
                    $scope.view_id = $view_id;
                        
                    $scope.fetchList();
                    
                });
            }

            $scope.fetchList = function(){
                if($scope.filters == null) return;
                const lBaseFilter = $scope.getBaseFilter();
                const lFilters = angular.merge(lBaseFilter, {
                    filter_group:{
                        filters: Array.isArray($scope.filters) ? $scope.filters : [$scope.filters]
                    }
                });

                const lSingularType = $scope.typesHash[$scope.type];
                
                $siFilters.with().getSearchToken(lFilters).then(function($token){

                    $siUtils.all({
                        lexicon: function() { return $siApi.getViewDictionary($scope.view_id, $locales._current_lang_) },
                        offices: function() {
                            if($scope.type != 'brokers') return null;
                            return $siApi.call('office/view/' + $scope.view_id + '/fr/items');
                        },
                        list : function() { return $siApi.call($scope.getApiEndpoint($scope.type,$scope.view_id,$locales._current_lang_), {st: $token}, {method: 'GET'}) },
                    })
                    .then(function($results){
                        $siDictionary.init($results.lexicon);
                        $scope.meta = $results.list.metadata;
                        $siList.offices = $results.offices ? $results.offices.items : [];
                        $scope.list = $siUtils['compile' + lSingularType + 'List']($results.list.items);

                        $scope._element.addClass("loaded");
                        $timeout(function(){
                            $rootScope.$broadcast('si-list-loaded', $scope.type,$scope.list);
                        });
                    })


                    // .then(function($response){
                    //     .then(function($dictionaryData){
                    //         $siDictionary.init($dictionaryData);
                    //         $scope.meta = $response.metadata;
                    //         $scope.list = $siUtils['compile' + lSingularType + 'List']($response.items);

                    //         $scope._element.addClass("loaded");
                    //     });
                    // })
                })
            }

            $scope.getBaseFilter = function(){
                if(!$scope.options || !$scope.options.filter) return {};
                const lResult = {};
                
                if($scope.options.filter.max_item_count > 0){
                    lResult.max_item_count = $scope.options.filter.max_item_count;
                }
                
                if($scope.options.filter.sort_fields && $scope.options.filter.sort_fields.length > 0){
                    lResult.sort_fields = $scope.options.filter.sort_fields
                }

                return lResult;
            }

            $scope.formatPrice = function($item){
                return $siUtils.formatPrice($item);
            }
            

            $scope.getListTitle = function(){
                const lTypeCaptions = {
                    listings : {single: '1 property', plural: '{0} properties'},
                    brokers : {single: '1 broker', plural: '{0} brokers'},
                    offices : {single: '1 office', plural: '{0} offices'},
                    cities : {single: '1 city', plural: '{0} cities'},
                }
                if($scope.meta == undefined) return '';
                if($scope.meta.item_count == 0) return '';
                if($scope.meta.item_count == 1) return lTypeCaptions[$scope.type].single.translate();
                if($scope.meta.item_count > 1) return lTypeCaptions[$scope.type].plural.translate().format($scope.meta.item_count);

            }

            $scope.getApiEndpoint = function($type, $view, $lang){
                const lSingularType = $scope.typesHash[$scope.type].toLowerCase();
                return '{0}/view/{1}/{2}/items'.format(lSingularType, $view, $lang );
            }

            $scope.removeFromList = function($event, $item){
                $event.preventDefault();
                $event.stopPropagation();

                if(typeof $scope.$parent.removeFromList == 'function'){
                    $scope.$parent.removeFromList($event,$item);
                }
            }

            
            $scope.hasListOf = function($type){
                return $scope.configs.lists.some(function($l){
                    return $l.type == $type;
                })
            }
        }
    }
}]);

/**
 * DIRECTIVE: LIST-SLIDER
 * Display a slider (gallery) for a list of data
 * usage: <si-list-slider></si-list-slider>
 * @param {string} siAlias List alias name. Required
 * @param {object} siOptions Object overwriting the default option of the component
 *                     -> {
 *                         limit: 5,
 *                         item_template: undefined
 *                     }
 */
siApp
.directive('siListSlider', ['$compile', '$siConfig', '$siApi','$siUtils','$siDictionary', '$siHooks', '$timeout',
function siListSlider($compile,$siConfig,$siApi,$siUtils,$siDictionary,$siHooks,$timeout){
    return {
        restrict: 'E',
        templateUrl: siCtx.base_path + 'views/ang-templates/si-list-slider.html',
        transclude:true,
        replace:true,
        scope: {
            alias : '@siAlias',
            options: '=?siOptions'
        },
        link: function($scope, $element, $attrs){
            $scope.init($element);
        },
        controller: function($scope, $q){
            $scope.configs = null;
            $scope.typesHash = {
                'listings' : 'Listing',
                'brokers' : 'Broker',
                'offices' : 'Office',
                'cities' : 'City'
            }

            $scope.init = function($element){
                $scope._element = $element;
                
                $siConfig.get().then(function($configs){
                    //console.log('init slider',$configs);
                    $scope.configs = $configs;
                    $scope.fetchList().then(function(){
                        $scope.bindEvents();
                    });
                });

                
            }

            $scope.fetchList = function(){
                const lListConfigs = $scope.configs.lists.find(function($l){
                    return $l.alias == $scope.alias;
                });
                
                const lSingularType = $scope.typesHash[lListConfigs.type];
            
                return $q(function($resolve, $reject){
                    
               
                    $siUtils.all({
                        lexicon: function() { return $siApi.getViewDictionary(lListConfigs.source.id, $locales._current_lang_) },
                        list : function() { return $siApi.call($scope.getApiEndpoint(lListConfigs.type,lListConfigs.source.id,$locales._current_lang_), {st: lListConfigs.search_token}, {method: 'GET'}) },
                    })
                    .then(function($results){

                        $siDictionary.init($results.lexicon);
                        $scope.meta = $results.list.metadata;
                        $scope.list = $siUtils['compile' + lSingularType + 'List']($results.list.items);

                        $scope.list = $scope.list
                            .filter(function($e,$i){
                                return $i< $scope.options.limit;
                            });

                        $scope.list.forEach(function($e){
                            $scope.postProcessListItem(lListConfigs.type, $e);
                        });

                        $scope.applyProperties();

                        $scope._element.addClass("loaded");
                        $timeout(function(){
                            $resolve();
                        })
                    });
                })
            }

            $scope.applyProperties = function(){
                //console.log('apply properties')
                const lListConfigs = $scope.configs.lists.find(function($l){
                    return $l.alias == $scope.alias;
                });

                const lSlideContainer = $scope._element[0].querySelector('.si-slide-container');
                const lElmBoundingRect = $scope._element[0].getBoundingClientRect();

                $scope._element[0].style.setProperty('--slider-width', lElmBoundingRect.width + 'px');
                lSlideContainer.style.setProperty('--list-count', $scope.list.length);
                lSlideContainer.style.setProperty('--current-index', 0);

                $scope._element.addClass("list-of-" + lListConfigs.type);
            }

            $scope.postProcessListItem = function($type, $item){
                //console.log('postProcessListItem', $type, $item);

                $item.photo_url = $item.photo_url.replace('-sm.jpg','-lg.jpg');
                let lTitle;

                if($type == 'listings'){
                    lTitle = $item.subcategory;

                    if($item.category_code == 'RESIDENTIAL'){
                            
                        if($item.rooms.bed != undefined && $item.rooms.bed.count>0){
                            lTitle = $item.rooms.bed.count == 1 ? 
                                        '1 Bedroom {0}'.translate().format($item.subcategory) : 
                                        '{0} Bedrooms {1}'.translate().format($item.rooms.bed.count, $item.subcategory);
                        }
                        
                    }
                }

                $item.title = $siHooks.filter('si-list-slider-item-title', lTitle, $item);
            }

            $scope.getApiEndpoint = function($type, $view, $lang){
                const lSingularType = $scope.typesHash[$type].toLowerCase();
                return '{0}/view/{1}/{2}/items'.format(lSingularType, $view, $lang );
            }

            $scope.getItemTemplateInclude = function(){
                if($scope.options.item_template != undefined){
                    return $scope.options.item_template.replace('~', siCtx.base_path + '/views');
                }
                
                // const lListConfigs = $scope.configs.lists.find(function($l){
                //     return $l.alias == $scope.alias;
                // });

                return 'si-list-slider-for-' + $scope.alias;
            }

            $scope.scrollTo = function($index){
                const lContainer = $scope._element[0].querySelector('.si-slide-container');
                const lScrollBy = $scope._element[0].getBoundingClientRect().width;
                lContainer.scrollLeft = $index * lScrollBy;
            }

            $scope.scroll = function($dir){
                const lContainer = $scope._element[0].querySelector('.si-slide-container');
                const lPreviousScrollPos = lContainer.scrollLeft;
                const lScrollBy = $dir * $scope._element[0].getBoundingClientRect().width;
                if(lContainer.scrollLeft + lScrollBy >= lContainer.scrollWidth){
                    lContainer.scrollLeft = 0;
                }
                else if(lContainer.scrollLeft + lScrollBy < 0){
                    lContainer.scrollLeft = lContainer.scrollWidth;
                }
                else{
                    lContainer.scrollLeft = lPreviousScrollPos + lScrollBy;
                }
            }

            // #region Events
            $scope.bindEvents = function(){
                const lObserverRoot = $scope._element[0];
                const lRootBounds = lObserverRoot.getBoundingClientRect();

                const lObserverOptions = {
                    root: lObserverRoot,
                    rootMargin: "0px -40%",
                    thresholds: 1
                }
                const lSlideObserver = new IntersectionObserver($scope.slideIntersectHandle,lObserverOptions);

                const lSlides = Array.from(lObserverRoot.querySelectorAll(".si-slide"));
                lSlides.forEach(function($elm){
                    lSlideObserver.observe($elm);
                });

                window.addEventListener('resize', function(){
                    $scope.applyProperties();
                    const lContainer = $scope._element[0].querySelector('.si-slide-container');
                    lContainer.scrollLeft +=1;
                })
            }

            $scope.slideIntersectHandle = function($entries, $observer){
                $entries.forEach(function(entry) {
                    $timeout(function(){
                        if(entry.isIntersecting){
                            entry.target.classList.add('in-viewport');
                        }
                        else{
                            entry.target.classList.remove('in-viewport');
                        }
                    }, 500);
                });
                  
            }

            // #endregion
        }
    }
}]);


