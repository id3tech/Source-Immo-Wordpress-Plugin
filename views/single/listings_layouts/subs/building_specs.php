<div class="building-specs section {{sectionOpened('building')?'opened':''}}">
    <div class="title" ng-click="toggleSection('building')">
        <div><?php _e('Building and interior',IMMODB) ?></div> 
        <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div></div>
    <div class="content spec-grid">
        <div class="spec" ng-repeat="spec in model.building.attributes">
            <label>{{spec.caption}}</label>
            <div><span ng-repeat="value in spec.values">{{value.caption}}</span></div>
        </div>
    </div>
</div>