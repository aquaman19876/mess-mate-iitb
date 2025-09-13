import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type MealSlot = {
  name: string;
  weekdayTime: string;
  weekendTime: string;
  current?: boolean;
};

const MEAL_SLOTS: MealSlot[] = [
  {
    name: 'Breakfast',
    weekdayTime: '7:30 AM - 9:45 AM',
    weekendTime: '7:45 AM - 10:00 AM',
  },
  {
    name: 'Lunch',
    weekdayTime: '12:00 PM - 2:15 PM',
    weekendTime: '12:00 PM - 2:15 PM',
  },
  {
    name: 'Evening Snacks',
    weekdayTime: '4:30 PM - 6:15 PM',
    weekendTime: '4:30 PM - 6:30 PM',
  },
  {
    name: 'Dinner',
    weekdayTime: '7:30 PM - 9:45 PM',
    weekendTime: '7:30 PM - 9:45 PM',
  },
];

const getCurrentMealSlot = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = currentHour + currentMinutes / 60;
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;

  if (isWeekend) {
    if (currentTime >= 7.75 && currentTime <= 10) return 0; // Breakfast
    if (currentTime >= 12 && currentTime <= 14.25) return 1; // Lunch
    if (currentTime >= 16.5 && currentTime <= 18.5) return 2; // Evening Snacks
    if (currentTime >= 19.5 && currentTime <= 21.75) return 3; // Dinner
  } else {
    if (currentTime >= 7.5 && currentTime <= 9.75) return 0; // Breakfast
    if (currentTime >= 12 && currentTime <= 14.25) return 1; // Lunch
    if (currentTime >= 16.5 && currentTime <= 18.25) return 2; // Evening Snacks
    if (currentTime >= 19.5 && currentTime <= 21.75) return 3; // Dinner
  }
  return -1;
};

const MessSchedule = () => {
  const currentSlot = getCurrentMealSlot();
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Mess Timings - {isWeekend ? 'Weekend' : 'Weekday'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {MEAL_SLOTS.map((slot, index) => (
            <div 
              key={slot.name}
              className={`p-3 rounded-lg border ${
                currentSlot === index 
                  ? 'bg-primary/10 border-primary' 
                  : 'bg-muted/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    {slot.name}
                    {currentSlot === index && (
                      <Badge variant="secondary">Now Open</Badge>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isWeekend ? slot.weekendTime : slot.weekdayTime}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MessSchedule;