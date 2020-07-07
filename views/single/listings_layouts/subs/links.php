<?php
$linkFilters = apply_filters('si/single-listing/links-filters', ['website','matterport','youtube','vimeo']);

?>
<div class="links" ng-show="model.links">
    <div ng-repeat="(key,item) in model.links track by $index"
            ng-if="!['<?php echo implode("','", $linkFilters) ?>'].includes(key)"
            class="link {{key}}"
        >
        <a href="{{item}}" class="si-button" target="_blank">
            <i class="far"></i> <?php _e('More infos',SI) ?>
        </a>
    </div>
</div>