<div class="rooms section {{sectionOpened('rooms')?'opened':''}}" ng-show="model.rooms!=undefined">
    <div class="title" ng-click="toggleSection('rooms')"><div><?php _e('Rooms',IMMODB) ?></div> <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div></div>
    <div class="content">
        <div class="unit-list" ng-repeat="unit in model.units">
            <h4 class="title" ng-show="model.units.length>1">{{unit.category}}</h4>
            <div class="flags">
                <div class="flag" ng-repeat="flag in unit.flags" title="{{flag.caption}}">
                    <i class="fal fa-{{flag.icon}}"></i>
                    <em>{{flag.value}}</em>
                </div>
            </div>
            <div class="room-list">
                <div class="room-item" ng-repeat="room in model.rooms | filter : {'unit_sequence' : unit.sequence}">
                    <div class="type">{{room.category}}</div>
                    <div class="level">{{room.level!=undefined ? room.level.formatRank() : ''}} {{room.level_category}}</div>
                    <div class="area">{{room.short_dimension}}</div>
                    <div class="infos"><span ng-if="room.flooring_code!='OTHER'" class="flooring">{{'Flooring : {0}'.translate().format(room.flooring)}}</span><span>{{room.details}}</span></div>
                </div>
            </div>
        </div>
    </div>
</div>