
<div class="grid-layout">
    <div class="nav" layout="column" layout-align="start center">
        <md-button class="md-icon-button md-raised md-primary back-button" ng-click="saveOrClose()"><i class="fal {{hasChanged() ? 'fa-check' : 'fa-arrow-left'}}"></i></md-button>
        <md-button class="md-icon-button" ng-show="hasChanged()" ng-click="cancel()"><i class="fal fa-arrow-left"></i></md-button>
    </div>
    <div class="options" layout="column" layout-align="start stretch">
        <md-input-container>
            <label><?php _e('Alias of the list',IMMODB) ?></label>
            <input ng-model="model.alias" />
        </md-input-container>

        <md-input-container>
            <label><?php _e('Source ImmoDB view',IMMODB) ?></label>
            <md-select ng-model="model.$$source_id" ng-change="updateSource()">
                <md-option ng-repeat="item in data_views" value="{{item.id}}">{{item.name}}</md-option>
            </md-select>
        </md-input-container>

        <md-input-container>
            <label><?php _e('List of',IMMODB) ?></label>
            <md-select ng-model="model.type" ng-change="reset_default_value()">
                <md-option ng-repeat="item in global_list.list_types" ng-value="item.key">{{item.label.translate()}}</md-option>
            </md-select>
        </md-input-container>

        <md-input-container>
            <label><?php _e('Sort by',IMMODB) ?></label>
            <input ng-model="model.sort" placeholder="ex.: location.city" />
            <md-icon ng-click="switchSortReverse()" class="fal {{model.sort_reverse? 'fa-sort-amount-down' : 'fa-sort-amount-up'}}"></md-icon>
        </md-input-container>  
        
        <div layout="row" layout-align="space-between center">
            <label>{{(model.limit > 0 ? "Shuffle first {0} elements" : "Shuffle first page").translate().format(model.limit)}}</label>
            <md-switch ng-model="model.shuffle"></md-switch>
        </div>  

        <md-input-container>
            <label><?php _e('Limit the number of displayed elements',IMMODB) ?></label>
            <input type="number" ng-model="model.limit" ng-change="validate()" />
        </md-input-container>
    </div>

    <div class="other-stuff">
        <md-tabs md-dynamic-height md-border-bottom>
            <md-tab>
                <md-tab-label><?php _e('Filters',IMMODB)?></md-tab-label>
                <md-tab-body class="md-padding">
                <?php ImmoDB::view('admin/lists/filters') ?>
                </md-tab-body>
            </md-tab>

            <md-tab>
                <md-tab-label><?php _e('Layout',IMMODB)?></md-tab-label>
                <md-tab-body class="md-padding">
                <?php ImmoDB::view('admin/lists/layout') ?>
                </md-tab-body>
            </md-tab>
        </md-tabs>
    </div>
</div>


