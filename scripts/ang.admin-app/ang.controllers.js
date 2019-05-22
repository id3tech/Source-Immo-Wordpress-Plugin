/**
 * Main Configuration Controller
 */
siApp
.controller('homeCtrl', function($scope, $rootScope){

  console.log('configs controller loaded');

  $scope.route_listing_elements = {
      '{{item.ref_number}}' : 'ID',
      '{{item.transaction}}' : 'Transaction type',
      '{{item.location.region}}' : 'Region',
      '{{item.location.city}}' : 'City',
      '{{item.location.street}}' : 'Street',
      '{{item.location.civic_address}}' : 'Civic address'
  }

  $scope.route_broker_elements = {
    '{{item.ref_number}}' : 'ID',
    '{{item.first_name}}' : 'First name',
    '{{item.last_name}}' : 'Last name'
  }

  $scope.route_city_elements = {
    '{{item.code}}' : 'ID',
    '{{item.location.region}}' : 'Region',
    '{{item.name}}' : 'Name'
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

  $scope.clearAccessToken = function(){
    $scope.api('access_token',null, {method:'PATCH'}).then(function($response){
      $scope.show_toast('Access token cleared');
    });
  }

});



/**
 * Views Controllers
 */

 // List
siApp
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
      console.log('new list data', $result);
      for (const key in $result) {
        if ($result.hasOwnProperty(key)) {
          const element = $result[key];
          $list[key] = element;
        }
      }
      
      //$scope.confirm("Do you want to save the changes you've made?").then(function(){
        $scope.$emit('save-request');
      //});
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

      $scope.show_toast('List removed');
    });
  }

  $scope.getListShortcode = function($list){
    return '[si alias="' + $list.alias + '"]';
  }

  $scope.countFilters = function($list){
    let lResult = 0;
    if($list.filter_groups!=null){
      $list.filter_groups.forEach(function($e){
        lResult += $e.filters.length;
      });
    }
    return lResult;
  }
});

