
ImmoDbApp
.controller('configCtrl', function($scope, $rootScope){
  $scope.route_elements = {
      '{{id}}' : 'ID',
      '{{transaction}}' : 'Transaction type',
      '{{location.region}}' : 'Region',
      '{{location.city}}' : 'City'
  }


  $scope.init = function(){

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
