/* SERVICES */
siApp
.factory('$siUtils', ['$siApi','$q',
function $siUtils($siApi,$q){
  let $scope = {};

  $scope.stringToOptionList = function($source){
    if($source == null || $source == undefined) return null;
    if($source.indexOf('|') < 0 && $source.indexOf(':') < 0) return [$source];

    let lKeyValues = $source.split("|");
    let lResult = [];
    lKeyValues.forEach(function($e){
      let lItemArr = $e.split(":");
      console.log('splited item',lItemArr);
      let lItem = {
        key : lItemArr[0],
        label : lItemArr.length > 1 ? lItemArr[1] : lItemArr[0]
      };

      lResult.push(lItem);
    });

    return lResult;
  }

  $scope.toArray = function($source){
    let lResult = [];
    for($key in $source){
      if(typeof $source[$key] != 'function'){
        lResult.push($source[$key]);
      }
    }
    return lResult;
  }

  $scope.toKeyArray = function($source){
    let lResult = [];
    for($key in $source){
      if(typeof $source[$key] != 'function'){
        lResult.push($key);
      }
    }
    return lResult;
  }

  $scope.toKeyValueArray = function($source){
    let lResult = [];
    for($key in $source){
      if(typeof $source[$key] != 'function'){
        lResult.push({key: $key, value: $source[$key]});
      }
    }
    return lResult;
  }

  $scope.renewListSearchToken = function($list){
    let lFilters = $scope.buildListFilter($list);
 
    return $q(function($resolve, $reject){
        if(lFilters != null){
          $siApi.call('', lFilters,{
              url: wpSiApiSettings.api_root + '/api/utils/search_encode'
            }).then(function($response){
                $resolve($response);
            });
        }
        else{
            $resolve('');
        }
    });
  }
  

  $scope.buildListFilter = function($list){
      let lResult = null;
      
      if($list.limit>0){
          lResult = {
              max_item_count : $list.limit
          }
      }

      if($list.sort != '' && $list.sort != 'auto'){
        if(lResult==null) lResult = {};
        lResult.sort_fields = [{field: $list.sort, desc: $list.sort_reverse}];
      }

      if($list.shuffle){
        if(lResult==null) lResult = {};
        lResult.shuffle = $list.shuffle;
      }
      
      if($list.filter_group != null){
        if(lResult==null) lResult = {};

        lResult.filter_group = $scope.normalizeFilterGroup(angular.copy($list.filter_group));
      }
      return lResult;
  }

  $scope.normalizeFilterGroup = function($filter_group){
    if($filter_group.filters){
        $filter_group.filters.forEach(function($filter){
            if(['in','not_in'].indexOf($filter.operator) >= 0){
                if(typeof $filter.value.push == 'undefined'){
                  $filter.value = $filter.value.split(",");
                  $filter.value.forEach(function($val){
                      if(!isNaN($val)){
                          $val = Number($val)
                      }
                  });
                }
            }
            else{
                if(!isNaN($filter.value)){
                    $filter.value = Number($filter.value);
                }
            }
        });
    }
    
    if($filter_group.filter_groups){
        $filter_group.filter_groups.forEach(function($group){
            $scope.normalizeFilterGroup($group);
        });
    }

    return $filter_group;
  }

  $scope.createList = function($view, $type, $alias, $sort = '', $sortReverse = false, $limit = 0,$list=null){
    const lList = $list == null ? {alias : $alias, type: $type} : $list;

    const lTypedDatas = {
      'listings' : {
        search_engine_options : {
          type : 'full',
          filter_tags: 'none',
          scope_class: 'si-border'
        },
        displayed_vars: {
          main: ["address", "city", "price", "rooms","category", "subcategory"]
        }
      },
      'brokers' : {
        search_engine_options : {
          type : 'full'
        },
        displayed_vars: {
          main: ["first_name", "last_name", "phone", "title"]
        }
      }
    }

    lList.sort = $sort==''  ? null : $sort;
    lList.sort_reverse = $sortReverse;
    lList.limit = $limit;
    lList.list_layout       = {type: 'standard', preset: 'standard', scope_class : 'si-border'};
    lList.list_item_layout  = {type: 'standard', preset: 'standard', scope_class : 'si-border'};
    
    lList.searchable = true;
    lList.sortable = true;
    lList.mappable = true;

    if(lTypedDatas[$type]!=undefined){
      lList.search_engine_options = lTypedDatas[$type].search_engine_options;
      lList.list_item_layout.displayed_vars = lTypedDatas[$type].displayed_vars;
    }

    lList.source = $view;
    lList.search_token = '';

    return lList;
  }

  $scope.strToJson = function($source){
    
  }

  
  return $scope;
}]);

