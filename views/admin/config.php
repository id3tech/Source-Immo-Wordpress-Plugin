<div ng-controller="configCtrl" ng-init="init()">
  <md-tabs md-dynamic-height md-border-bottom>
      <md-tab>
        <md-tab-label>General</md-tab-label>
        <md-tab-body class="md-padding">
          <?php ImmoDB::view('admin/general') ?>
        </md-tab-body>
      </md-tab>


      <md-tab>
        <md-tab-label>Views</md-tab-label>
        <md-tab-body class="md-padding">
          <?php ImmoDB::view('admin/views') ?>
        </md-tab-body>
      </md-tab>

      <md-tab>
        <md-tab-label>Layouts</md-tab-label>
        <md-tab-body class="md-padding">
          <?php ImmoDB::view('admin/layouts') ?>
        </md-tab-body>
      </md-tab>
    </md-tabs>
  </md-content>
</div>
