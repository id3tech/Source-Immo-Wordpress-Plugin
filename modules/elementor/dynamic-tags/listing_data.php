<?php
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
                    'location.full_address' => __('Full address', SI),
                    'location.civic_address' => __('Civic address', SI),
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
