siApp
.directive('siWpcf7Module', function(){
    return {
        restrict: 'E',
        link: function($scope,$element,$attrs){
            $scope.init();
        },
        controller: function($scope, $siHooks){
            $scope._form_initialized = false;

            $scope.init = function(){
                console.log('siWpcf7Module init');
                $siHooks.addAction('si-modal-open', function(){
                    $scope.initForm();
                    $scope.resetForm();
                });

                $siHooks.addAction('listing-message-model-post-process', function($model){
                    $scope.fillForm($model);
                })
            }

            $scope.initForm = function(){
                if($scope._form_initialized) return;

                jQuery( 'div.wpcf7 > form' ).each( function() {
                    var $form = jQuery( this );
                    wpcf7.initForm( $form );

                    if ( wpcf7.cached ) {
                        wpcf7.refill( $form );
                    }
                } );
            }

            $scope.fillForm = function($model){
                jQuery('div.wpcf7 > form input').each( function($i, $e) {
                    const name = jQuery($e).attr('name');

                    if(name && name.indexOf('subject') >= 0){
                        console.log('found subject');
                        jQuery($e).val($model.subject);
                    }
                })
            }

            $scope.resetForm = function(){
                jQuery( 'div.wpcf7 > form' ).each( function() {
                    var $form = jQuery( this );
                    wpcf7.clearResponse($form)
                });
            }
            
        }
    }
})