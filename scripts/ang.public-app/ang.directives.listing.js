siApp
.directive('siCalculator', function siCalculator(){
    return {
        restrict: 'E',
        scope: {
            amount: '=siAmount',
            dictionary: '=?siDictionary',
            downpayment_selection: '@?siDownpaymentSelection',
            region: '@?siRegion',
            cityCode: '@?siCity',
            on_change: '&onChange'
        },
        controllerAs: 'ctrl',
        replace:true,
        templateUrl: siCtx.base_path + 'views/ang-templates/si-calculator.html?v=2',
        controller: function($scope, $q,$rootScope) {
            $scope.downpayment_selection = 'manual';
            
            $scope.data = {
                amount:0,
                amortization:25,
                downpayment: 20,
                interest: 3,
                frequency: 26,
                downpayment_method : 'percent'
            }
            $scope.frequencies = {
                '12' : 'Monthly',
                '26' : 'Every two weeks',
                '52' : 'Weekly'
            }
            $scope.init = function(){
                $scope.preload();
    
                $scope.data.amount = $scope.amount;
                $scope.process();
            }
    
            $scope.changeDownpaymentMethod = function($value){
                if($value != $scope.data.downpayment_method){
                    $scope['convertDownpaymentTo_' + $value]();
                    $scope.data.downpayment_method = $value;
    
                    $scope.process();
                }
            }
    
            $scope.convertDownpaymentTo_cash = function(){
                let lResult = 0;
    
                lResult = Math.round($scope.data.amount * ($scope.data.downpayment / 100));
    
                $scope.data.downpayment = lResult;
            }
    
            $scope.convertDownpaymentTo_percent = function(){
                let lResult = 0;
    
                lResult = Math.round(100 / ($scope.data.amount / $scope.data.downpayment));
    
                $scope.data.downpayment = lResult;
            }
    
            $scope.setFrequency = function($value){
                $scope.data.frequency = $value;
    
                $scope.process();
            }
    
            $scope.process = function(){
                if($scope.downpayment_selection=='manual'){
                    $scope.process_single();
                }
                else{
                    $scope.process_multi();
                }
    
                $scope.save();
            }
    
            $scope.process_single = function(){
                
                // init branch
                let lBranch = {
                    downpayment: 0,
                    insurance: 0,
                    mortgage: 0,
                    amortization: $scope.data.amortization,
                    rate: $scope.data.interest,
                    frequency: $scope.data.frequency,
                    frequency_caption : $scope.frequencies[$scope.data.frequency],
                    payment: 0
                }
                let lRatio = $scope.data.downpayment_method == 'percent' ? 
                                $scope.data.downpayment / 100 : 
                                ($scope.data.downpayment / $scope.data.amount);
                //console.log('ratio', lRatio);
                $scope.process_branch(lBranch, lRatio);
    
                let lResult = {
                    mortgage : lBranch,
                    transfer_tax : $scope.getTransferTax($scope.data.amount,$scope.region=='06 ')
                }
    
                $rootScope.$broadcast('si-mortgage-calculator-result-changed', lResult);
                
                if(typeof($scope.on_change) == 'function'){
                    $scope.on_change({'$result' : lResult});
                }
    
                //console.log('processing triggered', lResult);
            }
    
            $scope.process_branch = function (branch, downpayment_ratio) {
                branch.downpayment = getDownPayment($scope.data.amount, downpayment_ratio) + 0.000001;
                branch.insurance = getMortgageInsurance($scope.data.amount, downpayment_ratio);
                branch.mortgage = $scope.data.amount - branch.downpayment + branch.insurance;
                
                const PrValue = branch.mortgage;  //Number($("input[name=calPropertyCost]").val()) - Number($("input[name=calCash]").val());
                const IntRate = branch.rate / 100; //Number($("input[name=calInterest]").val()) / 100;
                const Period = branch.amortization; //Number($("input[name=calAmortizationPeriod]").val());
                const PPay = branch.frequency; //Number($("input[name=calFreq]").val());
    
                const intcandebase = Math.pow((1 + IntRate / 2), (2 / PPay)) - 1;
                const paymperiobase = (PrValue * intcandebase) / (1 - (1 / Math.pow((1 + intcandebase), (Period * PPay))));
                branch.payment = paymperiobase;
            };
    
            getDownPayment = function (price, downpayment_ratio) {
                return price * downpayment_ratio;
            };
    
            getMortgageInsurance = function (price, downpayment_ratio) {
                //  EDIT:   remove insurance offset because it's not shown 
                //          and insurance are calculated on fixed downpayment ratio
                //          We should correct it by including range or get a real 
                //          algorithm
                return 0;
                let lResult = price - (price * downpayment_ratio);
                switch (downpayment_ratio) {
                    case 0.05:
                        lResult = lResult * 0.036;
                        break;
                    case 0.10:
                        lResult = lResult * 0.024;
                        break;
                    case 0.15:
                        lResult = lResult * 0.018;
                        break;
                    case 0.20:
                        lResult = lResult * 0;
                        break;
                }
                return lResult;
            };
    
            $scope.getTransferTax = function (amount, in_montreal) {
                in_montreal = (typeof (in_montreal) == 'undefined') ? false : in_montreal;
                parts = [];
                const lBoundaries = $scope.getTransferTaxBoundaries($scope.cityCode);
                //console.log('transferTax',$scope.cityCode, lBoundaries);
                //console.log('in montreal', in_montreal);
                
                let rates = lBoundaries.rates;
                let bounds = lBoundaries.bounds;
                // let lAmountRaw = $("#purchase_price").val();
                
                // let amount = me.devise(parseFloat(lAmountRaw.replace(/ /g,'')));
                let taxemutation = 0;
                for (i=0; i<rates.length; i++) {
                    if(amount <= 0) continue;

                    const lRemovedAmount = (i==0) ? Math.min(bounds[i],amount) : Math.min(bounds[i] - bounds[i-1],amount);
                    taxemutation = taxemutation + lRemovedAmount*rates[i];
                    amount = amount - lRemovedAmount;
                    //console.log('step',i,':', lRemovedAmount,'x',rates[i]*100,'% =', lRemovedAmount*rates[i], '(',taxemutation,') still have', amount, '$ to process' )
                }

                return Math.round(taxemutation);
            };
            
            $scope.getTransferTaxBoundaries = function($cityCode){
                
                const defaultBoundaries = {code: 'default', rates: [0.005,0.01,0.015], bounds : [50900,254400,99000000]};
                if($cityCode == undefined) return defaultBoundaries;
                
                const citiesBoundaries = [
                    {code: '93042', name:'Alma', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '73005', name:'Boisbriand', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '59005', name:'Boucherville', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.02]},
                    {code: '58005', name:'Brossard', bounds:[50900,254400,750000,1000000,99000000],rates:[0.005,0.01,0.015,0.02,0.025]},
                    {code: '57005', name:'Chambly', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.025]},
                    {code: '67050', name:'Châteauguay', bounds:[50900,254400,505200,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '49057', name:'Drummondville', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.025]},
                    {code: ["46085", "46112"], name:'Farnham', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.0225]},
                    {code: '66100', name:'Kirkland', bounds:[50900,254400,500000,1000000,99000000],rates:[0.005,0.01,0.015,0.02,0.025]},
                    {code: '60028', name:'L\'assomption', bounds:[50900,254400,508700,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: ["65101", "65102", "65103", "65104", "65105", "65106", "65107", "65108", "65109", "65110", "65111", "65112", "65113"], name:'Laval', bounds:[50900,254400,500000,1000000,99000000],rates:[0.005,0.01,0.015,0.02,0.025]},
                    {code: ["25214", "25215", "25216"], name:'Lévis', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: ["58015", "58020", "58227"], name:'Longueuil', bounds:[50900,254400,508699,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '73025', name:'Lorraine', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '64015', name:'Mascouche', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '57035', name:'Mont-Saint-Hilaire', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: ["66020", "66030", "66040", "66057", "66065", "66070", "66075", "66085", "66125", "66130", "66140", "66150", "66501", "66505", "66506", "66507", "66508", "66509", "66511", "66516"], name:'Montréal', bounds:[50900,254400,508700,1017400,99000000],rates:[0.005,0.01,0.015,0.02,0.025]},
                    {code: '78102', name:'Mont-Tremblant', bounds:[50900,254400,503500,1007000,99000000],rates:[0.005,0.01,0.015,0.02,0.025]},
                    {code: '77050', name:'Morin-Heights', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.025]},
                    {code:  ["60010", "60013"], name:'Repentigny', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '10043', name:'Rimouski', bounds:[50900,254400,505100,757700,1010300,99000000],rates:[0.005,0.01,0.015,0.02,0.025,0.03]},
                    {code: '75005', name:'Saint-Colomban', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '72005', name:'Saint-Eustache', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.025]},
                    {code: '56083', name:'Saint-Jean-Sur-Richelieu', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '59010', name: 'Sainte-Julie', rates: [0.005,0.01,0.015 ,0.025], bounds : [50900,254400,500000,99000000]},
                    {code: '87120', name:'Saint-Lambert', bounds:[50900,254400,500000,1000000,99000000],rates:[0.005,0.01,0.015,0.02,0.025]},
                    {code: '77040', name:'Saint-Sauveur', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: ["43010", "43020", "43023", "43024", "43025", "43030"], name:'Sherbrooke', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '53052', name:'Sorel-Tracy', bounds:[50900,254400,500000,700000,900000,99000000],rates:[0.005,0.01,0.015,0.02,0.025,0.03]},
                    {code: ["64005", "64008", "64020"], name:'Terrebonne', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.03]},
                    {code: '37067', name:'Trois-Rivières', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.02]},
                    {code: '78010', name:'Val David', bounds:[50900,254400,500000,99000000],rates:[0.005,0.01,0.015,0.02]}
                ];
                
                const lBoundedCity = citiesBoundaries.find(function($e){ 
                    if(Array.isArray($e.code)){
                        return $e.code.includes($cityCode.toString());
                    }
                    return $e.code == $cityCode
                });

                if(lBoundedCity != null) return lBoundedCity;
                return defaultBoundaries;
            }

            $scope.preload = function(){
                let lData = sessionStorage.getItem('si.mortgage-calculator');
                if(lData != null){
                    $scope.data = JSON.parse(lData);
                }
            }
    
            $scope.save = function(){
                sessionStorage.setItem('si.mortgage-calculator', JSON.stringify($scope.data));
            }
    
            // watch for amount to be valid then init directive
            $scope.$watch("amount", function(){
                if($scope.amount!=null){
                    $scope.init();
                }
            });
    
            
        }
    };
});



