<div class="addons">
    <?php
    // foreach(SourceImmo::current()->addons->items as $addon){
    //     $addon->render_admin_configs();
    // }

    ?>

    <div class="addon-item" ng-repeat="item in addons">
        <si-addon-config si-model="item" si-active-addons="configs.active_addons"></si-addon-config>
    </div>
</div>