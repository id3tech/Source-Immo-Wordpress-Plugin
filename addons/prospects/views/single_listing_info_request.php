<?php
$ref_number = get_query_var( 'ref_number');
global $listing_data;


if($addon->active_configs->leadgrabber_token == ''){
    _e('Prospects lead grabber token not configured');
}
else{
 echo('<iframe src="' . $addon->get_iframe_url($ref_number) . '"></iframe>');
}