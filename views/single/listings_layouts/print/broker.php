<div class="broker">
    <div class="photo"><img src="<?php echo($broker->photo_url)?>" /></div>
    <div class="infos">
        <div class="name"><?php echo($broker->first_name)?> <?php echo($broker->last_name)?></div>
        <div class="license"><?php echo($broker->license_type)?></div>
        <div class="contact">
            <?php
            foreach ($broker->phones as $key => $value) {
                echo '<div class="phone"><span>' . __($key,IMMODB) . '</span><em>' . $value . '</em></div>';
            }
            ?>
        </div>
    </div>
</div>