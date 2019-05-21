/* ------------------------------- 
        FACTORIES
-------------------------------- */
siApp
.factory('$siTemplate', ["$http", "$q", "$interpolate", "$sce", 
function $siTemplate($http, $q, $interpolate, $sce){
        let $scope = {};

        $scope.load = function($path, $template_scope){
            let templateUrl = $sce.getTrustedResourceUrl(siCtx.base_path + $path);
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

siApp
.factory('$siApi', ["$http","$q","$siConfig","$rootScope", 
function $siApi($http,$q,$siConfig,$rootScope){
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
            //$scope.renewToken().then(function(){
                $scope.call($path, $data, $options).then(function($result){
                    $resolve($result);
                });
            //});
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
            let lStoredToken = sessionStorage.getItem('si.auth_token');
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
            $resolve();
        });

        return lPromise;
    }

    $scope.getDefaultDataView = function(){
        let lPromise = $q(function($resolve, $reject){
            $siConfig.get().then(function($config){
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
            $siConfig.get().then(function($configs){
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
        let lEndPoint = ''.concat('view/',$view_id,'/',siApiSettings.locale);
        
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
        const lApiRoot = siApiSettings.api_root.replace(/\/+$/,'');

        $options = angular.merge({
            url     : lApiRoot + '/api/' + $path,
            method  : (typeof($data)=='undefined' || $data==null) ? 'GET' : 'POST',
            data : $data
        }, $options);


        if($options.method=='GET'){
            if($options.data!=null){
                $options.params = $options.data;
                $options.data = null;
            }
        }
        // if(typeof $options.params == 'undefined'){$options.params = {};}
        // $options.params.at = $scope.auth_token.key;

        // Setup promise object
        let lPromise = $q(function($resolve, $reject){
            // add auth data
            $siConfig.get().then($configs => {
                $options.headers = {
                    'x-si-account'      : $configs.account_id,
                    'x-si-api'          : $configs.api_key,
                    'x-si-appId'        : $configs.app_id,
                    'x-si-appVersion'   : $configs.app_version
                }

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
                
            })
        });

        return lPromise;
    }

    $scope.rest_call = function($path, $data, $options){
        $options = angular.merge({
            url     : siApiSettings.rest_root + 'si/' + $path,
            method  : (typeof($data)=='undefined' || $data==null) ? 'GET' : 'POST',
            data : $data,
            headers: {
                'X-WP-Nonce': siApiSettings.nonce
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

siApp
.factory('$siDictionary', 
function $siDictionary(){
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
        //console.log('siDictionary array sorted', lCollArray);
        
        // turn array back to collection
        let lResult = $scope._toObject(lCollArray);

        //console.log('siDictionary sorted collection', lResult);
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

siApp
.factory('$siUtils', ['$siDictionary', '$siTemplate', '$interpolate' , '$sce', '$siConfig',
function $siUtils($siDictionary,$siTemplate, $interpolate, $sce,$siConfig){
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
        return $siDictionary.getCaption($key,$domain,$asAbbr);
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
                let lUnit = $siDictionary.getCaption($dimension.unit_code,'dimension_unit',true);
                lResult = '{0}{2} x {1}{2}'.format($dimension.width,$dimension.length, lUnit);
            }
            else if (typeof $dimension.area != undefined){
                let lUnit = $siDictionary.getCaption($dimension.area_unit_code,'dimension_unit',true);
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
        $scope.item = angular.copy($item);
        
        siCtx[$type + '_routes'].forEach(function($r){
            if($r.lang==siCtx.locale){
                lRoute=$r;
            }
        });

        let lMandatoryLocationData = ['country','province','region','city'];
        
        if($scope.item.location){
            lMandatoryLocationData.forEach($d => {
                if(typeof $scope.item.location[$d] == 'undefined'){
                    $scope.item.location[$d] = ('other ' + $d).translate();
                }
            })
        }

        let lResult = $scope.sanitize('/' + $siTemplate.interpolate(lRoute.route, $scope));
        
        // check if permalink overrides is allowed
        if($siConfig._data.enable_custom_page){  
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
            $item.license_type = $siDictionary.getCaption($item.license_type_code, 'broker_license_type');
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
            if($item.ref_number){
                lResult.push('ref-' + $item.ref_number);
            }

            if($item.license){
                lResult.push('license-' + $item.license.toLowerCase());
            }

            if($item.license_type_code){
                lResult.push('license-type-' + $scope.sanitize($item.license_type_code));
            }

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
    $scope.sanitize = function($value, $useCamelCase){
        if(typeof $value == 'undefined') return '-';
        $useCamelCase = typeof $useCamelCase == 'undefined' ? false: $useCamelCase;

        let lResult = $value.toLowerCase();
        lResult = lResult.replace(/(\s|\+)/gm, '-');
        lResult = lResult.replace(/('|"|\(|\))/gm, '');
        lResult = lResult.replace(/(é|è|ë|ê)/gm, 'e');
        lResult = lResult.replace(/(à|â|ä)/gm, 'a');
        lResult = lResult.replace(/(ì|î|ï)/gm, 'i');
        lResult = lResult.replace(/(ù|û|ü)/gm, 'u');
        lResult = lResult.replace(/(ò|ô|ö)/gm, 'o');
        lResult = lResult.replace(/\./gm, '');

        if($useCamelCase){
            lResult = lResult.split('-').map(($e,$i) => { 
                if($i==0) return $e;
                return $e[0].toUpperCase() + $e.substr(1);
            }).join('');
        }

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

siApp
.factory('$siConfig',['$http','$q',
function $siConfig($http, $q){
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
                    $http.get(siCtx.config_path).then(function($response){
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
]);

siApp
.factory('$siHooks', ['$q', 
function $siHooks($q){
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

siApp
.factory('$siFavorites', ['$q', 
function $siFavorites($q){
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
}]);

siApp
.factory('$siShare', ['$q','$siHooks','$siUtils', 
function siShare($q,$siHooks,$siUtils){
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

        $scope.data = $siHooks.filter('si.share.data',$scope.data);
        if($scope.data.url != null && $scope.data.url_timed==null){   
            $scope.data.url_timed = $siUtils.appendToUrlQuery($scope.data.url, 't', moment().valueOf());
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


siApp
.factory('$siFilters', ['$q','$siApi','$siUtils', 
function $siFilters($q,$siApi,$siUtils){
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
                    //$fm.trigger('filterTokenChanged');
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
            let lKey = 'si.' + $fm.alias + '.{0}';

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
                    
                    if($fm.sort_fields.length > 0 && $fm.sort_fields.filter($f => $f.field!='').length > 0){
                        lResult.sort_fields = $fm.sort_fields.filter($f => $f.field!='');
                    }
                    else if($configs.sort != 'auto' && $configs.sort != ''){
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
                    console.log('getting new token', lResult);

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
            let lListArray = $siUtils.toArray($list);
            
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
            
            let lKey = 'si.' + $fm.alias + '.{0}';
            
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
            let lKey = 'si.' + $fm.alias + '.{0}';

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
            $key = 'si.' + $fm.alias + '.{0}';
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
            // $filters.sort_fields = $filters.sort_fields.filter($sf => $sf.field!='');
            // if($filters.sort_fields.length == 0) delete $filters.sort_fields;

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