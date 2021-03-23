/* DIRECTIVES */
siAdminDirectiveTemplatePath = function($path, $useTimeVersioning){
  $useTimeVersioning = $useTimeVersioning == undefined ? true : $useTimeVersioning;
  let lTimeQS = '';
  if($useTimeVersioning){
    lTimeQS = '?t=' + (new Date()).getTime();
  }
  return '/' + wpSiApiSettings.base_path.trimChar('/') + '/views/admin/statics/' + $path + '.html' + lTimeQS;
}

// siApp
// .directive('siAutocomplete')
/**
 * lstr
 * 
 */
siApp
.directive('lstr', ['$parse', function lstr($parse){
    return {
        restrict: 'E,A',
        compile: function compile(tElement, tAttrs, transclude) {
            return {
               pre: function preLink(scope, iElement, iAttrs, controller) {
                    let lTranslatedContent = iElement.html().translate();
                    let lFormatParams = iAttrs.params;
                    if(lFormatParams == null && iAttrs.lstr != '') lFormatParams = iAttrs.lstr;
                    
                    if(lFormatParams != null){
                        lFnFormatParams = $parse(lFormatParams);
                        lFormatParams = lFnFormatParams(scope);
                        if(!Array.isArray(lFormatParams)) lFormatParams = [lFormatParams];
                        
                        lTranslatedContent = lTranslatedContent.format.apply(lTranslatedContent, lFormatParams);
                    }
                    iElement.html('<span>' + lTranslatedContent + '</span>');
               }
            }
        }
    }
}]);

siApp
.directive('siWpMedia', ['$parse', function siWpMedia($parse){
  return {
    restrict: 'E',
    templateUrl: siAdminDirectiveTemplatePath('si-wp-media'),
    replace: true,
    scope: {
      model: '=siModel',
      type: '@?',
      caption: '@?',
      placeholder: '@?',
      onChange: '&?siChange'
    },
    link: function($scope, $elm, $attr){
      if($scope.type == undefined) $scope.type = 'image';
      $scope.init($elm[0]);
    },
    controller: function($scope, $rootScope,$timeout,$q, $siUI, $siUtils){
      $scope._wpDialog = null;

      $scope.init = function(){

      }

      $scope.selectMedia = function(){
        $scope.openMedia();
      }

      $scope.openMedia = function(){
        const lDialog = $scope.getDialog();
        lDialog.open();
      }

      $scope.getDialog = function(){
        if($scope._wpDialog != null) return $scope._wpDialog;

        const wpDialog = wp.media({
                  title: 'Select Media',
                  multiple : false,
                  library : {
                      type : $scope.type,
                  }
              });
        wpDialog.on('close', function(){
            const lSelection =  wpDialog.state().get('selection');
            const lMedia = [];
            lSelection.each(function($item) {
                console.log('attachement', $item);
                const lAttr = $item.attributes;
                lMedia.push(lAttr);
            });
            
            if(lMedia.length > 0){
              

              $timeout(function(){
                $scope.model = lMedia[0];
                $scope.triggerChange();
              });
            }
        });

        //wpDialog.on('open',function() {
          // On open, get the id from the hidden input
          // and select the appropiate images in the media manager
          // var selection =  wpDialog.state().get('selection');
          // var ids = jQuery('input#myprefix_image_id').val().split(',');

          // ids.forEach(function(id) {
          //   var attachment = wp.media.attachment(id);
          //   attachment.fetch();
          //   selection.add( attachment ? [ attachment ] : [] );
          // });

        //});

        $scope._wpDialog = wpDialog;
        return wpDialog;
      }

      $scope.clearMedia =function(){
        $scope.model = null;
        $scope.triggerChange();
      }

      $scope.triggerChange = function(){
        if(typeof($scope.onChange) == 'function'){
          $scope.onChange({$media: $scope.model});
        }

      }
    }
  }
}]);

