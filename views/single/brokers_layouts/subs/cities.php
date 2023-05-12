<div class="si-detail-section si-cities" data-ng-if="cities | siHasValue">
    <h3>{{'Cities'.translate()}}</h3>
    <div class="si-content">
        <a class="si-city" ng-repeat="city in cities" href="{{city.permalink}}">{{city.name}}</a>
    </div>
</div>