<?php 
if(isset($model->land->attributes) || (isset($model->land->short_dimension) && ($model->land->short_dimension != ''))){
?>
<div class="panel land-specs">
    <h3><?php _e('Lot and exterior',SI) ?></h3>
    <?php 
    if(isset($model->land->dimension)){
    ?>
    <div class="area">
        <label><?php _e('Land area', SI) ?>:</label>
        <div class="value"><?php echo($model->land->short_dimension) ?></div>
    </div>
    <?php 
    }

    if(isset($model->land->attributes)){
    ?>
    <div class="content spec-grid">
        <?php 
        foreach ($model->land->attributes as $spec) {
            echo('<div class="spec">');
            echo("<label>{$spec->caption}</label>");
            echo('<div>');
            $values = array();
            foreach ($spec->values as $value) {
                $values[] = $value->caption;
            }
            echo(implode(', ', $values));
            echo('</div>');
            echo('</div>');
        }
        ?>
    </div>
    <?php
    }
    ?>
</div>
<?php
}
