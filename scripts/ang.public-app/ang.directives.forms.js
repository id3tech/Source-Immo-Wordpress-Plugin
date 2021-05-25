siApp
.directive('siInputContainer',['$parse', function siInputContainer($parse){
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        template: '<div class="si-input-container" ng-transclude></div>',
        link: function($scope, $element, $attrs){
            const lLabel = $element[0].querySelector(':scope > label');
            const lInput = $element[0].querySelector(':scope > input,:scope > .si-select');

            if(lLabel != null && lInput != null){
                const lLabelWidth = Number(window.getComputedStyle(lLabel).width.replace('px',''));
                const lInputStyle = window.getComputedStyle(lInput);
                const lPaddingH = Number(lInputStyle.paddingLeft.replace('px','')) 
                                    + Number(lInputStyle.paddingRight.replace('px',''));

                $element[0].style.minWidth = (lLabelWidth + lPaddingH) + 'px';
            }
        }
    }
}]);


siApp
.directive('siCheckbox',['$parse', function siCheckbox($parse){
    return {
        retrict: 'E',
        transclude:true,
        scope: {
            label: '@',
            model: '=?ngModel',
            checked:'=?siChecked',
            changeHandler: '&?siChange',
            checkedValue: '@?siValue'
        },
        link: function($scope, $element, $attrs){
            $scope.selected = $scope.checked;
            
            $scope.compareModelToValue();            
        },
        controller: function($scope, $timeout){

            $scope.$watch('model', function($new,$old){
                
                if ($new == null) return;
                
                $scope.compareModelToValue();
            });

            $scope.$watch('checkedValue', function($new,$old){
                if ($new == null) return;
                
                $scope.compareModelToValue();
            });

            $scope.$watch('checked', function($new,$old){
                $scope.selected = $scope.checked;
            })


            $scope.toggleCheck = function($event){
                //console.log('togleCheck', $scope.model);
                if($scope.model === undefined){
                    $event.preventDefault();
                    return;
                }
                
                $scope.selected = !$scope.selected;
                //console.log('toggleCheck', $scope.model);

                if(Array.isArray($scope.model)){
                    if($scope.selected) {
                        $scope.model.push($scope.checkedValue);
                    }
                    else{
                        $scope.model = $scope.model.filter(function($e){ return $e != $scope.checkedValue});
                    }
                }
                else{
                    $scope.model = $scope.selected ? $scope.checkedValue : null ;
                }
                
                if(typeof $scope.changeHandler == 'function'){
                    $timeout(function(){
                        $scope.changeHandler();
                    });
                }
            }

            $scope.compareModelToValue = function(){
                if($scope.model == null){
                    $scope.selected = false;
                }

                $timeout(function(){
                    if (Array.isArray($scope.model)){
                        if($scope.model.length > 0){
                            //console.log('checkbox:compareModelToValue', $scope.model, $scope.checkedValue);
                        }
                        
                        $scope.selected = $scope.model.includes($scope.checkedValue);
                    }
                    else{
                        $scope.selected = $scope.model == $scope.checkedValue;
                    }
                });
            }

            $scope.isSelected = function(){
                if (Array.isArray($scope.model)){
                    if($scope.model.length > 0){
                        //console.log('checkbox:compareModelToValue', $scope.model, $scope.checkedValue);
                    }
                    
                    return $scope.model.includes($scope.checkedValue);
                }
                else{
                    return $scope.model == $scope.checkedValue;
                }
            }
        },
        template: '<div class="pretty p-icon p-pulse" ng-click="toggleCheck($event)">' +
                    '<input type="checkbox" ng-checked="isSelected()" title="{{label}}">' +
                    '<div class="si-input-state">' +
                        '<i class="icon fas fa-check"></i>' +
                        '<label>{{label}}</label>' +
                    '</div>' + 
                  '</div>'
    }
}]);

