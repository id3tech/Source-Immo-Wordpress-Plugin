<div class="expenses section {{sectionOpened('expenses')?'opened':''}}" >
    <div class="title" data-ng-click="toggleSection('expenses')"><div><?php _e('Expenses and assessments',SI) ?></div> <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div></div>
    <div class="content">

        <div class="label-value building-assessment">
            <label>{{'Building assessment ({0})'.translate().format(model.building.assessment.year)}}</label>
            <div class="value">{{model.building.assessment.amount.formatPrice()}}</div>
        </div>

        <div class="label-value land-assessment">
            <label>{{'Land assessment ({0})'.translate().format(model.land.assessment.year)}}</label>
            <div class="value">{{model.land.assessment.amount.formatPrice()}}</div>
        </div>

        <div class="expense-list">
            <div class="label-value" data-ng-repeat="exp in model.expenses">
                <label>{{getCaption(exp.type_code, 'expense_type')}}</label>
                <div class="value">{{exp.amount.formatPrice()}}</div>
            </div>
        </div>

    </div>
</div>