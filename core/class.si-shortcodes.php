<?php

class SiShorcodes{

    public function __construct(){
        
        $this->init_hook();
    }

    public function init_hook(){
        $hooks = array(
            'si',
            'si_search',
            'si_searchbox',
            'si_small_list',
            'si_list_slider',

            // Broker - Sub shortcodes
            'si_broker',
            'si_broker_listings',
            'si_broker_part',
            
            // Listing - Sub shortcodes
            'si_listing',
            'si_listing_brokers',
            'si_listing_part',
            
            // Office - Sub shortcodes
            'si_office',
            'si_office_part',
            'si_office_listings',
            'si_office_brokers',


            // Agency - Sub shortcodes
            'si_agency',
            'si_agency_part',
            'si_agency_listings',
            'si_agency_brokers',
            'si_agency_offices',

            // City
            'si_city',

            // Tools
            'si_tool_calculator',
        );

        foreach ($hooks as $item) {
            add_shortcode( $item, array($this, 'sc_' . $item) );
        }
    }

    public function sc_si_list_slider($atts, $content=null){
        extract( shortcode_atts(
            array(
                'alias' => null,
                'class' => '',
                'type'  => 'hero',  // hero | fullwidth | fullscreen
                'limit' => 5,
                'detail_label' => 'View detail',
                'show_navigation' => 'true',
                'height' => '500px'
            ), $atts )
        );

        if($alias == null) return '';
        
        $listConfigs = SourceImmo::current()->get_list_configs($alias);

        ob_start();
        ?>
        <si-list-slider class="<?php echo($class) ?> slider-type-<?php echo($type) ?>" 
                si-alias="<?php echo($alias) ?>"
                si-options="{show_navigation:<?php echo $show_navigation ?>, limit: <?php echo $limit ?>, minHeight: '<?php echo $height ?>'}">
                </si-list-slider>
        <?php
        echo('<script type="text/ng-template" id="si-list-slider-for-'. $alias . '">');
        SourceImmo::view("list/{$listConfigs->type}/slider/item");
        echo('</script>');
        $lResult = ob_get_clean();

        return $lResult;
    }

    public function sc_si_searchbox($atts, $content=null){
        extract( shortcode_atts(
            array(
                'alias' => '',
                'placeholder' => 'Type here to begin your search...',
                'on_enter' => '',
                'result_page' => ''
            ), $atts )
        );

        ob_start();
        echo('<si-search-box alias="' . $alias . '" placeholder="'. $placeholder .'" on-enter="'. $on_enter .'" result-page="'. $result_page .'"></si-search-box>');
        $lResult = ob_get_clean();

        return $lResult;
    }
  
    public function sc_si_search($atts, $content=null){
        extract( shortcode_atts(
            array(
                'alias' => 'default',
                'result_page' => null,
                'standalone' => false,
            ), $atts )
        );
        $listConfig     = SourceImmo::current()->get_list_configs($alias);
        $resultUrl      = isset($result_page) ? $result_page : get_the_permalink( $listConfig->result_page );
        $search_layout  = isset($listConfig->search_engine_options->type) ? $listConfig->search_engine_options->type : 'full';
        $search_tabbed  = isset($listConfig->search_engine_options->tabs) && count($listConfig->search_engine_options->tabs)>1;

        $searchContainerClasses = array('si-search-container');
        if($search_tabbed){
            $searchContainerClasses[] = 'si-has-tabs';
        }

        if(isset($listConfig->search_engine_options->scope_class)) $searchContainerClasses[] = $listConfig->search_engine_options->scope_class;
        
        ob_start();

        
        echo('<div class="si standard-layout">');
        echo('<si-search si-alias="'. $alias . '" class="' . implode(' ', $searchContainerClasses) . '" si-result-url="' . $resultUrl . '" si-standalone="' . $standalone . '"></si-search>');

        
        if($listConfig->search_engine_options->filter_tags == 'outside'){
            echo('<si-search-filter-tags si-alias="' . $alias . '"></si-search-filter-tags>');
        }
        

        echo('<script type="text/ng-template" id="si-search-for-'. $alias . '">');
        SourceImmo::view('list/' . $listConfig->type . '/search', array("configs" => $listConfig)); 
        echo('</script>');
        echo('</div>');
        $lResult = ob_get_clean();

        return $lResult;
    }

