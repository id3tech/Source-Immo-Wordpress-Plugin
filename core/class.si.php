<?php
/*
Start up class for SourceImmo
*/
if(!defined('SI_API_HOST')){
  define('SI_API_HOST', 'https://api-v1.source.immo');
  //define('SI_API_HOST', 'https://source-immo-api-v1-staging.azurewebsites.net/');
}

class SourceImmo {
  
  
  public $configs = null;

  public $locales = null;

  public $addons = null;

  public $modules = null;


  public function __construct(){
    $this->configs = SourceImmoConfig::load();

    $this->addons = new SourceImmoAddons;

    //if (!is_admin() ){
      // create an instance of the shortcodes class to force code bindings
      new SiShorcodes();
    //}
  }

  /**
  * Initializes WordPress hooks
  */
  private function init_hooks() {
    
    // add custom translation
    add_filter( 'gettext', array($this, 'translate'), 20, 3 );
    add_filter( 'si-city-name', array($this, 'format_city_name'),10,2);

    $this->register_filters(array(
      // add route rules
      //'init' => 'apply_routes',
      'query_vars' => 'update_routes_query_var',
      'rewrite_rules_array' => 'update_routes',
      'locale' => 'detect_locale',
      'wp_get_nav_menu_items' => 'exclude_menu_pages'
    ));
    $this->register_actions(array(
      'template_redirect',
      'after_setup_theme' => 'detect_locale'
    ));

    if (!is_admin() ){
      $this->apply_routes();

      $this->register_filters(array(
        'language_attributes' => 'set_html_attributes',
        'body_class' => 'body_class'
      ));

      $this->register_actions(array(
        'wp_enqueue_scripts' => 'load_resources',
      ));

      add_action('wp_ajax_abc_ajax', array($this,'validate_file_version'),1);
      add_action('wp_ajax_admin_abc_ajax', array($this,'validate_file_version'), 1);

      add_action('si_render_page', array($this, 'render_page'),10,2);

      if($this->configs->favorites_button_menu != null){
        add_filter('wp_nav_menu_items',array($this, 'add_favorite_button_to_menu'), 10, 2);
      }
    }

    $this->addons->register_hooks($this->configs->active_addons);
  }
  

  function add_favorite_button_to_menu( $items, $args ) {
      if( $args->theme_location == $this->configs->favorites_button_menu )
          return $items."<li class='menu-item'><si-favorites-button></si-favorites-button></li>";
   
      return $items;
  }
  

  public function get_account_id() {
    return $this->configs->account_id;
  }

  public function get_api_key() {
    return $this->configs->api_key;
  }

  public function get_list_configs($alias){
    foreach ($this->configs->lists as $list) {
      if($list->alias == $alias){
        return SourceImmoList::parse($list);
      }
    } 

    return null;
  }

  public function exclude_menu_pages( $items) {
    // Iterate over the items to search and destroy
    $layouts = ['listing','city','office','broker'];
    $layoutPages = array();
    foreach ($layouts as $layout) {
      $layoutInfos = $this->configs->{$layout . '_layouts'};
      foreach($layoutInfos as $infos){
        if( isset($infos->page) && ($infos->page != null) ){
          $layoutPages[] = $infos->page;
        }
      }
    }

    foreach ( $items as $key => $item ) {
        if ( in_array($item->object_id, $layoutPages) ) unset( $items[$key] );
    }

    return $items;
}

  public function get_permalink($type){
    $lTypeConvertion = array(
      'brokers' => 'broker',
      'listings' => 'listing',
      'cities' => 'city'
    );

    if(isset($lTypeConvertion[$type])){
      $type = $lTypeConvertion[$type];
    }

    if(method_exists($this, "get_{$type}_permalink")){
      return $this->{'get_' . $type . '_permalink'}();
    }

    
    return '';
  }

  public function get_listing_permalink($locale=null){
    if($locale==null){
      $locale = substr(get_locale(),0,2);
    }
    $lResult = $this->configs->listing_routes[0]->route;
    foreach($this->configs->listing_routes as $item){
      if($item->lang == $locale){
        $lResult = $item->route;
      }
    }

    return  $lResult;
  }

  public function get_broker_permalink($locale=null){
    if($locale==null){
      $locale = substr(get_locale(),0,2);
    }

    $lResult = $this->configs->broker_routes[0]->route;
    foreach($this->configs->broker_routes as $item){
      if($item->lang == $locale){
        $lResult = $item->route;
      }
    }

    return $lResult;
  }

  public function get_city_permalink($locale=null){
    if($locale==null){
      $locale = substr(get_locale(),0,2);
    }

    $lResult = $this->configs->city_routes[0]->route;
    foreach($this->configs->city_routes as $item){
      if($item->lang == $locale){
        $lResult = $item->route;
      }
    }

    return $lResult;
  }

  public function get_office_permalink($locale=null){
    if($locale==null){
      $locale = substr(get_locale(),0,2);
    }

    $lResult = $this->configs->office_routes[0]->route;
    foreach($this->configs->office_routes as $item){
      if($item->lang == $locale){
        $lResult = $item->route;
      }
    }

    return $lResult;
  }

  /**
   * @param string $type Type of the layout
   */
  public function get_detail_layout($type){
    $locale = substr(get_locale(),0,2);
    $lResult = null;
    
    if(property_exists($this->configs,$type . '_layouts')){
      $layout_list = $this->configs->{$type . '_layouts'};

      $lResult = $layout_list[0];
      foreach ($layout_list as $layout) {
        if($locale == $layout->lang){
          $lResult = $layout;
        }
      }
    }
    
    return $lResult;
  }

  public function get_default_list($type){
    $lResult = null;
    $lPrefetch = array();
    foreach($this->configs->lists as $list){
      if($list->type==$type){
        $lPrefetch[] = $list;
        if($list->alias=='default'){
          return $list;
        }
      }
    }

    if(count($lPrefetch)>0){
      return $lPrefetch[0];
    }
    return null;
  }

