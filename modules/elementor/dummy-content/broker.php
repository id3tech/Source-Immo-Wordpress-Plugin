<?php
$layout_mode = isset($settings['layout_mode']) ? $settings['layout_mode'] : 'linear';
?>


<div class="si broker-single si-layout-<?php echo($layout_mode) ?> loaded si-elementor-widget">
    <div class="si-content">
       
        
        <?php si_dummy_include('broker/infos.php') ?>

        <?php si_dummy_include('broker/cities.php') ?>
        
        <?php si_dummy_include('broker/listings.php') ?>

        <?php si_dummy_include('broker/reviews.php') ?>
        
    </div>
</div>