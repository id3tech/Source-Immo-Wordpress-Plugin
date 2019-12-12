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

    public function get_page_content($content){
        if($this->rendered_once) return;
        
        $result = $this->inline_content;

        $this->rendered_once = true;
        return do_shortcode($result);
    }

    public function get_page_template($page_id){
        $page_template = get_page_template_slug($page_id);
        if($page_template != '') return $page_template;

        $templateFiles = wp_get_theme()->get_files('php',0,true);
        $priorityList = array('page','single','index');

        foreach ($priorityList as $pageName) {
            foreach($templateFiles as $template => $path){
                if($template== $pageName . '.php'){
                    return $path;
                }
            }
        }

        return null;
    }

    public function render(){
        
            $pageTemplate = $this->get_page_template($this->layout->page);
            //__c($pageTemplate);

            if($pageTemplate == null){
                wp_head();
            }
            
            global $wp_query, $post;
            $wp_query->current_post = 0;
            $wp_query->post_count = 2;

            $post = get_post($this->layout->page);
            
            add_filter( 'body_class', function($classes) use ($pageTemplate) {
                $classes[] = sanitize_title($pageTemplate);
                $classes[] = sanitize_title(str_replace(array('.php'),array(''), $pageTemplate));
                $classes[] = sanitize_title(str_replace(array('.php','templates'),array('','template'), $pageTemplate));

                return $classes; 
            });

            include $pageTemplate;
            

            if($pageTemplate == null){
                wp_footer();
            }

    }

}