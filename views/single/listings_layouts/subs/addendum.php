<div class="addendum section {{sectionOpened('addendum')?'opened':''}}" ng-show="model.addendum!=undefined">
    <div class="title" ng-click="toggleSection('addendum')"><div><?php _e('Addendum',IMMODB) ?></div> <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div></div>
    <div class="content">{{model.addendum}}</div>
</div>