siApp
.factory('$siUser', ['$siApi','$siUI', '$q','$rootScope',
function $siUser($siApi, $siUI, $q,$rootScope){
    const $scope = {
      info: null,
      isLoggedIn: false,
      credentials: null
    }
    
    $scope.init = function(){
      $scope.load();

      if($scope.info != null){
        $scope.isLoggedIn = true;
      }
    }


    $scope.load = function(){
      $scope.info = wpSiApiSettings.si_user_account;
    }

    $scope.getCredentials = function(){
      //if($scope.credentials != null) return $q.resolve($scope.credentials);

      return $scope.login();
    }

    $scope.login = function(){
      const lDefer = $q.defer();

      $siUI.dialog('account-login',null,{clickOutsideToClose: false}).then($result => {
          $scope.credentials = $result;
          lDefer.resolve($result);
      })


      return lDefer.promise;
    }


    $scope.init();
    return $scope;
}
])


siApp
.factory('$siList', [
  '$siApi',
  function $siList($siApi){
    let $scope ={};
    $scope.dictionary = null;

    $scope.init = function($view_id){
      console.log('loading lexicon',$view_id);
      $scope.fetchDictionary($view_id);
    }

    $scope.fetchDictionary = function($view_id){
      
      if($view_id == null) return;

      
      $siApi.rest('dictionary').then(function($response){
        $scope.dictionary = $response;
      });
    }

    $scope.getCountryList = function(){
      console.log($scope.dictionary);
      if($scope.dictionary == null) return [];
      return $scope.toArray($scope.dictionary.country);
    }

    $scope.getStateList = function(){
      console.log($scope.dictionary);
      if($scope.dictionary == null) return [];
      return $scope.toArray($scope.dictionary.state);
    }

    $scope.getRegionList = function(){
      console.log($scope.dictionary);
      if($scope.dictionary == null) return [];
      return $scope.toArray($scope.dictionary.region);
    }

    $scope.getCityList = function(){
      console.log($scope.dictionary);
      if($scope.dictionary == null) return [];
      return $scope.toArray($scope.dictionary.city);
    }

    $scope.getCategoryList = function(){
      console.log($scope.dictionary);
      if($scope.dictionary == null) return [];
      return $scope.toArray($scope.dictionary.listing_category);
    }

    $scope.getSubcategoryList = function(){
      console.log($scope.dictionary);
      if($scope.dictionary == null) return [];
      return $scope.toArray($scope.dictionary.listing_subcategory);
    }

    $scope.getBuildingCategoryList = function(){
      console.log($scope.dictionary);
      if($scope.dictionary == null) return [];
      return $scope.toArray($scope.dictionary.building_category);
    }

    $scope.getLicenseList = function(){
      if($scope.dictionary == null) return [];
      return $scope.toArray($scope.dictionary.broker_license_type);
    }

    $scope.getOfficeList = async function(){
      if($scope.offices == null) return [];
      if($scope.offices != undefined) return $scope.offices;
      const lResponse = await $siApi.call('office/view/' + $configs.source.id + '/fr/items');
      console.log('getOffice await response', lResponse);

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

      console.log('toArray:', lResult);
      return lResult;
    }

    return $scope;
  }
]);

