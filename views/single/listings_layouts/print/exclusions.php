<?php 
if(isset($model->exclusions)){
?>
<div class="panel">
    <h3><?php _e('Excluded',SI) ?></h3>
    <div class="spec" data-ng-show="model.inclusions!=undefined">
        <div><?php echo($model->exclusions) ?> <?php echo($model->exclusions) ?> <?php echo($model->exclusions) ?></div>
    </div>
</div>
<?php
}