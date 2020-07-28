<?php
$panelKey = 'others';
?>

<div class="filter-panel others-panel {{isExpanded('<?php echo($panelKey) ?>')}}">
    <div class="filter-panel-header">
        <h4><?php _e('More', SI) ?></h4>
        <button class="button" type="button"  ng-click="toggleExpand($event,'<?php echo($panelKey) ?>')"><i class="fal fa-times"></i></button>
    </div>
    <div class="filter-panel-content">
        <div class="si-auto-columns">
            <div class="languages filter-row" ng-if="dictionary.language">
                <si-input-container>
                        <label><?php _e('Spoken language',SI) ?></label>
                        <si-select class="si-input" si-model="filter.data.languages" si-change="filter.update()">
                            <si-option value=""><?php _e('Any',SI) ?></si-option>
                            <si-option ng-repeat="(key,item) in dictionary.language" value="{{key}}">{{item.caption}}</si-option>
                        </si-select>
                    </si-input-container>
            </div>

            <div class="licenses filter-row">
                <si-input-container>
                    <label><?php _e('License type',SI) ?></label>
                    <si-select class="si-input" si-model="filter.data.licenses" si-change="filter.update()">
                        <si-option value=""><?php _e('Any',SI) ?></si-option>
                        <si-option ng-repeat="(key,item) in dictionary.broker_license_type" value="{{key}}">{{item.caption}}</si-option>
                    </si-select>
                </si-input-container>
            </div>
        </div>
    </div>

    <div class="filter-panel-actions">
        <?php include '_actions.php'; ?>
    </div>
</div>