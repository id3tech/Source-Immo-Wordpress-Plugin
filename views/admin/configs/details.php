<div class="config-grid-block">
    <h2 class="md-headline"><?php _e('Data source',IMMODB)?></h2>
    <div class="block-content" layout="column" layout-align="start stretch" layout-padding>
        <md-input-container>
            <label><?php _e('Default data view', IMMODB) ?></label>
            <md-select ng-model="configs.default_view">
                <md-option ng-repeat="item in data_views" value="{{item}}">{{item.name}}</md-option>
            </md-select>
        </md-input-container>
    </div>
</div>

<div class="config-grid-block">
    <h2 class="md-headline"><?php _e('Listings',IMMODB)?></h2>
    <div class="block-content" layout="column" layout-align="start stretch" layout-padding>
        <md-input-container>
            <label><?php _e('Layout', IMMODB) ?></label>
            <md-select ng-model="configs.listing_layout">
                <md-option ng-repeat="item in global_list.detail_layouts" value="{{item.name}}">{{item.label.translate()}}</md-option>
            </md-select>
        </md-input-container>

        <md-input-container ng-show="configs.listing_layout=='custom_page'">
            <label><?php _e('Layout page', IMMODB) ?></label>
            <md-select ng-model="configs.listing_layout_page">
                <md-option ng-repeat="item in wp_pages" value="{{item.ID}}">{{item.post_title}}</md-option>
            </md-select>
        </md-input-container>
    </div>
</div>