siApp
.directive('siSelect', ['$parse', function siSelect(){
    return {
        restrict: 'E',
        scope: {
            model: '=siModel',
            changeCallback : '&?siChange',
        },
        transclude: true,
        template: '<div class="si-select"><div class="si-selected-value"><span class="si-label">{{selectedCaption}}</span> <i class="fal fa-lg fa-fw fa-angle-down"></i></div><div class="si-select-panel"><i class="fal fa-times" ng-click="closeMenu()"></i><div class="si-panel-child-container" ng-transclude></div></div></div>',
        replace: true,
        link: function($scope, $element, $attrs){
            $scope.allowMultiple = $attrs.siMultiple != undefined;
            $scope.placeholder = $attrs.placeholder != undefined ? $attrs.placeholder : '';
            $scope.init($element);
        },
        controller: function($scope,$rootScope, $siUtils, $timeout, $q){
            $scope.options = [];

            $scope.init = function($element){
                $scope.$element = $element[0];

                // Bind events
                $scope.$element.addEventListener('click', function($event){
                    $scope.clickHandler($event);
                });

                $scope.$watch('model', $scope.modelChangeHandler, true);
                //console.log('siSelect initialized', $scope.model);

                $scope.selectedCaption = $scope.placeholder;

                $scope.$watch('checked', function(){
                    $scope.selected = $scope.checked;
                });

                $scope.applyEvents();
            }

            // Methods accessed from child
            this.allowMultipleSelection = function(){
                return $scope.allowMultiple;
            }

            this.addToChildList = $scope.addToChildList = function($child){
                //console.log('Add to select child', $scope.placeholder, $child);

                $scope.options.push($child);
                
                if($scope.model != null && $scope.model != undefined){
                    const lChildValue = (typeof $child.getValue == 'function') ? $child.getValue() : undefined;
                    if($scope.model == lChildValue){
                        $scope.updateValue(lChildValue)
                    }
                }
                
            }

            this.toggleValue = $scope.toggleValue = function($value){
                if(!Array.isArray($scope.model)){
                    $scope.model = [];
                }


                $timeout(function(){
                    
                    
                    if($scope.model.includes($value)){
                        $scope.model = $scope.model.filter(function($e){ return $e != $value});
                    }
                    else{
                        $scope.model.push($value);
                    }
                    
                    if(typeof $scope.changeCallback == 'function') $scope.changeCallback();
                })
            }

            this.hasValue = $scope.hasValue = function($value){
                if($value == undefined) return false;
                if($scope.model == null) return false;
                if(!Array.isArray($scope.model)) return false;

                return $scope.model.includes($value);
            }

            this.selectValue = $scope.selectValue = function($value){
                const lChanged = $scope.model != $value;
                $scope.model = $value;

                $scope.$apply(function(){     
                    $scope.updateValue();

                    if(lChanged){
                        //console.log('select changed',$scope.model, $value);
                        $timeout(function(){
                            if(typeof $scope.changeCallback == 'function') $scope.changeCallback();
                        })
                    }
                });
            }

            $scope.modelChangeHandler = function($new, $old){
                //console.log('select modelChanged',$new, $old);
                $scope.updateElementClasses();
                if($scope.allowMultiple){
                    $scope.updateValues();
                }
                else{
                    $scope.updateValue();
                }
                
            }

            $scope.updateElementClasses = function(){
                const lContainerParent = $scope.$element.closest('.si-input-container');
                
                const lRemoveValue = isNullOrEmpty($scope.model);

                if(lRemoveValue){
                    $scope.$element.classList.remove('si-has-value');
                }
                else{
                    $scope.$element.classList.add('si-has-value');
                }

                if(lContainerParent != null){
                    if(lRemoveValue){
                        lContainerParent.classList.remove('si-has-value');
                    }
                    else{
                        lContainerParent.classList.add('si-has-value');
                    }
                }
            }

            $scope.updateValues = function(){
                $scope.updateCaption();
            }

            $scope.updateValue = function(){
                    
                const lRemoveValue = isNullOrEmpty($scope.model);

                let lSelectedElement = null;

                $scope.options.forEach(function($o){
                    if(typeof($o.getValue) == 'function' && $o.getValue() == $scope.model){
                        $o.classList.add('selected');
                        lSelectedElement = $o;
                    }
                    else{
                        $o.classList.remove('selected');
                    }
                });

                if(lRemoveValue){
                    //console.log('remove value ', $scope.placeholder, $scope.model);

                    $scope.updateCaption($scope.placeholder);
                }
                else if ($scope.options.length == 1){
                    //console.log('getCaption of',$scope.placeholder)
                    $scope.options[0].getCaption().then(function($caption){
                        $scope.updateCaption($caption);
                    });
                }
                else if (lSelectedElement != null){
                    //console.log('getCaption of selected element',$scope.placeholder);

                    lSelectedElement.getCaption().then(function($caption){
                        //console.log('select element update value with caption', $caption, lSelectedElement.innerHtml);
                        $scope.updateCaption($caption);
                    });
                }
                else{
                    //console.log('Would update but...',$scope.placeholder, $scope.options, $scope.model);
                }
                
            }

            $scope.updateCaption =function($caption){
                if($scope.allowMultiple){
                    let lCaption = $scope.placeholder;

                    if(Array.isArray($scope.model) && $scope.model.length > 0){
                        lCaption += ' ({0})'.format($scope.model.length);
                    }
                    $scope.selectedCaption = lCaption;
                }
                else{
                    if($caption == null) $caption = $scope.placeholder;
                    $scope.selectedCaption = $caption;
                }
            }


            $scope.applyEvents  = function(){
                // track click on parents to close the dropdown
                // will climb the document up to the body
                angular.element(document).on('click', function(){
                    //console.log('Closest parent clicked');
                    $rootScope.$broadcast('close-dropdown', null);
                })

                // listen to 'close-dropdown' signal to close the menu
                $scope.$on('close-dropdown', function($event, $source){
                    if($source != $scope.$element){
                        $scope.closeMenu();
                    }
                })
            }

            $scope.getContentHeight = function($element){
                const lElementBox = $scope.$element.getBoundingClientRect();
                const lPotentialHeight = [];
                let lSubElements = Array.from($element.querySelectorAll('.si-panel-child-container'));
                //console.log('getContentHeight', lSubElements);

                lSubElements.forEach(function($e){
                    const lItemStyles = window.getComputedStyle($e);
                    const lItemHeight = ['height', 'padding-top', 'padding-bottom','margin-top','margin-bottom']
                                            .map(function (key) { return parseInt(lItemStyles.getPropertyValue(key), 10);})
                                            .reduce(function (prev, cur){return prev + cur});
                    lPotentialHeight.push(lItemHeight);
                });
                const lResult = lPotentialHeight.reduce(function($result,$cur){
                    return $result + $cur;
                },0);

                //console.log('element height', lElementBox.height);
                return Math.min(lResult,lElementBox.height * 12);
            }

            $scope.closeMenu = function(){
                if($scope._menu_elm != null){
                    $scope._menu_elm.classList.remove('expanded');
                    $scope._menu_elm.removeAttribute('style');
                    const lClickTrap = $scope.ensureClickTrap();
                    lClickTrap.classList.remove('active');
                    lClickTrap.style.removeProperty('z-index');
                }
            }

            $scope.clickHandler = function($event){
                //console.log('button clicked', $scope.$element);
                $rootScope.$broadcast('close-dropdown', $scope.$element);
                
                const lElmZIndex = $siUtils.elmOffsetZIndex($scope.$element);

                $scope.extractMenu($scope.$element).then(function(lMenuElm){
                    lMenuElm.style.zIndex = Number(lElmZIndex) + 10;
                    
                    const lClickTrap = $scope.ensureClickTrap();
                    lClickTrap.classList.add('active');

                    lMenuElm.addEventListener('transitionend', function(){
                        
                        if(lElmZIndex != 'auto') lClickTrap.style.zIndex = Number(lElmZIndex) + 5;
                        lClickTrap.addEventListener('click',function($event){
                            lMenuElm.classList.remove('expanded');
                            //$rootScope.$broadcast('close-dropdown', null);
                            lClickTrap.classList.remove('active');
                            //lClickTrap.style.removeProperty('z-index');
                            $event.stopPropagation();
                        },{once:true});
        
                    },{once:true});
                    
                    lMenuElm.classList.add('expanded');
                    
                });
                
                $event.stopPropagation();
            }

            $scope.ensureClickTrap = function(){
                let lClickTrap = document.body.querySelector('.si-click-trap');
                if(lClickTrap == null){
                    lClickTrap = document.createElement("div");
                    lClickTrap.classList.add('si-click-trap');
                    //lClickTrap.style.zIndex = 100;
                    document.body.prepend(lClickTrap);
                }

                return lClickTrap;
            }

            $scope.extractMenu = function($element){
                return $q(function($resolve,$reject){
                    if($scope._menu_elm == null){
                        const lMenu = $element.querySelector('.si-select-panel');
                        document.body.append(lMenu);
                        $scope._menu_elm = lMenu;

                        $scope._menu_elm.addEventListener('click', function($event){
                            $event.stopPropagation();
                            $scope.closeMenu();
                        })
                    }

                    
                    $timeout(function() {
                        const lMainElmRect = $scope.$element.getBoundingClientRect();
                        const lRelativeAttr = {}
                        lRelativeAttr.left = lMainElmRect.left;
                        lRelativeAttr.top = lMainElmRect.top;
                        lRelativeAttr.width = lMainElmRect.width;
                        lRelativeAttr.height = lMainElmRect.height;
                        
                        lRelativeAttr.inner_cx = lRelativeAttr.width / 2;
                        lRelativeAttr.inner_cy = lRelativeAttr.height / 2;
                        
                        //console.log('lRelativeAttr', angular.copy(lRelativeAttr));
                        

                        lRelativeAttr.cx = lMainElmRect.left + lRelativeAttr.inner_cx;
                        lRelativeAttr.cy = lMainElmRect.top + lRelativeAttr.inner_cy
                        lRelativeAttr.pageYOffset = window.pageYOffset;
                        
                        
                            
                        // $scope._menu_elm.style.width='unset';
                        // $scope._menu_elm.style.minWidth = lMainElmRect.width + 'px';
                        // $scope._menu_elm.style.top = lMainElmRect.cy + 'px';
                        // $scope._menu_elm.style.left = lMainElmRect.cx + 'px';    
                        //$scope._menu_elm.style.transform = 'translate(-50%,-50%)';

                        // position the dropdown menu
                        const lMenuRect = $scope._menu_elm.getBoundingClientRect();
                        const lMenuHeight = $scope.getContentHeight($scope._menu_elm);
                        
                        
                        //Object.keys($style).map($k => ['--inline-' + $k,$style[$k] + 'px']).forEach($c => $target.style.setProperty($c[0], $c[1]));


                        Object.keys(lRelativeAttr).forEach(function($k){
                            $scope._menu_elm.style.setProperty('--relative-' + $k, lRelativeAttr[$k] + 'px');
                        });
                        $scope._menu_elm.style.setProperty('--potential-height', lMenuHeight + 'px');

                        // lMenuRect.height = lMenuHeight;
                        // lMenuRect.top = lMainElmRect.cy - (lMenuRect.height/2);
                        
                        // const lMenuStyle = window.getComputedStyle($scope._menu_elm);
                        // const lMenuWidth = Number(lMenuStyle.width.replace('px',''));
                        
                        // const lViewportRect = {
                        //     top: Math.min(25,lMainElmRect.top),
                        //     left:Math.min(25,lMainElmRect.left),
                        //     bottom: window.innerHeight -  Math.min(50,lMenuRect.top * 2),
                        //     right: window.innerWidth -  Math.min(50,lMenuRect.left * 2)
                        // }
                        
                        // const lTransform = {x : '-50%',y : '-50%'};
                        
                        // if(lMenuRect.left < lViewportRect.left){
                        //     lTransform.x = '0%';
                        // }
                        // else if (lMenuRect.right > lViewportRect.right){
                        //     lTransform.x = 'calc(-100% + ' + lMainElmRect.inner_cx + 'px)';
                        // }

                        // if(lMenuRect.top < lViewportRect.top){
                        //     lTransform.y = (0 - lMainElmRect.inner_cy) + 'px';
                        // }
                        // else if(lMenuRect.bottom > lViewportRect.bottom){
                        //     lTransform.y = 'calc(-100% + ' + lMainElmRect.inner_cy + 'px)';
                        // }

                        // console.log('select panel transform',lMainElmRect, lMenuRect, lTransform);
                        // //$scope._menu_elm.style.zIndex = 110;
                        // $scope._menu_elm.style.transform = 'translate(' + lTransform.x + ',' + lTransform.y +')';
                        // $scope._menu_elm.style.setProperty('--potential-height', lMenuHeight + 'px');

                        $resolve($scope._menu_elm);
                    },20);
                });
            }
        }
    }
}]);

