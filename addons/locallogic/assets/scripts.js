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
        controller: function($scope, $rootScope, $q, $element){
            $scope.$on('si/model:ready', function(){
                //$scope.showContentWidget();
            });

            $scope.$on('siDataAccordeon/neighborhood:open', function(){
                $scope.showContentWidget();
            })

            $scope.showContentWidget = function(){
                if($scope.widget != undefined) return;
                const lRect = $element[0].getBoundingClientRect();
                const lWidgetId = 'll-widget-' + $scope.$id;
                const lOptions = {
                    lat: $scope.model.location.latitude,
                    lng: $scope.model.location.longitude,
                    locale: 'fr',
                    designId: 'll-2019',
                };
                $element[0].style.maxWidth = lRect.width + 'px';
                console.log('llContentWidget/showcontentWidget', lWidgetId, lOptions);

                $scope.widget = new locallogic.LocalContent(lWidgetId, lOptions);
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
