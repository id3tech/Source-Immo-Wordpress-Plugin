<div class="advanced-settings">
    
    <div class="config-grid-block">
        <h2 class="md-headline"><?php _e('Information',SI)?></h2>

        <div class="block-content" layout="row" layout-align="space-between center">
            
            <div layout="column" layout-align="start stretch">
                <h4><i class="fas fa-user-circle"></i> <?php _e('Account ID',SI)?></h4>
                <div>{{configs.account_id}}</div>
            </div>
            <div layout="column" layout-align="start stretch">
                <h4><i class="fas fa-key"></i> <?php _e('API key',SI)?></h4>
                <div>{{configs.api_key}}</div>
            </div>
            
            <div layout="column" layout-align="start stretch">
                <h4><i class="fas fa-server"></i> <?php _e('API Host',SI)?></h4>
                <div><?php echo(SI_API_HOST)?></div>
            </div>
        </div>
    </div>

    <div class="config-grid-block">
        <h2 class="md-headline"><?php _e('Data feeds',SI)?></h2>

        <div class="block-content">
            <div class="data-view-list">
                <div ng-repeat="item in data_views" ng-click="changeDefaultView(item)" class="data-view-item {{configs.default_view == item.id ? 'default' : ''}}">
                    {{item.name}}
                </div>
            </div>
        </div>
    </div>

    <div class="config-grid-block">
        <h2 class="md-headline"><?php _e('Integration',SI)?></h2>

        <div class="block-content" layout="column" layout-align="start stretch">
            <md-input-container flex>
                <label><?php _e('Add favorites button to menu',SI) ?></label>
                <md-select ng-model="configs.favorites_button_menu" ng-change="save_configs()">
                    <md-option value="">{{'None'.translate()}}</md-option>
                    <md-option ng-repeat="item in wp_menus" value="{{item.key}}">{{item.name}}</md-option>
                </md-select>
            </md-input-container>

            
            <si-wp-media type="image" 
                            si-model="configs.site_logo" 
                            si-change="logoChanged($media)"
                            caption="Your logo" placeholder="Choose an image"></si-wp-media>
            

            <md-input-container flex>
                <label lstr>Isolation mode</label>
                <md-select ng-model="configs.isolation" ng-change="save_configs()">
                    <md-option value="NONE"><lstr>None</lstr></md-option>
                    <md-option value="ISOLATE"><lstr>Isolate</lstr></md-option>
                </md-select>
            </md-input-container>
        </div>

    </div>


    <div class="config-grid-block">
        <h2 class="md-headline"><?php _e('Communication',SI)?></h2>
        <div class="block-content" layout="column" layout-align="start stretch">
            <p>
                <?php _e('Communication settings used for basic forms.',SI) ?>
            </p>

            <md-input-container flex>
                <label><?php _e('From name (default: Your website)',SI) ?></label>
                <input autocomplete="off" ng-model="configs.form_from_name" ng-model-options="{updateOn: 'blur'}" ng-change="save_configs()"  />
            </md-input-container>

            <md-input-container flex>
                <label><?php echo str_replace('{0}', $_SERVER['HTTP_HOST'], __('From address (default: no-reply@{0})',SI)) ?></label>
                <input autocomplete="off" ng-model="configs.form_from_address" ng-model-options="{updateOn: 'blur'}" ng-change="save_configs()"  />
            </md-input-container>

            <md-input-container flex>
                <label><?php _e('Recipient (default: Broker email)',SI) ?></label>
                <input autocomplete="off" type="text" ng-model="configs.form_recipient" ng-model-options="{updateOn: 'blur'}" ng-change="save_configs()" />
            </md-input-container>
            <p>
                <em class="note"><?php _e('Leave the previous fields blank to use default values',SI) ?></em>
            </p>
        </div>
    </div>

    <div class="config-grid-block">
        <h2 class="md-headline" lstr>Formatting</h2>
        <div class="block-content" layout="column" layout-align="start stretch">
            <md-input-container flex md-no-float>
                <label lstr>Phone number</label>
                <input autocomplete="off" ng-model="configs.phone_format" ng-model-options="{updateOn: 'blur'}" ng-change="save_configs()" placeholder="000-000-0000"  />
            </md-input-container>
            <p>
                <em class="note"><lstr>Leave the previous fields blank to use default values</lstr></em>
            </p>
        </div>
    </div>

    <div class="config-grid-block">
        <h2 class="md-headline" lstr>Tools</h2>
        <div class="block-content" layout="column" layout-align="start stretch">
            <label lstr>Default interest rates (in %)</label>
            <md-slider-container>
                <md-input-container>
                    <input type="number" ng-model="configs.default_interest_rate" ng-model-options="{updateOn: 'blur'}" ng-change="save_configs()">
                </md-input-container>
                <md-slider min="0" max="10" step="0.25" ng-model="configs.default_interest_rate" ng-change="debounce_save_configs()">
                </md-slider>
                
            </md-slider-container>
            
        </div>
    </div>
    
    <div class="config-grid-block">
        <h2 class="md-headline" lstr>New items</h2>
        <div class="block-content" layout="column" layout-align="start stretch">
            <md-input-container flex md-no-float>
                <label lstr>Time limit (in days)</label>
                <input autocomplete="off" type="number" ng-model="configs.new_item_time_limit" ng-model-options="{updateOn: 'blur'}" ng-change="save_configs()" />
            </md-input-container>
        </div>
    </div>
    <div class="config-grid-block">
        <h2 class="md-headline" lstr>Sold listing</h2>
        <div class="block-content" layout="column" layout-align="start stretch">
            <md-input-container flex md-no-float>
                <label lstr>Limit the number of photo</label>
                <md-select ng-model="configs.sold_image_limit" ng-change="save_configs()">
                    <md-option value="-1"><lstr>Show all pictures</lstr></md-option>
                    <md-option value="1"><lstr>Only 1 image</lstr></md-option>
                    <md-option value="4"><lstr>Only 4 images</lstr></md-option>
                </md-select>
            </md-input-container>
            <md-input-container flex md-no-float>
                <label lstr>Show map related elements</label>
                <md-select ng-model="configs.sold_allow_map" ng-change="save_configs()">
                    <md-option value="true"><lstr>Yes</lstr></md-option>
                    <md-option value="false"><lstr>No</lstr></md-option>
                </md-select>
            </md-input-container>
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

    
    <div class="config-grid-block" ng-if="false">
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

    <div class="config-grid-block" ng-if="false">
        <h2 class="md-headline"><?php _e('Configs tools',SI)?></h2>
        <div class="block-content">
            <div layout="row" layout-align="start center">
                <md-button ng-click="backupConfigs()"><?php _e('Backup settings',SI) ?></md-button>
                <md-button ng-click="reset_all_configs()"><?php _e('Reset all settings',SI) ?></md-button>
            </div>

        </div>
    </div>
</div>