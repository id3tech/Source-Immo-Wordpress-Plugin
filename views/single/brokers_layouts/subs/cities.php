<div class="cities">
    <h3>{{'Cities'.translate()}}</h3>
    <div class="content">
        <a class="city" ng-repeat="city in model.cities" href="{{city.permalink}}">{{city.name}}</a>
    </div>
</div>