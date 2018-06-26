
/**
 * Main Configuration Controller
 */
ImmoDbApp
.controller('homeCtrl', function($scope, $rootScope){

  console.log('configs controller loaded');

  $scope.route_elements = {
      '{{id}}' : 'ID',
      '{{transaction}}' : 'Transaction type',
      '{{location.region}}' : 'Region',
      '{{location.city}}' : 'City',
      '{{location.street}}' : 'Street',
      '{{location.civic_address}}' : 'Civic address'
  }


  $scope._pageInit_ = function(){

  }

  $scope.addRouteElement = function($item,$elm){
    $item.route += $elm;
  }

  $scope.addRoute = function($list){
    let lLocale = '';
    for (let $key in $scope.lang_codes) {
      if($list.map(function(e) {return e.lang}).indexOf($key)<0){
        lLocale = $key;
      }
    }

    $list.push({lang: lLocale, route : ''});
  }

  $scope.removeRoute = function($route,$list_name){
    let lNewRoutes = [];
    let lList = $scope.configs[$list_name];
    lList.forEach(function($e){
      if($e!=$route){
        lNewRoutes.push($e);
      }
    });
    $scope.configs[$list_name] = lNewRoutes;
  }

  //
  $scope.hasMinRouteCount = function($list){
    return $list.length==1;
  }
  $scope.hasMaxRouteCount = function($list){
    let lResult = true;
    if($list){
      for (let $key in $scope.lang_codes) {
        if($list.map(function(e) {return e.lang}).indexOf($key)<0){
          lResult = false;
        }
      }
    }
    return lResult;
  }
});



/**
 * Views Controllers
 */

 // List
ImmoDbApp
.controller('listCollectionCtrl', function($scope, $rootScope){
  $scope.init = function(){

  }

  $scope.add = function(){
    $scope.show_page('listEdit', null).then(function($result){
      lNew = $result;
      $scope.configs.lists.push(lNew);
    });
  }

  $scope.edit = function($list){
    $scope.show_page('listEdit', $list).then(function($result){
      $list = angular.merge($list,$result);
    });
  }

  $scope.remove = function($list){
    $scope.confirm('Are you sure you want to remove this list?', 'This action could renders some sections of your site blank', {ok: 'Continue'}).then(function(){
      let lNewlists = [];
      $scope.configs.lists.forEach(function($e){
        if($e!=$list){
          lNewlists.push($e);
        }
      });
      $scope.configs.lists = lNewlists;

      $scope.show_toast('list removed');
    });
  }

  $scope.getListShortcode = function($list){
    return '[immodb alias="' + $list.alias + '"]';
  }
});

// Edit
ImmoDbApp
.controller('listEditCtrl', function($scope, $rootScope){
  BasePageController('listEdit', $scope,$rootScope);

  $scope.model = {};
  $scope._original = null;
  $scope.filter_operators = {
    '='       : 'Equals'.translate(),
    '!='      : 'Different from'.translate(),
    'in'      : 'One of'.translate(),
    'not in'  : 'Not one of'.translate(),
    'like'    : 'Contains'.translate(),
    'not like': 'Does not contains'.translate()
  };

  $scope.actions = [
    {label: 'Apply'.translate(), action: function(){$scope.return($scope.model);}},
    {label: 'Cancel'.translate(), action: $scope.cancel},
  ];

  $scope.init = function($params){
    console.log('listEdit init');
    if($params==null){
      $scope.model = {
        alias: 'New list'.translate(),
        source :'default',
        type: 'listings',
        sort: 'auto',
        limit: 0,
        searchable:true,
        sortable:true,
        list_layout : { preset: 'standard', scope_class : '', custom:null},
        list_item_layout : { preset: 'standard', scope_class : '', custom:null},
        filters : null
      }
    }
    else{
      $scope.model = angular.copy($params);
    }

    $scope._original = $params;
  }

  $scope.addFilter = function(){
    if($scope.model.filters==null){
      $scope.model.filters = [];
    }

    $scope.model.filters.push({field: '', operator: '=', value: ''});
  }

  $scope.saveOrClose = function(){
    if($scope.hasChanged()){
      $scope.return($scope.model);
    }
    else{
      $scope.cancel();
    }
  }

  $scope.hasChanged = function(){
    return !$scope.isSame($scope.model,$scope._original);
  }
});

