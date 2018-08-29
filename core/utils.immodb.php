<?php
/**
* Debug utility class
*/
class Debug {
  public static function log(...$data){
    // TODO: add to log
  }

  /**
   * Show content of objects
   * @param ArrayObject $data List of object to display
   * @return null
   */
  public static function write(...$data){
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

  public static function force(...$data){
    ob_start();
    foreach ($data as $item) {
      echo('<pre>');
      var_dump($item);
      echo('</pre>');
    }
    $lResult = ob_get_contents();
		ob_end_clean();

    echo($lResult);
    exit;
  }
}

/**
 * String prototype utilities
 */
class StringPrototype{
  public static function format($format, ...$inputs){
    $result = $format;
    for ($i=0; $i < count($inputs); $i++) { 
      $result = str_replace('{' . $i . '}',$inputs[$i], $result);
    }
    return $result;
  }
}


/**
* Utility class for theme overriding of layout files
*/
class ThemeOverrides {

  /**
  * Search the file in the theme, under the plugin name directory.
  * @param string $file_path the path of the file
  * @param string $search_in Optional. Subpath in the theme's plugin name directory in which the search occurs. Default: empty
  * @param bool $fallback Optional. Search fallback in the theme's plugin name directory in case the search fail in subpath. Default: false
  * @return string Path of the theme file if found, original file path otherwise
  * @static
  */
  public static function search(string $file_path, $search_in = '', $fallback=false){
    
    $theme_dir = get_stylesheet_directory();
    $theme_plugin_dir = untrailingslashit($theme_dir)  . '/immodb';
    $theme_plugin_search_dir =  $theme_plugin_dir . '/' . $search_in;

    if(file_exists($theme_plugin_dir)){
        //$file_name = basename($file_path);
        $file_name = str_replace(IMMODB_PLUGIN_DIR . 'views/', '',$file_path);        
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

/**
 * Utility class for Http calls
 */
class HttpCall{
  const TIMEOUT = 800;
  public $endpoint = '';
  public $request_options = array();

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

  public function with_oauth(string $credentials){
    $this->request_options['CURLOPT_HTTPHEADER'] = array("auth_token: $credentials");
    return $this;
  }

  /**
  * Send a GET request to the endpoint
  * @param params : associative array of parameters to add to the query
  * @return string : result of the call
  */
  public function get(array $params=null, $as_json = false){
    if($params && count($params) > 0){
      $this->endpoint .= '?' . build_query($params);
    }
    $lCurlHandle = $this->_setup_curl(array_merge(array(
      'CURLOPT_HTTPGET' => true,
      'CURLINFO_HEADER_OUT' => true,
    ),$this->request_options));
    
    $lResult = curl_exec($lCurlHandle);
    $information = curl_getinfo($lCurlHandle);

    if($lResult===false){
      $this->_handle_error($lCurlHandle);
    } 

    curl_close($lCurlHandle);

    if($as_json){
      return json_decode($lResult);
    }
    
    return $lResult;
  }

  /**
  * Send a POST request to the endpoint
  * @param data : associative array of data to pass through
  * @return string : result of the call
  */
  public function post(array $data=null){

    $lCurlHandle = $this->_setup_curl(array_merge(array(
      'CURLOPT_POST' => true,
      'CURLOPT_POSTFIELDS' => json_encode($data),
      'CURLOPT_VERBOSE'     => 1
    ), $this->request_options));
    
    $lResult = curl_exec($lCurlHandle);
    curl_close($lCurlHandle);

    return $lResult;
  }

  /**
  * Setup the curl handle with basic preconfiguration
  * @param option : associative array of curl options
  */
  private function _setup_curl(array $options=null){
    $lCurlHandle = curl_init();
    curl_setopt($lCurlHandle, CURLOPT_URL, $this->endpoint);
    curl_setopt($lCurlHandle, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($lCurlHandle, CURLOPT_CONNECTTIMEOUT_MS, self::TIMEOUT);
    
    if($options){
      foreach ($options as $key => $value) {
        curl_setopt($lCurlHandle, constant($key), $value);
      }
    }

    return $lCurlHandle;
  }

  private function _setup_curl_oauth($handle){

    if($this->request_options[CURLOPT_HTTPHEADER]){
      foreach($this->request_options[CURLOPT_HTTPHEADER] as $key => $value){
        curl_setopt($handle, $key, $value);
      }
    }

  }

  private function _handle_error($curlHdl){
    Debug::write(curl_error($curlHdl));
  }

}
