<?php
class Elementor_SI_Single_Part extends \Elementor\Widget_Base
{

    public function get_name()
    {
        return 'si_single_part';
    }

    public function get_title()
    {
        return __('Single item part', SI);
    }

    public function get_icon()
    {
        return 'eicon-custom';
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
                'label' => __('Element type', SI),
                'type' => \Elementor\Controls_Manager::SELECT,
                'placeholder' => '',
                'options' => [
                    'listing' => __('Listing', SI),
                    'broker' => __('Broker', SI),
                    'office' => __('Office', SI)
                ],
                'default' => 'listing'
            ]
        );

        $this->add_control(
            'content_part',
            [
                'label' => __('Part', SI),
                'type' => \Elementor\Controls_Manager::SELECT,
                'placeholder' => '',
                'groups' => [
                    [
                        'label' => __('Listing', SI),
                        'options' => [
                            'addendum' => __('Addendum', SI),
                            'brokers' => __('Broker list', SI),
                            'building_specs' => __('Building specs', SI),
                            'calculator' => __('Calculator', SI),
                            'data_accordeon' => __('Data accordeon *', SI),
                            'description' => __('Description', SI),
                            'financials' => __('Financials', SI),
                            'flags' => __('Flags', SI),
                            'header' => __('Header *', SI),
                            'header_price' => __('Price', SI),
                            'header_tools' => __('Tools', SI),
                            'in_exclusions' => __('Inclusion/Exclusions', SI),
                            'info_request_button' => __('Info request button', SI),
                            'links' => __('Links', SI),
                            'list_navigation' => __('Search result navigation', SI),
                            'location' => __('Location', SI),
                            'lot_specs' => __('Lot specs', SI),
                            'media_box' => __('Media box (Pictures, Video, Map)', SI),
                            'other_specs' => __('Other specs', SI),
                            'rooms' => __('Rooms', SI),
                            'summary' => __('Summary *', SI)
                        ]
                    ],
                    [
                        'label' => __('Broker', SI),
                        'options' => [
                            'name' => __('Name', SI),
                            'bio' => __('Bio/Description', SI),
                            'contact' => __('Contact', SI),
                            'picture' => __('Picture', SI),
                            'cities' => __('City list', SI),
                            'office' => __('Office', SI),
                            'listings' => __('Broker listings', SI),
                        ]
                    ],
                ]
                ,
                'default' => ''
            ]
        );
        $this->add_responsive_control(
            'content_align',
            [
                'label' => __('Align', SI),
                'type' => \Elementor\Controls_Manager::SELECT,
                'placeholder' => '',
                'devices' => [ 'desktop', 'tablet', 'mobile'],
                'options' => [
                    'align-stretch' => __('Stretch', SI),
                    'align-stretch-start' => __('Stretch/Start', SI),
                    'align-stretch-center' => __('Stretch/Center', SI),
                    'align-stretch-end' => __('Stretch/End', SI),
                    'align-start-stretch' => __('Start/Stretch', SI),
                    'align-center-stretch' => __('Center/Stretch', SI),
                    'align-end-stretch' => __('End/Stretch', SI),

                    'align-start' => __('Start', SI),
                    'align-start-center' => __('Start/Center', SI),
                    'align-start-end' => __('Start/End', SI),
                    'align-center' => __('Center', SI),
                    'align-center-start' => __('Center/Start', SI),
                    'align-center-end' => __('Center/End', SI),

                    'align-end' => __('End', SI),
                    'align-end-start' => __('End/Start', SI),
                    'align-end-center' => __('End/Center', SI),
                ],
                'default' => ''
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
        $contentPart = isset($settings['content_part']) ? $settings['content_part'] : '';
        
        $contentAlign = [];
        if (isset($settings['content_align'])) $contentAlign[] = $settings['content_align'];
        if (isset($settings['content_align_tablet'])) $contentAlign[] = $settings['content_align_tablet'] . '-tablet';
        if (isset($settings['content_align_mobile'])) $contentAlign[] = $settings['content_align_mobile'] . '-phone';
        
        $shortcode_attrs = [];
        $shortcode_attrs[] = 'part="' . $contentPart . '"';
        $shortcode_attrs[] = 'align="' . implode(' ', $contentAlign) . '"';

        $shortcode = do_shortcode(shortcode_unautop('[si_'. $contentType . '_part ' . implode(' ', $shortcode_attrs) . ']'));
        
        echo ($shortcode);
        
    }

    function _print_editor_content(){
        $settings = $this->get_settings_for_display();
        $contentType = isset($settings['content_type']) ? $settings['content_type'] : 'listing';
        $contentPart = isset($settings['content_part']) ? $settings['content_part'] : '';
        $contentAlign = [];
        if (isset($settings['content_align'])) $contentAlign[] = $settings['content_align'];
        if (isset($settings['content_align_tablet'])) $contentAlign[] = $settings['content_align_tablet'] . '-tablet';
        if (isset($settings['content_align_mobile'])) $contentAlign[] = $settings['content_align_mobile'] . '-phone';
        

        $dummyContentPath = $contentType . '/' . $contentPart . '.php';

        $classes = [
            'si',
            'si-single',
            'si-elementor-widget',
            $contentType . '-single',
        ];
        $partClasses = [
            'si-part',
            implode(' ', $contentAlign)
        ];

        echo('<div class="' . implode(' ',$classes) . '">');
        //echo('<div class="si-content">');
        if($contentPart === ''){
            echo('<label class="placeholder">Select a part to render</label>');
        }
        else{
            echo('<div class="' . implode(' ',$partClasses) . '">');
            si_dummy_include($dummyContentPath);
            echo('</div>');
        }
        //echo('</div>');
        ?>
        <div class="si-control-preview-hint">
            <div class="hint-info">
                <i class="icon <?php echo($this->get_icon())?>"></i>
                <em><?php echo($this->get_title())?></em>
            </div>
            <div class="hint-list">
                <div class="hint-item"><i class="fal fa-puzzle-piece"></i> <em><?php _e($contentPart,SI)?></em></div>
            </div>
        </div>
        <?php
        echo('</div>');
    }
}

