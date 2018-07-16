<div class="list-filters" layout="column" layout-align="start stretch">
    
    <immodb-filter-group ng-model="model.filter_group"></immodb-filter-group>

    <div ng-show="model.search_token!=null"><?php _e('Search token', IMMODB) ?> : {{model.search_token | truncate : 26}}</div>

    <script  type="text/ng-template" id="filter-group">
        <div class="grid-row header" ng-show="model.filters.length>0">
            <div><?php _e('Attribute',IMMODB) ?></div>
            <div><?php _e('Operator',IMMODB) ?></div>
            <div><?php _e('Value',IMMODB) ?></div>
            <div></div>
        </div>
        <div>
            <div class="filters"  ng-repeat="filter in model.filters">
                <div class="grid-row">
                    <md-input-container>
                        <label></label>
                        <input ng-model="filter.field" placeholder="ex.: price.transaction" />
                    </md-input-container>  

                    <md-input-container>
                        <md-select ng-model="filter.operator">
                            <md-option ng-repeat="(key, value) in filter_operators" value="{{key}}">{{value.translate()}}</option>
                        </md-select>
                    </md-input-container>

                    <md-input-container>
                        <input ng-model="filter.value" />
                    </md-input-container>

                    <div>
                        <md-button ng-click="removeFromList(filter, model, 'filters')" class="md-icon-button"><md-icon class="fal fa-times"></md-icon></md-button>
                    </div>
                </div>

                <div class="filter-operator">{{model.operator.translate()}}</div>
            </div>

            <div class="subgroups" ng-repeat="group in model.filter_groups">
                <immodb-filter-group ng-model="group" ng-parent="model"></immodb-filter-group>

                <div class="filter-operator">{{model.operator.translate()}}</div>
            </div>
        </div>

        

        <div layout="row" layout-align="center center" layout-padding>
            <md-menu>
                <md-button class="md-raised md-primary md-icon-button" ng-click="$mdOpenMenu()"><i class="fal fa-plus"></i></md-button>
                <md-menu-content>
                    <md-menu-item><md-button ng-click="addFilter()"><?php _e('Add a filter', IMMODB) ?></md-button></md-menu-item>
                    <md-menu-item><md-button ng-click="addFilterGroup()"><?php _e("Add filter group", IMMODB) ?></md-button></md-menu-item>
                </md-menu-content>
            </md-menu>
            
            <md-menu>
                <md-button class="md-icon-button" ng-click="$mdOpenMenu()"><i class="far fa-ellipsis-v"></i></md-button>
                <md-menu-content>
                    <md-menu-item>
                        <md-button ng-click="switchOperator('and')"><?php _e('Use AND operator', IMMODB) ?></md-button>
                    </md-menu-item>
                    <md-menu-item>
                        <md-button ng-click="switchOperator('or')"><?php _e('Use OR operator', IMMODB) ?></md-button>
                    </md-menu-item>
                    <md-divider  ng-show="parent!=null"></md-divider>
                    <md-menu-item ng-show="parent!=null">
                        <md-button ng-click="removeGroup()"><i class="fal fa-times"></i> <?php _e('Remove group', IMMODB) ?></md-button>
                    </md-menu-item>
                </md-menu-content>
            </md-menu> 
        </div>

    </script>
</div>