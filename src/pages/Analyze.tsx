import { useState } from "react";
import {
  Brain,
  Sparkles,
  Heart,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Star,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EmotionalChatbot from "@/components/EmotionalChatbot";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(import.meta.env.VITE_HUGGINGFACE_API_KEY);

const onlineOptions = [
  {
    name: "BetterHelp (Online Therapy)",
    specialty: "Licensed Professional Counselors",
    distance: "Online",
    phone: "",
    website: "https://www.betterhelp.com",
  },
  {
    name: "Talkspace (Online Therapy)",
    specialty: "Psychiatrists & Therapists",
    distance: "Online",
    phone: "",
    website: "https://www.talkspace.com",
  },
  {
    name: "7 Cups (Free Support)",
    specialty: "Emotional Support",
    distance: "Online",
    phone: "",
    website: "https://www.7cups.com",
  },
  {
    name: "OpenCounseling (Free Resources)",
    specialty: "Support Groups",
    distance: "Online",
    phone: "",
    website: "https://www.opencounseling.com",
  },
];

const affirmations = {
  negative: [
    "💙 This feeling is temporary - you've gotten through tough times before",
    "🌱 Be gentle with yourself today",
    "🤗 Your feelings are valid and important",
    "🔄 Tough moments don't define you",
    "🧠 This discomfort is part of growth",
  ],
  neutral: [
    "🌅 Every day is a new opportunity",
    "🐢 Small steps still move you forward",
    "⚖️ You're exactly where you need to be right now",
    "📈 Progress isn't always linear",
    "🌐 The world needs your unique perspective",
  ],
  positive: [
    "✨ Your positivity is contagious!",
    "🎉 Celebrate this good energy",
    "🏆 You're doing amazing things!",
    "🌻 Your light makes a difference",
    "💐 Savor this joyful moment",
  ],
  "high-risk": [
    "💖 You are worthy of love and support",
    "🤝 You don't have to face this alone - help is available",
    "🌄 This pain won't last forever, even if it feels that way now",
    "🕊️ Your life matters more than you can see right now",
    "🙏 There are people who want to support you through this",
    "💪 You're stronger than you think for reaching out",
    "🌈 Brighter days will come, even if you can't see them yet",
    "🤲 Let someone hold this pain with you - you deserve support",
    "🌱 Healing is possible, one moment at a time",
    "💞 You are deeply valued, even when you can't feel it",
  ],
};

const Analyze = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feelingsText, setFeelingsText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedWeather, setSelectedWeather] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState<string>("");
  const [charCount, setCharCount] = useState(0);
  const MAX_CHAR_LIMIT = 1000;
  const INVALID_CHARACTERS_REGEX = /[<>{}[\]]/g;
  const HTML_TAG_REGEX = /<[^>]*>?/gm;
  const URL_REGEX = /(https?:\/\/[^\s]+)/g;
  const REPETITIVE_TEXT_REGEX = /(.)\1{10,}/g;
  const [inputError, setInputError] = useState<string | null>(null);

  // Validation function
  const validateInput = (text: string): { isValid: boolean; message?: string } => {
    // Check empty input
    if (!text.trim()) {
      return { isValid: false, message: "Please tell us how you're feeling first." };
    }

    // Check character limit
    if (text.length > MAX_CHAR_LIMIT) {
      return { isValid: false, message: `Please keep your input under ${MAX_CHAR_LIMIT} characters.` };
    }

    // Check for HTML tags
    if (HTML_TAG_REGEX.test(text)) {
      return { isValid: false, message: "HTML tags are not allowed." };
    }

    // Check for dangerous characters
    if (INVALID_CHARACTERS_REGEX.test(text)) {
      return { isValid: false, message: "Invalid characters detected. Please remove <, >, {, }, [, or ]." };
    }

    // Check for URLs/links
    if (URL_REGEX.test(text)) {
      return { isValid: false, message: "Links/URLs are not allowed in your message." };
    }

    // Check for excessive repetition (like "aaaaaaaaa")
    if (REPETITIVE_TEXT_REGEX.test(text)) {
      return { isValid: false, message: "Please provide meaningful input without excessive repetition." };
    }

    return { isValid: true };
  };

  const weatherOptions = [
    { value: "sunny", label: "Sunny", icon: Sun },
    { value: "cloudy", label: "Cloudy", icon: Cloud },
    { value: "rainy", label: "Rainy", icon: CloudRain },
    { value: "snowy", label: "Snowy", icon: Snowflake },
  ];

  const handleWeatherSelect = (weatherValue: string) => {
    setSelectedWeather((prev) => (prev === weatherValue ? "" : weatherValue));
  };

  const getNewAffirmation = () => {
    if (!result?.mood) return;

    const moodAffirmations =
      affirmations[result.mood as keyof typeof affirmations];
    const newAffirmation =
      moodAffirmations[Math.floor(Math.random() * moodAffirmations.length)];

    // Update the result with the new affirmation
    setResult({
      ...result,
      affirmation: newAffirmation,
    });

    // Also update the currentAffirmation state
    setCurrentAffirmation(newAffirmation);
  };

  const analyzeWithHuggingFace = async (text: string, weather?: string) => {
    try {
      // Map model labels
      const labelMap = {
        negative: {
          mood: "negative",
          emoji: "😔",
          theme: "supportive",
          colors: {
            primary: "indigo",
            secondary: "blue",
            gradient: "from-indigo-700 to-blue-700",
            darkGradient: "from-indigo-500 to-blue-500",
            bg: "bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-indigo-900", // Softer background
          },
        },
        neutral: {
          mood: "neutral",
          emoji: "😐",
          theme: "balanced",
          colors: {
            primary: "teal",
            secondary: "emerald",
            gradient: "from-teal-600 to-emerald-600",
            darkGradient: "from-teal-400 to-emerald-400",
            bg: "bg-gradient-to-br from-teal-50 to-emerald-100 dark:from-gray-900 dark:to-teal-900",
          },
        },
        positive: {
          mood: "positive",
          emoji: "😊",
          theme: "positive",
          colors: {
            primary: "pink",
            secondary: "amber",
            gradient: "from-pink-500 to-amber-500",
            darkGradient: "from-pink-400 to-amber-400",
            bg: "bg-gradient-to-br from-pink-50 to-amber-100 dark:from-gray-900 dark:to-pink-900",
          },
        },
        "high-risk": {
          mood: "high-risk",
          emoji: "⚠️",
          theme: "supportive",
          colors: {
            primary: "red",
            secondary: "orange",
            gradient: "from-red-600 to-orange-600",
            darkGradient: "from-red-500 to-orange-500",
            bg: "bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-red-900",
          },
        },
      };

      // Get classification results
      const result = await hf.textClassification({
        model: "cardiffnlp/twitter-xlm-roberta-base-sentiment",
        inputs: text,
      });

      // Log raw output for debugging
      console.log("Raw API Response:", result);

      // The API returns an array of results sorted by score (highest first)
      const topResult = result[0]; // Already sorted, so first element is the strongest prediction

      // Get mood info
      const moodInfo =
        labelMap[topResult.label as keyof typeof labelMap] || labelMap.neutral;

      // Activity suggestions based on mood
      const activitySuggestions = {
        negative: [
          "💬 Talk to someone you trust about how you're feeling",
          "🎵 Listen to soothing instrumental music",
          "🛀 Take a relaxing bath or shower",
          "🧘 Try a short guided meditation",
        ],
        neutral: [
          "☕ Visit a cafe and people-watch",
          "📱 Call or message someone you haven't talked to in a while",
          "🧹 Organize a small space in your home",
          "🛌 Allow yourself to rest without guilt",
        ],
        positive: [
          "🎉 Treat yourself to something special",
          "📞 Share your good mood by calling a loved one",
          "✍️ Write down things you're grateful for",
          "📸 Capture happy moments with photos",
        ],
      };

      const weatherActivitySuggestions = {
        sunny: {
          negative: [
            "🌳 Sit in a shaded outdoor area to calm down",
            "☀️ Try sun gazing during safe hours to relax",
            "💧 Stay hydrated while processing your emotions",
          ],
          neutral: [
            "🚶‍♂️ Take a walk in the sunshine",
            "🎨 Try outdoor sketching or photography",
            "🧺 Have a picnic in the park",
          ],
          positive: [
            "🥾 Go for a hike and enjoy nature",
            "💪 Have an outdoor workout session",
            "🌿 Visit a botanical garden",
          ],
        },
        cloudy: {
          negative: [
            "🛋️ Wrap yourself in a cozy blanket",
            "📓 Write in a journal by the window",
            "🍵 Make some warm tea and reflect",
          ],
          neutral: [
            "🖼️ Visit a museum or gallery",
            "🧗 Try indoor rock climbing",
            "📚 Read a book in a cozy cafe",
          ],
          positive: [
            "📸 Perfect weather for outdoor photography",
            "☁️ Try cloud watching and relax",
            "🚴 Go for a bike ride without the sun glare",
          ],
        },
        rainy: {
          negative: [
            "🎧 Listen to calming rain sounds",
            "✍️ Write down your thoughts while watching the rain",
            "☕ Make some hot chocolate and be kind to yourself",
          ],
          neutral: [
            "📖 Read a book by the window",
            "🍪 Try baking something comforting",
            "🧘 Do some indoor yoga",
          ],
          positive: [
            "💃 Dance in the rain if it's warm",
            "📷 Photograph rain droplets on surfaces",
            "🎲 Play board games with friends indoors",
          ],
        },
        snowy: {
          negative: [
            "📚 Stay warm with hot tea and a good book",
            "❄️ Watch the snowfall to calm your mind",
            "✏️ Write down your thoughts by the window",
          ],
          neutral: [
            "⛄ Build a small snow sculpture",
            "👼 Try making snow angels",
            "📸 Photograph the winter scenery",
          ],
          positive: [
            "🛷 Go sledding or tubing",
            "⚪ Have a snowball fight with friends",
            "☕ Make hot cocoa and enjoy the winter view",
          ],
        },
      };

      // Get base activity suggestions
      const baseSuggestions =
        activitySuggestions[moodInfo.mood as keyof typeof activitySuggestions];

      // Get weather-specific suggestions if weather was provided
      const weatherBasedSuggestions = weather
        ? weatherActivitySuggestions[
        weather as keyof typeof weatherActivitySuggestions
        ]?.[moodInfo.mood] || []
        : [];

      // Combine suggestions (show 2 weather-specific if available)
      const allSuggestions = [
        ...weatherBasedSuggestions.slice(0, 2), // Show up to 2 weather-specific first
        ...baseSuggestions,
      ].slice(0, 4); // Keep total at 4 suggestions

      return {
        mood: moodInfo.mood,
        emoji: moodInfo.emoji,
        message: weather
          ? `You are feeling ${moodInfo.mood} on this ${weather} day.`
          : `You are feeling ${moodInfo.mood}.`,
        theme: moodInfo.theme,
        colors: moodInfo.colors,
        suggested_activities: allSuggestions,
        affirmation:
          affirmations[moodInfo.mood][
          Math.floor(Math.random() * affirmations[moodInfo.mood].length)
          ],
        confidence: topResult.score,
      };
    } catch (error) {
      console.error("Error analyzing with Hugging Face:", error);
      throw error;
    }
  };

  interface RiskResultItem {
    label: string;
    score: number;
  }

  const detectRiskFactors = async (text: string) => {
    try {
      const riskResults = await hf.zeroShotClassification({
        model: "joeddav/xlm-roberta-large-xnli",
        inputs: text,
        parameters: {
          candidate_labels: [
            "suicidal thoughts",
            "suicide plan",
            "self-harm",
            "hopelessness",
            "depression",
            "severe anxiety",
            "isolation",
          ],
          multi_label: true,
        },
      });

      if (!Array.isArray(riskResults)) {
        throw new Error("Unexpected API response format");
      }

      const typedResults = riskResults as RiskResultItem[];

      const highRiskItems = typedResults.filter((item) => item.score > 0.7);
      const highRiskLabels = highRiskItems.map((item) => item.label);
      const scores = typedResults.map((item) => item.score);

      console.log(highRiskItems);
      console.log(highRiskLabels);

      return {
        hasRisk: highRiskItems.length > 0,
        riskFactors: highRiskLabels,
        scores,
        allResults: typedResults,
      };
    } catch (error) {
      console.error("Error in risk detection:", error);
      return {
        hasRisk: false,
        riskFactors: [],
        scores: [],
        allResults: null,
      };
    }
  };

  const handleAnalyze = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to analyze your mood.",
        variant: "destructive",
      });
      return;
    }

    if (!feelingsText.trim()) {
      toast({
        title: "Missing Input",
        description: "Please tell us how you're feeling first.",
        variant: "destructive",
      });
      return;
    }

    // Final validation check
    const validation = validateInput(feelingsText);
    if (!validation.isValid) {
      toast({
        title: "Invalid Input",
        description: validation.message || "Please check your input and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const riskAnalysis = await detectRiskFactors(feelingsText);

      if (riskAnalysis.hasRisk) {
        setResult({
          mood: "high-risk",
          emoji: "⚠️",
          message: "We detected some concerning patterns in your message.",
          theme: "supportive",
          colors: {
            primary: "red",
            secondary: "orange",
            gradient: "from-red-600 to-orange-600",
            darkGradient: "from-red-500 to-orange-500",
            bg: "bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-red-900",
          },
          suggested_activities: [
            "🆘 Please reach out to a mental health professional",
            "📞 Contact a crisis hotline in your area",
            "👥 Talk to someone you trust about how you're feeling",
            "🏠 Stay in a safe environment",
          ],
          affirmation:
            "You are not alone, and help is available. Your life matters.",
          riskFactors: riskAnalysis.riskFactors,
        });

        toast({
          title: "Important Notice",
          description:
            "We detected some concerning patterns in your message. Please consider reaching out for support.",
          variant: "destructive",
        });

        await supabase.from("mood_entries").insert({
          user_id: user.id,
          mood: "high-risk",
          feelings_text: feelingsText,
          weather: selectedWeather || null,
          message: "User expressed high-risk thoughts",
          theme: "supportive",
        });

        return;
      }

      // If no high risk factors, proceed with normal analysis
      const analysisResult = await analyzeWithHuggingFace(
        feelingsText,
        selectedWeather || undefined
      );

      const { data, error } = await supabase
        .from("mood_entries")
        .insert({
          user_id: user.id,
          mood: analysisResult.mood,
          feelings_text: feelingsText,
          weather: selectedWeather || null,
          message: analysisResult.message,
          theme: analysisResult.theme,
        })
        .select()
        .single();

      setCurrentAffirmation(analysisResult.affirmation);
      setResult(analysisResult);

      toast({
        title: "Mood Analyzed Successfully! ✨",
        description: "Your mood has been analyzed and saved to your journey.",
      });
    } catch (error) {
      console.error("Error analyzing mood:", error);
      toast({
        title: "Analysis Failed",
        description:
          "There was an error analyzing your mood. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 py-12 flex items-center justify-center transition-colors">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 transition-colors">
            Please log in to analyze your mood
          </h2>
          <p className="text-gray-600 dark:text-gray-300 transition-colors">
            You need to be logged in to track and save your mood analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 py-12 relative overflow-hidden transition-colors">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-gradient-to-r from-purple-300/30 to-pink-300/30 dark:from-purple-500/20 dark:to-pink-500/20 animate-float blur-2xl"></div>
        <div
          className="absolute bottom-32 right-20 w-96 h-96 rounded-full bg-gradient-to-r from-blue-300/30 to-cyan-300/30 dark:from-blue-500/20 dark:to-cyan-500/20 animate-float blur-xl"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-gradient-to-r from-pink-300/40 to-purple-300/40 dark:from-pink-500/30 dark:to-purple-500/30 animate-float blur-lg"
          style={{ animationDelay: "4s" }}
        ></div>

        {/* Glowing orb similar to the uploaded image */}
        <div className="absolute top-1/4 right-1/3 w-48 h-48 rounded-full bg-gradient-to-r from-white/30 to-purple-200/30 animate-pulse-glow blur-sm"></div>

        <Sparkles className="absolute top-32 right-1/4 h-6 w-6 text-purple-400 animate-sparkle drop-shadow-lg" />
        <Heart
          className="absolute bottom-40 left-1/4 h-8 w-8 text-pink-400 animate-sparkle drop-shadow-lg"
          style={{ animationDelay: "1s" }}
        />
        <Star
          className="absolute top-2/3 right-10 h-5 w-5 text-blue-400 animate-sparkle drop-shadow-lg"
          style={{ animationDelay: "3s" }}
        />
        <Star
          className="absolute top-1/3 left-10 h-4 w-4 text-yellow-400 animate-sparkle drop-shadow-lg"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 rounded-full blur-xl opacity-60 animate-glow"></div>
                <div className="relative p-6 bg-white/90 dark:bg-white/10 backdrop-blur-sm rounded-full shadow-2xl border-4 border-white/60 dark:border-white/20 group-hover:scale-110 transition-transform duration-500">
                  <Brain className="h-16 w-16 text-purple-600 dark:text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-white mb-4 leading-tight transition-colors">
              Analyze Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 animate-gradient-shift">
                Beautiful Mood
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium max-w-2xl mx-auto transition-colors">
              Share your feelings and let our AI provide personalized insights
              and suggestions to brighten your day ✨
            </p>
          </div>

          {/* Main Analysis Card */}
          <div
            className="bg-white/95 dark:bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border-2 border-white/50 dark:border-white/20 animate-fade-in transition-colors"
            style={{ animationDelay: "0.2s" }}
          >
            {/* Weather Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center transition-colors">
                What's the weather like today?
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {weatherOptions.map((weather) => {
                  const weatherEmoji =
                    {
                      sunny: <Sun className="w-6 h-6 text-yellow-400" />,
                      cloudy:<Cloud className="w-6 h-6 text-gray-400" />,
                      rainy: <CloudRain className="w-6 h-6 text-blue-400" />,
                      snowy: <Snowflake className="w-6 h-6 text-cyan-300" />,
                    }[weather.value] || "🌡️";

                  const isSelected = selectedWeather === weather.value;

                  return (
                    <button
                      key={weather.value}
                      onClick={() => handleWeatherSelect(weather.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-2 hover:scale-105 ${isSelected
                        ? "border-purple-500 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-500/30 dark:to-pink-500/30 shadow-lg"
                        : "border-gray-200 dark:border-white/30 bg-white/60 dark:bg-white/10 hover:bg-gradient-to-r hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-600/30 dark:hover:to-pink-600/30 hover:border-purple-500 dark:hover:border-purple-400"
                        }`}
                      aria-pressed={isSelected}
                    >
                      <span
                        className={`text-2xl ${isSelected
                          ? "text-purple-600 dark:text-purple-300"
                          : "text-gray-600 dark:text-gray-300"
                          }`}
                        role="img"
                        aria-label={weather.label}
                      >
                        {weatherEmoji}
                      </span>
                      <span
                        className={`text-sm font-medium ${isSelected
                          ? "text-purple-800 dark:text-purple-200"
                          : "text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        {weather.label}
                      </span>
                      {isSelected && (
                        <span className="text-xs text-purple-600 dark:text-purple-300">
                          Click to unselect
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feelings Input */}
            <div className="mb-8">
              <label className="block text-lg font-bold text-gray-800 dark:text-white mb-4 transition-colors">
                How are you feeling today? Share whatever is on your mind... 💭
                <span className="text-sm font-normal ml-2">
                  ({charCount}/{MAX_CHAR_LIMIT} characters)
                </span>
              </label>
              <textarea
                value={feelingsText}
                onChange={(e) => {
                  const text = e.target.value;
                  setCharCount(text.length);

                  // Real-time validation
                  if (text.length > MAX_CHAR_LIMIT) {
                    setInputError(`Please keep your input under ${MAX_CHAR_LIMIT} characters.`);
                  }
                  else if (HTML_TAG_REGEX.test(text)) {
                    setInputError('HTML tags are not allowed.');
                  }
                  else if (INVALID_CHARACTERS_REGEX.test(text)) {
                    setInputError('Invalid characters detected (<>{}[]).');
                  }
                  else if (URL_REGEX.test(text)) {
                    setInputError('Links/URLs are not allowed.');
                  }
                  else if (REPETITIVE_TEXT_REGEX.test(text)) {
                    setInputError('Please avoid excessive repetition.');
                  }
                  else {
                    setInputError(null);
                  }

                  setFeelingsText(text);
                }}
                placeholder="I'm feeling excited about my new project, but also a bit nervous about the presentation tomorrow..."
                className={`w-full h-40 p-6 border-2 ${inputError
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-300 dark:focus:ring-red-700'
                    : 'border-purple-300 dark:border-purple-400/50 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-200/70 dark:focus:ring-purple-800/50'
                  } rounded-2xl resize-none text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-purple-200/60 bg-white/80 dark:bg-purple-900/20 backdrop-blur-sm shadow-inner text-base leading-relaxed transition-all duration-300 outline-none`}
                disabled={isAnalyzing}
              />
              {inputError && (
                <p className="text-red-500 text-sm mt-2">{inputError}</p>
              )}
              {charCount > MAX_CHAR_LIMIT * 0.9 && (
                <p className={`text-sm mt-2 ${charCount >= MAX_CHAR_LIMIT ? 'text-red-500' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  {charCount >= MAX_CHAR_LIMIT
                    ? 'Character limit exceeded!'
                    : `Approaching character limit... (${charCount}/${MAX_CHAR_LIMIT})`}
                </p>
              )}
            </div>

            {/* Analyze Button */}
            <div className="text-center mb-8">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !feelingsText.trim() || charCount > MAX_CHAR_LIMIT}
                className={`px-12 py-4 rounded-2xl font-black text-lg transition-all duration-500 shadow-2xl ${isAnalyzing || !feelingsText.trim() || charCount > MAX_CHAR_LIMIT
                  ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:scale-110 hover:shadow-3xl animate-glow"
                  }`}
              >
                {isAnalyzing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                    Analyzing Your Beautiful Mind...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Sparkles className="h-6 w-6 mr-3 animate-sparkle" />
                    {charCount > MAX_CHAR_LIMIT ? 'Reduce Character Count' : 'Analyze My Mood ✨'}
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div
              className={`bg-white/95 dark:bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-white/50 dark:border-white/20 animate-fade-in transition-colors`}
            >
              <div className="text-center mb-8">
                <div className="text-6xl mb-4 animate-bounce">
                  {result.emoji}
                </div>
                <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-4 transition-colors">
                  Your Mood Analysis
                </h2>
                <p
                  className={`text-lg text-${result.colors.primary}-600 dark:text-${result.colors.primary}-300 font-medium max-w-2xl mx-auto leading-relaxed transition-colors`}
                >
                  {result.message}
                </p>
              </div>

              {/* Emotional Support Chat Button */}
              <div className="text-center mb-4">
                <button
                  onClick={() => setShowChatbot(true)}
                  className={`px-8 py-4 bg-gradient-to-r ${result.colors.gradient} dark:bg-gradient-to-r ${result.colors.darkGradient} text-white rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center mx-auto space-x-3`}
                >
                  <MessageSquare className="h-6 w-6" />
                  <span>Chat with Emotional Support AI</span>
                  <Heart className="h-5 w-5 animate-pulse" />
                </button>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-4 transition-colors">
                  Get personalized emotional support and guidance
                </p>
              </div>

              {result?.riskFactors && result.riskFactors.length > 0 && (
                <div className="mt-8 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50/90 to-orange-50/80 dark:from-red-900/30 dark:to-orange-900/20 p-6 shadow-lg border border-red-100/80 dark:border-red-900/50 backdrop-blur-sm">
                  <div className="absolute inset-0 overflow-hidden opacity-20">
                    <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-red-300/30 blur-xl animate-float"></div>
                    <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-orange-300/30 blur-xl animate-float animation-delay-3000"></div>
                  </div>

                  {/* warning icon */}
                  <div className="absolute top-4 right-4 flex items-center justify-center h-12 w-12 rounded-full bg-red-100/80 dark:bg-red-900/50 shadow-inner">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-red-500 dark:text-red-300 animate-pulse"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>


                  <div className="relative z-10">
                    <h3 className="flex items-center text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-red-500 dark:text-red-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Important Patterns We Noticed
                    </h3>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.riskFactors.map((factor, i) => (
                        <div
                          key={i}
                          className="flex items-start p-3 rounded-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-red-100/60 dark:border-red-900/30 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 text-red-500 dark:text-red-300"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                          <p className="ml-2 text-sm font-medium text-red-700 dark:text-red-200">
                            {factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 p-4 rounded-lg bg-gradient-to-r from-red-100/60 to-orange-100/60 dark:from-red-900/30 dark:to-orange-900/20 border border-red-200/50 dark:border-red-900/30">
                      <p className="flex items-start text-red-700 dark:text-red-200">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 flex-shrink-0 mr-2 mt-0.5 text-red-500 dark:text-red-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        <span>
                          These patterns are important to discuss with a professional.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {result?.mood === "high-risk" && (
                <div
                  className={`bg-red-50/90 dark:bg-red-900/30 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 mt-8 mb-8 border-2 border-red-200 dark:border-red-400/50  ${result.colors.bg}`}
                >
                  <div className="text-center mb-6">
                    <h3
                      className={`text-2xl font-black text-red-600 dark:text-red-300 mb-2 flex items-center justify-center transition-colors`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Immediate Support Options
                    </h3>
                    <p className="text-red-700 dark:text-red-200">
                      You're not alone - help is available
                    </p>
                  </div>

                  {/* Online Resources Section */}
                  <div className="mb-6">
                    <h4
                      className={`text-lg font-bold text-red-600 dark:text-red-300 mb-4 flex items-center transition-colors`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                      Online Support Resources
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {onlineOptions.map((resource, index) => (
                        <div
                          key={index}
                          className={`p-4 bg-gradient-to-r from-red-100/80 to-orange-100/80 dark:from-red-500/20 dark:to-orange-500/20 rounded-xl border-2 border-white/60 dark:border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105`}
                        >
                          <div className="flex items-start">
                            <div
                              className={`bg-red-100 dark:bg-red-900/50 p-2 rounded-lg mr-3`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-red-600 dark:text-red-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                              </svg>
                            </div>
                            <div>
                              <h5 className="font-bold text-gray-800 dark:text-white">
                                {resource.name}
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                {resource.specialty}
                              </p>
                              {resource.website && (
                                <a
                                  href={resource.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center text-sm bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-200 px-3 py-1 rounded-full transition-colors`}
                                >
                                  Visit Website
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 ml-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested Activities */}
              {result.suggested_activities &&
                result.suggested_activities.length > 0 && (
                  <div
                    className={`mb-4 bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-8 mt-8 shadow-xl border-2 border-white/10 dark:border-white/80 transition-colors`}
                  >
                    <h3
                      className={`text-2xl font-black text-${result.colors.primary}-600 dark:text-${result.colors.primary}-300 mb-6 text-center flex items-center justify-center transition-colors`}
                    >
                      <Heart
                        className={`h-6 w-6 mr-3 text-${result.colors.primary}-500 dark:text-${result.colors.primary}-400`}
                      />
                      Suggested Activities Just for You
                      <Sparkles
                        className={`h-6 w-6 ml-3 text-${result.colors.secondary}-500 dark:text-${result.colors.secondary}-400 animate-sparkle`}
                      />
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.suggested_activities.map(
                        (activity: string, index: number) => (
                          <div
                            key={index}
                            className={`p-4 bg-gradient-to-r from-${result.colors.primary}-100/80 to-${result.colors.secondary}-100/80 dark:from-${result.colors.primary}-500/20 dark:to-${result.colors.secondary}-500/20 rounded-xl border-2 border-white/60 dark:border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105`}
                          >
                            <p className="text-gray-700 dark:text-gray-200 font-medium text-center transition-colors">
                              {activity}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Personalized Affirmation Card */}
              <div className="mb-4 bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2 border-white/60 dark:border-white/20">
                <div className="relative mb-6">
                  {" "}
                  <h3
                    className={`text-2xl font-black text-${result.colors.primary}-600 dark:text-${result.colors.primary}-300 text-center flex items-center justify-center transition-colors`}
                  >
                    <Sparkles
                      className={`h-6 w-6 mr-3 text-${result.colors.secondary}-500 dark:text-${result.colors.secondary}-400 animate-sparkle`}
                    />
                    Your Personalized Affirmation
                    <Heart
                      className={`h-6 w-6 ml-3 text-${result.colors.primary}-500 dark:text-${result.colors.primary}-400`}
                    />
                  </h3>
                  <button
                    onClick={getNewAffirmation}
                    className={`absolute top-0 right-0 p-2 rounded-full bg-${result.colors.primary}-100/80 dark:bg-${result.colors.primary}-500/20 hover:bg-${result.colors.primary}-200/80 dark:hover:bg-${result.colors.primary}-600/30 transition-colors`}
                    title="Get another affirmation"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 text-${result.colors.primary}-600 dark:text-${result.colors.primary}-300`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>

                <div
                  className={`p-6 bg-gradient-to-r from-${result.colors.primary}-100/80 to-${result.colors.secondary}-100/80 dark:from-${result.colors.primary}-500/20 dark:to-${result.colors.secondary}-500/20 rounded-xl border-2 border-white/60 dark:border-white/20 text-center hover:shadow-lg transition-all duration-300 hover:scale-[1.01]`}
                >
                  <p className="text-gray-700 dark:text-gray-200 font-medium text-center transition-colors">
                    "{result.affirmation}"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Emotional Support Chatbot */}
      {showChatbot && (
        <EmotionalChatbot
          mood={result?.mood}
          context={feelingsText}
          onClose={() => setShowChatbot(false)}
          
        />
      )}
    </div>
  );
};

export default Analyze;
