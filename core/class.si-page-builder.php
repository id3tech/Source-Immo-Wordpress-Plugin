<?php
class SourceImmoPageBuilder{
    public $layout = '';
    public $rendered_once = false;

    public $page_template_rendered = false;


    public function __construct($type){
        $this->layout = SourceImmo::current()->get_detail_layout($type);
        remove_filter( 'the_content', 'wpautop' );
        remove_filter( 'the_content', 'wptexturize');
        
        // add_action('si_start_of_template', array($this, 'start_of_template'), 10, 1);
        // add_action('si_end_of_template', array($this, 'end_of_template'), 10, 0);

        //add_filter( 'the_content', array($this, 'get_page_content'), 0);
        add_filter( 'body_class', function($classes){
            $classes[] = '';
        
            return $classes; 
        });
        
    }

    public function start_page(){
        
        //ob_start();
    }

    public function close_page(){
        $this->inline_content = ob_get_contents();
        //ob_clean();

        
    }

    public function get_page_content($content){
        if($this->rendered_once) return;
        //__c($content);
        
        $result = $content . $this->inline_content;

        $this->rendered_once = true;
        $result = do_shortcode($result);

        return $result;
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
        $page_id = $this->layout->page;

        $pageTemplate = $this->get_page_template($page_id);
        //__c($pageTemplate);

        if($pageTemplate == null){
            wp_head();
        }
        
        $this->setupPost($page_id);

        add_filter('the_title', function($title,$id=null) use($page_id){
            global $post;
            if( ($id!=null && $id == $page_id) ){
                return ''; //apply_filters('si_page_title', $title);
            }

            return $title;
        }, 10, 2);
        
        add_filter( 'body_class', function($classes) use ($pageTemplate) {
            $classes[] = sanitize_title($pageTemplate);
            $classes[] = sanitize_title(str_replace(array('.php'),array(''), $pageTemplate));
            $classes[] = sanitize_title(str_replace(array('.php','templates'),array('','template'), $pageTemplate));

            return $classes; 
        });

        $pageTemplate = apply_filters('si_get_page_template', $pageTemplate);
        

        if($pageTemplate != null){
            $templateDir = get_template_directory();

            if(file_exists($pageTemplate)){
                include($pageTemplate);
                return;
            }

            $templateDir = get_template_directory();
            if(strpos($pageTemplate, $templateDir ) !== false) $pageTemplate = str_replace($templateDir,'',$pageTemplate);
            
            if(file_exists($templateDir . '/' . $pageTemplate)){
                include  $templateDir . '/' . $pageTemplate;
                
            }
            
        }
        
        if($pageTemplate == null){
            wp_footer();
        }

    }

    
    public function start_of_template($loadingText = null){
        if($this->page_template_rendered) return;
        if(did_action('si_start_of_template') === 1){
            if($loadingText != null){
                echo('<label class="placeholder"  data-ng-show="model==null">' .  __($loadingText,SI) . ' <i class="fal fa-spinner fa-spin"></i></label>');
            }
            echo('<div class="si-content"  ng-cloak si-adaptative-class >');
        }
    }

    public function end_of_template(){
        if($this->page_template_rendered) return;
        if(did_action('si_end_of_template') === 1){
            echo('</div>'); 
        }
    }

    function setupPost($page_id){
        global $wp_query, $post;
        // $share_tool = new SiSharing($listing_data);
        // $share_tool->addHook('listing');
        
        // $permalink = $share_tool->getPermalink();
        
        $post = get_post($this->layout->page);
        $page_title = apply_filters('si_page_title', $post->page_title);
        $post->post_title = $page_title;
        

        setup_postdata( $post );

        if($wp_query != null){
            $wp_query->post = $post;
            $wp_query->posts = array( $post );
            $wp_query->queried_object = $post;
            $wp_query->queried_object_id = $page_id;
            $wp_query->found_posts = 1;
            $wp_query->post_count = 1;
            $wp_query->max_num_pages = 1; 
            $wp_query->is_page = true;
            $wp_query->is_singular = true; 
            $wp_query->is_single = false; 
            $wp_query->is_attachment = false;
            $wp_query->is_archive = false; 
            $wp_query->is_category = false;
            $wp_query->is_tag = false; 
            $wp_query->is_tax = false;
            $wp_query->is_author = false;
            $wp_query->is_date = false;
            $wp_query->is_year = false;
            $wp_query->is_month = false;
            $wp_query->is_day = false;
            $wp_query->is_time = false;
            $wp_query->is_search = false;
            $wp_query->is_feed = false;
            $wp_query->is_comment_feed = false;
            $wp_query->is_trackback = false;
            $wp_query->is_home = false;
            $wp_query->is_embed = false;
            $wp_query->is_404 = false; 
            $wp_query->is_paged = false;
            $wp_query->is_admin = false; 
            $wp_query->is_preview = false; 
            $wp_query->is_robots = false; 
            $wp_query->is_posts_page = false;
            $wp_query->is_post_type_archive = false;
            
        }
    }

}