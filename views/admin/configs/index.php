
<?php ImmoDB::view('admin/configs/registration/index'); ?>


<div ng-cloak ng-show="configs.registered">
  <md-tabs md-dynamic-height md-border-bottom md-center-tabs>
    <md-tab>
      <md-tab-label><i class="fal fa-home"></i> <?php _e('Welcome',IMMODB)?></md-tab-label>
      <md-tab-body class="md-padding">
        <?php ImmoDB::view('admin/configs/basics') ?>
      </md-tab-body>
    </md-tab>

    <md-tab>
      <md-tab-label><i class="fal fa-link"></i> <?php _e('Permalinks',IMMODB)?></md-tab-label>
      <md-tab-body class="md-padding">
        <?php ImmoDB::view('admin/configs/permalinks') ?>
      </md-tab-body>
    </md-tab>


    <md-tab>
      <md-tab-label><i class="fal fa-list"></i> <?php _e('Lists',IMMODB)?></md-tab-label>
      <md-tab-body class="md-padding">
        <?php ImmoDB::view('admin/configs/lists') ?>
      </md-tab-body>
    </md-tab>

    <md-tab>
      <md-tab-label><i class="fal fa-info-square"></i> <?php _e('Details',IMMODB)?></md-tab-label>
      <md-tab-body class="md-padding">
        <?php ImmoDB::view('admin/configs/details') ?>
      </md-tab-body>
    </md-tab>

    <md-tab>
      <md-tab-label><i class="fal fa-wrench"></i> <?php _e('Advanced',IMMODB)?></md-tab-label>
      <md-tab-body class="md-padding">
        <?php ImmoDB::view('admin/configs/advanced') ?>
      </md-tab-body>
    </md-tab>
  </md-tabs>
</div>
<?php
  ImmoDB::dialog('admin/dialogs/signin','signin');
?>

