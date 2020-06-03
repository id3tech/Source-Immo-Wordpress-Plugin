<?php
$configs = SourceImmo::current()->configs;

if(isset($configs->site_logo) && $configs->site_logo != null){
    echo('<div class="site-logo">');
    echo('<img src="' . $configs->site_logo->url . '" />');
    echo('</div>');
}