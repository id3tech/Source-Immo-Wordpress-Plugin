<?php 
if(isset($model->building->attributes)){
?>
<div class="panel other-specs">
    <h3><?php _e('Building and interior',IMMODB) ?></h3>
    <?php 
    if(isset($model->building->dimension)){
    ?>
    <div class="area">
        <label><?php _e('Building area', IMMODB) ?>:</label>
        <div class="value"><?php echo($model->building->short_dimension) ?></div>
    </div>
    <?php 
    }
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
</div>
<?php
}
