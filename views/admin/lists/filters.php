<div class="list-filters" layout="column" layout-align="start stretch">
    
    <si-filter-group ng-model="model.filter_group" si-type="model.type"></si-filter-group>

    <div ng-show="model.search_token!=null"><?php _e('Search token', SI) ?> : {{model.search_token | truncate : 26}}</div>

    <script  type="text/ng-template" id="filter-group">
        <div class="grid-row header" ng-show="model.filters.length>0">
            <div><?php _e('Attribute',SI) ?></div>
            <div><?php _e('Operator',SI) ?></div>
            <div><?php _e('Value',SI) ?></div>
            <div></div>
        </div>
        <div>
            <div class="filters"  ng-repeat="filter in model.filters">
                <si-filter-item si-type="type" class="grid-row" ng-model="filter" on-remove="removeFromList(filter, model, 'filters')"></si-filter-item>

                <div class="filter-operator">{{model.operator.translate()}}</div>
            </div>

            <div class="subgroups" ng-repeat="group in model.filter_groups">
                
                <si-filter-group si-type="type" ng-model="group" ng-parent="model"></si-filter-group>
                
                <div class="filter-operator">{{model.operator.translate()}}</div>
            </div>
        </div>

        

        <div layout="row" layout-align="center center" layout-padding>
            <md-menu>
                <md-button class="md-raised md-primary md-icon-button" ng-click="$mdOpenMenu()"><i class="fal fa-plus"></i></md-button>
                <md-menu-content>
                    <md-menu-item><md-button ng-click="addFilter()"><?php _e('Add a filter', SI) ?></md-button></md-menu-item>
                    <md-menu-item><md-button ng-click="addFilterGroup()"><?php _e("Add filter group", SI) ?></md-button></md-menu-item>
                </md-menu-content>
            </md-menu>
            
            <md-menu>
                <md-button class="md-icon-button" ng-click="$mdOpenMenu()"><i class="far fa-ellipsis-v"></i></md-button>
                <md-menu-content>
                    <md-menu-item>
                        <md-button ng-click="switchOperator('and')"><?php _e('Use AND operator', SI) ?></md-button>
                    </md-menu-item>
                    <md-menu-item>
                        <md-button ng-click="switchOperator('or')"><?php _e('Use OR operator', SI) ?></md-button>
                    </md-menu-item>
                    <md-divider  ng-show="parent!=null"></md-divider>
                    <md-menu-item ng-show="parent!=null">
                        <md-button ng-click="removeGroup()"><i class="fal fa-times"></i> <?php _e('Remove group', SI) ?></md-button>
                    </md-menu-item>
                </md-menu-content>
            </md-menu> 
        </div>

    </script>
</div>