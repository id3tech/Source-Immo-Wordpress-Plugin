
<div class="bio {{model.description != undefined && model.description.length > 400 ? 'long' : ''}} {{bio.expanded ? 'expanded' : ''}}">
    <label class="placeholder" data-ng-show="model.description==undefined">{{'{0} did not compose a biography for the moment'.translate().format(model.first_name)}}</label>
    <div class="text" data-ng-bind-html="model.description | textToHtml"></div>

    <button class="button" ng-click="bio.expanded = !bio.expanded">{{(bio.expanded ? 'Read less' : 'Read more').translate()}}</button>
</div>