<div class="info-request form">
    <div class="firstname input-container">
        <label><?php _e('First name', SI) ?></label>
        <div class="input">
            <input type="text" data-ng-model="message_model.firstname" required />
        </div>
    </div>

    <div class="lastname input-container">
        <label><?php _e('Last name', SI) ?></label>
        <div class="input" >
            <input type="text" data-ng-model="message_model.lastname" required />
        </div>
    </div>

    <div class="phone input-container">
        <label><?php _e('Phone', SI) ?></label>
        <div class="input">
            <input type="text" data-ng-model="message_model.phone" required />
        </div>
    </div>

    <div class="email input-container">
        <label><?php _e('Email', SI) ?></label>
        <div class="input">
            <input type="text" data-ng-model="message_model.email" required />
        </div>
    </div>

    <div class="subject input-container">
        <label><?php _e('Subject', SI) ?></label>
        <div class="input">
            <input type="text" data-ng-model="message_model.subject" required />
        </div>
    </div>

    <div class="message input-container">
        <label><?php _e('Message', SI) ?></label>
        <div class="input">
            <textarea rows="5" data-ng-model="message_model.message"></textarea>
        </div>
    </div>
</div>