    public function sc_si($atts, $content=null){
        // Extract attributes to local variables
        extract( shortcode_atts(
            array(
                'alias' => 'default',
                'layout' => null,
                'show_list_meta' => null,
                'side_scroll' => false
            ), $atts )
        );

        ob_start();

        
        $listConfig = SourceImmo::current()->get_list_configs($alias);
        

        if($listConfig != null){
            if($layout != null){
                $listConfig->list_layout->preset = 'direct';
            }
            if($show_list_meta != null){
                $listConfig->show_list_meta = $show_list_meta=="true";
            }

            $scopeClass = $listConfig->list_layout->scope_class;

            $global_container_classes = array('si','si-list-container', $listConfig->list_layout->preset . '-layout', "si-list-of-{$listConfig->type}", $scopeClass);
            
            if(!str_null_or_empty($listConfig->list_layout->custom_css)){
                echo('<style for="' . $alias . '">' . str_replace('selector', '.' . trim(implode('.',$global_container_classes),'.') , $listConfig->list_layout->custom_css) . '</style>');
            }
            if(!str_null_or_empty($listConfig->list_item_layout->custom_css)){
                //echo('<style for="' . $alias . '_item">' . str_replace('selector', '.' . trim(implode('.',$global_container_classes),'.') . ' .si-item' , $listConfig->list_item_layout->custom_css) . '</style>');
            }

            if(in_array($listConfig->list_layout->preset, array('direct'))){
                SourceImmo::view("list/{$listConfig->type}/{$listConfig->list_layout->preset}", array("configs" => $listConfig, "sc_atts" => $atts));
            }
            else{
                $styles = array(SourceImmo::styleToAttr($listConfig->list_item_layout->styles));
                $attr = [];
                if($side_scroll){
                    $attr = ['si-side-scroll'];
                }
                echo('<div class="si-list-of-item">');
                echo('<si-list si-alias="' . $alias . '" si-class="' . implode(' ' , $global_container_classes) . '" style="'. implode(';',$styles) .'"></si-list>');
                if(SourceImmo::current()->configs->prefetch_data){
                    $listData = SourceImmoApi::get_data($listConfig);
                    echo('<script> if(typeof $preloadDatas=="undefined") var $preloadDatas = {}; $preloadDatas["' . $alias . '"] =' . json_encode($listData) .'</script>');
                }
                
                echo('<script type="text/ng-template" id="si-template-for-'. $alias . '">');
                SourceImmo::view("list/{$listConfig->type}/{$listConfig->list_layout->preset}", array("configs" => $listConfig, "sc_atts" => $atts));
                echo('</script>');

                if($listConfig->searchable){ 
                    echo('<script type="text/ng-template" id="si-search-for-'. $alias . '">');
                    SourceImmo::view('list/' . $listConfig->type . '/search', array("configs" => $listConfig, "sc_atts" => $atts)); 
                    echo('</script>');
                }
                echo('</div>');
            }
        }

        $lResult = ob_get_clean();

        return $lResult;
    }

