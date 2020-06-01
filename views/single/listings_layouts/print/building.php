<?php 
if(isset($model->building->attributes) || (isset($model->building->short_dimension) && ($model->building->short_dimension != ''))){
?>
<div class="panel building-specs">
    <h3><?php _e('Building and interior',SI) ?></h3>
    <?php 
    if(isset($model->building->dimension)){
    ?>
    <div class="area">
        <label><?php _e('Building area', SI) ?>:</label>
        <div class="value"><?php echo($model->building->short_dimension) ?></div>
    </div>
    <?php 
    }

    if(isset($model->building->attributes)){
    ?>
    <div class="content spec-grid">
        <?php 
        foreach ($model->building->attributes as $spec) {
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
