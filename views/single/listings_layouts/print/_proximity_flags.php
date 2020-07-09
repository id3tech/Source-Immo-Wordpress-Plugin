<div class="icon-grid proximity">
    <?php
    foreach ($model->proximity_flags as $flag){
        ?>
        <div class="item">
            <i class="fal fa-3x fa-<?php echo($flag['icon']) ?>"></i>
            <label><?php 
                echo($flag['caption']);
            ?>
            </label>
    </div>
        <?php
    }
    ?>
    
</div>