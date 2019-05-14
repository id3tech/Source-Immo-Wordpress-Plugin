/**
 * Main Configuration Controller
 */
ImmoDbApp
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
    return '[immodb alias="' + $list.alias + '"]';
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
ImmoDbApp
.controller('listEditCtrl', function($scope, $rootScope,$q){
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
ImmoDbApp
.controller('mainCtrl', function($scope, $rootScope, $mdDialog, $q, $http, $mdToast,$timeout,$immodbApi,$immodbList,$immodbUI){
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

  $scope.init = function(){
    $scope.load_configs().then(_ => {
      $q.all([
        $scope.load_wp_pages(),
        $scope.load_data_views()
      ]).then(_ => {
        $immodbList.init();
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
      $scope.api('configs',{settings: $scope.configs}).then(function($response){
        if(!$silent){
          $scope.show_toast('Save completed');
        }
        $resolve();
      });
    });
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

        $resolve($scope.wp_pages);
      })
      .catch($err => {console.error($err)})
    });
  }

  $scope.load_data_views = function(){
    return $q(function($resolve, $reject){
      $scope.api('account').then(function($response){
        if($response == null) return;

        $scope.data_views = $response.data_views;
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
        });
      });
    });
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
      $scope.api('page',{page_id: $scope.default_listing_page, title: 'Propriétés', content:'[immodb alias="listings"]'}).then($result => {
        $resolve();
      });
    })
  }

  $scope.applyBrokerShortCode = function(){
    return $q(function($resolve, $reject){
      $scope.api('page',{page_id: $scope.default_broker_page, title: 'Courtiers',content:'[immodb alias="brokers"]'}).then($result => {
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
    return $immodbUI.confirm($title,$message, $options)
  }

  /**
   * Display a notification toast in the top right of the screen
   * @param {string} $message 
   */
  $scope.show_toast = function($message){
    $immodbUI.show_toast($message);
  }

  /**
   * Call a dialog to open
   * @param {string} $dialog_id 
   * @param {*} $params 
   */
  $scope.dialog = function($dialog_id, $params){
    return $immodbUI.dialog($dialog_id, $params);
  }



  /**
   * Call the API
   * @param {string} $path Endpoint to the api call
   * @param {*} $data Data object to send in the request
   * @param {*} $options Options to add at the $http call
   * @return {promise} Promise object
   */
  $scope.api = function($path, $data, $options){
      return $immodbApi.rest($path,$data,$options);
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
ImmoDbApp
.controller('signinCtrl', function signinCtrl($scope, $rootScope, $mdDialog){
  BaseDialogController('signin',$scope, $rootScope, $mdDialog);


})


/* DIRECTIVES */
ImmoDbApp
.directive('immodbRouteBox', function immodbRouteBox($immodbUtils, $immodbList,$immodbUI){
  return {
    restrict : 'E',
    scope : {
      route : '=',
      removeHandler : '&onRemove',
      list : '=',
      type: '@',
      changeHandler: '&siChange'
    },
    templateUrl : wpApiSettings.base_path + '/views/ang-templates/immodb-route-box.html',
    replace: true,
    link: function($scope, $elm, $attr){
      $scope.init();
    },
    controller: function($scope){
      $scope.lang_codes = {
        fr: 'Français',
        en: 'English',
        es: 'Español'
      }

      $scope.route_listing_elements = {
        '{{item.ref_number}}' : 'ID',
        '{{item.transaction}}' : 'Transaction type',
        '{{item.location.region}}' : 'Region',
        '{{item.location.city}}' : 'City',
        '{{item.location.street}}' : 'Street',
        '{{item.location.civic_address}}' : 'Address'
      }
    
      $scope.route_broker_elements = {
        '{{item.ref_number}}' : 'ID',
        '{{item.first_name}}' : 'First name',
        '{{item.last_name}}' : 'Last name'
      }
    
      $scope.route_city_elements = {
        '{{item.ref_number}}' : 'ID',
        '{{item.location.region}}' : 'Region',
        '{{item.name}}' : 'Name'
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
        }
      }

      $scope.route_elements = {};
      
      $scope.init = function(){
        $scope.route_elements = $scope['route_' + $scope.type + '_elements'];
        
      }

      $scope.hasMinRouteCount = function(){
        if($scope.list == null || $scope.list == undefined) return true;
        if($scope.list.length <= 1) return true;

        return false;
      }

      $scope.langIsUsed = function($lang){
        if($scope.list == null || $scope.list == undefined) return true;
        return $scope.list.some($e => $e.lang == $lang);
      }

      $scope.elementIsUsed = function($elm){
        if($scope.route.route == '') return false;
        
        return $scope.route.route.indexOf($elm)>=0;
      }

      $scope.elementUseCount = function(){
        let lResult = 0;
        if($scope.route_elements == null || $scope.route_elements==undefined) return 0;
        let lRouteElms = $immodbUtils.toKeyArray($scope.route_elements);
        lRouteElms.forEach(function($e){
          if($scope.route.route.indexOf($e) >= 0){
            lResult++;
          }
        });

        return lResult;
      }

      $scope.reset = function(){
        $scope.route.route = $scope.route_default[$scope.type][$scope.route.lang];
      }

      $scope.elementAvailable = function(){
        if ($scope.route_elements == null || $scope.route_elements==undefined) return 0;
        let lRouteElms = $immodbUtils.toKeyArray($scope.route_elements);
        let lResult = lRouteElms.length - $scope.elementUseCount();
        return lResult;
      }

      $scope.remove = function(){
        let fnRemove = function(){
          $scope.list.forEach(function($e, $i){
            if($e == $scope.route){
              $scope.list.splice($i,1);
              return;
            }
          });
        }
        if($scope.route.route == ''){
          fnRemove();
        }
        else{
          $immodbUI.confirm('Are you sure you want to remove this route?').then(function(){
            fnRemove();
          });
        } 
      }

      $scope.update = function(){
        if(typeof $scope.changeHandler == 'function'){
          $scope.changeHandler({route : $scope.route});
        }
      }


      $scope.addRouteElement = function($key){
        $scope.route.route += $key;
      }
    },
  }
});

ImmoDbApp
.directive('immodbFilterGroup', function immodbFilterGroup(){
  let dir_controller = function ($scope,$rootScope) {
    $scope.filter_group_operators = {
      'and' : 'And',
      'or'  : 'Or'
    }
  
    
    
    $scope.$watch("model", function(){
      $scope.init();
    });

    $scope.init = function(){
      console.log('filter_group model', $scope.model, $scope.parent);
    }

    $scope.addFilterGroup = function(){
      if($scope.model.filter_groups==null){
        $scope.model.filter_groups = [];
      }

      $scope.model.filter_groups.push({filters: null, operator: 'and'});
    }

    $scope.removeGroup = function(){
      $scope.removeFromList($scope.model, $scope.parent, 'filter_groups');
    }

    $scope.removeFromList = function($item,$parent, $name){
      let lNewList = [];
      $list = $parent[$name];
      $list.forEach(function($elm){
        if(JSON.stringify($elm) != JSON.stringify($item)){
          lNewList.push($elm);
        }
      })
      
      if(lNewList.length == 0){
        lNewList = null;
      }

      $parent[$name] = lNewList;
    }


    $scope.addFilter = function($group){
      if($scope.model.filters==null){
        $scope.model.filters = [];
      }

      $scope.model.filters.push({field: '', operator: 'Equal', value: ''});
    }

    $scope.switchOperator = function($newOperator){
      $scope.model.operator = $newOperator;
    }
  };

  return {
    restrict: 'E',
    scope: {
        model: '=ngModel',
        parent: '=ngParent'
    },
    controllerAs: 'ctrl',
    template: '<div ng-include="\'filter-group\'" class="immodb-filter-group group-operator-{{model.operator}}"></div>',
    controller: dir_controller
  };
});

ImmoDbApp
.directive('immodbFilterItem', function immodbFilterItem($immodbUtils, $immodbList){
  return {
    restrict : 'E',
    scope : {
      filter : '=ngModel',
      removeHandler : '&onRemove'
    },
    templateUrl : wpApiSettings.base_path + '/views/ang-templates/immodb-filter-item.html',
    replace: true,
    link: function($scope, $elm, $attr){
      $scope.init();
    },
    controller: function($scope){
      $scope.value_choices = [];
      $scope.selected_key =  'price.sell.amount';
      $scope.selected_filter_key = null;

      $scope.filter_key_list = [
        {value: 'price.sell.amount'         , label: 'Selling price', value_type: 'number', op_out: ['like','not_like']},
        {value: 'price.lease.amount'         , label: 'Leasing price', value_type: 'number', op_out: ['like','not_like']},
        {value: 'location.country_code'     , label: 'Country', value_type: 'list', choices: 'getCountryList', op_in: ['in','not_in']},
        {value: 'location.state_code'       , label: 'State/Province', value_type: 'list', choices: 'getStateList', op_in: ['in','not_in']},
        {value: 'location.region_code'      , label: 'Region', value_type: 'list', choices: 'getRegionList', op_in: ['in','not_in']},
        {value: 'location.city_code'        , label: 'City', value_type: 'list', choices: 'getCityList', op_in: ['in','not_in']},
        {value: 'category_code'             , label: 'Category', value_type: 'list', choices: 'getCategoryList', op_in: ['in','not_in']},
        {value: 'subcategory_code'          , label: 'Subcategory', value_type: 'list', choices: 'getSubcategoryList', op_in: ['in','not_in']},
        {value: 'open_houses[0].end_date'   , label: 'Open house date', value_type: 'text', choices: 'udf.now():Now'},
        {value: 'main_unit.bedroom_count'   , label: 'Bedroom count', value_type: 'number', op_out: ['like','not_like']},
        {value: 'main_unit.bathroom_count'  , label: 'Bathroom count', value_type: 'number', op_out: ['like','not_like']},
        {value: 'attributes.PARKING'        , label: 'Parking count', value_type: 'number', op_out: ['like','not_like']},
        {value: 'attributes.GARAGE'         , label: 'Garage', value_type: 'bool', op_in: ['equal','not_equal']},
        {value: 'attributes.POOL'           , label: 'Pool', value_type: 'bool', op_in: ['equal','not_equal']},
        {value: 'status_code'               , label: 'Status', value_type: 'list', choices: 'SOLD:Sold|AVAILABLE:Available', op_in: ['in','not_in']},
      ];

      $scope.filter_operators = [
        {key: 'equal'               , value : 'Equal to'},
        {key: 'not_equal'           , value: 'Different of'},
        {key: 'less_than'           , value: 'Less than'},
        {key: 'less_or_equal_to'    , value: 'Less or equals to'},
        {key: 'greater_than'        , value: 'Greater than'},
        {key: 'greater_or_equal_to' , value: 'Greater or equals to'},
        {key: 'in'                  , value: 'One of'},
        {key: 'not_in'              , value: 'Not one of'},
        {key: 'like'                , value: 'Contains'},
        {key: 'not_like'            , value: 'Does not contains'}
      ];

      $scope.init = function(){
        $scope.selected_key = $scope.filter.field;
        $scope.selected_filter_key = $scope.filter_key_list.find($e => $e.value == $scope.selected_key);
        $scope.updateFilterChoices();
      }

      $scope.remove = function(){
        if($scope.removeHandler != undefined){
          $scope.removeHandler();
        }
      }

      $scope.filterFieldChanged = function(){
        $scope.filter.field=$scope.selected_key;
        $scope.value_choices = [];
        $scope.filter.value = '';
        $scope.selected_filter_key = $scope.filter_key_list.find($e => $e.value == $scope.selected_key);
        $scope.updateFilterChoices();
      }

      $scope.updateFilterChoices = function(){
        if($scope.selected_filter_key.value_type == 'list'){
          console.log('list from ', $scope.selected_filter_key.choices);

          if(typeof($immodbList[$scope.selected_filter_key.choices]) == 'function'){
            console.log($scope.selected_filter_key.choices, 'found');
            $scope.value_choices = $immodbList[$scope.selected_filter_key.choices]();
            console.log($scope.selected_filter_key.choices, $scope.value_choices);
          }
          else{
            $scope.value_choices = $immodbUtils.stringToOptionList($scope.selected_filter_key.choices);
          }
        }
      }

      $scope.formatFilterValueList = function(){
        if($scope.filter.value != null){
          if(typeof $scope.filter.value.push == 'function'){
            if($scope.filter.value.length==1){
              return '1 item selected'.translate()
            }
            return '{0} items selected'.translate().format($scope.filter.value.length);
          }
        }

        return $scope.filter.value;
      }

      $scope.operatorFilterByField = function($item){
          if($item == null) return false;

          if($scope.selected_key.op_in != undefined){
            return $scope.selected_key.op_in.indexOf($item.key) >= 0;
          }
          else if ($scope.selected_key.op_out != undefined){
            return !($scope.selected_key.op_out.indexOf($item.key) >= 0);
          }


          return true;
      }

    }
  }
  
});

ImmoDbApp
.directive('siOnEnter', ['$parse', function siOnEnter($parse){
  return {
    restrict: 'A',
    link: function($scope,$element, $attr){
      $element.on('keyup', function($event){
        if($event.keyCode==13){
          const lHandler = $parse($attr.siOnEnter);
          lHandler($scope, {$event: $event});
        }
      });
    }
  }
}]);


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

