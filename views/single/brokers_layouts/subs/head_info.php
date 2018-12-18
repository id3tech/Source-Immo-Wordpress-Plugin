<div class="info">
    <div class="head">
        <h1 class="name">
            <span class="firstname">{{model.first_name}}</span> <span class="lastname">{{model.last_name}}</span>
        </h1>
        <div class="license-title">
            {{model.license_type}}
        </div>
    </div>

    <div class="bio {{model.description != undefined && model.description.length > 400 ? 'long' : ''}} {{bio.expanded ? 'expanded' : ''}}">
        <label class="placeholder" data-ng-show="model.description==undefined">{{'{0} did not compose a biography for the moment'.translate().format(model.first_name)}}</label>
        <div class="text" data-ng-bind-html="model.description | textToHtml"></div>

        <button class="button" ng-click="bio.expanded = !bio.expanded">{{(bio.expanded ? 'Read less' : 'Read more').translate()}}</button>
    </div>

    <div class="languages">
        <h5 class="title"><?php _e('Languages',IMMODB) ?></h5>
        <span>{{model.languages}}</span>
    </div>

    <div class="expertises">
        <h5 class="title"><?php _e('Expertises',IMMODB) ?></h5>
        <span>{{model.expertises}}</span>
    </div>
</div>