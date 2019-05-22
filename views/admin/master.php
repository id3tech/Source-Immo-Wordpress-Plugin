<?php 
$lTwoLetterLocale = substr(get_locale(),0,2);
if($lTwoLetterLocale == ''){
  $lTwoLetterLocal = 'fr';
}

?>
<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/angular_material/1.1.8/angular-material.min.css">

<div id="si-app" ng-app="siApplication" ng-controller="mainCtrl" ng-init="init()"
  class="{{isInitializing() ? 'warming-up' : 'ready'}}">
  <div class="app-header" layout="row" layout-align="space-between center">
    <h1 class="md-display-1">
      <si-svg class="logo" src="~/styles/assets/logo.svg"></si-svg>
      Source.Immo <span class="version">v.<?php echo SI_VERSION?></span>
    </h1>
    
    
    <div layout="row" layout-align="end center" ng-show="configs.registered && current_page=='home'">
      <md-menu  ng-cloak>
        <md-button class="md-icon-button" ng-click="$mdMenu.open()"><md-icon class="fal fa-ellipsis-v"></md-icon></md-button>
        <md-menu-content>
          <md-menu-item>
            <md-button class="" ng-click="save_configs()"><i class="fal fa-save"></i> <?php _e('Save settings', SI)?></md-button>
          </md-menu-item>
          <md-menu-item>
          <md-button ng-click="clearAccessToken()"><i class="fal fa-eraser"></i> <?php _e('Clear access token',SI) ?></md-button>
          </md-menu-item>
          <md-menu-item>
            <md-button class="" ng-click="reset_configs()"><i class="fal fa-undo"></i> <?php _e('Reset to demo settings', SI)?></md-button>
          </md-menu-item>
        </md-menu-content>
      </md-menu>
      
    </div>

  </div>

  <div class="loading-screen">
    <div class="loading-anim">
      <si-svg src="~/styles/assets/logo-anim.svg"></si-svg>
    </div>
    <div class="loaded-components">
      <div class="comp-item" ng-repeat="item in loaded_components track by $index"><i class="fal fa-{{item}}"></i></div>
    </div>
  </div>

  <div class="page-viewport">
    <div class="page-container" style="{{pages[current_page].style}}">
    <?php
    SourceImmo::page('admin/configs/index','home');
    SourceImmo::page('admin/lists/index','listEdit');
    ?>
    </div>
  </div>

  <script type="text/javascript">
    var wpApiSettings={
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

  <!-- Angular Material Library -->
  <script src="https://ajax.googleapis.com/ajax/libs/angular_material/1.1.8/angular-material.min.js"></script>

  <script src="<?php echo plugins_url( 'scripts/ang.prototype.js' , SI_PLUGIN ) ?>"></script>
  <script type="text/javascript">
  $locales.init('<?php echo($lTwoLetterLocale); ?>');
  </script>
  <script src="<?php echo plugins_url( 'scripts/locales/global.' . $lTwoLetterLocale . '.js' , SI_PLUGIN ) ?>"></script>
  
  <script src="<?php echo plugins_url( 'scripts/ang.admin-app.min.js' , SI_PLUGIN ) ?>"></script>

</div>
