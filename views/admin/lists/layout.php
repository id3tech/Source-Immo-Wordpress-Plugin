<div class="list-layout">
    <h5><?php _e("Item's space on the row",SI) ?></h5>
    <div><?php _e("Ajust the space taken by an item on the row, for each device's scope.",SI) ?></div>
    <div layout="row" layout-align="space-between center">
        <md-input-container >
            <md-icon class="fal fa-desktop"></md-icon>
            <input ng-model="model.list_layout.item_row_space.desktop" />
            <md-icon class="fal fa-percent"></md-icon>
        </md-input-container>

        <md-input-container >
            <md-icon class="fal fa-laptop"></md-icon>
            <input ng-model="model.list_layout.item_row_space.laptop" />
            <md-icon class="fal fa-percent"></md-icon>
        </md-input-container>

        <md-input-container >
            <md-icon class="fal fa-tablet"></md-icon>
            <input ng-model="model.list_layout.item_row_space.tablet" />
            <md-icon class="fal fa-percent"></md-icon>
        </md-input-container>

        <md-input-container >
            <md-icon class="fal fa-mobile"></md-icon>
            <input ng-model="model.list_layout.item_row_space.mobile" />
            <md-icon class="fal fa-percent"></md-icon>
        </md-input-container>
    </div>
    

    <style type="text/css" ng-bind="getCustomCss()"></style>
    
    <h5 lstr>Preview</h5>

    <si-list-preview ng-model="model"></si-list-preview>


 
    
</div>