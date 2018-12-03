<div class="panel icon-ribbon">
    <?php
    foreach ($model->important_flags as $flag){
        ?>
        <div class="item">
            <i class="fal fa-3x fa-<?php echo($flag['icon']) ?>"></i>
            <label><?php 
                echo($flag['caption']);
                if($flag['value'] > 0){
                    echo(': ' . $flag['value']);
                }
            ?>
            </label>
    </div>
        <?php
    }
    ?>
    
</div>