/**
 * MAIN ROOT CONTROLLER
 */
ImmoDbApp
.controller('mainCtrl', function($scope, $rootScope, $mdDialog, $q, $http, $mdToast){
  $scope.configs = {};
  $scope.lang_codes = {
    fr: 'Français',
    en: 'English',
    es: 'Español'
  }
  $scope.global_list = {
    sources: [],
    list_types: [
      {key: 'listings', label: 'Listings'},
      {key: 'brokers', label: 'Brokers'},
      {key: 'cities', label: 'Cities'}
    ],
    list_layouts:[
      {name: 'standard', label: 'Standard'},
      {name: 'custom', label: 'Custom'}
    ],
    list_item_layouts:[
      {name: 'standard', label: 'Standard'},
      {name: 'reduced', label: 'Reduced'},
      {name: 'minimal', label: 'Minimal'},
      {name: 'custom', label: 'Custom'}
    ],
  }

  $rootScope.current_page = 'home'
  $scope.pages = {
    'home': {label: 'Home'.translate(), style: ''},
    'listEdit': {label: 'List editing'.translate(), style: 'transform:translateX(-100%);'},
  }

  $scope.init = function(){
    $scope.load_configs();
  }

  $scope.load_configs = function(){
    $scope.api('configs').then(function($response){
      $scope.configs = $response;
    });
  }

  $scope.reset_configs = function(){
    $scope.api('configs',null, {method:'PATCH'}).then(function($response){
      $scope.configs = $response;
      $scope.show_toast('Configuration reset to demo mode');
    });
  }

  $scope.save_configs = function(){
    $scope.api('configs',{settings: $scope.configs}).then(function($response){
      $scope.show_toast('Save completed');
    });
  }

  /*
  * UI
  */

  $scope.show_page = function($page_id, $params){
    console.log('page is called', $page_id);
    let lPromise = $q(function($resolve, $reject){
      $rootScope.$broadcast(
          'on-' + $page_id,     // broadcast event
          $params,                 // page parameters
          function($result){      // callback handler
            $resolve($result);
          });
    });

    return lPromise;
  }

  /**
   * Display a confirmation box
   * @param {string} $title Main confirm message
   * @param {string} $message Optional. Additionnal information to help understand the main message. Default : empty
   * @param {object} $options Optional. Additionnal options to configure button labels and more. Default : null
   * @return {promise}
   */
  $scope.confirm = function($title, $message, $options){
    $options = angular.merge({
      ev: null,
      ok: 'OK',
      cancel: 'Cancel'
    }, $options);
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title($title.translate())
          .textContent($message.translate())
          .targetEvent($options.ev)
          .ok($options.ok.translate())
          .cancel($options.cancel.translate());

    confirm._options.parent = angular.element(document.body);
    return $mdDialog.show(confirm);
  }

  /**
   * Display a notification toast in the top right of the screen
   * @param {string} $message 
   */
  $scope.show_toast = function($message){
    $mdToast.show(
      $mdToast.simple()
        .textContent($message.translate())
        .position('top right')
        .hideDelay(3000)
    );
  }

  /**
   * Call a dialog to open
   * @param {string} $dialog_id 
   * @param {*} $params 
   */
  $scope.dialog = function($dialog_id, $params){
    let lPromise = $q(function($resolve, $reject){
      $rootScope.$broadcast(
          'on-' + $dialog_id,     // broadcast event
          $params,                 // dialog parameters
          function($result){      // callback handler
            $resolve($result);
          });
    });

    return lPromise;
  }



  /**
   * Call the API
   * @param {string} $path Endpoint to the api call
   * @param {*} $data Data object to send in the request
   * @param {*} $options Options to add at the $http call
   * @return {promise} Promise object
   */
  $scope.api = function($path, $data, $options){
      $options = angular.merge({
        url     : wpApiSettings.root + 'immodb/' + $path,
        method  : typeof($data)=='undefined' ? 'GET' : 'POST',
        data : $data,
        headers: {
           'X-WP-Nonce': wpApiSettings.nonce
         },
      }, $options);

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
              $scope.show_toast($error);
            }
          )
      });

      return lPromise;
  }

  /**
   * Copy some data into clipboard
   * @param {*} $data Information to put in the clipboard
   */
  $scope.copy = function($data){
    // Make sure $data is a string. If it's and object, transform via JSON
    let lContent = '';
    if($data !== null && typeof $data === 'object'){
      lContent = JSON.stringify($data);
    }
    else{
      lContent = $data;
    }

    let lTextarea = document.createElement("textarea");
    lTextarea.textContent = lContent;
    lTextarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(lTextarea);
    lTextarea.select();
    try {
      $scope.show_toast('Copied to clipboard');
      document.execCommand("copy");  // Security exception may be thrown by some browsers.
    } 
    catch (ex) {
        console.warn("Copy to clipboard failed.", ex);
        return false;
    } 
    finally {
      document.body.removeChild(lTextarea);
    }

  }

  $scope.isSame = function($objA, $objB){
    if($objA != null && $objB != null){
      
      for (const key in $objA) {
        if(key == '$$hashKey') continue;
        if($objA[key]!=null && $objB[key]!=null){
          if ($objA.hasOwnProperty(key) && $objB.hasOwnProperty(key)) {
            if(Array.isArray($objA[key])){
              if($objA[key].length != $objB[key].length){
                //console.log(key, 'lengths differ');
                return false;
              }
              else{
                for(let i = 0;i<$objA[key].length;i++){
                  if(!$scope.isSame($objA[key][i], $objB[key][i])){
                    return false;
                  }
                }
              }
            }
            else if(typeof($objA[key]) == 'object'){
              if(!$scope.isSame($objA[key], $objB[key])){
                //console.log(key, 'differ');
                return false;
              }
            }
            else if($objA[key] != $objB[key]){
              //console.log(key, 'values differ');
              return false;
            }
            
          }
          else{
            //console.log('$objB does not have key ', key);
            return false;
          }
        }
        else{
          //console.log(key,'is null');
        }
      }

    }
    else if ($objA == null || $objB == null){
      return false;
    }

    return true;
  }

});