    public function sc_si_small_list($atts, $content=null){
        // Extract attributes to local variables
        extract( shortcode_atts(
            array(
                'type' => 'listings',
                'where' => null,
                'class' => '',
                'layout' => '',
                'show_header' => true,
                'limit' => 0,
                'sort' => '',
                'sort_function' => null,
                'options' => null
            ), $atts )
        );
        $show_header =  $show_header==true ? 'true' : 'false';
        $sortFields = '';
        if($sort != ''){
            $sortArr = explode('|',$sort);
            $sortFields = array();
            foreach ($sortArr as $value) {
                $sortFieldArr = explode(" ",$value);
                $field = $sortFieldArr[0];
                if($field!=''){
                    $fieldDesc = (isset($sortFieldArr[1])) ? (($sortFieldArr[1]=='desc') ? 'true':'false') : 'false';
                    $sortFields[] = '{field:\'' . $field . '\', desc: ' . $fieldDesc .'}';
                }
            }
            //$sortFields = implode ( ',',$sortFields);
        }
        ob_start();
        if($options == null){
            $options = '{}';
        }
        else{
            $options = str_replace(
                array('"',  "'"),
                array('\"', '"'),
                $options
            );
            $options = preg_replace('/(\w+):/i', '"\1":', $options);
        }

        $options = array_merge([
            'show_header' => $show_header==='true'||$show_header===true,
            'filter' => [
                'max_item_count' => $limit,
                'sort_fields' => $sortFields
            ],
        ], json_decode($options,true));

        // search for default item layout 
        $listConfig = current(array_filter(SourceImmo::current()->configs->lists, function($l) use ($type) {
            return $type == $l->type && $l->is_default_type_configs;
        }));

        
        if($layout == ''){
            $layout =  ($type == 'listings') ? 'small' : 'small';

            if($listConfig != null){
                $layout = $listConfig->list_item_layout->layout;
            }

        }
        
        

        $sortByAttr = '';
        if($sort_function!=null){
            $sortByAttr = 'si-sort-by="' . $sort_function . '"';
        }        
        ?>
        
        <si-small-list class="<?php echo($class) ?>"
                si-options='<?php echo preg_replace('/"([a-zA-Z]+[a-zA-Z0-9_]*)":/','$1:', json_encode($options, JSON_FORCE_OBJECT)) ?>'
                <?php echo($sortByAttr) ?>
                si-type="<?php echo($type) ?>" si-filters="<?php echo($where) ?>" ></si-small-list>
        <?php
        echo('<script type="text/ng-template" id="si-template-for-'. $type . '">');
        SourceImmo::view("list/{$type}/standard/item-{$layout}", ['configs'=> $listConfig]);
        echo('</script>');
        $lResult = ob_get_clean();

        return $lResult;
    }


    public function sc_si_listing_brokers($atts, $content=null){
        $ref_number = get_query_var( 'ref_number');
        ob_start();
            echo do_shortcode('[si_small_list class="brokers broker-list si-list-of-brokers" layout="card" type="brokers" sort_function="sortBrokerList($list)" where="getBrokerListFilter()" options="{columns:{desktop:2, laptop:2}}"]');
        $lResult = ob_get_clean();

        return $lResult;
    }


    #region Broker - Sub shortcodes
    public function sc_si_broker($atts, $content){
        extract( shortcode_atts(
            array(
                'ref_number' => '',
                'load_text' => 'Loading broker',
                'class' => ''
            ), $atts )
        );
        if($ref_number == ''){
            $ref_number = get_query_var( 'ref_number');
        }
        if($ref_number == '') return '';

        $data = json_decode(SourceImmoApi::get_broker_data($ref_number));
        if($data != null){
            global $dictionary;
            $brokerWrapper = new SourceImmoBrokersResult();
            $dictionary = new SourceImmoDictionary($data->dictionary);
            $brokerWrapper->preprocess_item($data);
        }
        
        ob_start();
        $isolation = SourceImmo::current()->get_isolation('broker');
        if($isolation == 'ISOLATE'){
            echo("<div data-ng-controller=\"singleBrokerCtrl\" data-ng-init=\"init('{$ref_number}')\">");
        }

        ?>
        
        <div class="si si-single-content broker-single <?php echo($class) ?> {{model.status}} {{model!=null?'si-loaded':''}}">
            <?php
            do_action('si_start_of_template', $load_text);
            if($load_text != null){
                echo('<label class="si-placeholder"  data-ng-show="model==null">' .  __($load_text,SI) . ' <i class="fal fa-spinner fa-spin"></i></label>');
            }
            echo('<div class="si-content"  ng-cloak >');

            
            if($content != null){
                echo(do_shortcode($content));
            }
            else{
                SourceImmo::view('single/brokers_layouts/standard');
            }
            echo('</div>');
            do_action('si_end_of_template');
            ?>
        </div>
        <?php
        if($isolation == 'ISOLATE'){
            echo("</div>");
        }

        if(SourceImmo::current()->configs->prefetch_data){
        ?>                
        <script type="text/javascript">
        var siBrokerData = <?php 
            echo(json_encode($data)); 
        ?>;
        </script>
        <?php
        }

        $result = ob_get_contents();
        ob_end_clean();
        return $result;
    }

    /**
     * Display broker listings
     */
    public function sc_si_broker_listings($atts, $content=null){
        $ref_number = get_query_var( 'ref_number');
        ob_start();
            
            echo do_shortcode('[si_small_list class="listing-list si-list-of-listings" type="listings" where="{field:\'brokers_ref_numbers\', operator : \'array_contains\', value: \'' . $ref_number . '\'}"]');
            

        $lResult = ob_get_clean();

        return $lResult;
    }

