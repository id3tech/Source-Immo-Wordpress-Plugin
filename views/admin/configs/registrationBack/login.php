<div class="message">
    <p><?php _e('Please sign in using your Source.Immo account credentials',SI) ?></p>
</div>

<div class="login-box">
    <md-input-container>
        <label><?php _e('Email',SI) ?></label>
        <input ng-model="login_infos.email" si-on-enter="signin()" />
    </md-input-container>

    <md-input-container>
        <label><?php _e('Password',SI) ?></label>
        <input ng-model="login_infos.password" type="password" si-on-enter="signin()" />
    </md-input-container>

    <div layout="row" layout-align="center center">
        <md-button class="md-raised md-primary" ng-disabled="signin_in===true || login_infos.password=='' || login_infos.email == ''" ng-click="signin()"><?php _e('Sign in',SI) ?></md-button>
        <md-button class="" href="https://portal.source.immo/" target="_blank"><?php _e('Create an account',SI) ?></md-button>
    </div>
</div>