<div class="general-settings">
  

  <div class="config-grid-block">
    <h2 class="md-headline"><?php _e('Permalinks',IMMODB)?></h2>

    <div class="block-content" layout="column" layout-align="start stretch">
      <md-checkbox ng-model="configs.enable_custom_page"><?php _e('Enable custom page overrides',IMMODB) ?></md-checkbox>
      
      <div class="route-item headers">
        <div><?php _e('Language',IMMODB)?></div>
        <div><?php _e('Route',IMMODB)?></div>
      </div>

      <h4><?php _e('Listings', IMMODB) ?></h4>
      <div class="route-item" ng-repeat="route in configs.listing_routes">
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
            <md-menu-item>
              <md-button ng-disabled="hasMinRouteCount(configs.listing_routes)" ng-click="removeRoute(route,'listing_routes')"><md-icon class="fal fa-times"></md-icon> <?php _e('Remove', IMMODB) ?></md-button>
            </md-menu-item>
            <md-divider></md-divider>
            <md-menu-item ng-repeat="(key, value) in route_listing_elements">
              <md-button ng-click="addRouteElement(route, key)"><md-icon class="fal fa-plus"></md-icon> {{value}}</md-button>
            </md-menu-item>
          </md-menu-content>
        </md-menu>
      </div>
      <div layout="row" layout-align="center center">
        <md-button class="md-raised md-primary md-icon-button" ng-disabled="hasMaxRouteCount(configs.listing_routes)" ng-click="addRoute(configs.listing_routes)"><i class="fal fa-plus fa-lg"></i></md-button>
      </div>

      <h4><?php _e('Brokers', IMMODB) ?></h4>
      <div class="route-item" ng-repeat="route in configs.broker_routes">
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
            <md-menu-item>
              <md-button ng-disabled="hasMinRouteCount(configs.broker_routes)" ng-click="removeRoute(route,'broker_routes')"><md-icon class="fal fa-times"></md-icon> <?php _e('Remove', IMMODB) ?></md-button>
            </md-menu-item>
            <md-divider></md-divider>
            <md-menu-item ng-repeat="(key, value) in route_broker_elements">
              <md-button ng-click="addRouteElement(route, key)"><md-icon class="fal fa-plus"></md-icon> {{value}}</md-button>
            </md-menu-item>
          </md-menu-content>
        </md-menu>
      </div>
      <div layout="row" layout-align="center center">
        <md-button class="md-raised md-primary md-icon-button" ng-disabled="hasMaxRouteCount(configs.broker_routes)" ng-click="addRoute(configs.broker_routes)"><i class="fal fa-plus fa-lg"></i></md-button>
      </div>

      <h4><?php _e('Cities', IMMODB) ?></h4>
      <div class="route-item" ng-repeat="route in configs.city_routes">
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
            <md-menu-item>
              <md-button ng-disabled="hasMinRouteCount(configs.city_routes)" ng-click="removeRoute(route,'city_routes')"><md-icon class="fal fa-times"></md-icon> <?php _e('Remove', IMMODB) ?></md-button>
            </md-menu-item>
            <md-divider></md-divider>
            <md-menu-item ng-repeat="(key, value) in route_city_elements">
              <md-button ng-click="addRouteElement(route, key)"><md-icon class="fal fa-plus"></md-icon> {{value}}</md-button>
            </md-menu-item>
            
          </md-menu-content>
        </md-menu>
      </div>
      <div layout="row" layout-align="center center">
        <md-button class="md-raised md-primary md-icon-button" ng-disabled="hasMaxRouteCount(configs.city_routes)" ng-click="addRoute(configs.city_routes)"><i class="fal fa-plus fa-lg"></i></md-button>
      </div>
    </div>
  </div>



</div>
