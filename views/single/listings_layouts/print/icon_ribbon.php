<div class="icon-ribbon">
    <div class="icon-grid">
    <?php
    foreach ($model->important_flags as $flag){
        ?>
        <div class="item">
            <i class="fal fa-2x fa-<?php echo($flag['icon']) ?>"></i>
            <label><?php echo($flag['caption']);?></label>
            <?php
            if($flag['value'] != null){
                echo('<span class="badge">' . $flag['value'] . '</span>');
            }
            ?>
        </div>
        <?php
    }
    ?>
    </div>
</div>