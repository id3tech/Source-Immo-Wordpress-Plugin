<?php
$layout_mode = isset($settings['layout_mode']) ? $settings['layout_mode'] : 'linear';
?>

<div class="si agency-single si-layout-<?php echo($layout_mode) ?> si-loaded si-elementor-widget">
    <div class="si-content">
        <?php si_dummy_include('agency/infos.php') ?>

        <?php si_dummy_include('agency/offices.php') ?>

        <?php si_dummy_include('agency/tabs.php') ?>

        <?php si_dummy_include('agency/listings.php') ?>


    </div>
</div>