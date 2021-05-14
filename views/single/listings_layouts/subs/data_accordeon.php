
<?php
$tabArray = str_replace('"',"'", json_encode($tabs));
?>

<si-data-accordeon si-tabs="<?php echo($tabArray)?>" si-allow-toggle="<?php echo($allow_toggle) ?>">
<?php echo do_shortcode('[si_listing_part part="addendum"]') ?>

<?php echo do_shortcode('[si_listing_part part="rooms"]') ?>

<?php echo do_shortcode('[si_listing_part part="building_specs"]') ?>

<?php echo do_shortcode('[si_listing_part part="lot_specs"]') ?>

<?php echo do_shortcode('[si_listing_part part="other_specs"]') ?>

<?php echo do_shortcode('[si_listing_part part="in_exclusions"]') ?>

<?php echo do_shortcode('[si_listing_part part="financials"]') ?>

<?php echo do_shortcode('[si_listing_part part="neighborhood"]') ?>

<?php echo do_shortcode('[si_listing_part part="demographics"]') ?>

</si-data-accordeon>