<?php
define('SI_OPTION_KEY', 'SourceImmoConfig');

/**
* Stores data from
*/
class SourceImmoConfig {

  public $state = 'inital';

  /**
  * Required properties for API call
  */

  /**
   * App ID
   * @var string
   */
  public $app_id = '';

  /**
   * App version
   * @var string
   */
  public $app_version = '';

  /**
   * API Key
   * @var string
   */
  public $api_key = '';
  /**
   * Account ID
   * @var string
   */
  public $account_id = '';

  /**
   * Registered flag
   */
  public $registered = false;

  /**
   * Supported language
   */
  public $supported_locales = array();

  /**
   * Google Map API key
   * @var string
   */
  public $map_api_key = '';
  

  /**
   * Default currency
   * @var string
   */
  public $default_currency = 'CAD';

  /**
   * Default interest rate for calculator
   * @var numeric
   */
  public $default_interest_rate = 3;

  /**
   * Mode of processing. Use DEV when building configuration or testing stuff, PROD otherwise
   * @var string
   */
  public $mode = 'PROD';

  
  /**
   * Isolation mode for single page rendering. 
   * NONE => No isolation. The controller is added to the body to allow controller model data to be display anywhere on the page
   * ISOLATE => Confine the controller to the Shortcode scope.
   * @var string
   */
  public $isolation = 'NONE';

  /**
   * Prefetch data server side to allow api call caching
   * @var boolean
   */
  public $prefetch_data = false;

  /**
   * Site logo to use in appropriate places (ex: Print)
   * @var string
   */
  public $site_logo = null;


  /**
   * Form from name
   */
  public $form_from_name = '';

  /**
   * Form from address
   */
  public $form_from_address = '';

  /**
   * Email address to send form information
   * @var string
   */
  public $form_recipient = '';

  /**
   * Time limit (in days) that an item is flagged as new
   * @var int
   */
  public $new_item_time_limit = 10;

  /**
   * Number of image to display when a listing is sold
   * @var int
   */
  public $sold_image_limit = -1;

  /**
   * Allow the display of map and street view in the media box
   * @var int
   */
  public $sold_allow_map = true;

  /**
  * List configuration
  * @var ArraySourceImmoView
  */
  public $lists = array();

  /**
  * Listing details route path configuration
  * @var ArraySourceImmoRoute
  */
  public $listing_routes = array();

  /**
  * Broker details route path configuration
  * @var ArraySourceImmoRoute
  */
  public $broker_routes = array();

  /**
  * City details route path configuration
  * @var ArraySourceImmoRoute
  */
  public $city_routes = array();

  /**
  * Office details route path configuration
  * @var ArraySourceImmoRoute
  */
  public $office_routes = array();

  /**
  * Agency details route path configuration
  * @var ArraySourceImmoRoute
  */
  public $agency_routes = array();

  public $default_view = null;

  public $listing_layouts   = array();
  public $city_layouts      = array();
  public $office_layouts    = array();
  public $broker_layouts    = array();
  public $agency_layouts    = array();

  public $enable_custom_page = false;

  public $map_style = null;

  public $favorites_button_menu = null;

  public $active_addons = null;

  public $phone_format = '000-000-0000';
  
