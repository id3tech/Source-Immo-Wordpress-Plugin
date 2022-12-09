<?php 
if(hasValue($model->land->short_dimension)){
?>
<div class="spec">
    <label><?php _e('Land area', SI) ?>:</label>
    <div class="value"><span><?php echo($model->land->short_dimension) ?></span></div>
</div>
<?php 
}

$lot_specs = SourceImmoListingsResult::getLotSpecs($model);
if(hasValue($lot_specs)){
    foreach ($lot_specs as $spec) {
        echo('<div class="spec">');
        echo("<label>{$spec->caption}</label>");
        echo('<div><span>');
        $values = array();
        foreach ($spec->values as $value) {
            $values[] = $value->caption;
        }
        echo(implode(', ', $values));
        echo('</span></div>');
        echo('</div>');
    }
}