siApp
.directive('siFavoritesButton', [function siFavoritesButton(){
    return {
        restrict: 'E',
        templateUrl: siCtx.base_path + 'views/ang-templates/si-favorites-button.html',
        replace: true,
        link: function($scope, $element, $attr){
            $scope.init($element);
        },
        controller: function($scope,$rootScope, $siFavorites, $timeout){
            $scope.favorites = $siFavorites;
            $scope._panel_elm = null;
            $scope._elm = null;
            $scope._button_elm = null;

            $scope.init = function($element){
                $scope._elm = $element[0];
                $scope._button_elm = $scope._elm.querySelector('.si-favorites-toggle-button');
                const lPanel = $scope._elm.querySelector('.si-favorites-panel');

                const lButtonRect = $scope._button_elm.getBoundingClientRect();
                lPanel.style.setProperty('--origin-y', lButtonRect.top + ( lButtonRect.height/2) + 'px');
                lPanel.style.setProperty('--origin-x',  lButtonRect.left + ( lButtonRect.width/2) + 'px');

                angular.element(document.body).on('click', function(){
                    $scope.closePanel();
                });

            }

            $scope._favorite_filter = null;
            
            $scope.getFavoriteFilter = function(){
                const lListingsRefNumbers = $siFavorites.getValues();
                if($scope._favorite_filter == null || $scope._favorite_filter.value.length != lListingsRefNumbers.length){
                    $scope._favorite_filter = {
                        field: 'ref_number',
                        operator: 'in',
                        value : lListingsRefNumbers
                    };
                }
                return $scope._favorite_filter;
            }

            $scope.togglePanel = function($event){
                $event.preventDefault();
                
                if($scope._panel_elm == null){
                    $scope._panel_elm = $scope._elm.querySelector('.si-favorites-panel');
                    angular.element('body').append($scope._panel_elm);

                    angular.element($scope._panel_elm).on('click', function($event){
                        //$event.preventDefault();
                        $event.stopPropagation();
                    })
                }
                
                if(!$scope._panel_elm.classList.contains('opened')){
                    $event.stopPropagation();
                    $rootScope.$broadcast('close-everything');
                    $scope.list = $siFavorites.favorites
                    
                    $timeout(function(){
                        $scope._panel_elm.classList.add('opened');
                        $rootScope.$broadcast('si-list-loaded');
                    },100)
                }
                else{
                    $scope.closePanel();
                }

                
            }

            $scope.closePanel = function(){
                if($scope._panel_elm == null) return;

                $scope._button_elm.classList.remove('panel-opened');
                $scope._panel_elm.classList.remove('opened');
            }

            $scope.removeFromList =function($event, $item){
                console.log('removeFromList');
                $event.preventDefault();
                $event.stopPropagation();

                $siFavorites.toggle($item);
            }
        }
    }
}])



