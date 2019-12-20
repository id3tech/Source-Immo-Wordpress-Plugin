
/* ------------------------------- 
        DIRECTIVES
-------------------------------- */
/**
 * lstr
 * 
 */
siApp
.directive('lstr', ['$parse', function lstr($parse){
    return {
        restrict: 'E,A',
        compile: function compile(tElement, tAttrs, transclude) {
            return {
               pre: function preLink(scope, iElement, iAttrs, controller) {
                    let lTranslatedContent = iElement.html().translate();
                    let lFormatParams = iAttrs.params;
                    if(lFormatParams == null && iAttrs.lstr != '') lFormatParams = iAttrs.lstr;
                    
                    if(lFormatParams != null){
                        lFnFormatParams = $parse(lFormatParams);
                        lFormatParams = lFnFormatParams(scope);
                        if(!Array.isArray(lFormatParams)) lFormatParams = [lFormatParams];
                        
                        lTranslatedContent = lTranslatedContent.format.apply(lTranslatedContent, lFormatParams);
                    }
                    iElement.html('<span>' + lTranslatedContent + '</span>');
               }
            }
        }
    }
}]);

siApp
.directive('siAdaptativeClass', [
    '$parse','$timeout',
    function($parse,$timeout){
        return {
            restrict: 'A',
            scope: true,
            link: function($scope, $element, $attrs){
                $scope.$element = $element[0]
                
                $timeout(function(){
                    $scope.init();
                },500);
                
            },
            controller : function($scope, $rootScope){
                $scope._resizeTimeoutHndl = null;
                
                $scope.init = function(){
                    $scope.updateClass();
                    $scope.addResizeListener();
                }

                $scope.addResizeListener = function(){
                    window.addEventListener("resize", function($event){
                        if($scope._resizeTimeoutHndl != null){
                            window.clearTimeout($scope._resizeTimeoutHndl);
                        }

                        $scope._resizeTimeoutHndl = window.setTimeout(function(){
                            $scope.updateClass();
                        }, 100);
                    })
                }

                $scope.updateClass = function(){
                    const lSizeMap = {
                        'si-adapt-small-phone-size': 320,
                        'si-adapt-phone-size': 640,
                        'si-adapt-tablet-size': 800,
                        'si-adapt-laptop-size': 1000
                    }
                    
                    // remove any class previously applied by a resize or initial parse
                    Object.keys(lSizeMap)
                        .forEach(function($k){
                            $scope.$element.classList.remove($k);
                        });

                    

                    // get element size
                    let lReferenceElement = $scope.$element;
                    if(!lReferenceElement.classList.contains('si-content')){
                        lReferenceElement = lReferenceElement.closest('.si-content');
                    }
                    const lElementBox = lReferenceElement.parentNode.getBoundingClientRect();
                    if(lElementBox.width == 0) return;  // bail out if the element has no width

                    // find the first size greater than the element box width
                    const lClass = Object.keys(lSizeMap)
                                            .filter(function($k){
                                                return lSizeMap[$k] <= window.innerWidth;
                                            })
                                            .find(function($k){
                                                return lSizeMap[$k] >= lElementBox.width;
                                            });

                    if(lClass != null){
                        // apply class if found
                        $scope.$element.classList.add(lClass)
                        $rootScope.$broadcast('container-resize');
                    }
                }

            }
        }
    }
])


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
                        location :{city:'City',civic_address: '00 address'},
                        price: {sell:{amount:0}},
                        category: 'Category',
                        subcategory: 'Subcategory',
                        ref_number: 'XXXXXX',
                        first_name: 'First name',
                        last_name: 'Last name',
                        license_type : 'License type',
                        listing_count: 0,
                        phones:{cell:'555-555-5555'},
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

                $scope.$on('auth_token_refresh', function(){
                    sessionStorage.removeItem('si.list.{0}.{1}'.format($scope.configs.type,siCtx.locale));
                    sessionStorage.removeItem('si.listMeta.{0}.{1}'.format($scope.configs.type,siCtx.locale));
                    sessionStorage.removeItem('si.pageIndex.{0}.{1}'.format($scope.configs.type,siCtx.locale));
                });

                $siApi.getListConfigs($scope.alias).then(function($configs){
                    $scope.configs = $configs;
                    let lClientSearchToken = sessionStorage.getItem("si.{0}.st".format($scope.configs.alias));
                    if(lClientSearchToken!=undefined){
                        $scope.client.search_token = lClientSearchToken;
                    }

                    $siApi.renewToken().then(function(){
                        $scope.start();
                    });
                });
            }
    
            /**
             * Start the loading process
             */
            $scope.start = function(){
                //return;
                $siConfig.get().then(function($global_configs){
                    // Prepare Api
                    const lPrerequisites = {};
                    lPrerequisites.meta = function(){return $siApi.getViewMeta($scope.configs.type,$scope.configs.source.id)};
                    lPrerequisites.pages = function() {
                        if(!$global_configs.enable_custom_page) return null;
                        return $siApi.rest_call('page/list',{locale: siCtx.locale, type: $scope.configs.type},{method:'GET'})
                    };
                    lPrerequisites.offices = function(){
                        if($scope.configs.type!='brokers') return null;
                        return $siApi.call('office/view/' + $global_configs.default_view + '/fr/items');
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


                    // .then(function($response){
                        
                    //     if($global_configs.enable_custom_page){
                    //         $siApi.rest_call('pages',{locale: siCtx.locale, type: $scope.configs.type},{method:'GET'}).then(function($site_page_list){
                    //             $siUtils.page_list = $site_page_list;
                    //             $scope.dictionary = $response.dictionary;
                    //             $scope.is_ready = true;
                    //             // load data
                    //             $scope.getList();
                    //         });
                    //     }
                    //     else{
                    //         $siUtils.page_list = [];
                    //         $scope.dictionary = $response.dictionary;
                    //         $scope.is_ready = true;
                    //         // load data
                    //         $scope.getList();
                    //     }
                    // });
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
                return lOrigin.concat('/view/',$scope.configs.source.id,'/',siApiSettings.locale);
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
                return $siUtils.getClassList($item);
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

        }
    }
}]);

