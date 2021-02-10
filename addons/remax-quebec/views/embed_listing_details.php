<label id="remax-quebec-listing-details-loading-text" class="placeholder">
    <?php _e($this->active_configs->loading_text,SI); ?>
    <i class="fal fa-spinner fa-spin"></i>
</label>

<iframe id="remax-quebec-listing-details" style="width:100%;" scrolling="no" 
        src="<?php echo($this->get_iframe_url($ref_number, $listing_data))?>"></iframe>

<script type="text/javascript">
    (function($scope){
        $scope._receiveTimerHndl = null;
        $scope.$loadingText = document.querySelector('#remax-quebec-listing-details-loading-text'); 

        $scope.init = function(){
            const lFrame = document.querySelector('#remax-quebec-listing-details');

            lFrame.addEventListener('load', function(){
                console.log('frame loaded');
                $scope.$loadingText.remove();
            });

            lFrame.addEventListener('error', function(){
                console.log('frame error');
                $scope.showLocalDetails();
            })

            if (window.addEventListener) {
                window.addEventListener("message", $scope.receiveMessage, false);        
            } 
            else if (window.attachEvent) {
                window.attachEvent("onmessage", $scope.receiveMessage, false);
            }

            $scope._receiveTimerHndl = window.setTimeout(function(){
                $scope._receiveTimerHndl = null;
                $scope.showLocalDetails();
            }, <?php echo($this->active_configs->switch_timeout * 1000) ?>);
        }

        $scope.receiveMessage = function(msg){
            if (msg.origin=="https://www.remax-quebec.com"){	// make sure message is from this origin (watch out for the protocol...)
				console.log('receiveMessage/',$scope._receiveTimerHndl, msg);
				
				if($scope._receiveTimerHndl != null){
					window.clearTimeout($scope._receiveTimerHndl);
					$scope._receiveTimerHndl = null;
				}                

                if (msg.data.eventId="remaxIframeHeight"){		// verify message id. Leaves possibility to add more messages in the futur
                    $scope.resizeProxyIframe(msg.data.data);			// call the resizing function with the data payload (in this case the iframe height)
                }
            }
        }

        $scope.resizeProxyIframe = function($height){
            const lFrame = document.querySelector('#remax-quebec-listing-details');
            const lLocal = document.querySelector('#local-details');

            lFrame.style.height = $height + 'px';
        }

        $scope.showLocalDetails = function(){
            $scope.$loadingText.remove();

            const lLocal = document.querySelector('#local-details');
            const lFrame = document.querySelector('#remax-quebec-listing-details');

            lFrame.style.display = 'none';
            lLocal.style.display = 'contents';
        }
        
        $scope.init();
    })({})


</script>