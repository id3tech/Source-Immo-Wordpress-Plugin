<?php
function si_twentyseventeen_start_of_template($loadingText){
?>
  <div class="wrap">
    <div id="primary" class="content-area">
        <main id="main" class="site-main" role="main">
            <div class="container">
        
            
  <?php
}

add_action('si_start_of_template', 'si_twentyseventeen_start_of_template', 5,1);

function si_twentyseventeen_end_of_template(){
    ?>
    
</main>
</div>
</div>
<?php
}

add_action('si_end_of_template', 'si_twentyseventeen_end_of_template', 5,1);