  public function apply_routes(){
    flush_rewrite_rules();

    $routes = $this->update_routes(array());
    
    foreach ($routes as $key => $value) {
      add_rewrite_rule($key, $value,'top');
    }
  }

  /**
  * Set routes based on configurations
  */
  public function update_routes($rules) {
    // check if routes exists
    $newrules = array();

    // add routes
    foreach($this->configs->listing_routes as $route){
      $ruleKey=array();$matches=array();
      
      $this->getRulesAndMatches($route->route,$ruleKey,$matches);

      if(count($ruleKey)>0){
        $newrules['^' . implode('/',$ruleKey) . '?'] = 'index.php?lang='. $route->lang .'&type=listings&' . implode('&', $matches);

        array_splice($ruleKey, 1,3,'print');
        if(count($ruleKey)>0){
          $matches = array('ref_number=$matches[1]');
          $newrules['^' . implode('/',$ruleKey) . '?'] = 'index.php?lang='. $route->lang .'&type=listings&mode=print&' . implode('&', $matches);
        }
      }

      // shortcut
      if(!str_null_or_empty($route->shortcut)){
        $ruleKey=array();$matches=array();
        $this->getRulesAndMatches($route->shortcut,$ruleKey,$matches);
        $newrules['^' . implode('/',$ruleKey) . '?'] = 'index.php?lang='. $route->lang .'&type=listings&mode=shortcut&' . implode('&', $matches);  
      }
      
      //$newrules['proprietes/(\D?\d+)(/(.+)/(.+)/(\D+))?/?'] = 'index.php?ref_number=$matches[1]&transaction=$matches[3]&genre=$matches[4]&city=$matches[5]';
    }

    // add routes
    foreach($this->configs->broker_routes as $route){
      $ruleKey=array();$matches=array();
      $this->getRulesAndMatches($route->route,$ruleKey,$matches);
      

      $newrules['^' . implode('/',$ruleKey) . '?'] = 'index.php?lang='. $route->lang .'&type=brokers&' . implode('&', $matches);

      // shortcut
      if(!str_null_or_empty($route->shortcut)){
        $ruleKey=array();$matches=array();
        $this->getRulesAndMatches($route->shortcut,$ruleKey,$matches);
        $newrules['^' . implode('/',$ruleKey) . '?'] = 'index.php?lang='. $route->lang .'&type=brokers&mode=shortcut&' . implode('&', $matches);  
      }
    }

    // add routes
    foreach($this->configs->city_routes as $route){
      $ruleKey=array();$matches=array();
      $this->getRulesAndMatches($route->route,$ruleKey,$matches);

      $newrules['^' . implode('/',$ruleKey) . '?'] = 'index.php?lang='. $route->lang .'&type=cities&' . implode('&', $matches);

      // shortcut
      if(!str_null_or_empty($route->shortcut)){
        $ruleKey=array();$matches=array();
        $this->getRulesAndMatches($route->shortcut,$ruleKey,$matches);
        $newrules['^' . implode('/',$ruleKey) . '?'] = 'index.php?lang='. $route->lang .'&type=cities&mode=shortcut&' . implode('&', $matches);  
      }
    }


    // add routes
    foreach($this->configs->office_routes as $route){
      $ruleKey=array();$matches=array();
      $this->getRulesAndMatches($route->route,$ruleKey,$matches);

      $newrules['^' . implode('/',$ruleKey) . '?'] = 'index.php?lang='. $route->lang .'&type=offices&' . implode('&', $matches);

      // shortcut
      if(!str_null_or_empty($route->shortcut)){
        $ruleKey=array();$matches=array();
        $this->getRulesAndMatches($route->shortcut,$ruleKey,$matches);
        $newrules['^' . implode('/',$ruleKey) . '?'] = 'index.php?lang='. $route->lang .'&type=offices&mode=shortcut&' . implode('&', $matches);  
      }
    }

    //__c($newrules, $rules);
    return array_merge($newrules, $rules);
  }

  public function getRulesAndMatches($route, &$rules=null, &$matches=null){
    $rules = array();
    $matches = array();

    $routeParts = explode('/', $route);
    $index = 0;
    foreach ($routeParts as $part) {
      if(strpos($part,'{{')===false){
        $rules[] = $part;
      }
      else{
        $index++;
        $rules[] = '(.+)';
        $partKey = str_replace('.','_', str_replace(array('{{','}}','item.'),'', $part));
        $matches[] = $partKey . '=$matches[' . $index . ']';
      }
    }

    return array(
      'rules' => array(),
      'matches' => array()
    );
  }

  public function update_routes_query_var($vars){
    $vars[] = "ref_number";
    $vars[] = "location_region";
    $vars[] = "location_city";
    $vars[] = "type"; 
    $vars[] = "lang";
    $vars[] = "mode";

    return $vars;
  }
  
  function detect_locale($locale){
    $request_locale = get_query_var( 'lang' );
    //Debug::write($request_locale);
    if($request_locale){
      
      global $sitepress;
      if($sitepress){
        $sitepress->switch_lang($request_locale);
      }
      $locale = $request_locale . '_CA';
    }
    
    return $locale;
  }


  
  // --------------------------------
  //#region REDIRECTS
  
  function redirect_listings($ref_number){
    // load data
    $model = json_decode(SourceImmoApi::get_listing_data($ref_number));
    if($model != null){
      global $dictionary;
      $listingWrapper = new SourceImmoListingsResult();
      $dictionary = new SourceImmoDictionary($model->dictionary);
      $listingWrapper->preprocess_item($model);

      $model->permalink = SourceImmoListingsResult::buildPermalink($model, SourceImmo::current()->get_listing_permalink());
      wp_redirect($model->permalink);
    }
  }

