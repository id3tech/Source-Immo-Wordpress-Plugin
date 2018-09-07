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
            'immodb_broker_listings',
            // Listing - Sub shorcodes
            'immodb_listing_part',
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
                'alias' => 'default'
            ), $atts )
        );

        ob_start();
        $listConfig = ImmoDB::current()->get_list_configs($alias);
        
        if($listConfig != null){
            $global_container_classes = array('immodb', 'standard-layout', "immodb-list-of-{$listConfig->type}",$listConfig->list_layout->scope_class);
            $global_container_attr = array();

            if(in_array($listConfig->list_layout->preset, array('direct'))){
                ImmoDB::view("list/{$listConfig->type}/{$listConfig->list_layout->preset}", array("configs" => $listConfig));
            }
            else{
                echo('<immodb-list immodb-alias="' . $alias . '" immodb-class="' . implode(' ' , $global_container_classes) . '" ></immodb-list>');
                echo('<script type="text/ng-template" id="immodb-template-for-'. $alias . '">');
                ImmoDB::view("list/{$listConfig->type}/{$listConfig->list_layout->preset}", array("configs" => $listConfig));
                echo('</script>');

                if($listConfig->searchable){ 
                    echo('<script type="text/ng-template" id="immodb-search-for-'. $alias . '">');
                    ImmoDB::view('list/' . $listConfig->type . '/search', array("configs" => $listConfig)); 
                    echo('</script>');
                }
            }
        }

        $lResult = ob_get_clean();

        return $lResult;
    }

    #region Broker - Sub shortcodes

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
    
    #endregion

    #region Listing - Sub shortcodes

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
