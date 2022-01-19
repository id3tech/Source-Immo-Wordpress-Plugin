<div class="unregister-box {{working ? 'working' : ''}}" ng-cloak ng-show="!configs.registered" style="--register-step:{{configuration_step}}">
  <div class="registration-summary" ng-show="configuration_step > 0">
      <h1><?php _e('Welcome', SI) ?> {{credentials.context.user.name}}</h1>

      <p><?php _e("We will guide you through the registration process. Don't worry, it will be quick.",SI) ?></p>

      <h4><?php _e("Registration roadmap",SI) ?></h4>
      <ol>
        <li ng-repeat="step in registration_steps"
            class="step {{$index == configuration_step-1 ? 'current' : ''}} {{$index < configuration_step-1 ? 'done' : ''}}"
            >{{step.name.translate()}}</li>
      </ol>
  </div>

  <div class="registration-trolley">
    <!-- LOGIN -->
    <div class="registration-step">
      <?php SourceImmo::view('admin/configs/registration/login') ?>
    </div>

    <!-- LINKED ACCOUNT -->
    <div class="registration-step">
        <?php SourceImmo::view('admin/configs/registration/linked_account') ?>
    </div>


    <!-- API KEY -->
    <div class="registration-step">
        <?php SourceImmo::view('admin/configs/registration/api_key') ?>
    </div>

    <!-- VIEW -->
    <div class="registration-step">
        <?php SourceImmo::view('admin/configs/registration/views') ?>
    </div>

    <!-- VIEW -->
    <div class="registration-step">
      <?php SourceImmo::view('admin/configs/registration/pages') ?>
        
    </div>

  </div>
</div>

<div class="message-box" ng-show="message != null">
  <div class="content">
    <svg ng-show="message.show_icon" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
      <circle class="path circle" fill="none" stroke="#73AF55" stroke-width="6" stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1"/>
      <polyline class="path check" fill="none" stroke="#73AF55" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 "/>
    </svg>
    <h2>{{message.title.translate()}}</h2>
    <p>{{message.text.translate()}}</p>
  </div>
</div>