/**
 * Global - Controller
 */

siApp
.controller('publicCtrl', 
function publicCtrl($scope,$rootScope,$siDictionary, $siUtils,$siHooks,$siConfig){
   


    $scope.model = null;
    $scope.broker_count = 0;
    $scope.listing_count = 0;
    $scope.statics = {
        isNullOrEmpty: function($value) {return $value==null || $value == '' || $value.length == 0}
    };


    $scope.init = function(){
        //console.log('publicCtrl/init');

        if( document.readyState !== 'loading' ) {
            console.log('publicCtrl/init :: ready');
            $rootScope.$broadcast('si/ready');
        } 
        else {
            document.addEventListener('DOMContentLoaded', function(){
                console.log('publicCtrl/init :: ready');
                $rootScope.$broadcast('si/ready');
            });
        }

        window.onload = function(){
            console.log('publicCtrl/init :: load');
            $rootScope.$broadcast('si/load');
        }
        
        $siConfig.get().then(function($configs){
            $scope.configs = $configs;
            
        });
    }

    // listingsUpdate
    $scope.$on('si-listings-update', function($event, $list, $meta){  
        $scope.listing_count = $siHooks.filter('listing_count', $meta.item_count);
    });

    // brokersUpdate
    $scope.$on('si-brokers-update',function(ev, $list, $meta){
        $scope.broker_count = $siHooks.filter('broker_count', $meta.item_count);
    });

    // Static data
    $scope.$on('si-static-data', function($event, $configs, $data){
        
        $scope.addStatic($configs.alias, $data);

        //console.log($scope.statics);
    });

    $scope.addStatic = function($alias, $data){
        const lStatic = {
            _data: $data
        };

        const lVarName = $siUtils.sanitize($alias,true);
        const lSanitizedName = $siUtils.sanitize($alias);

        lStatic.getClasses = function(){
            const lClasses = [];
            if(lStatic._data == null || lStatic._data == '' || lStatic._data.length ==0) lClasses.push('empty');

            return lClasses.map(function($e) {return lSanitizedName + '-' + $e}).join(' ');
        }

        $scope.statics[lVarName] = lStatic;
    }

    /**
     * Shorthand to $siDictionary.getCaption
     * See $siDictionary factory for details
     * @param {string} $key 
     * @param {string} $domain 
     * @param {string} $asAbbr 
     */
    $scope.getCaption = function($key, $domain, $asAbbr){
        return $siDictionary.getCaption($key, $domain, $asAbbr);
    }

    /**
     * Shorthand to $siUtils.formatPrice
     * See $siUtils factory for details
     * @param {object} $item 
     */
    $rootScope.formatPrice = function($item){
        return $siUtils.formatPrice($item);
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
        angular.element(document.body).addClass('si-modal-open');
    });

    $scope.$on('modal-closed', function(){
        angular.element(document.body).removeClass('si-modal-open');
    });

});

/**
 * Static Data - Controller
 */
siApp
.controller('staticDataCtrl', 
function staticDataCtrl($scope, $rootScope,$siDictionary, $siUtils,$siHooks,$element){
    $scope.init = function($alias){
        const $configs = $statics[$alias].configs;
        const $data = $statics[$alias].data;
        

        $scope.$emit('si-static-data', $configs, $data);
    }
})

/**
 * Listing Detail - Controller
 */