siApp
.factory('$siApi', [
  '$http','$q', '$interval',
  function $siApi($http,$q,$interval){
    const $scope = {
      nonceTimeout: 2
    };
    
    $scope.init = function(){
      $interval( _ => {
        //$scope.renewNonce();
      },$scope.nonceTimeout * 60 * 1000);
      console.log('$siApi/init');
    }

    $scope.renewNonce = function(){
      console.log('$siApi/renewNonce');
      $options = {
        url     : wpSiApiSettings.root + 'si-rest/new_nonce',
        method  : 'GET',       
      };

      // Setup promise object
      $q(function($resolve, $reject){
          $http($options).then(
            // On success
            function success($result){
              if($result.status=='200'){
                wpSiApiSettings.nonce = $result.data;
                $resolve();
              }
              else{
                $reject(null);
              }
            },
            // On fail
            function fail($error){
              console.log('Fail on path', $path, 'with data' , $data , $error);
            }
          )
      });
    }   
    
    $scope.rest = function($path, $data, $options){
      $options = angular.merge({
        url     : wpSiApiSettings.root + 'si-rest/' + $path,
        method  : typeof($data)=='undefined' ? 'GET' : 'POST',        
        headers: {
           'X-WP-Nonce': wpSiApiSettings.nonce
         },
      }, $options);

      if($options.method=='GET'){
        $options.params = $data;
      }
      else{
        $options.data = $data;
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
                $reject($result.status);
              }
            },
            // On fail
            function fail($error){
              $reject($error.status);
              console.log('Fail on path', $path, 'with data' , $data , $error);
            }
          )
      });

      return lPromise;
    }

    $scope.call = function($path, $data, $options, $credentialInfos){
      $path = (typeof $path.push == 'function') ? $path.join('/') : $path;
      $options = angular.merge({
        url     : wpSiApiSettings.api_root + '/api/' + $path,
        method  : typeof($data)=='undefined' ? 'GET' : 'POST',        
      }, $options);

      if($options.method=='GET'){
        $options.params = $data;
      }
      else{
        $options.data = $data;
      }

      if($credentialInfos != undefined){
        $options.headers = {
          "x-si-account": $credentialInfos.account_id,
          "x-si-api" : $credentialInfos.api_key,
          "x-si-appId" : $credentialInfos.app_id,
          "x-si-appVersion" : $credentialInfos.app_version
        }
      }

      let lPromise = $q(function($resolve,$reject){
        $http($options).then(
          function onSuccess($response){
            if($response.status == '200'){
              $resolve($response.data);
            }
            else{
              $reject(null);
            }
          },
          function onFail($error){
            console.log('Fail on path', $path, 'with data' , $data , $error);
            $reject($error);
          }
        )
      });

      return lPromise;
    }

    $scope.portal = function($path, $data, $options, $credentialInfos){
      const lOptions = Object.assign({
        method: 'POST'
      }, $options);
  
      lOptions.url = 'https://portal-api.source.immo/api/' + $path;
  
      if($data != null){
        if(lOptions.method=='POST'){
          lOptions.data = $data;
        }
        else{
          lOptions.params = $path;
        }
      }
  
      if($credentialInfos != undefined){
        if(!lOptions.params) lOptions.params = {};
        
        lOptions.params.at = $credentialInfos.credentials.authTokenKey;
  
        if($credentialInfos.account_id != null){
          lOptions.params.la = $credentialInfos.account_id;
        }
      }
      
  
      return $q(($resolve,$reject) => {
        $http(lOptions).then($response => {
          //$scope.dialog('signin', null);
          if($response.status==200){
            $resolve($response.data);
          }
        })
        .catch($err => { console.log($path, 'call failed', $err) });
      })
      
    }

    $scope.init();

    return $scope;
  }
])

