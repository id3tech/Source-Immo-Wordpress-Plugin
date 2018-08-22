
/**
 * Main Configuration Controller
 */
ImmoDbApp
.controller('homeCtrl', function($scope, $rootScope){

  console.log('configs controller loaded');

  $scope.route_elements = {
      '{{id}}' : 'ID',
      '{{transaction}}' : 'Transaction type',
      '{{location.region}}' : 'Region',
      '{{location.city}}' : 'City',
      '{{location.street}}' : 'Street',
      '{{location.civic_address}}' : 'Civic address'
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
        type: 'listings',
        sort: 'auto',
        sort_reverse : false,
        limit: 0,
        searchable:true,
        sortable:true,
        mappable: true,
        list_layout : { preset: 'standard', scope_class : '', custom:null},
        list_item_layout : { preset: 'standard', scope_class : '', custom:null},
        filter_group : {
          filters : [],
          filter_groups: [],
          operator:'and'
        }
      }
    }
    else{
      $scope.model = angular.copy($params);
      $scope.validate();
    }

    $scope._original = $params;
  }

  

  $scope.saveOrClose = function(){
    if($scope.hasChanged()){
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
                  $filter.value = $filter.value.split(",");
                  $filter.value.forEach(function($val){
                      if(!isNaN($val)){
                          $val = Number($val)
                      }
                  });
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
    if($scope.model.limit.between(1, 100)){
      $scope.model.searchable = false;
    }
  }
});

/**
 * MAIN ROOT CONTROLLER
 */
ImmoDbApp
.controller('mainCtrl', function($scope, $rootScope, $mdDialog, $q, $http, $mdToast){
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
    list_layouts:[
      {name: 'standard', label: 'Standard'},
      {name: 'map', label: 'Map'},
      {name: 'direct', label: 'Direct render'},
      {name: 'custom', label: 'Custom'}
    ],
    list_item_layouts:[
      {name: 'standard', label: 'Standard'},
      {name: 'reduced', label: 'Reduced'},
      {name: 'minimal', label: 'Minimal'},
      {name: 'custom', label: 'Custom'}
    ],
    detail_layouts:[
      {name: 'standard', label: 'Standard'},
      {name: 'custom_page', label : 'Custom layout from page'}
    ]
  }

  $rootScope.current_page = 'home'
  $scope.pages = {
    'home': {label: 'Home'.translate(), style: ''},
    'listEdit': {label: 'List editing'.translate(), style: 'transform:translateX(-90vw);'},
  }
  
  $scope.data_views = [];
  $scope.wp_pages = [];


  $scope.init = function(){
    $scope.load_configs();
    $scope.load_wp_pages();
    $scope.load_data_views();
  }

  $scope.load_configs = function(){
    $scope.api('configs').then(function($response){
      $scope.configs = $response;
    });
  }

  $scope.reset_configs = function(){
    $scope.api('configs',null, {method:'PATCH'}).then(function($response){
      $scope.configs = $response;
      $scope.show_toast('Configuration reset to demo mode');
    });
  }

  $scope.save_configs = function(){
    $scope.api('configs',{settings: $scope.configs}).then(function($response){
      $scope.show_toast('Save completed');
    });
  }

  $scope.load_wp_pages = function(){
    $scope.api('pages').then(function($response){
      $scope.wp_pages = $response;
    });
  }

  $scope.load_data_views = function(){
    $scope.api('account').then(function($response){
      console.log($response);
      $scope.data_views = $response.data_views;
    });
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



  /**
   * Call the API
   * @param {string} $path Endpoint to the api call
   * @param {*} $data Data object to send in the request
   * @param {*} $options Options to add at the $http call
   * @return {promise} Promise object
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
              console.log('Fail on path', $path, 'with data' , $data , $error);
              $scope.show_toast($error);
            }
          )
      });

      return lPromise;
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


/* DIRECTIVES */
ImmoDbApp
.directive('immodbFilterGroup', function(){
  let dir_controller = function ($scope,$rootScope) {
    $scope.filter_group_operators = {
      'and' : 'And',
      'or'  : 'Or'
    }
  
    $scope.filter_operators = {
      'equal'    : 'Equal to',
      'not_equal'   : 'Different of',
      'less_than'    : 'Less than',
      'less_or_equal_to'    : 'Less or equals to',
      'greater_than'    : 'Greater than',
      'greater_or_equal_to'    : 'Greater or equals to',
      'in'        : 'One of',
      'not_in'     : 'Not one of',
      'like'  : 'Contains',
      'not_like'    : 'Does not contains'
    };
    
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
})



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