<?php
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

    public function get_categories()
    {
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

        $aliasList = array();
        foreach ($siConfigs->lists as $list) {
            $aliasList[$list->alias] = $list->alias;
        }

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

        

        $alias = $settings['alias'];

        $shortcode_attrs = [];
        if ($alias != '') {
            $shortcode_attrs[] = 'alias="' . $alias . '"';
        }
        
        $shortcode = do_shortcode(shortcode_unautop('[si ' . implode(' ', $shortcode_attrs) . ']'));
        echo ($shortcode);
    }



    function _content_template(){
    ?>
        <div class="si direct-layout si-list-of-ghost" style="--desktop-column-width:3;--laptop-column-width:3;--tablet-column-width:2;--mobile-column-width:1" si-lazy-load="">
            <div class="si-list">
                <div>
                    <article class="si-item si-single-layer-item-layout  style-standard img-hover-effect-none">
                        <a href="#">
                        <div class="item-content">
                                <div class="image"><i class="fal fa-5x fa-image"></i></div>
                                <div class="si-data-label si-background-low-contrast">quis nostrud exercitation</div>
                                <div class="si-data-label si-background-high-contrast">Lorem ipsum</div>
                                <div class="si-data-label">Excepteur sint occaecat</div>
                            </div>
                        </a>
                    </article>
                </div>
                <div>
                    <article class="si-item si-single-layer-item-layout  style-standard img-hover-effect-none">
                        <a href="#">
                        <div class="item-content">
                                <div class="image"><i class="fal fa-5x fa-image"></i></div>
                                <div class="si-data-label si-background-low-contrast">quis nostrud exercitation</div>
                                <div class="si-data-label si-background-high-contrast">Lorem ipsum</div>
                                <div class="si-data-label">Excepteur sint occaecat</div>
                            </div>
                        </a>
                    </article>
                </div>
                <div>
                <article class="si-item si-single-layer-item-layout  style-standard img-hover-effect-none">
                        <a href="#">
                            <div class="item-content">
                                <div class="image"><i class="fal fa-5x fa-image"></i></div>
                                <div class="si-data-label si-background-low-contrast">quis nostrud exercitation</div>
                                <div class="si-data-label si-background-high-contrast">Lorem ipsum</div>
                                <div class="si-data-label">Excepteur sint occaecat</div>
                            </div>
                        </a>
                    </article>
                </div>
            </div>
        </div>
        <div class="si-control-preview-hint">
            <div class="hint-item"><i class="fal fa-at"></i> <em>{{{settings.alias}}}</em></div>
        </div>
    <?php
    }
}
