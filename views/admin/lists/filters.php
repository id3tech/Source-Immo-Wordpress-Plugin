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