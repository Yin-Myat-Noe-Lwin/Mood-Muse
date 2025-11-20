import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, Coins } from 'lucide-react';
import { UserProfile, Mood } from '../../pages/Fortune';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Eye, RefreshCw, Star, Heart } from 'lucide-react';

interface QuestionnaireStepProps {
  onComplete: (profile: UserProfile) => void;
  username?: string;
}


interface ProfileData {
  full_name: string;
  email: string;
  age: string;
  user_role: string;
  gender: string;
  avatar_url: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  type: string;
  quiz_options: {
    id: number;
    value: string;
    label: string;
    mood: Mood;
  }[];
}



export const QuestionnaireStep = ({ onComplete }: QuestionnaireStepProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    email: '',
    age: '',
    user_role: '',
    gender: '',
    avatar_url: ''
  });

  const { user } = useAuth();
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  function getAge(birthDateString) {
    if (birthDateString) {
      const today = new Date();
      const birthDate = new Date(birthDateString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      // If birthday hasn't happened yet this year, subtract 1
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age.toString();
    } else {
      return null;
    }
  }


  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setProfileData({
            full_name: data.full_name || '',
            email: data.email || user.email || '',
            age: getAge(data.date_of_birth) || '',
            user_role: data.user_role || '',
            gender: data.gender || '',
            avatar_url: data.avatar_url || ''
          });
        }


      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user]);



  useEffect(() => {
    const randomNum: Set<number> = new Set();
    while (randomNum.size !== 10) {
      randomNum.add(Math.floor(Math.random() * 201));
    }

    const fetchQuiz = async () => {
      try {
        setLoading(true);
        if (profileData.email) {

          const userGender = profileData.gender.toLowerCase() || 'all';
          console.log(userGender)
          const gendersToFetch = [userGender, 'all'];

          const userRole = profileData.user_role.toLowerCase() || 'all';
          const rolesToFetch = [userRole, 'all'];
          console.log(profileData)
          const { data, error } = await supabase
            .from('quiz_questions')
            .select(`
              id,
              type,
              question,
              age_range,
              gender,
              user_role,
              quiz_options(
                id,
                value,
                label,
                mood
              )
            `)
            .in('gender', gendersToFetch)
            .in('user_role', rolesToFetch)
          if (error) {
            console.error('Error fetching quiz questions:', error);
          }

          let randomQuestions;

          if (data) {
            if (profileData.age && profileData.age >= "20") {
              const filteredQuestionsByAge = data.filter(question => {
                if (question.age_range && question.age_range.includes('-')) {
                  const ageParts = question.age_range.split('-');

                  const start = parseInt(ageParts[0], 10);
                  const end = parseInt(ageParts[1], 10);

                  const userAge = Number(profileData.age);

                  return userAge >= start && userAge <= end;
                }

                return false;
              });
              const shuffledQuestions = filteredQuestionsByAge.sort(() => 0.5 - Math.random());
              randomQuestions = shuffledQuestions.slice(0, 10);

              setQuizQuestions(randomQuestions);

              console.log('Quiz questions:', randomQuestions);
            } else {
              const shuffledQuestions = data.sort(() => 0.5 - Math.random());
              randomQuestions = shuffledQuestions.slice(0, 10);
              setQuizQuestions(randomQuestions);

              console.log('Quiz questions:', randomQuestions);
            }
          }
        }

      } catch (error) {
        console.error("Error fetching quiz", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [profileData]);

  const progress = quizQuestions.length > 0
    ? ((currentQuestion + 1) / quizQuestions.length) * 100
    : 0;

  const handleNext = () => {
    if (quizQuestions.length === 0) return;

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      const moodProfile = calculateMoodProfile();
      console.log(moodProfile)
      onComplete(moodProfile);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const updateAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateMoodProfile = (): UserProfile => {
    const moodCounts: Record<Mood, number> = {
      energetic: 0,
      calm: 0,
      anxious: 0,
      happy: 0,
      melancholic: 0,
      hopeful: 0
    };

    Object.entries(answers).forEach(([questionId, answerValue]) => {

      const question = quizQuestions.find(q => q.id.toString() === questionId);

      const selectedOption = question?.quiz_options.find(opt => opt.value === answerValue);
      if (selectedOption) {
        moodCounts[selectedOption.mood]++;
      }
    });

    const dominantMood = Object.entries(moodCounts).reduce(
      (prev, curr) => (curr[1] > prev[1] ? curr : prev)
    )[0] as Mood;

    return {
      name: profileData.full_name || "Emotion Seeker",
      age: '25-35',
      currentChallenge: `Feeling ${dominantMood}`,
      dreamGoal: 'Finding inner balance',
      energyLevel: dominantMood === 'energetic' ? 'high' : dominantMood === 'calm' ? 'medium' : 'low',
      recentFeeling: dominantMood,
      motivation: 'Personal growth'
    };
  };

  const isCurrentStepValid = () => {
    if (quizQuestions.length === 0) return false;
    const currentQuestionId = quizQuestions[currentQuestion].id.toString();
    return answers[currentQuestionId] !== undefined;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <RefreshCw className="h-8 w-8 text-purple-600" />
        </div>
      </div>
    );
  }

  if (quizQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Questions Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>We couldn't load the quiz questions. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestionData = quizQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Heart className="absolute top-20 left-20 h-8 w-8 text-pink-400 animate-float" />
        <Star className="absolute top-40 right-32 h-6 w-6 text-yellow-400 animate-sparkle" />
        <Sparkles className="absolute bottom-32 left-1/4 h-7 w-7 text-purple-400 animate-sparkle" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/4 right-1/3 w-48 h-48 rounded-full bg-gradient-to-r from-white/30 to-purple-200/30 animate-pulse-glow blur-sm dark:block hidden"></div>
      </div>

      <Card className="w-full max-w-lg shadow-journey-map border-white/50 dark:border-white/20 bg-white/80 dark:bg-white/10 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-gray-800 dark:text-white bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Mood Assessment Quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center">
              <Progress
  value={progress}
  className="w-full h-2 mb-4 bg-gray-200 dark:bg-gray-800 
             [&>div]:bg-gradient-to-r 
             [&>div]:from-indigo-50 [&>div]:via-purple-50 [&>div]:to-pink-100 
             dark:[&>div]:from-gray-900 dark:[&>div]:via-purple-900 dark:[&>div]:to-pink-900"
/>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Question {currentQuestion + 1} of {quizQuestions.length}
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white text-center">
                {currentQuestionData.question}
              </h2>

              <RadioGroup
                value={answers[currentQuestionData.id] || ''}
                onValueChange={(value) => updateAnswer(currentQuestionData.id.toString(), value)}
                className="space-y-3"
              >
                {currentQuestionData.quiz_options.map((option, index) => (
                  <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-600/30 dark:hover:to-pink-600/30 transition-colors">
                    <RadioGroupItem value={option.value} id={`option-${index}`} className="mt-1" />
                    <Label htmlFor={`option-${index}`} className="text-sm leading-relaxed cursor-pointer flex-1 text-gray-700 dark:text-gray-300">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentQuestion === 0}
              className="border-white/50 dark:border-white/20"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isCurrentStepValid()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              {currentQuestion === quizQuestions.length - 1 ? 'Get Results' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};