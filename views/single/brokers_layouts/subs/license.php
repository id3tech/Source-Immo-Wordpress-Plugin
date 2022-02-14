<div class="si-detail-section">
    <div class="license-title si-apply-typography">
        {{(model.title || model.license_type) | siApplyGenre : model.ref_number : model.genre | siBrokerTitle : model.ref_number }}
    </div>
</div>