

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
            on_change: '&onChange',
            mode: '@'
        },
        controllerAs: 'ctrl',
        replace:true,
        templateUrl: directiveTemplatePath('si-calculator'),
        transclude: true,
        link: function($scope,$element,$attrs){
            if($scope.mode == undefined){
                $scope.mode = $attrs.siAmount != undefined ? 'embedded' : 'standalone'
            }

            let lAmount = $scope.amount;
            if($attrs.siAmount == undefined){
                
                const lQueryAmount = window.location.search.split('&').find(function($part){return $part.indexOf('amount')});
                if(lQueryAmount != null){
                    lAmount = parseFloat(lQueryAmount.split("=")[1]);
                    if(isNaN(lAmount)){
                        lAmount = $scope.amount;
                    }
                }
            }

            $scope.init(lAmount);
        },
        controller: function($scope, $q,$rootScope, $http,$siDataLayer, $siConfig) {
            $scope.downpayment_selection = 'manual';
            $scope.cities = {};
            $scope.series = [];

            $scope.data = {
                amount:500000,
                amortization:25,
                downpayment: 15,
                downpaymentTotal: 0,
                interest: 3,
                frequency: 12,
                downpayment_method : 'percent',
                includeMortgageInsurance: 'yes'
            }
            $scope.frequencies = {
                '12' : 'Monthly',
                '26' : 'Bi-weekly',
                '52' : 'Weekly'
            }
            $scope.init = function($amount){
                $amount = ($amount == undefined) ? 500000 : $amount;
                $siConfig.get().then(function($configs){
                    $scope.configs = $configs;
                    $scope.data.interest = $configs.default_interest_rate;
                });

                $scope.preload();
                $scope.data.amount = $amount;
                $scope.getCityTaxTransfers().then(function(){
                    $scope.convertDownpaymentToCash();
                    $scope.process();
                })
                
            }


            $scope.getFrequencyLabel = function($frequency){
                if($frequency == undefined) return '';
                if($scope.frequencies[$frequency] == undefined) return '';
                return $scope.frequencies[$frequency].translate();
            }

            $scope.getCityTaxTransfers = function(){
                if($scope.transferTaxCityBoundaries != undefined) return $q.resolve();

                // const definitionPath ='https://api-v1.source.immo/lib/city-tax-transfer-staging.json';
                const definitionPath ='https://api-v1.source.immo/lib/city-tax-transfer.json';
                return $http.get(definitionPath).then( function($response){
                    if($response.status == 200){
                        return $response.data;
                    }
                    return null;
                } ).then(function($transferTaxCityBoundaries){
                    $scope.transferTaxCityBoundaries = $transferTaxCityBoundaries;
                    $scope.cities = $transferTaxCityBoundaries.exceptions.map($city => {
                        return {
                            code: (Array.isArray($city.code)) ? $city.code[0] : $city.code,
                            name: $city.name
                        };
                    });
                })
            }
            

            $scope.selectCity = function($city){
                
                $scope.selectedCity = $city;
                if($city != null){
                    $scope.cityCode = $city.code;
                }
                else{
                    $scope.cityCode = null;
                }
                
                $scope.process();
            }
        
            $scope.convertDownpaymentToCash = function($process=false){
                let lResult = 0;
    
                lResult = Math.round($scope.data.amount * ($scope.data.downpayment / 100));
    
                $scope.data.downpaymentTotal = lResult;

                if($process) $scope.process();
            }
    
            $scope.convertDownpaymentToPercent = function($process=false){
                let lResult = 0;
    
                lResult = 100 / ($scope.data.amount / $scope.data.downpaymentTotal);
    
                $scope.data.downpayment = lResult;

                if($process) $scope.process();
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
                
                const $transferTax = $scope.getTransferTax($scope.data.amount);
                let lResult = {
                    mortgage : lBranch,
                    transfer_tax : $transferTax
                }
    
                //if($scope.result != undefined && $scope.result.mortgage.payment != lResult.mortgage.payment){
                    if($scope.mode == 'standalone'){
                        $siDataLayer.pushEvent('si/calcutor/use',lResult);
                    }
                    $rootScope.$broadcast('si-mortgage-calculator-result-changed', lResult);
                    
                    if(typeof($scope.on_change) == 'function'){
                        $scope.on_change({'$result' : lResult});
                    }
                //}
                


            
                $scope.result = lResult;
                $scope.buildGraphSeries();
                //console.log('processing triggered', lResult);
            }
    
            $scope.process_branch = function (branch, downpayment_ratio) {
                branch.downpayment = $scope.getDownPayment($scope.data.amount, downpayment_ratio) + 0.000001;
                branch.insurance = $scope.data.includeMortgageInsurance ? $scope.getMortgageInsurance($scope.data.amount, downpayment_ratio) : 0;
                branch.mortgage = $scope.data.amount - branch.downpayment + branch.insurance;
                
                const PrValue = branch.mortgage;  //Number($("input[name=calPropertyCost]").val()) - Number($("input[name=calCash]").val());
                const IntRate = branch.rate / 100; //Number($("input[name=calInterest]").val()) / 100;
                const Period = branch.amortization; //Number($("input[name=calAmortizationPeriod]").val());
                const PPay = branch.frequency; //Number($("input[name=calFreq]").val());
    
                const intcandebase = Math.pow((1 + IntRate / 2), (2 / PPay)) - 1;
                const paymperiobase = (PrValue * intcandebase) / (1 - (1 / Math.pow((1 + intcandebase), (Period * PPay))));
                branch.payment = paymperiobase;

                return branch;
            };
    
            $scope.getDownPayment = function (price, downpayment_ratio) {
                return price * downpayment_ratio;
            };
    
            $scope.getMortgageInsurance = function (price, downpayment_ratio) {
                //  EDIT:   remove insurance offset because it's not shown 
                //          and insurance are calculated on fixed downpayment ratio
                //          We should correct it by including range or get a real 
                //          algorithm
                //return 0;
                
                const lBasePrice = price - (price * downpayment_ratio);
                const lBrackets = [
                    {pct: 0.05, mult: 0.04},
                    {pct: 0.1, mult: 0.031},
                    {pct: 0.15, mult: 0.028},
                    {pct: 0.1999, mult: 0.028},
                    {pct: 0.2, mult: 0}
                ];
                
                if(downpayment_ratio < 0.05){
                    //console.log('Downpayment ratio is inferior to the 5% limit');
                    return 0;
                }
                
                let lBraket = null;
                
                lBrackets.forEach(function($b){
                    if(downpayment_ratio >= $b.pct){
                        lBraket = $b;
                    }
                })
                let lResult = 0;
                
                if(lBraket != null){
                    lResult = lBasePrice * lBraket.mult;
                }		
                
                return lResult;
            };

            $scope.buildGraphSeries = function(){
                
                const fnPctOfTotal = (val) => Math.round((val / $scope.data.amount) * 100);
                const fnPctOfMortgage = (val) => Math.round((val / $scope.result.mortgage.mortgage) * 100);
                //let lRatio = ($scope.data.downpayment / $scope.data.amount);

                const series = {};
                series['Estimated mortgage amount'] = {value: fnPctOfTotal($scope.result.mortgage.mortgage - $scope.result.mortgage.insurance), color: '#888'};
                series['Down payment'] = {value: fnPctOfTotal($scope.result.mortgage.downpayment), color: 'var(--id3-color-action, var(--si-highlight, #15c))'};

                if(fnPctOfTotal($scope.result.mortgage.insurance) > 0){
                    series['Mortgage insurance'] = {value: fnPctOfMortgage($scope.result.mortgage.insurance), color: 'var(--id3-color-action-400, #17a)'};
                }
                
                console.log('buildGraphSeries',$scope.result,series);
                $scope.series = series;
            }
    
            $scope.getTransferTax = function ($amount, in_montreal) {
                in_montreal = (typeof (in_montreal) == 'undefined') ? false : in_montreal;
                let amount = $amount;
               
                const $boundaries = $scope.getTransferTaxBoundaries($scope.cityCode);

                let rates = $boundaries.rates;
                let bounds = $boundaries.bounds;
                let transferTax = 0;

                for (let i=0; i<rates.length; i++) {
                    if(amount <= 0) continue;

                    const lRemovedAmount = (i==0) ? Math.min(bounds[i],amount) : Math.min(bounds[i] - bounds[i-1],amount);
                    transferTax = transferTax + lRemovedAmount*rates[i];
                    amount = amount - lRemovedAmount;
                }

                return Math.round(transferTax);
                
            };
            
            $scope.getTransferTaxBoundaries = function($cityCode){
                const $boundaries = $scope.transferTaxCityBoundaries;
                if($boundaries == null) return null;
                
                const defaultBoundaries = $boundaries.general;
                if(isNullOrEmpty($cityCode)) return defaultBoundaries;
                const lFilteredBoundaries = $boundaries.exceptions.find(function($e){
                    if(Array.isArray($e.code)){
                        return $e.code.includes($cityCode.toString());
                    }
                    return $e.code == $cityCode.toString()
                });
                if(lFilteredBoundaries == null) return defaultBoundaries;
                
                const lResult = angular.copy(lFilteredBoundaries);

                lResult.bounds.unshift(...defaultBoundaries.bounds.slice(0,2));
                lResult.rates.unshift(...defaultBoundaries.rates.slice(0,2));
                return lResult;
            }

            $scope.preload = function(){
                //let lData = sessionStorage.getItem('si.mortgage-calculator');
            }
    
            $scope.save = function(){
                sessionStorage.setItem('si.mortgage-calculator', JSON.stringify($scope.data));
            }
    
            // watch for amount to be valid then init directive
            $scope.$watch("amount", function(){
                
                if($scope.amount!=null){
                    $scope.init($scope.amount);
                }
            });
    
            
        }
    };
});



