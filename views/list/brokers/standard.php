<?php 
    if($configs->searchable){ 
        echo('<immodb-search immodb-alias="'. $configs->alias . '" immodb-configs="configs" immodb-dictionary="dictionary" class="search-container"></immodb-search>');
    }
    ?>

    <div class="immodb-list-container display-mode-{{display_mode}}">
        <?php
        ImmoDB::view("list/{$configs->type}/standard/header", array(
                            "configs" => $configs
                        ));

        ?>
        <div class="immodb-list" ng-show="(list && list.length>0) && display_mode=='list'" on-bottom-reached="checkNextPage()">      
            <div ng-repeat="item in list track by item.id">
        <?php 
            ImmoDB::view("list/{$configs->type}/standard/item-{$configs->list_item_layout->preset}", array("configs" => $configs));
        ?>
            </div>
            
        </div>
        <div class="next-page" ng-show="page_index>=2 && listMeta.next_token!=null">
                <button type="button" class="btn load-next-page" ng-click="showNextPage(true)"><?php _e('Load more', IMMODB) ?></button>
            </div>

        <?php
        // add map if the list is mappable
        if($configs->mappable){
            echo('<immodb-map class="map-container" ng-show="display_mode==\'map\'" immodb-alias="' . $configs->alias . '"  immodb-configs="configs"></immodb-map>');
        }
        ?>

        <?php 
        ImmoDB::view("list/{$configs->type}/standard/footer", array(
                            "configs" => $configs
                        ));
        ?>
    </div>