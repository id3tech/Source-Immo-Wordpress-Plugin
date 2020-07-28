<div class="si-detail-section office">
    <h3>{{'Office'.translate()}}</h3>
    <div class="item-content">
        <div class="name"><a href="{{model.office.permalink}}">{{model.office.agency.name}}</a></div>
        <div class="license">{{model.office.license}}</div>

        <div class="location">
            <div class="icon"><i class="fal fa-map-marker-alt"></i></div>
            <div class="address">{{model.office.location.address.street_number}} {{model.office.location.address.street_name}}, {{model.office.location.city}}</div>
            <div class="country">{{model.office.location.state}}, {{model.office.location.country}}</div>
        </div>
        
    </div>
</div>