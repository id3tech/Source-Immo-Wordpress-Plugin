<div class="expenses detail-section {{sectionOpened('expenses')?'opened':''}}" 
        data-ng-show="[model.building.assessment, model.land.assessment, model.expenses] | siHasValue">
    <div class="title" data-ng-click="toggleSection('expenses')"><div><?php _e('Expenses and assessments',SI) ?></div> <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div></div>
    <div class="detail-section-content">

        <div class="label-value building-assessment" ng-show="model.building.assessment">
            <label>{{'Building assessment ({0})'.translate().format(model.building.assessment.year)}}</label>
            <div class="value">{{model.building.assessment.amount.formatPrice()}}</div>
        </div>

        <div class="label-value land-assessment" ng-show="model.land.assessment">
            <label>{{'Land assessment ({0})'.translate().format(model.land.assessment.year)}}</label>
            <div class="value">{{model.land.assessment.amount.formatPrice()}}</div>
        </div>

        <div class="expense-list">
            <div class="label-value" data-ng-repeat="exp in model.expenses">
                <label>{{exp.type}}</label>
                <div class="value">{{exp.amount.formatPrice()}}</div>
            </div>
        </div>

    </div>
</div>