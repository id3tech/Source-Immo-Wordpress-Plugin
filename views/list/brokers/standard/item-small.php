<?php
/**
 * Standard list item view
 */
$scopeClass = '';
if(isset($configs)){
    $scopeClass = $configs->list_item_layout->scope_class;
}
?>
<article class="si-item si-broker-item si-small-item-layout 
                    <?php echo($scopeClass) ?> {{getClassList(item)}}" 
        data-ng-cloak
    >
    <a href="{{item.permalink}}">
        <div class="content">
            <div class="image"><img data-ng-src="{{item.photo_url}}" /></div>
            <div class="name"><span class="first-name">{{item.first_name}}</span> <span class="last-name">{{item.last_name}}</span></div>
            <div class="title" title="{{item.license_type.length > 40 ? item.license_type : ''}}">{{item.license_type}}</div>
        </div>
    </a>
</article>