siApp
.directive('siImageSlider', function siImageSlider(){
    return {
        restrict: 'E',
        scope: {
            pictures: '=siPictures',
            dictionary: '=?siDictionary',
            gap: '@siGap',
            index: '=?siIndex',
            showGrid: '=siShowPictureGrid'
        },
        controllerAs: 'ctrl',
        replace:true,
        templateUrl: siCtx.base_path + 'views/ang-templates/si-image-slider.html?v=3',
        link: function (scope, element, attrs) {
            scope.$element = element[0];
            var mc = new Hammer(element[0]);
            let lPanHndl = null;
            scope.init();
        },
        controller: function ($scope,$rootScope, $q,$siApi,$rootScope,$siDictionary, $siHooks, $siUtils,$timeout) {
            $scope.expand_mode = false;
            $scope.picture_grid_mode = false;
            
            $scope.position = {
                current_picture_index : 0
            };
    
            $scope.init = function($element){
                $scope.index = 0;   
                
                $scope.$on('thumbnails-slider-select', function($event, $picture){
                    const lIndex = $scope.pictures.findIndex(function($e){return $e.url == $picture.url});
                    $scope.set(lIndex,false);
                });
    
                if($scope.pictures){
                    // if($siUtils.isLegacyBrowser()){
                    //     const jqElm = jQuery($scope.$element)
                    //     jqElm.find('.viewport .trolley').width(jqElm.width() * $scope.pictures.length);
                    //     window.setTimeout(function(){
                            
                    //         jqElm.find('.viewport .trolley .item').each(function($i,$e){
                    //             jQuery($e).width(jqElm.width());
                    //         })
                    //     },200);
                    // }
                    
                }
                $scope.$on('container-resize', function(){
                    console.log('container-resize');
                    $scope.detectBoxSize();
                })
                let lWindowResizeDebounce = null;
                window.addEventListener('resize', function(){
                    if(lWindowResizeDebounce!=null){
                        window.clearTimeout(lWindowResizeDebounce);
                    }
                    lWindowResizeDebounce = window.setTimeout(function(){
                        $scope.detectBoxSize();
                        lWindowResizeDebounce=null;
                    }, 500);
                    
                });
                document.addEventListener('fullscreenchange', function(){
                    //console.log('fullscreen change', document.fullscreenElement)
                    if(document.fullscreenElement == null){
                        $timeout(function() {
                            $scope.expand_mode = false;
                            
                        });
                    }
                    $scope.detectBoxSize();
                })

                $timeout(function(){
                    $scope.detectBoxSize();
                })

            }
    
            $scope.next = function(){
                
                //console.log($scope.index, '/', $scope.pictures.length-1);
                let lNewIndex = $scope.index+1;
                if(lNewIndex >=  $scope.pictures.length){
                    lNewIndex= 0;
                }
                $scope.set(lNewIndex);
            }
    
            $scope.previous = function(){
                let lNewIndex = $scope.index-1;
                if(lNewIndex ==  -1){
                    lNewIndex= $scope.pictures.length-1;
                }
                $scope.set(lNewIndex);
            }
    
            $scope.set = function($index, $triggerEvents){
                $triggerEvents = typeof $triggerEvents == 'undefined' ? true : $triggerEvents;
                $scope.index = $index;
                const lViewport = $scope.$element.querySelector('.viewport');
                const lViewportWidth =lViewport.getBoundingClientRect().width;
                if(window.innerWidth <= 640){
                    
                    lViewport.scrollTo($index * lViewportWidth,0);
                    return;
                }
    
                $scope.picture_grid_mode =false;
                
                $scope.updateTrolley();
    
                if($triggerEvents){
                    const lItem = $scope.pictures[$index];
                    $rootScope.$broadcast('mediabox-picture-select', lItem);
                }
    
                try{
                    $scope.$digest();
                }catch($e){}
    
            }
    
    
            $scope.toggleExpand = function(){
                $scope.expand_mode = !$scope.expand_mode;
            }
    
            $scope.getPosition = function(){
                return '-' + ($scope.position.current_picture_index * 100) + '%';
            }
    
            // watch for alias to be valid then init directive
            $scope.$watch("pictures", function(){
                if($scope.pictures!=null){
                    $scope.init();
                }
            });
    
            $scope.toggleFullscreen = function(){
                if (
                    document.fullscreenElement ||
                    document.webkitFullscreenElement ||
                    document.mozFullScreenElement ||
                    document.msFullscreenElement
                  ) {
                    if (document.exitFullscreen) {
                      document.exitFullscreen();
                    } 
                    else if (document.mozCancelFullScreen) {
                      document.mozCancelFullScreen();
                    } 
                    else if (document.webkitExitFullscreen) {
                      document.webkitExitFullscreen();
                    } 
                    else if (document.msExitFullscreen) {
                      document.msExitFullscreen();
                    }
    
                    $scope.expand_mode = false;
                    console.log('exit fullscreen');
                  } 
                  else {
                    if ($scope.$element.requestFullscreen) {
                      $scope.$element.requestFullscreen();
                    } 
                    else if ($scope.$element.mozRequestFullScreen) {
                      $scope.$element.mozRequestFullScreen();
                    } 
                    else if ($scope.$element.webkitRequestFullscreen) {
                      $scope.$element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                    } 
                    else if ($scope.$element.msRequestFullscreen) {
                      $scope.$element.msRequestFullscreen();
                    }
                    console.log('enter fullscreen');
                    $scope.expand_mode = true;
                  }
    
                
            }
    
            $scope.togglePictureGrid = function(){
                $scope.picture_grid_mode = !$scope.picture_grid_mode;
            }
    
            $scope.getImageAlt = function($img){
                const lCaption = $siDictionary.getCaption({src:$img, key:'category_code'},'photo_category');
                const lResult = $siHooks.filter('listing-picture-alt', lCaption, $img);
    
                return lResult;
            }
    
            $scope.getImageCaption = function($img){
                const lCaption = $siDictionary.getCaption({src:$img, key:'category_code'},'photo_category');
                const lResult = $siHooks.filter('listing-picture-caption', lCaption, $img);
    
                return lResult;
            }
    
            $scope.updateTrolley = function(){
                return;
            }
    
            $scope.getTrolleyStyle = function(){
                if($scope.pictures == null) return {};
    
                return '--item-count:' + $scope.pictures.length + ';--item-index:' + $scope.index;
            }

            $scope.detectBoxSize = function(){
                const lElm = $scope.$element;
                
                const lElmRect = lElm.getBoundingClientRect();
                
                lElm.style.setProperty('--viewport-width', lElmRect.width + 'px');
                lElm.style.setProperty('--viewport-height', lElmRect.height + 'px');
                
                if($siUtils.isLegacyBrowser()){
                    const lPictures = Array.from(lElm.querySelectorAll('.viewport .trolley .item'));
                    lPictures.forEach(function($p){
                        $p.style.width = lElmRect.width + 'px';
                    })
                }
            }
        }
    };
});



