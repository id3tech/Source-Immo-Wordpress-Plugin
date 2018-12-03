<?php 
if(isset($model->other->attributes)){
?>
<div class="panel other-specs">
    <h3><?php _e('Characteristics',IMMODB) ?></h3>
    <div class="content spec-grid">
        <?php 
        foreach ($model->other->attributes as $spec) {
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