  function redirect_brokers($ref_number){
    // load data
    $model = json_decode(SourceImmoApi::get_broker_data($ref_number));
    if($model != null){
      global $dictionary;
      $listingWrapper = new SourceImmoBrokersResult();
      $dictionary = new SourceImmoDictionary($model->dictionary);
      $listingWrapper->preprocess_item($model);

      $model->permalink = SourceImmoBrokersResult::buildPermalink($model, SourceImmo::current()->get_broker_permalink());
      wp_redirect($model->permalink);
    }
  }

  function redirect_cities($ref_number){
    // load data
    $model = SourceImmoApi::get_city_data($ref_number)->items[0];
    if($model != null){
      global $dictionary;
      $listingWrapper = new SourceImmoCitiesResult();
      $dictionary = new SourceImmoDictionary($model->dictionary);
      $listingWrapper->preprocess_item($model);

      $model->permalink = SourceImmoCitiesResult::buildPermalink($model, SourceImmo::current()->get_city_permalink());
      wp_redirect($model->permalink);
    }
  }

  function redirect_offices($ref_number){
    // load data
    $model = json_decode(SourceImmoApi::get_office_data($ref_number));
    if($model != null){
      
      global $dictionary;
      $listingWrapper = new SourceImmoOfficesResult();
      $dictionary = new SourceImmoDictionary($model->dictionary);
      $listingWrapper->preprocess_item($model);

      $model->permalink = SourceImmoOfficesResult::buildPermalink($model, SourceImmo::current()->get_office_permalink());
      wp_redirect($model->permalink);
    }
  }
  
  //#endregion
  // --------------------------------
  

  /**
  *  RENDERING
  */

