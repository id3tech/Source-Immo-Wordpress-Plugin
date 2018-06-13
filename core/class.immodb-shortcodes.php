<?php

class ImmoDbShorcodes{

    public function __construct(){
        
    }

    public function init_hook(){
        $hooks = array(
            'immodb'
        );

        foreach ($hooks as $item) {
            add_shortcode( $item, array($this, 'sc_' . $item) );
        }
    }
  
    public function sc_immodb($atts, $content=null){
        // Extract attributes to local variables
        extract( shortcode_atts(
            array(
                
            ), $atts )
        );
    }
}
