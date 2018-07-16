<?php

?>
<div class="list-meta">
    <div class="list-count"><?php echo StringPrototype::format(__('Displaying {0} listings out of {1} results found',IMMODB),$list_meta->max_item_count, $list_meta->item_count); ?></div>
</div>