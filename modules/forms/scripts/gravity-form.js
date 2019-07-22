siApp
.directive('siGravityFormModule', function(){
    return {
        restrict: 'E',
        link: function($scope,$element,$attrs){
            $scope.init($attrs.formId);
        },
        controller: function($scope, $siHooks){
            $scope._form_initialized = false;
            $scope.form_id = 0;

            $scope.init = function($form_id){
                console.log('siGravityFormModule init');
                $scope.form_id = $form_id;

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

                // jQuery(document).ready(function(){
                //     console.log('re-init gform');
                //     // var current_page = jQuery('#gform_source_page_number_' + $scope.form_id).val();
                //     // console.log(current_page);
                    
                //     //gformInitSpinner( $form_id, '{$spinner_url}' );
                //     //jQuery('#gform_ajax_frame_' + $scope.form_id).trigger('load');
                //     //jQuery(document).trigger('gform_page_loaded', [$scope.form_id, 1]);
                //     //jQuery(document).trigger('gform_post_render', [$scope.form_id, 1]);
                //     $scope._form_initialized = true;
                // });
            }

            $scope.fillForm = function($model){
                console.log('fill g-form')
                let jField = $scope.getSubjectField();
                if(jField == null) jField = $scope.getMessageField();
                if(jField == null) return;

                jField.val($model.subject);
            }

            $scope.getSubjectField = function(){
                return $scope.findFields([
                    'subject','title','object',
                    'sujet','titre','objet'
                ]);
            }

            $scope.getMessageField = function(){
                return $scope.findFields([
                    'message','text',
                    'texte'
                ]);
            }

            $scope.findFields = function($labels){
                const lFoundFields = [];
                jQuery('.gfield_label').each(function($i,$e){
                    const jLabel = jQuery($e);
                    const lLabelText = jLabel.text().toLowerCase();
                    if($labels.includes(lLabelText)){
                        const lInput = jQuery('#' + jLabel.attr('for'));
                        lFoundFields.push(lInput);
                    }
                });

                if(lFoundFields.length>0){
                    return lFoundFields[0];
                }
                return null;
            }

            $scope.resetForm = function(){
                // jQuery( 'div.wpcf7 > form' ).each( function() {
                //     var $form = jQuery( this );
                //     wpcf7.clearResponse($form)
                // });
            }
            
        }
    }
})