<?php 
$lTwoLetterLocale = substr(get_locale(),0,2);
if($lTwoLetterLocale == ''){
  $lTwoLetterLocal = 'fr';
}

?>
<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/angular_material/1.1.8/angular-material.min.css">

<div id="immodb-app" ng-app="ImmoDb" ng-controller="mainCtrl" ng-init="init()">
  <div layout="row" layout-align="space-between center">
    <h1 class="md-display-1">Immo DB <span class="version">v.<?php echo IMMODB_VERSION?></span></h1>


    <div layout="row" layout-align="end center" ng-show="current_page=='home'">
      <md-button class="md-raised md-primary md-icon-button" ng-click="save_configs()" title="<?php _e('Save', IMMODB)?>"><i class="fal fa-save fa-lg"></i></md-button>
      <md-button class="md-icon-button" ng-click="reset_configs()"><i class="fal fa-undo fa-lg" title="<?php _e('Reset to demo settings', IMMODB)?>"></i></md-button>
    </div>

  </div>

  <div class="page-viewport">
    <div class="page-container" style="{{pages[current_page].style}}">
    <?php
    ImmoDB::page('admin/configs/index','home');
    ImmoDB::page('admin/lists/index','listEdit');
    ?>
    </div>
  </div>

  <script type="text/javascript">
    var wpApiSettings={
        locale: '<?php echo $lTwoLetterLocale ?>',
        base_path: '<?php echo IMMODB_PLUGIN_URL ?>', 
        api_root: '<?php echo IMMODB_API_HOST ?>', 
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

  <!-- Angular Material Library -->
  <script src="https://ajax.googleapis.com/ajax/libs/angular_material/1.1.8/angular-material.min.js"></script>

  <script src="<?php echo plugins_url( 'scripts/ang.prototype.js' , IMMODB_PLUGIN ) ?>"></script>
  <script type="text/javascript">
  $locales.init('<?php echo($lTwoLetterLocale); ?>');
  </script>
  <script src="<?php echo plugins_url( 'scripts/locales/global.' . $lTwoLetterLocale . '.js' , IMMODB_PLUGIN ) ?>"></script>
  
  <script src="<?php echo plugins_url( 'scripts/ang.admin-app.js' , IMMODB_PLUGIN ) ?>"></script>
  <script src="<?php echo plugins_url( 'scripts/ang.admin-ctrl.js' , IMMODB_PLUGIN ) ?>"></script>

</div>