siApp
.directive('siRouteBox', function siRouteBox($siUtils, $siList,$siUI){
  return {
    restrict : 'E',
    scope : {
      route : '=',
      removeHandler : '&onRemove',
      list : '=',
      type: '@',
      changeHandler: '&siChange'
    },
    templateUrl : siAdminDirectiveTemplatePath('si-route-box'),
    replace: true,
    link: function($scope, $elm, $attr){
      $scope.init();
    },
    controller: function($scope){
      const lAssoc = {
        'listings' : 'listing',
        'cities' : 'city',
        'brokers' : 'broker',
        'offices' : 'office'
      }
      

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

      
      $scope.route_office_elements = {
        '{{item.ref_number}}' : 'ID',
        '{{item.location.region}}' : 'Region',
        '{{item.location.city}}' : 'City',
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
        },
        office : {
          fr : 'bureaux/{{item.location.city}}/{{item.name}}/{{item.ref_number}}',
          en : 'offices/{{item.location.city}}/{{item.name}}/{{item.ref_number}}',
          es : 'oficinas/{{item.location.city}}/{{item.name}}/{{item.ref_number}}'
        }
      }

      $scope.route_elements = {};
      
      $scope.init = function(){
        console.log('Init routeBox with type', $scope.type);
        
        $scope.route_elements = $scope['route_' + lAssoc[$scope.type] + '_elements'];
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

      $scope.elementIsUsed = function($elm, $partKey){
        if($scope.route[$partKey] == '') return false;
        
        return $scope.route[$partKey].indexOf($elm)>=0;
      }

      $scope.elementUseCount = function($partKey){
        let lResult = 0;
        if($scope.route_elements == null || $scope.route_elements==undefined) return 0;
        if($scope.route[$partKey]==undefined) return 0;
        let lRouteElms = $siUtils.toKeyArray($scope.route_elements);

        lRouteElms.forEach(function($e){
          if($scope.route[$partKey].indexOf($e) >= 0){
            lResult++;
          }
        });

        return lResult;
      }

      $scope.reset = function(){
        $scope.route.route = $scope.route_default[$scope.type][$scope.route.lang];
      }

      $scope.elementAvailable = function($partKey){
        if ($scope.route_elements == null || $scope.route_elements==undefined) return 0;
        let lRouteElms = $siUtils.toKeyArray($scope.route_elements);
        let lResult = lRouteElms.length - $scope.elementUseCount($partKey);
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
          $siUI.confirm('Are you sure you want to remove this route?').then(function(){
            fnRemove();
          });
        } 
      }

      $scope.update = function(){
        if(typeof $scope.changeHandler == 'function'){
          $scope.changeHandler({route : $scope.route});
        }
      }


      $scope.addRouteElement = function($key, $partKey){
        $scope.route[$partKey] += $key;
        $scope.update();
      }
    },
  }
});

siApp
.directive('siFilterGroup', function siFilterGroup(){
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
        type: '=siType',
        parent: '=ngParent'
    },
    controllerAs: 'ctrl',
    template: '<div ng-include="\'filter-group\'" class="si-filter-group group-operator-{{model.operator}}"></div>',
    controller: dir_controller
  };
});

