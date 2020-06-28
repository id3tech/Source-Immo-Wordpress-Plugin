<div class="si-header {{model.status=='SOLD'? 'is-sold':''}}" si-adaptative-class>
    <?php echo do_shortcode('[si_listing_part part="header_price"]') ?>
    
    <div class="subcategory">{{model.subcategory}}</div>
    <div class="city">{{model.location.city}}</div>

    <?php echo do_shortcode('[si_listing_part part="header_tools"]') ?>

    <?php echo do_shortcode('[si_listing_part part="info_request_button"]') ?>
</div>