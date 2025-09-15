import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Heart, Share2, Play, Info, BookOpen } from 'lucide-react';
import { Shlok } from '@/types';
import lotusMandalaBg from '@/assets/lotus-mandala.jpg';

const MOCK_SHLOKS: Shlok[] = [
  {
    id: '1',
    sanskrit_text: 'योगः कर्मसु कौशलम्',
    transliteration: 'yogaḥ karmasu kauśalam',
    translation: 'Yoga is skill in action',
    source: 'Bhagavad Gita 2.50',
    chapter_context: 'Lord Krishna teaches Arjuna about performing actions with skill and equanimity, without attachment to results.',
    audio_url: null,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    sanskrit_text: 'सत्यमेव जयते नानृतम्',
    transliteration: 'satyameva jayate nānṛtam',
    translation: 'Truth alone triumphs, not falsehood',
    source: 'Mundaka Upanishad 3.1.6',
    chapter_context: 'This verse emphasizes the ultimate power of truth over deception and the importance of living with integrity.',
    audio_url: null,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    sanskrit_text: 'अहिंसा परमो धर्मः',
    transliteration: 'ahiṃsā paramo dharmaḥ',
    translation: 'Non-violence is the highest virtue',
    source: 'Mahabharata',
    chapter_context: 'This teaching emphasizes compassion and kindness as fundamental principles of righteous living.',
    audio_url: null,
    created_at: new Date().toISOString()
  }
];

export const DailyWisdomPage = () => {
  const [dailyShlok, setDailyShlok] = useState<Shlok | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showContext, setShowContext] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDailyShlok();
  }, []);

  const fetchDailyShlok = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get a daily shlok based on date (same shlok for the same day)
      const today = new Date().getDate();
      const shlokIndex = today % MOCK_SHLOKS.length;
      const selectedShlok = MOCK_SHLOKS[shlokIndex];
      
      setDailyShlok(selectedShlok);
      
      // Check if favorited from localStorage
      const favorites = JSON.parse(localStorage.getItem('favoriteWisdom') || '[]');
      setIsFavorited(favorites.includes(selectedShlok.id));
    } catch (error) {
      console.error('Error fetching daily shlok:', error);
      toast({
        title: "Error",
        description: "Failed to load today's wisdom",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!dailyShlok) return;

    try {
      const favorites = JSON.parse(localStorage.getItem('favoriteWisdom') || '[]');
      
      if (isFavorited) {
        const updatedFavorites = favorites.filter((id: string) => id !== dailyShlok.id);
        localStorage.setItem('favoriteWisdom', JSON.stringify(updatedFavorites));
        setIsFavorited(false);
        
        toast({
          title: "Removed from favorites",
          description: "Shlok removed from your collection"
        });
      } else {
        favorites.push(dailyShlok.id);
        localStorage.setItem('favoriteWisdom', JSON.stringify(favorites));
        setIsFavorited(true);
        
        toast({
          title: "Added to favorites",
          description: "Shlok saved to your collection"
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive"
      });
    }
  };

  const shareWisdom = async () => {
    if (!dailyShlok) return;

    const shareText = `${dailyShlok.translation}\n\n- ${dailyShlok.source}\n\nShared from Ayur.AI Guru`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Wisdom from Ayur.AI Guru',
          text: shareText
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard",
          description: "Wisdom has been copied for sharing"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-healing-soft/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dailyShlok) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-healing-soft/30 flex items-center justify-center">
        <Card className="card-sacred max-w-md">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No wisdom available today</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-healing-soft/30">
      {/* Background Image */}
      <div className="fixed inset-0 opacity-5">
        <img 
          src={lotusMandalaBg} 
          alt="Lotus Mandala Background" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-sacred mb-2 font-devanagari">
              ज्ञान दीप
            </h1>
            <h2 className="text-2xl font-semibold text-wisdom mb-4">
              Jnana Deepa - The Lamp of Knowledge
            </h2>
            <Badge variant="outline" className="text-sm px-4 py-1">
              Today's Sacred Wisdom
            </Badge>
          </div>

          {/* Main Wisdom Card */}
          <Card className="card-sacred mb-8 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-primary/5 to-gold/5 p-8">
                {/* Source */}
                <div className="flex items-center justify-between mb-6">
                  <Badge variant="secondary" className="text-sm font-medium">
                    {dailyShlok.source}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowContext(!showContext)}
                      className="p-2"
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                    {dailyShlok.audio_url && (
                      <Button variant="ghost" size="sm" className="p-2">
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sanskrit Text */}
                <div className="mb-6 text-center">
                  <p className="text-sanskrit text-2xl leading-relaxed mb-4">
                    {dailyShlok.sanskrit_text}
                  </p>
                  <p className="text-transliteration text-base">
                    {dailyShlok.transliteration}
                  </p>
                </div>

                {/* Translation */}
                <div className="bg-card/50 rounded-xl p-6 mb-6">
                  <p className="text-lg leading-relaxed text-center font-medium">
                    "{dailyShlok.translation}"
                  </p>
                </div>

                {/* Context (if shown) */}
                {showContext && dailyShlok.chapter_context && (
                  <div className="bg-muted/30 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-wisdom mb-2">Context:</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {dailyShlok.chapter_context}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={toggleFavorite}
                    className={`flex items-center gap-2 ${
                      isFavorited ? 'text-destructive border-destructive' : ''
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                    {isFavorited ? 'Favorited' : 'Add to Favorites'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={shareWisdom}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Wisdom
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Reflection Prompt */}
          <Card className="card-sacred">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-wisdom mb-3">
                Daily Reflection
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Take a moment to contemplate how this wisdom applies to your life today. 
                How can you embody this teaching in your thoughts, words, and actions?
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};