<?php
global $printBasePath;
$printBasePath = 'single/listings_layouts/print-com';
?>

<div class="print-com">
        <page class="front-page">
            
            <?php SourceImmo::view($printBasePath . '/front', array('model'=>$model))?>
            
        </page>


        <page class="details">
            
            
            <div class="page-layout">
                <?php SourceImmo::view($printBasePath . '/proximity_flags', array('model'=>$model))?>
                <div class="page-side">
                <?php SourceImmo::view($printBasePath . '/units', array('model'=>$model))?>
                <?php SourceImmo::view($printBasePath . '/financial', array('model'=>$model))?>
                </div>
                <div class="page-side">
                <?php SourceImmo::view($printBasePath . '/inclusions', array('model'=>$model))?>
                <?php SourceImmo::view($printBasePath . '/exclusions', array('model'=>$model))?>

                <?php SourceImmo::view($printBasePath . '/building', array('model'=>$model))?>
                <?php SourceImmo::view($printBasePath . '/land', array('model'=>$model))?>
                <?php SourceImmo::view($printBasePath . '/other', array('model'=>$model))?>
                </div>

            </div>
            <header><?php SourceImmo::view($printBasePath . '/header', array('model'=>$model, 'page'=>'details'))?></header>
            <footer><?php SourceImmo::view($printBasePath . '/footer', array('model'=>$model, 'page'=>'details'))?></footer>
        </page>

        <?php
        // split photos into groups of 12
        $photoGroups = array();
        $photoOffset = 0;
        while (count($model->photos) > $photoOffset*12) {
            $photoGroups[] = array_slice($model->photos,$photoOffset*12,12);
            $photoOffset++;
        }

        for ($i=0; $i < count($photoGroups); $i++) { 
        ?>
        <page class="photos">
            <header><?php SourceImmo::view($printBasePath . '/header', array('model'=>$model, 'page'=>'photos'))?></header>
            <footer><?php SourceImmo::view($printBasePath . '/footer', array('model'=>$model, 'page'=>'photos'))?></footer>
            
            <div class="page-layout">
                <h3><?php 
                    if(count($photoGroups) > 1){
                        echo StringPrototype::format(__("Property's photos ({0}/{1})",SI),$i+1, count($photoGroups));
                    }
                    else{
                        _e("Property's photos",SI);
                    }
                ?></h3>
                <div class="photo-list">
                    <?php
                    foreach ($photoGroups[$i] as $photo) {
                    ?>
                    <div class="item">
                        <div class="photo">
                            
                            <img src="<?php echo($photo->url) ?>" />
                        </div>
                        <label><?php echo($photo->category) ?></label>
                    </div>
                    <?php
                    }
                    ?>
                </div>
            </div>
        </page>
        <?php
        }
        ?>
        
        <page class="texts">
            
            
            <div class="page-layout">
                
                <?php SourceImmo::view($printBasePath . '/description', array('model'=>$model))?>
                
                <?php SourceImmo::view($printBasePath . '/addendum', array('model'=>$model))?>

    
            </div>
            <header><?php SourceImmo::view($printBasePath . '/header', array('model'=>$model, 'page'=>'details'))?></header>
            <footer><?php SourceImmo::view($printBasePath . '/footer', array('model'=>$model, 'page'=>'details'))?></footer>
        </page>

        <page class="last-page">
            <?php SourceImmo::view($printBasePath . '/back', array('model'=>$model))?>
        
                           
        </page>
</div>