  /**
   * Configuration constructor class
   */
  public function __construct(){
    // read only
    $this->app_id         = SI_APP_ID;
    $this->app_version    = SI_VERSION;

    // set defaut DEMO value
    // $this->api_key        = '09702f24-a71e-4260-bd54-ca19217fd6a9';
    // $this->account_id     = 'fb8dc8a8-6c92-42c5-b65d-2f28f755539b';
    $this->phone_format = '000-000-0000';
    $this->registered     = false;

    $this->supported_locales = ['fr','en'];

    $this->form_from_name = __('Your website',SI);
    $this->form_from_address = 'no-reply@' . $_SERVER['HTTP_HOST'];
    $this->styles = '';


    // init routes
    $this->listing_routes  = array(
      new SourceImmoRoute('fr', 'proprietes/{{item.location.region}}/{{item.location.city}}/{{item.transaction}}/{{item.ref_number}}/','propriete/{{item.ref_number}}/'),
      new SourceImmoRoute('en', 'listings/{{item.location.region}}/{{item.location.city}}/{{item.transaction}}/{{item.ref_number}}/','listing/{{item.ref_number}}/'),
    );
    $this->broker_routes  = array(
      new SourceImmoRoute('fr', 'courtiers/{{item.first_name}}-{{item.last_name}}/{{item.ref_number}}/','courtier/{{item.ref_number}}/'),
      new SourceImmoRoute('en', 'brokers/{{item.first_name}}-{{item.last_name}}/{{item.ref_number}}/','broker/{{item.ref_number}}/'),
    );
    $this->city_routes  = array(
      new SourceImmoRoute('fr', 'villes/{{item.location.region}}/{{item.name}}/{{item.ref_number}}/','ville/{{item.ref_number}}/'),
      new SourceImmoRoute('en', 'cities/{{item.location.region}}/{{item.name}}/{{item.ref_number}}/','city/{{item.ref_number}}/'),
    );
    $this->office_routes  = array(
      new SourceImmoRoute('fr', 'bureaux/{{item.name}}/{{item.ref_number}}/','bureau/{{item.ref_number}}/'),
      new SourceImmoRoute('en', 'offices/{{item.name}}/{{item.ref_number}}/','office/{{item.ref_number}}/'),
    );
    $this->agency_routes  = array(
      new SourceImmoRoute('fr', 'agences/{{item.name}}/{{item.ref_number}}/','agence/{{item.ref_number}}/'),
      new SourceImmoRoute('en', 'agencies/{{item.name}}/{{item.ref_number}}/','agency/{{item.ref_number}}/'),
    );

    // init layouts
    $this->listing_layouts = array(
      //new SourceImmoLayout('fr','standard'),
      //new SourceImmoLayout('en','standard')
    );
    $this->broker_layouts = array(
      //new SourceImmoLayout('fr','standard'),
      //new SourceImmoLayout('en','standard')
    );
    $this->city_layouts   = array(
      //new SourceImmoLayout('fr','standard'),
      //new SourceImmoLayout('en','standard')
    );
    $this->office_layouts = array(
      //new SourceImmoLayout('fr','standard'),
      //new SourceImmoLayout('en','standard')
    );
    $this->agency_layouts = array(
      //new SourceImmoLayout('fr','standard'),
      //new SourceImmoLayout('en','standard')
    );

    $listingList = new SourceImmoList('','listings','listings','contract_start_date');
    $listingList->sort_reverse = true;
    $listingList->limit = 30;
    $listingList->is_default_type_configs = true;
    
    $brokerList   = new SourceImmoList('','brokers','brokers','name');
    $brokerList->is_default_type_configs = true;
    $cityList     = new SourceImmoList('','cities','cities','name');
    $officeList   = new SourceImmoList('','offices','offices','name');
    $officeList->is_default_type_configs = true;
    $agencyList   = new SourceImmoList('','agencies','agencies','name');
    $agencyList->is_default_type_configs = true;
    
    $this->lists = array(
      $listingList,$brokerList,$cityList,$officeList,$agencyList
    );

    add_action('si/configs/setup', [$this,'setup'], 5, 3);
  }

  public function setup($api_key,$account_id,$view_id){
    // Load current configs
    $savedConfigs = $this->loadConfigFile();
    
    if($savedConfigs !== false){
      // Parse current configs if any
      if($this->parse(json_decode($savedConfigs, true))){
        
      }
    }

    $this->app_version = SI_VERSION;
    $previousDefaultView = $this->default_view;

    // Set new basic information
    $this->api_key          = $api_key;
    $this->account_id       = $account_id;
    $this->default_view     = $view_id;
    $site_title = get_bloginfo( 'name' );

    // Update view id in lists
    foreach($this->lists as $list){
      $list->source = [
        'id' => $view_id,
        'account_id' => $account_id,
        'name' => 'Default'
      ];
      
      if($list->search_engine_options->tabbed == true && isset($list->search_engine_options->tabs)){
        foreach($list->search_engine_options->tabs as $tab){
          if($tab->view_id == $previousDefaultView){
            $tab->view_id = $view_id;
            foreach($tab->caption as &$lang){
              $lang = str_replace('{{site_title}}',$site_title, $lang);
            }
          }
        }
      }
    }

    // Save new configurations
    $this->save();
  }

  public static function getFileUrl($addVersion=false){
    $lUploadDir   = wp_upload_dir();

    $lConfigPath = $lUploadDir['basedir'] . '/_sourceimmo/_configs.json';
    $lResult = str_replace(array('http://','https://'),'//',$lUploadDir['baseurl'] . '/_sourceimmo/_configs.json');
    $lUrlVersion = '';

    if($addVersion){
      $version = time();
      if(file_exists($lConfigPath)){
        $version = filemtime($lConfigPath);
      }
      $lUrlVersion = '?v=' . $version;
    }
    
    return $lResult . $lUrlVersion;
  }

