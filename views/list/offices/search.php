<?php
$layout = isset($configs->search_engine_options->type) ? $configs->search_engine_options->type : 'full';

SourceImmo::view("list/offices/search/layout_{$layout}", array(
    "configs" => $configs
));