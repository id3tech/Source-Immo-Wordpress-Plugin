
<div class="grid-layout">
    <div class="options" layout="column" layout-align="start stretch">
        <md-input-container>
            <label><?php _e('Alias of the stream',IMMODB) ?></label>
            <input ng-model="model.alias" />
        </md-input-container>

        <md-input-container>
            <label><?php _e('Source ImmoDB view',IMMODB) ?></label>
            <md-select ng-model="model.source">
                <md-option value="default"><?php _e('Default view',IMMODB) ?></md-option>
                <md-option ng-repeat="item in global_list.sources"></md-option>
            </md-select>
        </md-input-container>

        <md-input-container>
            <label><?php _e('Sort by',IMMODB) ?></label>
            <input ng-model="model.sort" placeholder="ex.: location.city" />
        </md-input-container>  


        <md-input-container>
            <label><?php _e('Limit the number of displayed elements',IMMODB) ?></label>
            <input type="number" ng-model="model.limit" />
        </md-input-container>
    </div>

    <div class="filters" layout="column" layout-align="start stretch">
        <div class="grid-row header">
            <div><?php _e('Attribute',IMMODB) ?></div>
            <div><?php _e('Operator',IMMODB) ?></div>
            <div><?php _e('Value',IMMODB) ?></div>
            <div></div>
        </div>

        <div class="grid-row" ng-repeat="filter in model.filters">
            <md-input-container>
                <label></label>
                <input ng-model="filter.field" placeholder="ex.: price.transaction" />
            </md-input-container>  

            <md-input-container>
                <md-select ng-model="filter.operator">
                    <md-option ng-repeat="(key, value) in filter_operators" value="{{key}}">{{value}}</option>
                </md-select>
            </md-input-container>

            <md-input-container>
                <input ng-model="filter.value" />
            </md-input-container>

            <div>

            </div>
        </div>

        <div ng-show="model.filters==null || model.filters.length == 0">
            <label class="placeholder"><?php _e("There is no filter yet", IMMODB) ?></label>
        </div>

        <div layout="row" layout-align="center center" layout-padding>
            <md-button class="md-raised md-primary md-icon-button" ng-click="addFilter()" title="<?php _e('Add a filter', IMMODB) ?>"><i class="fal fa-plus fa-lg"></i></md-button>
        </div>
    </div>
</div>