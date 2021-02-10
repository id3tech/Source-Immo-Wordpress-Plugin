<?php 


?>
<div class="panel bordered characteristics">
    <h3><?php _e('Characteristics',SI) ?></h3>
    <div class="content spec-grid list-layout">
        <?php 
        if(hasValue([$model->proximity_flags])){
            echo('<h4>' . __('Near',SI) . '</h4>');
            include 'proximity_flags.php';
        }

        if(hasValue([
            SourceImmoListingsResult::getBuildingSpecs($model),
            $model->building->dimension
        ])){
            echo('<h4>' . __('Building and interior',SI) . '</h4>');
            include '_building_specs.php';
        }
        ?>    

        <?php 
        if(hasValue([
            SourceImmoListingsResult::getLotSpecs($model),
            $model->land->dimension
        ])){
            echo('<h4>' . __('Lot and exterior',SI) . '</h4>');
            include '_lot_specs.php';
        }
        ?>

        <?php 
        if(hasValue([SourceImmoListingsResult::getOtherSpecs($model)])){
            echo('<h4>' . __('Other characteristics',SI) . '</h4>');
            include '_other_specs.php';
        }
        
        ?>
    </div>
</div>
<?php
