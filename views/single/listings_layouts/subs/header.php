<div class="si-header {{model.status=='SOLD'? 'is-sold':''}}">


    <div class="si-header-row">
        
        <div class="si-header-group group-location">
            <div class="subcategory">{{model.subcategory}}</div>
            <div class="city">{{model.location.city}}</div>
        </div>

        <?php echo do_shortcode('[si_listing_part part="header_price"]') ?>
        
    </div>

    <div class="si-header-row si-header-tools">
        <?php echo do_shortcode('[si_listing_part part="info_request_button"]') ?>

        <?php echo do_shortcode('[si_listing_part part="header_tools"]') ?>
    </div>
</div>