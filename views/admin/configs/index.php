
<?php SourceImmo::view('admin/configs/registration/index'); ?>

<form autocomplete="off">
<div ng-cloak ng-show="configs.registered">
  <md-tabs md-dynamic-height md-border-bottom md-center-tabs>
    <md-tab>
      <md-tab-label><i class="fal fa-home"></i> <?php _e('Welcome',SI)?></md-tab-label>
      <md-tab-body class="md-padding">
        <?php SourceImmo::view('admin/configs/basics') ?>
      </md-tab-body>
    </md-tab>

   

    <md-tab>
      <md-tab-label><i class="fal fa-list"></i> <?php _e('Lists',SI)?></md-tab-label>
      <md-tab-body class="md-padding">
        <?php SourceImmo::view('admin/configs/lists') ?>
      </md-tab-body>
    </md-tab>

    <md-tab>
      <md-tab-label><i class="fal fa-info-square"></i> <?php _e('Details',SI)?></md-tab-label>
      <md-tab-body class="md-padding">
        <?php SourceImmo::view('admin/configs/details') ?>
      </md-tab-body>
    </md-tab>

    <md-tab>
      <md-tab-label><i class="fal fa-link"></i> <?php _e('Permalinks',SI)?></md-tab-label>
      <md-tab-body class="md-padding">
        <?php SourceImmo::view('admin/configs/permalinks') ?>
      </md-tab-body>
    </md-tab>

    
    <md-tab>
      <md-tab-label><i class="fal fa-wrench"></i> <?php _e('Advanced',SI)?></md-tab-label>
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

