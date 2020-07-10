

/**
 * siAdaptativeClass
 * Will set a class to element to match standard viewport (laptop, tablet, mobile), based on the space available 
 */
siApp
.directive('siAdaptativeClass', [
    '$parse','$timeout',
    function($parse){
        return {
            restrict: 'A',
            scope: true,
            link: function($scope, $element, $attrs){
                $scope.$element = $element[0]
            },
            controller : function($scope, $rootScope,$timeout){
                $scope._resizeTimeoutHndl = null;
                
                $scope.init = function(){
                    $scope.updateClass();
                    $scope.addResizeListener();
                }

                $timeout(function(){
                    $scope.init();
                },1000);

                $scope.addResizeListener = function(){
                    window.addEventListener("resize", function($event){
                        if($scope._resizeTimeoutHndl != null){
                            window.clearTimeout($scope._resizeTimeoutHndl);
                        }

                        $scope._resizeTimeoutHndl = window.setTimeout(function(){
                            $scope.updateClass();
                        }, 100);
                    });
                }

                $scope.updateClass = function(){
                    const lSizeMap = {
                        'si-adapt-small-phone-size': [0,320],
                        'si-adapt-phone-size': [321,640],
                        'si-adapt-tablet-size': [641,800],
                        'si-adapt-laptop-size': [801,1000]
                    }
                    
                    // remove any class previously applied by a resize or initial parse
                    Object.keys(lSizeMap)
                        .forEach(function($k){
                            $scope.$element.classList.remove($k);
                        });

                    

                    // get element size
                    let lReferenceElement = $scope.$element.parentElement;
                    // if(!lReferenceElement.classList.contains('si-content')){
                    //     console.log('no .si-content', lReferenceElement);

                    //     lReferenceElement = ['.si-content','.element-widget-container'].reduce( function($result, $cur){
                    //         console.log('search for', $result, $cur, $scope.$element.closest($cur))
                    //         return $result || $scope.$element.closest($cur);
                    //     }, null);

                    // }

                    let lReferenceWidth = null;
                    if(lReferenceElement != null){
                        console.log('valid container detected for',$scope.$element,':', lReferenceElement);

                        const lElementBox = lReferenceElement.getBoundingClientRect();
                        console.log('AdaptativeResize/updateClass',lElementBox);
                        if(lElementBox.width == 0){
                            console.log('Element box width is 0', lReferenceElement);
                            // $timeout(function(){
                            //     $scope.updateClass();
                            // },500);
                            return;  // bail out if the element has no width
                        }

                        lReferenceWidth = lElementBox.width;
                    }
                    else{
                        console.log('no valid referece element detected');
                    }

                    // find the first size greater than the element box width
                    const lFilteredMap = Object.keys(lSizeMap)
                                            .filter(function($k){
                                                return lSizeMap[$k][1] <= window.innerWidth || lSizeMap[$k][1] <= lReferenceWidth;
                                            });
                    console.log('AdaptativeResize/updateClass',lFilteredMap, lReferenceWidth);
                    const lClass = (lReferenceWidth == null)
                                            ? lFilteredMap.reverse()[0]
                                            : lFilteredMap.reverse().find(function($k){
                                                return (
                                                    (lSizeMap[$k][0] <= lReferenceWidth)
                                                );
                                            });
                    console.log('added class', lClass);
                    if(lClass != null){
                        // apply class if found
                        $scope.$element.classList.add(lClass)
                        $rootScope.$broadcast('container-resize');
                    }
                }

            }
        }
    }
]);

