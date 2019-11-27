<div class="attachments" ng-show="model.documents.length>0">
    <div ng-repeat="item in model.documents"
            class="attachment {{item.source_file_extension | sanitize}}"
        >
        <a href="{{item.url}}" target="_blank">
            <i class="far"></i>
            <div class="attachment-category">{{item.category}}</div>
            <span class="attachment-description">{{item.description}} {{item.size | filesize}}</span>
        </a>
    </div>
</div>