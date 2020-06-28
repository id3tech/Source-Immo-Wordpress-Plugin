<?php
/*
API interface class
*/
class SourceImmoApi {
  /**
  * REST API Wordpress init
  * register all rest route
  * @static
  */
  public static function init() {
    self::_registerRestApiListeners();
  }


  /**
   * Update page content
   * @static
   * POST /si-rest/page
   */
  public static function update_page($request){
    $page_id = $request->get_param('page_id');
    $title = $request->get_param('title');
    $content = $request->get_param('content');
    $language_code = $request->get_param('lang');
    $locale_parent_page_id = $request->get_param('original_page_id');

    if($page_id == 'NEW'){
      $my_post = array(
        'post_title'    => $title,
        'post_content'  => $content,
        'post_status'   => 'publish',
        'post_type'     => 'page'
      );
      $post_id = wp_insert_post( $my_post );

      if($language_code != null){
        self::set_page_translation($post_id, $language_code, $locale_parent_page_id);
      }
     
      return $post_id;
    }
    else if($page_id != 'NONE'){
      wp_update_post(array(
        'ID'            => $page_id,
        'post_content'  => $content
      ));
    }
  }

  public static function set_page_translation($page_id, $language_code, $source_page_id=null) {
    
    if ($page_id) {
        $wpml_element_type = apply_filters('wpml_element_type', 'page');
        $set_language_args = array(
            'element_id'      => $page_id,
            'element_type'    => $wpml_element_type,
            'language_code'   =>  $language_code
        ); 

        if($source_page_id != null){
          // get the language info of the original post
          $get_language_args = array('element_id' => $source_page_id, 'element_type' => $wpml_element_type );
          $original_post_language_info = apply_filters( 'wpml_element_language_details', null, $get_language_args );

          $set_language_args = array_merge($set_language_args, array(
            'trid'   => $original_post_language_info->trid,
            'source_language_code' => $original_post_language_info->language_code
          ));
        }
         
        do_action( 'wpml_set_element_language_details', $set_language_args );
    }
}

  /**
   * Get page permalink
   * @static
   * GET /si-rest/page/permalink
   */
  public static function get_page_permalink($request){
    $page_id = $request->get_param('page_id');
    
    return get_permalink($page_id);
    
  }

  /**
   * Get forms list
   * @static
   * GET /si-rest/forms
   */
  public static function get_form_list($request){
    
    $lResult = apply_filters('si-get-form-list',array());
    
    return $lResult;
  }


  public static function get_addons(){
    $lResult = SourceImmo::current()->addons->items;
    return $lResult;
  }


  /**
   * Get pages list
   * @static
   * GET /si-rest/menu/list
   */
  public static function get_language_list(){
    $codeNames = array(
      'en' => 'English',
      'fr' => 'Français',
      'es' => 'Espanol'
    );

    $currentLocale = substr(get_locale(),0,2);
    $lResult = array();

    // wpml languages
    if(function_exists('icl_get_languages')){
      $languages = icl_get_languages('skip_missing=0&orderby=code');
      foreach ($languages as $l) {
        $lResult[] = array(
          'code' => $l['language_code'],
          'name' => $l['native_name'],
          'default' => $currentLocale == $l['language_code']
        );
      }
    }
    else{
      $lResult = array(
        0 => array(
          'code' => $currentLocale,
          'name' => $codeNames[$currentLocale],
          'default' => true
        )
      );
    }

    return $lResult;
  }

  


  /**
   * Get pages list
   * @static
   * GET /si-rest/menu/list
   */
  public static function get_menu_list(){
    return get_registered_nav_menus();
  }



