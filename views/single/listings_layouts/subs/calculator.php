<div id="calculator" class="mortgage-calculator" data-ng-show="allowCalculator()">
    <div class="si-title"><i class="fal fa-calculator"></i> <?php _e('Estimate your mortgage',SI) ?></div>
    <si-calculator class="si-padding-block"
        data-si-amount="model.price.sell.amount" 
        data-on-change="onMortgageChange($result)" 
        data-si-region="{{model.location.region_code}}"
        data-si-city="{{model.location.city_code}}"></si-calculator>

    
</div>