siApp
.directive('siListingNavigation', ['$q',function siListingNavigation(){
    return {
        restrict: "E",
        replace: true,
        transclude: true,
        scope:{
            current : '=siCurrent',
            display : '@siDisplay',
            panelTitle: '@?siTitle'
        },
        templateUrl: siCtx.base_path + 'views/ang-templates/si-listing-navigation.html?v=2',
        link: function($scope, element, attr){
            $scope.init();
        },
        controller: function($scope, $rootScope) {
            $scope.list = [];
            $scope.previous = null;
            $scope.next = null;

            $scope.init = function(){
                
            }

            $scope.$watch('current',function($new,$old){
                if($new != null){
                    $scope.getNextAndPrevious();
                }
            })

            $scope.loadList = function(){
                let lList = sessionStorage.getItem('si.list.listings.{0}'.format(siCtx.locale));
                if(lList != undefined){
                    lList = JSON.parse(lList);
                }
                else{
                    lList = [];
                }
                return lList;
            }

            $scope.getNextAndPrevious = function(){
                const lList = $scope.loadList();
                let lCurrentIndex = lList.findIndex(function($e){
                    return $e.id == $scope.current;
                });

                const lResult = Array.from(Array(2));
                if(lCurrentIndex>0){
                    lResult[0] = lList[lCurrentIndex-1];
                    
                }
                if(lCurrentIndex < lList.length-1){
                    lResult[1] = lList[lCurrentIndex+1];
                    
                }

                $scope.list = lResult;
            }
        }
    };
}]);