/**
 * Sets basic dialog handler interface function
 */
function BaseDialogController($dialogId, $scope, $rootScope, $mdDialog){
  $scope.dialogId = $dialogId;
  $scope.callback = null;
  $scope.title = $dialogId.replace('-',' ');
  $scope.actions = [
      { label: 'OK', action: function () { $scope.cancel() } }
  ];
  
  /**
   * Initialize dialog
   * 
   * Add a listener for broadcast event
   */
  $scope._dialogInit_ = function () {
      
      $scope.$on('on-' + $scope.dialogId, function ($event, $params, $callback) {
        console.log('instance of dialog', $scope.dialogId, 'called with', $params);
          if (typeof ($scope.init) == 'function') {
              $scope.init($params);
          }

          $scope.open($scope.dialogId);
          $scope.callback = $callback;
      });
  }

  $scope.setTitle = function($new_title){
    $scope.title = $new_title;
  }

  $scope.open = function($dialogId){
    return $mdDialog.show({
        contentElement: '#' + $dialogId,
        parent: angular.element(document.body),
        targetEvent: null,
        clickOutsideToClose: true,
        fullscreen: true // Only for -xs, -sm breakpoints.
    });
  }

  $scope.cancel = function () {
      $mdDialog.cancel();
  }

  $scope.return = function($result){
    $scope.callback($result);
    $mdDialog.cancel();
  }

  return $scope;
}

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