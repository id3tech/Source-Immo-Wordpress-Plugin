<?php echo do_shortcode('[si_agency_part part="head"]') ?>

<div si-flex="row" si-flex-align="space-between center">
<?php echo do_shortcode('[si_agency_part part="address"]') ?>
<?php echo do_shortcode('[si_agency_part part="contact"]') ?>
</div>

<div ng-show="elementCountMin('.si-office-item',1)">
<?php echo do_shortcode('[si_agency_offices]');?>
</div>

<?php echo do_shortcode('[si_agency_part part="tabs"]') ?>



<?php echo do_shortcode('[si_agency_brokers]');?>

<?php echo do_shortcode('[si_agency_listings]');

