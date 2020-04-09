<div class="rooms detail-section {{sectionOpened('rooms')?'opened':''}}" 
        data-ng-show="[model.rooms, model.units] | siHasValue">
    <div class="title" data-ng-click="toggleSection('rooms')">
        <div>
            {{
                (['COM','IND'].includes(model.category_code) 
                    ? 
                    model.units.length == 1 ? 'Unit' : 'Units'
                    :
                    model.rooms.length == 1 ? 'Room' : 'Rooms').translate();
            }}
        </div> <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
    </div>
    <div class="detail-section-content">
        <div class="unit-list" data-ng-repeat="unit in model.units track by $index">
            <h4 class="title" data-ng-show="['OFFICE','INDUSTRY','COMMERCIAL'].includes(unit.category_code) || model.units.length>1">
                <span>{{'{0} unit'.translate().format(unit.category)}}</span>
                <span class="area" data-ng-show="unit.dimension | siHasValue">{{unit.dimension | formatDimension}}</span>
            </h4>

            <div class="flags" data-ng-show="model.units.length>1"
                style="--unit-flag-count:{{unit.flags.length}};">
                <div class="spacer"></div>
                <div class="flag" data-ng-repeat="flag in unit.flags track by $index" title="{{flag.caption}}">
                    
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
                <div class="room-item" data-ng-repeat="room in model.rooms track by $index | filter : {'unit_sequence' : unit.sequence}">
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