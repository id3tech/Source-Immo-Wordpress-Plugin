
    <?php 
    if($configs->searchable){ 
        echo('<immodb-search data-immodb-alias="'. $configs->alias . '" data-immodb-configs="configs" data-immodb-dictionary="dictionary" class="search-container"></immodb-search>');
    }
    ?>

    <div class="immodb-list-container display-mode-{{display_mode}}">
        <?php
        ImmoDB::view("list/{$configs->type}/standard/header", array(
                            "configs" => $configs
                        ));

        ?>
        <div class="immodb-list" data-ng-show="(list && list.length>0) && display_mode=='list'" data-on-bottom-reached="checkNextPage()">      
            <div ng-repeat="item in list track by item.id">
            <?php 
                ImmoDB::view("list/{$configs->type}/standard/item-{$configs->list_item_layout->preset}", array("configs" => $configs));
            ?>
            </div>
        </div>
        <div class="immodb-list immodb-list-of-ghost" data-ng-show="(ghost_list && ghost_list.length>0) && display_mode=='list'">      
            <div ng-repeat="item in ghost_list">
            <?php 
                ImmoDB::view("list/{$configs->type}/standard/item-{$configs->list_item_layout->preset}", array("configs" => $configs));
            ?>
            </div>
        </div>
        <div class="next-page" data-ng-show="display_mode!='map' && page_index>=2 && listMeta.next_token!=null && !is_loading_data">
            <button type="button" class="button load-next-page" ng-click="showNextPage(true)"><?php _e('Load more', IMMODB) ?></button>
        </div>
        
        <immodb-loading data-immodb-label="Loading results" data-ng-show="is_loading_data"></immodb-loading>
        
        <?php
        // add map if the list is mappable
        if($configs->mappable){
            echo('<immodb-map class="map-container" data-ng-show="display_mode==\'map\'" data-immodb-alias="' . $configs->alias . '"  data-immodb-configs="configs"></immodb-map>');
        }
        ?>

        <?php 
        ImmoDB::view("list/{$configs->type}/standard/footer", array(
                            "configs" => $configs
                        ));
        ?>
    </div>