siApp
.directive('onBottomReached', function onBottomReached($document) {
    //This function will fire an event when the container/document is scrolled to the bottom of the page
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            const lObservable = angular.element('<span></span>');
            element.append(lObservable);
            const raw = element[0];
            let doc = $document[0];
            //console.log('loading directive on ');
            if (typeof(IntersectionObserver) === 'undefined') {

                $document.bind('scroll', function () {
                    let lTop = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
                    let lBottomLimit = raw.offsetHeight + raw.offsetTop - (window.innerHeight/3*2);
                    //console.log('in scroll', lTop);
                    //console.log(lBottomLimit);
                    if (lTop  >= lBottomLimit) {
                        //console.log("I am at the bottom");
                        scope.$apply(attrs.onBottomReached);
                    }
                });
            }
            else{
                const lMargin = (window.innerHeight > 1080) 
                                    ? window.innerHeight * 0.25 
                                    : window.innerHeight;

                const options = {
                    rootMargin: lMargin + 'px',
                    threshold: 0
                }
                const observer = new IntersectionObserver(function($entries, $observer){
                    $entries.forEach(function($entry){
                        if($entry.isIntersecting){
                            scope.$apply(attrs.onBottomReached);
                        }
                    });
                    
                }, options);
                observer.observe(lObservable[0]);

            }
        }
    };
});


siApp
.directive('siContainer', function siContainer(){
    return {
        restrict: "E",
        replace: true,
        transclude: true,
        scope:true,
        template: '',
        controller: function($element, $transclude) {
            $element.append($transclude());
        }
    };
});

siApp
.directive('siSideScroll', function siSideScroll(){
    return {
        restrict: 'A',
        scope:true,
        link: function($scope, $element, $attrs){
            
            
            $scope.init($element);
            
        },
        controller: function($scope, $element){
            $scope.$scrollContainer = null;
            $scope.$element = null;
            $scope._resizeDebounce = null;
            $scope.sizeBreakPoint = 720;

            $scope.init = function($element){
                $scope.$element = $element[0];
                $scope.$scrollContainer = $element[0].parentElement;
                $scope.addResizeListener(window);

                if(window.innerWidth <= $scope.sizeBreakPoint){
                    $scope.applySideScroll();
                }
                console.log('siSideScroll/init',$scope.$element, window.innerWidth);
            }


            $scope.addResizeListener = function($elm){
                $elm.addEventListener('resize', $scope.resize);
            }

            $scope.resize = function($event){
                console.log('siSideScroll/window@onResize',$scope.$element, window.innerWidth);
                // apply SideScroll when window width is smaller than 720px
                if($scope._resizeDebounce != null){
                    window.clearTimeout($scope._resizeDebounce);
                }

                $scope._resizeDebounce = window.setTimeout(function debouncedApplySideScroll(){
                    if(window.innerWidth <= $scope.sizeBreakPoint){
                        

                        
                            $scope.applySideScroll();
                        
                    }
                    else{
                        $scope.removeSideScroll();
                    }
                },100);
            }

            $scope.applySideScroll = function(){
                console.log('siSideScroll/applySideScroll');
                const lContainerWidth = $scope.$scrollContainer.getBoundingClientRect().width;
                const lPadding = (window.innerWidth - lContainerWidth) / 2;
    
                const sideScrollStyles = $scope.getContainerStyles();
                sideScrollStyles.padding = '0 ' + lPadding + 'px';
                console.log('siSideScroll/applySideScroll:', sideScrollStyles,$scope.$scrollContainer);
                Object.keys(sideScrollStyles).forEach(function($k){
                    $scope.$scrollContainer.style[$k] = sideScrollStyles[$k];
                });
                
                $scope.$element.style.setProperty('--side-scroll-padding', lPadding + 'px');
                $scope.$element.style.setProperty('--side-scroll-width', lContainerWidth + 'px');
            }

            $scope.removeSideScroll = function(){
                console.log('siSideScroll/removeSideScroll',$scope.$scrollContainer);
                const sideScrollStyles = $scope.getContainerStyles();
                
                Object.keys(sideScrollStyles).forEach(function($k){
                    $scope.$scrollContainer.removeAttribute('style');
                });
                
                $scope.$element.style.removeProperty('--side-scroll-padding');
            }

            $scope.getContainerStyles = function(){
                const sideScrollStyles = {
                    width: '100vw',
                    marginLeft: '-50vw',
                    marginRight: '-50vw',
                    left: '50%',
                    right: '50%',
                    position: 'relative',
                    padding: '0px',
                    overflow: 'auto hidden'
                };
                return sideScrollStyles;
            }
        }
    }
})


/**
 * Delayed renderer
 * Get a server side ajex render after a trigger
 */
