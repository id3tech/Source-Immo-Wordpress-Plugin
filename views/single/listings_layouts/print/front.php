<div class="page-background"><img src="<?php echo($model->photos[0]->url) ?>" /></div>
            
            <div class="panel overlay dock-bottom padding-0">
                
                <div class="broker-infos padding-5">
                    
                    <div class="broker-list">
                    <?php
                    foreach ($model->brokers as $broker) {
                        SourceImmo::view('single/listings_layouts/print/broker', array('broker'=>$broker));
                    }
                    ?>
                    </div>

                    <div class="logo">
                        <?php SourceImmo::view('single/listings_layouts/print/logo');?>
                    </div>
                </div>
            </div>

            <div class="address-civic"><?php echo($model->location->civic_address)?></div>

            
            

            <?php 
            if(hasValue([$model->description, $model->important_flags])){
                
                echo('<div class="description">');
                SourceImmo::view('single/listings_layouts/print/icon_ribbon', array('model'=>$model));
                if(hasValue([$model->description, $model->important_flags],'all')){
                    echo('<div class="separator"></div>');
                }

                if(isset($model->description)){
                    echo($model->description);
                }
                echo('</div>');
            }
            ?>
            

            <div class="panel overlay dock-top padding-0">
                
                <div class="information padding-5 grid-layout">
                    <div class="address">
                        <div class="civic"><?php echo($model->location->civic_address)?></div>
                        <div class="city"><?php echo($model->location->city) ?></div>
                        <div class="district"><?php echo($model->location->district) ?></div>
                    </div>

                    <div class="transaction"><?php echo($model->subcategory . ' ' . $model->transaction) ?></div>
                    <div class="price"><?php echo($model->price_text) ?></div>
                    
                    
                    <div class="ref_number"><?php echo($model->ref_number) ?></div>
                    
                </div>
            </div>