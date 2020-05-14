<div class="filter-panel licenses-panel {{isExpanded('licenses')}}">
    <div class="filter-panel-header">
        <h3><?php _e('License', SI) ?></h3>
        <button class="button" type="button"  ng-click="toggleExpand($event,'licenses')"><i class="fal fa-times"></i></button>
    </div>

    
    <div class="filter-panel-content">
        <div class="filter-list license-list">    
            <si-checkbox
                    data-ng-repeat="(key,item) in dictionary.broker_license_type"
                    data-ng-model="filter.data.licenses"
                    data-si-change="filter.update()"
                    data-si-value="{{key}}"
                    data-label="{{item.caption}}"
                ></si-checkbox>
        </div>
    </div>
</div>