/* DIALOGS */
// ------------------------------------
//#region Brokers Dialogs
// ------------------------------------

function brokersSearchEngineEditCtrl($scope, $rootScope, $mdDialog,$siUI,$params){
  BaseDialogController($scope,$mdDialog,$rootScope);

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
  $scope.init = function(){
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
}

function brokersListItemEditCtrl($scope, $rootScope, $mdDialog,$siUI,$params){
BaseDialogController($scope,$mdDialog,$rootScope);
$scope.layoutList = [];
$scope.availVars = [];
$scope.model ={};

$scope.actions = [
    { label: 'OK', action: function () { $scope.closeAndReturn($scope.model) } },
];

$scope.init = function(){
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

}

// ------------------------------------
//#endregion Brokers Dialogs
// ------------------------------------


// ------------------------------------
//#region Listings Dialogs
// ------------------------------------

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
    $scope.init = function(){
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
}

function listingsListItemEditCtrl($scope, $rootScope, $mdDialog,$siUI,$params){
  BaseDialogController($scope,$mdDialog,$rootScope);
  $scope.layoutList = [];
  $scope.availVars = [];
  $scope.model ={};

  $scope.actions = [
      { label: 'OK', action: function () { $scope.closeAndReturn($scope.model) } },
  ];

  $scope.init = function(){
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

}

// ------------------------------------
//#endregion Listings Dialogs
// ------------------------------------

// ------------------------------------
//#region Cities Dialogs
// ------------------------------------

function citiesSearchEngineEditCtrl($scope, $rootScope, $mdDialog,$siUI,$params){
  BaseDialogController($scope,$mdDialog,$rootScope);

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
  $scope.init = function(){
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
}

function citiesListItemEditCtrl($scope, $rootScope, $mdDialog,$siUI,$params){
  BaseDialogController($scope,$mdDialog,$rootScope);
  BaseListItemEditController($scope, $rootScope);
   
  $scope.model = {};


  $scope.init = function(){
      console.log('init cityListItemEdit', $params, $rootScope.global_list.list_item_vars[$scope.model.type])
      $scope.base.init($params);
      
      console.log('availVars',$scope.availVars);
  }


}

// ------------------------------------
//#endregion Cities Dialogs
// ------------------------------------


// ------------------------------------
//#region Offices Dialogs
// ------------------------------------

function officesSearchEngineEditCtrl($scope, $rootScope, $mdDialog,$siUI,$params){
  BaseDialogController($scope,$mdDialog,$rootScope);

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
  $scope.init = function(){
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
}

function officesListItemEditCtrl($scope, $rootScope, $mdDialog,$siUI,$params){
  BaseDialogController($scope,$mdDialog,$rootScope);
  BaseListItemEditController($scope, $rootScope);

  $scope.model ={};

  $scope.init = function(){
      console.log('init officeListItemEdit', $params, $rootScope.global_list.list_item_vars[$scope.model.type])
      $scope.base.init($params);
      console.log('availVars',$scope.availVars);
  }

}

// ------------------------------------
//#endregion Offices Dialogs
// ------------------------------------


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
        $scope.closeAndReturn($response);
      }
      else{
        $siUI.show_toast($response.message.translate());
      }
    });
  }
});


