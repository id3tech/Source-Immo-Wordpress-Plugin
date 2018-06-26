<?php 
//Debug::write($configs);
$global_container_classes = array('immodb', 'standard-layout', "immodb-list-of-{$configs->type}",$configs->list_layout->scope_class);
$global_container_attr = array();

if($configs->searchable || $configs->sortable){
    //$global_container_attr[] = 'ng-app="ImmoDb"';
    // $global_container_attr[] = 'ng-controller="immodbListCtrl"';
    // $global_container_attr[] = 'ng-init="init(\'' . $configs->alias . '\')"';
}
?>
<immodb-list immodb-alias="<?php echo($configs->alias) ?>" immodb-class="<?php echo(implode(' ' , $global_container_classes)) ?>" ></immodb-list>
<script type="text/ng-template" id="immodb-template-for-<?php echo($configs->alias) ?>">
    <?php 
    if($configs->searchable){ ImmoDB::view('list/search'); }
    if($configs->sortable){ ImmoDB::view('list/sort'); }
    ?>
    <span>{{alias}}</span>
    <div class="immodb-list" ng-show="list && list.length>0">
        <article ng-repeat="item in list" class="immodb-item <?php echo($configs->list_item_layout->scope_class) ?>" ng-cloak>
            <?php 
            ImmoDB::view("list/{$configs->type}/item-{$configs->list_item_layout->preset}", array("configs" => $configs));
            ?>
        </articles>
    </div>
</script>