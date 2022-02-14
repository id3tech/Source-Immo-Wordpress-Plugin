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
    <h1  flex class="md-display-1">
      <div class="app-info" ng-if="!isInitializing()">
        <si-svg class="logo" src="~/styles/assets/logo.svg"></si-svg>
        Source.Immo <span class="version">v.<?php echo SI_VERSION?></span>
      </div>
    </h1>
    
    
    <div flex layout="row" layout-align="end center" ng-show="configs.registered && current_page=='home'">
      <md-button class="" ng-click="openStyleEditor()"><i class="fal fa-palette"></i> <lstr>Style editor</lstr></md-button> 
      
      <md-menu  ng-cloak>
        <md-button class="" ng-click="$mdMenu.open()"><md-icon class="fal fa-fw fa-user-circle"></md-icon> <span>{{user.info.name}}</span></md-button>
        <md-menu-content>
          <md-menu-item>
            <md-button ng-click="switchAccount()"><md-icon class="fal fa-people-arrows"></md-icon> <lstr>Connect to another account</lstr></md-button>
          </md-menu-item>
          
          
          <md-divider></md-divider>

          <md-menu-item>
            <md-button class="" ng-click="exportConfigs()"><md-icon class="fal fa-fw fa-download"></md-icon> <lstr>Export configurations</lstr></md-button>
          </md-menu-item>
          <md-menu-item>
            <md-button class="" ng-click="importConfigs()"><md-icon class="fal fa-fw fa-cloud-download"></md-icon> <lstr>Import configurations</lstr></md-button>
          </md-menu-item>

          <md-divider></md-divider>

          <md-menu-item>
            <md-button class="md-warn" ng-click="reset_all_configs()"><md-icon class="fal fa-fw fa-pump-soap"></md-icon> <lstr>Reset settings</lstr></md-button>
          </md-menu-item>
        </md-menu-content>
      </md-menu>
      
    </div>

  </div>

  <div class="loading-screen">
    <div class="loading-anim">
      <si-svg src="~/styles/assets/logo-anim.svg"></si-svg>
    </div>
    <div class="loading-message">
      <lstr>Loading</lstr> Source.Immo <span class="version">v.<?php echo SI_VERSION?></span>
    </div>
    <div class="loaded-components">
      <div class="comp-item" ng-repeat="item in loaded_components track by $index"><i class="fas fa-{{item}}"></i></div>
    </div>
  </div>

  <div class="page-viewport">
    <div class="page-container" style="{{pages[current_page].style}}">
    <?php
    SourceImmo::page('admin/configs/index','home');
    //SourceImmo::page('admin/lists/index','listEdit');
    ?>
    </div>
  </div>

  <script type="text/javascript">
    var wpSiApiSettings={
        locale: '<?php echo $lTwoLetterLocale ?>',
        base_path: '<?php echo SI_PLUGIN_URL ?>', 
        api_root: '<?php echo SI_API_HOST ?>', 
        app_version: '<?php echo SI_VERSION ?>',
        root:'<?php echo esc_url_raw( rest_url() ) ?>', 
        nonce: '<?php echo wp_create_nonce( 'wp_rest' ) ?>',
        si_user_account: <?php echo json_encode(SourceImmo::current()->get_account_user()); ?>
      };
  </script>
  
  <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment-with-locales.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
  
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
  <script src="<?php echo plugins_url( 'scripts/ngSortable.js' , SI_PLUGIN ) ?>"></script>
  <script src="<?php echo plugins_url( 'scripts/ang.prototype.js' , SI_PLUGIN ) ?>"></script>

  
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
  <script type="text/javascript">
  $locales.init('<?php echo($lTwoLetterLocale); ?>');
  </script>
  
  <script src="<?php echo plugins_url( 'scripts/ang.admin-app.min.js' , SI_PLUGIN ) ?>"></script>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.1/showdown.min.js"></script>
</div>
