<div class="open-houses" data-ng-show="model.open_houses.length>0">
    <h4><i class="fal fa-calendar-alt"></i> <?php _e('Open house',IMMODB) ?></h4>
    <div class="open-house-list">
        <div class="open-house-item" data-ng-repeat="item in model.open_houses">
            <div class="date">
                <div class="time-ago" am-time-ago="item.start_date"></div>
                <div class="day">{{item.start_date  | amDateFormat:'dddd, MMMM Do'.translate()}}</div>
            </div>

            <div class="start">
                <label><?php _e('starting at',IMMODB) ?></label>
                <div>{{item.start_date | amDateFormat:'h:mm a'.translate()}}</div>
            </div>
            <div class="end">
                <label><?php _e('ending at',IMMODB) ?></label>
                <div>{{item.end_date | amDateFormat:'h:mm a'.translate()}}</div>
            </div>
        </div>
    </div>
</div>