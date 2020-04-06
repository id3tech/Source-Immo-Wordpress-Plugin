<div class="list-layout">
    <md-input-container>
        <label><?php _e('Model',SI) ?></label>
        <md-select ng-model="model.list_layout.preset">
            <md-option ng-repeat="item in global_list.list_layouts[model.type]" ng-value="item.name">{{item.label.translate()}}</md-option>
        </md-select>
    </md-input-container>
    
    <md-input-container >
        <label><?php _e('List class',SI) ?></label>
        <input ng-model="model.list_layout.scope_class" />
    </md-input-container>

    <h5 lstr>Preview</h5>
    <div class="si-style-editor-preview {{model.type}}-preview " si-style-preview="computedStyles">
        
            <div class="viewport list-layout-{{model.list_layout.preset}} search-layout-orientation-{{model.search_engine_options.orientation}}">
                <div class="si-container search-engine-container search-type-{{model.type}} search-layout-type-{{model.search_engine_options.type}}  search-layout-orientation-{{model.search_engine_options.orientation}}">
                    <div class="list-components" >
                        <div class="component  {{!model.searchable ? 'inactive':'' }}">
                            <md-checkbox ng-model="model.searchable"></md-checkbox>
                            <div class="component-elements">
                                <si-include 
                                    path-format="~/views/admin/statics/previews/{0}-search-{1}.html"
                                    path-params="[model.type, model.search_engine_options.type]"></si-include>
                                <md-button class="md-raised md-primary"  ng-click="editSearchEngine(model.type)"><lstr>Configure</lstr> <i class="fal fa-cog"></i></md-button>
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
                                <md-button class="md-raised md-primary" ng-show="false" ng-click="editSearchEngine(model.type)"><lstr>Configure</lstr> <i class="fal fa-cog"></i></md-button>
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
                            
                            <div class="component-elements si-grid">
                                
                                <div class="si-element 
                                            layout-{{model.list_item_layout.preset}} 
                                            img-hover-{{model.list_item_layout.image_hover_effect}} 
                                            layer-hover-{{model.list_item_layout.secondary_layer_effect}}
                                            {{$index==0 ? 'editable' : ''}}"
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