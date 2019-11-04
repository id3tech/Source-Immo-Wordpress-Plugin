<div class="in-exclusions detail-section {{sectionOpened('in_exclusions')?'opened':''}}"  
    data-ng-show="[model.inclusions, model.exclusions] | siHasValue">
    <div class="title" data-ng-click="toggleSection('in_exclusions')">
        <div><?php _e('Inclusions & exclusions',SI) ?></div> 
        <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
    </div>
    <div class="detail-section-content">
        <div class="spec" data-ng-show="model.inclusions!=undefined">
            <label><?php _e('Inclusions',SI) ?></label>
            <div>{{model.inclusions}}</div>
        </div>
        <div class="spec" data-ng-show="model.exclusions!=undefined">
            <label><?php _e('Exclusions',SI) ?></label>
            <div>{{model.exclusions}}</div>
        </div>
    </div>
</div>