siApp
.directive('siFilterItem', function siFilterItem($siUtils, $siList){
  return {
    restrict : 'E',
    scope : {
      filter : '=ngModel',
      type: '=siType',
      removeHandler : '&onRemove'
    },
    templateUrl : siAdminDirectiveTemplatePath('si-filter-item'),
    replace: true,
    link: function($scope, $elm, $attr){
      $scope.init();
    },
    controller: function($scope){
      $scope.value_choices = [];
      $scope.selected_key =  'price.sell.amount';
      $scope.selected_filter_key = null;

      $scope.filter_key_list = {
        'listings' : [
          {value: 'price.sell.amount'         , label: 'Selling price', value_type: 'number', op_out: ['like','not_like']},
          {value: 'price.lease.amount'        , label: 'Leasing price', value_type: 'number', op_out: ['like','not_like']},
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
          {value: 'attributes.GARAGE'         , label: 'Garage', value_type: 'bool', op_in: ['equal','not_equal_to']},
          {value: 'attributes.POOL'           , label: 'Pool', value_type: 'bool', op_in: ['equal','not_equal_to']},
          {value: 'status_code'               , label: 'Status', value_type: 'text', choices: 'SOLD:Sold|AVAILABLE:Available', op_in: ['equal','not_equal_to']},
        ],
        'brokers' : [
          {value: 'first_name'                , label: 'First name', value_type: 'text', op_in: ['like','not_like']},
          {value: 'last_name'                 , label: 'Last name', value_type: 'text', op_in: ['like','not_like']},
          {value: 'license_type_code'         , label: 'License type', value_type: 'list', choices: 'getLicenseList', op_in: ['in','not_in']}
        ]
      };

      $scope.filter_operators = [
        {key: 'equal'               , value : 'Equal to'},
        {key: 'not_equal_to'        , value: 'Different of'},
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
        console.log($scope.type);
        $scope.selected_filter_key = $scope.filter_key_list[$scope.type].find($e => $e.value == $scope.selected_key);
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
        $scope.selected_filter_key = $scope.filter_key_list[$scope.type].find($e => $e.value == $scope.selected_key);
        
        $scope.updateFilterChoices();
      }

      $scope.updateFilterChoices = function(){
        if($scope.selected_filter_key == undefined){
          $scope.value_choices = null;
          return;
        }

        console.log('filter choices from', $scope.selected_filter_key);

        if(['list','text'].indexOf($scope.selected_filter_key.value_type) >= 0 && $scope.selected_filter_key.choices!=undefined){
          console.log('list from ', $scope.selected_filter_key.choices);

          if(typeof($siList[$scope.selected_filter_key.choices]) == 'function'){
            console.log($scope.selected_filter_key.choices, 'found');
            $scope.value_choices = $siList[$scope.selected_filter_key.choices]();
            console.log($scope.selected_filter_key.choices, $scope.value_choices);
          }
          else{
            $scope.value_choices = $siUtils.stringToOptionList($scope.selected_filter_key.choices);
            console.log($scope.selected_filter_key.choices, $scope.value_choices);
          }
        }
        else{
          $scope.value_choices = null;
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
          if($scope.selected_filter_key == undefined) return false;

          if($scope.selected_filter_key.op_in != undefined){
            return $scope.selected_filter_key.op_in.indexOf($item.key) >= 0;
          }
          else if ($scope.selected_filter_key.op_out != undefined){
            return !($scope.selected_filter_key.op_out.indexOf($item.key) >= 0);
          }


          return true;
      }

    }
  }
  
});

siApp
.directive('siDataGroupEditor', ['$siUtils', '$siApi', '$q', '$timeout' , function siDataGroupEditor($siUtils, $siApi, $q, $timeout){
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    templateUrl: siAdminDirectiveTemplatePath('si-data-group-editor'),
    link: function($scope, $element, $attrs){
      const lAssoc = {
        'listings' : 'listing',
        'cities' : 'city',
        'brokers' : 'broker',
        'offices' : 'office'
      }

      $scope.groupType = $attrs.siType;
      $scope.routes = lAssoc[$scope.groupType] + '_routes';
      $scope.layout = lAssoc[$scope.groupType] + '_layouts';

      $scope.lang_codes = {
        fr: 'Français',
        en: 'English',
        es: 'Español'
      }
    },
    controller: function($scope){
      
      

    }
  }
}])

siApp
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
                lPath = lPath.replace("~", wpSiApiSettings.base_path);
              }

              return lPath;
            }
    }
  }
}])

siApp
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

