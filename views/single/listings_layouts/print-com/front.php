<?php
global $printBasePath;
?>

<div class="page-background"><img src="<?php echo($model->photos[0]->url) ?>" /></div>

<div class="panel overlay dock-bottom padding-0">
    
    <div class="broker-infos padding-5">
        
        <div class="broker-list">
        <?php
        foreach ($model->brokers as $broker) {
            SourceImmo::view($printBasePath . '/broker', array('broker'=>$broker));
        }
        ?>
        </div>

    </div>
</div>


<div class="logo">
        <?php SourceImmo::view($printBasePath . '/logo');?>
    </div>
    

<div class="panel overlay information-panel">
    <div class="information-panel-content">
        <div class="address">
            <div class="civic"><?php echo($model->location->address->street_number)?></div>
            <div class="transaction"><?php echo($model->subcategory . ' ' . $model->transaction) ?></div>
            <div class="street"><?php echo($model->location->address->street_name)?><?php 
            if(isset($model->location->address->door) && !str_null_or_empty($model->location->address->door)){
                echo(', ' . $model->location->address->door);
            }
            ?></div>
            <div class="city"><?php echo($model->location->city) ?> <?php 
                if($model->location->district){
                    echo('(' . $model->location->district . ')');
                }
            ?></div>
        </div>
        

        <div class="resume">
            <div class="resume-part left-part">
                <div class="ref_number" style="<?php echo ( (strpos($model->ref_number,'SI') !== false ? "--si-uls-label:'# ';" : "") ) ?>"><?php echo($model->ref_number) ?></div>
                <div class="price"><?php echo($model->price_text) ?></div>
                <?php 
                if($model->available_area > 0){
                    ?><div class="available-area"><label><?php _e('Available area',SI)?></label> <span><?php echo(number_format($model->available_area,0,'.',' ')) ?> <?php echo($model->available_area_unit) ?></span></div><?php
                }
                else{
                    if($model->building->short_dimension){
                        ?><div class="available-area"><label><?php _e('Building dimensions',SI)?></label> <span><?php echo($model->building->short_dimension) ?></span></div><?php
                    }
                    if($model->land->short_dimension){
                        ?><div class="available-area"><label><?php _e('Land area',SI)?></label> <span><?php echo($model->land->short_dimension) ?></span></div><?php
                    }
                }
                ?>

            </div>
            
            <div class="resume-part right-part">
                
                <div class="text si-truncated-text">
                <?php 
                    
                    if(isset($model->description)){
                        echo($model->description);
                    }
                    
                
                ?>

                </div>
            </div>
        </div>
    </div>
</div>