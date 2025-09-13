import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

type AddFoodItemDialogProps = {
  onFoodItemAdded: () => void;
};

const AddFoodItemDialog = ({ onFoodItemAdded }: AddFoodItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mealSlot, setMealSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add food items.",
        variant: "destructive",
      });
      return;
    }

    if (!name.trim() || !mealSlot) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;

        const { error } = await supabase
        .from('food_items')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          meal_slot: mealSlot as 'breakfast' | 'lunch' | 'evening_snacks' | 'dinner',
          day_type: isWeekend ? 'weekend' as const : 'weekday' as const,
          added_by_user_id: user.id,
          date_served: today,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Food item added successfully!",
      });

      // Reset form
      setName('');
      setDescription('');
      setMealSlot('');
      setOpen(false);
      onFoodItemAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Food Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Food Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">
              Food Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Rajma Rice, Chicken Curry"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the food item..."
              rows={2}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">
              Meal Slot *
            </label>
            <Select value={mealSlot} onValueChange={setMealSlot}>
              <SelectTrigger>
                <SelectValue placeholder="Select meal slot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="evening_snacks">Evening Snacks</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Adding...' : 'Add Food Item'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFoodItemDialog;