<div class="si-detail-section si-specs" ng-if="[model.languages,model.experience_start_date] | siHasValue">

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

        <div class="si-extra-item si-protections" ng-if="model.protection_codes | siHasValue">
            <label><?php _e('Protections',SI)?></label>
            <div class="si-value .{{model.protection_codes.join(' .').toLowerCase()}}">
                <span ng-repeat="protection in model.protection_codes" class="{{protection.toLowerCase()}}">
                    <span>{{protection | captionOf : 'protection'}}</span>
                </span>
            </div>
        </div>
    
</div>