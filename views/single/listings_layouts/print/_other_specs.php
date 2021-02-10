<?php 
$other_specs = SourceImmoListingsResult::getOtherSpecs($model);
if(hasValue($other_specs)){
    foreach ($other_specs as $spec) {
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