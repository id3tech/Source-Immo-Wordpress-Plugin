<?php

namespace SI\Bases;

class Module{

    public function register_actions(){}
    public function register_filters(){}
    
    public function includes(){}

    public function get_script_depends() {
    	return [ ];
    }

    public function get_style_depends() {
    	return [ ];
    }

}