<div class="other-specs si-detail-section" data-ng-show="model.other.attributes | siHasValue">
                    <div class="si-title" data-ng-click="toggleSection('other')">
                        <div>Autres caractéristiques</div>
                        <div class="si-icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
                    </div>
                    <div class="si-detail-section-content spec-grid">
                        <!-- ngRepeat: spec in model.other.attributes -->
                        <div class="spec ng-scope" data-ng-repeat="spec in model.other.attributes">
                            <label class="ng-binding">Mode de chauffage</label>
                            <div>
                                <!-- ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Plinthes électriques</span><!-- end ngRepeat: value in spec.values -->
                            </div>
                        </div><!-- end ngRepeat: spec in model.other.attributes -->
                        <div class="spec ng-scope" data-ng-repeat="spec in model.other.attributes">
                            <label class="ng-binding">Approvisionnement en eau</label>
                            <div>
                                <!-- ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Municipalité</span><!-- end ngRepeat: value in spec.values -->
                            </div>
                        </div><!-- end ngRepeat: spec in model.other.attributes -->
                        <div class="spec ng-scope" data-ng-repeat="spec in model.other.attributes">
                            <label class="ng-binding">Énergie pour le chauffage</label>
                            <div>
                                <!-- ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Électricité</span><!-- end ngRepeat: value in spec.values -->
                            </div>
                        </div><!-- end ngRepeat: spec in model.other.attributes -->
                        <div class="spec ng-scope" data-ng-repeat="spec in model.other.attributes">
                            <label class="ng-binding">Équipement disponible</label>
                            <div>
                                <!-- ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Climatiseur mural</span><!-- end ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Système d'alarme</span><!-- end ngRepeat: value in spec.values -->
                            </div>
                        </div><!-- end ngRepeat: spec in model.other.attributes -->
                        <div class="spec ng-scope" data-ng-repeat="spec in model.other.attributes">
                            <label class="ng-binding">Système d'égouts</label>
                            <div>
                                <!-- ngRepeat: value in spec.values --><span data-ng-repeat="value in spec.values" class="ng-binding ng-scope">Municipal</span><!-- end ngRepeat: value in spec.values -->
                            </div>
                        </div><!-- end ngRepeat: spec in model.other.attributes -->
                    </div>
                </div>