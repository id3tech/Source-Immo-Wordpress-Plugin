// Edit
siApp
.controller('listEditCtrl', function($scope, $rootScope,$q, $siUtils,$siUI){
  BasePageController('listEdit', $scope,$rootScope);

  
  $scope.model = {};
  $scope._original = null;
  $scope.previewElements = [];
  $scope.computedStyles = null;

  $scope.actions = [
    {label: 'Apply'.translate(), action: function(){$scope.return($scope.model);}},
    {label: 'Cancel'.translate(), action: $scope.cancel},
  ];

  $scope.init = function($params){
    console.log('listEdit init',$scope.configs);

    if(typeof $params == 'string'){
      $scope.model = {
        alias: 'New {0} list'.translate().format($params.translate()),
        $$source_id : $scope.configs.default_view,
        type: $params
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

    $scope.buildPreviewElement();
    $scope.computeStyles();

    $scope.$watch('model.list_item_layout.preset',  function($new, $old){
      if($new == $old) return;

      $scope.buildPreviewElement();
    });

    
  }

  $scope.reset_default_value = function(){
    $scope.model = angular.merge($scope.model,{
        sort: null,
        sort_reverse : false,
        limit: 0,
        searchable:true,
        priority_group_sort: null,
        search_engine_options: {
          type:'full',
          focus_category: null,
          orientation: 'h',
          filter_tags: 'none'
        },
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
        $scope.model = angular.merge($scope.model, {
            list_layout : { 
              preset: 'standard', 
              scope_class : '', 
              custom:null,
              item_row_space: {
                desktop: 33,
                laptop:33,
                tablet: 50,
                mobile:100
              }
            },
            list_item_layout : { 
                preset: 'standard', 
                scope_class : '', 
                custom:null,
                primary_layer_position: 'fix',
                secondary_layer_bg_opacity: 80,
                layout: 'standard',
                displayed_vars: {
                    main:['address','city','price','category','rooms','subcategory']
                }
              }
          });
          break;

      case "brokers":
        $scope.model = angular.merge($scope.model, {
            list_layout : { 
              preset: 'standard', 
              scope_class : '', 
              custom:null,
              item_row_space: {
                desktop: 25,
                laptop:25,
                tablet: 50,
                mobile:100
              }
            },
            list_item_layout : { 
                preset: 'standard', 
                scope_class : '', 
                custom:null,
                layout: 'standard',
                displayed_vars: {
                    main:['first_name','last_name','licence','phone']
                }
              }
          });
          break;

      case "cities":
        $scope.model = angular.merge($scope.model, {
          list_layout: {
              preset: 'direct',
              scope_class: '',
              custom: null,
              item_row_space: {
                desktop: 25,
                laptop:25,
                tablet: 50,
                mobile:100
              }
          },
          list_item_layout : { 
            preset: 'standard', scope_class : '', custom:null,
            layout: 'standard',
            displayed_vars: {
              main:['name','region','listing_count']
            }
          }
        });
      case "offices":
        $scope.model = angular.merge($scope.model, {
          list_layout: {
              preset: 'standard',
              scope_class: '',
              custom: null,
              item_row_space: {
                desktop: 25,
                laptop:25,
                tablet: 50,
                mobile:100
              }
          },
          list_item_layout : { 
            preset: 'standard', scope_class : '', custom:null,
            layout: 'standard',
            displayed_vars: {
              main:['name','agency-name','listing_count','address']
            }
          }
          
        });
      case "agencies":
          $scope.model = angular.merge($scope.model, {
            list_layout: {
                preset: 'standard',
                scope_class: '',
                custom: null,
                item_row_space: {
                  desktop: 33,
                  laptop:33,
                  tablet: 50,
                  mobile:100
                }
            },
            list_item_layout : { 
              preset: 'standard', scope_class : '', custom:null,
              layout: 'standard',
              displayed_vars: {
                main:['name','license','address','listing_count']
              }
            }
            
          });
    }
  }

  $scope.computeStyles = function(){
    console.log('computeStyles',$scope.configs.styles, $scope.model.style)
    const lGlobalStyles = isNullOrEmpty($scope.configs.styles) ? {} : JSON.parse($scope.configs.styles);
    const lLocalStyles = isNullOrEmpty($scope.model.list_item_layout.styles) ? {} : JSON.parse($scope.model.list_item_layout.styles);
    console.log(lGlobalStyles, lLocalStyles);
    
    $scope.computedStyles = JSON.stringify(Object.assign({},lGlobalStyles, lLocalStyles));
  }
  
  $scope.updateSource = function(){
    $scope.model.source = $scope.data_views.find(function($e){return($e.id==$scope.model.$$source_id)});
  }

  $scope.buildPreviewElement = function(){
    $scope.previewElements = [];
    const lModelCount = {
        'listings' : 3,
        'brokers' : 4,
        'cities' : 3,
        'offices' : 3,
        'agencies' : 3
    }

    $scope.previewElements = Array.from(new Array(lModelCount[$scope.model.type])).map($e => {
      const lElement = {
        layout: wpSiApiSettings.base_path + '/views/admin/statics/previews/' + $scope.model.type + '-element-' + $scope.model.list_item_layout.layout + '.html',
      }
      switch ($scope.model.type) {
            case 'listings':
                lElement.price = $scope.getPrice();
                lElement.address = $scope.getAddress();
                lElement.city = $scope.getCity();
                lElement.category = $scope.getCategory();
                lElement.subcategory = $scope.getSubcategory();
                lElement.ref_number = $scope.getNumber(12345,19999);
                lElement.bedrooms = $scope.getNumber(2,5);
                lElement.bathrooms = $scope.getNumber(1,lElement.bedrooms);
                lElement.region = $scope.getRegion();
                lElement.avail_area = $scope.getNumber(10,20) * 100;      
                break;

            case 'brokers':
                lElement.first_name = $scope.getFirstname();
                lElement.last_name = $scope.getLastname();
                lElement.licence = $scope.getLicence();
                lElement.phone = $scope.getPhone();
                lElement.office = $scope.getOffice();
                lElement.listing_count = $scope.getListingCount();
                lElement.email = lElement.first_name.toLowerCase() + '.' + lElement.last_name.toLowerCase() + '@example.com'
                break;

            case 'cities':
                lElement.name = $scope.getCity();
                lElement.region = $scope.getRegion();
                lElement.listings_count = $scope.getListingCount();
                lElement.code = $scope.getNumber(1234,6543);
                break;

            case "offices":
                lElement.name = $scope.getCity();
                lElement.region = $scope.getRegion();
                lElement.listings_count = $scope.getListingCount();
                lElement.brokers_count = $scope.getBrokerCount();
                lElement.agency = {
                  name: 'Agency'
                };
                lElement.location = {
                  street_address : $scope.getAddress(),
                  city: lElement.name,
                  state: $scope.getSate(),
                  postal_code: $scope.getPostalCode()
                }

            case "agencies":
                lElement.name = 'Immo ' + $scope.getFunkyName();
                lElement.listings_count = $scope.getListingCount();
                lElement.brokers_count = $scope.getBrokerCount();
                lElement.offices_count = $scope.getOfficeCount();
                lElement.main_office = {
                  location: {
                    street_address : $scope.getAddress(),
                    city: $scope.getCity(),
                    state: $scope.getSate(),
                    postal_code: $scope.getPostalCode()
                  }
                }
          default:
              break;
      }

      return lElement;
    });

    console.log('previewElements',$scope.previewElements);

  }

  $scope.getCustomCss = function(){
    if($scope.model.list_item_layout == undefined) return '';
    if($scope.model.list_item_layout.preset != 'custom') return '';
    const lStyles = $scope.model.list_item_layout.custom_css.split("\n");
    const lScopedStyles = lStyles.map($s => {
      return '.component-elements .si-element ' + $s;
    });
    return lScopedStyles.join("\n");
  }

  $scope.buildSearchElement = function(){
    $scope.model.search_engine_options.layout = wpSiApiSettings.base_path + '/views/admin/statics/previews/' + $scope.model.type + '-search-' + $scope.model.search_engine_options.type + '.html';
  }

  $scope.saveOrClose = function(){
    if($scope.hasChanged()){
      
      
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
        $scope.return(lResult);
      });
    }
    else{
      console.log('SaveOrClose', $scope.model);
      $scope.cancel();
    }
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

  $scope.hasChanged = function(){
    return !$scope.isSame($scope.model,$scope._original);
  }

  $scope.validate = function(){
    // if there's a limit but under 100, turn off searchable and pageable flags
    // if($scope.model.limit.between(1, 100)){
    //   $scope.model.searchable = false;
    // }

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

    
    $scope.$on('siListPreview/editListItem', function(){
      $scope.editListItem($scope.model.type);
    })
  }

  $scope.editSearchEngine = function($type){
    $siUI.dialog($type + '-search-engine-edit',$scope.model.search_engine_options).then($result => {
      $scope.model.search_engine_options = $result;
    });
  }

  $scope.editListItem = function($type){

    $siUI.dialog($type + '-list-item-edit',$scope.model).then($result => {
      $scope.model = $result;
      $scope.computeStyles();
      console.log('editListItem return with', $result);
    });
  }

  $scope.previewLayerHasVar = function($item, $layer='main'){
      //console.log('$scope.model.list_item_layout.displayed_vars',$scope.model.list_item_layout.displayed_vars)
    if($scope.model.list_item_layout.displayed_vars == undefined) return false;
    if($scope.model.list_item_layout.displayed_vars[$layer] == undefined) return false;
    return $scope.model.list_item_layout.displayed_vars[$layer].includes($item);
  }

  // ----------------------
  //#region Randomized list data
  $scope.getNumber = function($min, $max){
    return $min + (Math.round(Math.random() * ($max-$min) ));
  }

  $scope.getAddress = function(){
    const lNumber = $scope.getNumber(1000,2000);
    const lStreetName = $scope.getLastname();

    return lNumber + ' ' + lStreetName;
  }

  $scope.getFunkyName = function(){
    return ['Capitale','2000','Carrefour','Action','Excellence','Platine','Selection','Elite','Bonjour','Accès','Concept','Horizon','Alto','Distinction','Diamant','Expertise','Prestige'].any();
  }

  $scope.getCity = function(){
    return ['San Francisco','Montréal','Washington','Paris','Springfield','Franklin','Greenville','London','Los Angeles','New York','Vanconver','Calgary','St-John','Halifax','Ottawa','Toronto','Québec','Victoria','Edmonton','Regina','Winnipeg','Fredericton','Charlottetown'].any();
  }

  $scope.getRegion = function(){
    return 'Region'.translate();
  }

  $scope.getPrice = function(){
    const lPrice = $scope.getNumber(200, 500) * 1000;
    return lPrice.formatPrice();
  }

  $scope.getCategory = function(){
    return 'Residential';
  }

  $scope.getSubcategory = function(){
    return ['Two-storey house','Bungalow','Split-level'].any().translate();
  }

  $scope.getLastname = function(){
    return  ['Riordan','Tolkien', 'Montpellier','Vernes', 'Dumas','Poe','Doyle', 'Martin', 'Proust', 'Hugo', 'Balzac', 'Rimbaud', 'Camus','Austen' ].any();
  }

  $scope.getFirstname = function(){
      return ['Rick','Honoré','Alexandre', 'George','Edgar', 'Jules', 'Arthur', 'Victor', 'Marcel','Pierre','Albert','Jane'].any();
  }

  $scope.getLicence = function(){
      return ['Real estate broker', 'Residential real estate broker','Certified real estate broker'].any().translate();
  }


    $scope.getListingCount = function(){
        return $scope.getNumber(2, 30);
    }
    $scope.getBrokerCount = function(){
      return $scope.getNumber(2,20);
    }
    $scope.getOfficeCount = function(){
      return $scope.getNumber(2,8);
    }

    $scope.getOffice = function(){
        return $scope.getCity();
    }

    $scope.getPhone = function(){
        return [
            ['819','514','450'].any(),
            '555',
            $scope.getNumber(1234,9876)
        ].join('-');
    }

    $scope.getPostalCode = function(){
      return [
        ['J7H','J0T','H7K','J4B'].any(),
        ['1B4','3E4','5W2','7N8'].any(),
      ].join(' ')
    }

    $scope.getSate = function(){
      return ['Québec','Ontario','Alberta','Manitoba','Saskatchewan','New-York','Washington','California','Florida','Nova Scotia'].any();
    }

  //#endregion
  // ---------------------
});