  /**
  * Add styles and scripts file to the page
  */
  public function load_resources(){
    
    $mapKeyParams = '';
    if(!empty($this->configs->map_api_key)){
      $mapKeyParams = 'key=' . $this->configs->map_api_key;
    }

    wp_deregister_script( 'moment');

    wp_enqueue_style( 'fontawesome5', plugins_url('/styles/fa/all.min.css', SI_PLUGIN) );
    //wp_enqueue_style( 'bootstrap', 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css');
    wp_enqueue_style( 'si-style', plugins_url('/styles/public.min.css', SI_PLUGIN), null, filemtime(SI_PLUGIN_DIR . '/styles/public.min.css') );
    
    wp_enqueue_script( 'jquery', 'https://code.jquery.com/jquery-3.4.1.min.js');
    wp_enqueue_script( 'angular', 'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.js', null, null, true );
    wp_enqueue_script( 'angular-sanitize', 'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-sanitize.min.js', 'angular', null, true );
    wp_enqueue_script( 'moment', 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment-with-locales.min.js',null, null, true);
    wp_enqueue_script( 'angular-moment', 'https://cdnjs.cloudflare.com/ajax/libs/angular-moment/1.3.0/angular-moment.min.js', array('angular','moment'), null, true);
    //wp_enqueue_script( 'bootstrap-popper', 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js', null, null, true );
    //wp_enqueue_script( 'bootstrap', 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js', 'bootstrap-popper', null, true );
    wp_enqueue_script( 'material', 'https://ajax.googleapis.com/ajax/libs/angular_material/1.1.8/angular-material.min.js', 'angular', null, true );
    // swipe-touch handling library
    wp_enqueue_script( 'hammerjs', 'https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js', null, null, true );
    // google map API library
    if(!empty($mapKeyParams)){
      wp_enqueue_script( 'google-map', 'https://maps.googleapis.com/maps/api/js?' . $mapKeyParams . '&libraries=places', null, null, true );
      wp_enqueue_script( 'google-map-cluster', 'https://cdnjs.cloudflare.com/ajax/libs/js-marker-clusterer/1.0.0/markerclusterer_compiled.js', 'google-map', null, true );
    }

    // wp_enqueue_style("rzslider", "https://cdnjs.cloudflare.com/ajax/libs/angularjs-slider/6.6.1/rzslider.min.css", array('si-style'), "1", "all");
	  // wp_enqueue_script("rzslider", "https://cdnjs.cloudflare.com/ajax/libs/angularjs-slider/6.6.1/rzslider.min.js", array('angular'), '', true);

    wp_enqueue_script( 'si-prototype', plugins_url('/scripts/ang.prototype.js', SI_PLUGIN), null, 
                            filemtime(SI_PLUGIN_DIR . '/scripts/ang.prototype.js'), true );

    $this->load_module_resources();

    
    // add custom styles
    $this->load_config_style();

    $this->load_script_context();

    $this->load_locale_file();
    
    if(SI_DEVMODE){
      wp_register_script( 'si-public-app', plugins_url('/scripts/ang.public-app.js', SI_PLUGIN), 
              array('angular', 'angular-sanitize','si-prototype'), 
              filemtime(SI_PLUGIN_DIR . '/scripts/ang.public-app.js'), true );

    }
    else{
      wp_register_script( 'si-public-app', plugins_url('/scripts/ang.public-app.min.js', SI_PLUGIN), 
            array('angular', 'angular-sanitize','si-prototype'), 
            filemtime(SI_PLUGIN_DIR . '/scripts/ang.public-app.min.js'), true );
    }
    wp_enqueue_script('si-public-app'); 
  }

  /**
   * Add JS script context object to the document
   */
  public function load_script_context(){
    $lTwoLetterLocale = substr(get_locale(),0,2);
    $lUploadDir   = wp_upload_dir();
    $lConfigFileUrl = str_replace(array('http://','https://'),'//',$lUploadDir['baseurl'] . '/_sourceimmo/_configs.json');
    $lConfigFilePath = str_replace('//' . $_SERVER['HTTP_HOST'], ABSPATH, $lConfigFileUrl);
    $lConfigVersion = '';
    
    if(!file_exists($lConfigFilePath)){
      $lConfigFilePath = SourceImmoConfig::load()->save();
      $lConfigVersion = filemtime($lConfigFilePath);
    }
    
    $lConfigPath  = $lConfigFileUrl . '?v=' . $lConfigVersion;

    $currentPagePath = $_SERVER['REQUEST_URI'];

    wp_add_inline_script( 'si-prototype', 
        //'$locales.init("' . $lTwoLetterLocale . '");$locales.load("' . plugins_url('/scripts/locales/global.'. $lTwoLetterLocale .'.json', SI_PLUGIN) . '");' .
        '$locales.init("' . $lTwoLetterLocale . '");' .
        'var siApiSettings={locale:"' . $lTwoLetterLocale . '",rest_root:"' . esc_url_raw( rest_url() ) . '", nonce: "' . wp_create_nonce( 'wp_rest' ) . '", api_root:"' . SI_API_HOST . '"};' .
        'var siCtx={locale:"' . $lTwoLetterLocale . '", config_path:"' . $lConfigPath . '", ' .
                  'version:"' . str_replace(' ','-', SI_VERSION) . '", ' .
                  'base_path:"' . plugins_url('/', SI_PLUGIN) . '", ' .
                  'listing_routes : ' . json_encode($this->configs->listing_routes) . ', ' .
                  'broker_routes : ' . json_encode($this->configs->broker_routes) . ', ' .
                  'city_routes : ' . json_encode($this->configs->city_routes) . ', ' .
                  'office_routes : ' . json_encode($this->configs->office_routes) . ', ' .
                  'use_lang_in_path: ' . ((strpos($currentPagePath, $lTwoLetterLocale)===1) ? 'true':'false') . 
                '};'
      );

  }

  /**
   * Add locale (language) JSON file reference to the document
   */
  public function load_locale_file(){
    $lTwoLetterLocale = substr(get_locale(),0,2);

    if($lTwoLetterLocale!='en'){
      $locale_file_paths = apply_filters('si-locale-file-paths',array(SI_PLUGIN_DIR . 'scripts/locales/global.' . $lTwoLetterLocale . '.js'));
      
      foreach ($locale_file_paths as $filePath) {
        
        // echo(SI_PLUGIN_DIR);

        $fileUrl = si_to_plugin_root($filePath);
        $localeName = basename($filePath);

        wp_enqueue_script(
                          'si-locales-' . $localeName, 
                          SI_PLUGIN_URL . $fileUrl, 
                          null, 
                          filemtime($filePath), 
                          true
                        );
      }
      // wp_enqueue_script('si-locales', plugins_url('/scripts/locales/global.'. $lTwoLetterLocale .'.js', SI_PLUGIN), 
      //           null, 
      //           filemtime(SI_PLUGIN_DIR . '/scripts/locales/global.'. $lTwoLetterLocale .'.js'), true );
      
    }
    do_action("si-append-locales");

  }

  /**
   * Add inline style from the configs' custom css box
   */
  public function load_config_style(){
    $configs = SourceImmo::current()->configs;

    if(isset($configs->styles)){
      
      $styles = explode(',',trim($configs->styles,"{}"));
      $configStyles = array();
      $customStyles = null;
      foreach($styles as $styleRaw){
        $style = explode(':', str_replace('"','', $styleRaw));
        
        if('---custom-style' === $style[0]){
          array_splice($style,0,1);
          if($style != ''){
            $style = implode(':',$style);
            $customStyles = $style;
          }
          //__c($style);
        }
        else{
          $configStyles[] = str_replace('"','', $styleRaw);
        }
        
      }
      if(count($configStyles) > 0 ){
        $configStyles = 'body{' . implode(';',$configStyles) . '}';
        if($customStyles != null) $configStyles = $configStyles . $customStyles;

        wp_register_style( 'si-custom-style', false, array('si-style') );
        wp_enqueue_style( 'si-custom-style');
        wp_add_inline_style('si-custom-style',str_replace('\n', "", $configStyles));
      }
    }
  }

  /**
   * Add modules resource dependances
   */
  public function load_module_resources(){
    if($this->has_modules()){
      $modStyles = [];
      $modScripts = [];

      foreach($this->modules as $module){
        $modStyles += $module->get_style_depends();
        $modScripts += $module->get_script_depends();
      }
      
      foreach ($modStyles as $style){
        wp_enqueue_style(...$style);
      }
      foreach ($modScripts as $script){
        wp_enqueue_script(...$script);
      }
    }
  }

  
  public function validate_file_version(){
    header('Content-Type: application/javascript');
    $lPublicAppVersion = filemtime(SI_PLUGIN_DIR . '/scripts/ang.public-app.js');
    ?>
    if(jQuery){
      let lMustReload = false;
      jQuery('script').forEach(function($i,$e){
        let lSrc = $e.attr('src');
        const lVersionRx = /ver=(\d*)&?/g;

        if(lSrc.indexOf('ang.public-app') >= 0){
          let lVersion = lVersionRx.exec(lSrc)[1];
          
          if(lVersion == undefined) lMustReload = true;
          if(lVersion != '<?php echo($lPublicAppVersion) ?>') lMustReload = true;
        }
      });

      if(lMustReload){
        window.location.reload(true);
      }
    }
    <?php
    die();
  }

  public function body_class($classes){
    $ref_number = get_query_var( 'ref_number');
    if($ref_number != null){
      $type = get_query_var( 'type' );
      $classes[] = 'single-' . $type;
      $classes[] = $type . '-' . $ref_number;

      // remove sidebar class
      $has_sidebar_needle = array_search("has-sidebar",$classes);
      if($has_sidebar_needle!==false){
        unset($classes[$has_sidebar_needle]);
      }
    }

    return $classes;
  }

  public function set_html_attributes($attr){
    return "{$attr} data-ng-app=\"siApplication\" data-ng-controller=\"publicCtrl\" data-ng-init=\"init()\"";
  }

  // ----------------------
  //#region TEMPLATE HANDLING

  static function getModel(){
    global $siCurrentModel;
    return $siCurrentModel;
  }

	function template_redirect(){
    $ref_number = get_query_var( 'ref_number' );
    //__c($ref_number);
		if ( $ref_number ) {
      $type = get_query_var( 'type' );
      $mode = get_query_var( 'mode' );
      if($mode == 'shortcut'){
        // redirect to long
        $this->{'redirect_' . $type}($ref_number);
      }
      else{
        if($mode == 'print'){
          $mode = '_print';
        }
        else{
          $mode = '_detail_template';
        }
        add_filter( 'template_include', array($this, 'include_' . $type . $mode));
      }
    }
  }

  
  function include_listings_detail_template(){
    $ref_number = get_query_var( 'ref_number' );
    global $permalink, $post,$listing_data;
    
    // load data
    global $listing_data;
    global $siCurrentModel;
    $rawModel = SourceImmoApi::get_listing_data($ref_number);
    $siCurrentModel = $listing_data = json_decode( $rawModel);
    if($listing_data != null){
      do_action('si_listing_detail_begin');

      // hook to sharing tools
      $share_tool = new SiSharing($listing_data);
      $share_tool->addHook('listing');
      $permalink = $share_tool->getPermalink();
      add_filter('si_page_title', function($title) use ($share_tool){
        return $share_tool->title();
      });

      if(!isset($post)) $post = json_decode('{}');
      $post->permalink = $permalink;

      // add hook for permalink
      add_filter('the_permalink', function($url){
        global $permalink;
        return $permalink;
      });
      add_action('the_post', function($post_object){
        global $permalink;
        $post_object->permalink = $permalink;
        $post_object->post_title = '';
      });

      // Add hook to data
      $listing_data = apply_filters(hook_from_key('listing','single'), $listing_data);
      

      self::view('single/listings', array('ref_number'=>$ref_number, 'data' => $listing_data, 'permalink' => $permalink));
      die();
    }
    else{
      header('http/1.0 404 not found');

      self::view('single/listings_404', array());
      die();
    }
  }
  function include_listings_print(){
    $ref_number = get_query_var( 'ref_number' );
    
    // load data
    $model = json_decode(SourceImmoApi::get_listing_data($ref_number));
    if($model != null){
      do_action('si/listing/print', $model);

      header('http/1.0 200 found');
      global $dictionary;
      // hook to sharing tools

      $share_tool = new SiSharing($model);
      $share_tool->addHook('listing');

      $listingWrapper = new SourceImmoListingsResult();
      $dictionary = new SourceImmoDictionary($model->dictionary);
      $listingWrapper->preprocess_item($model);
      $listingWrapper->extendedPreprocess($model);
      $model = apply_filters('si_listing_print_post_process', $model);

      $model->permalink = SourceImmoListingsResult::buildPermalink($model, SourceImmo::current()->get_listing_permalink());
      $model->tiny_url = SourceImmoTools::get_tiny_url('http://' . $_SERVER['HTTP_HOST'] . $model->permalink);

      wp_enqueue_style('listing-print', SI_PLUGIN_URL . 'styles/print.min.css', null, filemtime(SI_PLUGIN_DIR . '/styles/print.min.css'));
      do_action('si/listing/print:begin');

      $filePath = self::file('single/listings_print');
      if($filePath != null){
        include $filePath;
      }
      die();
    }
    else{
      header('http/1.0 404 not found');

      self::view('single/listings_404', array());
      die();
    }
  }
  

  function include_brokers_detail_template(){
    $ref_number = get_query_var( 'ref_number' );
    global $siCurrentModel;
    global $broker_data,$post;
    // load data
    $siCurrentModel = $broker_data = json_decode(SourceImmoApi::get_broker_data($ref_number));

    if($broker_data != null){
      header('http/1.0 200 found');
      do_action('si_broker_detail_begin');

      // hook to sharing tools
      $share_tool = new SiSharing($broker_data);
      $share_tool->addHook('broker');
      
      $permalink = $share_tool->getPermalink();
      add_filter('si_page_title', function($title) use ($share_tool){
        return $share_tool->title();
      });
      if($post != null) $post->permalink = $permalink;

      // add hook for permalink
      add_filter('the_permalink', function($url){
        global $permalink;
        return $permalink;
      });
      add_action('the_post', function($post_object){
        global $permalink;
        $post_object->permalink = $permalink;
        $post_object->post_title = '';
      });

      $broker_data = apply_filters(hook_from_key('broker','single'), $broker_data);

      self::view('single/brokers', array('ref_number'=>$ref_number, 'data' => $broker_data));
      die();
    }
    else{
      header('http/1.0 404 not found');
      self::view('single/brokers_404', array());
      die();
    }
  }

  function include_cities_detail_template(){
    $ref_number = get_query_var( 'ref_number' );
    global $permalink, $post,$city_data;

    // load data
    // global $city_data;
    $city_data = SourceImmoApi::get_city_data($ref_number)->items[0];
    //__c($city_data);

    // $city_data = new SourceImmoListingsResult($city_data);
    if($city_data != null){
      header('http/1.0 200 found');
      do_action('si_city_detail_begin');
      // hook to sharing tools
      $share_tool = new SiSharing($city_data);
      $share_tool->addHook('city');
      
      $permalink = $share_tool->getPermalink();
      if(isset($post)) $post->permalink = $permalink;
      add_filter('si_page_title', function($title) use ($share_tool){
        return $share_tool->title();
      });
      
      // add hook for permalink
      // add_filter('the_permalink', function($url){
      //   global $permalink;
      //   return $permalink;
      // });
      add_action('the_post', function($post_object){
        global $permalink;
        $post_object->permalink = $permalink;
        $post_object->post_title = '';
      });

      $city_data = apply_filters(hook_from_key('city','single'), $city_data);
      self::view('single/cities', array('ref_number'=>$ref_number, 'data' => $city_data, 'permalink' => null));      
      die();
    }
    else{
       header('http/1.0 404 not found');

       self::view('single/cities_404', array());
       die();
    }
  }

  function include_offices_detail_template(){
    $ref_number = get_query_var( 'ref_number' );
    global $broker_data,$post;
    // load data
    
    $office_data = json_decode(SourceImmoApi::get_office_data(strtoupper($ref_number)));
    
    if($office_data != null){
      header('http/1.0 200 found');
      do_action('si_office_detail_begin');

      // hook to sharing tools
      $share_tool = new SiSharing($office_data);
      $share_tool->addHook('office');
      $permalink = $share_tool->getPermalink();

      if($post != null) $post->permalink = $permalink;

      // add hook for permalink
      add_filter('the_permalink', function($url){
        global $permalink;
        return $permalink;
      });
      add_action('the_post', function($post_object){
        global $permalink;
        $post_object->permalink = $permalink;
        $post_object->post_title = '';
      });


      $office_data = apply_filters(hook_from_key('office','single'), $office_data);
      self::view('single/offices', array('ref_number'=>$ref_number, 'data' => $office_data, 'permalink' => null));      
      die();
    }
    else{
       header('http/1.0 404 not found');

       self::view('single/offices_404', array());
       die();
    }
  }
  
  // TODO: Deprecated
  public function render_page($post_id){
    if($this->page_template_rendered) return;
    
    //do_action('si_start_of_template', $load_text);
    
    $lPost = get_post($post_id);

    echo(do_shortcode($lPost->post_content));
  
    //do_action('si_end_of_template');
  }

  //#endregion
  // ----------------------



  public static function staticDataController($configs, $data){
    $alias = StringPrototype::toJsVariableName($configs->alias);
    echo('<script id="static-data-for-' . $alias . '">');
    echo('if(typeof $statics == "undefined"){$statics = {};}');
    echo('$statics.' . $alias . ' = {};');
    echo('$statics.' . $alias . '.configs = ' . json_encode($configs) . ';');
    echo('$statics.' . $alias . '.data = ' . json_encode($data) . ';');
    echo('</script>');
    echo('<div ng-controller="staticDataCtrl" ng-init="init(\'' . $alias . '\')"></div>');
  }

  /**
   * Return the file path of the view or code fragment
   * 
   * The function will look into the active theme for a file override before falling back
   * to the default plugin file. 
   * @param string $path The path, relative to the view folder, of the file to render
   * @param array $args Associative array of parameters to pass through to the view
   */
  public static function file(string $path ){
   
		load_plugin_textdomain( 'si' );

		$file = SI_PLUGIN_DIR . 'views/'. $path . '.php';

    // unless it's a view for admin configuration,
    // developper can override the path or layout
    if(strpos('admin', $path) === false){
      
      // apply filter on $file to allow custom view path
      $file = apply_filters( 'si_view_path', $file, $path );

      // finally, check if the view has been overwritten in the template folder
      $file = ThemeOverrides::search($file, 'views');
    }

    if(file_exists($file)){
  		return $file;
    }

    return null;
  }


  /**
   * Render a page view or code fragment
   * 
   * The function will look into the active theme for a file override before falling back
   * to the default plugin file. 
   * @param string $path The path, relative to the view folder, of the file to render
   * @param array $args Associative array of parameters to pass through to the view
   */
  public static function view(string $path, array $args = array() ){
    $args = apply_filters( 'si_view_arguments', $args, $path );

    // extract args value into local variable
		foreach ( $args AS $key => $val ) {
			$$key = $val;
		}

		load_plugin_textdomain( 'si' );

		$file = SI_PLUGIN_DIR . 'views/'. $path . '.php';

    // unless it's a view for admin configuration,
    // developper can override the path or layout
    if(strpos('admin', $path) === false){
      
      // apply filter on $file to allow custom view path
      $file = apply_filters( 'si_view_path', $file, $path );

      // finally, check if the view has been overwritten in the template folder
      $file = ThemeOverrides::search($file, 'views');
    }

    if(file_exists($file)){
  		include( $file );
    }
    else if(file_exists($path)){
      include( $path );
    }

  }

  /**
   * Render a configuration page view
   * 
   * The function will look into the active theme for a file override before falling back
   * to the default plugin file. 
   * @param string $path The path, relative to the view folder, of the file to render
   * @param array $args Associative array of parameters to pass through to the view
   */
  public static function page(string $path, string $page_id, array $args = array() ){
    //$page_path = $path;
    $args = array_merge($args, array(
      'page_id' => $page_id,
      'page_path' => $path
    ));
    self::view('admin/page.ui',$args);
  }

  /**
   * Render a dialog containing with a page view
   * 
   * The function will look into the active theme for a file override before falling back
   * to the default plugin file. 
   * @param string $path The path, relative to the view folder, of the file to render
   * @param array $args Associative array of parameters to pass through to the view
   */
  public static function dialog(string $path, string $dialog_id, array $args = array() ){
    //$dialog_path = $path;
    $args = array_merge($args, array(
      'dialog_id' => $dialog_id,
      'dialog_path' => $path
    ));
    self::view('admin/dialog.ui',$args);
  }


  /**
   ADDONS
   */
  public function load_addons(){
    $this->addons->load();
  }

  /**
   MODULES
   */
  public function has_modules(){
    return $this->modules != null && count($this->modules)>0;
  }
  public function load_modules(){
    include SI_PLUGIN_DIR . '/core/class.si-bases.php';

    $theme = wp_get_theme();

    $themeNames = array($theme->name, $theme->parent_theme);
    foreach ($themeNames as $name) {
      if(!isset($name) || $name == null || $name == '') continue;

      $moduleName = str_replace(' ','-',strtolower($name));
      $modulePath = SI_PLUGIN_DIR . "modules/$moduleName/functions.php";
      

      if(file_exists($modulePath)){
        include $modulePath;
      }
    }

    $the_plugs = get_option('active_plugins'); 
    foreach($the_plugs as $key => $value) {
      $moduleName = strtolower(explode("/", $value)[0]);
      $modulePath = SI_PLUGIN_DIR . "modules/$moduleName/functions.php";
      
      if(file_exists($modulePath)){
        include $modulePath;
      }
    }

    if($this->has_modules()){
      foreach($this->modules as $module){
        $module->includes();
        $module->register_actions();
        $module->register_filters();
        $module->register_locales();
      }
    }
  }
  public function register_modules($moduleInstance){
    if($this->modules == null){
      $this->modules = [];
    }
    $this->modules[] = $moduleInstance;
  }

  /**
    FORMAT
  */
  public function format_city_name($city_name, $context){
    if($context == 'city'){
      $re = '/(\S+).((\()(.+)(\)))/m';
      $subst = '$1<em>$4</em>';
      $city_name = preg_replace($re, $subst, $city_name);
    }

    return $city_name;
  }

  /** 
   TRANSLATION
  */
  public function load_locales(){
    if($this->locales != null) return;


    $locale = substr(get_locale(),0,2);
    $locale_file_paths = apply_filters('si-locale-file-paths',array(SI_PLUGIN_DIR . 'scripts/locales/global.' . $locale . '.js'));
    $this->locales = array();
    
    foreach ($locale_file_paths as $file_path) {
      if(file_exists($file_path)){
        $locale_str = file_get_contents($file_path);
        
        // remove first line
        $locale_str = preg_replace('/^.+\n/', '', $locale_str);
        // remove comment lines
        $locale_str = preg_replace('/.+\/\/.+/m', '', $locale_str);
        
        if (0 === strpos(bin2hex($locale_str), 'efbbbf')) $locale_str = substr($locale_str, 3);
        if(substr($locale_str,-1) == ')'){
          $locale_str = substr($locale_str,0,strlen($locale_str)-2);
        }
        $this->locales = array_merge($this->locales, json_decode($locale_str, true));
        $this->locales = apply_filters('si-initialize-locale', $this->locales);
      }
    }
    
  }

  public function translate($translated_text, $text, $domain){
    
    if($domain == SI){
      $this->load_locales();
      
      $locale = substr(get_locale(),0,2);
      
      if($translated_text){
        if(is_object($translated_text)){
          if(isset($translated_text->{$locale})){
            return $translated_text->{$locale};
          }
        }
        
        // this is most likely not translated
        if($translated_text == $text && $locale != 'en'){

          if(isset($this->locales[$text])){
            $translated_text = $this->locales[$text];
          }
        }
      }
    }

    return $translated_text;
  }

  /**
  STATICS
  */

  /**
  * Static init from WP
  * @static
  */
  public static function init() {
		if ( ! self::$initiated ) {
      self::$initiated = true;
      self::current()->load_addons();
      self::current()->load_modules();
      self::current()->init_hooks();
		}
	}
  private static $initiated = false;

  /**
  * Get a singleton of the class
  * @static
  * @return SourceImmo
  */
  public static function current() {
    if(self::$current_instance==null){
      self::$current_instance = new SourceImmo;
    }
    return self::$current_instance;
  }
  private static $current_instance = null;


  /**
  * Attached to activate_{ plugin_basename( __FILES__ ) } by register_activation_hook()
  * @static
  */
  public static function plugin_activation() {

  }

  /**
  * Removes all connection options
  * @static
  */
  public static function plugin_deactivation( ) {

  }

  public static function styleToAttr($styles){
    if($styles == null) return '';
    $result = array();
    $parsed = json_decode($styles);
    foreach ($parsed as $key => $value) {
      if($value != ''){
        if($key == '--uls-label') $value = "'" . $value . "'";
        $result[] = $key . ':' . $value;
      }
    }
    
    return implode(';', $result);
  }




  /**
  PRIVATES
  **/

  /**
  * Shortcut for multiple action hook registration
  */
  private function register_actions($hooks){
    foreach ($hooks as $hook => $func) {
      // if $hook is a number, fallback to $func for hook name
      $hookName = (is_numeric($hook))?$func:$hook;
      if(method_exists($this,$func)){ // only if method exists
        add_action($hookName, array($this, $func));
      }
    }
  }

  /**
  * Shortcut for multiple filter hook registration
  */
  private function register_filters($hooks){
    foreach ($hooks as $hook => $func) {
      // if $hook is a number, fallback to $func for hook name
      $hookName = (is_numeric($hook))?$func:$hook;
      if(method_exists($this,$func)){ // only if method exists
        add_filter($hookName, array($this, $func));
      }
    }

    
  }
}

class SiSharing{

