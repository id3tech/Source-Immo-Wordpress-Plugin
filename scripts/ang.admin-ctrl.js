
/**
 * Main Configuration Controller
 */
ImmoDbApp
.controller('mainConfigurationCtrl', function($scope, $rootScope){
  $scope.route_elements = {
      '{{id}}' : 'ID',
      '{{transaction}}' : 'Transaction type',
      '{{location.region}}' : 'Region',
      '{{location.city}}' : 'City',
      '{{location.street}}' : 'Street',
      '{{location.civic_address}}' : 'Civic address'
  }


  $scope.init = function(){

  }

  $scope.addRouteElement = function($item,$elm){
    $item.route += $elm;
  }

  $scope.addRoute = function(){
    let lLocale = '';
    for (let $key in $scope.lang_codes) {
      if($scope.configs.detail_routes.map(function(e) {return e.lang}).indexOf($key)<0){
        lLocale = $key;
      }
    }

    $scope.configs.detail_routes.push({lang: lLocale, route : ''});
  }

  $scope.removeRoute = function($route){
    let lNewRoutes = [];
    $scope.configs.detail_routes.forEach(function($e){
      if($e!=$route){
        lNewRoutes.push($e);
      }
    });
    $scope.configs.detail_routes = lNewRoutes;
  }

  //
  $scope.hasMinRouteCount = function(){
    return $scope.configs.detail_routes.length==1;
  }
  $scope.hasMaxRouteCount = function(){
    let lResult = true;
    if($scope.configs.detail_routes){
      for (let $key in $scope.lang_codes) {
        if($scope.configs.detail_routes.map(function(e) {return e.lang}).indexOf($key)<0){
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
.controller('streamListCtrl', function($scope, $rootScope){
  $scope.init = function(){

  }

  $scope.add = function(){
    let lNew = {
      alias: 'New stream'.translate(),
      source :'default',
      sort: 'auto',
      limit: 0,
      filters : null
    }

    $scope.dialog('streamEdit', lNew).then(function($result){
      lNew = angular.merge(lNew,$result);
      $scope.configs.streams.push(lNew);
    });
  }

  $scope.edit = function($stream){
    $scope.dialog('streamEdit', $stream).then(function($result){
      $stream = angular.merge($stream,$result);
    });
  }

  $scope.remove = function($stream){
    $scope.confirm('Are you sure you want to remove this stream?', 'This action could renders some sections of your site blank', {ok: 'Continue'}).then(function(){
      let lNewStreams = [];
      $scope.configs.streams.forEach(function($e){
        if($e!=$stream){
          lNewStreams.push($e);
        }
      });
      $scope.configs.streams = lNewStreams;
      
      $scope.show_toast('Stream removed');
    });
  }

  $scope.getStreamShortcode = function($stream){
    return '[immodb alias="' + $stream.alias + '"]';
  }
});

// Edit
ImmoDbApp
.controller('streamEditCtrl', function($scope, $rootScope, $mdDialog){
  BaseDialogController('streamEdit', $scope, $rootScope, $mdDialog);

  $scope.model = {};
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
    $scope.model = angular.copy($params);
    $scope.setTitle('Edit "{0}"'.translate().format($params.alias));
  }

  $scope.addFilter = function(){
    if($scope.model.filters==null){
      $scope.model.filters = [];
    }

    $scope.model.filters.push({field: '', operator: '=', value: ''});
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
    sources: []
  }

  $scope.init = function(){
    $scope.load_configs();
  }

  $scope.load_configs = function(){
    $scope.api('configs').then(function($response){
      $scope.configs = $response;
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
