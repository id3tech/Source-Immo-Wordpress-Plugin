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
  * List configuration
  * @var ArrayImmoDBView
  */
  public $streams = array();

  /**
  * Detail configuration
  * @var ArrayImmoDBRoute
  */
  public $detail_routes = array();

  public function __construct(){

    // set defaut DEMO value
    $this->api_key        = '09702f24-a71e-4260-bd54-ca19217fd6a9';
    $this->account_id     = 'fb8dc8a8-6c92-42c5-b65d-2f28f755539b';
    $this->detail_routes  = array(
      new ImmoDBRoute('fr','proprietes/{{transation}}/{{location.region}}/{{location.city}}/{{id}}'),
      new ImmoDBRoute('en', 'listings/{{transation}}/{{location.region}}/{{location.city}}/{{id}}'),
    );

    $this->streams = array(
      new ImmoDBStream()
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

class ImmoDBStream {
  public $source = 'default';
  public $alias = 'default';
  public $limit = 0;
  public $filters = null;
  public $sort = 'auto';
}

class ImmoDBFilter {
  public $field = '';
  public $operator = '=';
  public $value = '';
}
