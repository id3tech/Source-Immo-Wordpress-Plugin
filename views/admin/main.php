<div ng-controller="mainConfigurationCtrl" ng-init="init()">
  <md-tabs md-dynamic-height md-border-bottom>
      <md-tab>
        <md-tab-label><?php _e('General',IMMODB)?></md-tab-label>
        <md-tab-body class="md-padding">
          <?php ImmoDB::view('admin/configs/general') ?>
        </md-tab-body>
      </md-tab>


      <md-tab>
        <md-tab-label><?php _e('Streams',IMMODB)?></md-tab-label>
        <md-tab-body class="md-padding">
          <?php ImmoDB::view('admin/configs/streams') ?>
        </md-tab-body>
      </md-tab>

      <md-tab>
        <md-tab-label><?php _e('Layouts',IMMODB)?></md-tab-label>
        <md-tab-body class="md-padding">
          <?php ImmoDB::view('admin/configs/layouts') ?>
        </md-tab-body>
      </md-tab>
    </md-tabs>
  </md-content>
</div>
<?php 
ImmoDB::dialog('admin/dialogs/streamEdit', 'streamEdit');
