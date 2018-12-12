<div class="info">
    <div class="head">
        <h1 class="name">
            <span class="firstname">{{model.first_name}}</span> <span class="lastname">{{model.last_name}}</span>
        </h1>
        <div class="license-title">
            {{model.license_type}}
        </div>
    </div>

    <div class="bio">
        <label class="placeholder" data-ng-show="model.bio==undefined">{{'{0} did not compose a biography for the moment'.translate().format(model.first_name)}}</label>
        <div data-ng-html="model.bio"></div>
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