<?php

class SourceImmoLexicon {
    private $_stringTable;

    function __construct(){
        $this->_stringTable = [];
        add_action('init', [$this, 'init']);
    }

    function init(){
        $this->load(si_get_locale());
    }

    function load($locale){
        $filePath = apply_filters('si/lexicon/path', SI_PLUGIN_DIR . "scripts/locales/lexicon.{$locale}.json", $locale);
        
        if(file_exists($filePath)){
            $data = json_decode(file_get_contents($filePath),true);
            foreach ($data as $key => $value) {
                $this->add($value, $key);
            }
            //$this->_stringTable = $data;
        }
    }

    function add($value, $key=null){
        if($key == null) $key = $value;
        
        // apply global hook
        $value = apply_filters('si/label', $value);
        // apply class hook
        $value = apply_filters('si/lexicon/label',$value);

        $this->_stringTable[$key] = $value;
    }

    function get($value){
        if(!isset($this->_stringTable[$value])) {
            $this->add($value);
        }

        return $this->_stringTable[$value];
    }

    // Turn stringTable into a JSON format to use on the client side
    function toJSON(){
        return json_encode($this->_stringTable);
    }
}

global $siLexicon;
$siLexicon = new SourceImmoLexicon;

