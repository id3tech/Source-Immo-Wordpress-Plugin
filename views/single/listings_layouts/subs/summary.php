<div class="si-summary">
    
    <div class="si-label ref-number">{{model.ref_number}}</div>
    
    <?php echo do_shortcode('[si_listing_part part="location" align="'. $align .'"]') ?>
    
    <?php echo do_shortcode('[si_listing_part part="flags" align="'. $align .'"]') ?>  
        
    

    <?php echo do_shortcode('[si_listing_part part="description" hide_empty="true"]') ?>

    <?php echo do_shortcode('[si_listing_part part="links" hide_empty="true" align="'. $align .'"]') ?>

    <?php echo do_shortcode('[si_listing_part part="documents" hide_empty="true" align="'. $align .'"]') ?>

    <?php echo do_shortcode('[si_listing_part part="open_houses" hide_empty="true" align="'. $align .'"]') ?>

</div>