<?php
class Elementor_SI_Searchbox_Widget extends \Elementor\Widget_Base {

	public function get_name() {
        return 'si_searchbox';
    }

	public function get_title() {
        return __('Search box',SI);
    }

	public function get_icon() {
        return 'eicon-text-field';
    }

	public function get_categories() {
        return ['source-immo'];
    }

	protected function _register_controls() {

        $siConfigs = SourceImmo::current()->configs;


        $this->start_controls_section(
			'content_section',
			[
				'label' => __( 'Content', 'plugin-name' ),
				'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
			]
		);

        $aliasList = array();
        foreach($siConfigs->lists as $list){
            $aliasList[$list->alias] = $list->alias;
        }

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
			'placeholder',
			[
				'label' => __( 'Placeholder', SI ),
				'type' => \Elementor\Controls_Manager::TEXT,
				'input_type' => 'text',
                'placeholder' => '',
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
        $placeholder = $settings['placeholder'];
        $result_page = $settings['result_page'];

        $shortcode_attrs = [];
        if($alias != ''){
            $shortcode_attrs[] = 'alias="' . $alias . '"';
        }
        if($placeholder != ''){
            $shortcode_attrs[] = 'placeholder="'. $placeholder . '"';
        }
         if($result_page != ''){
            $shortcode_attrs[] = 'result_page="'. $result_page . '"';
        }
        $shortcode = do_shortcode( shortcode_unautop( '[si_searchbox ' . implode(' ', $shortcode_attrs) . ']' ) );
		echo( $shortcode );
    }

	function _content_template() {
        ?>
        <div class="si-elementor-widget">
            <div class="si">
                <div class="si-searchbox">
                    <div class="input">
                        <i class="fal fa-search"></i>
                        <input type="text" placeholder="{{{settings.placeholder}}}">
                        <i class="clear-button far fa-times"></i>
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
                    <div class="hint-item"><i class="fal fa-link"></i> <em>{{{settings.result_page=='' ? '?' : settings.result_page}}}</em></div>
                </div>
            </div>
        </div>
        <?php
    }

}