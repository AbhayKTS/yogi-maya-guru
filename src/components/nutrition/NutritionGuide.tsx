import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Apple, 
  Search, 
  ThumbsUp, 
  ThumbsDown, 
  ChefHat, 
  Clock,
  Flame,
  Wind,
  Mountain,
  Utensils
} from 'lucide-react';
import { DOSHA_INFO } from '@/types';

const DOSHA_FOODS = {
  vata: {
    favor: [
      'Warm cooked foods', 'Sweet fruits (dates, figs)', 'Root vegetables', 
      'Ghee and oils', 'Warm spices (ginger, cinnamon)', 'Nuts and seeds',
      'Dairy products', 'Whole grains (rice, wheat)', 'Warm herbal teas'
    ],
    avoid: [
      'Cold foods and drinks', 'Dry and light foods', 'Raw vegetables', 
      'Beans and legumes', 'Bitter and astringent foods', 'Excessive caffeine',
      'Frozen foods', 'Crackers and chips', 'Cold dairy'
    ],
    recipes: [
      {
        name: 'Golden Milk Latte',
        time: '10 min',
        ingredients: ['Almond milk', 'Turmeric', 'Ginger', 'Cinnamon', 'Honey'],
        description: 'Warming and nourishing drink perfect for Vata constitution'
      },
      {
        name: 'Kitchari (Lentil Rice)',
        time: '30 min', 
        ingredients: ['Basmati rice', 'Mung dal', 'Ghee', 'Cumin', 'Ginger'],
        description: 'Complete protein meal that\'s easy to digest and grounding'
      },
      {
        name: 'Stewed Apples with Cinnamon',
        time: '15 min',
        ingredients: ['Apples', 'Cinnamon', 'Cardamom', 'Ghee', 'Dates'],
        description: 'Sweet and warming dessert that balances Vata'
      }
    ]
  },
  pitta: {
    favor: [
      'Cool and refreshing foods', 'Sweet fruits (melons, coconut)', 'Leafy greens',
      'Cooling herbs (cilantro, mint)', 'Coconut oil', 'Sweet and bitter tastes',
      'Cucumber and zucchini', 'Dairy (milk, ghee)', 'Cooling spices (fennel, coriander)'
    ],
    avoid: [
      'Spicy and hot foods', 'Sour foods (tomatoes, vinegar)', 'Salty foods',
      'Red meat', 'Alcohol and caffeine', 'Fried and oily foods',
      'Hot spices (chili, cayenne)', 'Fermented foods', 'Acidic fruits'
    ],
    recipes: [
      {
        name: 'Coconut Cucumber Soup',
        time: '20 min',
        ingredients: ['Coconut milk', 'Cucumber', 'Mint', 'Lime', 'Cilantro'],
        description: 'Cooling and hydrating soup perfect for hot weather'
      },
      {
        name: 'Cooling Mint Lassi',
        time: '5 min',
        ingredients: ['Yogurt', 'Fresh mint', 'Rose water', 'Cardamom', 'Honey'],
        description: 'Refreshing drink that cools internal heat'
      },
      {
        name: 'Quinoa Tabbouleh',
        time: '25 min',
        ingredients: ['Quinoa', 'Parsley', 'Mint', 'Cucumber', 'Lemon', 'Olive oil'],
        description: 'Light and cooling salad with complete proteins'
      }
    ]
  },
  kapha: {
    favor: [
      'Light and dry foods', 'Spicy foods', 'Bitter and astringent tastes',
      'Leafy greens', 'Legumes and beans', 'Warming spices (ginger, black pepper)',
      'Light fruits (apples, pears)', 'Minimal oils', 'Herbal teas'
    ],
    avoid: [
      'Heavy and oily foods', 'Sweet foods', 'Cold and frozen foods',
      'Dairy products', 'Salt', 'Nuts and seeds in excess',
      'Red meat', 'Refined sugars', 'Processed foods'
    ],
    recipes: [
      {
        name: 'Spiced Lentil Soup',
        time: '45 min',
        ingredients: ['Red lentils', 'Turmeric', 'Cumin', 'Ginger', 'Garlic', 'Spinach'],
        description: 'Warming and light soup that stimulates digestion'
      },
      {
        name: 'Ginger Turmeric Tea',
        time: '10 min',
        ingredients: ['Fresh ginger', 'Turmeric', 'Black pepper', 'Lemon', 'Honey'],
        description: 'Stimulating drink that boosts metabolism'
      },
      {
        name: 'Roasted Vegetable Salad',
        time: '35 min',
        ingredients: ['Mixed vegetables', 'Olive oil', 'Cumin', 'Turmeric', 'Arugula'],
        description: 'Light yet satisfying salad with warming spices'
      }
    ]
  }
};

