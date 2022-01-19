<div class="infos">
    <h2><?php   _e('API Key', SI) ?></h2>
    <p><?php    _e('We have detect more than one API key. Please choose one.',SI) ?></p>
</div>

<div class="key-list">
    <div ng-repeat="item in api_keys.items"
        class="key-item">

        <label>{{item.name}}</label>
        <span></span>
        <md-button ng-click="item.clickHandler()">{{'Select'.translate()}}</md-button>
    </div>
</div>