<div class="financials detail-section" data-ng-show="[model.building.assessment, model.land.assessment, model.expenses, model.incomes] | siHasValue">
                    <div class="title" data-ng-click="toggleSection('financials')">
                        <div>Détails financiers</div>
                        <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
                    </div>
                    <div class="detail-section-content">



                        <div class="assessments" data-ng-show="[model.assessment, model.building.assessment, model.land.assessment] | siHasValue">
                            <h4>Évaluations</h4>
                            <div class="label-value building-assessment" ng-show="model.building.assessment">
                                <label class="ng-binding">Bâtiment (2020)</label>
                                <div class="value ng-binding">441 300 $</div>
                            </div>

                            <div class="label-value land-assessment" ng-show="model.land.assessment">
                                <label class="ng-binding">Terrain (2020)</label>
                                <div class="value ng-binding">117 400 $</div>
                            </div>
                            <div class="label-value municipal-assessment" ng-show="model.assessment | siHasValue">
                                <label class="ng-binding">Municipal <span ng-show="model.assessment.year | siHasValue" class="ng-binding">(2020)</span></label>
                                <div class="value ng-binding">558 700 $</div>
                            </div>
                        </div>

                        <div class="incomes" data-ng-show="model.incomes | siHasValue">
                            <h4>Revenus</h4>
                            <div class="income-list">
                                <!-- ngRepeat: exp in model.incomes -->
                                <div class="label-value ng-scope" data-ng-repeat="exp in model.incomes">
                                    <label class="ng-binding">Résidentiels (Brut)</label>
                                    <div class="value ng-binding">60 000 $</div>
                                </div><!-- end ngRepeat: exp in model.incomes -->
                            </div>
                        </div>


                        <div class="expenses" data-ng-show="model.expenses | siHasValue">
                            <h4>Dépenses</h4>

                            <div class="expense-list">
                                <!-- ngRepeat: exp in model.expenses -->
                                <div class="label-value ng-scope" data-ng-repeat="exp in model.expenses">
                                    <label class="ng-binding">Taxes scolaires</label>
                                    <div class="value ng-binding">1 277 $</div>
                                </div><!-- end ngRepeat: exp in model.expenses -->
                                <div class="label-value ng-scope" data-ng-repeat="exp in model.expenses">
                                    <label class="ng-binding">Taxes municipales</label>
                                    <div class="value ng-binding">12 113 $</div>
                                </div><!-- end ngRepeat: exp in model.expenses -->
                            </div>
                        </div>
                    </div>
                </div>