siApp
.directive('siDelayedRenderer', ['$http','$timeout','$siHooks', function siDelayedRenderer($http,$timeout,$siHooks){
    return {
        restrict: "A",
        link: function($scope,$element,$attrs){
            $scope.init($element,$attrs);
        },
        controller: function($scope){
            $scope._elm = null;

            $scope.init = function($element,$attrs){
                $scope._elm = $element;
                $scope.trigger = $attrs.siDelayedRenderer;
                $scope.content = $element.html();
                $element.html('');

                if(isNaN($scope.trigger)){
                    $siHooks.addAction($scope.trigger, function(){ $scope.render(); });
                }
                else{
                    $timeout(function(){ $scope.render();}, Number($scope.trigger));
                }
            }

            $scope.render = function(){
                const expression = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
                const regex = new RegExp(expression);

                if(regex.test($scope.content) || $scope.content.indexOf('/wp-json/si-rest') == 0){
                    $scope.content = $scope.content.replace(/\&amp;/gi,'&');

                    $http.get($scope.content).then(function($response){
                        if($response.status == 200){
                            $scope._elm.html('');
                            $scope._elm.append($response.data);
                        }
                    });
                }
                else{
                    $scope._elm.append($scope.content);
                }
            }
        }
    }
}]);


siApp
.directive('includeReplace', function includeReplace() {
    return {
        require: 'ngInclude',
        restrict: 'A', /* optional */
        link: function (scope, el, attrs) {
            el.replaceWith(el.children());
        }
    };
});

siApp
.directive('siImageAutoFit', function siImageAutoFit(){
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs){
            //console.log('siImageAutoFit', $element[0].tagName);
            if($element[0].tagName !=  'IMG') return;

            
            const lImg = $element[0];
            const lDefaultFit = $attrs.siImageAutoFit || 'cover';
            //const lImg = document.createElement('img');
            const fnGetOrientation = function($width, $height){
                return ($width >= $height) ? 'landscape' : 'portrait';
            }

            lImg.addEventListener('load', function($event){
                const lNaturalOrientation = fnGetOrientation(lImg.naturalWidth, lImg.naturalHeight);
                const lComputedOrientation = fnGetOrientation(lImg.width, lImg.height);
                
                if(lNaturalOrientation == lComputedOrientation){
                    lImg.style.objectFit = lDefaultFit;
                }
                else if (lNaturalOrientation == 'landscape'){
                    lImg.style.objectFit = 'cover';
                }
                else{
                    lImg.style.objectFit = 'contain';
                }
            }, {once:true});
            //lImg.setAttribute('src',lElm.src);

            lImg.addEventListener('resize', function($event){
                if(document.fullscreenElement != null){
                    lImg.style.objectFit = 'contain';
                    return;
                }
            });
        }
    }
});