siApp
.directive('siOption',['$parse','$timeout','$q', function siOption($parse, $timeout, $q){
    return {
        restrict: 'E',
        require: ['^siSelect'],
        transclude: true,
        replace: true,
        template: '<div class="si-select-child si-option"><si-checkbox si-checked="isChecked()" ng-show="showCheckbox()"></si-checkbox><div ng-transclude></div></div>',
        link: function($scope, $element, $attrs, $parentCtls){
            
            const lValue = ($attrs.ngValue == undefined) ? $attrs.value : $parse($attrs.ngValue)($scope);

            $scope.showCheckbox = function(){
                return $parentCtls.some( function($ctl) {
                    if($ctl != null){
                        return $ctl.allowMultipleSelection();
                    }
                });
            }
            $scope.isChecked = function(){
                return $parentCtls.some( function($ctl) {
                    if($ctl != null){
                        return $ctl.hasValue(lValue);
                    }
                });
            }
            $element[0].getValue = function(){ return lValue };
            $element[0].getCaption = function(){
                return $q( function($resolve,$reject) {
                    $timeout(function(){
                        $resolve($element[0].innerText);
                    });
                })
            }

            $element[0].addEventListener('click', function($event){
                
                $parentCtls.forEach( function($ctl) {
                    if($ctl != null){
                        if($ctl.allowMultipleSelection()){
                            $event.stopPropagation();
                            $event.preventDefault();

                            $ctl.toggleValue(lValue);
                        }
                        else{
                            $ctl.selectValue(lValue);
                        }
                        
                    }
                });
            

            });
            
            $parentCtls.forEach(function($ctl){
                if($ctl != null){
                    $ctl.addToChildList($element[0], lValue);
                }
            })
            

        }
    }
}]);