siApp
.directive('siMap', function siMap( $siTemplate, $siUtils, $siDictionary,$siHooks,$siConfig){
    const dir_controller = 
    function($scope, $q, $siApi, $rootScope){
        $scope.ready = false;
        $scope.is_visible = false;
        $scope.zoom = 8;
        $scope.is_loading_data = false;
        $scope.late_init = true;
        $scope.markers = [];
        $scope.markerCluster = null;
        $scope.bounds = null;
        $scope.client = {
            search_token : null
        };

        $scope.permalink = '';

        $scope.$onInit = function(){
            if($scope.latlng!=null){
                $scope.$on('si-display-map', $scope.display);
                //$scope.mapInit();
            }
            else{
                $scope.$on('si-{0}-display-switch-map'.format($scope.alias), $scope.onSwitchToMap);
                $scope.$on('si-{0}-display-switch-list'.format($scope.alias), $scope.onSwitchToList);
            }

            $rootScope.$on($scope.alias + 'FilterTokenChanged', $scope.onFilterTokenChanged);
        }

        $scope.display = function(){
            $scope.mapInit();
        }

        $scope.mapInit = function(){
            if(typeof google == 'undefined') {console.error('google map object is undefined');return;}

            return $q(function($resolve, $reject){   
                $siConfig.get().then(function($config){
                    if($scope.ready == false){
                        //console.log('Map init', $config, $scope.zoom);
                        
                        let options = {
                            center: new google.maps.LatLng(45.6025503,-73.8469538),
                            zoom: Number($scope.zoom),
                            //disableDefaultUI: true    
                        }

                        if($config.map_style){
                            try {
                                const lParsedMapStyle = JSON.parse($config.map_style);
                                if(lParsedMapStyle) options.styles = lParsedMapStyle;    
                            } catch (error) {
                                
                            }
                            
                        }
                        
                        //console.log('map options', options);

                        $scope.map = new google.maps.Map(
                            $scope.viewport_element, options
                        );

                        $scope.ready = true;
                        $resolve();
                    }
                    else{
                        $resolve();
                    }
                });  
            })
        }

        $scope.setZoom = function($zoom){
            if(isNaN($zoom)) return;

            $scope.map.setZoom($zoom);
        }

        /**
         * Main entry function to get the list
         * Will update the searchToken if required by client overrides
         */
        $scope.getList = function(){
            if($scope.is_loading_data==false){
                $scope.search($scope.getSearchToken());
            }
        }

        /**
         * Get the search token
         * Request a new one if client has input some filters or sort of his own
         */
        $scope.getSearchToken = function(){
            if($scope.client.search_token != null){
                return $scope.client.search_token;
            }
            return $scope.configs.search_token;
        }

        $scope.onFilterTokenChanged = function($event, $newToken){
            $scope.client.search_token = $newToken;
            $scope.isReady().then(function(){
                //console.log('update list from token changed');
                $scope.getList();
            })
        }
        $scope.onSwitchToMap = function(){
            $scope.mapInit().then(function(){
                if($scope.bounds){
                    //console.log('fit to bounds', $scope.bounds);
                    window.setTimeout(function(){
                        $scope.map.fitBounds($scope.bounds);
                    }, 250);
                }
                if($scope.markers.length==0){
                    $scope.getList();
                }
                $scope.is_visible = true;
            });
        }
        $scope.onSwitchToList = function(){
            
            $scope.is_visible = false;
        }

        /**
         * Call the API and return the list 
         * @param {string} $token Search token
         */
        $scope.search = function($token){
            lParams = {'st': $token};
            $scope.page_index = 0;
            $scope.is_loading_data = true;
            $siApi.api($scope.getEndpoint() + 'map_markers', lParams,{method:'GET'}).then(function($response){
                $scope.list = $response.markers;
                $scope.updateMarkerList()
                //console.log('marker list:', $scope.list);
                $rootScope.$broadcast('si-listings-update',$scope.list,{item_count: $scope.list.length});
                $scope.is_loading_data = false;
            })
            
        }
        
        /**
         * Get the api endpoint matching the config type
         */
        $scope.getEndpoint = function(){
            let lOrigin = $scope.getEndpointType();
            return lOrigin.concat('/view/',$scope.configs.source.id,'/');
        }

        $scope.getEndpointType = function(){
            let lResult = $scope.configs.type;
            switch(lResult){
                case 'listings':
                    lResult = 'listing';break;
                case 'brokers':
                    lResult = 'broker';break;
                case 'cities':
                    lResult = 'city';break;
            }
            return lResult;
        }

        $scope.clear = function(){
            if($scope.markers){
                $scope.markers.forEach(function($m){
                    $m.setMap(null);
                });
            }

            if($scope.markerCluster != null){
                $scope.markerCluster.clearMarkers();
            }
            $scope.markers = [];
        }

        $scope.addSingleMarker = function($location) {
            //console.log('adding single marker at', $location);
            
            $scope.clear();
            $scope.markers.push(new google.maps.Marker({
                map: $scope.map,
                position: $location,
                animation: google.maps.Animation.DROP
            }));
            $scope.map.setCenter($location);
        }

        $scope.updateMarkerList = function(){
            $scope.clear();
            $scope.bounds = new google.maps.LatLngBounds();
            const lPoints = [];

            //console.log($scope.list[0]);
            $siConfig.get().then(function($configs){
                const lListConfig = $configs.lists.find(function($e) {return $e.alias==$scope.alias});
                const lDefaultZoom = lListConfig.default_zoom_level || 'auto';
                const lSmartFocusTolerance = lListConfig.smart_focus_tolerance || 5;

                $scope.list.forEach(function($marker){
                    let lngLat = new google.maps.LatLng($marker.latitude, $marker.longitude);
                    const lMarkerClass = ['map-marker-icon',$marker.category_code.replace(' ','_')];
                    if($marker.status_code != undefined){
                        lMarkerClass.push($marker.status_code.toLowerCase());
                    }
                    222222222222222222222222222222222
                    $marker.marker = new SiMarker({
                        position: lngLat,
                        map: $scope.map,
                        obj: $marker,
                        markerClass: lMarkerClass,
                        onPinClick: $scope.pinClick
                    });
                    
                    $scope.markers.push($marker.marker);
                    const lLngLat = $marker.marker.getPosition();
                    lPoints.push({x: lLngLat.lat(), y: lLngLat.lng(), lngLat: lLngLat});
                    //$scope.extendBounds($scope.bounds, lLngLat);
                });

                if(lSmartFocusTolerance != 'off'){
                    
                    //console.log('points', angular.copy(lPoints));
                    const lXMed = $scope.median(lPoints.map(function($p) {return $p.x}));
                    const lYMed = $scope.median(lPoints.map(function($p) {return $p.y}));
                    let lXAvg = (lPoints.reduce(function ($sum, $p){ return ($sum+Math.abs(lXMed - $p.x))}, 0) / lPoints.length);
                    let lYAvg = (lPoints.reduce(function ($sum, $p){ return ($sum+Math.abs(lYMed - $p.y))}, 0) / lPoints.length);

                    if(lSmartFocusTolerance > 0){
                        const lLatDegKm = 110.574;
                        const lLngDegKm = 111.320;
                        const deg2rad = function($deg) {return ($deg*Math.PI)/180};

                        lXAvg = lXAvg + (lSmartFocusTolerance / lLatDegKm);
                        lYAvg = lYAvg + ((lSmartFocusTolerance / lLngDegKm) / Math.cos(deg2rad(lYAvg)));
                    }
                    
                    const lMedianRect = {
                        x: lXMed - lXAvg, x_prime: lXMed + lXAvg,
                        y: lYMed - lYAvg, y_prime: lYMed + lYAvg,
                        contains: function($x, $y){
                            //console.log($x, $y, 'contained in ', this);
                            return ($x > this.x && $x < this.x_prime) &&
                                    ($y > this.y && $y < this.y_prime)
                        }
                    }
                

                    
                    lPoints
                        .filter(function($p) {return lMedianRect.contains($p.x,$p.y)} )
                        .forEach(function($p) {$scope.bounds.extend($p.lngLat)})
                
                }
                else{
                    lPoints
                        .forEach(function($p){$scope.bounds.extend($p.lngLat)})
                }
                    
                if($scope.list.length>1){
                    let lImagePath = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m';
                    let lClustererOptions = {
                        //cssClass : 'siMarkerCluster',
                        gridSize: 80,
                        styles: [{
                            url: lImagePath + '1.png',
                            height: 53,
                            width: 54,
                            anchor: [0, 0]
                        }, {
                            url: lImagePath + '2.png',
                            height: 56,
                            width: 55,
                            anchor: [0, 0]
                        }, {
                            url: lImagePath + '3.png',
                            width: 66,
                            height: 65,
                            anchor: [0, 0]
                        }]
                    };

                    lClustererOptions = $siHooks.filter('marker_cluster_options',lClustererOptions);

                    $scope.markerCluster = new MarkerClusterer($scope.map, $scope.markers, lClustererOptions);
                    
                    if($scope.is_visible == true){
                        
                        window.setTimeout(function(){
                            
                            $scope.map.fitBounds($scope.bounds);

                            if(lDefaultZoom != 'auto'){
                                $scope.map.setZoom(Number(lDefaultZoom));
                            }
                        },250);
                        
                    }
                }
                else if ($scope.list.length>0){
                    $scope.map.setCenter($scope.list[0].marker.getPosition());
                    
                    if(lDefaultZoom != 'auto'){
                        $scope.map.setZoom(Number(lDefaultZoom));
                    }
                    else{
                        $scope.map.setZoom(12);
                    }
                }
            });
            //console.log('Map markers updated');
        }

        $scope.median = function(values){
            values.sort(function(a,b){
              return a-b;
          });
          var half = Math.floor(values.length / 2);
          
          if (values.length % 2)
              return values[half];
          else
              return (values[half - 1] + values[half]) / 2.0;
        }

        $scope.extendBounds = function($bounds, $lngLat){

            $bounds.extend($lngLat);
        }

        $scope.pinClick = function($marker){
            //console.log('Marker clicked', $marker);

            $siApi.api($scope.getEndpoint().concat('/',siApiSettings.locale,'/items/',$marker.obj.id)).then(function($response){
                let lInfoWindowScope = $siUtils;
                $siDictionary.source = $response.dictionary;

                lInfoWindowScope.compileListingItem($response);
                lInfoWindowScope.item = $response;

                //console.log('lInfoWindowScope',lInfoWindowScope);
                $siTemplate.load('views/ang-templates/si-map-info-window.html?v=2', lInfoWindowScope).then(function($content){
                    let infowindow = new google.maps.InfoWindow({
                        content: $content
                    });
                    
                    infowindow.open($scope.map, $marker);
                });

            });

            
        }



        $scope.isReady = function(){
            let lPromise = $q(function($resolve,$reject){
                if($scope.ready==true){
                    $resolve();
                }
                else{
                    $scope.$watch('ready', function(){
                        if($scope.ready==true){
                            $resolve();
                        }
                    });
                }
            
            });

            return lPromise;
        }

        $scope.$watch('latlng', function(){
            if($scope.latlng != null && $scope.latlng.lat!=undefined){
                //console.log('latlng', $scope.latlng);
                $scope.isReady().then(function(){
                    $scope.addSingleMarker($scope.latlng);
                });
            }
        });

        $scope.$watch('zoom', function(){
            if($scope.zoom != null){
                $scope.isReady().then(function(){
                    $scope.setZoom(Number($scope.zoom));
                });
            }
        });


        function SiMarker(options) {

            // Initialize all properties.
            this.latlng_ = options.position;
            this.markerClass = options.markerClass;
            this.onClick = options.onPinClick;
            this.obj = options.obj;
            // Define a property to hold the image's div. We'll
            // actually create this div upon receipt of the onAdd()
            // method so we'll leave it null for now.
            this.div_ = null;
            this.title = options.title;
  
            // Explicitly call setMap on this overlay.
            this.setMap(options.map);
        }
        if( typeof(google) != 'undefined'){
            SiMarker.prototype = new google.maps.OverlayView();
            (function($proto){
                $proto.draw = function() {
                    var me = this;
                    var div = this.div_;
                    

                    var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
                    if (point) {
                    div.style.left = point.x + 'px';
                    div.style.top = point.y + 'px';
                    }
                };
                
                $proto.onAdd = function() {
                    var me = this;
                    div = this.div_ = document.createElement('DIV');
                    div.style.border = "none";
                    div.style.position = "absolute";
                    div.style.paddingLeft = "0px";
                    div.style.cursor = 'pointer';
                    //you could/should do most of the above via styling the class added below
                    this.markerClass.forEach(function($c){
                        div.classList.add($c.toLowerCase());
                    })
                                    
                    google.maps.event.addDomListener(div, "click", function(event) {

                        if(typeof(me.onClick)=='function'){
                            me.onClick(me);
                        }
                        //google.maps.event.trigger(me, "click");
                    });

                    var panes = this.getPanes();
                    panes.overlayImage.appendChild(div);
                };
                
                $proto.onRemove = function() {
                    if(this.div_ != null){
                        this.div_.parentNode.removeChild(this.div_);
                        this.div_ = null;
                    }
                };

                // Set the visibility to 'hidden' or 'visible'.
                $proto.hide = function() {
                if (this.div_) {
                    // The visibility property must be a string enclosed in quotes.
                    this.div_.style.visibility = 'hidden';
                }
                };

                $proto.show = function() {
                if (this.div_) {
                    this.div_.style.visibility = 'visible';
                }
                };

                $proto.toggle = function() {
                if (this.div_) {
                    if (this.div_.style.visibility === 'hidden') {
                    this.show();
                    } else {
                    this.hide();
                    }
                }
                };

                $proto.getPosition = function(){
                    return this.latlng_;
                }

                // Detach the map from the DOM via toggleDOM().
                // Note that if we later reattach the map, it will be visible again,
                // because the containing <div> is recreated in the overlay's onAdd() method.
                $proto.toggleDOM = function() {
                if (this.getMap()) {
                    // Note: setMap(null) calls OverlayView.onRemove()
                    this.setMap(null);
                } else {
                    this.setMap(this.map_);
                }
                };

            })(SiMarker.prototype);
        }
    };


    return {
        restrict: 'E',
        replace: true,
        scope: {
            alias: '@siAlias',
            class: '@class',
            configs: '=?siConfigs',
            latlng: '=?latlng',
            zoom: '@'
        },
        controllerAs: 'ctrl',
        template: '<div><div id="map-{{alias}}" class="viewport"></div></div>',
        controller: dir_controller,
        link: function($scope, element){
            $scope.viewport_element = element.children()[0];
            $scope.$onInit();
        }
    };
});



