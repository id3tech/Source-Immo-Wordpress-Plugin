<div class="addendum detail-section {{sectionOpened('addendum')?'opened':''}}" 
        data-ng-show="model.addendum | siHasValue">
    <div class="title" data-ng-click="toggleSection('addendum')"><div><?php _e('Addendum',SI) ?></div> <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div></div>
    <div class="detail-section-content"><span ng-bind-html="model.addendum | textToHtml"></span></div>
</div>