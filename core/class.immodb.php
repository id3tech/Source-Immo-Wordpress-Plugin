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

  /**
   * @param string $type Type of the layout
   */
  function get_detail_layout($type){
    $locale = substr(get_locale(),0,2);
    $layout_list = $this->configs->{$type . '_layouts'};

    $lResult = $layout_list[0];
    foreach ($layout_list as $layout) {
      if($locale == $layout->lang){
        $lResult = $layout;
      }
    }
    return $lResult;
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
          $ruleKey[] = '(.+)';
          if($part=='{{item.ref_number}}'){
            $matches[] = 'ref_number=$matches[' . $index . ']';
          }
        }
        $index++;
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
          $ruleKey[] = '(.+)';
          if($part=='{{item.ref_number}}'){
            $matches[] = 'ref_number=$matches[' . $index . ']';
          }
        }
        $index++;
      }
      $newrules['^' . implode('/',$ruleKey) . '/?'] = 'index.php?lang='. $route->lang .'&type=brokers&' . implode('&', $matches);

      //$newrules['proprietes/(\D?\d+)(/(.+)/(.+)/(\D+))?/?'] = 'index.php?ref_number=$matches[1]&transaction=$matches[3]&genre=$matches[4]&city=$matches[5]';
    }

    //Debug::force($this->configs->listing_routes, $newRules);

    return array_merge($newrules, $rules);
  }

  public function update_routes_query_var($vars){
    $vars[] = "ref_number";
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
    $lConfigPath  = $lUploadDir['baseurl'] . '/_immodb/_configs.json';
    
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
    return "{$attr} ng-app=\"ImmoDb\" ng-controller=\"publicCtrl\"";
  }

  function include_listings_detail_template(){
    $ref_number = get_query_var( 'ref_number' );
    global $permalink, $post,$listing_data;

    do_action('immodb_listing_detail_begin');

    // load data
    global $listing_data;
    $listing_data = json_decode(ImmoDBApi::get_listing_data($ref_number));

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

  function include_brokers_detail_template(){
    $ref_number = get_query_var( 'ref_number' );
    global $broker_data;
    
    do_action('immodb_broker_detail_begin');

    // load data
    $broker_data = json_decode(ImmoDBApi::get_broker_data($ref_number));

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
      }
    }
  }

  public function preprocess_item(&$item){
    global $dictionary;

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

      foreach ($this->cities as $item) {
        $this->preprocess_item($item);
      }
    }
  }

  public function preprocess_item(&$item){
    global $dictionary;
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
      }
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


  public static function getCity($item, $sanitize=true){
    global $dictionary;
    $lResult = $dictionary->getCaption($item->location->city_code, 'city');

    if($sanitize){
        $lResult = sanitize_title($lResult);
    }

    return $lResult;
  }

  public static function getRegion($item, $sanitize=true){
    global $dictionary;
    $lResult = $dictionary->getCaption($item->location->region_code, 'region');

    if($sanitize){
        $lResult = sanitize_title($lResult);
    }

    return $lResult;
  }

  public static function getTransaction($item, $sanitize=true){
    $lResult = array();

    foreach ($item->price as $key => $value) {
      if(in_array($key, array('sell','lease'))){
        $lResult[] = __('To ' . $key, IMMODB);
      }
    }

    $lResult = implode(__(' or ',IMMODB),$lResult);

    if($sanitize){
        $lResult = sanitize_title($lResult);
    }

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
    //Debug::write(json_decode(json_encode($item),true));
    $lAttrList = self::getAttributeValueList($item);
    
    //Debug::write($lAttrList);
    
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

}