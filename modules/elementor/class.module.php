<?php

class SI_Elementor_Module extends \SI\Bases\Module{

    function __construct(){
    }


    function includes(){
        include SI_ELEMENTOR_MODULE_PATH . '/widgets/searchbox.php';
    }

    function register_actions(){
        add_action( 'elementor/elements/categories_registered', array($this, 'addWidgetCategory'));
        add_action( 'elementor/dynamic_tags/register_tags', array($this, 'registerDynamicTags'));
        add_action( 'elementor/widgets/widgets_registered',  array($this, 'registerWidgets'));
        add_action( 'elementor/elements/elements_registered',  array($this, 'registerElements'));
    }

    function get_style_depends(){
        //if(!isset($_GET['elementor-preview'])) return [];

        return [ 
            [ 'si-elementor-editor-style', plugins_url('/elementor/assets/si-elementor-styles.min.css', SI_ELEMENTOR_MODULE_PATH)] 
        ];
    }

    function addWidgetCategory($elements_manager){
        $elements_manager->add_category(
            'source-immo',
            [
                'title' => 'Source.Immo',
                'icon' => 'fa fa-plug',
            ]
        );
    }

    function registerWidgets() {
        $widgets = [
            'search_tool' => 'Elementor_SI_SearchTool_Widget',
            'searchbox' => 'Elementor_SI_Searchbox_Widget',
            'list_slider' => 'Elementor_SI_List_Slider_Widget',
            'list' => 'Elementor_SI_List_Widget',
            'single_data' => 'Elementor_SI_Single',
            'single_data_part' => 'Elementor_SI_Single_Part',
        ];

        foreach ($widgets as $key => $instanceName) {
            // Include Widget files
            require_once(SI_ELEMENTOR_MODULE_PATH . '/widgets/' . $key . '.php' );
            // Register widget
            \Elementor\Plugin::instance()->widgets_manager->register_widget_type( new $instanceName() );
        }
        
    }

    function registerElements() {
        
        
    }


    function registerDynamicTags($dynamic_tags){
        $dynTags = [
            'listing_data' => 'SourceImmoListingDataTags',
            'broker_data' => 'SourceImmoBrokerDataTags',
            'single_data_container' => 'SourceImmoSingleDataContainerTags'
        ];

        foreach ($dynTags as $key => $instanceName) {
            // Include Widget files
            require_once(SI_ELEMENTOR_MODULE_PATH . '/dynamic-tags/' . $key . '.php' );
            // Register widget
            $dynamic_tags->register_tag($instanceName);
        }
    }

    static function get_page_list(){
        // change language
        global $sitepress;
        
        $lTypePermalink = null;
        
        // query
        $posts = new WP_Query( array(
            'post_type' => 'page',
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'sort_order' => 'asc',
            'sort_column' => 'post_title',
            'hierarchical' => 1,
            'suppress_filters' => false
        ) );

        $pages = $posts->posts;
        $lResult = array();
        foreach ($pages as &$page) {
            $lPermalink = rtrim(str_replace(array('http://','https://',$_SERVER['HTTP_HOST']), '' ,get_permalink($page)),'/');
            $page->permalink = $lPermalink;

            if($lTypePermalink==null || ( trim($lPermalink,'/') != trim($lTypePermalink,'/') && strpos($lPermalink, $lTypePermalink)!==false) ){
                $lResult[$page->permalink] = $page->post_title;
            }
        }
        
        return $lResult;
    }
}
SourceImmo::current()->register_modules(new SI_Elementor_Module);
