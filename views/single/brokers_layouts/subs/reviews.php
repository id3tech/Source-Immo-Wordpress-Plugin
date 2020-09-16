<div class="si-detail-section reviews" ng-if="model.reviews.length > 0">
    <a id="si-part-reviews" name="si-part-reviews"></a>
    <h3>{{'Comments' | translate}}</h3>

    <div class="si-rating" ng-if="model.rating_global | siHasValue">
        <si-star-rating si-value="model.rating_global"></si-star-rating>
    </div>

    <div class="si-review-list-container">
        <div class="si-review-list ">
            <div ng-repeat="item in model.reviews" 
                    class="si-review-item si-background-small-contrast si-element-radius 
                        {{item.comments.length > 750 ? 'big' : item.comments.length > 350 ? 'medium' : ''}}"
                    style="--item-index:'{{$index+1}}.'">

                <div class="si-text">{{item.comments}}</div>
                <div class="si-author">{{item.name}}</div>
                <div class="si-date" ng-if="item.date"><span>{{item.date | amDateFormat : 'DD-MM-YYYY'}}</span> <span class="ago">({{item.date | amTimeAgo}})</span></div>

            </div>
        </div>
    </div>

</div>