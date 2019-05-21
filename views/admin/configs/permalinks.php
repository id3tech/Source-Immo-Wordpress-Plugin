<div class="permalink-settings">
  <h2 class="md-headline"><?php _e('Permalinks',SI)?></h2>

  <div layout="column" layout-align="start stretch">
    
    <div class="si-route-box headers">
      <div><?php _e('Language',SI)?></div>
      <div><?php _e('Route',SI)?></div>
      <div><?php _e('Shortcut',SI)?></div>
      <div class="empty"></div>
      <div class="empty"></div>
      <div class="empty"></div>
    </div>

    <h4><i class="fas fa-home"></i> <?php _e('Listings', SI) ?></h4>
    <si-route-box class="route-item" 
        ng-repeat="route in configs.listing_routes" 
        route="route" list="configs.listing_routes"
        type="listing" si-change="save_configs()"
      ></si-route-box>

    <div layout="row" layout-align="center center">
      <md-button class="md-raised md-primary md-icon-button" ng-disabled="hasMaxRouteCount(configs.listing_routes)" ng-click="addRoute(configs.listing_routes)"><i class="fal fa-plus fa-lg"></i></md-button>
    </div>

    <h4><i class="fas fa-users"></i> <?php _e('Brokers', SI) ?></h4>
    <si-route-box class="route-item" 
        ng-repeat="route in configs.broker_routes" 
        route="route" list="configs.broker_routes"
        type="broker"  si-change="save_configs()"
      ></si-route-box>
    <div layout="row" layout-align="center center">
      <md-button class="md-raised md-primary md-icon-button" ng-disabled="hasMaxRouteCount(configs.broker_routes)" ng-click="addRoute(configs.broker_routes)"><i class="fal fa-plus fa-lg"></i></md-button>
    </div>

    <h4><i class="fas fa-map-marker-alt"></i> <?php _e('Cities', SI) ?></h4>
    <si-route-box class="route-item" 
        ng-repeat="route in configs.city_routes" 
        route="route" list="configs.city_routes"
        type="city"  si-change="save_configs()"
      ></si-route-box>
    <div layout="row" layout-align="center center">
      <md-button class="md-raised md-primary md-icon-button" ng-disabled="hasMaxRouteCount(configs.city_routes)" ng-click="addRoute(configs.city_routes)"><i class="fal fa-plus fa-lg"></i></md-button>
    </div>

    <h4><?php _e('Options', SI) ?></h4>
    <md-checkbox ng-model="configs.enable_custom_page" ng-change="save_configs()"><?php _e('Enable custom page overrides',SI) ?></md-checkbox>
  </div>
</div>
