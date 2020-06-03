<?php 
if(isset($model->units)){
?>
<div class="panel units">
    <h3><?php _e('Units',SI) ?></h3>
    
    <div class="unit-list list">
        <?php
        foreach ($model->units as $unit) {
        ?>
        <div class="unit-item list-item">
            <label class="category"><?php echo StringPrototype::format(__('{0} unit',SI), $unit->category)?> </label>
            <div class="dimension value">
                <?php echo(SourceImmoListingsResult::formatDimension($unit->dimension)) ?>
            </div>
        </div>
        <?php
        }
        ?>
    </div>
</div>
<?php
}