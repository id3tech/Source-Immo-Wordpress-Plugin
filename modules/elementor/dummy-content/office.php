<?php
$layout_mode = isset($settings['layout_mode']) ? $settings['layout_mode'] : 'linear';
?>


<div class="si office-single si-layout-<?php echo($layout_mode) ?> si-loaded si-elementor-widget">
    <div class="si-content">
        <?php si_dummy_include('office/infos.php') ?>

        <?php si_dummy_include('office/tabs.php') ?>

        <?php si_dummy_include('office/listings.php') ?>


    </div>
</div>