siApp
.factory('$siConfigs',['$rootScope','$q','$siApi','$siUI','$timeout', function $siConfigs($rootScope,$q,$siApi,$siUI,$timeout){
  const $scope = {
    configsBackup: null
  }

  $scope.load = function(){
    return $q( function($resolve,$reject){
      $siApi.rest('configs')
        .then(function($configs){
          $scope.configs = $configs;
          
          $resolve($scope.configs);

        })
        .then(function(){
          return $scope.loadBackup()
        })
        .then($backup => {
          if($backup != null && $backup != ''){
            $scope.configsBackup = JSON.parse($backup);
          }
        });
    });
  }

  $scope.loadNetwork = function(){
    return $q( function($resolve,$reject){
      $siApi.rest('configs/network')
        .then(function($configs){
          $scope.networkConfigs = $configs;
          $resolve($scope.networkConfigs);
        });
    });
  }

  $scope.save = function($configs){
    $scope.configs = $configs;
    return $siApi.rest('configs',{settings: $configs},{method: 'POST'})
  }

  $scope.saveNetwork = function($configs){
    $scope.networkConfigs = $configs;
    return $siApi.rest('configs/network',{settings: $configs},{method: 'POST'})
  }

  $scope.backup = function(){
    $scope.configsBackup = angular.copy($scope.configs);
    return $siApi.rest('configs/backup',null,{method: 'POST'});
  }

  $scope.loadBackup = function(){
    return $siApi.rest('configs/backup');
  }

  $scope.clearBackup = function(){
    $scope.configsBackup = null;
    return $siApi.rest('configs/backup',null, {method: 'DELETE'});
  }

  $scope.restoreBackup = function($options){
    $options = Object.assign({
      directMethod: null
    },$options);

    if($options.directMethod != null && typeof $scope[$options.directMethod] == 'function'){
      return $scope[$options.directMethod]();
    }

    const fnConfirm = _ => $siUI.confirm('Attention','Are you sure?\nThis will replace your current configuration');
    $siUI.confirm('Attention','Would you like to restore everything (including credentials token) or merge with the current configuration?',{ok: 'Merge',cancel: 'Everything'})
      .then(
        function merge(){
          fnConfirm().then(_ => {
            $scope.restoreMerge();
          });
        },
        function everything(){
          fnConfirm().then(_ => {
            $scope.restoreEverything();
          })
        }
      )
  }

  $scope.restoreEverything = function(){
    console.log('restoring everything from',$scope.configsBackup);
    
    const lConfigs = angular.copy($scope.configsBackup);

    $scope.clearBackup()
      .then(_ => {
        return $scope.save(lConfigs);
      })
      .then(_ => {
        $scope.configsBackup = null;
        $siUI.show_toast('Settings restored');
        window.location.reload(true);
      });
  }

  $scope.restoreMerge = function(){
    const lNewConfigs = $scope.mergeBackupToConfigs($scope.configs);
   
    $scope.clearBackup()
      .then(_ => {
        return $scope.save(lNewConfigs);
      })
      .then(_ => {
        $scope.configsBackup = null;
        $siUI.show_toast('Settings restored');
        window.location.reload(true);
      })
    
  }

  $scope.mergeBackupToConfigs = function($configs){
    const lBackup = angular.copy($scope.configsBackup);
    const lExceptionKeys = ['account_id','api_key','app_id','app_version','default_view'];
    const lDefaultView = $scope.data_views.find($e => $e.id == $configs.default_view);
    
    Object.keys($configs)
      .filter($k => lExceptionKeys.includes($k))  // take only the keys that we want to keep from new settings
      .forEach($k => {
        lBackup[$k] = $configs[$k];
      });
    
    lBackup.lists.forEach($l => {
      $l.source = lDefaultView;
    });

    return lBackup;

  }

  $scope.replaceAccount = function($newCredentials){
    const lPreviousValues = {
      account_id :$scope.configs.account_id,
      api_key: $scope.configs.api_key,
      default_view: $scope.configs.default_view
    };

    console.log('$siConfigs/replaceAccount',angular.copy($scope.configs));
    
    $scope.configs.account_id = $newCredentials.account_id;
    $scope.configs.api_key = $newCredentials.api_key;
    $scope.configs.default_view = $newCredentials.default_view.id;

    $scope.configs.lists.forEach($e => {
      if($e.source.id == lPreviousValues.default_view){
        $e.source = $newCredentials.default_view;
      }
    });

    console.log('$siConfigs/replaceAccount',$scope.configs);

    return $scope.save($scope.configs);
  }

  return $scope;
}]);

