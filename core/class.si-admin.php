<?php
/*
Admin management class
*/

class SourceImmoAdmin {
  const CONFIG_PAGE_KEY = 'source-immo';
  const CONFIG_MENU_LOCATION = 'settings';

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
      'plugin_action_links_'.plugin_basename(SI_PLUGIN_DIR. 'source-immo.php') => 'admin_plugin_settings_link', // little "settings" link in the plugin page
    ));

	}

  /***
    MAIN CONFIG RENDERING
  */

  public function render_page(){
    SourceImmo::view( 'admin/master' );
  }


  public function admin_help(){

  }

  public function load_resources($page){
    $ressource_location = 'settings_page_';
    if(self::CONFIG_MENU_LOCATION == 'root'){
      $ressource_location = 'toplevel_page_';
    }

    //__c($page);

    if($page == $ressource_location  . self::CONFIG_PAGE_KEY){
      wp_enqueue_media();
      wp_enqueue_style( 'fontawesome5', plugins_url('/styles/fa/all.min.css', SI_PLUGIN) );
      wp_enqueue_style( 'si-style', plugins_url('/styles/admin.min.css', SI_PLUGIN) );
      wp_enqueue_style( 'si-color-picker-style', plugins_url('/styles/mdColorPicker.min.css', SI_PLUGIN) );
    }
  }


  /***
    WP ADMIN UI INTEGRATION
  */

  /**
  * Generate Admin menu item
  */
  public function load_menu() {
    $hook = false;

    if(self::CONFIG_MENU_LOCATION != 'root'){
      $hook = add_options_page(
            __('Source Immo', SI),
            __('Source Immo', SI),
            'manage_options',
            self::CONFIG_PAGE_KEY,
            array( $this, 'render_page' )
      );
    }
    else{
      $logoContent = file_get_contents(SI_PLUGIN_DIR . '/styles/assets/logo.svg');
      $logoBase64 = 'data:image/svg+xml;base64,' . base64_encode($logoContent);
      $warnings = '';
  
      $last_warnings = get_transient('si-last-error-count');
      if($last_warnings != null){
        $warnings = sprintf(' <span class="awaiting-mod">%d</span>',$last_warnings);
      }
  
      add_menu_page(
        __('Source.Immo',SI) // page title  
        , __('Source.Immo',SI) . $warnings // menu title
        , 'manage_options'     // capabilities
        , 'source-immo' //menu_slug
        , array( $this, 'render_page' ) // function
        , $logoBase64 // icon_url
       // , 50 // position, just before Apparence separator(59)
      );
    }

    if ( $hook ) {
      add_action( "load-$hook", array( $this, 'admin_help' ) );
    }
  }
  
  public function add_admin_menu_separator($position){
    global $menu;
    $index = 0;
    foreach($menu as $offset => $section) {
      if (substr($section[2],0,9)=='separator')
        $index++;
      if ($offset>=$position) {
        $menu[$position] = array('','read',"separator{$index}",'','wp-menu-separator');
        break;
      }
    }
    ksort( $menu );
  }

  public function add_admin_menu_bubble($content){
    global $menu;


    foreach ( $menu as $key => $value ) {

      if ( $menu[$key][2] == 'source-immo' ) {
        $problem_count = 2;
        $menu[$key][0] .= ' ' . $problem_count . '';

        return;
      }
    }
  }

  /**
  * Initialization on admin
  */
  public static function admin_init() {
		load_plugin_textdomain( SI );
	}


  /**
  * Add the "settings" link below the plugin name in the plugins management page
  */
  public function admin_plugin_settings_link( $links ) {
  		$settings_link = '<a href="'.esc_url( self::get_page_url() ).'">'.__('Settings', SI).'</a>';
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
      self::$current_instance = new SourceImmoAdmin();
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
    $url = add_query_arg( $args, admin_url( 'admin.php' ) );

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
