
<div class="left-column">
    <?php echo do_shortcode('[si_broker_part part="head_info"]') ?>
    
    <?php
    echo do_shortcode('[si_broker_listings]')
    ?>
</div>

<div class="right-column">
    <div class="picture">
        <img src="{{model.photo.url}}" />
    </div>

    <?php echo do_shortcode('[si_broker_part part="contact"]') ?>

    <?php echo do_shortcode('[si_broker_part part="office"]') ?>

    <?php echo do_shortcode('[si_broker_part part="cities"]') ?>

</div>


