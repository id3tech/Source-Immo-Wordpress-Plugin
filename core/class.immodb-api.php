<?php
/*
API interface class
*/

class ImmoDBApi {
  /**
  * REST API Wordpress init
  * register all rest route
  * @static
  */
  public static function init() {
    // Acquire access token to make call to the immodb remote api
    register_rest_route( 'immodb','/access_token',
      array(
        'methods' => WP_REST_Server::READABLE,
        //'permission_callback' => array( 'ImmoDBApi', 'privileged_permission_callback' ),
        'callback' => array( 'ImmoDBApi', 'get_access_token' ),
      )
    );

    // Acquire access token to make call to the immodb remote api
    register_rest_route( 'immodb','/account',
      array(
        'methods' => WP_REST_Server::READABLE,
        //'permission_callback' => array( 'ImmoDBApi', 'privileged_permission_callback' ),
        'callback' => array( 'ImmoDBApi', 'get_account' ),
      )
    );

    // Acquire default data view
    register_rest_route( 'immodb','/data_view',
      array(
        'methods' => WP_REST_Server::READABLE,
        //'permission_callback' => array( 'ImmoDBApi', 'privileged_permission_callback' ),
        'callback' => array( 'ImmoDBApi', 'get_data_view' ),
      )
    );

    // Get WP page list
    register_rest_route( 'immodb','/pages',
      array(
        'methods' => WP_REST_Server::READABLE,
        //'permission_callback' => array( 'ImmoDBApi', 'privileged_permission_callback' ),
        'callback' => array( 'ImmoDBApi', 'get_pages' ),
        'args' => array(
          'lang' => array(
            'required' => true,
            'type' => 'String',
            'description' => __( 'Page language filter', IMMODB ),
          )
        )
      )
    );

    //Read/Write configs
    register_rest_route( 'immodb','/configs',array(
        array(
          'methods' => WP_REST_Server::READABLE,
          //'permission_callback' => array( 'ImmoDBApi', 'privileged_permission_callback' ),
          'callback' => array( 'ImmoDBApi', 'get_configs' ),
        ), // End GET

        array(
  				'methods' => WP_REST_Server::CREATABLE,
  				'permission_callback' => array( 'ImmoDBApi', 'privileged_permission_callback' ),
  				'callback' => array( 'ImmoDBApi', 'set_configs' ),
  				'args' => array(
  					'settings' => array(
  						'required' => true,
  						'type' => 'ImmoDBConfig',
  						'description' => __( 'Configuration informations', IMMODB ),
  					)
  				)
        ), // End POST
        
        array(
  				'methods' => WP_REST_Server::EDITABLE,
  				'permission_callback' => array( 'ImmoDBApi', 'privileged_permission_callback' ),
  				'callback' => array( 'ImmoDBApi', 'reset_configs' ),
  			), // End PATCH
      )
    );

    //Read List configs
    register_rest_route( 'immodb','/list_configs',
      array(
        'methods' => WP_REST_Server::READABLE,
        'callback' => array( 'ImmoDBApi', 'get_list_configs' ),
        'args' => array(
          'alias' => array(
            'required' => true,
            'type' => 'String',
            'description' => __( 'Alias identifier of the List object', IMMODB ),
          )
        )
      ) // End GET
    );

    //Read config permalinks
    register_rest_route( 'immodb','/permalinks',
      array(
        'methods' => WP_REST_Server::READABLE,
        'callback' => array( 'ImmoDBApi', 'get_configs_permalinks' )
      ) // End GET
    );


    //Write message
    register_rest_route( 'immodb','/message',array(
        
        array(
          'methods' => WP_REST_Server::CREATABLE,
          //'permission_callback' => array( 'ImmoDBApi', 'privileged_permission_callback' ),
          'callback' => array( 'ImmoDBApi', 'send_message' ),
          'args' => array(
            'message' => array(
              'required' => true,
              'type' => 'MessageData',
              'description' => __( 'Message information', IMMODB ),
            )
          )
        ), // End POST
        
      )
    );
  }

  public static function get_pages($request){
    // change language
    global $sitepress;
    $lang = $request->get_param('lang');

    if($sitepress){
      $sitepress->switch_lang( $lang, true );
    }
    
    
    $args = array(
      'sort_order' => 'asc',
      'sort_column' => 'post_title',
      'hierarchical' => 1,
      'exclude' => '',
      'include' => '',
      'meta_key' => '',
      'meta_value' => '',
      'authors' => '',
      'child_of' => 0,
      'parent' => -1,
      'exclude_tree' => '',
      'number' => '',
      'offset' => 0,
      'post_type' => 'page',
      'post_status' => 'publish',
      'suppress_filters' => false
    ); 

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
    //$pages = get_pages($args); 

    return $pages;
  }


  /**
  * Get a valid access token from the server
  * @static
  * @return Object : Object
  */
  public static function get_access_token(){
    $account_id = ImmoDB::current()->get_account_id();
    $api_key = ImmoDB::current()->get_api_key();

    // Trap empty values
    if(!$account_id || empty($account_id)){
      return self::_thow_error('authentication','account id must be specified');
    }
    if(!$api_key || empty($api_key)){
      return self::_thow_error('authentication','api key must be specified');
    }

    // get access token from ImmoDb remote api
    $lResult = HttpCall::to('~','auth','get_token',$account_id,$api_key)->get();

    return json_decode($lResult);
  }


