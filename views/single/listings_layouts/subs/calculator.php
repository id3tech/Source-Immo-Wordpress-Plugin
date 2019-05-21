<div id="calculator" class="mortgage-calculator" data-ng-show="model.status_code!='SOLD' && model.price.sell!=undefined">
    <div class="title"><i class="fal fa-calculator"></i> <?php _e('Estimate your mortgage',SI) ?></div>
    <si-calculator data-si-amount="model.price.sell.amount" data-on-change="onMortgageChange($result)" data-si-region="{{model.location.region_code}}"></si-calculator>

    <div class="result">
        <div class="mortgage">
            <label><?php _e('Estimated mortgage payments',SI) ?></label>
            <div class="value"><em>{{calculator_result.mortgage.payment.formatPrice()}}</em>{{calculator_result.mortgage.frequency_caption.translate().toLowerCase()}}</div>
        </div>
        <div class="transfer-taxes">
            <label><?php _e('Transfer taxes',SI) ?></label>
            <div class="value"><em>{{calculator_result.transfer_tax.formatPrice()}}*</em></div>
            <div class="notice">*<?php _e('This amount is displayed for information only. The calculation of the transfer tax is based on the basic calculations generally in effect in Québec. This amount may vary depending on the city. Consult your real estate broker for the exact amount.',SI)?></div>
        </div>
    </div>
</div>