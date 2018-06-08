<div class="config-grid-block">
  <h2 class="md-headline">Authentication</h2>
  <div class="block-content" layout="column" layout-align="start stretch" layout-padding>
    <md-input-container>
      <label>Api key</label>
      <input ng-model="configs.api_key" required />
    </md-input-container>

    <md-input-container>
      <label>Account ID</label>
      <input ng-model="configs.account_id" required />
    </md-input-container>
  </div>
</div>


<div class="config-grid-block">
  <h2 class="md-headline">Permalinks</h2>

  <div class="block-content" layout="column" layout-align="start stretch" layout-padding>
    <div class="route-item headers">
      <div>Language</div>
      <div>Route</div>
    </div>
    <div class="route-item" ng-repeat="route in configs.detail_routes">
      <md-input-container>
        <md-select ng-model="route.lang">
          <md-option ng-repeat="(key, value) in lang_codes" value="{{key}}">{{value}}</option>
        </md-select>
      </md-input-container>
      <md-input-container>
        <input ng-model="route.route" />
      </md-input-container>

      <md-menu>
        <md-button class="md-icon-button" ng-click="$mdOpenMenu()"><i class="far fa-ellipsis-h"></i></md-button>
        <md-menu-content>
          <md-menu-item ng-repeat="(key, value) in route_elements">
            <md-button ng-click="addRouteElement(route, key)"><md-icon class="fal fa-plus"></md-icon> {{value}}</md-button>
          </md-menu-item>
          <md-divider></md-divider>
          <md-menu-item>
            <md-button ng-disabled="hasMinRouteCount()" ng-click="removeRoute(route)"><md-icon class="fal fa-times"></md-icon> Remove</md-button>
          </md-menu-item>
        </md-menu-content>
      </md-menu>
    </div>
    <div layout="row" layout-align="center center">
      <md-button class="md-raised md-primary md-icon-button" ng-disabled="hasMaxRouteCount()" ng-click="addRoute()"><i class="fal fa-plus fa-lg"></i></md-button>
    </div>
  </div>
</div>