    public function sc_si_broker_part($atts, $content){
        // Extract attributes to local variables
        extract( shortcode_atts(
            array(
                'part' => '',
                'align' => 'align-stretch',
                'class' => '',
                'hide_empty' => false
            ), $atts )
        );

        $lResult = '';
        
        if($part != ''){
            ob_start();

            SourceImmo::view('single/brokers_layouts/subs/' . $part); 

            $lResult = ob_get_clean();
        }
        $sanitizedPart = sanitize_title(str_replace('_','-',$part));
        $attrPart = [];
        $classes = ['si-part', $align, 'si-part-' . $sanitizedPart, $class];

        if($hide_empty !== false){
            if(in_array($hide_empty, ['soft','hard'])){
                $attrPart[] = 'si-hide-empty="{method:\'' . $hide_empty . '\'}"';
                
            }
            else{
                $attrPart[] = 'si-hide-empty';
            }
        }
        
        $lResult = '<div class="'. implode(' ', $classes) .'" '. implode(' ', $attrPart) .'>' . $lResult . '</div>';
        
        return $lResult;
    }
    
    #endregion

    #region Office - Sub shortcodes

    public function sc_si_office($atts, $content){
        extract( shortcode_atts(
            array(
                'ref_number' => '',
                'load_text' => 'Loading office',
                'class' => ''
            ), $atts )
        );
        if($ref_number == ''){
            $ref_number = get_query_var( 'ref_number');
        }
        if($ref_number == '') return '';

        $data = json_decode(SourceImmoApi::get_office_data($ref_number));
        if($data != null){
            global $dictionary;
            $officeWrapper = new SourceImmoOfficesResult();
            $dictionary = new SourceImmoDictionary($data->dictionary);
            $officeWrapper->preprocess_item($data);
        }
        
        ob_start();
        $isolation = SourceImmo::current()->get_isolation('office');
        if($isolation == 'ISOLATE'){
            echo("<div data-ng-controller=\"singleOfficeCtrl\" data-ng-init=\"init('{$ref_number}')\">");
        }
        ?>
        
        <div class="si si-single-content office-single <?php echo($class) ?> {{model.status}} {{model!=null?'si-loaded':''}}">
            <?php
            do_action('si_start_of_template', $load_text);
            if($load_text != null){
                echo('<label class="si-placeholder"  data-ng-show="model==null">' .  __($load_text,SI) . ' <i class="fal fa-spinner fa-spin"></i></label>');
            }
            echo('<div class="si-content"  ng-cloak si-adaptative-class >');

            
            if($content != null){
                echo(do_shortcode($content));
            }
            else{
                SourceImmo::view('single/offices_layouts/standard');
            }

            echo('</div>');
            do_action('si_end_of_template');
            ?>
        </div>
        <?php
        
        if($isolation == 'ISOLATE'){
            echo("</div>");
        }

        if(SourceImmo::current()->configs->prefetch_data){
        ?>                
        <script type="text/javascript">
        var siOfficeData = <?php 
            echo(json_encode($data)); 
        ?>;
        </script>
        <?php
        }

        $result = ob_get_contents();
        ob_end_clean();
        return $result;
    }

    public function sc_si_office_part($atts, $content){
        // Extract attributes to local variables
        extract( shortcode_atts(
            array(
                'part' => '',
                'class' => '',
                'align' => 'align-stretch',
                'hide_empty' => false
            ), $atts )
        );

        $lResult = '';
        
        if($part != ''){
            ob_start();

            SourceImmo::view('single/offices_layouts/subs/' . $part); 

            $lResult = ob_get_clean();
        }

        $sanitizedPart = sanitize_title(str_replace('_','-',$part));
        $attrPart = [];
        $classes = ['si-part', $align, 'si-part-' . $sanitizedPart, $class];

        if($hide_empty !== false){
            if(in_array($hide_empty, ['soft','hard'])){
                $attrPart[] = 'si-hide-empty="{method:\'' . $hide_empty . '\'}"';
                
            }
            else{
                $attrPart[] = 'si-hide-empty';
            }
        }
        

        $lResult = '<div class="'. implode(' ', $classes) .'" '. implode(' ', $attrPart) .'>' . $lResult . '</div>';        
        return $lResult;
    }

