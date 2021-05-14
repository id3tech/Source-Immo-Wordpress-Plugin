<div class="address" data-ng-show="model.location.full_address!=undefined">{{model.location.full_address}}</div>
<div class="near" data-ng-show="model.location.details!=undefined">{{model.location.details}}</div>
<div class="location-path">
    <div class="city" data-ng-show="model.location.address==undefined">{{model.location.city}}</div>
    <div class="district" data-ng-show="model.location.district!=undefined">{{model.location.district}}</div>
    <div class="region">{{model.location.region}}</div>
    <div class="state">{{model.location.state}}</div>
</div>