<div class="info-request form">
    <div class="firstname input-container">
        <label><?php _e('First name', IMMODB) ?></label>
        <div class="input">
            <input type="text" ng-model="message_model.firstname" />
        </div>
    </div>

    <div class="lastname input-container">
        <label><?php _e('Last name', IMMODB) ?></label>
        <div class="input" ng-model="message_model.lastname">
            <input type="text" />
        </div>
    </div>

    <div class="phone input-container">
        <label><?php _e('Phone', IMMODB) ?></label>
        <div class="input">
            <input type="text" ng-model="message_model.phone" />
        </div>
    </div>

    <div class="email input-container">
        <label><?php _e('Email', IMMODB) ?></label>
        <div class="input">
            <input type="text" ng-model="message_model.email" />
        </div>
    </div>

    <div class="subject input-container">
        <label><?php _e('Subject', IMMODB) ?></label>
        <div class="input">
            <input type="text" ng-model="message_model.subject" />
        </div>
    </div>

    <div class="message input-container">
        <label><?php _e('Message', IMMODB) ?></label>
        <div class="input">
            <textarea rows="5" ng-model="message_model.message"></textarea>
        </div>
    </div>
</div>