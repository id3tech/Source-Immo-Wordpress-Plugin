
<div class="bio {{model.description != undefined && model.description.length > 400 ? 'long' : ''}} {{bio.expanded ? 'expanded' : ''}}">
    <div class="text" data-ng-bind-html="model.description | textToHtml"></div>

    <button class="button" ng-click="bio.expanded = !bio.expanded">{{(bio.expanded ? 'Read less' : 'Read more').translate()}}</button>
</div>