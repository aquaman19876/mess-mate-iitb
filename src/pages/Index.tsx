import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import MessSchedule from '@/components/MessSchedule';
import FoodItemCard from '@/components/FoodItemCard';
import AddFoodItemDialog from '@/components/AddFoodItemDialog';
import { useToast } from '@/hooks/use-toast';

type FoodItem = {
  id: string;
  name: string;
  description?: string;
  meal_slot: string;
  date_served: string;
  added_by_user_id: string;
  profiles?: {
    name: string;
  } | null;
  avg_rating?: number | null;
  review_count?: number;
  user_review?: {
    rating: number;
    comment?: string;
  };
};

const Index = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMealSlot, setSelectedMealSlot] = useState('breakfast');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchFoodItems = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: foodItemsData, error: foodItemsError } = await supabase
        .from('food_items')
        .select('*')
        .eq('date_served', today)
        .order('created_at', { ascending: false });

      if (foodItemsError) throw foodItemsError;

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*');

      if (reviewsError) throw reviewsError;

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name');

      if (profilesError) throw profilesError;

      // Process the data to combine everything
      const processedItems: FoodItem[] = foodItemsData?.map(item => {
        const itemReviews = reviewsData?.filter(review => review.food_item_id === item.id) || [];
        const avgRating = itemReviews.length > 0 
          ? itemReviews.reduce((sum, review) => sum + review.rating, 0) / itemReviews.length 
          : null;
        
        const userReview = user 
          ? itemReviews.find(review => review.user_id === user.id)
          : null;

        const profile = profilesData?.find(profile => profile.user_id === item.added_by_user_id);

        return {
          id: item.id,
          name: item.name,
          description: item.description,
          meal_slot: item.meal_slot,
          date_served: item.date_served,
          added_by_user_id: item.added_by_user_id,
          profiles: profile ? { name: profile.name } : null,
          avg_rating: avgRating,
          review_count: itemReviews.length,
          user_review: userReview ? {
            rating: userReview.rating,
            comment: userReview.comment
          } : undefined
        };
      }) || [];

      setFoodItems(processedItems);
    } catch (error: any) {
      console.error('Error fetching food items:', error);
      toast({
        title: "Error",
        description: "Failed to load food items.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodItems();
  }, [user]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredFoodItems = foodItems.filter(item => item.meal_slot === selectedMealSlot);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">IITB Mess Review</h1>
              <p className="text-sm text-muted-foreground">
                Rate and review today's mess food
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <AddFoodItemDialog onFoodItemAdded={fetchFoodItems} />
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <MessSchedule />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Today's Food Items
                  <Badge variant="outline">
                    {new Date().toLocaleDateString()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedMealSlot} onValueChange={setSelectedMealSlot}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
                    <TabsTrigger value="lunch">Lunch</TabsTrigger>
                    <TabsTrigger value="evening_snacks">Snacks</TabsTrigger>
                    <TabsTrigger value="dinner">Dinner</TabsTrigger>
                  </TabsList>
                  
                  {['breakfast', 'lunch', 'evening_snacks', 'dinner'].map(slot => (
                    <TabsContent key={slot} value={slot} className="mt-6">
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                          <p className="text-muted-foreground mt-2">Loading food items...</p>
                        </div>
                      ) : filteredFoodItems.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          {filteredFoodItems.map(item => (
                            <FoodItemCard
                              key={item.id}
                              foodItem={item}
                              onReviewUpdate={fetchFoodItems}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            No food items added for this meal slot yet.
                          </p>
                          {user && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Be the first to add today's menu!
                            </p>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
