<div class="general-infos">
    <div class="welcome-message">
        <h1><?php _e('Welcome', SI) ?></h1>
        <p><?php _e('Thank you for using source.immo plugin for Worpress.', SI) ?></p>

        <p><?php _e("This plugin is used to display your real estate data. To modify those data, please visit the <a href=\"https://source.immo\">source.immo website</a>", SI) ?></p>
    </div>

    <div class="notice-list">
        <si-notice ng-repeat="item in notices" si-model="item"></si-notice>
    </div>

    <div class="informations">
        
    </div>
    
</div>