siApp
.controller('registerCtrl', function registerCtrl($scope, $rootScope,$timeout, $mdDialog,$q,$siUtils, $siUI, $siApi){
  BaseDialogController($scope, $mdDialog, $rootScope);

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
  
  $scope.wizard_step = null;

  
  $scope.actions = [];

  $scope.init = function(){
    console.log('register dialog init');

    $scope.$watch(function(){
      return $scope.wizard_step;
    },
    function($new, $old){
      
      if($new === $old) return;
      console.log('wizard_step:updated', $new, $old);
      if($new == null) return;
      $scope.preloadStep().then(function(){
        $scope.updateWizard();
      });
    })
  }


  $scope.signin = function(){
    $scope.signin_message = null;

    $siApi.portal('auth/login', $scope.login_infos).then($response => {

      if([10,20].includes($response.statusCode)){
        //$siUI.alert($response.message);
        $scope.signin_message = $response.message.translate();
        return false;
      }

      $scope.model.state = 'configs';
      
      $scope.model.credentials = $response;

      $scope.startWizard();
      // $scope.configs.account_id = null;
      // $scope.configs.api_key = null;

      // const lRegistrationSequence = [
      //   $scope.selectAccount,
      //   $scope.selectApiKey,
      //   $scope.selectDefaultView,
      //   $scope.setDisplayPages
      // ];

      // lRegistrationSequence.reduce(
      //   ($previous, $current) => {
      //     return $previous.then(_ => {
      //       return $current()
      //     })
      //   },
      //   Promise.resolve()
      // ).then($result => {
      //   $scope.message = {
      //     show_icon: true,
      //     title : 'Configuration completed',
      //     text: 'Thank you! Please wait while the interface reloads'
      //   };
        
      //   $scope.configs.registered = true;
      //   $scope.save_configs().then(_ => {
          
      //     window.setTimeout(_ => {
      //       $scope.configuration_step = 0;
      //       $scope.api_keys = null;
      //       window.location.reload(true);
      //     },2000);
      //   });
      // });
    });
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
    $scope.nextStep();
  }

  $scope.applyPageShortcodes = function(){
    $scope.actions = [];

    const lPageCalls = [];
    const lPageDefMap = {
      listing: {
        title: 'Our listings',
        content: '[si alias="listings"]',
        title_details: 'Listing details',
        content_details: '[si_listing]'
      },
      broker: {
        title: 'Our team',
        content: '[si alias="brokers"]',
        title_details: 'Broker details',
        content_details: '[si_broker]'
      }
    }

    $scope.model.state = 'building';

    $scope.model.layouts.forEach($layout => {
      if($layout.page == 'NONE') return;
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
                });
            },
      api_key: _ => {
              credentialInfos.account_id = $scope.model.global_account_id;

              return $siApi
                .portal('api_key/list',null,null,credentialInfos)
                .then($response => {
                  $scope.api_keys = $response;
                });
            },
      default_view: _ => {
            return $siApi
                .rest('account',{account_id: $scope.model.account_id, api_key: $scope.model.api_key},{method:'GET'})
                .then($response => {
                  $scope.data_views = $response.data_views;
                });
            },
      layout : _ => {
              return $siApi
                .rest('page/list',{locale: null, type: 'page'},{method : 'GET'})
                .then($response => {
                  $scope.pages = $response;

                  // search page
                  $scope.model.layouts.forEach($layout => {
                    const lContentMatches = $layout.type == 'listing'
                                              ? ['[si alias="listings"]','[si_listing]']
                                              : ['[si alias="brokers"]','[si_broker]'];
                                              
                    const lFoundPage = $scope.pages.find($p => $p.post_content == lContentMatches[0]);
                    const lFoundDetailPage = $scope.pages.find($p => $p.post_content == lContentMatches[1]);
                    
                    if(lFoundPage != null) $layout.page = lFoundPage.ID;
                    if(lFoundDetailPage != null) $layout.detail_page = lFoundDetailPage.ID;
                  });

                });
            }
    };

    const lStepName = $scope.steps[$scope.wizard_step];
    if(lStepDataLoader[lStepName] != undefined){
      return lStepDataLoader[lStepName]();
    }
    
    return $q.resolve();
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
    const lLocale = wpSiApiSettings.locale;
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
        $siUtils.createList($scope.model.default_view, 'listings', 'listings', 'contract_start_date', true, 30),
        $siUtils.createList($scope.model.default_view, 'brokers', 'brokers', 'last_name')
      ],
      listing_routes : [
        {lang: lLocale, route: lTypeMap.listing[lLocale].route, shortcut: lTypeMap.listing[lLocale].route_shortcut}
      ],
      listing_layouts: [
        {lang: lLocale, communication_mode:'basic',  page: $scope.model.layouts.find($l => $l.type=='listing').detail_page}
      ],
      broker_routes : [
        {lang: lLocale, route: lTypeMap.broker[lLocale].route, shortcut: lTypeMap.broker[lLocale].route_shortcut}
      ],
      broker_layouts: [
        {lang: lLocale, communication_mode:'basic', page: $scope.model.layouts.find($l => $l.type=='broker').detail_page}
      ],
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

    const lWizardSteps = Array.from(document.querySelectorAll('#register .wizard-step'));
    console.log($scope.wizard_step,lWizardSteps, lWizardSteps[$scope.wizard_step])
    lWizardSteps.forEach(function($e,$i){
      $e.classList.remove('show');
    });

    //console.log($scope.wizard_step,lWizardSteps, lWizardSteps[$scope.wizard_step])
    lWizardSteps[$scope.wizard_step].classList.add('show');

    $timeout(function (){
      $scope.actions = lActions
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


