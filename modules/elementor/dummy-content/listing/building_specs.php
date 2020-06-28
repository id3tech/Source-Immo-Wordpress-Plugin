<div class="building-specs detail-section" data-ng-show="[model.building.attributes, model.building.dimension] | siHasValue">
                    <div class="title" data-ng-click="toggleSection('building')">
                        <div>Bâtiment et intérieur</div>
                        <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
                    </div>
                    <div class="detail-section-content spec-grid">
                        <div class="special-box" data-ng-show="model.building.construction_year!=undefined &amp;&amp; hasDimension(model.building.dimension)">
                            <div class="built-year" data-ng-show="model.building.construction_year!=undefined">
                                <label class="ng-binding">Année de construction</label>
                                <div class="value ng-binding">1947</div>
                            </div>
                            <div class="dimension" data-ng-show="hasDimension(model.building.dimension)">
                                <label class="ng-binding">Dimensions</label>
                                <div class="value ng-binding">35' x 86.4'</div>
                            </div>
                        </div>
                        <!-- ngRepeat: spec in model.building.attributes -->
                        <div class="spec ng-scope" data-ng-repeat="spec in model.building.attributes">
                            <label class="ng-binding">Armoires</label>
                            <div>
                                <!-- ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Bois</span><!-- end ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Mélamine</span><!-- end ngRepeat: value in spec.values -->
                            </div>
                        </div><!-- end ngRepeat: spec in model.building.attributes -->
                        <div class="spec ng-scope" data-ng-repeat="spec in model.building.attributes">
                            <label class="ng-binding">Facilité d'accès</label>
                            <div>
                                <!-- ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Ascenseur</span><!-- end ngRepeat: value in spec.values -->
                            </div>
                        </div><!-- end ngRepeat: spec in model.building.attributes -->
                        <div class="spec ng-scope" data-ng-repeat="spec in model.building.attributes">
                            <label class="ng-binding">Fenêtres</label>
                            <div>
                                <!-- ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">PVC</span><!-- end ngRepeat: value in spec.values -->
                            </div>
                        </div><!-- end ngRepeat: spec in model.building.attributes -->
                        <div class="spec ng-scope" data-ng-repeat="spec in model.building.attributes">
                            <label class="ng-binding">Fondation</label>
                            <div>
                                <!-- ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Béton coulé</span><!-- end ngRepeat: value in spec.values -->
                            </div>
                        </div><!-- end ngRepeat: spec in model.building.attributes -->
                        <div class="spec ng-scope" data-ng-repeat="spec in model.building.attributes">
                            <label class="ng-binding">Revêtements</label>
                            <div>
                                <!-- ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Brique</span><!-- end ngRepeat: value in spec.values -->
                            </div>
                        </div><!-- end ngRepeat: spec in model.building.attributes -->
                        <div class="spec ng-scope" data-ng-repeat="spec in model.building.attributes">
                            <label class="ng-binding">Type de fenêtre</label>
                            <div>
                                <!-- ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Manivelle</span><!-- end ngRepeat: value in spec.values -->
                            </div>
                        </div><!-- end ngRepeat: spec in model.building.attributes -->
                        <div class="spec ng-scope" data-ng-repeat="spec in model.building.attributes">
                            <label class="ng-binding">Toiture</label>
                            <div>
                                <!-- ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Bardeaux d'asphalte</span><!-- end ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Membrane élastomère</span><!-- end ngRepeat: value in spec.values -->
                            </div>
                        </div><!-- end ngRepeat: spec in model.building.attributes -->
                    </div>
                </div>