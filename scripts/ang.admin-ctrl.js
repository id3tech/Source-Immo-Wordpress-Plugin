
ImmoDbApp
.controller('configCtrl', function($scope, $rootScope){
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

ImmoDbApp
.controller('mainCtrl', function($scope, $rootScope, $mdDialog, $q, $http, $mdToast){
  $scope.configs = {};
  $scope.lang_codes = {
    fr: 'Français',
    en: 'English',
    es: 'Español'
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
  $scope.show_toast = function($message){
    $mdToast.show(
      $mdToast.simple()
        .textContent($message)
        .position('top right')
        .hideDelay(3000)
    );
  }


  /**
  * Main api call
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

});
