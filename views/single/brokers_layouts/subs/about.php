
<div class="si-detail-section si-about" 
        ng-if="model.description | siHasValue">

    <div class="si-text si-apply-typography" data-ng-bind-html="model.description | textToHtml"></div>

</div>