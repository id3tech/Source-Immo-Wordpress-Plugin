<?php

class ImmoDbShorcodes{

    public function __construct(){
        
        $this->init_hook();
    }

    public function init_hook(){
        $hooks = array(
            'immodb',
            'immodb_search',
            'immodb_searchbox',
            // Broker - Sub shortcodes
            'immodb_broker',
            'immodb_broker_listings',
            'immodb_broker_part',
            // Listing - Sub shorcodes
            'immodb_listing',
            'immodb_listing_part'
        );

        foreach ($hooks as $item) {
            add_shortcode( $item, array($this, 'sc_' . $item) );
        }
    }

    public function sc_immodb_searchbox($atts, $content=null){
        extract( shortcode_atts(
            array(
                'alias' => 'default',
                'placeholder' => 'Find a property from city, street, id, etc',
                'on_enter' => '',
                'result_page' => ''
            ), $atts )
        );

        ob_start();
        echo('<immodb-search-box alias="' . $alias . '" placeholder="'. $placeholder .'" on-enter="'. $on_enter .'" result-page="'. $result_page .'"></immodb-search-box>');
        $lResult = ob_get_clean();

        return $lResult;
    }
  
    public function sc_immodb_search($atts, $content=null){
        extract( shortcode_atts(
            array(
                'alias' => 'default'
            ), $atts )
        );

        ob_start();
        $listConfig = ImmoDB::current()->get_list_configs($alias);
        $resultUrl = get_the_permalink( $listConfig->result_page );
        echo('<div class="immodb standard-layout">');
        echo('<immodb-search immodb-alias="'. $alias . '" class="search-container show-trigger" immodb-result-url="' . $resultUrl . '"></immodb-search>');

        echo('<script type="text/ng-template" id="immodb-search-for-'. $alias . '">');
        ImmoDB::view('list/' . $listConfig->type . '/search', array("configs" => $listConfig)); 
        echo('</script>');
        echo('</div>');
        $lResult = ob_get_clean();

        return $lResult;
    }

    public function sc_immodb($atts, $content=null){
        // Extract attributes to local variables
        extract( shortcode_atts(
            array(
                'alias' => 'default',
                'layout' => null,
                'show_list_meta' => null
            ), $atts )
        );

        ob_start();
        $listConfig = ImmoDB::current()->get_list_configs($alias);
        
        

        if($listConfig != null){
            if($layout != null){
                $listConfig->list_layout->preset = 'direct';
            }
            if($show_list_meta != null){
                $listConfig->show_list_meta = $show_list_meta=="true";
            }

            
            $global_container_classes = array('immodb', 'standard-layout', "immodb-list-of-{$listConfig->type}",$listConfig->list_layout->scope_class);
            $global_container_attr = array();

            if(in_array($listConfig->list_layout->preset, array('direct'))){
                ImmoDB::view("list/{$listConfig->type}/{$listConfig->list_layout->preset}", array("configs" => $listConfig, "sc_atts" => $atts));
            }
            else{
                echo('<immodb-list immodb-alias="' . $alias . '" immodb-class="' . implode(' ' , $global_container_classes) . '" ></immodb-list>');
                echo('<script type="text/ng-template" id="immodb-template-for-'. $alias . '">');
                ImmoDB::view("list/{$listConfig->type}/{$listConfig->list_layout->preset}", array("configs" => $listConfig, "sc_atts" => $atts));
                echo('</script>');

                if($listConfig->searchable){ 
                    echo('<script type="text/ng-template" id="immodb-search-for-'. $alias . '">');
                    ImmoDB::view('list/' . $listConfig->type . '/search', array("configs" => $listConfig, "sc_atts" => $atts)); 
                    echo('</script>');
                }
            }
        }

        $lResult = ob_get_clean();

        return $lResult;
    }

