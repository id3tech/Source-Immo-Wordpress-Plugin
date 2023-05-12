<div id="calculator" class="mortgage-calculator" data-ng-show="allowCalculator()">
    <div class="si-title"><i class="fal fa-calculator" aria-hidden="true"></i> Calculez l'hypothèque</div>
    <div class="si-padding-block si-calculator si-mode-embedded" data-si-amount="model.price.sell.amount" data-on-change="onMortgageChange($result)" data-si-region="13" data-si-city="65103">
    <div class="si-calculator-inputs">
        <div ng-transclude=""></div>

        <div class="si-input-group si-amount-input">
            <label class="ng-binding">Valeur de la propriété</label>
            <div class="si-range-input">
                <div class="si-range-input-value"><i class="fad fa-circle-dollar" aria-hidden="true"></i> <span class="ng-binding">895 673 $</span></div>
                <input type="range" class="si-range ng-pristine ng-untouched ng-valid ng-not-empty ng-valid-min ng-valid-max" min="0" max="2000000" data-ng-model="data.amount" data-ng-change="process()">
            </div>
        </div>

        <div class="si-input-group si-downpayment-input">
            <label class="ng-binding">Mise de fond</label>
            <div class="si-range-input">
                <div class="si-range-input-value">
                    <i class="fad fa-circle-dollar" aria-hidden="true"></i> <span class="ng-binding">134 350.95 $</span> <span class="ng-binding">15%</span>
                </div>
                <input type="range" class="si-range ng-pristine ng-untouched ng-valid ng-not-empty ng-valid-min ng-valid-max ng-valid-step" min="0" max="100" step="5" data-ng-model="data.downpayment" data-ng-change="process()">
            </div>
        </div>

        <div class="si-input-group si-interest-input">
            <label class="ng-binding">Taux d'intérêt</label>
            <div class="si-range-input">
                <div class="si-range-input-value">
                    <i class="fad fa-calculator-simple" aria-hidden="true"></i> <span class="ng-binding">3%</span>
                </div>
                <input type="range" class="si-range ng-pristine ng-untouched ng-valid ng-not-empty ng-valid-min ng-valid-max ng-valid-step" min="0" max="10" step="0.5" data-ng-model="data.interest" data-ng-change="process()">
            </div>
        </div>

        <div class="si-input-group si-term-input">
            <label class="ng-binding">Période d'amortissement</label>
            <div class="si-range-input">
                <div class="si-range-input-value">
                    <i class="fad fa-calendar-alt" aria-hidden="true"></i> 
                    <span class="ng-binding">25 <span class="ng-binding">années</span></span>
                </div>
                <input type="range" class="si-range ng-pristine ng-untouched ng-valid ng-not-empty ng-valid-min ng-valid-max ng-valid-step" min="0" max="35" step="5" data-ng-model="data.amortization" data-ng-change="process()">
            </div>
        </div>

        <div class="si-input-group si-frequency-input">
            <label class="ng-binding">Fréquence des versements</label>
            <div class="">
                <i class="fad fa-repeat" aria-hidden="true"></i>

                <div class="si-dropdown si-no-border ng-isolate-scope has-button-icon">
                    <div class="si-dropdown-button ng-binding">
                        Aux 2 semaines
                    </div>
                    <div class="si-dropdown-panel" aria-labelledby="dropdownMenuButton"><div class="si-dropdown-panel-content" ng-transclude="">
                        <!-- ngRepeat: (value,label) in frequencies --><div class="si-dropdown-item " data-ng-click="setFrequency(value)" data-ng-repeat="(value,label) in frequencies">Par mois</div><!-- end ngRepeat: (value,label) in frequencies --><div class="si-dropdown-item active" data-ng-click="setFrequency(value)" data-ng-repeat="(value,label) in frequencies">Aux 2 semaines</div><!-- end ngRepeat: (value,label) in frequencies --><div class="si-dropdown-item " data-ng-click="setFrequency(value)" data-ng-repeat="(value,label) in frequencies">Par semaine</div><!-- end ngRepeat: (value,label) in frequencies -->
                    </div></div>
                </div>
                
            </div>
        </div>


    </div>
    <div class="si-calculator-results si-complex-results">
        <div class="si-graphical-results">
            <div class="si-donut-chart ng-isolate-scope" series="series">
            <div class="si-graph-container">
                <svg class="si-graph" width="100%" height="100%" viewBox="0 0 42 42" version="1.1" xmlns="http://www.w3.org/2000/svg" style="--si-circ: ;--si-radius: ">
                    <circle class="si-graph-track" cx="21" cy="21" r="15.91549430918952" fill="transparent"></circle>
                    <!-- ngRepeat: (key, item) in series --><circle class="si-graph-bar ng-scope" ng-repeat="(key, item) in series" style="--si-bar-color:#888;--si-bar-pct:85;--si-bar-pct-offset: 0" cx="21" cy="21" r="15.91549430918952" fill="transparent"></circle><!-- end ngRepeat: (key, item) in series --><circle class="si-graph-bar ng-scope" ng-repeat="(key, item) in series" style="--si-bar-color:var(--id3-color-action, var(--si-highlight, #15c));--si-bar-pct:15;--si-bar-pct-offset: 15" cx="21" cy="21" r="15.91549430918952" fill="transparent"></circle><!-- end ngRepeat: (key, item) in series --><circle class="si-graph-bar ng-scope" ng-repeat="(key, item) in series" style="--si-bar-color:var(--id3-color-action-400, #17a);--si-bar-pct:3;--si-bar-pct-offset: 0" cx="21" cy="21" r="15.91549430918952" fill="transparent"></circle><!-- end ngRepeat: (key, item) in series -->
                </svg>
                <div class="si-donut-content" ng-transclude="">
                <si-donut-chart-center class="ng-scope">
                    <h3 class="ng-binding">782 639.07 $</h3>
                    <em class="ng-binding">1 708.31 $</em>
                    <span class="ng-binding">aux 2 semaines</span>
                </si-donut-chart-center>
            </div>
            </div>

            <div class="si-chart-legend">
                <!-- ngRepeat: (key, item) in series --><div class="si-chart-legend-item ng-scope" ng-repeat="(key, item) in series" style="--si-bar-color:#888">
                    <i class="si-bar-color"></i>
                    <span class="ng-binding">Estimation de l'hypothèque</span>
                </div><!-- end ngRepeat: (key, item) in series --><div class="si-chart-legend-item ng-scope" ng-repeat="(key, item) in series" style="--si-bar-color:var(--id3-color-action, var(--si-highlight, #15c))">
                    <i class="si-bar-color"></i>
                    <span class="ng-binding">Mise de fond</span>
                </div><!-- end ngRepeat: (key, item) in series --><div class="si-chart-legend-item ng-scope" ng-repeat="(key, item) in series" style="--si-bar-color:var(--id3-color-action-400, #17a)">
                    <i class="si-bar-color"></i>
                    <span class="ng-binding">Assurance hypothécaire</span>
                </div><!-- end ngRepeat: (key, item) in series -->
            </div>
        </div>
        </div>

        <div class="si-mortgage">
            <div class="si-mortgage-data-row">
                <label class="ng-binding">Valeur de la propriété</label>
                
                <div class="si-value ng-binding">
                    895 673 $
                </div>
            </div>
            <div class="si-mortgage-data-row">
                <label class="ng-binding">Mise de fond</label>
                
                <div class="si-value ng-binding">
                    - 134 350.95 $
                </div>
            </div>
            <div class="si-mortgage-data-row ">
                <label class="ng-binding">Assurance hypothécaire</label>
                <div class="si-value ng-binding">
                    + 21 317.02 $
                </div>
            </div>
            <div class="si-mortgage-data-row total">
                <label class="ng-binding">Estimation de l'hypothèque</label>
                <div class="si-value ng-binding">
                    782 639.07 $
                </div>
            </div>
            
            <div class="si-mortgage-data-row total-big">
                <label class="ng-binding">Estimation des versements</label>
                <div class="si-value">
                    <em class="ng-binding">1 708.31 $</em>
                    <span class="ng-binding">aux 2 semaines</span>
                </div>
            </div>
        </div>
    </div>

    <div class="si-calculator-results si-simple-results">
        
        <div class="si-donut-chart ng-isolate-scope" series="series">
            <div class="si-graph-container">
                <svg class="si-graph" width="100%" height="100%" viewBox="0 0 42 42" version="1.1" xmlns="http://www.w3.org/2000/svg" style="--si-circ: ;--si-radius: ">
                    <circle class="si-graph-track" cx="21" cy="21" r="15.91549430918952" fill="transparent"></circle>
                    <!-- ngRepeat: (key, item) in series --><circle class="si-graph-bar ng-scope" ng-repeat="(key, item) in series" style="--si-bar-color:#888;--si-bar-pct:85;--si-bar-pct-offset: 0" cx="21" cy="21" r="15.91549430918952" fill="transparent"></circle><!-- end ngRepeat: (key, item) in series --><circle class="si-graph-bar ng-scope" ng-repeat="(key, item) in series" style="--si-bar-color:var(--id3-color-action, var(--si-highlight, #15c));--si-bar-pct:15;--si-bar-pct-offset: 15" cx="21" cy="21" r="15.91549430918952" fill="transparent"></circle><!-- end ngRepeat: (key, item) in series --><circle class="si-graph-bar ng-scope" ng-repeat="(key, item) in series" style="--si-bar-color:var(--id3-color-action-400, #17a);--si-bar-pct:3;--si-bar-pct-offset: 0" cx="21" cy="21" r="15.91549430918952" fill="transparent"></circle><!-- end ngRepeat: (key, item) in series -->
                </svg>
                <div class="si-donut-content" ng-transclude="">
            <si-donut-chart-center class="ng-scope">
                <h3 class="ng-binding">782 639.07 $</h3>
                <em class="ng-binding">1 708.31 $</em>
                <span class="ng-binding">aux 2 semaines</span>
            </si-donut-chart-center>
        </div>
            </div>

            <div class="si-chart-legend">
                <!-- ngRepeat: (key, item) in series --><div class="si-chart-legend-item ng-scope" ng-repeat="(key, item) in series" style="--si-bar-color:#888">
                    <i class="si-bar-color"></i>
                    <span class="ng-binding">Estimation de l'hypothèque</span>
                </div><!-- end ngRepeat: (key, item) in series --><div class="si-chart-legend-item ng-scope" ng-repeat="(key, item) in series" style="--si-bar-color:var(--id3-color-action, var(--si-highlight, #15c))">
                    <i class="si-bar-color"></i>
                    <span class="ng-binding">Mise de fond</span>
                </div><!-- end ngRepeat: (key, item) in series --><div class="si-chart-legend-item ng-scope" ng-repeat="(key, item) in series" style="--si-bar-color:var(--id3-color-action-400, #17a)">
                    <i class="si-bar-color"></i>
                    <span class="ng-binding">Assurance hypothécaire</span>
                </div><!-- end ngRepeat: (key, item) in series -->
            </div>
        </div>

        <div class="si-mortgage-data-row">
            <label class="ng-binding">Valeur de la propriété</label>
            
            <div class="si-value ng-binding">
                895 673 $
            </div>
        </div>
        <div class="si-mortgage-data-row">
            <label class="ng-binding">Mise de fond</label>
            
            <!-- ngIf: result.mortgage.downpayment > 0 --><div class="si-value ng-binding ng-scope" ng-if="result.mortgage.downpayment > 0">
                - 134 350.95 $
            </div><!-- end ngIf: result.mortgage.downpayment > 0 -->
        </div>

        <div class="si-mortgage-data-row ">
            <label class="ng-binding">Assurance hypothécaire</label>
            <!-- ngIf: result.mortgage.insurance>0 --><div class="si-value ng-binding ng-scope" ng-if="result.mortgage.insurance>0">
                + 21 317.02 $
            </div><!-- end ngIf: result.mortgage.insurance>0 -->
        </div>
        <div class="si-mortgage-data-row total">
            <label class="ng-binding">Estimation de l'hypothèque</label>
            <div class="si-value ng-binding">
                782 639.07 $
            </div>
        </div>

        <div class="si-result-item mortgage">
            <label class="ng-binding">Versements hypothécaires estimés</label>
            <div class="si-value">
                <em class="ng-binding">1 708.31 $</em>
                <span class="ng-binding">aux 2 semaines</span>
            </div>
        </div>
        
        <div class="si-result-item transfer-taxes">
            <label class="ng-binding">Droits de mutation*</label>
            <div class="si-value">
                <em class="ng-binding">13 513 $</em>
            </div>
        </div>

        
        <div class="si-notice ng-binding">*Ce montant est affiché à titre indicatif seulement. Le montant des droits de mutation est basé sur les barèmes imposés par la municipalité ou les calculs de base généralement en vigueur au Québec. Consultez votre courtier immobilier pour obtenir le montant exact.</div>
        
    </div>

    <div class="si-calculator-results si-transfer-taxes-results">
        <h4 class="ng-binding">Droit de mutation</h4>

        <div class="si-results-container">
            <div class="si-input-group si-location-input">
                <label class="ng-binding">Sélectionnez une ville pour appliquer son algorithme de calcul</label>
                <div class="">
                    <i class="fad fa-map-marker-alt" aria-hidden="true"></i>

                    <div class="si-dropdown si-no-border ng-isolate-scope has-button-icon">
                        <div class="si-dropdown-button ng-binding">
                            Pas de ville particulière
                        </div>
                        <div class="si-dropdown-panel" aria-labelledby="dropdownMenuButton"><div class="si-dropdown-panel-content" ng-transclude="">
                            <div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(null)">Pas de ville particulière</div>
                            <!-- ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Alma</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Beaconsfield</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Blainville</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Boisbriand</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Boucherville</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Brossard</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Candiac</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Chambly</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Châteauguay</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Côte Saint-Luc</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Dollard-Des-Ormeaux</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Drummondville</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Farnham</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Gatineau</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Granby</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Kirkland</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">L'assomption</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Laval</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Lévis</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Longueuil</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Lorraine</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Magog</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Mascouche</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">McMasterville</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Mercier</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Mirabel</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Mont-Saint-Hilaire</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Montréal</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Mont-Tremblant</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Morin-Heights</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Otterburn Park</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Pointe-Claire</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Québec</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Repentigny</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Rimouski</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Ripon</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Rosemère</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Rouyn-Noranda</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Saguenay</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Saint-Bruno</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Saint-Colomban</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Saint-Constant</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Sainte-Agathe-des-Monts</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Sainte-Julie</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Sainte-Thérèse</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Saint-Eustache</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Saint-George</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Saint-Hyacinthe</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Saint-Jean-Sur-Richelieu</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Saint-Jérôme</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Saint-Lambert</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Saint-Sauveur</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Sallaberry-de-Valleyfield</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Shawinigan</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Sherbrooke</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Sorel-Tracy</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Terrebonne</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Trois-Rivières</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Val David</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Val D'Or</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Vaudreuil-Dorion</div><!-- end ngRepeat: city in cities --><div class="si-dropdown-item ng-binding ng-scope" data-ng-click="selectCity(city)" data-ng-repeat="city in cities">Victoriaville</div><!-- end ngRepeat: city in cities -->
                        </div></div>
                    </div>
                    
                </div>
                
                
            </div>

            <div class="si-value">
                <em class="ng-binding">13 513 $*</em>
                <div class="si-notice ng-binding">*Ce montant est affiché à titre indicatif seulement. Ce montant peut varier en fonction de la ville et peut également changer avec le temps. Consultez votre courtier immobilier pour plus de détails.</div>    
            </div>
            
            
        </div>
    </div>
</div>

    
</div>