  private $object = null;
  private $title = null;
  private $description = null;
  private $image = null;
  private $link = null;

  public function __construct(&$source){
    if($source != null){
      $this->object = $source;
    }
    //Debug::write($this->object);
  }


  public function addHook($type){
    $this->{$type . 'Preprocess'}();

    add_filter('document_title_parts', array($this, 'override_title'),10);
    add_filter('wp_head', array($this,'seo_metas'),10,1);
    add_filter('single_post_title', array($this, 'page_title'), 10,1);
   
    //add_action('the_post', array($this,'change_post'));

    //Yoast
    add_filter('wpseo_title', array($this, 'title'), 10,1);
    add_filter('wpseo_metadesc', array($this,'desc'), 10,1);
    add_filter('wpseo_image', array($this, 'image'), 10,1);
    add_filter('wpseo_canonical',array($this,'url'),10,1);
    add_filter('wpseo_opengraph_title', array($this, 'title'), 10,1);
    add_filter('wpseo_opengraph_desc', array($this,'desc'), 10,1);
    add_filter('wpseo_opengraph_image', array($this, 'image'), 10,1);
    add_filter('wpseo_opengraph_url',array($this,'url'),10,1);
    add_filter('wpseo_twitter_image', array($this, 'image'), 10,1);
  }

