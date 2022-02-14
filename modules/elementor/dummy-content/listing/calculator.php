<div id="calculator" class="mortgage-calculator" data-ng-show="allowCalculator()">
                    <div class="si-title"><i class="fal fa-calculator"></i> Calculez l'hypothèque</div>
                    <div class="si-calculator si-padding-block ng-isolate-scope" data-si-amount="model.price.sell.amount" data-on-change="onMortgageChange($result)" data-si-region="04" data-si-city="36033">
                        <div class="si-input-container ng-isolate-scope ng-pristine">
                            <label class="ng-binding">Valeur de la propriété</label>
                            <div class="si-input">
                                <input type="number" data-ng-model="data.amount" autocomplete="off" data-ng-change="process()" class="ng-pristine ng-untouched ng-valid ng-not-empty">
                                <i class="extra fal fa-dollar-sign"></i>
                            </div>

                        </div>

                        <div class="si-input-container ng-isolate-scope">
                            <label>
                                <div class="ng-binding">Mise de fond</div>
                                <div class="alt-method">
                                    <si-radio data-ng-model="data.downpayment_method" data-si-value="percent" si-change="changeDownpaymentMethod()" data-label="%" class="ng-pristine ng-untouched ng-valid ng-isolate-scope ng-not-empty">
                                        <div class="any-selector pretty p-icon p-pulse p-round"><input type="radio" name="" title="%" ng-click="onClick()" ng-checked="checked" checked="checked">
                                            <div class="si-input-state"><i class="icon fas fa-circle fa-xs"></i><label class="ng-binding">%</label></div>
                                        </div>
                                    </si-radio>

                                    <si-radio data-ng-model="data.downpayment_method" data-si-value="cash" si-change="changeDownpaymentMethod()" data-label="$" class="ng-pristine ng-untouched ng-valid ng-isolate-scope ng-not-empty">
                                        <div class="any-selector pretty p-icon p-pulse p-round"><input type="radio" name="" title="$" ng-click="onClick()" ng-checked="checked">
                                            <div class="si-input-state"><i class="icon fas fa-circle fa-xs"></i><label class="ng-binding">$</label></div>
                                        </div>
                                    </si-radio>

                                </div>
                            </label>
                            <div class="si-input">
                                <input type="number" autocomplete="off" data-ng-model="data.downpayment" data-ng-change="process()" class="ng-pristine ng-untouched ng-valid ng-not-empty">
                                <i class="extra fal fa-percent"></i>
                            </div>

                        </div>

                        <div class="si-input-container ng-isolate-scope ng-pristine">
                            <label class="ng-binding">Taux d'intérêt</label>
                            <div class="si-input">
                                <input type="number" autocomplete="off" data-ng-model="data.interest" data-ng-change="process()" class="ng-pristine ng-untouched ng-valid ng-not-empty">
                                <i class="extra fal fa-percent"></i>
                            </div>

                        </div>

                        <div class="si-input-container ng-isolate-scope ng-pristine">
                            <label class="ng-binding">Amortissement</label>
                            <div class="si-input">
                                <input type="number" autocomplete="off" data-ng-model="data.amortization" data-ng-change="process()" class="ng-pristine ng-untouched ng-valid ng-not-empty">
                                <i class="extra fal fa-calendar-alt"></i>
                            </div>

                        </div>

                        <div class="si-input-container ng-isolate-scope">
                            <label class="ng-binding">Versements</label>

                            <div class="si-input">
                                <div class="si-dropdown ng-isolate-scope has-button-icon">
                                    <div class="si-dropdown-button ng-binding">
                                        Aux 2 semaines
                                    </div>
                                    <div class="si-dropdown-panel" aria-labelledby="dropdownMenuButton">
                                        <div class="si-dropdown-panel-content" ng-transclude="">
                                            <!-- ngRepeat: (value,label) in frequencies -->
                                            <div class="si-dropdown-item " data-ng-click="setFrequency(value)" data-ng-repeat="(value,label) in frequencies">Par mois</div><!-- end ngRepeat: (value,label) in frequencies -->
                                            <div class="si-dropdown-item active" data-ng-click="setFrequency(value)" data-ng-repeat="(value,label) in frequencies">Aux 2 semaines</div><!-- end ngRepeat: (value,label) in frequencies -->
                                            <div class="si-dropdown-item " data-ng-click="setFrequency(value)" data-ng-repeat="(value,label) in frequencies">Par semaine</div><!-- end ngRepeat: (value,label) in frequencies -->
                                        </div>
                                    </div>
                                </div>
                                <i class="extra fal fa-repeat"></i>
                            </div>
                        </div>
                    </div>

                    <div class="result">
                        <div class="result-item mortgage">
                            <label>Estimated mortgage payments</label>
                            <div class="value">
                                <em class="ng-binding">$628.46</em>
                                <span class="ng-binding">every two weeks</span>
                            </div>
                        </div>
                        
                        <div class="result-item transfer-taxes">
                            <label>Transfer duties*</label>
                            <div class="value"><em class="ng-binding">$3,815</em></div>
                        </div>

                        
                        <div class="notice">*This amount is displayed for information only. The amount for the transfer duties is based on the scales imposed by the municipality or the basic calculations generally in effect in Québec. Consult your real estate broker for the exact amount.</div>
                    </div>
                </div>