siApp
.directive('siOptionGroup', ['$parse', function siOptionGroup($parse){
    return {
        restrict: 'E',
        require: '^siSelect',
        replace:true,
        template: '<div class="si-select-child si-option-group"><div class="si-group-title">{{groupTitle}}</div><div class="si-group-child" ng-transclude></div></div>',
        transclude: true,
        scope: {
            groupTitle: '@siLabel'
        },
        link: function($scope, $element, $attrs, $parentCtl){
            $scope.init($element[0],$parentCtl);
        },
        controller: function($scope){
            $scope.init = function($element, $parentCtl){
                $scope.$element = $element;
                $scope.$siParent = $parentCtl;
                $scope.$siParent.addToChildList($element.querySelector('.si-group-title'));
            }

            this.allowMultipleSelection = function(){
                return $scope.$siParent.allowMultipleSelection();
            }

            // Methods accessed from child
            this.addToChildList = $scope.addToChildList = function($child){

                $scope.$siParent.addToChildList($child);
            }
            this.selectValue = $scope.selectValue = function($value){
                $scope.$siParent.selectValue($value);
            }

            this.toggleValue = $scope.toggleValue = function($value){
                $scope.$siParent.toggleValue($value);
            }

            this.hasValue = $scope.hasValue = function($value){
                return $scope.$siParent.hasValue($value);
            }
        }
    }
}]);

siApp
.directive('siOptionPanel', ['$parse', function siOptionGroup($parse){
    return {
        restrict: 'E',
        require: '^siSelect',
        scope: {
            captionFormat: '&?siCaptionFormat'
        },
        template: '<div class="si-select-child si-option-panel" ng-transclude></div>',
        transclude: true,
        replace: true,
        link: function($scope, $element, $attrs, $parentCtl){
            $scope.init($element[0], $parentCtl);
        },
        controller: function($scope, $timeout, $q){
            $scope.caption = '';
            
            $scope.init = function($element, $parentCtl){
                $scope.$element = $element;
                $scope.$siParent = $parentCtl;

                $scope.$element.addEventListener('mousedown', function($event){
                    $event.stopPropagation();
                    $event.preventDefault();
                });
                $scope.$element.addEventListener('mouseup', function($event){
                    $event.stopPropagation();
                    $event.preventDefault();
                })
                $scope.$element.getCaption = $scope.getCaption;
                $scope.$element.getValue = function(){
                    return $parentCtl.model;
                }

                $parentCtl.addToChildList($element);
            }


            $scope.getCaption = function(){
                return $q( function($resolve, $reject) {
                    //console.log('siOptionPanel.getCaption', $scope.captionFormat);
                    let caption = null;
                    if(typeof($scope.captionFormat) == 'function'){
                        caption = $scope.captionFormat();
                    }
                    $resolve(caption);
                });
            }

            // Methods accessed from child
            this.addToChildList = $scope.addToChildList = function($child){
                $scope.$siParent.addToChildList($child);
            }
            this.selectValue = $scope.selectValue = function($value){
                $scope.$siParent.selectValue($value);
            }

        }
    }
}]);

