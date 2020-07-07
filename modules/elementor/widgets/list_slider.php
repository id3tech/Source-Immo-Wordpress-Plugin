<?php
class Elementor_SI_List_Slider_Widget extends \Elementor\Widget_Base
{

    public function get_name()
    {
        return 'si_list_slider';
    }

    public function get_title()
    {
        return __('List slideshow', SI);
    }

    public function get_icon()
    {
        return 'eicon-thumbnails-down';
    }

    public function get_categories()
    {
        return ['source-immo'];
    }

    protected function _register_controls()
    {

        $siConfigs = SourceImmo::current()->configs;

        $aliasList = array();
        foreach ($siConfigs->lists as $list) {
            $aliasList[$list->alias] = $list->alias;
        }

        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Content'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'alias',
            [
                'label' => __('List alias', SI),
                'type' => \Elementor\Controls_Manager::SELECT,
                'placeholder' => '',
                'options' => $aliasList,
                'default' => ''
            ]
        );
        $this->add_control(
            'limit',
            [
                'label' => __('Limit', SI),
                'type' => \Elementor\Controls_Manager::TEXT,
                'input_type' => 'number',
                'placeholder' => '',
                'default' => ''
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
        if (isset($_GET['action']) && $_GET['action'] == 'elementor') return;
        if (strpos($_SERVER['REQUEST_URI'],'admin-ajax') !== false) return;
        
        $settings = $this->get_settings();

        $alias = $settings['alias'];

        $limit = $settings['limit'];

        $shortcode_attrs = [];
        if ($alias != '') {
            $shortcode_attrs[] = 'alias="' . $alias . '"';
        }

        if ($limit != '') {
            $shortcode_attrs[] = 'limit="' . $limit . '"';
        }

        $shortcode = do_shortcode(shortcode_unautop('[si_list_slider ' . implode(' ', $shortcode_attrs) . ']'));
        echo ($shortcode);
    }

    function _content_template()
    {
    ?>
        <div class="si-elementor-widget">
            <div class="slider-type-hero si si-list-slider ng-isolate-scope list-of-listings loaded" si-alias="listings" si-options="{show_navigation:true, limit: 5}" style="--slider-width:1120px;">
                <div class="si-slide-container" style="--list-count:5; --current-index:0;">
                    
                    <div ng-include="getItemTemplateInclude()" class="si-slide ng-scope in-viewport" ng-repeat="item in list">
                        <div class="slide-background ng-scope">
                            <img src="<?php echo SI_PLUGIN_URL ?>/modules/elementor/assets/images/home-1.jpeg" style="object-fit: cover;">
                        </div>

                        <div class="slide-infos ng-scope">
                            <div class="title slide-data from-left ng-binding">
                                <?php _e('Subcategory',SI) ?> - 4 <?php _e('rooms',SI) ?>
                            </div>

                            <div class="city slide-data from-left ng-binding" style="--delay:0.25s">
                                <?php _e('City',SI) ?>
                            </div>

                            <div class="address slide-data from-left ng-binding" style="--delay:.5s">
                                <?php _e('Address',SI) ?>
                            </div>

                            <div class="price slide-data from-bottom ng-binding">
                                1 500 000 $
                            </div>

                            <div class="link slide-data from-bottom" style="--delay:0.75s">
                                <a href="#" class="button"><?php _e('Details',SI) ?></a>
                            </div>
                        </div>
                    </div>
                    
                </div>

                <div class="si-slider-navigation">
                    <div class="nav-button previous-button"><i class="fal fa-angle-left"></i></div>
                    <div class="nav-button next-button" ><i class="fal fa-angle-right"></i></div>

                    <div class="slider-bullet-container">
                        <div class="slider-bullet">
                        </div>
                        <div class="slider-bullet">
                        </div>
                        <div class="slider-bullet">
                        </div>
                        <div class="slider-bullet">
                        </div>
                        <div class="slider-bullet">
                        </div>
                    </div>
                </div>



            </div>
            <div class="si-control-preview-hint">
                <div class="hint-info">
                    <i class="icon <?php echo($this->get_icon())?>"></i>
                    <em><?php echo($this->get_title())?></em>
                </div>
                <div class="hint-list">
                    <div class="hint-item"><i class="fal fa-at"></i> <em>{{{settings.alias}}}</em></div>
                    <div class="hint-item"><i class="fal fa-flag-checkered"></i> <em>{{{settings.limit=='' ? '10' : settings.limit}}}</em></div>
                </div>
            </div>
        </div>
<?php
    }
}
