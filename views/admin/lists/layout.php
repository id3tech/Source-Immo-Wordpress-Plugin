<div class="layouts">
    <div class="layout" layout="column">
        <md-input-container>
            <label><?php _e('List layout',IMMODB) ?></label>
            <md-select ng-model="model.list_layout.preset">
                <md-option ng-repeat="item in global_list.list_layouts" ng-value="item.name">{{item.label.translate()}}</md-option>
            </md-select>
        </md-input-container>
       
        <md-input-container ng-show="model.list_layout.preset!='custom'">
            <label><?php _e('Element class',IMMODB) ?></label>
            <input ng-model="model.list_layout.scope_class" />
        </md-input-container>

        <div class="custom {{ (model.list_layout.preset=='custom') ? 'editable' : '' }}">
            <immodb-layout-edit ng-model="model.list_custom_layout"></immodb-layout-edit>
        </div>
    </div>

    <div class="layout" layout="column">
        <md-input-container>
            <label><?php _e('List items layout',IMMODB) ?></label>
            <md-select ng-model="model.list_item_layout.preset">
                <md-option ng-repeat="item in global_list.list_item_layouts" ng-value="item.name">{{item.label.translate()}}</md-option>
            </md-select>
        </md-input-container>
        
        <md-input-container ng-show="model.list_item_layout.preset!='custom'">
            <label><?php _e('Element class',IMMODB) ?></label>
            <input ng-model="model.list_item_layout.scope_class" />
        </md-input-container>

        <div class="custom {{ (model.list_item_layout.preset=='custom') ? 'editable' : '' }}">
            <immodb-layout-edit ng-model="model.list_item_custom_layout"></immodb-layout-edit>
        </div>
    </div>
</div>