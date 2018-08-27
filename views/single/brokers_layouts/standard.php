
<div class="left-column">
    <div class="info">
        <div class="head">
            <h1 class="name">
                <span class="firstname">{{model.first_name}}</span> <span class="lastname">{{model.last_name}}</span>
            </h1>
            <div class="license-title">
                {{model.license_type}}
            </div>
        </div>

        <div class="bio">
            <label class="placeholder" ng-show="model.bio==undefined">{{'{0} did not compose a biography for the moment'.translate().format(model.first_name)}}</label>
            <div ng-html="model.bio"></div>
        </div>

        <div class="languages">
            <h5 class="title"><?php _e('Languages',IMMODB) ?></h5>
            <span>{{model.languages}}</span>
        </div>

        <div class="expertises">
            <h5 class="title"><?php _e('Expertises',IMMODB) ?></h5>
            <span>{{model.expertises}}</span>
        </div>
    </div>



    <div class="listing-list immodb-list-of-listings">
        <div ng-show="model.listings.length>0">
            <div class="layout-row layout-space-between">
                <h3>{{(model.listings.length==1 ? '1 property' : '{0} properties').translate().format(model.listings.length)}}</h3>

                <div class="search-input">
                    <input placeholder="{{'Use keywords to filter the list'.translate()}}" ng-model="filter_keywords" />
                    <i class="far fa-search"></i>
                </div>
            </div>
            <div class="list-container">
                <div ng-repeat="item in model.listings | filter : filterListings" ng-animate>
                    <?php
                    ImmoDB::view("list/listings/standard/item-small");
                    ?>
                </div>
            </div>
        </div>
        <label class="placeholder" ng-show="model.listings.length==0">{{'{0} has no properties yet'.translate().format(model.first_name)}}</label>
    </div>
</div>

<div class="right-column">
    <div class="picture">
        <img src="{{model.photo.url}}" />
    </div>

    <div class="contact">
        <h3>{{'To contact {0}'.translate().format(model.first_name)}}</h3>
        <div class="phone-list">
            <div class="item" ng-repeat="(key,phone) in model.phones">
                <i class="fal fa-fw fa-{{getPhoneIcon(key)}}"></i> {{phone}}
            </div>
        </div>
        <div class="actions">
            <button type="button"><i class="fal fa-envelope"></i> <?php _e('Send a message',IMMODB) ?></button>
        </div>
    </div>

    <div class="office">
        <h3>{{'Office'.translate()}}</h3>
        <div class="content">
            <div class="icon"><i class="fal fa-2x fa-map-marker-alt"></i></div>
            <div class="title">{{model.office.name}}</div>
            <div class="address">{{model.office.location.address.street_number}} {{model.office.location.address.street_name}}</div>
            <div class="city">{{model.office.location.city}}, {{model.office.location.state_code}}</div>
            <div class="country">{{model.office.location.country}}</div>
        </div>
    </div>
</div>
