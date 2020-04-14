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
    $scope.show('styles');
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
      for (let $key in $scope.wp_languages) {
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

  $scope.show = function($panel_id){
    const lAdminPanel = document.querySelector('#si-admin-configs');
    const lNavButtons = Array.from( lAdminPanel.querySelectorAll('.nav-button'));
    const lSections = Array.from(lAdminPanel.querySelectorAll('.sections section'));
    const lButton = lAdminPanel.querySelector('.nav-button.' + $panel_id);
    const lTarget = lAdminPanel.querySelector('#' + $panel_id);

    lNavButtons.forEach($e => $e.classList.remove('selected'));
    lSections.forEach($e => $e.classList.remove('selected'));

    lTarget.classList.add('selected');
    lButton.classList.add('selected');
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

  $scope.add = function($type){
    $scope.show_page('listEdit', $type).then(function($result){
      lNew = $result;
      $scope.configs.lists.push(lNew);
      $scope.$emit('save-request');
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
      $scope.$emit('save-request');
    });
  }

  $scope.getListShortcode = function($list, $type=null){
    switch($type){
      case 'search':
        return '[si_search alias="' + $list.alias + '" placeholder="Find a property, city, street, #sia, etc." result_page="/proprietes/" standalone="true"]';
        break;
      case 'searchbox':
          return '[si_searchbox alias="' + $list.alias + '" placeholder="Find a property, city, street, #sia, etc." result_page="/proprietes/"]';
          break;
      case 'gallery':
        return '[si_list_slider alias="' + $list.alias + '" limit="10"]';
        break;
      default:
        return '[si alias="' + $list.alias + '"]';
    }
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


/**
 * MAIN ROOT CONTROLLER
 */
siApp
.controller('mainCtrl', function($scope, $rootScope, $mdDialog, $q, $http, $mdToast,$timeout,$siApi,$siList,$siUI,$siUtils){
  $scope._status = 'initializing';
  $scope.loaded_components = [];
  $scope.wpSiApiSettings = wpSiApiSettings;
  
  $scope.configs = {};
  $scope.lang_codes = {
    fr: 'Français',
    en: 'English',
    es: 'Español'
  }

  $scope.wp_languages = null;

  $rootScope.global_list = {
    sources: [],
    list_types: [
      {key: 'listings', label: 'Listings'},
      {key: 'brokers', label: 'Brokers'},
      {key: 'cities', label: 'Cities'},
      {key: 'offices', label: 'Offices'}
    ],
    list_layouts:{
      listings: [
        {name: 'standard', label: 'Standard'},
        {name: 'map', label: 'Map'},
        {name: 'direct', label: 'Server side rendering'}
      ],
      brokers: [
        {name: 'standard', label: 'Standard'},
        {name: 'direct', label: 'Server side rendering'}
      ],
      cities: [
        {name: 'direct', label: 'Server side rendering'}
      ],
      offices: [
        {name: 'direct', label: 'Server side rendering'}
      ]
    },
    list_item_layouts:{
      listings: [
        {name: 'standard', label: 'Standard'},
        {name: 'double-layer', label: 'Double Layers'}
      ],
      brokers : [
        {name: 'standard', label: 'Standard'},
        {name: 'double-layer', label: 'Double Layers'}
      ],
      cities: [
        {name: 'standard', label: 'Standard'}
      ],
      offices: [
        {name: 'standard', label: 'Standard'}
      ]
    },
    list_item_vars: {
      listings: [
        {name:'ref_number',label: 'Ref. number'},
        {name:'price', label: 'Price'},
        {name:'address',label: 'Address'},
        {name:'city', label: 'City'},
        {name:'description', label: 'Description'},
        {name:'category', label: 'Category'},
        {name:'subcategory', label: 'Subcategory'},
        {name:'rooms', label: 'Rooms'},
        {name:'region', label: 'Region'},
        {name:'available_area', label:'Available area'},
        {name:'flags',label: 'Flags'},
        {name:'open_houses',label: 'Open houses'}
      ],
      brokers: [
        {name:'fullname', label: 'Fullname'},
        {name:'first_name',label:'First name'},
        {name:'last_name',label:'Last name'},
        {name:'title',label:'Title'},
        {name:'phone',label:'Phone'},
        {name:'email',label:'Email'},
        {name:'office',label:'Office'},
        {name:'listing_count',label:'Listings'},
      ],
      cities :[
        {name:'name',label: 'Name'},
        {name:'region', label: 'Region'},
        {name:'listing_count',label:'Listings'},
        {name:'code',label: 'Code'}
      ],
      offices :[
        {name:'name',label: 'Name'},
        {name:'region', label: 'Region'},
        {name:'listing_count',label:'Listings'},
        {name:'address',label:'Address'},
        {name:'code',label: 'Code'}
      ]
    },
    list_item_image_hover_effects:{
      listings: [
        {name: 'none', label: 'None'},
        {name: 'zoom', label: 'Zoom'},
        {name: 'gallery', label: 'Gallery'}
      ],
      brokers: [
        {name: 'none', label: 'None'},
        {name: 'zoom', label: 'Zoom'}
      ],
      cities: [],
      offices: [],
    },
    list_item_show_layer_effects:{
      listings: [
        {name: 'none', label: 'None'},
        {name: 'slide', label: 'Slide'},
        {name: 'flip', label: 'Flip'},
        {name: 'fade', label: 'Fade'}
      ],
      brokers: [
        {name: 'none', label: 'None'},
        {name: 'slide', label: 'Slide'},
        {name: 'flip', label: 'Flip'},
        {name: 'fade', label: 'Fade'}
      ],
      cities: [
        {name: 'none', label: 'None'},
        {name: 'slide', label: 'Slide'},
        {name: 'flip', label: 'Flip'},
        {name: 'fade', label: 'Fade'}
      ],
      offices: [
        {name: 'none', label: 'None'},
        {name: 'slide', label: 'Slide'},
        {name: 'flip', label: 'Flip'},
        {name: 'fade', label: 'Fade'}
      ],
    },
    detail_layouts:[
      {name: 'standard', label: 'Standard'},
      {name: 'custom_page', label : 'Custom layout from page'}
    ],
    list_ordering_field:{
      listings : [
        {name: 'contract_start_date', label: 'Inscription date'},
        {name: 'price', label: 'Price'},
      ],
      brokers: [
        {name: 'last_name', label: 'Name'},
        {name: 'listing_count', label: 'Number of listings'},
      ],
      cities: [
        {name: 'name', label: 'Name'},
        {name: 'region', label: 'Region'},
      ],
      offices: [
        {name: 'name', label: 'Name'},
        {name: 'region', label: 'Region'},
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
    'listEdit': {label: 'List editing'.translate(), style: 'transform:translateX(-100%);'},
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
  $scope.page_languages = [];
  $scope.languages = {
    fr : 'Français',
    en : 'English',
    es : 'Español'
  }

  $scope.message = null;

  $scope.default_page = 
    {
      fr: {
        listing: 'NEW',
        listing_details: 'NEW',
        broker: 'NEW',
        broker_details: 'NEW',
        city: 'NONE',
        city_details: 'NONE',
        office:'NONE',
        office_details: 'NONE',
      },
      en: {
        listing: 'NEW',
        listing_details: 'NEW',
        broker: 'NEW',
        broker_details: 'NEW',
        city: 'NONE',
        city_details: 'NONE',
        office:'NONE',
        office_details: 'NONE',
      }
  }
  

  $scope.init = function(){
    $scope.load_configs().then(_ => {
      $q.all([
        $scope.load_wp_pages(),
        $scope.load_wp_menus(),
        $scope.load_data_views(),
        $scope.load_wp_forms(),
        $scope.load_dictionary(),
        $scope.load_addons()
      ])
      .then(
        _ => {
          //$siList.init($scope.configs.default_view);

          $scope._status = 'ready';

          $scope.checkIntegrity();
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

    $scope.$on('reload-pages', function(){
      $scope.load_wp_pages();
    })
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

  $scope.load_addons = function(){
    $scope.api('addons/list', null, {method: 'GET'}).then(function($response){
      $scope.loaded_components.push('cogs');
      $scope.addons = $response;
    })
  }

  $scope.load_wp_forms = function(){
    $scope.api('form/list',null,{method : 'GET'}).then(function($response){
      $scope.loaded_components.push('clipboard-check');
      $scope.formList = $response;
    });
  }

  $scope.load_dictionary = function(){
    $scope.api('dictionary',{lang: $locales._current_lang_},{method : 'GET'}).then(function($response){
      $scope.loaded_components.push('book');
      $siList.dictionary = $response;
    });
  }

  $scope.reset_configs = function(){
    $scope.api('configs/reset',null, {method:'POST'}).then(function($response){
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
          console.log('saving configs', $scope.configs);
          
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

  $scope.load_wp_languages = function(){
    return $q(function($resolve, $reject){
      if($scope.wp_languages != null){
        $resolve($scope.wp_languages);
        return;
      }
      
      $scope.api('language/list',null,{method : 'GET'})
      .then($result => {
        $scope.wp_languages = $result;
        
        $resolve($scope.wp_languages);
      })
      .catch($err => {console.error($err)})
    });
  }

  $scope.load_wp_pages = function(){
    return $q(function($resolve, $reject){
      $scope.load_wp_languages().then($languages => {
        

      
        $q.all([
          $scope.api('page/list',{locale: 'fr', type: ''},{method : 'GET'}),
          $scope.api('page/list',{locale: 'en', type: ''},{method : 'GET'})
        ])
        .then($results => {
          $scope.wp_pages.fr = $results[0];
          $scope.wp_pages.en = $results[1];

          $scope.loaded_components.push('file');
          $resolve($scope.wp_pages);
        })
        .catch($err => {console.error($err)})
      });
    });
  }

  $scope.load_wp_menus = function(){
    return $scope.api('menu/list',null, {method: 'GET'})
    .then($result => {
        $scope.wp_menus = Object.keys($result).map($k => {return {key: $k, name: $result[$k]} });
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
        $scope.message = {
          show_icon: true,
          title : 'Configuration completed',
          text: 'Thank you! Please wait while the interface reloads'
        };
        
        $scope.configs.registered = true;
        $scope.save_configs().then(_ => {
          
          window.setTimeout(_ => {
            $scope.configuration_step = 0;
            $scope.api_keys = null;
            window.location.reload(true);
          },2000);
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
    console.log('setDisplayPages', $scope.wp_languages);
    $scope.wp_languages.forEach($l => {
      $scope.addPageLanguage($l);  
    })

    
    const lShortcodeMap = {
      listing : { title: 'Our listings', content: '[si alias="listings"]', list: _ => { $scope.addList('listings', 'listings', 'contract.start_date', true, 30); } },
      listing_details : { title: 'Listing details', content: '[si_listing]', layout: 'listing_layouts'},
      broker : { title: 'Our team', content: '[si alias="brokers"]', list: _ => { $scope.addList('brokers', 'brokers', 'last_name'); }},
      broker_details : { title: 'Broker details', content: '[si_broker]', layout: 'broker_layouts'},
      office : { title: 'Our offices', content: '[si alias="offices"]', list: _ => { $scope.addList('offices', 'offices', 'name'); }},
      office_details : { title: 'Office details', content: '[si_office]', layout: 'office_layouts'},
      city : { title: 'Cities', content: '[si alias="cities"]', list: _ => { $scope.addList('cities', 'cities','name'); }},
      city_details : { title: 'City details', content: '[si_city]', layout: 'city_layouts'},
    };

    // find pages if exists
    ['listing', 'listing_details','broker','broker_details'].forEach($k => {
      const lPageEn = $scope.wp_pages.en.find($page => $page.post_title == lShortcodeMap[$k].title);
      const lPageFr = $scope.wp_pages.fr.find($page => $page.post_title == lShortcodeMap[$k].title.translate());
      if(lPageEn != null){
        $scope.default_page.en[$k] = lPageEn.ID;
      }
      if(lPageFr != null){
        $scope.default_page.fr[$k] = lPageFr.ID;

      }
    });
    
    

    return $q(function($resolve, $reject){  
      
      // will be call upon next step
      $scope.applyShortCodeHandler = function(){

        $scope.configs.lists =[];
        const lSourcePages = [];
        const lChildPages = [];

        $scope.wp_languages.forEach( ($language, $language_index) => {
          Object.keys($scope.default_page[$language.code]).forEach($pKey => {
            if($scope.default_page[$language.code][$pKey] == 'NONE') return; 

            const lMap =lShortcodeMap[$pKey];
            
            if(lMap == undefined){
              console.log('Map undefined', $pKey, $language.code, lShortcodeMap);
              return;
            }
            
            if(typeof lMap.list == 'function') {
              lMap.list();
            }

            const params = {
              page_id: $scope.default_page[$language.code][$pKey], 
              title: lMap.title.translate(undefined, $language.code),
              content: lMap.content,
              lang: $language.code
            };

            const lCall =_ => {
              const lLayout = (lMap.layout == undefined) ? null : $scope.configs[lMap.layout].find($layout => $layout.lang==$language.code)

              if($language_index > 0) {
                if(lMap.pages != undefined && lMap.pages[$scope.wp_languages[0].code] != undefined){
                  params.original_page_id = lMap.pages[$scope.wp_languages[0].code];
                }
              }

              return $scope.api('page',params).then($response => {
                if($scope.default_page[$language.code][$pKey] == 'NEW' && !isNaN($response+1)){
                  if(lMap.pages == undefined) lMap.pages = {};
                  lMap.pages[$language.code] = $response;

                  if(lLayout != null){
                    lLayout.page = $response;
                    lLayout.type = "custom";
                  }
                }
                else if($scope.default_page[$language.code][$pKey] != 'NEW'){
                  if(lLayout != null){
                    lLayout.page = $scope.default_page[$language.code][$pKey];
                    lLayout.type = "custom";
                  }
                }
              });
            }

            if($language_index == 0){
              lSourcePages.push(lCall);
            }
            else{
              lChildPages.push(lCall);
            }
            
          });
        })

        $timeout( _ => {
          $scope.message = {
            show_icon: false,
            title : 'Work in progress',
            text: 'Please wait while we apply your configuration'
          };
        })
        
        return lSourcePages.reduce((promiseChain, currentTask) => {
          return promiseChain.then(chainResults =>
              currentTask().then(currentResult =>
                  [ ...chainResults, currentResult ]
              )
            );
        }, Promise.resolve([]))
        .then(arrayOfResults => {
          console.log('All main page created');
          
          return lChildPages.reduce((promiseChain, currentTask) => {
            return promiseChain.then(chainResults =>
                currentTask().then(currentResult =>
                    [ ...chainResults, currentResult ]
                )
              );
          }, Promise.resolve([]))
          .then(arrayOfResults => {
            console.log('All child page created');

            $resolve();
          });
        })
        .catch($error => {
          console.log('An error occured while creating page', )
        });
      }
    
      $scope.skipPageBuilding = function(){
        $resolve();
      }
    });
  }

  $scope.addList = function($type, $alias, $sort = '', $sortReverse = false, $limit = 0){
    const lExistingList = $scope.configs.lists.find($l => $l.alias == $alias);
    const lList = (lExistingList == null) ? {alias : $alias, type: $type} : lExistingList;

    const lTypedDatas = {
      'listings' : {
        search_engine_options : {
          type : 'full'
        },
        displayed_vars: {
          main: ["address", "city", "price", "rooms", "subcategory"]
        }
      },
      'brokers' : {
        search_engine_options : {
          type : 'full'
        },
        displayed_vars: {
          main: ["first_name", "last_name", "phone", "title"]
        }
      }
    }

    lList.sort = $sort==''  ? null : $sort;
    lList.sort_reverse = $sortReverse;
    lList.limit = $limit;
    lList.list_layout       = {type: 'standard', preset: 'standard', scope_class : ''};
    lList.list_item_layout  = {type: 'standard', preset: 'standard', scope_class : ''};
    
    lList.searchable = true;
    lList.sortable = true;
    lList.mappable = true;

    if(lTypedDatas[$type]!=undefined){
      lList.search_engine_options = lTypedDatas[$type].search_engine_options;
      lList.list_item_layout.displayed_vars = lTypedDatas[$type].displayed_vars;
    }

    lList.source = $scope.data_views.find($e => $e.id == $scope.configs.default_view);
    lList.search_token = '';

    if(lExistingList == null){
      $scope.configs.lists.push(lList);
    }
    
  }

  $scope.addPageLanguage = function($lang){
    const lPageTitleByLangMap = {
      fr : {
        'propriétés' : 'listing',
        'courtiers' : 'broker',
        'bureaux' : 'office',
        'villes' : 'city'
      },
      en : {
        'properties' : 'listing',
        'brokers' : 'broker',
        'offices' : 'office',
        'cities' : 'city'
      }
    }
    const lLocaleCode = $lang.code;

    if($scope.default_page[lLocaleCode] == undefined) $scope.default_page[lLocaleCode] = {};
    
    $scope.wp_pages[lLocaleCode].forEach($p => {
      const lMapKey = Object.keys(lPageTitleByLangMap[lLocaleCode]).find($k => $k == $p.post_title.toLowerCase());
      if(lMapKey != null){
        $scope.default_page[lLocaleCode][lMapKey] = $p.ID;
      }
    });

    $scope.page_languages.push(lLocaleCode);
    console.log('page_languages', $scope.page_languages);
  }

  $scope.removePageLanguage = function($lang){
    $scope.page_languages = $scope.page_languages.filter($l => $l != $lang);
  }

  $scope.showPage = function($layout){
    if($layout.page != undefined){
      $scope.api('page/permalink',{page_id: $layout.page}).then($response => {
        window.open($response);
      })
    }
  }

  $scope.languageIsAvailable = function($lang){
    return !$scope.page_languages.includes($lang.code);
  }

  $scope.applyListingShortCode = function(){
    return $q(function($resolve, $reject){
      const params = {
        page_id: $scope.default_page.listing, 
        title: 'Our Listings'.translate(), 
        content:'[si alias="listings"]'
      };

      $scope.api('page',params).then($result => {
        $resolve();
      });
    })
  }

  $scope.applyBrokerShortCode = function(){
    return $q(function($resolve, $reject){
      const params = {
        page_id: $scope.default_page.broker, 
        title: 'Our Teams'.translate(),
        content:'[si alias="brokers"]'
      };

      $scope.api('page',params).then($result => {
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

  $scope.updateStyles = function($styles){
    $scope.configs.styles = $styles;
    $scope.save_configs();
  }

  $scope.initListSearchToken = function(){
    let lFilters = null;
            
    let lPromise =  $q(function($resolve, $reject){
        if(lFilters != null){
            $scope.api('', lFilters,{
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

  $scope.checkIntegrity = function(){
    
    // check details' layouts
    if($scope.hasEmptyLayouts()){
      $siUI.confirm("Some layout's page are missing. Would you like to create them now?",undefined,{ok: 'Yes', cancel: 'No'}).then(function(){
        $scope.fillEmptyLayouts();
      },_ => {});
    }
    else{
      console.log('no empty layout', $scope.configs);
    }
    
  }

  $scope.generateLayoutPage = function($layout, $groupType){
   
    
    const lTypeMaps = {
      listings: {
        title: 'Listing details',
        content: '[si_listing]',
        layouts: $scope.configs.listing_layouts
      },
      brokers:{
        title: 'Broker details',
        content: '[si_broker]',
        layouts: $scope.configs.broker_layouts
      },
      offices:{
        title: 'Office details',
        content: '[si_office]',
        layouts: $scope.configs.office_layouts
      },
      cities:{
        title: 'City details',
        content: '[si_city]',
        layouts: $scope.configs.city_layouts
      }
    }

    const lLayoutInfos = lTypeMaps[$groupType];
    const lPageTitle    = $layout.lang == 'en' ? lLayoutInfos.title : lLayoutInfos.title.translate();
    const lPageContent  = lLayoutInfos.content;
    const lOriginalPageId = lLayoutInfos.layouts.filter($l => $l.page != null && $l.lang!=$layout.lang).reduce( ($result,$cur) => $cur.page, null);


    $scope.api('page',{lang: $layout.lang, page_id: 'NEW', title: lPageTitle, content: lPageContent, original_page_id: lOriginalPageId}).then($response => {
      $layout.page = $response;
      $scope.save_configs();
    });
  }

  $scope.clearAllLayoutPage = function(){
    const lLayoutMap = ['listing_layouts','broker_layouts','office_layouts','city_layouts'];

    lLayoutMap.forEach($layoutGroup => {
      $scope.configs[$layoutGroup].forEach($layout => {
        $layout.page = null;
      });
    });

    $scope.save_configs();
  }

  $scope.clearLayoutPage = function($layout){
    $layout.page = null;
    $scope.save_configs();
  }
  

  $scope.hasEmptyLayouts = function(){
    if(!$scope.configs.registered) return false;

    const lLayoutMap = {
      listings : 'listing_layouts',
      brokers : 'broker_layouts',
      offices : 'office_layouts',
      cities : 'city_layouts',
    }

    const lFiltered = Object.keys(lLayoutMap)
                        .filter(function($type){
                          return $scope.configs.lists.some(function($l){
                            return $l.type == $type;
                          })
                        });
    console.log('hasEmptyLayouts',lFiltered);
    return lFiltered
      .some(function($type){
        return $scope.configs[lLayoutMap[$type]].some(function($layout){
          return $layout.page==null
        });
      });
  }

  $scope.fillEmptyLayouts = function(){
    const lLayoutMap = {
      listings : 'listing_layouts',
      brokers : 'broker_layouts',
      offices : 'office_layouts',
      cities : 'city_layouts',
    }
    const lPages = {
      listings: {
        title: 'Listing details',
        content: '[si_listing]',
      },
      brokers:{
        title: 'Broker details',
        content: '[si_broker]'
      },
      offices:{
        title: 'Office details',
        content: '[si_office]'
      },
      cities:{
        title: 'City details',
        content: '[si_city]'
      }
    }
    const lLayoutCreationPromises = [];
    
    Object.keys(lLayoutMap)
      .filter(function($type){
        return $scope.configs.lists.some(function($l){
          return $l.type == $type;
        })
      })
      .forEach(function($type){ // Loop throught layout maps
        let lOrignalPageId = null;
        $scope.configs[lLayoutMap[$type]].forEach(function($layout){ // loop throught layouts
          

          if($layout.page==null){
            
            lLayoutCreationPromises.push(_ => {
              const lPageTitle    = $layout.lang == 'en' ? lPages[$type].title : lPages[$type].title.translate();
              const lPageContent  = lPages[$type].content;

              return $q( ($resolve, $reject) => {
                
                  $scope.api('page',{lang: $layout.lang, page_id: 'NEW', title: lPageTitle, content: lPageContent, original_page_id: lOrignalPageId}).then($response => {
                    $layout.page = $response;
                    lOrignalPageId = $layout.page;
                    console.log('apply page layout', $response, $layout.page);
                    $resolve();
                  });
                
              })
            });
          }
        });
      });

    $siUI.show_toast('Generating empty layout pages');
    return lLayoutCreationPromises.reduce((promiseChain, currentTask) => {
      return promiseChain.then(chainResults =>
          currentTask().then(currentResult =>
              [ ...chainResults, currentResult ]
          )
        );
    }, Promise.resolve([])).then(arrayOfResults => {
        console.log('saving these', $scope.configs);
        $scope.save_configs();
        $rootScope.$broadcast('reload-pages');
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