siApp
.controller('singleListingCtrl', 
function singleListingCtrl(
        $scope,$rootScope,$element, $q,$siApi, $siDictionary, $siUtils,$siConfig, $sce, 
        $siHooks,$siFavorites,$siShare, $siCompiler){
    // model data container - listing
    $scope.model = null;
    $scope.permalinks = null;
    $scope.configs = null;
    
    
    // ui - media tabs selector
    $scope.selected_media = 'pictures';
    // calculator result
    $scope.calculator_result = {};
    // message model
    $scope.message_model = {};
    $scope.favorites = $siFavorites;
    $scope.linkTypes = [
        {key: 'website', label : 'More infos'.translate()},
        {key: 'virtual_tour', label: 'Virtual tour'.translate()}
    ];

    /**
     * Initialize controller
     * @param {string} $ref_number Listing reference key
     */
    $scope.init = function($ref_number, $add_loading_text, $loading_text){
        if($add_loading_text){
            const lLoadingTextElement = document.createElement('div');
            lLoadingTextElement.classList.add('si');
            lLoadingTextElement.classList.add('listing-single');
            lLoadingTextElement.innerHTML = '<label class="placeholder">' + $loading_text + ' <i class="fal fa-spinner fa-spin"></i></label>';
            $element[0].parentElement.append(lLoadingTextElement);
            $scope.$loadingElement = lLoadingTextElement;
        }

        if($ref_number != undefined){
            //console.log($ref_number);
            $scope.fetchPrerequisites().then(function($prerequisits){
                $scope.permalinks = $prerequisits;
                return $scope.loadSingleData($ref_number);
            })
            .then(function(){
                if($scope.$loadingElement === undefined) return;
                //$scope.$loadingElement.remove();
                $scope.$loadingElement.parentElement.removeChild($scope.$loadingElement);
                $element[0].style.removeProperty('display');
            });
        }

        //$timeout(function(){
            //const lElement = document.querySelector('.si.listing-single');
            
    
        //})
        
        // if($add_wrapper_element){
        //     const lElement = document.querySelector('.si.listing-single');
        //     const lWrapper = document.createElement('div');
        //     lWrapper.classList.add('si-content');

        // }
    }

    $scope.fetchPrerequisites = function(){
        let lPromise = $q(function($resolve, $reject){
            $q.all([
                $siConfig.get()
            ]).then(function($results){
                $scope.configs = $results[0];

                $resolve({
                    brokers: $scope.configs.broker_routes,
                    listings: $scope.configs.listing_routes
                })
            });

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
            if(typeof(siListingData)!='undefined'){
                $resolve(siListingData);
            }
            else{
                
                $siApi.getDefaultDataView().then(function($view){
                    // Load listing data from api
                    
                    $siApi.api("listing/view/{0}/{1}/items/ref_number/{2}".format($view,siApiSettings.locale,$ref_number)).then(function($data){
                        $resolve($data);
                    });
                });
            }

        });


        lPromise.then(function($data){
            $scope.model = $data;
            // set dictionary source
            $siDictionary.source = $data.dictionary;
            // start preprocessing of data
            $siDictionary.onLoad().then(function(){
                $scope.preprocess();
            })
            
            
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
            $siHooks.do('listing-message-model-post-process',$scope.message_model);

            $siHooks.do('listing-ready',$scope.model);
            $siHooks.addFilter('si.share.data',$scope.setShareData);

            $rootScope.$broadcast('si/model:ready');
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
        $scope.model.location.district  = $scope.getCaption($scope.model.location.district_code, 'district');
        $scope.model.category           = $scope.getCaption($scope.model.category_code, 'listing_category');
        $scope.model.subcategory        = $scope.getCaption($scope.model.subcategory_code, 'listing_subcategory');
        $scope.model.available_area_unit= $scope.getCaption($scope.model.available_area_unit_code, 'dimension_unit',true);

        $scope.model.addendum           = ($scope.model.addendum) ? $scope.model.addendum.trim() : null;

        $scope.model.legal_notes        = $scope.model.legal_note_codes != undefined 
                                            ? $scope.model.legal_note_codes.map(function($code){
                                                return {
                                                    code: $code,
                                                    caption: $scope.getCaption($code,'legal_note')
                                                }
                                            })
                                            : null;
        
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

            if(!isNullOrEmpty($scope.model.location.address.door) && typeof  $scope.model.location.address.door != 'undefined'){
                $scope.model.location.full_address += ', ' + 'apt. {0}'.translate().format( $scope.model.location.address.door);
            }
        }
        else{
            $scope.model.location.full_address = $scope.model.location.city;
        }
        
        
        $scope.model.building.attributes = [];
        $scope.model.land.attributes = [];
        $scope.model.other = {attributes : []};
        $scope.model.important_flags = [];
        $scope.model.long_price = $siUtils.formatPrice($scope.model,'long');
        $scope.model.short_price = $siUtils.formatPrice($scope.model);
        
        // from main unit
        let lMainUnit = $scope.model.units.find(function($u){return $u.category_code=='MAIN'});
        if(lMainUnit!=null){
            if(lMainUnit.bedroom_count) $scope.model.important_flags.push({icon: 'bed', value: lMainUnit.bedroom_count, caption:'Bedroom'.translate()});
            if(lMainUnit.bathroom_count) $scope.model.important_flags.push({icon: 'bath', value: lMainUnit.bathroom_count, caption: 'Bathroom'.translate()});
            if(lMainUnit.waterroom_count) $scope.model.important_flags.push({icon: 'hand-holding-water', value: lMainUnit.waterroom_count, caption: 'Water room'.translate()});
        }

        if($scope.model.available_area){
            const lAvailableAreaStr = $scope.model.available_area + ' ' + $scope.model.available_area_unit;
            $scope.model.important_flags.push({icon: 'vector-square',value: lAvailableAreaStr , caption: 'Available area'.translate() })
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
            const lBuildingCodes = ['CUPBOARD','WINDOWS','WINDOW TYPE','ROOFING','FOUNDATION','GARAGE','SIDING','BATHR./WASHR','BASEMENT','EASY ACCESS'];
            const lLotCodes = ['LANDSCAPING','DRIVEWAY','PARKING','POOL','TOPOGRAPHY','VIEW','ZONING','PROXIMITY'];
            const lOtherCodes = ['HEATING SYSTEM','HEATING ENERGY','HEART STOVE','WATER SUPPLY','SEWAGE SYST.','EQUIP. AVAIL'];
            if(lBuildingCodes.includes($e.code)){
                $scope.model.building.attributes.push($e);
            }
            // Lot
            else if(lLotCodes.includes($e.code)){
                $scope.model.land.attributes.push($e);
            }
            // other
            else if(![].concat(lBuildingCodes, lLotCodes).includes($e.code)){
                $scope.model.other.attributes.push($e);
            }

            if($e.code=='PARKING'){
                let lParkingCount = 0;
                $e.values.forEach(function($v){lParkingCount += $v.count;});
                if(lParkingCount > 0) $scope.model.important_flags.push({icon: 'car', value: lParkingCount, caption: $e.caption});
            }
            if($e.code=='POOL'){
                $scope.model.important_flags.push({icon: 'swimmer', value: null, caption: $e.caption});
            }
            if($e.code=='HEART STOVE'){
                $scope.model.important_flags.push({icon: 'fire', value: null, caption: $e.caption});
            }
        });

        // units
        $scope.model.units.forEach(function($u){
            $u.category = $siDictionary.getCaption({src:$u,key:'category_code'},'unit_category');
            $u.flags = [];
            if($u.room_count) $u.flags.push({icon: 'door-open', value: $u.room_count, caption: 'Rooms'.translate()});
            if($u.bedroom_count) $u.flags.push({icon: 'bed', value: $u.bedroom_count, caption: 'Bedrooms'.translate()});
            if($u.bathroom_count) $u.flags.push({icon: 'bath', value: $u.bathroom_count, caption: 'Bathrooms'.translate()});
        });

        // expenses
        $scope.model.expenses.forEach(function($ex){
            $ex.type = $siDictionary.getCaption({src:$ex, key:'type_code'},'expense_type');
        });

        // incomes
        $scope.model.incomes.forEach(function($ex){
            $ex.type = $siDictionary.getCaption({src:$ex, key:'type_code'},'income_type');
        });

        // documents
        $scope.model.documents.forEach(function($doc){
            $doc.category = $siDictionary.getCaption({src:$doc, key:'category_code'},'document_category');
        });

        // rooms
        $scope.model.rooms.forEach(function($r){
            $r.category = $siDictionary.getCaption({src:$r, key:'category_code'},'room_category');
            $r.level_category = $siDictionary.getCaption({src:$r, key: 'level_category_code'}, 'level_category');
            $r.short_dimension = $siUtils.formatDimension($r.dimension);
            let lRoomInfos = [];
            $r.flooring = $siDictionary.getCaption({src:$r, key: 'flooring_code'},'flooring');
        });

        // trusted src
        if($scope.model.virtual_tour != undefined){
            $scope.model.virtual_tour.trusted_url = $sce.trustAsResourceUrl($scope.model.virtual_tour.url.replace('http:',''));
        }
        if($scope.model.video != undefined){
            let lEmbedVideo = $scope.model.video.url;
            const lEmbedFormatFn = {
                youtube : function(){ return '//www.youtube.com/embed/{0}?rel=0&showinfo=0&enablejsapi=1&origin=*'.format($scope.model.video.id);},
                vimeo   : function(){ return '//player.vimeo.com/video/{0}'.format($scope.model.video.id);}
            }
            if(typeof lEmbedFormatFn[$scope.model.video.type] == 'function'){
                lEmbedVideo = lEmbedFormatFn[$scope.model.video.type]();
            }
            
            $scope.model.video.trusted_url = $sce.trustAsResourceUrl(lEmbedVideo);
        }

        $scope.model.permalink = window.location.pathname;
        $siCompiler.compileBrokerList($scope.model.brokers);
        
        //console.log('permalink', $scope.model.permalink);
        $siHooks.do('single-listing-preprocess', $scope.model);
    }

    $scope.getBrokerListFilter = function(){
        if($scope.model == null) return null;
        if($scope.broker_list_filter != undefined) return $scope.broker_list_filter;

        const lBrokerIds = $scope.model.brokers_ref_numbers || $scope.model.brokers.map(function($e) {return $e.ref_number});

        $scope.broker_list_filter = {
            field: 'ref_number',
            operator: 'in',
            value : lBrokerIds
        };
        return $scope.broker_list_filter;

    }
    

    $scope.setShareData = function($data){
        $data.description = $scope.model.description;
        $data.media = $scope.model.photos[0].source_url;
        //console.log('set share data',$data);
        return $data;
    }

    /**
     * Fallback method for standalone accordion section
     * @param {string} $sectionName 
     */
    $scope.isAvailableSection = function($sectionName){
        return true;
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

        let lSent = $siHooks.do('single-listing-send-message', $scope.message_model);
        
        //console.log(lSent);

        if(lSent!==true){
            let lDestEmails = $scope.model.brokers.map(function($e) {return $e.email});
            lDestEmails = $siHooks.filter('single-listing-message-emails', lDestEmails, $scope.model.brokers);
            
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

            $siApi.rest('message', {params:lMessage}).then(function($response){
                $scope.request_sent = true;
                
            })
        }
    }

    $scope.print = function(){
        // reformat permalink to match print
        const lSegmentToKeep    = 1 + ( siCtx.use_lang_in_path ? 1 : 0 );
        const lPermalinkParts   = $scope.model.permalink.split('/')
                                                        .filter(function($p){
                                                            return $p != '';
                                                        });
        const lPrintLink = lPermalinkParts
            .filter(function($e,$i){
                return $i<lSegmentToKeep;
            });
        
        lPrintLink.push('print');
        const lPrintLinkFinal = '/' + lPrintLink.join('/') + '/' + lPermalinkParts[lPermalinkParts.length - 1] + window.location.search;
        //console.log('print', lPrintLinkFinal);
        window.open(lPrintLinkFinal);
    }

    $scope.hasDimension = function($dimension){
        return $siUtils.hasDimension($dimension);
    }

    $scope.shareTo = function($social_media){
        $siShare.execute($social_media);
    }

    $scope.hasListOf = function($type){
        //console.log($scope.configs);
        return $scope.configs.lists.some(function($l){
            return $l.type == $type;
        })
    }

    $scope.allowCalculator = function(){
        if($scope.model == null) return false;
        if($scope.model.status_code=='SOLD') return false;
        if($scope.model.price.sell==undefined) return false;
        if($scope.model.price.sell.unit_code == 'SF') return false;

        return true;
    }

    $scope.allowFavorites = function(){
        if($scope.model == null) return false;
        if($scope.configs == null) return false;
        
        
        return !isNullOrEmpty($scope.configs.favorites_button_menu);
    }
});


