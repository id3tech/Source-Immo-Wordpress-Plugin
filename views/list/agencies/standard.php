<?php 
    if($configs->searchable){ 
        $searchContainerClasses = ['search-container'];
        
        if(isset($configs->search_engine_options->scope_class)) $searchContainerClasses[] = $configs->search_engine_options->scope_class;

        if(isset($configs->search_engine_options)){
            if(isset($configs->search_engine_options->tabs) && count($configs->search_engine_options->tabs)>1){
                $searchContainerClasses[] = 'si-has-tabs';
            }
        }

        echo('<si-search data-si-alias="'. $configs->alias . '" data-si-configs="configs" data-si-dictionary="dictionary" class="'. implode(' ', $searchContainerClasses) .'"></si-search>');
    
        if($configs->search_engine_options->filter_tags == 'outside'){
            echo('<si-search-filter-tags si-alias="' .  $configs->alias . '"></si-search-filter-tags>');
        }
    }
    
    $list_styles = array();
    foreach ($configs->list_layout->item_row_space as $key => $value) {
        $width = round(100 / $value);
        $list_styles[] = "--{$key}-column-width:{$width}";
    }
    ?>

    <div class="si-list-container display-mode-{{display_mode}}" style="<?php echo(implode(';', $list_styles)) ?>" si-lazy-load>
        <?php
        SourceImmo::view("list/{$configs->type}/standard/header", array(
                            "configs" => $configs
                        ));

        $itemClasses = apply_filters('si-office-item-classes', array(
                            'item-{{item.ref_number}}',
                            'city-{{item.location.city_code | sanitize}}'
                        ));
        if($configs->list_item_layout->preset=='custom'){
            echo('<style>');
            $styles = explode("\n",$configs->list_item_layout->custom_css);
            foreach ($styles as $style) {
                echo('.si-list .si-item .item-content ' . $style);
            }
            echo('</style>');
        }
        ?>
        <div class="si-list" data-ng-show="(list && list.length>0) && display_mode=='list'" data-on-bottom-reached="checkNextPage()">      
            <div ng-repeat="item in list track by item.id"  class="<?php echo(implode(' ',$itemClasses))?>">
            <?php 
                SourceImmo::view("list/{$configs->type}/standard/item-{$configs->list_item_layout->layout}", array("configs" => $configs));
            ?>
            </div>
        </div>
        <div class="si-list si-list-of-ghost" data-ng-show="(ghost_list && ghost_list.length>0) && display_mode=='list'">      
            <div ng-repeat="item in ghost_list">
            <?php 
                SourceImmo::view("list/{$configs->type}/standard/item-{$configs->list_item_layout->layout}", array("configs" => $configs));
            ?>
            </div>
        </div>
        <div class="next-page" data-ng-show="display_mode!='map' && page_index>=2 && listMeta.next_token!=null && !is_loading_data">
            <button type="button" class="si-button load-next-page" ng-click="showNextPage(true)"><?php echo apply_filters('si_label', __('Load more', SI)) ?></button>
        </div>
        
        <si-loading data-si-label="Loading results" data-ng-show="is_loading_data"></si-loading>
        
        <?php
        // add map if the list is mappable
        if($configs->mappable){
            echo('<si-map class="map-container" data-ng-show="display_mode==\'map\'" data-si-alias="' . $configs->alias . '"  data-si-configs="configs"></si-map>');
        }
        ?>

        <?php 
        SourceImmo::view("list/{$configs->type}/standard/footer", array(
                            "configs" => $configs
                        ));
        ?>
    </div>