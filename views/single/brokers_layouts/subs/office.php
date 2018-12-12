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