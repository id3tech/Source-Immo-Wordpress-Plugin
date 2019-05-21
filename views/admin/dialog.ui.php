<div style="visibility: hidden">
    <div class="md-dialog-container" 
            id="<?php echo($dialog_id)?>">
      <md-dialog ng-controller="<?php echo(str_replace('-', '_', $dialog_id) . 'Ctrl') ?>" ng-init="_dialogInit_()">
        <md-toolbar>
            <div class="md-toolbar-tools">
                <h2>{{title}}</h2>
                <span flex></span>
                <md-button class="md-icon-button" ng-click="cancel()">
                    <md-icon aria-label="Close dialog" class="fal fa-times"></md-icon>
                </md-button>
            </div>
        </md-toolbar>

        <md-dialog-content layout-padding>
            <?php SourceImmo::view($dialog_path); ?>
        </md-dialog-content>

        <md-dialog-actions layout="row">
            <span flex></span>
            <md-button ng-repeat="item in actions" ng-click="item.action()">{{item.label}}</md-button>
        </md-dialog-actions>
      </md-dialog>
    </div>
  </div>