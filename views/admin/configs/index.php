
<md-tabs md-dynamic-height md-border-bottom>
  <md-tab>
    <md-tab-label><?php _e('General',IMMODB)?></md-tab-label>
    <md-tab-body class="md-padding">
      <?php ImmoDB::view('admin/configs/general') ?>
    </md-tab-body>
  </md-tab>


  <md-tab>
    <md-tab-label><?php _e('Lists',IMMODB)?></md-tab-label>
    <md-tab-body class="md-padding">
      <?php ImmoDB::view('admin/configs/lists') ?>
    </md-tab-body>
  </md-tab>

  <md-tab>
    <md-tab-label><?php _e('Details',IMMODB)?></md-tab-label>
    <md-tab-body class="md-padding">
      <?php ImmoDB::view('admin/configs/details') ?>
    </md-tab-body>
  </md-tab>

  <md-tab>
    <md-tab-label><?php _e('Advanced',IMMODB)?></md-tab-label>
    <md-tab-body class="md-padding">
      <?php ImmoDB::view('admin/configs/advanced') ?>
    </md-tab-body>
  </md-tab>
</md-tabs>

