<div class="contact">
    <div class="phone-list">
        <!-- ngRepeat: (key,phone) in model.phones --><div class="item ng-binding ng-scope" data-ng-repeat="(key,phone) in model.phones">
            <i class="fal fa-fw fa-building"></i> <span>514.555.2100</span>
        </div><!-- end ngRepeat: (key,phone) in model.phones -->
    </div>

    <div class="actions">
        <div class="si-part si-prevent-typography align-stretch si-part-info-request">
            <div class="si-part align-stretch si-part-info-request-button">
                <button type="button" class="button si-modal-trigger ng-isolate-scope"><span ng-show="request_sent == undefined"><i class="fal fa-envelope"></i> Envoyer un message</span></button>
            </div>
        </div>
    </div>
</div>