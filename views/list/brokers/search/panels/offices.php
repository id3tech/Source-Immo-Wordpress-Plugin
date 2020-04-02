<div class="filter-panel offices-panel {{isExpanded('offices')}}">
    <div class="panel-header">
        <h3><?php _e('Office', SI) ?></h3>
        <button class="button" type="button"  ng-click="toggleExpand($event,'offices')"><i class="fal fa-times"></i></button>
    </div>
    
    <div class="filter-panel-content">
        <div class="filter-list office-list">
        
            <si-checkbox
                data-ng-repeat="item in officeList | orderBy: 'name'"
                data-si-value="{{item.ref_number}}"
                data-si-change="filter.update()"
                data-ng-model="filter.data.offices"
                data-label="{{item.name}}"
                ></si-checkbox>
                
        </div>
    </div>
</div>