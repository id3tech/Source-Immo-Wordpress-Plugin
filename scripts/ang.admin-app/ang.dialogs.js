/* DIALOGS */
// ------------------------------------
//#region Brokers Dialogs
// ------------------------------------

siApp
.controller("brokersSearchEngineEditDialogCtrl", function brokersSearchEngineEditCtrl($scope, $rootScope,$siUI){
  //BaseDialogController($scope,$mdDialog,$rootScope);

  $scope.model = {
      type:'full',
      focus_category: null,
      orientation: 'h',
      sticky: false
  };

  $scope.fieldList = [
    {key: 'searchbox'  , caption: 'Search box'.translate()},
    {key: 'letters'      , caption: 'Alphabetical'.translate()},
    {key: 'licenses'    , caption: 'Licenses'.translate()},
    {key: 'offices'    , caption: 'Offices'.translate()}
  ];

  $scope.actions = [
      { label: 'OK', action: function () { $scope.closeAndReturn($scope.model) } },
      { label: 'Cancel', action: function () { $scope.cancel(); } },
  ]
  $scope.init = function($params){
      $scope.model = Object.assign($scope.model, $params);

      if($scope.model.search_engine_options != undefined) delete $scope.model.search_engine_options;

      console.log('init brokerSearchEngine', $params, $scope.model);
  }

  $scope.toggleField = function($key){
    if($scope.model.fields == undefined) $scope.model.fields = [];
    if($scope.model.fields.includes($key)) {
      $scope.model.fields = $scope.model.fields.filter($f => $f!=$key);
      return;
    }

    $scope.model.fields.push($key);
  }
})

