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