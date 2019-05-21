<div class="page <?php if($page_id != 'home'){
        echo "{{current_page == '{$page_id}' ? '' : 'is_closed'}}";
    } ?>"
    id="<?php echo($page_id); ?>"
    ng-controller="<?php echo($page_id); ?>Ctrl" ng-init="_pageInit_()">

    <?php SourceImmo::view($page_path); ?>
</div>