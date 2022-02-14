/**
 * Main Configuration Controller
 */
siApp
.controller('homeCtrl', function($scope, $rootScope,$timeout, $siConfigs){

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

  $scope.route_office_elements = {
    '{{item.ref_number}}' : 'ID',
    '{{item.name}}' : 'Name',
    '{{item.agency.name}}' : 'Agency name'
  }

  $scope.route_agency_elements = {
    '{{item.ref_number}}' : 'ID',
    '{{item.name}}' : 'Name',
  }

  $scope.route_city_elements = {
    '{{item.code}}' : 'ID',
    '{{item.location.region}}' : 'Region',
    '{{item.name}}' : 'Name'
  }

  $scope._pageInit_ = function(){
    $scope.show('general');

    
  }

  $scope.addRouteElement = function($item,$elm){
    $item.route += $elm;
  }

  $scope.addRoute = function($list,$lang){
    let lLocale = $lang;
    if($list.some(function($e){return $e.lang == $lang})) return;
    
    $list.push({lang: lLocale, route : ''});
  }

  $scope.removeRoute = function($index,$list_name){
    $scope.configs[$list_name].splice($index,1);
  }

  $scope.addLayout = function($list, $lang){
    if($list.some(function($e){return $e.lang == $lang})) return;

    $list.push({
      lang: $lang,
      page: null,
      communication_mode:'basic'
    });

    $scope.save_configs();
  }

  $scope.removeLayout = function($index,$list){
    $timeout(_ => {
      $list.splice($index,1);
      $scope.save_configs();
    });
    
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


    $scope.panelChanged($panel_id);

    lNavButtons.forEach($e => $e.classList.remove('selected'));
    lSections.forEach($e => $e.classList.remove('selected'));

    lTarget.classList.add('selected');
    lButton.classList.add('selected');
  }

  $scope.panelChanged = function($panel_id){
    panelChangeAction = {
      'advanced' : _ => {
        $scope.load_wp_menus();
      }
    }

    if(panelChangeAction[$panel_id] != undefined) panelChangeAction[$panel_id]();
  }

});



/**
 * Views Controllers
 */

 // List
siApp
.controller('listCollectionCtrl', function($scope, $rootScope, $siConfigs){
  $scope.init = function(){

  }

});


/**
 * MAIN ROOT CONTROLLER
 */
