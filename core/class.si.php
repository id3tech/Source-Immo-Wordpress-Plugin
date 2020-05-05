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

  public function __construct(){
    $this->configs = SourceImmoConfig::load();

    $this->addons = new SourceImmoAddons;

    if (!is_admin() ){
      // create an instance of the shortcodes class to force code bindings
      new SiShorcodes();
    }
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
  function get_detail_layout($type){
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
    //Debug::write($rules);
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
    $lTwoLetterLocale = substr(get_locale(),0,2);
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
    wp_enqueue_script( 'google-map', 'https://maps.googleapis.com/maps/api/js?' . $mapKeyParams . '&libraries=places', null, null, true );
    wp_enqueue_script( 'google-map-cluster', 'https://cdnjs.cloudflare.com/ajax/libs/js-marker-clusterer/1.0.0/markerclusterer_compiled.js', 'google-map', null, true );
    

    // wp_enqueue_style("rzslider", "https://cdnjs.cloudflare.com/ajax/libs/angularjs-slider/6.6.1/rzslider.min.css", array('si-style'), "1", "all");
	  // wp_enqueue_script("rzslider", "https://cdnjs.cloudflare.com/ajax/libs/angularjs-slider/6.6.1/rzslider.min.js", array('angular'), '', true);

    wp_enqueue_script( 'si-prototype', plugins_url('/scripts/ang.prototype.js', SI_PLUGIN), null, 
                            filemtime(SI_PLUGIN_DIR . '/scripts/ang.prototype.js'), true );

    $lUploadDir   = wp_upload_dir();
    $lConfigFilePath = str_replace(array('http://','https://'),'//',$lUploadDir['baseurl'] . '/_sourceimmo/_configs.json');
    if(!file_exists(str_replace('//' . $_SERVER['HTTP_HOST'], ABSPATH, $lConfigFilePath))){
      SourceImmoConfig::load()->save();
    }
    $lConfigVersion = filemtime(str_replace('//' . $_SERVER['HTTP_HOST'], ABSPATH, $lConfigFilePath));
    $lConfigPath  = $lConfigFilePath . '?v=' . $lConfigVersion;

    $currentPagePath = $_SERVER['REQUEST_URI'];
    
    wp_add_inline_script( 'si-prototype', 
                          //'$locales.init("' . $lTwoLetterLocale . '");$locales.load("' . plugins_url('/scripts/locales/global.'. $lTwoLetterLocale .'.json', SI_PLUGIN) . '");' .
                          '$locales.init("' . $lTwoLetterLocale . '");' .
                          'var siApiSettings={locale:"' . $lTwoLetterLocale . '",rest_root:"' . esc_url_raw( rest_url() ) . '", nonce: "' . wp_create_nonce( 'wp_rest' ) . '", api_root:"' . SI_API_HOST . '"};' .
                          'var siCtx={locale:"' . $lTwoLetterLocale . '", config_path:"' . $lConfigPath . '", ' .
                                    'base_path:"' . plugins_url('/', SI_PLUGIN) . '", ' .
                                    'listing_routes : ' . json_encode($this->configs->listing_routes) . ', ' .
                                    'broker_routes : ' . json_encode($this->configs->broker_routes) . ', ' .
                                    'city_routes : ' . json_encode($this->configs->city_routes) . ', ' .
                                    'office_routes : ' . json_encode($this->configs->office_routes) . ', ' .
                                    'use_lang_in_path: ' . ((strpos($currentPagePath, $lTwoLetterLocale)===1) ? 'true':'false') . 
                                  '};'
                        );
    
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
    $listing_data = json_decode(SourceImmoApi::get_listing_data($ref_number));
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
      header('http/1.0 200 found');
      global $dictionary;
      // hook to sharing tools

      $share_tool = new SiSharing($model);
      $share_tool->addHook('listing');

      $listingWrapper = new SourceImmoListingsResult();
      $dictionary = new SourceImmoDictionary($model->dictionary);
      $listingWrapper->preprocess_item($model);
      $listingWrapper->extendedPreprocess($model);

      $model->permalink = SourceImmoListingsResult::buildPermalink($model, SourceImmo::current()->get_listing_permalink());
      $model->tiny_url = SourceImmoTools::get_tiny_url('http://' . $_SERVER['HTTP_HOST'] . $model->permalink);

      add_action('wp_enqueue_scripts', function(){
        wp_dequeue_style('avia-grid');
        wp_dequeue_style('avia-base');
        wp_deregister_style('avia-grid');
        wp_deregister_style('avia-base');
      }, 20 );
      
      wp_enqueue_style('listing-print', SI_PLUGIN_URL . 'styles/print.min.css', null, filemtime(SI_PLUGIN_DIR . '/styles/print.min.css'));
      do_action('si_listing_print_begin');

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
    global $broker_data,$post;
    // load data
    $broker_data = json_decode(SourceImmoApi::get_broker_data($ref_number));

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
  public function load_modules(){
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
      
      if($translated_text)

      // this is most likely not translated
      if($translated_text == $text && $locale != 'en'){

        if(isset($this->locales[$text])){
          $translated_text = $this->locales[$text];
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
      array_unshift($title,$this->title);
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
    $this->desc = $this->object->license_type;
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


class SourceImmoDictionary{
  public $entries = null;

  public function __construct($entries){
    $this->entries = $entries;
  }

  public function getCaption($key, $domain, $asAbbr=false){
    $lResult = $key;
    
    // check in rebound property if the 
    if(is_array($key)){
      return $this->getCaptionFrom($key[0], $key[1], $domain, $asAbbr);
    }
    
    if(isset($this->entries) && isset( $this->entries->{$domain}) && $this->entries->{$domain}){
        if(isset($this->entries->{$domain}->{$key})){
            if($asAbbr){
                $lResult = $this->entries->{$domain}->{$key}->abbr;
            }
            else{
              
                $lResult = $this->entries->{$domain}->{$key}->caption;
            }
        }
    }
    return $lResult;
  }

  public function getCaptionFrom($source, $key, $domain, $asAbbr=false){
      $dictionaryKey = isset($source->{$key}) ? $source->{$key} : '';
      
      if(!str_null_or_empty($dictionaryKey) && strpos($dictionaryKey,'_') === 0){
        $srcKey = str_replace('_code', $dictionaryKey,$key);
        
        if(isset($source->{$srcKey}) && !str_null_or_empty($source->{$srcKey})) {
          return $source->{$srcKey};
        }
      }
      
      return $this->getCaption($dictionaryKey, $domain, $asAbbr);
  }
}

class SourceImmoBrokersResult extends SourceImmoAbstractResult {
  public $brokers = null;
  public $metadata = null;

  public function __construct($data=null){
    if($data!=null){
      $this->brokers = $data->items;
      $this->metadata = $data->metadata;

      foreach ($this->brokers as $item) {
        $this->preprocess_item($item);

        $item->permalink = self::buildPermalink($item, SourceImmo::current()->get_broker_permalink());
      }

      self::validatePagePermalinks($this->brokers, 'broker');
    }
  }

  public function preprocess_item(&$item){
    global $dictionary;

    $item->fullname = $item->first_name . ' ' . $item->last_name;
    if(isset($item->license_type_code)){
      $item->license_type = $dictionary->getCaption($item->license_type_code , 'broker_license_type');
    }

    // cities
    if(isset($item->listings)){
      $cityList = array();
      $cityListCode = array();

      foreach ($item->listings as $listing) {
        if(isset($listing->location->city_code)){
          if(!in_array($listing->location->city_code,  $cityListCode)){
            $cityListCode[] = $listing->location->city_code;
            $cityList[] = (object) array(
              'ref_number' => $listing->location->city_code,
              'code' => $listing->location->city_code,
              'name' => isset($listing->location->city) ? $listing->location->city : $dictionary->getCaption($listing->location->city_code , 'city'),
              'region_code' => isset($listing->location->region_code) ? $listing->location->region_code : '' ,
              'country_code' => $listing->location->country_code,
              'state_code' => $listing->location->state_code,
              'listing_count' => 1
            );
          }
          else{
            $index = array_search($listing->location->city_code, $cityListCode);
            $cityList[$index]->listing_count += 1;
          }
        }
      }

      $cityListData = (object) array();
      $cityListData->items = $cityList;
      $cityListData->metadata = $this->metadata;

      $citiesResult = new SourceImmoCitiesResult($cityListData);
      $item->cities = $citiesResult->cities;
      $item->photo = isset($item->photo) ? $item->photo : (object) array('url' => SI_PLUGIN_URL . 'styles/assets/shadow_broker.jpg');
    }
  }
}

class SourceImmoCitiesResult extends SourceImmoAbstractResult {
  public $cities = null;
  public $metadata = null;

  public function __construct($data=null){
    
    if($data!=null){
      $this->cities = $data->items;
      $this->metadata = $data->metadata;
      //Debug::write($this->cities);

      foreach ($this->cities as $item) {
        $this->preprocess_item($item);
      }
      
      self::validatePagePermalinks($this->cities, 'city');
    }
  }

  public function preprocess_item(&$item){
    global $dictionary;

    $item->location = (object) array();
    $item->location->region = $dictionary->getCaption($item->region_code , 'region');
    $item->location->country = $dictionary->getCaption($item->country_code , 'country');
    $item->location->state = $dictionary->getCaption($item->state_code , 'state');

    $item->permalink = self::buildPermalink($item, SourceImmo::current()->get_city_permalink());
  }
}

class SourceImmoListingsResult extends SourceImmoAbstractResult {
  public $listings = null;
  public $metadata = null;

  public function __construct($data=null){
    if($data!=null){
      $this->listings = $data->items;
      $this->metadata = $data->metadata;

      foreach ($this->listings as $item) {
        $this->preprocess_item($item);

        $item->permalink = self::buildPermalink($item, SourceImmo::current()->get_listing_permalink());
      }

      self::validatePagePermalinks($this->listings,'listing');
    }
  }
  
  
  public function preprocess_item(&$item){
    global $dictionary;

    if(isset($item->location->address->street_number) && $item->location->address->street_number != ''){
      $item->location->civic_address = $item->location->address->street_number . ' ' . $item->location->address->street_name;
      if(isset($item->location->address->door) && !str_null_or_empty($item->location->address->door)){
        $item->location->civic_address = $item->location->civic_address . ', ' .  StringPrototype::format(__('apt. {0}',SI),$item->location->address->door);
      }
    }
    else if(isset($item->location->address->street_name) && $item->location->address->street_name != ''){
      $item->location->civic_address = $item->location->address->street_name;
      if(isset($item->location->address->door) && !str_null_or_empty($item->location->address->door)){
        $item->location->civic_address = $item->location->civic_address . ', ' .  StringPrototype::format(__('apt. {0}',SI),$item->location->address->door);
      }
    }
    else{
      $item->location->civic_address = '';
    }
    
    
    $item->location->city = (isset($item->location->city_code)) ? $dictionary->getCaption($item->location->city_code , 'city') : '';
    $item->location->region = (isset($item->location->region_code)) ? $dictionary->getCaption($item->location->region_code , 'region') : '';
    if($item->location->civic_address != ''){
      $item->location->full_address = $item->location->civic_address . ', ' . $item->location->city;
      if(isset($item->location->address->door) && !str_null_or_empty($item->location->address->door)){
        $item->location->full_address .= ', ' .  StringPrototype::format(__('apt. {0}',SI),$item->location->address->door);
      }
    }
    else{
      $item->location->full_address = $item->location->city;
    }


    

    if(isset($item->category_code)){
      $item->category = $dictionary->getCaption($item->category_code , 'listing_category');
    }
    
    $item->transaction = $this->getTransaction($item);
    if(isset($item->subcategory_code)){
      $item->subcategory = $dictionary->getCaption($item->subcategory_code , 'listing_subcategory');
    }
    else{
      $item->subcategory='';
    }

    // Price
    if($item->status_code == 'SOLD'){
      if(isset($item->price->sell)) {
        $item->price_text = __('Sold', SI);
      }
      else{
        $item->price_text = __('Rented', SI);
      }
    }
    else{
      $item->price_text = self::formatPrice($item->price);
    }

    // Areas
    $item->available_area = (isset($item->available_area)) ? $item->available_area : null;
    $item->available_area_unit = (isset($item->available_area_unit_code)) ? $dictionary->getCaption($item->available_area_unit_code , 'dimension_unit') : null;
    
    if(isset($item->brokers)){
      $data = (object) array();
      $data->items = $item->brokers;
      $data->metadata = $this->metadata;
      $brokerDatas = new SourceImmoBrokersResult($data);

      $item->brokers = $brokerDatas->brokers;
    }

    if(isset($item->photos)){
      foreach($item->photos as $photo){
        $photo->category = $dictionary->getCaption(array($photo,'category_code') , 'photo_category');
      }
    }

    
    
    if(isset($item->main_unit)){
      $item->rooms = (object) array();

      $lIconRef = array(
        'bathroom_count' => 'bath',
        'bedroom_count' => 'bed',
        'waterroom_count' => 'hand-holding-water'
      );
      $lLabelRef = array(
          'bathroom_count' => 'Bathroom',
          'bedroom_count' => 'Bedroom',
          'waterroom_count' => 'Powder room'
      );
      $lPluralLabelRef =array(
          'bathroom_count' => 'Bathrooms',
          'bedroom_count' => 'Bedrooms',
          'waterroom_count' => 'Powder rooms'
      );

      $rooms = array();
      foreach ($item->main_unit as $key => $value) {
        if($item->main_unit->{$key} > 0){
          if(isset($lIconRef[$key])){
            $lLabel = ($item->main_unit->{$key} > 1) ? $lPluralLabelRef[$key] : $lLabelRef[$key];
            $rooms[$lIconRef[$key]] = array(
              'count' => $item->main_unit->{$key},
              'label' => __($lLabel,SI)
            );
          }
        }
      }
      if(count($rooms)>0){
        $item->rooms = json_decode(json_encode($rooms));
      }
    }
  }

  public function extendedPreprocess(&$item){
    global $dictionary;

    $item->important_flags = array();
    // from units
    foreach($item->units as $unit){
      $unit->category = $dictionary->getCaption(array($unit,'category_code') , 'unit_category');
      if($unit->category_code=='MAIN'){
        if(isset($unit->bedroom_count)){ $item->important_flags[] = array('icon' => 'bed', 'value' => $unit->bedroom_count, 'caption' => __('Bedroom',SI));}
        if(isset($unit->bathroom_count)){ $item->important_flags[] = array('icon' => 'bath', 'value' => $unit->bathroom_count, 'caption' => __('Bathroom',SI));}
        if(isset($unit->waterroom_count)){ $item->important_flags[] = array('icon' => 'hand-holding-water', 'value' => $unit->waterroom_count, 'caption' => __('Water room',SI));}
      }
    }

    // Attributes
    foreach($item->attributes as &$attr){
      $attr->caption = $dictionary->getCaption($attr->code , 'attribute');
      foreach($attr->values as &$val){
        $val->caption =  $dictionary->getCaption($val->code , 'attribute_value');
        if(isset($val->count)){
          $val->caption = $val->caption . StringPrototype::format('({0})', $val->count);
        }
        if(isset($val->details)){
          $val->caption = $val->details;
        }
      }

      // build attributes groups
      if(in_array($attr->code,array('CUPBOARD','WINDOWS',
            'WINDOW TYPE','ROOFING','FOUNDATION',
            'GARAGE','SIDING','BATHR./WASHR','BASEMENT'))){
        $item->building->attributes[] = $attr;
      }

      if(in_array($attr->code,array('LANDSCAPING','DRIVEWAY','PARKING','POOL',
            'TOPOGRAPHY','VIEW','ZONING','PROXIMITY'))){
        $item->land->attributes[] = $attr;
      }

      $item->building->short_dimension = self::formatDimension($item->building->dimension);
      if(isset($item->building->assessment)){
        if(isset($item->building->assessment->amount)){
          $item->building->assessment->amount_text = self::formatPrice($item->building->assessment->amount);
        }
        else{
          $item->building->assessment->amount_text = 'NA';
        }
      }
      

      $item->land->short_dimension = self::formatDimension($item->land->dimension);
      if(isset($item->land->assessment)){
        if(isset($item->land->assessment->amount)){
          $item->land->assessment->amount_text = self::formatPrice($item->land->assessment->amount);
        }
        else{
          $item->land->assessment->amount_text = 'NA';
        }
      }
      

      if(isset($item->assessment)){
        if(isset($item->assessment->amount)){
          $item->assessment->amount_text = self::formatPrice($item->assessment->amount);
        }
        else{
          $item->assessment->amount_text = 'NA';
        }
        
      }
      


      if(in_array($attr->code,array('HEATING SYSTEM','HEATING ENERGY','HEART STOVE','WATER SUPPLY','SEWAGE SYST.','EQUIP. AVAIL'))){
        $item->other->attributes[] = $attr;
      }

      if($attr->code=='PARKING'){
          $lParkingCount = 0;
          foreach($attr->values as $v){
            $lParkingCount += $v->count;
          }
          if($lParkingCount > 0){
            $item->important_flags[] = array('icon'=> 'car', 'value' => $lParkingCount, 'caption' => $attr->caption);
          }
      }

      if($attr->code=='POOL'){
        $item->important_flags[] = array('icon'=> 'swimmer', 'value'=> 0, 'caption' => $attr->caption);
      }

      if ($attr->code=='HEART STOVE'){
        $item->important_flags[] = array('icon'=> 'fire', 'value'=> 0, 'caption' => $attr->caption);
      }
    }

    foreach($item->rooms as &$room){
      $room->category = $dictionary->getCaption(array($room,'category_code') , 'room_category');
      $room->flooring = $dictionary->getCaption(array($room,'flooring_code') , 'flooring');
      $room->level_category = (isset($room->level_category_code)) ? $dictionary->getCaption($room->level_category_code , 'level_category') : '';
      $room->short_dimension = self::formatDimension($room->dimension);
    }

    foreach($item->units as &$unit){
      $unit->flags = array();
      if(isset($unit->room_count)){
        $unit->flags[] = array('caption' => __('Rooms',SI), 'value' => $unit->room_count);
      }

      if(isset($unit->bedroom_count)){
        $unit->flags[] = array('caption' => __('Bedrooms',SI), 'value' => $unit->bedroom_count);
      }

      if(isset($unit->bathroom_count)){
        $unit->flags[] = array('caption' => __('Bathrooms',SI), 'value' => $unit->bathroom_count);
      }
    }

    foreach($item->expenses as &$expense){
      $expense->type = $dictionary->getCaption(array($expense,'type_code') , 'expense_type');
      $expense->amount_text = isset($expense->amount) ? self::formatPrice($expense->amount) : '';
    }

    foreach($item->incomes as &$income){
      $income->type = $dictionary->getCaption(array($income,'type_code') , 'income_type');
      $income->amount_text = self::formatPrice($income->amount);
    }
  }
  
  public static function formatPrice($price){
    $lResult = array();
    $locale = substr(get_locale(),0,2);
    $thousand_separator = ($locale == 'fr') ? ' ' : ',';

    $priceFormat = __('${0}',SI);
    if(is_numeric($price)){
      return StringPrototype::format($priceFormat, number_format($price,0,".", $thousand_separator));
    }

    global $dictionary;

    foreach ($price as $key => $item) {
      if(in_array($key, array('sell','lease'))){
        $parts = array();
        if(is_numeric($item->amount)){
          $decimalCount = (num_has_decimal($item->amount)) ? 2 : 0;
          $parts[] =  StringPrototype::format($priceFormat, number_format($item->amount,$decimalCount,".", $thousand_separator));

          if(isset($item->taxable)){
              $parts[0] = $parts[0] . '+tx';
          }

          if(isset($item->unit_code)){
            $parts[] = $dictionary->getCaption($item->unit_code,'price_unit',true);
          }

          if(isset($item->period_code)){
            $parts[] = $dictionary->getCaption($item->period_code,'price_period');
          }

          $lResult[] = implode(' / ', $parts);
        }
      }
    }

    return implode(__(' or ',SI), $lResult);
  }

  public static function getCity($item){
    global $dictionary;
    $lResult = $dictionary->getCaption($item->location->city_code, 'city');


    return $lResult;
  }

  public static function getRegion($item){
    global $dictionary;
    $lResult = $dictionary->getCaption($item->location->region_code, 'region');


    return $lResult;
  }

  public static function getTransaction($item){
    $lResult = array();
    $keysToLabels = array(
      'sell' => 'For sale',
      'lease' => 'For rent'
    );

    foreach ($item->price as $key => $value) {
      if(in_array($key, array('sell','lease'))){
        $lResult[] = __($keysToLabels[$key], SI);
      }
    }

    $lResult = implode(__(' or ',SI),$lResult);

    return $lResult;
  }

  public static function formatDimension($dimension){
    $lResult = '';
    if(isset($dimension) && $dimension != null){
        global $dictionary;
        $lResultPart = array();

        if (isset($dimension->area)){
          $lUnit = $dictionary->getCaption($dimension->area_unit_code,'dimension_unit',true);
          //if(lUnit=='mc'){lUnit='m<sup>2</sup>';}
          $lResultPart[] = StringPrototype::format('{0} {1}',$dimension->area, $lUnit);
        }
        
        if(isset($dimension->width)){
          
            $lUnit = $dictionary->getCaption($dimension->unit_code,'dimension_unit',true);
            $lSize = array();
            $lSize[] = isset($dimension->width) ? StringPrototype::format('{0}{1}', $dimension->width, $lUnit) : __('NA',SI);
            $lSize[] = isset($dimension->length) ? StringPrototype::format('{0}{1}', $dimension->length, $lUnit) : __('NA',SI);

            $lResultPart[] = implode(' x ', $lSize);
        }
        if(count($lResultPart) > 1){
          $lResult = StringPrototype::format('{0} ({1})', $lResultPart[0], $lResultPart[1]);
        }
        else if(count($lResultPart)>0){
          $lResult = $lResultPart[0];
        }
    }
    return $lResult;
  }

  public static function hasDimension($dimension){
    $lResult = false;
    if(isset($dimension) && $dimension != null){
        if(isset($dimension->width)){
            if(isset($dimension->length)){
                return true;
            }
        }
        if(isset($dimension->area)){
            return true;
        }
        
    }
    return $lResult;
  }


}

class SourceImmoOfficesResult extends SourceImmoAbstractResult {
  public $offices = null;
  public $metadata = null;

  public function __construct($data=null){
    
    if($data!=null){
      $this->offices = $data->items;
      $this->metadata = $data->metadata;
      //Debug::write($this->cities);

      foreach ($this->offices as $item) {
        $this->preprocess_item($item);
      }
      
      self::validatePagePermalinks($this->offices, 'office');
    }
    
  }

  public function preprocess_item(&$item){
    global $dictionary;

    //$item->location = (object) array();
    $item->listings_count = 0;
    
    $item->location->city = isset($item->location->city_code) ? $dictionary->getCaption($item->location->city_code , 'city') : '';
    $item->location->region = isset($item->location->region_code) ? $dictionary->getCaption($item->location->region_code , 'region') : '';
    $item->location->country = isset($item->location->country_code) ? $dictionary->getCaption($item->location->country_code , 'country') : '';
    $item->location->state = isset($item->location->state_code) ? $dictionary->getCaption($item->location->state_code , 'state') : '';
    $item->location->street_address = isset($item->location->address->street_number) ? $item->location->address->street_number . ' ' . $item->location->address->street_name : '';

    if(str_null_or_empty($item->location->city) && isset($item->location->address->street_name)){
      $addressParts = explode(',',$item->location->address->street_name);
      $item->location->street_address = $addressParts[0];
      $item->location->city = $addressParts[1];
      $item->location->state = $addressParts[2];
      $item->location->address->postal_code = $addressParts[3];
    }

    $item->permalink = self::buildPermalink($item, SourceImmo::current()->get_office_permalink());
  }
}

class SourceImmoAbstractResult{

  public static function getAttributeValueList($item, $prefix=null){
    $lResult = array();
    if(!is_array($item)){
      $item = json_decode(json_encode($item),true);
    }
    foreach ($item as $key => $value) {
      $attrKey = $key;
      if($attrKey == 'dictionary'){
        continue;
      }

      if($prefix!=null){
        $attrKey = $prefix . '.' . $key;
      }
      if(is_array($item[$key])){
        //Debug::write($attrKey . ' is array');
        $lSubAttrs = self::getAttributeValueList($item[$key], $attrKey);
        foreach ($lSubAttrs as $attr) {
          array_push($lResult, $attr);
        }
      }
      else{
        $lResult[] = array('key' => $attrKey, 'value' => $item[$key]);
      }
    }

    return $lResult;
  }

  public static function buildPermalink($item, $format, $lang=null){
    $lResult = $format;
    global $sitepress;
    $lTwoLetterLocale = $lang!=null ? $lang : substr(get_locale(),0,2);
    $lHomeUrl= $sitepress == null ? '/' : $sitepress->language_url( $lTwoLetterLocale );

    $lAttrList = self::getAttributeValueList($item);
    $item->has_custom_page = false;

    foreach($lAttrList as $lAttr){
      $lValue = $lAttr['value'];

      $lResult = str_replace(
          array(
            '{{' . $lAttr['key'] . '}}',
            '{{item.' . $lAttr['key'] . '}}',
            '{{get' . $lAttr['key'] . '(item)}}'
          ), sanitize_title($lValue), $lResult);
      
    }
    $lFinalPermalink = '/'. str_replace(' ','-',$lResult);
    if(strpos($lHomeUrl,$lTwoLetterLocale)!==false) $lFinalPermalink = '/' . $lTwoLetterLocale . $lFinalPermalink; 
    return $lFinalPermalink;
  }

  public static function validatePagePermalinks($list, $type = 'city'){
    if(!SourceImmo::current()->configs->enable_custom_page){
      return;
    }
    $lTypePermalink = SourceImmo::current()->get_permalink($type);
    $lTypePermalink = substr($lTypePermalink,0, strpos($lTypePermalink,'{{')-1);

    $lTwoLetterLocale = substr(get_locale(),0,2);
    // query args
    $lQueryArgs = array(
      'post_type' => 'page',
      'posts_per_page' => -1,
      'post_status' => 'publish',
      'sort_order' => 'asc',
      'sort_column' => 'post_title',
      'hierarchical' => 1,
      'suppress_filters' => false
    );

    // query
    $posts = new WP_Query( $lQueryArgs );
    $pages = $posts->posts;
    

    foreach ($pages as $page) {
      $pagePermalink = rtrim(str_replace(array('http://','https://',$_SERVER['HTTP_HOST']), '' ,get_permalink($page)),'/');
      if($pagePermalink == '') continue;
      
      foreach ($list as $item) {
        if(isset($item->permalink)){
          // remove item permalink 'ID'
          $lId = (isset($item->ref_number))?$item->ref_number: $item->code;
          $customPageLink = '';
          switch ($type){
            case 'city':
              $customPageLink = str_replace($lId,'',$item->permalink);
              break;
            case 'broker':
              $customPageLink = str_replace('/' . $lId,'-' . $lId,$item->permalink);
              $item->custom_page_link = $customPageLink;
              break;
            case 'listing':
              break;
          }
          $customPageLink = rtrim($customPageLink,'/');

          if($pagePermalink == $customPageLink){
            $item->has_custom_page = true;
            $item->permalink = $customPageLink;
          }
          else{
            if($pagePermalink == '/' .$lTwoLetterLocale . $customPageLink){
              $item->has_custom_page = true;
              $item->permalink = '/'. $lTwoLetterLocale . $customPageLink;
            }
          }
        }
      }
    }
  }
}

/** SCHEMAS */

#region Schemas
class BaseDataSchema{
  public $_schema = array(
    "@context" => "http://schema.org/",
    "@type" => '',
    "name" => '',
    "image" => '',
    "description" => ''
  );

  public $_schema_basic_info = null;

  public function __construct($type,BaseSchemaInfos $infos ){
    $this->_schema['@type'] = $type;
    $this->_schema['name'] = $infos->name;
    
    $this->_schema['description'] = $infos->description;

    if(is_array($infos->image)){
      $this->_schema['image'] = $infos->image[0]->url;
    }
    else{
      $this->_schema['image'] = $infos->image;
    }

    $this->_schema_basic_info = $infos;
  }

  public function addOffer($type,$price,$currency, $location ){
    $mainImage = $this->_schema_basic_info->image;
    if(is_array($this->_schema_basic_info->image)){
      $mainImage = $this->_schema_basic_info->image[0]->url;
      $images = array();
      foreach ($this->_schema_basic_info->image as $image) {
        $images[] = array(
          "@type" => "ImageObject",
          "contentUrl" => $image->url,
          "name"  => $image->category . ' ' . $this->_schema_basic_info->name,
        );
      }
    }

    $this->_schema['offers'] = array(
      array(
        '@type' => 'Offer',
        'price' => $price,
        'priceCurrency' => $currency,
        'category' => array(
          '@type' => $type,
          'name' => $this->_schema_basic_info->name,
          'image' => $mainImage,
          'photo' => $images,
          'description' => $this->_schema_basic_info->description,
          'address' => array(
            '@type' => 'PostalAddress',
            'streetAddress' => $location->civic_address,
            'addressLocality' => $location->city
          ),

          'geo' => array(
            '@type' => 'GeoCoordinates',
            'latitude' => $location->latitude,
            'longitude' => $location->longitude
          )
        )
      )
    );
  }

  public function addLocation($type, $location){
    $this->_schema['location'] = array(
      '@type' => $type,
      'name' => $this->_schema_basic_info->name,
      'address' => array(
        '@type' => 'PostalAddress',
        'streetAddress' => $location->civic_address,
        'addressLocality' => $location->city
      ),
    );
  }

  public function addPerformer($broker){
    if(!isset($this->_schema['performers'])){
      $this->_schema['performers'] = array();
    }

    $this->_schema['performers'][] = array(
      '@type' => 'person',
      'name' => $broker->first_name . ' ' . $broker->last_name
    );

  }

  public function currentPageUrl(){
    $protocol = ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off') || 
    $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
    $domainName = $_SERVER['HTTP_HOST'];
    $page_path = $_SERVER['REQUEST_URI'];

    return $protocol.$domainName.$page_path;
  }

  public function toJson($includeTag=true){
    $lResult = json_encode($this->_schema);
    if($includeTag){
      $lResult = '<script type="application/ld+json">' . $lResult . '</script>';
    }
    return $lResult;
  }
}

class BaseSchemaInfos{
  public $name;
  public $image;
  public $description;

  public function __construct($name, $image, $description){
    $this->name = $name;
    $this->image = $image;
    $this->description = $description;
  }
}

class BrokerSchema extends BaseDataSchema{
  public function __construct($broker){
    $basicInfos = new BaseSchemaInfos(
        $broker->first_name . ' ' . $broker->last_name, 
        isset($broker->photo_url) ? $broker->photo_url : SI_PLUGIN_URL . '/styles/assets/shadow_broker.jpg', 
        $broker->license_type);
    parent::__construct('RealEstateAgent',$basicInfos);

    if(isset($broker->company_name)){
      $this->_schema['legalName'] = $broker->company_name;
    }
    if(isset($broker->office)){
      $this->_schema['address'] = array(
        '@type' => 'PostalAddress',
        'streetAddress' => $broker->office->location->address->street_number . ' ' . $broker->office->location->address->street_name,
        'addressLocality' => (isset($broker->office->location->city)) ? $broker->office->location->city : ''
      );
    }
    
    $this->_schema['email'] = $broker->email;
    $this->_schema['telephone'] = isset($broker->phones->cell) ? $broker->phones->cell 
                                : isset($broker->phones->office) ? $broker->phones->office : '';

    $this->_schema['url'] = $this->currentPageUrl();
  }
}

class ListingSchema extends BaseDataSchema{
  public function __construct($listing){
    if(!isset($listing->description)) $listing->description = '';

    $basicInfos = new BaseSchemaInfos($listing->subcategory . ' ' . $listing->transaction, $listing->photos, $listing->description);
    parent::__construct('Product',$basicInfos);

    if(isset($listing->price->sell)){
      $currency = (isset($listing->price->sell->currency)) ? $listing->price->sell->currency : '';

      $this->addOffer('Residence',$listing->price->sell->amount, $currency, $listing->location);
    }
    else{
      $currency = (isset($listing->price->lease->currency)) ? $listing->price->lease->currency : '';
      $this->addOffer('Residence',$listing->price->lease->amount,$currency, $listing->location);
    }
  }
}

class ListingOpenHouseSchema extends BaseDataSchema{
  public function __construct($listing, $open_house){
    $basicInfos = new BaseSchemaInfos($listing->subcategory . ' ' . $listing->transaction, $listing->photos[0]->url, $listing->description);
    parent::__construct('Event',$basicInfos);

    $this->addLocation('Place',$listing->location);
    $interval = date_diff(date_create($open_house->start_date), date_create($open_house->end_date));
    $startDate = is_date($open_house->start_date) ? $open_house->start_date : strtotime($open_house->start_date);
    $endDate = is_date($open_house->end_date) ? $open_house->end_date : strtotime($open_house->end_date);
    $this->_schema['startDate'] = Date('d-m-Y', $startDate);
    $this->_schema['endDate'] = Date('d-m-Y', $endDate);
    $this->_schema['doorTime'] = Date('H:i', $startDate);
    $this->_schema['duration'] = $interval->format('%h:%i');
    $this->_schema['url'] = $this->currentPageUrl();
    $this->_schema['offers'] = array(
      'availability' => 'LimitedAvailability',
      'price' => $listing->price->sell->amount,
      'priceCurrency' => $listing->price->sell->currency,
      'url' => $this->currentPageUrl(),
      'validFrom' => Date('d-m-Y', $startDate)
    );

    foreach($listing->brokers as $broker){
      $this->addPerformer($broker);
    }
  }
}
#endregion

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