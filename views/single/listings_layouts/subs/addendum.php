<div class="addendum si-detail-section {{sectionOpened('addendum')?'opened':''}}"
        data-ng-if="isAvailableSection('addendum')"
        data-ng-show="model.addendum | siHasValue">
    <div class="si-title" data-ng-click="toggleSection('addendum')"><div><?php _e('Addendum',SI) ?></div> <div class="si-icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div></div>
    <div class="si-detail-section-content"><span ng-bind-html="model.addendum | textToHtml"></span></div>
</div>