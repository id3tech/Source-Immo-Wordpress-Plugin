<?php
class SourceImmoSingleDataContainerTags extends \Elementor\Core\DynamicTags\Tag {
        
    public function get_name() {
        return 'SourceImmoSingleContainerDataTags';
    }

    public function get_categories() {
        return [ 'text' ];
    }

    public function get_group() {
        return [ 'post' ];
    }

    public function get_title() {
        return __('Source.Immo - Single container',SI);
    }

    protected function _register_controls() {
        $this->add_control(
            'controller',
            [
                'label' => __( 'Type', 'text-domain' ),
                'type' => \Elementor\Controls_Manager::SELECT,
                'default' => 'Listing',
                'options' => [
                    'Listing' => __( 'Listing', SI ),
                    'Broker' => __( 'Broker', SI),
                    'Office' => __( 'Office', SI)
                ],
            ]
        );

        $this->add_control(
            'ref_number',
            [
                'label' => __( 'Reference number', SI ),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => '',
            ]
        );

        $this->add_control(
            'loading_text',
            [
                'label' => __( 'Loading text', SI ),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => '',
            ]
        );

    }

    public function render() {
        $controller = $this->get_settings( 'controller' );
        $ref_number = $this->get_settings( 'ref_number' );
        $loading_text = $this->get_settings( 'loading_text' );
        $type = strtolower($controller);

        if(is_admin()){
            $admin_print = 'data-si-controller|' . $controller;
            echo($admin_print);
            return;
        }
        
        if($ref_number == ''){
            $ref_number = get_query_var( 'ref_number');
        }

        if($loading_text == ''){
            $loading_text = __('Loading ' . $type,SI);
        }

        $attrs = [
            'ng-controller' => "single{$controller}Ctrl",
            'ng-init' => "init('{$ref_number}',true,'{$loading_text}')",
            'ng-class' => "'si si-single {$type}-single'",
            'style' => 'display:none;'
        ];
        
        
        $lResult = [];
        array_walk(
            $attrs, 
            function ($item, $key) use (&$lResult) {
                if($item == ''){
                    $lResult[] = $key;  
                }
                else{
                    $lResult[] = $key . '|' . $item;  
                }
            }
        );
        echo(implode("\n", $lResult));
    }
}
