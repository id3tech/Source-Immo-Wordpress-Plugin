<div class="rooms section {{sectionOpened('rooms')?'opened':''}}" data-ng-show="model.rooms!=undefined">
    <div class="title" data-ng-click="toggleSection('rooms')"><div><?php _e('Rooms',IMMODB) ?></div> <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div></div>
    <div class="content">
        <div class="unit-list" data-ng-repeat="unit in model.units">
            <h4 class="title" data-ng-show="model.units.length>1">{{'{0} unit'.translate().format(unit.category)}}</h4>
            <div class="flags">
                <div class="flag" data-ng-repeat="flag in unit.flags" title="{{flag.caption}}">
                    <i class="fal fa-{{flag.icon}}"></i>
                    <em>{{flag.value}}</em>
                </div>
            </div>
            <div class="room-list">
                <div class="room-item list-header">
                    <div class="type"></div>
                    <div class="level"><?php _e('Level',IMMODB) ?></div>
                    <div class="floor"><?php _e('Flooring',IMMODB) ?></div>
                </div>
                <div class="room-item" data-ng-repeat="room in model.rooms | filter : {'unit_sequence' : unit.sequence}">
                    <div class="type">{{room.category}}</div>
                    <div class="level">{{room.level!=undefined ? room.level.formatRank() : ''}} {{room.level_category}}</div>
                    <div class="area">{{room.short_dimension}}</div>
                    <div class="floor">{{room.flooring}}</div>
                    <div class="infos">{{room.details}}</div>
                </div>
            </div>
        </div>
    </div>
</div>