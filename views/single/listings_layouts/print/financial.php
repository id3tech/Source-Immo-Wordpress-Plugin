<div class="financial">
    <div class="panel">

        <h4><?php _e('Assessments',SI) ?></h4>
        <div class="list">
            <div class="list-item assessment land">
                <label><?php echo StringPrototype::format(__('Land ({0})',SI),$model->land->assessment->year) ?></label>
                <div class="value"><?php echo  $model->land->assessment->amount_text ?></div>
            </div>

            <div class="list-item assessment building">
                <label><?php echo StringPrototype::format(__('Building ({0})',SI), $model->building->assessment->year) ?></label>
                <div class="value"><?php echo  $model->building->assessment->amount_text ?></div>
            </div>

            <div class="list-item assessment total">
                <label><?php echo StringPrototype::format(__('Municipal ({0})',SI),$model->assessment->year) ?></label>
                <div class="value"><?php echo  $model->assessment->amount_text ?></div>
            </div>
        </div>
    </div>

    <div class="panel <?php hasValue($model->expenses, "","hidden") ?>">

        <h4><?php _e('Expenses',SI)?></h4>

        <div class="list">
        <?php
        foreach($model->expenses as $expense){
        ?>
            <div class="list-item expense">
                <label><?php echo $expense->type ?></label>
                <div class="value"><?php echo  $expense->amount_text ?></div>
            </div>
        <?php
        }
        ?>
        </div>
    </div>

    <div class="panel <?php hasValue($model->incomes, "","hidden") ?>">
        <h4><?php _e('Incomes',SI)?></h4>

        <div class="list">
        <?php
        foreach($model->incomes as $income){
        ?>
            <div class="list-item income">
                <label><?php echo $income->type ?></label>
                <div class="value"><?php echo  $income->amount_text ?></div>
            </div>
        <?php
        }
        ?>
        </div>
    </div>
</div>