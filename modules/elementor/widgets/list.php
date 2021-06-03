<?php

//use function PHPSTORM_META\map;

class Elementor_SI_List_Widget extends \Elementor\Widget_Base
{

    public function get_name()
    {
        return 'si_list';
    }

    public function get_title()
    {
        return __('List of data', SI);
    }

    public function get_icon()
    {
        return 'eicon-posts-grid';
    }

    public function get_categories(){
        return ['source-immo'];
    }

    protected function _register_controls()
    {

        $siConfigs = SourceImmo::current()->configs;


        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Content'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $aliasList = [
            'listings'   => [],
            'brokers'    => [],
            'offices'    => []
        ];
        foreach ($siConfigs->lists as $list) {
            if(isset($aliasList[$list->type])){
                $aliasList[$list->type][$list->alias] = $list->alias;
            }
        }

        $this->add_control(
            'type',
            [
                'label' => __('Type', SI),
                'type' => \Elementor\Controls_Manager::SELECT,
                'placeholder' => '',
                'options' => [
                    'listings' => __('Listing', SI),
                    'brokers' => __('Broker', SI),
                    'offices' => __('Office', SI)
                ],
                'default' => 'listings'
            ]
        );

        foreach ($aliasList as $key => $list) {
            $this->add_control(
                'alias_' . $key,
                [
                    'label' => __('List alias', SI),
                    'type' => \Elementor\Controls_Manager::SELECT,
                    'placeholder' => '',
                    'options' => $list,
                    'default' => '',
                    'condition' => [
                        'type' => $key
                    ]
                ]
            );
        }
        
        $this->add_control(
            'allow_side_scroll',
            [
                'label' => __('Allow side scrolling (mobile only)', SI),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'placeholder' => '',
                'return_value' => 'true',
                'default' => 'false'
            ]
        );


        $this->end_controls_section();

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

        
        if (isset($_GET['action']) && $_GET['action'] == 'elementor') return;
        if (strpos($_SERVER['REQUEST_URI'],'admin-ajax') !== false) return;

        
        $type = $settings['type'];
        $alias = $settings['alias_' . $type];
        $sideScroll = $settings['allow_side_scroll'];

        $shortcode_attrs = [];
        if ($alias != '') {
            $shortcode_attrs[] = 'alias="' . $alias . '"';
        }
        if($sideScroll=='true'){
            $shortcode_attrs[] = 'side_scroll="true"';
        }
        
        $shortcode = do_shortcode(shortcode_unautop('[si ' . implode(' ', $shortcode_attrs) . ']'));
        echo ($shortcode);
    }



    function _content_template(){  
    ?>
    <#
        const type = settings.type;
        const type_singular = type.slice(0, -1);
    #>
        <div class="si-elementor-widget">
            <div class="si direct-layout elementor-ghost si-list-of-{{{type}}} si-list-of-ghost" style="--desktop-column-width:3;--laptop-column-width:3;--tablet-column-width:2;--mobile-column-width:1" si-lazy-load="">
                <div class="si-list">
                    <# _.each([1,2,3], function(){ #>
                    <div>
                        <article class="si-item si-single-layer-item-layout si-{{{type_singular}}}-item style-standard img-hover-effect-none">
                            <a href="#">
                            <div class="item-content si-background">
                                    <div class="image"><i class="fal fa-5x fa-image"></i></div>
                                    <div class="si-data-label brokers first-name si-background-high-contrast">John</div>
                                    <div class="si-data-label brokers last-name si-background-high-contrast">Powers</div>
                                    <div class="si-data-label brokers phone">123-555-8721</div>
                                    <div class="si-data-label listings civic-address si-background-high-contrast">201 Lorem ipsum</div>
                                    <div class="si-data-label listings city si-background-high-contrast">Loremville</div>
                                    <div class="si-data-label listings price si-background-medium-contrast">525 000$</div>
                                    <div class="si-data-label listings category">Excepteur</div>
                                    <div class="si-data-label listings rooms">
                                        <div class="room bed"><i class="icon fal fa-fw fa-bed"></i> <span class="count">2</span></div>
                                        <div class="room bath"><i class="icon fal fa-fw fa-bath"></i> <span class="count">1</span></div>
                                    </div>
                                    <div class="si-data-label listings subcategory">Sint occaecat</div>
                                </div>
                            </a>
                        </article>
                    </div>
                    <# }) #>
                </div>
            </div>
            <div class="si-control-preview-hint">
                <div class="hint-info">
                    <i class="icon <?php echo($this->get_icon())?>"></i>
                    <em><?php echo($this->get_title())?></em>
                </div>
                <div class="hint-list">
                    <div class="hint-item"><i class="fal fa-at"></i> <em>{{{settings.alias}}}</em></div>
                </div>
            </div>
        </div>
    <?php
    }
}
