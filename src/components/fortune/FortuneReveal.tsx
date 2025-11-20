import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Eye, RefreshCw, Star, Heart } from 'lucide-react';
import { Mood } from '../../pages/Fortune';
import { supabase } from '@/integrations/supabase/client';

interface FortuneRevealProps {
  mood: Mood;
  userName: string;
}

// const motivationalQuotes = {
//   energetic: [
//     "Your energy is your superpower. Channel it wisely and watch mountains move!",
//     "The fire within you burns brighter than any obstacle ahead.",
//     "Your enthusiasm is contagious - spread it like wildfire!",
//     "Action is the foundational key to all success. Keep moving forward!",
//     "Your dynamic spirit can turn any challenge into an opportunity."
//   ],
//   calm: [
//     "In stillness, you find your greatest strength and clearest vision.",
//     "Peace is not the absence of storm, but your ability to find calm within it.",
//     "Your centered spirit guides you to make the wisest decisions.",
//     "Like a mountain, you stand firm while storms pass around you.",
//     "Your inner peace radiates outward, healing the world around you."
//   ],
//   anxious: [
//     "Your sensitivity is a gift - it shows how deeply you care.",
//     "Every worry is your heart's way of protecting what matters most.",
//     "Breathe deeply. You have overcome every challenge before this one.",
//     "Your thoughtful nature prepares you for success in ways others miss.",
//     "Trust the process. Your careful consideration leads to the best outcomes."
//   ],
//   happy: [
//     "Your joy is a beacon of light that brightens everyone's day.",
//     "Happiness is not a destination, it's your natural way of traveling.",
//     "Your positive energy creates ripples of good in the universe.",
//     "Keep shining! Your light helps others find their way.",
//     "Gratitude turns what you have into enough, and you have so much!"
//   ],
//   melancholic: [
//     "Your depth of feeling creates the most beautiful art and insights.",
//     "In your quiet moments, wisdom whispers the deepest truths.",
//     "Your emotional intelligence is a rare and precious gift.",
//     "Every ending prepares the soil for a more beautiful beginning.",
//     "Your gentle soul understands what others take lifetimes to learn."
//   ],
//   hopeful: [
//     "Your hope is the seed from which miracles grow.",
//     "The future belongs to those who believe in their dreams - like you!",
//     "Your optimism is proof that your soul knows something beautiful is coming.",
//     "Keep planting seeds of hope. Your garden of dreams is ready to bloom.",
//     "Your faith in tomorrow gives you strength to transform today."
//   ]
// };

export const FortuneReveal = ({ mood, userName }: FortuneRevealProps) => {
  const [isRevealing, setIsRevealing] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<string | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  const [motivationalQuotes, setMotivationalQuotes] = useState([]);
  
  useEffect(() => {
    const quotes = [];
    const fetchQuotes = async () => {
      try {
        const { data, error } = await supabase
          .from('fortune_quotes')
          .select('quote')
          .eq('feeling', mood)

        if (error) {
          throw error
        }

        if (data) {
          data.map((d, index) => (
            quotes.push(d.quote)
          ))
          setMotivationalQuotes(quotes)
        }
      } catch (error) {
        console.log("Error fetching quotes", error)
      }

    }

    fetchQuotes();
  }, [mood])
  const revealWisdom = () => {
    if (isRevealing) return;

    setIsRevealing(true);
    setCurrentQuote(null);
    setShowParticles(true);

    setTimeout(() => {
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      setCurrentQuote(randomQuote);
      setIsRevealing(false);
      setShowParticles(false);
    }, 2500);
  };

  const resetReveal = () => {
    setCurrentQuote(null);
    setIsRevealing(false);
    setShowParticles(false);
  };


  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 py-12 relative overflow-hidden transition-colors">
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Heart className="absolute top-20 left-20 h-8 w-8 text-pink-400 animate-float" />
        <Star className="absolute top-40 right-32 h-6 w-6 text-yellow-400 animate-sparkle" />
        <Sparkles className="absolute bottom-32 left-1/4 h-7 w-7 text-purple-400 animate-sparkle" style={{ animationDelay: '1s' }} />
        
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Header */}
          <Card className="text-center shadow-journey-map border-white/50 dark:border-white/20 bg-white/70 dark:bg-white/10 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Welcome, {userName}
              </CardTitle>
              <p className="text-gray-500 dark:text-gray-300">
                Your journey through the cosmos begins here
              </p>
            </CardHeader>
          </Card>

          {/* Mystic Orb */}
          <div className="flex flex-col items-center space-y-8">
            <div className="relative">
              <div className={`relative w-48 h-48 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-600 dark:to-pink-600 p-1 shadow-journey-map transition-all duration-500 ${isRevealing ? 'animate-journey-pulse scale-110' : ''}`}>
                <div className="w-full h-full rounded-full bg-white/30 dark:bg-gray-900/30 backdrop-blur-lg border border-white/50 dark:border-white/20 flex items-center justify-center relative overflow-hidden">
                  {showParticles && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-purple-400 rounded-full animate-float"
                          style={{
                            transform: `rotate(${i * 30}deg) translateY(-60px)`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '2s'
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="text-center z-10">
                    {isRevealing ? (
                      <div className="animate-journey-pulse">
                        <RefreshCw className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent mx-auto mb-2 animate-spin" />
                        <p className="text-purple-500 dark:text-purple-300 text-sm">Reading your path...</p>
                      </div>
                    ) : (
                      <div>
                        <Eye className="w-12 h-12 text-purple-400 dark:text-purple-300 mx-auto mb-2 animate-float" />
                        <p className="text-purple-400 dark:text-purple-300 font-medium text-sm">Mystic Vision</p>
                        <p className="text-gray-500 dark:text-gray-300 text-xs">Gaze within</p>
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-100/10 to-transparent rounded-full" />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={revealWisdom}
                disabled={isRevealing}
                className="bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-600 dark:to-pink-600 hover:brightness-110 transition-all duration-300 px-8 text-gray-700 dark:text-white"
                size="lg"
              >
                {isRevealing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Revealing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Reveal Your Wisdom
                  </>
                )}
              </Button>

              {currentQuote && (
                <Button
                  onClick={resetReveal}
                  variant="outline"
                  className="border-purple-200 dark:border-white/20 text-gray-700 dark:text-white hover:bg-purple-100/30 dark:hover:bg-white/5"
                >
                  Clear Vision
                </Button>
              )}
            </div>
          </div>

          {/* Wisdom Display */}
          {currentQuote && (
            <Card className="shadow-journey-map border-white/50 dark:border-white/20 bg-white/80 dark:bg-white/10 backdrop-blur-lg animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-center text-xl bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-300 dark:to-emerald-300 bg-clip-text text-transparent">
                  Your Inner Wisdom Speaks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute -top-4 -left-2 text-4xl text-purple-400/30 font-serif">"</div>
                  <div className="absolute -bottom-8 -right-2 text-4xl text-purple-400/30 font-serif">"</div>

                  <blockquote className="text-lg text-center text-gray-800 dark:text-gray-300 leading-relaxed px-6 py-4">
                    {currentQuote}
                  </blockquote>
                </div>

                <div className="flex justify-center mt-6">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-yellow-400 animate-sparkle"
                        style={{ animationDelay: `${i * 0.3}s` }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          {!currentQuote && !isRevealing && (
            <Card className="text-center shadow-journey-map border-white/50 dark:border-white/20 bg-white/60 dark:bg-white/10 backdrop-blur-sm">
              <CardContent className="pt-6">
                <p className="text-gray-600 dark:text-gray-300">
                  Embark on a journey within. Each revelation guides your next step.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