  public static function get_data_view(){
    if(ImmoDB::current()->configs->default_view != null){
      return ImmoDB::current()->configs->default_view;
    }

    $lToken = self::get_access_token();
    return $lToken->view_ids[0];
  }

  
  public static function get_configs_permalinks(){
    $lResult = array(
      'listings' => ImmoDB::current()->configs->listing_routes,
      'brokers' => ImmoDB::current()->configs->broker_routes
    );

    return $lResult;
  }

  /**
  * Get global configurations
  */
  public static function get_configs(){
    return ImmoDB::current()->configs;
  }

  /**
   * Save global configurations
   * @param request Request object give to the WP_REST service
   * @return Object global configuration
   */
  public static function set_configs($request){
    $config_value = $request->get_param('settings');

    ImmoDB::current()->configs->parse($config_value);
    ImmoDB::current()->configs->save();

    return self::get_configs();
  }

  /**
   * Reset global configurations
   * @param request Request object give to the WP_REST service
   * @return Object global configuration
   */
  public static function reset_configs($request){
    $new_config_value = new ImmoDBConfig();
    ImmoDB::current()->configs = $new_config_value;
    ImmoDB::current()->configs->save();

    return self::get_configs();
  }

  /**
   * Get a unique list configuration
   * @param request Request object give to the WP_REST service
   * @return Object list configuration
   */
  public static function get_list_configs($request){
    $alias = $request->get_param('alias');
    $result = ImmoDB::current()->get_list_configs($alias);
    return $result;
  }


  public static function get_list_meta(&$list_config){
    $account_id = ImmoDB::current()->get_account_id();
    $api_key = ImmoDB::current()->get_api_key();
    $lAccessToken = HttpCall::to('~','auth','get_token', $account_id, $api_key)->get(null, true);

    $list_config->access_token = $lAccessToken->key;
    $lTwoLetterLocale = substr(get_locale(),0,2);

    $lResult = HttpCall::to('~','view', $list_config->source->id, $lTwoLetterLocale)->with_oauth($list_config->access_token)->get(null, true);
    
    return $lResult;
  }

  public static function get_data(&$list_config){
    $account_id = ImmoDB::current()->get_account_id();
    $api_key = ImmoDB::current()->get_api_key();

    $lTwoLetterLocale = substr(get_locale(),0,2);

    if(!isset($list_config->access_token)){
      $lAccessToken = HttpCall::to('~','auth','get_token', $account_id, $api_key)->get(null, true);
      $list_config->access_token = $lAccessToken->key;
    }

    $lFilters = array("st"=>urlencode($list_config->search_token));
    
    $lResult = HttpCall::to('~', $list_config->getViewEndpoint(), $list_config->source->id,  $lTwoLetterLocale,'items')->with_oauth($list_config->access_token)->get($lFilters, true);
    
    return $lResult;
  }

  public static function get_listing_data($id){
    $account_id = ImmoDB::current()->get_account_id();
    $api_key = ImmoDB::current()->get_api_key();
    $lTwoLetterLocale = substr(get_locale(),0,2);
    $view_id = json_decode(ImmoDB::current()->configs->default_view)->id;

    $lAccessToken = HttpCall::to('~','auth','get_token', $account_id, $api_key)->get(null, true);

    $lResult = HttpCall::to('~', 'listing/view/',$view_id,$lTwoLetterLocale,'items/ref_number',$id)->with_oauth($lAccessToken->key)->get();
    
    return $lResult;
  }

  
  public static function get_broker_data($id){
    $account_id = ImmoDB::current()->get_account_id();
    $api_key = ImmoDB::current()->get_api_key();
    $lTwoLetterLocale = substr(get_locale(),0,2);
    $view_id = json_decode(ImmoDB::current()->configs->default_view)->id;

    $lAccessToken = HttpCall::to('~','auth','get_token', $account_id, $api_key)->get(null, true);

    $lResult = HttpCall::to('~', 'broker/view/',$view_id,$lTwoLetterLocale,'items/ref_number',$id)->with_oauth($lAccessToken->key)->get();
    
    return $lResult;
  }

  public static function get_account(){
    $account_id = ImmoDB::current()->get_account_id();
    $api_key = ImmoDB::current()->get_api_key();
    

    $lAccessToken = HttpCall::to('~','auth','get_token', $account_id, $api_key)->get(null, true);
    $lResult = HttpCall::to('~','account')->with_oauth($lAccessToken->key)->get(null, true);
    return $lResult;
  }
  

  public static function send_message($message){
    
  }

  /*
  * Determine if the user can make the request
  */
  public static function privileged_permission_callback() {
    //Debug::print(wp_get_current_user());
		return current_user_can( 'manage_options' );
	}

  /**
  * Build error associative array to return
  * @param domain : error type or abreviation
  * @param message: message to explain the error
  * @return Array : associative array of domain/message
  */
  private static function _thow_error($domain, $message){
    return array(
      'error' => $domain,
      'message' => $message
    );
  }

}
