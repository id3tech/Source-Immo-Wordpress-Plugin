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

class Moment {
  public static function time_ago($datetime, $full = false) {
    $now = new DateTime;
    $ago = new DateTime($datetime);
    $diff = $now->diff($ago);
    //Debug::write($ago);
    $diff->w = floor($diff->d / 7);
    $diff->d -= $diff->w * 7;
    if($diff->h > 12){
      $diff->d += 1;
    }
    $string = array(
        'y' => 'year',
        'm' => 'month',
        'w' => 'week',
        'd' => 'day',
        'h' => 'hour',
        'i' => 'minute',
        's' => 'second',
    );

    foreach ($string as $k => &$v) {
        if ($diff->$k) {
            $label = __($v,IMMODB) . ($diff->$k > 1 ? 's' : '');

            $v = $diff->$k . ' ' . str_replace('ss','s', $label);
        } else {
            unset($string[$k]);
        }
    }

    if (!$full) $string = array_slice($string, 0, 1);
    if($string){
      if($diff->invert==0){
        return __('in', IMMODB) . ' ' . implode(', ', $string);
      }
      else{
        return implode(', ', $string) . ' ago';
      }
    }
    else{
      return 'just now';
    }

    
  }
}

/**
 * Utility class for Http calls
 */
class HttpCall{
  const TIMEOUT = 10000;
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
  public function post(array $data=null, $as_json = false){
    $data_string = json_encode($data);
    $lCurlHandle = $this->_setup_curl(array_merge(array(
      'CURLOPT_POST' => true,
      'CURLOPT_HTTPHEADER' => array(                                                                          
        'Content-Type: application/json',                                                                                
        'Content-Length: ' . strlen($data_string)                                                                       
      ),
      'CURLOPT_POSTFIELDS' => $data_string,
      'CURLOPT_VERBOSE'     => 1
    ), $this->request_options));
    
    $lResult = curl_exec($lCurlHandle);
    curl_close($lCurlHandle);
    
    if($as_json){
      return json_decode($lResult);
    }

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
    //Debug::write(curl_error($curlHdl));
  }

}


