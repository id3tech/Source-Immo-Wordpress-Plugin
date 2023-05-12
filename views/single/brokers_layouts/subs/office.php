<div class="si-detail-section si-office">
    <div class="si-item-content">
        <div class="si-name notranslate"><a href="{{model.office.permalink}}">{{model.office.agency.name}}</a></div>
        <div class="si-license">{{model.office.agency.license_type}}</div>

        <div class="si-location">
            <div class="si-address">{{model.office.location.address.street_number}} {{model.office.location.address.street_name}}, {{model.office.location.city}}</div>
            <div class="si-country">{{model.office.location.state}}, {{model.office.location.country}}</div>
        </div>
        
    </div>
</div>