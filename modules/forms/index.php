<?php
// We're in Wordpress, good!
if(!defined("ABSPATH")) die;

if(class_exists('GFForms')){
    require_once('gravity-forms.php');
}

if(class_exists('WPCF7_ContactForm')){
    require_once('contact-form-7.php');
}


