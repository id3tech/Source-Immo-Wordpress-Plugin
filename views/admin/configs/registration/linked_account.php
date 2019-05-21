
<div class="infos">
    <h2><?php   _e('Your accounts', SI) ?></h2>
    <p><?php    _e('Select one of these account as the source for your real estate data',SI) ?></p>
</div>

<div class="account-list">
    <div ng-repeat="item in accounts.items"
        class="account-item">
        <label>{{item.account.name}}</label>
        <span></span>
        <md-button ng-click="item.clickHandler()">{{'Select'.translate()}}</md-button>
    </div>
</div>