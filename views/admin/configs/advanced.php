<div class="advanced-settings">
    <div class="config-grid-block">
        <h2 class="md-headline"><?php _e('Authentication',IMMODB)?></h2>
        <div class="block-content">
            <div><i class="fas fa-server"></i> <?php echo(IMMODB_API_HOST)?></div>

            <div layout="row" layout-align="start center" layout-padding>
                <md-input-container flex>
                    <label><?php _e('API key',IMMODB)?></label>
                    <input ng-model="configs.api_key" required />
                </md-input-container>

                <md-input-container flex>
                    <label><?php _e('Account ID',IMMODB)?></label>
                    <input ng-model="configs.account_id" required />
                </md-input-container>

                <md-input-container flex>
                    <label><?php _e('Map API key',IMMODB)?></label>
                    <input ng-model="configs.map_api_key" />
                </md-input-container>
            </div>

            <md-button ng-click="clearAccessToken()"><?php _e('Clear access token cache',IMMODB) ?></md-button>
            
        </div>
        
    </div>

    <div class="config-grid-block">
        <h2 class="md-headline"><?php _e('Mode',IMMODB)?></h2>
        <div class="block-content">
            <div layout="row" layout-align="start center" layout-padding>
                <md-input-container flex>
                    <label><?php _e('Deployment stage',IMMODB)?></label>
                    <md-select ng-model="configs.mode">
                        <md-option value="DEV"><?php _e('Development (recommanded for configuration or testing step)',IMMODB)?></md-option>
                        <md-option value="PROD"><?php _e('Production',IMMODB)?></md-option>
                    </md-select>
                </md-input-container>
            </div>

            <div layout="row" layout-align="start center" layout-padding ng-show="configs.mode=='DEV'">
                <md-input-container flex>
                    <label><?php _e('Form recipient',IMMODB) ?></label>
                    <input ng-model="configs.form_recipient" />
                </md-input-container>
            </div>
        </div>
    </div>
</div>