siApp
.directive('siModal', function siModal(){
    let dir_controller = function siModalCtrl($scope, $q,$siApi,$rootScope,$siHooks) {
        $scope.modal_element = null;
        $scope.forms = {};

        $scope.options = {
            close_label : null,
            ok_label: 'OK'
        }

        //console.log('listening to "show-' + $scope.modal_id + '" trigger');
        $scope.$on('show-' + $scope.modal_id, function(){
            //console.log('show modal trigger received');
            $scope.open();
            $siHooks.do('si-modal-open');
        });

        $scope.init = function(){
            if($scope.model==null){
                $scope.model = {};
            }   
            
            const lForm = $scope.modal_element.find('form').eq(0);
            if(lForm != null){
                $scope.forms.modalForm = lForm.controller('form');
            }
            else{
                $scope.forms.modalForm = null;
            }

            //var input1 = element.find('input').eq(0);
        }

        $scope.cancelEvent = function($event){
            //console.log('event trapped bouhou!')
            $event.stopPropagation();
        }

        $scope.open = function(){
            $scope.modal_element.addClass("opened");
            $scope.$emit('modal-opened');
        }

        $scope.close = function(){
            $scope.modal_element.removeClass("opened");
            $scope.$emit('modal-closed');
        }

        $scope.closeWithValue = function(){
            //console.log('close with value',typeof($scope.onOK))
            
            if($scope.forms.modalForm.$valid){
                if(typeof($scope.onOK)=='function'){
                    $scope.onOK();
                }
                $scope.close();
            }
        }

        // watch for amount to be valid then init directive
        $scope.$watch("modal_title", function(){
            if($scope.amount!=null){
                $scope.init();
            }
        });

        $scope.$watch("ok_label", function(){
            if($scope.ok_label!=null){
                $scope.options.ok_label = $scope.ok_label;
            }
        });

        
        $scope.$watch("close_label", function(){
            if($scope.close_label!=null){
                $scope.options.close_label = $scope.close_label;
            }
        });

        $scope.isFormValid = function(){
            if ($scope.forms.modalForm == null) return true;
            return $scope.forms.modalForm.$valid;
        }
    };

    return {
        restrict: 'E',
        scope: {
            modal_id        : '@modalId',
            modal_title     : '@modalTitle',
            onOK            : '&?onOk',
            model           : '=?ngModel',
            ok_label        : '@?okLabel',
            cancel_label    : '@?cancelLabel',
            onValidate      : '&?onValidate',
            showControls    : '@?showControls'
        },
        controllerAs    : 'modalCtrl',
        replace         : true,
        transclude      : true,
        templateUrl     : siCtx.base_path + 'views/ang-templates/si-modal.html?v=3',
        link            : function(scope, element, attr){
            
            scope.modal_element = element;
            if(scope.modal_element_moved !== true){
                jQuery(element[0]).appendTo(document.body);
                scope.modal_element_moved = true;
                
                //console.log('modal content moved to body',element[0],jQuery(element[0]).find('input[type=submit]'));
                
                scope.init();
                
            }
            
            //angular.element(document.body).append(scope.modal_element,true);
        },
        controller      : dir_controller,
    };
});


siApp
.directive('siModalTrigger', function siModalTrigger(){
    return {
        restrict: 'C',
        scope:{
            target : '@'
        },
        link: function($scope, element, attr){
            angular.element(element).bind('click', function(){
                $scope.openModal();
            });
        },
        controller: function($scope, $rootScope){
            $scope.openModal = function(){
                //console.log('broadcasting show-',$scope.target);
                $rootScope.$broadcast('show-' + $scope.target);
            }
        }
    }
});

