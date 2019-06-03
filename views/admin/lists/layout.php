<div class="layouts">
    <div class="layout" layout="column">
        <h4><?php _e('List',SI) ?></h4>
        <md-input-container>
            <label><?php _e('Model',SI) ?></label>
            <md-select ng-model="model.list_layout.preset">
                <md-option ng-repeat="item in global_list.list_layouts[model.type]" ng-value="item.name">{{item.label.translate()}}</md-option>
            </md-select>
        </md-input-container>
       
        
        <md-input-container >
            <label><?php _e('Element class',SI) ?></label>
            <input ng-model="model.list_layout.scope_class" />
        </md-input-container>

        <div  ng-show="model.list_layout.preset | isIn : ['standard','map']" 
            class="input-container" layout="row" layout-align="space-between center">
            <label><?php _e('Allow search',SI) ?></label>
            <md-checkbox ng-model="model.searchable"></md-checkbox>
        </div>

        <div  ng-show="model.list_layout.preset | isIn : ['standard','map']" 
            class="input-container" layout="row" layout-align="space-between center">
            <label><?php _e('Result page',SI) ?></label>
            <md-select ng-model="model.result_page">
                <md-option ng-repeat="item in wp_pages" value="{{item.ID}}" >{{item.post_title}}</md-option>
            </md-select>
        </div>

        <div ng-show="model.list_layout.preset | isIn : ['standard']" 
            class="input-container" layout="row" layout-align="space-between center">
            <label><?php _e('Allow sort',SI) ?></label>
            <md-checkbox ng-model="model.sortable"></md-checkbox>
        </div>

        <div ng-show="model.list_layout.preset | isIn : ['standard']" 
            class="input-container" layout="row" layout-align="space-between center">
            <label><?php _e('Allow map switch',SI) ?></label>
            <md-checkbox ng-model="model.mappable"></md-checkbox>
        </div>

        <div ng-show="(model.list_layout.preset | isIn : ['standard']) && (model.mappable)" 
            class="input-container" layout="row" layout-align="space-between center">
            <label><?php _e('Default zoom level',SI) ?></label>
            <md-select ng-model="model.default_zoom_level">
                <md-option value="auto"><?php _e('Automatic',SI) ?></md-option>
                <md-option value="20"><?php _e('Ground level',SI) ?></md-option>
                <md-option value="15"><?php _e('Street level',SI) ?></md-option>
                <md-option value="12"><?php _e('City level',SI) ?></md-option>
                <md-option value="10"><?php _e('Regional level',SI) ?></md-option>
                <md-option value="5"><?php _e('Continent level',SI) ?></md-option>
            </md-select>
        </div>
        
        <div ng-show="model.list_layout.preset | isIn : ['standard','direct']" 
            class="input-container" layout="row" layout-align="space-between center">
            <label><?php _e('Show list metadatas',SI) ?></label>
            <md-checkbox ng-model="model.show_list_meta"></md-checkbox>
        </div>

        <div class="custom {{ (model.list_layout.preset=='custom') ? 'editable' : '' }}">
            <si-layout-edit ng-model="model.list_custom_layout"></si-layout-edit>
        </div>
    </div>

    <div class="layout" layout="column">
        <h4><?php _e('List items',SI) ?></h4>
        <md-input-container>
            <label><?php _e('Model',SI) ?></label>
            <md-select ng-model="model.list_item_layout.preset">
                <md-option ng-repeat="item in global_list.list_item_layouts[model.type]" ng-value="item.name">{{item.label.translate()}}</md-option>
            </md-select>
        </md-input-container>
        
        <md-input-container ng-show="model.list_item_layout.preset!='custom'">
            <label><?php _e('Element class',SI) ?></label>
            <input ng-model="model.list_item_layout.scope_class" />
        </md-input-container>

        <div class="custom {{ (model.list_item_layout.preset=='custom') ? 'editable' : '' }}">
            <si-layout-edit ng-model="model.list_item_custom_layout"></si-layout-edit>
        </div>
    </div>
</div>