  /**
   * Get pages list
   * @static
   * GET /si-rest/page/list
   */
  public static function get_page_list($request){
    // change language
    global $sitepress;
    $lang = $request->get_param('locale');
    $type = $request->get_param('type');

    if($sitepress && $lang!=null){
      $sitepress->switch_lang( $lang, true );
    }

    $lTypePermalink = null;
    if($type != null){
      $lTypePermalink = SourceImmo::current()->get_permalink($type);
      $lTypePermalink = substr($lTypePermalink,0, strpos($lTypePermalink,'{{')-1);
    }
    
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
    $lResult = array();
    foreach ($pages as &$page) {
      $lPermalink = rtrim(str_replace(array('http://','https://',$_SERVER['HTTP_HOST']), '' ,get_permalink($page)),'/');
      $page->permalink = $lPermalink;

      if($lTypePermalink==null || ( trim($lPermalink,'/') != trim($lTypePermalink,'/') && strpos($lPermalink, $lTypePermalink)!==false) ){
        $lResult[] = $page;
      }
    }
    
    return $lResult;
  }


  /**
  * Get a valid access token from the server
  * GET: /si-rest/access_token
  * @static
  * @return Object : Object
  */
  public static function get_access_token(){
    $account_id = SourceImmo::current()->get_account_id();
    $api_key = SourceImmo::current()->get_api_key();

    // Trap empty values
    if(!$account_id || empty($account_id)){
      return self::_thow_error('authentication','account id must be specified');
    }
    if(!$api_key || empty($api_key)){
      return self::_thow_error('authentication','api key must be specified');
    }

    // check if the token is stored in transient
    $lResult = get_transient('si_temp_auth_token' . $api_key);
    
    if($lResult == '' || !self::token_is_valid($lResult)){
      // get access token from Si remote api
      $lResult = HttpCall::to('~','auth','get_token',$account_id,$api_key)->get();
      $lDiff = self::get_token_timelapse(json_decode($lResult));

      set_transient('si_temp_auth_token' . $api_key, $lResult, $lDiff * MINUTE_IN_SECONDS);
    }   


    if (!headers_sent()) {
      header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
      header("Cache-Control: post-check=0, pre-check=0", false);
      header("Pragma: no-cache");
    }
    
    return json_decode($lResult);
  }

  /**
   * Clear the access token
   * POST: /si-rest/access_token/clear
   */
  public static function clear_access_token(){
    $api_key = SourceImmo::current()->get_api_key();
    delete_transient('si_temp_auth_token' . $api_key);

    return true;
  }


