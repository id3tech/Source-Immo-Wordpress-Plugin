<?php
$layout = isset($configs->search_engine_options->type) ? $configs->search_engine_options->type : 'full';

SourceImmo::view("list/brokers/search/layout_{$layout}", array(
    "configs" => $configs
));