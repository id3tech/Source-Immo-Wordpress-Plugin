<?php
$panelKey = 'rooms';
?>

<div class="filter-panel rooms-panel {{isExpanded('<?php echo($panelKey) ?>')}}">
    <div class="filter-panel-header">
        <div class="si-panel-header-title"><?php si_label('Rooms') ?></div>
        <button class="si-button" type="button"  ng-click="toggleExpand($event,'<?php echo($panelKey) ?>')"><i class="fal fa-times"></i></button>
    </div>

    <div class="filter-panel-content">
        
        
        <div class="bedrooms">
            <h4><?php si_label('Bedrooms') ?></h4>
            
        

            <si-radio
                    data-ng-repeat="item in bedroomSuggestions"
                    name="bedrooms-count"
                    data-ng-model="filter.data.bedrooms"
                    data-si-value="{{item.value}}"
                    si-change="filter.update()"
                    data-label="{{item.label}}"
                ></si-radio>

            <si-radio
                    name="bedrooms-count"
                    data-ng-model="filter.data.bedrooms"
                    data-si-value=""
                    si-change="filter.update()"
                    data-label="<?php si_label('Any') ?>"
                ></si-radio>
            
        </div>

        <div class="bathrooms">
            <h4><?php si_label('Bathrooms') ?></h4>
            
            <si-radio
                    data-ng-repeat="item in bathroomSuggestions"
                    name="bathrooms-count"
                    data-ng-model="filter.data.bathrooms"
                    data-si-value="{{item.value}}"
                    si-change="filter.update()"
                    data-label="{{item.label}}"
                ></si-radio>

            <si-radio
                    name="bathrooms-count"
                    data-ng-model="filter.data.bathrooms"
                    data-si-value=""
                    si-change="filter.update()"
                    data-label="<?php si_label('Any') ?>"
                ></si-radio>

        </div>
    </div>

    <div class="filter-panel-actions">
    <?php include '_actions.php'; ?>
    </div>
</div>