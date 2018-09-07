<div class="lot-specs section {{sectionOpened('lot')?'opened':''}}">
    <div class="title" ng-click="toggleSection('lot')">
        <div><?php _e('Lot and exterior',IMMODB) ?></div>
        <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
    </div>
    <div class="content spec-grid">
        <div class="spec" ng-repeat="spec in model.lot.attributes">
            <label>{{spec.caption}}</label>
            <div><span ng-repeat="value in spec.values">{{value.caption}}</span></div>
        </div>
    </div>
</div>