<div class="si-detail-section cities" data-ng-if="cities | siHasValue">
    <h3>{{'Cities'.translate()}}</h3>
    <div class="content">
        <a class="city" ng-repeat="city in cities" href="{{city.permalink}}">{{city.name}}</a>
    </div>
</div>