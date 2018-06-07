<?php
/*
Admin management class
*/

class ImmoDBAdmin {
  const CONFIG_PAGE_KEY = 'immodb-config';

  public function init_hooks() {
    $this->register_actions(array(
      'admin_init'=>'',
      'admin_menu'=>'load_menu',
      'admin_notices'=>'',
      'admin_enqueue_scripts'=>'load_resources',
      'activity_box_end'=>'',
      'rightnow_end'=>'',
    ));

    $this->register_filters(array(
      'plugin_action_links_'.plugin_basename(IMMODB_PLUGIN_DIR. 'immodb.php') => 'admin_plugin_settings_link', // little "settings" link in the plugin page
    ));

	}

  /***
    MAIN CONFIG RENDERING
  */

  public function render_page(){
    ImmoDB::view( 'admin/master' );
  }


  public function admin_help(){

  }

  public function load_resources(){
    wp_enqueue_style( 'fontawesome5', plugins_url('/styles/fa/fontawesome-all.min.css', IMMODB_PLUGIN) );
    wp_enqueue_style( 'immodb-style', plugins_url('/styles/admin.min.css', IMMODB_PLUGIN) );
  }

  /***
    WP ADMIN UI INTEGRATION
  */

  /**
  * Generate Admin menu item
  */
  public function load_menu() {
		$hook = add_options_page(
              __('Immo DB', IMMODB_TEXT_DOMAIN),
              __('Immo DB', IMMODB_TEXT_DOMAIN),
              'manage_options',
              self::CONFIG_PAGE_KEY,
              array( $this, 'render_page' )
    );

    if ( $hook ) {
			add_action( "load-$hook", array( $this, 'admin_help' ) );
		}
	}

  /**
  * Initialization on admin
  */
  public static function admin_init() {
		load_plugin_textdomain( IMMODB_TEXT_DOMAIN );
	}


  /**
  * Add the "settings" link below the plugin name in the plugins management page
  */
  public function admin_plugin_settings_link( $links ) {
  		$settings_link = '<a href="'.esc_url( self::get_page_url() ).'">'.__('Settings', IMMODB_TEXT_DOMAIN).'</a>';
  		array_unshift( $links, $settings_link );
  		return $links;
	}


  /**
  STATICS
  **/

  /**
  * Get a singleton of the class
  * @static
  */
  public static function current() {
    if(self::$current_instance==null){
      self::$current_instance = new ImmoDBAdmin();
    }
    return self::$current_instance;
  }
  private static $current_instance = null;

  /**
  * Return plugin's admin configuration page
  * @static
  */
  public static function get_page_url( $page = 'config' ) {

		$args = array( 'page' => self::CONFIG_PAGE_KEY );
		//$url = add_query_arg( $args, admin_url( 'admin.php' ) );
    $url = add_query_arg( $args, admin_url( 'options-general.php' ) );

		return $url;
	}

  private static $initiated = false;
  public static function init() {
    if ( ! self::$initiated ) {
			self::current()->init_hooks();
      self::$initiated = true;
		}
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
