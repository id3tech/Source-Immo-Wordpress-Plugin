<div class="lot-specs si-detail-section" ng-show="(model.land.attributes | siHasValue) || hasDimension(model.land.dimension)">
                    <div class="si-title" data-ng-click="toggleSection('lot')">
                        <div>Terrain et extérieur</div>
                        <div class="si-icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
                    </div>
                    <div class="si-detail-section-content spec-grid">
                        <div class="special-box" data-ng-show="hasDimension(model.land.dimension)">
                            <div class="dimension">
                                <label class="ng-binding">Dimensions</label>
                                <div class="value ng-binding">50.1' x 120.7'</div>
                            </div>
                        </div>
                        <!-- ngRepeat: spec in model.land.attributes -->
                        <div class="spec ng-scope" data-ng-repeat="spec in model.land.attributes">
                            <label class="ng-binding">Aménagement du terrain</label>
                            <div>
                                <!-- ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Paysager</span><!-- end ngRepeat: value in spec.values -->
                            </div>
                        </div><!-- end ngRepeat: spec in model.land.attributes -->
                        <div class="spec ng-scope" data-ng-repeat="spec in model.land.attributes">
                            <label class="ng-binding">Proximité</label>
                            <div>
                                <!-- ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Cegep</span><!-- end ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Hôpital</span><!-- end ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Parc-espace vert</span><!-- end ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Piste cyclable</span><!-- end ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">École primaire</span><!-- end ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">École secondaire</span><!-- end ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Transport en commun</span><!-- end ngRepeat: value in spec.values -->
                            </div>
                        </div><!-- end ngRepeat: spec in model.land.attributes -->
                        <div class="spec ng-scope" data-ng-repeat="spec in model.land.attributes">
                            <label class="ng-binding">Topographie</label>
                            <div>
                                <!-- ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">En pente</span><!-- end ngRepeat: value in spec.values -->
                            </div>
                        </div><!-- end ngRepeat: spec in model.land.attributes -->
                        <div class="spec ng-scope" data-ng-repeat="spec in model.land.attributes">
                            <label class="ng-binding">Vue</label>
                            <div>
                                <!-- ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Sur l'eau</span><!-- end ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Panoramique</span><!-- end ngRepeat: value in spec.values -->
                            </div>
                        </div><!-- end ngRepeat: spec in model.land.attributes -->
                        <div class="spec ng-scope" data-ng-repeat="spec in model.land.attributes">
                            <label class="ng-binding">Zonage</label>
                            <div>
                                <!-- ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Résidentiel</span><!-- end ngRepeat: value in spec.values -->
                            </div>
                        </div><!-- end ngRepeat: spec in model.land.attributes -->
                    </div>
                </div>