    public function sc_si_office_listings($atts, $content=null){
        // Extract attributes to local variables
        extract( shortcode_atts(
            array(
                'ref_number' => '',
                'limit' => 0,
                'sort' => '',
                'show_header' => true,
            ), $atts )
        );
        if($ref_number == ''){
            $ref_number = get_query_var( 'ref_number');
        }
        
        ob_start();
            
        echo do_shortcode('[si_small_list class="listing-list si-list-of-listings" type="listings" options="{columns:{desktop:3, laptop:3}}" where="{field:\'offices_ref_numbers\', operator : \'array_contains\', value: \'' . $ref_number . '\'}" limit="' . $limit . '" sort="'. $sort .'" show_header="'. $show_header .'"]');
        
        $lResult = ob_get_clean();

        return $lResult;
    }

    public function sc_si_office_brokers($atts, $content=null){
        // Extract attributes to local variables
        extract( shortcode_atts(
            array(
                'ref_number' => '',
                'limit' => 0,
                'sort' => '',
                'show_header' => true,
            ), $atts )
        );
        if($ref_number == ''){
            $ref_number = get_query_var( 'ref_number');
        }

        ob_start();
            
        echo do_shortcode('[si_small_list class="broker-list si-list-of-brokers" type="brokers" options="{columns:{desktop:4, laptop:3}}" where="{field:\'office_ref_number\', operator : \'equal\', value: \'' . $ref_number . '\'}" limit="' . $limit . '" sort="'. $sort .'" show_header="'. $show_header .'"]');
        
        $lResult = ob_get_clean();

        return $lResult;
    }

    #endregion

    #region Agency - Sub shortcodes

    public function sc_si_agency($atts, $content){
        extract( shortcode_atts(
            array(
                'ref_number' => '',
                'load_text' => 'Loading agency',
                'class' => ''
            ), $atts )
        );
        if($ref_number == ''){
            $ref_number = get_query_var( 'ref_number');
        }
        if($ref_number == '') return '';

        $data = json_decode(SourceImmoApi::get_agency_data($ref_number));
        if($data != null){
            global $dictionary;
            $agencyWrapper = new SourceImmoAgenciesResult();
            $dictionary = new SourceImmoDictionary($data->dictionary);
            $agencyWrapper->preprocess_item($data);
        }
        
        ob_start();
        $isolation = SourceImmo::current()->get_isolation('agency');
        if($isolation == 'ISOLATE'){
            echo("<div data-ng-controller=\"singleAgencyCtrl\" data-ng-init=\"init('{$ref_number}')\">");
        }

        ?>
        
        <div class="si si-single-content agency-single <?php echo($class) ?> {{model.status}} {{model!=null?'si-loaded':''}}">
            <?php
            do_action('si_start_of_template', $load_text);
            if($load_text != null){
                echo('<label class="si-placeholder"  data-ng-show="model==null">' .  __($load_text,SI) . ' <i class="fal fa-spinner fa-spin"></i></label>');
            }
            echo('<div class="si-content"  ng-cloak si-adaptative-class >');

            
            if($content != null){
                echo(do_shortcode($content));
            }
            else{
                SourceImmo::view('single/agencies_layouts/standard');
            }

            echo('</div>');
            do_action('si_end_of_template');
            ?>
        </div>
        <?php
        if($isolation == 'ISOLATE'){
            echo("</div>");
        }

        if(SourceImmo::current()->configs->prefetch_data){
        ?>                
        <script type="text/javascript">
        var siOfficeData = <?php 
            echo(json_encode($data)); 
        ?>;
        </script>
        <?php
        }

        $result = ob_get_contents();
        ob_end_clean();
        return $result;
    }

    public function sc_si_agency_part($atts, $content){
        // Extract attributes to local variables
        extract( shortcode_atts(
            array(
                'part' => '',
                'class' => '',
                'align' => 'align-stretch',
                'hide_empty' => false
            ), $atts )
        );

        $lResult = '';
        
        if($part != ''){
            ob_start();

            SourceImmo::view('single/agencies_layouts/subs/' . $part); 

            $lResult = ob_get_clean();
        }

        $attrPart = [];
        $sanitizedPart = sanitize_title(str_replace('_','-',$part));
        $classes = ['si-part', $align, 'si-part-' . $sanitizedPart, $class];
        if($hide_empty !== false){
            if(in_array($hide_empty, ['soft','hard'])){
                $attrPart[] = 'si-hide-empty="{method:\'' . $hide_empty . '\'}"';
                
            }
            else{
                $attrPart[] = 'si-hide-empty';
            }
        }
        

        $lResult = '<div class="'. implode(' ', $classes) .'" '. implode(' ', $attrPart) .'>' . $lResult . '</div>';        
        return $lResult;
    }

