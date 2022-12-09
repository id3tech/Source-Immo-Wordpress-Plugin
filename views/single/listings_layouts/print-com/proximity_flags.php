<div class="panel bordered proximity <?php echo( ( isset($model->proximity_flags) && count($model->proximity_flags) > 0) ? '' : 'si-empty' ) ?>">
    <h3><?php _e('Near',SI) ?></h3>
    <div class="content">
    <?php 
        include '_proximity_flags.php';
    ?>
    </div>
</div>