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

        $partTypes = [
            'listing' => [
                //'addendum' => __('Addendum', SI),
                'brokers' => __('Broker list', SI),
                //'building_specs' => __('Building specs', SI),
                'calculator' => __('Calculator', SI),
                'data_accordeon' => __('Data accordeon *', SI),
                'description' => __('Description', SI),
                //'financials' => __('Financials', SI),
                'flags' => __('Flags', SI),
                'header' => __('Header *', SI),
                'header_price' => __('Price', SI),
                'header_tools' => __('Tools', SI),
                //'in_exclusions' => __('Inclusion/Exclusions', SI),
                'info_request_button' => __('Info request button', SI),
                'links' => __('Links', SI),
                'list_navigation' => __('Search result navigation', SI),
                'location' => __('Location', SI),
                //'lot_specs' => __('Lot specs', SI),
                'media_box' => __('Media box (Pictures, Video, Map)', SI),
                //'other_specs' => __('Other specs', SI),
                //'rooms' => __('Rooms', SI),
                'summary' => __('Summary *', SI)
            ],
            'broker' => [
                'name' => __('Name', SI),
                'about' => __('About', SI),
                'specs' => __('Specs', SI),
                'rating' => __('Rating', SI),
                'contact' => __('Contact', SI),
                'picture' => __('Picture', SI),
                'cities' => __('City list', SI),
                'office' => __('Office', SI),
                'listings' => __('Broker listings', SI),
                'reviews' => __('Comments', SI),
            ]
        ];

        $this->add_control(
            'content_type',
            [
                'label' => __('Element type', SI),
                'type' => \Elementor\Controls_Manager::SELECT,
                'placeholder' => '',
                'options' => [
                    'listing' => __('Listing', SI),
                    'broker' => __('Broker', SI),
                    //'office' => __('Office', SI)
                ],
                'default' => 'listing'
            ]
        );


        foreach ($partTypes as $key => $list) {
            $this->add_control(
                'content_part_' . $key,
                [
                    'label' => __('Part', SI),
                    'type' => \Elementor\Controls_Manager::SELECT,
                    'placeholder' => '',
                    'options' => $list,
                    'default' => '',
                    'condition' => [
                        'content_type' => $key
                    ]
                ]
            );
        }

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

        $this->add_responsive_control(
			'height',
			[
				'label' => __( 'Height' ),
				'type' => \Elementor\Controls_Manager::SLIDER,
                'size_units' => [ 'px', 'vh' ],
                'devices' => [ 'desktop', 'tablet', 'mobile'],
                'default' => ['unit' => 'px', 'size' => ''],
                'range' =>  [
					'px' => [
						'min' => 250,
						'max' => 1000,
						'step' => 5,
					],
                    'vh' => [
						'min' => 0,
						'max' => 100,
                    ],
                ],
                'condition' => [
                    'content_part_listing' => 'media_box'
                ]
			]
        );

        $this->add_responsive_control(
			'allow_toggle',
			[
				'label' => __( 'Allow toggle' ),
				'type' => \Elementor\Controls_Manager::SWITCHER,
                'devices' => [ 'desktop', 'tablet', 'mobile'],
                'desktop_default' => 'yes',
                'tablet_default' => 'yes',
                'mobile_default' => 'yes',
                'return_value' => 'yes',
                'condition' => [
                    'content_part_listing' => 'data_accordeon'
                ]
			]
        );

        $tabs = [
            'addendum' => __('Addendum', SI),
            'rooms' => __('Rooms', SI),
            'building_specs' => __('Building specs', SI),
            'lot_specs' => __('Lot specs', SI),
            'other_specs' => __('Other specs', SI),
            'in_exclusions' => __('Inclusion/Exclusions', SI),
            'expenses' => __('Expenses', SI),
            'financials' => __('Financials', SI),
        ];
        foreach ($tabs as $key => $tabLabel) {
            $this->add_control(
                $key . '_tab',
                [
                    'label' => __( $tabLabel ),
                    'type' => \Elementor\Controls_Manager::SWITCHER,
                    'default' => 'yes',
                    'return_value' => 'yes',
                    'condition' => [
                        'content_part_listing' => 'data_accordeon'
                    ]
                ]
            ); 
        }

        $tabs = [
            'pictures' => __('Show pictures tab', SI),
            'video' => __('Show video tab',SI),
            'virtual-tours' => __('Show virtual tour tab',SI),
            'streetview' => __('Show street view tab',SI),
            'map' => __('Show map tab',SI)
        ];

        foreach ($tabs as $key => $tabLabel) {
            $this->add_responsive_control(
                $key . '_tab',
                [
                    'label' => $tabLabel,
                    'type' => \Elementor\Controls_Manager::SWITCHER,
                    'devices' => [ 'desktop', 'tablet', 'mobile'],
                    'default' => 'yes',
                    'return_value' => 'yes',
                    'condition' => [
                        'content_part_listing' => 'media_box'
                    ]
                ]
            );  
        }
        $this->add_control(
            'media_picture_fit',
            [
                'label' => __('Picture fit', SI),
                'type' => \Elementor\Controls_Manager::SELECT,
                'placeholder' => '',
                'options' => [
                    '' => 'Auto',
                    'cover' => __('Cover area', SI),
                    'contain' => __('Fit in area (might show colored strips on picture sides)', SI),
                    //'office' => __('Office', SI)
                ],
                'default' => '',
                'condition' => [
                    'content_part_listing' => 'media_box'
                ]
            ]
        ); 

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
        $contentPart = isset($settings['content_part_' . $contentType]) 
                            ? $settings['content_part_' . $contentType] 
                            : '';
        if($contentPart == '' && isset($settings['content_part'])) $contentPart = $settings['content_part'];

        $partStyles = [];
        $contentAlign = [];
        $contentAlignMaps = [
            'content_align' => '',
            'content_align_tablet' => '-tablet',
            'content_align_mobile'=> '-mobile'];
        foreach ($contentAlignMaps as $key => $value) {
            if (isset($settings[$key]) && $settings[$key]!='') $contentAlign[] = $settings[$key] . $value;
        }

        $classes = [
            'si',
            'si-single',
            'si-elementor-widget',
            $contentType . '-single',
        ];
        $partClasses = [
            'si-part',
            'si-part-' . $contentPart,
            implode(' ', $contentAlign)
        ];

        $contentAlign = [];
        if (isset($settings['content_align'])) $contentAlign[] = $settings['content_align'];
        if (isset($settings['content_align_tablet'])) $contentAlign[] = $settings['content_align_tablet'] . '-tablet';
        if (isset($settings['content_align_mobile'])) $contentAlign[] = $settings['content_align_mobile'] . '-phone';
        
        $shortcode_attrs = [];
        $shortcode_attrs[] = 'part="' . $contentPart . '"';
        $shortcode_attrs[] = 'align="' . implode(' ', $contentAlign) . '"';


        if($contentPart == 'media_box'){
            $contentHeight = [];
            $heightMaps = [
                'height' => ['attr' => 'desktop', 'default' => '460px'],
                'height_tablet' => ['attr' => 'tablet', 'default' => '460px'],
                'height_mobile' => ['attr' => 'mobile', 'default' => '500px'],
            ];
            foreach ($heightMaps as $key => $value) {
                
                if(isset($settings[$key]) && $settings[$key]['size'] != ''){
                    $contentHeight[$value['attr']] = $settings[$key]['size'] . $settings[$key]['unit'];
                }
                else{
                    $contentHeight[$value['attr']] = $value['default'];
                }
            }
            $contentHeightEncode = str_replace('"',"'", json_encode($contentHeight));
            $shortcode_attrs[] = 'height="' . $contentHeightEncode . '"';

            $shortcode_attrs[] = 'media_picture_fit="' . $settings['media_picture_fit'] . '"';

            $tabs = [
                'pictures',
                'video',
                'virtual-tours',
                'map',
                'streetview'
            ];
            
            $tabMaps = [
                'tab' => '',
                'tab_tablet' => '-tablet',
                'tab_mobile' => '-mobile',
            ];
            $contentTabs = [];
            foreach ($tabs as $tab) {
                foreach ($tabMaps as $key => $value) {
                    if(isset($settings[$tab . '_' . $key]) && $settings[$tab . '_' . $key] == 'yes'){
                        $contentTabs[] = $tab . $value;
                    }
                }
            }

            if(count($contentTabs)>0){
                $contentTabsEncode =  implode(",", $contentTabs);
                
                $shortcode_attrs[] = 'tabs="' . $contentTabsEncode . '"';
            }
        }

        if($contentPart == 'data_accordeon'){
            $contentAllowToggle = [];
            $allowToggleMaps = [
                'allow_toggle' => 'desktop',
                'allow_toggle_tablet' => 'tablet',
                'allow_toggle_mobile' => 'mobile',
            ];
            foreach ($allowToggleMaps as $key => $value) {
                
                if(isset($settings[$key])){
                    $contentAllowToggle[$value] = $settings[$key];
                }
            }
            $contentAllowToggleEncode = str_replace('"',"'", json_encode($contentAllowToggle));
            $shortcode_attrs[] = 'allow_toggle="' . $contentAllowToggleEncode . '"';

            $tabs = [
                'addendum',
                'rooms',
                'building_specs',
                'lot_specs',
                'other_specs',
                'in_exclusions',
                'expenses',
                'financials',
            ];
            
            $contentTabs = [];
            foreach ($tabs as $tab) {
                if(isset($settings[$tab . '_tab']) && $settings[$tab . '_tab'] == 'yes'){
                    $contentTabs[] = $tab;
                }
            }

            if(count($contentTabs)>0){
                $contentTabsEncode =  implode(",", $contentTabs);
                
                $shortcode_attrs[] = 'tabs="' . $contentTabsEncode . '"';
            }
        }

        $shortcode = '[si_'. $contentType . '_part ' . implode(' ', $shortcode_attrs) . ']';
        $shortcode_result = do_shortcode(shortcode_unautop($shortcode));
        
        echo ($shortcode_result);
        
    }

    function _print_editor_content(){
        $settings = $this->get_settings_for_display();
        $contentType = isset($settings['content_type']) ? $settings['content_type'] : 'listing';
        $contentPart = isset($settings['content_part_' . $contentType]) 
                            ? $settings['content_part_' . $contentType] 
                            : '';
        if($contentPart == '' && isset($settings['content_part'])) $contentPart = $settings['content_part'];
        

        $partStyles = [];
        $contentAlign = [];
        $contentAlignMaps = [
            'content_align' => '',
            'content_align_tablet' => '-tablet',
            'content_align_mobile'=> '-mobile'];
        foreach ($contentAlignMaps as $key => $value) {
            if (isset($settings[$key]) && $settings[$key]!='') $contentAlign[] = $settings[$key] . $value;
        }

        $classes = [
            'si',
            'si-single',
            'si-elementor-widget',
            $contentType . '-single',
        ];
        $partClasses = [
            'si-part',
            'si-part-' . $contentPart,
            implode(' ', $contentAlign)
        ];

        if($contentPart == 'media_box'){
            $heightMaps = [
                'height' => ['attr' => '--viewport-height', 'default' => '460px'],
                'height_tablet' => ['attr' => '--viewport-height-tablet', 'default' => '460px'],
                'height_mobile' => ['attr' => '--viewport-height-mobile', 'default' => '500px'],
            ];
            foreach ($heightMaps as $key => $value) {
                
                if(isset($settings[$key]) && $settings[$key]['size'] != ''){
                    $partStyles[] = $value['attr'] . ':' . $settings[$key]['size'] . $settings[$key]['unit'];
                }
                else{
                    $partStyles[] = $value['attr'] . ':' . $value['default'];
                }
            }

            $tabs = [
                'pictures',
                'video',
                'virtual-tours',
                'streetview',
                'map'
            ];
            $tabMaps = [
                'tab' => 'tab',
                'tab_tablet' => 'tab-tablet',
                'tab_mobile' => 'tab-mobile',
            ];

            foreach ($tabs as $tab) {
                foreach ($tabMaps as $key => $value) {
                    if(isset($settings[$tab . '_' . $key]) && $settings[$tab . '_' . $key] == 'yes'){
                        $partClasses[] = $tab . '-' . $value;
                    }
                }
            }
        }

        if($contentPart == 'data_accordeon'){
            $contentAllowToggle = [];
            $allowToggleMaps = [
                'allow_toggle' => 'desktop',
                'allow_toggle_tablet' => 'tablet',
                'allow_toggle_mobile' => 'mobile',
            ];
            foreach ($allowToggleMaps as $key => $value) {
                
                if(isset($settings[$key]) && $settings[$key] != 'yes'){
                    $partClasses[] = 'no-toggle-' . $value;
                }
            }
            
            $tabs = [
                'addendum',
                'rooms',
                'building_specs',
                'lot_specs',
                'other_specs',
                'in_exclusions',
                'expenses',
                'financials',
            ];
            
            $contentTabs = [];
            foreach ($tabs as $tab) {
                if(isset($settings[$tab . '_tab']) && $settings[$tab . '_tab'] == 'yes'){
                    $partClasses[] = 'show-' . $tab;
                }
            }
        }
        
        $dummyContentPath = $contentType . '/' . $contentPart . '.php';


        echo('<div class="' . implode(' ',$classes) . '">');
        //echo('<div class="si-content">');
        if($contentPart === ''){
            echo('<label class="placeholder">Select a part to render</label>');
        }
        else{
            echo('<div class="' . implode(' ',$partClasses) . '" style="' . implode(';',$partStyles) . '">');
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

