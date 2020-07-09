<div class="icon-ribbon">
    <div class="icon-grid">
    <?php
    foreach ($model->important_flags as $flag){
        ?>
        <div class="item">
            <i class="fal fa-2x fa-<?php echo($flag['icon']) ?>"></i>
            <label><?php echo($flag['caption']);?></label>
            <?php
            if($flag['value'] > 0){
                echo('<sup class="badge">' . $flag['value'] . '</sup>');
            }
            ?>
        </div>
        <?php
    }
    ?>
    </div>
</div>