    public function sc_si_agency_listings($atts, $content=null){
        // Extract attributes to local variables
        extract( shortcode_atts(
            array(
                'ref_number' => '',
                'limit' => 0,
                'sort' => '',
                'show_header' => true,
            ), $atts )
        );
        if($ref_number == ''){
            $ref_number = get_query_var( 'ref_number');
        }
        
        ob_start();
            
        echo do_shortcode('[si_small_list class="listing-list si-list-of-listings" type="listings" options="{columns:{desktop:3, laptop:3}}" where="{field:\'agencies_ref_numbers\', operator : \'array_contains\', value: \'' . $ref_number . '\'}" limit="' . $limit . '" sort="'. $sort .'" show_header="'. $show_header .'"]');
        
        $lResult = ob_get_clean();

        return $lResult;
    }

    public function sc_si_agency_brokers($atts, $content=null){
        // Extract attributes to local variables
        extract( shortcode_atts(
            array(
                'ref_number' => '',
                'limit' => 0,
                'sort' => '',
                'show_header' => true,
            ), $atts )
        );
        if($ref_number == ''){
            $ref_number = get_query_var( 'ref_number');
        }

        ob_start();
            
        echo do_shortcode('[si_small_list class="broker-list si-list-of-brokers" type="brokers" options="{columns:{desktop:4, laptop:3}}" where="{field:\'agency_ref_number\', operator : \'equal\', value: \'' . $ref_number . '\'}" limit="' . $limit . '" sort="'. $sort .'" show_header="'. $show_header .'"]');
        
        $lResult = ob_get_clean();

        return $lResult;
    }


    
    public function sc_si_agency_offices($atts, $content=null){
        // Extract attributes to local variables
        extract( shortcode_atts(
            array(
                'ref_number' => '',
                'limit' => 0,
                'sort' => '',
                'show_header' => false,
            ), $atts )
        );
        if($ref_number == ''){
            $ref_number = get_query_var( 'ref_number');
        }

        ob_start();
            
        echo do_shortcode('[si_small_list class="office-list si-list-of-offices" type="offices" options="{columns:{desktop:4, laptop:3}}" where="{field:\'agency_ref_number\', operator : \'equal\', value: \'' . $ref_number . '\'}" limit="' . $limit . '" sort="'. $sort .'" show_header="'. $show_header .'"]');
        
        $lResult = ob_get_clean();

        return $lResult;
    }

    #endregion

    #region City
    
    public function sc_si_city($atts, $content){
        extract( shortcode_atts(
            array(
                'ref_number' => get_query_var( 'ref_number'),
                'load_text' => "Loading listing"
            ), $atts )
        );

        if($ref_number == '') return '';

        ob_start();
        
        global $city_data;
        if($city_data == null) $city_data = SourceImmoApi::get_city_data($ref_number)->items[0];

        $lListConfig = SourceImmo::current()->get_default_list('listings');
        $lAlias = 'default';
        if($lListConfig!=null){
            $lAlias = $lListConfig->alias;
        }
        do_action('si_start_of_template', null);
        
        echo('<div class="si-content"  ng-cloak>');

        SourceImmo::view('single/cities_layouts/standard', array(
            'model' => array(
                'ref_number' => $ref_number,
                'alias' => $lAlias,
                'name' => $city_data->name,
            )
        ));

        echo('</div>');
        do_action('si_end_of_template');

        $result = ob_get_contents();
        ob_end_clean();
        return $result;
    }

    #endregion

    #region Listing - Sub shortcodes