export const NutritionGuide = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  const dominantDosha = profile?.dominant_dosha || 'vata';
  const doshaInfo = DOSHA_INFO[dominantDosha];
  const doshaFoods = DOSHA_FOODS[dominantDosha];

  const getDoshaIcon = (dosha: string) => {
    switch (dosha) {
      case 'vata': return <Wind className="w-5 h-5" />;
      case 'pitta': return <Flame className="w-5 h-5" />;
      case 'kapha': return <Mountain className="w-5 h-5" />;
      default: return <Apple className="w-5 h-5" />;
    }
  };

  const filteredFavorFoods = doshaFoods.favor.filter(food =>
    food.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvoidFoods = doshaFoods.avoid.filter(food =>
    food.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className={`p-3 rounded-full ${doshaInfo.color}`}>
            {getDoshaIcon(dominantDosha)}
          </div>
          <h1 className="text-3xl font-bold text-sacred">
            {doshaInfo.sanskrit} Nutrition Guide
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Personalized dietary recommendations based on your {dominantDosha} constitution. 
          Eat in harmony with your natural balance.
        </p>
      </div>

      {/* Search */}
      <Card className="card-sacred">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search foods and recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="foods" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="foods">Foods Guide</TabsTrigger>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="meal-plan">Meal Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="foods" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Foods to Favor */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-healing">
                  <ThumbsUp className="w-5 h-5" />
                  Foods to Favor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredFavorFoods.map((food, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-healing"></div>
                      <span className="text-sm">{food}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Foods to Avoid */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <ThumbsDown className="w-5 h-5" />
                  Foods to Limit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredAvoidFoods.map((food, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-destructive"></div>
                      <span className="text-sm">{food}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dosha Description */}
          <Card className="card-golden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-secondary-foreground mb-2">
                About Your {doshaInfo.sanskrit} Constitution
              </h3>
              <p className="text-secondary-foreground/80 mb-4">
                {doshaInfo.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {doshaInfo.qualities.map((quality, index) => (
                  <Badge key={index} variant="outline" className="border-white/20 text-secondary-foreground">
                    {quality}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doshaFoods.recipes.map((recipe, index) => (
              <Card 
                key={index} 
                className="card-sacred cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedRecipe(recipe)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-primary" />
                    {recipe.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {recipe.time}
                    </div>
                    <p className="text-sm">{recipe.description}</p>
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Ingredients:</h5>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.slice(0, 3).map((ingredient, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {ingredient}
                          </Badge>
                        ))}
                        {recipe.ingredients.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{recipe.ingredients.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="meal-plan" className="space-y-6">
          <Card className="card-sacred">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-primary" />
                Daily Meal Plan for {doshaInfo.sanskrit}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-healing">Breakfast (6-8 AM)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="bg-muted/20 rounded-lg p-3">
                      <p className="font-medium">Warm Porridge</p>
                      <p className="text-muted-foreground">Oats with warm milk, nuts, and dates</p>
                    </div>
                    <div className="bg-muted/20 rounded-lg p-3">
                      <p className="font-medium">Herbal Tea</p>
                      <p className="text-muted-foreground">Ginger or chamomile tea</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-spiritual">Lunch (12-1 PM)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="bg-muted/20 rounded-lg p-3">
                      <p className="font-medium">Balanced Meal</p>
                      <p className="text-muted-foreground">Rice, dal, vegetables, and yogurt</p>
                    </div>
                    <div className="bg-muted/20 rounded-lg p-3">
                      <p className="font-medium">Fresh Salad</p>
                      <p className="text-muted-foreground">Seasonal vegetables with lime</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gold">Dinner (6-7 PM)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="bg-muted/20 rounded-lg p-3">
                      <p className="font-medium">Light Soup</p>
                      <p className="text-muted-foreground">Vegetable or lentil soup</p>
                    </div>
                    <div className="bg-muted/20 rounded-lg p-3">
                      <p className="font-medium">Warm Milk</p>
                      <p className="text-muted-foreground">With turmeric and cardamom</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="card-sacred max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-primary" />
                {selectedRecipe.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedRecipe.time}
                </div>
              </div>
              
              <p className="text-muted-foreground">{selectedRecipe.description}</p>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Ingredients:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedRecipe.ingredients.map((ingredient: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="text-sm">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedRecipe(null)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button className="flex-1 btn-hero">
                  Add to Meal Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};