<?php 
$lTwoLetterLocale = substr(get_locale(),0,2);
if($lTwoLetterLocale == ''){
  $lTwoLetterLocal = 'fr';
}

?>
<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/angular_material/1.1.8/angular-material.min.css">


<div id="si-app" ng-app="siApplication" ng-controller="mainNetworkCtrl" ng-init="init()"
  class="{{isInitializing() ? 'warming-up' : 'ready'}}">
  <div class="app-header" layout="row" layout-align="space-between center">
    <h1  flex class="md-display-1">
      <div class="app-info" ng-if="!isInitializing()">
        <si-svg class="logo" src="~/styles/assets/logo.svg"></si-svg>
        Source.Immo - Network <span class="version">v.<?php echo SI_VERSION?></span>
      </div>
    </h1>

  </div>

  <div class="page-viewport">
    <div class="page-container" style="{{pages[current_page].style}}">
    <?php
    SourceImmo::page('admin/configs/network','home');
    ?>
    </div>
  </div>

  <script type="text/javascript">
    var wpSiApiSettings={
        locale: '<?php echo $lTwoLetterLocale ?>',
        base_path: '<?php echo SI_PLUGIN_URL ?>', 
        api_root: '<?php echo SI_API_HOST ?>', 
        root:'<?php echo esc_url_raw( rest_url() ) ?>', 
        nonce: '<?php echo wp_create_nonce( 'wp_rest' ) ?>'
      };
  </script>
  
  <!-- Angular Material requires Angular.js Libraries -->
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.min.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-animate.min.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-aria.min.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-route.min.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-messages.min.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-sanitize.min.js"></script>

  <!-- Angular Material Library -->
  <script src="https://ajax.googleapis.com/ajax/libs/angular_material/1.1.8/angular-material.min.js"></script>

  <script src="<?php echo plugins_url( 'scripts/tinyColor.min.js' , SI_PLUGIN ) ?>"></script>
  <script src="<?php echo plugins_url( 'scripts/mdColorPicker.min.js' , SI_PLUGIN ) ?>"></script>
  <script src="<?php echo plugins_url( 'scripts/ang.prototype.js' , SI_PLUGIN ) ?>"></script>
  <script type="text/javascript">
  $locales.init('<?php echo($lTwoLetterLocale); ?>');
  </script>
  <?php
  if($lTwoLetterLocale != 'en'){
  
      $locale_file_paths = apply_filters('si-locale-file-paths',array(SI_PLUGIN_DIR . 'scripts/locales/global.' . $lTwoLetterLocale . '.js'));
      
      foreach ($locale_file_paths as $filePath) {
        $fileUrl = SI_PLUGIN_URL . si_to_plugin_root($filePath);
        $fileVersion =filemtime($filePath);
        echo("<script src=\"{$fileUrl}?t={$fileVersion}\"></script>");
      }
  }
  ?>
  
  <script src="<?php echo plugins_url( 'scripts/ang.admin-app.min.js' , SI_PLUGIN ) ?>"></script>

</div>
