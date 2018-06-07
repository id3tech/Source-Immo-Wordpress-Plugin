<?php
/**
* Debug utility class
*/
class Debug {
  public static function log(...$data){
    // TODO: add to log
  }

  public static function write(...$data){
    ob_start();
    foreach ($data as $item) {
      var_dump($item);
    }
    $lResult = ob_get_contents();
		ob_end_clean();

		echo($lResult);
		return $lResult;
  }

  public static function print(...$data){
    ob_start();

    foreach ($data as $item) {
      echo('<pre>');
      var_dump($item);
      echo('</pre>');
    }

    $lResult = ob_get_contents();
		ob_end_clean();

		echo($lResult);
		return $lResult;
  }
}

/**
* Utility class for theme overriding of layout files
*/
class ThemeOverrides {

  /**
  * Search the file in the theme, under the plugin name directory.
  * @param file_path : the path of the file
  * @param search_in : Optional. Subpath in the theme's plugin name directory in which the search occurs. Default: empty
  * @param fallback : Optional. Search fallback in the theme's plugin name directory in case the search fail in subpath. Default: false
  * @return String : Return the theme file if found, original file path otherwise
  */
  public static function search(string $file_path, $search_in = '', $fallback=false){
    $theme_dir = get_template_directory();
    $theme_plugin_dir = $theme_dir  . '/immodb';
    $theme_plugin_search_dir =  $theme_plugin_dir . '/' . $search_in;
    if(file_exists($theme_plugin_dir)){
        $file_name = basename($file_path);
        if(file_exists($theme_plugin_search_dir . '/' . $file_name)){
          return $theme_plugin_search_dir . '/' . $file_name;
        }
        // file not found in the searched directory, fallback in the root but only if you said so
        else if($fallback && file_exists($theme_plugin_dir . '/' . $file_name)){
          return $theme_plugin_dir . '/' . $file_name;
        }
    }

    // return original file path
    return $file_path;
  }
}

class HttpCall{
  const TIMEOUT = 800;
  public $endpoint = '';

  /**
  * Entry point to the class
  * @param endpoint_parts : list of string that make the path to the call
  * @static
  */
  public static function to(string ...$endpoint_parts){
    $lInstance = new HttpCall();

    $lInstance->endpoint = implode($endpoint_parts, '/');
    $lInstance->endpoint = str_replace('~', ImmoDB::API_HOST . '/api', $lInstance->endpoint);

    return $lInstance;
  }

  public function __construct(){

  }

  /**
  * Send a GET request to the endpoint
  * @param params : associative array of parameters to add to the query
  * @return string : result of the call
  */
  public function get(array $params=null){
    if($params && count($params) > 0){
      $this->endpoint .= '?' . build_query($params);
    }
    $lCurlHandle = $this->_setup_curl();
    $lResult = curl_exec($lCurlHandle);

    if($lResult===false){
      $this->_handle_error($lCurlHandle);
    }

    return $lResult;
  }

  /**
  * Send a POST request to the endpoint
  * @param data : associative array of data to pass through
  * @return string : result of the call
  */
  public function post(array $data=null){

    $lCurlHandle = $this->_setup_curl(array(
      CURLOPT_POST => true,
      CURLOPT_POSTFIELDS => json_encode($data),
    ));

    $lResult = curl_exec($lCurlHandle);

    return $lResult;
  }

  /**
  * Setup the curl handle with basic preconfiguration
  * @param option : associative array of curl options
  */
  private function _setup_curl(array $options=null){
    $lCurlHandle = curl_init();
    curl_setopt($lCurlHandle, CURLOPT_URL, $this->endpoint);
    curl_setopt($lCurlHandle, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($lCurlHandle, CURLOPT_CONNECTTIMEOUT_MS, self::TIMEOUT);

    if($options){
      foreach ($options as $key => $value) {
        curl_setopt($lCurlHandle, $key, $value);
      }
    }

    return $lCurlHandle;
  }

  private function _handle_error($curlHdl){
    Debug::print(curl_error($curlHdl));
  }

}
