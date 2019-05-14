<div class="message">
    <h3 class="md-text-warn"><i class="fal fa-exclamation-triangle"></i> <?php _e('You are in DEMO mode', IMMODB)?></h3>
    <p><?php _e('Please sign in to control what will be displayed on your site',IMMODB) ?></p>
</div>

<div class="login-box">
    <md-input-container>
        <label><?php _e('Email',IMMODB) ?></label>
        <input ng-model="login_infos.email" si-on-enter="signin()" />
    </md-input-container>

    <md-input-container>
        <label><?php _e('Password',IMMODB) ?></label>
        <input ng-model="login_infos.password" type="password" si-on-enter="signin()" />
    </md-input-container>

    <div layout="row" layout-align="center center">
        <md-button class="md-raised md-primary" ng-click="signin()"><?php _e('Sign in',IMMODB) ?></md-button>
        <md-button class="" href="https://portal.source.immo/" target="_blank"><?php _e('Create an account',IMMODB) ?></md-button>
    </div>
</div>