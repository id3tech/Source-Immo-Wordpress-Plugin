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
    register_rest_route( 'immodb','/access_token',array(
        array(
          'methods' => WP_REST_Server::READABLE,
          //'permission_callback' => array( 'ImmoDBApi', 'privileged_permission_callback' ),
          'callback' => array( 'ImmoDBApi', 'get_access_token' ),
        ), // End GET

        array(
          'methods' => WP_REST_Server::EDITABLE,
          'permission_callback' => array( 'ImmoDBApi', 'privileged_permission_callback' ),
          'callback' => array( 'ImmoDBApi', 'clear_access_token' ),
        ), // End PATCH
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
          'locale' => array(
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
            'params' => array(
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
    foreach ($pages as &$page) {
      $page->permalink = rtrim(str_replace(array('http://','https://',$_SERVER['HTTP_HOST']), '' ,get_permalink($page)),'/');
    }
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

    // check if the token is stored in transient
    $lResult = get_transient('immodb_temp_auth_token' . $api_key);
    
    if($lResult == '' || !self::token_is_valid($lResult)){
      // get access token from ImmoDb remote api
      $lResult = HttpCall::to('~','auth','get_token',$account_id,$api_key)->get();
      $lDiff = self::get_token_timelapse(json_decode($lResult));

      set_transient('immodb_temp_auth_token' . $api_key, $lResult, $lDiff * MINUTE_IN_SECONDS);
      //Debug::write($lResult);
    }   


    if (!headers_sent()) {
      header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
      header("Cache-Control: post-check=0, pre-check=0", false);
      header("Pragma: no-cache");
    }
    
    return json_decode($lResult);
  }

  public static function clear_access_token(){
    $api_key = ImmoDB::current()->get_api_key();
    delete_transient('immodb_temp_auth_token' . $api_key);

    return true;
  }

  private static function get_token_timelapse($token){
    $lDiff = 0;
    if($token != null){
      $token->expire_date = date_create($token->expire_date);
      $lNow = new DateTime();
      $lDiff = date_diff($lNow, $token->expire_date);
    }
    $lResult = 0;
    $lResult += $lDiff->s / 60;
    $lResult += $lDiff->i;
    $lResult += $lDiff->h * 60;
    $lResult += $lDiff->days * 24 * 60;
    if($lDiff->invert){
      $lResult = -1 * $lResult;
    }

    return $lResult;
  }
  private static function token_is_valid($token){
    $token = json_decode($token);
    
    if($token != null){
      $diff = self::get_token_timelapse($token);
      if($diff > 0){
        return true;
      }
    }
    return false;
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

    // delete access token cache
    self::clear_access_token();

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
    
    $lAccessToken = self::get_access_token();

    $list_config->access_token = $lAccessToken->key;
    $lTwoLetterLocale = substr(get_locale(),0,2);

    $lResult = HttpCall::to('~','view', $list_config->source->id, $lTwoLetterLocale)->with_oauth($list_config->access_token)->get(null, true);
    
    return $lResult;
  }

  public static function get_data(&$list_config, $atts=null){
    $account_id = ImmoDB::current()->get_account_id();
    $api_key = ImmoDB::current()->get_api_key();

    $lTwoLetterLocale = substr(get_locale(),0,2);

    if(!isset($list_config->access_token)){
      $lAccessToken = self::get_access_token();
      $list_config->access_token = $lAccessToken->key;
    }

    $lFilters = array("st"=>urlencode($list_config->search_token));
    
    if($atts != null && count($atts)>1){
      $params = $atts; //shortcode_atts(array(), $atts );
      
      $lFilters = array("st"=>urlencode(self::get_search_token($params,$list_config)));
      
    }
    
    $lResult = HttpCall::to('~', $list_config->getViewEndpoint(), $list_config->source->id,  $lTwoLetterLocale,'items')->with_oauth($list_config->access_token)->get($lFilters, true);
    // In case the limit is 0 (infinite), we should load data until there's no more "next page"
    if($list_config->limit==0){
      //Debug::write($lResult);
      $data_list = $lResult->items;
      $roundTrip = 0;
      while (isset($lResult->metadata->next_token) && $roundTrip < 5) {
        $lFilters = array('nt'=>urlencode($lResult->metadata->next_token));

        $lResult = HttpCall::to('~', $list_config->getViewEndpoint(), $list_config->source->id,  $lTwoLetterLocale,'items')->with_oauth($list_config->access_token)->get($lFilters, true);
        $data_list = array_merge($data_list,$lResult->items);
        $roundTrip++;
      }
      
      $lResult->items = $data_list;
    }
    return $lResult;
  }

  
  public static function get_search_token($params,$default){
    $filters = self::build_filters($params,$default);
    
    $lResult = HttpCall::to('~', 'utils/search_encode/')->post($filters,true);
    return $lResult;
  }

  public static function build_filters($params,$default){
    $lResult = array(
      "query_text" => "",
      "filter_group"=> array(),
      "sort_fields" => null,
      "shuffle" => false,
      "max_item_count" => $default->limit,
    );
    

    if(isset($default->sort) && $default->sort != ''){
      $lResult["sort_fields"] = array(
          array("field" => $default->sort, "desc"=>$default->sort_reverse)
      );
    }

    if(isset($params['query'])){
      $lResult['query_text'] = $params['query'];
    }
    if(isset($params['limit'])){
      $lResult["max_item_count"] = $params["limit"];
    }
    if(isset($params['sort_by'])){
      $lResult["sort_fields"] = array(
        array("field" => $params["sort_by"], "desc"=> isset($params["sort_desc"]))
      );
    }
    if(isset($params['shuffle'])){
      $lResult["shuffle"] = $params['shuffle'];
    }

    if($lResult['max_item_count']==0){
      unset($lResult['max_item_count']);
    }
    
    $filters = array();
    foreach ($params as $key => $value) {
      if(!in_array($key,array("layout","show_list_meta","alias","query","limit","sort_by", "shuffle"))){
        if(strpos($key,'_op') === false){
          $operator = (isset($params[$key . '_op']))? $params[$key . '_op'] : "equal_to";
          $filters[] = array(
            "field" => str_replace("__",".",$key),
            "operator" => $operator,
            "value" => $value
          );
        }
      }
    }

    $lResult["filter_group"] = array(
      "operator" => "AND",
      "filter_groups" => null,
      "filters" => $filters
    );
    
    return $lResult;
  }

  /**
   * Get the listing data
   */
  public static function get_listing_data($id){
    $account_id = ImmoDB::current()->get_account_id();
    $api_key = ImmoDB::current()->get_api_key();
    $lTwoLetterLocale = substr(get_locale(),0,2);
    $view_id = json_decode(ImmoDB::current()->configs->default_view)->id;

    $lAccessToken = self::get_access_token();
    
    $lResult = HttpCall::to('~', 'listing/view',$view_id,$lTwoLetterLocale,'items/ref_number',$id)->with_oauth($lAccessToken->key)->get();
    
    return $lResult;
  }

  /**
   * Get the broker data
   */
  public static function get_broker_data($id){
    $account_id = ImmoDB::current()->get_account_id();
    $api_key = ImmoDB::current()->get_api_key();
    $lTwoLetterLocale = substr(get_locale(),0,2);
    $view_id = json_decode(ImmoDB::current()->configs->default_view)->id;

    $lAccessToken = self::get_access_token();

    $lResult = HttpCall::to('~', 'broker/view/',$view_id,$lTwoLetterLocale,'items/ref_number',$id)->with_oauth($lAccessToken->key)->get();
    
    return $lResult;
  }
  

  /**
   * Get the listing data
   */
  public static function get_city_data($id){
    $account_id = ImmoDB::current()->get_account_id();
    $api_key = ImmoDB::current()->get_api_key();
    $lTwoLetterLocale = substr(get_locale(),0,2);
    $view_id = json_decode(ImmoDB::current()->configs->default_view)->id;
    $lFilters = array("st"=>urlencode(self::get_search_token(
          array('code'=>$id),
          (object) array('limit' => 0)
    )));
    $lAccessToken = self::get_access_token();
    
    $lResult = HttpCall::to('~', 'location/city/view',$view_id,$lTwoLetterLocale,'items/')->with_oauth($lAccessToken->key)->get($lFilters,true);
    
    return $lResult;
  }

  /**
   * Get the city listings data
   */
  public static function get_city_listings_data($id){
    $account_id = ImmoDB::current()->get_account_id();
    $api_key = ImmoDB::current()->get_api_key();
    $lTwoLetterLocale = substr(get_locale(),0,2);
    $view_id = json_decode(ImmoDB::current()->configs->default_view)->id;

    $lAccessToken = self::get_access_token();
    
    $lFilters = array("st"=>urlencode(self::get_search_token(
                      array('location__city_code'=>$id),
                      (object) array('limit' => 0)
                )));
    
    $lResult = HttpCall::to('~', 'listing/view', $view_id,  $lTwoLetterLocale,'items')->with_oauth($lAccessToken->key)->get($lFilters, true);
    
    $data_list = $lResult->items;
    $roundTrip = 0;
    while (isset($lResult->metadata->next_token) && $roundTrip < 5) {
      $lFilters = array('st'=>$lResult->metadata->search_token,'nt'=>urlencode($lResult->metadata->next_token));

      $lResult = HttpCall::to('~', $list_config->getViewEndpoint(), $list_config->source->id,  $lTwoLetterLocale,'items')->with_oauth($list_config->access_token)->get($lFilters, true);
      $data_list = array_merge($data_list,$lResult->items);
      $roundTrip++;
    }
    
    $lResult->items = $data_list;

    return $lResult;
  }

  /**
   * Get account information
   */
  public static function get_account(){
    $account_id = ImmoDB::current()->get_account_id();
    $api_key = ImmoDB::current()->get_api_key();
    

    $lAccessToken = self::get_access_token();
    $lResult = HttpCall::to('~','account')->with_oauth($lAccessToken->key)->get(null, true);
    return $lResult;
  }
  
  /**
   * Send an email message 
   */
  public static function send_message($request){
    $params = json_decode(json_encode($request->get_param('params')));
    $data = $params->data;
    $metadata = isset($params->metadata) ? $params->metadata : null ;
    $type = $params->type;
    $destination = ''; // implode(',',$params->destination);
    $lTwoLetterLocale = substr(get_locale(),0,2);
    $hash_seed = (isset($metadata) && isset($metadata->ref_number)) ? $metadata->ref_number : uniqid();
    $random_hash = sha1($hash_seed);
    
    $configs = ImmoDB::current()->configs;
    if($configs->mode == 'DEV'){
      $destination = $configs->form_recipient;
    }

    $labels = array(
      'firstname' => __('First name',IMMODB),
      'lastname' => __('Last name',IMMODB),
      'email' => __('Email',IMMODB),
      'phone' => __('Phone',IMMODB),
      'subject' => __('Subject',IMMODB),
      'message' => __('Message',IMMODB)
    );

    $messageData = array();
    foreach ($data as $key => $value) {
      $messageData[] = array(
        'label' => $labels[$key],
        'value' => $value
      );
    }


    // build email
    ob_start();
    ImmoDB::view('messages/' . $type . '.' . $lTwoLetterLocale, array('random_hash'=>$random_hash,'data'=>$messageData, 'metadata' => $metadata));
    $email_body = ob_get_contents();
    ob_end_clean();


    // send email to destination
    $headers = implode("\r\n", array(
      'From: no-reply@' . $_SERVER['HTTP_HOST'],
      'FromName: Your website',
      'Content-Type: multipart/alternative; boundary="PHP-alt-' .$random_hash. '"'
    ));
    $lResult = mail($destination,$data->subject,$email_body,$headers);

    return $lResult;
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