  public static function load(){
    $instance = new SourceImmoConfig();
    
    //$savedConfigs = $instance->loadSavedConfigs();
    $savedConfigs = $instance->loadConfigFile();
    
    if($savedConfigs !== false){
      if($instance->parse(json_decode($savedConfigs, true))){
        $instance->state = 'loaded';
      }
      else{
        $instance->state = 'parse_failed';
      }

      $configsUpdated = $instance->validate_version();

      $instance->app_version = SI_VERSION;
    
      $instance->normalizeRoutes();

      //$instance->normalizeValues();

      if($configsUpdated){
        $instance->addLog('saveConfigFile::upgrade configs to current app version');
        $instance->saveConfigFile();
      }
      
    }
    else{
      $instance->state = 'load_failed';
    }
    
    if($instance->api_key != '09702f24-a71e-4260-bd54-ca19217fd6a9') {$instance->registered = true;}

    //__c($instance);
    
    return $instance;
  }

  public function clearEverything(){
    delete_option(SI_OPTION_KEY);
    delete_option('ImmoDBConfig');

    $this->deleteFile();
  }

  public function loadSavedConfigs(){
    $lResult = get_option(SI_OPTION_KEY);
    
    if($lResult === false){
      // Try loading previous version
      $lResult = get_option('ImmoDBConfig');
    }



    return $lResult;
  }

  public function parse($data){
    if(!is_array($data)) return false;

    foreach ($data as $key => $value) {
      if(property_exists($this, $key)){
        if($key == 'lists'){
          $this->lists = array();
          if(is_array($value)){   
            foreach ($value as $item) {
              $obj = SourceImmoList::parse($item);
             
              $obj->normalizeValues();
             
              array_push($this->lists, $obj);
              $obj = null;
            }
          }
        }
        else{
          if(is_object($this->{$key}) && method_exists($this->{$key},'parse')){
            $this->{$key}->parse($value);
          }
          else{
            $this->{$key} = json_decode(json_encode($value));
          }
        }
        
      }
    }
    return true;
  }

  public function deleteFile(){
    $lUploadDir   = wp_upload_dir();
    $lConfigPath = $lUploadDir['basedir'] . '/_sourceimmo';
    $lConfigFilePath = $lConfigPath . '/_configs.json';
    unlink($lConfigFilePath);
    //rmdir($lConfigPath);  
  }

  public function save(){
    $this->normalizeRoutes();

    //update_option(SI_OPTION_KEY, json_encode($this));
    SourceImmo::current()->apply_routes(true);
    return $this->saveConfigFile();
  }

  public function validate_version(){
    if(version_compare($this->app_version,SI_VERSION,'<')){
      return $this->upgrade_to_current_version();;
    }

    return false;
  }

  public function upgrade_to_current_version(){
    $changeApplied = false;

    // prior to version 2.0.0
    if(version_compare($this->app_version,'2.0.0','<')){
      // Add border to some list elements
      foreach ($this->lists as $list){
        //$list->list_layout->scope_class = 'si-border';
        $list->search_engine_options->scope_class = 'si-border';
        $list->list_item_layout->scope_class = 'si-border';
      }

      $layouts = ['listing_layouts','broker_layouts','office_layouts','agency_layouts','city_layouts'];
      foreach($layouts as $layoutItem){
        if(isset($this->{$layoutItem}) && count($this->{$layoutItem}) > 0){
          foreach($this->{$layoutItem} as $localeLayoutItem){
            if(isset($localeLayoutItem->page) && is_numeric($localeLayoutItem->page)){
              $localeLayoutItem->page = get_post_field( 'post_name', $localeLayoutItem->page );
            }
          }
        }
      }

      $changeApplied = true;
    }

    return $changeApplied;
  }

