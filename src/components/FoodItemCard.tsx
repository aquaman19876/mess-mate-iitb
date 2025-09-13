import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ReviewDialog from './ReviewDialog';

type FoodItem = {
  id: string;
  name: string;
  description?: string;
  meal_slot: string;
  added_by_user_id: string;
  profiles?: {
    name: string;
  };
  avg_rating?: number;
  review_count?: number;
  user_review?: {
    rating: number;
    comment?: string;
  };
};

type FoodItemCardProps = {
  foodItem: FoodItem;
  onReviewUpdate: () => void;
};

const FoodItemCard = ({ foodItem, onReviewUpdate }: FoodItemCardProps) => {
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showAddedBy, setShowAddedBy] = useState(false);
  const { user } = useAuth();

  const formatMealSlot = (slot: string) => {
    return slot.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 
                className="font-semibold text-lg cursor-pointer"
                onMouseEnter={() => setShowAddedBy(true)}
                onMouseLeave={() => setShowAddedBy(false)}
              >
                {foodItem.name}
                {showAddedBy && foodItem.profiles?.name && (
                  <span className="ml-2 text-sm text-muted-foreground font-normal">
                    (Added by {foodItem.profiles.name})
                  </span>
                )}
              </h3>
              {foodItem.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {foodItem.description}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="ml-2">
              {formatMealSlot(foodItem.meal_slot)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {foodItem.avg_rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {foodItem.avg_rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({foodItem.review_count} reviews)
                  </span>
                </div>
              )}
              {!foodItem.avg_rating && (
                <span className="text-sm text-muted-foreground">
                  No reviews yet
                </span>
              )}
            </div>
            {user && (
              <Button
                variant={foodItem.user_review ? "secondary" : "default"}
                size="sm"
                onClick={() => setShowReviewDialog(true)}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                {foodItem.user_review ? 'Edit Review' : 'Add Review'}
              </Button>
            )}
          </div>
          {foodItem.user_review && (
            <div className="mt-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-sm font-medium">Your review:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= foodItem.user_review!.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {foodItem.user_review.comment && (
                <p className="text-sm text-muted-foreground">
                  {foodItem.user_review.comment}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ReviewDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        foodItem={foodItem}
        existingReview={foodItem.user_review}
        onReviewSubmit={onReviewUpdate}
      />
    </>
  );
};

export default FoodItemCard;