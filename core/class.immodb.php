<?php
/*
Start up class for ImmoDB
*/

class ImmoDB {
  const API_HOST = 'https://api-v1.source.immo';

  public $configs = null;

  public $locales = null;

  public function __construct(){
    $this->configs = ImmoDbConfig::load();
    $this->load_locales();

    if (!is_admin() ){
      // create an instance of the shortcodes class to force code bindings
      new ImmoDbShorcodes();
    }
  }

  /**
  * Initializes WordPress hooks
  */
  private function init_hooks() {
    
    // add custom translation
    add_filter( 'gettext', array($this, 'translate'), 20, 3 );
    
    $this->register_filters(array(
      // add route rules
      'query_vars' => 'update_routes_query_var',
      'rewrite_rules_array' => 'update_routes',
      'locale' => 'detect_locale'
    ));
    $this->register_actions(array(
      'template_redirect',
      'after_setup_theme' => 'detect_locale'
    ));

    if (!is_admin() ){
      $this->register_filters(array(
        'language_attributes' => 'set_html_attributes',
        'body_class' => 'body_class',
      ));

      $this->register_actions(array(
        'wp_enqueue_scripts' => 'load_resources',
      ));
    }
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
        return ImmoDBList::parse($list);
      }
    } 

    return null;
  }

  public function get_permalink($type){
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

  /**
  * Set routes based on configurations
  */
  public function update_routes($rules) {
    // check if routes exists
    //Debug::write($rules);
    $newrules = array();

    // add routes
    foreach($this->configs->listing_routes as $route){
      $ruleKey = array();
      $routeParts = explode('/', $route->route);
      $index = 0;
      $matches = array();
      foreach ($routeParts as $part) {
        if(strpos($part,'{{')===false){
          $ruleKey[] = $part;
        }
        else{
          $index++;
          $ruleKey[] = '(.+)';
          $partKey = str_replace('.','_', str_replace(array('{{','}}','item.'),'', $part));
          $matches[] = $partKey . '=$matches[' . $index . ']';
          // if($part=='{{item.ref_number}}'){
          //   $matches[] = 'ref_number=$matches[' . $index . ']';
          // }
          
        }
      }
      $newrules['^' . implode('/',$ruleKey) . '/?'] = 'index.php?lang='. $route->lang .'&type=listings&' . implode('&', $matches);

      //$newrules['proprietes/(\D?\d+)(/(.+)/(.+)/(\D+))?/?'] = 'index.php?ref_number=$matches[1]&transaction=$matches[3]&genre=$matches[4]&city=$matches[5]';
    }

    // add routes
    foreach($this->configs->broker_routes as $route){
      $ruleKey = array();
      $routeParts = explode('/', $route->route);
      $index = 0;
      $matches = array();
      foreach ($routeParts as $part) {
        if(strpos($part,'{{')===false){
          $ruleKey[] = $part;
        }
        else{
          $index++;
          $ruleKey[] = '(.+)';
          if($part=='{{item.ref_number}}'){
            $matches[] = 'ref_number=$matches[' . $index . ']';
          }
        }
        
      }
      $newrules['^' . implode('/',$ruleKey) . '/?'] = 'index.php?lang='. $route->lang .'&type=brokers&' . implode('&', $matches);
    }

    // add routes
    foreach($this->configs->city_routes as $route){
      $ruleKey = array();
      $routeParts = explode('/', $route->route);
      $index = 0;
      $matches = array();
      foreach ($routeParts as $part) {
        if(strpos($part,'{{')===false){
          $ruleKey[] = $part;
        }
        else{
          $index++;
          $ruleKey[] = '(.+)';
          if($part=='{{item.ref_number}}'){
            $matches[] = 'ref_number=$matches[' . $index . ']';
          }
          
        }
        
      }
      $newrules['^' . implode('/',$ruleKey) . '/?'] = 'index.php?lang='. $route->lang .'&type=cities&' . implode('&', $matches);
    }

    //Debug::force($this->configs->listing_routes, $newRules);

    return array_merge($newrules, $rules);
  }

  public function update_routes_query_var($vars){
    $vars[] = "ref_number";
    $vars[] = "location_region";
    $vars[] = "location_city";
    $vars[] = "type"; 
    $vars[] = "lang";

    return $vars;
  }

  
	function template_redirect(){
    $ref_number = get_query_var( 'ref_number' );
		if ( $ref_number ) {
      $type = get_query_var( 'type' );
      add_filter( 'template_include', array($this, 'include_' . $type . '_detail_template'));
    }
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


  

  /**
    RENDERING
  */

  /**
  * Add styles and scripts file to the page
  */
  public function load_resources(){
    $lTwoLetterLocale = substr(get_locale(),0,2);
    
    wp_enqueue_style( 'fontawesome5', plugins_url('/styles/fa/all.min.css', IMMODB_PLUGIN) );
    wp_enqueue_style( 'bootstrap', 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css');
    wp_enqueue_style( 'immodb-style', plugins_url('/styles/public.min.css', IMMODB_PLUGIN), null, filemtime(IMMODB_PLUGIN_DIR . '/styles/public.min.css') );
    
    wp_enqueue_script( 'angular', 'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.js', null, null, true );
    wp_enqueue_script( 'angular-sanitize', 'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-sanitize.min.js', 'angular', null, true );
    wp_enqueue_script( 'moment', 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment-with-locales.min.js',null, null, true);
    wp_enqueue_script( 'angular-moment', 'https://cdnjs.cloudflare.com/ajax/libs/angular-moment/1.3.0/angular-moment.min.js', array('angular','moment'), null, true);
    wp_enqueue_script( 'bootstrap-popper', 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js', null, null, true );
    wp_enqueue_script( 'bootstrap', 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js', 'bootstrap-popper', null, true );
    wp_enqueue_script( 'material', 'https://ajax.googleapis.com/ajax/libs/angular_material/1.1.8/angular-material.min.js', 'angular', null, true );
    // swipe-touch handling library
    wp_enqueue_script( 'hammerjs', 'https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js', null, null, true );
    // google map API library
    if($this->configs->map_api_key != ''){
      wp_enqueue_script( 'google-map', 'https://maps.googleapis.com/maps/api/js?key=' . $this->configs->map_api_key . '&libraries=places', null, null, true );
      wp_enqueue_script( 'google-map-cluster', 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js', 'google-map', null, true );
    }
    

    wp_enqueue_style("rzslider", "https://cdnjs.cloudflare.com/ajax/libs/angularjs-slider/6.6.1/rzslider.min.css", array('immodb-style'), "1", "all");
	  wp_enqueue_script("rzslider", "https://cdnjs.cloudflare.com/ajax/libs/angularjs-slider/6.6.1/rzslider.min.js", array('angular'), '', true);

    wp_enqueue_script( 'immodb-prototype', plugins_url('/scripts/ang.prototype.js', IMMODB_PLUGIN), null, null, true );
    $lUploadDir   = wp_upload_dir();
    $lConfigPath  = str_replace('http://','//',$lUploadDir['baseurl'] . '/_immodb/_configs.json');
    
    wp_add_inline_script( 'immodb-prototype', 
                          //'$locales.init("' . $lTwoLetterLocale . '");$locales.load("' . plugins_url('/scripts/locales/global.'. $lTwoLetterLocale .'.json', IMMODB_PLUGIN) . '");' .
                          '$locales.init("' . $lTwoLetterLocale . '");' .
                          'var immodbApiSettings={locale:"' . $lTwoLetterLocale . '",rest_root:"' . esc_url_raw( rest_url() ) . '", nonce: "' . wp_create_nonce( 'wp_rest' ) . '", api_root:"' . self::API_HOST . '"};' .
                          'var immodbCtx={locale:"' . $lTwoLetterLocale . '", config_path:"' . $lConfigPath . '", base_path:"' . plugins_url('/', IMMODB_PLUGIN) . '", listing_routes : ' . json_encode($this->configs->listing_routes) . ', broker_routes : ' . json_encode($this->configs->broker_routes) . '};'
                        );
    if($lTwoLetterLocale!='en'){
      wp_enqueue_script('immodb-locales', plugins_url('/scripts/locales/global.'. $lTwoLetterLocale .'.js', IMMODB_PLUGIN), 
                null, 
                filemtime(IMMODB_PLUGIN_DIR . '/scripts/locales/global.'. $lTwoLetterLocale .'.js'), true );
    }
    do_action("immodb-append-locales");

    if(IMMODB_DEVMODE){
      wp_register_script( 'immodb-public-app', plugins_url('/scripts/ang.public-app.js', IMMODB_PLUGIN), 
              array('angular', 'angular-sanitize','immodb-prototype'), 
              filemtime(IMMODB_PLUGIN_DIR . '/scripts/ang.public-app.js'), true );

    }
    else{
      wp_register_script( 'immodb-public-app', plugins_url('/scripts/ang.public-app.min.js', IMMODB_PLUGIN), 
            array('angular', 'angular-sanitize','immodb-prototype'), 
            filemtime(IMMODB_PLUGIN_DIR . '/scripts/ang.public-app.min.js'), true );
    }
    wp_enqueue_script('immodb-public-app'); 
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
    return "{$attr} data-ng-app=\"ImmoDb\" data-ng-controller=\"publicCtrl\"";
  }

  function include_listings_detail_template(){
    $ref_number = get_query_var( 'ref_number' );
    global $permalink, $post,$listing_data;

    // load data
    global $listing_data;
    $listing_data = json_decode(ImmoDBApi::get_listing_data($ref_number));
    if($listing_data != null){
      do_action('immodb_listing_detail_begin');
      // hook to sharing tools
      $share_tool = new ImmoDbSharing($listing_data);
      $share_tool->addHook('listing');
      
      $permalink = $share_tool->getPermalink();

      $post->permalink = $permalink;

      // add hook for permalink
      add_filter('the_permalink', function($url){
        global $permalink;
        return $permalink;
      });
      add_action('the_post', function($post_object){
        global $permalink;
        $post_object->permalink = $permalink;
      });

      
      self::view('single/listings', array('ref_number'=>$ref_number, 'data' => $listing_data, 'permalink' => $permalink));
      
    }
    else{
      header('http/1.0 404 not found');

      self::view('single/listings_404', array());
    }
  }
  

  function include_brokers_detail_template(){
    $ref_number = get_query_var( 'ref_number' );
    global $broker_data,$post;
    // load data
    $broker_data = json_decode(ImmoDBApi::get_broker_data($ref_number));

    if($broker_data != null){
      do_action('immodb_broker_detail_begin');

      

      // hook to sharing tools
      $share_tool = new ImmoDbSharing($broker_data);
      $share_tool->addHook('broker');
      
      $permalink = $share_tool->getPermalink();

      $post->permalink = $permalink;

      // add hook for permalink
      add_filter('the_permalink', function($url){
        global $permalink;
        return $permalink;
      });
      add_action('the_post', function($post_object){
        global $permalink;
        $post_object->permalink = $permalink;
      });

      self::view('single/brokers', array('ref_number'=>$ref_number, 'data' => $broker_data));
    }
    else{
      header('http/1.0 404 not found');
      self::view('single/brokers_404', array());
    }
  }

  function include_cities_detail_template(){
    $ref_number = get_query_var( 'ref_number' );
    // global $permalink, $post,$city_data;

    // // load data
    // global $city_data;
    // $city_data = ImmoDBApi::get_city_listings_data($ref_number);
    // $city_data = new ImmoDBListingsResult($city_data);
    // Debug::write($city_data);

    //if($city_data != null){
      do_action('immodb_listing_detail_begin');
      // hook to sharing tools
      //$share_tool = new ImmoDbSharing($city_data);
      //$share_tool->addHook('listing');
      
      //$permalink = $share_tool->getPermalink();

      //$post->permalink = $permalink;

      // add hook for permalink
      // add_filter('the_permalink', function($url){
      //   global $permalink;
      //   return $permalink;
      // });
      // add_action('the_post', function($post_object){
      //   global $permalink;
      //   $post_object->permalink = $permalink;
      // });

      self::view('single/cities', array('ref_number'=>$ref_number, 'data' => null, 'permalink' => null));      
    //}
    // else{
    //   header('http/1.0 404 not found');

    //   self::view('single/cities_404', array());
    // }
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
    $args = apply_filters( 'immodb_view_arguments', $args, $path );

    // extract args value into local variable
		foreach ( $args AS $key => $val ) {
			$$key = $val;
		}

		load_plugin_textdomain( 'immodb' );

		$file = IMMODB_PLUGIN_DIR . 'views/'. $path . '.php';

    // unless it's a view for admin configuration,
    // developper can override the path or layout
    if(strpos('admin', $path) === false){
      
      // apply filter on $file to allow custom view path
      $file = apply_filters( 'immodb_view_path', $file, $path );

      // finally, check if the view has been overwritten in the template folder
      $file = ThemeOverrides::search($file, 'views');
    }

    if(file_exists($file)){
  		include( $file );
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
   TRANSLATION
  */
  public function load_locales(){
    $locale = substr(get_locale(),0,2);
    $locale_file_paths = apply_filters('immodb-locale-file-paths',array(IMMODB_PLUGIN_DIR . 'scripts/locales/global.' . $locale . '.js'));
    
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
        $this->locales = apply_filters('immodb-initialize-locale', $this->locales);
      }
    }
    
  }

  public function translate($translated_text, $text, $domain){
    
    if($domain == IMMODB){
      
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
			self::current()->init_hooks();
		}
	}
  private static $initiated = false;

  /**
  * Get a singleton of the class
  * @static
  * @return ImmoDB
  */
  public static function current() {
    if(self::$current_instance==null){
      self::$current_instance = new ImmoDB();
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

class ImmoDbSharing{

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
    //Yoast
    add_filter('wpseo_title', array($this, 'title'), 10,1);
    add_filter('wpseo_metadesc', array($this,'desc'), 10,1);
    add_filter('wpseo_opengraph_image', array($this, 'image'), 10,1);
    add_filter('wpseo_canonical',array($this,'url'),10,1);
  }

  public function title($title){
    if($this->title != null){
      $title = $this->title;
    }
    return $title;
  }

  public function desc($desc){
    if($this->desc != null){
      $desc = $this->desc;
    }
    return $desc;
  }

  public function image($image_path){
    if($this->image != null){
      $image_path = $this->image;
    } 
    return $image_path;
  }

  public function url($url){
    if($this->url != null){
      $url = $this->url;
    } 
    return $url;
  }

  public function brokerPreprocess(){
    global $dictionary;
    $objectWrapper = new ImmoDBBrokersResult();
    $dictionary = new ImmoDBDictionary($this->object->dictionary);
    $objectWrapper->preprocess_item($this->object);
    $this->object->permalink = $objectWrapper->buildPermalink($this->object, ImmoDB::current()->get_broker_permalink());

    $this->title = $this->object->first_name . ' ' . $this->object->last_name;
    $this->desc = $this->object->license_type;
    $this->image = $this->object->photo->url;
    $this->url = $this->object->permalink;
  }

  public function listingPreprocess(){
    global $dictionary;
    $listingWrapper = new ImmoDBListingsResult();
    $dictionary = new ImmoDBDictionary($this->object->dictionary);
    $listingWrapper->preprocess_item($this->object);
    $this->object->permalink = $listingWrapper->buildPermalink($this->object, ImmoDB::current()->get_listing_permalink());

    $this->title = $this->object->subcategory . ' ' . $this->object->location->full_address;
    $this->desc = isset($this->object->description) ? $this->object->description : '';
    $this->image = $this->object->photos[0]->url;
    $this->url = $this->object->permalink;
  }

  public function getPermalink(){
    return $this->object->permalink;
  }
}


class ImmoDBDictionary{
  public $entries = null;

  public function __construct($entries){
    $this->entries = $entries;
  }

  public function getCaption($key, $domain, $asAbbr=false){
    $lResult = $key;

    if(isset($this->entries) && $this->entries->{$domain}){
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
}

class ImmoDBBrokersResult extends ImmoDBAbstractResult {
  public $brokers = null;
  public $metadata = null;

  public function __construct($data=null){
    if($data!=null){
      $this->brokers = $data->items;
      $this->metadata = $data->metadata;

      foreach ($this->brokers as $item) {
        $this->preprocess_item($item);

        $item->permalink = self::buildPermalink($item, ImmoDB::current()->get_broker_permalink());
      }

      self::validatePagePermalinks($this->brokers);
    }
  }

  public function preprocess_item(&$item){
    global $dictionary;

    $item->fullname = $item->first_name . ' ' . $item->last_name;
    if(isset($item->license_type_code)){
      $item->license_type = $dictionary->getCaption($item->license_type_code , 'broker_license_type');
    }
  }
}

class ImmoDBCitiesResult extends ImmoDBAbstractResult {
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
      
      self::validatePagePermalinks($this->cities);
    }
  }

  public function preprocess_item(&$item){
    global $dictionary;

    $item->location = (object) array();
    $item->location->region = $dictionary->getCaption($item->region_code , 'region');
    $item->location->country = $dictionary->getCaption($item->country_code , 'country');
    $item->location->state = $dictionary->getCaption($item->state_code , 'state');

    $item->permalink = self::buildPermalink($item, ImmoDB::current()->get_city_permalink());
  }
}

class ImmoDBListingsResult extends ImmoDBAbstractResult {
  public $listings = null;
  public $metadata = null;

  public function __construct($data=null){
    if($data!=null){
      $this->listings = $data->items;
      $this->metadata = $data->metadata;

      foreach ($this->listings as $item) {
        $this->preprocess_item($item);

        $item->permalink = self::buildPermalink($item, ImmoDB::current()->get_listing_permalink());
      }

      self::validatePagePermalinks($this->listings);
    }
  }
  
  
  public function preprocess_item(&$item){
    global $dictionary;

    if(isset($item->location->address->street_number) && $item->location->address->street_number != ''){
      $item->location->civic_address = $item->location->address->street_number . ' ' . $item->location->address->street_name;
    }
    else{
      $item->location->civic_address = '';
    }
    
    $item->location->city = $dictionary->getCaption($item->location->city_code , 'city');
    $item->location->region = $dictionary->getCaption($item->location->region_code , 'region');
    if($item->location->civic_address != ''){
      $item->location->full_address = $item->location->civic_address . ', ' . $item->location->city;
    }
    else{
      $item->location->full_address = $item->location->city;
    }
    

    $item->category = $dictionary->getCaption($item->category_code , 'listing_category');
    $item->transaction = $this->getTransaction($item);
    if(isset($item->subcategory_code)){
      $item->subcategory = $dictionary->getCaption($item->subcategory_code , 'listing_subcategory');
    }
    else{
      $item->subcategory='';
    }

    foreach($item->brokers as $broker){
      $brokerData = new ImmoDBBrokersResult();
      $brokerData->preprocess_item($broker);
    }
  }
  
  public static function formatPrice($price){
    $lResult = array();

    $priceFormat = __('${0}',IMMODB);

    if(isset($price->sell)){
      $lResult[] = StringPrototype::format($priceFormat, number_format($price->sell->amount,0,"."," "));
    }

    if(isset($price->lease)){
      $lResult[] = StringPrototype::format($priceFormat,number_format($price->lease->amount,2,"."," "));
    }

    return implode(__(' or ',IMMODB), $lResult);
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

    foreach ($item->price as $key => $value) {
      if(in_array($key, array('sell','lease'))){
        $lResult[] = __('To ' . $key, IMMODB);
      }
    }

    $lResult = implode(__(' or ',IMMODB),$lResult);

    return $lResult;
  }

}

class ImmoDBAbstractResult{

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

  public static function buildPermalink($item, $format){
    $lResult = $format;
    
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
    
    return '/'. str_replace(' ','-',$lResult);
  }

  public static function validatePagePermalinks($list){
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

    foreach ($pages as $page) {
      $pagePermalink = str_replace(array('http://','https://',$_SERVER['HTTP_HOST']), '' ,get_permalink($page));

      foreach ($list as $item) {
        if(isset($item->permalink) && strpos($item->permalink, $pagePermalink)!== false){
          // remove item permalink 'ID'
          $lId = (isset($item->ref_number))?$item->ref_number: $item->code;
          $lItemLink = str_replace($lId,'',$item->permalink);
          
          if($pagePermalink == $lItemLink){
            $item->has_custom_page = true;
            $item->permalink = $lItemLink;
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
    $this->_schema['image'] = $infos->image;
    $this->_schema['description'] = $infos->description;

    $this->_schema_basic_info = $infos;
  }

  public function addOffer($type,$price,$currency, $location ){
    $this->_schema['offers'] = array(
      array(
        '@type' => 'Offer',
        'price' => $price,
        'priceCurrency' => $currency,
        'category' => array(
          '@type' => $type,
          'name' => $this->_schema_basic_info->name,
          'image' => $this->_schema_basic_info->image,
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
        isset($broker->photo_url) ? $broker->photo_url : $broker->photo->url, 
        $broker->license_type);
    parent::__construct('RealEstateAgent',$basicInfos);

    if(isset($broker->company_name)){
      $this->_schema['legalName'] = $broker->company_name;
    }
    if(isset($broker->office)){
      $this->_schema['address'] = array(
        '@type' => 'PostalAddress',
        'streetAddress' => $broker->office->location->address->street_number . ' ' . $broker->office->location->address->street_name,
        'addressLocality' => $broker->office->location->city
      );
    }
    
    $this->_schema['email'] = $broker->email;
    $this->_schema['telephone'] = isset($broker->phones->cell) ? $broker->phones->cell : $broker->phones->office;

    $this->_schema['url'] = $this->currentPageUrl();
  }
}

class ListingSchema extends BaseDataSchema{
  public function __construct($listing){
    $basicInfos = new BaseSchemaInfos($listing->subcategory . ' ' . $listing->transaction, $listing->photos[0]->url, $listing->description);
    parent::__construct('Product',$basicInfos);

    $this->addOffer('Residence',$listing->price->sell->amount,$listing->price->sell->currency, $listing->location);
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