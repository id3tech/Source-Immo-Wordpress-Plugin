<div class="broker">
    
    <div class="photo"><img src="<?php echo($broker->photo->url)?>" /></div>
    <div class="infos">
        <div class="general-info">
            <div class="name"><?php echo($broker->first_name)?> <?php echo($broker->last_name)?></div>
            <div class="license"><?php echo($broker->license_type)?></div>
            <div class="company-name"><?php echo($broker->company_name)?></div>
        </div>

        <div class="agency">
            <div class="agency"><?php echo($broker->agency->name)?></div>
            <div class="agency-license"><?php echo($broker->agency->license_type)?></div>
            <div class="office-address"><?php echo($broker->office->location->full_address)?></div>
        </div>

        <div class="contact">
            <?php
            if(isset($broker->email) && $broker->email != ''){
                echo '<div class="contact-item email"><i class="fal fa-fw fa-envelope"></i> <em>' . $broker->email . '</em></div>';
            }

            foreach ($broker->phones as $key => $value) {
                if($value != ''){
                    echo '<div class="contact-item phone phone-type-' . $key . '"><i class="fal fa-fw fa-phone"></i> <em class="si-value">' . $value . '</em></div>';
                }
            }

            ?>
        </div>
    </div>
</div>