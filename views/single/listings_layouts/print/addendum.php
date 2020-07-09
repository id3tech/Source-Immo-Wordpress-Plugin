<div class="panel bordered addendum">
    <h3><?php _e('Addendum', SI) ?></h3>
    <div class="content">
    <?php 
        if(hasValue($model->addendum)){       
            $addendumLines = explode("\n",$model->addendum);
            $addendumBlockSize = ceil( count($addendumLines) / 2 );

            $addendumBlocks = array();
            $addendumBlocks[] = array_slice($addendumLines,0,$addendumBlockSize);
            if(count($addendumLines) > $addendumBlockSize){
                $addendumBlocks[] = array_slice($addendumLines,$addendumBlockSize,$addendumBlockSize);
            }
            
            foreach ($addendumBlocks as $block) {
            ?>
            <div class="column"><?php echo(str_replace("\n","<br/>",trim(implode("\n", $block)))); ?></div>
            <?php
            }
        }
    ?>
    </div>
</div>