siApp.directive('includeReplace', function () {
    return {
        require: 'ngInclude',
        restrict: 'A', /* optional */
        link: function (scope, el, attrs) {
            el.replaceWith(el.children());
        }
    };
});

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
}])


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
            console.log('siSearch standalone', $scope.standalone, typeof $scope.standalone)

            $scope.standalone = (typeof $scope.standalone == 'string') ? $scope.standalone == 'true' : $scope.standalone;
            console.log('siSearch standalone', $scope.standalone, typeof $scope.standalone)
            console.log('Search box element',$element[0]);
            $scope.init($element);
        },
        controller: function($scope, $q, $siApi, $rootScope,$timeout,
                                $siDictionary, $siUtils,  $siFilters,
                                $siHooks,$siFavorites){
            let lToday = new Date().round();    // save today
            let lNow = new Date();

            $scope.siDictionary = $siDictionary;
            
            // const
            $scope.PRICE_RANGE_MAX  = 1000000;
            $scope.PRICE_RANGE_STEP = 1000;

            // init default values        
            $scope.is_ready = false;    
            $scope.tab_category = 'RESIDENTIAL';
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
                location: null
            }
            $scope.priceRange = [0,1,0];
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
                    caption: 'For sale', 
                    filter : {field: 'for_sale_flag', operator: 'equal', value: true}
                },
                rent : {
                    caption: 'For rent',
                    filter : {field: 'for_rent_flag', operator: 'equal', value: true}
                },
                open_house : {
                    caption: 'Open house',
                    filter : {field: 'open_houses[0].end_date', operator: 'greater_or_equal_to', value: 'udf.now()'}
                },
                forclosure : {
                    caption: 'Foreclosure',
                    filter : {field: 'price.foreclosure', operator: 'equal', value: true}
                },
                virtual_tour : {
                    caption: 'With virtual tour',
                    filter : {field: 'virtual_tour_flag', operator: 'equal', value: true}
                },
                video : {
                    caption: 'With video',
                    filter : {field: 'video_flag', operator: 'equal', value: true}
                }
            }
            // listing ages or timespan filters
            $scope.listing_ages = [
                {
                    caption : 'Always'.translate(),
                    filter : {field: 'contract.start_date', operator: 'greater_than', value: ''}
                },
                {
                    caption: '24 hours'.translate(), 
                    filter : {field: 'contract.start_date', operator: 'greater_than', value: lNow.addDays(-1).toJSON()}
                },
                {
                    caption: '48 hours'.translate(), 
                    filter : {field: 'contract.start_date', operator: 'greater_than', value: lNow.addDays(-2).toJSON()}
                },
                {
                    caption: '7 days'.translate(), 
                    filter : {field: 'contract.start_date', operator: 'greater_than', value: lToday.addDays(-7).toJSON()}
                },
                {
                    caption: '2 weeks'.translate(), 
                    filter : {field: 'contract.start_date', operator: 'greater_than', value: lToday.addDays(-14).toJSON()}
                },
                {
                    caption: '1 month'.translate(),
                    filter : {field: 'contract.start_date', operator: 'greater_than', value: lToday.addMonths(-1).toJSON()}
                },
                {
                    caption: '3 months'.translate(),
                    filter : {field: 'contract.start_date', operator: 'greater_than', value: lToday.addMonths(-3).toJSON()}
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
            // listing land areas
            $scope.land_areas = Array.from(Array(3)).map(function($e,$i){
                return { caption: '{0} sqft'.translate().format(5000 * ($i+1)), value: 5000 * ($i+1)}
            });
            $scope.land_areas = $scope.land_areas.concat(Array.from(Array(10)).map(function($e,$i){
                return { caption: '{0} sqft'.translate().format(20000 * ($i+1)), value: 20000 * ($i+1)}
            }));

            // listing building areas
            $scope.building_areas = Array.from(Array(13)).map(function($e,$i){
                return { caption: '{0} sqft'.translate().format(500 * ($i+1)), value: 500 * ($i+1)}
            });

            
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
                elevator : {
                    caption: 'Elevator', 
                    field: 'attributes.ELEVATOR'
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
            $scope.init = function($element){
                $scope._element = $element[0];
                const lFilterPanelContainer = angular.element('<div class="si si-filter-panel-container"></div>');
                
                angular.element(document.body).append(lFilterPanelContainer);
                $scope.filterPanelContainer = lFilterPanelContainer;
                // prevent panel click event bubble up
                lFilterPanelContainer.on('click', function($event){$event.stopPropagation();});
                $element.on('click',function($event){$event.stopPropagation();});
                // bind events
                $rootScope.$on($scope.alias + 'SortDataChanged', $scope.onSortDataChanged);
                
                if($scope.standalone){
                    $scope._element.classList.add('show-trigger');
                }

                // prebuild suggestions
                $scope.buildDropdownSuggestions();
                // load state

                
                // Wait for late initialization
                // ie: Dictionnay, configs, etc are all loaded
                $scope.isReady().then(function(){
                    let lfSyncFilter = function($filter){
                        //console.log('Filter to UI sync');
    
                        // check if there's filters stored
                        if($filter.hasFilters()){
                            // Sync UI with filters
                            $scope.syncFiltersToUI();
                            
                            // build hints
                            $scope.buildHints();
                        }
                    }

                    $siFilters.with($scope.alias, function($filter){
                        $scope.filter = $filter;
                        if(!$scope.standalone){
                            $filter.result_url = $scope.result_url;
                        }

                        $filter.loadState();
                        lfSyncFilter($filter);
                        

                        $filter.on('update').then(function(){
                            console.log('filter', $scope.alias, 'update trigger');
                            lfSyncFilter($filter);

                            $timeout(function(){
                                $scope.updateExpandPanelPosition();
                            });
                        });

                        $filter.on('filterTokenChanged').then(function($token){
                            //console.log('filter', $scope.alias, 'filterTokenChanged trigger');
                            lfSyncFilter($filter);
                            $rootScope.$broadcast($scope.alias + 'FilterTokenChanged', $token);

                            $timeout(function(){
                                $scope.updateExpandPanelPosition();
                            });
                        })
                    });
                    
                    // add listener to close the panel whenever a click occurs outside the search panel
                    angular.element(document.body).on('click', function($event){
                        $scope.closePanels();
                    });

                    window._resizeTimeoutHndl = null;
                    window.addEventListener('resize', function(){
                        if(window._resizeTimeoutHndl != null){
                            window.clearTimeout(window._resizeTimeoutHndl);
                        }
                        window._resizeTimeoutHndl = window.setTimeout(function(){
                            $scope.updateExpandPanelPosition();
                        }, 500);
                    })

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
                            $scope.configs = $configs;
                            $siFilters.with($scope.alias).configs = $configs;

                            // load view meta
                            $siUtils.all({
                                meta : function(){return $siApi.getViewMeta($configs.type,$configs.source.id)},
                                offices: function(){
                                    if($configs.type != 'brokers') return null;
                                    return $siApi.call('office/view/' + $configs.source.id + '/fr/items')
                                }
                            })
                            .then(function($results){
                                $scope.dictionary = $results.meta.dictionary;
                                $scope.officeList = $results.offices ? $results.offices.items : [];
                                $scope.is_ready = true;
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

            $scope.showResultPage = function(){
                window.location = $scope.result_url;
            }
            
            /* ----------------------
            
            UI MANAGEMENT 

            ------------------------- */
            $scope.closePanels = function(){
                $timeout(function(){
                    $scope._expandedPanel = null;
                });

                if($scope.filterPanelContainer == null) return;
                
                $scope.filterPanelContainer.removeClass('expanded');

                
            }


            $scope._expandedPanel = null;
            $scope.toggleExpand = function($event,$key){
                // Move panels to document root
                //$event.stopPropagation();

                if($scope._expandedPanel != $key){
                    const lElmRect = $scope._element.getBoundingClientRect();
                    const lSearchBox = $scope._element.querySelector('.search-box').getBoundingClientRect();

                    $scope._element.querySelectorAll('.filter-panel').forEach(function($e){
                        $scope.filterPanelContainer.append($e);
                    });

                    $scope.updateExpandPanelPosition();
                    
                   
                    $scope.filterPanelContainer.on('transitionend', function(){
                        // const lPanelHeight = window.getComputedStyle($scope.filterPanelContainer[0]).height.replace('px',''); 
                            
                        // if(window.innerHeight >= 800 && window.innerWidth >= 1000){
                            
                        // }
                        $scope.filterPanelContainer.off('transitionend');
                    });
                
                    $scope.filterPanelContainer.addClass('expanded');
                }
                else{
                    $scope.filterPanelContainer.removeClass('expanded');
                }

                $scope._expandedPanel = ($scope._expandedPanel == $key) ? null : $key;
            }
            $scope.updateExpandPanelPosition = function(){
                if($scope._element == null) return;
                
                const lElmRect = $scope._element.getBoundingClientRect();
                const lSearchBoxElm = $scope._element.querySelector('.search-box');
                if(lSearchBoxElm == null) return;
                
                $scope.filterPanelContainer[0].style.setProperty('--relative-top', Math.round(lElmRect.top + window.scrollY) + 'px');
                $scope.filterPanelContainer[0].style.setProperty('--relative-left', Math.round(lElmRect.left + window.scrollX)+ 'px');
                $scope.filterPanelContainer[0].style.setProperty('--relative-width', Math.floor(lElmRect.width) + 'px');
                $scope.filterPanelContainer[0].style.setProperty('--relative-height', lElmRect.height + 'px');
                
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
                    console.log(angular.copy($list));
                    $list = $siUtils.toArray($list);
                    console.log($list);
                }
                $list.forEach(function($e){
                    if($e.__$obj_key == lItemKey) return;
                    delete $e.expanded;
                });

                $item.expanded = ($item.expanded != undefined)? !$item.expanded : true;
            }

            /**
             * Get an icon corresponding to the category
             * @param {string} $key Category code
             * @returns {string} Icon
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
                    $scope.bedroomSuggestions.push({value:i, label: '{0}+ bedrooms'.translate().format(i), caption: '{0}+ bedrooms'.translate().format(i)});
                    // Bathrooms
                    $scope.bathroomSuggestions.push({value:i, label: '{0}+ bathrooms'.translate().format(i), caption: '{0}+ bathrooms'.translate().format(i)});
                    // Parking
                    $scope.parkingSuggestions.push({value:i, label: (i==1 ? '1 space or +' : '{0} spaces or +').translate().format(i), caption: '{0}+ parking spaces'.translate().format(i)});
                    // Parking
                    $scope.garageSuggestions.push({value:i, label: '{0}+ garages'.translate().format(i), caption: '{0}+ garages'.translate().format(i)});
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
                            {selected:true, label : 'Contains "{0}"'.translate().format(lValue), 
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
                                {label : 'Price is less than {0}'.translate().format(lValue.formatPrice()), action: function(){$scope.setMaxPrice(lValue);}},
                                {label : 'Price is more than {0}'.translate().format(lValue.formatPrice()), action: function(){$scope.setMinPrice(lValue);}},
                                {label : 'Price is between {0} and {1}'.translate().format(lPriceMin.formatPrice(), lPriceMax.formatPrice()), action: function(){
                                    $scope.setMinPrice(lPriceMin);
                                    $scope.setMaxPrice(lPriceMax);
                                }},
                                // civic adress suggestion
                                {label : 'Has "{0}" as civic address'.translate().format(lValue), action: function(){$scope.filter.addFilter('location.address.street_number','equal',lValue, 'Has "{0}" as civic address'.translate().format(lValue))}}
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
                                label : 'Contains "{0}"'.translate().format(lValue), 
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
                                    lResult.push({label: '{0} (category)'.translate().format(lElm.caption), action: function(){ lElm.selected=true;  $scope.filter.addFilter('category','in',$scope.getSelection($scope.dictionary.listing_category));} }) 
                                }
                            }
                            // Add subcategories that match the keyword
                            for($key in $scope.dictionary.listing_subcategory){
                                let lElm = $scope.dictionary.listing_subcategory[$key];
                                if(lElm.caption.toLowerCase().indexOf(lValue)>=0){
                                    lResult.push({label: '{0} (subcategory)'.translate().format(lElm.caption), action: function(){ lElm.selected=true;  $scope.filter.addFilter('subcategory','in',$scope.getSelection($scope.dictionary.listing_subcategory));} }) 
                                }
                            }
                            // Add regions that match the keyword
                            for($key in $scope.dictionary.region){
                                let lElm = $scope.dictionary.region[$key];
                                if(lElm.caption.toLowerCase().indexOf(lValue)>=0){
                                    lResult.push({label: '{0} (region)'.translate().format(lElm.caption), action: function(){ lElm.selected=true;  $scope.filter.addFilter('location.region_code','in',$scope.getSelection($scope.dictionary.region));} }) 
                                }
                            }
                            // Add cities that match the keyword
                            for($key in $scope.dictionary.city){
                                let lElm = $scope.dictionary.city[$key];
                                if(lElm.caption.toLowerCase().indexOf(lValue)>=0){
                                    lResult.push({label: '{0} (city)'.translate().format(lElm.caption), action: function(){ lElm.selected=true;  $scope.filter.addFilter('location.city_code','in',$scope.getSelection($scope.dictionary.city));} }) 
                                }
                            }
                        }
                        else if($scope.configs.type == 'brokers'){
                            lResult.push({
                                label: 'Last name is "{0}"'.translate().format($scope.data.keyword), 
                                action: function(){ 
                                    $scope.filter.addFilter('last_name','equal_to',$scope.data.keyword, 'Last name is "{0}"'.translate().format($scope.data.keyword));
                                    $scope.buildFilters(); $scope.buildHints();
                                } 
                            });

                            lResult.push({
                                label: 'Last name starts with "{0}"'.translate().format(lValue), 
                                action: function(){ 
                                    $scope.filter.addFilter('last_name','starts_with',lValue, 'Last name starts with "{0}"'.translate().format(lValue));
                                    $scope.buildFilters(); $scope.buildHints();
                                } 
                            });

                            lResult.push({
                                label: 'Last name ends with "{0}"'.translate().format(lValue), 
                                action: function(){ 
                                    $scope.filter.addFilter('last_name','ends_with',lValue, 'Last name ends with "{0}"'.translate().format(lValue));
                                    $scope.buildFilters(); $scope.buildHints();
                                } 
                            });


                            lResult.push({
                                label: 'First name is "{0}"'.translate().format($scope.data.keyword), 
                                action: function(){ 
                                    $scope.filter.addFilter('first_name','equal_to',$scope.data.keyword, 'First name is "{0}"'.translate().format($scope.data.keyword));
                                    $scope.buildFilters(); $scope.buildHints();
                                } 
                            });

                            lResult.push({
                                label: 'First name starts with "{0}"'.translate().format(lValue), 
                                action: function(){ 
                                    $scope.filter.addFilter('first_name','starts_with',lValue, 'First name starts with "{0}"'.translate().format(lValue));
                                    $scope.buildFilters(); $scope.buildHints();
                                } 
                            });

                            lResult.push({
                                label: 'First name ends with "{0}"'.translate().format(lValue), 
                                action: function(){ 
                                    $scope.filter.addFilter('first_name','ends_with',lValue, 'First name ends with "{0}"'.translate().format(lValue));
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
                const lPriceStep = $siHooks.filter('search-price-step', $scope.PRICE_RANGE_STEP);
                const lPriceMaxBoundary = $siHooks.filter('search-max-price-boundary', $scope.PRICE_RANGE_MAX);
                const lRoundPrecision = $siHooks.filter('search-round-precision', 1000);

                const fnRoundPrice = function($price){ return Math.round($price / lRoundPrecision) * lRoundPrecision; }
                
                const lMinPrice = fnRoundPrice(lPriceMaxBoundary * $scope.priceRange[0]);
                const lMaxPrice = fnRoundPrice(lPriceMaxBoundary * $scope.priceRange[1]);

                const lPriceRangeValues = [lMinPrice, lMaxPrice];

                $scope._priceChangeDebounce = window.setTimeout(function(){
                    $scope.setPriceFromRange(lPriceRangeValues);
                },100);
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
                
                // if($minOrMax=='min'){
                //     lResult.push({value:'', label: 'Min'});
                // }
    
                lList.forEach(function($val){
                    let lValue = $val + lStartAt;
                    lResult.push({value: lValue, label: lValue.formatPrice()});
                })

                // for(let $i=lStartAt;$i<=lEndsAt;$i+=lStep){
                //     lResult.push({value: $i, label: $i.formatPrice()});
                // }


                
                // if($minOrMax=='max'){
                //     lResult.push({value:'', label: 'Max'});
                // }
                
    
                return lResult;
            }

            /* ----------------------
            
            INPUT HANDLING

            ------------------------- */
            
            $scope.setArea = function($value, $areaType, $minMax, $filterLabelFormat){
                $siFilters.with($scope.alias, function($filter){
                    let lOperators = {
                        'min' : 'greater_or_equal_to',
                        'max' : 'less_or_equal_to'
                    }
                    const fnReverse = function(){
                        //$timeout(function(){
                            $scope.filter.data[$areaType + '_' + $minMax] = null; 
                        //});
                        
                        $scope.filter.addFilter($areaType + '.dimension.area_sf', lOperators[$minMax], null, null);
                    }

                    if($value <= 0) $value = null;

                    $scope.filter.data[$areaType + '_' + $minMax] = $value; 
                    $scope.filter.addFilter($areaType + '.dimension.area_sf', lOperators[$minMax], $value, null);
                    
                });
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
                const lRoundPrecision = $siHooks.filter('search-round-precision', 1000);

                const fnRoundPrice = function($price){ return Math.round($price / lRoundPrecision) * lRoundPrecision; }
                
                $minLabel = ($minLabel == undefined) ? (0).formatPrice() : $minLabel;

                if($scope.priceRange[0] == 0) return $minLabel;
            
                const lResult = fnRoundPrice(lPriceMaxBoundary * $scope.priceRange[0]);
                return lResult.formatPrice();
            }

            $scope.getMaxPriceLabel = function($maxLabel){
                const lPriceMaxBoundary = $siHooks.filter('search-max-price-boundary', $scope.PRICE_RANGE_MAX);
                const lRoundPrecision = $siHooks.filter('search-round-precision', 1000);

                const fnRoundPrice = function($price){ return Math.round($price / lRoundPrecision) * lRoundPrecision; }
                
                $maxLabel = ($maxLabel == undefined) ? lPriceMaxBoundary.formatPrice() : $maxLabel;

                if($scope.priceRange[1]==1) return $maxLabel;
                return fnRoundPrice(lPriceMaxBoundary * $scope.priceRange[1]).formatPrice();
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
                    'greater_or_equal_to',$item.value, '{0}+ bedrooms'.translate().format($item.value),
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

            $scope.syncFiltersToUI = function(){
                let lListSync = {
                    "category_code" : "listing_category",
                    "subcategory_code" : "listing_subcategory",
                    "location.city_code" : "city",
                    "location.region_code" : "region",
                    "building.category_code" : "building_category"
                }

                $siFilters.with($scope.alias, function($filter){
                    if($filter.filter_group!=null && $filter.filter_group.filters != null){
                        $filter.filter_group.filters.forEach(function($e,$i){
                            // dictionary sync
                            if(lListSync[$e.field] != undefined){
                                let lDictionaryKey = lListSync[$e.field];
                                if($scope.dictionary[lDictionaryKey]){
                                    $filter.syncToList($e, $scope.dictionary[lDictionaryKey]);
                                }
                            }
                            else if($e.label){
                                // sync
                                $filter.syncToList($e, $scope.listing_attributes);
                                $filter.syncToList($e, $scope.listing_states);
                            }
                        });
                    }

                    lListSync = {
                        "main_unit.bedroom_count" : $scope.bedroomSuggestions,
                        "main_unit.bathroom_count" : $scope.bathroomSuggestions,
                        "attributes.PARKING" : $scope.parkingSuggestions,
                        "attributes.PARKING_GARAGE" : $scope.garageSuggestions,
                        "office_id" : $scope.officeList
                    }
                    
                    for (let key in lListSync) {
                        let lValue = $filter.getFilterValue(key);
                        
                        lListSync[key].some(function($e){
                            
                            if(Array.isArray(lValue)){
                                const lItemKey = 'id';
                                if(
                                    lValue.includes($e[lItemKey])
                                ){
                                    $e.selected = true;
                                    return true;
                                }
                            }
                            else if($e.value != undefined){
                                if($e.value==lValue){
                                    
                                    $e.selected = true;
                                    return true;
                                }
                            }
                        });
                    }
                    
                    //console.log('filter data',$filter.data);
                    const lPriceMaxBoundary = $siHooks.filter('search-max-price-boundary', $scope.PRICE_RANGE_MAX);
                    
                    if($filter.data.min_price != null){
                        const lPriceRangeMin    = $filter.data.min_price / lPriceMaxBoundary;
                        $scope.priceRange[0] = lPriceRangeMin;
                    }

                    if($filter.data.max_price != null){
                        const lPriceRangeMax    = $filter.data.max_price==0 ? 1 : $filter.data.max_price / lPriceMaxBoundary;
                        $scope.priceRange[1] =  lPriceRangeMax;
                    }

                    $siHooks.do('sync-filters-to-ui', $filter);
                })
                

               
                
            }

            /**
             * Synchronize list selection to filter
             * @param {object} $filter Filter bound to list
             * @param {object} $list List object or array
             */
            $scope.syncToList = function($filter, $list){
                $siFilters.with($scope.alias).syncToList($filter, $list);
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
    
            /* ----------------------
            
            FILTER HINT BUILDING

            ------------------------- */


            /**
             * Build a list of hints based on the filter group given as parameter
             */
            $scope.buildHints = function(){
                let lResult = [];
                $siFilters.with($scope.alias, function($filter){
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
                            label: 'Contains "{0}"'.translate().format($filter.query_text),
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

                console.log('buildAreasHint', lMinValue, lMaxValue,$filter);

                if(
                    (lMinValue != undefined || lMaxValue != undefined) &&
                    (lMinValue != 0 || lMaxValue != 0)
                ){
                    
                    let lAreaLabels = ['Min','Max'];
                    if(lMinValue!=undefined){
                        lAreaLabels[0] = '{0} sqft'.translate().format(lMinValue);
                    }
    
                    if(lMaxValue!=undefined && lMaxValue!=0){
                        lAreaLabels[1] = '{0} sqft'.translate().format(lMaxValue);
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
 
    
            /**
             * Reset all filter to nothing
             */
            $scope.resetFilters = function(){
                for(let $key in $scope.dictionary){
                    $scope.filter.resetListSelections($scope.dictionary[$key]);
                }
                for(let $key in $scope.listing_states){
                    delete $scope.listing_states[$key].selected;
                }
                $scope.filterHints = [];
               
                $scope.filter.resetListSelections($scope.listing_attributes);
                $scope.bedroomSuggestions.forEach(function($e){delete $e.selected;});
                $scope.bathroomSuggestions.forEach(function($e){delete $e.selected;});
                $scope.parkingSuggestions.forEach(function($e){delete $e.selected;});
                $scope.garageSuggestions.forEach(function($e){delete $e.selected;});
                $scope.officeList.forEach(function($e){delete $e.selected;});

                $scope.priceRange = [0,1,0];
                
                //console.log('reset office filter', $scope.officeList);

                $siHooks.do('filter-reset');

                $scope.filter.resetFilters();
                
                

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
                let lPromise = $q(function($resolve, $reject){
                    if($scope.configs==null){
                        //console.log($scope.alias);
                        $siApi.getListConfigs($scope.alias).then(function($configs){
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
                $scope.filter.sort_fields = [$newSortData];
                //console.log('sort field changed', $newSortData);
                $scope.filter.buildFilters();
            }

            
            $scope.$watch("dictionary", function(newValue, oldValue){
                if($scope.dictionary!=undefined && $scope.dictionary.region!=undefined){
                    let lRegionList = $siUtils.toSortedArray($scope.dictionary.region);
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
            });

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
            placeholder: '@',
            onTokenChange: '&onEnter',
            result_page: '@resultPage',
            persistantKeyword : '@persistantKeyword'
        },
        templateUrl: siCtx.base_path + 'views/ang-templates/si-searchbox.html?v=5',
        link : function($scope,element, attrs){
            $scope.persistantKeyword = $scope.persistantKeyword == 'true';
            $scope._el = element[0];
           
            $scope.init();
        },
        controller: function($scope, $q, $siApi, $rootScope,$siDictionary, $siUtils,$timeout){
            $scope.configs = null;
            $scope.suggestions = [];
            $scope.is_ready = false;
            $scope.keyword = '';
            $scope.query_text = null;
            $scope.sort_fields = [];
            $scope.filter = null;
            $scope.stored_suggestions = null;
            $scope._suggestion_list_el = null;

            $scope.init = function(){
                
                $scope.isReady().then(function(){
                    $siFilters.with($scope.alias, function($filter){
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
                        if($scope.filter.data.keyword != null && $scope.filter.data.keyword != ''){
                            $scope.buildSuggestions();
                            $scope.$apply();
                        }
                    })
                    lInput.bind('blur', function(){
                        $timeout(function(){ 
                            $scope.closeSuggestionPanel().then( function(){
                                angular.element($scope._el).removeClass('has-focus');
                                console.log('remove focus class and clear suggestions');
                                $scope.suggestions = [];
                                $scope.stored_suggestions = null;
                                //$scope.$apply();    
                            });
                        }, 200);
                    });
                    

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
                            // load view meta
                            $scope.configs = $configs;
                            $siFilters.with($scope.alias).configs = $configs;
                            
                            $siApi.getViewMeta($configs.type,$configs.source.id).then(function($response){
                                //$siDictionary.init($response.dictionary);
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

            $scope.getSuggestionPosition = function(){
                if($scope._el==undefined){
                    return '';
                }
                    
                let lRect = $siUtils.absolutePosition($scope._el);
                lRect.width = Math.min($scope._el.offsetWidth, window.innerWidth);
                lRect.height = window.getComputedStyle($scope._el).getPropertyValue('height').replace('px','');

                
                return 'top:{0}px;padding-top:{1}px;left:{2}px;width:{3}px;'.format(lRect.top, lRect.height - 1, lRect.left, lRect.width);
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
                $siFilters.with($scope.alias, function($filter){       
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
                                    let lType = '';
                                    if(typeof $scope.$parent.getListType == 'function'){
                                        lType = $scope.$parent.getListType();
                                        lType = (lType == 'listings') ? 'listing-city' : lType.replace('s','');
                                    }
                                    $siApi.api($scope.getEndpoint(),{q: $filter.data.keyword, t: lType, c: lSUGGESTION_COUNT_LIMIT},{method: 'GET'}).then(function($qsItems){
                                        // add extra in caption
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
                if($scope._suggestion_list_el == null){
                    $scope._suggestion_list_el =  $scope._el.querySelector('.suggestion-list');
                    angular.element('body').append($scope._suggestion_list_el);
                }
                
                const lMainElmRect = $scope._el.getBoundingClientRect();

                $scope._suggestion_list_el.style.top = (-1 + lMainElmRect.top + window.pageYOffset) + 'px';
                $scope._suggestion_list_el.style.left = (-1 + lMainElmRect.left) + 'px';
                $scope._suggestion_list_el.style.width = (lMainElmRect.width) + 'px';
                $scope._suggestion_list_el.style.setProperty('--input-height', lMainElmRect.height + 'px');

                $scope._suggestion_list_el.classList.add('expanded');
            }

            $scope.closeSuggestionPanel = function(){
                if($scope._suggestion_list_el==null)return $q.resolve();

                return $q(function($resolve,$reject){
                    console.log('closing suggestion panel')
                    angular.element($scope._suggestion_list_el).on('transitionend', function(){
                        angular.element($scope._suggestion_list_el).off('transitionend')
                        console.log('Suggestion panel close')

                        $resolve();
                    });

                    //$scope._suggestion_list_el.style.left = '0px';
                    //$scope._suggestion_list_el.style.width = '0px';
                    $scope._suggestion_list_el.classList.remove('expanded');
                });
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
                $siFilters.with($scope.alias, function($filter){
                        
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
                            lLabelResults.push('in {0}'.translate().format(lElm.caption));
                            lActionResults.push(function(){ 
                                lElm.selected=true;  
                                $filter.addFilter('location.city_code','in',$filter.getSelection($scope.dictionary.city));
                            })
                        }
                        else{
                            lValueList.some(function($e){
                                if(lElm.caption.toLowerCase().indexOf($e)>=0){
                                    lLabelResults.push('in {0}'.translate().format(lElm.caption));
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
                let lPromise = $q(function($resolve, $reject){
                    if($scope.configs==null){
                        //console.log('get config for',$scope.alias);
                        $siApi.getListConfigs($scope.alias).then(function($configs){
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

            $scope.openItem = function($item){
                const lInput = angular.element($scope._el).find('input');
                lInput.val('');
                lInput.attr('placeholder','Opening...'.translate())

                $siConfig.get().then(function($global_configs){
                    let lShortcut = $scope.getItemLinkShortcut($item.type,$global_configs);
                    let lPath = lShortcut.replace('{{item.ref_number}}',$item.ref_number);
                    console.log('Open item @', lPath);
                    window.location = '/' + lPath;
                });
            }
            
            $scope.getItemLinkShortcut = function($type, $configs){
                let lRoute = $configs[$type + '_routes'].find(function($r){return $r.lang == siApiSettings.locale}) || 
                               $configs[$type + '_routes'][0];
                
                
                return lRoute.shortcut;
            }

            /**
            * Reset all filter to nothing
            */
            $scope.resetFilters = function(){
                $siFilters.with($scope.alias).resetFilters();

            }


            $scope.getEndpoint = function(){
                return 'view/'.concat($scope.configs.source.id,'/', siApiSettings.locale + '/quick_search');
            }


        } // end controller

        
    };
}]);

siApp
.directive('siStreetview', function siStreetView( $siTemplate, $siUtils, $siDictionary){
    let dir_controller = 
    function($scope, $q, $siApi, $rootScope){
        $scope.ready = false;
        $scope.is_visible = false;
        $scope.positioned = false;
        $scope.zoom = 14;
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

            $scope.$on('si-display-streetview', $scope.display);
   
        }

        $scope.mapInit = function(){
            return $q(function($resolve,$reject){
                if($scope.ready == false){
                    let options = {
                        center: new google.maps.LatLng(45.6025503,-73.8469538),
                        zoom: $scope.zoom
                        //disableDefaultUI: true    
                    }
                    
                    $scope.map = new google.maps.Map(
                        $scope.map_element, options
                    );
    
                    $scope.ready = true;
                    $resolve();
                }
                else{
                    $resolve();
                }
            });
        }

        $scope.display = function(){
            if(typeof google == 'undefined') {console.error('google map object is undefined');return;}

            if($scope.latlng == null){$scope.registerWatch();return;}

            $scope.mapInit().then(function() {
                $scope.setView($scope.latlng);
            });
        }

        $scope.setView = function($position){
            if($scope.positioned == true) return;

            //console.log('engaging streetview');
            let lPosition = new google.maps.LatLng($position.lat,$position.lng);
            
            $scope.panorama = new google.maps.StreetViewPanorama($scope.viewport_element, 
                    {
                        position: lPosition,
                        pov: {
                            heading: 34,
                            pitch: 10
                        }
                    });
            
            $scope.map.setStreetView($scope.panorama);

            $scope.positioned = true;
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

        $scope.registerWatch = function(){
            $scope.$watch('latlng', function(){
                if($scope.latlng != null && $scope.latlng.lat!=undefined){
                    $scope.display();
                }
            });
        }
        
    };


    return {
        restrict: 'E',
        replace: true,
        scope: {
            alias: '@siAlias',
            class: '@class',
            configs: '=?siConfigs',
            latlng: '=?latlng',
            zoom: '@'
        },
        controllerAs: 'ctrl',
        template: '<div><div id="map-{{alias}}" class="map-viewport"></div><div id="pano-{{alias}}" class="viewport"></div></div>',
        controller: dir_controller,
        link: function($scope, element){
            $scope.map_element = element.children()[0];
            $scope.viewport_element = element.children()[1];
            $scope.$onInit();
        }
    };
});

siApp
.directive('siMap', function siMap( $siTemplate, $siUtils, $siDictionary,$siHooks,$siConfig){
    const dir_controller = 
    function($scope, $q, $siApi, $rootScope){
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
            if($scope.latlng!=null){
                $scope.$on('si-display-map', $scope.display);
                //$scope.mapInit();
            }
            else{
                $scope.$on('si-{0}-display-switch-map'.format($scope.alias), $scope.onSwitchToMap);
                $scope.$on('si-{0}-display-switch-list'.format($scope.alias), $scope.onSwitchToList);
            }

            $rootScope.$on($scope.alias + 'FilterTokenChanged', $scope.onFilterTokenChanged);
        }

        $scope.display = function(){
            $scope.mapInit();
        }

        $scope.mapInit = function(){
            if(typeof google == 'undefined') {console.error('google map object is undefined');return;}

            return $q(function($resolve, $reject){   
                $siConfig.get().then(function($config){
                    if($scope.ready == false){
                        //console.log('Map init', $config, $scope.zoom);
                        
                        let options = {
                            center: new google.maps.LatLng(45.6025503,-73.8469538),
                            zoom: Number($scope.zoom),
                            //disableDefaultUI: true    
                        }

                        if($config.map_style){
                            try {
                                const lParsedMapStyle = JSON.parse($config.map_style);
                                if(lParsedMapStyle) options.styles = lParsedMapStyle;    
                            } catch (error) {
                                
                            }
                            
                        }
                        
                        //console.log('map options', options);

                        $scope.map = new google.maps.Map(
                            $scope.viewport_element, options
                        );

                        $scope.ready = true;
                        $resolve();
                    }
                    else{
                        $resolve();
                    }
                });  
            })
        }

        $scope.setZoom = function($zoom){
            if(isNaN($zoom)) return;

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
                //console.log('update list from token changed');
                $scope.getList();
            })
        }
        $scope.onSwitchToMap = function(){
            $scope.mapInit().then(function(){
                if($scope.bounds){
                    //console.log('fit to bounds', $scope.bounds);
                    window.setTimeout(function(){
                        $scope.map.fitBounds($scope.bounds);
                    }, 250);
                }
                if($scope.markers.length==0){
                    $scope.getList();
                }
                $scope.is_visible = true;
            });
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
            $siApi.api($scope.getEndpoint() + 'map_markers', lParams,{method:'GET'}).then(function($response){
                $scope.list = $response.markers;
                $scope.updateMarkerList()
                //console.log('marker list:', $scope.list);
                $rootScope.$broadcast('si-listings-update',$scope.list,{item_count: $scope.list.length});
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
            //console.log('adding single marker at', $location);
            
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
            const lPoints = [];

            //console.log($scope.list[0]);
            $siConfig.get().then(function($configs){
                const lListConfig = $configs.lists.find(function($e) {return $e.alias==$scope.alias});
                const lDefaultZoom = lListConfig.default_zoom_level || 'auto';
                const lSmartFocusTolerance = lListConfig.smart_focus_tolerance || 5;

                $scope.list.forEach(function($marker){
                    let lngLat = new google.maps.LatLng($marker.latitude, $marker.longitude);
                    
                    $marker.marker = new SiMarker({
                        position: lngLat,
                        map: $scope.map,
                        obj: $marker,
                        markerClass: ['map-marker-icon',$marker.category_code.replace(' ','_')],
                        onPinClick: $scope.pinClick
                    });
                    
                    $scope.markers.push($marker.marker);
                    const lLngLat = $marker.marker.getPosition();
                    lPoints.push({x: lLngLat.lat(), y: lLngLat.lng(), lngLat: lLngLat});
                    //$scope.extendBounds($scope.bounds, lLngLat);
                });

                if(lSmartFocusTolerance != 'off'){
                    
                    //console.log('points', angular.copy(lPoints));
                    const lXMed = $scope.median(lPoints.map(function($p) {return $p.x}));
                    const lYMed = $scope.median(lPoints.map(function($p) {return $p.y}));
                    let lXAvg = (lPoints.reduce(function ($sum, $p){ return ($sum+Math.abs(lXMed - $p.x))}, 0) / lPoints.length);
                    let lYAvg = (lPoints.reduce(function ($sum, $p){ return ($sum+Math.abs(lYMed - $p.y))}, 0) / lPoints.length);

                    if(lSmartFocusTolerance > 0){
                        const lLatDegKm = 110.574;
                        const lLngDegKm = 111.320;
                        const deg2rad = function($deg) {return ($deg*Math.PI)/180};

                        lXAvg = lXAvg + (lSmartFocusTolerance / lLatDegKm);
                        lYAvg = lYAvg + ((lSmartFocusTolerance / lLngDegKm) / Math.cos(deg2rad(lYAvg)));
                    }
                    
                    const lMedianRect = {
                        x: lXMed - lXAvg, x_prime: lXMed + lXAvg,
                        y: lYMed - lYAvg, y_prime: lYMed + lYAvg,
                        contains: function($x, $y){
                            //console.log($x, $y, 'contained in ', this);
                            return ($x > this.x && $x < this.x_prime) &&
                                    ($y > this.y && $y < this.y_prime)
                        }
                    }
                

                    
                    lPoints
                        .filter(function($p) {return lMedianRect.contains($p.x,$p.y)} )
                        .forEach(function($p) {$scope.bounds.extend($p.lngLat)})
                
                }
                else{
                    lPoints
                        .forEach(function($p){$scope.bounds.extend($p.lngLat)})
                }
                    
                if($scope.list.length>1){
                    let lImagePath = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m';
                    let lClustererOptions = {
                        //cssClass : 'siMarkerCluster',
                        gridSize: 80,
                        styles: [{
                            url: lImagePath + '1.png',
                            height: 53,
                            width: 54,
                            anchor: [0, 0]
                        }, {
                            url: lImagePath + '2.png',
                            height: 56,
                            width: 55,
                            anchor: [0, 0]
                        }, {
                            url: lImagePath + '3.png',
                            width: 66,
                            height: 65,
                            anchor: [0, 0]
                        }]
                    };

                    lClustererOptions = $siHooks.filter('marker_cluster_options',lClustererOptions);

                    $scope.markerCluster = new MarkerClusterer($scope.map, $scope.markers, lClustererOptions);
                    
                    if($scope.is_visible == true){
                        
                        window.setTimeout(function(){
                            
                            $scope.map.fitBounds($scope.bounds);

                            if(lDefaultZoom != 'auto'){
                                $scope.map.setZoom(Number(lDefaultZoom));
                            }
                        },250);
                        
                    }
                }
                else if ($scope.list.length>0){
                    $scope.map.setCenter($scope.list[0].marker.getPosition());
                    
                    if(lDefaultZoom != 'auto'){
                        $scope.map.setZoom(Number(lDefaultZoom));
                    }
                    else{
                        $scope.map.setZoom(12);
                    }
                }
            });
            //console.log('Map markers updated');
        }

        $scope.median = function(values){
            values.sort(function(a,b){
              return a-b;
          });
          var half = Math.floor(values.length / 2);
          
          if (values.length % 2)
              return values[half];
          else
              return (values[half - 1] + values[half]) / 2.0;
        }

        $scope.extendBounds = function($bounds, $lngLat){

            $bounds.extend($lngLat);
        }

        $scope.pinClick = function($marker){
            //console.log('Marker clicked', $marker);

            $siApi.api($scope.getEndpoint().concat('/',siApiSettings.locale,'/items/',$marker.obj.id)).then(function($response){
                let lInfoWindowScope = $siUtils;
                $siDictionary.source = $response.dictionary;

                lInfoWindowScope.compileListingItem($response);
                lInfoWindowScope.item = $response;

                //console.log('lInfoWindowScope',lInfoWindowScope);
                $siTemplate.load('views/ang-templates/si-map-info-window.html?v=2', lInfoWindowScope).then(function($content){
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
                //console.log('latlng', $scope.latlng);
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


        function SiMarker(options) {

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
        if( typeof(google) != 'undefined'){
            SiMarker.prototype = new google.maps.OverlayView();
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

            })(SiMarker.prototype);
        }
    };


    return {
        restrict: 'E',
        replace: true,
        scope: {
            alias: '@siAlias',
            class: '@class',
            configs: '=?siConfigs',
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

siApp
.directive('onBottomReached', function onBottomReached($document) {
    //This function will fire an event when the container/document is scrolled to the bottom of the page
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            const lObservable = angular.element('<span></span>');
            element.append(lObservable);
            const raw = element[0];
            let doc = $document[0];
            //console.log('loading directive on ');
            if (typeof window.IntersectionObserver == 'undefined') {

                $document.bind('scroll', function () {
                    let lTop = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
                    let lBottomLimit = raw.offsetHeight + raw.offsetTop - (window.innerHeight/3*2);
                    //console.log('in scroll', lTop);
                    //console.log(lBottomLimit);
                    if (lTop  >= lBottomLimit) {
                        //console.log("I am at the bottom");
                        scope.$apply(attrs.onBottomReached);
                    }
                });
            }
            else{
                const lMargin = (window.innerHeight > 1080) 
                                    ? window.innerHeight * 0.25 
                                    : window.innerHeight;

                const options = {
                    rootMargin: lMargin + 'px',
                    threshold: 0
                }
                const observer = new IntersectionObserver(function($entries, $observer){
                    $entries.forEach(function($entry){
                        if($entry.isIntersecting){
                            scope.$apply(attrs.onBottomReached);
                        }
                    });
                    
                }, options);
                observer.observe(lObservable[0]);

            }
        }
    };
});

siApp
.directive('siImageSlider', function siImageSlider(){
    return {
        restrict: 'E',
        scope: {
            pictures: '=siPictures',
            dictionary: '=?siDictionary',
            gap: '@siGap',
            index: '=?siIndex',
            showGrid: '=siShowPictureGrid'
        },
        controllerAs: 'ctrl',
        replace:true,
        templateUrl: siCtx.base_path + 'views/ang-templates/si-image-slider.html?v=3',
        link: function (scope, element, attrs) {
            scope.$element = element[0];
            var mc = new Hammer(element[0]);
            let lPanHndl = null;
            scope.init();
        },
        controller: function ($scope,$rootScope, $q,$siApi,$rootScope,$siDictionary, $siHooks, $siUtils,$timeout) {
            $scope.expand_mode = false;
            $scope.picture_grid_mode = false;
            
            $scope.position = {
                current_picture_index : 0
            };
    
            $scope.init = function($element){
                $scope.index = 0;   
                
                $scope.$on('thumbnails-slider-select', function($event, $picture){
                    const lIndex = $scope.pictures.findIndex(function($e){return $e.url == $picture.url});
                    $scope.set(lIndex,false);
                });
    
                if($scope.pictures){
                    // if($siUtils.isLegacyBrowser()){
                    //     const jqElm = jQuery($scope.$element)
                    //     jqElm.find('.viewport .trolley').width(jqElm.width() * $scope.pictures.length);
                    //     window.setTimeout(function(){
                            
                    //         jqElm.find('.viewport .trolley .item').each(function($i,$e){
                    //             jQuery($e).width(jqElm.width());
                    //         })
                    //     },200);
                    // }
                    
                }
                $scope.$on('container-resize', function(){
                    console.log('container-resize');
                    $scope.detectBoxSize();
                })
                window.addEventListener('resize', function(){
                    $scope.detectBoxSize();
                });
                document.addEventListener('fullscreenchange', function(){
                    //console.log('fullscreen change', document.fullscreenElement)
                    if(document.fullscreenElement == null){
                        $timeout(function() {
                            $scope.expand_mode = false;
                            
                        });
                    }
                    $scope.detectBoxSize();
                })

                $timeout(function(){
                    $scope.detectBoxSize();
                })

            }
    
            $scope.next = function(){
                
                //console.log($scope.index, '/', $scope.pictures.length-1);
                let lNewIndex = $scope.index+1;
                if(lNewIndex >=  $scope.pictures.length){
                    lNewIndex= 0;
                }
                $scope.set(lNewIndex);
            }
    
            $scope.previous = function(){
                let lNewIndex = $scope.index-1;
                if(lNewIndex ==  -1){
                    lNewIndex= $scope.pictures.length-1;
                }
                $scope.set(lNewIndex);
            }
    
            $scope.set = function($index, $triggerEvents){
                $triggerEvents = typeof $triggerEvents == 'undefined' ? true : $triggerEvents;
                $scope.index = $index;
                const lViewport = $scope.$element.querySelector('.viewport');
                const lViewportWidth =lViewport.getBoundingClientRect().width;
                if(window.innerWidth <= 640){
                    
                    lViewport.scrollTo($index * lViewportWidth,0);
                    return;
                }
    
                $scope.picture_grid_mode =false;
                
                $scope.updateTrolley();
    
                if($triggerEvents){
                    const lItem = $scope.pictures[$index];
                    $rootScope.$broadcast('mediabox-picture-select', lItem);
                }
    
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
    
            $scope.toggleFullscreen = function(){
                if (
                    document.fullscreenElement ||
                    document.webkitFullscreenElement ||
                    document.mozFullScreenElement ||
                    document.msFullscreenElement
                  ) {
                    if (document.exitFullscreen) {
                      document.exitFullscreen();
                    } 
                    else if (document.mozCancelFullScreen) {
                      document.mozCancelFullScreen();
                    } 
                    else if (document.webkitExitFullscreen) {
                      document.webkitExitFullscreen();
                    } 
                    else if (document.msExitFullscreen) {
                      document.msExitFullscreen();
                    }
    
                    $scope.expand_mode = false;
                  } 
                  else {
                    if ($scope.$element.requestFullscreen) {
                      $scope.$element.requestFullscreen();
                    } 
                    else if ($scope.$element.mozRequestFullScreen) {
                      $scope.$element.mozRequestFullScreen();
                    } 
                    else if ($scope.$element.webkitRequestFullscreen) {
                      $scope.$element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                    } 
                    else if ($scope.$element.msRequestFullscreen) {
                      $scope.$element.msRequestFullscreen();
                    }
    
                    $scope.expand_mode = true;
                  }
    
                
            }
    
            $scope.togglePictureGrid = function(){
                $scope.picture_grid_mode = !$scope.picture_grid_mode;
            }
    
            $scope.getImageAlt = function($img){
                const lCaption = $siDictionary.getCaption({src:$img, key:'category_code'},'photo_category');
                const lResult = $siHooks.filter('listing-picture-alt', lCaption, $img);
    
                return lResult;
            }
    
            $scope.getImageCaption = function($img){
                const lCaption = $siDictionary.getCaption({src:$img, key:'category_code'},'photo_category');
                const lResult = $siHooks.filter('listing-picture-caption', lCaption, $img);
    
                return lResult;
            }
    
            $scope.updateTrolley = function(){
                return;
                const jqElm = jQuery($scope.$element);
                jqElm.find('.trolley').css('transform', 'translateX(-' + ($scope.index * jqElm.width()) + 'px)');
            }
    
            $scope.getTrolleyStyle = function(){
                if($scope.pictures == null) return {};
    
                return '--item-count:' + $scope.pictures.length + ';--item-index:' + $scope.index;
    
                if(!$siUtils.isLegacyBrowser()){
                    return {
                        'transform' :'translateX(-' + (100 * $scope.index) + '%)',
                        'grid-gap': $scope.gap + 'px',
                        'grid-template-columns': 'repeat(' + $scope.pictures.length + ',100%)'
                    }
                }
                else{
                    const jqElm = jQuery($scope.$element);
                    return {
                        'transform' :'translateX(-' + ($scope.index * jqElm.width()) + 'px)',
                    }
                }
            }

            $scope.detectBoxSize = function(){
                const lElm = $scope.$element;
                
                const lElmRect = lElm.getBoundingClientRect();
                
                lElm.style.setProperty('--viewport-width', lElmRect.width + 'px');
                lElm.style.setProperty('--viewport-height', lElmRect.height + 'px');

                if($siUtils.isLegacyBrowser()){
                    const lPictures = Array.from(lElm.querySelectorAll('.viewport .trolley .item'));
                    lPictures.forEach(function($p){
                        $p.style.width = lElmRect.width + 'px';
                    })
                }
            }
        }
    };
});

siApp
.directive('siImageAutoFit', function siImageAutoFit(){
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs){
            console.log('siImageAutoFit', $element[0].tagName);
            if($element[0].tagName !=  'IMG') return;

            
            const lImg = $element[0];
            const lDefaultFit = $attrs.siImageAutoFit || 'cover';
            //const lImg = document.createElement('img');
            const fnGetOrientation = function($width, $height){
                return ($width >= $height) ? 'landscape' : 'portrait';
            }

            lImg.addEventListener('load', function($event){
                const lNaturalOrientation = fnGetOrientation(lImg.naturalWidth, lImg.naturalHeight);
                const lComputedOrientation = fnGetOrientation(lImg.width, lImg.height);
                
                if(lNaturalOrientation == lComputedOrientation){
                    lImg.style.objectFit = lDefaultFit;
                }
                else if (lNaturalOrientation == 'landscape'){
                    lImg.style.objectFit = 'cover';
                }
                else{
                    lImg.style.objectFit = 'contain';
                }
            }, {once:true});
            //lImg.setAttribute('src',lElm.src);

            lImg.addEventListener('resize', function($event){
                if(document.fullscreenElement != null){
                    lImg.style.objectFit = 'contain';
                    return;
                }
            });
        }
    }
})

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
                    console.log('init slider',$configs);
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
                console.log('apply properties')
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
                console.log('postProcessListItem', $type, $item);

                $item.photo_url = $item.photo_url.replace('-sm.jpg','-lg.jpg');
                let lTitle;

                if($type == 'listings'){
                    lTitle = $item.subcategory;

                    if($item.category_code == 'RESIDENTIAL'){
                            
                        if($item.rooms.bed.count>0){
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
}])

// siApp
// .directive('siSrcset', ['$compile', function siSrcset($compile){
//     return {
//         restrict: 'A',
//         link: function($scope, $element, $attrs){
//             const lOriginalPicture = $attrs.siSrcset;
            
//             if($element[0].tagName != 'IMG') return;
//             if(lOriginalPicture.indexOf('-sm.') < 0) return;
//             if($attrs.siSrcset == undefined) return;
//             if($attrs.siSrcset.indexOf('1x')>0) return;
            
//             const lPictureSets = [lOriginalPicture + ' 1x'];
//             ['md'].forEach(function($size,$index){
//                 lPictureSets.push(lOriginalPicture.replace('-sm.','-' + $size + '.') + ' ' + ($index + 2) + 'x');
//             });

//             console.log('si-srcset',lPictureSets.join(', '));

//             $element[0].setAttribute('data-si-srcset', lPictureSets.join(', '));
//         }
//     }
// }])

siApp
.directive('siCalculator', function siCalculator(){
    return {
        restrict: 'E',
        scope: {
            amount: '=siAmount',
            dictionary: '=?siDictionary',
            downpayment_selection: '@?siDownpaymentSelection',
            region: '@?siRegion',
            cityCode: '@?siCity',
            on_change: '&onChange'
        },
        controllerAs: 'ctrl',
        replace:true,
        templateUrl: siCtx.base_path + 'views/ang-templates/si-calculator.html?v=2',
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
                //console.log('ratio', lRatio);
                $scope.process_branch(lBranch, lRatio);
    
                let lResult = {
                    mortgage : lBranch,
                    transfer_tax : $scope.getTransferTax($scope.data.amount,$scope.region=='06 ')
                }
    
                $rootScope.$broadcast('si-mortgage-calculator-result-changed', lResult);
                
                if(typeof($scope.on_change) == 'function'){
                    $scope.on_change({'$result' : lResult});
                }
    
                //console.log('processing triggered', lResult);
            }
    
            $scope.process_branch = function (branch, downpayment_ratio) {
                branch.downpayment = getDownPayment($scope.data.amount, downpayment_ratio) + 0.000001;
                branch.insurance = getMortgageInsurance($scope.data.amount, downpayment_ratio);
                branch.mortgage = $scope.data.amount - branch.downpayment + branch.insurance;
                
                const PrValue = branch.mortgage;  //Number($("input[name=calPropertyCost]").val()) - Number($("input[name=calCash]").val());
                const IntRate = branch.rate / 100; //Number($("input[name=calInterest]").val()) / 100;
                const Period = branch.amortization; //Number($("input[name=calAmortizationPeriod]").val());
                const PPay = branch.frequency; //Number($("input[name=calFreq]").val());
    
                const intcandebase = Math.pow((1 + IntRate / 2), (2 / PPay)) - 1;
                const paymperiobase = (PrValue * intcandebase) / (1 - (1 / Math.pow((1 + intcandebase), (Period * PPay))));
                branch.payment = paymperiobase;
            };
    
            getDownPayment = function (price, downpayment_ratio) {
                return price * downpayment_ratio;
            };
    
            getMortgageInsurance = function (price, downpayment_ratio) {
                //  EDIT:   remove insurance offset because it's not shown 
                //          and insurance are calculated on fixed downpayment ratio
                //          We should correct it by including range or get a real 
                //          algorithm
                return 0;
                let lResult = price - (price * downpayment_ratio);
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
    
            $scope.getTransferTax = function (amount, in_montreal) {
                in_montreal = (typeof (in_montreal) == 'undefined') ? false : in_montreal;
                parts = [];
                const lBoundaries = $scope.getTransferTaxBoundaries($scope.cityCode);
                //console.log('transferTax',$scope.cityCode, lBoundaries);
                //console.log('in montreal', in_montreal);
                
                let rates = lBoundaries.rates;
                let bounds = lBoundaries.bounds;
                // let lAmountRaw = $("#purchase_price").val();
                
                // let amount = me.devise(parseFloat(lAmountRaw.replace(/ /g,'')));
                let taxemutation = 0;
                for (i=0; i<rates.length; i++) {
                    if(amount <= 0) continue;

                    const lRemovedAmount = (i==0) ? Math.min(bounds[i],amount) : Math.min(bounds[i] - bounds[i-1],amount);
                    taxemutation = taxemutation + lRemovedAmount*rates[i];
                    amount = amount - lRemovedAmount;
                    //console.log('step',i,':', lRemovedAmount,'x',rates[i]*100,'% =', lRemovedAmount*rates[i], '(',taxemutation,') still have', amount, '$ to process' )
                }

                return Math.round(taxemutation);
            };
            
            $scope.getTransferTaxBoundaries = function($cityCode){
                
                const defaultBoundaries = {code: 'default', rates: [0.005,0.01,0.015], bounds : [50900,254400,99000000]};
                if($cityCode == undefined) return defaultBoundaries;
                
                const citiesBoundaries = [
                    {code: '93042', name:'Alma', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '73005', name:'Boisbriand', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '59005', name:'Boucherville', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.02]},
                    {code: '58005', name:'Brossard', bounds:[50900,254400,750000,1000000,99000000],rates:[0.005,0.01,0.015,0.02,0.025]},
                    {code: '57005', name:'Chambly', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.025]},
                    {code: '67050', name:'Châteauguay', bounds:[50900,254400,505200,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '49057', name:'Drummondville', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.025]},
                    {code: ["46085", "46112"], name:'Farnham', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.0225]},
                    {code: '66100', name:'Kirkland', bounds:[50900,254400,500000,1000000,99000000],rates:[0.005,0.01,0.015,0.02,0.025]},
                    {code: '60028', name:'L\'assomption', bounds:[50900,254400,508700,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: ["65101", "65102", "65103", "65104", "65105", "65106", "65107", "65108", "65109", "65110", "65111", "65112", "65113"], name:'Laval', bounds:[50900,254400,500000,1000000,99000000],rates:[0.005,0.01,0.015,0.02,0.025]},
                    {code: ["25214", "25215", "25216"], name:'Lévis', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: ["58015", "58020", "58227"], name:'Longueuil', bounds:[50900,254400,508699,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '73025', name:'Lorraine', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '64015', name:'Mascouche', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '57035', name:'Mont-Saint-Hilaire', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: ["66020", "66030", "66040", "66057", "66065", "66070", "66075", "66085", "66125", "66130", "66140", "66150", "66501", "66505", "66506", "66507", "66508", "66509", "66511", "66516"], name:'Montréal', bounds:[50900,254400,508700,1017400,99000000],rates:[0.005,0.01,0.015,0.02,0.025]},
                    {code: '78102', name:'Mont-Tremblant', bounds:[50900,254400,503500,1007000,99000000],rates:[0.005,0.01,0.015,0.02,0.025]},
                    {code: '77050', name:'Morin-Heights', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.025]},
                    {code:  ["60010", "60013"], name:'Repentigny', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '10043', name:'Rimouski', bounds:[50900,254400,505100,757700,1010300,99000000],rates:[0.005,0.01,0.015,0.02,0.025,0.03]},
                    {code: '75005', name:'Saint-Colomban', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '72005', name:'Saint-Eustache', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.025]},
                    {code: '56083', name:'Saint-Jean-Sur-Richelieu', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '59010', name: 'Sainte-Julie', rates: [0.005,0.01,0.015 ,0.025], bounds : [50900,254400,500000,99000000]},
                    {code: '87120', name:'Saint-Lambert', bounds:[50900,254400,500000,1000000,99000000],rates:[0.005,0.01,0.015,0.02,0.025]},
                    {code: '77040', name:'Saint-Sauveur', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: ["43010", "43020", "43023", "43024", "43025", "43030"], name:'Sherbrooke', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '53052', name:'Sorel-Tracy', bounds:[50900,254400,500000,700000,900000,99000000],rates:[0.005,0.01,0.015,0.02,0.025,0.03]},
                    {code: ["64005", "64008", "64020"], name:'Terrebonne', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '37067', name:'Trois-Rivières', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.02]},
                    {code: '78010', name:'Val David', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.02]}
                ];
                
                const lBoundedCity = citiesBoundaries.find(function($e){ 
                    if(Array.isArray($e.code)){
                        return $e.code.includes($cityCode.toString());
                    }
                    return $e.code == $cityCode
                });

                if(lBoundedCity != null) return lBoundedCity;
                return defaultBoundaries;
            }

            $scope.preload = function(){
                let lData = sessionStorage.getItem('si.mortgage-calculator');
                if(lData != null){
                    $scope.data = JSON.parse(lData);
                }
            }
    
            $scope.save = function(){
                sessionStorage.setItem('si.mortgage-calculator', JSON.stringify($scope.data));
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

siApp
.directive('siModalTrigger', function siModalTrigger(){
    return {
        restrict: 'C',
        scope:{
            target : '@'
        },
        link: function($scope, element, attr){
            angular.element(element).bind('click', function(){
                $scope.openModal();
            });
        },
        controller: function($scope, $rootScope){
            $scope.openModal = function(){
                //console.log('broadcasting show-',$scope.target);
                $rootScope.$broadcast('show-' + $scope.target);
            }
        }
    }
});

siApp
.directive('siModal', function siModal(){
    let dir_controller = function siModalCtrl($scope, $q,$siApi,$rootScope,$siHooks) {
        $scope.modal_element = null;
        $scope.forms = {};

        $scope.options = {
            close_label : null,
            ok_label: 'OK'
        }

        //console.log('listening to "show-' + $scope.modal_id + '" trigger');
        $scope.$on('show-' + $scope.modal_id, function(){
            //console.log('show modal trigger received');
            $scope.open();
            $siHooks.do('si-modal-open');
        });

        $scope.init = function(){
            if($scope.model==null){
                $scope.model = {};
            }   
            
            const lForm = $scope.modal_element.find('form').eq(0);
            if(lForm != null){
                $scope.forms.modalForm = lForm.controller('form');
            }
            else{
                $scope.forms.modalForm = null;
            }

            //var input1 = element.find('input').eq(0);
        }

        $scope.cancelEvent = function($event){
            //console.log('event trapped bouhou!')
            $event.stopPropagation();
        }

        $scope.open = function(){
            $scope.modal_element.addClass("opened");
            $scope.$emit('modal-opened');
        }

        $scope.close = function(){
            $scope.modal_element.removeClass("opened");
            $scope.$emit('modal-closed');
        }

        $scope.closeWithValue = function(){
            //console.log('close with value',typeof($scope.onOK))
            
            if($scope.forms.modalForm.$valid){
                if(typeof($scope.onOK)=='function'){
                    $scope.onOK();
                }
                $scope.close();
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

        $scope.isFormValid = function(){
            if ($scope.forms.modalForm == null) return true;
            return $scope.forms.modalForm.$valid;
        }
    };

    return {
        restrict: 'E',
        scope: {
            modal_id        : '@modalId',
            modal_title     : '@modalTitle',
            onOK            : '&?onOk',
            model           : '=?ngModel',
            ok_label        : '@?okLabel',
            cancel_label    : '@?cancelLabel',
            onValidate      : '&?onValidate',
            showControls    : '@?showControls'
        },
        controllerAs    : 'modalCtrl',
        replace         : true,
        transclude      : true,
        templateUrl     : siCtx.base_path + 'views/ang-templates/si-modal.html?v=3',
        link            : function(scope, element, attr){
            
            scope.modal_element = element;
            if(scope.modal_element_moved !== true){
                jQuery(element[0]).appendTo(document.body);
                scope.modal_element_moved = true;
                
                //console.log('modal content moved to body',element[0],jQuery(element[0]).find('input[type=submit]'));
                
                scope.init();
                
            }
            
            //angular.element(document.body).append(scope.modal_element,true);
        },
        controller      : dir_controller,
    };
});

siApp
.directive('siLazyLoad', ['$timeout', function siLazyLoad($timeout){
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs){
            if (typeof window.IntersectionObserver == 'undefined') {
                $scope.applyAllImageSource();
            }
            else {
                const lMargin = (window.innerHeight > 1080) 
                                    ? window.innerHeight * 0.25 
                                    : window.innerHeight;
                const options = {
                    rootMargin: lMargin + 'px',
                    threshold: 0
                }

                $scope.observer = new IntersectionObserver(function($entries, $observer){
                    $entries.forEach(function($entry){
                        if($entry.isIntersecting){
                            $scope.applyImageSource($entry.target);
                            $scope.observer.unobserve($entry.target);
                        }
                    });
                    
                }, options);

                $scope.applyObserver();
            }
        },
        controller: function($scope){
            $scope.$on('si-list-loaded', function(){
                console.log('list loaded triggered');
                $timeout(function(){
                    if($scope.observer != undefined){
                        $scope.applyObserver();
                    }
                    else{
                        $scope.applyAllImageSource();
                    }
                })
            });

            $scope.applyAllImageSource = function(){
                let lLazyLoadImages = document.querySelectorAll('.si-lazy-loading img')
                if(lLazyLoadImages.forEach == undefined){
                    lLazyLoadImages = Array.from(lLazyLoadImages);
                }
                lLazyLoadImages.forEach(function($element){
                    if($element.getAttribute('src') != null) return;
                    $scope.applyImageSource($element);
                });
            }

            $scope.applyImageSource = function($imgElm){
                let lImgSource = $imgElm.getAttribute('si-src') || $imgElm.getAttribute('data-si-src');
                const lImgSourceset = $scope.getSourceSet($imgElm); //.getAttribute('si-srcset') || $imgElm.getAttribute('data-si-srcset');

                if($imgElm.getBoundingClientRect().width > 1200){
                    lImgSource = lImgSource.replace("-sm.","-lg.");
                }
                if($imgElm.getBoundingClientRect().width > 400){
                    lImgSource = lImgSource.replace("-sm.","-md.");
                }
                console.log('siLazyLoad', lImgSource, lImgSourceset);

                if(lImgSource != undefined) $imgElm.setAttribute('src', lImgSource);
                if(lImgSourceset != undefined) $imgElm.setAttribute('srcset', lImgSourceset);

            }

            $scope.applyObserver = function(){
                let lLazyLoadImages = document.querySelectorAll('.si-lazy-loading img')
                if(lLazyLoadImages.forEach == undefined){
                    lLazyLoadImages = Array.from(lLazyLoadImages);
                }
                
                lLazyLoadImages.forEach(function($element){
                    if($element.getAttribute('src') != null) return;
                    $scope.observer.observe($element);
                });
            
            }

            $scope.getSourceSet = function($imgElm){
                if(!$imgElm.hasAttribute('si-srcset') && !$imgElm.hasAttribute('data-si-srcset')) return;
                const lSrcset = $imgElm.getAttribute('si-srcset') || $imgElm.getAttribute('data-si-srcset');
                
                if(lSrcset.indexOf('-sm.') < 0) return lSrcset;
                
                
                const lOriginalPicture = lSrcset;                
                const lPictureSets = [];

                if($imgElm.getBoundingClientRect().width < 400){
                    lPictureSets.push(lOriginalPicture + ' 1x');
                }

                ['md'].forEach(function($size,$index){
                    lPictureSets.push(lOriginalPicture.replace('-sm.','-' + $size + '.') + ' ' + ($index + lPictureSets.length + 1) + 'x');
                });

                return lPictureSets.join(', ');
                // console.log('si-srcset',lPictureSets.join(', '));

                // $element[0].setAttribute('data-si-srcset', lPictureSets.join(', '));
            }
            
        }
    }
}])

siApp
.directive('siFavoritesButton', [function siFavoritesButton(){
    return {
        restrict: 'E',
        templateUrl: siCtx.base_path + 'views/ang-templates/si-favorites-button.html',
        replace: true,
        link: function($scope, $element, $attr){
            $scope.init($element);
        },
        controller: function($scope,$rootScope, $siFavorites, $timeout){
            $scope.favorites = $siFavorites;
            $scope._panel_elm = null;
            $scope._elm = null;
            $scope._button_elm = null;

            $scope.init = function($element){
                $scope._elm = $element[0];
                $scope._button_elm = $scope._elm.querySelector('.si-favorites-toggle-button');
                const lPanel = $scope._elm.querySelector('.si-favorites-panel');

                const lButtonRect = $scope._button_elm.getBoundingClientRect();
                lPanel.style.setProperty('--origin-y', lButtonRect.top + ( lButtonRect.height/2) + 'px');
                lPanel.style.setProperty('--origin-x',  lButtonRect.left + ( lButtonRect.width/2) + 'px');

                angular.element(document.body).on('click', function(){
                    $scope.closePanel();
                });

            }

            $scope._favorite_filter = null;
            
            $scope.getFavoriteFilter = function(){
                const lListingsRefNumbers = $siFavorites.getValues();
                if($scope._favorite_filter == null || $scope._favorite_filter.value.length != lListingsRefNumbers.length){
                    $scope._favorite_filter = {
                        field: 'ref_number',
                        operator: 'in',
                        value : lListingsRefNumbers
                    };
                }
                return $scope._favorite_filter;
            }

            $scope.togglePanel = function($event){
                $event.preventDefault();
                
                if($scope._panel_elm == null){
                    $scope._panel_elm = $scope._elm.querySelector('.si-favorites-panel');
                    angular.element('body').append($scope._panel_elm);

                    angular.element($scope._panel_elm).on('click', function($event){
                        //$event.preventDefault();
                        $event.stopPropagation();
                    })
                }
                
                if(!$scope._panel_elm.classList.contains('opened')){
                    $event.stopPropagation();
                    $rootScope.$broadcast('close-everything');
                    $scope.list = $siFavorites.favorites
                    
                    $timeout(function(){
                        $scope._panel_elm.classList.add('opened');
                        $rootScope.$broadcast('si-list-loaded');
                    },100)
                }
                else{
                    $scope.closePanel();
                }

                
            }

            $scope.closePanel = function(){
                if($scope._panel_elm == null) return;

                $scope._button_elm.classList.remove('panel-opened');
                $scope._panel_elm.classList.remove('opened');
            }

            $scope.removeFromList =function($event, $item){
                console.log('removeFromList');
                $event.preventDefault();
                $event.stopPropagation();

                $siFavorites.toggle($item);
            }
        }
    }
}])

/**
 * Delayed renderer
 * Get a server side ajex render after a trigger
 */
siApp
.directive('siDelayedRenderer', ['$http','$timeout','$siHooks', function siDelayedRenderer($http,$timeout,$siHooks){
    return {
        restrict: "A",
        link: function($scope,$element,$attrs){
            $scope.init($element,$attrs);
        },
        controller: function($scope){
            $scope._elm = null;

            $scope.init = function($element,$attrs){
                $scope._elm = $element;
                $scope.trigger = $attrs.siDelayedRenderer;
                $scope.content = $element.html();
                $element.html('');

                if(isNaN($scope.trigger)){
                    $siHooks.addAction($scope.trigger, function(){ $scope.render(); });
                }
                else{
                    $timeout(function(){ $scope.render();}, Number($scope.trigger));
                }
            }

            $scope.render = function(){
                const expression = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
                const regex = new RegExp(expression);

                if(regex.test($scope.content) || $scope.content.indexOf('/wp-json/si-rest') == 0){
                    $scope.content = $scope.content.replace(/\&amp;/gi,'&');

                    $http.get($scope.content).then(function($response){
                        if($response.status == 200){
                            $scope._elm.html('');
                            $scope._elm.append($response.data);
                        }
                    });
                }
                else{
                    $scope._elm.append($scope.content);
                }
            }
        }
    }
}]);

siApp
.directive('siContainer', function siContainer(){
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
});

siApp
.directive('siListingNavigation', ['$q',function siListingNavigation(){
    return {
        restrict: "E",
        replace: true,
        transclude: true,
        scope:{
            current : '=siCurrent',
            display : '@siDisplay',
            panelTitle: '@?siTitle'
        },
        templateUrl: siCtx.base_path + 'views/ang-templates/si-listing-navigation.html?v=2',
        link: function($scope, element, attr){
            $scope.init();
        },
        controller: function($scope, $rootScope) {
            $scope.list = [];
            $scope.previous = null;
            $scope.next = null;

            $scope.init = function(){
                
            }

            $scope.$watch('current',function($new,$old){
                if($new != null){
                    $scope.getNextAndPrevious();
                }
            })

            $scope.loadList = function(){
                let lList = sessionStorage.getItem('si.list.listings.{0}'.format(siCtx.locale));
                if(lList != undefined){
                    lList = JSON.parse(lList);
                }
                else{
                    lList = [];
                }
                return lList;
            }

            $scope.getNextAndPrevious = function(){
                const lList = $scope.loadList();
                let lCurrentIndex = lList.findIndex(function($e){
                    return $e.id == $scope.current;
                });

                const lResult = Array.from(Array(2));
                if(lCurrentIndex>0){
                    lResult[0] = lList[lCurrentIndex-1];
                    
                }
                if(lCurrentIndex < lList.length-1){
                    lResult[1] = lList[lCurrentIndex+1];
                    
                }

                $scope.list = lResult;
            }
        }
    };
}]);

siApp
.directive('siLoading', [function siLoading(){
    return {
        restrict: 'E',
        replace: true,
        scope: {
            label: '@siLabel'
        },
        template: '<div class="si-loading"><i class="fal fa-spinner fa-spin"></i> {{label.translate()}}</div>',
        controller: function($scope){
            
        }
    }
}]);


siApp
.directive('siDropdown',['$rootScope',
    function siDropdown($rootScope){
        return {
            restrict: 'C',
            scope: {
                showButtonIcon : "@?",
                hasValue : "@?"
            },
            link: function($scope,$element,$attr){
                $scope.init($element);
            },
            controller: function($scope, $timeout,$siUtils){
                $scope._menu_elm = null;

                $scope.$watch('hasValue', function($new, $old){
                    if($new == true){
                        $scope._elm.classList.add('has-value');
                    }
                    else{
                        $scope._elm.classList.remove('has-value');
                    }
                });

                $scope.init = function($element){
                    $scope._elm = $element[0];

                    $scope.showButtonIcon = (typeof $scope.showButtonIcon == 'undefined') ? true : $scope.showButtonIcon;
                    $scope.hasValue = (typeof $scope.hasValue == 'undefined') ? false : $scope.hasValue!=null;
                    $scope.buttonIcon = "anchor-down";

                    if($scope.hasValue){
                        $scope._elm.classList.add('has-value');
                    }

                    if($scope.showButtonIcon === true || $scope.showButtonIcon != 'false'){
                        $scope._elm.classList.add('has-button-icon');
                        if(typeof $scope.showButtonIcon == 'string' && $scope.showButtonIcon != 'true'){
                            $scope.buttonIcon = $scope.showButtonIcon;
                        }
                    }

                    $scope.applyEvents();
                }

                $scope.applyEvents  = function(){
                    // track click on parents to close the dropdown
                    // will climb the document up to the body
                    angular.element(document).on('click', function(){
                        console.log('Closest parent clicked');
                        $rootScope.$broadcast('close-dropdown', null);
                    })
    
                    // Apply button click event handler
                    angular.element($scope._elm).find('.dropdown-button').on('click', $scope.clickHandler);
                    
                    // listen to 'close-dropdown' signal to close the menu
                    $scope.$on('close-dropdown', function($event, $source){
                        if($source != $scope._elm){
                            $scope.closeMenu();
                        }
                    })
                }

                $scope.getContentHeight = function($element){
                    let lPotentialHeight = 0;
                    $element.querySelectorAll('.dropdown-item').forEach(function($e){
                        lPotentialHeight += Number(window.getComputedStyle($e).height.replace('px',''));
                    });
                    //const lMenuElm = $element.querySelector('.si-dropdown-panel');

                    //lMenuElm.style.setProperty('--content-height', lPotentialHeight);
                    return lPotentialHeight;
                }

                $scope.closeMenu = function(){
                    if($scope._menu_elm != null){
                        $scope._menu_elm.classList.remove('expanded');
                        $scope._menu_elm.removeAttribute('style');
                        const lClickTrap = $scope.ensureClickTrap();
                        lClickTrap.classList.remove('active');
                        lClickTrap.style.removeProperty('z-index');
                    }
                }

                $scope.clickHandler = function($event){
                    console.log('button clicked');
                    $rootScope.$broadcast('close-dropdown', $scope._elm);
                    // const lClosestParent = $scope._elm.closest('.modal-body, .filter-panel');
                    // angular.element(lClosestParent).on('click', function(){
                    //     console.log('Closest parent clicked');
                    //     $rootScope.$broadcast('close-dropdown', null);
                    // })
                    
                    const lElmZIndex = $siUtils.elmOffsetZIndex($scope._elm);

                    const lMenuElm = $scope.extractMenu($scope._elm);
                    lMenuElm.classList.add('expanded');
                    console.log('Elm z-index', lElmZIndex);

                    if(lElmZIndex != 'auto'){
                        lMenuElm.style.zIndex = Number(lElmZIndex) + 10;
                    }
                    else{
                        lMenuElm.style.zIndex = 100;
                    }
                    
                    
                    const lClickTrap = $scope.ensureClickTrap();
                    lClickTrap.classList.add('active');
                    if(lElmZIndex != 'auto') lClickTrap.style.zIndex = Number(lElmZIndex) + 5;
                    lClickTrap.addEventListener('click',function($event){
                        lMenuElm.classList.remove('expanded');
                        //$rootScope.$broadcast('close-dropdown', null);
                        lClickTrap.classList.remove('active');
                        lClickTrap.style.removeProperty('z-index');
                        $event.stopPropagation();
                    },{once:true});

                    $event.stopPropagation();
                }

                $scope.ensureClickTrap = function(){
                    let lClickTrap = document.body.querySelector('.si-click-trap');
                    if(lClickTrap == null){
                        lClickTrap = document.createElement("div");
                        lClickTrap.classList.add('si-click-trap');
                        //lClickTrap.style.zIndex = 100;
                        document.body.prepend(lClickTrap);
                    }

                    return lClickTrap;
                }

                $scope.extractMenu = function($element){
                    if($scope._menu_elm == null){
                        const lMenu = $element.querySelector('.si-dropdown-panel');
                        document.body.append(lMenu);
                        $scope._menu_elm = lMenu;

                        $scope._menu_elm.addEventListener('click', function($event){
                            $event.stopPropagation();
                            $scope.closeMenu();
                        })
                    }

                    
                    $timeout(function() {
                        const lMainElmRect = $scope._elm.getBoundingClientRect();
                        lMainElmRect.inner_cx = lMainElmRect.width / 2;
                        lMainElmRect.inner_cy = lMainElmRect.height / 2;
                        lMainElmRect.cx = lMainElmRect.left + lMainElmRect.inner_cx;
                        lMainElmRect.cy = lMainElmRect.top + window.pageYOffset + lMainElmRect.inner_cy;
                        
                        
                            
                        $scope._menu_elm.style.width='unset';
                        $scope._menu_elm.style.minWidth = lMainElmRect.width + 'px';
                        $scope._menu_elm.style.top = lMainElmRect.cy + 'px';
                        $scope._menu_elm.style.left = lMainElmRect.cx + 'px';    
                        //$scope._menu_elm.style.transform = 'translate(-50%,-50%)';
    
                        // position the dropdown menu
                        const lMenuRect = $scope._menu_elm.getBoundingClientRect();
                        lMenuRect.height = $scope.getContentHeight($scope._menu_elm);
                        lMenuRect.top = lMainElmRect.cy - (lMenuRect.height/2);
                        
                        const lMenuStyle = window.getComputedStyle($scope._menu_elm);
                        const lMenuWidth = Number(lMenuStyle.width.replace('px',''));
                        const lMenuHeight = $scope.getContentHeight($scope._menu_elm);
                        const lViewportRect = {
                            top: Math.min(25,lMainElmRect.top),
                            left:Math.min(25,lMainElmRect.left),
                            bottom: window.innerHeight -  Math.min(50,lMenuRect.top * 2),
                            right: window.innerWidth -  Math.min(50,lMenuRect.left * 2)
                        }
                        
                        const lTransform = {x : '-50%',y : '-50%'};
                        console.log({
                            menuRect: lMenuRect,
                            viewportRect: lViewportRect
                        });
    
                        if(lMenuRect.left < lViewportRect.left){
                            lTransform.x = '0%';
                        }
                        else if (lMenuRect.right > lViewportRect.right){
                            lTransform.x = 'calc(-100% + ' + lMainElmRect.inner_cx + 'px)';
                        }
    
                        if(lMenuRect.top < lViewportRect.top){
                            lTransform.y = (0 - lMainElmRect.inner_cy) + 'px';
                        }
                        else if(lMenuRect.bottom > lViewportRect.bottom){
                            lTransform.y = 'calc(-100% + ' + lMainElmRect.inner_cy + 'px)';
                        }
                        //$scope._menu_elm.style.zIndex = 110;
                        $scope._menu_elm.style.transform = 'translate(' + lTransform.x + ',' + lTransform.y +')';
                    },20);
                    

                    return $scope._menu_elm;
                }
            }
        }
    }
])

siApp
.directive('siCheckbox',['$parse', function siCheckbox($parse){
    return {
        retrict: 'E',
        transclude:true,
        scope: {
            label: '@',
            model: '=?ngModel',
            checked:'@?siChecked'
        },
        link: function($scope, $element, $attrs){
            if($attrs.siChecked != undefined){
                const isChecked = $parse($attrs.siChecked)($scope);
                $scope.model = isChecked;
                console.log(isChecked,$attrs.siChecked);
            }
        },
        template: '<div class="pretty p-icon p-pulse">' +
                    '<input type="checkbox" ng-model="model">' +
                    '<div class="state">' +
                        '<i class="icon fas fa-check"></i>' +
                        '<label>{{label}}</label>' +
                    '</div>' + 
                  '</div>'
    }
}]);

siApp
.directive("siPriceRangeSlider", ['$document', function siPriceRangeSlider($document) {
    return {
        restrict: "E",
        scope: {
            model: "=",
            max: "=siMax",
            onChange: "&",
            valueFormat: "&",
            property: "@",
            startLabel: "@",
            endLabel:"@"
        },
        replace: true,
        templateUrl: siCtx.base_path + 'views/ang-templates/si-price-range-slider.html',
        link: function($scope, $element, attrs) {
            // It's the inner div we're really working with.
            const element = $element[0].querySelector('.inner');
            
            $scope.init(element);

            return $scope.$watch("model", function(){
                //$scope.model = $scope.model.slice(0,2);
                $scope.updatePositions();
            },true);
        },
        controller: function($scope, $timeout){
            //var getP, handles, rangeHandle, i, j, len, mv, pTotal, ref, setP, step, updatePositions;
            $scope.handles = [];
            $scope.rangeHandle = null;
            $scope.pTotal = 0;
            $scope.eventMaps = {
                "mouse" : {
                    down : 'mousedown',
                    move : 'mousemove',
                    up : 'mouseup'
                },
                "touch" : {
                    down : 'touchstart',
                    move : 'touchmove',
                    up : 'touchend'
                }
            }

            $scope.init = function($element){
                $scope.element = $element;
                $scope.rangeHandle = $element.querySelector('.slider-range-handle');
                $scope.handles.push($element.querySelector('.slider-handle.min'));
                $scope.handles.push($element.querySelector('.slider-handle.max'));

                $scope.handles.forEach(function($h, $i){
                    $scope.applyPointerEvent($h, $i, 'mouse');
                    $scope.applyPointerEvent($h, $i, 'touch');   
                });
                $scope.applyRangeHandleEvent('mouse');
            }

            $scope.boundaryClasses = function(){

            }

            /**
             * Apply event handling for pointer
             * @param $elm Angular element upon which ye bind event
             * @param $type mouse|touch
             */
            $scope.applyPointerEvent = function($elm, $elm_index,  $type){
                angular.element($elm).on($scope.eventMaps[$type].down, function(event) {
                    lPositionRef = event;
                    
                    const lPointerMoveHndl = function(event){
                        return $scope.$apply(function() {
                            
                            let lPositionRef = event;
                            if($type=='touch'){
                                lPositionRef = event.originalEvent.touches[0];
                            }
                            
                            const lElmBox = $scope.element.getBoundingClientRect();

                            const lScopedPositionX = lPositionRef.clientX - lElmBox.left;
                            const lPctPositionX = Math.max(0, Math.min(1, (lScopedPositionX /  lElmBox.width) ));
                            
                            $scope.setP($elm_index, lPctPositionX)
                        });
                    };
                    
                    const lPointerUpHndl = function() {
                        $document.unbind($scope.eventMaps[$type].move, lPointerMoveHndl);
                        $document.unbind($scope.eventMaps[$type].up, lPointerUpHndl);

                        if(typeof $scope.onChange == 'function'){
                            // trigger onChange only when pointer release the handle
                            $scope.onChange();
                        }
                    };


                    // Prevent default dragging of selected content
                    if($type=='touch'){
                        lPositionRef = event.originalEvent.touches[0];
                    }
                    event.preventDefault();
                    
                    $document.on($scope.eventMaps[$type].move, lPointerMoveHndl);
                    return $document.on($scope.eventMaps[$type].up, lPointerUpHndl);
                });
            }

            $scope.applyRangeHandleEvent = function($type){
                angular.element($scope.rangeHandle).on($scope.eventMaps[$type].down, function(event) {
                    lPositionRef = event;
                    const lElmBox = $scope.element.getBoundingClientRect();

                    let lScopedPositionStartX = (lPositionRef.clientX - lElmBox.left);
                    
                    const lPointerMoveHndl = function(event){
                        return $scope.$apply(function() {
                            
                            let lPositionRef = event;
                            if($type=='touch'){
                                lPositionRef = event.originalEvent.touches[0];
                            }
                            
                            const lValues = [
                                $scope.getP(0) * lElmBox.width,
                                $scope.getP(1) * lElmBox.width
                            ];

                            const lRange = (lValues[1] - lValues[0]) / lElmBox.width;
                            const lScopedPositionX = lPositionRef.clientX - lElmBox.left;
                            const lScopedDeltaPositionX = lScopedPositionX - lScopedPositionStartX;
                            
                            lValues.forEach(function($v,$i,$arr){
                                const lNewValue = Math.max(0, Math.min(1, ($v + lScopedDeltaPositionX) /  lElmBox.width));
                                $arr[$i] = lNewValue;
                            });

                            // make sure the range stay fixed
                            lValues[0] = Math.max(0, Math.min(lValues[1] - lRange, lValues[0]));
                            lValues[1] = Math.max(lValues[0] + lRange, Math.min(1, lValues[1]));

                            $scope.setPs(lValues);
                            
                            lScopedPositionStartX = (lPositionRef.clientX - lElmBox.left);
                        });
                    };
                    
                    const lPointerUpHndl = function() {
                        $document.unbind($scope.eventMaps[$type].move, lPointerMoveHndl);
                        $document.unbind($scope.eventMaps[$type].up, lPointerUpHndl);

                        if(typeof $scope.onChange == 'function'){
                            // trigger onChange only when pointer release the handle
                            $scope.onChange();
                        }
                    };


                    // Prevent default dragging of selected content
                    if($type=='touch'){
                        lPositionRef = event.originalEvent.touches[0];
                    }
                    event.preventDefault();
                    
                    $document.on($scope.eventMaps[$type].move, lPointerMoveHndl);
                    return $document.on($scope.eventMaps[$type].up, lPointerUpHndl);
                });
            }


            $scope.getLowerValue = function(){
                let lResult = $scope.getP(0);
                if(typeof $scope.valueFormat == 'function'){
                    return $scope.valueFormat();
                }
                return lResult;
            }

            $scope.getUpperValue = function(){
                let lResult = $scope.getP(2);
                if(typeof $scope.valueFormat == 'function'){
                    return $scope.valueFormat();
                }
                return lResult;
            }

            $scope.getStep = function() {
                if (($scope.step != null)) {
                    return parseFloat($scope.step);
                } 
                else {
                    return 0;
                }
            };
            
            $scope.getP = function(i) {
                
                if ($scope.property != null) {
                    return $scope.model[i][$scope.property];
                } else {
                    return $scope.model[i];
                }
            };

            $scope.getValue = function($i){
                return $scope.property != null ? $scope.model[$i][$scope.property] :  $scope.model[$i];
            }

            $scope.getValuePercent = function($i){
                const lValue = $scope.getValue($i);
                return lValue * 100;
            }
            
            $scope.setP = function(i, p) {
                const lTolerance = 0.01;

                const lValue = $scope.model.slice(0,2).reduce(function($result,$cur,$index){
                    if($index < i){
                        $result = Math.max($cur + lTolerance, $result);
                    }
                    else if($index > i){
                        $result = Math.min($cur - lTolerance, $result);
                    }

                    return $result;
                },p);

                console.log('setP', $scope.model, i, p, lValue);

                if ($scope.property != null) {
                    return $scope.model[i][$scope.property] = lValue;
                } else {
                    return $scope.model[i] = lValue;
                }
            };
            $scope.setPs = function($values){
                console.log('setPs', $values);

                $values.forEach(function($v, $i){
                    if ($scope.property != null) {
                        return $scope.model[$i][$scope.property] = $v;
                    } else {
                        return $scope.model[$i] = $v;
                    }
                });
            }

            $scope.updatePositions = function() {
                
                const lPositions = [];
                $scope.handles.forEach(function($h, $i){
                    const lHandleRefValue = $scope.getValuePercent($i);
                    lPositions.push(lHandleRefValue);
                    $h.style.left = lHandleRefValue + '%';
                })
    
                // range handle
                angular.element($scope.rangeHandle).css({
                    left: lPositions[0] + '%',
                    width : (lPositions[1] - lPositions[0]) + '%'
                });
    
                //return results;
            };

        }
    };
  }
]);


siApp
.directive("siSlider", function siSlider($document, $timeout) {
    return {
        restrict: "E",
        scope: {
            model: "=",
            max: "=siMax",
            onChange: "&",
            valueFormat: "&",
            property: "@",
            step: "@",
            startLabel: "@",
            endLabel:"@"
        },
        replace: true,
        template: '<div class="si-slider"><div class="label start">{{startLabel}}</div><div class="inner"><div class="slider {{boundaryClasses()}}" style="--lower-value:{{getLowerValue()}};--upper-value:{{getUpperValue()}}"></div></div><div class="label end">{{endLabel}}</div></div>',
        link: function($scope, element, attrs) {
            var getP, handles, rangeHandle, i, j, len, mv, pTotal, ref, setP, step, updatePositions;
            
            // It's the inner div we're really working with.
            element = angular.element(element[0].querySelector('.inner'));
            //element.css({'position':'relative'});
            handles = [];
            
            $scope.init(element);

            return $scope.$watch("model", function(){
                $scope.updatePositions();
            },true);
        },
        controller: function($scope){
            //var getP, handles, rangeHandle, i, j, len, mv, pTotal, ref, setP, step, updatePositions;
            $scope.handles = [];
            $scope.rangeHandle = null;
            $scope.pTotal = 0;

            $scope.init = function(element){
                let ref = $scope.model;
                let i, j, len;
                $scope.element = element;

                $scope.rangeHandle = angular.element('<div class="slider-range-handle"></div>');
                $scope.rangeHandle.css("position", "absolute");
                $scope.element.append($scope.rangeHandle);
                for (i = j = 0, len = ref.length; j < len; i = ++j) {
                    mv = ref[i];
                    let handle, startPleft, startPright, startX;
                    if (i === $scope.model.length - 1) {
                        return;
                    }
                    handle = angular.element('<div class="slider-handle"></div>');
                    handle.css("position", "absolute");
                    $scope.handles.push(handle);
                    $scope.element.append(handle);
                    startX = 0;
                    startPleft = startPright = 0;
                    $scope.pTotal = 0;

                    $scope.applyPointerEvent(handle, i, 'mouse');
                    $scope.applyPointerEvent(handle, i, 'touch');    
                }
            }

            $scope.boundaryClasses = function(){

            }

            /**
             * Apply event handling for pointer
             * @param $elm Angular element upon which ye bind event
             * @param $type mouse|touch
             */
            $scope.applyPointerEvent = function($elm, $elm_index,  $type){
                let lEvents = {
                    "mouse" : {
                        down : 'mousedown',
                        move : 'mousemove',
                        up : 'mouseup'
                    },
                    "touch" : {
                        down : 'touchstart',
                        move : 'touchmove',
                        up : 'touchend'
                    }
                }
                
                let startX = 0;
                let startPleft = startPright = 0;

                return $elm.on(lEvents[$type].down, function(event) {
                        var lPointerMoveHndl, lPointerUpHndl;
                        //console.log($type,'down triggered');
                        
                        lPositionRef = event;
                        jQuery('.slider-handle').css('z-index',1);
                        jQuery($elm).css('z-index',2);

                        lPointerMoveHndl = function(event){
                            return $scope.$apply(function() {
                                
                                let lPositionRef = event;
                                if($type=='touch'){
                                    lPositionRef = event.originalEvent.touches[0];
                                }
                                
                                var lDeltaPosition;
                                lDeltaPosition = (lPositionRef.screenX - startX) / $scope.element.prop("clientWidth") * $scope.pTotal;
                                if (lDeltaPosition < -startPleft || lDeltaPosition > startPright) {
                                    return;
                                }
                                $scope.setP($elm_index, startPleft + lDeltaPosition);
                                $scope.setP($elm_index + 1, startPright - lDeltaPosition);

                                //console.log($type,'move triggered',lPositionRef.screenX, startX, $scope.element.prop("clientWidth"), $scope.pTotal, lDeltaPosition);
                                return $scope.updatePositions();
                            });
                        };
                        
                        lPointerUpHndl = function() {
                            
                            $document.unbind(lEvents[$type].move, lPointerMoveHndl);
                            
                            if(typeof $scope.onChange == 'function'){
                                // trigger onChange only when pointer release the handle
                                $scope.onChange();
                            }
                            

                            return $document.unbind(lEvents[$type].up, lPointerUpHndl);
                        };

                        // Prevent default dragging of selected content
                        if($type=='touch'){
                            lPositionRef = event.originalEvent.touches[0];
                        }
                        event.preventDefault();
                        startX = lPositionRef.screenX;
                        startPleft = $scope.getP( $elm_index);
                        startPright = $scope.getP( $elm_index + 1);
                        
                        $document.on(lEvents[$type].move, lPointerMoveHndl);
                        return $document.on(lEvents[$type].up, lPointerUpHndl);
                    });
            }


            $scope.getLowerValue = function(){
                let lResult = $scope.getP(0);
                if(typeof $scope.valueFormat == 'function'){
                    return $scope.valueFormat();
                }
                return lResult;
            }

            $scope.getUpperValue = function(){
                let lResult = $scope.getP(2);
                if(typeof $scope.valueFormat == 'function'){
                    return $scope.valueFormat();
                }
                return lResult;
            }

            $scope.getStep = function() {
                if (($scope.step != null)) {
                    return parseFloat($scope.step);
                } 
                else {
                    return 0;
                }
            };
            
            $scope.getP = function(i) {
                if ($scope.property != null) {
                    return $scope.model[i][$scope.property];
                } else {
                    return $scope.model[i];
                }
            };
            
            $scope.setP = function(i, p) {
                var s;
                s = $scope.getStep();
                if (s > 0) {
                    p = Math.round(p / s) * s;
                }
                if ($scope.property != null) {
                    return $scope.model[i][$scope.property] = p;
                } else {
                    return $scope.model[i] = p;
                }
            };

            $scope.updatePositions = function() {
                var handle, i, j, len, p, pRunningTotal, results, x;
                var positions = [];
                $scope.pTotal = $scope.model.reduce(function(sum, item, i) {
                return sum + $scope.getP(i);
                }, 0);
                pRunningTotal = 0;
                results = [];
                
                for (i = j = 0, len = $scope.handles.length; j < len; i = ++j) {
                    handle = $scope.handles[i];
                    p = $scope.getP(i);
                    pRunningTotal += p;
                    x = pRunningTotal / $scope.pTotal * 100; //element.prop("clientWidth")
                    positions.push(x);
                    results.push(handle.css({
                        left: x + "%"// top: "-" + handle.prop("clientHeight") / 2 + "px"
                    }));
                }
    
                $scope.rangeHandle.css({
                    left: positions[0] + '%',
                    width : (positions[1] - positions[0]) + '%'
                });
    
                return results;
            };

        }
    };
  });

siApp
.directive('siRadio',[function siRadio(){
    return {
        retrict: 'E',
        transclude:true,
        scope: {
            label: '@',
            checked: '=?ngChecked',
            name: '@'
        },
        link: function(scope){
        },
        template: '<div class="any-selector pretty p-icon p-pulse p-round">' +
                    '<input type="radio" name="{{name}}" ng-checked="checked">' +
                    '<div class="state">' +
                        '<i class="icon fas fa-circle fa-xs"></i>' +
                        '<label>{{label}}</label>' +
                    '</div>' + 
                  '</div>'
    }
}]);

siApp
.directive('inputContainer', function inputContainer(){
    return {
        restrict: 'C',
        scope:{},
        link: function(scope, element, attr){
            let lElm = angular.element(element);
            if(lElm.find('[required]').length>0){
                lElm.addClass('is-required');
            }

            scope.$watch(function() {return lElm.find('input,textarea').attr('class'); }, function(newValue){
                if(newValue == null || typeof(newValue) == 'undefined'){
                    return null;
                }
                ['ng-invalid','ng-dirty','ng-pristine','ng-touched'].forEach(function($c){
                    
                    if(newValue.indexOf($c)>=0){
                        lElm.addClass($c);
                    }
                    else{
                        lElm.removeClass($c);
                    }
                });
                
            });
        },
    }
});

siApp
.directive('siMediabox',[
function siMediabox(){
    return {
        restrict : 'E',
        scope : {
            model: '=siModel',
            defaultTab: '@siDefaultTab',
            tabs: '=siTabs',
            pictureListDisplay: '@siPictureListAs'
        },
        link: function ($scope,$elm, $attrs){
            $scope.init();
        },
        templateUrl: siCtx.base_path + 'views/ang-templates/si-mediabox.html?v=2',
        replace: true,
        controller : function($scope){
            $scope.selected_media = $scope.defaultTab || 'pictures';
            $scope.video_player = null;
            $scope._initialized = false;

            $scope.init = function(){
                const cFirstTab = $scope.tabs ? $scope.tabs[0] : 'pictures';
                $scope.selectMedia($scope.defaultTab || cFirstTab);

                $scope._initialized = true;
            }
        
            $scope.tabIsAvailable = function($name){
                if(!$scope.tabs) return true;

                return $scope.tabs.some(function($t) {return $t == $name});
            }

            $scope.selectMedia = function($media){
                $scope.selected_media = $media;
                
                const lTrigger = 'si-display-' + $media;
                //console.log('triggering', lTrigger);

                if($scope._initialized){
                    $scope.$broadcast(lTrigger);
                }
                else{
                    window.setTimeout(function(){
                        $scope.$broadcast(lTrigger);
                    },1000);
                }
                
                if($scope._initialized && $media!='video'){
                    $scope.callPlayer('video-player','stopVideo');
                }
            }
        
            $scope.callPlayer = function(frame_id, func, args) {
                if (window.jQuery && frame_id instanceof jQuery) frame_id = frame_id.get(0).id;
                var iframe = document.getElementById(frame_id);
                if (iframe && iframe.tagName.toUpperCase() != 'IFRAME') {
                    iframe = iframe.getElementsByTagName('iframe')[0];
                }
            
                // When the player is not ready yet, add the event to a queue
                // Each frame_id is associated with an own queue.
                // Each queue has three possible states:
                //  undefined = uninitialised / array = queue / 0 = ready
                if (!$scope.callPlayer.queue) $scope.callPlayer.queue = {};
                var queue = $scope.callPlayer.queue[frame_id],
                    domReady = document.readyState == 'complete';
            
                if (domReady && !iframe) {
                    // DOM is ready and iframe does not exist. Log a message
                    window.console && console.log('$scope.callPlayer: Frame not found; id=' + frame_id);
                    if (queue) clearInterval(queue.poller);
                } else if (func === 'listening') {
                    // Sending the "listener" message to the frame, to request status updates
                    if (iframe && iframe.contentWindow) {
                        func = '{"event":"listening","id":' + JSON.stringify(''+frame_id) + '}';
                        iframe.contentWindow.postMessage(func, '*');
                    }
                } else if (!domReady ||
                           iframe && (!iframe.contentWindow || queue && !queue.ready) ||
                           (!queue || !queue.ready) && typeof func === 'function') {
                    if (!queue) queue = $scope.callPlayer.queue[frame_id] = [];
                    queue.push([func, args]);
                    if (!('poller' in queue)) {
                        // keep polling until the document and frame is ready
                        queue.poller = setInterval(function() {
                            $scope.callPlayer(frame_id, 'listening');
                        }, 250);
                        // Add a global "message" event listener, to catch status updates:
                        messageEvent(1, function runOnceReady(e) {
                            if (!iframe) {
                                iframe = document.getElementById(frame_id);
                                if (!iframe) return;
                                if (iframe.tagName.toUpperCase() != 'IFRAME') {
                                    iframe = iframe.getElementsByTagName('iframe')[0];
                                    if (!iframe) return;
                                }
                            }
                            if (e.source === iframe.contentWindow) {
                                // Assume that the player is ready if we receive a
                                // message from the iframe
                                clearInterval(queue.poller);
                                queue.ready = true;
                                messageEvent(0, runOnceReady);
                                // .. and release the queue:
                                while (tmp = queue.shift()) {
                                    $scope.callPlayer(frame_id, tmp[0], tmp[1]);
                                }
                            }
                        }, false);
                    }
                } else if (iframe && iframe.contentWindow) {
                    // When a function is supplied, just call it (like "onYouTubePlayerReady")
                    if (func.call) return func();
                    // Frame exists, send message
                    iframe.contentWindow.postMessage(JSON.stringify({
                        "event": "command",
                        "func": func,
                        "args": args || [],
                        "id": frame_id
                    }), "*");
                }
                /* IE8 does not support addEventListener... */
                function messageEvent(add, listener) {
                    var w3 = add ? window.addEventListener : window.removeEventListener;
                    w3 ?
                        w3('message', listener, !1)
                    :
                        (add ? window.attachEvent : window.detachEvent)('onmessage', listener);
                }
            }
        }
    }
 
}]);

siApp
.directive('siThumbnailsSlider',[ '$timeout',
    function siThumbnailsSlider($timeout){
        return {
            restrict: 'E',
            templateUrl: siCtx.base_path + 'views/ang-templates/si-thumbnails-slider.html',
            replace: true,
            scope: {
                list: '=siList'
            },
            link : function($scope, $element, $attr){
                $scope.init($element);
            },
            controller: function($scope, $rootScope){
                $scope.selectedIndex = 0;
                $scope.trolleyOffset = 0;
                $scope._element = null;

                $scope.init = function($element){
                    $scope._element = $element;

                    // listen to MediaBox Picture events
                    $scope.$on('mediabox-picture-next', function(){
                        $scope.next();
                    });

                    $scope.$on('mediabox-picture-next', function(){
                        $scope.previous();
                    });

                    $scope.$on('mediabox-picture-select', function($event, $picture){
                        $scope.select($picture);
                        $scope.trolleyOffset = $scope.getTrolleyIndexFromSelection($scope.selectedIndex);
                    });
                }


                $scope.next = function(){
                    let lOffsetValue = $scope.trolleyOffset+1;
                    const lCompsWidth = $scope.getComponentsWidth();
                        const controlWidth = lCompsWidth.controlWidth;
                        const pictureWidth = lCompsWidth.pictureWidth;

                    //console.log('click next');

                    if(! $scope.hasViewablePicture(lOffsetValue, $scope.list.length, controlWidth, pictureWidth)){
                        lOffsetValue = $scope.trolleyOffset;
                    }


                    $scope.trolleyOffset = lOffsetValue;
                }

                $scope.previous = function(){
                    let lOffsetValue = $scope.trolleyOffset > 0 ? $scope.trolleyOffset-1 : 0;
                    $scope.trolleyOffset = lOffsetValue;

                    //console.log('click previous');
                }

                $scope.hasViewablePicture = function($trolleyOffset, $pictureCount, $controlWidth, $pictureWidth){
                    if($controlWidth < $pictureWidth) return false;
                    if($pictureCount == 0) return false;
                    if($trolleyOffset == 0) return true;
                
                    const lPicturePerPage = Math.floor($controlWidth / $pictureWidth);
                    const lCurrentPictureIndex = $trolleyOffset * lPicturePerPage;
                    
                    if(lCurrentPictureIndex > $pictureCount) return false;
                
                    return true;
                }

                $scope.getTrolleyOffset = function(){
                    if($scope.trolleyOffset == 0) return 0;
    
                    let lResult = 0;

                    const lCompsWidth = $scope.getComponentsWidth();
                        const controlWidth = lCompsWidth.controlWidth;
                        const pictureWidth = lCompsWidth.pictureWidth;

                    const lPicturePerPage = Math.floor(controlWidth / pictureWidth);
                    const indexOfFirstPicture = $scope.trolleyOffset * lPicturePerPage;

                    lResult = -1 * indexOfFirstPicture *  pictureWidth;
                    return lResult.toString() + 'px';
                }

                $scope.getTrolleyIndexFromSelection = function($selectedIndex){
                    if($selectedIndex == 0) return 0;
                    const lCompsWidth = $scope.getComponentsWidth();
                        const controlWidth = lCompsWidth.controlWidth;
                        const pictureWidth = lCompsWidth.pictureWidth;
                    
                    const lPicturePerPage = Math.floor(controlWidth / pictureWidth);
                    if(($selectedIndex + 1) <= lPicturePerPage) return 0;
                    
                    return Math.floor($selectedIndex / lPicturePerPage);
                }

                $scope.getComponentsWidth = function(){
                    const ljqElement = jQuery($scope._element);
                    return {
                        controlWidth : ljqElement.width(),
                        pictureWidth : ljqElement.find('.item').eq(0).outerWidth()
                    }
                }

                $scope.select = function($picture, $triggerEvents){
                    $triggerEvents = typeof  $triggerEvents == 'undefined' ? true : $triggerEvents;

                    $scope.selectedIndex = $scope.list.findIndex(function($e) {return $e.url == $picture.url});
                    //console.log('click on picture')
                    if($triggerEvents){
                        $rootScope.$broadcast('thumbnails-slider-select', $scope.list[$scope.selectedIndex]);
                    }
                }

                $scope.getImageAlt = function($img){
                    const lCaption = $siDictionary.getCaption({src:$img, key:'category_code'},'photo_category');
                    //console.log('Image alt', lCaption);
                    
                    const lResult = $siHooks.filter('listing-picture-alt', lCaption, $img);
        
                    return lResult;
                }
        
                $scope.getImageCaption = function($img){
                    const lCaption = $siDictionary.getCaption({src:$img, key:'category_code'},'photo_category');
                    //console.log('Image caption', lCaption);

                    const lResult = $siHooks.filter('listing-picture-caption', lCaption, $img);
        
                    return lResult;
                }
            }
        }
    }
]);


siApp
.directive('siTabs', ['$q', function siTabs($q){
    return {
        restrict: 'E',
        replace:true,
        transclude: true,
        template: '<div class="si-tabs" style="--selected-tab:{{selected_tab_index}};--tab-count:{{button_elms.length}}">' + 
                        '<div class="si-tab-button-container"></div>' +  
                        '<div class="si-tab-content-container">' +
                            '<div class="si-tab-trolley" ng-transclude></div>' +
                        '</div>' + 
                    '</div>',
        link: function($scope, $element, $attrs){
            //console.log('siTabs link')
            $scope.init($element);
        },
        controller: function($scope){
            $scope._element = null;
            $scope.button_elms = [];
            $scope.content_elms = [];
            $scope.selected_tab_index = 0;

            $scope.init = function($element){
                $scope._element = $element;
                $scope._button_container = $scope._element.find('.si-tab-button-container');
                $scope._content_container = $scope._element.find('.si-tab-content-container');

                $scope.button_elms.forEach(function($e,$i){
                    if($i == $scope.selected_tab_index) $e.addClass('active');
                    $scope._button_container.append($e);
                });

                $scope.showTab($scope.selected_tab_index);
            }

            $scope.addTabButton = function($tabButtonElement){
                $scope.button_elms.push($tabButtonElement);
            }

            $scope.addTabContent = function($tabContentElement){
                const lResult = $scope.content_elms.length;
                $scope.content_elms.push($tabContentElement);
                return lResult;
            }

            $scope.showTab = function($tabContentElementIndex){
                $scope.button_elms.forEach(function($e,$i){
                    if($i == $tabContentElementIndex){
                        $e.addClass('active');
                    }
                    else{
                        $e.removeClass('active');
                    }
                })

                $scope.selected_tab_index = $tabContentElementIndex;
                $scope.tabContentResize();
            }

            $scope.tabContentResize = function(){
                const lContentElm = $scope.content_elms[$scope.selected_tab_index];
                const lContentHeight = jQuery(lContentElm[0]).height();
                $scope._content_container.css({height : lContentHeight});
            }
        }
    }
}])

siApp
.directive('siTab', ['$q', function siTab($q){
    return {
        restrict: 'E',
        required: '^siTabs',
        scope:true,
        link: function($scope, $element, $attr){
            $scope.init($element);
        },
        controller: function($scope){
            $scope._element = null;
            $scope._button_elm = null;
            $scope._content_elm = null;

            $scope.init = function($element){
                $scope._element = $element;
                $scope._button_elm = $element.find('.si-tab-label');
                $scope._content_elm = $element.find('.si-tab-content');

                $scope.addTabButton($scope._button_elm);
                $scope._content_elm._si_tab_index = $scope.addTabContent($scope._content_elm);
            }

            $scope.tabClick = function(){
                $scope.showTab($scope._content_elm._si_tab_index);
            }
        }
    }
}]);

siApp
.directive('siTabLabel', function siTabLabel(){
    return {
        restrict:'E',
        required: '^siTab',
        transclude: true,
        scope: true,
        replace:true,
        template: '<div class="si-tab-label" ng-click="tabClick()"><span ng-transclude></span></div>',
        link: function($scope, $element, $attrs){
            $scope._element = $element;
        },
        controller: function($scope){
            
            
        }
    }
})


siApp
.directive('siTabContent', function siTabContent(){
    return {
        restrict:'E',
        required: '^siTab',
        transclude: true,
        scope: true,
        replace:true,
        template: '<div class="si-tab-content" ng-transclude></div>',
        link: function($scope, $element, $attrs){
            $scope.init($element, $attrs.siElement);
        },
        controller: function($scope){
            $scope.init = function($element, $contentQuery){
                $scope._element = $element;
                $scope._element_node = $element[0];

                
                if($contentQuery != undefined){
                    const lContent = angular.element($contentQuery);
                
                    $scope._element.append(lContent);
                }
                
                $scope.$watch('_element_node.offsetHeight', function($a,$b){
                    $scope.tabContentResize();
                })
            }
            
        }
    }
})