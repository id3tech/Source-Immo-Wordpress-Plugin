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


siApp
.directive('lstr', ['$parse','$compile','$timeout', function lstr($parse,$compile,$timeout){
  return {
      restrict: 'E,A',
      compile: function compile(tElement, tAttrs, transclude) {
          return {
             pre: function preLink(scope, iElement, iAttrs, controller) {
                  if(iElement.html() == undefined) return 'NA';
                  
                  let lTranslatedContent = iElement.html().translate();

                  let lFormatParams = iAttrs.params;
                  if(lFormatParams == null && iAttrs.lstr != '') lFormatParams = iAttrs.lstr;
                  
                  if(lFormatParams != null){
                      lFnFormatParams = $parse(lFormatParams);
                      lFormatParams = lFnFormatParams(scope);
                      if(!Array.isArray(lFormatParams)) lFormatParams = [lFormatParams];
                      
                      lTranslatedContent = lTranslatedContent.format.apply(lTranslatedContent, lFormatParams);
                  }

                  scope._originalTranslation = lTranslatedContent;

                  lTranslatedContent = scope.parseContent(lTranslatedContent);

                  iElement.html('<span>' + lTranslatedContent + '</span>');

                  
             }
          }
      },
      controller: function($scope,$element,$timeout){
        $scope.reparseTimeoutHdl = null;

        $scope.reparse = function(){
          if($scope.reparseTimeoutHdl!= null){
            $timeout.cancel($scope.reparseTimeoutHdl);
            $scope.reparseTimeoutHdl = null;
          }

          $scope.reparseTimeoutHdl = $timeout(_ => {
            $element.html($scope.parseContent($scope._originalTranslation));
          });
        }

        $scope.parseContent = ($content) => {
          if($content.indexOf('{{')>=0){
            let lWatchApplied = false;

            $content = $content.replace(/(\{\{(?:[^}]+)}})/g, ($match) => {
              const lExpression = $match.replace(/(\{|\})/g,'');
              const lParseFn = $parse(lExpression);
              let lParsed = lParseFn($scope);
              
              if(lParsed == undefined && !lWatchApplied) {
                $scope.$watch(lExpression, function($old,$new){
                  if($old == $new) return;
                  $scope.reparse();
                })
                lWatchApplied = true;
                return $match;
              }

              return lParsed;
            })

          }
          return $content;
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
.directive('layoutGap', function layoutGap(){
  return {
    restrict: 'A',
    link: function($scope,$element,$attrs){
      const gap = $attrs.layoutGap || 1;
      $element[0].style.gap = gap + 'rem';
    }
  }
})


siApp
.directive('siDataGroupEditor', [ 
function siDataGroupEditor($siUtils, $siApi, $q, $timeout){
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
        'offices' : 'office',
        'agencies': 'agency'
      }

      $scope.groupType = $attrs.siType;
      $scope.routes = lAssoc[$scope.groupType] + '_routes';
      $scope.layout = lAssoc[$scope.groupType] + '_layouts';
      
      

      $scope.init();

    },
    controller: function($scope,$siUtils, $siApi, $q, $timeout,$siUI,$siWP){
      $scope.wp = $siWP;

      $scope.lang_codes = [
        {key: 'fr', label : 'Français'},
        {key: 'en', label : 'English'},
        {key: 'es', label : 'Español'}
      ]

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

      $scope.init = function(){
        $scope.$on('si/ready', function(){
          console.log('siDataGroupEditor/init', $scope.wp.pages);
          $scope.prepare();
        });
      }

      $scope.prepare = function(){
        console.log('siDataGroupEditor/prepare',$scope.configs);

        const langList = $scope.configs[$scope.routes].map($r => {
          const layoutItem = $scope.configs[$scope.layout].find($l => $l.lang==$r.lang);

          //if(layoutItem != null && layoutItem.page != null && $siWP.pages[layoutItem.lang].find($p => $p.ID == layoutItem.page) == undefined) delete layoutItem.page;

          return {
            lang: $r.lang,
            route: $r,
            layout: layoutItem
          }
        });

        $scope.langList = langList;
        
        console.log('siDataGroupEditor/prepare', langList);
      }

      $scope.hasMinLangCount = function(){
        return ($scope.langList.length > 1);
      }

      $scope.rebuild = function(){
        const {routes,layouts} = $scope.langList.reduce( ($result, $langItem) => {
          
          $result.routes.push($langItem.route);
          $result.layouts.push($langItem.layout);
          return $result;
        },{routes:[],layouts:[]});

        $scope.configs[$scope.layout] = layouts;
        $scope.configs[$scope.routes] = routes;

        console.log('siDataGroupEditor/rebuild',$scope.configs);
        $scope.$emit('save-request');
      }

      $scope.langNotConfigure = function($item){
        return $scope.langList.filter($l => $l.lang == $item.key).length == 0
      }
      
      $scope.resetDetails = function($langItem){
        const $lang = $langItem.lang;
        const lDefault = $scope.details_defaults[$lang][$scope.groupType];

        $langItem.route = Object.assign($langItem.route, lDefault.route);
        $langItem.layout = Object.assign($langItem.route,{
          page: null,
            communication_mode: 'basic',
            form_id:null
        }, lDefault.route);

        
        $scope.rebuild();
      }

      $scope.addLangItem = function($lang){
        const lDefault = $scope.details_defaults[$lang][$scope.groupType];

        $scope.langList.push({
          lang: $lang,
          route: Object.assign({
            lang: $lang
          },lDefault.route),
          layout: Object.assign({
            lang: $lang,
            page: null,
            communication_mode: 'basic',
            form_id:null
          },lDefault.layout)
        });

        $scope.rebuild();
      }

      $scope.editLayoutPage = function($layout){
        window.open(`/wp-admin/post.php?post=${$layout.page}&action=edit`);
      }

      $scope.removeLang = function($index){
        $scope.langList.splice($index,1);
        $scope.rebuild();
      }

      //#region LIST 
      $scope.add = function($type){
        const lOtherList = $scope.configs.lists.filter($l => $l.type == $type);
        $siUI.dialog('new-list',{type:$type, otherList: lOtherList}).then($result => {
          //console.log($result);
          $scope.configs.lists.push($result);
          $scope.$emit('save-request');

        })
        // $scope.show_page('listEdit', $type).then(function($result){
        //   lNew = $result;
        //   $scope.configs.lists.push(lNew);
        //   $scope.$emit('save-request');
        // });
      }

      $scope.edit = function($list){
        $scope.modify($list);
        return;
        
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

      $scope.modify = function($list){
        return $siUI.dialog('list-edit', $list).then( ($result) => {
          console.log($result);
          for (const key in $result) {
            if ($result.hasOwnProperty(key)) {
              const element = $result[key];
              $list[key] = element;
            }
          }
          if($list.is_default_type_configs==true){
            $scope.configs.lists
              .filter( $l => $l.type == $list.type)
              .filter( $l => $l != $list)
              .forEach($l => {
                $l.is_default_type_configs = false;
              });
          }
          $scope.$emit('save-request');
        })
      }

      $scope.clone = function($list){
        $siUI.confirm('Are you sure you want to clone this list?').then(_ => {
          const listCopy = angular.copy($list);
          listCopy.alias = $scope.getValidAlias(listCopy.alias);
          listCopy.is_default_type_configs = false;

          $scope.configs.lists.push(listCopy);
          $scope.$emit('save-request');
        })
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
            return '[si_search alias="' + $list.alias + '" result_page="/proprietes/" standalone="true"]';
            break;
          case 'searchbox':
              return '[si_searchbox alias="' + $list.alias + '" placeholder="Type here to begin your search..." result_page="/proprietes/"]';
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

          
      $scope.getValidAlias = function($draft){
        let lResult = $draft;
        let index = 1;
        const usedNames = $scope.configs.lists.filter($l => $l.type == $scope.groupType).map($l => $l.alias);
        while (usedNames.includes(lResult)) {
          lResult = $draft + '-' + index;
          index++;
        }
        return lResult;
      }

      //#endregion

      $scope.selectPage = function($langItem){
        const dialogParams = {lang: $langItem.lang};
        if($langItem.layout == undefined) $langItem.layout = {page:''};
        
        dialogParams.page= $langItem.layout.page

        $siUI.dialog('page-picker', dialogParams).then($newPage => {
          $langItem.layout.page = $newPage;
          $scope.$emit('save-request');
        })
      }
    }
  }
}])


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
        'offices' : 'office',
        'agengies' : 'agency'
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

      $scope.route_agency_elements = {
        '{{item.ref_number}}' : 'ID',
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
        },
        agency : {
          fr : 'agences/{{item.name}}/{{item.ref_number}}',
          en : 'agencies/{{item.name}}/{{item.ref_number}}',
          es : 'agencias/{{item.name}}/{{item.ref_number}}'
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

        $scope.$watch('filter.value', function(){
          $scope.syncValueDisplay();
        });
      }

      $scope.remove = function(){
        if($scope.removeHandler != undefined){
          $scope.removeHandler();
        }
      }

      $scope.syncValueDisplay = function(){
        if(isNullOrEmpty($scope.filter.value)){
          $scope.filter_value = '';
          return;
        }

        if(Array.isArray($scope.filter.value)){
          $scope.filter_value = $scope.filter.value.join(',');
          return;
        }

        $scope.filter_value = $scope.filter.value.toString();
        
      }

      $scope.updateValue = function(){
        console.log('updateValue', $scope.f)
        if(isNullOrEmpty($scope.filter_value)) return;

        const lUpdateProc = {
          bool : $val => $val == 'true',
          text: $val => $val,
          list: $val => $val.split(',')
        }

        $scope.filter.value = lUpdateProc[$scope.selected_filter_key.value_type]($scope.filter_value);
      }

      $scope.setValue = function($value){
        $scope.filter.value = $value;
        $scope.filter_value = $value.toString();
      }

      $scope.toggleValue = function($value){

        if(!Array.isArray($scope.filter.value)) $scope.filter.value = [];
        console.log('toggleValue', $scope.filter.value, $value);

        const lValueIndex = $scope.filter.value.indexOf($value);
        if(lValueIndex >=0){
          $scope.filter.value.splice(lValueIndex,1);
        }
        else{
          $scope.filter.value.push($value);
        }
        $scope.filter_value = $scope.filter.value.join(',');
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
        'padding': '20px',
        'border-width' : '1px',
        'border-style' : 'solid',
        'border-color' : 'currentColor',
        'border-radius' : '10px',

        // 'container_border_color' : '[element_border_color]',
        // 'container_border' : ' solid 1px [container_border_color]',
        // 'container_border_radius' : '[element_border_radius]',
        // 'container_padding' : ' [layout_gutter]',
        // 'element_border_color' : '#aaa',
        // 'element_border' : 'solid 1px [element_border_color]',
        // 'element_border_radius' : '0px',
        // 'element_padding': '10px',
        // 'component_border_color' : '#aaa',
        // 'component_border' : ' solid 1px [component_border_color]',
        // 'component_border_radius' : '[element_border_radius]',
        // 'list_item_separator_color' : '#aaa',
        // 'list_item_separator' : 'solid 1px [list_item_separator_color]',
        // 'list_item_padding': '10px',
        'high_contrast_color' : '#333',
        'high_contrast_text_color' : '#fff',
        'medium_contrast_color' : '#b9b9b9',
        'medium_contrast_text_color' : '[text_color]',
        'small_contrast_color' : '#e2e2e2',
        'small_contrast_text_color' : '[text_color]',
        
        'error_color' : '#850000',
        'button_border_color' : '#aaa',
        'button_border' : '[border_style] [border_width] [border_color]',
        'button_border_radius' : '[border_radius]',
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
        'listing_item_picture_ratio' : '3 / 2',
        'listing_item_picture_fit' : 'cover',
        'thumbnail_picture_size' : '100px',
        'broker_item_column_width' : '210px',
        'broker_item_picture_ratio' : '3.4 / 4',
        'cover_item_picture_fit' : 'cover',
        //'office_item_column_width' : '320px',
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
          $scope.editables = ['global','layout','buttons','containers','list-container','elements','bg-fg','components','listing','broker','office','custom-css'];
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
              const lNewKey = '--si-' + $k.replace(/(_)/g,'-');
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
            const lNewKey = $k.replace('--si-','').replace(/(-)/g,'_');
            $result[lNewKey] = lParsedModel[$k]
            return $result;
          },{}
        );

        $scope.validateModelValues(lModel);
        console.log('Parsed model',lModel);
        return lModel;
      }

      $scope.reset = function(){
        $siUI.confirm('Attention','All style customisation will be lost.\nDo you want to continue?',{ok:'Yes',cancel:'No'}).then(function($response){
          console.log('confirm', $response);

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
        const lPreviewElm = $scope.$element.querySelector('.si-style-editor-preview .si-preview-viewport');

        // remove all styles
        lPreviewElm.style.cssText = '';

        Object.keys(lEffectiveStyle).forEach($k => {

          const lStyleKey = $k.replace(/_/g,'-');
          let lValue =  lEffectiveStyle[$k];
          const lSubVarRegex = /\[(.+)\]/g;
          if(lValue.match(lSubVarRegex)){
            lValue = lValue.replace(lSubVarRegex,'var(--$1)');
            lValue = lValue.replace(/_/g,'-');
          }
          if($k == 'uls_label'){
            lValue = '"' + lValue + '"';
          }

          console.log(lStyleKey)
          lPreviewElm.style.setProperty('--' + lStyleKey, lValue);
          
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
}]);


siApp
.directive('siListPreview', function siListPreview(){
  return {
    restrict: 'E',
    replace:true,
    require: 'ngModel',
    scope: {
      model: '=ngModel'
    },
    template: `
    <div class="si-list-preview si-style-editor-preview {{model.type}}-preview">
      <div si-style-preview="computedStyles">
        <div class="si-preview-viewport list-layout-{{model.list_layout.preset}} search-layout-orientation-{{model.search_engine_options.orientation}}">
          <div ng-if="model.search_engine_options.type == 'full'" class="si-container search-engine-tabs-container search-type-{{model.type}} search-layout-type-{{model.search_engine_options.type}} search-layout-orientation-{{model.search_engine_options.orientation}}">
              <div class="list-components">
                  <div class="component tabs {{!model.search_engine_options.tabbed ? 'inactive':'' }}">
                      <md-checkbox ng-model="model.search_engine_options.tabbed"></md-checkbox>
                      <div class="component-elements">
                          <si-search-tabs-editor si-model="model.search_engine_options"></si-search-tabs-editor>
                      </div>
                  </div>
              </div>
          </div>

          <div class="si-container search-engine-container search-type-{{model.type}} {{model.search_engine_options.scope_class}} search-layout-type-{{model.search_engine_options.type}}  search-layout-orientation-{{model.search_engine_options.orientation}}">
              <div class="list-components" >
                  
                  <div class="component  {{!model.searchable ? 'inactive':'' }}">
                      <md-checkbox ng-model="model.searchable"></md-checkbox>
                      <div class="component-elements">
                          <si-include 
                              path-format="~/views/admin/statics/previews/{0}-search-{1}.html"
                              path-params="[model.type, model.search_engine_options.type]"></si-include>
                          <md-button class="config-button md-raised md-primary"  ng-click="editSearchEngine()"><lstr>Configure</lstr> <i class="fal fa-cog"></i></md-button>
                      </div>
                  </div>
              </div>
          </div>

          <div class="si-container {{model.list_layout.scope_class}}">
              <div class="list-components si-grid" >
                  <div class="component list-map-toggle {{!model.mappable ? 'inactive':'' }}">
                      <md-checkbox ng-model="model.mappable"></md-checkbox>
                      <div class="component-elements toggles">
                          <i class="fal fa-2x fa-list si-highlight"></i>
                          <i class="fal fa-2x fa-map-marker-alt"></i>
                          <md-button class="config-button md-raised md-primary" ng-show="false" ng-click="editSearchEngine()"><lstr>Configure</lstr> <i class="fal fa-cog"></i></md-button>
                      </div>
                      
                  </div>

                  <div class="component list-meta {{!model.show_list_meta ? 'inactive':'' }}">
                      <md-checkbox ng-model="model.show_list_meta"></md-checkbox>
                      <label class="component-elements">{{localModel.previewItems.length}} {{model.type.translate()}}</label>
                  </div>

                  <div class="component list-sort {{!model.sortable ? 'inactive':'' }}">
                      <md-checkbox ng-model="model.sortable"></md-checkbox>
                      <div class="component-elements  sort">
                          <i class="fal fa-2x fa-sort-amount-down"></i>
                      </div>
                  </div>

                  <div class="component list-items">
                      <md-checkbox ng-checked="true" disabled></md-checkbox>
                      
                      <div class="component-elements si-grid" style="--item-row-space:{{model.list_layout.item_row_space.desktop}}">
                          
                          <div class="si-element" ng-repeat="item in localModel.previewItems | limitTo : model.list_layout.item_row_space.desktop track by $index">
                              <lstr>List item</lstr>
                          </div>

                          <md-button class="config-button si-configure-element-button md-raised md-primary"  ng-click="editListItem()"><lstr>Configure</lstr> <i class="fal fa-cog"></i></md-button>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      </div>
    </div>
    `,
    link: function($scope,$element,$attrs){
      $scope.init();
    },
    controller: function($scope,$rootScope,$q,$siUI){
      $scope.localModel ={
        previewItems :[]
      };

      $scope.init = function(){
        
        $scope.localModel.previewItems = [
          {label: 'List item'},
          {label: 'List item'},
          {label: 'List item'},
          {label: 'List item'}
        ];  

        console.log('siListPreview/init',  $scope.localModel.previewItems);
      }

      $scope.editListItem = function(){
        $scope.$emit('siListPreview/editListItem');
      }

      $scope.editSearchEngine = function(){
        $siUI.dialog($scope.model.type + '-search-engine-edit',$scope.model.search_engine_options).then($result => {
          $scope.model.search_engine_options = $result;
        });
      }
    }
  }
});

siApp
.directive('siListItemLayer', [function siListItemLayer(){
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      model: '=ngModel',
      layer: '@siLayer'
    },
    replace:true,
    template: `
    <div class="si-list-item-layer layer-{{layer}} si-style-editor-preview">
      <div si-style-preview>
        <div class="si-preview-viewport">
          <div class="si-list-item {{singularType}}-item si-element si-background {{model.list_item_layout.scope_class}}" ng-sortable="sortableOptions">
            <si-layer-var ng-repeat="var in vars.list" ng-model="var"  si-on-remove="remove($index)" type="{{model.type}}"></si-layer-var>
          </div>
        </div>
        
      </div>

      <md-menu class="si-layer-menu">
        <md-button class="md-raised md-primary md-icon-button" ng-click="$mdMenu.open()"><i class="fal fa-plus"></i></md-button>
        <md-menu-content>
            <md-menu-item><md-button ng-click="addVar('group')"><lstr>Group</lstr></md-button></md-menu-item>
            <md-menu-item><md-button ng-click="addVar('link_button')"><lstr>Link button</lstr></md-button></md-menu-item>
            <md-divider></md-divider>
            <md-menu-item ng-repeat="var in availableVarList"><md-button ng-click="addVar(var.name)">{{var.label}}</md-button></md-menu-item>
          </md-menu-content>
      </md-menu>

      <script type="text/ng-template" id="layout-for-group">
        <div class="si-label-group " data-group="{{model.$$hashKey}}" ng-sortable="sortableOptions">
          <si-layer-var ng-repeat="subvar in item.items" si-on-remove="removeItem($index)" ng-model="subvar" type="{{type}}"></si-layer-var>
        </div>
        <div class="si-group-var-action">
          <md-button class="md-icon-button" ng-click="openConfig()" title="{{'Manage classes'.translate()}}"><i class="fal fa-tag"></i></md-button>
          <md-menu class="si-var-group-menu">
              <md-button class="md-icon-button md-raised" ng-click="$mdMenu.open()"><i class="fal fa-plus"></i></md-button>
              <md-menu-content>
                <md-menu-item ng-repeat="var in availableVarList"><md-button ng-click="addVar(var.name)">{{var.label}}</md-button></md-menu-item>
              </md-menu-content>
          </md-menu>
          <md-button class="md-icon-button" ng-click="remove()" title="{{'Remove'.translate()}}"><i class="fal fa-trash"></i></md-button>
        </div>
      </script>

      <script type="text/ng-template" id="layout-for-any">
        {{item.key}}
      </script> 

      <script type="text/ng-template" id="layout-for-link_button">
        <div class="si-button"><lstr>Learn more</lstr></div>
      </script> 

      <script type="text/ng-template" id="layout-for-photo">
        <div class="image">
          <img src="{{item.imageUrl}}" />
        </div>
      </script> 

      <script type="text/ng-template" id="layout-for-description">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </script>

      <script type="text/ng-template" id="layout-for-address">
        <div class="si-label civic-address">1597 boul. Dagenais O.</div>
      </script>
      
      <script type="text/ng-template" id="layout-for-ref_number">
        123910
      </script> 

      <script type="text/ng-template" id="layout-for-phone">
        514-555-8654
      </script>
      
      <script type="text/ng-template" id="layout-for-available_area">
        1200 sqr.ft.
      </script> 

      <script type="text/ng-template" id="layout-for-price">  
          <div class="si-price">625 000$</div>
          <div class="si-price-sold" lstr>Sold</div>
      </script> 

      <script type="text/ng-template" id="layout-for-contacts">
        <div class="contacts ">
            <div class="contact phone">
                <i class="icon fal fa-fw fa-phone"></i><span class="label">514-555-8654</div>
            <div class="contact email">
                <i class="icon fal fa-fw fa-envelope"></i> <span class="label">info@realestate.com</span></div>
        </div>
      </script>

      <script type="text/ng-template" id="layout-for-counters">
        <div class="counters">
            <div class="counter"><i class="icon fal fa-fw fa-home"></i> <span class="count">23</span> <span class="label"><lstr>listing</lstr>s</span></div>
            <div class="counter" ng-if="['offices','agencies'].includes(type)"><i class="icon fal fa-fw fa-user-tie"></i> <span class="count">12</span> <span class="label"><lstr>broker</lstr>s</span></div>
        </div>
      </script>

      <script type="text/ng-template" id="layout-for-rooms">
        <div class="rooms">
            <div class="room bed"><i class="icon fal fa-fw fa-bed"></i> <span class="count">3</span> <span class="label" lstr>Bedroom</span></div>
            <div class="room bath"><i class="icon fal fa-fw fa-bath"></i> <span class="count">2</span> <span class="label" lstr>Bathroom</span></div>
            <div class="room tint"><i class="icon fal fa-fw fa-tint"></i> <span class="count">1</span> <span class="label" lstr>Water room</span></div>
        </div>
      </script>
      
      <script type="text/ng-template" id="layout-for-flags">
        <div class="flags">
          <i class="video far fa-video"></i>
          <i class="virtual-tour far fa-vr-cardboard"></i>
        </div>
      </script>

      <script type="text/ng-template" id="layout-for-open_houses">
        
          <div class="open-house-item">
              <i class="fal fa-calendar-alt"></i> <span lstr>Open house</span> <span lstr>in 3 days</span>*
          </div>
        
      </script>
    </div>
    `,
    link: function($scope,$element,$attr){
      $scope.layerInfo = null;
      $scope.init();
    },
    controller: function($scope,$rootScope,$element,$timeout,$q){
      $scope.computedStyles = {};
      $scope.vars = {
        list : []
      };
      $scope.availableVarList = [];
      $scope.sortableOptions = {
        group:{
          name: 'si-layer-var',
          put: function (to, from, dragged) {
            
            let toLvl = 0;
            parentContainer = to.el;
            do{
              toLvl++;
              if(parentContainer.parentContainer != null){
                parentContainer = parentContainer.parentContainer.closest('[ng-sortable]');
              }
              else{
                parentContainer = null;
              }
            } while (parentContainer != null && toLvl<5);
            
            if(toLvl == 1 && dragged.classList.contains('group')) return false;

            if(toLvl > 1) {
              return false;
            }
            
            return true;
            
          }
        },
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.7,
        emptyInsertThreshold: 8
      }

      $scope.init = function(){
        const singularTypeMap = {
          brokers: 'broker',
          listings: 'listing',
          offices: 'office',
          agencies: 'agency',
          cities: 'city'
        }

        $scope.availableVarList = $rootScope.global_list.list_item_vars[$scope.model.type];
        $scope.updateVarList($scope.validateVarList($scope.model.list_item_layout.displayed_vars[$scope.layer]));
        console.log('siListItemLayer/init', $scope.varList);

        $scope.layerInfo = {};
        $scope.layerInfo.path = wpSiApiSettings.base_path + `views/admin/statics/previews/${$scope.model.type}-item-layer.html`;
      
        $scope.singularType = singularTypeMap[$scope.model.type];
        if(!['agencies','cities'].includes($scope.model.type)){
          $scope.imageUrl     = wpSiApiSettings.base_path + `styles/assets/shadow_${singularTypeMap[$scope.model.type]}.jpg`;
        }
        $scope.styleActive  = $scope.model.list_item_layout.preset != 'custom';

        
        $scope.$on('listItemLayer/vars:changed',function($event,$layer){
          //if($layer == $scope.layer){
            //console.log('listItemLayer/vars:changed',$scope.model.list_item_layout.displayed_vars[$scope.layer])
          //}
          $scope.updateModel();
        });

        $scope.$on('si/layerVar/removed', function($event, $index, $groupIndex=null){
          console.log('si/layerVar/removed', $index, $groupIndex);

          const newVarList = $scope.vars.list;

          if($groupIndex!=null){
            newVarList[$groupIndex].items.splice($index,1);
          }
          else{
            newVarList.splice($index,1);
          }
          
          $scope.updateVarList(newVarList);
          
        });

        $scope.$on('listItemLayer/vars/promote', function($event, $var){
          console.log('var promotion detected', $var);

          $scope.vars.list.filter($v => $v.key=='group').forEach($group => {
            const foundIndex = $group.items.findIndex($v => $v.key == $var.key);
            console.log('searched index=', foundIndex);

            if(foundIndex >= 0){
              $group.items.splice(foundIndex,1);
              $scope.vars.list.push($var);
              console.log('var has been promoted', $var);
            }
          });

          $scope.updateVarList($scope.vars.list);

        })

        $scope.$watch('vars.list', function($new,$old){
          //console.log('var list changed', $new);
          $scope.updateModel();
        },true);
      }

      $scope.updateVarList = function($varList){
        $scope.varList = [];
        
        $timeout( _ => {
          console.log('updateVarList', $varList);

          $scope.vars.list = $varList;
          $timeout( _ => {
            $scope.applySortHandlers();
          },250);
        },500)
      }

      $scope.remove = function($index){
        $scope.vars.list.splice($index,1);
        console.log('remove root item at',$index, $scope.vars.list);
      }
      
      $scope.addVar = function($var){
        if($scope.vars.list == undefined) $scope.vars.list = [];
        $scope.vars.list.push({key: $var, classes: []});
        
        $timeout( _ => {
          $scope.applySortHandlers();
        },250);
        //$scope.updateModel();
      }


      $scope.applySortHandlers = function(){
        let sortableCount = 0;
        const sortContainers = Array.from($element[0].querySelectorAll('.si-sortable-container'));
        sortContainers.forEach($container => {
          new Sortable($container, {
            group:{
              name: 'si-layer-var',
              put: function (to, from, dragged) {
                
                let toLvl = 0;
                parentContainer = to.el;
                do{
                  toLvl++;
                  if(parentContainer.parentContainer != null){
                    parentContainer = parentContainer.parentContainer.closest('.si-sortable-container');
                  }
                  else{
                    parentContainer = null;
                  }
                } while (parentContainer != null && toLvl<5);
                
                if(toLvl == 1 && dragged.classList.contains('group')) return false;

                if(toLvl > 1) {
                  return false;
                }
                
                return true;
                
              }
            },
            animation: 150,
            fallbackOnBody: true,
            swapThreshold: 0.7,
            emptyInsertThreshold: 8,
            onEnd: function($event){
              const elm = $event.item;
              const workingList = $scope.vars.list;
              const sourceList = $event.from.dataset.group == undefined ? workingList : workingList.find($e => $e.$$hashKey == $event.from.dataset.group).items;
              const targetList = $event.to.dataset.group == undefined ? workingList : workingList.find($e => $e.$$hashKey == $event.to.dataset.group).items;
              
              const varItem = sourceList.splice($event.oldIndex,1)[0];
              targetList.splice($event.newIndex,0,varItem);
              
              console.log('vars sort completed:', workingList, varItem);

              $scope.updateVarList(angular.copy(workingList));
            }
          });

          // const sortables = Array.from($container.querySelectorAll('.si-layer-var:not(.group)'));
          // sortables.forEach( ($elm,$i) => {
          //   new Sortable($elm, {
          //     group:'si-layer-var',
          //     animation: 150,
          //     fallbackOnBody: true,
          //     swapThreshold: 0.7,
          //     emptyInsertThreshold: 8,
          //   });
          //   sortableCount++;
          // })
        });

        console.log('applySortHandlers',sortContainers.length, sortableCount);
      }

      $scope.validateVarList = function($list){
        if($list == undefined) $list = [];

        $list.forEach($e => {
          if(['listing_count'].includes($e)) $e = 'counters';
        });

        if($list.every($e => typeof $e == 'string')) return $scope.getStructuredVarList($list);

        const result = $list.map($item => {
          if(typeof $item != 'string') return $item;

          const varItem = {
            key: $item,
            classes: [],
            items: []
          }

          return varItem;
        });

        if(['listings','brokers'].includes($scope.type)){
          if($scope.layer == 'main'){
            if(!result.find($e => $e.key == 'photo')){
              result.splice(1,0,{key: 'photo'});
            }
          }
        }

        return result;
      }

      $scope.getStructuredVarList = function($list){ 
        const structuredMap = {
          'listings' : _ => $scope.getStructuredVarListForListings($list),
          'brokers' : _ => $scope.getStructuredVarListForBrokers($list),
          'offices' : _ => $scope.getStructuredVarListForOffices($list),
          'agencies' : _ => $scope.getStructuredVarListForAgencies($list),
          'cities' : _ => $scope.getStructuredVarListForCities($list),
        }

        if(structuredMap[$scope.model.type] != undefined) return structuredMap[$scope.model.type]();

        return $list;
      }

      $scope.getStructuredVarListForListings = function(){
        const structure = [];

        if($scope.layer == 'main'){
          structure.push(
            {
              key:'group',
              classes: 'si-background-high-contrast si-padding',
              items: [
                {key:'address', classes: 'si-text-upper si-text-truncate'},
                {key:'city',classes:'si-text-truncate'}
              ]
            },
            {key:'photo', classes: 'si-float-anchor'},
            {key:'price', classes: 'si-background-small-contrast si-padding si-space-emphasis si-big-emphasis'},
            {
              key:'group',
              classes: 'si-padding',
              items: [
                {key: 'category', classes: 'si-font-emphasis'},
                {key: 'subcategory',classes: 'si-text-truncate'},
                {key: 'rooms'},
                {key: 'open_houses', classes: 'si-weight-emphasis'}
              ]
            },
            {key: 'flags', classes: 'si-float-top-right'},
          );
        }
        else{
          structure.push(
            {
              key:'group',
              classes:'si-padding',
              items: [
                {key: 'ref_number'},
                {key: 'description'}
              ]
            }
          )
        }

        return structure;
      }
      $scope.getStructuredVarListForBrokers = function(){
        const structure = [
          {key:'photo'},
          {
            key:'group',
            classes: 'si-background-high-contrast si-padding',
            items: [
              {key:'first_name',classes: 'si-text-upper'},
              {key:'last_name', classes: 'si-text-upper si-size-emphasis'},
              {key:'license'}
            ]
          },
          {key:'phone', classes: 'si-padding si-size-emphasis'}
        ];

        return structure;
      }
      $scope.getStructuredVarListForOffices = function(){
        const structure = [
          {
            key:'name', 
            classes: 'si-padding si-background-high-contrast si-big-emphasis si-text-align-center'
          },
          {
            key:'group',
            classes: 'si-padding si-text-align-center',
            items: [
              //{key:'agency_name',classes: 'si-text-truncate si-text-upper'},
              {key:'address'},
              {key:'phone'}
            ]
          },
          {key:'counters', classes: 'si-padding si-background-small-contrast si-weight-emphasis si-text-align-center'}
        ];

        return structure;
      }
      $scope.getStructuredVarListForAgencies = function(){
        const structure = [
          {
            key:'group', 
            classes: 'si-padding si-background-high-contrast  si-text-align-center',
            items: [
              {key: 'name', classes: 'si-big-emphasis'},
              {key: 'license', classes: 'si-text-small'}
            ]
          },
          {
            key:'group',
            classes: 'si-padding si-text-align-center',
            items: [
              //{key:'agency_name',classes: 'si-text-truncate si-text-upper'},
              {key:'address'},
              {key:'phone'}
            ]
          },
          {key:'counters', classes: 'si-padding si-background-small-contrast si-weight-emphasis si-text-align-center'}
        ];

        return structure;
      }
      $scope.getStructuredVarListForCities = function(){
        const structure = [
          {
            key:'group',
            classes: 'si-padding si-background-high-contrast  si-text-align-center',
            items: [
              {
                key:'name', 
                classes: 'si-big-emphasis'
              },
              {key:'region'}
            ]
          },
          {key:'counters', classes: 'si-padding si-background-small-contrast si-weight-emphasis si-text-align-center'}
        ];

        return structure;
      }

      $scope.updateModel = function(){
        $scope.model.list_item_layout.displayed_vars[$scope.layer] = $scope.vars.list;
        console.log('siListItemLayer/updateModel', $scope.model.list_item_layout, $scope.vars.list);
      }
    }
  }
}]);

siApp
.directive('siLayerVar', function siLayerVar(){
  return {
    restrict: 'E',
    replace:true,
    require: '^ngModel',
    scope: {
      model: '=ngModel',
      index: '=',
      rootIndex: '=?',
      onRemove: '&?siOnRemove',
      type: '@'
    },
    template: `
    <div class="si-layer-var {{item.key | toDashCase}} {{item.classes.join(' ')}}" si-anchor-to="si-float-anchor">
      <div class="si-layer-var-content" ng-include="item.template"></div>
      <div class="si-layer-var-options" ng-if="item.key != 'group'">
          <md-button class="md-icon-button" ng-click="openConfig()" title="{{'Manage classes'.translate()}}"><i class="fal fa-tag"></i></md-button>
          <md-button class="md-icon-button" ng-click="remove()" title="{{'Remove'.translate()}}"><i class="fal fa-trash"></i></md-button>
      </div>
    </div>
    `,
    link: function($scope,$element,$attr, $ngModelCtrl){
      $scope.$ngModelCtrl = $ngModelCtrl;
      $scope.init();
    },
    controller: function($scope,$rootScope,$element,$siUI){
      $scope.item = {};
      $scope.sortableOptions = {
        group:{
          name: 'si-layer-var',
          put: function (to, from, dragged) {
            
            let toLvl = 0;
            parentContainer = to.el;
            do{
              toLvl++;
              if(parentContainer.parentContainer != null){
                parentContainer = parentContainer.parentContainer.closest('[ng-sortable]');
              }
              else{
                parentContainer = null;
              }
            } while (parentContainer != null && toLvl<5);
            
            if(toLvl == 1 && dragged.classList.contains('group')) return false;

            if(toLvl > 1) {
              return false;
            }
            
            return true;
            
          }
        },
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.7,
        emptyInsertThreshold: 8,
      }

      $scope.init = function(){
        const singularTypeMap = {
          brokers: 'broker',
          listings: 'listing',
          offices: 'office',
          agencies: 'agency',
          cities: 'city'
        }
        $scope.availableVarList = $rootScope.global_list.list_item_vars[$scope.type];
        $scope.item = angular.copy($scope.model);
        if(document.querySelector('#layout-for-' + $scope.model.key)){
          $scope.item.template = 'layout-for-' + $scope.model.key;
        }
        else{
          $scope.item.template = 'layout-for-any';
        }
        
        if(!['agencies','cities'].includes($scope.type)){
          $scope.item.imageUrl     = wpSiApiSettings.base_path + `styles/assets/shadow_${singularTypeMap[$scope.type]}.jpg`;
        }
        $scope.applyClasses();

        $scope.$on('listItemLayer/vars:changed',function($event){
          $scope.updateModel();
        });
      }

      $scope.updateModel = function(){
        
        $scope.model.classes = $scope.item.classes.join(' ');

        console.log('updating model', $scope.item, $scope.model);

        $scope.model.items = $scope.item.items;
        
        //$scope.$ngModelCtrl.$setViewValue($scope.model);
      }

      $scope.applyClasses = function(){

        if($scope.item.classes == null || $scope.item.classes == undefined) $scope.item.classes = [];
        if(!Array.isArray($scope.item.classes)) $scope.item.classes = [$scope.item.classes];

        if(!['photo','group'].includes($scope.item.key)){
          $scope.item.classes.push('si-label');
        }

      }

      $scope.remove = function(){

        //$scope.$emit('si/layerVar/removed', $scope.index, $scope.rootIndex);
        if(typeof $scope.onRemove == 'function'){
          $scope.onRemove()
        }
      }

      $scope.removeItem = function($index){
        console.log('remove group item at', $index);
        $scope.item.items.splice($index,1);
      }

      $scope.addVar = function($var){
        if($scope.item.items == undefined) $scope.item.items = [];
        $scope.item.items.push({key: $var, classes: []});
        
        $scope.updateModel();
      }

      $scope.openConfig = function(){
        if($scope.model.classes == undefined) $scope.model.classes = '';

        $siUI.dialog('layer-var-edit', angular.copy($scope.model)).then($result => {
          
          $scope.item.classes = [$result.classes];

          $scope.updateModel();
          

          if($result.classes.indexOf('si-float-') >= 0){
            // This item should be place to root
            console.log('var promotion triggered', $scope.model);
            $scope.$emit('listItemLayer/vars/promote', $scope.model);
          }
          else{
            $scope.$emit('listItemLayer/vars:changed');
          }
        });
      }
    }
  }
})

siApp
.directive('siAnchorTo', function siAnchorTo(){
  return {
    restrict: 'A',
    link: function($scope,$element,$attrs){
      let lTargetElmQuery = $attrs.siAnchorTo;
      if(lTargetElmQuery == undefined) return;

      if(!['.','#'].includes(lTargetElmQuery[0])) lTargetElmQuery = '.' + lTargetElmQuery;
      const elm = $element[0];

      if(elm.classList.contains(lTargetElmQuery) || elm.querySelector(lTargetElmQuery)) return ;

      
      const parentElm = elm.closest('.si-list-item');
      const targetElm = parentElm.querySelector(lTargetElmQuery);

      const fnApplyAnchorOffset = () => {
        const lTargetElm = parentElm.querySelector(lTargetElmQuery);
        if(lTargetElm == null) return;

        const lOffsetElm = lTargetElm.closest('.si-layer-var');

        
        
        elm.style.setProperty('--si-anchor-offset-top',lTargetElm.offsetTop + 'px');
        elm.style.setProperty('--si-anchor-offset-left',lTargetElm.offsetLeft + 'px');
        elm.style.setProperty('--si-anchor-offset-width',lTargetElm.offsetWidth + 'px');
        elm.style.setProperty('--si-anchor-offset-height',lTargetElm.offsetHeight + 'px');
      }

      if(targetElm != null){
        fnApplyAnchorOffset();
      }

      const parentObserver = new MutationObserver(_ => {
        window.setTimeout( _ => {
          console.log('siAnchorTo@observer trigger');
          fnApplyAnchorOffset();
        }, 500);
      });

      parentObserver.observe(parentElm,{childList:true});

      const elmObserver = new MutationObserver( $mutations => {

        if(!$mutations.some($m => $m.attributeName == 'class')) return;

        window.setTimeout( _ => {
          fnApplyAnchorOffset();
        }, 500);
      });

      elmObserver.observe(elm, {attributes: true});
    }
  }
})

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
      $scope.init();
    },
    controller: function($scope,$rootScope,$element, $siConfigs){
      $scope.workModel = {};

      $scope.defaultValues = $rootScope.global_list.styles

      
      $scope.init = function(){
        console.log('siStylePreview/init on', $element[0]);
        
        $scope.$on('siStyleUpdate', function($event){
          $scope.updateElement();
        });
        
        $scope.$watch(function(){
          return JSON.stringify($scope.model);
        }, $scope.updateElement);

        
        $scope.updateElement();
      }


      $scope.parseModel = function($value){
        if($value == undefined) return {};
        if($value == null) return {};
        if($value == '') return {};
        let lParsedModel = {};

        //console.log('Model to parse',$value);

        
        
        if(Array.isArray($value)){
          $value.forEach($v => {
            lParsedModel = Object.assign(lParsedModel, JSON.parse($v));
          })
        }
        else if(typeof $value == 'string'){
          lParsedModel = JSON.parse($value);
        }
        else{
          lParsedModel = $value;
        }

        
        //console.log('rawModel parsed', lParsedModel);

        const lModel = Object.keys(lParsedModel).filter(
          function($k){
            return $k != '_custom_css';
          }
        ).reduce(
          function ($result, $k){
            const lNewKey = $k.replace('--si-','').replace(/(-)/g,'_');
            $result[lNewKey] = lParsedModel[$k]
            return $result;
          },{}
        );
        //console.log('Parsed model',lModel);
        return lModel;
      }


      $scope.updateElement = function(){
        
        const lModelToParse = ($scope.model == undefined || Object.keys($scope.model).length == 0) ? $siConfigs.configs.styles : $scope.model;
        const lJSONModel = $scope.parseModel(lModelToParse);
        console.log('siStylePreview/updateElement', lJSONModel);
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
        //console.log('Model',lModel, 'Effective', lEffectiveStyle, 'RawModel', $siConfigs.configs.styles);
        
        const lPreviewElm = $element[0].querySelector('.si-preview-viewport');
        if(lPreviewElm == null) {
          console.log('.viewport on', $element, 'not found');
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
              lValue = lValue.replace(lSubVarRegex,'var(--si-$1)');
              lValue = lValue.replace(/_/g,'-');
            }
            
            if($k == 'uls_label'){
              lValue = '"' + lValue + '"';
            }
            lPreviewElm.style.setProperty('--si-' + lStyleKey, lValue);
          }
        });

        //console.log('.viewport preview updated', lPreviewElm);
      }

    }
  }
}]);