  public function change_post($post_object){
    //__c($post_object);
    //$post_object->title = $this->post_title;
  }

  public function override_title($title){
    if($this->title != null){
      $not_found_str = __('Page not found');
      $not_found_ind = array_search($not_found_str, $title);
      if($not_found_ind !== false){
        unset($title[$not_found_ind]);
      }
      if(array_search($this->title, $title) === false){
        array_unshift($title,$this->title);
      }
    }
    return $title;
  }

  public function page_title($title='',$id=null){
    if($this->title != null && $id==null){
      $title = $this->title;
    }
    return $title;
  }

  public function title($title='',$sep=''){
    if($this->title != null){
      $title = $this->title;
    }
    return $title;
  }

  public function desc($desc=''){
    if($this->desc != null){
      $desc = $this->desc;
    }
    else if ($desc==''){
      $desc = $this->title;
    }
    return $desc;
  }

  public function image($image_path=''){
    if($this->image != null){
      $image_path = $this->image;
    } 
    return $image_path;
  }

  public function url($url=''){
    if($this->url != null){
      $url = $this->url;
    } 
    return $url;
  }

  public function seo_metas(){
    $this->set_meta("description", $this->desc());

    $this->set_meta("name", $this->title(),'itemprop');
    $this->set_meta("description", $this->desc(),'itemprop');
    $this->set_meta("image", $this->image(),'itemprop');
    
    $this->set_social_meta("card","summary_large_image",array('twitter'));
    $this->set_social_meta("title", $this->title(),array('og','twitter'));
    $this->set_social_meta("description", $this->desc(),array('og','twitter'));
    $this->set_social_meta("url", $this->url(),array('og','twitter'));
    $this->set_social_meta("type", 'website',array('og','twitter'));
    $this->set_social_meta("image", $this->image(),array('og','twitter'));
  }

