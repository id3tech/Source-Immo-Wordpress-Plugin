<div class="si-header {{model.status=='SOLD'? 'is-sold':''}}">
    
    <div class="price">
        <div>{{model.long_price}}</div>
        <div class="mortgage" data-ng-show="model.status_code!='SOLD' && model.price.sell!=undefined"><?php _e('Estimated mortgage payments',SI) ?>: <a href="#" data-ng-click="scrollTo('#calculator')">{{calculator_result.mortgage.payment.formatPrice()}} {{calculator_result.mortgage.frequency_caption.translate().toLowerCase()}}</a></div>
    </div>
    <div class="subcategory">{{model.subcategory}}</div>
    <div class="city">{{model.location.city}}</div>

    <div class="tools">
        <button type="button" class="button si-modal-trigger" data-target="share-page"><i class="fal fa-share-alt"></i></button>
        <button type="button" class="button" ng-click="print()"><i class="fal fa-print"></i></button>
        <button type="button" class="button {{favorites.isFavorite(model.ref_number) ? 'active' : ''}}" ng-click="favorites.toggle(model)"><i class="{{favorites.isFavorite(model.ref_number) ? 'fas' : 'fal'}} fa-heart"></i></button>
    </div>

    <?php echo do_shortcode('[si_listing_part part="info_request_button"]') ?>
</div>

<?php echo do_shortcode('[si_listing_part part="media_box"]') ?>


<div class="si-summary">
    <div class="ref-number">{{model.ref_number}}</div>
    <div class="address" data-ng-show="model.location.full_address!=undefined">{{model.location.full_address}}</div>
    <div class="near" data-ng-show="model.location.details!=undefined">{{model.location.details}}</div>
    <div class="city" data-ng-show="model.location.address==undefined">{{model.location.city}}</div>
    <div class="region">{{model.location.region}}</div>
    <div class="state">{{model.location.state}}</div>
    
    <div class="description">{{model.description}}</div>
    <div class="attachments" ng-show="model.attachments.length>0">
        <div ng-repeat="item in model.attachments"
                class="attachment {{item.file_extension | sanitize}}"
            >
            <a href="{{item.url}}" target="_blank">
                <i class="far"></i>
                <span class="attachment-name">{{item.description}}</span>
            </a>
        </div>
    </div>

    <?php echo do_shortcode('[si_listing_part part="flags"]') ?>

    <?php echo do_shortcode('[si_listing_part part="open_houses"]') ?>

</div>

<div class="si-details">
    <div class="si-left">
        <?php echo do_shortcode('[si_listing_part part="addendum"]') ?>

        <?php echo do_shortcode('[si_listing_part part="rooms"]') ?>
        
        <?php echo do_shortcode('[si_listing_part part="building_specs"]') ?>

        <?php echo do_shortcode('[si_listing_part part="lot_specs"]') ?>
        
        <?php echo do_shortcode('[si_listing_part part="other_specs"]') ?>

        <?php echo do_shortcode('[si_listing_part part="in_exclusions"]') ?>

        <?php echo do_shortcode('[si_listing_part part="financials"]') ?>

    </div>
    <div class="si-right">
        
        <?php echo do_shortcode('[si_listing_part part="brokers"]') ?>
        
        <?php echo do_shortcode('[si_listing_part part="calculator"]') ?>
        
        
    </div>
</div>

<?php //echo do_shortcode('[gravityform id="1" title="false" description="false" ajax="true"]'); ?>

<?php// echo do_shortcode('[si_listing_part part="info_request"]') ?>

<?php echo do_shortcode('[si_listing_part part="list_navigation"]') ?>

<?php echo do_shortcode('[si_listing_part part="info_request_modal"]') ?>

<?php echo do_shortcode('[si_listing_part part="share_modal"]') ?>









