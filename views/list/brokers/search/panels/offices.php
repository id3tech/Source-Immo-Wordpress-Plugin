<?php
$panelKey = 'offices';
?>

<div class="filter-panel offices-panel {{isExpanded('<?php echo($panelKey) ?>')}}">
    <div class="filter-panel-header">
        <h4><?php echo(apply_filters('si_label', __('Office', SI))) ?></h4>
        <button class="button" type="button"  ng-click="toggleExpand($event,'<?php echo($panelKey) ?>')"><i class="fal fa-times"></i></button>
    </div>
    
    <div class="filter-panel-content">
        
        <div class="filter-list agency-list">
            <div class="agency-item" ng-repeat="agency in agencyList | orderBy: 'name' track by $index">
                <label class="agency-name">{{agency.name}}</label>

                <div class="filter-list office-list">
        
                    <si-checkbox
                        data-ng-repeat="item in agency.officeList | orderBy: 'name'"
                        data-si-value="{{item.ref_number}}"
                        data-si-change="filter.update()"
                        data-ng-model="filter.data.offices"
                        data-label="{{item.name}}"
                        ></si-checkbox>
                        
                </div>
            </div>
            
        </div>
        
    </div>

    
    <div class="filter-panel-actions">
        <?php include '_actions.php'; ?>
    </div>
</div>