siApp
.directive('siLazyLoad', ['$timeout', function siLazyLoad($timeout){
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs){
            
            if (typeof(IntersectionObserver) === 'undefined') {
                $scope.applyAllImageSource();
            }
            else {
                const lMargin = (window.innerHeight > 1080) 
                                    ? window.innerHeight * 0.25 
                                    : window.innerHeight;
                const options = {
                    rootMargin: lMargin + 'px',
                    threshold: 0
                }

                $scope.observer = new IntersectionObserver(function($entries, $observer){
                    $entries.forEach(function($entry){
                        if($entry.isIntersecting){
                            $scope.applyImageSource($entry.target);
                            $scope.observer.unobserve($entry.target);
                        }
                    });
                    
                }, options);

                $scope.applyObserver();
            }
        },
        controller: function($scope){
            $scope.$on('si-list-loaded', function(){
                console.log('list loaded triggered');
                

                $timeout(function(){
                    if($scope.observer != undefined){
                        $scope.applyObserver();
                    }
                    else{
                        $scope.applyAllImageSource();
                    }
                })
            });

            $scope.applyAllImageSource = function(){
                let lLazyLoadImages = Array.from(document.querySelectorAll('.si-lazy-loading'));
                console.log('applyAllImageSource',lLazyLoadImages.length);
                
                lLazyLoadImages.forEach(function($element){
                    const lImg = $element.querySelector('img');
                    if(lImg.getAttribute('src') != null) return;
                    $scope.applyImageSource($element);
                });
            }

            $scope.applyImageSource = function($lazyContainerElm){
                console.log('applyImageSource:triggered');
                const $imgElm = $lazyContainerElm.querySelector('img');
                let lImgSource = $imgElm.getAttribute('si-src') || $imgElm.getAttribute('data-si-src');
                const lImgSourceset = $scope.getSourceSet($imgElm); //.getAttribute('si-srcset') || $imgElm.getAttribute('data-si-srcset');

                if($imgElm.getBoundingClientRect().width > 1200){
                    lImgSource = lImgSource.replace("-sm.","-lg.");
                }
                if($imgElm.getBoundingClientRect().width > 400){
                    lImgSource = lImgSource.replace("-sm.","-md.");
                }
                //console.log('siLazyLoad', lImgSource, lImgSourceset);

                if(lImgSource != undefined) $imgElm.setAttribute('src', lImgSource);
                if(lImgSourceset != undefined) $imgElm.setAttribute('srcset', lImgSourceset);

            }

            $scope.applyObserver = function(){
                let lLazyLoadImages = document.querySelectorAll('.si-lazy-loading');
                
                if(lLazyLoadImages.forEach == undefined){
                    lLazyLoadImages = Array.from(lLazyLoadImages);
                }
                console.log('applyObserver for ', lLazyLoadImages.length, 'elements');
                
                lLazyLoadImages.forEach(function($element){
                    const lImg = $element.querySelector('img');
                    if(lImg.getAttribute('src') != null) return;
                    
                    $scope.observer.observe($element);
                });
            
            }

            $scope.getSourceSet = function($imgElm){
                if(!$imgElm.hasAttribute('si-srcset') && !$imgElm.hasAttribute('data-si-srcset')) return;
                const lSrcset = $imgElm.getAttribute('si-srcset') || $imgElm.getAttribute('data-si-srcset');
                
                if(lSrcset.indexOf('-sm.') < 0) return lSrcset;
                
                
                const lOriginalPictureSets = lSrcset.split(', ');
                const lPictureSets = [];

                

                if($imgElm.getBoundingClientRect().width < 200){
                    // Don't need to add a source set on very small picture
                    return;
                }
                
                if(lOriginalPictureSets.length > 1) {
                    return lOriginalPictureSets.map(function($set,$i){
                        return $scope.normalizeSourceSetItem($set,$i+1);
                    }).join(', ');
                }
                
                // ['md'].forEach(function($size,$index){
                //     lPictureSets.push(lOriginalPictureSets.replace('-sm.','-' + $size + '.'));// + ' ' + ($index + lPictureSets.length + 1) + 'x');
                // });

                //return lPictureSets.join(', ');
                // console.log('si-srcset',lPictureSets.join(', '));

                // $element[0].setAttribute('data-si-srcset', lPictureSets.join(', '));
            }

            $scope.normalizeSourceSetItem = function($source, $mul){
                if($source.indexOf($mul+'x')>0) return $source;
                
                return $source + ' ' + $mul + 'x';
            }
            
        }
    }
}]);


siApp
.directive('siLoading', [function siLoading(){
    return {
        restrict: 'E',
        replace: true,
        scope: {
            label: '@siLabel'
        },
        template: '<div class="si-loading"><i class="fal fa-spinner fa-spin"></i> {{label.translate()}}</div>',
        controller: function($scope){
            
        }
    }
}]);


/**
 * lstr
 * Use to translate strings
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



//#region DEPRECATED
// siApp
// .directive('siSrcset', ['$compile', function siSrcset($compile){
//     return {
//         restrict: 'A',
//         link: function($scope, $element, $attrs){
//             const lOriginalPicture = $attrs.siSrcset;
            
//             if($element[0].tagName != 'IMG') return;
//             if(lOriginalPicture.indexOf('-sm.') < 0) return;
//             if($attrs.siSrcset == undefined) return;
//             if($attrs.siSrcset.indexOf('1x')>0) return;
            
//             const lPictureSets = [lOriginalPicture + ' 1x'];
//             ['md'].forEach(function($size,$index){
//                 lPictureSets.push(lOriginalPicture.replace('-sm.','-' + $size + '.') + ' ' + ($index + 2) + 'x');
//             });

//             console.log('si-srcset',lPictureSets.join(', '));

//             $element[0].setAttribute('data-si-srcset', lPictureSets.join(', '));
//         }
//     }
// }])

//#endregion


/**
 * TABS MANAGEMENT
 */
