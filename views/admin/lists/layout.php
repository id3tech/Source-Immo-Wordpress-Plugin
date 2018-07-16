<div class="layouts">
    <div class="layout" layout="column">
        <h4><?php _e('List',IMMODB) ?></h4>
        <md-input-container>
            <label><?php _e('Model',IMMODB) ?></label>
            <md-select ng-model="model.list_layout.preset">
                <md-option ng-repeat="item in global_list.list_layouts" ng-value="item.name">{{item.label.translate()}}</md-option>
            </md-select>
        </md-input-container>
       
        
        <md-input-container >
            <label><?php _e('Element class',IMMODB) ?></label>
            <input ng-model="model.list_layout.scope_class" />
        </md-input-container>

        <div  ng-show="model.list_layout.preset | isIn : ['standard','map']" 
            class="input-container" layout="row" layout-align="space-between center">
            <label><?php _e('Allow search',IMMODB) ?></label>
            <md-checkbox ng-model="model.searchable" ng-disabled="model.limit.between(1,100)"></md-checkbox>
        </div>

        <div  ng-show="model.list_layout.preset | isIn : ['standard','map']" 
            class="input-container" layout="row" layout-align="space-between center">
            <label><?php _e('Result page',IMMODB) ?></label>
            <md-select ng-model="model.result_page">
                <md-option ng-repeat="item in wp_pages" value="{{item.ID}}" >{{item.post_title}}</md-option>
            </md-select>
        </div>

        <div ng-show="model.list_layout.preset | isIn : ['standard']" 
            class="input-container" layout="row" layout-align="space-between center">
            <label><?php _e('Allow sort',IMMODB) ?></label>
            <md-checkbox ng-model="model.sortable"></md-checkbox>
        </div>

        <div ng-show="model.list_layout.preset | isIn : ['standard']" 
            class="input-container" layout="row" layout-align="space-between center">
            <label><?php _e('Allow map switch',IMMODB) ?></label>
            <md-checkbox ng-model="model.mappable"></md-checkbox>
        </div>
        
        <div ng-show="model.list_layout.preset | isIn : ['standard','direct']" 
            class="input-container" layout="row" layout-align="space-between center">
            <label><?php _e('Show list metadatas',IMMODB) ?></label>
            <md-checkbox ng-model="model.show_list_meta"></md-checkbox>
        </div>

        <div class="custom {{ (model.list_layout.preset=='custom') ? 'editable' : '' }}">
            <immodb-layout-edit ng-model="model.list_custom_layout"></immodb-layout-edit>
        </div>
    </div>

    <div class="layout" layout="column">
        <h4><?php _e('List items',IMMODB) ?></h4>
        <md-input-container>
            <label><?php _e('Model',IMMODB) ?></label>
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