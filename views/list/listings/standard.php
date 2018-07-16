
    <?php 
    if($configs->searchable){ 
        echo('<immodb-search immodb-alias="'. $configs->alias . '" immodb-configs="configs" immodb-dictionary="dictionary" class="search-container"></immodb-search>');
    }
    ?>

    <div class="immodb-list-container">
    <?php
    ImmoDB::view("list/{$configs->type}/standard/header", array(
                        "configs" => $configs
                    ));

    ?>
    <div class="immodb-list" ng-show="list && list.length>0" on-bottom-reached="checkNextPage()">

            
                <?php 
                ImmoDB::view("list/{$configs->type}/standard/item-{$configs->list_item_layout->preset}", array("configs" => $configs));
                ?>
            
    </div>
    <div class="next-page" ng-show="page_index>=2 && listMeta.next_token!=null">
        <button type="button" class="btn load-next-page" ng-click="showNextPage()"><?php _e('Load more', IMMODB) ?></button>
    </div>

    <?php 
    ImmoDB::view("list/{$configs->type}/standard/footer", array(
                        "configs" => $configs
                    ));
    ?>
    </div>