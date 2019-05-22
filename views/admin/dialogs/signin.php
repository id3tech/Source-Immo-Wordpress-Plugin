<div class="signin-form" layout="column" layout-align="start stretch">
    <md-input-container>
        <label><?php _e("Email",SI) ?></label>
        <input ng-model="login_infos.email" si-on-enter="login()" />
    </md-input-container>

    <md-input-container>
        <label><?php _e("Password",SI) ?></label>
        <input type="password" ng-model="login_infos.password" si-on-enter="login()" />
    </md-input-container>

</div>