siApp
.controller("brokersListItemEditDialogCtrl", function brokersListItemEditCtrl($scope, $rootScope, $mdDialog,$siUI,){
  //BaseDialogController($scope,$mdDialog,$rootScope);
  BaseListItemEditController($scope, $rootScope);
  $scope.layoutList = [];
  $scope.availVars = [];
  $scope.model ={};

  $scope.actions = [
      { label: 'OK', action: function () { $scope.closeAndReturn($scope.model) } },
  ];

  $scope.init = function($params){
      console.log('init brokerListItemEdit', $params, $rootScope.global_list.list_item_vars[$scope.model.type])
      
      $scope.model = Object.assign($scope.model, $params);
      $scope.layoutList = $rootScope.global_list.list_item_layouts[$scope.model.type];
      $scope.availVars = $rootScope.global_list.list_item_vars[$scope.model.type];
      $scope.imageHoverEffects = $rootScope.global_list.list_item_image_hover_effects[$scope.model.type];
      $scope.layerHoverEffects = $rootScope.global_list.list_item_show_layer_effects[$scope.model.type];
      $scope.layerPositions = $rootScope.global_list.list_item_layer_positions[$scope.model.type];
      
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

})

// ------------------------------------
//#endregion Brokers Dialogs
// ------------------------------------


// ------------------------------------
//#region Listings Dialogs
// ------------------------------------

siApp.controller('listingsSearchEngineEditDialogCtrl', function listingsSearchEngineEditDialogCtrl($scope, $rootScope, $siUI){
    //BaseDialogController($scope,$mdDialog,$rootScope);

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
      {key:'bedrooms', caption:'Bedrooms'.translate()},
      {key:'bathrooms', caption:'Bathrooms'.translate()},
      {key:'types', caption:'Types'.translate()},
      {key:'categories', caption:'Categories'.translate()},
      {key:'available_area', caption:'Available area'.translate()},
      {key:'parkings', caption:'Parkings'.translate()},
      {key:'features', caption:'Features'.translate()},
      {key:'filters', caption:'Filters'.translate()},
      {key:'ages', caption:'Ages'.translate()},
    ];

    $scope.actions = [
        { label: 'OK', action: function () { $scope.closeAndReturn($scope.model) } },
        { label: 'Cancel', action: function () { $scope.cancel(); } },
    ]
    $scope.init = function($params){
        $scope.model = Object.assign($scope.model, $params);

        if($scope.model.search_engine_options != undefined) delete $scope.model.search_engine_options;

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

    $scope.tabsContains = function($tabToCheck){
      return $tabToCheck.some($t => $scope.model.tabs.includes($t));
    }
});

siApp.controller('listingsListItemEditDialogCtrl',function listingsListItemEditDialogCtrl($scope, $rootScope, $mdDialog,$siUI){
  //BaseDialogController($scope,$mdDialog,$rootScope);
  BaseListItemEditController($scope, $rootScope);
  
  $scope.layoutList = [];
  $scope.availVars = [];
  $scope.model ={};

  $scope.actions = [
      { label: 'OK', action: function () { $scope.closeAndReturn($scope.model) } },
  ];

  $scope.init = function($params){
      console.log('init listingListItemEdit', $params, $rootScope.global_list.list_item_vars[$scope.model.type])
      
      $scope.model = Object.assign($scope.model, $params);
      $scope.layoutList = $rootScope.global_list.list_item_layouts[$scope.model.type];
      $scope.availVars = $rootScope.global_list.list_item_vars[$scope.model.type];
      $scope.imageHoverEffects = $rootScope.global_list.list_item_image_hover_effects[$scope.model.type];
      $scope.layerHoverEffects = $rootScope.global_list.list_item_show_layer_effects[$scope.model.type];
      $scope.layerPositions = $rootScope.global_list.list_item_layer_positions[$scope.model.type];

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

})

// ------------------------------------
//#endregion Listings Dialogs
// ------------------------------------

// ------------------------------------
//#region Cities Dialogs
// ------------------------------------


siApp
.controller("citiesSearchEngineEditDialogCtrl", function citiesSearchEngineEditCtrl($scope, $rootScope,$siUI){
  //BaseDialogController($scope,$mdDialog,$rootScope);

  $scope.model = {
      type:'full',
      focus_category: null,
      orientation: 'h',
      sticky: false
  };

  $scope.fieldList = [
    {key: 'searchbox'  , caption: 'Search box'.translate()},
    {key: 'regions'      , caption: 'Alphabetical'.translate()},
  ];

  $scope.actions = [
      { label: 'OK', action: function () { $scope.closeAndReturn($scope.model) } },
      { label: 'Cancel', action: function () { $scope.cancel(); } },
  ]
  $scope.init = function($params){
      $scope.model = Object.assign($scope.model, $params);

      if($scope.model.search_engine_options != undefined) delete $scope.model.search_engine_options;

      console.log('init brokerSearchEngine', $params, $scope.model);
  }

  $scope.toggleField = function($key){
    if($scope.model.fields == undefined) $scope.model.fields = [];
    if($scope.model.fields.includes($key)) {
      $scope.model.fields = $scope.model.fields.filter($f => $f!=$key);
      return;
    }

    $scope.model.fields.push($key);
  }
})


siApp
.controller("citiesListItemEditDialogCtrl", function citiesListItemEditCtrl($scope, $rootScope, $mdDialog,$siUI){
  //BaseDialogController($scope,$mdDialog,$rootScope);
  BaseListItemEditController($scope, $rootScope);
   
  $scope.model = {};


  $scope.init = function($params){
      console.log('init cityListItemEdit', $params, $rootScope.global_list.list_item_vars[$scope.model.type])
      $scope.base.init($params);
      
      console.log('availVars',$scope.availVars);
  }


})

// ------------------------------------
//#endregion Cities Dialogs
// ------------------------------------


// ------------------------------------
//#region Offices Dialogs
// ------------------------------------

siApp
.controller("officesSearchEngineEditDialogCtrl", function officesSearchEngineEditCtrl($scope, $rootScope, $mdDialog,$siUI){
  //BaseDialogController($scope,$mdDialog,$rootScope);

  $scope.model = {
      type:'full',
      focus_category: null,
      orientation: 'h',
      sticky: false
  };

  $scope.fieldList = [
    {key: 'searchbox'  , caption: 'Search box'.translate()},
    {key: 'regions'      , caption: 'Alphabetical'.translate()},
  ];

  $scope.actions = [
      { label: 'OK', action: function () { $scope.closeAndReturn($scope.model) } },
      { label: 'Cancel', action: function () { $scope.cancel(); } },
  ]
  $scope.init = function($params){
      $scope.model = Object.assign($scope.model, $params);

      if($scope.model.search_engine_options != undefined) delete $scope.model.search_engine_options;

      console.log('init brokerSearchEngine', $params, $scope.model);
  }

  $scope.toggleField = function($key){
    if($scope.model.fields == undefined) $scope.model.fields = [];
    if($scope.model.fields.includes($key)) {
      $scope.model.fields = $scope.model.fields.filter($f => $f!=$key);
      return;
    }

    $scope.model.fields.push($key);
  }
});


siApp
.controller("officesListItemEditDialogCtrl", function officesListItemEditCtrl($scope, $rootScope, $mdDialog,$siUI){
  //BaseDialogController($scope,$mdDialog,$rootScope);
  BaseListItemEditController($scope, $rootScope);

  $scope.model ={};

  $scope.init = function($params){
      console.log('init officeListItemEdit', $params, $rootScope.global_list.list_item_vars[$scope.model.type])
      $scope.base.init($params);
      console.log('availVars',$scope.availVars);
  }

})

// ------------------------------------
//#endregion Offices Dialogs
// ------------------------------------


// ------------------------------------
//#region Agencies Dialogs
// ------------------------------------

siApp
.controller("agenciesSearchEngineEditDialogCtrl", function agenciesSearchEngineEditCtrl($scope, $rootScope, $mdDialog,$siUI){
  //BaseDialogController($scope,$mdDialog,$rootScope);

  $scope.model = {
      type:'full',
      focus_category: null,
      orientation: 'h',
      sticky: false
  };

  $scope.fieldList = [
    {key: 'searchbox'  , caption: 'Search box'.translate()},
    //{key: 'regions'      , caption: 'Alphabetical'.translate()},
  ];

  $scope.actions = [
      { label: 'OK', action: function () { $scope.closeAndReturn($scope.model) } },
      { label: 'Cancel', action: function () { $scope.cancel(); } },
  ]
  $scope.init = function($params){
      $scope.model = Object.assign($scope.model, $params);

      if($scope.model.search_engine_options != undefined) delete $scope.model.search_engine_options;

  }

  $scope.toggleField = function($key){
    if($scope.model.fields == undefined) $scope.model.fields = [];
    if($scope.model.fields.includes($key)) {
      $scope.model.fields = $scope.model.fields.filter($f => $f!=$key);
      return;
    }

    $scope.model.fields.push($key);
  }
});

siApp
.controller("agenciesListItemEditDialogCtrl", function agenciesListItemEditCtrl($scope, $rootScope, $mdDialog,$siUI,){
  //BaseDialogController($scope,$mdDialog,$rootScope);
  BaseListItemEditController($scope, $rootScope);

  $scope.model ={};

  $scope.init = function($params){
      $scope.base.init($params);
  }

});

// ------------------------------------
//#endregion Agencies Dialogs
// ------------------------------------


siApp
.controller("langItemEditDialogCtrl", function langItemEditDialogCtrl($scope,$rootScope,$q,$siApi,$siConfigs, $siUI, $siUtils){
  $scope.global_list = $rootScope.global_list;
  $scope.data_views = $rootScope.data_views;
  $scope.configs = {};
  $scope.routes = null;
  $scope.groupType = null;

  $scope.shortCodeMaps = {
    listings: '[si_listing]',
    brokers: '[si_broker]',
    offices: '[si_office]',
    agencies: '[si_agency]',
    cities: '[si_city]'
  }
  $scope.details_defaults = {
    fr: {
      listings: {
        route: {
          route: 'proprietes/{{item.location.region}}/{{item.location.city}}/{{item.transaction}}/{{item.ref_number}}/',
          shortcut: 'propriete/{{item.ref_number}}/'
        },
        layout: {},
      },
      brokers: {
        route: {
          route: 'courtiers/{{item.first_name}}-{{item.last_name}}/{{item.ref_number}}/',
          shortcut: 'courtier/{{item.ref_number}}/'
        },
        layout: {},
      },
      offices: {
        route: {
          route: 'bureaux/{{item.name}}/{{item.ref_number}}/',
          shortcut: 'bureau/{{item.ref_number}}/'
        },
        layout: {},
      },
      agencies: {
        route: {
          route: 'agences/{{item.name}}/{{item.ref_number}}/',
          shortcut: 'agence/{{item.ref_number}}/'
        },
        layout: {
          communication_mode: 'basic',
          form_id:null
        },
       
      },
      cities: {
        route: {
          route: 'villes/{{item.location.region}}/{{item.name}}/{{item.ref_number}}/',
          shortcut: 'ville/{{item.ref_number}}/'
        },
        layout: {},
        
      }
    },
    en: {
      listings: {
        route: {
          route: 'listings/{{item.location.region}}/{{item.location.city}}/{{item.transaction}}/{{item.ref_number}}/',
          shortcut: 'listing/{{item.ref_number}}/'
        },
        layout: {},
      },
      brokers: {
        route: {
          route: 'brokers/{{item.first_name}}-{{item.last_name}}/{{item.ref_number}}/',
          shortcut: 'broker/{{item.ref_number}}/'
        },
        layout: {},
      },
      offices: {
        route: {
          route: 'offices/{{item.name}}/{{item.ref_number}}/',
          shortcut: 'office/{{item.ref_number}}/'
        },
        layout: {},
      },
      agencies: {
        route: {
          route: 'agencies/{{item.name}}/{{item.ref_number}}/',
          shortcut: 'agency/{{item.ref_number}}/'
        },
        layout: {},
      },
      cities: {
        route: {
          route: 'cities/{{item.location.region}}/{{item.name}}/{{item.ref_number}}/',
          shortcut: 'city/{{item.ref_number}}/'
        },
        layout: {},
      }
    },
    es: {
      listings: {
        route: {
          route: 'propiedades/{{item.location.region}}/{{item.location.city}}/{{item.transaction}}/{{item.ref_number}}/',
          shortcut: 'propiedad/{{item.ref_number}}/'
        },
        layout: {},
      },
      brokers: {
        route: {
          route: 'agentes/{{item.first_name}}-{{item.last_name}}/{{item.ref_number}}/',
          shortcut: 'agente/{{item.ref_number}}/'
        },
        layout: {},
      },
      offices: {
        route: {
          route: 'oficinas/{{item.name}}/{{item.ref_number}}/',
          shortcut: 'despacho/{{item.ref_number}}/'
        },
        layout: {},
      },
      agencies: {
        route: {
          route: 'agencias/{{item.name}}/{{item.ref_number}}/',
          shortcut: 'agencia/{{item.ref_number}}/'
        },
        layout: {},
      },
      cities: {
        route: {
          route: 'ciudad/{{item.location.region}}/{{item.name}}/{{item.ref_number}}/',
          shortcut: 'ciudades/{{item.ref_number}}/'
        },
        layout: {},
      }
    }
  }
  
  $scope.route_default = {
    listing : {
      fr : 'proprietes/{{item.location.region}}/{{item.location.city}}/{{item.transaction}}/{{item.ref_number}}',
      en : 'listings/{{item.location.region}}/{{item.location.city}}/{{item.transaction}}/{{item.ref_number}}',
      es : 'casas/{{item.location.region}}/{{item.location.city}}/{{item.transaction}}/{{item.ref_number}}'
    },
    broker : {
      fr : 'courtiers/{{item.first_name}}-{{item.last_name}}/{{item.ref_number}}',
      en : 'brokers/{{item.first_name}}-{{item.last_name}}/{{item.ref_number}}',
      es : 'agentes/{{item.first_name}}-{{item.last_name}}/{{item.ref_number}}'
    },
    city : {
      fr : 'villes/{{item.location.region}}/{{item.name}}/{{item.ref_number}}',
      en : 'cities/{{item.location.region}}/{{item.name}}/{{item.ref_number}}',
      es : 'ciudades/{{item.location.region}}/{{item.name}}/{{item.ref_number}}'
    },
    office : {
      fr : 'bureaux/{{item.location.city}}/{{item.name}}/{{item.ref_number}}',
      en : 'offices/{{item.location.city}}/{{item.name}}/{{item.ref_number}}',
      es : 'oficinas/{{item.location.city}}/{{item.name}}/{{item.ref_number}}'
    },
    agency : {
      fr : 'agences/{{item.name}}/{{item.ref_number}}',
      en : 'agencies/{{item.name}}/{{item.ref_number}}',
      es : 'agencias/{{item.name}}/{{item.ref_number}}'
    }
  }

  $scope.actions = [
    { label: 'OK', action: function () { $scope.buildAndClose($scope.model) } },
    { label: 'Cancel', action: function () { $scope.cancel(); } },
  ];


  $scope.init = function($params){
    $scope.routes = $params.routes;
    $scope.groupType = $params.type;
    $scope.model = $params.model;  
    $scope.detailsComponentShortcode = $scope.shortCodeMaps[$params.type];
    $siConfigs.load().then(function($response){
      $scope.configs = $response;
    });
  }

  $scope.getDisplayedVarSelectionText = function($selections){
    const lLabels = $scope.availVars
      .filter( $v => $selections.includes($v.name))
      .reduce( ($result,$cur) => {
        $result.push($cur.label.translate())
        return $result;
      },[]);
    if(lLabels.length > 6) return '{0} out of {1} selected'.translate().siFormat(lLabels.length, $scope.availVars.length);

    return lLabels.join(', ');
  }

  $scope.validate = function(){
    // add default value when missing
    if($scope.model.priority_group_sort == undefined){
      $scope.model.priority_group_sort = null;
    }
    if($scope.model.search_engine_options == undefined){
      $scope.model.search_engine_options = {
        type: 'full',
        search_box_placeholder : {fr:'',en:''},
        tabs: [],
        fields: [],
      }
    }

    if($scope.model.list_layout.item_row_space.mobile > 2){
      $scope.model.list_layout.item_row_space.desktop = Math.round(100 / $scope.model.list_layout.item_row_space.desktop);
      $scope.model.list_layout.item_row_space.laptop = Math.round(100 / $scope.model.list_layout.item_row_space.laptop);
      $scope.model.list_layout.item_row_space.tablet = Math.round(100 / $scope.model.list_layout.item_row_space.tablet);
      $scope.model.list_layout.item_row_space.mobile = Math.round(100 / $scope.model.list_layout.item_row_space.mobile);
    }
  }

  $scope.validateAlias = function(){
    $scope.aliasIsValid = true;
    if($scope.usedAliasName.includes($scope.model.alias)){
      $scope.aliasIsValid = false;
    }
  }

  $scope.buildAndClose = function(){
    return $scope.closeAndReturn($scope.model);
  }

  $scope.selectPage = function(){
    const dialogParams = {lang: $scope.model.lang};
        if($scope.model.layout == undefined) $scope.model.layout = {page:''};
        
        dialogParams.page = $scope.model.layout.page;
        dialogParams.type = $scope.groupType;

        $siUI.dialog('page-picker', dialogParams).then($newPage => {
          $scope.model.layout.page = $newPage;
        })
  }
  $scope.selectForm = function(){
    const dialogParams = {lang: $scope.model.lang};
    if($scope.model.layout == undefined) $scope.model.layout.form_id = '';
    
    dialogParams.form_id = $scope.model.layout.form_id;

    $siUI.dialog('form-picker', dialogParams).then($form => {
      $scope.model.layout.form_id = $form;
      $scope.$emit('save-request');
    })
  }

  $scope.isActionValid = function($button){
    //if($button.label == 'OK') return $scope.aliasIsValid;
    return true;
  }
  
  $scope.resetDetails = function(){
    const $lang = $scope.model.lang;
    const lDefault = $scope.details_defaults[$lang][$scope.groupType];

    $scope.model.route = Object.assign($scope.model.route, lDefault.route);
    $scope.model.layout = Object.assign($scope.model.route,{
      page: null,
        communication_mode: 'basic',
        form_id:null
    }, lDefault.route);

  }

  $scope.copyShortcodeToClipboard = function(){
    $siUtils.copyToClipboard($scope.detailsComponentShortcode);
  }
});

siApp
.controller("listEditDialogCtrl", function listEditDialogCtrl($scope,$rootScope,$q,$siApi,$siConfigs, $siUI){
  $scope.global_list = $rootScope.global_list;
  $scope.data_views = $rootScope.data_views;
  $scope.listItemLayoutList = [];
  $scope.listItemImageHoverEffects = [];
  $scope.listItemLayerHoverEffects = [];
  $scope.aliasIsValid = true;
  $scope.usedAliasName = [];

  $scope.actions = [
    { label: 'OK', action: function () { $scope.buildAndClose($scope.model) } },
    { label: 'Cancel', action: function () { $scope.cancel(); } },
]

  $scope.layerVariations = {
    sold: false
  };

  $scope.tab = {
    selectedIndex : 0
  }

  $scope.init = function($params){
    $scope.model = structuredClone($params);
    if($scope.model.source != null){
      $scope.model.$$source_id =  $scope.model.source.id;
    }
    
    $scope.usedAliasName = $siConfigs.configs.lists.filter($l => $l != $params).map($l => $l.alias);

    $scope.listItemLayoutList = $rootScope.global_list.list_item_layouts[$scope.model.type];
    $scope.availVars = $rootScope.global_list.list_item_vars[$scope.model.type];
    
    $scope.listItemImageHoverEffects = $rootScope.global_list.list_item_image_hover_effects[$scope.model.type];
    $scope.listItemLayerHoverEffects = $rootScope.global_list.list_item_show_layer_effects[$scope.model.type];
    
    $scope.validate();


    $scope.$on('siListPreview/editListItem', function(){
      console.log('listEditDialogCtrl@siListPreview/editListItem')
      $scope.tab.selectedIndex = 2;
    })
    
    
  }

  $scope.displayedVarsChanged = function($layer){
    $scope.$broadcast("listItemLayer/vars:changed",$layer);
  }

  $scope.getDisplayedVarSelectionText = function($selections){
    const lLabels = $scope.availVars
      .filter( $v => $selections.includes($v.name))
      .reduce( ($result,$cur) => {
        $result.push($cur.label.translate())
        return $result;
      },[]);
    if(lLabels.length > 6) return '{0} out of {1} selected'.translate().siFormat(lLabels.length, $scope.availVars.length);

    return lLabels.join(', ');
  }

  $scope.validate = function(){
    // add default value when missing
    if($scope.model.priority_group_sort == undefined){
      $scope.model.priority_group_sort = null;
    }
    if($scope.model.search_engine_options == undefined){
      $scope.model.search_engine_options = {
        type: 'full',
        search_box_placeholder : {fr:'',en:''},
        tabs: [],
        fields: [],
      }
    }

    if($scope.model.list_layout.item_row_space.mobile > 2){
      $scope.model.list_layout.item_row_space.desktop = Math.round(100 / $scope.model.list_layout.item_row_space.desktop);
      $scope.model.list_layout.item_row_space.laptop = Math.round(100 / $scope.model.list_layout.item_row_space.laptop);
      $scope.model.list_layout.item_row_space.tablet = Math.round(100 / $scope.model.list_layout.item_row_space.tablet);
      $scope.model.list_layout.item_row_space.mobile = Math.round(100 / $scope.model.list_layout.item_row_space.mobile);
    }
  }

  $scope.validateAlias = function(){
    $scope.aliasIsValid = true;
    if($scope.usedAliasName.includes($scope.model.alias)){
      $scope.aliasIsValid = false;
    }
  }

  $scope.buildAndClose = function(){
    $scope.renewSearchToken().then(function($searchToken){
      $scope.model.search_token = $searchToken;

      const lResult = structuredClone($scope.model);

      lResult.show_list_meta = (lResult.show_list_meta == undefined) ? false : lResult.show_list_meta;
      
      // Make sure the source is configured
      if(lResult.source == undefined || lResult.source.id != lResult.$$source_id){
        lResult.source = $scope.data_views.find(function($e){ return($e.id == lResult.$$source_id);});
      }
      delete lResult.$$source_id;

      console.log('SaveOrClose', lResult, $scope.model);
      $scope.closeAndReturn(lResult);
    });
  }

  
  $scope.renewSearchToken = function(){
    let lFilters = $scope.buildFilters();
            
    let lPromise =  $q(function($resolve, $reject){
        if(lFilters != null){
            $scope.api('',lFilters,{
              url: wpSiApiSettings.api_root + '/api/utils/search_encode'
            }).then(function($response){
                $resolve($response);
            });
        }
        else{
            $resolve('');
        }
        
    });

    return lPromise;
  }

  $scope.buildFilters = function(){
      let lResult = null;
      

      if($scope.model.limit>0){
          lResult = {
              max_item_count : $scope.model.limit
          }
      }

      if($scope.model.sort != null && $scope.model.sort != '' && $scope.model.sort != 'auto'){
        if(lResult==null) lResult = {};
        lResult.sort_fields = [{field: $scope.model.sort, desc: $scope.model.sort_reverse}];
        if(!isNullOrEmpty($scope.model.priority_group_sort)){
          const lPriorityDesc = $scope.model.priority_group_sort.indexOf('-desc')>0 ? true : false;
          lResult.sort_fields.unshift({field: 'priority', desc: lPriorityDesc});
        }
      }

      if($scope.model.shuffle){
        if(lResult==null) lResult = {};
        lResult.shuffle = $scope.model.shuffle;
      }
      
      
      if($scope.model.filter_group != null){
        if(lResult==null) lResult = {};

        lResult.filter_group = $scope.normalizeFilterGroup(angular.copy($scope.model.filter_group));
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

  $scope.switchSortReverse = function(){
    $scope.model.sort_reverse = !$scope.model.sort_reverse;
  }

  $scope.configureSearchBar = function(){
    type = $scope.model.type;

    $siUI.dialog('' + type + '-search-engine-edit',$scope.model.search_engine_options).then($result => {
      $scope.model.search_engine_options = $result;
    });
  }
  
  $scope.renewSearchToken = function(){
    let lFilters = $scope.buildFilters();
            
    let lPromise =  $q(function($resolve, $reject){
        if(lFilters != null){
          $siApi.call('',lFilters,{
              url: wpSiApiSettings.api_root + '/api/utils/search_encode'
            }).then(function($response){
                $resolve($response);
            });
        }
        else{
            $resolve('');
        }
        
    });

    return lPromise;
  }

  $scope.buildFilters = function(){
    let lResult = null;
    

    if($scope.model.limit>0){
        lResult = {
            max_item_count : $scope.model.limit
        }
    }

    if($scope.model.sort != null && $scope.model.sort != '' && $scope.model.sort != 'auto'){
      if(lResult==null) lResult = {};
      lResult.sort_fields = [{field: $scope.model.sort, desc: $scope.model.sort_reverse}];
      if(!isNullOrEmpty($scope.model.priority_group_sort)){
        const lPriorityDesc = $scope.model.priority_group_sort.indexOf('-desc')>0 ? true : false;
        lResult.sort_fields.unshift({field: 'priority', desc: lPriorityDesc});
      }
    }

    if($scope.model.shuffle){
      if(lResult==null) lResult = {};
      lResult.shuffle = $scope.model.shuffle;
    }
    
    
    if($scope.model.filter_group != null){
      if(lResult==null) lResult = {};

      lResult.filter_group = $scope.normalizeFilterGroup(angular.copy($scope.model.filter_group));
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

  $scope.isActionValid = function($button){
    if($button.label == 'OK') return $scope.aliasIsValid;
    return true;
  }
});


siApp
.controller("newListDialogCtrl", function newListDialogCtrl($scope,$rootScope,$q,$siConfigs,$siApi, $siUI){
  $scope.global_list = $rootScope.global_list;
  $scope.usedNames = [];
  $scope.data_views = $rootScope.data_views;
  $scope.listItemLayoutList = [];
  $scope.listItemImageHoverEffects = [];
  $scope.listItemLayerHoverEffects = [];

  $scope.actions = [
    { label: 'OK', action: function () { $scope.buildAndClose(); } },
    { label: 'Cancel', action: function () { $scope.cancel(); } },
  ]


  $scope.presets = {
    selected:'normal',
    list: [
      {value: 'normal', label: 'Normal', description: 'Complete list with search engine'},
      {value: 'small', label: 'Small', description: 'List with a limited amount of items, no search engine'},
      {value: 'featured', label: 'Featured', description: 'Tiny list of item to display on a homepage'}
    ]
  }

  $scope.init = function($params){
    $scope.model = {type: $params.type};
    
    $scope.usedNames = $params.otherList.map($l => $l.alias);
    console.log('newListDialogCtrl/init', $scope.usedNames);
    $scope.listItemLayoutList = $rootScope.global_list.list_item_layouts[$scope.model.type];
    $scope.availVars = $rootScope.global_list.list_item_vars[$scope.model.type];
    
    $scope.listItemImageHoverEffects = $rootScope.global_list.list_item_image_hover_effects[$scope.model.type];
    $scope.listItemLayerHoverEffects = $rootScope.global_list.list_item_show_layer_effects[$scope.model.type];

    
    $scope.initlializeModel();
    $scope.updateModel();
    
  }

  $scope.updateModel = function(){
    const layoutPresetDefault = $rootScope.global_list.list_layouts[$scope.model.type][0].name;
    const layoutPresetDefaultVars = $rootScope.global_list.list_item_layouts[$scope.model.type][0].vars;
    
    const defaultMaps = {
      normal : _ => {
        $scope.model.searchable = true;
        $scope.model.sortable = true;
        $scope.model.mappable = true;
        $scope.model.limit = 0;
        $scope.model.alias = $scope.getValidAlias($scope.model.type + '-all')
        $scope.model.list_layout.preset = layoutPresetDefault;
        $scope.model.list_layout.scope_class = "si-border";
        $scope.model.search_engine_options.scope_class = "si-border";
        $scope.model.list_item_layout.scope_class = "si-border";
        $scope.model.list_item_layout.displayed_vars.main = layoutPresetDefaultVars;
      },
      small : _ => {
        $scope.model.searchable = false;
        $scope.model.sortable = false;
        $scope.model.mappable = false;
        $scope.model.limit = $scope.model.list_layout.item_row_space.desktop *  3;
        $scope.model.alias = $scope.getValidAlias($scope.model.type + '-list')
        $scope.model.list_layout.preset = layoutPresetDefault;
        $scope.model.list_item_layout.displayed_vars.main = layoutPresetDefaultVars;
        $scope.model.list_item_layout.scope_class = "si-border";
      },
      featured : _ => {
        $scope.model.searchable = false;
        $scope.model.sortable = false;
        $scope.model.mappable = false;
        $scope.model.limit = $scope.model.list_layout.item_row_space.desktop;
        $scope.model.shuffle = true;
        $scope.model.alias = $scope.getValidAlias($scope.model.type + '-featured')
        $scope.model.list_layout.preset = 'direct';
        $scope.model.list_item_layout.scope_class = "si-border";
        $scope.model.list_item_layout.displayed_vars.main = layoutPresetDefaultVars;
      },
    }

    defaultMaps[$scope.presets.selected]();


  }

  $scope.getValidAlias = function($draft){
    let lResult = $draft;
    let index = 1;
    while ($scope.usedNames.includes(lResult)) {
      lResult = $draft + '-' + index;
      index++;
    }
    return lResult;
  }
  
  $scope.initlializeModel = function(){
    // add default value when missing
    $scope.model.$$source_id =  $scope.data_views[0].id;
    $scope.model.filter_group = {
      operator: "and",
      filters: [],
      filter_groups : []
    }
    $scope.model.sort = null;
    $scope.model.sort_reverse = false;
    $scope.model.default_zoom_level = "auto";
    $scope.model.smart_focus_tolerance =  5;

    $scope.model.priority_group_sort = null;
    
    $scope.model.list_layout = {
      preset : "standard",
      layout : "standard",
      scope_class : "",
      styles: null,
      use_styles: true,
      custom_css: "",
      item_row_space : {
        desktop : 4,
        laptop : 3,
        tablet : 2,
        mobile : 1
      }
    }    

    // if(['offices','agencies'].includes($scope.model.type)){
    //   $scope.model.list_layout.item_row_space.desktop = 3;
    // }

    $scope.model.list_item_layout = {
      preset : "standard",
      layout : "standard",
      scope_class : "",
      image_hover_effect: "none",
      secondary_layer_effect: "fade",
      displayed_vars: {
          "main": $scope.availVars.filter($v => ['price','address','city','category','subcategory','rooms','name','first_name','last_name','region','contacts','listing_count','agency-name'].includes($v.name)).map($v => $v.name),
          "secondary": null
      },
      styles: null,
      use_styles: true,
      primary_layer_position: "fix",
      secondary_layer_bg_opacity: 75,
      custom_css: "",
    }    

    $scope.model.search_engine_options = {
          type: "full",
          orientation: "h",
          focus_category: null,
          sticky: false,
          tabs: [],
          tabbed: false,
          filter_tags: "none",
          search_box_placeholder: {
              en: "Type here to begin your search...",
              fr: "Tapez ici pour commencer votre recherche ..."
          },
          fields: []
      }
  }

  $scope.buildAndClose = function(){
    $scope.renewSearchToken().then(function($searchToken){
      $scope.model.search_token = $searchToken;

      const lResult = angular.copy($scope.model);

      lResult.show_list_meta = (lResult.show_list_meta == undefined) ? false : lResult.show_list_meta;
      
      // Make sure the source is configured
      if(lResult.source == undefined){
        lResult.source = $scope.data_views.find(function($e){ return($e.id == lResult.$$source_id);});
      }
      delete lResult.$$source_id;

      console.log('SaveOrClose', lResult, $scope.model);
      $scope.closeAndReturn(lResult);
    });
  }

  $scope.renewSearchToken = function(){
    let lFilters = $scope.buildFilters();
            
    let lPromise =  $q(function($resolve, $reject){
        if(lFilters != null){
          $siApi.call('',lFilters,{
              url: wpSiApiSettings.api_root + '/api/utils/search_encode'
            }).then(function($response){
                $resolve($response);
            });
        }
        else{
            $resolve('');
        }
        
    });

    return lPromise;
  }

  
  $scope.buildFilters = function(){
    let lResult = null;
    

    if($scope.model.limit>0){
        lResult = {
            max_item_count : $scope.model.limit
        }
    }

    if($scope.model.sort != null && $scope.model.sort != '' && $scope.model.sort != 'auto'){
      if(lResult==null) lResult = {};
      lResult.sort_fields = [{field: $scope.model.sort, desc: $scope.model.sort_reverse}];
      if(!isNullOrEmpty($scope.model.priority_group_sort)){
        const lPriorityDesc = $scope.model.priority_group_sort.indexOf('-desc')>0 ? true : false;
        lResult.sort_fields.unshift({field: 'priority', desc: lPriorityDesc});
      }
    }

    if($scope.model.shuffle){
      if(lResult==null) lResult = {};
      lResult.shuffle = $scope.model.shuffle;
    }
    
    
    if($scope.model.filter_group != null){
      if(lResult==null) lResult = {};

      lResult.filter_group = $scope.normalizeFilterGroup(angular.copy($scope.model.filter_group));
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

});

siApp
.controller('accountLoginDialogCtrl', function($scope, $rootScope, $siApi, $siUI, $siUser){
  $scope.login_infos = {
    email: '',
    password: ''
  };
  
  $scope.actions = [
    {label: 'Login',  action : _ => {$scope.login();}},
    {label: 'Cancel', action : _ => {$scope.cancel();}}
  ]

  $scope.init = function(){
    
  }

  $scope.login = function(){
    $scope.actions[0]._working = true;
    $siApi.portal('auth/login', 
      $scope.login_infos).then(
        $response => {
          $scope.actions[0]._working = false;
          if($response.statusCode == undefined || [10,20].includes($response.statusCode)){
            //$siUI.alert($response.message);
            $siUI.alert($response.message.translate())
            return false;
          }

          $siUser.info = {
            token: $response.authTokenKey,
            user: {
              name: $response.context.user.name,
            }
          }
          
          $scope.closeAndReturn($response);
          
          console.log('login', $response);
        },
        $error => {
          const message = Object.keys($error.modelState).map($k => $error.modelState[$k].join(' ').translate());
          $siUI.alert(message.join(' '));
          $scope.actions[0]._working = false;
        }
    );
  }

  $scope.isActionValid = function($button){
    if($button.label == 'Login'){
      return Object.keys($scope.login_infos).every($k => $scope.login_infos[$k] != '');
    }

    return true;
  }
})

// siApp
// .controller('signinDialogCtrl', function signinCtrl($scope, $rootScope,$siUI){
  
//   $scope.login_infos = {
//     email: '',
//     password: ''
//   }
//   $scope.title = 'Please signin'
//   $scope.actions = [
//     {label: 'Submit', action : _ => {$scope.login();}}
//   ]

  
//   $scope.login = function(){
//     $scope.portalApi('auth/login', $scope.login_infos).then(
//       $response => {
//         if($response.statusCode==200){
//           $scope.closeAndReturn($response);
//         }
//         else{
//           $siUI.show_toast($response.message.translate());
//         }
//       },
//       $error => {
//         const message = Object.keys($error.modelState).map($k => $error.modelState[$k].join(' ').translate());
//         $siUI.alert(message.join(' '));
//       }
//     );
//   }
// });

siApp
.controller('layerVarAddCustomDialogCtrl', function layerVarAddCustomDialogCtrl($scope, $rootScope){
  $scope.model = {
    key: '',
    content: {fr:'', en: '', es:''}
  };

  $scope.actions = [
    { label: 'OK', action: function () { $scope.buildAndClose($scope.model) } },
    { label: 'Cancel', action: function () { $scope.cancel(); } },
  ];
  $scope.availableVarList = [];

  $scope.init = function($params){
  }

  $scope.buildAndClose = function($data){
    $data.key = $data.key.siSanitize();
    $scope.closeAndReturn($data);
  }

  $scope.isValidAction = function($button){
    if($button.label == 'OK'){
      
      return $scope.model.key != '' && ['fr','en','es'].some(k => $scope.model.content[k] != '');
    }
    return true;
  }

});

siApp
.controller('layerVarEditDialogCtrl', function layerVarEditDialogCtrl($scope, $rootScope){
  $scope.model = {
    classes: ''
  };

  $scope.actions = [
    { label: 'OK', action: function () { $scope.buildAndClose($scope.model) } },
    { label: 'Cancel', action: function () { $scope.cancel(); } },
  ];
  $scope.availableVarList = [];

  $scope.init = function($params){
    //$scope.model.classes = $params.classes.join(' ');
    $scope.model = $params.var;
    if(['link_button'].includes($params.var.key)){
      if($scope.model.label == undefined) $scope.model.label = {};
    }

    $scope.availableVarList = $rootScope.global_list.list_item_vars[ $params.type];
  }

  $scope.buildAndClose = function($data){
    $scope.closeAndReturn($data);
  }

})

siApp
.controller('registerDialogCtrl', function registerCtrl($scope, $rootScope,$timeout, $mdDialog,$q,$siUtils, $siUI, $siApi, $siConfigs, $siWP){
  //BaseDialogController($scope, $mdDialog, $rootScope);

  $scope.login_infos = {
    email: '',
    password: ''
  };

  $scope.steps = [
    'account','api_key','default_view','layout'
  ]

  $scope.model = {
    state: 'login',
    credentials: null,
    account_id: null,
    api_key: null,
    default_view: null,
    layouts: [
      {icon: 'home', type_name: 'Listings', type: 'listing', page: 'NEW', detail_page: 'NEW'},
      {icon: 'users', type_name: 'Brokers', type: 'broker', page: 'NEW', detail_page: 'NEW'}
    ]
  };

  $scope.accounts = [];
  $scope.api_keys = [];
  $scope.data_views = [];
  $scope.pages = {};
  $scope.pageList = {};
  $scope.languages = {
    selected: '',
    list: []
  };
  $scope.wizard_step = null;
  $scope.working = false;
  
  $scope.actions = [];

  $scope.init = function(){
    console.log('register dialog init');
    $siWP.loadPages().then( $pages => {
      $scope.pageList = $pages;
      $scope.languages.list = $siWP.languages;
      $scope.languages.selected = $scope.languages.list[0].code;
    })
    // $siWP.loadPages().then($pages => {
    //   $scope.pageList = $pages;
    // });
    //$scope.languages.selected = $scope.languages.list[0].code;

    $scope.$watch(function(){
      return $scope.wizard_step;
    },
    function($new, $old){
      
      if($new === $old) return;
      console.log('wizard_step:updated', $new, $old);

      if($new == null) return;
      //$scope.preloadStep().then(function(){
        $scope.updateWizard();
      //});
    })
  }


  $scope.signin = function(){
    $scope.signin_message = null;
    $scope.working = true;
    
    $siApi.portal('auth/login', $scope.login_infos).then($response => {
      $scope.working = false;
    
      if([10,20].includes($response.statusCode)){
        //$siUI.alert($response.message);
        $scope.signin_message = $response.message.translate();
        return false;
      }

      $scope.model.state = 'configs';
      
      $scope.model.credentials = $response;

      $scope.startWizard();
      
    });
  }

  $scope.restorePreviousInstallation = function(){
    $siConfigs.restoreBackup({directMethod: 'restoreEverything'});
  }
  $scope.hasBackup = function(){
    return $siConfigs.configsBackup != null;
  }

  $scope.selectAccount = function($account){
    $scope.model.global_account_id = $account.id;
    $scope.nextStep();
  }

  $scope.selectApiKey = function($key){
    $scope.model.account_id = $key.accountId;
    $scope.model.api_key = $key.id;
    $scope.nextStep();
  }

  $scope.selectDefaultView = function($view){
    $scope.model.default_view = $view;

    if($scope.hasBackup()){
      $siUI.confirm('','A backup of your old configuration has been detected.\nWould you like to keep these settings?',{ok: 'Yes',cancel:'No'})
        .then(
          function keep(){
            $scope.finishWithBackupMerge();
          },
          function continueNext(){
            $scope.nextStep();
          }
        )
    }
    else{
      $scope.nextStep();
    }
  }

  $scope.finishWithBackupMerge = function(){
    $siConfigs.data_views = $scope.data_views;
    $scope.wizard_step = 0;
    
    const lConfigs = $scope.buildConfig();
    const lMergeConfigs = $siConfigs.mergeBackupToConfigs(lConfigs);

    // const lBackup = JSON.parse(localStorage.getItem('si.configs.backup'));
    // const lExceptionKeys = ['api_key','app_id','app_version','default_view'];
    // const lConfigs = $scope.buildConfig();
    // const lDefaultView = $scope.data_views.find($e => $e.id == lConfigs.default_view);
    
    // Object.keys(lConfigs)
    //   .filter($k => lExceptionKeys.includes($k))  // take only the keys that we want to keep from new settings
    //   .forEach($k => {
    //     lBackup[$k] = lConfigs[$k];
    //   });
    
    // lBackup.lists.forEach($l => {
    //   $l.source = lDefaultView;
    // });

    $scope.model.state = 'complete';
    console.log('configs',lMergeConfigs);
    
    $siConfigs.clearBackup().then(_ => {
      $siApi.rest('configs',{settings : lMergeConfigs}).then(_ => {
        $timeout(_ => {
          window.location.reload(true);
        },1000);
      });
    })
    
  }

  $scope.applyPageShortcodes = function(){
    $scope.actions = [];

    const lPageCalls = [];
    const lPageDefMap = {
      listing: {
        title: 'Our listings',
        content: '[si alias="listings-all"]',
        title_details: 'Listing details',
        content_details: '[si_listing]'
      },
      broker: {
        title: 'Our team',
        content: '[si alias="brokers-all"]',
        title_details: 'Broker details',
        content_details: '[si_broker]'
      }
    }

    $scope.model.state = 'building';

    $scope.model.layouts
      .forEach($layout => {
        //if($layout.page == 'NONE') return;
        lMap = lPageDefMap[$layout.type];

        if($layout.page != 'NONE'){
          const params = {
            page_id: $layout.page, 
            title: lMap.title.translate(),
            content: lMap.content
          };

          lPageCalls.push( { create: _ => $siApi.rest('page',params), layout: $layout, attr: 'page'});
        }

        if($layout.detail_page != 'NONE'){
          const params = {
            page_id: $layout.detail_page, 
            title: lMap.title_details.translate(),
            content: lMap.content_details
          };

          lPageCalls.push( { create: _ => $siApi.rest('page',params), layout: $layout, attr: 'detail_page' });
        }
    });

    if(lPageCalls.length == 0) return $q.resolve();

    return $q( ($resolve,$reject) => {
      $q.all(
        lPageCalls.map($c => $c.create())
      ).then($responses => {

        console.log('All page done', $responses)
        $responses.forEach( ($response,$index) => {
          const lCall = lPageCalls[$index];
          if(lCall.layout[lCall.attr] == 'NEW'){
            lCall.layout[lCall.attr] = $response;
          }
        });

        $resolve();
      })
    })
  }

  $scope.preloadStep = function(){
    const credentialInfos = {
      credentials : $scope.model.credentials,
    }
    


    const lStepDataLoader = {
      account : _ => {
              return $siApi
                .portal('linked_account/list',null,null,credentialInfos)
                .then($response => {
                  $scope.accounts = $response;
                  if($scope.accounts.items.length == 1){
                    $scope.selectAccount($scope.accounts.items[0]);
                  }
                });
            },
      api_key: _ => {
              credentialInfos.account_id = $scope.model.global_account_id;

              return $siApi
                .portal('api_key/list',null,null,credentialInfos)
                .then($response => {
                  $scope.api_keys = $response;
                  if($scope.api_keys.items.length == 1){
                    $scope.selectApiKey($scope.api_keys.items[0]);
                  }
                });
            },
      default_view: _ => {
            return $siApi
                .rest('account',{account_id: $scope.model.account_id, api_key: $scope.model.api_key},{method:'GET'})
                .then($response => {
                  $scope.data_views = $response.data_views;
                  if($scope.data_views.length == 1){
                    $scope.selectDefaultView($scope.data_views[0]);
                  }
                });
            },
      layout : _ => {
              // return $siWP.loadPages()
              //   .then($response => {
              return $scope.updatePageList();
            }
    };

    const lStepName = $scope.steps[$scope.wizard_step];
    if(lStepDataLoader[lStepName] != undefined){
      return lStepDataLoader[lStepName]();
    }
    
    return $q.resolve();
  }

  $scope.updatePageList = function(){
    const lDefer = $q.defer();
    $timeout(_ => {
      console.log('updatePageList', $scope.languages.selected);
      $scope.pages = $scope.pageList[$scope.languages.selected];

      // search page
      $scope.model.layouts.forEach($layout => {
        const lContentMap = {
          listing: {
            list: /\[si\s+alias="[^"]*listings[^"]*"\]/gi,
            details: '[si_listing]'
          },
          broker: {
            list: /\[si\s+alias="[^"]*brokers[^"]*"\]/gi,
            details: '[si_broker]'
          }
        }
        const lContentMatches = lContentMap[$layout.type];
                                  
        const lFoundPage = $scope.pages.find($p => lContentMatches.list.test($p.post_content));
        const lFoundDetailPage = $scope.pages.find($p => $p.post_content.includes(lContentMatches.details));
        
        $layout.page = (lFoundPage != null) ? lFoundPage.ID : 'NEW';
        $layout.detail_page = (lFoundDetailPage != null) ? lFoundDetailPage.ID : 'NEW';
      });

      lDefer.resolve();
    })
    


    return lDefer.promise;
  }

  $scope.startWizard = function(){
    $scope.wizard_step = 0;
  }

  $scope.finishWizard = function(){
    $scope.model.state = 'complete';
    const lConfigs = $scope.buildConfig();
    console.log('configs',lConfigs);
    

    $siApi.rest('configs',{settings : lConfigs}).then(_ => {
      $timeout(_ => {
        window.location.reload(true);
      },1000);
    })
  }

  $scope.buildConfig = function(){
    
    const lTypeMap = {
      listing:{
        en: { 
          route: 'listings/{{item.location.region}}/{{item.location.city}}/{{item.transaction}}/{{item.ref_number}}/',
          route_shortcut: 'listing/{{item.ref_number}}/'  
        },
        fr: {
          route: 'proprietes/{{item.location.region}}/{{item.location.city}}/{{item.transaction}}/{{item.ref_number}}/',
          route_shortcut: 'propriete/{{item.ref_number}}/'
        }
      },
      broker:{
        en: {
          route: 'brokers/{{item.first_name}}-{{item.last_name}}/{{item.ref_number}}/',
          route_shortcut: 'broker/{{item.ref_number}}/'  
        },
        fr:{
          route: 'courtiers/{{item.first_name}}-{{item.last_name}}/{{item.ref_number}}/',
          route_shortcut: 'courtier/{{item.ref_number}}/'
        }
      }
    };
    
    const lResult = {
      account_id : $scope.model.account_id,
      api_key : $scope.model.api_key,
      default_view: $scope.model.default_view.id,
      lists: [
        $siUtils.createList($scope.model.default_view, 'listings', 'listings-all', 'contract_start_date', true, 30),
        $siUtils.createList($scope.model.default_view, 'brokers', 'brokers-all', 'last_name')
      ],

      listing_routes : $scope.languages.list
        .map($locale => $locale.code)
        .filter($locale => $locale == $scope.languages.selected)
        .map($locale => {
          return {lang: $locale, route: lTypeMap.listing[$locale].route, shortcut: lTypeMap.listing[$locale].route_shortcut}
        }
      ),
      listing_layouts: $scope.languages.list
        .map($locale => $locale.code)
        .filter($locale => $locale == $scope.languages.selected)
        .map($locale => {
          const detailPageId = ($locale == $scope.languages.selected) ? $scope.model.layouts.find($l => $l.type=='listing').detail_page : null;
          const detailPage = $scope.pages.find(p => p.ID == detailPageId).post_name;
          return {lang: $locale, communication_mode:'basic', item_row_space: [33,33,50,100], page: detailPage}
        }
      ),

      broker_routes : $scope.languages.list
        .map($locale => $locale.code)
        .filter($locale => $locale == $scope.languages.selected)
        .map($locale => {
          return {lang: $locale, route: lTypeMap.broker[$locale].route, shortcut: lTypeMap.broker[$locale].route_shortcut}
        }
      ),
      broker_layouts: $scope.languages.list
        .map($locale => $locale.code)
        .filter($locale => $locale == $scope.languages.selected)
        .map($locale => {
          const detailPageId = ($locale == $scope.languages.selected) ? $scope.model.layouts.find($l => $l.type=='broker').detail_page : null;
          const detailPage = $scope.pages.find(p => p.ID == detailPageId).post_name;
          return {lang: $locale, communication_mode:'basic', page: detailPage}
        }
      ),

    }

    return lResult;
  }

  $scope.updateWizard = function(){
    console.log('updateWizard:triggered',$scope.wizard_step);
    const lActions = [
      { key: 'previous', label: 'Previous step', action: function () { $scope.previousStep(); } },
      { key: 'next', label: 'Next step', action: function () { $scope.nextStep(); } }
    ];

    if($scope.wizard_step == $scope.steps.length - 1){
      lActions.pop();
      lActions.push({
        key: 'finish',
        label: 'Finish',
        action: function(){ 
            $scope.applyPageShortcodes()
              .then(function(){
                $scope.finishWizard();
              }); 
          }
      })
    }

    const lWizardSteps = Array.from(document.querySelectorAll('#register-dialog .wizard-step'));
    console.log($scope.wizard_step,lWizardSteps, lWizardSteps[$scope.wizard_step])
    lWizardSteps.forEach(function($e,$i){
      $e.classList.remove('show');
    });

    //console.log($scope.wizard_step,lWizardSteps, lWizardSteps[$scope.wizard_step])
    document.querySelector('#register-dialog').classList.add('si-state-loading');
    $scope.preloadStep().then(function(){
      document.querySelector('#register-dialog').classList.remove('si-state-loading');
      lWizardSteps[$scope.wizard_step].classList.add('show');
      
      

      $timeout(function (){
        $scope.actions = lActions
      });
    });
  }

  $scope.previousStep = function(){
    $scope.wizard_step -= 1;
  }

  $scope.nextStep = function(){
    $scope.wizard_step += 1;
  }

  $scope.validateStep = function($index){
    const lStepValidator = {
      account : _ => $scope.model.account_id != null,
      api_key : _ => $scope.model.api_key != null,
      default_view : _ => $scope.default_view != null,
      layouts: _ => $scope.model.layouts.length > 0
    };

    const lStepName = $scope.steps[$index];
    if(lStepValidator[lStepName] != undefined){
      return lStepValidator[lStepName]();
    }

    return true;
  }

  $scope.isNavButtonEnabled = function($button, $step){
    if($button.key == 'previous'){
      if($step == 0) return false;
      return true;
    }
    

    return $scope.validateStep($step);
  }
});


siApp
.controller('changeDatasourcesDialogCtrl', function changeDatasourcesDialogCtrl($scope, $rootScope, $element, $timeout, $q, $siUtils, $siUI, $siApi){
  $scope.tab = {
    selectedIndex: 0
  };
  $scope.model = {
    credentials: null,
    account_id: null,
    api_key: null,
    default_view: null
  }
  $scope.lists = {
    fetching: null,
    accounts: null,
    views: null,
    api_keys: null
  }

  $scope.actions = [
    {label: 'Select',  action : _ => {$scope.buildAndClose();}},
    {label: 'Cancel', action : _ => {$scope.cancel();}}
  ]

  $scope.init = function($params){
    $scope.model.credentials = $params;

    $scope.fetchAccounts().then(_ => {
      if($scope.lists.accounts.items.length == 1){
        $siUI.alert("There's no other account in Bah Sin Se").then(_ => {
          $scope.close();
        });
      }
    })
  }

  $scope.fetchAccounts = function(){
    const credentialInfos = {
      credentials : $scope.model.credentials,
    }
    $scope.lists.fetching = 'accounts';
    return $siApi
      .portal('linked_account/list',null,null,credentialInfos)
      .then($response => {
        $scope.lists.fetching = null;
        $scope.lists.accounts = $response;
      });
  }
  $scope.selectAccount = function($account){
    $scope.lists.accounts.items.forEach($e => delete $e._selected);
    $account._selected = true;
    $scope.tab.selectedIndex = 1;

    $scope.model.account_id = $account.id;
    $scope.model.default_view = null;
    $scope.model.api_key = null;

    $scope.fetchApiKeys();
  }

  
  $scope.fetchApiKeys = function(){
    const credentialInfos = {
      credentials : $scope.model.credentials,
      account_id: $scope.model.account_id
    }
    $scope.lists.fetching = 'keys';
    $scope.lists.api_keys = null;

    return $siApi
      .portal('api_key/list',null,null,credentialInfos)
      .then($response => {
        $scope.lists.api_keys = $response;
        $scope.lists.fetching = null;
        if($scope.lists.api_keys.items.length == 1){
          $scope.selectKey($scope.lists.api_keys.items[0]);
        }
      });
  }
  $scope.selectKey = function($key){
    $scope.lists.api_keys.items.forEach($e => delete $e._selected);
    $key._selected = true;
    $scope.tab.selectedIndex = 2;

    $scope.model.account_id = $key.accountId;
    $scope.model.api_key = $key.id;

    $scope.model.default_view = null;
    $scope.fetchViews();
  }

  $scope.fetchViews = function(){
    $scope.lists.fetching = 'views';
    $scope.lists.views = null;

    return $siApi
                .rest('account',{account_id: $scope.model.account_id, api_key: $scope.model.api_key},{method:'GET'})
                .then($response => {
                  $scope.lists.views = $response.data_views;
                  $scope.lists.fetching = null;

                  if($scope.lists.views.length == 1){
                    $scope.selectView($scope.lists.views[0]);
                  }
                });
  }

  $scope.selectView = function($view){
    $scope.lists.views.forEach($e => delete $e._selected);
    $view._selected = true;
    $scope.model.default_view = $view;
  }

  $scope.isActionValid = function($button){
    if($button.label == 'Select'){
      return Object.keys($scope.model).every($k => $scope.model[$k] != null);
    }
    return true;
  }

  $scope.buildAndClose = function(){
    delete $scope.model.credentials;
    $scope.closeAndReturn($scope.model);
  }

})

siApp
.controller('styleEditorDialogCtrl', function styleEditorDialogCtrl($scope, $rootScope, $element, $timeout, $q, $siUtils, $siUI){
  $scope.defaultStyles = $rootScope.global_list.styles;

  $scope.model = {
  };


  $scope.actions = [
    {label: 'Apply',  action : _ => {$scope.buildAndClose();}},
    {label: 'Cancel', action : _ => {$scope.cancel();}}
  ]

  $scope.init = function($params){
    let lModel = angular.copy($params); 
    console.log('styleEditorDialogCtrl/init', $params);
    if(typeof lModel == 'string'){
      if(lModel == '') lModel = '{}';
      try{
        lModel = JSON.parse(lModel);
      }
      catch($e){
        lModel = {};
      }
      
    }
    
    lModel = $scope.validateModel(lModel)

    $scope.model = lModel;
    console.log('styleEditorDialogCtrl/init', lModel);

    $timeout(_ => {
      $scope.showPalette();
    },500);

    // $scope.$watch(function(){
    //   return JSON.stringify($scope.model);
    // }, function(){
    //   console.log('styleEditorDialogCtrl@watch(model): triggered')
    //   $scope.$broadcast('siStyleUpdate');
    // });
    
    // Object.keys($rootScope.global_list.styles).forEach($k => {
    //   $scope.$watch('model.' + $k, function(){
    //     console.log('styleEditorDialogCtrl@watch(model): triggered')
    //     $scope.$broadcast('siStyleUpdate');
    //   });
    // });
    
  }

  $scope.validateModel = function($model){

    
    Object.keys($model)
      .filter($k => $k.startsWith('--'))
      .forEach($k => {
        let newKey = $k
          .replace(/(\-{2,3})/g,'')
          .replace(/(\-[a-z])/g, ($match) => {
            return $match.replace('-','_');
          });

        $model[newKey] = $model[$k];
        delete $model[$k];
      })
    if($model.border_style == undefined) $model.border_style = '';
    if($model.listing_item_picture_fit == undefined) $model.listing_item_picture_fit = '';
    if($model.broker_item_picture_fit == undefined) $model.broker_item_picture_fit = '';

    return $model;
  }

  $scope.showPalette = function($event=null){
    console.log($event);
    const lPaletteToShow = ($event==null) ? 'highlight' : $event.currentTarget.dataset.palette;

    Array.from($element[0].querySelectorAll('.style-menu-item, .palette')).forEach( $elm => {
      $elm.classList.remove('active');
      if(lPaletteToShow == $elm.dataset.palette){
        $elm.classList.add('active');
      }
    })
  }

  $scope.exists = function(){

  }
  $scope.toggle = function(){

  }

  $scope.reset = function(){
    $scope.model = {};
  }

  $scope.buildAndClose = function(){
    $scope.closeAndReturn($scope.model);
  }
})

siApp
.controller('pagePickerDialogCtrl', function pagePickerDialogCtrl($scope, $rootScope, $element, $timeout, $q, $siApi, $siWP){
  $scope.model = {};
  $scope.selectedPage = null;
  $scope.pageList = [];
  $scope.isLoading = true;
  $scope.isAddingPage = false;
  $scope.newpage = {
    name:''
  }
  

  $scope.init = function($params){
    $scope.model = $params;
    $scope.model.type = {
      'listings': 'listing',
      'brokers' : 'broker',
      'offices' : 'office',
      'agencies' : 'agency',
      'cities' : 'city'
    }[$scope.model.type]
    console.log($scope.model);

    $scope.fetchPages().then( _ => {
      $scope.resetActions();
    })
  }

  $scope.resetActions = function(){
    $scope.actions = [
      {label: 'Select',  action : _ => {$scope.buildAndClose();}, isValid: _ => { return $scope.pageList.some($p => $p._selected===true)}},
      {label: 'Cancel', action : _ => {$scope.cancel();}, isValid: _ => true}
    ]
  }


  $scope.addPage = function(){
    $scope.newpage = {
      name: 'Page for ' + $scope.model.type,
      content: `[si_${$scope.model.type}]`
    }

    $scope.isAddingPage = true;
    $scope.actions = [
      {label: 'Create',  action : _ => {$scope.createPage();}, isValid: _ => { return $scope.newpage.name != ''}},
      {label: 'Cancel', action : _ => {$scope.cancelCreatePage();}, isValid: _ => true}
    ]

  }

  $scope.cancelCreatePage = function(){
    $scope.isAddingPage = false;
    $scope.resetActions();
  }
  $scope.createPage = function(){
    console.log('creating page', $scope.newpage);
    $siWP.addPage($scope.newpage.name, $scope.newpage.content, $scope.model.lang).then( $newPageInfo => {
      console.log('creating page:result', $newPageInfo);
      $scope.isAddingPage = false;
      $scope.model.page = $newPageInfo;

      $scope.fetchPages().then( _ => {
        $scope.buildAndClose();
      })

    })
    
  }

  $scope.fetchPages = function(){
    $scope.isLoading = true;
    return $siWP.loadPagesForLang($scope.model.lang).then($pages => {
      $pages.forEach($p => {
        delete $p.post_content;

        if($p.post_name == $scope.model.page) $p._selected = true;
        if($p.ID == $scope.model.page) $p._selected = true;
      })
      $scope.pageList = $pages;


      $scope.isLoading = false;
    });
  }

  $scope.selectPage = function($page){
    $scope.pageList.forEach($p => {delete $p._selected});

    $page._selected = true;
  }

  $scope.buildAndClose = function(){
    const selected = $scope.pageList.find($p => $p._selected===true);

    if(selected.post_parent > 0){
      const fullpath = [selected.post_name];
      let parentId = selected.post_parent
      do {
        const parent = $scope.pageList.find($p => $p.ID == parentId);
        fullpath.unshift(parent.post_name);
        parentId = parent.post_parent;
      } while (parentId > 0);

      selected.post_name = fullpath.join('/');
    }

    console.log('pagePickerDialog/buildAndClose', selected);

    $scope.closeAndReturn(selected.post_name);
  }

});


siApp
.controller('formPickerDialogCtrl', function formPickerDialogCtrl($scope, $rootScope, $element, $timeout, $q, $siApi, $siWP){
  $scope.model = {};
  $scope.selectedForm = null;
  $scope.formList = [];
  $scope.isLoading = true;
  $scope.actions = [
    {label: 'Select',  action : _ => {$scope.buildAndClose();}, isValid: _ => { return $scope.formList.some($p => $p._selected===true)}},
    {label: 'Cancel', action : _ => {$scope.cancel();}, isValid: _ => true}
  ]

  $scope.init = function($params){
    $scope.model = $params;

    $scope.fetchForms().then( _ => {

    })
  }

  $scope.fetchForms = function(){
    $scope.isLoading = true;
    return $siApi.rest('form/list',null,{method : 'GET'}).then(function($response){
      $response.forEach($p => {
        if($p.title == $scope.model.form_id) $p._selected = true;
        if($p.id == $scope.model.form_id) $p._selected = true;
      })
      $scope.isLoading = false;
      $scope.formList = $response;
    });

  }

  $scope.selectForm = function($form){
    $scope.formList.forEach($p => {delete $p._selected});

    $form._selected = true;
  }

  $scope.buildAndClose = function(){
    const selected = $scope.formList.find($p => $p._selected===true);

    console.log('formPickerDialog/buildAndClose', selected);

    $scope.closeAndReturn(selected.id);
  }

})

/**
 * Sets basic dialog handler interface function
 */
siApp
.controller('siDialogController', function($scope,$rootScope,$mdDialog, $params){

  $scope.$params = $params;

  $scope.actions = [
      { label: 'OK', action: function () { $scope.cancel() } }
  ];

  $scope.cancel = function () {
      $mdDialog.cancel();
  }

  $scope.closeAndReturn = function($result){
    $mdDialog.hide($result);
  }
});

function BaseDialogController($scope, $mdDialog, $rootScope){
    $scope.actions = [
        { label: 'OK', action: function () { $scope.cancel() } }
    ];
    
    $scope.cancel = function () {
        $mdDialog.cancel();
    }
  
    $scope.closeAndReturn = function($result){
      $mdDialog.hide($result);
    }
  
    return $scope;
  }

function BaseListItemEditController($scope, $rootScope){
  $scope.layoutList = [];
  $scope.availVars = [];
  
  $scope.base = {
    init : function($params){
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
    }
  }
  
  $scope.actions = [
    { label: 'OK', action: function () { $scope.closeAndReturn($scope.model) } },
  ];

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
.controller('logInfoDialogCtrl', function logInfoDialogCtrl($scope,$rootScope,$siApi,$q){
  $scope.content = '';
  $scope.version = wpSiApiSettings.app_version;
  $scope.isLoading = true;
  $scope.init = function(){

    $scope.loadContent();
  }

  $scope.loadContent = function(){
    $scope.isLoading = true;
    $siApi.rest('readme').then( $content => {
      const converter = new showdown.Converter();
      const html      = converter.makeHtml($content);
      $scope.content = html;
      $scope.isLoading = false;
    });
  }
});


siApp
.controller('documentationDialogCtrl', function documentationDialogCtrl($scope,$rootScope,$siUtils,$q){
  $scope.shortcodes = [
    {name: 'Standalone calculator', description:'Display a calculator combining mortgage and tax transfer.', code: '[si_tool_calculator]'},
    {name: 'Search', description:'Display a standalone search engine. You must provide a list alias and a valid result page.', code: '[si_search alias="listing-all" result_page="/listings"]'},
    {name: 'Searchbox', description:'Display a simple search input box. You must provide a list alias and a valid result page.', code: '[si_searchbox alias="listing-all" result_page="/listings"]'},
    {name: 'List slider', description:'Display slider of either listings, brokers, offices or agencies. You must provide a list alias.', code: '[si_list_slider alias="listing-all"]'},
    {name: 'List of items', description:'Display a list of either listings, brokers, offices or agencies. You must provide a list alias.', code: '[si alias="listing-all"]'},
    {name: 'Listing details', description:'Display all information about a listing', code: '[si_listing]'},
    {name: 'Broker details', description:'Display all information about a broker', code: '[si_broker]'},
    {name: 'Office details', description:'Display all information about a office', code: '[si_office]'},
    {name: 'Agency details', description:'Display all information about a agency', code: '[si_agency]'},
  ];

  $scope.hooks = [
    {name: 'Page template', description: 'Return the page template path for listing, broker, office or agency details', type:'filter', key: 'si/page_builder/get_page_template', params: ['$page_template']},
    {name: 'Label', description: 'Change the label', type:'filter', key: 'si/label', params: ['$label']},
    {name: 'Lexicon label', description: 'Change the label of a lexicon item', type:'filter', key: 'si/lexicon/label', params: ['$label']},
    {name: 'Lexicon file path', description: 'Change the path for the lexicon base JSON file.', type:'filter', key: 'si/lexicon/path', params: ['$path','$locale']},
    {name: 'Listing details content', description: 'Change the inner content of the listing details', type:'filter', key: 'si/listing/detail/content', params: ['$content', '$ref_number', '$listing_data']},
    {name: 'Listing details class', description: 'Change the class for listing details', type:'filter', key: 'si/single-listing/class', params: ['$class']},
    {name: 'Broker details content', description: 'Change the inner content of the broker details', type:'filter', key: 'si/broker/detail/content', params: ['$content', '$ref_number', '$broker_data']},
    {name: 'Broker details class', description: 'Change the class for broker details', type:'filter', key: 'si/single-broker/class', params: ['$class']},
    {name: 'Office details content', description: 'Change the inner content of the office details', type:'filter', key: 'si/office/detail/content', params: ['$content', '$ref_number', '$office_data']},
    {name: 'Office details class', description: 'Change the class for office details', type:'filter', key: 'si/single-office/class', params: ['$class']},
  ];

  $scope.search = {
    text: ''
  }

  $scope.init = function(){
  }

  $scope.copyToClipboard = function($text){
    $siUtils.copyToClipboard($text);
  }

  $scope.getHookCode = function($hook){
    if($hook.type == 'filter'){
      return `
      add_filter('${$hook.key}', function(${$hook.params.join(', ')}){
        // Do your stuff here

        return ${$hook.params[0]};
      },10,${$hook.params.length});
      `;
    }
    else{
      return `
      add_action('${$hook.key}', function(${$hook.params.join(', ')}){
        // Do your stuff here

      },10,${$hook.params.length});
      `;
    }
  }
});


