<div class="lot-specs section {{sectionOpened('lot')?'opened':''}}">
    <div class="title" data-ng-click="toggleSection('lot')">
        <div><?php _e('Lot and exterior',IMMODB) ?></div>
        <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
    </div>
    <div class="content spec-grid">
        <div class="special-box" data-ng-show="hasDimension(model.land.dimension)">
            <div class="dimension" data-ng-show="hasDimension(model.land.dimension)">
                <label>{{'Dimensions'.translate()}}</label>
                <div class="value">{{model.land.dimension | formatDimension}}</div>
            </div>
        </div>
        <div class="spec" data-ng-repeat="spec in model.land.attributes">
            <label>{{spec.caption}}</label>
            <div><span data-ng-repeat="value in spec.values">{{value.caption}}</span></div>
        </div>
    </div>
</div>