  public function saveConfigFile(){
    

    // save to file system too
    $lUploadDir   = wp_upload_dir();


    $lConfigPath = $lUploadDir['basedir'] . '/_sourceimmo';
    if ( ! file_exists( $lConfigPath ) ) {
      $this->addLog('saveConfigFile::create configs folder');
      wp_mkdir_p( $lConfigPath );
    }


    $this->addLog('saveConfigFile::saving configs', true);
    $lConfigFilePath = $lConfigPath . '/_configs.json';
    $filePointer = fopen($lConfigFilePath,'w+');
    if(($securedVersion = $this->getSecuredVersion()) !== false){
      $fileContent = json_encode($securedVersion);
      if(strlen($fileContent) > 50){
        fwrite($filePointer, $fileContent);
        fclose($filePointer);
    
        $this->addLog('saveConfigFile::save done'); 
      }
      else{
        $this->addLog('saveConfigFile::configs anomaly detected (' . $fileContent . ')', true);
      }
    }
    else{
      $this->addLog('saveConfigFile::unable to get secured version', true);
    }
    
    return $lConfigFilePath;
  }

  public function addLog($message,$includeRequestMeta=false){
    $lUploadDir   = wp_upload_dir();
    $logPath = $lUploadDir['basedir'] . '/_sourceimmo.log';
    $filePointer = fopen($logPath,'a');
    $timestamp = Date('Y-M-d H:i:s');

    if($includeRequestMeta){
      $referer = $_SERVER['HTTP_REFERER'] ?: 'None';
      $request = $_SERVER['REQUEST_URI'];
      $method  = $_SERVER['REQUEST_METHOD'];
      $message = "$message (on $method : $request, referer:'$referer') ";
    }

    fwrite($filePointer, "$timestamp :: $message \n");
    fclose($filePointer);

  }

  public function loadConfigFile(){
    $lUploadDir   = wp_upload_dir();
    $lConfigPath = $lUploadDir['basedir'] . '/_sourceimmo';
    if ( ! file_exists( $lConfigPath ) ) return false;

    $fileContent = false;

    $lConfigFilePath = $lConfigPath . '/_configs.json';
    if ( ! file_exists( $lConfigFilePath ) ) return false;

    try {
      $filePointer = fopen($lConfigFilePath,'r');
      $fileContent = fread($filePointer,max(filesize($lConfigFilePath),1));

      fclose($filePointer);
    } 
    catch (\Throwable $th) {
      
    }
    

    return $fileContent;
  }


  public function getSecuredVersion(){
    //$lResult = clone $this;
    $lResult = unserialize(serialize($this));
    //$lResult->api_key = null;
    //$lResult->account_id = null;

    if($lResult->api_key == null) return false;
    if($lResult->account_id == null) return false;

    return $lResult;
  }


  public function normalizeRoutes(){
    $structure = get_option( 'permalink_structure' );
    $structureEndsWithSlash = str_endswith($structure,'/');
    
    $this->normalizeRouteGroup($this->listing_routes, $structureEndsWithSlash);
    $this->normalizeRouteGroup($this->broker_routes, $structureEndsWithSlash);
    $this->normalizeRouteGroup($this->city_routes, $structureEndsWithSlash);
    $this->normalizeRouteGroup($this->office_routes, $structureEndsWithSlash);
    $this->normalizeRouteGroup($this->agency_routes, $structureEndsWithSlash);
  }

  public function normalizeRouteGroup($group, $structureEndsWithSlash){
    foreach ($group as $item) {
      if(isset($item->route)){
        $routeEndsWithSlash = str_endswith($item->route, '/');
        
        if($structureEndsWithSlash && !$routeEndsWithSlash) $item->route = $item->route . '/';
        if(!$structureEndsWithSlash && $routeEndsWithSlash) $item->route = rtrim($item->route,'/');  
      }
      
      if(isset($item->shortcut)){
        $shortcutEndsWithSlash = str_endswith($item->shortcut, '/');

        if($structureEndsWithSlash && !$shortcutEndsWithSlash) $item->shortcut = $item->shortcut . '/';
        if(!$structureEndsWithSlash && $shortcutEndsWithSlash) $item->shortcut = rtrim($item->shortcut,'/');
      }
      
    }
  }
  
  public function stylesToAttr(){
    if($this->styles == null) return '';
    $lAttrList = explode(',', $this->styles);
    $lAttrList = array_filter($lAttrList, function($item){
      return strpos($item,'--custom-style')===false;
    });

    foreach ($lAttrList as &$attr) {
      $attr = str_replace(array('{','}','"'),'',$attr);
    }
    return implode(';',$lAttrList);
  }


  public function get_map_api_key(){
    return apply_filters('licenses/google_map', $this->map_api_key);
  }
}