siApp
.directive('siDropdown',['$rootScope',
    function siDropdown($rootScope){
        return {
            restrict: 'C',
            scope: {
                showButtonIcon : "@?",
                hasValue : "@?"
            },
            link: function($scope,$element,$attr){
                $scope.init();
            },
            controller: function($scope,$q, $element, $timeout,$siUtils){
                $scope._menu_elm = null;

                $scope.$watch('hasValue', function($new, $old){
                    if($new == true){
                        $scope.$element.classList.add('has-value');
                    }
                    else{
                        $scope.$element.classList.remove('has-value');
                    }
                });

                $scope.init = function(){
                    $scope.$element = $element[0];

                    $scope.showButtonIcon = (typeof $scope.showButtonIcon == 'undefined') ? true : $scope.showButtonIcon;
                    $scope.hasValue = (typeof $scope.hasValue == 'undefined') ? false : $scope.hasValue!=null;
                    $scope.buttonIcon = "anchor-down";

                    if($scope.hasValue){
                        $scope.$element.classList.add('has-value');
                    }

                    if($scope.showButtonIcon === true || $scope.showButtonIcon != 'false'){
                        $scope.$element.classList.add('has-button-icon');
                        if(typeof $scope.showButtonIcon == 'string' && $scope.showButtonIcon != 'true'){
                            $scope.buttonIcon = $scope.showButtonIcon;
                        }
                    }

                    $scope.applyEvents();
                }

                $scope.applyEvents  = function(){
                    // track click on parents to close the dropdown
                    // will climb the document up to the body
                    angular.element(document).on('click', function(){
                        //console.log('Closest parent clicked');
                        $rootScope.$broadcast('close-dropdown', null);
                    })
    
                    // Apply button click event handler
                    $element[0].querySelector('.si-dropdown-button').addEventListener('click',$scope.clickHandler);

                    //angular.element($scope.$element).find('.si-dropdown-button').on('click', $scope.clickHandler);
                    
                    // listen to 'close-dropdown' signal to close the menu
                    $scope.$on('close-dropdown', function($event, $source){
                        if($source != $scope.$element){
                            $scope.closeMenu();
                        }
                    })
                }

                $scope.getContentHeight = function($element){
                    return $element.querySelector('.si-dropdown-panel-content').getBoundingClientRect().height;
                }

                $scope.getContentWidth = function($element){
                    return $element.querySelector('.si-dropdown-panel-content').getBoundingClientRect().width;
                }

                $scope.closeMenu = function(){
                    if($scope._menu_elm != null){
                        $scope._menu_elm.classList.remove('expanded');
                        $scope._menu_elm.removeAttribute('style');
                        const lClickTrap = $scope.ensureClickTrap();
                        lClickTrap.classList.remove('active');
                        lClickTrap.style.removeProperty('z-index');
                    }
                }

                $scope.clickHandler = function($event){
                    
                    $event.stopPropagation();

                    //console.log('button clicked', $scope.$element);
                    $rootScope.$broadcast('close-dropdown', $scope.$element);
                    // const lClosestParent = $scope.$element.closest('.modal-body, .filter-panel');
                    // angular.element(lClosestParent).on('click', function(){
                    //     console.log('Closest parent clicked');
                    //     $rootScope.$broadcast('close-dropdown', null);
                    // })
                    const lBaseZIndex = 1000;
                    const lElmZIndex = $siUtils.elmOffsetZIndex($scope.$element);

                    $scope.extractMenu($scope.$element).then(function($menuElm){
                        const lMenuElm = $menuElm;
                        lMenuElm.classList.add('expanded');
                        //console.log('Elm z-index', lElmZIndex);
    
                        if(lElmZIndex != 'auto'){
                            lMenuElm.style.zIndex = lBaseZIndex + Number(lElmZIndex) + 10;
                        }
                        else{
                            lMenuElm.style.zIndex = lBaseZIndex + 100;
                        }
                        
                        
                        const lClickTrap = $scope.ensureClickTrap();
                        lClickTrap.classList.add('active');
                        if(lElmZIndex != 'auto') lClickTrap.style.zIndex = lBaseZIndex + Number(lElmZIndex) + 5;
                        lClickTrap.addEventListener('click',function($event){
                            lMenuElm.classList.remove('expanded');
                            //$rootScope.$broadcast('close-dropdown', null);
                            lClickTrap.classList.remove('active');
                            lClickTrap.style.removeProperty('z-index');
                            $event.stopPropagation();
                        },{once:true});
    
                    });
                    
                }

                $scope.ensureClickTrap = function(){
                    let lClickTrap = document.body.querySelector('.si-click-trap');
                    if(lClickTrap == null){
                        lClickTrap = document.createElement("div");
                        lClickTrap.classList.add('si-click-trap');
                        //lClickTrap.style.zIndex = 100;
                        document.body.prepend(lClickTrap);
                    }

                    return lClickTrap;
                }

                $scope.extractMenu = function($element){
                    return $q(function($resolve,$reject){
                        if($scope._menu_elm == null){
                            const lMenu = $element.querySelector('.si-dropdown-panel');
                            document.body.append(lMenu);
                            $scope._menu_elm = lMenu;
    
                            $scope._menu_elm.addEventListener('click', function($event){
                                $event.stopPropagation();
                                $scope.closeMenu();
                            })
                        }
    
                        
                        $timeout(function() {
                            const lMainElmRect = $scope.$element.getBoundingClientRect();
                            const lRelativeAttr = {}
                            lRelativeAttr.left = lMainElmRect.left;
                            lRelativeAttr.top = lMainElmRect.top;
                            lRelativeAttr.width = lMainElmRect.width;
                            lRelativeAttr.height = lMainElmRect.height;
                            
                            lRelativeAttr.inner_cx = lRelativeAttr.width / 2;
                            lRelativeAttr.inner_cy = lRelativeAttr.height / 2;
                            
    
                            lRelativeAttr.cx = lMainElmRect.left + lRelativeAttr.inner_cx;
                            lRelativeAttr.cy = lMainElmRect.top + lRelativeAttr.inner_cy
                            lRelativeAttr.pageYOffset = window.pageYOffset;
                            
                            // position the dropdown menu
                            const lMenuHeight = $scope.getContentHeight($scope._menu_elm);
                            const lMenuWidth = $scope.getContentWidth($scope._menu_elm);
                            const lScrollbarWidth = 20; // presumed scrollbar width

                            lRelativeAttr.cx = Math.max(
                                                    lMenuWidth / 2,
                                                    Math.min(
                                                        lRelativeAttr.cx, 
                                                        (window.innerWidth - lScrollbarWidth) - (lMenuWidth / 2)
                                                    )
                                                );

                            //Object.keys($style).map($k => ['--inline-' + $k,$style[$k] + 'px']).forEach($c => $target.style.setProperty($c[0], $c[1]));
    
    
                            Object.keys(lRelativeAttr).forEach(function($k){
                                $scope._menu_elm.style.setProperty('--relative-' + $k, lRelativeAttr[$k] + 'px');
                            });
                            $scope._menu_elm.style.setProperty('--potential-height', lMenuHeight + 'px');
                            $scope._menu_elm.style.setProperty('--potential-width', lMenuWidth + 'px');
    
    
                            $resolve($scope._menu_elm);
                        },20);
                    });
                }

                // $scope.extractMenu = function($element){
                //     if($scope._menu_elm == null){
                //         const lMenu = $element.querySelector('.si-dropdown-panel');
                //         document.body.append(lMenu);
                //         $scope._menu_elm = lMenu;

                //         $scope._menu_elm.addEventListener('click', function($event){
                //             $event.stopPropagation();
                //             $scope.closeMenu();
                //         })
                //     }

                    
                //     $timeout(function() {
                //         const lMainElmRect = $scope.$element.getBoundingClientRect();
                //         lMainElmRect.inner_cx = lMainElmRect.width / 2;
                //         lMainElmRect.inner_cy = lMainElmRect.height / 2;
                //         lMainElmRect.cx = lMainElmRect.left + lMainElmRect.inner_cx;
                //         lMainElmRect.cy = lMainElmRect.top + window.pageYOffset + lMainElmRect.inner_cy;
                        
                        
                            
                //         $scope._menu_elm.style.width='unset';
                //         $scope._menu_elm.style.minWidth = lMainElmRect.width + 'px';
                //         $scope._menu_elm.style.top = lMainElmRect.cy + 'px';
                //         $scope._menu_elm.style.left = lMainElmRect.cx + 'px';    
                //         //$scope._menu_elm.style.transform = 'translate(-50%,-50%)';
    
                //         // position the dropdown menu
                //         const lMenuRect = $scope._menu_elm.getBoundingClientRect();
                //         lMenuRect.height = $scope.getContentHeight($scope._menu_elm);
                //         lMenuRect.top = lMainElmRect.cy - (lMenuRect.height/2);
                        
                //         const lMenuStyle = window.getComputedStyle($scope._menu_elm);
                //         const lMenuWidth = Number(lMenuStyle.width.replace('px',''));
                //         const lMenuHeight = $scope.getContentHeight($scope._menu_elm);
                //         const lViewportRect = {
                //             top: Math.min(25,lMainElmRect.top),
                //             left:Math.min(25,lMainElmRect.left),
                //             bottom: window.innerHeight -  Math.min(50,lMenuRect.top * 2),
                //             right: window.innerWidth -  Math.min(50,lMenuRect.left * 2)
                //         }
                        
                //         const lTransform = {x : '-50%',y : '-50%'};
                //         console.log({
                //             menuRect: lMenuRect,
                //             viewportRect: lViewportRect
                //         });
    
                //         if(lMenuRect.left < lViewportRect.left){
                //             lTransform.x = '0%';
                //         }
                //         else if (lMenuRect.right > lViewportRect.right){
                //             lTransform.x = 'calc(-100% + ' + lMainElmRect.inner_cx + 'px)';
                //         }
    
                //         if(lMenuRect.top < lViewportRect.top){
                //             lTransform.y = (0 - lMainElmRect.inner_cy) + 'px';
                //         }
                //         else if(lMenuRect.bottom > lViewportRect.bottom){
                //             lTransform.y = 'calc(-100% + ' + lMainElmRect.inner_cy + 'px)';
                //         }
                //         //$scope._menu_elm.style.zIndex = 110;
                //         $scope._menu_elm.style.transform = 'translate(' + lTransform.x + ',' + lTransform.y +')';
                //     },20);
                    

                //     return $scope._menu_elm;
                // }
            }
        }
    }
]);
siApp
.directive('siDropdownPanel', [ function siDropdownPanel(){
    return {
        restrict: 'C',
        transclude: true,
        template: '<div class="si-dropdown-panel-content" ng-transclude></div>'
    }
}])


