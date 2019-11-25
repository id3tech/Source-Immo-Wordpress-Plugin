<?php
/**
* Stores data from
*/
class SourceImmoConfig {

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
   * Mode of processing. Use DEV when building configuration or testing stuff, PROD otherwise
   * @var string
   */
  public $mode = 'PROD';

  /**
   * Prefetch data server side to allow api call caching
   * @var boolean
   */
  public $prefetch_data = false;

  

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

  public $default_view = null;

  public $listing_layouts   = array();
  public $city_layouts      = array();
  public $office_layouts    = array();
  public $broker_layouts    = array();

  public $enable_custom_page = false;

  public $map_style = null;

  public $favorites_button_menu = null;

  /**
   * Configuration constructor class
   */
  public function __construct(){
    // read only
    $this->app_id         = SI_APP_ID;
    $this->app_version    = SI_VERSION;

    // set defaut DEMO value
    $this->api_key        = '09702f24-a71e-4260-bd54-ca19217fd6a9';
    $this->account_id     = 'fb8dc8a8-6c92-42c5-b65d-2f28f755539b';
    
    $this->registered     = false;

    $this->supported_locales = ['fr','en'];

    $this->form_from_name = __('Your website',SI);
    $this->form_from_address = 'no-reply@' . $_SERVER['HTTP_HOST'];
  

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
      new SourceImmoRoute('fr', 'bureaux/{{item.location.region}}/{{item.name}}/{{item.ref_number}}/','ville/{{item.ref_number}}/'),
      new SourceImmoRoute('en', 'office/{{item.location.region}}/{{item.name}}/{{item.ref_number}}/','city/{{item.ref_number}}/'),
    );

    // init layouts
    $this->listing_layouts = array(
      new SourceImmoLayout('fr','standard'),
      new SourceImmoLayout('en','standard')
    );
    $this->broker_layouts = array(
      new SourceImmoLayout('fr','standard'),
      new SourceImmoLayout('en','standard')
    );
    $this->city_layouts   = array(
      new SourceImmoLayout('fr','standard'),
      new SourceImmoLayout('en','standard')
    );
    $this->office_layouts = array(
      new SourceImmoLayout('fr','standard'),
      new SourceImmoLayout('en','standard')
    );

    $listingList = new SourceImmoList();
    $listingList->sort = 'contract.start_date';
    $listingList->sort_reverse = true;
    $listingList->limit = 30;
    
    $brokerList   = new SourceImmoList('','brokers','brokers','last_name');
    $cityList     = new SourceImmoList('','cities','cities','name');
    $officeList   = new SourceImmoList('','offices','offices','name');
    
    $this->lists = array(
      $listingList,$brokerList,$cityList,$officeList
    );
  }

  public static function load(){
    $instance = new SourceImmoConfig();

    $savedConfigs = $instance->loadSavedConfigs();
    
    if($savedConfigs){
      $instance->parse(json_decode($savedConfigs));
      $instance->app_version = SI_VERSION;
    
      $instance->normalizeRoutes();

      $instance->saveConfigFile();
    }
    
    if($instance->api_key != '09702f24-a71e-4260-bd54-ca19217fd6a9') {$instance->registered = true;}

    
    return $instance;
  }

  public function loadSavedConfigs(){
    $lResult = get_option('SourceImmoConfig');
    if($lResult === false){
      // Try loading previous version
      $lResult = get_option('ImmoDBConfig');
    }
    return $lResult;
  }

  public function parse($data){
    foreach ($data as $key => $value) {
      if(property_exists($this, $key)){
        $this->{$key} = $value;
      }
    }
  }

  public function save(){
    $this->normalizeRoutes();

    update_option('SourceImmoConfig', json_encode($this));
    $this->saveConfigFile();
  }

  public function saveConfigFile(){
    // save to file system too
    $lUploadDir   = wp_upload_dir();
    $lConfigPath = $lUploadDir['basedir'] . '/_sourceimmo';
    if ( ! file_exists( $lConfigPath ) ) {
      wp_mkdir_p( $lConfigPath );
    }
    $lConfigFilePath = $lConfigPath . '/_configs.json';
    $filePointer = fopen($lConfigFilePath,'w');
    fwrite($filePointer, json_encode($this->getSecuredVersion()));
    fclose($filePointer);
  }


  public function getSecuredVersion(){
    $lResult = clone $this;
    //$lResult->api_key = null;
    //$lResult->account_id = null;

    return $lResult;
  }

  public function normalizeRoutes(){
    $structure = get_option( 'permalink_structure' );
    $structureEndsWithSlash = str_endswith($structure,'/');
    
    $this->normalizeRouteGroup($this->listing_routes, $structureEndsWithSlash);
    $this->normalizeRouteGroup($this->broker_routes, $structureEndsWithSlash);
    $this->normalizeRouteGroup($this->city_routes, $structureEndsWithSlash);
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
  
}


class SourceImmoRoute{

  public $lang = '';
  public $route = '';

  public function __construct($lang='', $route='', $shortcut=''){
    $this->lang = $lang;
    $this->route = $route;
    $this->shortcut = $shortcut;
  }
}

class SourceImmoLayout{
  public $lang = '';
  public $type = 'standard';
  public $preset = 'standard';
  public $scope_class = '';
  public $page = null;
  /**
   * Communication method for forms
   */
  public $communication_mode = 'basic';
  /**
   * Form id
   */
  public $form_id = '';

  public function __construct($lang='', $type=''){
    $this->lang = $lang;
    $this->type = $type;
    $this->communication_mode = 'basic';
    
  }
}

class SourceImmoList {
  public $source = 'default';
  public $alias = 'default';
  public $limit = 0;
  public $type = 'listings';
  public $filter_group = null;
  public $sort = 'auto';
  public $sort_reverse = false;
  public $searchable = true;
  public $sortable = true;
  public $mappable = true;
  public $show_list_meta = true;
  public $list_layout = null;
  public $list_item_layout = 'standard';
  public $browse_mode = null;
  public $shuffle = false;  
  public $default_zoom_level = "auto";
  public $smart_focus_tolerance = 5;

  public function __construct($source='',$alias='listings',$type='listings',$sort=''){
    $this->source = $source;
    $this->alias = $alias;
    $this->type = $type;
    $this->sort = $sort;


    $this->list_layout = new SourceImmoLayout();
    $this->list_item_layout = new SourceImmoLayout();

    $this->filter_group = new SourceImmoFilterGroup();
  }

  static function parse($source){
    return unserialize(sprintf(
      'O:%d:"%s"%s',
      strlen('SourceImmoList'),
      'SourceImmoList',
      strstr(strstr(serialize($source), '"'), ':')
    ));
  }


  public function getViewEndpoint(){
    $lTypedPaths = array(
      'listings' => 'listing',
      'cities' => 'location/city',
      'brokers' => 'broker',
      'offices' => 'office'
    );
    return "{$lTypedPaths[$this->type]}/view";
  }
}


class SourceImmoFilterGroup {
  public $operator = 'and';
  public $filters = null;
  public $filter_groups = null;

  public function __construct(){
    $this->filters = array();
    $this->filter_groups = array();
  }
}

class SourceImmoFilter {
  public $field = '';
  public $operator = 'equal';
  public $value = '';
}