  public function set_meta($key, $value,$metakey='name'){
    echo('<meta '. $metakey .'="' . $key . '" content="' . $value . '"></meta>');
  }

  public function set_social_meta($key, $value, $prefixes){
    $metaKeyNames = array(
      'og' => 'property',
      'twitter' => 'name',
    );

    foreach ($prefixes as $prefix) {
      
      echo('<meta '. $metaKeyNames[$prefix] . '="' . $prefix . ':' . $key . '" content="' . $value . '"></meta>');  
    }
  }
  public function brokerPreprocess(){
    global $dictionary;
    $objectWrapper = new SourceImmoBrokersResult();
    $dictionary = new SourceImmoDictionary($this->object->dictionary);
    $objectWrapper->preprocess_item($this->object);
    $this->object->permalink = $objectWrapper->buildPermalink($this->object, SourceImmo::current()->get_broker_permalink());

    $this->title = $this->object->first_name . ' ' . $this->object->last_name;
    $this->desc = isset($this->object->license_type) ? $this->object->license_type : '';
    $this->image = isset($this->object->photo->url) ? $this->object->photo->url : '';
    $this->url = '/' . $this->object->permalink;
  }

  public function officePreprocess(){
    global $dictionary;
    $objectWrapper = new SourceImmoOfficesResult();
    $dictionary = new SourceImmoDictionary($this->object->dictionary);
    $objectWrapper->preprocess_item($this->object);
    $this->object->permalink = $objectWrapper->buildPermalink($this->object, SourceImmo::current()->get_office_permalink());

    $this->title = $this->object->name;
    $this->desc = __('Office',SI); //$this->object->license_type;
    $this->image = null; //$this->object->photo->url;
    $this->url = '/' . $this->object->permalink;
  }

