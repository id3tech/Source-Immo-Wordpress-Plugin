<?php
$panelKey = 'agencies';
?>

<div class="filter-panel offices-panel {{isExpanded('<?php echo($panelKey) ?>')}}">
    <div class="filter-panel-header">
        <h4><?php si_label('Agencies') ?></h4>
        <button class="button" type="button"  ng-click="toggleExpand($event,'<?php echo($panelKey) ?>')"><i class="fal fa-times"></i></button>
    </div>
    
    <div class="filter-panel-content">
           

            <div class="filter-list agency-list">
    
                <si-checkbox
                    data-ng-repeat="item in agencyList | orderBy: 'name'"
                    data-si-value="{{item.ref_number}}"
                    data-si-change="filter.update()"
                    data-ng-model="filter.data.agencies"
                    data-label="{{item.name.toUpperCase()}}"
                    ></si-checkbox>
                    
            </div>
        
        
    </div>

    
    <div class="filter-panel-actions">
        <?php include '_actions.php'; ?>
    </div>
</div>