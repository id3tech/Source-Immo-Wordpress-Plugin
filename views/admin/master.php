<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/angular_material/1.1.8/angular-material.min.css">

<div id="immodb-app" ng-app="ImmoDb" ng-controller="mainCtrl" ng-init="init()">
  <div layout="row" layout-align="space-between center">
    <h1 class="md-display-1">Immo DB <span class="version">v.<?php echo IMMODB_VERSION?></span></h1>


    <div layout="row" layout-align="end center">
      <md-button class="md-raised md-primary md-icon-button" ng-click="save_configs()" title="Save"><i class="fal fa-save fa-lg"></i></md-button>
      <md-button class="md-icon-button" ng-click="save_configs()"><i class="fal fa-undo fa-lg" title="Reset to demo settings"></i></md-button>
    </div>

  </div>
<?php
ImmoDB::view('admin/config');
?>
  <script type="text/javascript">
    var wpApiSettings={root:'<?php echo esc_url_raw( rest_url() ) ?>', nonce: '<?php echo wp_create_nonce( 'wp_rest' ) ?>'};
  </script>
  <!-- Angular Material requires Angular.js Libraries -->
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.min.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-animate.min.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-aria.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-route.min.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-messages.min.js"></script>

  <!-- Angular Material Library -->
  <script src="https://ajax.googleapis.com/ajax/libs/angular_material/1.1.8/angular-material.min.js"></script>
  <script src="<?php echo plugins_url( 'scripts/ang.admin-app.js' , IMMODB_PLUGIN ) ?>"></script>
  <script src="<?php echo plugins_url( 'scripts/ang.admin-ctrl.js' , IMMODB_PLUGIN ) ?>"></script>

</div>
