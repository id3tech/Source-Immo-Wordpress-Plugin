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
  						'description' => __( 'Configuration informations', 'immodb' ),
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


  /**
  *
  */
  public static function get_configs(){
    return ImmoDB::current()->configs;
  }

  public static function set_configs($request){
    $config_value = $request->get_param('settings');

    ImmoDB::current()->configs->parse($config_value);
    ImmoDB::current()->configs->save();

    return self::get_configs();
  }

  public static function reset_configs($request){
    $new_config_value = new ImmoDBConfig();
    ImmoDB::current()->configs = $new_config_value;
    ImmoDB::current()->configs->save();

    return self::get_configs();
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
