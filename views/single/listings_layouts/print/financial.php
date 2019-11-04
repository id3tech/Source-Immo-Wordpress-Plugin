<div class="financial">
    <div class="panel  <?php iifHasValue(array($model->assessment,$model->land->assessment,$model->building->assessment) , "","hidden") ?>">

        <h4><?php _e('Assessments',SI) ?></h4>
        <div class="list">
            <?php if(hasValue($model->land->assessment)){ ?>
            <div class="list-item assessment land">
                <label><?php echo StringPrototype::format(__('Land ({0})',SI),$model->land->assessment->year) ?></label>
                <div class="value"><?php echo  $model->land->assessment->amount_text ?></div>
            </div>
            <?php } ?>

            <?php if(hasValue($model->building->assessment)){ ?>
            <div class="list-item assessment building">
                <label><?php echo StringPrototype::format(__('Building ({0})',SI), $model->building->assessment->year) ?></label>
                <div class="value"><?php echo  $model->building->assessment->amount_text ?></div>
            </div>
            <?php } ?>

            <?php if(hasValue($model->assessment)){ ?>
            <div class="list-item assessment total <?php iifHasValue($model->assessment, '','hidden') ?>">
                <label><?php echo StringPrototype::format(__('Municipal ({0})',SI),$model->assessment->year) ?></label>
                <div class="value"><?php echo  $model->assessment->amount_text ?></div>
            </div>
            <?php } ?>
        </div>
    </div>

    <div class="panel <?php iifHasValue($model->expenses, "","hidden") ?>">

        <h4><?php _e('Expenses',SI)?></h4>

        <div class="list">
        <?php
        if(hasValue($model->expenses)){
            foreach($model->expenses as $expense){
            ?>
                <div class="list-item expense">
                    <label><?php echo $expense->type ?></label>
                    <div class="value"><?php echo  $expense->amount_text ?></div>
                </div>
            <?php
            }
        }
        ?>
        </div>
    </div>

    <div class="panel <?php iifHasValue($model->incomes, "","hidden") ?>">
        <h4><?php _e('Incomes',SI)?></h4>

        <div class="list">
        <?php
        if(hasValue($model->incomes)){
            foreach($model->incomes as $income){
            ?>
                <div class="list-item income">
                    <label><?php echo $income->type ?></label>
                    <div class="value"><?php echo  $income->amount_text ?></div>
                </div>
            <?php
            }
        }
        ?>
        </div>
    </div>
</div>