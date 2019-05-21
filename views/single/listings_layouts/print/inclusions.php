<?php 
if(isset($model->inclusions)){
?>
<div class="panel">
    <h3><?php _e('Included',SI) ?></h3>
    <div class="spec" data-ng-show="model.inclusions!=undefined">
        <div><?php echo($model->inclusions) ?></div>
    </div>
</div>
<?php
}