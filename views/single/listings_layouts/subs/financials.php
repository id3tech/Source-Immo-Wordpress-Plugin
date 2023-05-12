<div class="financials si-detail-section {{sectionOpened('financials')?'opened':''}}" 
        data-ng-if="isAvailableSection('financials')"
        data-ng-show="[model.building.assessment, model.land.assessment, model.expenses, model.incomes] | siHasValue">
    <div class="si-title" data-ng-click="toggleSection('financials')"><div><?php _e('Financial details',SI) ?></div> <div class="si-icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div></div>
    <div class="si-detail-section-content">
        
        
        
        <div class="assessments" data-ng-show="[model.assessment, model.building.assessment, model.land.assessment] | siHasValue">
            <h4><?php _e('Assessments',SI) ?></h4>
            <div class="si-label-value building-assessment" ng-show="model.building.assessment">
                <label>{{'Building ({0})'.translate().siFormat(model.building.assessment.year)}}</label>
                <div class="si-value">{{model.building.assessment.amount.formatPrice()}}</div>
            </div>

            <div class="si-label-value land-assessment" ng-show="model.land.assessment">
                <label>{{'Land ({0})'.translate().siFormat(model.land.assessment.year)}}</label>
                <div class="si-value">{{model.land.assessment.amount.formatPrice()}}</div>
            </div>
            <div class="si-label-value municipal-assessment" ng-show="model.assessment | siHasValue">
                <label>{{'Municipal'.translate()}} <span ng-show="model.assessment.year | siHasValue">({{model.assessment.year}})</span></label>
                <div class="si-value">{{model.assessment.amount.formatPrice()}}</div>
            </div>
        </div>

        <div class="incomes" data-ng-show="model.incomes | siHasValue">
            <h4><?php _e('Incomes',SI) ?></h4>
            <div class="income-list">
                <div class="si-label-value" data-ng-repeat="exp in model.incomes">
                    <label>{{exp.type}}</label>
                    <div class="si-value">{{exp.amount.formatPrice()}}</div>
                </div>
            </div>
        </div>
        

        <div class="expenses" data-ng-show="model.expenses | siHasValue">
            <h4><?php _e('Expenses',SI) ?></h4>
        
            <div class="expense-list">
                <div class="si-label-value" data-ng-repeat="exp in model.expenses">
                    <label>{{exp.type}}</label>
                    <div class="si-value">{{exp.amount.formatPrice()}}</div>
                </div>
            </div>
        </div>
    </div>
</div>