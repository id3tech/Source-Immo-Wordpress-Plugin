<?php
function si_enfold_render_template_builder_for($post_id, $loading_text="Loading data"){
    SourceImmo::current()->page_template_rendered = true;
	echo('<label class="placeholder"  data-ng-show="model==null">' . __($loading_text,SI) . '<i class="fal fa-spinner fa-spin"></i></label>');
	echo('<div class="si-custom-content" ng-cloak>');

	/* Run the loop to output the posts.
	* If you want to overload this in a child theme then include a file
	* called loop-page.php and that will be used instead.
	*/
	//Debug::write($avia_config);
	global $avia_config, $post;
	$avia_config['size'] = 'entry_without_sidebar';

	/**
	 * In preview we must update the shortcode tree to reflect the current page structure.
	 * Prior make sure that shortcodes are balanced.
	 */
	$content = apply_filters( 'avia_builder_precompile', get_post_meta( $post_id, '_aviaLayoutBuilderCleanData', true ) );
	
	$content = ShortcodeHelper::clean_up_shortcode( $content, 'balance_only' );
	ShortcodeHelper::$tree = ShortcodeHelper::build_shortcode_tree( $content );
	
	//check first builder element. if its a section or a fullwidth slider we dont need to create the default openeing divs here
	$first_el = isset(ShortcodeHelper::$tree[0]) ? ShortcodeHelper::$tree[0] : false;
	$last_el  = !empty(ShortcodeHelper::$tree)   ? end(ShortcodeHelper::$tree) : false;
	if(!$first_el || !in_array($first_el['tag'], AviaBuilder::$full_el ) )
	{
		echo avia_new_section(array('close'=>false,'main_container'=>true, 'class'=>'main_color container_wrap_first'));
	}
	
	$content = apply_filters('the_content', $content);
	$content = apply_filters('avf_template_builder_content', $content);
	echo $content;
	
	if(!$last_el || !in_array($last_el['tag'], AviaBuilder::$full_el_no_section ) ){
		$cm = avia_section_close_markup();

		echo "</div>";
		echo "</div>$cm <!-- section close by builder template -->";
	}
	else{
		echo "<div><div>";
	}
	
	// global fix for https://kriesi.at/support/topic/footer-disseapearing/#post-427764
	if(in_array($last_el['tag'], AviaBuilder::$full_el_no_section ))
	{
		avia_sc_section::$close_overlay = "";
	}
	
	echo avia_sc_section::$close_overlay;
	echo('</div>');
	echo('</div>');
	echo('</div>');
}
add_action('si_render_page', 'si_enfold_render_template_builder_for', 5,1);

function si_enfold_start_of_template($loadingText){
?>

            <div class="container">
        
            
  <?php
}
add_action('si_start_of_template', 'si_enfold_start_of_template', 5,1);

function si_enfold_end_of_template(){
    ?>

</div>
<?php
}
add_action('si_end_of_template', 'si_enfold_end_of_template', 5,1);