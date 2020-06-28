
<div class="grid-layout">
    <div class="nav" layout="column" layout-align="start center">
        <md-button class="md-icon-button md-raised md-primary back-button" ng-click="saveOrClose()"><i class="fal {{hasChanged() ? 'fa-check' : 'fa-arrow-left'}}"></i></md-button>
        <md-button class="md-icon-button" ng-show="hasChanged()" ng-click="cancel()"><i class="fal fa-arrow-left"></i></md-button>
    </div>
    <div class="options" layout="column" layout-align="start stretch">
        <md-input-container>
            <label><?php _e('Alias of the list',SI) ?></label>
            <input ng-model="model.alias" />
        </md-input-container>

        <md-input-container>
            <label><?php _e('Feed this list from',SI) ?></label>
            <md-select ng-model="model.$$source_id" ng-change="updateSource()">
                <md-option ng-repeat="item in data_views" value="{{item.id}}">{{item.name}}</md-option>
            </md-select>
        </md-input-container>


        <md-input-container>
            <label><?php _e('Sort by',SI) ?></label>
            <md-select ng-model="model.sort">
                <md-option ng-value="null"><?php _e('(Default)',SI)?></md-option>
                <md-option ng-repeat="elm in global_list.list_ordering_field[model.type]" ng-value="elm.name">{{elm.label.translate()}}</md-option>
            </md-select>
            
            <md-icon ng-click="switchSortReverse()" class="fal {{model.sort_reverse? 'fa-sort-amount-down' : 'fa-sort-amount-up'}}"></md-icon>
        </md-input-container>  
        
        <div layout="row" layout-align="space-between center">
            <label>{{(model.limit > 0 ? "Shuffle first {0} elements" : "Shuffle first page").translate().format(model.limit)}}</label>
            <md-switch ng-model="model.shuffle"></md-switch>
        </div>  

        <md-input-container>
            <label><?php _e('Limit the number of displayed elements',SI) ?></label>
            <input type="number" ng-model="model.limit" ng-change="validate()" />
        </md-input-container>

        <md-input-container>
            <label><?php _e('Rendering method',SI) ?></label>
            <md-select ng-model="model.list_layout.preset">
                <md-option ng-repeat="item in global_list.list_layouts[model.type]" ng-value="item.name">{{item.label.translate()}}</md-option>
            </md-select>
        </md-input-container>

        
        <md-input-container >
            <label><?php _e('List class',SI) ?></label>
            <input ng-model="model.list_layout.scope_class" />
        </md-input-container>

        <md-input-container>
            <label lstr>Custom style</label>
            <textarea rows="15" ng-model="model.list_layout.custom_css"></textarea>
        </md-input-container>
        <note lstr>Use the keyword <em>selector</em> to target the element wrapper</note>
    </div>

    <div class="other-stuff">
        <md-tabs md-dynamic-height md-border-bottom>

            <md-tab>
                <md-tab-label><?php _e('Layout',SI)?></md-tab-label>
                <md-tab-body class="md-padding">
                <?php SourceImmo::view('admin/lists/layout') ?>
                </md-tab-body>
            </md-tab>            
            
            <md-tab ng-disabled="model.list_layout.preset!='direct'">
                <md-tab-label><?php _e('Filters',SI)?> <si-tooltip ng-show="model.list_layout.preset!='direct'"><?php _e('To filter the list, you must use the server side rendering method',SI) ?></si-tooltip></md-tab-label>
                <md-tab-body class="md-padding">
                <?php SourceImmo::view('admin/lists/filters') ?>
                </md-tab-body>
            </md-tab>

        </md-tabs>
    </div>
</div>