siApp
.directive('inputContainer', function inputContainer(){
    return {
        restrict: 'C',
        scope:{},
        link: function(scope, element, attr){
            let lElm = angular.element(element);
            if(lElm.find('[required]').length>0){
                lElm.addClass('is-required');
            }

            scope.$watch(function() {return lElm.find('input,textarea').attr('class'); }, function(newValue){
                if(newValue == null || typeof(newValue) == 'undefined'){
                    return null;
                }
                ['ng-invalid','ng-dirty','ng-pristine','ng-touched'].forEach(function($c){
                    
                    if(newValue.indexOf($c)>=0){
                        lElm.addClass($c);
                    }
                    else{
                        lElm.removeClass($c);
                    }
                });
                
            });
        },
    }
});


siApp
.directive("siPriceRangeSlider", ['$document', function siPriceRangeSlider($document) {
    return {
        restrict: "E",
        scope: {
            model: "=",
            max: "=siMax",
            onChange: "&",
            valueFormat: "&",
            property: "@",
            startLabel: "@",
            endLabel:"@"
        },
        replace: true,
        templateUrl: directiveTemplatePath('si-price-range-slider'),
        link: function($scope, $element, attrs) {
            // It's the inner div we're really working with.
            const element = $element[0].querySelector('.inner');
            
            $scope.init(element);

            return $scope.$watch("model", function(){
                //$scope.model = $scope.model.slice(0,2);
                $scope.updatePositions();
            },true);
        },
        controller: function($scope, $timeout){
            //var getP, handles, rangeHandle, i, j, len, mv, pTotal, ref, setP, step, updatePositions;
            $scope.handles = [];
            $scope.rangeHandle = null;
            $scope.pTotal = 0;
            $scope.eventMaps = {
                "mouse" : {
                    down : 'mousedown',
                    move : 'mousemove',
                    up : 'mouseup'
                },
                "touch" : {
                    down : 'touchstart',
                    move : 'touchmove',
                    up : 'touchend'
                }
            }

            $scope.init = function($element){
                $scope.element = $element;
                $scope.rangeHandle = $element.querySelector('.slider-range-handle');
                $scope.handles.push($element.querySelector('.slider-handle.min'));
                $scope.handles.push($element.querySelector('.slider-handle.max'));

                $scope.handles.forEach(function($h, $i){
                    $scope.applyPointerEvent($h, $i, 'mouse');
                    $scope.applyPointerEvent($h, $i, 'touch');   
                });
                $scope.applyRangeHandleEvent('mouse');
            }

            $scope.boundaryClasses = function(){

            }

            /**
             * Apply event handling for pointer
             * @param $elm Angular element upon which ye bind event
             * @param $type mouse|touch
             */
            $scope.applyPointerEvent = function($elm, $elm_index,  $type){
                angular.element($elm).on($scope.eventMaps[$type].down, function(event) {
                    lPositionRef = event;
                    
                    const lPointerMoveHndl = function(event){
                        return $scope.$apply(function() {
                            
                            let lPositionRef = event;
                            if($type=='touch'){
                                lPositionRef = event.originalEvent.touches[0];
                            }
                            
                            const lElmBox = $scope.element.getBoundingClientRect();

                            const lScopedPositionX = lPositionRef.clientX - lElmBox.left;
                            const lPctPositionX = Math.max(0, Math.min(1, (lScopedPositionX /  lElmBox.width) ));
                            
                            $scope.setP($elm_index, lPctPositionX)
                        });
                    };
                    
                    const lPointerUpHndl = function() {
                        $document.unbind($scope.eventMaps[$type].move, lPointerMoveHndl);
                        $document.unbind($scope.eventMaps[$type].up, lPointerUpHndl);

                        if(typeof $scope.onChange == 'function'){
                            // trigger onChange only when pointer release the handle
                            $scope.onChange();
                        }
                    };


                    // Prevent default dragging of selected content
                    if($type=='touch'){
                        lPositionRef = event.originalEvent.touches[0];
                    }
                    event.preventDefault();
                    
                    $document.on($scope.eventMaps[$type].move, lPointerMoveHndl);
                    return $document.on($scope.eventMaps[$type].up, lPointerUpHndl);
                });
            }

            $scope.applyRangeHandleEvent = function($type){
                angular.element($scope.rangeHandle).on($scope.eventMaps[$type].down, function(event) {
                    lPositionRef = event;
                    const lElmBox = $scope.element.getBoundingClientRect();

                    let lScopedPositionStartX = (lPositionRef.clientX - lElmBox.left);
                    
                    const lPointerMoveHndl = function(event){
                        return $scope.$apply(function() {
                            
                            let lPositionRef = event;
                            if($type=='touch'){
                                lPositionRef = event.originalEvent.touches[0];
                            }
                            
                            const lValues = [
                                $scope.getP(0) * lElmBox.width,
                                $scope.getP(1) * lElmBox.width
                            ];

                            const lRange = (lValues[1] - lValues[0]) / lElmBox.width;
                            const lScopedPositionX = lPositionRef.clientX - lElmBox.left;
                            const lScopedDeltaPositionX = lScopedPositionX - lScopedPositionStartX;
                            
                            lValues.forEach(function($v,$i,$arr){
                                const lNewValue = Math.max(0, Math.min(1, ($v + lScopedDeltaPositionX) /  lElmBox.width));
                                $arr[$i] = lNewValue;
                            });

                            // make sure the range stay fixed
                            lValues[0] = Math.max(0, Math.min(lValues[1] - lRange, lValues[0]));
                            lValues[1] = Math.max(lValues[0] + lRange, Math.min(1, lValues[1]));

                            $scope.setPs(lValues);
                            
                            lScopedPositionStartX = (lPositionRef.clientX - lElmBox.left);
                        });
                    };
                    
                    const lPointerUpHndl = function() {
                        $document.unbind($scope.eventMaps[$type].move, lPointerMoveHndl);
                        $document.unbind($scope.eventMaps[$type].up, lPointerUpHndl);

                        if(typeof $scope.onChange == 'function'){
                            // trigger onChange only when pointer release the handle
                            $scope.onChange();
                        }
                    };


                    // Prevent default dragging of selected content
                    if($type=='touch'){
                        lPositionRef = event.originalEvent.touches[0];
                    }
                    event.preventDefault();
                    
                    $document.on($scope.eventMaps[$type].move, lPointerMoveHndl);
                    return $document.on($scope.eventMaps[$type].up, lPointerUpHndl);
                });
            }


            $scope.getLowerValue = function(){
                let lResult = $scope.getP(0);
                if(typeof $scope.valueFormat == 'function'){
                    return $scope.valueFormat();
                }
                return lResult;
            }

            $scope.getUpperValue = function(){
                let lResult = $scope.getP(2);
                if(typeof $scope.valueFormat == 'function'){
                    return $scope.valueFormat();
                }
                return lResult;
            }

            $scope.getStep = function() {
                if (($scope.step != null)) {
                    return parseFloat($scope.step);
                } 
                else {
                    return 0;
                }
            };
            
            $scope.getP = function(i) {
                
                if ($scope.property != null) {
                    return $scope.model[i][$scope.property];
                } else {
                    return $scope.model[i];
                }
            };

            $scope.getValue = function($i){
                return $scope.property != null ? $scope.model[$i][$scope.property] :  $scope.model[$i];
            }

            $scope.getValuePercent = function($i){
                const lValue = $scope.getValue($i);
                return lValue * 100;
            }
            
            $scope.setP = function(i, p) {
                const lTolerance = 0.01;

                const lValue = $scope.model.slice(0,2).reduce(function($result,$cur,$index){
                    if($index < i){
                        $result = Math.max($cur + lTolerance, $result);
                    }
                    else if($index > i){
                        $result = Math.min($cur - lTolerance, $result);
                    }

                    return $result;
                },p);

                //console.log('setP', $scope.model, i, p, lValue);

                if ($scope.property != null) {
                    return $scope.model[i][$scope.property] = lValue;
                } else {
                    return $scope.model[i] = lValue;
                }
            };
            $scope.setPs = function($values){
                //console.log('setPs', $values);

                $values.forEach(function($v, $i){
                    if ($scope.property != null) {
                        return $scope.model[$i][$scope.property] = $v;
                    } else {
                        return $scope.model[$i] = $v;
                    }
                });
            }

            $scope.updatePositions = function() {
                
                const lPositions = [];
                $scope.handles.forEach(function($h, $i){
                    const lHandleRefValue = $scope.getValuePercent($i);
                    lPositions.push(lHandleRefValue);
                    $h.style.left = lHandleRefValue + '%';
                })
    
                // range handle
                angular.element($scope.rangeHandle).css({
                    left: lPositions[0] + '%',
                    width : (lPositions[1] - lPositions[0]) + '%'
                });
    
                //return results;
            };

        }
    };
  }
]);


