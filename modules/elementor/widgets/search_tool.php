<?php
class Elementor_SI_SearchTool_Widget extends \Elementor\Widget_Base {

	public function get_name() {
        return 'si_search';
    }

	public function get_title() {
        return __('Search tool',SI);
    }

	public function get_icon() {
        return 'eicon-search';
    }

	public function get_categories() {
        return ['source-immo'];
    }

	protected function _register_controls() {

        $siConfigs = SourceImmo::current()->configs;

        $aliasList = array();
        foreach($siConfigs->lists as $list){
            $aliasList[$list->alias] = $list->alias;
        }
        
        $this->start_controls_section(
			'content_section',
			[
				'label' => __( 'Content'),
				'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
			]
        );
        
		$this->add_control(
			'alias',
			[
				'label' => __( 'List alias', SI ),
				'type' => \Elementor\Controls_Manager::SELECT,
                'placeholder' => '',
                'options' => $aliasList,
                'default' => ''
			]
        );
        
        $this->add_control(
			'result_page',
			[
                'label' => __( 'Result page', SI ),
                'description' => __('The page to display the result',SI),
				'type' => \Elementor\Controls_Manager::SELECT,
                //'input_type' => 'text',
                'options' => SI_Elementor_Module::get_page_list(),
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
	protected function render() {
        if(isset($_GET['action']) && $_GET['action']=='elementor') return;
        if (strpos($_SERVER['REQUEST_URI'],'admin-ajax') !== false) return;
        
        $settings = $this->get_settings();
        
        $alias = $settings['alias'];
        
        $result_page = $settings['result_page'];

        $shortcode_attrs = [];
        if($alias != ''){
            $shortcode_attrs[] = 'alias="' . $alias . '"';
        }
        
        if($result_page != ''){
            $shortcode_attrs[] = 'result_page="'. $result_page . '"';
        }

        $shortcode = do_shortcode( shortcode_unautop( '[si_search ' . implode(' ', $shortcode_attrs) . ' standalone="true"]' ) );
		echo( $shortcode );
    }

	function _content_template() {
        ?>
        <div class="si standard-layout">
            <div class="search-container ng-isolate-scope show-trigger layout-full orientation-h" si-standalone="true">

                <div class="inputs" style="--input-count: 3">
                    <div class="search-box">
                        
                        <div class="si-searchbox" alias="listings">
                            <div class="input">
                                <i class="fal fa-search"></i>
                                <input type="text" placeholder="Lorem ipsum">
                                <i class="clear-button far fa-times"></i>
                            </div>

                        </div>
                        
                        <i class="geo-btn far fa-crosshairs"></i>
                    </div>

                    <div class="si-panel-button cities-button">Consectetur</div>

                    <div class="si-panel-button price-button">Adipiscing</div>
                </div>


                <div class="search-action">
                    
                    <div class="filter-menu">
                        <div class="si-dropdown ng-isolate-scope" data-show-button-icon="false">
                            <div class="dropdown-button "><span class="label">Filter</span></div>
                            <div class="si-dropdown-panel">
                                <div class="si-dropdown-panel-content" ng-transclude="">
                                    <div class="dropdown-item ">Consectetur</div>
                                    <div class="dropdown-item ">Adipiscing</div>
                                </div>
                            </div>
                        </div>
                    </div>
        
                    <button type="button" class="trigger-button si-button" data-ng-show="result_url != null" data-ng-click="showResultPage()" title="Recherche"><span class="label"><?php _e('Search',SI) ?></span> <i class="fal fa-search"></i></button>
                </div>  
            </div>
        </div>
        <div class="si-control-preview-hint">
            <div class="hint-item"><i class="fal fa-at"></i> <em>{{{settings.alias}}}</em></div>
            <div class="hint-item"><i class="fal fa-link"></i> <em>{{{settings.result_page=='' ? '?' : settings.result_page}}}</em></div>
        </div>
        <?php
    }

}