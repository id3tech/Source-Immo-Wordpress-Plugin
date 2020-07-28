<div class="si-detail-section specs" ng-if="[model.languages,model.experience_start_date] | siHasValue">

        <div class="si-extra-item" ng-if="model.languages | siHasValue">
            <label><?php _e('Spoken language(s)',SI)?></label>
            <div class="si-value {{model.languages.length > 1 ? 'si-multiple' : ''}}">
                <span ng-repeat="lang in model.languages">{{lang | captionOf  : 'language'}}</span>
            </div>
        </div>

        <div class="si-extra-item" ng-if="model.experience_start_date | siHasValue">
            <label><?php _e('Experience',SI)?></label>
            <div class="si-value">
                <span>{{model.experience_start_date | timeLength}}</span>
            </div>
        </div>
    
</div>