siApp
.directive('siTooltip', ['$parse','$q','$timeout', function siTooltip($parse,$q,$timeout){
  return {
    restrict: 'E',
    transclude: true,
    template: '<div class="si-tooltip"><div class="si-tooltip-content"><label ng-transclude></label></div><i class="fal fa-info-circle" ng-mouseover="enter($event)" ng-mouseout="leave()"></i></div>',
    link: function($scope, $element, $attrs){
      $scope._elm = $element[0];
    },
    controller: function($scope){

      $scope.initTip = function(){
        $scope._tip = jQuery($scope._elm).find('.si-tooltip-content');
        jQuery(document.body).append($scope._tip);
      }

      $scope.enter = function($event){
        if($scope._tip == undefined) $scope.initTip();

        const lSourceBox = $scope._elm.getBoundingClientRect();

        const jElm = jQuery($event.target);
        const lPos = {
          left: Math.round(lSourceBox.left + (lSourceBox.width / 2)),
          top: lSourceBox.top
        };

        console.log('mouse over ',$event.target, 'positionned at', lPos);
        
        $scope._tip.css(lPos);
        $scope._tip.addClass('show');
      }

      $scope.leave = function(){
        if($scope._tip == undefined) return;

        $scope._tip.removeClass('show');
      }
    }
  }
}])

siApp
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

