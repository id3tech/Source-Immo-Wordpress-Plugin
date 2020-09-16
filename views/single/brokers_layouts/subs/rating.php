<div class="si-detail-section rating" ng-if="model.rating_global | siHasValue">
    <si-star-rating si-value="model.rating_global"></si-star-rating>
    <div class="comments-link" 
        ng-if="(model.reviews.length > 0) && ('#si-part-reviews' | siElementExists)"
        ng-click="scrollTo('#si-part-reviews')">
        <?php _e('See all comments',SI) ?> ({{model.reviews.length}})
    </div>
</div>