<div class="specs">
    <div class="si-extra-item ng-scope" ng-if="model.languages | siHasValue">
        <label>Langue(s) parlée(s)</label>
        <div class="si-value ">
            <span ng-repeat="lang in model.languages" class="ng-binding ng-scope">Français</span>
        </div>
    </div>

    <div class="si-extra-item ng-scope" ng-if="model.experience_start_date | siHasValue">
        <label>Expérience</label>
        <div class="si-value">
            <span class="ng-binding">11 ans</span>
        </div>
    </div>
</div>