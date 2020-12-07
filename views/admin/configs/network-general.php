<div class="general-infos">
    <div class="welcome-message">
        <h1><?php _e('Welcome', SI) ?></h1>
        <p><?php _e('Thank you for using source.immo plugin for Worpress.', SI) ?></p>

        <p lstr>This plugin is used to display your real estate data. To manage the data, please visit the <a href="https://portal.source.immo" target="_blank">source.immo portal</a></p>
    </div>

    <div class="settings" layout-padding>
        <h3 lstr>Fill the next boxes to limit data bindings to a specific account.</h3>
        <div  layout="column" layout-align="start stretch" layout-padding>
            <md-input-container>
                <label lstr>Account ID</label>
                <input ng-model="networkConfigs.account_id" ng-model-options="{updateOn:'blur'}" ng-change="updateSettings()" />
            </md-input-container>

            <md-input-container>
                <label lstr>API Key</label>
                <input ng-model="networkConfigs.api_key" ng-model-options="{updateOn:'blur'}" ng-change="updateSettings()" />
            </md-input-container>
        </div>
    </div>
</div>