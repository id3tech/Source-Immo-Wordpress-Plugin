<?php
/**
* Stores data from
*/
class ImmoDBConfig {

  /**
  * Required properties for API call
  */
  
  /**
   * API Key
   * @var string
   */
  public $api_key = '';
  /**
   * Accound ID
   * @var string
   */
  public $account_id = '';

  /**
   * Default currency
   * @var string
   */
  public $default_currency = 'CAD';

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
   * Configuration constructor class
   */
  public function __construct(){

    // set defaut DEMO value
    $this->api_key        = '09702f24-a71e-4260-bd54-ca19217fd6a9';
    $this->account_id     = 'fb8dc8a8-6c92-42c5-b65d-2f28f755539b';
    $this->listing_routes  = array(
      new ImmoDBRoute('fr','proprietes/{{getRegion(item)}}/{{getCity(item)}}/{{getTransaction(item)}}/{{id}}'),
      new ImmoDBRoute('en', 'listings/{{getRegion(item)}}/{{getCity(item)}}/{{getTransaction(item)}}/{{id}}'),
    );
    $this->broker_routes  = array(
      new ImmoDBRoute('fr','courtiers/{{getRegion(item)}}/{{getCity(item)}}/{{id}}'),
      new ImmoDBRoute('en', 'brokers/{{getRegion(item)}}/{{getCity(item)}}/{{id}}'),
    );

    $this->lists = array(
      new ImmoDBList()
    );
    // $this->detail_routes  = array(
    //   array('lang' => 'fr', 'route' => 'proprietes/{{transation}}/{{location.region}}/{{location.city}}/{{id}}'),
    //   array('lang' => 'en', 'route' => 'listings/{{transation}}/{{location.region}}/{{location.city}}/{{id}}'),
    // );

  }

  public static function load(){
    $instance = new ImmoDbConfig();

    $savedConfigs = get_option('ImmoDBConfig');
    if($savedConfigs){
      $instance->parse(json_decode($savedConfigs));
    }

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
    update_option('ImmoDBConfig', json_encode($this));
  }
}


class ImmoDBRoute{

  public $lang = '';
  public $route = '';

  public function __construct($lang='', $route=''){
    $this->lang = $lang;
    $this->route = $route;
  }
}

class ImmoDBList {
  public $source = 'default';
  public $alias = 'default';
  public $limit = 0;
  public $type = 'listings';
  public $filters = null;
  public $sort = 'auto';
  public $searchable = true;
  public $sortable = true;

  public $list_layout = null;
  public $list_item_layout = 'standard';
  
  public function __construct(){
    $this->list_layout = new ImmoDBLayout();
    $this->list_item_layout = new ImmoDBLayout();
  }
}

class ImmoDBLayout {
  public $preset = 'standard';
  public $scope_class = '';
  public $custom = null;
}

class ImmoDBFilter {
  public $field = '';
  public $operator = '=';
  public $value = '';
}
