<div class="advanced-settings">
    <div class="config-grid-block">
        <h2 class="md-headline"><?php _e('Information',SI)?></h2>

        <div class="block-content" layout="column" layout-align="start stretch">
            <h4><i class="fas fa-server"></i> <?php _e('API Host',SI)?></h4>
            <div><?php echo(SI_API_HOST)?></div>
        </div>
    </div>

    <div class="config-grid-block">
        <h2 class="md-headline"><?php _e('Map',SI)?></h2>
        <div class="block-content">
            <div layout="column" layout-align="start stretch">
                
                <md-input-container flex>
                    <label><?php _e('API key',SI)?></label>
                    <input ng-model="configs.map_api_key" ng-model-options="{updateOn: 'blur'}" ng-change="save_configs()" />
                </md-input-container>

                <md-input-container class="no-error" flex>
                    <label><?php _e('Style',SI)?></label>
                    <textarea ng-model="configs.map_style" rows="5" ng-model-options="{updateOn: 'blur'}" ng-change="save_configs()"></textarea>
                </md-input-container>
                <div>
                    <md-button href="https://mapstyle.withgoogle.com/" target="_blank"><md-icon class="fal fa-pen"></md-icon> <?php _e('Edit on Map Style',SI)?></md-button>
                </div>
            </div>
        </div>
    </div>

    <div class="config-grid-block">
        <h2 class="md-headline"><?php _e('Mode',SI)?></h2>
        <div class="block-content">
            <div layout="row" layout-align="start center">
                <md-input-container flex>
                    <label><?php _e('Deployment stage',SI)?></label>
                    <md-select ng-model="configs.mode" ng-change="save_configs()">
                        <md-option value="DEV"><?php _e('Development (recommanded for configuration or testing step)',SI)?></md-option>
                        <md-option value="PROD"><?php _e('Production',SI)?></md-option>
                    </md-select>
                </md-input-container>
            </div>

            <div layout="row" layout-align="start center" ng-show="configs.mode=='DEV'">
                <md-input-container flex>
                    <label><?php _e('Form recipient',SI) ?></label>
                    <input ng-model="configs.form_recipient" ng-model-options="{updateOn: 'blur'}" ng-change="save_configs()" />
                </md-input-container>
            </div>

            <div layout="row" layout-align="start center">
                <md-input-container flex>
                    <label><?php _e('Prefetch data server side to allow api call caching',SI) ?></label>
                    <md-select ng-model="configs.prefetch_data" ng-model-options="{updateOn: 'blur'}" ng-change="save_configs()">
                        <md-option value="true"><?php _e('Yes',SI) ?></md-option>
                        <md-option value="false"><?php _e('No',SI) ?></md-option>
                    </md-select>
                </md-input-container>
            </div>
        </div>
    </div>
</div>