    public function sc_si_listing($atts, $content){
        extract( shortcode_atts(
            array(
                'ref_number' => '',
                'load_text' => "Loading listing",
                'media_picture_fit' => "cover",
                'class' => ''
            ), $atts )
        );


        if($ref_number == ''){
            $ref_number = get_query_var( 'ref_number');
        }
        if($ref_number == '') return '';

        global $listing_data;
        $listing_data = json_decode(SourceImmoApi::get_listing_data($ref_number));
        if($listing_data != null){
            global $dictionary;
            $listingWrapper = new SourceImmoListingsResult();
            $dictionary = new SourceImmoDictionary($listing_data->dictionary);
            $listingWrapper->preprocess_item($listing_data);
            $listingWrapper->extendedPreprocess($listing_data);
        }
        
        // filters
        $load_text = apply_filters('si/label',$load_text);
        $content = apply_filters('si/listing/detail/content', $content, $ref_number, $listing_data);
        $class = apply_filters('si/single-listing/class', $class);
        
        ob_start();
        
        SourceImmo::view('single/listings_layouts/_schema',array('model' => $listing_data));
        $isolation = SourceImmo::current()->get_isolation('listing');
        
        if($isolation == 'ISOLATE'){
            echo("<div data-ng-controller=\"singleListingCtrl\" data-ng-init=\"init('{$ref_number}')\">");
        }

        echo("<div class=\"si si-single-content listing-single {$class} {{model.status}} {{model!=null?'si-loaded':''}}\">");
        

        add_filter('si/mediabox/pictureFit', function($value) use ($media_picture_fit) {
            return $media_picture_fit;
        });
        
        do_action('si_listing_single_start', $ref_number, $listing_data);
        do_action('si_start_of_template', $load_text);
        
        if($load_text != null){
            echo('<label class="si-placeholder"  data-ng-show="model==null">' .  __($load_text,SI) . ' <i class="fal fa-spinner fa-spin"></i></label>');
        }
        echo('<div class="si-content"  ng-cloak si-adaptative-class >');

        if($content != null){
            
            echo(do_shortcode($content));
        }
        else{
            
            SourceImmo::view('single/listings_layouts/standard');
        }
        echo('</div>');

        do_action('si_end_of_template');
        do_action('si_listing_single_end');
        
        echo('</div>');
        if($isolation == 'ISOLATE'){
            echo("</div>");
        }
        
        if(SourceImmo::current()->configs->prefetch_data){
        ?> 
            <script type="text/javascript">
            var siListingData = <?php 
                echo(json_encode($listing_data)); 
            ?>;
            </script>
        <?php
        }
        
        $result = ob_get_contents();
        ob_end_clean();
        return $result;
    }

    public function sc_si_listing_part($atts, $content){
        // Extract attributes to local variables
        extract( shortcode_atts(
            array(
                'part' => '',
                'align' => 'align-stretch',
                'adapt' => false,
                'class' => '',
                'height' => '',
                'tabs' => '',
                'allow_toggle' => '',
                'media_picture_fit' => null,
                'hide_empty' => false
            ), $atts )
        );

        $lResult = '';
        $partAttr = [];
        
        if(isset($media_picture_fit) && $media_picture_fit != null){      
            add_filter('si/mediabox/pictureFit', function($value) use ($media_picture_fit) {
                return $media_picture_fit;
            });
        }

        if($part != ''){
            ob_start();
            $part_path = apply_filters('si_listing_part_path','single/listings_layouts/subs/' . $part,$part);
            $part_params = apply_filters('si_listing_part_params', ['align' => $align, 'allow_toggle' => $allow_toggle,'height' => $height, 'tabs' => explode(',', $tabs)], $part);
            SourceImmo::view($part_path, $part_params); 

            $lResult = ob_get_clean();
        }
        $sanitizedPart = sanitize_title(str_replace('_','-',$part));
        $classes = ['si-part', 'si-'.$align, 'si-part-' . $sanitizedPart, $class];
        
        if($adapt) $partAttr[] = 'si-adaptative-class';
        if($hide_empty !== false){
            if(in_array($hide_empty, ['soft','hard'])){
                $partAttr[] = 'si-hide-empty="{method:\'' . $hide_empty . '\'}"';
                
            }
            else{
                $partAttr[] = 'si-hide-empty';
            }
        }

        $lResult = '<div class="'. implode(' ', $classes) .'" '. implode(' ', $partAttr) .'>' . $lResult . '</div>';

        return $lResult;
    }

    #endregion


    #region Tools shortcodes

    public function sc_si_tool_calculator($atts, $content){

        return '<div class="si"><si-calculator mode="standalone">' . $content . '</si-calculator></div>';
    }

    #endregion
}
