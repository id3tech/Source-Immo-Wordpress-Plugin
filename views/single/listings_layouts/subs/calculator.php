<div id="calculator" class="mortgage-calculator" ng-show="model.status!='SOLD' && model.price.sell!=undefined">
    <div class="title"><i class="fal fa-calculator"></i> <?php _e('Estimate your mortgage',IMMODB) ?></div>
    <immodb-calculator immodb-amount="model.price.sell.amount" on-change="onMortgageChange($result)" immodb-region="{{model.location.region_code}}"></immodb-calculator>

    <div class="result">
        <div class="mortgage">
            <label><?php _e('Estimated mortgage payments',IMMODB) ?></label>
            <div class="value"><em>{{calculator_result.mortgage.payment.formatPrice()}}</em>{{calculator_result.mortgage.frequency_caption.translate().toLowerCase()}}</div>
        </div>
        <div class="transfer-taxes">
            <label><?php _e('Transfer taxes',IMMODB) ?></label>
            <div class="value"><em>{{calculator_result.transfer_tax.formatPrice()}}</em></div>
        </div>
    </div>
</div>