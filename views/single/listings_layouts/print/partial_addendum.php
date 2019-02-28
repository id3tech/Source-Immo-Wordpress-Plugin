<?php
    if(isset($model->addendum)){
    ?>
    <div class="panel addendum">
        <h3><?php _e('Addendum', IMMODB) ?></h3>
        <?php 
            $trunc_limit = 620;
            $truncated = false;
            $addendum = $model->addendum;
            if(strlen($model->addendum)>$trunc_limit){
                $addendum = substr($model->addendum, 0, $trunc_limit - 3) . '...';
                $addendum = str_replace("\r\n\r\n",'<br />', $addendum);
                $truncated = true;
            }
            else{
                $addendum = str_replace("\r\n\r\n",'<br />', $addendum);
            }
            
            echo($addendum);
            if($truncated){
                echo '<note>' . __("See complete addendum in annex", IMMODB) . '</note>';
            }
        ?>
    </div>
    <?php
    }
    ?>