siApp
.directive('siTabs', ['$q', function siTabs($q){
    return {
        restrict: 'E',
        replace:true,
        transclude: true,
        template: '<div class="si-tabs" style="--selected-tab:{{selected_tab_index}};--tab-count:{{button_elms.length}}">' + 
                        '<div class="si-tab-button-container"></div>' +  
                        '<div class="si-tab-content-container">' +
                            '<div class="si-tab-trolley" ng-transclude></div>' +
                        '</div>' + 
                    '</div>',
        link: function($scope, $element, $attrs){
            //console.log('siTabs link')
            $scope.init($element);
        },
        controller: function($scope){
            $scope._element = null;
            $scope.button_elms = [];
            $scope.content_elms = [];
            $scope.selected_tab_index = 0;

            $scope.init = function($element){
                $scope._element = $element;
                $scope._button_container = $scope._element.find('.si-tab-button-container');
                $scope._content_container = $scope._element.find('.si-tab-content-container');

                $scope.button_elms.forEach(function($e,$i){
                    if($i == $scope.selected_tab_index) $e.addClass('active');
                    $scope._button_container.append($e);
                });

                $scope.showTab($scope.selected_tab_index);
            }

            $scope.addTabButton = function($tabButtonElement){
                $scope.button_elms.push($tabButtonElement);
            }

            $scope.addTabContent = function($tabContentElement){
                const lResult = $scope.content_elms.length;
                $scope.content_elms.push($tabContentElement);
                return lResult;
            }

            $scope.showTab = function($tabContentElementIndex){
                $scope.button_elms.forEach(function($e,$i){
                    if($i == $tabContentElementIndex){
                        $e.addClass('active');
                    }
                    else{
                        $e.removeClass('active');
                    }
                })

                $scope.selected_tab_index = $tabContentElementIndex;
                $scope.tabContentResize();
            }

            $scope.tabContentResize = function(){
                const lContentElm = $scope.content_elms[$scope.selected_tab_index];
                const lContentHeight = jQuery(lContentElm[0]).height();
                $scope._content_container.css({height : lContentHeight});
            }
        }
    }
}])

siApp
.directive('siTab', ['$q', function siTab($q){
    return {
        restrict: 'E',
        required: '^siTabs',
        scope:true,
        link: function($scope, $element, $attr){
            $scope.init($element);
        },
        controller: function($scope){
            $scope._element = null;
            $scope._button_elm = null;
            $scope._content_elm = null;

            $scope.init = function($element){
                $scope._element = $element;
                $scope._button_elm = $element.find('.si-tab-label');
                $scope._content_elm = $element.find('.si-tab-content');

                $scope.addTabButton($scope._button_elm);
                $scope._content_elm._si_tab_index = $scope.addTabContent($scope._content_elm);
            }

            $scope.tabClick = function(){
                $scope.showTab($scope._content_elm._si_tab_index);
            }
        }
    }
}]);

siApp
.directive('siTabLabel', function siTabLabel(){
    return {
        restrict:'E',
        required: '^siTab',
        transclude: true,
        scope: true,
        replace:true,
        template: '<div class="si-tab-label" ng-click="tabClick()"><span ng-transclude></span></div>',
        link: function($scope, $element, $attrs){
            $scope._element = $element;
        },
        controller: function($scope){
            
            
        }
    }
})


siApp
.directive('siTabContent', function siTabContent(){
    return {
        restrict:'E',
        required: '^siTab',
        transclude: true,
        scope: true,
        replace:true,
        template: '<div class="si-tab-content" ng-transclude></div>',
        link: function($scope, $element, $attrs){
            $scope.init($element, $attrs.siElement);
        },
        controller: function($scope){
            $scope.init = function($element, $contentQuery){
                $scope._element = $element;
                $scope._element_node = $element[0];

                
                if($contentQuery != undefined){
                    const lContent = angular.element($contentQuery);
                
                    $scope._element.append(lContent);
                }
                
                $scope.$watch('_element_node.offsetHeight', function($a,$b){
                    $scope.tabContentResize();
                })
            }
            
        }
    }
})


