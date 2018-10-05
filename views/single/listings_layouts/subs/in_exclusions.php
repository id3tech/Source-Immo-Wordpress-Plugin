<div class="in-exclusions section {{sectionOpened('in_exclusions')?'opened':''}}"  ng-show="model.inclusions!=undefined || model.exclusions!=undefined">
    <div class="title" ng-click="toggleSection('in_exclusions')">
        <div><?php _e('Included & excluded',IMMODB) ?></div> 
        <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
    </div>
    <div class="content">
        <div class="spec" ng-show="model.inclusions!=undefined">
            <label><?php _e('Included',IMMODB) ?></label>
            <div>{{model.inclusions}}</div>
        </div>
        <div class="spec" ng-show="model.exclusions!=undefined">
            <label><?php _e('Excluded',IMMODB) ?></label>
            <div>{{model.exclusions}}</div>
        </div>
    </div>
</div>