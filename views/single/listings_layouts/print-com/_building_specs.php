<?php 
if(hasValue($model->building->short_dimension)){
?>
<div class="spec">
    <label><?php _e('Building dimensions', SI) ?>:</label>
    <div class="value"><span><?php echo($model->building->short_dimension) ?></span></div>
</div>
<?php 
}

$building_specs = SourceImmoListingsResult::getBuildingSpecs($model);
if(hasValue($building_specs)){ 
    foreach ($building_specs as $spec) {
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