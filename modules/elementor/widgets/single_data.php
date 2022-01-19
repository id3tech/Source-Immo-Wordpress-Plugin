<?php
class Elementor_SI_Single extends \Elementor\Widget_Base
{

    public function get_name()
    {
        return 'si_single';
    }

    public function get_title()
    {
        return __('Single item detail', SI);
    }

    public function get_icon()
    {
        return 'eicon-single-post';
    }

    public function get_categories()
    {
        return ['source-immo'];
    }

    protected function _register_controls(){
        // $siConfigs = SourceImmo::current()->configs;

        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Content'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );


        $this->add_control(
            'content_type',
            [
                'label' => __('Content type', SI),
                'type' => \Elementor\Controls_Manager::SELECT,
                'placeholder' => '',
                'options' => [
                    'listing' => __('Listing', SI),
                    'broker' => __('Broker', SI),
                    'office' => __('Office', SI),
                    'agency' => __('Agency', SI)
                ],
                'default' => 'listing'
            ]
        );

        $this->add_control(
            'layout_mode',
            [
                'label' => __('Layout', SI),
                'type' => \Elementor\Controls_Manager::SELECT,
                'placeholder' => '',
                'options' => [
                    'linear' => __('Linear', SI),
                    'original' => __('Original', SI),
                ],
                'default' => 'linear'
            ]
        );


        // $this->end_controls_section();

    }

    /**
     * Render shortcode widget output on the frontend.
     *
     * Written in PHP and used to generate the final HTML.
     *
     * @since 1.0.0
     * @access protected
     */
    protected function render()
    {
        $settings = $this->get_settings_for_display();
        
        
        $printEditorContent = false;
        if (isset($_GET['action']) && $_GET['action'] == 'elementor') {$printEditorContent=true;}
        if (strpos($_SERVER['REQUEST_URI'],'admin-ajax') !== false) {$printEditorContent=true;}

        if($printEditorContent){
            $this->_print_editor_content();
            return;
        }

        $contentType = isset($settings['content_type']) ? $settings['content_type'] : 'listing';
        $layout_mode = isset($settings['layout_mode']) ? $settings['layout_mode'] : 'linear';
        
        $shortcode_attrs = [
            'class="si-layout-' . $layout_mode . '"'
        ];
        
        $shortcode = do_shortcode(shortcode_unautop('[si_'. $contentType . ' ' . implode(' ', $shortcode_attrs) . ']'));
        echo ($shortcode);
    }

    function _print_editor_content(){
        $settings = $this->get_settings_for_display();
        $contentType = isset($settings['content_type']) ? $settings['content_type'] : 'listing';
        

        if(file_exists(SI_ELEMENTOR_MODULE_PATH . '/dummy-content/' . $contentType . '.php')){
            include SI_ELEMENTOR_MODULE_PATH . '/dummy-content/' . $contentType . '.php';
        }
        else{
            echo '<label>Not supported yet</label>';
        }
        
    }
}

