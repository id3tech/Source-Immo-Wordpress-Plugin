<?php
$pageBuilder = new SourceImmoPageBuilder('agency');


$pageBuilder->start_page();

$ref_number = get_query_var( 'ref_number');
$ref_type = get_query_var( 'type' );
// $layout = SourceImmo::current()->get_detail_layout('broker');

// get_header();


$pageBuilder->close_page();
$pageBuilder->render();
