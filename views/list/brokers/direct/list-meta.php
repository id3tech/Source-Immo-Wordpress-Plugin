<?php

?>
<div class="list-meta">
    <div class="list-count"><?php 
        echo StringPrototype::format(
                __('Displaying {0} listings out of {1} results found',SI),
                count($result->listings), 
                $global_meta->max_item_count
            ); 
    ?></div>
</div>