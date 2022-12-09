<div class="panel bordered description">
    <h3><?php _e('Description', SI) ?></h3>
    <div class="content">
    <?php 
    if(isset($model->description)){
        echo($model->description);
    }
    ?>
    </div>
</div>