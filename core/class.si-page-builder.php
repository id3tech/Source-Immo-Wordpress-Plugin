<?php
class SourceImmoPageBuilder{
    public $layout = '';
    public $rendered_once = false;
    public $type = '';
    public $page_template_rendered = false;
    public $locale = 'en';

    public function __construct($type){
        $this->type = $type;
        $this->layout = SourceImmo::current()->get_detail_layout($type);
        $this->locale = substr(get_locale(),0,2);
        
        //echo('layout:' . );

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

    public function getLayoutPage($page_id){
        $post = null;

        if(is_numeric($page_id)) {
            $post = get_post($page_id);
            if($post !== null) return $post;
        }

        if(is_string($page_id)){ 
            $post = get_page_by_path($page_id);
            
            if($post !== null) return $post;
        }

        // try to find the post 
        $layoutPageMap = [
            'listing' => [ 'en' => ['listing-details'], 'fr' => ['details-dune-propriete','details-de-propriete','propriete-details']],
            'broker' => ['en' => ['broker-details'], 'fr' => ['details-dun-courtier','details-de-courtier','courtier-details']],
            'office' => ['en' => ['listings-details'], 'fr' => ['details-dun-bureau','details-de-bureau','bureau-details']],
        ];

        if(isset($layoutPageMap[$this->type])){
            $layoutList = $layoutPageMap[$this->type][$this->locale];
            
            foreach ($layoutList as $layoutPage) {
                if($post !== null) continue;

                $post = get_page_by_path($layoutPage);
                //__c($layoutPage, $post);
            }

        }

        return $post;
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
        global $wp_query;
        

        //__c($wp_query->is_home);

        $page_template = '';
        if($page_id !== null){
            if(is_numeric($page_id)){
                $page_template = get_page_template_slug($page_id);
            }
        }
        $page_template = apply_filters('si/page_builder/get_page_template',$page_template);
        

        if($page_template != '' && $page_template !== false){ 
            //echo($page_template);
            return $page_template;
        }

        //$templateFiles = wp_get_theme()->get_files('php',0,true);
        $page_template_list = ['page.php','single.php','index.php'];
        $path = locate_template($page_template_list);
        if($path != '') return $path;
        // $priorityList = array('page','single','index');

        // foreach ($priorityList as $pageName) {
        //     foreach($templateFiles as $template => $path){
        //         if($template== $pageName . '.php'){
        //             return $path;
        //         }
        //     }
        // }

        return null;
    }

    public function getSingleControllerName(){
        $normalizeType = ucfirst($this->type);
        return "single{$normalizeType}Ctrl";
    }
    public function getSingleClassName(){
        $normalizeType = strtolower($this->type);
        return "{$normalizeType}-single";
    }

    public function render(){
        $page_id = isset($this->layout->page) ? $this->layout->page : null;
        global $post; 

        $post = $this->getLayoutPage($page_id);

        if($post !== null) $page_id = $post->ID;

        do_action('si_page_builder_prerender', $page_id);

        $pageTemplate = $this->get_page_template($page_id);
       
        $isolation = SourceImmo::current()->get_isolation($this->type);
        if($isolation != 'ISOLATE'){
            add_filter( 'body_class',function($classes){
                $className = $this->getSingleClassName();
                $classes[] = "{{model!=null?'si-loaded':''}} si-single-content {$className}";
                return $classes;
            }, 1 );
            
            add_filter( 'si/page-builder/body-attributes', function($attrs){
                $ref_number = get_query_var( 'ref_number');
                $controllerName = $this->getSingleControllerName();

                $attrs["data-ng-controller"] = $controllerName;
                $attrs["data-ng-init"] = "init('{$ref_number}')";
                $attrs["ng-cloak"] = '';

                return $attrs;
            });

            $body_start_actions = apply_filters('si/page-builder/body-start',[]);
            
            if(!did_action('si/page-builder/body-start-begin')){
                $body_start_actions[] = 'wp_body_open';
            }

            if(count($body_start_actions) > 0){
                foreach ($body_start_actions as $action) {
                    add_action( $action, function() {
                        $ref_number = get_query_var( 'ref_number');
                        $controllerName = $this->getSingleControllerName();
                        $className = $this->getSingleClassName();
                        $controller = "<div data-ng-controller=\"{$controllerName}\" ng-cloak data-ng-init=\"init('{$ref_number}')\" class=\"{{model!=null?'si-loaded':''}} si-single-content {$className}\"><div class=\"si-content\">";
                        echo($controller);
                    } );
                }
            }

            $body_end_actions = apply_filters('si/page-builder/body-end',[]);
            if(count($body_start_actions)>0 && count($body_end_actions) == 0){
                $body_end_actions[] = 'wp_footer';
            }
            
            foreach ($body_end_actions as $action) {
                add_action( $action, function() {
                    echo("</div></div>");
                } );
            }
        }

        if($pageTemplate == null){
            wp_head();
        }
        
        
        if(($post != null && $post->post_content == '') || ($post != null && $post->post_type != 'page')){
            
            $post->post_content = "[si_{$this->type}]";
            
        }
        

        
        $this->setupPost($post);
        

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
                //do_action('si/single-page-begin', 'singleListingCtrl');
                include($pageTemplate);
                //do_action('si/single-page-end');
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
        do_action('si_page_builder_postrender', $page_id);
    }

    
    public function start_of_template($loadingText = null){
        if($this->page_template_rendered) return;
        if(did_action('si_start_of_template') === 1){
            if($loadingText != null){
                echo('<label class="si-placeholder"  data-ng-show="model==null">' .  __($loadingText,SI) . ' <i class="fal fa-spinner fa-spin"></i></label>');
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

    function setupPost(&$postOrId = null){
        global $wp_query, $post;
        $page_id = '';
        // $share_tool = new SiSharing($listing_data);
        // $share_tool->addHook('listing');
        
        // $permalink = $share_tool->getPermalink();
        if(is_string($postOrId) || is_int($postOrId)){
            $post = get_post($postOrId);
            $page_id = $postOrId;
        }
        elseif($post != null){
            $post = $postOrId;
            $page_id = $postOrId->ID;
        }
        //
        if($post == null) return;
        
        
        $page_title = apply_filters('si_page_title', $post->page_title);
        $post->post_title = $page_title;
        $post->post_type = 'page';
        
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
            $wp_query->is_single = true; 
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

function siShowDirectItemLayer($item, $configs,$layerName="main"){

    $path = apply_filters("si/{$configs->type}/layer/{$layerName}", SI_PLUGIN_DIR . "views/list/{$configs->type}/direct/item-layer.php");

    $styles = [];
    $classes = ['si-layer', 'si-' . $layerName . '-layer'];
    
    $linkButtonLabel = _si_label('Learn more');
    
    if($layerName != 'main' && isset( $configs->list_item_layout->secondary_layer_bg_opacity)){
        $styles[] = '--bg-opacity:' . ($configs->list_item_layout->secondary_layer_bg_opacity/100);
        if($configs->list_item_layout->secondary_layer_bg_opacity < 100){
            $classes[] = 'si-padding';
        }
    }

    $rendererClassName = 'siLayerVar';
    $typedRendererClassName = 'si'.ucfirst($configs->type).'LayerVar';
    if(class_exists($typedRendererClassName)) $rendererClassName = $typedRendererClassName;


    if($rendererClassName::isSimple($configs->list_item_layout->displayed_vars->main)){
        $configs->list_item_layout->displayed_vars->main = $rendererClassName::updateToComplex($configs->list_item_layout->displayed_vars->main, $configs->type);
    }
    if(in_array($configs->type, ['listings','brokers'])){
        if(!$rendererClassName::has('photo',$configs->list_item_layout->displayed_vars->main)){
            $configs->list_item_layout->displayed_vars->main = $rendererClassName::updateToComplex($configs->list_item_layout->displayed_vars->main, $configs->type);
        }
    }


    echo('<div class="' . implode(' ', $classes) . '" style="' . implode(';',$styles) . '">');
    echo('<div class="si-layer-content">');
    
    siShowLayerVars($configs->list_item_layout->displayed_vars->{$layerName},$item, $configs->type);

    if($layerName == 'main'){
        if($configs->type == 'listings'){
            if(isset($configs->list_item_layout->displayed_vars->secondary) && !siLayerVar::has('flags', $configs->list_item_layout->displayed_vars->secondary)){
                $varRenderer = new siLayerVar('flags');
                $varRenderer->renderWithData($item);
            }
            else if(!siLayerVar::has('flags', $configs->list_item_layout->displayed_vars->main)){
                $varRenderer = new siLayerVar('flags');
                $varRenderer->renderWithData($item);
            }
        }
    }

    //include $path;
    echo('</div>');
    echo('</div>');
}

function siShowStandardItemLayer($configs,$layerName="main"){

    $path = apply_filters("si/{$configs->type}/layer/{$layerName}", SI_PLUGIN_DIR . "views/list/{$configs->type}/standard/item-layer.php");

    $styles = [];
    $classes = ['si-layer', 'si-' . $layerName . '-layer'];
    
    $linkButtonLabel = _si_label('Learn more');
    
    if($layerName != 'main' && isset( $configs->list_item_layout->secondary_layer_bg_opacity)){
        $styles[] = '--bg-opacity:' . ($configs->list_item_layout->secondary_layer_bg_opacity/100);
        //if($configs->list_item_layout->secondary_layer_bg_opacity < 100){
        //    $classes[] = 'si-padding';
        //}
    }

    echo('<div class="' . implode(' ', $classes) . '" style="' . implode(';',$styles) . '">');
    echo('<div class="si-layer-content">');
    //include $path;
    
    $rendererClassName = 'siLayerVar';
    $typedRendererClassName = 'si'.ucfirst($configs->type).'LayerVar';
    if(class_exists($typedRendererClassName)) $rendererClassName = $typedRendererClassName;
    
    if($rendererClassName::isSimple($configs->list_item_layout->displayed_vars->main) || !$rendererClassName::has('photo',$configs->list_item_layout->displayed_vars->main)){
        $configs->list_item_layout->displayed_vars->main = $rendererClassName::updateToComplex($configs->list_item_layout->displayed_vars->main, $configs->type);
    }

    siShowLayerVars($configs->list_item_layout->displayed_vars->{$layerName},null, $configs->type);

    if($layerName == 'main'){
        if($configs->type == 'listings'){
            if(isset($configs->list_item_layout->displayed_vars->secondary) && !siLayerVar::has('flags', $configs->list_item_layout->displayed_vars->secondary)){
                $varRenderer = new siLayerVar('flags');
                $varRenderer->render();
            }
            // Check listings mandatory vars: flags or tags must be present
            else if(!siLayerVar::has('flags', $configs->list_item_layout->displayed_vars->main) && !siLayerVar::has('tags', $configs->list_item_layout->displayed_vars->main)){
                $varRenderer = new siLayerVar('flags');
                $varRenderer->render();
            }
        }
    }

    echo('</div>');
    echo('</div>');
}

function siShowLayerVars($varList, $data=null, $type=null){
    $rendererClassName = 'siLayerVar';
    $typedRendererClassName = 'si'.ucfirst($type).'LayerVar';
    if(class_exists($typedRendererClassName)) $rendererClassName = $typedRendererClassName;
    
    foreach ($varList as $varItem) {
        $varRenderer = new $rendererClassName($varItem,false);
        if($data == null) $varRenderer->render();
        if($data != null) $varRenderer->renderWithData($data);
    }
}

class siLayerVar{
    protected $key;
    protected $classes;
    protected $items;
    protected $is_sub;
    protected $data;
    protected $type = 'default';
    protected $fallback;
    protected $style = null;
    protected $label = null;
    protected $varType = 'preset';
    protected $options = null;
    

    function __construct($src, $is_sub=false){
        $this->classes = [];
        $this->items = [];
        $this->is_sub = $is_sub;
        

        if(is_string($src)){
            $this->key = $src;
        }
        else{
            $this->key = $src->key;
            
            if(isset($src->classes)) $this->classes = is_array($src->classes) ? $src->classes   :  [$src->classes];
            if(isset($src->items)) $this->items = $src->items;
            if(isset($src->fallback)) $this->fallback = $src->fallback;
            if(isset($src->style)) $this->style = $src->style;
            if(isset($src->label)) $this->label = $src->label;
            if(isset($src->var_type)) $this->varType = $src->var_type;
            if(isset($src->options)) $this->options = $src->options;
        }

        $this->key = str_replace('listing_count', 'counters', $this->key);
    }

    static function has($key, $varList){
        if($varList == null) return false;
        if(arr_empty($varList)) return false;

        foreach ($varList as $var) {
            if(is_string($var) && $var == $key) return true;
            if(isset($var->key) && $var->key == $key) return true;
        }

        //echo('var ' . $key . ' not found' );
        return false;
    }
    static function isSimple($varList){
        
        if(!is_array($varList)) return true;
        return is_string($varList[0]);
    }

    static function updateToComplex($varList){
        //if(method_exists('siLayerVar', 'updateToComplex' . ucfirst($type))) return siLayerVar::{'updateToComplex' . ucfirst($type)}($varList);

        return $varList;
    }
    

    
    function render(){
        

        $preventTranslateFor = ['first_name','last_name','fullname','city','address','office','name'];
        if(in_array($this->key, $preventTranslateFor)){ $this->classes[] = 'notranslate'; }

        $renderMethods = ['render_' . $this->key, 'render_default'];
        if($this->varType === 'custom'){
            
            $this->render_raw($this->key, $this->options->content);
            return;
        }
        foreach ($renderMethods as $methodName) {
            
            if(method_exists($this, $methodName)){
                
                $renderResult = $this->{$methodName}();
                if(isset($this->fallback) && !str_null_or_empty($this->fallback)){
                    $this->renderTemplate($this->fallback);
                }
                return $renderResult;

            }
            else{
                //echo($methodName . ' for ' . $this->key . ' does not exists');
            }

        }
        
    }

    function renderWithData($data){
        $this->data = $data;
        $this->render();
    }

    function getAttributes($applyHideEmpty=true){
        $attributes = [];
        $styles = [];

        if(!in_array('si-float-anchor',$this->classes)){ 
            $attributes[] = 'si-anchor-to="si-float-anchor"'; 
            $classeList = implode(' ',$this->classes);

            if($applyHideEmpty){
                if(strpos($classeList,'si-float-') !== false) { 
                    $attributes[] = 'si-hide-empty="hard"';
                }
                else if(isset($this->fallback) && !str_null_or_empty($this->fallback)){
                    $attributes[] = 'si-hide-empty="fallback"';
                }
            }
        }

        if($this->key == 'group'){
            $styles[] = '--items-count:' . count($this->items);
        }

        if(isset($this->style)){
            $styles[] = $this->style;
        }

        if(isset($this->fallback) && !str_null_or_empty($this->fallback)){
            //$attributes[] = 'si-fallback-content="si-fallback-' . $this->key . '"';
        }

        if(count($styles) > 0){
            $attributes[] = 'style="' . implode(';', $styles) . '"';
        }
        
        
        return implode(' ', $attributes);
    }

    function getValue($keyPath, $default = '', $filterFn=null){
        if(!is_array($keyPath)) $keyPath = [$keyPath];

        if($this->data != null){
            $value = null;
            foreach ($keyPath as $path) {
                $value = array_reduce(explode('.', $path), function ($o, $p) { 
                    if($o == null) return $o;
                    if(isset($o->$p)) return $o->$p; 
                    return null;

                }, $this->data);

                if($value != null){
                    if($filterFn != null) return '{{\'' . $value . '\' | ' . $filterFn . '}}';
                    return apply_filters('si/label', $value);
                }
            }
            return $default;
        }
        else{
            $value = array_reduce($keyPath, function ($arr, $path) { 
                $arr[] = 'item.' . $path;
                return $arr; 
            }, []);

            if($filterFn != null) return '{{' . implode(' || ',$value) . ' | ' . $filterFn . '}}';
            return '{{' . implode(' || ',$value) . '}}';
        }
    }

    function renderTemplate($key){
        $method = $key;
        if(!method_exists($this, 'render_' . $method)) {
            $method = 'default';
        }

        echo('<div class="si-fallback-content">');
        $this->{'render_' . $method}($key);
        echo('</div>');
        
    }
    
    function render_default($key=null){
        if($key == null) $key = $this->key;
        if(arr_empty($this->classes) && !$this->is_sub) $this->classes[] = 'si-padding-inline';
        $keyClass = str_replace('_','-', $key);
        $classes = implode(' ',$this->classes);
        
        echo "<div class=\"si-label {$classes} {$keyClass} \" {$this->getAttributes()}>{$this->getValue($key)}</div>";
    }

    function render_raw($key=null, $rawContent=null){
        if($key == null) $key = $this->key;
        if(arr_empty($this->classes) && !$this->is_sub) $this->classes[] = 'si-padding-inline';
        $keyClass = str_replace('_','-', $key);
        $classes = implode(' ',$this->classes);
        
        $content = '';
        $locale = si_get_locale();
        if($rawContent != null){
            if(isset($rawContent->{$locale})){
                $content = $rawContent->{$locale};
            }
        }
        if($content != ''){
            if($this->data != null){
                // parse $content and replace {{value}} with real data
                preg_match_all("/(\{\{([^\}]+)\}\})/m", $content, $matches);
                //__c($matches);
                foreach ($matches[2] as $value) {
                    $path = str_replace('item.', '', $value);
                    $dataValue = $this->getValue($path);
                    if (strtotime($dataValue) !== false) $dataValue = date('Y-m-d',strtotime($dataValue));
                    $content = str_replace('{{' . $value . '}}', $dataValue, $content);
                }
            }

            echo "<div class=\"si-label {$classes} {$keyClass} \" {$this->getAttributes()}>{$content}</div>";
        }
    }

    function render_spacer(){
        $classes = implode(' ',$this->classes);
        echo "<div class=\"si-label-spacer {$classes}\" {$this->getAttributes()}></div>";
    }

    function render_group(){
        $classes = implode(' ',$this->classes);
        $rendererClassName = 'siLayerVar';
        $typedRendererClassName = 'si'.ucfirst($this->type).'LayerVar';
        if(class_exists($typedRendererClassName)) $rendererClassName = $typedRendererClassName;

        echo "<div class=\"si-label-group {$classes}\" {$this->getAttributes()}>";
        foreach ($this->items as $subvar) {
            $varRenderer = new $rendererClassName($subvar, true);
            //$varRenderer->type = $this->type;
            if($this->data == null) $varRenderer->render();
            if($this->data != null) $varRenderer->renderWithData($this->data);
        }
        echo "</div>";
    }

    function render_namex(){
        $key = 'name';
        if(arr_empty($this->classes) && !$this->is_sub) $this->classes[] = 'si-padding-inline';
        $keyClass = str_replace('_','-', $key);
        $classes = implode(' ',$this->classes);
        $value = $this->getValue($key);
        if(strpos($value, '(') !== false){
            
            $pattern = '/\((.*?)\)/';
            preg_match($pattern, $value, $matches);
            $value = $matches[1];
        }
        
        echo "<div class=\"si-label {$classes} {$keyClass} \" {$this->getAttributes()}>{$value}</div>";
    }

    function render_tags(){

        $list = 'item.tags';
        if($this->data != null){
            $list = str_replace('"', "'", json_encode($this->data->tags));
        }
        $classes = implode(' ', $this->classes);

        ?>
        <div class="si-tags-container <?php echo $classes ?>" <?php echo $this->getAttributes() ?>>
            <si-tags list="<?php echo $list ?>"></si-tags>
        </div>
        <?php
    }

    function render_photo(){
        ?>
        <div si-lazy-load class="si-image si-lazy-loading <?php echo implode(' ', $this->classes) ?>" <?php echo $this->getAttributes() ?>>
            <img data-si-src="<?php echo $this->getValue('photo_url') ?>" data-si-srcset="<?php echo $this->getValue('photo_url') ?>" />
        </div>         
        <?php
    }

    function render_open_houses(){
        //if(arr_empty($this->classes) && !$this->is_sub) $this->classes[] = 'si-padding-inline';
        ?>
        <div class="si-label si-open-houses <?php echo implode(' ', $this->classes) ?>" <?php echo $this->getAttributes() ?> si-hide-empty="hard">
            <div class="si-open-house-item">
                <i class="fal fa-calendar-alt"></i> <span>{{'Open house'.translate()}}</span> <span am-time-ago="item.open_houses[0].start_date"></span>
            </div>
        </div>
        <?php
    }

    function render_city(){
        //if(arr_empty($this->classes) && !$this->is_sub) $this->classes[] = 'si-padding-inline';
        $classes = implode(' ',$this->classes);
        echo "<div class=\"si-label si-city {$classes}\" {$this->getAttributes()}>{$this->getValue('location.city')}</div>";
    }

    function render_address(){
        //if(arr_empty($this->classes) && !$this->is_sub) $this->classes[] = 'si-padding-inline';
        $classes = implode(' ',$this->classes);
        echo "<div class=\"si-label si-address {$classes}\" {$this->getAttributes()}>{$this->getValue('location.civic_address')}</div>";
    }

    function render_price(){
        //if(arr_empty($this->classes) && !$this->is_sub) $this->classes[] = '';
        $price = ($this->data == null) ? '{{formatPrice(item) || "&nbsp;"}}' : $this->data->price_text;
        $classes = implode(' ',$this->classes);
        
        if($price == '' || $price == null) $price = '&nbsp;';

        echo "<div class=\"si-label {$classes} si-price\" {$this->getAttributes()}>{$price}</div>";
        echo "<div class=\"si-label {$classes} si-price-sold\" {$this->getAttributes()}>{$price}</div>";
        
    }

    
    function render_phone(){
        
        $classes = implode(' ',$this->classes);
        $phoneValue = $this->getValue(['phones.mobile', 'phones.office']);

        echo "<div class=\"si-label si-phone {$classes}\" {$this->getAttributes()} si-scope-href=\"tel:" . $phoneValue . "\">";
        echo "<i class=\"si-icon fal fa-fw fa-phone\"></i> <span class=\"si-prefix\">" . _si_label('mobile') . "</span> <span class=\"si-label\">";
        echo $phoneValue;
        echo "</span>";
        echo "</div>";
    }

    function render_phones(){
        $mobileValue = $this->getValue('phones.mobile');
        $officeValue = $this->getValue('phones.office');
        $mobileTest = ($this->data == null) ? 'item.phones.mobile' : "'' != '{$mobileValue}'";
        $officeTest = ($this->data == null) ? 'item.phones.office' : "'' != '{$officeValue}'";

        $classes = implode(' ',$this->classes);
        
        echo "<div class=\"si-label si-phone-list {$classes}\" {$this->getAttributes()}>";
        ?>
        <div class="si-phone mobile" ng-if="<?php echo $mobileTest ?>" title="<?php si_label('mobile') ?>: <?php echo $mobileValue ?>" si-scope-href="tel:<?php echo $mobileValue ?>">
            <i class="si-icon fal fa-fw fa-mobile"></i> <span class="si-prefix"><?php si_label('mobile') ?>:</span> <span class="si-label"><?php echo $mobileValue ?></span>
        </div>
        <div class="si-phone office" ng-if="<?php echo $officeTest ?>" title="<?php si_label('office') ?>: <?php echo $officeValue ?>" si-scope-href="tel:<?php echo $officeValue ?>">
            <i class="si-icon fal fa-fw fa-building"></i> <span class="si-prefix"><?php si_label('office') ?>:</span> <span class="si-label"><?php echo $officeValue ?></span>
        </div>
        <?php
        echo "</div>";
    }


    function render_email(){
        $classes = implode(' ',$this->classes);
        echo "<div class=\"si-label si-email {$classes}\" {$this->getAttributes()}>{$this->getValue('email')}</div>";
    }

    
    function render_contacts(){
        $phoneValue = $this->getValue(['phones.mobile', 'phones.office']);
        $emailValue = $this->getValue('email');

        $emailTest = ($this->data == null) ? 'item.email' : "'' != '{$emailValue}'";
        ?>
        <div class="si-label <?php echo implode(' ', $this->classes) ?>" <?php echo $this->getAttributes() ?>>
            <div class="si-contacts ">
                <div class="si-contact si-phone" title="<?php echo $phoneValue ?>">
                    <i class="si-icon fal fa-fw fa-phone" si-scope-href="tel:<?php echo $phoneValue ?>"></i>
                    <span class="si-prefix"><?php si_label('Phone') ?>:</span>
                    <span class="si-label"><?php echo $phoneValue ?></span>
                </div>
                <div class="si-contact si-email" ng-if="<?php echo $emailTest ?>" title="<?php echo $emailValue ?>" si-scope-href="mailto:<?php echo $emailValue ?>">
                    <i class="si-icon fal fa-fw fa-envelope"></i>
                    <span class="si-prefix"><?php si_label('Email') ?>:</span>
                    <span class="si-label si-text-truncate"><?php echo $emailValue ?></span>
                </div>
            </div>
        </div>
        <?php
    }
    
    
    function render_rooms(){
        //if(arr_empty($this->classes) && !$this->is_sub) $this->classes[] = 'si-padding-inline';
        $classes = implode(' ',$this->classes);

        echo "<div class=\"si-label {$classes}\" {$this->getAttributes()}>";
        echo '<div class="si-rooms">';

        if($this->data == null){
            echo '<div class="si-room {{icon}}" ng-repeat="(icon,room) in item.counters.rooms"><i class="si-icon fal fa-fw fa-{{icon}}"></i> <span class="si-count">{{room.count}}</span> <span class="si-label">{{room.label.translate()}}</span></div>';
        }
        else{
            if(isset($this->data->counters->rooms)){
                foreach ($this->data->counters->rooms as $icon => $room) {
                    echo('<div class="si-room ' . $icon . '"><i class="si-icon fal fa-fw fa-' . $icon . '"></i> <span class="si-count">' . $room->count . '</span> <span class="si-label">' . $room->label . '</span></div>');
                }
            }
        }
        echo('</div></div>');
    }

    function render_flags(){
        if(!isset($this->classes)){
            $this->classes = ['si-padding'];
        }
        global $siLexicon;
        ?>
        <div class="si-flags <?php echo implode(' ', $this->classes) ?>" <?php echo $this->getAttributes() ?>>
            <div class="si-flag video"><i class="si-icon far fa-video" title="{{'Video'.translate()}}"></i> <span class="si-label">{{'Video'.translate()}}</span></div>
            <div class="si-flag virtual-tour"><i class="si-icon far fa-vr-cardboard" title="{{'Virtual tour'.translate()}}"></i> <span class="si-label">{{'Virtual tour'.translate()}}</span></div>
            <div class="si-flag new-item"><i class="si-icon far fa-star" title="{{'New'.translate()}}"></i> <span class="si-label">{{'New'.translate()}}</span></div>
        </div>
        <?php
    }

    function render_counters(){
        $classes = implode(' ', $this->classes);

        $listingValue = $this->getValue('listings_count', 0);
        $listingTest = ($this->data == null) ? 'item.listings_count>0' : "{$listingValue}>0";
        ?>
        <div class="si-label si-counters <?php echo $classes ?>" <?php echo $this->getAttributes() ?>>
            <div class="si-counter" ng-if="<?php echo $listingTest ?>"><i class="icon fal fa-fw fa-home"></i> <span class="si-count"><?php echo $listingValue ?></span> <span class="si-label"><lstr>listings</lstr></span></div>
        </div>
        <?php
    }

    function render_available_area(){
        $classes = implode(' ', $this->classes);
        $value = $this->getValue('available_area','','number');
        $unit = $this->getValue('available_area_unit');

        echo("<div class=\"si-label available_area {$classes}\" {$this->getAttributes()} >{$value} {$unit}</div>");
    }

    function render_link_button(){
        $linkButtonLabel = __('Learn more',SI);
        if(isset($this->label)){ 
            $lang = si_get_locale();
            
            if(isset($this->label->{$lang})) {
                $linkButtonLabel = $this->label->{$lang};
            }
        }
        $linkButtonLabel = apply_filters('si/list-item/link-button-label', $linkButtonLabel );

        $classes = implode(' ', $this->classes);

        echo('<div class="si-item-link-button ' . $classes . '" ' . $this->getAttributes(false) . '>');
        echo("<span class=\"si-button\">{$linkButtonLabel}</span>");
        echo('</div>');
    }

}

class siBrokersLayerVar extends siLayerVar{
    function __construct($src, $is_sub=false){
        parent::__construct($src,$is_sub);
        $this->type = 'brokers';
    }

    
    function render_address(){
        //if(arr_empty($this->classes) && !$this->is_sub) $this->classes[] = 'si-padding-inline';
        $classes = implode(' ', $this->classes);
        echo("<div class=\"si-label office-address {$classes}\" {$this->getAttributes()}>");
        echo("<div class=\"si-text-truncate\" itemprop=\"streetAddress notranslate\">{$this->getValue('office.location.street_address')}</div>");
        echo("<div itemprop=\"city notranslate\">{$this->getValue('office.location.city')}</div>");
        echo("<div><span>{$this->getValue('office.location.state')}</span>, <span>{$this->getValue('office.location.address.postal_code')}</span></div>");
        echo("</div>");
    }

    function render_office(){
        $classes = implode(' ',$this->classes);
        $office_prefix = apply_filters('si/office/name-prefix', '');

        echo "<div class=\"si-label office {$classes}\" {$this->getAttributes()}>{$office_prefix}{$this->getValue('office.name')}</div>";
    }

    function render_agency_name(){
        $classes = implode(' ',$this->classes);
        echo "<div class=\"si-label agency-name {$classes}\" {$this->getAttributes()}>{$this->getValue('office.agency.name')}</div>";
    }

    function render_agency_license(){
        $classes = implode(' ',$this->classes);
        echo "<div class=\"si-label agency-license {$classes}\" {$this->getAttributes()}>{$this->getValue('office.agency.license_type')}</div>";
    }

    function render_license_type(){
        $classes = implode(' ',$this->classes);
        $filter = 'siApplyGenre';
        if($this->data == null) {
            $filter .= ': item.ref_number';
            $filter .= ': item.genre';
        }
        else {
            $filter .= ": '{$this->data->ref_number}'";
            $filter .= ": '{$this->data->genre}'";
        }

        echo "<div class=\"si-label license-type {$classes}\" {$this->getAttributes()}>{$this->getValue('license_type','', $filter)}</div>";
    }
    function render_title(){
        $classes = implode(' ',$this->classes);
        $filterGenre = 'siApplyGenre';
        $filterTitle = 'siBrokerTitle';
        
        if($this->data == null) {
            $filterGenre .= ': item.ref_number';
            $filterTitle .= ': item.ref_number';
            $filterGenre .= ': item.genre';
        }
        else {
            $filterGenre .= ": '{$this->data->ref_number}'";
            $filterTitle .= ": '{$this->data->ref_number}'";
            $filterGenre .=  isset($this->data->genre) ? ": '{$this->data->genre}'" : ": ''";
        }

        $filters = [$filterGenre, $filterTitle];


        echo "<div class=\"si-label title {$classes}\" {$this->getAttributes()}>{$this->getValue(['title','license_type'],'',implode(' | ',$filters))}</div>";
    }


    static function updateToComplex($varList){

        return json_decode(json_encode([
            ['key' => 'photo', 'classes' => 'si-float-anchor'],
            [
                'key' => 'group', 
                'classes' => 'si-background-high-contrast si-padding si-text-align-center', 
                'items' => [
                    ['key'=>'first_name', 'classes' => 'si-text-truncate si-text-upper'],
                    ['key'=>'last_name', 'classes' => 'si-text-truncate si-font-emphasis si-text-upper'],
                    ['key'=>'title', 'classes' => 'si-text-small si-text-truncate']
                ]
            ],
            ['key' => 'phone', 'classes' => 'si-padding si-big-emphasis si-text-align-center']
        ]));
    }

}

class siOfficesLayerVar extends siLayerVar{
    function __construct($src, $is_sub=false){
        parent::__construct($src,$is_sub);
        $this->type = 'offices';
    }

    
    function render_address(){
        //if(arr_empty($this->classes) && !$this->is_sub) $this->classes[] = 'si-padding-inline';
        $classes = implode(' ', $this->classes);
        echo("<div class=\"si-label office-address address {$classes}\" {$this->getAttributes()}>");
        echo("<div class=\"si-text-truncate\" itemprop=\"streetAddress notranslate\">{$this->getValue('location.street_address')}</div>");
        echo("<div itemprop=\"city notranslate\">{$this->getValue('location.city')}</div>");
        echo("<div><span>{$this->getValue('location.state')}</span>, <span>{$this->getValue('location.address.postal_code')}</span></div>");
        echo("</div>");

    }

    function render_agency_name(){
        $classes = implode(' ',$this->classes);
        echo "<div class=\"si-label agency-name {$classes}\" {$this->getAttributes()}>{$this->getValue('agency.name')}</div>";
    }

    function render_counters(){
        $classes = implode(' ',$this->classes);
        $listingValue = $this->getValue('listings_count', 0);
        $listingTest = ($this->data == null) ? 'item.listings_count>0' : "{$listingValue}>0";
        $brokerValue = $this->getValue('brokers_count', 0);
        $brokerTest = ($this->data == null) ? 'item.brokers_count>0' : "{$brokerValue}>0";
        ?>
        <div class="si-label si-counters <?php echo  $classes ?>" <?php echo $this->getAttributes() ?> >
            <div class="si-counter" ng-if="<?php echo $listingTest ?>"><i class="si-icon fal fa-fw fa-home"></i> <span class="si-count"><?php echo $listingValue ?></span> <span class="si-label"><lstr>listings</lstr></span></div>
            <div class="si-counter" ng-if="<?php echo $brokerTest ?>"><i class="si-icon fal fa-fw fa-user-tie"></i> <span class="si-count"><?php echo $brokerValue ?></span> <span class="si-label"><lstr>brokers</lstr></span></div>
        </div>
        <?php
    }

    static function updateToComplex($varList){

        return json_decode(json_encode([
            ['key' => 'name', 'classes' => 'si-padding si-background-high-contrast si-big-emphasis si-text-align-center'],
            [
                'key' => 'group', 
                'classes' => 'si-padding si-text-align-center si-layout-fill', 
                'items' => [
                    ['key'=>'agency_name', 'classes' => 'si-text-truncate si-padding si-space-emphasis si-text-upper'],
                    ['key'=>'address'],
                    ['key'=>'spacer'],
                    ['key'=>'phone']
                ]
            ],
            ['key' => 'counters', 'classes' => 'si-padding si-background-small-contrast si-weight-emphasis si-text-align-center'],
            
        ]));
    }

    function render_phone(){
        
        $classes = implode(' ',$this->classes);
        $phoneValue = $this->getValue(['phones.office_toll_free', 'phones.office']);

        echo "<div class=\"si-label si-phone {$classes}\" {$this->getAttributes()} si-scope-href=\"tel:" . $phoneValue . "\">";
        echo "<i class=\"si-icon fal fa-fw fa-phone\"></i> <span class=\"si-prefix\">" . _si_label('toll free') . "</span> <span class=\"si-label\">";
        echo $phoneValue;
        echo "</span>";
        echo "</div>";
    }
}

class siAgenciesLayerVar extends siOfficesLayerVar{
    function __construct($src, $is_sub=false){
        parent::__construct($src,$is_sub);
        $this->type = 'agencies';
    }

    function render_license_type(){
        $classes = implode(' ',$this->classes);
        echo "<div class=\"si-label si-license-type {$classes}\" {$this->getAttributes()}>{$this->getValue('license_type')}</div>";
    }
    function render_license(){
        return $this->render_license_type();
    }

    static function updateToComplex($varList){

        return json_decode(json_encode([
            [
                'key' => 'group', 
                'classes' => 'si-padding si-background-high-contrast si-text-align-center',
                'items' => [
                    ['key' => 'name', 'classes' => 'si-big-emphasis si-text-truncate'],
                    ['key'=>'license', 'classes' => 'si-text-truncate si-text-small si-text-upper'],
                ]
            ],
            [
                'key' => 'group', 
                'classes' => 'si-padding si-text-align-center si-layout-fill', 
                'items' => [
                    ['key'=>'address'],
                    ['key'=>'phone']
                ]
            ],
            ['key' => 'counters', 'classes' => 'si-padding si-background-small-contrast si-weight-emphasis si-text-align-center'],
        ]));
    }
}


class siListingsLayerVar extends siLayerVar{
    function __construct($src, $is_sub=false){
        parent::__construct($src,$is_sub);
        $this->type = 'listings';
    }

    static function updateToComplex($varList){
        $complexDef = [
            [
                'key' => 'group', 
                'classes' => 'si-background-high-contrast si-padding', 
                'items' => [
                    ['key'=>'address', 'classes' => 'si-text-truncate si-text-upper'],
                    ['key'=>'city', 'classes' => 'si-text-truncate']
                ]
            ],
            ['key' => 'photo', 'classes' => 'si-float-anchor'],
            ['key' => 'price', 'classes' => 'si-background-small-contrast si-padding si-big-emphasis'],
            [
                'key' => 'group', 
                'classes' => 'si-padding', 
                'items' => [
                    ['key' => 'category', 'classes' => 'si-font-emphasis'],
                    ['key' => 'subcategory', 'classes' => 'si-text-truncate'],
                    ['key' => 'rooms']
                ]
            ],
            ['key' => 'open_houses', 'classes' => 'si-background-highlight si-padding si-big-emphasis si-float-bottom'],
            ['key' => 'flags', 'classes' => 'si-float-top-right si-padding si-padding-size-slim']
        ];

        return json_decode(json_encode($complexDef));
    }
}

class siCitiesLayerVar extends siLayerVar{
    function __construct($src, $is_sub=false){
        parent::__construct($src,$is_sub);
        $this->type = 'cities';
    }

    function render_region(){
        $classes = implode(' ',$this->classes);
        echo("<div class=\"si-region si-label {$classes}\" {$this->getAttributes()} ");
        echo('itemscope itemtype="http://schema.org/Place" itemprop="containedInPlace"');
        echo("<span itemprop=\"name\">{$this->getValue('location.region')}</span>");
        echo('</div>');
    }

    static function updateToComplex($varList){

        return json_decode(json_encode([
            [
                'key'=>'group',
                'classes' => 'si-text-align-center si-padding si-background-high-contrast',
                'items' => [
                    ['key' => 'name', 'classes' => 'si-big-emphasis si-text-truncate'],
                    ['key' => 'region'],
                ]
            ],
            ['key' => 'counters', 'classes' => 'si-padding si-background-small-contrast si-weight-emphasis si-text-align-center'],
        ]));
    }
}