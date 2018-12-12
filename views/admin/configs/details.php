<div class="config-grid-block">
    <h2 class="md-headline"><?php _e('Data source',IMMODB)?></h2>
    <div class="block-content" layout="column" layout-align="start stretch" layout-padding>
        <md-input-container>
            <label><?php _e('Default data view', IMMODB) ?></label>
            <md-select ng-model="configs.default_view">
                <md-option ng-repeat="item in data_views" value="{{item}}">{{item.name}} ({{item.id}})</md-option>
            </md-select>
        </md-input-container>
    </div>
</div>

<div class="config-grid-block">
    <h2 class="md-headline"><?php _e('Listings',IMMODB)?></h2>
    <div class="block-content layout-container">
        
        <div class="layout-item" ng-repeat="layout in configs.listing_layouts">
            <h4>{{lang_codes[layout.lang]}}</h4>
            <md-input-container>
                <label><?php _e('Layout', IMMODB) ?></label>
                <md-select ng-model="layout.type">
                    <md-option ng-repeat="item in global_list.detail_layouts" value="{{item.name}}">{{item.label.translate()}}</md-option>
                </md-select>
            </md-input-container>

            <md-input-container ng-show="layout.type=='custom_page'">
                <label><?php _e('Layout page', IMMODB) ?></label>
                <md-select ng-model="layout.page">
                    <md-option ng-repeat="item in wp_pages[layout.lang]" value="{{item.ID}}">{{item.post_title}}</md-option>
                </md-select>
            </md-input-container>
        </div>
    </div>
</div>

<div class="config-grid-block">
    <h2 class="md-headline"><?php _e('Brokers',IMMODB)?></h2>
    <div class="block-content layout-container">
        <div class="layout-item" ng-repeat="layout in configs.broker_layouts">
            <h4>{{lang_codes[layout.lang]}}</h4>
            <md-input-container>
                <label><?php _e('Layout', IMMODB) ?></label>
                <md-select ng-model="layout.type">
                    <md-option ng-repeat="item in global_list.detail_layouts" value="{{item.name}}">{{item.label.translate()}}</md-option>
                </md-select>
            </md-input-container>

            <md-input-container ng-show="layout.type=='custom_page'">
                <label><?php _e('Layout page', IMMODB) ?></label>
                <md-select ng-model="layout.page">
                    <md-option ng-repeat="item in wp_pages[layout.lang]" value="{{item.ID}}">{{item.post_title}}</md-option>
                </md-select>
            </md-input-container>
        </div>
    </div>
</div>