siApp
.directive('siMediabox',[
function siMediabox(){
    return {
        restrict : 'E',
        scope : {
            model: '=siModel',
            defaultTab: '@siDefaultTab',
            tabs: '=siTabs',
            pictureListDisplay: '@siPictureListAs'
        },
        link: function ($scope,$elm, $attrs){
            $scope.init();
        },
        templateUrl: siCtx.base_path + 'views/ang-templates/si-mediabox.html?v=2',
        replace: true,
        controller : function($scope){
            $scope.selected_media = $scope.defaultTab || 'pictures';
            $scope.video_player = null;
            $scope._initialized = false;

            $scope.init = function(){
                const cFirstTab = $scope.tabs ? $scope.tabs[0] : 'pictures';
                $scope.selectMedia($scope.defaultTab || cFirstTab);

                $scope._initialized = true;
            }
        
            $scope.tabIsAvailable = function($name){
                if(!$scope.tabs) return true;

                return $scope.tabs.some(function($t) {return $t == $name});
            }

            $scope.selectMedia = function($media){
                $scope.selected_media = $media;
                
                const lTrigger = 'si-display-' + $media;
                //console.log('triggering', lTrigger);

                if($scope._initialized){
                    $scope.$broadcast(lTrigger);
                }
                else{
                    window.setTimeout(function(){
                        $scope.$broadcast(lTrigger);
                    },1000);
                }
                
                if($scope._initialized && $media!='video'){
                    $scope.callPlayer('video-player','stopVideo');
                }
            }
        
            $scope.callPlayer = function(frame_id, func, args) {
                if (window.jQuery && frame_id instanceof jQuery) frame_id = frame_id.get(0).id;
                var iframe = document.getElementById(frame_id);
                if (iframe && iframe.tagName.toUpperCase() != 'IFRAME') {
                    iframe = iframe.getElementsByTagName('iframe')[0];
                }
            
                // When the player is not ready yet, add the event to a queue
                // Each frame_id is associated with an own queue.
                // Each queue has three possible states:
                //  undefined = uninitialised / array = queue / 0 = ready
                if (!$scope.callPlayer.queue) $scope.callPlayer.queue = {};
                var queue = $scope.callPlayer.queue[frame_id],
                    domReady = document.readyState == 'complete';
            
                if (domReady && !iframe) {
                    // DOM is ready and iframe does not exist. Log a message
                    window.console && console.log('$scope.callPlayer: Frame not found; id=' + frame_id);
                    if (queue) clearInterval(queue.poller);
                } else if (func === 'listening') {
                    // Sending the "listener" message to the frame, to request status updates
                    if (iframe && iframe.contentWindow) {
                        func = '{"event":"listening","id":' + JSON.stringify(''+frame_id) + '}';
                        iframe.contentWindow.postMessage(func, '*');
                    }
                } else if (!domReady ||
                           iframe && (!iframe.contentWindow || queue && !queue.ready) ||
                           (!queue || !queue.ready) && typeof func === 'function') {
                    if (!queue) queue = $scope.callPlayer.queue[frame_id] = [];
                    queue.push([func, args]);
                    if (!('poller' in queue)) {
                        // keep polling until the document and frame is ready
                        queue.poller = setInterval(function() {
                            $scope.callPlayer(frame_id, 'listening');
                        }, 250);
                        // Add a global "message" event listener, to catch status updates:
                        messageEvent(1, function runOnceReady(e) {
                            if (!iframe) {
                                iframe = document.getElementById(frame_id);
                                if (!iframe) return;
                                if (iframe.tagName.toUpperCase() != 'IFRAME') {
                                    iframe = iframe.getElementsByTagName('iframe')[0];
                                    if (!iframe) return;
                                }
                            }
                            if (e.source === iframe.contentWindow) {
                                // Assume that the player is ready if we receive a
                                // message from the iframe
                                clearInterval(queue.poller);
                                queue.ready = true;
                                messageEvent(0, runOnceReady);
                                // .. and release the queue:
                                while (tmp = queue.shift()) {
                                    $scope.callPlayer(frame_id, tmp[0], tmp[1]);
                                }
                            }
                        }, false);
                    }
                } else if (iframe && iframe.contentWindow) {
                    // When a function is supplied, just call it (like "onYouTubePlayerReady")
                    if (func.call) return func();
                    // Frame exists, send message
                    iframe.contentWindow.postMessage(JSON.stringify({
                        "event": "command",
                        "func": func,
                        "args": args || [],
                        "id": frame_id
                    }), "*");
                }
                /* IE8 does not support addEventListener... */
                function messageEvent(add, listener) {
                    var w3 = add ? window.addEventListener : window.removeEventListener;
                    w3 ?
                        w3('message', listener, !1)
                    :
                        (add ? window.attachEvent : window.detachEvent)('onmessage', listener);
                }
            }
        }
    }
 
}]);


