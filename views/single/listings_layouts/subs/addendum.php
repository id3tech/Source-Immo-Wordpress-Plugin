<div class="addendum section {{sectionOpened('addendum')?'opened':''}}" data-ng-show="model.addendum!=undefined">
    <div class="title" data-ng-click="toggleSection('addendum')"><div><?php _e('Addendum',SI) ?></div> <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div></div>
    <div class="content">{{model.addendum}}</div>
</div>