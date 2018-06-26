<?php

class ImmoDbShorcodes{

    public function __construct(){
        
        $this->init_hook();
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
                'alias' => 'default'
            ), $atts )
        );

        ob_start();
        $listConfig = ImmoDB::current()->get_list_configs($alias);

        if($listConfig != null){
            ImmoDB::view("list/{$listConfig->type}/{$listConfig->list_layout->preset}", array("configs" => $listConfig));
        }

        $lResult = ob_get_flush();
        ob_clean();

        return $lResult;
    }
}
