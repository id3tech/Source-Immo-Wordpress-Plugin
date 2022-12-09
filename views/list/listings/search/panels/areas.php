<?php
$panelKey = 'areas';
?>

<div class="filter-panel areas-panel {{isExpanded('<?php echo($panelKey) ?>')}}">
    <div class="filter-panel-header">
        <div  class="si-panel-header-title"><?php si_label('Areas') ?></div>
        <button class="si-button" type="button"  ng-click="toggleExpand($event,'<?php echo($panelKey) ?>')"><i class="fal fa-times"></i></button>
    </div>

    <div class="filter-panel-content">
        
        <div class="area-filters">
            <div class="land-area filter-row">
                <si-input-container class="si-float-label si-input-group">
                    <label><?php si_label('Land area') ?></label>
                    
                    <span><?php si_label('Between') ?></span>
                    <si-select si-model="filter.data.land_min" si-change="filter.update()" placeholder="Min">
                        <si-option value=""><?php si_label('Any') ?></si-option>
                        <si-option ng-repeat="item in land_areas" value="{{item.value}}">{{item.caption}}</si-option>
                    </si-select>

                    <span><?php si_label('and') ?></span>
                    <si-select si-model="filter.data.land_max"  si-change="filter.update()" placeholder="Max">
                        <si-option value=""><?php si_label('Any') ?></si-option>
                        <si-option ng-repeat="item in land_areas" value="{{item.value}}">{{item.caption}}</si-option>
                    </si-select>
                </si-input-container>
                
            </div>

            <div class="building-area filter-row">
                <si-input-container class="si-float-label si-input-group">
                    <label><?php si_label('Available area') ?></label>
                    
                    <span><?php si_label('Between') ?></span>
                    <si-select si-model="filter.data.available_min" si-change="filter.update()" placeholder="Min">
                        <si-option value=""><?php si_label('Any') ?></si-option>
                        <si-option ng-repeat="item in available_areas" value="{{item.value}}">{{item.caption | siFilterListLowerBound : $last}}</si-option>
                    </si-select>

                    <span><?php si_label('and') ?></span>
                    <si-select si-model="filter.data.available_max"  si-change="filter.update()" placeholder="Max">
                        <si-option value=""><?php si_label('Any') ?></si-option>
                        <si-option ng-repeat="item in available_areas" value="{{item.value}}">{{item.caption | siFilterListUpperBound : $last}}</si-option>
                    </si-select>
                </si-input-container>
            </div>  
        </div>
    </div>
    <div class="filter-panel-actions">
    <?php include '_actions.php'; ?>
    </div>
</div>