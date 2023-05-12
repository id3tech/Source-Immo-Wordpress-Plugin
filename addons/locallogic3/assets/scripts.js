siApp
.directive('ll3ContentWidget', function(){
    return {
        restrict: 'E',
        template: '<div class="locallogic-content-widget-container" ng-init="init()"><i class="fas fa-spin fa-spinner"></i><div id="ll3-widget-{{$id}}"></div></div>',
        replace: true,
        link: function($scope, $element, $attrs){
        },
        controller: function($scope, $rootScope, $q, $element, $siConfig, $timeout){

            $scope.widget = undefined;
            $scope.init = function(){
                
            }

            $scope.loadSDK = function(){
                const defered = $q.defer();
                console.log('loadSDK', document.querySelector('#locallogic3-sdk'));
                if(document.querySelector('#locallogic3-sdk') != null) return $q.resolve();

                const sdkElm = document.createElement('script');
                sdkElm.src = 'https://sdk.locallogic.co/sdks-js/1.7.1/index.umd.js';
                sdkElm.id = 'locallogic-sdk';

                sdkElm.onload = () => { 
                    defered.resolve(); 
                }
                document.body.append(sdkElm);

                return defered.promise;
            }

            $scope.$on('si/model:ready', function(){
                //$scope.showContentWidget();
            });

            $scope.$on('siDataAccordeon/neighborhood:open', function(){
                $scope.showContentWidget();
            });

            $scope.$on('siMediaBox/si-display-map', function(){
                //$scope.showContentWidget();
            });

            $scope.showContentWidget = function(){
                $scope.loadSDK().then( () => {
                    return $siConfig.get()
                })
                .then(function($configs){
                    //return;

                    const sdkToken = $configs.active_addons.locallogic3.configs.sdk_token;
                    //if(document.querySelector('#ll3-widget-' + $scope.$id) != null) return;
                    const container = $element[0].querySelector('#ll3-widget-' + $scope.$id);
                    if(container.classList.contains('si-ll3-widget')) return;

                    // container.setAttribute("id", 'll3-widget-' + $scope.$id);
                    container.classList.add('si-ll3-widget');

                    // Set the styles of the container
                    // With these styles the container will fill the height and width of the #widgetMap
                    container.style.cssText = `
                            height: 100%;
                            width: 100%;
                            display: flex;
                            `;
                    // This is the div that will contain the widget
                    // $element[0].appendChild(container);

                    const ll = LLSDKsJS(sdkToken, {
                        locale: siCtx.locale, // Change to either english or french
                        appearance: {
                            theme: "day",
                            // Add any other appearance changes here
                            variables: {
                                "--ll-color-primary": window.getComputedStyle(document.body).getPropertyValue('--si-highlight'),
                                "--ll-color-primary-variant1": window.getComputedStyle(document.body).getPropertyValue('--si-highlight'),
                                "--ll-border-radius-small": "8px",
                                "--ll-border-radius-medium": "16px",
                                "--ll-font-family": "Avenir, sans-serif"
                            }
                        }
                    });
                    
                    // Set the lat and lng of the location
                    const LAT = $scope.model.location.latitude;
                    const LNG = $scope.model.location.longitude;
                    console.log('create LL content: ll.create');
                    const lc = ll.create("local-content", container, {
                            lat: LAT,
                            lng: LNG,
                            cooperativeGestures: false,
                            marker: {
                                lat: LAT,
                                lng: LNG
                            }
                        }
                    );
                    
                    const obsvr = new MutationObserver( _ => {
                        const frame = container.querySelector('iframe');
                        if(frame != null){
                            frame.onload =  () => {
                                $element[0].classList.add('si-loaded');
                            }
                            
                            obsvr.disconnect();
                        }
                        
                    });
                    obsvr.observe(container, {childList:true, subtree: true});
                });
            }
        }
    }
});


function siInitLocallogic3 () {
    console.log('local logic sdk is ready');
    window.localLogicSdkReady = true;

    
    const fnApplyWidget = function($element){
        if($element.dataset.lat == '' || $element.dataset.lng == ''){
            window.setTimeout(function(){
                fnApplyWidget($element);
            },1000);
            return;
        }

        const lRect = $element.getBoundingClientRect();
        const lWidgetId = $element.getAttribute('id');
        const lOptions = {
            lat: $element.dataset.lat,
            lng: $element.dataset.lng,
            locale: 'fr',
            designId: 'll3-2019',
        };

        locallogic.LocalContent(lWidgetId, lOptions);
    }
    
    Array.from(document.querySelectorAll('.locallogic3-content-widget')).forEach(function($element,$index){
        const lWidgetId = 'll3-widget-' + $index;
        $element.setAttribute('id',lWidgetId);  
        fnApplyWidget($element);
    });

}