/**
 * Broker Detail - Controller
 */
siApp
.controller('singleBrokerCtrl', 
function singleBrokerCtrl($scope,$element,$q,$siApi,$siCompiler, $siDictionary, $siUtils,$siConfig,$siHooks){
    $scope.filter_keywords = '';
    $scope.message_model = {};

    // model data container - broker
    $scope.model = null;
    $scope.permalinks = null;

    // message model
    $scope.message_model = {};

    /**
     * Initialize controller
     * @param {string} $ref_number broker reference key
     */
    $scope.init = function($ref_number,$add_loading_text, $loading_text){
        if($add_loading_text){
            const lLoadingTextElement = document.createElement('div');
            lLoadingTextElement.classList.add('si');
            lLoadingTextElement.classList.add('broker-single');
            lLoadingTextElement.innerHTML = '<label class="placeholder">' + $loading_text + ' <i class="fal fa-spinner fa-spin"></i></label>';
            $element[0].parentElement.append(lLoadingTextElement);
            $scope.$loadingElement = lLoadingTextElement;
        }

        if($ref_number != undefined){
            //console.log($ref_number);
            $scope.fetchPrerequisites().then(function(){
                return $scope.loadSingleData($ref_number);
            })
            .then(function(){
                if($scope.$loadingElement === undefined) return;
                $scope.$loadingElement.parentElement.removeChild($scope.$loadingElement);

                $element[0].style.removeProperty('display');
            })
            .then(function(){
                $scope.$on('si-list-loaded', function($event, $type,$list){
                    //console.log('si-list-loaded', $type, $list);
                    if($type == 'listings'){
                        $siConfig.get().then(function($configs){
                            const lHasCityPage = $configs.city_layouts
                                                        .filter(function($c){ return $c.lang == siApiSettings.locale; })
                                                        .some(function($c){ return $c.page != null; });
                            if(!lHasCityPage) return;
                            
                            const lCities = [];
                            $list.forEach( function($l) {
                                const lCity = lCities.find( function($c){
                                    return $c.ref_number == $l.location.city_code;
                                });
                                if(lCity == null){
                                    const lNewCity = {
                                        ref_number:$l.location.city_code,
                                        name: $l.location.city,
                                        listing_count: 1,
                                        location: $l.location
                                    };
                                    
                                    $siCompiler.compileCityItem(lNewCity);
                                    lCities.push( lNewCity);
                                }
                                else{
                                    lCity.listing_count++;
                                }
                            });
    
                            $scope.cities = lCities;
                            
                                
                        })
                    }
                })
            });
            
            
        }
    }

    $scope.fetchPrerequisites = function(){
        let lPromise = $q(function($resolve, $reject){
            $siConfig.get().then(function($configs){
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
            if(typeof(siBrokerData)!='undefined'){
                $resolve(siBrokerData);
            }
            else{
                $siApi.getDefaultDataView().then(function($view){
                    // Load broker data from api
                    //console.log($view);
                    $siApi.api("broker/view/{0}/{1}/items/ref_number/{2}".format($view,siApiSettings.locale,$ref_number)).then(function($data){
                        $resolve($data);
                    });
                });
            }

        });

        lPromise.then(function($data){
            $scope.model = $data;
            // set dictionary source
            $siDictionary.init($data.dictionary);
            // start preprocessing of data
            $scope.preprocess();
            // prepare message subject build from data
            //$scope.message_model.subject = 'Request information for : {0} ({1})'.translate().format($scope.model.location.full_address,$scope.model.ref_number);
            // print data to console for further informations
            //console.log($scope.model);
        });
    }

    // TODO: Late listing loading
    $scope.loadListings = function(){
        if($scope.listings == null){
            $siApi.getDefaultDataView().then(function($view){
                const $filters = {
                    filter_group : {
                        filters: [
                            {field : "brokers", operator: 'in', value: [$scope.model.id]}
                        ]
                    }
                }
                $siApi.api('utils/search_encode', $filters).then(function($response){
                    $resolve($response);
                });
            })
        }
    }

    /**
     * Preprocess data information to create shortcut, icon list and groups
     */
    $scope.preprocess = function(){
        // set basic information from dictionary
        $scope.model.license_type = $scope.getCaption($scope.model.license_type_code,'broker_license_type');
        //$scope.model.languages    = 'N/A'.translate();
        let lExpertises           = [];
        $scope.model.listings.forEach(function($e,$i,$arr){
            let lNewItem = $scope.getCaption($e.category_code, 'listing_category');
            if(lExpertises.indexOf(lNewItem)<0){
                lExpertises.push(lNewItem);
            }
    
        });
        $scope.model.expertises = lExpertises.join(', ');
        $scope.list = $scope.model.listings;
        $scope.model.photo = $scope.model.photo != null ? $scope.model.photo : {url: siCtx.base_path + 'styles/assets/shadow_broker.jpg'};

        // office
        $siCompiler.compileOfficeItem($scope.model.office);
        
        $scope.model.location = $scope.model.office.location;
        $siCompiler.compileListingList($scope.model.listings);           
    }

    $scope.getPhoneIcon = function($key){
        $siUtils.getPhoneIcon($key);
    }

    $scope.filterListings = function($listing){
        
        if($scope.filter_keywords==undefined || $scope.filter_keywords==''){
            return true;
        }
        let lLowerKeyword = $scope.filter_keywords.toLowerCase();
        let lNumKeyword = Number($scope.filter_keywords);

        let lStringContentChecks = ['description','subcategory','category','location.city', 'location.address.street_name', 'ref_number'];
        let lNumContentChecks = ['price.sell.amount', 'price.lease.amount'];

        if(lStringContentChecks.some(function($e) {
            let lValue = findProperty($listing,$e);
            if(lValue != null && lValue.toLowerCase().indexOf(lLowerKeyword) >=0){
                return true;
            }
        })){
            return true;
        };
        
        if(lNumContentChecks.some(function($e){
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

    // /**
    //  * Check if a section is opened
    //  * @param {string} $section Section key
    //  */
    // $scope.sectionOpened = function($section){
    //     return $scope.sections[$section].opened;
    // }
    // /**
    //  * Toggle section open/close
    //  * @param {string} $section Section key
    //  */
    // $scope.toggleSection = function($section){
    //     $scope.sections[$section].opened = !$scope.sections[$section].opened;
    // }

    /**
     * Event handler for Mortgage Calculator onChange
     * @param {number} $calculatorResult Result that comes out of the calculator
     */
    $scope.onMortgageChange = function($calculatorResult){
        // save result
        $scope.calculator_result = $calculatorResult;
    }

    /**
    * Shorthand to $siUtils.getClassList
    * see $siUtils factory for details
    * @param {object} $item Listing item data
    */
    $scope.getClassList = function($item){
        let lResult = $siUtils.getClassList($item);
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

        let lSent = $siHooks.do('single-broker-send-message', $scope.message_model);

        if(lSent!==true){
            let lDestEmails = $scope.model.email;
            lDestEmails = $siHooks.filter('single-broker-message-emails', lDestEmails, $scope.model);
            
            lMessage = {
                type: 'broker_message',
                destination: lDestEmails,
                data: $scope.message_model
            }

            $siApi.rest('message', {params:lMessage}).then(function($response){
                $scope.request_sent = true;
            })
        }
    }

    /**
     * Send message to broker via API
     */
    $scope.validateMessage = function(){
        
    }

    
    $scope.getPhoneIcon = function($key){
        return $siUtils.getPhoneIcon($key);
    }
});


/**
 * Office Detail - Controller
 */
siApp
.controller('singleOfficeCtrl', 
function singleOfficeCtrl($scope,$q,$siApi, $siDictionary, $siUtils,$siConfig,$siHooks){

    // model data container - office
    $scope.model = null;

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
            $siConfig.get().then(function($configs){
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
            if(typeof(siBrokerData)!='undefined'){
                $resolve(siBrokerData);
            }
            else{
                $siApi.getDefaultDataView().then(function($view){
                    // Load broker data from api
                    //console.log($view);
                    $siApi.api("office/view/{0}/{1}/items/ref_number/{2}".format($view,siApiSettings.locale,$ref_number)).then(function($data){
                        $resolve($data);
                    });
                });
            }

        });

        lPromise.then(function($data){
            $scope.model = $data;
            // set dictionary source
            $siDictionary.source = $data.dictionary;
            // start preprocessing of data
            $scope.preprocess();
            // prepare message subject build from data
            //$scope.message_model.subject = 'Request information for : {0} ({1})'.translate().format($scope.model.location.full_address,$scope.model.ref_number);
            // print data to console for further informations
            //console.log($scope.model);
        });
    }

    $scope.getPhoneIcon = function($key){
        return $siUtils.getPhoneIcon($key);
    }

    $scope.preprocess = function(){
        $siCompiler.compileOfficeItem($scope.model);
    }
});