siApp
.directive('siStyleEditor', ['$parse', function siStyleEditor($parse){
  return {
    restrict: 'E',
    templateUrl: siAdminDirectiveTemplatePath('si-style-editor'),
    replace: true,
    scope: {
      rawModel: '=siModel',
      changeHandler: '&siChange',
      preview: '@?siPreview',
      showPreview: '=siShowPreview',
      editables: '=?siEditables'
    },
    link: function($scope, $element, $attrs){
      
      console.log('siStyleEditor.link',$scope.rawModel);
      
      $scope.init($element[0]);
    },
    controller: function($scope,$timeout,$siUI){

      $scope.options = {
        colorPicker : {
          hasBackdrop: false,
          materialPalette: false,
          sliders: false,
          genericPalette: false,
          history: false
        }
      }

      $scope._updateWatcherHndl = null;
      $scope._rawModelWatcherHndl = null;
      $scope.defaultValues = {
        'container_width' : '1170px',
        'font_name' : 'inherit',
        'highlight' : '#ff9900',
        'highlight_text_color' : '#333',
        'text_color' : '#333',
        'background_color' : '#fff',
        'input_placeholder_color' : 'rgba(#333,0.5)',
        'layout_gutter' : '20px',
        'container_border_color' : '[element_border_color]',
        'container_border' : ' solid 1px [container_border_color]',
        'container_border_radius' : '[element_border_radius]',
        'container_padding' : ' [layout_gutter]',
        'element_border_color' : '#aaa',
        'element_border' : 'solid 1px [element_border_color]',
        'element_border_radius' : '0px',
        'element_padding': '10px',
        'component_border_color' : '#aaa',
        'component_border' : ' solid 1px [component_border_color]',
        'component_border_radius' : '[element_border_radius]',
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
        'listing_item_column_width' : '340px',
        'listing_item_picture_ratio' : '0.75',
        'listing_item_picture_fit' : 'cover',
        'thumbnail_picture_size' : '100px',
        'broker_item_column_width' : '210px',
        'broker_item_picture_ratio' : '1.25',
        'cover_item_picture_fit' : 'cover',
        'office_item_column_width' : '320px',
      }

      $scope.init = function($element){
        $scope.$element = $element;
        $scope.previewPath = wpSiApiSettings.base_path + '/views/admin/statics/previews/style-editor-' + ($scope.preview == undefined ? 'general' : $scope.preview) + '.html';
        if($scope._updateWatcherHndl != null){
          //$scope._updateWatcherHndl();
        }

        console.log('styleEditor init:', $scope.rawModel);

        if($scope.rawModel) $scope.model = $scope.parseModel($scope.rawModel);

        $scope.registerRawModelWatcher();
        $scope.registerModelWatcher();

        if($scope.editables == null){
          $scope.editables = ['global','containers','list-container','elements','bg-fg','components','listing','broker','office','custom-css'];
        }
        const lFirstGroup = $scope.editables ? $scope.editables[0] : 'global';
        console.log('first group', lFirstGroup);
        $scope.openGroup(lFirstGroup);
      }

      $scope.registerRawModelWatcher = function(){
        
        $scope._rawModelWatcherHndl = $scope.$watch('rawModel', function($new,$old){
          if($new != undefined){
            if($new != $old){
              console.log('rawModel new:', $new,'old:', $old);
              $scope.model = $scope.parseModel($scope.rawModel);
              $scope.updatePreviewBox();

              $scope._rawModelWatcherHndl();
              $scope._rawModelWatcherHndl = null;

              if($scope._updateWatcherHndl != null) $scope._updateWatcherHndl();

              $scope.registerModelWatcher();
            }
          }

        },true);

        
      }

      $scope.registerModelWatcher = function(){
        $timeout(_ => {
          console.log('watcher register');


          $scope._updateWatcherHndl = $scope.$watch('model', function($new, $old){
            console.log('model changed', $old, $new);
            if(isNullOrEmpty($new)) return;
            if($new == $old) return;

            $scope.update();
          },true);
        },1000);
      }

      $scope.openGroup = function($group){
        const lTargetGroup = $scope.$element.querySelector('#style-' + $group);
        const lGroups = Array.from($scope.$element.querySelectorAll('.style-group'));

        lGroups.forEach(function($e){
          if($e.getAttribute('id') != 'style-' + $group){
            $e.classList.remove('open');
            if($e.previousSibling != null) $e.previousElementSibling.classList.remove('active');
          }
        });

        lTargetGroup.classList.toggle('open');
        lTargetGroup.previousElementSibling.classList.toggle('active');
      }

      $scope.stringifyModel = function(){
        const lModel = Object.keys($scope.model).reduce(
          ($result,$k) => {
            if($scope.model[$k]!=null && $scope.model[$k] != undefined){
              const lNewKey = '--' + $k.replace(/(_)/g,'-');
              $result[lNewKey] = $scope.model[$k];
            }
            return $result;
          },
          {}
        );
        return JSON.stringify(lModel);
      }

      $scope.parseModel = function($value){
        if($value == undefined) return {};
        if($value == null) return {};
        if($value == '') return {};

        const lParsedModel = JSON.parse($value);
        console.log('rawModel parsed', lParsedModel);

        const lModel = Object.keys(lParsedModel).reduce(
          ($result, $k) => {
            const lNewKey = $k.replace('--','').replace(/(-)/g,'_');
            $result[lNewKey] = lParsedModel[$k]
            return $result;
          },{}
        );

        $scope.validateModelValues(lModel);
        console.log('Parsed model',lModel);
        return lModel;
      }

      $scope.reset = function(){
        $siUI.confirm('Attention','All style customisation will be lost.\nDo you want to continue?',{ok:'Yes',cancel:'No'}).then(function(){
          $scope.model = {};
          $scope.update();
        });
      }

      $scope.update = function(){

        $scope.validateModelValues($scope.model);
        
        //$scope._rawModelWatcherHndl();

        const lModel = $scope.stringifyModel();
        
        $scope.rawModel = lModel;

        console.log('styleModel changed', $scope.rawModel);

        if(typeof $scope.changeHandler == 'function'){
          $scope.changeHandler({$styles:lModel});
        }

        //$scope.updatePreviewBox();
        //$scope.registerModelWatcher();
      }

      $scope.updatePreviewBox = function(){
        const lModel = Object.keys($scope.model).reduce(
          ($result,$key) => {
            if($scope.model[$key] != ''){
              $result[$key] = $scope.model[$key];  
            }
            
            return $result;
          },
          {}
        )
        const lEffectiveStyle = Object.assign({},$scope.defaultValues, lModel);
        const lPreviewElm = $scope.$element.querySelector('.si-style-editor-preview .viewport');

        // remove all styles
        lPreviewElm.style.cssText = '';

        Object.keys(lEffectiveStyle).forEach($k => {

          const lStyleKey = $k.replace(/_/g,'-');
          let lValue =  lEffectiveStyle[$k];
          const lSubVarRegex = /\[(.+)\]/g;
          if(lValue.match(lSubVarRegex)){
            lValue = lValue.replace(lSubVarRegex,'var(--preview-$1)');
            lValue = lValue.replace(/_/g,'-');
          }
          if($k == 'uls_label'){
            lValue = '"' + lValue + '"';
          }
          lPreviewElm.style.setProperty('--preview-' + lStyleKey, lValue);
          
        });
        
      }

      $scope.validateModelValues = function($model){
        Object.keys($model).forEach($k => {
          const lValue = $model[$k];
          if(lValue != undefined && lValue != ''){
            console.log('validate value', $k, lValue)
            if($k.indexOf('padding') > 0 || $k.indexOf('radius') > 0){
              if(lValue.indexOf('px') < 0){
                console.log('px missing', $k, lValue)
                $model[$k] = lValue + 'px';
              }
            }
          }
        })
      }
      
      $scope.isEditable = function($item){
        if($scope.editables == undefined) return true;
        if(!Array.isArray($scope.editables)) return true;
        if($scope.editables.length == 0) return true;

        return $scope.editables.includes($item);

      }
    }
  }
}])

