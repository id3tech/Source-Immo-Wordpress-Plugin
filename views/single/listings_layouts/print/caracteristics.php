<?php 

$lGlobalAttributes = $model->other->attributes;
if(isset($all) && $all === true){
    $lGlobalAttributes = $model->attributes;
}

if(isset($lGlobalAttributes) && is_array($lGlobalAttributes) && count($lGlobalAttributes)>0){
?>
<div class="panel other-specs">
    <h3><?php _e('Characteristics',SI) ?></h3>
    <div class="content spec-grid">
        <?php 
        foreach ($lGlobalAttributes as $spec) {
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
