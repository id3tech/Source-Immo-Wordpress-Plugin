<div class="rooms section {{sectionOpened('rooms')?'opened':''}}" 
        data-ng-show="[model.rooms, model.units] | siHasValue">
    <div class="title" data-ng-click="toggleSection('rooms')"><div><?php _e('Rooms',SI) ?></div> <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div></div>
    <div class="content">
        <div class="unit-list" data-ng-repeat="unit in model.units">
            <h4 class="title" data-ng-show="model.units.length>1">{{'{0} unit'.translate().format(unit.category)}}</h4>
            
            <div class="flags" data-ng-show="model.units.length>1"
                style="grid-template-columns:1fr repeat({{unit.flags.length}},auto);">
                <div class="spacer"></div>
                <div class="flag" data-ng-repeat="flag in unit.flags" title="{{flag.caption}}">
                    
                    <em>{{flag.value}}</em>
                    <label>{{flag.caption}}</label>
                </div>
            </div>

            <div class="room-list"
                ng-show="(model.rooms | filter : {'unit_sequence' : unit.sequence}).length > 0">
                <div class="room-item list-header">
                    <div class="type"></div>
                    <div class="level"><?php _e('Level',SI) ?></div>
                    <div class="floor"><?php _e('Flooring',SI) ?></div>
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