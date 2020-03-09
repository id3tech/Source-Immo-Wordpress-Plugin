siApp
.directive('siInputContainer',['$parse', function siInputContainer($parse){
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        template: '<div class="si-input-container" ng-transclude></div>',
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
            checked:'@?siChecked'
        },
        link: function($scope, $element, $attrs){
            if($attrs.siChecked != undefined){
                const isChecked = $parse($attrs.siChecked)($scope);
                $scope.model = isChecked;
                console.log(isChecked,$attrs.siChecked);
            }
        },
        template: '<div class="pretty p-icon p-pulse">' +
                    '<input type="checkbox" ng-model="model">' +
                    '<div class="state">' +
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
        template: '<div class="si-select"><div class="si-selected-value"><span class="si-label">{{selectedValue}}</span> <i class="fal fa-lg fa-fw fa-angle-down"></i></div><div class="si-select-panel" ng-transclude></div></div>',
        replace: true,
        link: function($scope, $element, $attrs){
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

                $scope.$watch('model', $scope.modelChangeHandler);

                $scope.options = [];
                console.log('siSelect initialized', $scope.model);

                

                $scope.applyEvents();
            }

            // Methods accessed from child
            this.addToChildList = $scope.addToChildList = function($child){
                $scope.options.push($child);
                if($scope.model != null && $scope.model != undefined){
                    const lChildValue = $child.getValue();
                    if($scope.model == lChildValue){
                        $scope.updateValue(lChildValue)
                    }
                }
            }
            this.selectValue = $scope.selectValue = function($value){
                const lChanged = $scope.model != $value;
                $scope.model = $value;

                $scope.$apply(function(){     
                    $scope.updateValue();

                    if(lChanged){
                        console.log('select changed',$scope.model, $value);
                        $timeout(function(){
                            if(typeof $scope.changeCallback == 'function') $scope.changeCallback();
                        })
                    }
                });
            }

            $scope.modelChangeHandler = function($new, $old){
                $scope.updateValue();
            }

            $scope.updateValue = function(){
                    
                const lContainerParent = $scope.$element.closest('.si-input-container');
                const lRemoveValue = ($scope.model == '' || $scope.model == undefined || $scope.model == null);

                if(lContainerParent != null){
                    if(lRemoveValue){
                        lContainerParent.classList.remove('si-has-value');
                    }
                    else{
                        lContainerParent.classList.add('si-has-value');
                    }
                }

                $scope.options.forEach(function($o){
                    if($o.getValue() == $scope.model){
                        $o.classList.add('selected');
                        $scope.selectedValue = $o.innerHTML;
                    }
                    else{
                        $o.classList.remove('selected');
                    }
                });

                if(lRemoveValue){
                    $scope.selectedValue = '';
                }
            }

            $scope.applyEvents  = function(){
                // track click on parents to close the dropdown
                // will climb the document up to the body
                angular.element(document).on('click', function(){
                    console.log('Closest parent clicked');
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
                const lPotentialHeight = [];

                $element.querySelectorAll('si-option').forEach(function($e){
                    const lItemStyles = window.getComputedStyle($e);
                    const lItemHeight = ['height', 'padding-top', 'padding-bottom','margin-top','margin-bottom']
                                            .map(function (key) { return parseInt(lItemStyles.getPropertyValue(key), 10);})
                                            .reduce(function (prev, cur){return prev + cur});
                    lPotentialHeight.push(lItemHeight);
                });
                
                return lPotentialHeight.reduce(function($result,$cur){
                    return $result + $cur;
                },0);
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
                console.log('button clicked', $scope.$element);
                $rootScope.$broadcast('close-dropdown', $scope.$element);
                
                const lElmZIndex = $siUtils.elmOffsetZIndex($scope.$element);

                $scope.extractMenu($scope.$element).then(function(lMenuElm){
                    lMenuElm.style.zIndex = Number(lElmZIndex) + 10;
                
                    lMenuElm.addEventListener('transitionend', function(){
                        const lClickTrap = $scope.ensureClickTrap();
                        lClickTrap.classList.add('active');
                        if(lElmZIndex != 'auto') lClickTrap.style.zIndex = Number(lElmZIndex) + 5;
                        lClickTrap.addEventListener('click',function($event){
                            lMenuElm.classList.remove('expanded');
                            //$rootScope.$broadcast('close-dropdown', null);
                            lClickTrap.classList.remove('active');
                            lClickTrap.style.removeProperty('z-index');
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
                        lMainElmRect.inner_cx = lMainElmRect.width / 2;
                        lMainElmRect.inner_cy = lMainElmRect.height / 2;
                        lMainElmRect.cx = lMainElmRect.left + lMainElmRect.inner_cx;
                        lMainElmRect.cy = lMainElmRect.top + window.pageYOffset + lMainElmRect.inner_cy;
                        
                        
                            
                        $scope._menu_elm.style.width='unset';
                        $scope._menu_elm.style.minWidth = lMainElmRect.width + 'px';
                        $scope._menu_elm.style.top = lMainElmRect.cy + 'px';
                        $scope._menu_elm.style.left = lMainElmRect.cx + 'px';    
                        //$scope._menu_elm.style.transform = 'translate(-50%,-50%)';

                        // position the dropdown menu
                        const lMenuRect = $scope._menu_elm.getBoundingClientRect();
                        lMenuRect.height = $scope.getContentHeight($scope._menu_elm);
                        lMenuRect.top = lMainElmRect.cy - (lMenuRect.height/2);
                        
                        const lMenuStyle = window.getComputedStyle($scope._menu_elm);
                        const lMenuWidth = Number(lMenuStyle.width.replace('px',''));
                        const lMenuHeight = $scope.getContentHeight($scope._menu_elm);
                        const lViewportRect = {
                            top: Math.min(25,lMainElmRect.top),
                            left:Math.min(25,lMainElmRect.left),
                            bottom: window.innerHeight -  Math.min(50,lMenuRect.top * 2),
                            right: window.innerWidth -  Math.min(50,lMenuRect.left * 2)
                        }
                        
                        const lTransform = {x : '-50%',y : '-50%'};
                        
                        if(lMenuRect.left < lViewportRect.left){
                            lTransform.x = '0%';
                        }
                        else if (lMenuRect.right > lViewportRect.right){
                            lTransform.x = 'calc(-100% + ' + lMainElmRect.inner_cx + 'px)';
                        }

                        if(lMenuRect.top < lViewportRect.top){
                            lTransform.y = (0 - lMainElmRect.inner_cy) + 'px';
                        }
                        else if(lMenuRect.bottom > lViewportRect.bottom){
                            lTransform.y = 'calc(-100% + ' + lMainElmRect.inner_cy + 'px)';
                        }
                        //$scope._menu_elm.style.zIndex = 110;
                        $scope._menu_elm.style.transform = 'translate(' + lTransform.x + ',' + lTransform.y +')';
                        $scope._menu_elm.style.setProperty('--potential-height', lMenuHeight + 'px');

                        $resolve($scope._menu_elm);
                    },20);
                });
            }
        }
    }
}]);

siApp
.directive('siOption',['$parse', function siOption($parse){
    return {
        restrict: 'E',
        require: '^siSelect',
        link: function($scope, $element, $attrs, $parentCtl){
            
            const lValue = ($attrs.ngValue == undefined) ? $attrs.value : $parse($attrs.ngValue)($scope);
            $element[0].getValue = function(){ return lValue };

            $element[0].addEventListener('click', function(){
                
                $parentCtl.selectValue(lValue);
            });
            
            $parentCtl.addToChildList($element[0], lValue);
            
        }
    }
}])


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
                $scope.init($element);
            },
            controller: function($scope, $timeout,$siUtils){
                $scope._menu_elm = null;

                $scope.$watch('hasValue', function($new, $old){
                    if($new == true){
                        $scope._elm.classList.add('has-value');
                    }
                    else{
                        $scope._elm.classList.remove('has-value');
                    }
                });

                $scope.init = function($element){
                    $scope._elm = $element[0];

                    $scope.showButtonIcon = (typeof $scope.showButtonIcon == 'undefined') ? true : $scope.showButtonIcon;
                    $scope.hasValue = (typeof $scope.hasValue == 'undefined') ? false : $scope.hasValue!=null;
                    $scope.buttonIcon = "anchor-down";

                    if($scope.hasValue){
                        $scope._elm.classList.add('has-value');
                    }

                    if($scope.showButtonIcon === true || $scope.showButtonIcon != 'false'){
                        $scope._elm.classList.add('has-button-icon');
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
                        console.log('Closest parent clicked');
                        $rootScope.$broadcast('close-dropdown', null);
                    })
    
                    // Apply button click event handler
                    angular.element($scope._elm).find('.dropdown-button').on('click', $scope.clickHandler);
                    
                    // listen to 'close-dropdown' signal to close the menu
                    $scope.$on('close-dropdown', function($event, $source){
                        if($source != $scope._elm){
                            $scope.closeMenu();
                        }
                    })
                }

                $scope.getContentHeight = function($element){
                    let lPotentialHeight = 0;
                    $element.querySelectorAll('.dropdown-item').forEach(function($e){
                        lPotentialHeight += Number(window.getComputedStyle($e).height.replace('px',''));
                    });
                    //const lMenuElm = $element.querySelector('.si-dropdown-panel');

                    //lMenuElm.style.setProperty('--content-height', lPotentialHeight);
                    return lPotentialHeight;
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
                    console.log('button clicked', $scope._elm);
                    $rootScope.$broadcast('close-dropdown', $scope._elm);
                    // const lClosestParent = $scope._elm.closest('.modal-body, .filter-panel');
                    // angular.element(lClosestParent).on('click', function(){
                    //     console.log('Closest parent clicked');
                    //     $rootScope.$broadcast('close-dropdown', null);
                    // })
                    
                    const lElmZIndex = $siUtils.elmOffsetZIndex($scope._elm);

                    const lMenuElm = $scope.extractMenu($scope._elm);
                    lMenuElm.classList.add('expanded');
                    console.log('Elm z-index', lElmZIndex);

                    if(lElmZIndex != 'auto'){
                        lMenuElm.style.zIndex = Number(lElmZIndex) + 10;
                    }
                    else{
                        lMenuElm.style.zIndex = 100;
                    }
                    
                    
                    const lClickTrap = $scope.ensureClickTrap();
                    lClickTrap.classList.add('active');
                    if(lElmZIndex != 'auto') lClickTrap.style.zIndex = Number(lElmZIndex) + 5;
                    lClickTrap.addEventListener('click',function($event){
                        lMenuElm.classList.remove('expanded');
                        //$rootScope.$broadcast('close-dropdown', null);
                        lClickTrap.classList.remove('active');
                        lClickTrap.style.removeProperty('z-index');
                        $event.stopPropagation();
                    },{once:true});

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
                        const lMainElmRect = $scope._elm.getBoundingClientRect();
                        lMainElmRect.inner_cx = lMainElmRect.width / 2;
                        lMainElmRect.inner_cy = lMainElmRect.height / 2;
                        lMainElmRect.cx = lMainElmRect.left + lMainElmRect.inner_cx;
                        lMainElmRect.cy = lMainElmRect.top + window.pageYOffset + lMainElmRect.inner_cy;
                        
                        
                            
                        $scope._menu_elm.style.width='unset';
                        $scope._menu_elm.style.minWidth = lMainElmRect.width + 'px';
                        $scope._menu_elm.style.top = lMainElmRect.cy + 'px';
                        $scope._menu_elm.style.left = lMainElmRect.cx + 'px';    
                        //$scope._menu_elm.style.transform = 'translate(-50%,-50%)';
    
                        // position the dropdown menu
                        const lMenuRect = $scope._menu_elm.getBoundingClientRect();
                        lMenuRect.height = $scope.getContentHeight($scope._menu_elm);
                        lMenuRect.top = lMainElmRect.cy - (lMenuRect.height/2);
                        
                        const lMenuStyle = window.getComputedStyle($scope._menu_elm);
                        const lMenuWidth = Number(lMenuStyle.width.replace('px',''));
                        const lMenuHeight = $scope.getContentHeight($scope._menu_elm);
                        const lViewportRect = {
                            top: Math.min(25,lMainElmRect.top),
                            left:Math.min(25,lMainElmRect.left),
                            bottom: window.innerHeight -  Math.min(50,lMenuRect.top * 2),
                            right: window.innerWidth -  Math.min(50,lMenuRect.left * 2)
                        }
                        
                        const lTransform = {x : '-50%',y : '-50%'};
                        console.log({
                            menuRect: lMenuRect,
                            viewportRect: lViewportRect
                        });
    
                        if(lMenuRect.left < lViewportRect.left){
                            lTransform.x = '0%';
                        }
                        else if (lMenuRect.right > lViewportRect.right){
                            lTransform.x = 'calc(-100% + ' + lMainElmRect.inner_cx + 'px)';
                        }
    
                        if(lMenuRect.top < lViewportRect.top){
                            lTransform.y = (0 - lMainElmRect.inner_cy) + 'px';
                        }
                        else if(lMenuRect.bottom > lViewportRect.bottom){
                            lTransform.y = 'calc(-100% + ' + lMainElmRect.inner_cy + 'px)';
                        }
                        //$scope._menu_elm.style.zIndex = 110;
                        $scope._menu_elm.style.transform = 'translate(' + lTransform.x + ',' + lTransform.y +')';
                    },20);
                    

                    return $scope._menu_elm;
                }
            }
        }
    }
]);


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
        templateUrl: siCtx.base_path + 'views/ang-templates/si-price-range-slider.html',
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

                console.log('setP', $scope.model, i, p, lValue);

                if ($scope.property != null) {
                    return $scope.model[i][$scope.property] = lValue;
                } else {
                    return $scope.model[i] = lValue;
                }
            };
            $scope.setPs = function($values){
                console.log('setPs', $values);

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
            checked: '=?ngChecked',
            name: '@'
        },
        link: function(scope){
        },
        template: '<div class="any-selector pretty p-icon p-pulse p-round">' +
                    '<input type="radio" name="{{name}}" ng-checked="checked">' +
                    '<div class="state">' +
                        '<i class="icon fas fa-circle fa-xs"></i>' +
                        '<label>{{label}}</label>' +
                    '</div>' + 
                  '</div>'
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
