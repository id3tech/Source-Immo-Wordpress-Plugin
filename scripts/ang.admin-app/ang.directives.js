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
.directive('siSvg', ['$parse','$compile', function siSvg($parse,$compile){
  return {
    restrict: 'E',
    scope: {
      src: '@'
    },
    link: function($scope, $element, $attrs){
      if ($element.html() != ''){
          $scope.src = $element.html();
          $element.html('');
      }

      $scope.init($element);
    }, 
    controller: function($scope){
      $scope.elm = null;
            
            $scope.init = function($element){
                $scope.elm = $element;
            }

            $scope.$watch('src', function($new, $old){
                if($new == null) return;
                if($old == null) return;
                
                $scope.render();
            });

            $scope.render = function(){
                const lTemplate = '<ng-include src="getSvgPath()"></ng-include>'
                let elementContent = $compile(lTemplate)($scope);
                $scope.elm.append(elementContent);   
            }

            $scope.getSvgPath = function(){
              let lPath = $scope.src;
              if(lPath.indexOf("~")==0){
                // replace ~ by plugin path
                lPath = lPath.replace("~", wpApiSettings.base_path);
              }

              return lPath;
            }
    }
  }
}])

ImmoDbApp
.directive('faIcon', ['$parse','$compile', function faIcon($parse,$compile){
    return {
        restrict: 'E',
        replace: true,
        scope: {
            icon : '@',
            iconStyle: '@?',
            size:'@',
            useSvg: '@',
        },
        link: function($scope, $element, $attrs){
            if(!$attrs.iconStyle) $scope.iconStyle = 'fal';
            if(!$attrs.size) $scope.size = '1x';
            
            if(typeof $attrs.icon == 'string' && $attrs.icon.indexOf('[')>=0){
                let lIconParse = $parse($attrs.icon);
                $scope.icon = lIconParse($scope);
            }
            else if ($element.html() != ''){
                $scope.icon = $element.html();
                $element.html('');
            }

            $scope.init($element);
            //return lTemplate;
        }, 
        controller : function($scope){
            $scope.elm = null;
            
            $scope.init = function($element){
                $scope.elm = $element;
            }

            $scope.$watch('icon', function($new, $old){
                if($new == null) return;
                if($old == null) return;
                
                //if($new != $old){
                    if(typeof $new == 'string' && $new.indexOf('[')>=0){
                        let lIconParse = $parse($new);
                        $scope.icon = lIconParse($scope);
                    }

                
                    $scope.render();
                //}
            })

            $scope.resetElement = function(){
                let lElm = $scope.elm[0];
                let lClassToRemove = [];
                for(let i=0; i< lElm.classList.length; i++){
                    if(lElm.classList.item(i).indexOf('fa-')>=0){
                        lClassToRemove.push(lElm.classList.item(i));
                    }
                }

                lElm.classList.remove.apply(lElm.classList, lClassToRemove);

                $scope.elm.html('');
            }

            $scope.render = function(){
                let lTemplate = '';
                $scope.resetElement();
                
                if($scope.useSvg){
                    lTemplate = '<ng-include src="getIconPath()"></ng-include>'
                    let elementContent = $compile(lTemplate)($scope);
                    $scope.elm.append(elementContent);
                }
                else{
                    if(Array.isArray($scope.icon)){
                        $scope.elm.addClass('fa-stack');
                        $scope.icon.forEach(function($e, $i){
                            lTemplate = '<i class="fal fa-' + $e + ' fa-stack-1x"></i>';
                            $scope.elm.append(lTemplate);
                        });
                    }
                    else{
                        $scope.elm.clearClass
                        $scope.elm.addClass($scope.iconStyle);
                        $scope.elm.addClass('fa-' + $scope.icon);
                        $scope.elm.addClass('fa-' + $scope.size);
                    }
                }
            }
        }
    }
}]);


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