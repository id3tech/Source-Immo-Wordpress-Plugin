<?php 
    if($configs->searchable){ 
        echo('<si-search data-si-alias="'. $configs->alias . '" data-si-configs="configs" data-si-dictionary="dictionary" class="search-container"></si-search>');
    }
    ?>

    <div class="si-list-container display-mode-{{display_mode}}" si-lazy-load>
        <?php
        SourceImmo::view("list/{$configs->type}/standard/header", array(
                            "configs" => $configs
                        ));

        $itemClasses = apply_filters('si-broker-item-classes', array(
                        'item-{{item.ref_number}}'
                    ));
            
        $list_styles = array();
        foreach ($configs->list_layout->item_row_space as $key => $value) {
            $width = round(100 / $value);
            $list_styles[] = "--{$key}-column-width:{$width}";
        }
        ?>
        <div class="si-list" data-ng-show="(list && list.length>0) && display_mode=='list'" 
            style="<?php echo(implode(';', $list_styles)) ?>"
            data-on-bottom-reached="checkNextPage()">      
            <div data-ng-repeat="item in list track by item.id" class="<?php echo(implode(' ',$itemClasses))?>">
        <?php 
            SourceImmo::view("list/{$configs->type}/standard/item-{$configs->list_item_layout->preset}", array("configs" => $configs));
        ?>
            </div>
            
        </div>

        <label 
            ng-show="list != null && list.length == 0"
            class="no-result placeholder"><?php _e("There's no real estate broker matching your search criteria",SI) ?></label>
    
        <div class="si-list si-list-of-ghost" data-ng-show="(ghost_list && ghost_list.length>0) && display_mode=='list'">      
            <div ng-repeat="item in ghost_list">
            <?php 
                SourceImmo::view("list/{$configs->type}/standard/item-{$configs->list_item_layout->preset}", array("configs" => $configs));
            ?>
            </div>
        </div>

        <div class="next-page" data-ng-show="page_index>=2 && listMeta.next_token!=null && !is_loading_data">
            <button type="button" class="btn load-next-page" data-ng-click="showNextPage(true)"><?php _e('Load more', SI) ?></button>
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