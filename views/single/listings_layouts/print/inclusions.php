
<div class="panel bordered">
    <h3><?php _e('Included',SI) ?></h3>
    <div class="content spec">
        <?php 
        if(isset($model->inclusions)){
        ?>
        <div><?php echo($model->inclusions) ?></div>
        <?php
        }   
        ?>
    </div>
</div>
