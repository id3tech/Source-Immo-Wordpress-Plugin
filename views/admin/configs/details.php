
<h2 class="md-headline"><?php _e('Listings',SI)?></h2>

<div class="layout-container">
    
    <div class="layout-item" ng-repeat="layout in configs.listing_layouts">
        <h4>{{lang_codes[layout.lang]}}</h4>
        <md-input-container>
            <label><?php _e('Layout', SI) ?></label>
            <md-select ng-model="layout.type" ng-change="save_configs()">
                <md-option ng-repeat="item in global_list.detail_layouts" value="{{item.name}}">{{item.label.translate()}}</md-option>
            </md-select>
        </md-input-container>

        <md-input-container ng-show="layout.type=='custom_page'">
            <label><?php _e('Layout page', SI) ?></label>
            <md-select ng-model="layout.page" ng-change="save_configs()">
                <md-option ng-repeat="item in wp_pages[layout.lang]" value="{{item.ID}}">{{item.post_title}}</md-option>
            </md-select>
        </md-input-container>

        <div ng-show="layout.type=='standard'" layout="column" layout-align="start stretch">
            <?php include "communication.php" ?>
        </div>
    </div>
</div>

<h2 class="md-headline"><?php _e('Brokers',SI)?></h2>
<div class="layout-container">
    <div class="layout-item" ng-repeat="layout in configs.broker_layouts">
        <h4>{{lang_codes[layout.lang]}}</h4>
        <md-input-container>
            <label><?php _e('Layout', SI) ?></label>
            <md-select ng-model="layout.type" ng-change="save_configs()">
                <md-option ng-repeat="item in global_list.detail_layouts" value="{{item.name}}">{{item.label.translate()}}</md-option>
            </md-select>
        </md-input-container>

        <md-input-container ng-show="layout.type=='custom_page'">
            <label><?php _e('Layout page', SI) ?></label>
            <md-select ng-model="layout.page" ng-change="save_configs()">
                <md-option ng-repeat="item in wp_pages[layout.lang]" value="{{item.ID}}">{{item.post_title}}</md-option>
            </md-select>
        </md-input-container>

        
        <div ng-show="layout.type=='standard'" layout="column" layout-align="start stretch">
            <?php include "communication.php" ?>
        </div>
    </div>
</div>

