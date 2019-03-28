var ImmoDbApp = angular.module('ImmoDb', ['ngSanitize','angularMoment']);

ImmoDbApp.run(function(amMoment) {
	amMoment.changeLocale(immodbCtx.locale);
});

/**
 * Global - Controller
 */
ImmoDbApp
.controller('publicCtrl', 
function publicCtrl($scope,$rootScope,$immodbDictionary, $immodbUtils,$immodbHooks){
    $scope.model = null;
    $scope.broker_count = 0;
    $scope.listing_count = 0;

    $scope.init = function(){
    }

    // listingsUpdate
    $scope.$on('immodb-listings-update', function($event, $list, $meta){  
        $scope.listing_count = $immodbHooks.filter('listing_count', $meta.item_count);
    });

    // brokersUpdate
    $scope.$on('immodb-brokers-update',function(ev, $list, $meta){
        $scope.broker_count = $immodbHooks.filter('broker_count', $meta.item_count);
    });

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

    $scope.cancelEvent = function($event){
        //console.log('event trapped bouhou!')
        $event.stopPropagation();
    }

    $scope.$on('modal-opened', function(){
        angular.element(document.body).addClass('immodb-modal-open');
    });

    $scope.$on('modal-closed', function(){
        angular.element(document.body).removeClass('immodb-modal-open');
    });

});


/**
 * Listing Detail - Controller
 */
