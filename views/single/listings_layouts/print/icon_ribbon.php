<div class="icon-ribbon">
    <div class="icon-grid">
    <?php
    foreach ($model->important_flags as $flag){
        ?>
        <div class="item">
            <i class="fal fa-2x fa-<?php echo($flag['icon']) ?>"></i>
            <label><?php echo($flag['caption']);?></label>
            <sup class="badge">
            <?php
            if($flag['value'] != null){
                echo('<sup class="badge">' . $flag['value'] . '</sup>');
            }
            ?>
            </sup>
        </div>
        <?php
    }
    ?>
    </div>
</div>