siApp
.directive('siInclude', ['$parse','$timeout', function siInclude($parse,$timeout){
  return {
    restrict: 'E',
    
    link: function($scope, $element, $attrs){

      const fnUpdatePath = function($format, $params){
        if($attrs.path == undefined){
          if($format != undefined && $params != undefined){
            const lParams = $params.filter($p => $p != undefined);

            if(lParams.length > 0){
              $scope.path = $format.format(...lParams);
            }
          }
        }
  
        if($scope.path != undefined){
          $scope.path = $scope.path.replace('~', wpSiApiSettings.base_path);
        }

        console.log('siInclude', $scope.path);
      }

      // observe params values for change
      $scope.$watch($attrs.pathParams, function(){
        const lParsedParams = $parse($attrs.pathParams)($scope);
        fnUpdatePath($attrs.pathFormat, lParsedParams);
      });

    },
    replace: true,
    template: '<div ng-include="path"></div>'
  }
}])


/**
 * siStylePreview
 * usage: <tagname si-style-preview="style_model"></tagname>
*/
siApp
.directive('siStylePreview', ['$parse', function siStylePreview($parse){
  return {
    restrict: 'A',
    scope: {
      model: '=siStylePreview'
    },
    link: function($scope, $element, $attrs){
      $scope.$element = $element[0];

      $scope.init();
    },
    controller: function($scope){
      

      $scope.defaultValues = {
        'container_width' : '1170px',
        'font_name' : 'inherit',
        'highlight' : '#ff9900',
        'highlight_text_color' : '#333',
        'text_color' : '#333',
        'background_color' : '#fff',
        'input_placeholder_color' : 'rgba(#333,0.5)',
        'layout_gutter' : '20px',
        'container_border_color' : '[element_border_color]',
        'container_border' : ' solid 1px [container_border_color]',
        'container_border_radius' : '[element_border_radius]',
        'container_padding' : ' [layout_gutter]',
        'element_border_color' : '#aaa',
        'element_border' : 'solid 1px [element_border_color]',
        'element_border_radius' : '0px',
        'element_padding': '10px',
        'component_border_color' : '#aaa',
        'component_border' : ' solid 1px [component_border_color]',
        'component_border_radius' : '[element_border_radius]',
        
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
        'listing_item_column_width' : '340px',
        'listing_item_picture_ratio' : '0.75',
        'thumbnail_picture_size' : '100px',
        'broker_item_column_width' : '210px',
        'broker_item_picture_ratio' : '1.25',
        'office_item_column_width' : '320px',
      }


      $scope.init = function(){
        $scope.$watch('model', function(){
          $scope.updateElement();
        })
      }


      $scope.parseModel = function($value){
        if($value == undefined) return {};
        if($value == null) return {};
        if($value == '') return {};
        let lParsedModel = {};

        if(Array.isArray($value)){
          $value.forEach($v => {
            lParsedModel = Object.assign(lParsedModel, JSON.parse($v));
          })
        }
        else{
          lParsedModel = JSON.parse($value);
        }

        
        console.log('rawModel parsed', lParsedModel);

        const lModel = Object.keys(lParsedModel).filter(
          function($k){
            return $k != '_custom_css';
          }
        ).reduce(
          function ($result, $k){
            const lNewKey = $k.replace('--','').replace(/(-)/g,'_');
            $result[lNewKey] = lParsedModel[$k]
            return $result;
          },{}
        );
        console.log('Parsed model',lModel);
        return lModel;
      }


      $scope.updateElement = function(){
        const lJSONModel = $scope.parseModel($scope.model);

        const lModel = Object.keys(lJSONModel).reduce(
          ($result,$key) => {
            if(lJSONModel[$key] != ''){
              $result[$key] = lJSONModel[$key];  
            }
            
            return $result;
          },
          {}
        );

        const lEffectiveStyle = Object.assign({},$scope.defaultValues, lModel);
        console.log('Model',lModel, 'Effective', lEffectiveStyle);
        
        const lPreviewElm = $scope.$element.querySelector('.viewport');
        if(lPreviewElm == null) {
          console.log('.viewport on', $scope.$element, 'not found');
          return false;
        }
        // remove all styles
        lPreviewElm.style.cssText = '';

        Object.keys(lEffectiveStyle).forEach($k => {

          const lStyleKey = $k.replace(/_/g,'-');
          let lValue =  lEffectiveStyle[$k];
          const lSubVarRegex = /\[(.+)\]/g;
          //console.log($k,'=', lValue, 'in', lEffectiveStyle);
          if(lValue!=undefined){   
            if(lValue.match(lSubVarRegex)){
              lValue = lValue.replace(lSubVarRegex,'var(--preview-$1)');
              lValue = lValue.replace(/_/g,'-');
            }
            
            if($k == 'uls_label'){
              lValue = '"' + lValue + '"';
            }
            lPreviewElm.style.setProperty('--preview-' + lStyleKey, lValue);
          }
        });


      }

    }
  }
}]);