siApp
.directive('siRadio',[function siRadio(){
    return {
        retrict: 'E',
        transclude:true,
        scope: {
            label: '@',
            name: '@',
            value : '@?siValue',
            model: '=?ngModel',
            changeHandler: '&?siChange'
        },
        link: function($scope){
            $scope.init();
        },
        template: '<div class="any-selector pretty p-icon p-pulse p-round">' +
                    '<input type="radio" name="{{name}}"  title="{{label}}" ng-click="onClick()" ng-checked="checked">' +
                    '<div class="si-input-state">' +
                        '<i class="icon fas fa-circle fa-xs"></i>' +
                        '<label>{{label}}</label>' +
                    '</div>' + 
                  '</div>',
        controller: function($scope, $timeout){
            $scope.init = function(){
                $timeout(function(){
                    if($scope.value == '')  $scope.value = null;
                })
            }


            $scope.$watch('model', function($new, $old){
                if($new == '') $new = null;               
                let lSelected = false;

                if($scope.value == $new) {
                    //console.log('Radio values matches');
                    lSelected = true;
                }
                
                $timeout(function(){
                    $scope.checked = lSelected;
                })
            })

            $scope.onClick = function(){
                //console.log('radio item clicked',$scope.value);
                $scope.model = $scope.value;
                $timeout(function(){
                    
                    //$scope.checked = true;

                    if(typeof $scope.changeHandler == 'function'){
                        $scope.changeHandler();
                    }
                });
                
            }
        }
    }
}]);