ImmoDbApp
.controller('singleListingCtrl', 
function singleListingCtrl($scope,$q,$immodbApi, $immodbDictionary, $immodbUtils,$immodbConfig, $sce, $immodbHooks,$immodbFavorites,$immodbShare){
    // model data container - listing
    $scope.model = null;
    $scope.permalinks = null;

    // ui - section toggles
    $scope.sections = {
        addendum : {opened:false},
        building : {opened:false},
        lot : {opened:false},
        other: {opened: false},
        in_exclusions:{opened:false},
        rooms:{opened:false},
        expenses: {opened:false}
    }
    // ui - media tabs selector
    $scope.selected_media = 'pictures';
    // calculator result
    $scope.calculator_result = {};
    // message model
    $scope.message_model = {};
    $scope.favorites = $immodbFavorites;

    /**
     * Initialize controller
     * @param {string} $ref_number Listing reference key
     */
    $scope.init = function($ref_number){
        if($ref_number != undefined){
            //console.log($ref_number);
            $scope.fetchPrerequisites().then(function($prerequisits){
                $scope.permalinks = $prerequisits;
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
            let lUserInfo = sessionStorage.getItem('user_infos');
            if(typeof(lUserInfo) != 'undefined'){
                lUserInfo = JSON.parse(lUserInfo);
                if(lUserInfo != null){
                    $scope.message_model.firstname = lUserInfo.firstname;
                    $scope.message_model.lastname = lUserInfo.lastname;
                    $scope.message_model.phone = lUserInfo.phone;
                    $scope.message_model.email = lUserInfo.email;
                }
            }
            $immodbHooks.do('listing-message-model-post-process',$scope.message_model);

            $immodbHooks.do('listing-ready',$scope.model);
            $immodbHooks.addFilter('immodb.share.data',$scope.setShareData);
            // print data to console for further informations
            //console.log($scope.model);
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
        if($scope.model.location.address.street_number!='' && $scope.model.location.address.street_name!=''){
            $scope.model.location.civic_address = '{0} {1}'.format(
                $scope.model.location.address.street_number,
                $scope.model.location.address.street_name
            );
        }
        else if ($scope.model.location.address.street_name!=''){
            $scope.model.location.civic_address = $scope.model.location.address.street_name;
        }
        else{
            $scope.model.location.civic_address = '';
        }

        if($scope.model.location.civic_address != ''){
            $scope.model.location.full_address = '{0} {1}, {2}'.format(
                $scope.model.location.address.street_number,
                $scope.model.location.address.street_name,
                $scope.model.location.city
            );
        }
        else{
            $scope.model.location.full_address = $scope.model.location.city;
        }
        
        
        $scope.model.building.attributes = [];
        $scope.model.land.attributes = [];
        $scope.model.other = {attributes : []};
        $scope.model.important_flags = [];
        $scope.model.long_price = $immodbUtils.formatPrice($scope.model,'long');
        $scope.model.short_price = $immodbUtils.formatPrice($scope.model);

        // from main unit
        let lMainUnit = $scope.model.units.find(function($u){return $u.category_code=='MAIN'});
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
                $scope.model.land.attributes.push($e);
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

        // units
        $scope.model.units.forEach(function($u){
            $u.category = $immodbDictionary.getCaption($u.category_code,'unit_category');
            $u.flags = [];
            if($u.room_count) $u.flags.push({icon: 'door-open', value: $u.room_count, caption: 'Rooms'.translate()});
            if($u.bedroom_count) $u.flags.push({icon: 'bed', value: $u.bedroom_count, caption: 'Bedrooms'.translate()});
            if($u.bathroom_count) $u.flags.push({icon: 'bath', value: $u.bathroom_count, caption: 'Bathrooms'.translate()});
        });

        // rooms
        $scope.model.rooms.forEach(function($r){
            $r.category = $immodbDictionary.getCaption($r.category_code,'room_category');
            $r.level_category = $immodbDictionary.getCaption($r.level_category_code, 'level_category');
            $r.short_dimension = $immodbUtils.formatDimension($r.dimension);
            let lRoomInfos = [];
            if($r.flooring_code!='OTHER'){
                $r.flooring = $immodbDictionary.getCaption($r.flooring_code,'flooring');
            }
        });

        // trusted src
        if($scope.model.virtual_tour != undefined){
            $scope.model.virtual_tour.trusted_url = $sce.trustAsResourceUrl($scope.model.virtual_tour.url.replace('http:',''));
        }
        if($scope.model.video != undefined){
            let lEmbedVideo = $scope.model.video.url;
            if($scope.model.video.type=='youtube'){
                lEmbedVideo = '//www.youtube.com/embed/{0}?rel=0&showinfo=0&enablejsapi=1&origin=*'.format($scope.model.video.id);
            }

            $scope.model.video.trusted_url = $sce.trustAsResourceUrl(lEmbedVideo);
        }

        $immodbHooks.do('single-listing-preprocess', $scope.model);
    }

    $scope.setShareData = function($data){
        $data.description = $scope.model.description;
        $data.media = $scope.model.photos[0].source_url;
        //console.log('set share data',$data);
        return $data;
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
     */
    $scope.sendMessage = function(){
        //console.log('message data:', $scope.message_model);
        sessionStorage.setItem('user_infos',JSON.stringify({
            firstname: $scope.message_model.firstname,
            lastname: $scope.message_model.lastname,
            phone: $scope.message_model.phone,
            email: $scope.message_model.email
        }));

        let lSent = $immodbHooks.do('single-listing-send-message', $scope.message_model);
        
        //console.log(lSent);

        if(lSent!==true){
            let lDestEmails = $scope.model.brokers.map($e => $e.email);
            lDestEmails = $immodbHooks.filter('single-listing-message-emails', lDestEmails, $scope.model.brokers);
            
            lMessage = {
                type: 'information_request',
                metadata: {
                    id : $scope.model.id,
                    ref_number : $scope.model.ref_number,
                    address : $scope.model.location.civic_address
                },
                destination: lDestEmails,
                data: $scope.message_model
            }

            $immodbApi.rest('message', {params:lMessage}).then(function($response){
                $scope.request_sent = true;
            })
        }
    }

    $scope.print = function(){
        // reformat permalink to match print
        let lPrintLink = $scope.model.permalink.split('/');
        lPrintLink.splice(2,3,'print').join('/');
        window.open(lPrintLink.join('/'));
    }

    $scope.hasDimension = function($dimension){
        return $immodbUtils.hasDimension($dimension);
    }

    $scope.shareTo = function($social_media){
        $immodbShare.execute($social_media);
    }
});


/**
 * Broker Detail - Controller
 */
ImmoDbApp
.controller('singleBrokerCtrl', 
function singleBrokerCtrl($scope,$q,$immodbApi, $immodbDictionary, $immodbUtils,$immodbConfig,$immodbHooks){
    $scope.filter_keywords = '';
    $scope.message_model = {};

    // model data container - broker
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
     * @param {string} $ref_number broker reference key
     */
    $scope.init = function($ref_number){
        if($ref_number != undefined){
            //console.log($ref_number);
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
     * Load broker data
     * @param {string} $ref_number broker reference key
     */
    $scope.loadSingleData = function($ref_number){

        let lPromise = $q(function($resolve,$reject){
            if(typeof(immodbBrokerData)!='undefined'){
                $resolve(immodbBrokerData);
            }
            else{
                $immodbApi.getDefaultDataView().then(function($view){
                    // Load broker data from api
                    //console.log($view);
                    $immodbApi.api("broker/view/{0}/{1}/items/ref_number/{2}".format($view.id,immodbApiSettings.locale,$ref_number)).then(function($data){
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
            //$scope.message_model.subject = 'Request information for : {0} ({1})'.translate().format($scope.model.location.full_address,$scope.model.ref_number);
            // print data to console for further informations
            //console.log($scope.model);
        });
    }

    /**
     * Preprocess data information to create shortcut, icon list and groups
     */
    $scope.preprocess = function(){
        // set basic information from dictionary
        $scope.model.license_type = $scope.getCaption($scope.model.license_type_code,'broker_license_type');
        $scope.model.languages    = 'N/A'.translate();
        let lExpertises           = [];
        $scope.model.listings.forEach(function($e,$i,$arr){
            let lNewItem = $scope.getCaption($e.category_code, 'listing_category');
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
        let lLowerKeyword = $scope.filter_keywords.toLowerCase();
        let lNumKeyword = Number($scope.filter_keywords);

        let lStringContentChecks = ['description','subcategory','category','location.city', 'location.address.street_name', 'ref_number'];
        let lNumContentChecks = ['price.sell.amount', 'price.lease.amount'];

        if(lStringContentChecks.some($e => {
            let lValue = findProperty($listing,$e);
            if(lValue != null && lValue.toLowerCase().indexOf(lLowerKeyword) >=0){
                return true;
            }
        })){
            return true;
        };
        
        if(lNumContentChecks.some($e => {
            let lValue = findProperty($listing,$e);
            if(lValue != null && lValue.toString().indexOf(lLowerKeyword) >=0){
                return true;
            }
        })){
            return true;
        };
        
        // if($listing.description && $listing.description.toLowerCase().indexOf(lLowerKeyword)>=0){
        //     //console.log('found kw in description');
        //     return true;
        // }
        // else if($listing.price.sell && $listing.price.sell.amount.toString().indexOf(lNumKeyword)>=0){
        //     //console.log('found kw in price sell');
        //     return true;
        // }
        // else if($listing.price.rent && $listing.price.rent.amount.toString().indexOf(lNumKeyword)>=0){
        //     //console.log('found kw in price rent');
        //     return true;
        // }
        // else if($listing.location.city.toLowerCase().indexOf(lLowerKeyword)>=0){
        //     //console.log('found kw in city');
        //     return true;
        // }
        // else if($listing.location.street_name.toLowerCase().indexOf(lLowerKeyword)>=0){
        //     //console.log('found kw in city');
        //     return true;
        // }

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
    * Shorthand to $immodbUtils.getClassList
    * see $immodbUtils factory for details
    * @param {object} $item Listing item data
    */
    $scope.getClassList = function($item){
        let lResult = $immodbUtils.getClassList($item);
        return lResult;
    }

    /**
     * Send message to broker via API
     */
    $scope.sendMessage = function(){
        //console.log('message data:', $scope.message_model);
        sessionStorage.setItem('user_infos',JSON.stringify({
            firstname: $scope.message_model.firstname,
            lastname: $scope.message_model.lastname,
            phone: $scope.message_model.phone,
            email: $scope.message_model.email
        }));

        let lSent = $immodbHooks.do('single-broker-send-message', $scope.message_model);

        if(lSent!==true){
            let lDestEmails = $scope.model.email;
            lDestEmails = $immodbHooks.filter('single-broker-message-emails', lDestEmails, $scope.model);
            
            lMessage = {
                type: 'broker_message',
                destination: lDestEmails,
                data: $scope.message_model
            }

            $immodbApi.rest('message', {params:lMessage}).then(function($response){
                $scope.request_sent = true;
            })
        }
    }

    /**
     * Send message to broker via API
     */
    $scope.validateMessage = function(){
        
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
.directive('immodbList', ['$immodbFavorites', '$immodbConfig',
function immodbList(){
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
        controller: function ($scope, $q,$immodbApi,$rootScope,$immodbDictionary, $immodbUtils,$immodbFavorites,$immodbConfig) {
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
            $scope.subcategory_list = [];
            $scope.client_sort = null;
            $scope.favorites = $immodbFavorites;
            
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
                
                $scope.$on('immodb-{0}-display-switch-map'.format($scope.alias), function(){
                    $scope.display_mode = 'map';
                });

                $scope.$on('immodb-{0}-display-switch-list'.format($scope.alias), function(){
                    $scope.display_mode = 'list';
                });

                $scope.$on('auth_token_refresh', function(){
                    sessionStorage.removeItem('immodb.list.{0}.{1}'.format($scope.configs.type,immodbCtx.locale));
                    sessionStorage.removeItem('immodb.listMeta.{0}.{1}'.format($scope.configs.type,immodbCtx.locale));
                    sessionStorage.removeItem('immodb.pageIndex.{0}.{1}'.format($scope.configs.type,immodbCtx.locale));
                });

                $immodbApi.getListConfigs($scope.alias).then(function($configs){
                    $scope.configs = $configs;
                    let lClientSearchToken = sessionStorage.getItem("immodb.{0}.st".format($scope.configs.alias));
                    if(lClientSearchToken!=undefined){
                        $scope.client.search_token = lClientSearchToken;
                    }

                    $immodbApi.renewToken().then(function(){
                        $scope.start();
                    });
                });
            }
    
            /**
             * Start the loading process
             */
            $scope.start = function(){
                //return;
                $immodbConfig.get().then(function($global_configs){
                    // Prepare Api
                    $immodbApi.getViewMeta($scope.configs.type,$scope.configs.source.id).then(function($response){
                        // init dictionary
                        $immodbDictionary.init($response.dictionary);
                        if($global_configs.enable_custom_page){
                            $immodbApi.rest_call('pages',{locale: immodbCtx.locale, type: $scope.configs.type},{method:'GET'}).then(function($site_page_list){
                                $immodbUtils.page_list = $site_page_list;
                                $scope.dictionary = $response.dictionary;
                                $scope.is_ready = true;
                                // load data
                                $scope.getList();
                            });
                        }
                        else{
                            $immodbUtils.page_list = [];
                            $scope.dictionary = $response.dictionary;
                            $scope.is_ready = true;
                            // load data
                            $scope.getList();
                        }
                    });
                });
            }
            /**
             * Load listings
             */
            $scope.getList = function(){
                let lVer = 1;
                let lSearchToken = $scope.getSearchToken();

                // search for data with search token
                if(lSearchToken == $scope.configs.search_token && typeof $preloadDatas[$scope.configs.alias] != 'undefined'){
                    console.log('loading from preloaded data');
                    let lItems = $preloadDatas[$scope.configs.alias].items;
                    if($scope.configs.type=='listings'){
                        $scope.list = $immodbUtils.compileListingList(lItems);
                    }
                    else{
                        $scope.list = $immodbUtils.compileBrokerList(lItems);
                    }
                    $scope.ghost_list = [];

                    $scope.listMeta = $preloadDatas[$scope.configs.alias].metadata;
                    $scope.page_index = 0;
                    
                    $rootScope.$broadcast('immodb-' + $scope.configs.type + '-update', $scope.list,$scope.listMeta);
                    $scope.$emit('immodb-' + $scope.configs.type + '-update', $scope.list,$scope.listMeta);


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
                        sessionStorage.removeItem('immodb.{0}.latestSearchToken.{1}'.format($scope.configs.alias, immodbCtx.locale));
                        sessionStorage.removeItem('immodb.list.{0}.{1}'.format($scope.configs.type,immodbCtx.locale));
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
                        
                        $immodbApi.api($scope.getEndpoint() + '/items', lParams,{method:'GET'}).then(function($response){
                            // set list/meta
                            if($scope.configs.type=='listings'){
                                $scope.list = $immodbUtils.compileListingList($response.items);
                            }
                            else{
                                $scope.list = $immodbUtils.compileBrokerList($response.items);
                            }
                            $scope.ghost_list = [];
                            
                            $scope.listMeta = $response.metadata;
                            // unlock
                            $scope.setLoadingState(false);
                            // broadcast new list
                            $rootScope.$broadcast('immodb-' + $scope.configs.type + '-update', $scope.list,$scope.listMeta);
                            $scope.$emit('immodb-' + $scope.configs.type + '-update', $scope.list,$scope.listMeta);

                            // print list to console for further information
                            $scope.saveListToStorage($scope.configs.type);

                            // save latest search token
                            $scope.saveLatestSearchToken($token);

                        });
                    }
                }
                else{
                    $rootScope.$broadcast('immodb-' + $scope.configs.type + '-update', $scope.list,$scope.listMeta);
                    $scope.$emit('immodb-' + $scope.configs.type + '-update', $scope.list,$scope.listMeta);
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
                    $immodbApi.api($scope.getEndpoint() + '/items', lParams,{method:'GET'}).then(function($response){
                        let lNewItems = $response.items;
                        if($scope.configs.type=='listings'){
                            lNewItems = $immodbUtils.compileListingList(lNewItems);
                        }
                        else{
                            lNewItems = $immodbUtils.compileBrokerList(lNewItems);
                        }

                        $scope.list = $scope.list.concat(lNewItems);
                        
                        $scope.listMeta = $response.metadata;
                        // increment page index
                        $scope.page_index++;
                        // broadcast new list
                        $scope.$emit('immodb-' + $scope.configs.type + '-update', $scope.list,$scope.listMeta);
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
                let lListDate = sessionStorage.getItem('immodb.list.date.{0}.{1}'.format($type,immodbCtx.locale));
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

                let lList = sessionStorage.getItem('immodb.list.{0}.{1}'.format($type,immodbCtx.locale));
                let lListMeta = sessionStorage.getItem('immodb.listMeta.{0}.{1}'.format($type,immodbCtx.locale));
                let lPageIndex = sessionStorage.getItem('immodb.pageIndex.{0}.{1}'.format($type,immodbCtx.locale));
                
                if (lList != undefined){
                    $scope.list = JSON.parse(lList);
                    $scope.listMeta = JSON.parse(lListMeta);
                    $scope.page_index = lPageIndex;
                    return true;
                }
                return false;
            }

            /**
             * Save list to storage
             * @param {string} $type Type of the list
             */
            $scope.saveListToStorage = function($type){
                sessionStorage.setItem('immodb.list.{0}.{1}'.format($type,immodbCtx.locale), JSON.stringify($scope.list));
                sessionStorage.setItem('immodb.listMeta.{0}.{1}'.format($type,immodbCtx.locale), JSON.stringify($scope.listMeta));
                sessionStorage.setItem('immodb.pageIndex.{0}.{1}'.format($type,immodbCtx.locale), $scope.page_index);
            }

            $scope.getLatestSearchToken = function(){
                return sessionStorage.getItem('immodb.{0}.latestSearchToken.{1}'.format($scope.configs.alias,immodbCtx.locale));
            }

            $scope.saveLatestSearchToken = function($token){
                sessionStorage.setItem('immodb.{0}.latestSearchToken.{1}'.format($scope.configs.alias,immodbCtx.locale), $token);
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
                $scope.client_sort = 'price_' + ($more_to_least ? 'desc' : 'asc');
                let lNewSortFields = {field: 'price.sell.amount', desc: $more_to_least};
                $rootScope.$broadcast($scope.alias + 'SortDataChanged', lNewSortFields);
            }
    
            /**
             * Change list order by price
             * @param {bool} $more_to_least From 
             */
            $scope.sortByDate = function($more_to_least){
                $scope.client_sort = 'date_' + ($more_to_least ? 'desc' : 'asc');
                let lNewSortFields = {field: 'contract.start_date', desc: $more_to_least};
                $rootScope.$broadcast($scope.alias + 'SortDataChanged', lNewSortFields);
            }
    
            /**
             * Change list order by price
             * @param {bool} $more_to_least From 
             */
            $scope.sortByName = function($more_to_least){
                $scope.client_sort = 'name_' + ($more_to_least ? 'desc' : 'asc');
                let lNewSortFields = {field: 'last_name', desc: $more_to_least};
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
}]);

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
            result_url: "@immodbResultUrl",
            standalone: "@immodbStandalone"
        },
        controllerAs: 'ctrl',
        template: '<div class="{{standalone ? \'show-trigger\':\'\'}}" ng-include="\'immodb-search-for-\' + alias"></div>',
        link : function($scope, $element, $attrs){
            $scope.standalone = $scope.standalone =='true';

            $scope.init();
        },
        controller: function($scope, $q, $immodbApi, $rootScope,
                                $immodbDictionary, $immodbUtils,  $immodbFilters,
                                $immodbHooks){
            let lToday = new Date().round();    // save today
            let lNow = new Date();

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
                    filter : {field: 'price.sell.amount', operator: 'greater_than', value: 0}
                },
                lease : {
                    caption: 'For rent',
                    filter : {field: 'price.lease.amount', operator: 'greater_than', value: 0}
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
                    caption : 'No limit'.translate(),
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

                
                // Wait for late initialization
                // ie: Dictionnay, configs, etc are all loaded
                $scope.isReady().then(function(){
                    
                    let lfSyncFilter = function($filter){
                        //console.log('Filter to UI sync');
                        // Sync UI with filters
                        $scope.syncFiltersToUI();
    
                        // check if there's filters stored
                        if($filter.hasFilters()){
                            // build hints
                            $scope.buildHints();
                        }
                    }

                    $immodbFilters.with($scope.alias, function($filter){
                        $scope.filter = $filter;
                        if(!$scope.standalone){
                            $filter.result_url = $scope.result_url;
                        }

                        $filter.loadState();
                        lfSyncFilter($filter);

                        $filter.on('update').then(function(){
                            //console.log('filter', $scope.alias, 'update trigger');
                            lfSyncFilter($filter);
                        });

                        $filter.on('filterTokenChanged').then(function($token){
                            //console.log('filter', $scope.alias, 'filterTokenChanged trigger');
                            lfSyncFilter($filter);
                            $rootScope.$broadcast($scope.alias + 'FilterTokenChanged', $token);
                        })
                    });
                    
                    

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
                            // load view meta
                            $scope.configs = $configs;
                            $immodbFilters.with($scope.alias).configs = $configs;

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

            $scope.showResultPage = function(){
                window.location = $scope.result_url;
            }
            
            /* ----------------------
            
            UI MANAGEMENT 

            ------------------------- */
            $scope._expandedPanel = null;
            $scope.toggleExpand = function($key){
                $scope._expandedPanel = ($scope._expandedPanel == $key) ? null : $key;
            }

            $scope.isExpanded = function($key){
                if($scope._expandedPanel == $key){
                    return 'expanded';
                }
                return '';
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
                $scope.filter.saveState();
                $scope.filter.buildFilters();
            }

            $scope.lateCall = function($func){
                $immodbUtils.lateCall($func);
            }
            
            $scope._priceChangeDebounce = null;
            $scope.updatePrice = function(){
                if($scope._priceChangeDebounce != null) window.clearTimeout($scope._priceChangeDebounce);
                const lPriceStep = $immodbHooks.filter('search-price-step', 10000);
                const lPriceMaxBoundary = $immodbHooks.filter('search-max-price-boundary', 1000000);

                lMinPrice = Math.round(($scope.priceRange[0] * 100) * lPriceStep);
                lMaxPrice = Math.round(($scope.priceRange[2] * 100) * lPriceStep);
                if(lMaxPrice != 0) lMaxPrice = lPriceMaxBoundary - lMaxPrice;
                
                $scope._priceChangeDebounce = window.setTimeout(function(){
                    
                    $scope.setPriceFromRange([lMinPrice, lMaxPrice]);
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
                
                $immodbFilters.with($scope.alias, function($filter){
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
                $immodbFilters.with($scope.alias, function($filter){

                    //console.log('set price from range', $values)

                    let lOperators = [
                        'greater_or_equal_to',
                        'less_or_equal_to'
                    ]

                    $filter.data.min_price = $values[0];
                    $filter.data.max_price = $values[1];

                    $values.forEach(($e,$i) => {
                        //console.log($e, $filter.hasFilter(['price.sell.amount','price.lease.amount']), $filter);

                        if($e > 0){
                            $filter.addFilter(['price.sell.amount','price.lease.amount'], lOperators[$i], $e);
                        }
                        else if($filter.hasFilter(['price.sell.amount','price.lease.amount'])){
                            //console.log('Removing price')
                            $filter.addFilter(['price.sell.amount','price.lease.amount'], lOperators[$i], '');
                        }
                    });
                    //$scope.filter.addFilter(['price.sell.amount','price.lease.amount'], lOperators[lInput], $value);
                
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

                $immodbFilters.with($scope.alias, function($filter){
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
                        "attributes.PARKING_GARAGE" : $scope.garageSuggestions
                    }
                    for (const key in lListSync) {
                        let lValue = $filter.getFilterValue(key);
                        lListSync[key].some(function($e){
                            if($e.value==lValue){
                                $e.selected = true;
                                return true;
                            }
                        });
                    }

                    //console.log('filter data',$filter.data);
                    const lPriceStep = $immodbHooks.filter('search-price-step', 10000);
                    const lPriceMaxBoundary = $immodbHooks.filter('search-max-price-boundary', 1000000);

                    if($filter.data.min_price != null){
                        $scope.priceRange[0] = ($filter.data.min_price / lPriceStep) / 100;
                    }

                    if($filter.data.max_price != null){
                        if($filter.data.max_price == 0){
                            $scope.priceRange[2] = 0;
                        }
                        else{
                            $scope.priceRange[2] = ( (lPriceMaxBoundary - $filter.data.max_price) / lPriceStep ) / 100;
                        }
                    }
                    $scope.priceRange[1] = 1 - $scope.priceRange[0] - $scope.priceRange[2];
                    $immodbHooks.do('sync-filters-to-ui', $filter);
                })
                

               
                
            }

            /**
             * Synchronize list selection to filter
             * @param {object} $filter Filter bound to list
             * @param {object} $list List object or array
             */
            $scope.syncToList = function($filter, $list){
                $immodbFilters.with($scope.alias).syncToList($filter, $list);

                // // make sure list is an array
                // let lListArray = $immodbUtils.toArray($list);
                
                // lListArray.forEach(function($e){
                //     // when filter is an array of value and item key is contained in that list
                //     if($filter.operator=='in' && ($filter.value.indexOf($e.__$key)>=0)){
                //         if(!$list[$e.__$key].selected) $list[$e.__$key].selected=true;
                //     }
                //     // when item field matches filter field
                //     else if($e.field==$filter.field){
                //         if(!$e.selected) $e.selected=true; // set selection on the list item
                //     }
                //     // when item has a filter attribute which the field 
                //     else if(($e.filter != undefined) && $e.filter.field == $filter.field){
                //         if(!$e.selected) $e.selected=true; // set selection on the list item
                //     }
                // });
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
    
            /* ----------------------
            
            FILTER HINT BUILDING

            ------------------------- */


            /**
             * Build a list of hints based on the filter group given as parameter
             */
            $scope.buildHints = function(){
                let lResult = [];
                $immodbFilters.with($scope.alias, function($filter){
                    //console.log('building hints for ', $filter);

                    lResult = $scope.buildFilterHints($filter.filter_group);  
                    //console.log('buildHints',$filter.data);
                    // prices
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
        
                        lResult.push({
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
                    
                    if($filter.query_text!=null){
                        console.log('query_text has something to say');
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
                $scope.priceRange = [0,1,0];
                
                $immodbHooks.do('filter-reset');

                $scope.filter.resetFilters();
                
                

                //$scope.$broadcast('immodb-reset-filter');
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
            $scope.getSelection = function($list){
                let lResult = [];
                //console.log($list);
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
             * Return valid configuration settings
             */
            $scope.getConfigs = function(){
                let lPromise = $q(function($resolve, $reject){
                    if($scope.configs==null){
                        //console.log($scope.alias);
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
                $scope.filter.sort_fields = [$newSortData];
                //console.log('sort field changed', $newSortData);
                $scope.filter.buildFilters();
            }

            
            $scope.$watch("dictionary", function(newValue, oldValue){
                if($scope.dictionary!=undefined && $scope.dictionary.region!=undefined){
                    let lRegionList = $immodbUtils.toSortedArray($scope.dictionary.region);
                    $scope.tab_region = lRegionList[0].__$key;
                }

                if($scope.dictionary!=undefined && $scope.dictionary.city!=undefined){
                    let lCityList = $immodbUtils.toArray($scope.dictionary.city);
                    $scope.city_list = lCityList;
                }

                if($scope.dictionary!=undefined && $scope.dictionary.listing_subcategory!=undefined){
                    let lSubcategoryList = $immodbUtils.toArray($scope.dictionary.listing_subcategory);
                    $scope.subcategory_list = lSubcategoryList;
                }
            });

            $scope.getListType = function(){
                return $scope.configs.type;
            }
        }
    };
});

ImmoDbApp
.directive('immodbSearchBox', ['$sce','$compile','$immodbUtils','$immodbFilters','$immodbConfig',
function immodbSearchBox($sce,$compile,$immodbUtils,$immodbFilters, $immodbConfig){
    return {
        restrict: 'E',
        replace: true,
        required: '^immodbSearch',
        scope: {
            alias: '@',
            placeholder: '@',
            onTokenChange: '&onEnter',
            result_page: '@resultPage',
            persistantKeyword : '@persistantKeyword'
        },
        templateUrl: immodbCtx.base_path + 'views/ang-templates/immodb-searchbox.html?v=4',
        link : function($scope,element, attrs){
            $scope.persistantKeyword = $scope.persistantKeyword == 'true';
            $scope._suggestion_list_el =  element.find('.suggestion-list');
            $scope._el = element[0];

            angular.element('body').append($scope._suggestion_list_el);

            
            $scope.init();
        },
        controller: function($scope, $q, $immodbApi, $rootScope,$immodbDictionary, $immodbUtils){
            $scope.configs = null;
            $scope.suggestions = [];
            $scope.is_ready = false;
            $scope.keyword = '';
            $scope.query_text = null;
            $scope.sort_fields = [];
            $scope.filter = null;
            $scope.stored_suggestions = null;

            $scope.init = function(){
                
                $scope.isReady().then(function(){
                    $immodbFilters.with($scope.alias, $filter =>{
                        $scope.filter = $filter;
                        $scope.filter.result_url = $scope.result_page;
                        
                        $filter.loadState();
                       
                        if($scope.persistantKeyword && $filter.query_text!=''){
                            $filter.data.keyword = $filter.query_text;
                        }
                        else{
                            console.log('keywords are not persistant');
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
                        angular.element($scope._el).removeClass('has-focus');
                        window.setTimeout(function(){
                            $scope.suggestions = [];
                            $scope.stored_suggestions = null;
                            $scope.$apply();    
                        },500);
                        
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
                            $immodbFilters.with($scope.alias).configs = $configs;
                            
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

            $scope.getSuggestionPosition = function(){
                if($scope._el==undefined){
                    return '';
                }
                    
                let lRect = $immodbUtils.absolutePosition($scope._el);
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
                $immodbFilters.with($scope.alias, $filter => {       
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
                                    $immodbApi.api($scope.getEndpoint(),{q: $filter.data.keyword, t: lType, c: lSUGGESTION_COUNT_LIMIT},{method: 'GET'}).then($qsItems => {
                                        // add extra in caption
                                        $qsItems.forEach($e =>{
                                            if(typeof $e.context != 'undefined'){
                                                Object.keys($e.context).forEach($k =>{
                                                    if($e.context[$k].match($scope.getKeywordRegEx())){
                                                        $e.caption = $e.caption + ' ' + $e.context[$k];
                                                    }
                                                });
                                                //$e.caption = $e.caption + ' ' + $e.context[0];
                                            }
                                        });
                                        $scope.suggestions = $qsItems;
                                        $scope.stored_suggestions = $scope.suggestions;
                                        if($scope.suggestions.length > 0) $scope.suggestions[0].selected =true;
                                    });
                                });
                                
                                return;
    
                            }
                            $scope.stored_suggestions = null;
                            $scope.suggestions = lResult;
                        }, 250);
                    }
                    else{
                        $scope.suggestions = $scope.stored_suggestions.filter($e => $scope.elementMatchKeyword($e,false));
                        console.log('stored_suggestions filtered to', $scope.suggestions);

                        if($scope.suggestions.length > 0) $scope.suggestions[0].selected =true;
                    }
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

                Object.keys(lSpecials).forEach($k => {
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
                return $scope.suggestions.find($e => $e.selected);
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
                $immodbFilters.with($scope.alias, $filter =>{
                        
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
                                
                                let lInput = angular.element($scope._el).find('input');
                                lInput.attr('placeholder','Opening...'.translate())
                                
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

            $scope.openItem = function($item){
                $immodbConfig.get().then(function($global_configs){
                    let lShortcut = $scope.getItemLinkShortcut($item.type,$global_configs);
                    let lPath = lShortcut.replace('{{item.ref_number}}',$item.ref_number);
                    console.log('Open item @', lPath);
                    window.location = '/' + lPath;
                });
            }
            
            $scope.getItemLinkShortcut = function($type, $configs){
                let lRoute = $configs[$type + '_routes'].find($r => $r.lang == immodbApiSettings.locale) || 
                               $configs[$type + '_routes'][0];
                
                
                return lRoute.shortcut;
            }

            /**
            * Reset all filter to nothing
            */
            $scope.resetFilters = function(){
                $immodbFilters.with($scope.alias).resetFilters();

            }


            $scope.getEndpoint = function(){
                return 'view/'.concat($scope.configs.source.id,'/', immodbApiSettings.locale + '/quick_search');
            }


        } // end controller

        
    };
}]);

ImmoDbApp
.directive('immodbStreetview', function immodbStreetView( $immodbTemplate, $immodbUtils, $immodbDictionary){
    let dir_controller = 
    function($scope, $q, $immodbApi, $rootScope){
        $scope.ready = false;
        $scope.is_visible = false;
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
            //console.log('init', $scope);
            if( typeof(google) == 'undefined'){
                return;
            }
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
            }
        }

        $scope.setView = function($position){
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
                //console.log('latlng streetview', $scope.latlng);
                $scope.isReady().then(function(){
                    //console.log('streetview is ready');
                    $scope.setView($scope.latlng);
                });
            }
        });
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
        template: '<div><div id="map-{{alias}}" class="map-viewport"></div><div id="pano-{{alias}}" class="viewport"></div></div>',
        controller: dir_controller,
        link: function($scope, element){
            $scope.map_element = element.children()[0];
            $scope.viewport_element = element.children()[1];
            $scope.$onInit();
        }
    };
});

ImmoDbApp
.directive('immodbMap', function immodbMap( $immodbTemplate, $immodbUtils, $immodbDictionary,$immodbHooks){
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
            //console.log('init', $scope);
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
                //console.log('update list from token changed');
                $scope.getList();
            })
        }
        $scope.onSwitchToMap = function(){
            $scope.mapInit();
            //console.log('map initialized');
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
                //console.log('marker list:', $scope.list);
                $rootScope.$broadcast('immodb-listings-update',$scope.list,{item_count: $scope.list.length});
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
            
            //console.log($scope.list[0]);

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
                let lImagePath = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m';
                let lClustererOptions = {
                    //cssClass : 'immodbMarkerCluster',
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

                lClustererOptions = $immodbHooks.filter('marker_cluster_options',lClustererOptions);

		    	$scope.markerCluster = new MarkerClusterer($scope.map, $scope.markers, lClustererOptions);
                
                if($scope.is_visible == true){
                    window.setTimeout(function(){
                        $scope.map.fitBounds($scope.bounds);
                    },250);
                }
		    }
		    else if ($scope.list.length>0){
                $scope.map.setCenter($scope.list[0].marker.getPosition());
                $scope.map.setZoom(12);
            }
            
            //console.log('Map markers updated');
        }

        $scope.pinClick = function($marker){
            //console.log('Marker clicked', $marker);

            $immodbApi.api($scope.getEndpoint().concat('/',immodbApiSettings.locale,'/items/',$marker.obj.id)).then(function($response){
                let lInfoWindowScope = $immodbUtils;
                $immodbDictionary.source = $response.dictionary;

                lInfoWindowScope.compileListingItem($response);
                lInfoWindowScope.item = $response;

                //console.log('lInfoWindowScope',lInfoWindowScope);
                $immodbTemplate.load('views/ang-templates/immodb-map-info-window.html?v=2', lInfoWindowScope).then(function($content){
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
        if( typeof(google) != 'undefined'){
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
        }
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
            //console.log('loading directive on ');
            

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
    let dir_controller = function immodbImageSliderCtrl ($scope,$rootScope, $q,$immodbApi,$rootScope,$immodbDictionary, $immodbHooks) {
        $scope.expand_mode = false;
        $scope.picture_grid_mode = false;

        $scope.position = {
            current_picture_index : 0
        };

        $scope.init = function(){
            $scope.index = 0;   
            
            $scope.$on('thumbnails-slider-select', function($event, $picture){
                const lIndex = $scope.pictures.findIndex($e => $e.url == $picture.url);
                $scope.set(lIndex,false);
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
            $scope.picture_grid_mode =false;
            
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
            let lResult = $immodbDictionary.getCaption($img.category_code,'photo_category');

            lResult = $immodbHooks.filter('listing-picture-alt', lResult, $img);

            return lResult;
        }

        $scope.getImageCaption = function($img){
            let lResult = $immodbDictionary.getCaption($img.category_code,'photo_category');

            lResult = $immodbHooks.filter('listing-picture-caption', lResult, $img);

            return lResult;
        }
    };

    return {
        restrict: 'E',
        scope: {
            pictures: '=immodbPictures',
            dictionary: '=?immodbDictionary',
            gap: '@immodbGap',
            index: '=?immodbIndex',
            showGrid: '=immodbShowPictureGrid'
        },
        controllerAs: 'ctrl',
        replace:true,
        templateUrl: immodbCtx.base_path + 'views/ang-templates/immodb-image-slider.html?v=2',
        controller: dir_controller,
        link: function (scope, element, attrs) {
            scope.$element = element[0];
            var mc = new Hammer(element[0]);
            let lPanHndl = null;
            console.log('image-slider showGrid', scope.showGrid);
            // let the pan gesture support all directions.
            // this will block the vertical scrolling on a touch-device while on the element
            mc.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });
            mc.on("swipeleft swiperight", function(ev) {
                
                //console.log( ev.type +" gesture detected.");

                    switch(ev.type){
                        case 'swipeleft':
                            scope.next();
                            break;
                        case 'swiperight':
                            scope.previous();
                            break;
                    }
                    
                
            });

            scope.init();
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
        templateUrl: immodbCtx.base_path + 'views/ang-templates/immodb-calculator.html?v=2',
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
                    transfer_tax : getTransferTax($scope.data.amount,$scope.region=='06 ')
                }
    
                $rootScope.$broadcast('immodb-mortgage-calculator-result-changed', lResult);
                
                if(typeof($scope.on_change) == 'function'){
                    $scope.on_change({'$result' : lResult});
                }
    
                //console.log('processing triggered', lResult);
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
    
                //console.log('in montreal', in_montreal);
    
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
.directive('immodbModalTrigger', function immodbModalTrigger(){
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

ImmoDbApp
.directive('immodbModal', function immodbModal(){
    let dir_controller = function immodbModalCtrl($scope, $q,$immodbApi,$rootScope) {

        $scope.options = {
            close_label : null,
            ok_label: 'OK'
        }

        //console.log('listening to "show-' + $scope.modal_id + '" trigger');
        $scope.$on('show-' + $scope.modal_id, function(){
            //console.log('show modal trigger received');
            $scope.open();
        });

        $scope.init = function(){
            if($scope.model==null){
                $scope.model = {};
            }            
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
            
            if($scope.modalForm.$valid){
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
    };

    return {
        restrict: 'E',
        scope: {
            modal_id        : '@modalId',
            modal_title     : '@modalTitle',
            onOK            : '&?onOk',
            model           : '=ngModel',
            ok_label        : '@?okLabel',
            cancel_label    : '@?cancelLabel',
            onValidate      : '&?onValidate'
        },
        controllerAs    : 'ctrl',
        replace         : true,
        transclude      : true,
        templateUrl     : immodbCtx.base_path + 'views/ang-templates/immodb-modal.html?v=2',
        link            : function(scope, element, attr){
            scope.modal_element = element;
            angular.element(document.body).append(scope.modal_element);
        },
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
});

ImmoDbApp
.directive('immodbListingNavigation', ['$q',function immodbListingNavigation(){
    return {
        restrict: "E",
        replace: true,
        transclude: true,
        scope:{
            current : '=immodbCurrent',
            display : '@immodbDisplay',
            panelTitle: '@?immodbTitle'
        },
        templateUrl: immodbCtx.base_path + 'views/ang-templates/immodb-listing-navigation.html?v=2',
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
                let lList = sessionStorage.getItem('immodb.list.listings.{0}'.format(immodbCtx.locale));
                if(lList !=undefined){
                    $scope.list = JSON.parse(lList);
                }
                else{
                    $scope.list = [];
                }
            }

            $scope.getNextAndPrevious = function(){
                $scope.loadList();
                let lCurrentIndex = 0;

                $scope.list.some(function($e,$index){
                    if($e.id == $scope.current){
                        lCurrentIndex = $index;
                        return true;
                    }
                });

                //console.log('getNextAndPrevious',$scope.current, lCurrentIndex);

                if(lCurrentIndex>0){
                    $scope.previous = $scope.list[lCurrentIndex-1];
                    //console.log('previous', $scope.previous);
                }
                if(lCurrentIndex < $scope.list.length-1){
                    $scope.next = $scope.list[lCurrentIndex+1];
                    //console.log('next', $scope.next);
                }
            }
        }
    };
}]);

ImmoDbApp
.directive('immodbLoading', [function immodbLoading(){
    return {
        restrict: 'E',
        replace: true,
        scope: {
            label: '@immodbLabel'
        },
        template: '<div class="immodb-loading"><i class="fal fa-spinner fa-spin"></i> {{label.translate()}}</div>',
        controller: function($scope){
            
        }
    }
}]);


ImmoDbApp
.directive('immodbDropdown',['$rootScope',
    function immodbDropdown($rootScope){
        return {
            restrict: 'C',
            scope: {
                showButtonIcon : "@?",
                hasValue : "@?"
            },
            link: function(scope,element,attr){
                let lElm = angular.element(element);
                scope._elm = lElm;
                scope.showButtonIcon = (typeof scope.showButtonIcon == 'undefined') ? true : scope.showButtonIcon;
                scope.hasValue = (typeof scope.hasValue == 'undefined') ? false : scope.hasValue!=null;
                scope.buttonIcon = "anchor-down";

                if(scope.hasValue){
                    lElm.addClass('has-value');
                }

                if(scope.showButtonIcon === true || scope.showButtonIcon != 'false'){
                    lElm.addClass('has-button-icon');
                    if(typeof scope.showButtonIcon == 'string' && scope.showButtonIcon != 'true'){
                        scope.buttonIcon = scope.showButtonIcon;
                    }
                }
                

                angular.element(document).on('click', function(){
                   $rootScope.$broadcast('close-dropdown', null);
                });
                
                jQuery(lElm).parents('.modal-body').on('click', function(){
                    $rootScope.$broadcast('close-dropdown', null);
                })

                lElm.find('.button').on('click', function($event){
                    
                    $rootScope.$broadcast('close-dropdown', lElm);

                    lElm.addClass('expanded');
                    $event.stopPropagation();
                });

                scope.$on('close-dropdown', function($event, $source){
                    if($source != lElm){
                        lElm.removeClass('expanded');
                    }
                })
            },
            controller: function($scope){
                $scope.$watch('hasValue', function($new, $old){
                    if($new == true){
                        $scope._elm.addClass('has-value');
                    }
                    else{
                        $scope._elm.removeClass('has-value');
                    }
                });
            }
        }
    }
])

ImmoDbApp
.directive('immodbCheckbox',[function immodbCheckbox(){
    return {
        retrict: 'E',
        transclude:true,
        scope: {
            label: '@',
            model: '=?ngModel'
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

ImmoDbApp
.directive("immodbSlider", function immodbSlider($document, $timeout) {
    return {
        restrict: "E",
        scope: {
            model: "=",
            onChange: "&",
            valueFormat: "&",
            property: "@",
            step: "@",
            startLabel: "@",
            endLabel:"@"
        },
        replace: true,
        template: '<div class="immodb-slider"><div class="label start">{{startLabel}}</div><div class="inner"><div class="slider {{boundaryClasses()}}" style="--lower-value:{{getLowerValue()}};--upper-value:{{getUpperValue()}}"></div></div><div class="label end">{{endLabel}}</div></div>',
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
             * @parem $type mouse|touch
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

                        lPointerMoveHndl = (event) => {
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

ImmoDbApp
.directive('immodbRadio',[function immodbRadio(){
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

ImmoDbApp
.directive('inputContainer', function(){
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
})

ImmoDbApp
.directive('immodbMediabox',[
function immodbMediabox(){
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
        templateUrl: immodbCtx.base_path + 'views/ang-templates/immodb-mediabox.html?v=2',
        replace: true,
        controller : function($scope){
            $scope.selected_media = $scope.defaultTab || 'pictures';
            $scope.video_player = null;
        
            $scope.init = function(){
                const cFirstTab = $scope.tabs ? $scope.tabs[0] : 'pictures';
                $scope.selected_media = $scope.defaultTab || cFirstTab;
            }
        
            $scope.tabIsAvailable = function($name){
                if(!$scope.tabs) return true;

                return $scope.tabs.some($t => $t == $name);
            }

            $scope.selectMedia = function($media){
                $scope.selected_media = $media;
                if($media!='video'){
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

ImmoDbApp
.directive('immodbThumbnailsSlider',[ '$timeout',
    function immodbThumbnailsSlider($timeout){
        return {
            restrict: 'E',
            templateUrl: immodbCtx.base_path + 'views/ang-templates/immodb-thumbnails-slider.html',
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
                    const { 
                        controlWidth,
                        pictureWidth
                    } = $scope.getComponentsWidth();

                    console.log('click next');

                    if(! $scope.hasViewablePicture(lOffsetValue, $scope.list.length, controlWidth, pictureWidth)){
                        lOffsetValue = $scope.trolleyOffset;
                    }


                    $scope.trolleyOffset = lOffsetValue;
                }

                $scope.previous = function(){
                    let lOffsetValue = $scope.trolleyOffset > 0 ? $scope.trolleyOffset-1 : 0;
                    $scope.trolleyOffset = lOffsetValue;

                    console.log('click previous');
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

                    const { 
                        controlWidth,
                        pictureWidth
                    } = $scope.getComponentsWidth();

                    const lPicturePerPage = Math.floor(controlWidth / pictureWidth);
                    const indexOfFirstPicture = $scope.trolleyOffset * lPicturePerPage;

                    lResult = -1 * indexOfFirstPicture *  pictureWidth;
                    return lResult.toString() + 'px';
                }

                $scope.getTrolleyIndexFromSelection = function($selectedIndex){
                    if($selectedIndex == 0) return 0;
                    const { 
                        controlWidth,
                        pictureWidth
                    } = $scope.getComponentsWidth();
                    
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

                    $scope.selectedIndex = $scope.list.findIndex($e => $e.url == $picture.url);
                    console.log('click on picture')
                    if($triggerEvents){
                        $rootScope.$broadcast('thumbnails-slider-select', $scope.list[$scope.selectedIndex]);
                    }
                }

                $scope.getImageAlt = function($img){
                    let lResult = $immodbDictionary.getCaption($img.category_code,'photo_category');
        
                    lResult = $immodbHooks.filter('listing-picture-alt', lResult, $img);
        
                    return lResult;
                }
        
                $scope.getImageCaption = function($img){
                    let lResult = $immodbDictionary.getCaption($img.category_code,'photo_category');
        
                    lResult = $immodbHooks.filter('listing-picture-caption', lResult, $img);
        
                    return lResult;
                }
            }
        }
    }
])

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
.factory('$immodbApi', ["$http","$q","$immodbConfig","$rootScope", 
function $immodbApi($http,$q,$immodbConfig,$rootScope){
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
            let lStoredToken = sessionStorage.getItem('immodb.auth_token');
            if(lStoredToken != null && lStoredToken != ''){
                $scope.auth_token = JSON.parse(lStoredToken);
            }
            else{
                return false;
            }
        }
        // token is out of date
        let lExpireDate = new Date(Date.parse($scope.auth_token.expire_date));
        if(lExpireDate < lNow){
            //console.log('token is not valid');
            return false;
        }
        // everything's peachy
        //console.log('token is valid expires', lExpireDate, 'and now is', lNow, 'so',(lExpireDate < lNow) );
        return true;
    }

    /**
     * Renew the authentication token to make call to the distribution API
     * @return {AuthToken}
     */
    $scope.renewToken = function(){
        let lPromise = $q(function($resolve, $reject){
            if(!$scope.tokenIsValid()){   
                $scope.rest_call('access_token').then(function($response){
                    if($response != ''){
                        $scope.auth_token = $response;
                        $rootScope.$broadcast('auth_token_refresh');
                        sessionStorage.setItem('immodb.auth_token', JSON.stringify($scope.auth_token));
                        $resolve()
                    }
                    else{
                        $reject();                        
                    }
                });
            }
            else{
                $resolve();
            }
        });

        return lPromise;
    }

    $scope.getDefaultDataView = function(){
        let lPromise = $q(function($resolve, $reject){
            $immodbConfig.get().then(function($config){
                $resolve(JSON.parse($config.default_view));
            });
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
                //console.log($configs);
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
                    //console.log($error);
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
                    //console.log($error);
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
        //console.log('immodbDictionary array sorted', lCollArray);
        
        // turn array back to collection
        let lResult = $scope._toObject(lCollArray);

        //console.log('immodbDictionary sorted collection', lResult);
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
.factory('$immodbUtils', ['$immodbDictionary', '$immodbTemplate', '$interpolate' , '$sce', '$immodbConfig',
function $immodbUtils($immodbDictionary,$immodbTemplate, $interpolate, $sce,$immodbConfig){
    let $scope = {};
    $scope.page_list = [];

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
                lResult.push('Rented'.translate());
            }
            return lResult.join('');
        }

        for(let $key in $item.price){
            if(['sell','lease'].indexOf($key) >=0 ){
                let lPart = [$item.price[$key].amount.formatPrice()];
                if($item.price[$key].taxable){
                    lPart[0] += '+tx';
                }

                if($item.price[$key].unit_code){
                    lPart.push($scope.getCaption($item.price[$key].unit_code,'price_unit',true))
                }

                if($item.price[$key].period_code){
                    lPart.push($scope.getCaption($item.price[$key].period_code,'price_period'))
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

    $scope.formatDimension = function($dimension){
        let lResult = '';
        if($dimension != undefined){
            
            if(typeof $dimension.width != 'undefined'){
                let lUnit = $immodbDictionary.getCaption($dimension.unit_code,'dimension_unit',true);
                lResult = '{0}{2} x {1}{2}'.format($dimension.width,$dimension.length, lUnit);
            }
            else if (typeof $dimension.area != undefined){
                let lUnit = $immodbDictionary.getCaption($dimension.area_unit_code,'dimension_unit',true);
                //if(lUnit=='mc'){lUnit='m<sup>2</sup>';}
                lResult = '{0} {1}'.format($dimension.area, lUnit);
            }
        }
        return lResult;
    }

    $scope.hasDimension = function($dimension){
        let lResult = false;
        if($dimension != undefined){
            if($dimension.width != undefined){
                if($dimension.length != undefined){
                    return true;
                }
            }
            if($dimension.area != undefined){
                return true;
            }
            
        }
        return lResult;
    }

    /**
     * Get permalink of the listing item
     * @param {object} $item Listing data object
     */
    $scope.getPermalink = function($item, $type, $configs){
        let lRoute = '';

        $type = (typeof $type=='undefined') ? 'listing' : $type;
        $scope.item = $item;
        
        immodbCtx[$type + '_routes'].forEach(function($r){
            if($r.lang==immodbCtx.locale){
                lRoute=$r;
            }
        });

        let lResult = $scope.sanitize('/' + $immodbTemplate.interpolate(lRoute.route, $scope));
        
        // check if permalink overrides is allowed
        if($immodbConfig._data.enable_custom_page){  
            // search in page_permalink first
            $scope.page_list.some(function($p){
                let lCustomPage = '';
                switch($type){
                    case 'broker':
                        lCustomPage= lResult.replace('/' + $item.ref_number, '-' + $item.ref_number);
                        break;
                    case 'listing':
                        let lRx = new RegExp("\/[^\/]+\/" + $item.ref_number);
                        lCustomPage= lResult.replace(lRx, '/' + $scope.sanitize($item.location.civic_address) + '-' + $item.ref_number);
                        
                        break;
                }

                if(lCustomPage != '' && lCustomPage == $p.permalink){
                    lResult = lCustomPage;
                    return true;
                }
            });
        }
        return lResult;
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
            $scope.compileListingItem($e);
        });

        return $list;
    }

    $scope.compileListingItem = function($item){
        
        if($item.category == undefined){
            $item.location.city = $scope.getCaption($item.location.city_code, 'city');
            $item.location.region = $scope.getCaption($item.location.region_code, 'region');
            $item.subcategory = $scope.getCaption($item.subcategory_code, 'listing_subcategory');
            $item.category = $scope.getCaption($item.category_code, 'listing_category');
            $item.transaction = $scope.getTransaction($item);
            
            $item.short_price = $scope.formatPrice($item);
            $item.location.civic_address = '{0} {1}'.format(
                                                        $item.location.address.street_number,
                                                        $item.location.address.street_name
                                                    );
                
            $item.permalink = $scope.getPermalink($item);
        }
    }

    /**
     * Compile data to ease access to some values
     * @param {array} $list Array of broker item
     */
    $scope.compileBrokerList = function($list){
        $list.forEach(function($e){
            $scope.compileBrokerItem($e);
        });

        return $list;
    }

    $scope.compileBrokerItem = function($item){
        if($item.permalink == undefined){
            $item.license_type = $immodbDictionary.getCaption($item.license_type_code, 'broker_license_type');
            $item.permalink = $scope.getPermalink($item,'broker');
        }
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
            let lHasFlags = false;
            if($item.video_flag){
                lHasFlags = true;
                lResult.push('has-video');
            }

            if($item.virtual_tour_flag){
                lHasFlags = true;
                lResult.push('has-virtual-tour');
            }

            if(lHasFlags){
                lResult.push('has-flags');
            }

            if($item.open_houses != undefined && $item.open_houses.length>0){
                lResult.push('has-open-house')
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
        if(typeof $value == 'undefined') return '-';

        let lResult = $value.toLowerCase();
        lResult = lResult.replace(/(\s|\+)/gm, '-');
        lResult = lResult.replace(/('|"|\(|\))/gm, '');
        lResult = lResult.replace(/(é|è|ë|ê)/gm, 'e');
        lResult = lResult.replace(/(à|â|ä)/gm, 'a');
        lResult = lResult.replace(/(ì|î|ï)/gm, 'i');
        lResult = lResult.replace(/(ù|û|ü)/gm, 'u');
        lResult = lResult.replace(/(ò|ô|ö)/gm, 'o');
        lResult = lResult.replace(/\./gm, '');

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
            $object[objectKey].__$obj_key = objectKey;
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

    /**
     * Return an object containing all query string data
     */
    $scope.search = function(){
        let lResult = {};
        let lSearch = location.search.replace('?','');
        if(lSearch!=''){
            let lQueryArr = lSearch.split('&');
            lQueryArr.forEach(function($item){
                lKeyValue = $item.split("=");
                lResult[lKeyValue[0]] = lKeyValue[1];
            });
        }

        return lResult;
    }

    $scope.absolutePosition = function(element) {
        var top = 0, left = 0;
        if(element != undefined){
            do {
                top += element.offsetTop  || 0;
                left += element.offsetLeft || 0;
                element = element.offsetParent;
            } while(element);

            let lHtmlElm = angular.element('html')[0];
            let lGlobalTop = {
                margin : Number(window.getComputedStyle(lHtmlElm, null).getPropertyValue('margin-top').replace('px','')),
                padding: Number(window.getComputedStyle(lHtmlElm, null).getPropertyValue('padding-top').replace('px',''))
            }
            let lGlobalLeft = {
                margin : Number(window.getComputedStyle(lHtmlElm, null).getPropertyValue('margin-left').replace('px','')),
                padding: Number(window.getComputedStyle(lHtmlElm, null).getPropertyValue('padding-left').replace('px',''))
            }
            lGlobalOffsetTop = lGlobalTop.margin + lGlobalTop.padding;
            lGlobalOffsetLeft = lGlobalLeft.margin + lGlobalLeft.padding;

            top += lGlobalOffsetTop;
            left += lGlobalOffsetLeft;
            
        }

        return {
            top: top,
            left: left
        };
    };

    $scope.lateCallHndl = null;
    $scope.lateCall = function($func){
        if($scope.lateCallHndl!=null){
            window.clearTimeout($scope.lateCallHndl);
        }

        $scope.lateCallHndl = window.setTimeout(function(){
            $func();
        },500);
    }

    $scope.appendToUrlQuery = function($url, $key, $value){
        let lDataPrefix = '?';
        if($url.indexOf('?') >=0){
            lDataPrefix = '&';
        }

        return $url + lDataPrefix + $key + '=' + $value;
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
            //console.log('on get $scope._data:',$scope._data,'loading:',$scope._loading);
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

ImmoDbApp
.factory('$immodbHooks', ['$q', 
function $immodbHooks($q){
    let $scope = {};

    $scope._actions = [];
    $scope._filters = [];


    $scope.addAction = function($key, $func, $priority){
        let lNewAction = {key: $key, fn: $func};
        if($priority == undefined || $priority > $scope._actions.length - 1){
            $scope._actions.push(lNewAction);
        }
        else{
            $scope._actions.splice($priority, 0, lNewAction);
        }
    }

    $scope.addFilter = function($key, $func, $priority){
        let lNewFilter = {key: $key, fn: $func};
        
        if($priority == undefined || $priority > $scope._filters.length - 1){
            $scope._filters.push(lNewFilter);
        }
        else{
            $scope._filters.splice($priority, 0, lNewFilter);
        }
    }

    /**
     * Execute action hooked to the key
     * @param {string} $key 
     */
    $scope.do = function($key, $params){
        let lActions = [];
        $scope._actions.forEach(function($a){
            if($key == $a.key){
                lActions.push($a);
            }
        });

        lActions.forEach(function($a){
            $a.fn($params);
        });
    }

    /**
     * Apply filter on value hooked to the key
     * @param {string} $key 
     */
    $scope.filter = function($key, $default_value, $otherParams){
        let lFilters = [];
        $scope._filters.forEach(function($f){
            if($key == $f.key){
                lFilters.push($f);
            }
        });
        //console.log('filters', lFilters,'from', $scope._filters);
        lFilters.forEach(function($f){
            $default_value = $f.fn($default_value,$otherParams);
        });

        return $default_value;
    }

    return $scope;
}]);

ImmoDbApp
.factory('$immodbFavorites', ['$q', function $immodbFavorites($q){
    let $scope = {}
    
    $scope.favorites = [];

    $scope.init = function(){
        $scope.favorites = JSON.parse(localStorage.getItem('favorites'));
        if($scope.favorites== null){
            $scope.favorites = [];
        }
    }

    $scope.save = function(){
        localStorage.setItem('favorites', JSON.stringify($scope.favorites));
    }

    $scope.toggle = function($key){
        if($scope.isFavorite($key) === false){
            $scope.favorites.push($key);
            $scope.save();
        }
        else{
            $scope.favorites.splice($scope.favorites.indexOf($key),1);
            $scope.save();
        }
    }

    $scope.isFavorite = function($key){
        return $scope.favorites.some($e => $e == $key);
    }

    $scope.init();

    return $scope;
}])

ImmoDbApp
.factory('$immodbShare', ['$q','$immodbHooks','$immodbUtils', 
function immodbShare($q,$immodbHooks,$immodbUtils){
    let $scope = {};

    $scope.data = {
        url : null,
        url_timed : null,
        text : null,
        media :null, 
        title: null
    }
    
    $scope.init = function(){
        $scope.data.url = window.location.href;
        $scope.data.title = document.title;
        $scope.data.description = document.description;
    }

    $scope.execute = function($dest){
        let lShareUrl = $scope.get_destination_format($dest);
        
        if($scope.data.url == null){
            return false;
        }

        $scope.data = $immodbHooks.filter('immodb.share.data',$scope.data);
        if($scope.data.url != null && $scope.data.url_timed==null){   
            $scope.data.url_timed = $immodbUtils.appendToUrlQuery($scope.data.url, 't', moment().valueOf());
        }

        for($key in $scope.data){
            lShareUrl = lShareUrl.replace('[' + $key + ']', escape($scope.data[$key]));
        }


        window.open(lShareUrl);
    }

    $scope.get_destination_format = function($dest){
        
        let lFormats = {
            'facebook' : 'https://www.facebook.com/sharer/sharer.php?u=[url_timed]',
            'twitter' : 'https://twitter.com/intent/tweet?url=[url]',
            'pinterest' : 'http://pinterest.com/pin/create/button/?url=[url]&media=[media]&description=[title]',
            'googleplus' : 'https://plus.google.com/share?url=[url]',
            'linkedin' : 'https://www.linkedin.com/sharing/share-offsite/?url=[url]',
            'email' : 'mailto:?subject=[title]&body=[url]&v=3'
        }

        return lFormats[$dest];
    }

    $scope.init();

    return $scope;
}]);


ImmoDbApp
.factory('$immodbFilters', ['$q','$immodbApi','$immodbUtils', function $immodbFilters($q,$immodbApi,$immodbUtils){
    $scope = {
        filters:{}
    }

    $scope.with = function($alias, $resolve){
        if(typeof $scope.filters[$alias] == 'undefined'){
            $scope.filters[$alias] = new FilterManager($alias);
        }

        if(typeof $resolve == 'function') $resolve($scope.filters[$alias]);
        return $scope.filters[$alias];
    }

    

    function FilterManager($alias){
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
            data: {
                keyword : '',
                min_price: null,
                max_price: null,
                location: null
            },
            configs : null,
            state_loaded: false
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
                resolve: function(...params){
                    this._callback(...params);
                }
            }

            $fm._events_listener[$event_key].push(function(...params){
                lResult.resolve(...params);
            });

            return lResult;
        }

        $fm.trigger = function($event_key, ...$params){
            if(typeof $fm._events_listener[$event_key] == 'undefined') return;

            $fm._events_listener[$event_key].forEach($e => $e(...$params));
        }

        $fm.searchByKeyword = function($keyword){
            $fm.resetFilters(false);

            $fm.query_text = $keyword;
            $fm.data.keyword = $keyword;
            
            $fm.saveState();
            $fm.buildFilters();
        }

        // #region **** Filters Handling ****

        /**
         * Check wether there's any filter or not
         * @return {boolean}
         */
        $fm.hasFilters = function($customCheck){
            
            if($fm.filter_group.filter_groups != null) return true;
            if($fm.filter_group.filters != null) return true;
            if($fm.query_text != null) return true;
            if($fm.data.location != null) return true;
            //if($fm.data.keyword != '') return true;
            if($fm.data.min_price != null) return true;
            if($fm.data.max_price != null) return true;

            
            return false;
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
                return lFields.some($f => {
                    return $fm.getFilterByFieldName($f) != null
                });
            }
            else{
                return false;
            }
        }

        $fm.sublistHasFilters = function($parent_code, $list){
            for(let lKey in $list){
                let lItem = $list[lKey];
                
                if(lItem.parent==$parent_code){
                    
                    if(lItem.selected){
                        return true;
                    }
                }
            }
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
            let lValue = $fm.getFilterValue($fieldname);
            if(lValue == null){
                return $default;
            }
            let lItem = null;
            if($list.some($e => $e.filter != undefined)){
                lItem = $list.find($e => $e.filter.value == lValue);
            }
            else{
                lItem = $list.find($e => $e.value == lValue);
            }
            
            if(lItem == null){
                return $default;
            }

            if(lItem.label != undefined){
                return lItem.label;
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
                    if($e.field == $fieldname){
                        lResult = $e;
                        return true;
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

        /**
         * Add a filter to the list
         * @param {*} $field Field name (or array of field name) on which the filter is applied
         * @param {string} $operator Operand for the filter
         * @param {*} $value Value to filter
         * @param {*} $label Caption for the filter hint
         * @param {*} $reverseFunc Function to remove the filter
         */
        $fm.addFilter = function($field,$operator,$value, $label, $reverseFunc){
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

            if($fm._buildFiltersDebounce!= null){
                window.clearTimeout($fm._buildFiltersDebounce);
            }

            $fm._buildFiltersDebounce = window.setTimeout(function(){
                $fm.buildFilters();
            }, 100);
            
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
                    $fm.addFilter($field,$operator, '')
                }
            };

            for(lFilterIndex = 0; lFilterIndex < $group.filters.length; lFilterIndex++){
                if($group.filters[lFilterIndex].field == $field){
                    break;
                }
            }
            
            if($value==='' || $value==null){
                $fm.removeFilter(lFilterIndex, $group);
            }
            else if (typeof($value.push)=='function' && $value.length == 0){
                $fm.removeFilter(lFilterIndex, $group);
            }
            else{
                $fm.updateFilter(lNewFilter, lFilterIndex, $group);
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
        }


        $fm.getFieldGroup = function($groupName, $parent){
            if($parent.name==$groupName){
                return $parent;
            }
            else{
                if($parent.filter_groups!=null){
                    let lResult = null;
                    $parent.filter_groups.every(function($g){
                        lResult = $fm.getFieldGroup($groupName, $g);
                        return lResult==null;
                    });
                    return lResult;
                }
            }

            return null;
        }

        //// FILTERS BUILDING
        
        /**
        * Reset all filter to nothing
        */
        $fm.resetFilters = function($triggerUpdate){
            $triggerUpdate = (typeof $triggerUpdate == 'undefined') ? true : $triggerUpdate;
            $fm.data.keyword = '';
            $fm.filter_group = {
                operator: 'and',
                filters: null,
                filter_groups: null
            };
            $fm.query_text = null;
            $fm.data.min_price = null;
            $fm.data.max_price = null;
            $fm.data.location = null;

            // save filters to localStorage
            $fm.clearState();
            
            //$fm.buildFilters();
            if($triggerUpdate){
                $fm.trigger('update');

                $fm.getConfigs().then(function($configs){
                    if($configs.search_token!=''){
                        $fm.trigger('filterTokenChanged');
                        //$rootScope.$broadcast($scope.alias + 'FilterTokenChanged', $configs.search_token);

                        // if($scope.onTokenChange!=undefined){
                        //     $scope.onTokenChange();
                        // }
                    }
                    else{
                        // reset the filter manager last
                        // this will trigger the UI update
                        
                    }
                    $fm.trigger('update');
                });
            }
        }

        $fm.resetKeywordSearch = function(){
            let lKey = 'immodb.' + $fm.alias + '.{0}';

            $fm.query_text = null;
            $fm.data.keyword = '';

            sessionStorage.removeItem(lKey.format('query'));
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

        /**
         * Build the object to send as search parameters
         */
        
        $fm.buildFilters = function(){
            let lResult = null;
            let lPromise = $q(function($resolve, $reject){
                console.log('Building filters');

                $fm.getConfigs().then(function($configs){
                    if(
                        !$fm.hasFilters()
                        && $fm.query_text == null
                        && $fm.sort_fields.length == 0
                        && $fm.data.location == null
                    ){
                        console.log('Everything is back to default');
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
                        if(lResult==null) lResult = {};
                        lResult.filter_group = {filters:[]};
                        if($configs.filter_group != null){
                            lResult.filter_group = angular.copy($configs.filter_group)
                        }
        
                        if($fm.hasFilters()){
                            lResult.filter_group.filter_groups.push($fm.filter_group);
                        }
                        
                        lResult.filter_group = $fm.normalizeFilterGroup(lResult.filter_group);
                    }
                    
                    if($fm.sort_fields.length > 0){
                        lResult.sort_fields = $fm.sort_fields;
                    }
                    else if($configs.sort != 'auto'){
                        lResult.sort_fields = [{field: $configs.sort, desc: $configs.sort_reverse}];
                    }
                    else{
                        lResult.sort_fields = null;
                    }

                    if($fm.query_text != null){
                        lResult.query_text = $fm.query_text;
                        lResult.filter_group = null;
                    }

                    if($fm.data.location != null){
                        lResult.proximity_filter = $fm.data.location;
                    }
                    console.log('getting new token');
                    $fm.getSearchToken(lResult).then(function($token){
                        console.log('new token acquired',$token);
                        if($token!=''){
                            
                            $fm.saveState('st', $token);
                            
                            //$rootScope.$broadcast($fm.alias + 'FilterTokenChanged', $token);
                            $fm.trigger('filterTokenChanged', $token);
                            console.log('filter token changed', $fm.result_url);
                            if($fm.result_url != null){
                                $fm.saveState()
                                console.log('navigating to', $fm.result_url);
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

        // #endregion
    

        $fm.saveState = function($item_key, $data){
            
            let lKey = 'immodb.' + $fm.alias + '.{0}';
            
            if($item_key == undefined){
                $fm.state_loaded = false;
                sessionStorage.setItem(lKey.format('filter_group'), JSON.stringify($fm.filter_group));
                if($fm.query_text!=null){
                    console.log('Saving query text');
                    sessionStorage.setItem(lKey.format('query'), $fm.query_text);
                }
                
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
            let lKey = 'immodb.' + $fm.alias + '.{0}';

            if($item_key == undefined){
                $fm.state_loaded = false;
                sessionStorage.removeItem(lKey.format('filter_group'));
                sessionStorage.removeItem(lKey.format('data'));
                sessionStorage.removeItem(lKey.format('query'));
                sessionStorage.removeItem(lKey.format('st'));
            }
            else{
                sessionStorage.removeItem(lKey.format($item_key));
            }
        }
        $fm.loadState = function($item_key){
            $key = 'immodb.' + $fm.alias + '.{0}';
            if($item_key == undefined && !$fm.state_loaded){
                let lSessionFilterGroup = sessionStorage.getItem($key.format('filter_group'));
                let lSessionData = sessionStorage.getItem($key.format('data'));
                let lQuery = sessionStorage.getItem($key.format('query'));
                //let lSessionSearchKeyword = sessionStorage.getItem($key.format('search-keyword'));
                if(lSessionFilterGroup != null){
                    $fm.filter_group = JSON.parse(lSessionFilterGroup);
                }
                if(lSessionData != null){
                    let lData = JSON.parse(lSessionData);
                    $fm.data = lData; 
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

        /**
         * Get a new search token from the api
         * @param {object} $filters 
         * @return {object} Promise
         */
        $fm.getSearchToken = function($filters){
            //console.log('getSearchToken', $filters);
            $fm.normalize($filters.filter_group);
            
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

        $fm.normalize = function($filterGroup){
            const lNewGroup = [];
            $filterGroup.filter_groups.forEach( ($f,$i) => {
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

ImmoDbApp
.filter('textToHtml', [function textToHtml(){
    return function($value){
        if($value == null || $value == undefined) return '';
        // check if the string is already html
        const tagRegex = /<[^>]+>/gm;
        $matches = tagRegex.exec($value);
        if($matches!=null && $matches.length > 0){
            return $value;
        }

        let lReplacements = [
            {match: /(\n+)/gm, by: '</p><p>', wrap_by: 'p'},
            {match: /(\n)/g, by: '<br />'},
        ];

        lReplacements.forEach(function($e){
            $value = $value.replace($e.match, $e.by);
            if($e.wrap_by != undefined){
                $value = '<' + $e.wrap_by + '>' + $value + '</' + $e.wrap_by + '>';
            }
        })

        return $value;
    }
}])

ImmoDbApp
.filter('formatDimension', ['$immodbUtils', function dimensionFilter($immodbUtils){
    return function($value){
        return $immodbUtils.formatDimension($value);
    }
}]);

ImmoDbApp
.filter('sanitize', ['$immodbUtils', function sanitize($immodbUtils){
    return function($value){
        return $immodbUtils.sanitize($value);
    }
}]);

ImmoDbApp
.filter('iconFromType', ['$immodbUtils', function iconFromType($immodbUtils){
    return function($value){
        let lTypeIcons = {
            'listing' : 'home',
            'broker' : 'user',
            'city' : 'map-marker-alt'
        }
        return lTypeIcons[$value];
    }
}]);

ImmoDbApp
.filter('wrapWith', ['$immodbUtils', function wrapWith(){
    return function($text, $tag, $search, $startingAt){
        $startingAt = (typeof $startingAg == 'undefined') ? 0 : $startingAt;
        if(typeof $search == 'undefined') return $text;
        
        if($text.search($search) < $startingAt) return $text;
        let lResult = $text;
        let lMatchText = $text.match($search)[0];
        let lTagWrap = '<' + $tag + '>' + lMatchText + '</' + $tag + '>';
        
        lResult = $text.replace($search, lTagWrap);
        
        return lResult;
    }
}])


function $lateBind($callback){
    let $scope = {
        __callback : $callback
    };

    $scope.resolve = function(...$params){
        $scope.__callback
    }

    $scope.then = function($listener){
        $scope.__callback($listener);
    }

    return $scope;
}

findProperty = function($source, $path){
    let lPathParts = $path.split('.');
    let lCursor = $source;
    let lResult = null;
    lPathParts.forEach($e => {
        //console.log(lCursor, $e);
        if(typeof lCursor[$e] != 'undefined'){
            lCursor = lCursor[$e];
            lResult = lCursor;
        }
        else{
            lResult = null;
        }
    });

    return lResult;
}