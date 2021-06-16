<div class="main-office-address si-apply-typography">
    <i class="fal fa-fw fa-map-marker-alt"></i>
    <div class="info-content">
        <div itemprop="streetAddress">{{model.main_office.location.street_address}}</div> 
        <span itemprop="city">{{model.main_office.location.city}}</span>, <span>{{model.main_office.location.state}}</span>, <span>{{model.main_office.location.address.postal_code}}</span>
    </div>
</div>