// Edit
siApp
.controller('listEditCtrl', function($scope, $rootScope,$q, $siUtils){
  BasePageController('listEdit', $scope,$rootScope);

  
  $scope.model = {};
  $scope._original = null;

  $scope.actions = [
    {label: 'Apply'.translate(), action: function(){$scope.return($scope.model);}},
    {label: 'Cancel'.translate(), action: $scope.cancel},
  ];

  $scope.init = function($params){
    console.log('listEdit init');
    if($params==null){
      $scope.model = {
        alias: 'New list'.translate(),
        source :$scope.data_views[0],
        type: 'listings'
      }

      $scope.reset_default_value();
    }
    else{

      $scope.model = angular.copy($params);
      if($scope.model.source != null){
        $scope.model.$$source_id =  $scope.model.source.id;
      }
      
      $scope.validate();
    }

    $scope._original = $params;
  }

  $scope.reset_default_value = function(){
    $scope.model = angular.merge($scope.model,{
      sort: 'auto',
        sort_reverse : false,
        limit: 0,
        searchable:true,
        sortable:true,
        mappable: true,
        filter_group : {
          filters : [],
          filter_groups: [],
          operator:'and'
        }
    });

    switch($scope.model.type){
      case "listings":
      case "brokers":
        $scope.model = angular.merge($scope.model, {
          list_layout : { preset: 'standard', scope_class : '', custom:null},
          list_item_layout : { preset: 'standard', scope_class : '', custom:null}
        });
        break;
      case "cities":
        $scope.model = angular.merge($scope.model, {
          list_layout : { preset: 'direct', scope_class : '', custom:null},
          list_item_layout : { preset: 'standard', scope_class : '', custom:null}
        });
    }
  }
  
  $scope.updateSource = function(){
    $scope.model.source = $scope.data_views.find(function($e){return($e.id==$scope.model.$$source_id)});

  }

  $scope.saveOrClose = function(){
    if($scope.hasChanged()){
      delete $scope.model.$$source_id;

      $scope.renewSearchToken().then(function($searchToken){
        $scope.model.search_token = $searchToken;
        $scope.return($scope.model);
      });
    }
    else{
      $scope.cancel();
    }
  }

  $scope.renewSearchToken = function(){
    let lFilters = $scope.buildFilters();
            
    let lPromise =  $q(function($resolve, $reject){
        if(lFilters != null){
            $scope.api('',lFilters,{
              url: wpApiSettings.api_root + '/api/utils/search_encode'
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

      if($scope.model.sort != '' && $scope.model.sort != 'auto'){
        if(lResult==null) lResult = {};
        lResult.sort_fields = [{field: $scope.model.sort, desc: $scope.model.sort_reverse}];
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

  $scope.hasChanged = function(){
    return !$scope.isSame($scope.model,$scope._original);
  }

  $scope.validate = function(){
    // if there's a limit but under 100, turn off searchable and pageable flags
    // if($scope.model.limit.between(1, 100)){
    //   $scope.model.searchable = false;
    // }
  }
});

/**
 * MAIN ROOT CONTROLLER
 */
siApp
.controller('mainCtrl', function($scope, $rootScope, $mdDialog, $q, $http, $mdToast,$timeout,$siApi,$siList,$siUI,$siUtils){
  $scope._status = 'initializing';
  $scope.loaded_components = [];

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
    list_layouts:{
      listings: [
        {name: 'standard', label: 'Standard'},
        {name: 'map', label: 'Map'},
        {name: 'direct', label: 'Direct render'}
      ],
      brokers: [
        {name: 'standard', label: 'Standard'},
        {name: 'map', label: 'Map'},
        {name: 'direct', label: 'Direct render'}
      ],
      cities: [
        {name: 'direct', label: 'Direct render'}
      ]
    },
    list_item_layouts:{
      listings: [
        {name: 'standard', label: 'Standard'},
        {name: 'small', label: 'Reduced'},
        {name: 'minimal', label: 'Minimal'}
      ],
      brokers : [
        {name: 'standard', label: 'Standard'},
        {name: 'reduced', label: 'Reduced'},
        {name: 'minimal', label: 'Minimal'}
      ],
      cities: [
        {name: 'standard', label: 'Standard'}
      ]
    },
    detail_layouts:[
      {name: 'standard', label: 'Standard'},
      {name: 'custom_page', label : 'Custom layout from page'}
    ],
    list_ordering_field:{
      listings : [
        {name: 'contract.start_date', label: 'Inscription date'},
        {name: 'price.sell.amount, price.rental.amount', label: 'Price'},
        {name: 'location.city_code', label: 'City'},
      ],
      brokers: [
        {name: 'first_name', label: 'First name'},
        {name: 'last_name', label: 'Last name'},
        {name: 'listing_count', label: 'Number of listings'},
      ],
      cities: [
        {name: 'name', label: 'Name'},
        {name: 'region_code', label: 'Region'},
      ]
    }
  }

  $scope.registration_steps = [
    {name: 'Linked account'},
    {name: 'API key'},
    {name: 'Data view'},
    {name: 'Integration'}
  ]

  $rootScope.current_page = 'home'
  $scope.pages = {
    'home': {label: 'Home'.translate(), style: ''},
    'listEdit': {label: 'List editing'.translate(), style: 'transform:translateX(calc(-100vw + 180px));'},
  }
  
  
  $scope.configuration_step = 0;
  $scope.credentials = null;
  $scope.data_views = [];
  $scope.wp_pages = [];
  $scope.login_infos = {
    email: '',
    password: ''
  }
  $scope.api_keys = null;

  $scope.init = function(){
    $scope.load_configs().then(_ => {
      $q.all([
        $scope.load_wp_pages(),
        $scope.load_data_views()
      ])
      .then(
        _ => {
          $siList.init();

          $scope._status = 'ready';
        },
        _ => {
          $scope._status = 'ready';
        }
      )
      .catch($err => {
        $scope._status = 'ready';
      })
    });
    
    $scope.$on('save-request', function(){
      $scope.save_configs();
    });
  }

  $scope.load_configs = function(){
    return $q(function($resolve, $reject){
      $scope.api('configs').then(function($response){
        $scope.configs = $response;
        
        if($scope.configs.default_view == null){
          $scope.reset_configs();
          $resolve();
          return;
        }

        if(typeof $scope.configs.default_view.id != 'undefined'){$scope.configs.default_view = $scope.configs.default_view.id;}
        if($scope.configs.default_view.indexOf('{"id":') >=0){$scope.configs.default_view = JSON.parse($scope.configs.default_view).id;}
        
        $resolve();
      });
    });
  }

  $scope.reset_configs = function(){
    $scope.api('configs',null, {method:'PATCH'}).then(function($response){
      $scope.configs = $response;
      $scope.show_toast('Configuration reset to demo mode');
    });
  }

  $scope.save_configs = function($silent){
    $silent = (typeof $silent == 'undefined') ? false : $silent;
    return $q(function($resolve, $reject){
      // Make sure there's a default search token for lists
      $scope.validateListConfigs()
        .then(_ => {
          $scope.api('configs',{settings: $scope.configs}).then(function($response){
            if(!$silent){
              $scope.show_toast('Save completed');
            }
            $resolve();
          });
        });
    });
  }

  $scope.validateListConfigs = function(){
    const lDefaultSearchTokenRenew = $scope.configs.lists
      .filter($l => $l.search_token=='')
      .map($l => {
        return $q( ($resolve,$reject) => {
          $siUtils.renewListSearchToken($l).then($token => {
            $l.search_token = $token;
            console.log('After token renew', $l);
            $resolve();
          })
        })
      });
      
    return $q
        .all(lDefaultSearchTokenRenew)
  }

  $scope.isInitializing = function(){
    return $scope._status == 'initializing';
  }

  $scope.load_wp_pages = function(){
    return $q(function($resolve, $reject){

      $q.all([
        $scope.api('pages',{locale: 'fr', type: ''},{method : 'GET'}),
        $scope.api('pages',{locale: 'en', type: ''},{method : 'GET'})
      ])
      .then($results => {
        $scope.wp_pages.fr = $results[0];
        $scope.wp_pages.en = $results[1];

        $scope.loaded_components.push('file');
        $resolve($scope.wp_pages);
      })
      .catch($err => {console.error($err)})
    });
  }

  $scope.load_data_views = function(){
    return $q(function($resolve, $reject){
      $scope.api('account').then(function($response){
        if($response == null) {
          $resolve();
          return;
        }

        $scope.data_views = $response.data_views;
        $scope.loaded_components.push('list');
        $resolve($response.data_views);
      });
    });
  }


  $scope.signin = function(){
    $scope.portalApi('auth/login', $scope.login_infos).then($response => {
      if([10,20].includes($response.statusCode)){
        $scope.show_toast($response.message);
        return;
      }

      $scope.credentials = $response;
      $scope.configs.account_id = null;
      $scope.configs.api_key = null;

      const lRegistrationSequence = [
        $scope.selectAccount,
        $scope.selectApiKey,
        $scope.selectDefaultView,
        $scope.setDisplayPages
      ];

      lRegistrationSequence.reduce(
        ($previous, $current) => {
          return $previous.then(_ => {
            return $current()
          })
        },
        Promise.resolve()
      ).then($result => {
        
        $scope.configs.registered = true;
        $scope.show_toast('Configuration completed')
        $scope.save_configs().then(_ => {
          $scope.configuration_step = 0;
          $scope.api_keys = null;
        });
      });
    });
  }

  $scope.signout = function(){
    $scope.reset_configs();
  }

  $scope.selectAccount = function(){
    return $q(function($resolve, $reject){
      console.log('Account selection');
      $scope.configuration_step += 1;
      $scope.portalApi('linked_account/list').then($response => {
        $response.items.forEach($e => {
          $e.clickHandler = function(){
            console.log('selected account', $e);
            $scope.portal_account_id = $e.id; 
            $resolve();
          } 
        });
        $scope.accounts = $response;
      });
    });
  }

    


  $scope.selectApiKey = function(){
    return $q(function($resolve, $reject){
      console.log('Api Key selection');
      $scope.configuration_step += 1;
      
      $scope.portalApi('api_key/list').then($response => {
        if($response.items.length == 1){
          $scope.configs.account_id = $response.items[0].accountId;
          $scope.configs.api_key=$response.items[0].id;
          $scope.save_configs(true).then(_ => {
            $resolve();
          });
        }
        else{
          $response.items.forEach($e => {
            $e.clickHandler = function(){
              $scope.configs.account_id = $e.accountId;
              $scope.configs.api_key=$e.id;
              
              $scope.save_configs(true).then(_ => {
                $resolve();
              });
            } 
          });
          $scope.api_keys = $response;
        }

      });
    });
  }

  $scope.selectDefaultView = function(){
    return $q(function($resolve, $reject){
      console.log('Default view selection');
      $scope.configuration_step += 1;

      $scope.load_data_views().then($views => {
        console.log('views',$views);

        if($views.length == 1){
          $scope.configs.default_view=$views[0].id; 
          $scope.updateListsView();
          $resolve();
        }
        else{
          $views.forEach($e => {
            $e.clickHandler = function(){
              $scope.configs.default_view=$e.id; 
              $scope.updateListsView();
              $resolve();
            } 
          });
        }
      });
    });
  }

  $scope.setDisplayPages = function(){
    $scope.configuration_step += 1;
    $scope.default_listing_page = 'NEW';
    $scope.default_broker_page = 'NEW';



    return $q(function($resolve, $reject){
      
      $scope.load_wp_pages().then($pages => {
        //$timeout(_ => {
          $pages.fr.forEach($p => {
            console.log($p.post_title);
            if('propriétés' == $p.post_title.toLowerCase()) $scope.default_listing_page = $p.ID;
            if('courtiers' == $p.post_title.toLowerCase()) $scope.default_broker_page = $p.ID;
          });  
        //})
        

        $scope.applyShortCodeHandler = function(){
          $q.all(
            $scope.applyListingShortCode(),
            $scope.applyBrokerShortCode()
          ).then($result => {
            $resolve();
          })
        }
      });
    });
  }

  $scope.applyListingShortCode = function(){
    return $q(function($resolve, $reject){
      $scope.api('page',{page_id: $scope.default_listing_page, title: 'Propriétés', content:'[si alias="listings"]'}).then($result => {
        $resolve();
      });
    })
  }

  $scope.applyBrokerShortCode = function(){
    return $q(function($resolve, $reject){
      $scope.api('page',{page_id: $scope.default_broker_page, title: 'Courtiers',content:'[si alias="brokers"]'}).then($result => {
        $resolve();
      });
    })
  }

  $scope.updateListsView = function(){
    $scope.configs.lists.forEach($e => {
      if($e.source == ''){
        $e.source = $scope.data_views.find($e => $e.id == $scope.configs.default_view);
        $e.search_token = '';
      }
    });

    console.log('config lists', $scope.configs.lists);
  }

  $scope.initListSearchToken = function(){
    let lFilters = null;
            
    let lPromise =  $q(function($resolve, $reject){
        if(lFilters != null){
            $scope.api('', lFilters,{
              url: wpApiSettings.api_root + '/api/utils/search_encode'
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

  
  $scope.changeApiKey = function(){
    $siUI.getPortalCredentials().then($credentials => {
      console.log($credentials);
      $scope.credentials = $credentials;
      
      $scope.portalApi('linked_account/list').then($response => {
        const lPortalAccount = $response.items.find($e => $e.account.id == $scope.configs.account_id);
        if(lPortalAccount != null){
          $scope.portal_account_id = lPortalAccount.id;

          $scope.portalApi('api_key/list').then($response => {
            if($response.items.length == 1){
              $siUI.show_toast("There's only one API key for this account");
              return;
            }
            $scope.api_keys = $response.items
          });
        }
      });


      
    });
  }




//#region UI
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
    return $siUI.confirm($title,$message, $options)
  }

  /**
   * Display a notification toast in the top right of the screen
   * @param {string} $message 
   */
  $scope.show_toast = function($message){
    $siUI.show_toast($message);
  }

  /**
   * Call a dialog to open
   * @param {string} $dialog_id 
   * @param {*} $params 
   */
  $scope.dialog = function($dialog_id, $params){
    return $siUI.dialog($dialog_id, $params);
  }

//#endregion


//#region API
  /**
   * Call the API
   * @param {string} $path Endpoint to the api call
   * @param {*} $data Data object to send in the request
   * @param {*} $options Options to add at the $http call
   * @return {promise} Promise object
   */
  $scope.api = function($path, $data, $options){
      return $siApi.rest($path,$data,$options);
  }

  $scope.portalApi = function($path, $data, $options){
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

    if($scope.credentials != null){
      if(!lOptions.params) lOptions.params = {};
      
      lOptions.params.at = $scope.credentials.authTokenKey;

      if($scope.portal_account_id != null){
        lOptions.params.la = $scope.portal_account_id;
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

//#endregion

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
        if(key.indexOf('$$') == 0) continue;

        if($objA[key]!=null && $objB[key]!=null){
          if ( (typeof($objA[key])!='undefined') && (typeof($objB[key])!='undefined') ) {
            //console.log('checking array', key,typeof($objA[key]));
            if(typeof($objA[key].push) == 'function'){
              //console.log('checking array',key);
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
        else if($objA[key]!=null || $objB[key]!=null){
          //console.log(key,'is null');
          return false;
        }
      }

    }
    else if ($objA == null || $objB == null){
      return false;
    }

    return true;
  }

});

/* DIALOGS */
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
})