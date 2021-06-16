<div class="contact">
    <div class="phone-list">
        <!-- ngRepeat: (key,phone) in model.phones -->
        <div class="item si-apply-typograhy ng-binding ng-scope" data-ng-repeat="(key,phone) in model.phones">
            <i class="fal fa-fw fa-mobile"></i> (514) 555-9283
        </div><!-- end ngRepeat: (key,phone) in model.phones -->
        <div class="item si-apply-typograhy ng-binding ng-scope" data-ng-repeat="(key,phone) in model.phones">
            <i class="fal fa-fw fa-building"></i> (514) 555-2611
        </div><!-- end ngRepeat: (key,phone) in model.phones -->
    </div>

    <div class="actions">
        <div class="si-part si-prevent-typography align-stretch si-part-info-request">
            <div class="si-part align-stretch si-part-info-request-button"><button type="button" class="button si-modal-trigger ng-isolate-scope" ng-disabled="request_sent === true" data-target="information_request">
                    <span ng-show="request_sent == undefined"><i class="fal fa-envelope"></i> Envoyer un message</span>
                    <span ng-show="request_sent === true" class="ng-hide">Merci</span>
                </button></div>
            <div class="si-part align-stretch si-part-info-request-modal">
            </div>
        </div>
    </div>
</div>