siApp
.directive("siSlider", function siSlider($document, $timeout) {
    return {
        restrict: "E",
        scope: {
            model: "=",
            max: "=siMax",
            onChange: "&",
            valueFormat: "&",
            property: "@",
            step: "@",
            startLabel: "@",
            endLabel:"@"
        },
        replace: true,
        template: '<div class="si-slider"><div class="label start">{{startLabel}}</div><div class="inner"><div class="slider {{boundaryClasses()}}" style="--lower-value:{{getLowerValue()}};--upper-value:{{getUpperValue()}}"></div></div><div class="label end">{{endLabel}}</div></div>',
        link: function($scope, element, attrs) {
            var getP, handles, rangeHandle, i, j, len, mv, pTotal, ref, setP, step, updatePositions;
            
            // It's the inner div we're really working with.
            element = angular.element(element[0].querySelector('.inner'));
            //element.css({'position':'relative'});
            handles = [];
            
            $scope.init(element);

            return $scope.$watch("model", function(){
                $scope.updatePositions();
            },true);
        },
        controller: function($scope){
            //var getP, handles, rangeHandle, i, j, len, mv, pTotal, ref, setP, step, updatePositions;
            $scope.handles = [];
            $scope.rangeHandle = null;
            $scope.pTotal = 0;

            $scope.init = function(element){
                let ref = $scope.model;
                let i, j, len;
                $scope.element = element;

                $scope.rangeHandle = angular.element('<div class="slider-range-handle"></div>');
                $scope.rangeHandle.css("position", "absolute");
                $scope.element.append($scope.rangeHandle);
                for (i = j = 0, len = ref.length; j < len; i = ++j) {
                    mv = ref[i];
                    let handle, startPleft, startPright, startX;
                    if (i === $scope.model.length - 1) {
                        return;
                    }
                    handle = angular.element('<div class="slider-handle"></div>');
                    handle.css("position", "absolute");
                    $scope.handles.push(handle);
                    $scope.element.append(handle);
                    startX = 0;
                    startPleft = startPright = 0;
                    $scope.pTotal = 0;

                    $scope.applyPointerEvent(handle, i, 'mouse');
                    $scope.applyPointerEvent(handle, i, 'touch');    
                }
            }

            $scope.boundaryClasses = function(){

            }

            /**
             * Apply event handling for pointer
             * @param $elm Angular element upon which ye bind event
             * @param $type mouse|touch
             */
            $scope.applyPointerEvent = function($elm, $elm_index,  $type){
                let lEvents = {
                    "mouse" : {
                        down : 'mousedown',
                        move : 'mousemove',
                        up : 'mouseup'
                    },
                    "touch" : {
                        down : 'touchstart',
                        move : 'touchmove',
                        up : 'touchend'
                    }
                }
                
                let startX = 0;
                let startPleft = startPright = 0;

                return $elm.on(lEvents[$type].down, function(event) {
                        var lPointerMoveHndl, lPointerUpHndl;
                        //console.log($type,'down triggered');
                        
                        lPositionRef = event;
                        jQuery('.slider-handle').css('z-index',1);
                        jQuery($elm).css('z-index',2);

                        lPointerMoveHndl = function(event){
                            return $scope.$apply(function() {
                                
                                let lPositionRef = event;
                                if($type=='touch'){
                                    lPositionRef = event.originalEvent.touches[0];
                                }
                                
                                var lDeltaPosition;
                                lDeltaPosition = (lPositionRef.screenX - startX) / $scope.element.prop("clientWidth") * $scope.pTotal;
                                if (lDeltaPosition < -startPleft || lDeltaPosition > startPright) {
                                    return;
                                }
                                $scope.setP($elm_index, startPleft + lDeltaPosition);
                                $scope.setP($elm_index + 1, startPright - lDeltaPosition);

                                //console.log($type,'move triggered',lPositionRef.screenX, startX, $scope.element.prop("clientWidth"), $scope.pTotal, lDeltaPosition);
                                return $scope.updatePositions();
                            });
                        };
                        
                        lPointerUpHndl = function() {
                            
                            $document.unbind(lEvents[$type].move, lPointerMoveHndl);
                            
                            if(typeof $scope.onChange == 'function'){
                                // trigger onChange only when pointer release the handle
                                $scope.onChange();
                            }
                            

                            return $document.unbind(lEvents[$type].up, lPointerUpHndl);
                        };

                        // Prevent default dragging of selected content
                        if($type=='touch'){
                            lPositionRef = event.originalEvent.touches[0];
                        }
                        event.preventDefault();
                        startX = lPositionRef.screenX;
                        startPleft = $scope.getP( $elm_index);
                        startPright = $scope.getP( $elm_index + 1);
                        
                        $document.on(lEvents[$type].move, lPointerMoveHndl);
                        return $document.on(lEvents[$type].up, lPointerUpHndl);
                    });
            }


            $scope.getLowerValue = function(){
                let lResult = $scope.getP(0);
                if(typeof $scope.valueFormat == 'function'){
                    return $scope.valueFormat();
                }
                return lResult;
            }

            $scope.getUpperValue = function(){
                let lResult = $scope.getP(2);
                if(typeof $scope.valueFormat == 'function'){
                    return $scope.valueFormat();
                }
                return lResult;
            }

            $scope.getStep = function() {
                if (($scope.step != null)) {
                    return parseFloat($scope.step);
                } 
                else {
                    return 0;
                }
            };
            
            $scope.getP = function(i) {
                if ($scope.property != null) {
                    return $scope.model[i][$scope.property];
                } else {
                    return $scope.model[i];
                }
            };
            
            $scope.setP = function(i, p) {
                var s;
                s = $scope.getStep();
                if (s > 0) {
                    p = Math.round(p / s) * s;
                }
                if ($scope.property != null) {
                    return $scope.model[i][$scope.property] = p;
                } else {
                    return $scope.model[i] = p;
                }
            };

            $scope.updatePositions = function() {
                var handle, i, j, len, p, pRunningTotal, results, x;
                var positions = [];
                $scope.pTotal = $scope.model.reduce(function(sum, item, i) {
                return sum + $scope.getP(i);
                }, 0);
                pRunningTotal = 0;
                results = [];
                
                for (i = j = 0, len = $scope.handles.length; j < len; i = ++j) {
                    handle = $scope.handles[i];
                    p = $scope.getP(i);
                    pRunningTotal += p;
                    x = pRunningTotal / $scope.pTotal * 100; //element.prop("clientWidth")
                    positions.push(x);
                    results.push(handle.css({
                        left: x + "%"// top: "-" + handle.prop("clientHeight") / 2 + "px"
                    }));
                }
    
                $scope.rangeHandle.css({
                    left: positions[0] + '%',
                    width : (positions[1] - positions[0]) + '%'
                });
    
                return results;
            };

        }
    };
});
