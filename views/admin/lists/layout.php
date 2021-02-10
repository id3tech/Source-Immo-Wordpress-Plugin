<div class="list-layout">
    <h5><?php _e("Item's space on the row",SI) ?></h5>
    <div><?php _e("Ajust the space taken by an item on the row, for each device's scope.",SI) ?></div>
    <div layout="row" layout-align="space-between center">
        <md-input-container >
            <md-icon class="fal fa-desktop"></md-icon>
            <input ng-model="model.list_layout.item_row_space.desktop" />
            <md-icon class="fal fa-percent"></md-icon>
        </md-input-container>

        <md-input-container >
            <md-icon class="fal fa-laptop"></md-icon>
            <input ng-model="model.list_layout.item_row_space.laptop" />
            <md-icon class="fal fa-percent"></md-icon>
        </md-input-container>

        <md-input-container >
            <md-icon class="fal fa-tablet"></md-icon>
            <input ng-model="model.list_layout.item_row_space.tablet" />
            <md-icon class="fal fa-percent"></md-icon>
        </md-input-container>

        <md-input-container >
            <md-icon class="fal fa-mobile"></md-icon>
            <input ng-model="model.list_layout.item_row_space.mobile" />
            <md-icon class="fal fa-percent"></md-icon>
        </md-input-container>
    </div>
    

    <style type="text/css" ng-bind="getCustomCss()"></style>
    
    <h5 lstr>Preview</h5>
    <div ng-if="model != null" class="si-style-editor-preview {{model.type}}-preview " si-style-preview="computedStyles">

            <div class="viewport list-layout-{{model.list_layout.preset}} search-layout-orientation-{{model.search_engine_options.orientation}}">
                 <div 
                    ng-if="model.search_engine_options.type == 'full'"
                    class="si-container search-engine-tabs-container search-type-{{model.type}} search-layout-type-{{model.search_engine_options.type}}  search-layout-orientation-{{model.search_engine_options.orientation}}">
                    <div class="list-components" >
                        <div class="component tabs {{!model.search_engine_options.tabbed ? 'inactive':'' }}">
                            <md-checkbox ng-model="model.search_engine_options.tabbed"></md-checkbox>
                            <div class="component-elements">
                                <si-search-tabs-editor si-model="model.search_engine_options"></si-search-tabs-editor>
                            </div>
                        </div>
                    </div>
                 </div>

                <div class="si-container search-engine-container search-type-{{model.type}} search-layout-type-{{model.search_engine_options.type}}  search-layout-orientation-{{model.search_engine_options.orientation}}">
                    <div class="list-components" >
                        
                        <div class="component  {{!model.searchable ? 'inactive':'' }}">
                            <md-checkbox ng-model="model.searchable"></md-checkbox>
                            <div class="component-elements">
                                <si-include 
                                    path-format="~/views/admin/statics/previews/{0}-search-{1}.html"
                                    path-params="[model.type, model.search_engine_options.type]"></si-include>
                                <md-button class="config-button md-raised md-primary"  ng-click="editSearchEngine(model.type)"><lstr>Configure</lstr> <i class="fal fa-cog"></i></md-button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="si-container">
                    <div class="list-components si-grid" >
                        <div class="component list-map-toggle {{!model.mappable ? 'inactive':'' }}">
                            <md-checkbox ng-model="model.mappable"></md-checkbox>
                            <div class="component-elements toggles">
                                <i class="fal fa-2x fa-list si-highlight"></i>
                                <i class="fal fa-2x fa-map-marker-alt"></i>
                                <md-button class="config-button md-raised md-primary" ng-show="false" ng-click="editSearchEngine(model.type)"><lstr>Configure</lstr> <i class="fal fa-cog"></i></md-button>
                            </div>
                            
                        </div>

                        <div class="component list-meta {{!model.show_list_meta ? 'inactive':'' }}">
                            <md-checkbox ng-model="model.show_list_meta"></md-checkbox>
                            <label class="component-elements">{{previewElements.length}} {{model.type.translate()}}</label>
                        </div>

                        <div class="component list-sort {{!model.sortable ? 'inactive':'' }}">
                            <md-checkbox ng-model="model.sortable"></md-checkbox>
                            <div class="component-elements  sort">
                                <i class="fal fa-2x fa-sort-amount-down"></i>
                            </div>
                        </div>

                        <div class="component list-items">
                            <md-checkbox ng-checked="true" disabled></md-checkbox>
                            
                            <div class="component-elements si-grid" style="--item-row-space:{{100 / model.list_layout.item_row_space.desktop | math_floor}}">
                                
                                <div class="si-element 
                                            layout-{{model.list_item_layout.layout}} 
                                            img-hover-{{model.list_item_layout.image_hover_effect}} 
                                            layer-hover-{{model.list_item_layout.secondary_layer_effect}}
                                            primary-layer-{{model.list_item_layout.primary_layer_position}}
                                            style-{{model.list_item_layout.preset}}
                                            {{$index==0 ? 'editable' : ''}}"
                                        style="{{model.list_item_layout.secondary_layer_bg_opacity > 0 ? '--secondary-layer-bg-opacity:' + (model.list_item_layout.secondary_layer_bg_opacity/100) : ''}}"
                                        ng-repeat="item in previewElements track by $index"
                                        >
                                    <div ng-include="item.layout"></div>
                                    <md-button class="md-raised md-primary"  ng-click="editListItem(model.type)"><lstr>Configure</lstr> <i class="fal fa-cog"></i></md-button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
    </div>
    
</div>