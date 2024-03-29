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
.factory('$siApi', ["$http","$q","$siConfig","$rootScope","$siUtils",
function $siApi($http,$q,$siConfig,$rootScope,$siUtils){
    let $scope = {};
    
    $scope.viewMetas = {};
    $scope._cache = [];

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
                $scope.call($path, $data, $options)
                .then(
                    function success($result){
                        $resolve($result);
                    },
                    function rejected(){
                        $reject();
                    }
                );
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
        if($siUtils.search().view != undefined){
            return $q.resolve($siUtils.search().view);
        }

        let lPromise = $q(function($resolve, $reject){
            $siConfig.get().then(function($config){
                if($config.default_view.indexOf('{')>=0){
                    $resolve(JSON.parse($config.default_view).id);
                }
                else{
                    $resolve($config.default_view);
                }
            });
        });

        return lPromise;
    }

    $scope.getViewDictionary = function($view_id, $lang){
        let lPromise = $q(function($resolve, $reject){
            $scope.call('view/' + $view_id + '/' + $lang).then(function($response){
                $resolve($response.dictionary);
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
    $scope.getViewMeta = function($type, $view_id, $fallback_view_id){
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
            if($scope.viewMetas[lViewMetaKey] != undefined && $scope.viewMetas[lViewMetaKey].loading===undefined){
                //console.log('view meta is already loaded',lViewMetaKey);
                $resolve($scope.viewMetas[lViewMetaKey]);
            }
            // View is currently loading, wait for data
            else if ($scope.viewMetas[lViewMetaKey] != undefined && $scope.viewMetas[lViewMetaKey].loading==true){
                //console.log('view meta is already loading',lViewMetaKey);
                let fnWait = function(){
                    //console.log('waiting...');
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
                //console.log('view meta get infos',lViewMetaKey);
                $scope.viewMetas[lViewMetaKey] = {loading:true};
                $scope.api(lEndPoint)
                    .then(
                        function success($response){
                            $scope.viewMetas[lViewMetaKey] = $response;
                            $resolve($response);
                        },
                        function rejected($err){
                            $reject($err);
                        }
                    )
                    .catch(function($err){
                        //console.log('can\'t view', lViewMetaKey);
                        
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
        const lQueryHash = $siUtils.hash($options);

        // Check in cached responses
        const lCached = $scope.getCachedResult(lQueryHash);
        if(lCached != null) return $q.resolve(lCached);
        // Check in pending query
        const lPending = $scope.getPending(lQueryHash);
        if(lPending != null) return lPending.defered.promise;
        
        $rootScope.$broadcast('$siApi/call/start');

        // Setup promise object
        let lPromise = $q(function($resolve, $reject){
            // add auth data
            $siConfig.get().then(function($configs){
                
                const headers = {
                    'x-si-account'      : $configs.account_id,
                    'x-si-api'          : $configs.api_key,
                    'x-si-appId'        : $configs.app_id,
                    'x-si-appVersion'   : $configs.app_version,
                    //'acc'               : $configs.account_id,
                    //'api'               : $configs.api_key,
                }

                $options.headers = headers;
                //$options.url = $options.url + ($options.url.indexOf('?')>0 ? '&' : '?') + Object.keys(headers).filter($k => !$k.startsWith('x-')).map($k => $k + '=' + headers[$k]).join('&');

                
                $scope.addPending(lQueryHash);
                
                $http($options)
                .then(
                    // On success
                    function success($result){
                        if($result.status=='200'){
                            $scope.cacheQuery(lQueryHash,$result.data);

                            $resolve($result.data);
                            
                            $scope.executePendings(lQueryHash, $result.data);

                            $rootScope.$broadcast('$siApi/call/completed');
                        }
                        else{
                            $reject(null);
                        }
                    },
                    // On fail
                    function fail($error){
                        //console.log($error);
                        $reject($error);
                    }
                )
                .catch(function($err){
                    $reject($err)
                })
                
            })
        });

        return lPromise;
    }

    $scope.rest_call = function($path, $data, $options){

        $options = angular.merge({
            url     : siApiSettings.rest_root + 'si-rest/' + $path,
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


    //#region Call Pending Management
    $scope._queryPendings = [];
    $scope.getPending = function($hash){
        return  $scope._queryPendings.find($q => $q.hash == $hash);
    }

    $scope.addPending = function($hash){
        //console.log('$siApi/addPending',$hash);
        const lDefered = $q.defer();
        $scope._queryPendings.push({hash: $hash, defered: lDefered});
        return lDefered.promise;
    }

    $scope.executePendings = function($hash, $data){
        $scope._queryPendings
            .filter($q => $q.hash == $hash)
            .forEach($q => {
                //console.log('$siApi/executePendings@resolving',$hash);
                $q.defered.resolve($data);
            });

        $scope._queryPendings = $scope._queryPendings.filter($q => $q.hash != $hash);
    }


    //#endregion


    $scope.cacheQuery = function($hash,$result){
        //const lHash = $siUtils.hash($queryOptions);
        $scope._cache.push({hash: $hash, value: $result});
        if($scope._cache.length > 20){
            $scope._cache.shift();
        }
    }

    $scope.getCachedResult = function($hash){
        //const lHash = $siUtils.hash($queryOptions);
        const lResult = $scope._cache.find(function($c){
            return $c.hash == $hash;
        });

        if(lResult == null) return null;
        return lResult.value;
    }


    /**
    * Secure Hash Algorithm (SHA1)
    * http://www.webtoolkit.info/
    **/
    $scope.SHA1 = function(msg) {
        function rotate_left(n, s) {
            var t4 = (n << s) | (n >>> (32 - s));
            return t4;
        };
        function lsb_hex(val) {
            var str = '';
            var i;
            var vh;
            var vl;
            for (i = 0; i <= 6; i += 2) {
                vh = (val >>> (i * 4 + 4)) & 0x0f;
                vl = (val >>> (i * 4)) & 0x0f;
                str += vh.toString(16) + vl.toString(16);
            }
            return str;
        };
        function cvt_hex(val) {
            var str = '';
            var i;
            var v;
            for (i = 7; i >= 0; i--) {
                v = (val >>> (i * 4)) & 0x0f;
                str += v.toString(16);
            }
            return str;
        };
        function Utf8Encode(string) {
            string = string.replace(/\r\n/g, '\n');
            var utftext = '';
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        };
        var blockstart;
        var i,
            j;
        var W = new Array(80);
        var H0 = 0x67452301;
        var H1 = 0xEFCDAB89;
        var H2 = 0x98BADCFE;
        var H3 = 0x10325476;
        var H4 = 0xC3D2E1F0;
        var A,
            B,
            C,
            D,
            E;
        var temp;
        msg = Utf8Encode(msg);
        var msg_len = msg.length;
        var word_array = new Array();
        for (i = 0; i < msg_len - 3; i += 4) {
            j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 | msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
            word_array.push(j);
        }
        switch (msg_len % 4) {
            case 0: i = 0x080000000;
                break;
            case 1: i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
                break;
            case 2: i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
                break;
            case 3: i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
                break;
        }
        word_array.push(i);
        while ((word_array.length % 16) != 14) 
            word_array.push(0);

        word_array.push(msg_len >>> 29);
        word_array.push((msg_len << 3) & 0x0ffffffff);
        for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
            for (i = 0; i < 16; i++) 
                W[i] = word_array[blockstart + i];
            
            for (i = 16; i <= 79; i++) 
                W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
            
            A = H0;
            B = H1;
            C = H2;
            D = H3;
            E = H4;
            for (i = 0; i <= 19; i++) {
                temp = (rotate_left(A, 5) + ((B & C) | (~ B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }
            for (i = 20; i <= 39; i++) {
                temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }
            for (i = 40; i <= 59; i++) {
                temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }
            for (i = 60; i <= 79; i++) {
                temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }
            H0 = (H0 + A) & 0x0ffffffff;
            H1 = (H1 + B) & 0x0ffffffff;
            H2 = (H2 + C) & 0x0ffffffff;
            H3 = (H3 + D) & 0x0ffffffff;
            H4 = (H4 + E) & 0x0ffffffff;
        }
        var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);

        return temp.toLowerCase();

   }

    return $scope;
}]);


siApp
.factory('$siDictionary',['$q','$rootScope',
function $siDictionary($q,$rootScope){
    let $scope = {};


    $scope.source = null;
    $scope._loadCallbacks = [];

    $scope.init = function($source, $overwrite,$view_id){
        if($scope.source == null){
            $scope.source = $source;
        }
        else if($overwrite === true){
            $scope.source = $source;
        }
        else{
            angular.merge($scope.source, $source);
            //console.log($scope.source);
        }
        
        $scope._loadCallbacks.forEach(function($fn){
            $fn();
        })

        $rootScope.$broadcast('$siDictionary/init',$source,$view_id);

        Object.keys($scope.source).forEach( k => {
            //console.log('broadcasting', k);
            $rootScope.$broadcast('si/dictionary/' + k, $scope.count(k));
        })
        
        //$scope.sortData();
    }

    $scope.onLoad = function(){
        if($scope.source != null){
            return $q.resolve();
        }
        
        const lDeferred = $q.defer();

        $scope._loadCallbacks.push(function(){
            lDeferred.resolve();
        });

        return lDeferred.promise;
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

    $scope.count = function($domain){
        let lResult = 0;
        if($scope.source && $scope.source[$domain]){
            const lDomainKeys = Object.keys($scope.source[$domain]);
            lResult = lDomainKeys.length;
        }
        return lResult
    }

    /** 
     * Get the caption matching key and domain from the dictionary
     * @param {string} $key Key code of the dictionary item
     * @param {string} $domain Group key that (should) hold the item
     * @return {string} Caption matched or the key in case the something's missing or went wrong
     */
    $scope.getCaption = function($key, $domain, $asAbbr){
        if(typeof $key == 'object'){
            return $scope.getCaptionFrom($key.src, $key.key, $domain, $asAbbr);
        }

        let lResult = $key;
        $asAbbr = ($asAbbr==undefined)?false:$asAbbr;

        
        
        if($scope.source && $scope.source[$domain]){
            const lDomainSource = $scope.source[$domain];
            

            if(lDomainSource[$key] != undefined){
                if($asAbbr){
                    lResult = lDomainSource[$key].abbr;
                }
                else{
                    lResult = lDomainSource[$key].caption;
                }
            }
        }

        
        return lResult;
    }

    $scope.getCaptionFrom = function($obj, $key, $domain, $asAbbr){
        let lDictionaryKey = $obj[$key];
        if(lDictionaryKey == '##OTHER##') lDictionaryKey= '_other';

        // when key is defined and starts with an _
        if(lDictionaryKey != undefined && lDictionaryKey.indexOf('_') == 0){ 
            // transform key to match the property where the value will be find
            // Ex.: category_code -> category_other
            const lSrcKey = $key.replace('_code', lDictionaryKey);  
            
            // return the value contained in the new property if it's not null or empty
            if(!isNullOrEmpty($obj[lSrcKey])) return $obj[lSrcKey];
        }

        // Since there was no value in the "other" property, get the regular value from the dictionary
        return $scope.getCaption(lDictionaryKey, $domain, $asAbbr);
    }

    return $scope;
}]);

siApp
.factory('$siLexicon', ['$q','$rootScope', function($q,$rootScope){
    return new SourceImmoLexicon();
}]);

siApp
.factory('$siList', [
  '$siApi','$siDictionary','$rootScope',
  function $siList($siApi,$siDictionary, $rootScope){
    let $scope ={};
    $scope.dictionary = null;
    
    $scope.init = function($view_id){
      //$scope.fetchDictionary($view_id);
        $rootScope.$on('$siDictionary/init', function($event){
            //console.log('$siList/init -> siDictionary:onLoad')
            $scope.dictionary = $siDictionary.source;
        });
    }

    $scope.fetchDictionary = function($view_id){
      
      if($view_id == null) return;

      
      $siApi.rest('dictionary').then(function($response){
        $scope.dictionary = $response;
      });
    }

    $scope.contains = function($value, $list){
        if($list == null) return false;
        if($list.length == 0) return false;

        return $list.some(function($item){
            return $item.key == $value;
        });
    }

    $scope.getCountryList = function(){
      if($scope.dictionary == null) return [];
      return $scope.toArray($scope.dictionary.country);
    }

    $scope.getStateList = function(){
      if($scope.dictionary == null) return [];
      return $scope.toArray($scope.dictionary.state);
    }

    $scope.getRegionList = function(){
      if($scope.dictionary == null) return [];
      return $scope.toArray($scope.dictionary.region);
    }

    $scope.getCityList = function(){
      if($scope.dictionary == null) return [];
      return $scope.toArray($scope.dictionary.city);
    }

    $scope.getCategoryList = function(){
      if($scope.dictionary == null) return [];
      return $scope.toArray($scope.dictionary.listing_category);
    }

    $scope.getSubcategoryList = function(){
      if($scope.dictionary == null) return [];
      return $scope.toArray($scope.dictionary.listing_subcategory);
    }

    $scope.getBuildingCategoryList = function(){
      if($scope.dictionary == null) return [];
      return $scope.toArray($scope.dictionary.building_category);
    }

    $scope.getLicenseList = function(){
      if($scope.dictionary == null) return [];
      return $scope.toArray($scope.dictionary.broker_license_type);
    }

    $scope.getOfficeList = function($source_id){
        if($scope.offices == null) return [];
        return $scope.offices;
    //   $siApi.call('office/view/' + $configs.source.id + '/fr/items').then(function($response){
    //     $scope.officeList = $response.items;
    //     $scope.is_ready = true;
    //     $resolve();
    // })
    }

    $scope.toArray = function($source){
      let lResult = [];
      for($key in $source){
        lResult.push({key : $key, label: $source[$key].caption});
      }

      return lResult;
    }

    $scope.init();

    return $scope;
  }
]);


siApp
.factory('$siCompiler', ['$siConfig','$siList', '$siUtils','$siLexicon',
function $siCompiler($siConfig,$siList, $siUtils,$siLexicon){
    const $scope = {};

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
            $item.counters = {};

            $item.location.city = ($item.location.city != undefined) ? $item.location.city : $siUtils.getCaption($item.location.city_code, 'city');
            $item.location.region = $siUtils.getCaption($item.location.region_code, 'region');
            $item.location.district  = $siUtils.getCaption($item.location.district_code, 'district');
            $item.subcategory = $siUtils.getCaption($item.subcategory_code, 'listing_subcategory');
            $item.category = $siUtils.getCaption($item.category_code, 'listing_category');
            $item.transaction = $siUtils.getTransaction($item);
            
            let doorType = $siLexicon.get('apt.'.translate());
            if(['COM','IND'].includes($item.category_code)){
                doorType = $siLexicon.get('suite'.translate());
            }

            $item.short_price = $siUtils.formatPrice($item);
            $item.location.civic_address = '{0} {1}'.siFormat(
                                                        $item.location.address.street_number || '',
                                                        $item.location.address.street_name
                                                    ).trim();
            if(!isNullOrEmpty($item.location.address.door)){
                $item.location.civic_address += ', ' + '{1} {0}'.siFormat($item.location.address.door,doorType);
            }

            if($item.location.civic_address != ''){
                $item.location.full_address = '{0} {1}, {2}'.siFormat(
                    $item.location.address.street_number || '',
                    $item.location.address.street_name,
                    $item.location.city
                );

                if(!isNullOrEmpty($item.location.address.door) && typeof  $item.location.address.door != 'undefined'){
                    $item.location.full_address += ', ' + '{1} {0}'.siFormat( $item.location.address.door, doorType);
                }
            }
            else{
                $item.location.full_address = $item.location.city;
            }

            // remove empty 
            $item.location.civic_address = $item.location.civic_address.replace(/\{\d{1,3}\}/g, '');
            $item.location.full_address = $item.location.full_address.replace(/\{\d{1,3}\}/g, '');
            
            if(!isNullOrEmpty($item.available_area)){
                $item.available_area_unit = $siUtils.getCaption($item.available_area_unit_code,'dimension_unit',true);
            }

            $scope.compileListingRooms($item);
            $item.permalink = $siUtils.getPermalink($item);

        }

        $scope.compileListingTags($item);

    }

    // Add tags to listing item
    $scope.compileListingTags = function($item){
        $item.tags = [];

        if($siConfig._data && $siConfig._data.new_item_time_limit > 0 ){
            const date = ($item.contract && $item.contract.start_date) 
                            ? $item.contract.start_date
                            : $item.creation_date;
            if(date != undefined){
                if(moment(date).isValid()){
                    if(moment(date).isAfter(moment().add(-1 * $siConfig._data.new_item_time_limit,'day'))){
                        $item.tags.push({label: 'New'});
                    }
                }
            }
        }

        if($item.availability_delay!=undefined && $item.availability_delay <= 10) $item.tags.push({label: 'Quick move-in'});
        if($item.for_rent_flag || $item.price.rent) $item.tags.push({label: 'For rent'});
        if($item.video_flag) $item.tags.push({label: 'Video'});
        if($item.virtual_tour_flag) $item.tags.push({label: 'Virtual tour'});

        if($item.attributes != undefined){
            let attrs = $item.attributes;
            if(Array.isArray(attrs)){ attrs = attrs.reduce( (o, e) => {
                    o[e.code] = true;
                    if(Array.isArray(e.values)){
                        e.values.forEach(v => { o[v.code] = true});
                    }
                    return o;
                }, {});
            }

            if(attrs.PANORAMIC_VIEW === true || attrs['VIEW PANORAMIC'] === true) $item.tags.push({label: 'Panoramic view'});
            if(attrs.WATER_FRONT === true || attrs['VIEW WATER'] === true) $item.tags.push({label: 'Water front'});
            if(attrs.POOL === true) $item.tags.push({label: 'Pool'});
        }

    }

    $scope.compileListingMapMarker = function($item){
        $item.category = $siUtils.getCaption($item.category_code, 'listing_category');
        $item.status = $siUtils.getCaption($item.status_code, 'listing_status');
    }

    /**
     * Compile data to ease access to some values
     * @param {array} $list Array of broker item
     */
    $scope.compileBrokerList = function($list){
        $siConfig.get().then(function ($configs){
            $siList.getOfficeList($configs.default_view);
        });

        $list.forEach(function($e){
            $scope.compileBrokerItem($e);
        });

        return $list;
    }

    $scope.compileBrokerItem = function($item){

        if($item.office_ref_number != undefined){
            $officeList = $siList.getOfficeList();
            $item.office = $officeList.find(function($e) { return $e.ref_number == $item.office_ref_number});
            $scope.compileOfficeItem($item.office);

            
        }

        
        if($item.phones != null){
            if($item.phones.office == undefined && $item.office != undefined){
                $item.phones.office = $item.office.phones.office_toll_free;
            }
            Object.keys($item.phones).forEach(function($key) { $item.phones[$key] = $siUtils.formatPhone($item.phones[$key]);}); 
        }

        $item.fullname = $item.first_name + ' ' + $item.last_name;
        

        
        if($item.license_type==undefined){
            $item.license_type = $siLexicon.get($siUtils.getCaption($item.license_type_code, 'broker_license_type'));
        }

        if($item.permalink == undefined){
            $item.permalink = $siUtils.getPermalink($item,'broker');
        }

        $scope.compileLinks($item);
    }

    $scope.compileListingRooms = function($item){
        if($item.main_unit == undefined && $item.units != undefined){
            if($item.units.length > 0) $item.main_unit = $item.units.find(function($u){ return $u.category_code == 'MAIN'});
        }

        const lIconRef = {
            'bathroom_count' : 'bath',
            'bedroom_count' : 'bed',
            'waterroom_count' : 'hand-holding-water'
        }
        const lLabelRef = {
            'bathroom_count' : 'Bathroom',
            'bedroom_count' : 'Bedroom',
            'waterroom_count' : 'Powder room'
        }
        const lPluralLabelRef = {
            'bathroom_count' : 'Bathrooms',
            'bedroom_count' : 'Bedrooms',
            'waterroom_count' : 'Powder rooms'
        }

        if($item.rooms != undefined && $item.main_unit == undefined){
            $item.main_unit = {
                'bathroom_count' : $item.rooms.filter(r => ['BTH'].includes(r.category_code)).length,
                'waterroom_count' : $item.rooms.filter(r => ['xxx'].includes(r.category_code)).length,
                'bedroom_count' : $item.rooms.filter(r => ['MBR','BDR'].includes(r.category_code)).length
            }
        }

        if(typeof $item.main_unit != 'undefined'){
            
            

            $item.counters.rooms = {};

            Object.keys($item.main_unit).forEach(function($k){
                if($item.main_unit[$k] > 0){
                    const lLabel = $item.main_unit[$k] > 1 ? lPluralLabelRef[$k] : lLabelRef[$k];
                    
                    if(typeof lIconRef[$k] != 'undefined') $item.counters.rooms[lIconRef[$k]] = {count : $item.main_unit[$k], label : lLabel};
                }
            });
        }

    }

    /**
     * Compile data to ease access to some values
     * @param {array} $list Array of office item
     */
    $scope.compileOfficeList = function($list){
        $list.forEach(function($e){
            $scope.compileOfficeItem($e);
        })
        return $list;
    }
    
    $scope.compileOfficeItem = function($item){
        if($item == undefined) return;
        if($item.phones != null){
            Object.keys($item.phones).forEach(function($key) { $item.phones[$key] = $siUtils.formatPhone($item.phones[$key]);}); 
        }
        $item.location.region       = ($item.location.region == undefined) ? $siUtils.getCaption($item.location.region_code, 'region') : $item.location.region;
        $item.location.country      = ($item.location.country == undefined) ? $siUtils.getCaption($item.location.country_code, 'country') : $item.location.country;
        $item.location.state        = ($item.location.state == undefined) ? $siUtils.getCaption($item.location.state_code, 'state') : $item.location.state;
        $item.location.city         = ($item.location.city == undefined) ? $siUtils.getCaption($item.location.city_code, 'city') : $item.location.city;
        
        $item.location.street_address = '{0} {1}'.siFormat(
                                                    $item.location.address.street_number,
                                                    $item.location.address.street_name
                                                );
        if(!isNullOrEmpty($item.location.address.door)){
            $item.location.street_address += ', suite {0}'.translate().siFormat($item.location.address.door);
        }
        $item.location.full_address = '{0} {1}, {2}'.siFormat(
                                                $item.location.address.street_number,
                                                $item.location.address.street_name,
                                                $item.location.city
                                            );
        if($item.agency) $scope.compileAgencyItem($item.agency);
        $scope.compileLinks($item);

        $item.permalink = $siUtils.getPermalink($item,'office');
    }

   /**
     * Compile data to ease access to some values
     * @param {array} $list Array of office item
     */
    $scope.compileAgencyList = function($list){
        

        $list.forEach(function($e){
            $scope.compileAgencyItem($e);
        });

        return $list;
    }
    
    $scope.compileAgencyItem = function($item){
        if($item == undefined) return;
        if($item.phones != null){
            Object.keys($item.phones).forEach(function($key) { $item.phones[$key] = $siUtils.formatPhone($item.phones[$key]);}); 
        }
        
        $item.franchisor = $siUtils.getCaption($item.franchisor_code, 'franchisor');
        $item.license_type = ($item.license_type_code != undefined) ? $siUtils.getCaption($item.license_type_code, 'agency_license_type') : $item.license_type;

        if($item.main_office != null){
            $scope.compileOfficeItem($item.main_office);
            $item.location = $item.main_office.location;
        }
        
        $item.permalink = $siUtils.getPermalink($item,'agency');
    }

    $scope.compileCityList = function($list){
        $list.forEach(function($e){
            $scope.compileCityItem($e);
        });
    }

    $scope.compileCityItem = function($item){
        $item.region    = $siUtils.getCaption($item.region_code, 'region');
        $item.country   = $siUtils.getCaption($item.country_code, 'country');
        $item.state     = $siUtils.getCaption($item.state_code, 'state');
        $item.city      = $siUtils.getCaption($item.city_code, 'city');

        $item.permalink = $siUtils.getPermalink($item,'city');
    }

    $scope.compileLinks = function($item){
        if($item.links != undefined){
            $item.links.socials = Object.keys($item.links).filter($k => $k!='website').map($k => {
                return {
                    type: $k,
                    url: $item.links[$k]
                }
            });
        }
    }

    return $scope;
}]);

siApp
.factory('$siUtils', ['$siDictionary', '$siTemplate', '$interpolate','$sce', '$siConfig', '$siHooks', '$q', '$siLexicon',
function $siUtils($siDictionary,$siTemplate, $interpolate, $sce, $siConfig,$siHooks,$q, $siLexicon){
    let $scope = {};
    $scope.page_list = [];

    $scope.configs = null;

    $scope.getSingularType = function($type, $toLower){
        $toLower = $toLower == undefined ? true : $toLower;
        const lTypes = {
            listings: 'Listing',
            brokers: 'Broker',
            offices: 'Office',
            agencies: 'Agency',
            cities : 'City'
        };

        const lResult = lTypes[$type];
        if(lResult == undefined) return null;
        if($toLower) return lResult.toLowerCase();
        return lResult;
    }

    /** 
     * Get the caption matching key and domain from the dictionary
     * @param {string} $key Key code of the dictionary item
     * @param {string} $domain Group key that (should) hold the item
     * @return {string} Caption matched or the key in case the something's missing or went wrong
     */
    $scope.getCaption = function($key, $domain, $asAbbr){
        return $siLexicon.get($siDictionary.getCaption($key,$domain,$asAbbr));
    }

    $scope.formatPhone = function($phone, $format=null){
        const cleaned = ('' + $phone).replace(/\D/g, '');

        const match = cleaned.match(/^(\d{10})$/)
        if (match) {
            const phone_format = $siLexicon.get($format || $siConfig._data.phone_format || '000-000-0000');
            let digitIndex = 0;
            $phone = phone_format.split('').reduce( ( $result, $char) => {
                if($char === '0'){
                    $result += cleaned[digitIndex];
                    digitIndex++;
                }
                else{
                    $result += $char;
                }
                return $result;
            },'')
        }

        return $phone;
    }

    $scope.labelOf = function($value, $list){
        if($value == null) return '';
        if($list == null) return '';
        
        const lItem = $list.find(function($e){ return $e.key == $value});
        if(lItem == null) return '';
        return $siLexicon.get(lItem.label);
    }

    $scope.timeLength = function($value){
        const lTimespan = moment.duration(moment().diff($value));
        if(lTimespan.as('day') < 30){
            return 'New'.translate();
        }

        if(lTimespan.as('day') < 60){
            return '{0} days'.translate().siFormat(Math.round(lTimespan.as('day')));
        }

        if(lTimespan.as('month') < 24){
            return '{0} months'.translate().siFormat(Math.round(lTimespan.as('month')));
        }

        return '{0} years'.translate().siFormat(Math.round(lTimespan.as('year')));
    }

    /**
     * Format the price of the listing for pretty reading
     * @param {object} $item Listing data object
     * @param {string} $format Return format. Supported values short|long
     */
    $scope.formatPrice = function($item, $format,$empty=''){
        $format = $format!=undefined ? $format : 'short';
        

        let lResult = [];
        if($item.status_code=='SOLD'){
            // when price.sell has value, it means the listing is sold
            // ALSO, when there is neither price.sell or price.lease defined, we assume it's sold too
            if($item.price.sell != undefined || ($item.price.sell == undefined && $item.price.lease == undefined) ){
                lResult.push($siLexicon.get('Sold'.translate()));
            }
            // Otherwise, it a rent
            else{
                lResult.push($siLexicon.get('Rented'.translate()));
            }
            return lResult.join('');
        }

        if($item.price.sell == undefined && $item.price.lease == undefined){
            return $empty;
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
                    const lTerm = ($key == 'sell') ? 'sale' : $key;
                    let lStart = 'for {0} for '.siFormat(lTerm).translate().siCapitalize();

                    lResult.push(lStart + '<span class="nowrap">' + lPart.join('/') + '</span>');
                }
                else{
                    lResult.push(lPart.join('/'));
                }
            }
        }

        
        let lSeperator = ' or '.translate();
        if($format == 'long'){
            lSeperator = '<br />' + lSeperator;
        }

        return lResult.join(lSeperator);
    }

    $scope.formatDimension = function($dimension){
        let lResult = '';
        if($dimension != undefined){
            // const implicitAreaKey = ['sf','mc'].find($k => $dimension['area_' + $k] != undefined);
            // if(implicitAreaKey != null) {
            //     const implicitUnit = $siDictionary.getCaption(implicitAreaKey.toUpperCase(),'dimension_unit');
            //     return $dimension['area_' + implicitAreaKey] + ' ' + implicitUnit;
            // }

            if($dimension.width != undefined){
                let lUnit = $siDictionary.getCaption($dimension.unit_code,'dimension_unit',true);
                
                const lUnitFormat = {
                    I : function($width,$length,$unit){
                        if($width == undefined  && $length == undefined) return '';

                        if($width == undefined){
                            $width = 'N/A'.translate();
                        }
                        else{
                            lWidthFeet = Math.floor($width /  12);
                            lWidthInchLeft = $width % 12;
        
                            $width = lWidthFeet + "'" + (lWidthInchLeft != 0 ? lWidthInchLeft + $unit : '');
                        }

                        if($length == undefined){
                            $length = 'N/A'.translate();
                        }
                        else{
                            lLengthFeet = Math.floor($length / 12);
                            lLengthInchLeft = $length % 12;
                            $length = lLengthFeet + "'" + (lLengthInchLeft != 0 ? lLengthInchLeft + $unit : '');
                        }

                        return '{0} x {1}'.siFormat($width,$length);
                    },
                    
                }
    
                if(lUnitFormat[$dimension.unit_code] != undefined){
                    lResult = lUnitFormat[$dimension.unit_code]($dimension.width,$dimension.length,lUnit);
                }
                else{
                    lResult = '{0}{2} x {1}{2}'.siFormat($dimension.width,$dimension.length, lUnit);
                }
                
                
            }
            else if ($dimension.area != undefined){
                let lUnit = $siDictionary.getCaption($dimension.area_unit_code,'dimension_unit',true);
                lResult = '{0} {1}'.siFormat($dimension.area, lUnit);
            }
    
            if($dimension.irregular === true){
                lResult += ' irr.';
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
     * Check if any of the values have some sort of value
     * @param {mixed object/array} $value A single or an array of value to check
     * @param {int} $arrayOffset Optional. Minimal value for an array to be considered "not empty"
     */
    $scope.hasValue = function($values, $arrayOffset){
        if($values == undefined) return false;
        $arrayOffset = ($arrayOffset == undefined) ? 0 : $arrayOffset;

        const lValuesToCheck = (Array.isArray($values)) ? $values : [$values];
        if(lValuesToCheck.length == 0) return false;
        
        return lValuesToCheck.some(function($value){
            if($value == null) return false;
            if($value == undefined) return false;
            
            if(Array.isArray($value)) return $value.length > $arrayOffset;
            if(typeof $value === "object") return Object.keys($value).length > 0;
            if(typeof $value == 'string') return $value != '';
            if($value!=undefined)return true;
            
        })
    }

    /**
     * Get permalink of the listing item
     * @param {object} $item Listing data object
     */
    $scope.getPermalink = function($item, $type){
        $type = (typeof $type=='undefined') ? 'listing' : $type;
        if(siCtx[$type + '_routes'] == undefined) return '';
        
        $scope.item = angular.copy($item);
        const lLocaleRoute = siCtx[$type + '_routes'].find(function($r){
            return $r.lang==siCtx.locale
        });
        const lRoute = lLocaleRoute == null ? siCtx[$type + '_routes'][0] : lLocaleRoute;


        let lMandatoryLocationData = ['country','state','region','city'];
        
        //$scope.item.location = ($scope.item.main_office != undefined) ? $scope.item.main_office.location : $scope.item.location;
        if($scope.item.location == undefined) $scope.item.location = {};

        lMandatoryLocationData.forEach(function($d) {
            if(typeof $scope.item.location[$d] == 'undefined'){
                $scope.item.location[$d] = ('other ' + $d).translate();
            }
        });
        

        let lResult = $scope.sanitize($siTemplate.interpolate(lRoute.route, $scope));
        

        // check if permalink overrides is allowed
        if($siConfig._data.enable_custom_page){  
            // search in page_permalink first
            $scope.page_list.some(function($p){
                let lCustomPage = '';
                let oRx = null;
                switch($type){
                    case 'broker':
                        lCustomPage= lResult.replace('/' + $item.ref_number, '-' + $item.ref_number);
                        break;
                    case 'listing':
                        let lRx = new RegExp("\/[^\/]+\/" + $item.ref_number);
                        lCustomPage= lResult.replace(lRx, '/' + $scope.sanitize($item.location.civic_address) + '-' + $item.ref_number);
                        
                        break;
                    case 'office':
                        oRx = new RegExp("\/[^\/]+\/" + $item.ref_number);
                        lCustomPage= lResult.replace(oRx, '/' + $scope.sanitize($item.location.civic_address) + '-' + $item.ref_number);
                        
                        break;
                    case 'agency':
                        oRx = new RegExp("\/[^\/]+\/" + $item.ref_number);
                        lCustomPage= lResult.replace(oRx, '/' + $scope.sanitize($item.name) + '-' + $item.ref_number);
                        
                        break;
                }

                if(lCustomPage != '' && lCustomPage == $p.permalink){
                    lResult = lCustomPage;
                    return true;
                }
            });
        }

        //if(siCtx.use_lang_in_path) lResult = siCtx.locale + lResult;
        if(lResult.indexOf(siCtx.root_url.trimCharLeft('/')) >= 0) {
            lResult = lResult.replace(siCtx.root_url.trimCharLeft('/'),'');
        }
        // console.log('getPermalink',siCtx.root_url);
        lResult = siCtx.root_url + lResult;
        
        // add hook for custom permalink for type
        lResult = $siHooks.filter('si/list/item/permalink', lResult, $item);
        lResult = $siHooks.filter($type + '_permalink', lResult, $item);

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
     * Take a phone key type and return an icon that matches
     * If no icon matches, will return the default "phone" icon
     * @param {string} $key Phone key type
     */
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

            if($item.main_office === true){
                lResult.push('is-main-office');
            }

            if($item.status_code=='SOLD'){
                lResult.push('sold');
            }
            let lHasFlags = false;
            
            if( ($item.video_flag) || ($item.video)){
                //console.log('$item/has-video',$item.video_flat !== undefined, $item.video !== undefined, $item.video_flat !== undefined || $item.video !== undefined);
                lHasFlags = true;
                lResult.push('has-video');
            }

            if($item.virtual_tour_flag || $item.virtual_tour){
                lHasFlags = true;
                lResult.push('has-virtual-tour');
            }

            if($siConfig._data && $siConfig._data.new_item_time_limit > 0 ){
                const date = ($item.contract && $item.contract.start_date) 
                                ? $item.contract.start_date
                                : $item.creation_date;
                if(date != undefined){
                    if(!moment(date).isValid()) console.log(date,'is not a valid date');

                    if(moment(date).isAfter(moment().add(-1 * $siConfig._data.new_item_time_limit,'day'))){
                        lHasFlags = true;
                        lResult.push('is-new');
                    }
                }
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
        if($item.location.city != undefined) return $item.location.city;

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
        const lLabel = {
            'rent' : 'For rent',
            'lease': 'For rent',
            'sell' : 'For sale'
        }
        lResult = $scope.getTransactionFromArray($item,['rent','sell'], lLabel, $sanitize);

        
        if(lResult.length == 0){
            lResult = $scope.getTransactionFromArray($item,['lease','sell'], lLabel, $sanitize);
        }

        // No transaction detected
        if(lResult.length == 0){
            lResult = ['na'];
        }

        return lResult.join(' ' + 'or'.translate() + ' ');
    }

    /**
     * Get transaction from array of price nodes
     */
    $scope.getTransactionFromArray = function($item, $keys, $labels, $sanitize){
        let lResult = [];

        $keys.forEach(function($key){
            if(typeof $item.price[$key]!='undefined'){
                let lTrans = ($labels[$key]).translate();
                if($sanitize){
                    lTrans = $scope.sanitize(lTrans);
                }
                lResult.push(lTrans);
            }
        });

        return lResult;
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
            lResult = lResult.split('-').map(function ($e,$i){ 
                if($i==0) return $e;
                return $e[0].toUpperCase() + $e.substr(1);
            }).join('');
        }

        return lResult;
    }

    $scope.filesize = function($value){
        const lSizeGroup = [
            'bytes','Kb','Mb','Gb','Tb'
        ]
        let lSizeDivider = 0;
        while ($value > 1000) {
            $value = $value / 1000;
            lSizeDivider++;
        }

        return (Math.round($value * 100) / 100) + lSizeGroup[lSizeDivider].translate();
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
    $scope.search = function($key){
        const lSearch = window.location.search
                            .replace('?','')
                            .split('&')
                            .map(function($item){
                                return $item.split('=');
                            });
        if(lSearch.length == 0) return null;
        const lSearchObject = lSearch.reduce(function($acc, $cur){
            $acc[$cur[0]] = $cur.slice(1).join('');
            return $acc;
        },{});

        if($key == undefined) return lSearchObject;
        return lSearchObject[$key];
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

    $scope.isNullOrEmpty = function($value){
        return isNullOrEmpty($value);
    }

    $scope.isLegacyBrowser = function(){
        const lUA = window.navigator.userAgent;
        
        if(!['Chrome','Safari','Firefox'].some(function($e){return lUA.indexOf($e)>=0;})){
            return true;
        }


        return false;
    }
    $scope.browserSupports = function($supportKey, $supportValue){
        if(typeof(CSS.supports) !== undefined){
            return CSS.supports($supportKey, $supportValue);
        }
        return false;
    }

    $scope.isBrowser = function($name, $minVersion, $maxVersion){
        $minVersion = $minVersion == undefined ? null : $minVersion;
        $maxVersion = $maxVersion == undefined ? null : $maxVersion;
        
        const lUA = window.navigator.userAgent;
        const lRegEx = new RegExp($name + '\/([1-9][0-9]+)','gi');
        const lMatches = lRegEx.exec(lUA);
        if(lMatches == null) return false;
        if(lMatches.length == 0) return false;

        // There's a match, but we don't check version
        if($minVersion == null && $maxVersion == null) return true;

        // check versions
        const lVersion = Number(lMatches[1]);
        //console.log(lVersion, $minVersion, $maxVersion, lMatches);
        if($minVersion != null && $minVersion > lVersion) return false;
        if($maxVersion != null && $maxVersion < lVersion) return false;
        return true;
    }

    

    $scope.all = function($promises){
        return $q(function($resolve, $reject){
            const lConvertedPromises = Array.isArray($promises) ? $promises : 
                                        Object.keys($promises).map(function($k){ return $promises[$k]()});
            $q.all(
                lConvertedPromises
            )
            .then(function($results){
                const lConvertedResults = Array.isArray($promises) ? $results :
                                            Object.keys($promises).reduce(
                                                function($result, $k, $index){ 
                                                    $result[$k] = $results[$index];
                                                    return $result;
                                                }, {}
                                            );
                $resolve(lConvertedResults);
            })
        })
    }

    $scope.stylesToNum = function($styleList, $source){
        return $styleList.reduce(
            function($r, $s){
                if($source[$s] == undefined){
                    $r[$s] = 0;
                }
                else{
                    $r[$s] = Number($source[$s].replace(/\D/gi,''));
                }

                
                return $r
            },
            {}
        );
    }

    $scope.elmOffsetZIndex = function($elm){
        let lElmZindex = window.getComputedStyle($elm).zIndex;

        if($elm.tagName == 'BODY') return 1;

        if(lElmZindex == 'auto'){
            lElmZindex = 1;
        }
        
        const lParentZIndex = $scope.elmOffsetZIndex($elm.parentNode);
        if(!isNaN(lParentZIndex)) lElmZindex += lParentZIndex;

        return Number(lElmZindex);
    }

    $scope.sortObjectKeys = function($obj){
        return $obj;
    }
    $scope.hash = function($obj){
        const lSorted = $scope.sortObjectKeys($obj);
        const jsonstring = JSON.stringify(lSorted, function(k, v) { return v === undefined ? "undef" : v; });
        
        // Remove all whitespace
        let hash = 0;
        for (let i = 0; i < jsonstring.length; i++) {
            let character = jsonstring.charCodeAt(i);
            hash = ((hash<<5)-hash)+character;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    return $scope;
}]);

siApp
.factory('$siUI', ['$rootScope','$timeout','$q', 
function $siUI($rootScope, $timeout, $q){
    const $scope = {};
    $scope.$isFullscreen = false;

    $scope.enterFullscreen = function($element, $onExit){
        const lAvailableFn = ['requestFullscreen','mozRequestFullScreen','webkitRequestFullscreen','msRequestFullscreen'].find(function($att){ return $element[$att] !== undefined});
        //console.log('$siUI/enterFullscreen',$element, lAvailableFn);

        if(lAvailableFn === null || lAvailableFn === undefined) return $q.reject();
        if($element === undefined) return $q.reject();
        
        return $q( function($resolve){
            //console.log('$siUI/enterFullscreen', typeof($element[lAvailableFn]) );
            const lFullscreenPromise = $element[lAvailableFn]();
            if(lFullscreenPromise == undefined){
                $scope.$isFullscreen = true;
                $timeout($resolve, 250);
                return;
            }

            lFullscreenPromise.then( function(){
                

                if(typeof($onExit) == 'function'){

                    const fnExitHandler = function($event){
                        //console.log('fullscreenchange event triggered');
                        if($scope.$isFullscreen == true){
                            ['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(function($e){
                                //console.log($e, 'event unregistered');
                                document.removeEventListener($e, fnExitHandler);
                            });

                            $onExit();
                        }
                    };
                    
                    $timeout(function(){
                        ['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(function($e){
                            //console.log($e, 'event registered');
                            document.addEventListener($e, fnExitHandler);
                        });
                    }, 500);
                    
                }

                $scope.$isFullscreen = true;

                $resolve();
            })
        });
    }

    $scope.exitFullscreen = function(){
        if(!$scope.$isFullscreen) {
            //console.log('is not fullscreen ', $scope.$isFullscreen);
            return $q.reject();
        }

        const lAvailableFn = ['exitFullscreen','mozCancelFullScreen','webkitExitFullscreen','msExitFullscreen'].find(function($att){ return document[$att] !== undefined});
        if(lAvailableFn == null) return $q.reject('exitFullscreen function not available');

        return document[lAvailableFn]();
    }

    $scope.lockScreenOrientation = function($orientation){
        if(screen.orientation == undefined) return $q.reject();
        if(!$scope.$isFullscreen) return $q.reject();
        
        try {
            return $q(function($resolve,$reject){
                screen.orientation.lock($orientation)
                .then(
                    function success(){ $resolve() },
                    function failed(){
                        //console.log('cannot lock screen');
                        $reject();
                    }
                )
            });
        } catch (error) {
            return $q.reject();
        }
        
        return $q.resolve();
    }

    $scope.unlockScreenOrientation = function(){
        if(screen.orientation == undefined) return $q.resolve();
        
        screen.orientation.unlock();
        return $q.resolve();
    }


    return $scope;
}
])

siApp
.factory('$siConfig',['$http','$q',
function $siConfig($http, $q){
    let $scope = {};

    $scope._data = null;
    $scope._listData = null;
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
                            if(siCtx.version != undefined){
                                $scope._data.app_version = siCtx.version;
                            }
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

    $scope.getList = function($alias){
        if($scope._listData != null && $scope._listData[$alias] != undefined){
            return $q.resolve($scope._listData[$alias]);
        }
        
        return $scope.get().then(function($configs){
            //console.log($configs);
            return $configs.lists.find(function($e){
                return $e.alias == $alias;
            });
        }).then(function($configs){
            if($configs == null) return null;
            if($scope._listData == null) $scope._listData = {};

            $scope._listData[$alias] = $configs
            if(isNullOrUndefined($configs.current_view)) $configs.current_view = $configs.source.id;
            return $configs;
        });
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
        //console.log('$siHooks/addFilter', $key);

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
        const lActions = [];
        
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
        const lFilters = [];
        
        $scope._filters.forEach(function($f){
            if($key == $f.key){
                lFilters.push($f);
            }
        });
        
        $siGlobalHooks._filters.forEach(function($f){
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
    
    $scope.hasFavorites = function(){
        return $scope.favorites.length > 0;
    }

    $scope.toggle = function($item){
        if($scope.isFavorite($item.ref_number) === false){
            $item.added_to_fav = new Date();
            $scope.favorites.push($item);
            $scope.save();
        }
        else{
            $scope.favorites = $scope.favorites.filter(function($e) { return $e.ref_number != $item.ref_number});
            $scope.save();
        }
    }

    $scope.isFavorite = function($ref_number){
        return $scope.favorites.some(function($e) {return $e.ref_number == $ref_number});
    }

    $scope.isEmpty = function(){
        return $scope.favorites.length == 0;
    }

    $scope.getValues = function(){
        if($scope.favorites.length == 0)  return [];
        return $scope.favorites.map(function($e) { return $e.ref_number});
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
.factory('$siDataLayer', function $siDataLayer($rootScope){
    const $scope = {};

    $scope.init = function(){
        // $rootScope.$on('si/triggerEvent', function($event, $key, $data){
        //     $scope.pushEvent($key, $data);
        // });

        // $rootScope.$on('si/pushData', function($event, $data){
        //     $scope.push($data);
        // });
    }

    $scope.push = function($data){
        //console.log('$siDataLayer/push', $data);
        let eventGroup = 'access';
        if($data.event.includes('form')) eventGroup = 'form';

        $data = Object.assign($data,{
            eventGroup: eventGroup
        });

        $rootScope.$broadcast('siDataLayer/push-event',$data);

        if(window.dataLayer == undefined) return;
        if(!Array.isArray(window.dataLayer)) return;

        window.dataLayer.push($data);
    }

    $scope.pushEvent = function($eventName, $data = null){
        $scope.push(Object.assign({'event': $eventName}, $data));
    }
    

    $scope.init();
    return $scope;
});


