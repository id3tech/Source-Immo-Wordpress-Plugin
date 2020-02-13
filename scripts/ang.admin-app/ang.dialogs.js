/* DIALOGS */

function listingsSearchEngineEditCtrl($scope, $rootScope, $mdDialog,$siUI,$params){
    BaseDialogController($scope,$mdDialog,$rootScope);

    $scope.model = {
        type:'full',
        focus_category: null,
        orientation: 'h',
        sticky: false
    };

    $scope.fieldList = [
      {key:'searchbox', caption:'Search box', selected: true},
      {key:'cities', caption:'Cities', selected: true},
      {key:'transactions', caption:'Transactions'},
      {key:'price', caption:'Price', selected: true},
      {key:'rooms', caption:'Rooms'},
      {key:'types', caption:'Types', selected: true},
      {key:'categories', caption:'Categories'},
      {key:'available_area', caption:'Available area'},
      {key:'parkings', caption:'Parkings'},
      {key:'features', caption:'Features'},
      {key:'extras', caption:'Extras'},
    ];

    $scope.actions = [
        { label: 'OK', action: function () { $scope.return($scope.model) } },
        { label: 'Cancel', action: function () { $scope.cancel(); } },
    ]
    $scope.init = function(){
        console.log('init listingSearchEngineEdit', $params)

        $scope.model = Object.assign($scope.model, $params);
    }
}


siApp
.controller('signinCtrl', function signinCtrl($scope, $rootScope, $mdDialog,$siUI){
  BaseDialogController('signin',$scope, $rootScope, $mdDialog);
  $scope.login_infos = {
    email: '',
    password: ''
  }
  $scope.title = 'Please signin'
  $scope.actions = [
    {label: 'Submit', action : _ => {$scope.login();}}
  ]

  $scope.login = function(){
    $scope.portalApi('auth/login', $scope.login_infos).then($response => {
      if($response.statusCode==200){
        $scope.return($response);
      }
      else{
        $siUI.show_toast($response.message.translate());
      }
    });
  }
});


/**
 * Sets basic dialog handler interface function
 */
function BaseDialogController($scope, $mdDialog, $rootScope){
    $scope.actions = [
        { label: 'OK', action: function () { $scope.cancel() } }
    ];
    
    $scope.cancel = function () {
        $mdDialog.cancel();
    }
  
    $scope.return = function($result){
      $mdDialog.hide($result);
    }
  
    return $scope;
  }


