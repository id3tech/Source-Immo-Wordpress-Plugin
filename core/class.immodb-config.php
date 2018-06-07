<?php
/**
* Stores data from
*/
class ImmoDBConfig {

  /**
  * Required properties for API call
  */
  public $api_key = '';
  public $account_id = '';

  /**
  * List configuration
  */

  /**
  * Detail configuration
  */
  //
  public $detail_routes = array();

  public function __construct(){

    // set defaut DEMO value
    $this->api_key        = '09702f24-a71e-4260-bd54-ca19217fd6a9';
    $this->account_id     = 'fb8dc8a8-6c92-42c5-b65d-2f28f755539b';
    $this->detail_routes  = array(
      array('lang' => 'fr', 'route' => 'proprietes/{{transation}}/{{location.region}}/{{location.city}}/{{id}}'),
      array('lang' => 'en', 'route' => 'listings/{{transation}}/{{location.region}}/{{location.city}}/{{id}}'),
    );
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
