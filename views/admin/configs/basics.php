<div class="basics-settings">
    <div class="message">
        <h1><?php _e('Welcome', SI) ?></h1>
        <p><?php _e('Thank you for using source.immo plugin for Worpress.', SI) ?></p>
        <p><?php _e('To stay inform on our features and future developments, visit our blogs at', SI) ?> <a href="//blog.source.immo" target="_blank">blog.source.immo</a></p>

        <md-button class="md-raised md-primary" ng-click="signout()"><?php _e('Sign out',SI) ?></md-button>
    </div>

    <div>
        <h2 class="md-headline"><?php _e('Authentication',SI)?></h2>
        <div>
            <div layout="column" layout-align="start stretch">
                <md-input-container flex ng-show="api_keys == null">
                    <label><?php _e('API key',SI)?></label>
                    <input ng-model="configs.api_key" ng-model-options="{updateOn: 'blur'}" ng-change="save_configs()" required disabled/>
                    <md-icon class="fal fa-pen" ng-click="changeApiKey()" title="{{'Change the API key'.translate()}}"></md-icon>
                </md-input-container>

                <md-input-container flex ng-show="api_keys != null">
                    <label><?php _e('API key',SI)?></label>
                    <md-select ng-model="configs.api_key" ng-change="save_configs()">
                        <md-option ng-repeat="item in api_keys" ng-value="item.id">{{item.name}}</md-option>
                    </md-select>
                </md-input-container>

                <md-input-container flex>
                    <label><?php _e('Account ID',SI)?></label>
                    <input ng-model="configs.account_id" ng-model-options="{updateOn: 'blur'}" ng-change="save_configs()" required disabled />
                </md-input-container>
            </div>
        </div>

        <h2 class="md-headline"><?php _e('Data source',SI)?></h2>
        <div layout="column" layout-align="start stretch">
            <md-input-container>
                <label><?php _e('Default data view', SI) ?></label>
                <md-select ng-model="configs.default_view" ng-change="save_configs()">
                    <md-option ng-repeat="item in data_views" value="{{item.id}}">{{item.name}}</md-option>
                </md-select>
            </md-input-container>
        </div>
    </div>
   
</div>