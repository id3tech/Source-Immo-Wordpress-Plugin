
<div class="si-detail-section about" 
        ng-if="model.description | siHasValue">

    <div class="si-text" data-ng-bind-html="model.description | textToHtml"></div>

</div>