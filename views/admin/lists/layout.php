<div class="layouts">
    <div class="layout" layout="column">
        <div layout="row" layout-align="space-between center">
            <h4><?php _e('List layout',IMMODB) ?></h4>

            <md-select ng-model="model.list_layout">
                <md-option ng-repeat="item in global_list.list_layouts" ng-value="item.name">{{item.label.translate()}}</md-option>
            </md-select>
        </div>
        <div class="custom {{ (model.list_layout=='custom') ? 'editable' : '' }}">
            <immodb-layout-edit ng-model="model.list_custom_layout"></immodb-layout-edit>
        </div>
    </div>

    <div class="layout" layout="column">
        <div layout="row" layout-align="space-between center">
            <h4><?php _e('List items layout',IMMODB) ?></h4>
            <md-select ng-model="model.list_item_layout">
                <md-option ng-repeat="item in global_list.list_item_layouts" ng-value="item.name">{{item.label.translate()}}</md-option>
            </md-select>
        </div>
        <div class="custom {{ (model.list_item_layout=='custom') ? 'editable' : '' }}">
            <immodb-layout-edit ng-model="model.list_item_custom_layout"></immodb-layout-edit>
        </div>
    </div>
</div>