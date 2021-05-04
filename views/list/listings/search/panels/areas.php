<?php
$panelKey = 'areas';
?>

<div class="filter-panel areas-panel {{isExpanded('<?php echo($panelKey) ?>')}}">
    <div class="filter-panel-header">
        <h4><?php echo(apply_filters('si_label', __('Areas', SI))) ?></h4>
        <button class="button" type="button"  ng-click="toggleExpand($event,'<?php echo($panelKey) ?>')"><i class="fal fa-times"></i></button>
    </div>

    <div class="filter-panel-content">
        
        <div class="area-filters">
            <div class="land-area filter-row">
                <si-input-container class="si-float-label si-input-group">
                    <label><?php echo(apply_filters('si_label', __('Land area',SI))) ?></label>
                    
                    <span><?php echo(apply_filters('si_label', __('Between',SI))) ?></span>
                    <si-select si-model="filter.data.land_min" si-change="filter.update()" placeholder="Min">
                        <si-option value=""><?php echo(apply_filters('si_label', __('Any',SI))) ?></si-option>
                        <si-option ng-repeat="item in land_areas" value="{{item.value}}">{{item.caption}}</si-option>
                    </si-select>

                    <span><?php echo(apply_filters('si_label', __('and',SI))) ?></span>
                    <si-select si-model="filter.data.land_max"  si-change="filter.update()" placeholder="Max">
                        <si-option value=""><?php echo(apply_filters('si_label', __('Any',SI))) ?></si-option>
                        <si-option ng-repeat="item in land_areas" value="{{item.value}}">{{item.caption}}</si-option>
                    </si-select>
                </si-input-container>
                
            </div>

            <div class="building-area filter-row">
                <si-input-container class="si-float-label si-input-group">
                    <label><?php echo(apply_filters('si_label', __('Available area',SI))) ?></label>
                    
                    <span><?php echo(apply_filters('si_label', __('Between',SI))) ?></span>
                    <si-select si-model="filter.data.available_min" si-change="filter.update()" placeholder="Min">
                        <si-option value=""><?php echo(apply_filters('si_label', __('Any',SI))) ?></si-option>
                        <si-option ng-repeat="item in available_areas" value="{{item.value}}">{{item.caption}}</si-option>
                    </si-select>

                    <span><?php echo(apply_filters('si_label', __('and',SI))) ?></span>
                    <si-select si-model="filter.data.available_max"  si-change="filter.update()" placeholder="Max">
                        <si-option value=""><?php echo(apply_filters('si_label', __('Any',SI))) ?></si-option>
                        <si-option ng-repeat="item in available_areas" value="{{item.value}}">{{item.caption}}</si-option>
                    </si-select>
                </si-input-container>
            </div>  
        </div>
    </div>
    <div class="filter-panel-actions">
    <?php include '_actions.php'; ?>
    </div>
</div>