<?php
$linkFilters = apply_filters('si/single-listing/links-filters', ['website','matterport','youtube','vimeo','virtual_tour']);

?>
<div class="links" ng-if="model.links">
    <div ng-repeat="(key,item) in model.links track by $index"
            ng-if="!['<?php echo implode("','", $linkFilters) ?>'].includes(key)"
            class="link {{key}}"
        >
        <a href="{{item}}" class="si-button" target="_blank">
            <i class="far"></i> <span>{{key | labelOf: linkTypes}}</span>
        </a>
    </div>
</div>