siApp
.directive('siStreetview', function siStreetView( $siTemplate, $siUtils, $siDictionary){
    let dir_controller = 
    function($scope, $q, $siApi, $rootScope){
        $scope.ready = false;
        $scope.is_visible = false;
        $scope.positioned = false;
        $scope.zoom = 14;
        $scope.is_loading_data = false;
        $scope.late_init = true;
        $scope.markers = [];
        $scope.markerCluster = null;
        $scope.bounds = null;
        $scope.client = {
            search_token : null
        };

        $scope.permalink = '';
        

        $scope.$onInit = function(){

            $scope.$on('si-display-streetview', $scope.display);
   
        }

        $scope.mapInit = function(){
            return $q(function($resolve,$reject){
                if($scope.ready == false){
                    let options = {
                        center: new google.maps.LatLng(45.6025503,-73.8469538),
                        zoom: $scope.zoom
                        //disableDefaultUI: true    
                    }
                    
                    $scope.map = new google.maps.Map(
                        $scope.map_element, options
                    );
    
                    $scope.ready = true;
                    $resolve();
                }
                else{
                    $resolve();
                }
            });
        }

        $scope.display = function(){
            if(typeof google == 'undefined') {console.error('google map object is undefined');return;}

            if($scope.latlng == null){$scope.registerWatch();return;}

            $scope.mapInit().then(function() {
                $scope.setView($scope.latlng);
            });
        }

        $scope.setView = function($position){
            if($scope.positioned == true) return;

            //console.log('engaging streetview');
            let lPosition = new google.maps.LatLng($position.lat,$position.lng);
            
            $scope.panorama = new google.maps.StreetViewPanorama($scope.viewport_element, 
                    {
                        position: lPosition,
                        pov: {
                            heading: 34,
                            pitch: 10
                        }
                    });
            
            $scope.map.setStreetView($scope.panorama);

            $scope.positioned = true;
        }
        

        $scope.isReady = function(){
            let lPromise = $q(function($resolve,$reject){
                if($scope.ready==true){
                    $resolve();
                }
                else{
                    $scope.$watch('ready', function(){
                        if($scope.ready==true){
                            $resolve();
                        }
                    });
                }
            });

            return lPromise;
        }

        $scope.registerWatch = function(){
            $scope.$watch('latlng', function(){
                if($scope.latlng != null && $scope.latlng.lat!=undefined){
                    $scope.display();
                }
            });
        }
        
    };


    return {
        restrict: 'E',
        replace: true,
        scope: {
            alias: '@siAlias',
            class: '@class',
            configs: '=?siConfigs',
            latlng: '=?latlng',
            zoom: '@'
        },
        controllerAs: 'ctrl',
        template: '<div><div id="map-{{alias}}" class="map-viewport"></div><div id="pano-{{alias}}" class="viewport"></div></div>',
        controller: dir_controller,
        link: function($scope, element){
            $scope.map_element = element.children()[0];
            $scope.viewport_element = element.children()[1];
            $scope.$onInit();
        }
    };
});


