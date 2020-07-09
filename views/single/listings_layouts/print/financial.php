<div class="financial">
    <div class="panel bordered">

        <h3><?php _e('Assessments',SI) ?></h3>
        
        <div class="content list">
            <?php if(hasValue($model->land->assessment)){ ?>
            <div class="list-item assessment land">
                <label><?php echo StringPrototype::format(__('Land ({0})',SI),$model->land->assessment->year) ?></label>
                <div class="value"><span><?php echo  $model->land->assessment->amount_text ?></span></div>
            </div>
            <?php } ?>

            <?php if(hasValue($model->building->assessment)){ ?>
            <div class="list-item assessment building">
                <label><?php echo StringPrototype::format(__('Building ({0})',SI), $model->building->assessment->year) ?></label>
                <div class="value"><span><?php echo  $model->building->assessment->amount_text ?></span></div>
            </div>
            <?php } ?>

            <?php if(hasValue($model->assessment)){ ?>
            <div class="list-item assessment total <?php iifHasValue($model->assessment, '','hidden') ?>">
                <label><?php _e('Municipal', SI) ?> <?php 
                    echo iifHasValue($model->assessment->year, '(' . $model->assessment->year . ')','');
                ?></label>
                <div class="value"><span><?php echo  $model->assessment->amount_text ?></span></div>
            </div>
            <?php } ?>
        </div>
    </div>

    <div class="panel bordered">

        <h3><?php _e('Expenses',SI)?></h3>

        <div class="content list">
        <?php
        if(hasValue($model->expenses)){
            foreach($model->expenses as $expense){
            ?>
                <div class="list-item expense">
                    <label><?php echo $expense->type ?></label>
                    <div class="value"><span><?php echo  $expense->amount_text ?></span></div>
                </div>
            <?php
            }
        }
        ?>
        </div>
    </div>

    <div class="panel bordered <?php iifHasValue($model->incomes, "","hidden") ?>">
        <h3><?php _e('Incomes',SI)?></h3>

        <div class="content list">
        <?php
        if(hasValue($model->incomes)){
            foreach($model->incomes as $income){
            ?>
                <div class="list-item income">
                    <label><?php echo $income->type ?></label>
                    <div class="value"><span><?php echo  $income->amount_text ?></span></div>
                </div>
            <?php
            }
        }
        ?>
        </div>
    </div>
</div>