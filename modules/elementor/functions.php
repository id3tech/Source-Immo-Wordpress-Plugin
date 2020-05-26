<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}


function si_elementor_get_page_template($page_template){
    /**
     * Elementor Canvas template name.
     */
    $TEMPLATE_CANVAS = 'elementor_canvas';

    /**
     * Elementor Header & Footer template name.
     */
    $TEMPLATE_HEADER_FOOTER = 'elementor_header_footer';

    
    $template_path = '';
    switch ( $page_template ) {
        case $TEMPLATE_CANVAS:
            $template_path = ELEMENTOR_PATH . 'modules/page-templates/templates/canvas.php';
            break;
        case $TEMPLATE_HEADER_FOOTER:
            $template_path = ELEMENTOR_PATH . 'modules/page-templates/templates/header-footer.php';
            break;
    }
    if($template_path != ''){
        return $template_path;
    }
    
    return $page_template;
}

add_filter('si_get_page_template', 'si_elementor_get_page_template',10,1);


add_action( 'elementor/dynamic_tags/register_tags', function( $dynamic_tags ) {
	class SourceImmoListingDataTags extends \Elementor\Core\DynamicTags\Tag {

		public function get_name() {
			return 'SourceImmoListingDataTags';
		}

		public function get_categories() {
			return [ 'text' ];
		}

		public function get_group() {
			return [ 'post' ];
		}

		public function get_title() {
			return __('Listing data',SI);
		}

		protected function _register_controls() {
			$this->add_control(
				'field',
				[
					'label' => __( 'Field', 'text-domain' ),
					'type' => \Elementor\Controls_Manager::SELECT,
                    'default' => 'price_text',
                    'options' => [
                        'ref_number' => __( 'Reference number', SI ),
                        'price_text'  => __( 'Price', SI ),
                        'category' => __( 'Category', SI ),
                        'subcategory' => __( 'Subcategory', SI ),
                        'location.city' => __( 'City', SI ),
                        'location.region' => __( 'Region', SI ),
                        'location.full_address' => __('Address', SI),
                    ],
				]
            );
		}

		public function render() {
            $field = $this->get_settings( 'field' );
            
            if(is_admin()){
                $admin_print = "[{$field}]";
                echo($admin_print);
                return;
            }
            
            
            $siModel = SourceImmo::getModel();
            if($siModel != null){
                
                $modelProperties = explode('.',$field);
                foreach ($modelProperties as $prop) {
                    if(!property_exists($siModel, $prop)) break;
                    $siModel = $siModel->{$prop};
                }
                echo($siModel);

                return;
            }
            echo('');
		}
	}
    $dynamic_tags->register_tag( 'SourceImmoListingDataTags' );
    
    class SourceImmoBrokerDataTags extends \Elementor\Core\DynamicTags\Tag {

		public function get_name() {
			return 'SourceImmoBrokerDataTags';
		}

		public function get_categories() {
			return [ 'text' ];
		}

		public function get_group() {
			return [ 'post' ];
		}

		public function get_title() {
			return __('Broker data',SI);
		}

		protected function _register_controls() {
			$this->add_control(
				'field',
				[
					'label' => __( 'Field', 'text-domain' ),
					'type' => \Elementor\Controls_Manager::SELECT,
                    'default' => 'fullname',
                    'options' => [
                        'ref_number' => __( 'Reference number', SI ),
                        'fullname' => __( 'Full name', SI ),
                        'first_name' => __( 'First name', SI ),
                        'last_name' => __( 'Last name', SI ),
                        'license_type' => __('License', SI),
                        'email' => __('Email', SI),
                        'main_phone' => __('Phone', SI),
                        'office.name' => __('Office name', SI),
                        'office.location.full_address' => __('Office address', SI)
                    ],
				]
            );
		}

		public function render() {
            $field = $this->get_settings( 'field' );
            
            if(is_admin()){
                $admin_print = "[{$field}]";
                echo($admin_print);
                return;
            }
            
            
            $siModel = SourceImmo::getModel();
            if($siModel != null){
                
                $modelProperties = explode('.',$field);
                foreach ($modelProperties as $prop) {
                    if(!property_exists($siModel, $prop)) break;
                    $siModel = $siModel->{$prop};
                }
                echo($siModel);

                return;
            }
            echo('');
		}
	}
	$dynamic_tags->register_tag( 'SourceImmoBrokerDataTags' );
} );