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

            // Broker - Sub shortcodes
            'si_broker',
            'si_broker_listings',
            'si_broker_part',
            // Listing - Sub shortcodes
            'si_listing',
            'si_listing_brokers',
            'si_listing_part',
            // Office - Sub shortcodes
            'si_office_part',
            'si_office_listings',
            'si_office_brokers',
        );

        foreach ($hooks as $item) {
            add_shortcode( $item, array($this, 'sc_' . $item) );
        }
    }

    public function sc_si_searchbox($atts, $content=null){
        extract( shortcode_atts(
            array(
                'alias' => 'default',
                'placeholder' => 'Find a property from city, street, id, etc',
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

        ob_start();
        $listConfig = SourceImmo::current()->get_list_configs($alias);
        $resultUrl = isset($result_page) ? $result_page : get_the_permalink( $listConfig->result_page );
        echo('<div class="si standard-layout">');
        echo('<si-search si-alias="'. $alias . '" class="search-container" si-result-url="' . $resultUrl . '" si-standalone="' . $standalone . '"></si-search>');

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
                'show_list_meta' => null
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

            
            $global_container_classes = array('si', 'standard-layout', "si-list-of-{$listConfig->type}",$listConfig->list_layout->scope_class);
            
            if(in_array($listConfig->list_layout->preset, array('direct'))){
                
                SourceImmo::view("list/{$listConfig->type}/{$listConfig->list_layout->preset}", array("configs" => $listConfig, "sc_atts" => $atts));
            }
            else{
                echo('<si-list si-alias="' . $alias . '" si-class="' . implode(' ' , $global_container_classes) . '" ></si-list>');
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
                'layout' => 'small',
                'show_header' => true,
                'limit' => 0,
                'sort' => ''
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
            $sortFields = implode ( ',',$sortFields);
        }
        

        ob_start();
        ?>
        <si-small-list class="<?php echo($class) ?>" 
                si-options="{show_header:<?php echo $show_header ?>, filter:{max_item_count: <?php echo($limit) ?>,sort_fields:[<?php echo($sortFields)?>]}}" si-type="<?php echo($type) ?>" si-filters="<?php echo($where) ?>" ></si-small-list>
        <?php
        echo('<script type="text/ng-template" id="si-template-for-'. $type . '">');
        SourceImmo::view("list/{$type}/standard/item-{$layout}");
        echo('</script>');
        $lResult = ob_get_clean();

        return $lResult;
    }


    public function sc_si_listing_brokers($atts, $content=null){
        $ref_number = get_query_var( 'ref_number');
        ob_start();
            echo do_shortcode('[si_small_list class="brokers broker-list si-list-of-brokers" layout="card" type="brokers" where="getBrokerListFilter()"]');
        $lResult = ob_get_clean();

        return $lResult;
    }


    #region Broker - Sub shortcodes
    public function sc_si_broker($atts, $content){
        extract( shortcode_atts(
            array(
                'ref_number' => ''
            ), $atts )
        );
        
        $data = json_decode(SourceImmoApi::get_broker_data($ref_number));
        if($data != null){
            global $dictionary;
            $brokerWrapper = new SourceImmoBrokersResult();
            $dictionary = new SourceImmoDictionary($data->dictionary);
            $brokerWrapper->preprocess_item($data);
        }
        
        ob_start();
        ?>
        <div data-ng-controller="singleBrokerCtrl" data-ng-init="init('<?php echo($ref_number) ?>')" 
                class="si broker-single {{model.status}} {{model!=null?'loaded':''}}">
        <?php
        echo(do_shortcode($content));
        ?>

        </div>
        <?php
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
                'part' => ''
            ), $atts )
        );

        $lResult = '';
        
        if($part != ''){
            ob_start();

            SourceImmo::view('single/brokers_layouts/subs/' . $part); 

            $lResult = ob_get_clean();
        }
        
        return $lResult;
    }
    
    #endregion

    #region Office - Sub shortcodes
    public function sc_si_office_part($atts, $content){
        // Extract attributes to local variables
        extract( shortcode_atts(
            array(
                'part' => ''
            ), $atts )
        );

        $lResult = '';
        
        if($part != ''){
            ob_start();

            SourceImmo::view('single/offices_layouts/subs/' . $part); 

            $lResult = ob_get_clean();
        }
        
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
            
        echo do_shortcode('[si_small_list class="listing-list si-list-of-listings" type="listings" where="{field:\'offices_ref_numbers\', operator : \'array_contains\', value: \'' . $ref_number . '\'}" limit="' . $limit . '" sort="'. $sort .'" show_header="'. $show_header .'"]');
        
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
            
        echo do_shortcode('[si_small_list class="broker-list si-list-of-brokers" type="brokers" where="{field:\'office_ref_number\', operator : \'equal\', value: \'' . $ref_number . '\'}" limit="' . $limit . '" sort="'. $sort .'" show_header="'. $show_header .'"]');
        
        $lResult = ob_get_clean();

        return $lResult;
    }

    #endregion

    #region Listing - Sub shortcodes

    public function sc_si_listing($atts, $content){
        extract( shortcode_atts(
            array(
                'ref_number' => ''
            ), $atts )
        );
        
        $listing_data = json_decode(SourceImmoApi::get_listing_data($ref_number));
        if($listing_data != null){
            global $dictionary;
            $listingWrapper = new SourceImmoListingsResult();
            $dictionary = new SourceImmoDictionary($listing_data->dictionary);
            $listingWrapper->preprocess_item($listing_data);
            $listingWrapper->extendedPreprocess($listing_data);
        }
        
        ob_start();
        SourceImmo::view('single/listings_layouts/_schema',array('model' => $listing_data));
        ?>
        <div data-ng-controller="singleListingCtrl" data-ng-init="init('<?php echo($ref_number) ?>')" 
                class="si listing-single {{model.status}} {{model!=null?'loaded':''}}">
        <?php
        echo(do_shortcode($content));
        ?>

        </div>

        <?php
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
                'part' => ''
            ), $atts )
        );

        $lResult = '';
        
        if($part != ''){
            ob_start();

            SourceImmo::view('single/listings_layouts/subs/' . $part); 

            $lResult = ob_get_clean();
        }
        
        return $lResult;
    }

    #endregion
}