siApp
.controller('mainCtrl', function($scope, $rootScope, $mdDialog, $q, $http, $mdToast,$timeout,$siApi,$siList,$siUI,$siUtils, $siUser, $siConfigs, $siWP){
  $scope._status = 'initializing';
  $scope.loaded_components = [];
  $scope.wpSiApiSettings = wpSiApiSettings;
  $scope.notices = [];
  $scope.user = $siUser;

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
      {key: 'offices', label: 'Offices'},
      {key: 'agencies', label: 'Agencies'}
    ],
    list_layouts:{
      listings: [
        {name: 'standard', label: 'Client side (default)'},
        //{name: 'map', label: 'Map'},
        {name: 'direct', label: 'Server side (no search tool)'}
      ],
      brokers: [
        {name: 'standard', label: 'Client side (default)'},
        {name: 'direct', label: 'Server side (no search tool)'}
      ],
      cities: [
        {name: 'direct', label: 'Server side (no search tool)'}
      ],
      offices: [
        {name: 'standard', label: 'Client side (default)'},
        {name: 'direct', label: 'Server side (no search tool)'}
      ],
      agencies: [
        {name: 'standard', label: 'Client side (default)'},
        {name: 'direct', label: 'Server side (no search tool)'}
      ]
    },
    list_item_layouts:{
      listings: [
        {name: 'standard', label: 'Standard', vars: ['address','city','photo','price','category','subcategory','rooms','flags','open_houses']},
        {name: 'double-layer', label: 'Double Layers (advanced)'}
      ],
      brokers : [
        {name: 'standard', label: 'Standard', vars: ['photo','fullname','title','phone']},
        {name: 'double-layer', label: 'Double Layers (advanced)'}
      ],
      cities: [
        {name: 'standard', label: 'Standard', vars: ['name','listing_count']}
      ],
      offices: [
        {name: 'standard', label: 'Standard', vars: ['name','agency_name','phone','listing_count']}
      ],
      agencies: [
        {name: 'standard', label: 'Standard', vars: ['name','license','phone']}
      ]
    },
    list_item_vars: {
      listings: [
        {name:'photo', label: 'Photo'},
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
        {name:'photo', label: 'Photo'},
        {name:'ref_number',label: 'Ref. number'},
        {name:'fullname', label: 'Fullname'},
        {name:'company_name', label: 'Company name'},
        {name:'first_name',label:'First name'},
        {name:'last_name',label:'Last name'},
        {name:'title',label:'Title'},
        {name:'phone',label:'Phone'},
        {name:'phones',label:'Phone list'},
        {name:'email',label:'Email'},
        {name:'office',label:'Office'},
        {name:'contacts', label: 'Contacts'},
        {name:'counters',label:'Listings'},
      ],
      cities :[
        {name:'name',label: 'Name'},
        {name:'region', label: 'Region'},
        {name:'counters',label:'Listings'},
        {name:'code',label: 'Code'}
      ],
      offices :[
        {name:'name',label: 'Name'},
        {name:'agency-name',label: 'Agency name'},
        {name:'counters',label:'Counters'},
        {name:'address',label:'Address'},
        {name:'phone',label:'Phone'},
        {name:'email',label:'Email'},
        {name:'contacts', label: 'Contacts'},
        {name:'code',label: 'Code'},
      ],
      agencies :[
        {name:'name',label: 'Name'},
        {name:'counters',label:'Counters'},
        {name:'address', label: 'Address'},
        {name:'phone',label:'Phone'},
        {name:'email',label:'Email'},
        {name:'contacts', label: 'Contacts'},
        {name:'license',label:'License'},
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
      agencies: [],
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
      agencies: [
        {name: 'none', label: 'None'},
        {name: 'slide', label: 'Slide'},
        {name: 'flip', label: 'Flip'},
        {name: 'fade', label: 'Fade'}
      ],
    },
    list_item_layer_positions:{
      listings: [
        {name: 'fix', label: 'Fix'},
        {name: 'overlay', label: 'Overlay'},
      ],
      brokers: [
        {name: 'fix', label: 'Fix'},
        {name: 'overlay', label: 'Overlay'},
      ],
      cities: [
        {name: 'fix', label: 'Fix'},
        {name: 'overlay', label: 'Overlay'},
      ],
      offices: [
        {name: 'fix', label: 'Fix'},
        {name: 'overlay', label: 'Overlay'},
      ],
      agencies: [
        {name: 'fix', label: 'Fix'},
        {name: 'overlay', label: 'Overlay'},
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
        {name: 'name', label: 'Name'},
        {name: 'listing_count', label: 'Number of listings'},
      ],
      cities: [
        {name: 'name', label: 'Name'},
        {name: 'region', label: 'Region'},
      ],
      offices: [
        {name: 'name', label: 'Name'},
        {name: 'agency.name', label: 'Agency name'},
        {name: 'region', label: 'Region'},
      ],
      agencies: [
        {name: 'name', label: 'Name'}
      ]
    },
    styles : {
      'container_width' : '1170px',
      'font_name' : 'inherit',
      'highlight' : '#ff9900',
      'highlight_text_color' : '#333',
      'text_color' : '#333',
      'background_color' : '#fff',
      'input_placeholder_color' : 'rgba(#333,0.5)',
      'layout_gutter' : '20px',
      'padding': '20px',
      'border_width' : '1px',
      'border_style' : 'solid',
      'border_color' : '#aaa',
      'border_radius' : '0px',

      // 'container_border_color' : '[element_border_color]',
      // 'container_border' : ' solid 1px [container_border_color]',
      // 'container_border_radius' : '[element_border_radius]',
      // 'container_padding' : ' [layout_gutter]',
      // 'element_border_color' : '#aaa',
      // 'element_border' : 'solid 1px [element_border_color]',
      // 'element_border_radius' : '0px',
      // 'element_padding': '10px',
      // 'component_border_color' : '#aaa',
      // 'component_border' : '[border_style] [border_width] [border_color]',
      // 'component_border_radius' : '[border_radius]',
      
      'list_item_separator_color' : '#aaa',
      'list_item_separator' : 'solid 1px [list_item_separator_color]',
      'list_item_padding': '10px',
      'high_contrast_color' : '#333',
      'high_contrast_text_color' : '#fff',
      'medium_contrast_color' : '#b9b9b9',
      'medium_contrast_text_color' : '[text_color]',
      'small_contrast_color' : '#e2e2e2',
      'small_contrast_text_color' : '[text_color]',
      
      'error_color' : '#850000',
      'button_border_color' : '#aaa',
      'button_border_style' : 'none',
      'button_border_width' : '1px',
      'button_border_radius' : '0',
      'button_bg_color' : '#333',
      'button_text_color' : '#fff',
      'button_font_name' : '[font_name]',
      'button_hover_bg_color' : '#ff9900',
      'button_hover_text_color' : '#333',
      'button_alt_bg_color' : '#777',
      'button_alt_text_color' : '#fff',
      'button_alt_hover_bg_color' : '#9d9d9d',
      'button_alt_hover_text_color' : '#fff',
      'uls_label': 'ULS: ',
      'listing_item_sold_bg_color' : '#ff8800',
      'listing_item_sold_text_color' : '#fff',
      //'listing_item_column_width' : '340px',
      'listing_item_picture_ratio' : '3 / 2',
      'thumbnail_picture_size' : '100px',
      //'broker_item_column_width' : '210px',
      'broker_item_picture_ratio' : '3.2 / 4',
      //'office_item_column_width' : '320px',
    }
  }

  $scope.registration_steps = [
    {name: 'Linked account'},
    {name: 'API key'},
    {name: 'Data feed(s)'},
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
        agency:'NONE',
        agency_details: 'NONE',
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
        agency:'NONE',
        agency_details: 'NONE',
      }
  }
  

  $scope.init = function(){
    $scope.load_configs().then(_ => {
      $q.all([
        //$scope.load_wp_menus(),
        $scope.load_data_views(),
        //$scope.load_wp_forms(),
        $scope.load_dictionary(),
        $scope.load_addons()
      ])
      .then(
        _ => {
          //$siList.init($scope.configs.default_view);
          
          
          $scope._status = 'ready';
          if($scope.configs.registered == false){
            $scope.startRegistration();
            return;
          }
          else{
            //$siUser.isReady().then(_ => {
              $rootScope.$broadcast('si/ready');
            //});
          }
          
          $scope.checkIntegrity();
        },
        _ => {
          $scope._status = 'ready';
          $rootScope.$broadcast('si/ready');
        }
      )
      .then( _ => {
            
        $scope.$on('save-request', function(){
          $scope.save_configs();
        });

        $scope.$on('reload-pages', function(){
          //$scope.load_wp_pages();
        })

        $scope.getWhatNew();

      })
      .catch($err => {
        $scope._status = 'ready';
        $rootScope.$broadcast('si/ready');
      })
    });
    
  }

  $scope.load_configs = function(){
    return $q(function($resolve, $reject){
      $siConfigs.load().then(function($response){
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

  $scope.getWhatNew = function(){
    $siApi.rest('readme').then($content => {
      // extract latest version content
      const fileContent = $content;//.replace(/\\r\\n/g,'\r\n');
      const expression = /## Change log\r\nversion[^\r\n]+\r\n(([^\r\n]+\r\n)+)/gm
      const extractRE = new RegExp(/## Change log\r\nversion[^\r\n]+\r\n(([^\r\n]+\r\n)+)/gm,'gm');
      const testResult = extractRE.test(fileContent);
      if(testResult){
        extractRE.lastIndex = 0;
        const extractResult = extractRE.exec(fileContent);
        const converter = new showdown.Converter();
        $scope.whatNewText = converter.makeHtml(extractResult[1]);
      }
      
    })
  }

  $scope.reset_all_configs = function(){
    $siUI.confirm('All your configurations will be lost.\nAre you sure you want to reset all settings?')
    .then(
      function(){
        return $siUI.confirm('Before we proceed','Would you like to backup the current configuration?',{ok:'Yes',cancel:'No'}).then( 
          _ => {
            $scope.exportConfigs();
            return $scope.reset_configs();
          },
          _ =>{
            return $scope.reset_configs();
          }
        );
      }
    )
    .then(function(){
      $siUI.show_toast('Configurations cleared');
    })
    .then(function(){
      $scope.startRegistration();
    })
  }

  $scope.reset_configs = function(){
    return $scope.api('configs/reset',null, {method:'POST'}).then(function($response){
      $scope.configs = $response;
      
    });
  }

  $scope.hasBackup = function(){
    return $siConfigs.configsBackup != null;
  }
  
  $scope.backupConfigs = function($silent){
    $silent = (typeof $silent == undefined) ? false : $silent;
    
    return $siConfigs.backup().then(function(){
      if(!$silent){
        $siUI.show_toast('Settings backup done');
      }
      $scope.checkIntegrity();
    });
  }

  $scope.exportConfigs = function(){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify($siConfigs.configs));
    var downloadAnchorNode = document.createElement('a');
    const exportName = 'si-configs.' + location.hostname + '.' + moment().format('YYYY-MM-DD');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  $scope.importConfigs = function(){

    $siUI.getLocalFile('.json').then($fileContent => {
      const newConfigs = JSON.parse($fileContent);
      if(newConfigs == null) return $siUI.alert('Error','File content is not valid');
      if(['app_id','api_key','account_id'].some($k => newConfigs[$k] == undefined)) return $siUI.alert('Error','File content is not valid');
      const fnSaveNewConfigs = function ($data){
        $timeout(_ => {
          //$siUI.confirm('Last question','Do you want to overwrite all settings?', {ok:'Overwrite', cancel: 'Import layou'})
          $scope.configs = $data;
          $scope.save_configs();
        },500)
      }
      $siUI.confirm('Warning','Are you sure you want to apply these configurations?',{ok:'Yes',cancel:'No'}).then( _ => {
        $siUI.confirm('Before we proceed','Would you like to backup the current configuration?',{ok:'Yes',cancel:'No'}).then( 
          _ => {
            $scope.exportConfigs();
            fnSaveNewConfigs(newConfigs);
            //console.log('importConfigs',newConfigs );
          },
          _ => {
            fnSaveNewConfigs(newConfigs);
            //console.log('importConfigs', newConfigs);
          }
        )
      });
    });
  }

  $scope.showReadme = function(){
    $siUI.dialog('log-info');
  }

  $scope.openStyleEditor = function(){
    console.log('openStyleEditor', $siConfigs.configs.styles);
    $siUI.dialog('style-editor', $siConfigs.configs.styles).then( $styles => {
      //console.log('openStyleEditor', $styles);
      $siConfigs.configs.styles = JSON.stringify($styles);
      $scope.save_configs();
    });
  }

  $scope.changeDefaultView = function($view){
    $scope.configs.lists
      .filter($l => $l.source.id == $scope.configs.default_view)
      .forEach($l => {
        $l.source = $view;
      });

    $scope.configs.default_view = $view.id;
    $scope.save_configs();
  }

  $scope.logoChanged = function($logo){
    $scope.configs.site_logo = $logo;
    $scope.save_configs();
  }

  $scope.save_configs = function($silent){
    $silent = (typeof $silent == 'undefined') ? false : $silent;
    return $q(function($resolve, $reject){
      // Make sure there's a default search token for lists
      
      $scope.validateListConfigs()
        .then(_ => {
          console.log('saving configs', $scope.configs);
          
          $siConfigs.save($scope.configs).then(
            function($response){
              if(!$silent){
                $scope.show_toast('Save completed');
              }
              $scope.checkIntegrity();
              $resolve();
            },
            function($reason){
              if($reason == 403){
                $siUI.alert('Failed to save, nonce expired. The page will reload').then(_ => {
                  window.location.reload(true);
                });
                
              }
            }
          );
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
    // return $siWP.loadPages().then($pages => {
    //   $scope.loaded_components.push('file');
    // });

      // return $q(function($resolve, $reject){
      //   $scope.load_wp_languages().then($languages => {
          

        
      //     $q.all([
      //       $scope.api('page/list',{locale: 'fr', type: ''},{method : 'GET'}),
      //       $scope.api('page/list',{locale: 'en', type: ''},{method : 'GET'})
      //     ])
      //     .then($results => {
      //       $scope.wp_pages.fr = $results[0];
      //       $scope.wp_pages.en = $results[1];

      //       $scope.loaded_components.push('file');
      //       $resolve($scope.wp_pages);
      //     })
      //     .catch($err => {console.error($err)})
      //   });
      // });
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

        $rootScope.data_views = $scope.data_views = $response.data_views;
        $scope.loaded_components.push('list');
        $resolve($response.data_views);
      });
    });
  }


  $scope.signin = function(){
    $scope.signin_in = true;
    $scope.portalApi('auth/login', $scope.login_infos).then($response => {

      $scope.signin_in = false;

      if([10,20].includes($response.statusCode)){
        $siUI.alert($response.message);
        return;
      }

      console.log('signin configs', $scope.configs);

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
    $siUI.confirm('Attention','Once disconnected from your account, all your real estate data will disapear from your site.\nAre you sure you want to continue?').then(function(){
      $scope.backupConfigs(true).then(function(){
        $scope.reset_configs()
        .then( function(){
          $scope.show_toast('Configuration reset');
        })
        .then(function(){
          $scope.startRegistration();
        });
      });
      
    }) 
  }

  $scope.switchAccount = function(){
    $siUser.getCredentials().then($credentials => {
      $siUI.dialog('change-datasources',$credentials,{clickOutsideToClose:false}).then($result => {
        $siConfigs.replaceAccount($result).then(_ => {
          // Reload view and dictionnary;
          $scope.load_data_views();
          $scope.load_dictionary();
          $siUI.show_toast('Account switched successfully');
        });

      })
    })

    // $siUI.confirm('Attention','Once disconnected from your account, all your real estate data will disapear from your site.\nAre you sure you want to continue?').then(function(){
    //   $scope.backupConfigs(true).then(function(){
    //     $scope.reset_configs()
    //     .then( function(){
    //       $scope.show_toast('Configuration reset');
    //     })
    //     .then(function(){
    //       $scope.startRegistration();
    //     });
    //   });
    // });
  }

  $scope.startRegistration = function(){
    console.log('startRegistration');
    $siUI.dialog('register',null,{multiple: true, clickOutsideToClose:false,hasBackdrop: false}).then(function(){
      window.location.reload(true);
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
    console.log('setDisplayPages', $scope.wp_languages);
    $scope.wp_languages.forEach($l => {
      $scope.addPageLanguage($l);  
    })

    
    const lShortcodeMap = {
      listing : { title: 'Our listings', content: '[si alias="listings"]', list: _ => { $scope.addList('listings', 'listings', 'contract_start_date', true, 30); } },
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
    //const lList = (lExistingList == null) ? {alias : $alias, type: $type} : lExistingList;
    const lView = $scope.data_views.find($e => $e.id == $scope.configs.default_view);
    const lList = $siUtils.createList(lView, $type, $alias, $sort,$sortReverse,$limit, lExistingList);

    // const lTypedDatas = {
    //   'listings' : {
    //     search_engine_options : {
    //       type : 'full'
    //     },
    //     displayed_vars: {
    //       main: ["address", "city", "price", "rooms", "subcategory"]
    //     }
    //   },
    //   'brokers' : {
    //     search_engine_options : {
    //       type : 'full'
    //     },
    //     displayed_vars: {
    //       main: ["first_name", "last_name", "phone", "title"]
    //     }
    //   }
    // }

    // lList.sort = $sort==''  ? null : $sort;
    // lList.sort_reverse = $sortReverse;
    // lList.limit = $limit;
    // lList.list_layout       = {type: 'standard', preset: 'standard', scope_class : ''};
    // lList.list_item_layout  = {type: 'standard', preset: 'standard', scope_class : ''};
    
    // lList.searchable = true;
    // lList.sortable = true;
    // lList.mappable = true;

    // if(lTypedDatas[$type]!=undefined){
    //   lList.search_engine_options = lTypedDatas[$type].search_engine_options;
    //   lList.list_item_layout.displayed_vars = lTypedDatas[$type].displayed_vars;
    // }

    // lList.source = 
    // lList.search_token = '';

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
    $scope.notices = [];
    

    if($scope.hasEmptyLayouts()){
      const lMissingLayout = $scope.getEmptyLayouts().map(function($l) {
        return $l.translate();
      });

      console.log('missing layout', lMissingLayout);
      
      $scope.addNotice(
        'Missing layouts', 
        'Some list are missing a detail page layout. Please check the following section{1}: {0}'.translate().format(lMissingLayout.join(', '),  lMissingLayout.length>1 ? 's':''), 
        {
          actions: {
            'Create missing pages' : function(){
              $siUI.confirm('Attention','Creating missing layout may duplicate some page under certain circonstance.\nContinue anyway?',{ok:'Yes',cancel:'No'}).then(function(){
                $scope.fillEmptyLayouts();
              })
            }
          }
        }
      );
    }

    if(isNullOrEmpty($scope.configs.map_api_key)){
      $scope.addNotice('Map API key', 'The map API key is not configured. Maps will not be available in list or details.');
    }
    
    if($scope.notices.length == 0){
      $scope.addNotice('All good', 'The plugin is properly configured', {type:'success', color: '#4AB448', icon: 'fa-check-circle'});
    }

    if($scope.hasBackup()){
      $scope.addNotice(
        'Backup detected',
        'A settings backup has been detected. Select one of the following options:', 
        {
          type: 'success', color: '#41A5EE', icon: 'fa-database',
          actions: {
            'Restore' : function(){
              $siConfigs.data_views = $scope.data_views;
              $siConfigs.restoreBackup();
            },
            'Clear' : function(){
              $siUI.confirm('Attention','Are you sure you want to delete this backup?',{ok:'Yes',cancel:'No'}).then(
                function(){
                  $siConfigs.clearBackup().then(_ => {
                    $scope.checkIntegrity();
                  });
                }
              )
            }
          }
        }
      )
    }
  }

  $scope.hasErrorNotices = function(){
    return $scope.notices.some(function($n){
      return $n.type == 'warning';
    })
  }

  $scope.addNotice = function($title, $message, $options){
    const lNotice = Object.assign({
      title: $title,
      message: $message,
      color: '#ff9900',
      actions: [],
      icon: 'fa-exclamation-triangle',
      type: 'warning'
    }, $options);

    $scope.notices.push(lNotice);
  }

  $scope.generateLayoutPage = function($layout, $groupType){
   
    const lTypeMaps = {
      listings: {
        title: {
          en : 'Listing - details',
          fr : 'Propriété - détails'
        },
        content: '[si_listing]',
        layouts: $scope.configs.listing_layouts
      },
      brokers:{
        title: { 
          en : 'Broker - details',
          fr : 'Courtier - détails'
        },
        content: '[si_broker]',
        layouts: $scope.configs.broker_layouts
      },
      offices:{
        title: {
          en : 'Office - details',
          fr : 'Bureau - détails'
        },
        content: '[si_office]',
        layouts: $scope.configs.office_layouts
      },
      cities:{
        title: {
          en : 'City - details',
          fr : 'Ville - détails'
        },
        content: '[si_city]',
        layouts: $scope.configs.city_layouts
      },
      agencies:{
        title: {
          en: 'Agency - details',
          fr: 'Agence - détails'
        },
        content: '[si_agency]',
        layouts: $scope.configs.agency_layouts
      }
    }

    const lLayoutInfos = lTypeMaps[$groupType];
    const lPageTitle    = lLayoutInfos.title[$layout.lang];
    const lPageContent  = lLayoutInfos.content;
    const lOriginalPageId = lLayoutInfos.layouts.filter($l => $l.page != null && $l.lang!=$layout.lang).reduce( ($result,$cur) => $cur.page, null);

    $siWP.addPage(lPageTitle, lPageContent, $layout.lang, lOriginalPageId).then( $pageId => {
      $layout.page = $pageId;
      $scope.save_configs();
    })

    // $scope.api('page',{lang: $layout.lang, page_id: 'NEW', title: lPageTitle, content: lPageContent, original_page_id: lOriginalPageId}).then($response => {
    //   $layout.page = $response;
    //   $scope.save_configs();
    // });
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
  
  $scope.getEmptyLayouts = function(){
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
                        
    return lFiltered
              .filter(function($type){
                return $scope.configs[lLayoutMap[$type]].some(function($layout){
                  return $layout.page==null
                });
              });
  }
  $scope.hasEmptyLayouts = function(){
    return $scope.getEmptyLayouts().length > 0;
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
    console.log('page is called', $page_id,$params);
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


/**
 * NETWORK ROOT CONTROLLER
 */
siApp
.controller('mainNetworkCtrl', function($scope,$rootScope,$q,$timeout,$siConfigs,$siList,$siUI,$siUtils){
  $scope._status = 'initializing';
  $scope.loaded_components = [];
  $scope.pages = {
    'home': {label: 'Home'.translate(), style: ''},
    'listEdit': {label: 'List editing'.translate(), style: 'transform:translateX(-100%);'},
  }
  
  $scope.init = function(){
    $scope.load_configs().then(_ => {
        $scope._status = 'ready';
        
    });
    
    $scope.$on('save-request', function(){
      $scope.save_configs();
    });

  }

  
  $scope.load_configs = function(){
    return $q(function($resolve, $reject){
      $siConfigs.loadNetwork().then(function($response){
        $scope.networkConfigs = $response;
        $resolve();
      });
    });
  }

  $scope.updateSettings = function(){
    $scope.save_configs();
  }

  $scope.save_configs = function(){
    $siConfigs.saveNetwork($scope.networkConfigs);
  }
});