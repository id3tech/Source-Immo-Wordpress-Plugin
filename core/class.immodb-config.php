<?php
/**
* Stores data from
*/
class ImmoDBConfig {

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
   * Email address to send form information
   * @var string
   */
  public $form_recipient = '';

  /**
  * List configuration
  * @var ArrayImmoDBView
  */
  public $lists = array();

  /**
  * Listing details route path configuration
  * @var ArrayImmoDBRoute
  */
  public $listing_routes = array();

  /**
  * Broker details route path configuration
  * @var ArrayImmoDBRoute
  */
  public $broker_routes = array();

  /**
  * City details route path configuration
  * @var ArrayImmoDBRoute
  */
  public $city_routes = array();

  public $default_view = null;
  public $listing_layouts = array();
  //public $listing_layout = 'standard';
  //public $listing_layout_page = null;
  public $broker_layouts = array();
  //public $broker_layout = 'standard';
  //public $broker_layout_page = null;

  public $enable_custom_page = false;

  public $map_style = null;

  /**
   * Configuration constructor class
   */
  public function __construct(){
    // read only
    $this->app_id         = IMMODB_APP_ID;
    $this->app_version    = IMMODB_VERSION;

    // set defaut DEMO value
    $this->api_key        = '09702f24-a71e-4260-bd54-ca19217fd6a9';
    $this->account_id     = 'fb8dc8a8-6c92-42c5-b65d-2f28f755539b';
    
    $this->registered     = false;

    $this->supported_locales = ['fr','en'];

    // init routes
    $this->listing_routes  = array(
      new ImmoDBRoute('fr', 'proprietes/{{item.location.region}}/{{item.location.city}}/{{item.transaction}}/{{item.ref_number}}/','propriete/{{item.ref_number}}/'),
      new ImmoDBRoute('en', 'listings/{{item.location.region}}/{{item.location.city}}/{{item.transaction}}/{{item.ref_number}}/','listing/{{item.ref_number}}/'),
    );
    $this->broker_routes  = array(
      new ImmoDBRoute('fr', 'courtiers/{{item.ref_number}}/','courtier/{{item.ref_number}}/'),
      new ImmoDBRoute('en', 'brokers/{{item.ref_number}}/','broker/{{item.ref_number}}/'),
    );
    $this->city_routes  = array(
      new ImmoDBRoute('fr', 'villes/{{item.location.region}}/{{item.name}}/{{item.ref_number}}/','ville/{{item.ref_number}}/'),
      new ImmoDBRoute('en', 'cities/{{item.location.region}}/{{item.name}}/{{item.ref_number}}/','city/{{item.ref_number}}/'),
    );

    // init layouts
    $this->listing_layouts = array(
      new ImmoDBLayout('fr','standard'),
      new ImmoDBLayout('en','standard')
    );
    $this->broker_layouts = array(
      new ImmoDBLayout('fr','standard'),
      new ImmoDBLayout('en','standard')
    );

    $listingList = new ImmoDBList();
    $listingList->sort = 'contract.start_date';
    $listingList->sort_reverse = true;
    $listingList->limit = 30;
    
    $brokerList = new ImmoDBList('','brokers','brokers','last_name');
    
    $this->lists = array(
      $listingList,$brokerList
    );
  }

  public static function load(){
    $instance = new ImmoDbConfig();

    $savedConfigs = get_option('ImmoDBConfig');
    if($savedConfigs){
      $instance->parse(json_decode($savedConfigs));
      $instance->normalizeRoutes();

      $instance->saveConfigFile();
    }
    
    if($instance->api_key != '09702f24-a71e-4260-bd54-ca19217fd6a9') {$instance->registered = true;}

    return $instance;
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

    update_option('ImmoDBConfig', json_encode($this));
    $this->saveConfigFile();
  }

  public function saveConfigFile(){
    // save to file system too
    $lUploadDir   = wp_upload_dir();
    $lConfigPath = $lUploadDir['basedir'] . '/_immodb';
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


class ImmoDBRoute{

  public $lang = '';
  public $route = '';

  public function __construct($lang='', $route='', $shortcut=''){
    $this->lang = $lang;
    $this->route = $route;
    $this->shortcut = $shortcut;
  }
}

class ImmoDBLayout{
  public $lang = '';
  public $type = 'standard';
  public $preset = 'standard';
  public $scope_class = '';
  public $page = null;

  public function __construct($lang='', $type=''){
    $this->lang = $lang;
    $this->type = $type;
  }
}

class ImmoDBList {
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

  public function __construct($source='',$alias='listings',$type='listings',$sort=''){
    $this->source = $source;
    $this->alias = $alias;
    $this->type = $type;
    $this->sort = $sort;


    $this->list_layout = new ImmoDBLayout();
    $this->list_item_layout = new ImmoDBLayout();

    $this->filter_group = new ImmoDBFilterGroup();
  }

  static function parse($source){
    return unserialize(sprintf(
      'O:%d:"%s"%s',
      strlen('ImmoDBList'),
      'ImmoDBList',
      strstr(strstr(serialize($source), '"'), ':')
    ));
  }


  public function getViewEndpoint(){
    $lTypedPaths = array(
      'listings' => 'listing',
      'cities' => 'location/city',
      'brokers' => 'broker',
    );
    
    return "{$lTypedPaths[$this->type]}/view";
  }
}


class ImmoDBFilterGroup {
  public $operator = 'and';
  public $filters = null;
  public $filter_groups = null;

  public function __construct(){
    $this->filters = array();
    $this->filter_groups = array();
  }
}

class ImmoDBFilter {
  public $field = '';
  public $operator = 'equal';
  public $value = '';
}
