<?php 
     
     $list_styles = array();
     foreach ($configs->list_layout->item_row_space as $key => $value) {
         if($value > 10) $value = round(100 / $value);
         $list_styles[] = "--{$key}-column-width:{$value}";
     }

     
    if($configs->searchable){ 
        $searchContainerClasses = ['search-container'];
        if(isset($configs->search_engine_options->scope_class)) $searchContainerClasses[] = $configs->search_engine_options->scope_class;

        echo('<si-search data-si-alias="'. $configs->alias . '" data-si-configs="configs" data-si-dictionary="dictionary" class="'. implode(' ',$searchContainerClasses) .'"></si-search>');
    }
    
    // if(siLayerVar::isSimple($configs->list_item_layout->displayed_vars->main) || !in_array('photo',$configs->list_item_layout->displayed_vars->main)){
    //     $configs->list_item_layout->displayed_vars->main = siLayerVar::updateToComplex($configs->list_item_layout->displayed_vars->main, 'brokers');
    // }

    ?>

    <div class="si-list-container display-mode-{{display_mode}}" style="<?php echo(implode(';', $list_styles)) ?>" si-lazy-load>
        <?php
        SourceImmo::view("list/{$configs->type}/standard/header", array(
                            "configs" => $configs
                        ));

        $itemClasses = apply_filters('si-broker-item-classes', array(
                        'item-{{item.ref_number}}'
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
        <div class="si-list" data-ng-show="(list && list.length>0) && display_mode=='list'" 
            data-on-bottom-reached="checkNextPage()">      
            
            <div data-ng-repeat="item in list track by item.id" class="<?php echo(implode(' ',$itemClasses))?>">
            <?php 
                SourceImmo::view("list/{$configs->type}/standard/item-{$configs->list_item_layout->layout}", array("configs" => $configs));
            ?>
            </div>
        </div>

        <label 
            ng-show="list != null && list.length == 0"
            class="no-result placeholder"><?php si_label("There's no real estate broker matching your search criteria") ?></label>
    
        <div class="si-list si-list-of-ghost" data-ng-show="(ghost_list && ghost_list.length>0) && display_mode=='list'">      
            <div ng-repeat="item in ghost_list">
            <?php 
                SourceImmo::view("list/{$configs->type}/standard/item-{$configs->list_item_layout->layout}", array("configs" => $configs));
            ?>
            </div>
        </div>

        <div class="next-page" data-ng-show="page_index>=2 && listMeta.next_token!=null && !is_loading_data">
            <button type="button" class="si-button load-next-page" data-ng-click="showNextPage(true)"><span><?php si_label('Load more') ?></span></button>
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