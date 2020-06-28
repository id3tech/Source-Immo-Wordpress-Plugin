<div class="price">
    <div ng-bind-html="model.long_price"></div>
    <div class="mortgage" data-ng-show="allowCalculator()">
        <span><?php _e('Estimated mortgage payments',SI) ?>: </span>
        <span class="nowrap"><a href="#" data-ng-click="scrollTo('#calculator')">{{calculator_result.mortgage.payment.formatPrice()}} {{calculator_result.mortgage.frequency_caption.translate().toLowerCase()}}</span></a></div>
</div>