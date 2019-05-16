/* SERVICES */
ImmoDbApp
.factory('$immodbUtils', [
function $immodbUtils(){
  let $scope = {};

  $scope.stringToOptionList = function($source){
    if($source == null || $source == undefined) return null;
    if($source.indexOf('|') < 0) return [$source];

    let lKeyValues = $source.split("|");
    let lResult = [];
    lKeyValues.forEach(function($e){
      let lItemArr = $e.split(":");
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

  return $scope;
}]);


ImmoDbApp
.factory('$immodbList', [
  '$immodbApi',
  function $immodbList($immodbApi){
    let $scope ={};
    $scope.dictionary = null;

    $scope.init = function($view_id){
      $scope.fetchDictionary($view_id);
    }

    $scope.fetchDictionary = function($view_id){
      if($view_id == null) return;

      $immodbApi.rest('dictionary').then(function($response){
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

ImmoDbApp
.factory('$immodbApi', [
  '$http','$q',
  function $immodbApi($http,$q){
    $scope = {};

    $scope.rest = function($path, $data, $options){
      $options = angular.merge({
        url     : wpApiSettings.root + 'immodb/' + $path,
        method  : typeof($data)=='undefined' ? 'GET' : 'POST',        
        headers: {
           'X-WP-Nonce': wpApiSettings.nonce
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
                $reject(null);
              }
            },
            // On fail
            function fail($error){
              console.log('Fail on path', $path, 'with data' , $data , $error);
              $scope.show_toast($error);
            }
          )
      });

      return lPromise;
    }

    $scope.call = function($path, $data, $options){
      $path = (typeof $path.push == 'function') ? $path.join('/') : $path;
      $options = angular.merge({
        url     : wpApiSettings.api_root + '/api/' + $path,
        method  : typeof($data)=='undefined' ? 'GET' : 'POST',        
      }, $options);

      if($options.method=='GET'){
        $options.params = $data;
      }
      else{
        $options.data = $data;
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

    return $scope;
  }
])


ImmoDbApp
.factory('$immodbUI',['$mdDialog','$mdToast','$q','$rootScope', function $immodbUI($mdDialog,$mdToast,$q,$rootScope){
  $scope = {};

  /**
   * Display a confirmation box
   * @param {string} $title Main confirm message
   * @param {string} $message Optional. Additionnal information to help understand the main message. Default : empty
   * @param {object} $options Optional. Additionnal options to configure button labels and more. Default : null
   * @return {promise}
   */
  $scope.confirm = function($title, $message, $options){
    $message = typeof($message) == 'undefined' ? '' : $message;

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
    try{
      $mdToast.show(
        $mdToast.simple()
          .textContent($message.translate())
          .position('top right')
          .hideDelay(3000)
      );
    }
    catch($ex){
      console.log($ex);
      console.log($message);
    }
    
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


  return $scope;
}]);


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