siApp
.directive('siNotice', [function siNotice(){
  return {
    restrict: 'E',
    templateUrl : wpSiApiSettings.base_path + '/views/admin/statics/si-notice.html',
    replace: true,
    scope: {
      model: '=siModel'
    },
    link: function($scope, $element, $attrs){

    },
    controller: function($scope){

    }
  }
}])

siApp
.directive('siSearchTabsEditor', [function siSearchTabsEditor(){
  return {
    restrict: 'E',
    templateUrl: siAdminDirectiveTemplatePath('si-search-tabs-editor.html'),
    replace: true,
    scope: {
      model: '=siModel'
    },
    link: function($scope, $element, $attrs){
      $scope.init($element[0]);
    },
    controller: function($scope,$rootScope, $siApi, $siUI, $timeout){
      $scope.$element = null;
      
      $scope.init = function($element){
        $scope.$element = $element;

        $scope.$watch(function(){ return $scope.model }, 
          function($new,$old){
            if($new == null) return;
            if($scope.model.tabs == undefined) $scope.model.tabs = [];
        })
        $scope.fetchData();
      }

      $scope.fetchData = function(){
        $siApi
            .rest('account',null,{method:'GET'})
            .then($response => {
                $scope.data_views = $response.data_views;
                
              });
      }

      $scope.addTab = function($item){
        
        $scope.model.tabs.push({
          view_id : $item.id,
          caption: {
            fr: $item.name,
            en: $item.name
          }
        });
      }

      $scope.removeTab = function($index){
        $scope.model.tabs.splice($index,1);
      }

      $scope.edit = function($event, $index){
        
        $event.stopPropagation();
        $event.preventDefault();

        document.addEventListener('click', function($event){
          $scope.apply();
        },{once:true});

        $scope.editingIndex = $index;
        $timeout(function(){
          const lInput = $scope.$element.querySelector('.si-tab.edit-mode input');
          lInput.focus();
        },500);

        
        
      }
      $scope.preventClickTrap = function($event){
        $event.preventDefault();
        $event.stopPropagation();
      }

      $scope.checkKey = function($event){
        if($event.keyCode == 13){
          $scope.apply();
        }

        $event.stopPropagation();
      }

      $scope.apply = function(){
        $timeout(function(){
          delete $scope.editingIndex;
        })
      }

      $scope.isUsed = function($item){
        const lTab = $scope.model.tabs.find($t => $t.view_id == $item.id);
        return lTab != undefined;
      }

      $scope.isEditing = function($index){
        return $index == $scope.editingIndex;
      }

      $scope.moveTab = function($index, $moveBy){
        const lNewIndex = $index + $moveBy;
        const lElm =     $scope.model.tabs.splice($index,1)[0];
        if(lNewIndex > $scope.model.tabs.length){
          $scope.model.tabs.push(lElm);
        }
        
        $scope.model.tabs.splice(lNewIndex,0,lElm);
      }

    }
  }
}])

