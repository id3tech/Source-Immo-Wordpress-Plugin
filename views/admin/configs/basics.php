<div class="basics-settings">
    <div class="message">
        <h1><?php _e('Welcome', IMMODB) ?></h1>
        <p><?php _e('Thank you for using source.immo plugin for Worpress.', IMMODB) ?></p>
        <p><?php _e('To stay inform on our features and future developments, visit our blogs at', IMMODB) ?> <a href="//blog.source.immo" target="_blank">blog.source.immo</a></p>

        <md-button class="md-raised md-primary" ng-click="signout()"><?php _e('Sign out',IMMODB) ?></md-button>
    </div>

    <div>
        <h2 class="md-headline"><?php _e('Authentication',IMMODB)?></h2>
        <div>
            <div layout="column" layout-align="start stretch">
                <md-input-container flex>
                    <label><?php _e('API key',IMMODB)?></label>
                    <input ng-model="configs.api_key" ng-model-options="{updateOn: 'blur'}" ng-change="save_configs()" required/>
                </md-input-container>

                <md-input-container flex>
                    <label><?php _e('Account ID',IMMODB)?></label>
                    <input ng-model="configs.account_id" ng-model-options="{updateOn: 'blur'}" ng-change="save_configs()" required />
                </md-input-container>
            </div>
        </div>

        <h2 class="md-headline"><?php _e('Data source',IMMODB)?></h2>
        <div layout="column" layout-align="start stretch">
            <md-input-container>
                <label><?php _e('Default data view', IMMODB) ?></label>
                <md-select ng-model="configs.default_view" ng-change="save_configs()">
                    <md-option ng-repeat="item in data_views" value="{{item.id}}">{{item.name}}</md-option>
                </md-select>
            </md-input-container>
        </div>
    </div>
   
</div>