<?php
class SourceImmoPageBuilder{
    public $layout = '';
    public $rendered_once = false;

    public function __construct($type){
        $this->layout = SourceImmo::current()->get_detail_layout($type);
        remove_filter( 'the_content', 'wpautop' );
        remove_filter('the_content', 'wptexturize');
        add_filter('the_content', array($this, 'get_page_content'), 0);
        add_filter( 'body_class', function($classes){
            $classes[] = '';
        
            return $classes; 
        });
        
    }

    public function start_page(){
        
        ob_start();
    }

    public function close_page(){
        $this->inline_content = ob_get_contents();
        ob_clean();

        
    }

    public function get_page_content($wrapInContainer=true){
        if($this->rendered_once) return;

        $result = $this->inline_content;

        
        if($wrapInContainer){
            // add most common structure and class to fit in page
            $result = '<article class="page entry"><div class="container entry-content"><si-content>' . 
                            $result . 
                        '</si-content></div></article>';
        }
        $this->rendered_once = true;

        return do_shortcode($result);
    }

    public function get_default_page_template(){
        $templates = wp_get_theme()->get_page_templates(null,'page');
        if(count($templates) == 0) return null;
        //__c($templates);
        $templateNamePriorities = array('fullwidth','full-width','nosidebar');
        foreach ($templateNamePriorities as $templateName) {
            foreach ($templates as $key => $value) {
                if(strpos($key, $templateName) != false){
                    return($key);
                }
            }    
        }
        
        return null;
    }

    public function render(){
        if($this->layout->type == 'custom_page'){
            echo $this->get_page_content(false);
        }
        else{
            // get the template page layout
            $defaultPageTemplate = $this->get_default_page_template();
            if($defaultPageTemplate == null){
                global $wp_query;
                $wp_query->current_post = 0;
                $wp_query->post_count = 2;
                
                get_header();
                echo $this->get_page_content();
                get_footer();
            }
            else{
                global $wp_query;
                $wp_query->current_post = 0;
                $wp_query->post_count = 2;
                
                add_filter( 'body_class', function($classes) use ($defaultPageTemplate) {
                    $classes[] = sanitize_title($defaultPageTemplate);
                    $classes[] = sanitize_title(str_replace(array('.php'),array(''), $defaultPageTemplate));
                    $classes[] = sanitize_title(str_replace(array('.php','templates'),array('','template'), $defaultPageTemplate));

                    return $classes; 
                });
                include get_template_directory() . '/'. $defaultPageTemplate;
            }
        }

    }

}