if(false){
/**
 * fPdf wrapper class
 */
define('FPDF_FONTPATH',IMMODB_PLUGIN_DIR . '/modules/font');
require(IMMODB_PLUGIN_DIR . '/modules/fpdf.php');
class PDFBuilder extends FPDF{

  private $globalFont;
  private $currentFont;

  private $titleMeasures = array(
    '1' => array('size'=>50, 'family'=>'Poppins', 'style' => 'B'),
    '2' => array('size'=>40, 'family'=>'Poppins', 'style' => 'B'),
    '3' => array('size'=>30, 'family'=>'Poppins', 'style' => 'B'),
    '4' => array('size'=>24, 'family'=>'Poppins', 'style' => ''),
    '5' => array('size'=>18, 'family'=>'Poppins', 'style' => '')
  );

  public function __construct($orientation, $globalFont, $unit = 'mm', $size='A4'){
    
    parent::__construct($orientation, $unit, $size);
    $this->SetMargins(20,20,20,20);
    $this->AddFont('OpenSans','','opensans.php');
    $this->AddFont('Poppins','','poppins.php');
    $this->applyFont($globalFont);
    $this->resetDrawStyle();
  }

  public function applyFont($font){
    $this->globalFont = $font;
    $this->currentFont = $font;
    $this->SetFont($font['family'],$font['style'],$font['size']);
  }

  public function pageColumn($prop){
    return $this->GetPageWidth() * $prop;
  }

  public function pageRow($prop){
    return $this->GetPageHeight() * $prop;
  }

  public function withFont($size, $style=null, $family=null){
    if($family == null) {
      $family = $this->globalFont['family'];
    }

    if($style == null) {
      $style = $this->globalFont['style'];
    }
    $this->currentFont = array('family'=>$family, 'style'=>$style, 'size'=>$size);

    $this->SetFont($family,$style,$size);
    return $this;
  }

  public function forTitle($size){
    $h = $this->titleMeasures[$size];

    return $this->withFont($h['size'],$h['style'],$h['family']);
  }

  public function at($x, $y){
    $this->SetXY($x, $y);
    return $this;
  }

  public function moveBy($x,$y){
    $this->SetXY($this->GetX() + $x, $this->GetY() + $y);
    return $this;
  }

  public function addText($text, $w=0,$h=0, $textColor=null,$align=''){
    if($textColor!=null){
      $color = $this->hexToRgb($textColor);
      $this->SetTextColor($color['r'],$color['g'],$color['b']);
    }

    //$text = iconv(mb_detect_encoding($text, mb_detect_order(), true), "UTF-8", $text);
    if(mb_detect_encoding($text) == 'UTF-8'){
      $text = utf8_decode($text);
    }

    if($h==0){
      $h = $this->currentFont['size'] * 0.3;
    }

    if($w > 0){
      $w = min($this->GetX() + $w, $this->GetPageWidth() - $this->GetX());
    }
    $maxW = max($w,  $this->GetPageWidth() - $this->GetX());
    
    if($this->GetStringWidth($text) > $maxW){
      $this->MultiCell($w,$h, $text,0,$align);
    }
    else{
      $this->Cell($w,$h, $text,0,2,$align);
    }
    

    $this->resetDrawStyle();
    return $this;
  }

  // public function addMultiLineText($text, $w=0,$h=0, $textColor=null){
  //   if($textColor!=null){
  //     $color = $this->hexToRgb($textColor);
  //     $this->SetTextColor($color['r'],$color['g'],$color['b']);
  //   }

  //   //$text = iconv(mb_detect_encoding($text, mb_detect_order(), true), "UTF-8", $text);
  //   if(mb_detect_encoding($text) == 'UTF-8'){
  //     $text = utf8_decode($text);
  //   }
  //   $this->MultiCell($w,$h, $text,0,2);

  //   $this->resetDrawStyle();
  //   return $this;
  // }


  public function drawRectangle($x,$y,$width, $height, $fillColor=null, $borderColor=null, $borderWidth=0){
    $style = 'D';
    if($fillColor!=null){
      $color = $this->hexToRgb($fillColor);
      $this->SetFillColor($color['r'],$color['g'],$color['b']);
      $style .= 'F';
    }

    if($borderColor!=null){
      $color = $this->hexToRgb($borderColor);
      $this->SetDrawColor($color['r'],$color['g'],$color['b']);
      if($borderWidth == 0){
        $borderWidth = 1;
      }
    }

    $this->SetLineWidth($borderWidth);

    $this->Rect($x,$y,$width,$height,$style);

    $this->resetDrawStyle();
  }

  public function resetDrawStyle(){
    $textDefaultColor = $this->hexToRgb('#333');
    $this->SetLineWidth(0);
    $this->SetDrawColor(255,255,255);
    $this->SetFillColor(255,255,255);
    $this->SetTextColor($textDefaultColor['r'],$textDefaultColor['g'],$textDefaultColor['b']);
    $this->SetFont($this->globalFont['family'], $this->globalFont['style'], $this->globalFont['size']);
  }

  public function render(){
    $this->output('I','listing.pdf',true);
  }

  public function hexToRgb($hex, $alpha = false) {
    $hex      = str_replace('#', '', $hex);
    $length   = strlen($hex);
    $rgb['r'] = hexdec($length == 6 ? substr($hex, 0, 2) : ($length == 3 ? str_repeat(substr($hex, 0, 1), 2) : 0));
    $rgb['g'] = hexdec($length == 6 ? substr($hex, 2, 2) : ($length == 3 ? str_repeat(substr($hex, 1, 1), 2) : 0));
    $rgb['b'] = hexdec($length == 6 ? substr($hex, 4, 2) : ($length == 3 ? str_repeat(substr($hex, 2, 1), 2) : 0));
    if ( $alpha ) {
       $rgb['a'] = $alpha;
    }
    return $rgb;
 }
}
}
