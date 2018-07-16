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
    register_rest_route( 'immodb','/pages',
      array(
        'methods' => WP_REST_Server::READABLE,
        //'permission_callback' => array( 'ImmoDBApi', 'privileged_permission_callback' ),
        'callback' => array( 'ImmoDBApi', 'get_pages' ),
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

  }

  public static function get_pages(){
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
      'post_status' => 'publish'
    ); 
    $pages = get_pages($args); 

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

    if($list_config->source=='default'){
      $list_config->source = $lAccessToken->view_ids[0];
    }
    $list_config->access_token = $lAccessToken->id;
    $lTwoLetterLocale = substr(get_locale(),0,2);

    $lResult = HttpCall::to('~',$list_config->getViewEndpoint(), $list_config->source, $lTwoLetterLocale)->get(null, true);
    
    return $lResult;
  }

  public static function get_data(&$list_config){
    $account_id = ImmoDB::current()->get_account_id();
    $api_key = ImmoDB::current()->get_api_key();
    $lTwoLetterLocale = substr(get_locale(),0,2);

    if(!isset($list_config->access_token)){
      $lAccessToken = HttpCall::to('~','auth','get_token', $account_id, $api_key)->get(null, true);
      if($list_config->source=='default'){
        $list_config->source = $lAccessToken->view_ids[0];
      }
      $list_config->access_token = $lAccessToken->id;
    }

    $lFilters = array("st"=>urlencode($list_config->search_token));
    
    $lResult = HttpCall::to('~', 'listing/view', $list_config->source,  $lTwoLetterLocale,'items')->with_oauth($list_config->access_token)->get($lFilters, true);
    
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

class ImmoDBListingsResult{
  public $listings = null;
  public $metadata = null;

  public function __construct($data){
    $this->listings = $data->listings;
    $this->metadata = $data->metadata;
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

    return implode(' ' . __('or',IMMODB) . ' ', $lResult);
  }

  public static function buildPermalink($item, $format){
    $lResult = $format;
    $lAttrList = self::getAttributeValueList($item);
    //Debug::force($lAttrList);

    foreach($lAttrList as $lAttr){
      $lValue = $lAttr['value'];
      
      if(method_exists(get_called_class(),'get' . $lAttr['key'])){
        $lValue = self::{'get' . $lAttr['key']}($item);
      }

      $lResult = str_replace(
          array(
            '{{' . $lAttr['key'] . '}}',
            '{{get' . $lAttr['key'] . '(item)}}'
          ), $lValue, $lResult);
    }
    

    return $lResult;
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
      $lResult[] = $key;
    }

    $lResult = implode(' ' . __('or',IMMODB) . ' ',$lResult);

    if($sanitize){
        $lResult = sanitize_title($lResult);
    }

    return $lResult;
  }



  public static function getAttributeValueList($item, $prefix=null){
    $lResult = array();
    if(!is_array($item)){
      $item = json_decode(json_encode($item),true);
    }
    foreach ($item as $key => $value) {
      $attrKey = $key;
      if($prefix!=null){
        $attrKey = $prefix . '.' . $key;
      }
      if(is_array($item[$key])){
        $lResult += self::getAttributeValueList($item[$key], $attrKey);
      }
      else{
        $lResult[] = array('key' => $attrKey, 'value' => $item[$key]);
      }
    }

    

    $lResult[] = array('key' => 'Region', 'value' => '');
    $lResult[] = array('key' => 'City', 'value' => '');
    $lResult[] = array('key' => 'Transaction', 'value' => '');
    
    return $lResult;
  }
}