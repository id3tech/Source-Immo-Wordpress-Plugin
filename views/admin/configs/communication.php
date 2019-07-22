<md-input-container>
    <label><?php _e('Method used to build forms and manage results',SI) ?></label>
    <md-select ng-model="layout.communication_mode" ng-change="save_configs()" >
        <md-option value="basic"><?php _e('Basic',SI) ?></md-option>
        <md-option value="wpcf7_contact_form">Contact Form 7</md-option>
        <md-option value="gravity_form">Gravity Form</md-option>
    </md-select>
</md-input-container>

<div layout="column" layout-align="start stretch" ng-show="['wpcf7_contact_form','gravity_form'].includes(layout.communication_mode)">
    <md-input-container flex>
        <label><?php _e('Form to use',SI) ?></label>
        <md-select ng-model="layout.form_id" ng-change="save_configs()" >
            <md-option ng-repeat="item in formList | filter : {'type':layout.communication_mode} " value="{{item.id}}">{{item.title}}</md-option>
        </md-select>
    </md-input-container>
</div>