siApp
.directive('siNotice', [function siNotice(){
  return {
    restrict: 'E',
    templateUrl : wpSiApiSettings.base_path + 'views/admin/statics/si-notice.html',
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
    templateUrl: siAdminDirectiveTemplatePath('si-search-tabs-editor',true),
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
    templateUrl: siAdminDirectiveTemplatePath('si-addon'),
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
}]);

siApp
.directive('siLargeTextInput', function siLargeTextInput(){
  return {
    restrict: 'C',
    link: function($scope,$element,$attr){
      $element[0].addEventListener('keydown', function($event){
        if($event.key == 'Tab'){
          
          //$event.stopPropagation();
          $event.preventDefault();
          var start = this.selectionStart;
          var end = this.selectionEnd;

          // set textarea value to: text before caret + tab + text after caret
          this.value = this.value.substring(0, start) +
            "\t" + this.value.substring(end);

          // put caret at right position again
          this.selectionStart =
          this.selectionEnd = start + 1;
        }
      })
    }
  }
})

siApp
.directive('siClassSelector', function siClassSelector(){
  return {
    restrict: 'E',
    require: '^ngModel',
    scope: {
      filter: '@?',
      model : '=ngModel'
    },
    template: `
      <md-chips ng-model="selectedItems" 
          md-autocomplete-snap
          md-transform-chip="transformChip($chip)"
          md-add-on-blur="true"
          md-on-add="updateModel()" md-on-remove="updateModel()"
        >
        <md-autocomplete
            md-selected-item="selectedItem"
            md-search-text="searchText"
            md-items="item in querySearch(searchText)"
            md-require-match="false"
            placeholder="{{'Add a class'.translate()}}"
            >
          <span md-highlight-text="searchText">{{item}}</span>
        </md-autocomplete>
        <md-chip-template>
          <span>
            <strong>{{$chip}}</strong>
          </span>
        </md-chip-template>
      </md-chips>
    `,
    controllerAs: 'ctrl',
    link: function($scope,$element,$attr,$ngModelCtrl){
      $scope.$ngModelCtrl = $ngModelCtrl;
      $scope.init();
    },
    controller: function($scope,$q,$timeout){
      $scope.selectedItems = [];
      $scope.searchText = '';
      $scope.selectedItem = null;
      $scope.classList = [
        'si-padding','si-padding-inline','si-padding-block','si-padding-size-slim','si-padding-size-half','si-padding-size-quarter','si-padding-size-three-quarter',
        'si-border','si-border-top', 'si-border-bottom','si-border-curved', 'si-border-round',
        'si-box-shadow','si-box-shadow-weak','si-box-shadow-strong',
        'si-no-background', 'si-background-small-contrast','si-background-medium-contrast','si-background-high-contrast',
        'si-text-align-left','si-text-align-center','si-text-align-right', 'si-text-upper','si-text-lower','si-text-truncate',
//        'si-link-button',
        'si-content-gap','si-content-small-gap','si-content-big-gap',
        'si-animate-fade-in','si-animate-slide-in-bottom','si-animate-slide-in-top','si-animate-slide-in-left','si-animate-slide-in-right',
        'si-animate-fast','si-animate-slow',
        'si-animate-delay', 'si-animate-delay-slight', 'si-animate-delay-chain', 'si-animate-wait-viewport'
      ];
      $scope.typeSpecificClassList = {
        listings : [],
        brokers: [],
        offices: [],
        agencies: [],
        search: ['si-input-background-small-contrast','si-input-background-medium-contrast','si-input-background-high-contrast', 'si-input-radius', 'si-input-big-radius', 'si-input-border-top', 'si-input-border-bottom'],
        layerVar: [
                    'si-show-labels','si-hide-icons',
                    'si-pull-up','si-pull-left','si-pull-up-left','si-pull-up-right','si-pull-right','si-pull-down','si-pull-down-left','si-pull-down-right',
                    'si-slim-pull-up','si-slim-pull-left','si-slim-pull-up-left','si-slim-pull-up-right','si-slim-pull-right','si-slim-pull-down','si-slim-pull-down-left','si-slim-pull-down-right',
                    'si-float-anchor', 'si-float-center','si-float-top','si-float-left','si-float-right','si-float-bottom',
                    'si-float-top-left','si-float-top-center','si-float-top-right',
                    'si-float-center-left','si-float-center-center','si-float-center-right',
                    'si-float-bottom-left','si-float-bottom-center','si-float-bottom-right'
                  ]
      }
      $scope.init = function(){
        if($scope.model && $scope.model != ''){
          $scope.selectedItems = $scope.model.split(' ');
        }
        
      }

      $scope.querySearch = function($text){
          if(!$text) return [];

          const allClasses = [...$scope.classList];
          if($scope.filter!=undefined && $scope.typeSpecificClassList[$scope.filter]){
            allClasses.push(...$scope.typeSpecificClassList[$scope.filter]);
          }

          const result = allClasses.filter($c => $c.indexOf($text.toLowerCase().replace(/\s/g,'-')) >= 0 );
          console.log('querySearch', result.length);
          return result;
      }

      $scope.transformChip = function($chip){
        console.log('transformChip', $chip);
        return $chip;
      }

      $scope.updateModel = function(){
        console.log('siClassSelector/updateModel',$scope.selectedItems);
        $timeout(_ => {
          $scope.$ngModelCtrl.$setViewValue($scope.selectedItems.join(' '));
        })
      }

    }
  }
})