    #region Broker - Sub shortcodes
    public function sc_immodb_broker($atts, $content){
        extract( shortcode_atts(
            array(
                'ref_number' => ''
            ), $atts )
        );
        
        $data = json_decode(ImmoDBApi::get_broker_data($ref_number));
        if($data != null){
            global $dictionary;
            $brokerWrapper = new ImmoDBBrokersResult();
            $dictionary = new ImmoDBDictionary($data->dictionary);
            $brokerWrapper->preprocess_item($data);
        }
        
        ob_start();
        ?>
        <div data-ng-controller="singleBrokerCtrl" data-ng-init="init('<?php echo($ref_number) ?>')" 
                class="immodb broker-single {{model.status}} {{model!=null?'loaded':''}}">
        <?php
        echo(do_shortcode($content));
        ?>

        </div>
        <script type="text/javascript">
        var immodbBrokerData = <?php 
            echo(json_encode($data)); 
        ?>;
        </script>
        <?php
        $result = ob_get_contents();
        ob_end_clean();
        return $result;
    }

    /**
     * Display broker listings
     */
    public function sc_immodb_broker_listings($atts, $content=null){
        ob_start();
        ?>
        <div class="listing-list immodb-list-of-listings">
            <div ng-show="model.listings.length>0">
                <div class="list-header">
                    <h3>{{(model.listings.length==1 ? '1 property' : '{0} properties').translate().format(model.listings.length)}}</h3>

                    <div class="search-input">
                        <input placeholder="{{'Use keywords to filter the list'.translate()}}" ng-model="filter_keywords" />
                        <i class="far fa-search"></i>
                    </div>
                </div>
                <div class="list-container">
                    <div ng-repeat="item in model.listings | filter : filterListings" ng-animate>
                        <?php
                        ImmoDB::view("list/listings/standard/item-small");
                        ?>
                    </div>
                </div>
            </div>
            <label class="placeholder" ng-show="model.listings.length==0">{{'{0} has no properties yet'.translate().format(model.first_name)}}</label>
        </div>
        <?php
        $lResult = ob_get_clean();

        return $lResult;
    }

    public function sc_immodb_broker_part($atts, $content){
        // Extract attributes to local variables
        extract( shortcode_atts(
            array(
                'part' => ''
            ), $atts )
        );

        $lResult = '';
        
        if($part != ''){
            ob_start();

            ImmoDB::view('single/brokers_layouts/subs/' . $part); 

            $lResult = ob_get_clean();
        }
        
        return $lResult;
    }
    
    #endregion

    #region Listing - Sub shortcodes

    public function sc_immodb_listing($atts, $content){
        extract( shortcode_atts(
            array(
                'ref_number' => ''
            ), $atts )
        );
        
        $listing_data = json_decode(ImmoDBApi::get_listing_data($ref_number));
        if($listing_data != null){
            global $dictionary;
            $listingWrapper = new ImmoDBListingsResult();
            $dictionary = new ImmoDBDictionary($listing_data->dictionary);
            $listingWrapper->preprocess_item($listing_data);
            $listingWrapper->extendedPreprocess($listing_data);
        }
        
        ob_start();
        ImmoDB::view('single/listings_layouts/_schema',array('model' => $listing_data));
        ?>
        <div data-ng-controller="singleListingCtrl" data-ng-init="init('<?php echo($ref_number) ?>')" 
                class="immodb listing-single {{model.status}} {{model!=null?'loaded':''}}">
        <?php
        echo(do_shortcode($content));
        ?>

        </div>
        <script type="text/javascript">
        var immodbListingData = <?php 
            echo(json_encode($listing_data)); 
        ?>;
        </script>
        <?php
        $result = ob_get_contents();
        ob_end_clean();
        return $result;
    }

    public function sc_immodb_listing_part($atts, $content){
        // Extract attributes to local variables
        extract( shortcode_atts(
            array(
                'part' => ''
            ), $atts )
        );

        $lResult = '';
        
        if($part != ''){
            ob_start();

            ImmoDB::view('single/listings_layouts/subs/' . $part); 

            $lResult = ob_get_clean();
        }
        
        return $lResult;
    }

    #endregion
}
