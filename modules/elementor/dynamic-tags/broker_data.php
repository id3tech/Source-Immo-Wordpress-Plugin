<?php
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
        return __('Source.Immo - Broker data',SI);
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