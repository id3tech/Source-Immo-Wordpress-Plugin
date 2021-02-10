
<div class="panel bordered">
    <h3><?php _e('Excluded',SI) ?></h3>
    <div class="content spec">
        <?php 
        if(isset($model->exclusions)){
        ?>
        <div><?php echo($model->exclusions) ?></div>
        <?php
        }
        ?>
    </div>
</div>