siApp
.directive('siFavoritesButton', [function siFavoritesButton(){
    return {
        restrict: 'E',
        templateUrl: directiveTemplatePath('si-favorites-button'),
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
                //console.log('removeFromList');
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
            showGrid: '=siShowPictureGrid',
            pictureFit: '@siPictureFit'
        },
        controllerAs: 'ctrl',
        replace:true,
        templateUrl: directiveTemplatePath('si-image-slider','2'),
        link: function (scope, element, attrs) {
            scope.$element = element[0];
            
            var mc = new Hammer(element[0]);
            let lPanHndl = null;
            scope.init();
        },
        controller: function ($scope,$rootScope,$element, $q,$siApi,$rootScope,$siDictionary, $siHooks,$siUI, $siUtils,$timeout) {
            //$scope.model.expand_mode = false;
            $scope.picture_grid_mode = false;
            
            $scope.model = {
                current_index : 0,
                viewport: {
                    width: 870,
                    height: 870 * 16 / 9
                },
                expand_mode: false
            };

    
            $scope.init = function(){
                $scope.index = 0;   
                
                if(['Safari','Mobile','like Mac OS'].every(function($w){ return navigator.userAgent.indexOf($w) >= 0})){
                    $element[0].classList.add('is-safari');
                    
                    
                }


                $scope.$on('thumbnails-slider-select', function($event, $picture){
                    const lIndex = $scope.pictures.findIndex(function($e){return $e.url == $picture.url});
                    $scope.set(lIndex,false);
                });

                $scope.applyViewportHandlers();
                
                var options = {
                    root: document.documentElement
                  }
                if (typeof(IntersectionObserver) !== 'undefined') {
                    var observer = new IntersectionObserver(function(entries, observer){
                        entries.forEach(function(entry){
                        if(entry.intersectionRatio > 0){
                            //console.log('ImageSlider is visible');
                            $scope.detectBoxSize();
                        }
                        });
                    }, options);
                    observer.observe($scope.$element);
                }

                const resizeObserver = new ResizeObserver( ($entries) => {
                    $scope.detectBoxSize();
                });

                resizeObserver.observe($element[0]);

                // $scope.$on('container-resize', function(){
                //     //console.log('container-resize');
                //     $scope.detectBoxSize();
                // })
                // let lWindowResizeDebounce = null;
                // window.addEventListener('resize', function(){
                //     if(lWindowResizeDebounce!=null){
                //         window.clearTimeout(lWindowResizeDebounce);
                //     }
                //     lWindowResizeDebounce = window.setTimeout(function(){
                //         $scope.detectBoxSize();
                        
                //         $scope.selectGridPicture($scope.model.current_index);
                //         lWindowResizeDebounce=null;
                //     }, 500);
                    
                // });
                
                $scope.$on('si/single:ready',function(){
                    $timeout(function(){
                        //console.log('si/single:ready - triggered');
                        $scope.detectBoxSize();
                        $scope.selectGridPicture(0);
                    },1000);    
                });

            }

            $scope.isInViewport =  function(el) {
                const rect = el.getBoundingClientRect();

                //console.log('isInViewport', rect.bottom, window.innerHeight + window.scrollY)

                return (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            
                );
            }
            $scope.touch_sensitivity = 100
            $scope._touchDown = {
                x:null,
                y:null
            }
            $scope.applyViewportHandlers = function(){
                const viewport = $element[0];

                viewport.addEventListener('touchstart', $scope.handleTouchStart, false);        
                viewport.addEventListener('touchmove', $scope.handleTouchMove, false);
                viewport.addEventListener('touchend', $scope.handleTouchEnd, false);

                const thumbsViewport = $element[0].querySelector('.picture-grid-viewport');
                thumbsViewport.addEventListener('touchstart', $event => {
                    
                    $event.stopPropagation();
                }, false);   
    
            }
            $scope.handleTouchStart = function(evt) {
                const firstTouch = evt.touches[0];   
                //console.log('touchStart triggered');
                $scope._touchDown = {
                    x: firstTouch.clientX,
                    y: firstTouch.clientY
                }                                   
                
            };  
            
            $scope.handleTouchEnd = function(evt) {
                
                if ( ! $scope._touchDown.x || ! $scope._touchDown.y ) {
                    return;
                }
                
                if(Math.abs($scope._touchDown.diffY) - $scope.touch_sensitivity > 0) return;
                if(($scope._touchDown.diffX - $scope.touch_sensitivity) > 0){
                    $scope.nextPicture();
                }
                else if(($scope._touchDown.diffX + $scope.touch_sensitivity) < 0){
                    $scope.previousPicture();
                }

                /* reset values */
                $scope._touchDown.x = null;
                $scope._touchDown.y = null;  
                
            };  
            
            $scope.handleTouchMove = function(evt) {
                if ( ! $scope._touchDown.x || ! $scope._touchDown.y ) {
                    return;
                }
            
                var xUp = evt.touches[0].clientX;                                    
                var yUp = evt.touches[0].clientY;
            
                var xDiff = $scope._touchDown.x - xUp;
                var yDiff = $scope._touchDown.y - yUp;

                $scope._touchDown.diffX = xDiff;
                $scope._touchDown.diffY = yDiff;
                return;                                       
            };
    
            $scope.nextPicture = function($event){
                if($event != undefined){
                    $event.stopPropagation();
                }
                
                //console.log($scope.index, '/', $scope.pictures.length-1);
                let lNewIndex = $scope.model.current_index+1;
                if(lNewIndex >=  $scope.pictures.length){
                    lNewIndex= 0;
                }
                $scope.set(lNewIndex);
            }
    
            $scope.previousPicture = function($event){
                if($event != undefined){
                    $event.stopPropagation();
                }

                let lNewIndex = $scope.model.current_index-1;
                if(lNewIndex ==  -1){
                    lNewIndex= $scope.pictures.length-1;
                }
                $scope.set(lNewIndex);
            }
    
            $scope.set = function($index, $triggerEvents){
               
                if($scope.model.current_index == $index){
                    $timeout(_ => {
                    $scope.selectGridPicture($index);
                    });
                    return;
                }
                //$timeout(function(){
                    $scope._working_set = true;
                    $triggerEvents = $triggerEvents == undefined ? false : $triggerEvents;
                    const lViewport = $scope.$element.querySelector('.viewport');
                    const lViewportWidth = $scope.$element.getBoundingClientRect().width;
                    
                    lViewport.scrollLeft = 0;

                    $timeout(_ => {
                        $scope.model.current_index = $index;
                    });
                    
                        //if(window.innerWidth <= 640){
                            //lViewport.scrollTo($index * lViewportWidth,0);
                            //return;
                        //}
                    $timeout(_ => {
                        $scope.picture_grid_mode =false;
                        
                        $scope.updateTrolley(lViewportWidth,$index);
            
                        if($triggerEvents !== false){
                            const lItem = $scope.pictures[$index];
                            //$rootScope.$broadcast('mediabox-picture-select', lItem);
                        }
                        $scope.selectGridPicture($index);
                    },200);

                    $scope._working_set = false;
                //});
            }

            $scope.selectGridPicture = function($index){
                const lGridPictures = $element[0].querySelectorAll('.picture-grid-viewport .trolley .item');
                const lGridPicture = lGridPictures[$index];
                //console.log('selectGridPicture', $index, lGridPicture);

                Array.from(lGridPictures).forEach(function($e){
                    $e.classList.remove('si-highlight');
                });

                if(lGridPicture != null){
                    //console.log('selectGridPicture', $index, lGridPicture);
                    //lGridPicture.parentElement.scrollTop = -1 * lGridPicture.offsetTop;
                    if($scope.isInViewport($element[0])){
                        lGridPicture.scrollIntoView({behavior: "smooth",  block: 'nearest', inline: 'nearest'});    
                    }
                    lGridPicture.classList.add('si-highlight');
                    
                }
            }
    
    
            $scope.toggleExpand = function(){
                $scope.model.expand_mode = !$scope.model.expand_mode;
            }
    
            // watch for alias to be valid then init directive
            $scope.$watch("pictures", function(){
                if($scope.pictures!=null){
                    $scope.init();
                }
            });
    
            $scope.preventScroll = function($event){
                $event.preventDefault();
                $event.stopPropagation();
            }
            $scope.toggleFullscreen = function($event){
                $event.stopPropagation();

                if($scope.model.expand_mode == true){
                    $scope.exitFullscreen().then(function(){
                        $scope.model.expand_mode = false;
                    });
                }
                else{
                    $scope.enterFullscreen().then(function(){
                        $scope.model.expand_mode = true;
                    });;
                }
            }
            $scope.enterFullscreen = function(){

                return $q( function($resolve){
                    $siUI.enterFullscreen($element[0], function(){
                        $scope._postExitFullscreen();
                    }).then(
                        function success(){
                            //console.log('enterFullscreen@success');
                            $siUI.lockScreenOrientation('landscape-primary').then(
                                function(){},
                                function(){}
                            );
                            
                            return $q.resolve();
                        },
                        function fail(){
                            //console.log('enterFullscreen@fail');
                            $scope.$container = $scope.$element.parentElement;

                            $scope.$viewport = $scope.$element.querySelector('.viewport');
                            document.body.append($scope.$element);
        
                            document.body.style.overflow = 'hidden';
                            window.addEventListener('wheel', $scope.preventScroll);
                            window.scrollTo(0,0);
                            return $q.resolve();
                        }
                    ).then(function(){
                        //console.log('expand_mode activated');

                        $timeout(function(){    
                            $scope.model.expand_mode = true;
                            $resolve();
                        }, 250);
                    })
                })
                .then( function(){
                    $timeout(function(){
                        $scope.detectBoxSize($element[0]);
                    },500);
                });
                
            }
            $scope.exitFullscreen = function($redraw){
                $redraw = $redraw === undefined ? true : $redraw;

                return $q(function($resolve){   
                    const lExitPromise = $siUI.exitFullscreen();
                    if(lExitPromise === undefined){
                        return $scope._postExitFullscreen().then(function(){
                            $resolve();
                        });
                    }

                    lExitPromise.then(
                        function success(){
                            $siUI.unlockScreenOrientation();
                        },
                        function fail(){
                            // compress back
                            //console.log('exit fullscreen failed');
                            $scope.$container.append($scope.$element);
                            window.removeEventListener('wheel', $scope.preventScroll);
                        }
                    ).then(function(){
                        $scope._postExitFullscreen().then(function(){
                            $resolve();
                        })
                    });
                });

            }

            $scope._postExitFullscreen = function(){
                //console.log('_postExitFullscreen');
                return $q(function($resolve){
                    $timeout(function(){
                        $scope.model.expand_mode = false;
                        $resolve();
                    },250);
                }).then( function() {
                    $timeout(function(){
                        $scope.detectBoxSize();
                    },500);
                });
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
    
            $scope.updateTrolley = function($viewportWidth,$index){
                
                return;
            }
    
            $scope.getTrolleyStyle = function(){
                if($scope.pictures == null) return {};
                if($siUtils.isBrowser('Edge',null,18)){
                    // this is a crappy browser, we must apply transformation directly to the element
                    const lViewport = $scope.$element.querySelector('.viewport');
                    const lViewportWidth =lViewport.getBoundingClientRect().width;
                    const lTransformation = 'translateX(-' + ($scope.index * lViewportWidth) + 'px)';
                    return 'transform:' + lTransformation;
                }

                return '';
            }

            $scope.detectBoxSize = function($relativeElm=null){
                if($relativeElm == null) $relativeElm = $element[0].parentElement;
                const gridElm = $element[0].querySelector('.picture-grid-viewport');

                const lGridElmRect = gridElm.getBoundingClientRect();
                const  lRelativeRect = $relativeElm.getBoundingClientRect();
                let lWidth = lRelativeRect.width - lGridElmRect.width;
                lWidth = Math.max(Math.min(lWidth,window.innerWidth),0);
                if(lWidth == 0){
                    lWidth = window.innerWidth;
                }
                $scope.model.viewport.width =  lWidth;
                
                let lHeight = lRelativeRect.height;
                lHeight = Math.max(Math.min(lHeight, window.innerHeight),0);
                if(lHeight == 0){
                    lHeight = window.innerHeight;
                }
                $scope.model.viewport.height = lHeight; //$scope.model.viewport.width * 3 / 4; //Math.min(lHeight, $scope.model.viewport.width * 16 / 9 );

                if($siUtils.isLegacyBrowser()){

                    const lPictures = Array.from(lViewportElm.querySelectorAll('.viewport .trolley .item'));
                    lPictures.forEach(function($p){
                        //$p.style.width = lElmRect.width + 'px';
                    })
                }
            }
        }
    };
});

siApp
.directive('siImageRotator',[ '$parse', function siImageRotator($parse){
    return {
        restrict: 'A',
        scope:true,
        link: function($scope, $element, $attrs){
            const lAttrsPairValues = $attrs.siImageRotator.split(':');
            const lOptions = {
                ref_number: lAttrsPairValues[0],
                alias: lAttrsPairValues[1]
            }
            $scope.init(lOptions);
        },
        controller: function($scope, $timeout,$element, $q, $siApi, $siConfig, $siDataLayer){
            $scope.rotator_start_timeout_hndl = null;
            $scope.rotator_stop_timeout_hndl = null;
            $scope.rotator_interval_hndl = null;

            $scope.image_list = null;
            $scope.picture_index = 0;
            $scope.rotator_active = false;
            $scope.start_delay = 750;


            $scope.init = function($options){
                $scope.$element = $element[0];
                $scope.options = $options;

                

                $scope.$element.addEventListener('mouseout', function($event){
                    if($scope.rotator_start_timeout_hndl != null){
                        window.clearTimeout($scope.rotator_start_timeout_hndl);
                    }

                    $scope.stopRotator();

                });

                $scope.$element.addEventListener('mouseover', function($event){
                    if($scope.rotator_stop_timeout_hndl != null){
                        window.clearTimeout($scope.rotator_stop_timeout_hndl);
                    }

                    if($scope.rotator_active) return;

                    $scope.rotator_start_timeout_hndl = window.setTimeout(function(){
                        $scope.startRotator();
                    },$scope.start_delay);
                });

                
            }

            $scope.getPictures = function(){
                if($scope.image_list != null) return $q.resolve($scope.image_list);

                const listingElm = $element[0].closest('.si-listing-item');
                return $q(function($resolve, $reject){
                    $siConfig.get().then(function($configs){
                        let lActiveViewId = $configs.default_view;

                        $siApi.call('listing/view/' + lActiveViewId + '/fr/items/ref_number/' + $scope.options.ref_number + '/photos/').then(function($response){
                            if(listingElm.classList.contains('sold')){
                                if($configs.sold_image_limit > 0 && $configs.sold_image_limit < $response.length) $response = $response.slice(0, $configs.sold_image_limit);
                            }
                            
                            $scope.image_list = $response;
                            $resolve($response);
                        });
                    })
                    
                });
            }

            $scope.startRotator = function(){
                $scope.getPictures().then(function($pictures){
                    if($pictures.length == 1) return;
                    
                    let lPictureIndex = 0;
                    $scope.rotator_active = true;
                    const lPictureColl = $pictures.slice(1);
                    
                    $siDataLayer.pushEvent('si/listing/startImageRotator', {id: $scope.options.ref_number});
                    const lShowNext = function(){
                        const lPreviousImage = $scope.$element.querySelector('.si-image .rotator-picture');
                        
                        $scope.showPicture(lPictureColl[lPictureIndex]).then(function(){
                            lPictureIndex = (lPictureIndex + 1) % lPictureColl.length;
                            if(lPreviousImage != null){
                                // remove previous picture to keep on 2 in the z-buffer
                                $scope.removePicture(lPreviousImage).then(function(){
                                    if($scope.rotator_active){
                                        lShowNext();
                                    }
                                });
                            }
                            else{
                                // if this is the second picture, delay display to keep the transition fluidity
                                $timeout(function(){
                                    if($scope.rotator_active){
                                        lShowNext();
                                    }

                                }, 500);
                            }
                        })
                        
                    }

                    lShowNext();
                });
            }

            $scope.stopRotator = function(){

                if($scope.rotator_stop_timeout_hndl != null){
                    window.clearTimeout($scope.rotator_stop_timeout_hndl);
                }

                $scope.rotator_stop_timeout_hndl = window.setTimeout(function(){
                    $scope.removePictures();
                    $scope.rotator_active = false;

                    if($scope.rotator_interval_hndl != null){
                        window.clearInterval($scope.rotator_interval_hndl);
                    }
                    
                },250);

            }

            $scope.showPicture = function($picture){
                // add picture with opacity 0, fade in, then remove previous picture if any
                const lImgElm = document.createElement('IMG');
                
                lImgElm.classList.add('rotator-picture');

                lImgElm.setAttribute('src',$picture.url);
                
                const lImgContainerElm = $scope.$element.querySelector('.si-image');
                lImgContainerElm.append(lImgElm);
                //console.log('rotator:showPicture',lImgContainerElm, lImgElm, $picture);

                return new Promise(function($resolve,$reject){
                
                    lImgElm.addEventListener('transitionend', function(){
                        //console.log('display transition ended');
                        $resolve();
                    },{once:true});
    
                    lImgElm.addEventListener('load', function(){
                        lImgElm.classList.add('show');
                        //console.log('rotator:showPicture:onLoad');
                    });
                    
                });
            }

            $scope.removePicture = function($pictureElm){
                return new Promise(function($resolve,$reject){
                    // fade out picture, then remove it
                    $pictureElm = ($pictureElm == undefined) 
                        ? $scope.$element.querySelector('.si-image .rotator-picture')
                        : $pictureElm;
                    
                    if($pictureElm != null){
                        $pictureElm.addEventListener('transitionend', function(){
                            //console.log('removePicture', $pictureElm);
                            $pictureElm.remove(true);
                            $resolve();
                        },{once:true});

                        if($pictureElm.classList.contains('show')){
                            $pictureElm.classList.remove('show');
                        }
                        else{
                            $pictureElm.remove(true);
                            $resolve();
                        }
                        
                    }
                })
            }

            $scope.removePictures = function(){
                const lPictureElmColl = Array.from($scope.$element.querySelectorAll('.si-image .rotator-picture'));

                lPictureElmColl.forEach(function($elm,$i){
                    if($i == lPictureElmColl.length -1){
                        $scope.removePicture($elm);
                    }
                    else{
                        $elm.remove(true);
                    }
                })
            }
        }
    }
}])


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
        templateUrl: directiveTemplatePath('si-listing-navigation'),
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
                let lList = sessionStorage.getItem('si.list.listings.{0}'.siFormat(siCtx.locale));
                if(lList != undefined){
                    lList = JSON.parse(lList);
                }
                else{
                    lList = [];
                }

                //console.log('listingNavigation', lList)
                return lList;
            }

            $scope.getNextAndPrevious = function(){
                const lList = $scope.loadList();
                if (lList == null || lList.length == 0){
                    $scope.list = null;
                    return;
                }
                
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

            $scope.isEmpty = function(){
                if ($scope.list == null || $scope.list.length == 0) return true;
                
                const lFilteredList = $scope.list
                                        .filter(function($e){
                                            return $e != undefined;
                                        });
                return lFilteredList.length == 0;
            }
        }
    };
}]);