siApp
.factory('$siUI',['$mdDialog','$mdToast','$q','$rootScope', function $siUI($mdDialog,$mdToast,$q,$rootScope){
  $scope = {};

  /**
   * Display a confirmation box
   * @param {string} $title Main confirm message
   * @param {string} $message Optional. Additionnal information to help understand the main message. Default : empty
   * @param {object} $options Optional. Additionnal options to configure button labels and more. Default : null
   * @return {promise}
   */
  $scope.alert = function($message, $options){
    $message = typeof($message) == 'undefined' ? '' : $message;

    $options = angular.merge({
      ev: null,
      ok: 'OK'
    }, $options);
    
    // Appending dialog to document.body to cover sidenav in docs app
    const lDialog = $mdDialog.alert()
                    .clickOutsideToClose(false)
                    .textContent($message.translate())
                    .ok($options.ok)
                    .targetEvent($options.ev)
                    lDialog._options.parent = angular.element(document.body);

    return $mdDialog.show(
      lDialog
    );
  }

  /**
   * Display a confirmation box
   * @param {string} $title Main confirm message
   * @param {string} $message Optional. Additionnal information to help understand the main message. Default : empty
   * @param {object} $options Optional. Additionnal options to configure button labels and more. Default : null
   * @return {promise}
   */
  $scope.confirm = function($title, $message, $options){
    const lTitle = ($message == undefined) ? '': $title;
    const lMessage = ($message == undefined) ? $title : $message;

    $options = angular.merge({
      ev: null,
      ok: 'OK',
      cancel: 'Cancel',
      multiple: true
    }, $options);
    
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title(lTitle.translate())
          .htmlContent(lMessage.translate().replace("\n",'<br>'))
          .multiple($options.multiple)
          .targetEvent($options.ev)
          .ok($options.ok.translate())
          .cancel($options.cancel.translate());

    confirm._options.parent = angular.element(document.body);
    return $q(($resolve,$reject) => {
      $mdDialog.show(confirm).then(
        function acknowledge(){
          console.log(`user has acknowledged ${lMessage}`);
          $resolve();
        },
        function reject(){
          console.log(`user has rejected ${lMessage}`);
          $reject();
        }
      );
    });
  }

  /**
   * Display a notification toast in the top right of the screen
   * @param {string} $message 
   */
  $scope.show_toast = function($message){
    try{
      $mdToast.show(
        $mdToast.simple()
          .textContent($message.translate())
          .position('top right')
          .hideDelay(2000)
      );
    }
    catch($ex){
      console.log($ex);
      console.log($message);
    }
    
  }

  /**
   * Call a dialog to open
   * @param {string} $template Url or String containing the template 
   * @param {*} $params parameters to pass to the dialog
   * @param {*} $options options for the dialog
   */
  $scope.dialog = function($name, $params=null, $options=null){
    const lOptions = Object.assign({
        parent: angular.element(document.body),
        targetEvent: null,
        clickOutsideToClose:true,
        fullscreen: true,
        multiple:true,
        id: $name + '-dialog',
        locals : {
          $params: $params
        }
      },$options
    );

    normalizeName = $name.replace(/(-\D)/gi, ($m) => $m.substr(1,2).toUpperCase() + $m.substr(2))
    templatePath = wpSiApiSettings.base_path + 'views/admin/dialogs/' + $name + '.html?t=' + (new Date()).getTime();
    dialogController = normalizeName + 'DialogCtrl';

    console.log('$siUI/dialog', templatePath,dialogController,$params);

    lOptions.template = `<md-dialog id="${$name}-dialog" ng-controller="${dialogController}" ng-init="init($params)"><ng-include src="'${templatePath}'"></ng-include></md-dialog>`;
    lOptions.controller = 'siDialogController'

    // if($template.match(/^~.+\.(html|php|vbhtml|cshtml)/).length > 0){
    //   lOptions.templateUrl = $template.replace('~', wpSiApiSettings.base_path) + '?t=' + (new Date()).getTime();
    //   // detect controller from filename
    //   if(lOptions.controller == undefined){
    //     const lPageName = $template.split("/").last().match(/(.+)\./)[1];
    //     const lCtrlName = lPageName.replace(/-|\./g,'_') + 'Ctrl';
    //     console.log('search for controller', lCtrlName, typeof window[lCtrlName]);
    //     if(typeof window[lCtrlName] == 'function'){
    //       console.log('assign root base function as dialog controller');
    //       lOptions.controller = window[lCtrlName];
    //     }
    //     else{
    //       const lCtrlProvider = siApp._invokeQueue
    //                               .filter($p => $p[0] == "$controllerProvider")
    //                               .find($p => $p[2][0] == lCtrlName);
    //       if(lCtrlProvider != null) lOptions.controller = lCtrlProvider[2][1];
    //     }
        
    //   }
    // }
    // else{
    //   lOptions.template = $template.replace(/~/g, wpSiApiSettings.base_path);
    // }
    
    
    return $mdDialog.show(lOptions);
  }

  $scope.getLocalFile = function($fileFilter = ''){
    
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
      console.log('The File APIs are not fully supported in this browser.');
      return $q.reject();
    }

    const lDefer = $q.defer();
    const inputElm = document.createElement('input');
    inputElm.setAttribute('type','file');
    inputElm.setAttribute('accept', $fileFilter);
    inputElm.style.opaciy = 0;
    inputElm.style.position = "absolute";

    inputElm.addEventListener('change', _ => {
      if (!inputElm.files) {
        console.log("This browser doesn't seem to support the `files` property of file inputs.");
        lDefer.reject();
      } else if (!inputElm.files[0]) {
        console.log("No file selected.");
        lDefer.reject();
        inputElm.remove();
      } else {
        let file = inputElm.files[0];
        let fr = new FileReader();
        fr.onload = _ => {
          lDefer.resolve(fr.result);
          inputElm.remove();
        };
        fr.readAsText(file);
      }
    });
    
    document.body.appendChild(inputElm);
    inputElm.click();

    return lDefer.promise;
  }

  $scope.getPortalCredentials = function(){
    return $q( ($resolve, $reject) => {  
      $scope.dialog('signin')
      .then(
        $credentials => {
          $resolve($credentials)
        },
        _ => {
          $reject();
        }
      )
    });
  }

  return $scope;
}]);


