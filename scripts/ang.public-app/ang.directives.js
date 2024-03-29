
/* ------------------------------- 
        DIRECTIVES
-------------------------------- */

const directiveTemplatePath = function($path,$version){
    $version = ($version == undefined) ? siCtx.version : $version;
    return siCtx.base_path + 'views/ang-templates/' + $path + '.html?v=' + $version;
}


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
        link : function($scope, $element, $attrs){
            $scope.init();
        },
        controller: function ($scope,$element, $compile, $q,$siApi,$rootScope,$siDictionary, $timeout,
                                $siUtils,$siFavorites,$siConfig,$siList,$siHooks,
                                $siCompiler) {
            $scope.configs = null;
            $scope._global_configs = null;
            $scope.current_view = null;
            $scope.splitViewActive = false;
            $scope.list = null;
            $scope.page = 1;
            $scope.meta = null;
            $scope.dictionary = {};
            $scope.auth_token = null;
            $scope.is_ready = false;
            $scope.display_mode = ['list'];
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
                const storeDisplayMode = sessionStorage.getItem(`si.list.${$scope.alias}.displayMode`);
                

                $scope.buildGhostList();
                //return;

                $rootScope.$on($scope.alias + 'FilterTokenChanged', $scope.onFilterTokenChanged);
                
                $scope.$on('si-{0}-display-switch-map'.siFormat($scope.alias), function(){
                    $scope.display_mode = ['map'];
                });

                $scope.$on('si-{0}-display-switch-list'.siFormat($scope.alias), function(){
                    $scope.display_mode = ['list'];
                    console.log('list display switched to list');
                    // Send the signal to childrens
                    $scope.$broadcast('si-display-switch-list');
                });

                $scope.$on('si-{0}-view-change'.siFormat($scope.alias), function($event, $newView){
                    $scope.current_view = $newView;
                    $scope.getList();
                })

                $scope.$on('auth_token_refresh', function(){
                    sessionStorage.removeItem('si.list.{0}.{1}'.siFormat($scope.configs.type,siCtx.locale));
                    sessionStorage.removeItem('si.listMeta.{0}.{1}'.siFormat($scope.configs.type,siCtx.locale));
                    sessionStorage.removeItem('si.pageIndex.{0}.{1}'.siFormat($scope.configs.type,siCtx.locale));
                });

                $scope.$on('si/listing/map/item:clicked', function($event, $item){
                    
                    const itemElm = $element[0].querySelector(`.si-item.ref-${$item.ref_number}`);
                    if(itemElm == null) return;
                    console.log('map item click',itemElm);
                    itemElm.scrollIntoView({behavior:'smooth', block: 'nearest'});

                })

                $siHooks.addFilter('si/list/item/permalink', function($result, $item){
                    //console.log('siList@si/list/item/permalink');
                    if(isNullOrUndefined($scope._global_configs)) return $result;
                    if(isNullOrUndefined($scope.configs)) return $result;

                    if($scope.configs.current_view != $scope._global_configs.default_view){
                        const lQuery = '?view=' + $scope.configs.current_view;
                        if($result.indexOf(lQuery) < 0){
                            //console.log('- add view id to link',$result, lQuery);

                            $result = $result + lQuery;
                        }
                        else{
                            //console.log('- view id already in link', $result);
                        }
                    }
                    return $result
                });
                
                

                $siConfig.getList($scope.alias).then(function($configs){
                    $scope.configs = $configs;
                    //if(isNullOrUndefined($scope.configs.current_view)) $scope.configs.current_view = $configs.source.id;
                    $scope.client_sort = {
                        'listings' : 'date_desc',
                        'brokers' : 'name_asc'
                    }[$scope.configs.type];

                    if($scope.configs.allow_split_view){
                        $element[0].classList.add('si-allow-split-view');
                    }

                    let lClientSearchToken = sessionStorage.getItem("si.{0}.st".siFormat($scope.configs.alias));
                    if(lClientSearchToken!=undefined){
                        $scope.client.search_token = lClientSearchToken;
                    }

                    $siApi.renewToken().then(function(){
                        $scope.start().then( _ => {
                            console.log('started', storeDisplayMode);
                            if(storeDisplayMode != null){
                                const displayMode = JSON.parse(storeDisplayMode);
                                if(displayMode.length > 1 || !displayMode.includes('list')){
                                    $timeout( _ => {
                                        $scope.toggleDisplay(displayMode);
                                    },1000)                 
                                }
                            }
                        })
                        
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
                if(siCtx.map_api_key != '') return true;
                if($scope._global_configs == undefined) return false;
                if($scope._global_configs == null) return false;
                if($scope._global_configs.map_api_key == '') return false;

                return true;
            }
            
            /**
             * Start the loading process
             */
            $scope.start = function(){
                
                return $siConfig.get().then(function($global_configs){
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
                    // console.log('loading from preloaded data');
                    const lItems = $preloadDatas[$scope.configs.alias].items;

                    if(typeof $scope._preloadedList == 'undefined'){
                        // console.log('compile list');
                        if($scope.configs.type=='listings'){
                            $scope._preloadedList = $siCompiler.compileListingList(lItems);
                        }
                        else{
                            $scope._preloadedList = $siCompiler.compileBrokerList(lItems);
                        }
                        // console.log('compile done');
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

            $scope.buildGhostList = function(){
                $scope.ghost_list = [];
                for(let $i = 0;$i<12; $i++){
                    $scope.ghost_list.push({
                        location :{city:'City',civic_address: '00 address', region: 'Region'},
                        main_office: {location :{city:'City',civic_address: '00 address', region: 'Region'}},
                        price: {sell:{amount:0}},
                        category: 'Category',
                        subcategory: 'Subcategory',
                        ref_number: 'XXXXXX',
                        first_name: 'First name',
                        last_name: 'Last name',
                        name: 'Lorem ipsum 2000',
                        license_type : 'License type',
                        listing_count: 0,
                        office: {name : 'Office'},
                        email: 'email@example.com',
                        phones:{mobile:'555-555-5555'},
                        description : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.'
                    });
                }
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
                        sessionStorage.removeItem('si.{0}.latestSearchToken.{1}'.siFormat($scope.configs.alias, siCtx.locale));
                        sessionStorage.removeItem('si.list.{0}.{1}'.siFormat($scope.configs.type,siCtx.locale));
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
                $timeout( _ => {
                    $scope.is_loading_data = $is_loading;
                });
                
                // try{
                //     $scope.$digest();
                // }
                // catch(error){}

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
                                const lCompileMethod = 'compile{0}List'.siFormat(lSingularType);
                                if(typeof $siCompiler[lCompileMethod] == 'function'){
                                    $siCompiler[lCompileMethod]($response.items);
                                }
                            }
                            //$scope.list = $response.items.slice(0,1);
                            //$timeout(_ => {
                                $scope.list = $response.items;
                                
                            //})
                            
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
                            lNewItems = $siCompiler.compileListingList(lNewItems);
                        }
                        else{
                            lNewItems = $siCompiler.compileBrokerList(lNewItems);
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
                let lListDate = sessionStorage.getItem('si.list.date.{0}.{1}'.siFormat($type,siCtx.locale));
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

                let lList = sessionStorage.getItem('si.list.{0}.{1}'.siFormat($type,siCtx.locale));
                let lListMeta = sessionStorage.getItem('si.listMeta.{0}.{1}'.siFormat($type,siCtx.locale));
                let lPageIndex = sessionStorage.getItem('si.pageIndex.{0}.{1}'.siFormat($type,siCtx.locale));
                
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
                sessionStorage.setItem('si.list.{0}.{1}'.siFormat($type,siCtx.locale), JSON.stringify($scope.list));
                sessionStorage.setItem('si.listMeta.{0}.{1}'.siFormat($type,siCtx.locale), JSON.stringify($scope.listMeta));
                sessionStorage.setItem('si.pageIndex.{0}.{1}'.siFormat($type,siCtx.locale), $scope.page_index);
            }

            $scope.getLatestSearchToken = function(){
                return sessionStorage.getItem('si.{0}.latestSearchToken.{1}'.siFormat($scope.configs.alias,siCtx.locale));
            }

            $scope.saveLatestSearchToken = function($token){
                sessionStorage.setItem('si.{0}.latestSearchToken.{1}'.siFormat($scope.configs.alias,siCtx.locale), $token);
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
                    case 'offices':
                        lOrigin = 'office';break;
                    case 'agencies':
                        lOrigin = 'agency';break;
                }
                const lViewId = $scope.configs.current_view;
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

            $scope.toggleDisplay = function($mode){
                $scope.display_mode = $mode;
                sessionStorage.setItem(`si.list.${$scope.alias}.displayMode`, JSON.stringify($scope.display_mode));

                // if($scope.display_mode.length == 1 && $scope.display_mode.includes($mode)) return;

                // if($scope.display_mode.includes($mode)){
                //     // remove mode
                //     $scope.display_mode.splice($scope.display_mode.indexOf($mode),1);
                // }
                // else{
                //     if($mode == 'list'){
                //         $scope.$broadcast("si-list-loaded");
                //     }
                //     $scope.display_mode.push($mode)
                // }

                if($mode.includes('list')){
                    $scope.$broadcast("si-list-loaded");
                }

                console.log('toggleDisplay', $scope.display_mode);

                
                if($scope.display_mode.length == 1){ 
                    $scope.deactivateSplitView();
                    return $scope.switchDisplayTo($scope.display_mode[0]);
                }

                
                $scope.activateSplitView();
            }
    
            /**
             * Calls for display mode switch
             * @param {string} $mode New display mode
             */
            $scope.switchDisplayTo = function($mode){
                // switch mode
                console.log('switching to ', $mode);

                // broadcast the change to other component
                $timeout( _ => {
                    $rootScope.$broadcast('si-{0}-display-switch-{1}'.siFormat($scope.alias,$mode));
                },250)
                
            }

            $scope.deactivateSplitView = function(){
                const listContainerElm = $element[0].querySelector('.si-list-container');

                if($element[0].classList.contains('si-split-view-active')){
                    const mapContainer = listContainerElm.querySelector('.si-split-view-map-container');
                    mapContainer.remove();
                    $element[0].classList.remove('si-split-view-active')
                    $scope.splitViewActive = false;
                }
            }
            $scope.activateSplitView = function(){
                
                const listContainerElm = $element[0].querySelector('.si-list-container');

                if(!$element[0].classList.contains('si-split-view-active')){
                    const mapContainer = document.createElement('div');
                    mapContainer.classList.add('si-split-view-map-container','si-animate-slide-in-right', 'si-animate-slower');
                    mapContainer.innerHTML = `
                        <si-map class="map-container" si-list="list" si-alias="${$scope.alias}"></si-map>
                    `;

                    $compile(mapContainer)($scope);
                    listContainerElm.append(mapContainer);

                    $element[0].classList.add('si-split-view-active');
                    $scope.splitViewActive = true;
                }

            }

            $scope.addToCompareList = function($item){

            }

            $scope.addToFavoriteList = function($item){

            }

            $scope.handleListItemOver = function(event, $item){
                if($scope._handleListItemOverPtr){
                    window.clearTimeout($scope._handleListItemOverPtr);
                }
                
                event.target.addEventListener('mouseout', _ => {
                    if($scope._handleListItemOverPtr){
                        window.clearTimeout($scope._handleListItemOverPtr);
                    } 
                    
                })

                $scope._handleListItemOverPtr = window.setTimeout( _ => {
                    const eventName = `si/${$scope.configs.type}/item:hover`;
                    $scope.$broadcast(eventName, $item);
                },500);
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

                if($item == 'flags' && $layer == 'main'){
                    if($scope.configs.list_item_layout.displayed_vars.main == undefined) return true;
                    if($scope.configs.list_item_layout.displayed_vars.main.includes($item)) return true;
                    if($scope.configs.list_item_layout.displayed_vars.secondary && !$scope.configs.list_item_layout.displayed_vars.secondary.includes($item)) return true;
                    return false;
                }


                if($scope.configs.list_item_layout.displayed_vars[$layer] == undefined) return $default;

                if($item == 'region'){
                    //console.log('display region',$scope.configs.list_item_layout.displayed_vars[$layer])
                }
                return $scope.configs.list_item_layout.displayed_vars[$layer].includes($item);
            }

        }
    }
}]);

siApp
.directive('siListOfItem', 
function siListOfItem(){
    return {
        restrict: 'C',
        scope:true,
        link: function($scope, $element, $attrs){
            
            $scope.$element = $element[0];
            $scope.init();
        },
        controller: function($scope){
            this.$onInit = function(){
                if(window.ResizeObserver!=undefined){
                    const lResizeObserver = new ResizeObserver(function(){
                        $scope.updateSize();
                    });

                    lResizeObserver.observe(document.body);
                }

                window.addEventListener('resize', function($event){
                    $scope.updateSize();
                });
                window.addEventListener("load", function($event){
                    $scope.updateSize();
                },false);
            }

            $scope.updateSize = function(){
                
                if($scope._resize_debounce != null){
                    window.clearTimeout($scope._resize_debounce);
                }

                $scope._resize_debounce = window.setTimeout(function resizeDebounce(){
                    const lRect = $scope.$element.getBoundingClientRect();
                    if(lRect.width == 0){
                        window.setTimeout($scope.updateSize,500);
                        return;
                    }

                    $scope.$element.style.setProperty('--list-element-width', lRect.width + 'px');
                }, 250);
            }
        }
    }
})

siApp
.directive('siTags', 
function siTags(){
    return {
        restrict: 'E',
        replace: true,
        scope: {
            list: '='
        },
        template: `
        <div class="si-tags">
            <div ng-repeat="tagItem in list" class="si-tag-item si-tag-{{tagItem.label.siSanitize()}}">{{tagItem.label.translate()}}</div>
        </div>
        `,
    }
})

siApp
.directive('siSmallList', ['$sce','$compile',
function siSmallList($sce,$compile){
    return {
        restrict: 'E',
        scope: {
            type: '@siType',
            filters: '=siFilters',
            options: '=?siOptions',
            sortBy: '&?siSortBy'
        },
        template: ['<div class="si-list-header" ng-if="options.show_header" ng-init="init()">', 
                        '<h3 ng-cloak>{{getListTitle()}} {{options.typeof_show_header}}</h3>',
                        '<div class="si-search-input" ng-show="list.length > 10"><input placeholder="{{getSearchPlaceholder()}}" ng-model="listFilter.keywords"><i class="far fa-search"></i></div>',
                    '</div>',
                    '<div class="si-loader"><i class="fal fa-spinner fa-spin"></i></div>',
                    '<div class="si-list si-list-of-item si-list-container"  si-lazy-load><div ng-include="getItemTemplateInclude()" include-replace ng-repeat="item in list | filter : listFilter.keywords"></div></div>'].join(''),
        link: function($scope, $element, $attrs){
            if($scope.options != undefined){       
                $scope.options.typeof_show_header = typeof($scope.options.show_header);
                $scope.options.show_header = (typeof($scope.options.show_header) == 'string') ? $scope.options.show_header === 'true' : $scope.options.show_header;
            }
        },
        controller:function($scope,$rootScope,$element, $parse, $siHooks,$siFavorites, $siConfig, 
                            $siUtils,$siApi, $siFilters,$siDictionary,$q,$siList,$timeout,
                            $siCompiler){
            $scope.view_id = null;
            $scope.list = [];
            $scope._element = null;
            $scope.listFilter = {
                keywords:''
            };

            $scope.columnWidths = {
                listings: {
                    desktop: 3,
                    laptop: 3,
                    tablet: 2,
                    mobile: 1
                },
                brokers: {
                    desktop: 3,
                    laptop: 3,
                    tablet: 1,
                    mobile: 1
                },
                offices: {
                    desktop: 3,
                    laptop: 3,
                    tablet: 1,
                    mobile: 1
                },
                agencies: {
                    desktop: 3,
                    laptop: 3,
                    tablet: 1,
                    mobile: 1
                }
            };


            $scope.typesHash = {
                'listings' : 'Listing',
                'brokers' : 'Broker',
                'offices' : 'Office',
                'agencies' : 'Agency',
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

            $scope.$watch('listFilter.keywords', function($new, $old){
                if($new == $old) return;

                $timeout(function(){
                    $rootScope.$broadcast('si-list-loaded');
                })
            });

            $scope.getItemTemplateInclude = function(){
                if($scope.options.item_template != undefined) return $scope.options.item_template.replace('~', siCtx.base_path + '/views');
                
                return 'si-template-for-' + $scope.type;
            }

            $scope.getSearchPlaceholder = function(){
                return 'Filter list with keywords'.translate()
            }



            $scope.init = function(){
                $scope._element = $element;
                if($element[0].closest('.si') == null){
                    $element[0].parentElement.classList.add('si');
                }

                $scope.$resizeObsvr = new ResizeObserver( $entries => {
                    
                    
                    $element[0].classList.remove('si-size-mobile','si-size-tablet','si-size-laptop');
                    
                    
                    const elmRect = $element[0].getBoundingClientRect();

                    if($entries[0].contentRect.width == 0){ 
                        return;
                    }

                    if($entries[0].contentRect.width < 640){
                        $element[0].classList.add('si-size-mobile');
                    }
                    else if($entries[0].contentRect.width < 800){
                        $element[0].classList.add('si-size-tablet');
                    }
                    else if($entries[0].contentRect.width < 1024){
                        $element[0].classList.add('si-size-laptop');
                    }
                });


                $siConfig.get().then(function($configs){
                    $scope.configs = $configs;

                    const listConfig = $scope.configs.lists.find($l => $l.type == $scope.type && $l.is_default_type_configs);
                    if(listConfig != null){
                        $scope.listLayout = listConfig.list_layout;
                        $scope.listItemLayout = listConfig.list_item_layout;
                        $element[0].classList.add('si-inherit-list-configs');
                    }
                    

                    $scope.applyColumnWidth();
                })
                .then( _ => {

                    $siApi.getDefaultDataView().then(function($view_id){
                        $scope.view_id = $view_id;
                        
                        
                        
                        // $siHooks.addFilter('si/list/item/permalink', function($result, $item){
                        //     if(isNullOrUndefined($scope._global_configs)) return $result;
                        //     if(isNullOrUndefined($scope.configs)) return $result;
                            
                        //     const lQuery = '?view=' + $scope.configs.current_view;
                        //     if($result.indexOf(lQuery) < 0){
                        //         console.log('siSmallList@si/list/item/permalink - add view id to link',$result, lQuery);
    
                        //         $result = $result + lQuery;
                        //     }
    
                        //     return $result
                        // });
    
                        $siHooks.addFilter('si/list/item/permalink', function($result, $item){
                            const lCustomViewId = $siUtils.search('view');
                            if(lCustomViewId == null) return $result;
                            
    
                            
                            const lQuery = '?view=' + lCustomViewId;
                            if($result.indexOf(lQuery) < 0){
                                //console.log('- add view id to link',$result, lQuery);
    
                                $result = $result + lQuery;
                            }
                            else{
                                //console.log('- view id already in link', $result);
                            }
                        
                            return $result
                        });
    
                        
    
                        $scope.fetchList().then(_ => {
                            $scope.$resizeObsvr.observe($element[0],{box: 'device-pixel-content-box'});
                        });
                        
                    });
                });

                
               

                
                
            }

            $scope.fetchList = function(){
                if($scope.filters == null) return $q.resolve();
                const lBaseFilter = $scope.getBaseFilter();
                const lFilters = angular.merge(lBaseFilter, {
                    filter_group:{
                        filters: Array.isArray($scope.filters) ? $scope.filters : [$scope.filters]
                    }
                });

                const lSingularType = $scope.typesHash[$scope.type];
                
                return $siFilters.with().getSearchToken(lFilters).then(function($token){

                    //console.log('fetch list of',lSingularType);

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

                        $scope.list = $siCompiler['compile' + lSingularType + 'List']($results.list.items);
                        if($scope.options.sortBy != undefined){
                            $scope.list.sort( (a,b) => {
                                if(a[$scope.options.sortBy] > b[$scope.options.sortBy]) return 1;
                                return -1;
                            });
                        }
                        if($scope.sortBy != undefined){
                            //if(typeof $scope.options.sort != 'function') $scope.options.sort = $compile($scope.options.sort);
                            $scope.list = $scope.sortBy({$list: $scope.list})
                        }
                        //console.log('List of',lSingularType,'fetched', $scope.list, $results.list.items);
                    
                        $scope._element.addClass("si-loaded");
                        $timeout(function(){
                            $rootScope.$broadcast('si-list-loaded', $scope.type,$scope.list);
                        });
                    })


                    // .then(function($response){
                    //     .then(function($dictionaryData){
                    //         $siDictionary.init($dictionaryData);
                    //         $scope.meta = $response.metadata;
                    //         $scope.list = $siCompiler['compile' + lSingularType + 'List']($response.items);

                    //         $scope._element.addClass("si-loaded");
                    //     });
                    // })
                })
            }

            $scope.getBaseFilter = function(){
                // Get default list settings, if any
                const lResult = {};
                const listConfig = $scope.configs.lists.find($l => $l.type == $scope.type && $l.is_default_type_configs);
                if(listConfig != null){
                    //lResult.max_item_count = listConfig.limit;
                    if(listConfig.sort != null && listConfig.sort != '' && listConfig.sort != 'auto'){
                        lResult.sort_fields = [{field: listConfig.sort, desc: listConfig.sort_reverse}];
                    }
                    // console.log('getBaseFilter', listConfig);
                    if(listConfig.priority_group_sort){
                        if(lResult.sort_fields == undefined) lResult.sort_fields = [];
                        const lPriorityDesc = listConfig.priority_group_sort.indexOf('-desc')>0 ? true : false;
                        lResult.sort_fields.unshift({field: 'priority', desc: lPriorityDesc});
                    }

                    if(listConfig.shuffle) lResult.shuffle = listConfig.shuffle;

                }
                if(!$scope.options || !$scope.options.filter) return lResult;
                
                
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
            
            $scope.applyColumnWidth = function(){
                //console.log('applyColumnWidth',$scope.columnWidths,$scope.type,$scope.options.columns );

                let lWidths = angular.merge($scope.columnWidths[$scope.type],$scope.options.columns);

                if($scope.listLayout){
                   lWidths = angular.merge(lWidths, $scope.listLayout.item_row_space);
                }

                // console.log('applyColumnWidth',lWidths,$scope.options.columns );

                if(lWidths == undefined) return;

                Object.keys(lWidths).forEach(function($k){
                    let value = lWidths[$k];
                    if(value > 10){
                        value = Math.round(100 / value);
                    }
                    $scope._element[0].style.setProperty('--' + $k + '-column-width', value );
                });
            }

            $scope.getListTitle = function(){
                const lTypeCaptions = {
                    listings : {single: '1 property', plural: '{0} properties'},
                    brokers : {single: '1 broker', plural: '{0} brokers'},
                    offices : {single: '1 office', plural: '{0} offices'},
                    agencies : {single: '1 agency', plural: '{0} agencies'},
                    cities : {single: '1 city', plural: '{0} cities'},
                }
                if($scope.meta == undefined) return '';
                if($scope.meta.item_count == 0) return '';
                if($scope.meta.item_count == 1) return lTypeCaptions[$scope.type].single.translate();
                if($scope.meta.item_count > 1) return lTypeCaptions[$scope.type].plural.translate().siFormat($scope.meta.item_count);

            }

            $scope.getApiEndpoint = function($type, $view, $lang){
                const lSingularType = $scope.typesHash[$scope.type].toLowerCase();
                return '{0}/view/{1}/{2}/items'.siFormat(lSingularType, $view, $lang );
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

            /**
             * Shorthand to $siUtils.getClassList
             * see $siUtils factory for details
             * @param {object} $item Listing item data
             */
            $scope.getClassList = function($item){
                const lClassList = [$siUtils.getClassList($item)];
                if($scope.configs != null && $scope.configs.list_item_layout != null){
                    lClassList.push('img-hover-effect-' + $scope.configs.list_item_layout.image_hover_effect);
                }
                
                return lClassList.join(' ');
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

                
                if($scope.listItemLayout == null) return $default;
                if($scope.listItemLayout == undefined) return $default;
                
                if($scope.listItemLayout.displayed_vars == undefined) return $default;

                if($item == 'flags' && $layer == 'main'){
                    if($scope.listItemLayout.displayed_vars.main.includes($item)) return true;
                    if(!$scope.listItemLayout.displayed_vars.secondary.includes($item)) return true;
                    return false;
                }


                if($scope.listItemLayout.displayed_vars[$layer] == undefined) return $default;

                return $scope.listItemLayout.displayed_vars[$layer].includes($item);
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
.directive('siListSlider', ['$compile',
function siListSlider($compile){
    return {
        restrict: 'E',
        templateUrl: directiveTemplatePath('si-list-slider'),
        transclude:true,
        replace:true,
        scope: {
            alias : '@siAlias',
            options: '=?siOptions'
        },
        link: function($scope, $element, $attrs){
            $scope.init($element);
        },
        controller: function($scope,$siConfig,$siApi,$siUtils,$siDictionary,$siHooks,$timeout, $q,$siCompiler){
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
                        $scope.list = $siCompiler['compile' + lSingularType + 'List']($results.list.items);

                        $scope.list = $scope.list
                            .filter(function($e,$i){
                                return $i< $scope.options.limit;
                            });

                        $scope.list.forEach(function($e){
                            $scope.postProcessListItem(lListConfigs.type, $e);
                        });

                        $scope.applyProperties();

                        $scope._element.addClass("si-loaded");
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
                const lElmParentBoundingRect = $scope._element[0].parentElement.getBoundingClientRect();

                $scope._element[0].style.setProperty('--slider-width', lElmBoundingRect.width + 'px');
                if($scope.options.minHeight != undefined){
                    $scope._element[0].style.minHeight = $scope.options.minHeight;
                }
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
                                        '1 Bedroom {0}'.translate().siFormat($item.subcategory) : 
                                        '{0} Bedrooms {1}'.translate().siFormat($item.rooms.bed.count, $item.subcategory);
                        }
                        
                    }
                }

                $item.title = $siHooks.filter('si-list-slider-item-title', lTitle, $item);
            }

            $scope.getApiEndpoint = function($type, $view, $lang){
                const lSingularType = $scope.typesHash[$type].toLowerCase();
                return '{0}/view/{1}/{2}/items'.siFormat(lSingularType, $view, $lang );
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
                if (typeof(IntersectionObserver) !== 'undefined') {
                    const lSlideObserver = new IntersectionObserver($scope.slideIntersectHandle,lObserverOptions);

                    const lSlides = Array.from(lObserverRoot.querySelectorAll(".si-slide"));
                    lSlides.forEach(function($elm){
                        lSlideObserver.observe($elm);
                    });
                }

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


siApp
.directive('siHideEmpty', ['$parse', function($parse){
    return {
        restrict:'A',
        scope: {
            options: '=?siHideEmpty'
        },
        link: function($scope,$element,$attr){
            $scope.options = Object.assign({
                method: $attr.siHideEmpty || 'hard', // hard: display none|soft: opacity 0
            },$scope.options);
            // let lShowContent = false;
            // if($attr.siHideEmpty != ''){
            //     const lHideExpression = $parse($attr.siHideEmpty)($scope);
            //     $scope.applyExpression(lHideExpression);
            // }
            // else{
            //     $scope.$watch(
            //         function(){
            //             return $attr.siHideEmpty;
            //         },
            //         function($new,$old){
            //             if($new != ''){
            //                 const lHideExpression = $parse($new)($scope);
            //                 $scope.applyExpression(lHideExpression);
            //             }
            //         }
            //     );
            // }
            $element[0].classList.add('si-hide-' + $scope.options.method);
            $scope.init();
            
        },
        controller: function($scope, $element, $timeout, $q){
            $scope.deferredContentCheck = null;
            
            $scope.init = function(){
                $scope.$on('$siApi/call/completed', function(){
                    $scope.checkContent()//.then($scope.reveal);
                });
                $scope.hasContent().then($scope.reveal);
            }

            $scope.hasContent = function(){
                if($scope.deferredContentCheck == null) $scope.deferredContentCheck = $q.defer();
                //const lDeferred = $q.defer();

                // Test content availability from expression
                if($scope.options.when != undefined){
                    
                    if(typeof($scope.options.when) == 'function'){
                        const lExpressionResult = $scope.options.when();
                        if(lExpressionResult.then != undefined){
                            return lExpressionResult;
                        }
                        else{
                            if(lExpressionResult === true) return $q.resolve();

                            $scope.$watch($scope.options.when, function($new,$old){
                                if($new === true){
                                    $element[0]
                                    $scope.deferredContentCheck.resolve();
                                }
                            })
                        
                        }
                    }
                    else{
                        if($scope.options.when === true) return $q.resolve();
                        $scope.$watch(function(){
                            return $scope.options.when;
                        }, function($new,$old){
                            if($new === true){
                                $scope.deferredContentCheck.resolve();
                            }
                        });
                    }
                    
                    return $scope.deferredContentCheck.promise;
                }

                const observer = new MutationObserver( $mutations => {
                    $scope.checkContent();
                    observer.disconnect();
                })

                observer.observe($element[0], {subtree:true, characterData:true})

                return $scope.deferredContentCheck.promise;
            }



            $scope.checkContent = function(){
                if(!$element[0].classList.contains('si-hide-' + $scope.options.method)) return;

                if($element[0].innerText.trim() != ''){ 
                    // make sure there's no hidden children
                    if(
                        Array.from($element[0].children)
                            .filter(function($e){ return !$e.classList.contains('ng-hide')})
                            .some(function($e){ return $e.innerText != ''})
                    ){
                        $scope.deferredContentCheck.resolve();
                    }
                    else{
                        $scope.deferredContentCheck.resolve();
                    }
                }
                // else if ($iteration < 4){
                //     $timeout(_ => {
                //         $scope.checkContentTimeoutHandler($deferred,$iteration+1);
                //     },250);
                // }
            }

            $scope.reveal = function(){
                $element[0].classList.remove('si-hide-' + $scope.options.method);
            }
        }
    }
}]);

siApp
.directive('siHoverClass', function(){
    return {
        restrict: 'A',
        link: function($scope,$element,$atts){
            const lAttClasses = $atts.siHoverClass.trim();
            if(lAttClasses == undefined || lAttClasses == '') return;

            const lClassList = lAttClasses.split(' ');
            if(lClassList.length == 0)return;
            
            $element[0].addEventListener('mouseover', function(){
                $element[0].classList.add(...lClassList);
            });
            $element[0].addEventListener('mouseout', function(){
                $element[0].classList.remove(...lClassList);
            });
        }
    }
})

siApp
.directive('siAnimateWaitViewport', function(){
    return {
        restrict: 'C',
        link: function($scope,$element,$attrs){
            if(window.siWaitViewportObserver == undefined){
                window.siWaitViewportObserver = new IntersectionObserver(function($entries){
                    $entries.forEach($entry => {
                        if($entry.isIntersecting){
                            $entry.target.classList.remove('si-animate-wait-viewport');
                            window.siWaitViewportObserver.unobserve($entry.target);
                        }
                    })
                }, {
                    threshold: 0.5
                });
            }

            window.siWaitViewportObserver.observe($element[0]);
        }
    }
});

siApp
.directive('siListScroller', function(){
    return {
        restrict: 'C',
        link: function($scope,$element,$attrs){
            const lElm = $element[0];
            const lElmContainer = lElm.querySelector('.si-list-scroller-container');
            

            $scope.listScrollLeft = function(){
                const itemWidth = lElm.querySelector('.si-scroller-item').getBoundingClientRect().width;
                lElm.scrollBy(-itemWidth,0);
            }

            $scope.listScrollRight = function(){
                const itemWidth = lElm.querySelector('.si-scroller-item').getBoundingClientRect().width;
                //console.log('listScrollRight', itemWidth);
                lElm.scrollBy(itemWidth,0);
            }

            const lResizeObs = new ResizeObserver( ($entries) => {
                //console.log('siListScroller/resized', $entries);
                $entries[0].target.scrollTo(0,0);
            });
            lResizeObs.observe(lElm);
        }
    }
});

siApp
.directive('siAnchorTo', function siAnchorTo(){
    return {
        restrict: 'A',
        link: function($scope,$element,$attrs){
            
            const elm = $element[0];
            

            const elmContainer = elm.parentElement;

            const hasFloatingClass = Array.from(elm.classList).some($c => $c.indexOf('si-float-')>=0);
            if(!hasFloatingClass) return;

            
            let lAnchorSelector = $attrs.siAnchorTo;
            const lRelativeContainerClass = ['.layer-content','.si-item'].find($q => elm.closest($q));
            
            if(lRelativeContainerClass == null) return;
            const lRelativeContainer = elm.closest(lRelativeContainerClass);

            const observer = new MutationObserver( $mutations => {
                $scope.applyAnchor($element,lAnchorSelector, lRelativeContainer, observer);
            });
            
            observer.observe(lRelativeContainer,{childList:true});
            //observer.observe(elm,{attributes:true});

            $scope.applyAnchor($element, lAnchorSelector, lRelativeContainer);
        },
        controller: function($scope){

            $scope.applyAnchor = function($element, $selector, $container, $observer=null){
                const elm = $element[0];
                

                const floatClass = Array.from(elm.classList).find($c => $c.startsWith('si-float-'));
                if(floatClass == null) return;

                let listContainer = elm.closest('.si-list-container');
                if(listContainer == null) listContainer = elm.closest('.si-list');
                if(listContainer == null || listContainer.style.cssText.indexOf('--' + floatClass + '-offset-top') >= 0) return;

                if(!$selector.startsWith('.') && !$selector.startsWith('#')) $selector = '.' + $selector;
                let lAnchorElm = $container.querySelector($selector);
                
                if(lAnchorElm == null){
                    lAnchorElm = $container;
                }
                
                
                listContainer.style.setProperty('--' + floatClass + '-offset-top', lAnchorElm.offsetTop + 'px');
                listContainer.style.setProperty('--' + floatClass + '-offset-left', lAnchorElm.offsetLeft + 'px');
                listContainer.style.setProperty('--' + floatClass + '-offset-height', lAnchorElm.offsetHeight + 'px');
                listContainer.style.setProperty('--' + floatClass + '-offset-width', lAnchorElm.offsetWidth + 'px');
            
                
                if($observer!=null){
                    $observer.disconnect();
                }
            }

        }


    }
});

siApp
.directive('siScopeHref', function siScopeHref(){
    return {
        restrict: 'A',
        link: function($scope,$element,$attr){
            $element[0].addEventListener('click', ($event) => {
                $event.preventDefault();
                $event.stopPropagation();

                window.location = $attr.siScopeHref;
            })
        }
    }
});

siApp
.directive('siPluralize', function siPluralize(){
    return {
        restrict: 'A',
        scope: {
            options: '=siPluralize'
        },
        link: function($scope,$element,$attr){
            //console.log('siPluralize for', $scope.options);
            if(!Array.isArray($scope.options.on)) $scope.options.on = [$scope.options.on];
            const counters = {};

            $scope.options.on.forEach( $key => {
                counters[$key] = 0;

                $scope.$on('si/' + $key, function($event, $count){
                    counters[$key] = $count;
                    const total = Object.keys(counters).reduce( (t,k) => t+counters[k],0);
                    if(total > 1){
                        $element[0].innerHTML = $scope.options.label;
                    }

                    //console.log('siPluralize for ', $key, $count);
                })
            })
            
            //pluralLabel = $attr.siPluralizeLabel.translate();
            //$scope.$on('list')
        }
    }
})
