<div class="header {{model.status=='SOLD'? 'is-sold':''}}">
    
    <div class="price">
        <div>{{model.long_price}}</div>
        <div class="mortgage" ng-show="model.status!='SOLD' && model.price.sell!=undefined"><?php _e('Estimated mortgage payments',IMMODB) ?>: <a href="#" ng-click="scrollTo('#calculator')">{{calculator_result.mortgage.payment.formatPrice()}} {{calculator_result.mortgage.frequency_caption.translate().toLowerCase()}}</a></div>
    </div>
    <div class="subcategory">{{model.subcategory}}</div>
    <div class="city">{{model.location.city}}</div>

    <div class="tools">
        <button type="button" class="avia-button"><i class="fal fa-share-alt"></i></button>
        <button type="button" class="avia-button"><i class="fal fa-print"></i></button>
        <button type="button" class="avia-button"><i class="fal fa-heart"></i></button>
    </div>

    <?php echo do_shortcode('[immodb_listing_part part="info_request_button"]') ?>
</div>

<?php echo do_shortcode('[immodb_listing_part part="media_box"]') ?>

<div class="summary">
    <div class="ref-number">{{model.ref_number}}</div>
    <div class="address" ng-show="model.location.full_address!=undefined">{{model.location.full_address}}</div>
    <div class="near" ng-show="model.location.details!=undefined">{{model.location.details}}</div>
    <div class="city" ng-show="model.location.address==undefined">{{model.location.city}}</div>
    <div class="region">{{model.location.region}}</div>
    <div class="state">{{model.location.state}}</div>
    

    <div class="description">{{model.description}}</div>

    <?php echo do_shortcode('[immodb_listing_part part="flags"]') ?>

</div>

<div class="details">
    <div class="left">
        <?php echo do_shortcode('[immodb_listing_part part="addendum"]') ?>
        
        <?php echo do_shortcode('[immodb_listing_part part="building_specs"]') ?>

        <?php echo do_shortcode('[immodb_listing_part part="lot_specs"]') ?>
        
        <?php echo do_shortcode('[immodb_listing_part part="other_specs"]') ?>

        <?php echo do_shortcode('[immodb_listing_part part="in_exclusions"]') ?>

    </div>
    <div class="right">
        
        <?php echo do_shortcode('[immodb_listing_part part="brokers"]') ?>
        
        <?php echo do_shortcode('[immodb_listing_part part="calculator"]') ?>
        
        
    </div>
</div>


<?php echo do_shortcode('[immodb_listing_part part="info_request_modal"]') ?>









