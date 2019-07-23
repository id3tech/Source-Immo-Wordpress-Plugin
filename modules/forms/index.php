<?php
// We're in Wordpress, good!
if(!defined("ABSPATH")) die;

define('SI_FORM_MODULE_PATH',dirname(__FILE__));

$form_modules = array(
    'gravity-forms',
    'contact-form-7'
);

foreach ($form_modules as $mod_name) {
    require_once(SI_FORM_MODULE_PATH . "/{$mod_name}.php");
}


