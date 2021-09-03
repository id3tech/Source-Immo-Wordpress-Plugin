<div class="si-detail-section office">
    <div class="item-content">
        <div class="name notranslate"><a href="{{model.office.permalink}}">{{model.office.agency.name}}</a></div>
        <div class="license">{{model.office.agency.license_type}}</div>

        <div class="location">
            <div class="address">{{model.office.location.address.street_number}} {{model.office.location.address.street_name}}, {{model.office.location.city}}</div>
            <div class="country">{{model.office.location.state}}, {{model.office.location.country}}</div>
        </div>
        
    </div>
</div>