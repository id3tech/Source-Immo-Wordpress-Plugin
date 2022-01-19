<div class="broker">
  
    <div class="photo"><img src="<?php echo($broker->photo_url)?>" /></div>
    <div class="infos">
        <div class="name"><?php echo($broker->first_name)?> <?php echo($broker->last_name)?></div>
        <div class="license"><?php echo($broker->license_type)?></div>
        <div class="company-name"><?php echo($broker->company_name)?></div>

        <div class="agency"><?php echo($broker->agency->name)?></div>

        <div class="contact">
            <?php
            if(isset($broker->email)){
                echo '<div class="contact-item email"><em>' . $broker->email . '</em></div>';
            }

            foreach ($broker->phones as $key => $value) {
                echo '<div class="contact-item phone"><span>' . __($key,SI) . '</span><em>' . $value . '</em></div>';
            }

            ?>
        </div>
    </div>
</div>