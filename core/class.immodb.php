<?php
/*
Start up class for ImmoDB
*/

class ImmoDB {
  const API_HOST = 'http://localhost:60071';

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

    if (!is_admin() ){
      $this->register_filters(array(
        'language_attributes' => 'set_html_attributes'
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
        return $list;
      }
    } 

    return null;
  }

  public function get_permalink($type, $locale = null){
    $locale = ($locale == null)?substr(get_locale(),0,2): $locale;

    if(method_exists($this, "get_{$type}_permalink")){
      return $this->{'get_' . $type . '_permalink'}($locale);
    }
    
    return '';
  }

  public function get_listing_permalink($locale = null){
    $locale = ($locale == null)?substr(get_locale(),0,2): $locale;
    $lResult = $this->configs->listing_routes[0]->route;
    foreach($this->configs->listing_routes as $item){
      if($item->lang == $locale){
        $lResult = $item->route;
      }
    }

    return  $lResult;
  }

  public function get_broker_permalink($locale = null){
    $locale = ($locale == null)?substr(get_locale(),0,2): $locale;
    $lResult = $this->configs->listing_routes[0]->route;
    foreach($this->configs->listing_routes as $item){
      if($item->lang == $locale){
        $lResult = $item->route;
      }
    }

    return $lResult;
  }


  /**
  * Set routes based on configurations
  */
  public function update_routes() {
    // check if routes exists

    // add routes

  }



/**
  RENDERING
*/

  public function load_resources(){
    $lTwoLetterLocale = substr(get_locale(),0,2);

    wp_enqueue_style( 'fontawesome5', plugins_url('/styles/fa/fontawesome-all.min.css', IMMODB_PLUGIN) );
    wp_enqueue_style( 'immodb-style', plugins_url('/styles/public.min.css', IMMODB_PLUGIN) );

    wp_enqueue_script( 'angular', 'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.js', null, '1.6.9', false );
    wp_add_inline_script( 'angular', 'var immodbApiSettings={locale:"' . $lTwoLetterLocale . '",rest_root:"' . esc_url_raw( rest_url() ) . '", nonce: "' . wp_create_nonce( 'wp_rest' ) . '", api_root:"' . self::API_HOST . '"};' );
    wp_enqueue_script( 'immodb-prototype', plugins_url('/scripts/ang.prototype.js', IMMODB_PLUGIN), null, null, true );
    wp_enqueue_script( 'immodb-public-app', plugins_url('/scripts/ang.public-app.js', IMMODB_PLUGIN), null, null, true );
  }

  public function set_html_attributes($attr){
    return "{$attr} ng-app=\"ImmoDb\" ng-controller=\"publicCtrl\" ";
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
    if(strpos('admin', $path) != 0){

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
    $locale_file_path = IMMODB_PLUGIN_DIR . '/scripts/locales/global.' . $locale . '.js';
    if(file_exists($locale_file_path)){
      $locale_str = file_get_contents($locale_file_path);
      
      // remove first line
      $locale_str = preg_replace('/^.+\n/', '', $locale_str);
      // remove comment lines
      $locale_str = preg_replace('/.+\/\/.+/m', '', $locale_str);

      if (0 === strpos(bin2hex($locale_str), 'efbbbf')) $locale_str = substr($locale_str, 3);

      $this->locales = json_decode($locale_str, true);
    }
  }

  public function translate($translated_text, $text, $domain){
    
    if($domain == IMMODB){
      
      $locale = substr(get_locale(),0,2);
      
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
      // if $func is empty, fallback to $hook for function name
      $funcName = (empty($func))?$hook:$func;
      if(method_exists($this,$funcName)){ // only if method exists
        add_action($hook, array($this, $funcName));
      }
    }
  }

  /**
  * Shortcut for multiple filter hook registration
  */
  private function register_filters($hooks){
    foreach ($hooks as $hook => $func) {
      // if $func is empty, fallback to $hook for function name
      $funcName = (empty($func))?$hook:$func;
      if(method_exists($this,$funcName)){ // only if method exists
        add_filter($hook, array($this, $funcName));
      }
    }
  }
}