  public function cityPreprocess(){
    global $dictionary;
    $cityWrapper = new SourceImmoCitiesResult();
    //$dictionary = new SourceImmoDictionary($this->object->dictionary);
    //$cityWrapper->preprocess_item($this->object);
    $this->object->permalink = $cityWrapper->buildPermalink($this->object, SourceImmo::current()->get_city_permalink());

    $this->title = $this->object->name;
    $this->desc = ''; //isset($this->object->description) ? $this->object->description : '';
    $this->image = ''; //$this->object->photos[0]->source_url;
    $this->url = '/' . $this->object->permalink;
  }

  public function listingPreprocess(){
    global $dictionary;
    $listingWrapper = new SourceImmoListingsResult();
    $dictionary = new SourceImmoDictionary($this->object->dictionary);
    $listingWrapper->preprocess_item($this->object);
    $this->object->permalink = $listingWrapper->buildPermalink($this->object, SourceImmo::current()->get_listing_permalink());

    $this->title = $this->object->subcategory . ' ' . $this->object->location->full_address;
    $this->desc = isset($this->object->description) ? $this->object->description : '';
    $this->image = (isset($this->object->photos[0]->source_url)) ? $this->object->photos[0]->source_url : null;
    $this->url = '/' . $this->object->permalink;
  }

  public function getPermalink(){
    return $this->object->permalink;
  }
}



#region WPML FILTER

add_action('si_listing_detail_begin', function(){
	add_filter( 'WPML_filter_link', function($lang_url, $lang){
    global $listing_data;
    global $sitepress;
    $lHomeUrl= $sitepress->language_url( $lang["code"] );
    
		$permalink_format = SourceImmo::current()->get_listing_permalink($lang['code']);
    $permalink = SourceImmoListingsResult::buildPermalink($listing_data, $permalink_format,$lang["code"]);
    //if(strpos($lHomeUrl,$lang["code"])!==false) $permalink = '/' . $lang['code'] . $permalink;
    return $permalink;
	  }, 10, 2 );
}, 5,0);

add_action('si_broker_detail_begin', function(){
	add_filter( 'WPML_filter_link', function($lang_url, $lang){
    global $broker_data;
    global $sitepress;
    $lHomeUrl= $sitepress->language_url( $lang["code"] );
    
		$permalink_format = SourceImmo::current()->get_broker_permalink($lang['code']);
    $permalink = SourceImmoBrokersResult::buildPermalink($broker_data, $permalink_format,$lang["code"]);
    
    //if(strpos($lHomeUrl,$lang["code"])!==false) $permalink = '/' . $lang['code'] . $permalink;
		return $permalink;
	  }, 10, 2 );
}, 5,0);
#endregion