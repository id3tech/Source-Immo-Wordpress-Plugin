<?php


$pageBuilder = new SourceImmoPageBuilder('listing');

$pageBuilder->start_page();


$ref_number = get_query_var( 'ref_number');
$ref_type = get_query_var( 'type' );

//do_action('si_render_page',$pageBuilder->layout->page);

$pageBuilder->close_page();


$pageBuilder->render();

