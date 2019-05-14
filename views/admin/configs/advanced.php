<div class="advanced-settings">
    <div class="config-grid-block">
        <h2 class="md-headline"><?php _e('Information',IMMODB)?></h2>

        <div class="block-content" layout="column" layout-align="start stretch">
            <h4><i class="fas fa-server"></i> <?php _e('API Host',IMMODB)?></h4>
            <div><?php echo(IMMODB_API_HOST)?></div>
        </div>
    </div>

    <div class="config-grid-block">
        <h2 class="md-headline"><?php _e('Map',IMMODB)?></h2>
        <div class="block-content">
            <div layout="column" layout-align="start stretch">
                
                <md-input-container flex>
                    <label><?php _e('API key',IMMODB)?></label>
                    <input ng-model="configs.map_api_key" ng-model-options="{updateOn: 'blur'}" ng-change="save_configs()" />
                </md-input-container>

                <md-input-container class="no-error" flex>
                    <label><?php _e('Style',IMMODB)?></label>
                    <textarea ng-model="configs.map_style" rows="5" ng-model-options="{updateOn: 'blur'}" ng-change="save_configs()"></textarea>
                </md-input-container>
                <div>
                    <md-button href="https://mapstyle.withgoogle.com/" target="_blank"><md-icon class="fal fa-pen"></md-icon> <?php _e('Edit on Map Style',IMMODB)?></md-button>
                </div>
            </div>
        </div>
    </div>

    <div class="config-grid-block">
        <h2 class="md-headline"><?php _e('Mode',IMMODB)?></h2>
        <div class="block-content">
            <div layout="row" layout-align="start center">
                <md-input-container flex>
                    <label><?php _e('Deployment stage',IMMODB)?></label>
                    <md-select ng-model="configs.mode" ng-change="save_configs()">
                        <md-option value="DEV"><?php _e('Development (recommanded for configuration or testing step)',IMMODB)?></md-option>
                        <md-option value="PROD"><?php _e('Production',IMMODB)?></md-option>
                    </md-select>
                </md-input-container>
            </div>

            <div layout="row" layout-align="start center" ng-show="configs.mode=='DEV'">
                <md-input-container flex>
                    <label><?php _e('Form recipient',IMMODB) ?></label>
                    <input ng-model="configs.form_recipient" ng-model-options="{updateOn: 'blur'}" ng-change="save_configs()" />
                </md-input-container>
            </div>
        </div>
    </div>
</div>