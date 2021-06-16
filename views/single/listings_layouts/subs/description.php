<div class="description si-apply-typography">{{model.description}}</div>
<div class="legal-notes" ng-if="model.legal_notes != null">
    <i class="fas fa-exclamation-triangle"></i>
    <div class="si-note-list">
        <div ng-repeat="item in model.legal_notes">{{item.caption}}</div>
    </div>
</div>