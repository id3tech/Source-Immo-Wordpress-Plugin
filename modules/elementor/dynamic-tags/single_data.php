<?php
class SourceImmoSingleDataTags extends \Elementor\Core\DynamicTags\Tag {
        
    public function get_name() {
        return 'SourceImmoSingleDataTags';
    }

    public function get_categories() {
        return [ 'text' ];
    }

    public function get_group() {
        return [ 'post' ];
    }

    public function get_title() {
        return __('Source.Immo - Single data',SI);
    }

    protected function _register_controls() {
        
        $this->add_control(
            'field',
            [
                'label' => __( 'Field', SI ),
                'type' => \Elementor\Controls_Manager::SELECT,
                'default' => 'ref_number',
                'groups' => [
                    [
                        'label' => __('Listing', SI),
                        'options' => [
                            'ref_number' => __( 'Reference number', SI ),
                            'price_text'  => __( 'Price', SI ),
                            'category' => __( 'Category', SI ),
                            'subcategory' => __( 'Subcategory', SI ),
                            'location.city' => __( 'City', SI ),
                            'location.region' => __( 'Region', SI ),
                            'location.full_address' => __('Full address', SI),
                            'location.civic_address' => __('Civic address', SI),
                        ]
                    ],
                    [
                        'label' => __('Broker', SI),
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
                        ]
                    ],
                    [
                        'label' => __('Office', SI),
                        'options' => [
                            'ref_number' => __( 'Reference number', SI ),
                            'name' => __( 'Name', SI ),
                            'agency.name' => __( 'Agency name', SI ),
                            'email' => __('Email', SI),
                            'main_phone' => __('Phone', SI),
                            'location.full_address' => __('Address', SI)
                        ]
                    ],
                    [
                        'label' => __('Agency', SI),
                        'options' => [
                            'ref_number' => __( 'Reference number', SI ),
                            'name' => __( 'Name', SI ),
                            'license_type' => __( 'License', SI ),
                            'location.full_address' => __('Address', SI),
                            'main_phone' => __('Phone', SI)
                        ]
                    ]
                ]
            ]
        );

        $this->add_control(
            'ifEmpty',
            [
                'label' => __( 'Fallback', SI ),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => ''
            ]
        );
    }

    public function render() {
        $field = $this->get_settings( 'field' );
        $fallback = $this->get_settings( 'ifEmpty' );
        
        if(is_admin()){
            $admin_print = "[{$field}]";
            echo($admin_print);
            return;
        }

        // $field should not be empty
        if($field == '') return;
        
        $siModel = SourceImmo::getModel();
        if($siModel != null){
            $result = $siModel;
            $modelProperties = explode('.',$field);
            foreach ($modelProperties as $prop) {
                if(!property_exists($result, $prop)) break;
                $result = $result->{$prop};
            }
            
            // The result should not be the same as the result
            if($result == $siModel) return;

            echo($result);

            return;
        }
        elseif($fallback != ''){
            if(strpos($fallback,'[[') !== false){
                $formatVars = ['page_title' => function(){ return get_the_title();}];
                $result = $fallback;
                foreach ($formatVars as $key => $var) {
                    
                    if(strpos($result, '[[' . $key .']]') !== false ){
                        $value = $var();
                        $result = str_replace('[[' . $key .']]',$value, $result);
                    }
                }

                $result = preg_replace('/(\[\[.+]])/', '', $result);

                if($result != ''){
                    echo($result);
                    return;
                }
            }
          
        }
        
        return null;
    }
}
