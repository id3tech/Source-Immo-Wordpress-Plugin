
<?php SourceImmo::view('admin/configs/registration/index'); ?>

<form autocomplete="off">
<div ng-cloak ng-show="configs.registered && message == null">
  <md-tabs md-dynamic-height md-border-bottom md-center-tabs>
    <md-tab>
      <md-tab-label><i class="fas fa-sign-in-alt"></i> <?php _e('Welcome',SI)?></md-tab-label>
      <md-tab-body class="md-padding">
        <?php SourceImmo::view('admin/configs/basics') ?>
      </md-tab-body>
    </md-tab>


    <md-tab>
      <md-tab-label><i class="fas fa-home"></i> <?php _e('Listings',SI)?></md-tab-label>
      <md-tab-body class="md-padding">
        <si-data-group-editor si-type="listings"></si-data-group-editor>
      </md-tab-body>
    </md-tab>

    <md-tab>
      <md-tab-label><i class="fas fa-city"></i> <?php _e('Cities',SI)?></md-tab-label>
      <md-tab-body class="md-padding">
        <si-data-group-editor si-type="cities"></si-data-group-editor>
      </md-tab-body>
    </md-tab>

    <md-tab>
      <md-tab-label><i class="fas fa-user"></i> <?php _e('Brokers',SI)?></md-tab-label>
      <md-tab-body class="md-padding">
        <si-data-group-editor si-type="brokers"></si-data-group-editor>
      </md-tab-body>
    </md-tab>


    <md-tab>
      <md-tab-label><i class="fas fa-building"></i> <?php _e('Offices',SI)?></md-tab-label>
      <md-tab-body class="md-padding">
        <si-data-group-editor si-type="offices"></si-data-group-editor>
      </md-tab-body>
    </md-tab>

    
    <md-tab>
      <md-tab-label><i class="fas fa-wrench"></i> <?php _e('Advanced',SI)?></md-tab-label>
      <md-tab-body class="md-padding">
        <?php SourceImmo::view('admin/configs/advanced') ?>
      </md-tab-body>
    </md-tab>
  </md-tabs>
</div>
</form>
<?php
  SourceImmo::dialog('admin/dialogs/signin','signin');
?>