siApp
.factory('$siWP', ['$rootScope','$q', '$siApi', function $siWP($rootScope,$q,$siApi){

  const $scope = {
    pages: {},
    languages: null
  };


  $scope.loadPages = function(){
    return $q(function($resolve, $reject){
      $scope.loadLanguages().then($languages => {
        callList = $languages.map( $l => function(){return $scope.loadPagesForLang($l.code)});
        $q.all(callList.map($c => $c()))
        .then($results => {
          $languages.forEach( ($l,$index) => {
            $scope.pages[$l.code] = $results[$index];
          })
          
          console.log('loadPages', $scope.pages);
          $resolve($scope.pages);
        })
        .catch($err => {console.error($err)})
      });
    });
  }

  $scope.loadPagesForLang = function($lang){
    return $siApi.rest('page/list',{locale: $lang, type: ''},{method: 'GET'});
  }

  $scope.loadLanguages = function(){
    return $q(function($resolve, $reject){
      if($scope.languages != null){
        $resolve($scope.languages);
        return;
      }
      
      $siApi.rest('language/list',null,{method : 'GET'})
      .then($result => {
        $scope.languages = $result;
        
        $resolve($scope.languages);
      })
      .catch($err => {console.error($err)})
    });
  }

  $scope.updatePage  = function ($id, $newContent){

  }

  $scope.addPage = function($title, $content, $lang, $originalId){
    return $q( ($resolve, $reject) => {
      $siApi.rest('page',{lang: $lang, page_id: 'NEW', title: $title, content: $content, original_page_id: $originalId}).then($response => {
        
        $resolve($response);

        $scope.loadPages();
      });
    });
  }


  return $scope;
}])

/**
 * Sets basic page handler interface function
 */
function BasePageController($pageId, $scope, $rootScope){
  $scope.pageId = $pageId;
  $scope.callback = null;
  $scope.actions = [
      { label: 'OK', action: function () { $scope.cancel() } }
  ];
  
  /**
   * Initialize page
   * 
   * Add a listener for broadcast event
   */
  $scope._pageInit_ = function () {
      console.log('pageInit for', $scope.pageId, 'called');
      $scope.$on('on-' + $scope.pageId, function ($event, $params, $callback) {
        console.log('instance of page', $scope.pageId, 'called with', $params);
          if (typeof ($scope.init) == 'function') {
              $scope.init($params);
          }

          $scope.open_page($scope.pageId);
          $scope.callback = $callback;
      });
  }


  $scope.cancel = function () {
      $scope.close_page();
  }

  $scope.return = function($result){
    $scope.callback($result);
    $scope.close_page();
  }

  $scope.open_page = function($page_id){
    $rootScope.current_page = $page_id;
  }

  $scope.close_page = function(){
    $rootScope.current_page = 'home';
  }

  return $scope;
}