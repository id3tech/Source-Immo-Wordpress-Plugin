<div class="general-settings">
  <div class="config-grid-block">
      <h2 class="md-headline"><?php _e('Data source',IMMODB)?></h2>
      <div class="block-content" layout="column" layout-align="start stretch">
          <md-input-container>
              <label><?php _e('Default data view', IMMODB) ?></label>
              <md-select ng-model="configs.default_view">
                  <md-option ng-repeat="item in data_views" value="{{item}}">{{item.name}} ({{item.id}})</md-option>
              </md-select>
          </md-input-container>
      </div>
  </div>

  <div class="config-grid-block">
    <h2 class="md-headline"><?php _e('Permalinks',IMMODB)?></h2>

    <div class="block-content" layout="column" layout-align="start stretch">
      
      <div class="immodb-route-box headers">
        <div><?php _e('Language',IMMODB)?></div>
        <div><?php _e('Route',IMMODB)?></div>
        <div><?php _e('Shortcut',IMMODB)?></div>
        <div class="empty"></div>
        <div class="empty"></div>
        <div class="empty"></div>
      </div>

      <h4><i class="fas fa-home"></i> <?php _e('Listings', IMMODB) ?></h4>
      <immodb-route-box class="route-item" 
        ng-repeat="route in configs.listing_routes" 
        route="route" list="configs.listing_routes"
        type="listing"
        ></immodb-route-box>

      <div layout="row" layout-align="center center">
        <md-button class="md-raised md-primary md-icon-button" ng-disabled="hasMaxRouteCount(configs.listing_routes)" ng-click="addRoute(configs.listing_routes)"><i class="fal fa-plus fa-lg"></i></md-button>
      </div>

      <h4><i class="fas fa-users"></i> <?php _e('Brokers', IMMODB) ?></h4>
      <immodb-route-box class="route-item" 
        ng-repeat="route in configs.broker_routes" 
        route="route" list="configs.broker_routes"
        type="broker"
        ></immodb-route-box>
      <div layout="row" layout-align="center center">
        <md-button class="md-raised md-primary md-icon-button" ng-disabled="hasMaxRouteCount(configs.broker_routes)" ng-click="addRoute(configs.broker_routes)"><i class="fal fa-plus fa-lg"></i></md-button>
      </div>

      <h4><i class="fas fa-map-marker-alt"></i> <?php _e('Cities', IMMODB) ?></h4>
      <immodb-route-box class="route-item" 
        ng-repeat="route in configs.city_routes" 
        route="route" list="configs.city_routes"
        type="city"
        ></immodb-route-box>
      <div layout="row" layout-align="center center">
        <md-button class="md-raised md-primary md-icon-button" ng-disabled="hasMaxRouteCount(configs.city_routes)" ng-click="addRoute(configs.city_routes)"><i class="fal fa-plus fa-lg"></i></md-button>
      </div>

      <h4><?php _e('Options', IMMODB) ?></h4>
      <md-checkbox ng-model="configs.enable_custom_page"><?php _e('Enable custom page overrides',IMMODB) ?></md-checkbox>
    </div>
  </div>
</div>
