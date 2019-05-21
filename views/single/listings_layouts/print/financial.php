<div class="financial">
    <div class="panel">

        <h4><?php echo StringPrototype::format(__('Assessment ({0})',SI), $model->assessment->year) ?></h4>
        <div class="list">
            <div class="assessment land">
                <label><?php echo StringPrototype::format(__('Land assessment ({0})',SI),$model->land->assessment->year) ?></label>
                <div class="value"><?php echo  $model->land->assessment->amount_text ?></div>
            </div>

            <div class="assessment building">
                <label><?php echo StringPrototype::format(__('Building assessment ({0})',SI), $model->building->assessment->year) ?></label>
                <div class="value"><?php echo  $model->building->assessment->amount_text ?></div>
            </div>

            <div class="assessment total">
                <label><?php _e('Municipal assessment',SI) ?></label>
                <div class="value"><?php echo  $model->assessment->amount_text ?></div>
            </div>
        </div>
    </div>

    <div class="panel">

        <h4><?php _e('Expenses',SI)?></h4>

        <div class="list">
        <?php
        foreach($model->expenses as $expense){
        ?>
            <div class="expense">
                <label><?php echo $expense->type ?></label>
                <div class="value"><?php echo  $expense->amount_text ?></div>
            </div>
        <?php
        }
        ?>
        </div>
    </div>
</div>