<div class="si-detail-section si-reviews" ng-if="model.reviews.length > 0">
    <a id="si-part-reviews" name="si-part-reviews"></a>
    <h3>{{'Comments' | translate}}</h3>

    <div class="si-rating" ng-if="model.rating_global | siHasValue">
        <si-star-rating si-value="model.rating_global"></si-star-rating>
    </div>

    <div class="si-review-list-container">
        <div class="si-nav si-nav-previous"  ng-disabled="reviewPageIndex==0" ng-click="previousReviewPageIndex()"><i class="fal fa-2x fa-arrow-left"></i></div>
        <div class="si-review-list-viewport" si-observer="resize">
            <div class="si-review-list">
                <div ng-repeat="item in model.reviews | startFrom : (reviewPageIndex * reviewPageLength) | limitTo : reviewPageLength track by $index"
                        class="si-review-item si-background-small-contrast si-element-radius si-animate si-animate-delay si-animate-slide-in-bottom
                            {{item.comments.length > 750 ? 'si-big-content' : item.comments.length > 350 ? 'si-medium-content' : ''}}"
                        style="--si-item-index:{{$index+1}}"  tabindex="{{$index+1}}">

                    <div class="si-text-container">
                        <div class="si-text">{{item.comments}}</div>
                    </div>
                    <div class="si-text-expand-toggle"><i class="fal fa-circle-chevron-down"></i></div>

                    <div class="si-author">{{item.name}}</div>
                    <div class="si-date" ng-if="item.date"><span>{{item.date | amDateFormat : 'D MMMM YYYY'}}</span> <span class="ago">({{item.date | amTimeAgo}})</span></div>

                </div>
                
            </div>
        </div>
        <div class="si-nav si-nav-previous" ng-disabled="!reviewNavNextAvailable()" ng-click="nextReviewPageIndex()"><i class="fal fa-2x fa-arrow-right"></i></div>
    </div>
    
</div>