siApp
.directive('siMap', function siMap( ){
    return {
        restrict: 'E',
        replace: true,
        scope: {
            alias: '@siAlias',
            class: '@class',
            configs: '=?siConfigs',
            latlng: '=?latlng',
            listings: '=?siList',
            zoom: '@'
        },
        controllerAs: 'ctrl',
        templateUrl: directiveTemplatePath('si-map'),
        link: function($scope, element){
            $scope.viewport_element = element[0].querySelector('.viewport');
            $scope.$element = element[0];
            $scope.init();
        },
        controller: function($scope, $q, $element, $compile, $siApi,$timeout, $rootScope,$siTemplate, $siUtils, $siCompiler, $siDictionary,$siHooks,$siConfig){
            $scope.ready = false;
            $scope.is_visible = false;
            $scope.zoom = 8;
            $scope.is_loading_data = false;
            $scope.late_init = true;
            $scope.markers = [];
            $scope.markerCluster = null;
            $scope.bounds = null;
            $scope.legendList = [];
            $scope.client = {
                search_token : null
            };
    
            $scope.permalink = '';
    
            $scope.init = function(){
                if($scope.latlng!=null){
                    $scope.$on('si-display-map', $scope.display);
                    //$scope.mapInit();
                }
                else{
                    $scope.$on('si-{0}-display-switch-map'.siFormat($scope.alias), $scope.onSwitchToMap);
                    $scope.$on('si-{0}-display-switch-list'.siFormat($scope.alias), $scope.onSwitchToList);
                }

                $scope.$watch('listings', function($old, $new){
                    if($new == undefined) return;
                    if($new == null) return;
                    
                    $scope.updateMarkersFromListings();
                });

                $scope.$on('si/listings/item:hover', function($event, $item){
                    
                    if($scope.list == null) return;
                    if($scope.list == undefined) return;
                    if($scope.list.length == 0) return;

                    const marker = $scope.markers.find($m => $m.obj.id == $item.id);
                    if(marker == null) return;
                    $scope.handleListItemHover(marker);
                    
                    //$scope.pinClick(marker);
                });

                $scope.$on('si-{0}-view-change'.siFormat($scope.alias), function($event, $newView){
                    //console.log()
                    $scope.getList();
                })
    
                $rootScope.$on($scope.alias + 'FilterTokenChanged', $scope.onFilterTokenChanged);
            }
    
            $scope.display = function(){
                $scope.viewportObserver = new IntersectionObserver(function($entryList){
                    if(!$entryList.some($e => $e.isIntersecting)) return;

                    //console.log('siMap about to mapInit');
                    $scope.mapInit();
                    $scope.viewportObserver.disconnect();
                },{
                    threshold: 0.2
                });

                //console.log('siMap/display');
                $scope.viewportObserver.observe($scope.$element);
            }
    
            $scope.mapInit = function(){
                if(typeof google == 'undefined') {console.error('google map object is undefined');return;}
    
                return $q(function($resolve, $reject){   
                    $siConfig.get().then(function($config){
                        console.log('mapInit', $scope.map )
                        if($scope.ready == false || $scope.map==undefined){
                            console.log('Map init', $config, $scope.zoom);
                            
                            let options = {
                                center: new google.maps.LatLng(45.6025503,-73.8469538),
                                zoom: Number($scope.zoom),
                                fullscreenControl: false
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

                            $scope.map.addListener('dragend', function(){
                                $scope.unselectItem();
                            })
    
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
                console.log('siMap/onSwitchToMap',$scope.ready);

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
    

            $scope.updateMarkersFromListings = function(){
                $scope.is_loading_data = true;
                console.log('updateMarkersFromList');
                $scope.isReady(true).then(function(){
                    $scope.list = $scope.listings.map($listing => {
                        const marker = {
                            id: $listing.id,
                            ref_number: $listing.ref_number,
                            status_code: $listing.status_code,
                            category_code: $listing.category_code,
                            longitude: $listing.location.longitude,
                            latitude: $listing.location.latitude
                        }
                        $siCompiler.compileListingMapMarker(marker);
                        return marker;
                    });

                    $scope.updateMarkerList();
                    $scope.is_loading_data = false;
                })
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

                const lStoreViewId = sessionStorage.getItem('si/{0}/view'.siFormat($scope.configs.alias));
                const lActiveViewId = (lStoreViewId != null && $scope.configs.source.id != lStoreViewId)
                                        ? lStoreViewId
                                        : $scope.configs.source.id;

                return lOrigin.concat('/view/',lActiveViewId,'/');
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
                    $scope.configs = lListConfig;

                    console.log('updateMarkerList', $scope.list);

                    $scope.list.forEach(function($marker){
                        if(!$marker.latitude || !$marker.longitude) return;

                        let lngLat = new google.maps.LatLng($marker.latitude, $marker.longitude);
                        if($marker.category_code == undefined) { 
                            //console.log('invalid map marker', $marker);
                            return;
                        }
    
                        $siCompiler.compileListingMapMarker($marker);

                        const lMarkerClass = ['map-marker-icon',$marker.category_code.replace(' ','_')];
                        $scope.addLegendItem({type: $marker.category_code.replace(' ','_'), label: $marker.category},true);

                        if($marker.status_code != undefined){
                            lMarkerClass.push($marker.status_code.toLowerCase());
                            $scope.addLegendItem({type: 'separator', label: ''});
                            $scope.addLegendItem({type: $marker.status_code, label: $marker.status});
                        }
                        $marker.marker = new SiMarker({
                            position: lngLat,
                            map: $scope.map,
                            obj: $marker,
                            markerClass: lMarkerClass,
                            onPinClick: $scope.pinClick,
                            //title: $marker.price
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
                            cssClass: 'si-cluster',
                            styles: [
                                {
                                    height: 44,
                                    width: 44,
                                    className: 'cluster-small',
                                    anchor: [22, 22]
                                }, 
                                {

                                    height: 52,
                                    width: 52,
                                    className: 'cluster-medium',
                                    anchor: [26, 26]
                                }, 
                                {

                                    width: 70,
                                    height: 70,
                                    className: 'cluster-large',
                                    anchor: [35, 35]
                                }, 
                                {

                                    width: 80,
                                    height: 80,
                                    className: 'cluster-huge',
                                    anchor: [40, 40]
                                }
                            ]
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
    
            $scope.panAndZoomTo = function($marker){
                $scope.map.panTo($marker.getPosition());
                $scope.setZoom(15);
            }

            $scope.handleListItemHover = function($marker){
                
                //$scope.panAndZoomTo($marker);
                //$scope.map.panTo($marker.getPosition());
                //$timeout( _ => {
                    $scope.highlightItem($marker);
                //},250);
            }
                    

            $scope.pinClick = function($marker){
                //console.log('Marker clicked', $marker);
                $scope.map.panTo($marker.getPosition());
                
                $scope.$emit('si/listing/map/item:clicked', $marker.obj);
                
                $scope.selectItem($marker);
                return;

                $siApi.api($scope.getEndpoint().concat('/',siApiSettings.locale,'/items/',$marker.obj.id)).then(function($response){
                    
                    let lInfoWindowScope = $siCompiler;
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
            $scope.unselectItem = function(){
                if($scope.selectedMarker!=undefined && $scope.selectedMarker.div_){
                    $scope.selectedMarker.div_.classList.remove('selected');
                    $scope.selectedMarker = undefined;
                }
                
                const lPanelElm = $scope.$element.querySelector('.si-selected-item');
                if(lPanelElm != null){
                    lPanelElm.addEventListener('transitionend', function(){
                        $scope.selectedItem = null;
                    },{once:true});
                    
                }
                $timeout(function(){
                    $scope.showSelectionPanel = false;        
                });
                
            }

            $scope.highlightItem = function($marker){
                const lId = $marker.obj.id;
                if($scope.selectedMarker!=undefined && $scope.selectedMarker.obj.id == lId) return;
                
                if($scope.selectedMarker!=undefined && $scope.selectedMarker.div_){
                    // if not in cluster
                    $scope.selectedMarker.div_.classList.remove('selected');
                }

                $scope.map.panTo($marker.getPosition());
                $scope.selectedMarker = $marker;
                // if not in cluster
                if($scope.selectedMarker.div_) $scope.selectedMarker.div_.classList.add('selected');
                
                if($scope.infoWindow != undefined){
                    $scope.infoWindow.close();
                    $scope.clearInfoWindow();
                }
                
                const map = $scope.map;
                const infowindow = new google.maps.InfoWindow({
                    content: `
                    <div id="si-map-infowindow-content" class="si-info-window si-item">
                        <i class="fal fa-spin fa-spinner-third"></i>
                    </div>
                    `
                });

                infowindow.open({
                    anchor: $marker,
                    map,
                });
                infowindow.addListener('closeclick', ()=>{
                    $scope.clearInfoWindow();
                });
                $scope.infoWindow = infowindow;
                
                $siApi.api($scope.getEndpoint().concat('/',siApiSettings.locale,'/items/',lId)).then(function($response){
                    $siDictionary.source = $response.dictionary;
                    $siCompiler.compileListingItem($response);
                    $scope.selectedItem = $response;

                    const infoWindowElm = $element[0].querySelector('#si-map-infowindow-content');
                    infoWindowElm.innerHTML = `
                        <a href="{{selectedItem.permalink}}">
                            <div class="si-item-picture-container"><img ng-src="{{selectedItem.photos[0].url}}"></div>
                            <div class="si-item-info">
                                <div class="si-label subcategory">{{selectedItem.subcategory}}</div>
                                <div class="si-label price">{{selectedItem | formatPrice}}</div>
                                <div class="si-label city">{{selectedItem.location.city}}</div>
                                
                            </div>
                        </a>
                    `;
                    //infoWindowElm.append(contentElm);
                    $compile(infoWindowElm)($scope)
                    console.log($scope.selectedItem);
                    
                });
                
            }
            
            $scope.clearInfoWindow = function(){
                delete $scope.infoWindow;
                delete $scope.selectedMarker;
                $scope.selectedItem = null;
            }
            $scope.selectItem = function($marker){
                const lId = $marker.obj.id;
                if($scope.selectedMarker!=undefined && $scope.selectedMarker.div_){
                    $scope.selectedMarker.div_.classList.remove('selected');
                }
                if($scope.infoWindow != undefined){
                    $scope.infoWindow.close();
                    $scope.clearInfoWindow();
                }
                
                $scope.selectedMarker = $marker;
                $scope.selectedMarker.div_.classList.add('selected');

                $siApi.api($scope.getEndpoint().concat('/',siApiSettings.locale,'/items/',lId)).then(function($response){
                    $siDictionary.source = $response.dictionary;
                    $siCompiler.compileListingItem($response);
                    //console.log('siMap/showItem', $response);
                    if($scope.selectedItem == null){
                        $timeout(function(){
                            $scope.showSelectionPanel = true;
                        },100);
                    }
                    $scope.selectedItem = $response;
                    
                    
                    $scope.$emit('siMap/showItem', $response);
                });
            }

            /**
             * Shorthand to $siUtils.getClassList
             * see $siUtils factory for details
             * @param {object} $item Listing item data
             */
            $scope.getSelectionClassList = function($item){
                const lClassList = [$siUtils.getClassList($item)];
                if($scope.configs != null){
                    lClassList.push('img-hover-effect-' + $scope.configs.list_item_layout.image_hover_effect);
                }
                
                return lClassList.join(' ');
            }
    
    
    
            $scope.isReady = function(initMap=false){
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
                        if(initMap){
                            $scope.mapInit();
                        }
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

            $scope.addLegendItem = function($item, $addToStart){
                $item.type = $item.type.toLowerCase().translate();
                if($scope.legendList.some(function($l){ return $l.type == $item.type})) return;
                if($addToStart == undefined || $addToStart === false){
                    $scope.legendList.push($item);
                }
                else{
                    $scope.legendList.unshift($item);
                }
                
            }
    
    
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

                    $proto.getDraggable = function() { return false; };
    
                })(SiMarker.prototype);
            }
        }
        
    };
});


siApp
.directive('siDataAccordeon',['$parse',
function siDataAccordeon($parse){
    return {
        restrict: 'E',
        scope:true,
        link: function($scope,$element,$attrs){
            $scope.$element = $element[0];

            $scope.allowToggle = $parse($attrs.siAllowToggle)($scope);
            const lTabs = $parse($attrs.siTabs)($scope);
            if(lTabs != null){
                $scope.tabs = lTabs.filter(function($t){ return $t != ''});
            }
            

            $scope.init();
        },
        controller: function($scope,$rootScope){
            // ui - section toggles
            $scope.sections = {
                addendum : {opened:false},
                building : {opened:false},
                lot : {opened:false},
                other: {opened: false},
                in_exclusions:{opened:false},
                rooms:{opened:false},
                expenses: {opened:false},
                financials: {opened:false},
                // neighborhood: {opened:false},
                // demographics: {opened:false},
            }

            $scope._current_size = null;

            $scope.init = function(){
                //console.log('siDataAccordeon/init');
                
                window.addEventListener('load', function(){
                    $scope.applyAllowToggles();
                });

                window.addEventListener('resize', function(){
                    $scope.applyAllowToggles();
                });
                
            }

            $scope.isAvailableSection = function($section){
                if($scope.tabs == undefined) return true;
                if($scope.tabs.length == 0) return true;

                return $scope.tabs.includes($section);
            }
            

            $scope.applyAllowToggles = function(){
                //console.log('applyAllowToggles',$scope.allowToggle, window.innerWidth);
                let lAllowToggle = true;
                let lDetectedSize = 'desktop';

                if($scope.allowToggle != undefined){
                    lAllowToggle = $scope.allowToggle.desktop === 'yes';
                
                    if(window.innerWidth <= 800){
                        lAllowToggle = $scope.allowToggle.tablet === 'yes';
                        lDetectedSize = 'tablet';
                    }
                    if(window.innerWidth <= 640){
                        lAllowToggle = $scope.allowToggle.mobile === 'yes';
                        lDetectedSize = 'mobile';
                    }
                }
                
                if(lDetectedSize == $scope._current_size) return;
                $scope._current_size = lDetectedSize;

                if(lAllowToggle != true){
                    
                    Array.from($scope.$element.querySelectorAll('.si-detail-section')).forEach(
                        function($elm){
                            $elm.classList.add('opened');
                            $elm.classList.add('no-toggle');
                        }
                    );
                }
                else{
                    Array.from($scope.$element.querySelectorAll('.si-detail-section')).forEach(
                        function($elm){
                            $elm.classList.remove('opened');
                            $elm.classList.remove('no-toggle');
                        }
                    );
                }
            }

            /**
             * Check if a section is opened
             * @param {string} $section Section key
             */
            $scope.sectionOpened = function($section){
                //console.log('siDataAccordeon/sectionOpened',$section);

                if($scope.sections[$section] == undefined) return false;
                return $scope.sections[$section].opened;
            }
            /**
             * Toggle section open/close
             * @param {string} $section Section key
             */
            $scope.toggleSection = function($section){
                //console.log('siDataAccordeon/toggleSection',$section);
                if($scope.sections[$section] == undefined) $scope.sections[$section] = {opened: false};

                $scope.sections[$section].opened = !$scope.sections[$section].opened;

                if($scope.sections[$section].opened){
                    $rootScope.$broadcast('siDataAccordeon/' + $section + ':open');
                }
            }
        }
    }
}])


siApp
.directive('siMediabox',['$parse',
function siMediabox($parse){
    return {
        restrict : 'E',
        scope : {
            model: '=siModel',
            defaultTab: '@siDefaultTab',
            height: '@siHeight',
            pictureListDisplay: '@siPictureListAs',
            pictureFit: '@siPictureFit'
        },
        link: function ($scope,$elm, $attrs){
            $scope.$element = $elm;
            const lTabs = $parse($attrs.siTabs)($scope);
            if(lTabs != null){
                $scope.tabs = lTabs.filter(function($t){ return $t != ''});
                if($scope.tabs.length == 0){
                    $scope.tabs = ['pictures','video','virtual-tours','streetview','map'];
                }
            }

            $scope.init();
        },
        templateUrl: directiveTemplatePath('si-mediabox'),
        replace: true,
        controller : function($scope, $element, $siConfig,$timeout){
            $scope.selected_media = $scope.defaultTab || 'pictures';
            $scope.video_player = null;
            $scope._initialized = false;

            $scope.init = function(){
                $scope.height = (isNullOrEmpty($scope.height)) ? '{"desktop":"460px","tablet":"460px","mobile":"100vw"}' : $scope.height;

                $timeout(_ => {
                    const lRect = $element[0].parentElement.getBoundingClientRect();
                    $element[0].style.setProperty('--viewport-width', lRect.width + 'px');
                },1000)
                
                // if($scope.height.indexOf('{') < 0){
                //     $scope.$element[0].style.setProperty('--viewport-height', $scope.height);
                // }
                // else{
                //     const lHeight = JSON.parse($scope.height.replace(/'/g,'"'));
                //     Object.keys(lHeight).forEach(function($k){
                //         if($k == 'desktop'){
                //             $scope.$element[0].style.setProperty('--viewport-height', lHeight.desktop);
                //         }
                //         else{
                //             $scope.$element[0].style.setProperty('--viewport-height-' + $k, lHeight[$k]);
                //         }
                //     })
                // }
                
                window.addEventListener('resize', function(){
                    $timeout(function(){
                        const lRect = $element[0].parentElement.getBoundingClientRect();
                        $element[0].style.setProperty('--viewport-width', lRect.width + 'px');

                        $scope.selectFirstTab();
                    });
                });
                $scope.selectFirstTab();

                $siConfig.get().then(function($configs){
                    $scope._initialized = true;
                    $scope.configs = $configs;
                });
            }

            $scope.hasAddon = function($addon){
                if($siConfig._data == undefined) return false;

                return $siConfig._data.active_addons[$addon] != undefined;
            }

            $scope.selectFirstTab = function(){
                const cFirstTab = $scope.tabs 
                                    ? $scope.getVisibleTabs().firstOrDefault('pictures')
                                    : 'pictures';
                
                $scope.selectMedia($scope.defaultTab || cFirstTab);
            }

            $scope.getVisibleTabs = function(){
                if(!$scope.tabs) return null;

                const lSizeMaps = {
                    desktop : function(){ return window.innerWidth > 800},
                    tablet : function(){ return window.innerWidth <= 800 && window.innerWidth > 640},
                    mobile : function(){ return window.innerWidth <= 640}
                }

                return Object.keys(lSizeMaps).filter(function($k){
                    return lSizeMaps[$k]();
                })
                .reduce(function($result, $k){
                    const fnCheck = function($tab){
                        return $tab.indexOf('-' + $k)>0;
                    };
                    if($scope.tabs.some(fnCheck)){
                        return $scope.tabs.filter(fnCheck);
                    }
                    
                    return $scope.tabs;
                },[]);

            }
        
            $scope.tabIsAvailable = function($name){
                if($scope.configs){
                    if(['map','streetview'].includes($name)){
                        if(siCtx.map_api_key == '') return false;
                        if($scope.model && $scope.model.status_code == 'SOLD'){
                            if($scope.configs.sold_allow_map === 'false'){
                                return false;
                            }
                        }
                    }

                    
                }
                if(!$scope.tabs) return true;

                if($scope.tabs.some(function($t){ return $t.indexOf($name + '-') >= 0})){   
                    if(window.innerWidth <= 800 && window.innerWidth > 640){
                        return $scope.tabs.some(function($t) {return $t == $name + '-tablet'});
                    }
                    if(window.innerWidth <= 640){
                        return $scope.tabs.some(function($t) {return $t == $name + '-mobile'});
                    }
                }

                return $scope.tabs.some(function($t) {return $t == $name});
            }

            

            $scope.selectMedia = function($media){
                $media = $media.replace(/-tablet|-mobile/,'');
                $scope.selected_media = $media;
                
                const lTrigger = 'si-display-' + $media;
                

                if($scope._initialized){
                    $scope.$broadcast(lTrigger);
                    $scope.$broadcast('siMediaBox/' + lTrigger);
                }
                else{
                    window.setTimeout(function(){
                        $scope.$broadcast(lTrigger);
                        $scope.$broadcast('siMediaBox/' + lTrigger);
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
                    //window.console && console.log('$scope.callPlayer: Frame not found; id=' + frame_id);
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
        

        $scope.isReady = function(initMap=false){
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
                    if(initMap){
                        $scope.mapInit();
                    }
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
            templateUrl: directiveTemplatePath('si-thumbnails-slider'),
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

                    $siDataLayer.pushEvent('si/listing/viewImage', {id: $scope.model.ref_number, index: lOffsetValue});
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

siApp
.directive('siLightboxSource', function siLightboxSource(){
    class siLightbox{
        constructor($source, $index=0){
            this.create();
            this.list = Array.from($source.children).map($child => angular.copy($child));

            this.listNavPrevious.addEventListener('click', $event => {
                $event.stopPropagation();
                this.previous();
            });
            this.listNavNext.addEventListener('click', $event => {
                $event.stopPropagation();
                this.next();
            });
            this.closeButton.addEventListener('click', $event => {
                $event.stopPropagation();
                this.close();
            });

            this.listContainer.addEventListener('click', $event => {
                $event.stopPropagation();
            });

            this.element.addEventListener('click', _ => {
                this.close();
            });

            this.element.addEventListener('touchstart', $event => {
                this.handleTouchStart($event);
            }, false);        
            this.element.addEventListener('touchmove', $event => {
                this.handleTouchMove($event);
            }, false);
            this.xDown = null;
            this.yDown = null;

            window.addEventListener('keydown', $event => {
                if($event.key == 'Escape'){
                    this.close();
                }
            }, {once: true});

            //this.show($index);
        }


        getTouches(evt) {
            return evt.touches ||             // browser API
                evt.originalEvent.touches; // jQuery
        }                                                     
                                                                                   
        handleTouchStart(evt) {
            const firstTouch = this.getTouches(evt)[0];                                      
            this.xDown = firstTouch.clientX;                                      
            this.yDown = firstTouch.clientY;                                      
        }                                              
                                                                                   
        handleTouchMove(evt) {
            if ( ! this.xDown || ! this.yDown ) {
                return;
            }
        
            var xUp = evt.touches[0].clientX;                                    
            var yUp = evt.touches[0].clientY;
        
            var xDiff = this.xDown - xUp;
            var yDiff = this.yDown - yUp;
                                                                                
            if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
                if ( xDiff > 0 ) {
                    /* right swipe */ 
                    this.next();
                } else {
                    /* left swipe */
                    this.previous();
                }                       
            } else {
                if ( yDiff > 0 ) {
                    /* down swipe */ 
                } else { 
                    /* up swipe */
                }                                                                 
            }
            /* reset values */
            this.xDown = null;
            this.yDown = null;                                             
        }


        close(){
            this.element.remove(); 
        }

        create(){
            const elm = document.createElement('div');
            elm.classList.add('si','si-lightbox');
            elm.innerHTML = `
            <div class="si-lightbox-viewport">
                <div class="si-lightbox-current"></div>
                <div class="si-lightbox-nav">
                    <div class="si-button nav-previous"><i class="fal fa-fw fa-arrow-left"></i></div>
                    <div class="si-button nav-next"><i class="fal fa-fw fa-arrow-right"></i></div>
                </div>
            </div>
            <div class="close-lightbox"><i class="fal fa-fw fa-times"></i></div>
            `;

            document.body.append(elm);
            this.element = elm;

            this.listContainer = this.element.querySelector('.si-lightbox-current');
            this.listNavPrevious = this.element.querySelector('.si-lightbox-nav .nav-previous');
            this.listNavNext = this.element.querySelector('.si-lightbox-nav .nav-next');
            this.closeButton = this.element.querySelector('.close-lightbox');
        }

        show($index){
            const removePromise = new Promise( ($resolve) => {
                if(this.listContainer.children.length > 0){
                    this.listContainer.children[0].addEventListener('animationend', _ => {
                        this.listContainer.children[0].classList.remove('removing');
                        this.listContainer.children[0].remove();
                        //window.setTimeout(_ => {
                            $resolve();
                        //},100);
                        
                    },{once:true})
                    this.listContainer.children[0].classList.add('removing');
                }
                else{
                    $resolve();
                }
            })
            
            removePromise.then( _ => {
                //console.log('siLightbox/show',$index);
                const currentItem = this.list[$index];

                if(currentItem.dataset.videoId != undefined){
                    this.listContainer.append(this.createVideoElement(currentItem.dataset.videoId,currentItem.dataset.videoType,currentItem.dataset.videoUrl))
                }
                else if(currentItem.dataset.sourceUrl != undefined){
                    this.listContainer.append(this.createIFrameElement(currentItem.dataset.sourceUrl))
                }
                else{
                    this.listContainer.append(currentItem);
                }
                
                this.currentIndex = $index;
            })
            
        }

        createIFrameElement($url){
            const elm = new DOMParser().parseFromString(`<div class="si-iframe-item"><iframe src="${$url}" allow="autoplay; encrypted-media" allowfullscreen=""></iframe></div>`,'text/html').body.firstChild;

            return elm;
        }

        createVideoElement($videoId, $videoType='youtube',$videoUrl=''){
            const idValidationMaps = {
                youtube: ($id) => $id,
                vimeo: ($id) => {
                    const idRegEx = /\d{9}/
                    if(isNaN($id ) && idRegEx.test($videoUrl)) return idRegEx.exec($videoUrl)[0];
                    return $id;
                }
            }
            $videoId = idValidationMaps[$videoType]($videoId);

            const urlMaps = {
                youtube: `https://www.youtube.com/embed/${$videoId}?autoplay=1&mute=1&rel=0&loop=1`,
                vimeo: `https://player.vimeo.com/video/${$videoId}?autoplay=1&mute=1`
            };
            const iFrameUrl = urlMaps[$videoType];

            return this.createIFrameElement(iFrameUrl)
            
        }

        previous(){
            const newIndex = (this.currentIndex == 0) ? this.list.length-1 : this.currentIndex - 1;
            this.show(newIndex);
        }

        next(){
            const newIndex = (this.currentIndex + 1) % (this.list.length);
            this.show(newIndex);
        }
    }


    return{
        restrict: 'A',
        link: function($scope,$element,$attr){
            const elm = $element[0];
            const observer = new MutationObserver( $mutations => {
                Array.from(elm.children).forEach( ($child,$index) => {
                    $child.dataset.index = $index;

                    $child.addEventListener('click', (event) => {
                        const lbInstance = new siLightbox(elm);
                        lbInstance.show(event.srcElement.dataset.index);
                    });
                });
                observer.disconnect();
            });

            observer.observe(elm,{childList:true});
        }
    }
});