siApp
.directive('siLocalized', ['$parse', '$compile', function siLocalized($parse,$compile){
  return {
    restrict: 'E',
    transclude:true,
    replace:true,
    template: '<div class="si-localized-input"><ng-transclude></ng-transclude><md-menu class="si-locale-selector"><md-button ng-click="$mdMenu.open()">{{$localized.current}}</md-button><md-menu-content><md-menu-item ng-repeat="locale in locales"><md-button ng-click="changeLocale(locale)">{{locale}}</md-button></md-menu-item></md-menu-content></md-menu></div>',
    link: function($scope, $element, $attrs){
      
    },
    controller: function($scope, $rootScope){
      this.$onInit = function(){
        $scope.locales = $locales.supported_languages;

        $scope.$watch('model', function($new,$old){
          if($new != null && $new != ''){
            $scope.validateModel();
          }
        })
      }

      $scope.$localized = {
        current: $locales._current_lang_
      }

      $scope.changeLocale = function($new){
        $scope.$localized.current = $new;
      }

      $scope.validateModel = function(){
        if(typeof $scope.model == 'string' ){
          
        }
      }
    }
  }
}])

siApp
.directive('siAddonConfig', ['$parse', function siAddonConfig($parse){
  return {
    restrict: 'E',
    scope: {
      model: '=siModel',
      active_addons: '=siActiveAddons'
    },
    templateUrl: siAdminDirectiveTemplatePath('si-addon-config'),
    replace: true,
    link: function($scope, $element, $attrs){
      $scope.init();
    },
    controller: function($scope, $q, $timeout, $rootScope){
      $scope.modelConfigs = {};


      $scope.init = function(){
        $scope.addonConfigPath = '/' + wpSiApiSettings.base_path.trimChar('/')+ '/addons/' + $scope.model.name + '/views/addon.settings.html?t=' + (new Date()).getTime();
        if($scope.active_addons == null || Array.isArray($scope.active_addons)){
          $scope.active_addons = {};
        }

        console.log('addon init', $scope.model, $scope.active_addons);

        $scope.modelConfigs = ($scope.active_addons[$scope.model.name] != undefined) 
                                  ? Object.assign($scope.model.default_configuration, $scope.active_addons[$scope.model.name].configs)
                                  : $scope.model.default_configuration;
      }

      
      $scope.isActive = function(){
        if($scope.active_addons == null) return false;

        return $scope.active_addons[$scope.model.name] != undefined;
      }

      $scope.toggleActive = function(){
        console.log('toggle active')

        $timeout(_ => {  
          if($scope.isActive()){
            console.log('already active, delete settings')
            delete $scope.active_addons[$scope.model.name];
          }
          else{
            console.log('Add settings to active_addons');
            $scope.active_addons[$scope.model.name] = {
              configs : $scope.getModelConfigs()
            };
          }
          console.log('new active_addons', $scope.active_addons);

          $rootScope.$broadcast('save-request');
          
        });
      }

      $scope.getModelConfigs = function(){
        const lConfigs = $scope.model.default_configuration;
        return lConfigs;
      }

      $scope.saveAddonSettings = function(){
        $scope.active_addons[$scope.model.name] = {
          configs : $scope.modelConfigs
        };
      
        $rootScope.$broadcast('save-request');
      }

    }
  }
}])