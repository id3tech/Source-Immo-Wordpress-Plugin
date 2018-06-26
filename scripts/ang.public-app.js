var ImmoDbApp = angular.module('ImmoDb', []);

ImmoDbApp
.controller('publicCtrl', function($scope,$http,$q){
    

    $scope.init = function(){

    }
    
});


ImmoDbApp
.directive('immodbList', function(){
    let dir_controller = function ($scope, $q, $http) {
        $scope.configs = null;
        $scope.list = [];
        $scope.page = 1;
        $scope.meta = null;
        $scope.dictionary = {};
        $scope.auth_token = null;


        $scope.$watch("alias", function(){
            $scope.init();
            
        })
        /**
         * Initialize the controller
         */
        $scope.init = function(){
            console.log('initializing list for ' + $scope.alias);
            if($scope.alias){
                
                $scope.getListConfigs($scope.alias).then(function($configs){
                    $scope.configs = $configs;
                    $scope.renewToken().then(function(){
                        if($scope.configs.source=='default'){
                            $scope.configs.source = $scope.auth_token.view_ids[0];
                        }
                        $scope.start();
                    });
                    
                });
            }
        }

        /**
         * Start the loading process
         */
        $scope.start = function(){
            console.log('starting list with ', $scope.configs);
            $scope.api($scope.getEndpoint()).then(function($response){
                console.log('list data acquired',$response);
                if($scope.configs.limit > 0){
                    // limit data
                    $response.listings = $response.listings.slice(0, $scope.configs.limit);
                }
                $scope.list = $response.listings;
                $scope.meta = $response.metadata;
                console.log('list', $scope.list);
            })
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
            return lOrigin.concat('/view/',$scope.configs.source,'/',immodbApiSettings.locale,'/page/',$scope.page);
        }

        //
        // UTILITY FUNCTIONS
        //

        /**
         * Get the caption matching key and domain from the dictionary
         * @param {string} $key Key code of the dictionary item
         * @param {string} $domain Group key that (should) hold the item
         * @return {string} Caption matched or the key in case the something's missing or went wrong
         */
        $scope.getCaption = function($key, $domain, $asAbbr){
            let lResult = $key;
            $asAbbr = ($asAbbr==undefined)?false:$asAbbr;

            if($scope.meta && $scope.meta.dictionary[$domain]){
                if($scope.meta.dictionary[$domain][$key] != undefined){
                    if($asAbbr){
                        lResult = $scope.meta.dictionary[$domain][$key].abbr;
                    }
                    else{
                        lResult = $scope.meta.dictionary[$domain][$key].caption;
                    }
                }
            }
            return lResult;
        }

        $scope.formatPrice = function($item){
            let lResult = [];
            for(let $key in $item.price){
                let lPart = $item.price[$key].amount.formatPrice($scope.meta.dictionary.culture);
                lResult.push(lPart);
            }
            
            let lSeperator = ($scope.meta.dictionary.culture=='fr') ? ' ou ' : ' or ';

            return lResult.join(lSeperator);
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
                    console.log('resolve ', $options.url, 'with', $result.data);
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

ImmoDbApp
.controller('immodbListCtrl', function($scope){
    $scope.configs = null;
    $scope.list = [];
    $scope.page = 1;
    $scope.meta = null;
    $scope.dictionary = {};

    /**
     * Initialize the controller
     * @param {string} $alias 
     */
    $scope.init = function($alias){
        console.log('initializing list for ' + $alias);
        $scope.getListConfigs($alias).then(function($configs){
            $scope.configs = $configs;
            $scope.renewToken().then(function(){
                if($scope.configs.source=='default'){
                    $scope.configs.source = $scope.auth_token.view_ids[0];
                }
                $scope.start();
            });
            
        });
    }

    /**
     * Start the loading process
     */
    $scope.start = function(){
        console.log('starting list with ', $scope.configs);
        $scope.api($scope.getEndpoint()).then(function($response){
            console.log('list data acquired',$response);
            if($scope.configs.limit > 0){
                // limit data
                $response.listings = $response.listings.slice(0, $scope.configs.limit);
            }
            $scope.list = $response.listings;
            $scope.meta = $response.metadata;
        })
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
        return lOrigin.concat('/view/',$scope.configs.source,'/',immodbApiSettings.locale,'/page/',$scope.page);
    }

    //
    // UTILITY FUNCTIONS
    //

    /**
     * Get the caption matching key and domain from the dictionary
     * @param {string} $key Key code of the dictionary item
     * @param {string} $domain Group key that (should) hold the item
     * @return {string} Caption matched or the key in case the something's missing or went wrong
     */
    $scope.getCaption = function($key, $domain){
        let lResult = $key;
        if($scope.meta && $scope.meta.dictionary[$domain]){
            if($scope.meta.dictionary[$domain][$key] != undefined){
                lResult = $scope.meta.dictionary[$domain][$key].caption;
            }
        }
        return lResult;
    }

});