siApp
.directive('siThumbnailsSlider',[ '$timeout',
    function siThumbnailsSlider($timeout){
        return {
            restrict: 'E',
            templateUrl: siCtx.base_path + 'views/ang-templates/si-thumbnails-slider.html',
            replace: true,
            scope: {
                list: '=siList'
            },
            link : function($scope, $element, $attr){
                $scope.init($element);
            },
            controller: function($scope, $rootScope){
                $scope.selectedIndex = 0;
                $scope.trolleyOffset = 0;
                $scope._element = null;

                $scope.init = function($element){
                    $scope._element = $element;

                    // listen to MediaBox Picture events
                    $scope.$on('mediabox-picture-next', function(){
                        $scope.next();
                    });

                    $scope.$on('mediabox-picture-next', function(){
                        $scope.previous();
                    });

                    $scope.$on('mediabox-picture-select', function($event, $picture){
                        $scope.select($picture);
                        $scope.trolleyOffset = $scope.getTrolleyIndexFromSelection($scope.selectedIndex);
                    });
                }


                $scope.next = function(){
                    let lOffsetValue = $scope.trolleyOffset+1;
                    const lCompsWidth = $scope.getComponentsWidth();
                        const controlWidth = lCompsWidth.controlWidth;
                        const pictureWidth = lCompsWidth.pictureWidth;

                    //console.log('click next');

                    if(! $scope.hasViewablePicture(lOffsetValue, $scope.list.length, controlWidth, pictureWidth)){
                        lOffsetValue = $scope.trolleyOffset;
                    }


                    $scope.trolleyOffset = lOffsetValue;
                }

                $scope.previous = function(){
                    let lOffsetValue = $scope.trolleyOffset > 0 ? $scope.trolleyOffset-1 : 0;
                    $scope.trolleyOffset = lOffsetValue;

                    //console.log('click previous');
                }

                $scope.hasViewablePicture = function($trolleyOffset, $pictureCount, $controlWidth, $pictureWidth){
                    if($controlWidth < $pictureWidth) return false;
                    if($pictureCount == 0) return false;
                    if($trolleyOffset == 0) return true;
                
                    const lPicturePerPage = Math.floor($controlWidth / $pictureWidth);
                    const lCurrentPictureIndex = $trolleyOffset * lPicturePerPage;
                    
                    if(lCurrentPictureIndex > $pictureCount) return false;
                
                    return true;
                }

                $scope.getTrolleyOffset = function(){
                    if($scope.trolleyOffset == 0) return 0;
    
                    let lResult = 0;

                    const lCompsWidth = $scope.getComponentsWidth();
                        const controlWidth = lCompsWidth.controlWidth;
                        const pictureWidth = lCompsWidth.pictureWidth;

                    const lPicturePerPage = Math.floor(controlWidth / pictureWidth);
                    const indexOfFirstPicture = $scope.trolleyOffset * lPicturePerPage;

                    lResult = -1 * indexOfFirstPicture *  pictureWidth;
                    return lResult.toString() + 'px';
                }

                $scope.getTrolleyIndexFromSelection = function($selectedIndex){
                    if($selectedIndex == 0) return 0;
                    const lCompsWidth = $scope.getComponentsWidth();
                        const controlWidth = lCompsWidth.controlWidth;
                        const pictureWidth = lCompsWidth.pictureWidth;
                    
                    const lPicturePerPage = Math.floor(controlWidth / pictureWidth);
                    if(($selectedIndex + 1) <= lPicturePerPage) return 0;
                    
                    return Math.floor($selectedIndex / lPicturePerPage);
                }

                $scope.getComponentsWidth = function(){
                    const ljqElement = jQuery($scope._element);
                    return {
                        controlWidth : ljqElement.width(),
                        pictureWidth : ljqElement.find('.item').eq(0).outerWidth()
                    }
                }

                $scope.select = function($picture, $triggerEvents){
                    $triggerEvents = typeof  $triggerEvents == 'undefined' ? true : $triggerEvents;

                    $scope.selectedIndex = $scope.list.findIndex(function($e) {return $e.url == $picture.url});
                    //console.log('click on picture')
                    if($triggerEvents){
                        $rootScope.$broadcast('thumbnails-slider-select', $scope.list[$scope.selectedIndex]);
                    }
                }

                $scope.getImageAlt = function($img){
                    const lCaption = $siDictionary.getCaption({src:$img, key:'category_code'},'photo_category');
                    //console.log('Image alt', lCaption);
                    
                    const lResult = $siHooks.filter('listing-picture-alt', lCaption, $img);
        
                    return lResult;
                }
        
                $scope.getImageCaption = function($img){
                    const lCaption = $siDictionary.getCaption({src:$img, key:'category_code'},'photo_category');
                    //console.log('Image caption', lCaption);

                    const lResult = $siHooks.filter('listing-picture-caption', lCaption, $img);
        
                    return lResult;
                }
            }
        }
    }
]);