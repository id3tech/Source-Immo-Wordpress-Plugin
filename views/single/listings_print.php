<html class="listings print">
    <head>

        
        <?php wp_head(); ?>
        
    </head>
    <body>



        <page class="front-page">
            
            <div class="page-background opacity-75"><img src="<?php echo($model->photos[0]->source_url) ?>" /></div>
            
            <div class="panel overlay center">
                <div class="address"><?php echo($model->location->civic_address)?></div>

                <div class="information grid-layout">
                    <div class="main-picture"><img src="<?php echo($model->photos[0]->source_url) ?>" /></div>
                    <div class="transaction"><?php echo($model->subcategory . ' ' . $model->transaction) ?></div>
                    <div class="price"><?php echo($model->price_text) ?></div>
                    <div class="city"><?php echo($model->location->city) ?></div>
                    
                    <div class="ref_number"><?php echo($model->ref_number) ?></div>
                    <div class="description"><?php echo($model->description) ?></div>
                </div>
            </div>
            
        </page>

        <page class="details">
            
            
            <div class="page-layout">

                <?php SourceImmo::view('single/listings_layouts/print/icon_ribbon', array('model'=>$model))?>

                <?php SourceImmo::view('single/listings_layouts/print/partial_addendum', array('model'=>$model))?>

                <?php SourceImmo::view('single/listings_layouts/print/caracteristics', array('model'=>$model))?>

                <?php SourceImmo::view('single/listings_layouts/print/building', array('model'=>$model))?>

                <?php SourceImmo::view('single/listings_layouts/print/land', array('model'=>$model))?>

            </div>
            <header><?php SourceImmo::view('single/listings_layouts/print/header', array('model'=>$model))?></header>
            <footer><?php SourceImmo::view('single/listings_layouts/print/footer', array('model'=>$model))?></footer>
        </page>

        <page class="details-part2">
            
            
            <div class="page-layout">
                <div class="in-ex">
                    <?php SourceImmo::view('single/listings_layouts/print/inclusions', array('model'=>$model))?>
                    <?php SourceImmo::view('single/listings_layouts/print/exclusions', array('model'=>$model))?>
                </div>

                <?php SourceImmo::view('single/listings_layouts/print/financial', array('model'=>$model))?>
                
                <?php SourceImmo::view('single/listings_layouts/print/map', array('model'=>$model))?>                
            </div>
            <header><?php SourceImmo::view('single/listings_layouts/print/header', array('model'=>$model))?></header>
            <footer><?php SourceImmo::view('single/listings_layouts/print/footer', array('model'=>$model))?></footer>
        </page>

        <?php 
        
        if(isset($model->rooms) && is_array($model->rooms) && count($model->rooms) > 0){
            SourceImmo::view('single/listings_layouts/print/rooms', array('model'=>$model));
        }
        ?>

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
            <header><?php SourceImmo::view('single/listings_layouts/print/header', array('model'=>$model))?></header>
            <footer><?php SourceImmo::view('single/listings_layouts/print/footer', array('model'=>$model))?></footer>
            
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
                            
                            <img src="<?php echo(str_replace("md","sm",$photo->url)) ?>" />
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
        
        

        <page class="last-page">
            <div class="page-layout">
                <div class="panel overlay dock-left brokers">
                    <h3><?php _e('Presented by',SI) ?></h3>
                    <div class="broker-list">
                        
                    <?php
                    foreach ($model->brokers as $broker) {
                        SourceImmo::view('single/listings_layouts/print/broker', array('broker'=>$broker));
                    }
                    ?>
                    </div>

                    
                </div>

                <div class="panel overlay dock-right notepad">
                        <h3><?php _e('Personnal notes',SI) ?></h3>
                        <div class="handwrite-zone">
                        </div>
                    
                </div>
            </div>
            <header><?php SourceImmo::view('single/listings_layouts/print/header', array('model'=>$model))?></header>
            <footer><?php SourceImmo::view('single/listings_layouts/print/footer', array('model'=>$model))?></footer>
            
        </page>

        <?php 
        if(isset($model->addendum) && $model->addendum != '' && (strlen($model->addendum)>620)){
        ?>
        <page class="annex">
            <div class="page-layout">
                <h3><?php _e('Annex - Addendum',SI) ?></h3>
                <?php
                
                $addendumLines = explode("\n",$model->addendum);
                $addendumBlockSize = ceil( count($addendumLines) / 2 );

                $addendumBlocks = array();
                $addendumBlocks[] = array_slice($addendumLines,0,$addendumBlockSize);
                if(count($addendumLines) > $addendumBlockSize){
                    $addendumBlocks[] = array_slice($addendumLines,$addendumBlockSize,$addendumBlockSize);
                }
                
                foreach ($addendumBlocks as $block) {
                ?>
                <div class="page-panel">
                    <div class="addendum"><?php echo(trim(implode("\n", $block))); ?></div>
                </div>
                <?php
                }
                ?>
               
            </div>

            <header><?php SourceImmo::view('single/listings_layouts/print/header', array('model'=>$model))?></header>
            <footer><?php SourceImmo::view('single/listings_layouts/print/footer', array('model'=>$model))?></footer>
        </page>
        <?php
        }
        ?>

        <button class="print-button" onclick="fnPrint()"><i class="fal fa-print"></i></button>
        <script type="text/javascript">
        const fnPrint = function(){
            window.print();
        }
        </script>

        
    </body>
</html>