  private static function get_token_timelapse($token){
    $lDiff = 0;
    $lResult = 0;

    if($token != null){
      $token->expire_date = date_create($token->expire_date);
      $lNow = new DateTime();
      $lDiff = date_diff($lNow, $token->expire_date);

      $lResult += $lDiff->s / 60;
      $lResult += $lDiff->i;
      $lResult += $lDiff->h * 60;
      $lResult += $lDiff->days * 24 * 60;
      if($lDiff->invert){
        $lResult = -1 * $lResult;
      }

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


  /**
   * Get the view config
   * GET: /si-rest/data_view
   */
  public static function get_data_view(){
    if(SourceImmo::current()->configs->default_view != null){
      return si_view_id(SourceImmo::current()->configs->default_view);
    }
    
    $lToken = self::get_access_token();
    return si_view_id($lToken->view_ids[0]);
  }

  /**
   * Get the view config
   * GET: /si-rest/permalinks
   */
  public static function get_configs_permalinks(){
    $lResult = array(
      'listings' => SourceImmo::current()->configs->listing_routes,
      'brokers' => SourceImmo::current()->configs->broker_routes
    );

    return $lResult;
  }

  /**
  * Get global configurations
  */
  public static function get_configs(){
    return SourceImmo::current()->configs;
  }

  /**
   * Save global configurations
   * @param request Request object give to the WP_REST service
   * @return Object global configuration
   */
  public static function set_configs($request){
    $config_value = $request->get_param('settings');

    SourceImmo::current()->configs->parse($config_value);
    SourceImmo::current()->configs->save();

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
    // clear data
    SourceImmo::current()->configs->clearEverything();


    $new_config_value = new SourceImmoConfig();
    SourceImmo::current()->configs = $new_config_value;
    SourceImmo::current()->configs->save();

    return self::get_configs();
  }

  public static function backup_configs(){
    $lUploadDir   = wp_upload_dir();
    $lConfigPath = $lUploadDir['basedir'] . '/_sourceimmo';
    if ( ! file_exists( $lConfigPath ) ) {
      wp_mkdir_p( $lConfigPath );
    }
    $lConfigFilePath = $lConfigPath . '/_configs.json';
    if(file_exists($lConfigFilePath)){
      copy($lConfigFilePath, $lConfigPath . '/_configs_backup.json');
    }
    
  }

  public static function get_configs_backup(){
    $lUploadDir   = wp_upload_dir();
    $lConfigPath = $lUploadDir['basedir'] . '/_sourceimmo';
    if ( ! file_exists( $lConfigPath ) ) {
      wp_mkdir_p( $lConfigPath );
    }
    $lConfigFilePath = $lConfigPath . '/_configs_backup.json';
    $fileContent = null;

    if(file_exists($lConfigFilePath)){
      try {
        $filePointer = fopen($lConfigFilePath,'r');
        $fileContent = fread($filePointer,max(filesize($lConfigFilePath),1));
  
        fclose($filePointer);
      } 
      catch (\Throwable $th) {
        
      }
    }
    return $fileContent;
  }

  public static function clear_backup(){
    $lUploadDir   = wp_upload_dir();
    $lConfigPath = $lUploadDir['basedir'] . '/_sourceimmo';
    if ( ! file_exists( $lConfigPath ) ) {
      wp_mkdir_p( $lConfigPath );
    }
    $lConfigFilePath = $lConfigPath . '/_configs_backup.json';
    if(file_exists($lConfigFilePath)){
      unlink($lConfigFilePath);
    }
  }



  public static function get_dictionary($request){
    $account_id = SourceImmo::current()->get_account_id();
    $api_key = SourceImmo::current()->get_api_key();

    if($account_id == '' || $api_key == '') return null;
    
    $viewId = si_view_id(SourceImmo::current()->configs->default_view);

    $lAccessToken = self::get_access_token();
    $lang = $request->get_param('lang');
    $lTwoLetterLocale = isset($lang) ? $lang : substr(get_locale(),0,2);

    $lResult = HttpCall::to('~','view', $viewId, $lTwoLetterLocale)
                            ->with_credentials($account_id, $api_key, SI_APP_ID, SI_VERSION)
                            ->get(null, true);

    return $lResult->dictionary;
  }

  /**
   * Get a unique list configuration
   * @param request Request object give to the WP_REST service
   * @return Object list configuration
   */
  public static function get_list_configs($request){
    $alias = $request->get_param('alias');
    $result = SourceImmo::current()->get_list_configs($alias);
    return $result;
  }

  /**
   * Convert a set of parameters to a valid search token
   */
  public static function get_search_token($params,$default){
    $filters = self::build_filters($params,$default);
    
    $lResult = HttpCall::to('~', 'utils/search_encode/')->post($filters,true);
    return $lResult;
  }

  /**
   * Build filters for API query
   */
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

  // ==============================
  // FETCHING DATA
  // ------------------------------

  /**
   * Get list meta of things
   * @param list_config   Object containing list configuration infos
   */
  public static function get_list_meta(&$list_config){
    $account_id = SourceImmo::current()->get_account_id();
    $api_key = SourceImmo::current()->get_api_key();
    
    $lAccessToken = self::get_access_token();

    $list_config->access_token = $lAccessToken->key;
    $lTwoLetterLocale = substr(get_locale(),0,2);

    $lResult = HttpCall::to('~','view', $list_config->source->id, $lTwoLetterLocale)
                          ->with_credentials($account_id, $api_key, SI_APP_ID, SI_VERSION)
                          ->get(null, true);

    return $lResult;
  }

  /**
   * Get list data
   * @param list_config   Object containing list configuration infos
   * @param atts          ObjectArray filter parameters for the list
   */
  public static function get_data(&$list_config, $atts=null){
    $account_id = SourceImmo::current()->get_account_id();
    $api_key = SourceImmo::current()->get_api_key();

    $lTwoLetterLocale = substr(get_locale(),0,2);
    $lSearchToken = (isset($list_config->search_token)) ? $list_config->search_token : '';
    $lFilters = array("st"=>urlencode($lSearchToken));
    
    if($atts != null && count($atts)>1){
      $params = $atts; //shortcode_atts(array(), $atts );
      
      $lFilters = array("st"=>urlencode(self::get_search_token($params,$list_config)));
    }
    $st = $lFilters["st"];

    $lResult = HttpCall::to('~', $list_config->getViewEndpoint(), $list_config->source->id,  $lTwoLetterLocale,'items')
                    ->with_credentials($account_id, $api_key, SI_APP_ID, SI_VERSION)
                    ->get($lFilters, true);
    
    // In case the limit is 0 (infinite), we should load data until there's no more "next page"
    if($list_config->limit==0){
      $data_list = $lResult->items;
      $roundTrip = 0;
      while (isset($lResult->metadata->next_token) && $roundTrip < 6) {
        $lFilters = array('st'=> $st, 'nt'=>urlencode($lResult->metadata->next_token));

        $lResult = HttpCall::to('~', $list_config->getViewEndpoint(), $list_config->source->id,  $lTwoLetterLocale,'items')
                              ->with_credentials($account_id, $api_key, SI_APP_ID, SI_VERSION)
                              ->get($lFilters, true);

        $data_list = array_merge($data_list,$lResult->items);

        $roundTrip++;
      }

      
      
      $lResult->items = $data_list;

    }
    return $lResult;
  }


  /**
   * Get the listing data
   * @param id          String identifier for the listing
   */
  public static function get_data_of($type, $id){
    $account_id = SourceImmo::current()->get_account_id();
    $api_key = SourceImmo::current()->get_api_key();
    $lTwoLetterLocale = substr(get_locale(),0,2);
    
    $view_id = (isset($_GET['view'])) ? $_GET['view'] : null;

    if($view_id == null){
      if(!isset(SourceImmo::current()->configs->default_view)) return '';
      $view_id = si_view_id(SourceImmo::current()->configs->default_view);  
    }

    
    $lResult = HttpCall::to('~', $type, 'view',$view_id,$lTwoLetterLocale,'items/ref_number',$id)
                  ->with_credentials($account_id, $api_key, SI_APP_ID, SI_VERSION)
                  ->get();
    
    return $lResult;
  }

  

  /**
   * Get the listing data
   * @param id          String identifier for the listing
   */
  public static function get_listing_data($id){
    $lResult = self::get_data_of('listing',$id);
    
    return $lResult;
  }

  /**
   * Get the broker data
   * @param id          String identifier for the broker
   */
  public static function get_broker_data($id){
    $lResult = self::get_data_of('broker',$id);
    
    return $lResult;
  }
  

  /**
   * Get the listing data
   * @param id          String identifier for the city
   */
  public static function get_city_data($id){
    $account_id = SourceImmo::current()->get_account_id();
    $api_key = SourceImmo::current()->get_api_key();
    $lTwoLetterLocale = substr(get_locale(),0,2);
    $view_id = si_view_id(SourceImmo::current()->configs->default_view);
    
    $lFilters = array("st"=>urlencode(self::get_search_token(
          array('code'=>$id),
          (object) array('limit' => 0)
    )));
    

    $lResult = HttpCall::to('~', 'location/city/view',$view_id,$lTwoLetterLocale,'items/')
                  ->with_credentials($account_id, $api_key, SI_APP_ID, SI_VERSION)
                  ->get($lFilters,true);
    
    return $lResult;
  }

  /**
   * Get the listing data
   * @param id          String identifier for the city
   */
  public static function get_office_data($id){
    $lResult = self::get_data_of('office',$id);
    
    return $lResult;
  }


  /**
   * Get the listings data for a particular City
   * @param id          String identifier for the city
   */
  public static function get_city_listings_data($id){
    $account_id = SourceImmo::current()->get_account_id();
    $api_key = SourceImmo::current()->get_api_key();
    $lTwoLetterLocale = substr(get_locale(),0,2);
    $view_id = si_view_id(SourceImmo::current()->configs->default_view);

    
    $lFilters = array("st"=>urlencode(self::get_search_token(
                      array('location__city_code'=>$id),
                      (object) array('limit' => 0)
                )));
    
    $lResult = HttpCall::to('~', 'listing/view', $view_id,  $lTwoLetterLocale,'items')
                          ->with_credentials($account_id, $api_key, SI_APP_ID, SI_VERSION)
                          ->get($lFilters, true);
    
    $data_list = $lResult->items;
    $roundTrip = 0;
    while (isset($lResult->metadata->next_token) && $roundTrip < 5) {
      $lFilters = array('st'=>$lResult->metadata->search_token,'nt'=>urlencode($lResult->metadata->next_token));

      $lResult = HttpCall::to('~', 'listing/view', $view_id,  $lTwoLetterLocale,'items')
                              ->with_credentials($account_id, $api_key, SI_APP_ID, SI_VERSION)
                              ->get($lFilters, true);

      $data_list = array_merge($data_list,$lResult->items);
      $roundTrip++;
    }
    
    $lResult->items = $data_list;

    return $lResult;
  }

  /**
   * Get account information
   */
  public static function get_account($request){
    
    $account_id = $request->get_param('account_id');
    if($account_id == null) $account_id = SourceImmo::current()->get_account_id();

    $api_key =  $request->get_param('api_key');
    if($api_key == null) $api_key = SourceImmo::current()->get_api_key();
    

    $lResult = HttpCall::to('~','account')
                    ->with_credentials($account_id, $api_key, SI_APP_ID, SI_VERSION)
                    ->get(null, true);
    
    return $lResult;
  }

  public static function module($request){
    $moduleName = $request->get_param('module');
    $moduleMethod = $request->get_param('method');
    $data = $request->get_param('data');
    $lResult = '';

    if(class_exists($moduleName)){
      $moduleInstance = new $moduleName;
      if(method_exists($moduleInstance, $moduleMethod)){
        $lResult = $moduleInstance->{$moduleMethod}($data);
      }
    }

    return  $lResult;
  }
  
  /**
   * Send an email message 
   */
  public static function send_message($request){
    $params = json_decode(json_encode($request->get_param('params')));
    $data = $params->data;
    $metadata = isset($params->metadata) ? $params->metadata : null ;
    $type = $params->type;
    $destination = implode(',',$params->destination);
    $lTwoLetterLocale = substr(get_locale(),0,2);
    $hash_seed = (isset($metadata) && isset($metadata->ref_number)) ? $metadata->ref_number : uniqid();
    $random_hash = sha1($hash_seed);
    
    $configs = SourceImmo::current()->configs;
    if(!str_null_or_empty($configs->form_recipient)){
      $destination = $configs->form_recipient;
    }
    $from_name = str_null_or_empty($configs->form_from_name) ? 'Your website' : $configs->form_from_name;
    $from_address = str_null_or_empty($configs->form_from_address) ? 'no-reply@' . $_SERVER['HTTP_HOST'] :  $configs->form_from_address;

    $labels = array(
      'firstname' => __('First name',SI),
      'lastname' => __('Last name',SI),
      'email' => __('Email',SI),
      'phone' => __('Phone',SI),
      'subject' => __('Subject',SI),
      'message' => __('Message',SI)
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
    SourceImmo::view('messages/' . $type . '.' . $lTwoLetterLocale, array('random_hash'=>$random_hash,'data'=>$messageData, 'metadata' => $metadata));
    $email_body = ob_get_contents();
    ob_end_clean();


    // send email to destination
    $headers = implode("\r\n", array(
      'From: ' . $from_address,
      'FromName: ' . $from_name,
      'Content-Type: multipart/alternative; boundary="PHP-alt-' .$random_hash. '"'
    ));
    $lResult = mail($destination,$data->subject,$email_body,$headers);

    return array(
      'sent' => $lResult,
      'to' => $destination,
      'from' => $from_address,
      'from_name' => $from_name
    );
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

  /**
   * Register all REST listener
   * @static
   */
  private static function _registerRestApiListeners(){
    
    // Access Token
    self::_register_access_token_routes();
    
    // Account
    self::_register_account_routes();

    // Dictionary
    self::_register_dictionary_routes();

    // Configs
    self::_register_config_routes();

    // View
    self::_register_view_routes();

    // List
    self::_register_list_routes();

    // Message
    self::_register_message_routes();

    // Form
    self::_register_form_routes();

    // Page
    self::_register_page_routes();

    // Languages
    self::_register_language_routes();

    // Menu
    self::_register_menu_routes();

    // Permalink
    self::_register_permalink_routes();

    // Module
    register_rest_route( 'si-rest','/module',
      array(
        array(
          'methods' => WP_REST_Server::READABLE,
          //'permission_callback' => array( 'SourceImmoApi', 'privileged_permission_callback' ),
          'callback' => array( 'SourceImmoApi', 'module' ),
          'args' => array(
            'module' => array(
              'required' => true,
              'type' => 'string',
              'description' => __( 'Module name', SI ),
            ),
            'method' => array(
              'required' => true,
              'type' => 'string',
              'description' => __( 'Module method to call', SI ),
            ),
            'data' => array(
              'required' => true,
              'type' => 'mixed',
              'description' => __( 'Data to pass to method', SI ),
            )
          )
        )
      )
    );

    // Addons
    self::_register_addons_routes();

  }

  
  /**
   * Access Token REST routes registration
   * @static
   */
  static function _register_access_token_routes(){
    // Acquire access token to make call to the source.immo remote api
    register_rest_route( 'si-rest','/access_token',
      array(
        array(
          'methods' => WP_REST_Server::READABLE,
          //'permission_callback' => array( 'SourceImmoApi', 'privileged_permission_callback' ),
          'callback' => array( 'SourceImmoApi', 'get_access_token' ),
        )
      )
    );

    // Clear AT
    register_rest_route( 'si-rest','/access_token/clear',
      array(
        array(
          'methods' => WP_REST_Server::EDITABLE,
          'permission_callback' => array( 'SourceImmoApi', 'privileged_permission_callback' ),
          'callback' => array( 'SourceImmoApi', 'clear_access_token' ),
        ),
      )
    );
  }


  /**
   * Access Token REST routes registration
   * @static
   */
  static function _register_account_routes(){
    register_rest_route( 'si-rest','/account',
      array(
        'methods' => WP_REST_Server::READABLE,
        //'permission_callback' => array( 'SourceImmoApi', 'privileged_permission_callback' ),
        'callback' => array( 'SourceImmoApi', 'get_account' ),
        'args' => array(
          'account_id' => array(
            'required' => false,
            'type' => 'string',
            'description' => __( 'Account id', SI ),
          ),
          'api_key' => array(
            'required' => false,
            'type' => 'string',
            'description' => __( 'API key', SI ),
          ),
        )
      )
    );
  }

  
  /**
   * Addons REST routes registration
   * @static
   */
  static function _register_addons_routes(){
    register_rest_route( 'si-rest','/addons/list',
      array(
        'methods' => WP_REST_Server::READABLE,
        //'permission_callback' => array( 'SourceImmoApi', 'privileged_permission_callback' ),
        'callback' => array( 'SourceImmoApi', 'get_addons' ),
      )
    );
  }

  /**
   * Access Token REST routes registration
   * @static
   */
  static function _register_dictionary_routes(){
    register_rest_route( 'si-rest','/dictionary',
      array(
        'methods' => WP_REST_Server::READABLE,
        //'permission_callback' => array( 'SourceImmoApi', 'privileged_permission_callback' ),
        'callback' => array( 'SourceImmoApi', 'get_dictionary' ),
        'args' => array(
          'lang' => array(
            'required' => false,
            'type' => 'string',
            'description' => __( 'Dictionary language', SI ),
          )
        )
      )
    );
  }



  /**
   * Config REST routes registration
   * @static
   */
  static function _register_config_routes(){
    //Read/Write configs
    register_rest_route( 'si-rest','/configs',
      array(
        // GET
        array(
          'methods' => WP_REST_Server::READABLE,
          //'permission_callback' => array( 'SourceImmoApi', 'privileged_permission_callback' ),
          'callback' => array( 'SourceImmoApi', 'get_configs' ),
        ), // End GET

        // SAVE/UPDATE
        array(
          'methods' => WP_REST_Server::EDITABLE,
          'permission_callback' => array( 'SourceImmoApi', 'privileged_permission_callback' ),
          'callback' => array( 'SourceImmoApi', 'set_configs' ),
          'args' => array(
            'settings' => array(
              'required' => true,
              'type' => 'SourceImmoConfig',
              'description' => __( 'Configuration informations', SI ),
            )
          )
        )
      )
    );

    // Reset
    register_rest_route( 'si-rest','/configs/reset',array(
        array(
          'methods' => WP_REST_Server::EDITABLE,
          'permission_callback' => array( 'SourceImmoApi', 'privileged_permission_callback' ),
          'callback' => array( 'SourceImmoApi', 'reset_configs' ),
        ), // End POST
      )
    );

    // Reset
    register_rest_route( 'si-rest','/configs/backup',array(
        array(
          'methods' => WP_REST_Server::READABLE,
          'permission_callback' => array( 'SourceImmoApi','privileged_permission_callback' ),
          'callback' => array( 'SourceImmoApi', 'get_configs_backup')
        ), // End GET
        array(
          'methods' => WP_REST_Server::EDITABLE,
          'permission_callback' => array( 'SourceImmoApi', 'privileged_permission_callback' ),
          'callback' => array( 'SourceImmoApi', 'backup_configs' ),
        ), // End POST
        array(
          'methods' => WP_REST_Server::DELETABLE,
          'permission_callback' => array( 'SourceImmoApi', 'privileged_permission_callback' ),
          'callback' => array( 'SourceImmoApi', 'clear_backup' ),
        ) // End POST
      )
    );
  }



  


  /**
   * List REST routes registration
   * @static
   */
  static function _register_list_routes(){
    //Write message
    register_rest_route( 'si-rest','/list_configs',
      array(
        'methods' => WP_REST_Server::READABLE,
        'callback' => array( 'SourceImmoApi', 'get_list_configs' ),
        'args' => array(
          'alias' => array(
            'required' => true,
            'type' => 'String',
            'description' => __( 'Alias identifier of the List object', SI ),
          )
        )
      ) // End GET
    );
  }



  /**
   * Message REST routes registration
   * @static
   */
  static function _register_message_routes(){
    //Write message
    register_rest_route( 'si-rest','/message',
      array(
        array(
          'methods' => WP_REST_Server::CREATABLE,
          //'permission_callback' => array( 'SourceImmoApi', 'privileged_permission_callback' ),
          'callback' => array( 'SourceImmoApi', 'send_message' ),
          'args' => array(
            'params' => array(
              'required' => true,
              'type' => 'MessageData',
              'description' => __( 'Message information', SI ),
            )
          )
        ), // End POST
      )
    );
  }

 /**
   * Message REST routes registration
   * @static
   */
  static function _register_form_routes(){
    // Get WP page list
    register_rest_route( 'si-rest','/form/list',
      array(
        'methods' => WP_REST_Server::READABLE,
        //'permission_callback' => array( 'SourceImmoApi', 'privileged_permission_callback' ),
        'callback' => array( 'SourceImmoApi', 'get_form_list' ),
      )
    );

  }

  /**
   * Message REST languages registration
   * @static
   */
  static function _register_language_routes(){
    // Get WP language list
    register_rest_route( 'si-rest','/language/list',
      array(
        'methods' => WP_REST_Server::READABLE,
        //'permission_callback' => array( 'SourceImmoApi', 'privileged_permission_callback' ),
        'callback' => array( 'SourceImmoApi', 'get_language_list' ),
      )
    );

  }
  /**
   * Message REST menus registration
   * @static
   */
  static function _register_menu_routes(){
    // Get WP page list
    register_rest_route( 'si-rest','/menu/list',
      array(
        'methods' => WP_REST_Server::READABLE,
        //'permission_callback' => array( 'SourceImmoApi', 'privileged_permission_callback' ),
        'callback' => array( 'SourceImmoApi', 'get_menu_list' )
      )
    );
  }



  /**
   * Message REST pages registration
   * @static
   */
  static function _register_page_routes(){
    // Get WP page list
    register_rest_route( 'si-rest','/page/list',
      array(
        'methods' => WP_REST_Server::READABLE,
        //'permission_callback' => array( 'SourceImmoApi', 'privileged_permission_callback' ),
        'callback' => array( 'SourceImmoApi', 'get_page_list' ),
        'args' => array(
          'locale' => array(
            'required' => false,
            'type' => 'String',
            'description' => __( 'Page language filter', SI ),
          ),
          'type' => array(
            'required' => true,
            'type' => 'String',
            'description' => __( 'Type for permalink', SI ),
          )
        )
      )
    );

    register_rest_route( 'si-rest','/page',
      array(
        'methods' => WP_REST_Server::EDITABLE,
        //'permission_callback' => array( 'SourceImmoApi', 'privileged_permission_callback' ),
        'callback' => array( 'SourceImmoApi', 'update_page' ),
        'args' => array(
          'page_id' => array(
            'required' => true,
            'type' => 'String',
            'description' => __( 'Page ID', SI ),
          ),
          'title' => array(
            'required' => true,
            'type' => 'String',
            'description' => __( 'Page title', SI ),
          ),
          'content' => array(
            'required' => true,
            'type' => 'String',
            'description' => __( 'New content of the page', SI ),
          )
        )
      )
    );
    
    register_rest_route( 'si-rest','/page/permalink',
      array(
        'methods' => WP_REST_Server::READABLE,
        //'permission_callback' => array( 'SourceImmoApi', 'privileged_permission_callback' ),
        'callback' => array( 'SourceImmoApi', 'get_page_permalink' ),
        'args' => array(
          'page_id' => array(
            'required' => true,
            'type' => 'String',
            'description' => __( 'Page ID', SI ),
          )
        )
      )
    );
  }


  /**
   * Permalinks REST routes registration
   * @static
   */
  static function _register_permalink_routes(){
    //Write message
    register_rest_route( 'si-rest','/permalinks',
      array(
        'methods' => WP_REST_Server::READABLE,
        'callback' => array( 'SourceImmoApi', 'get_configs_permalinks' )
      ) // End GET
    );
  }


  /**
   * View REST routes registration
   * @static
   */
  static function _register_view_routes(){
    // Acquire default data view
    register_rest_route( 'si-rest','/data_view',
      array(
        'methods' => WP_REST_Server::READABLE,
        //'permission_callback' => array( 'SourceImmoApi', 'privileged_permission_callback' ),
        'callback' => array( 'SourceImmoApi', 'get_data_view' ),
      )
    );
  }

}
