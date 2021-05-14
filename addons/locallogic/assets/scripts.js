siApp
.directive('llContentWidget', function(){
    return {
        restrict: 'E',
        template: '<div class="locallogic-content-widget-container"></div>',
        replace: true,
        link: function($scope, $element, $attrs){
            const lWidgetElm = document.createElement('DIV');
            lWidgetElm.setAttribute('id','ll-widget-' + $scope.$id);
            $element[0].append(lWidgetElm);
        },
        controller: function($scope, $rootScope, $q, $element, $timeout){

            $scope.widget = undefined;

            $scope.$on('si/model:ready', function(){
                //$scope.showContentWidget();
            });

            $scope.$on('siDataAccordeon/neighborhood:open', function(){
                $scope.showContentWidget();
            });

            $scope.$on('siMediaBox/si-display-map', function(){
                //$scope.showContentWidget();
            });

            window.addEventListener('resize', function($event){
                if($scope.widget == undefined) return;
                if($scope._resizePtr != undefined){
                    $timeout.cancel($scope._resizePtr);
                }

                $scope._resizePtr = $timeout(function(){
                    const lWidgetId = 'll-widget-' + $scope.$id;
                    const lWidgetElm = document.getElementById(lWidgetId);
                    lWidgetElm.innerHTML = '';
                    $scope.widget = undefined;
                    $scope.showContentWidget();
                },500);
            });

            $scope.showContentWidget = function(){
                if($scope.widget != undefined) return;
                const lRect = $element[0].parentElement.getBoundingClientRect();
                const lWidgetId = 'll-widget-' + $scope.$id;
                const lWidgetElm = document.getElementById(lWidgetId);

                const lOptions = {
                    lat: $scope.model.location.latitude,
                    lng: $scope.model.location.longitude,
                    locale: 'fr',
                    designId: 'll-2019',
                    maxInnerWidth: lRect.width
                };
                
                $element[0].style.maxWidth = lRect.width + 'px';
                $element[0].style.overflow = 'hidden';

                lWidgetElm.style.height = (Math.max(lRect.height, 560)) + 'px';
                console.log('llContentWidget/showcontentWidget', lWidgetId, lOptions);

                $scope.widget = new locallogic.LocalContent(lWidgetId, lOptions);
                console.log('llWidget', $scope.widget);
            }
        }
    }
});

siApp
.directive('llDemographicsWidget', function(){
    return {
        restrict: 'E',
        template: '<div class="locallogic-demographics-widget-container"></div>',
        replace: true,
        link: function($scope, $element, $attrs){
            const lWidgetElm = document.createElement('DIV');
            lWidgetElm.setAttribute('id','ll-widget-' + $scope.$id);
            lShadow = $element[0].attachShadow({mode: 'closed'});
            
            lShadow.append(lWidgetElm);
        },
        controller: function($scope, $rootScope, $q, $element, $http, $siConfig){
            $scope.$on('si/model:ready', function(){
                $scope.token = $siConfig._data.active_addons.locallogic.configs.sdk_token;

                $scope.fetchData().then(function($data){
                    $scope.showContentWidget($data);
                })
            });

            // $scope.$on('siDataAccordeon/neighborhood:open', function(){
            //     $scope.showContentWidget();
            // });

            // $scope.$on('siMediaBox/si-display-map', function(){
            //     $scope.showContentWidget();
            // });

            $scope.showContentWidget = function($data){
                if($scope.widget != undefined) return;
                const lRect = $element[0].getBoundingClientRect();
                const lWidgetId = 'll-widget-' + $scope.$id;

                console.log('llDemographicsWidget/showContentWidget', $data);
            }

            $scope.fetchData = function(){
                return $q( function($resolve, $reject){
                    $http({
                        method: 'GET',
                        url: 'https://api.locallogic.co/v2/demographics',
                        params: {
                            lat: $scope.model.location.latitude,
                            lng: $scope.model.location.longitude,
                            lang: siCtx.locale,
                            key: $scope.token
                        }
                    }).then(
                        function success($response){
                            console.log($response);
                            if($response.status == 200){
                                $resolve($response.data);
                            }
                            else{
                                $reject($response);
                            }
                        },
                        function fail($err){
                            $reject($err);
                        }
                    );
                });
            }
        }
    }
});

function siInitLocallogic () {
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
            designId: 'll-2019',
        };

        locallogic.LocalContent(lWidgetId, lOptions);
    }
    
    Array.from(document.querySelectorAll('.locallogic-content-widget')).forEach(function($element,$index){
        const lWidgetId = 'll-widget-' + $index;
        $element.setAttribute('id',lWidgetId);  
        fnApplyWidget($element);
    });

}
