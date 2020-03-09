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
      {key:'searchbox', caption:'Search box'.translate()},
      {key:'cities', caption:'Cities'.translate()},
      {key:'transactions', caption:'Transactions'.translate()},
      {key:'price', caption:'Price'.translate()},
      {key:'rooms', caption:'Rooms'.translate()},
      {key:'types', caption:'Types'.translate()},
      {key:'categories', caption:'Categories'.translate()},
      {key:'available_area', caption:'Available area'.translate()},
      {key:'parkings', caption:'Parkings'.translate()},
      {key:'features', caption:'Features'.translate()},
      {key:'extras', caption:'Extras'.translate()},
    ];

    $scope.actions = [
        { label: 'OK', action: function () { $scope.return($scope.model) } },
        { label: 'Cancel', action: function () { $scope.cancel(); } },
    ]
    $scope.init = function(){
        //console.log('init listingSearchEngineEdit', $params)

        $scope.model = Object.assign($scope.model, $params);

        console.log('init listingSearchEngine', $params, $scope.model);
    }

    $scope.toggleField = function($key){
      if($scope.model.fields == undefined) $scope.model.fields = [];
      if($scope.model.fields.includes($key)) {
        $scope.model.fields = $scope.model.fields.filter($f => $f!=$key);
        return;
      }

      $scope.model.fields.push($key);
    }
}

function listingsListItemEditCtrl($scope, $rootScope, $mdDialog,$siUI,$params){
  BaseDialogController($scope,$mdDialog,$rootScope);
  $scope.layoutList = [];
  $scope.availVars = [];
  $scope.model ={};

  $scope.actions = [
      { label: 'OK', action: function () { $scope.return($scope.model) } },
  ];

  $scope.init = function(){
      console.log('init listingListItemEdit', $params, $rootScope.global_list.list_item_vars[$scope.model.type])
      
      $scope.model = Object.assign($scope.model, $params);
      $scope.layoutList = $rootScope.global_list.list_item_layouts[$scope.model.type];
      $scope.availVars = $rootScope.global_list.list_item_vars[$scope.model.type];
      $scope.imageHoverEffects = $rootScope.global_list.list_item_image_hover_effects[$scope.model.type];
      $scope.layerHoverEffects = $rootScope.global_list.list_item_show_layer_effects[$scope.model.type];

      if(Array.isArray($scope.model.list_item_layout.displayed_vars)) delete $scope.model.list_item_layout.displayed_vars;
      if($scope.model.list_item_layout.image_hover_effect == undefined) $scope.model.list_item_layout.image_hover_effect = 'none';
      if($scope.model.list_item_layout.secondary_layer_effect == undefined) $scope.model.list_item_layout.secondary_layer_effect = 'none';
      if($scope.model.list_item_layout.displayed_vars == undefined){
        $scope.model.list_item_layout.displayed_vars = {
          main: $scope.availVars,
          secondary: []
        }
      }
      console.log('availVars',$scope.availVars);
  }
  
  $scope.varIsChecked = function($item,$layer='main'){
    if($scope.model.list_item_layout.displayed_vars[$layer] == undefined) return false;
    return $scope.model.list_item_layout.displayed_vars[$layer].includes($item)
  }

  $scope.varToggle = function($item,$layer='main'){
    if($scope.model.list_item_layout.displayed_vars[$layer] == undefined){
      $scope.model.list_item_layout.displayed_vars[$layer] =[];
    }

    if($scope.model.list_item_layout.displayed_vars[$layer].includes($item)){
      $scope.model.list_item_layout.displayed_vars[$layer] = $scope.model.list_item_layout.displayed_vars[$layer].filter($v => $v!=$item);
    }
    else{
      $scope.model.list_item_layout.displayed_vars[$layer].push($item);
    }
  }

  $scope.updateStyles = function($styles){
    $scope.model.list_item_layout.styles = $styles;
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


