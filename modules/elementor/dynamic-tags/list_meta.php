<?php
class SourceImmoListMetaTags extends \Elementor\Core\DynamicTags\Tag {
        
    public function get_name() {
        return 'SourceImmoListMetaTags';
    }

    public function get_categories() {
        return [ 'text' ];
    }

    public function get_group() {
        return [ 'post' ];
    }

    public function get_title() {
        return __('Source.Immo - List meta',SI);
    }

    protected function _register_controls() {
        $siConfigs = SourceImmo::current()->configs;
        $aliasList = array();
        foreach ($siConfigs->lists as $list) {
            $aliasList[$list->alias] = $list->alias;
        }

        $this->add_control(
            'alias',
            [
                'label' => __('List alias', SI),
                'type' => \Elementor\Controls_Manager::SELECT,
                'placeholder' => '',
                'options' => $aliasList,
                'default' => ''
            ]
        );
        
        $this->add_control(
            'meta_field',
            [
                'label' => __( 'Value of', 'text-domain' ),
                'type' => \Elementor\Controls_Manager::SELECT,
                'default' => 'item_count',
                'options' => [
                    'item_count' => __( 'List count', SI )
                ],
            ]
        );

        $this->add_control(
            'format_text',
            [
                'label' => __( 'Format text', SI ),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => '',
            ]
        );

    }

    public function render() {
        $alias = $this->get_settings( 'alias' );
        $meta_field = $this->get_settings( 'meta_field' );
        $format_text = $this->get_settings( 'format_text' );
        

        if(is_admin()){

            $admin_print = $this->format_text(3, $format_text);
            echo($admin_print);
            return;
        }
        
        $listConfigs = SourceImmo::current()->get_list_configs($alias);
        $value = 0;
        if($listConfigs != null){
            $data = SourceImmoApi::get_data($listConfigs);
            $value = $data->metadata->{$meta_field};
        }
        
        

        $lPrint = $this->format_text($value, $format_text);

        
        echo($lPrint);
    }

    function format_text($value,$format){
        if($format == '') return $value;
        
        $lResult = str_replace('{0}',$value, $format);
        // replace singular pieces
        $matches = null;

        if(strpos($lResult,'{s') !== false ){
            $singularPattern = '/\{s\:?([a-zA-Z]*)\}/';
            if($value > 1){
                $lResult = preg_replace($singularPattern, '', $lResult);
            }
            else{
                $lResult = str_replace('{s}', '', $lResult);
                $lResult = preg_replace($singularPattern, '$1', $lResult);
            }
        }

        // replace singular pieces
        if(strpos($lResult,'{p') !== false){
            $pluralPattern = '/\{p\:?([a-zA-Z]*)\}/';
            if($value <= 1){
                $lResult = preg_replace($pluralPattern, '', $lResult);
            }
            else{
                $lResult = str_replace('{p}', 's', $lResult);
                $lResult = preg_replace($pluralPattern, '$1', $lResult);

            }
        }

        return $lResult;
    }
}
