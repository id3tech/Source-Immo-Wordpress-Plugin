<?php
/*
Start up class for ImmoDB
*/

class ImmoDB {
  const API_HOST = 'http://localhost:60071';

  public $configs = null;

  public function __construct(){
    $this->configs = ImmoDbConfig::load();

    if (!is_admin() ){
      // create an instance of the shortcodes class to force code bindings
      new ImmoDbShorcodes();
    }
  }

  /**
  * Initializes WordPress hooks
  */
  private function init_hooks() {

  }

  public function get_account_id() {
    return $this->configs->account_id;
  }

  public function get_api_key() {
    return $this->configs->api_key;
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
}
