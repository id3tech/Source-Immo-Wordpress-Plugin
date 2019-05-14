<div class="infos">
    <h2><?php   _e('Data views', IMMODB) ?></h2>
    <p><?php    _e('Select one of these views as the default source of data',IMMODB) ?></p>
</div>

<div class="view-list">
    <div ng-repeat="item in data_views"
        class="view-item">
        <label>{{item.name}}</label>
        <span></span>
        <md-button ng-click="item.clickHandler()">{{'Select'.translate()}}</md-button>
    </div>
</div>