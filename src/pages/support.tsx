import { Link } from 'react-router-dom';
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Heart, Sparkles, Star, Moon, Sun, Zap, MessageCircle, Mail, User, HelpCircle, Shield, FileText } from "lucide-react";
import emailjs from "@emailjs/browser";

const Support = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    // validation
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    if (!form.email.includes("@")) {
      setError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE,
        import.meta.env.VITE_EMAILJS_TEMPLATE,
        {
          from_name: form.name,
          from_email: form.email,
          message: form.message,
        },
        import.meta.env.VITE_EMAILJS_API_KEY
      );

      setSuccess("Message sent successfully!");
      setShowConfetti(true);
      setForm({ name: "", email: "", message: "" });

      setTimeout(() => {
        setShowConfetti(false);
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError("Failed to send message. Please try again later.");
      console.error("EmailJS error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 py-12 px-4 transition-colors relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-20 w-64 h-64 rounded-full bg-gradient-to-r from-blue-300/30 to-cyan-300/30 animate-float blur-lg" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 rounded-full bg-gradient-to-r from-green-300/30 to-emerald-300/30 animate-float blur-xl" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 rounded-full bg-gradient-to-r from-yellow-300/40 to-orange-300/40 animate-float blur-lg" style={{ animationDelay: '1s' }}></div>

        <Sparkles className="absolute top-32 right-1/4 h-8 w-8 text-yellow-400 animate-sparkle drop-shadow-lg dark:text-yellow-300" />
        <Star className="absolute top-64 left-1/3 h-6 w-6 text-pink-400 animate-sparkle drop-shadow-lg dark:text-pink-300" style={{ animationDelay: '1s' }} />
        <Heart className="absolute bottom-40 right-1/3 h-7 w-7 text-red-400 animate-sparkle drop-shadow-lg dark:text-red-300" style={{ animationDelay: '3s' }} />
        <Moon className="absolute top-80 left-20 h-8 w-8 text-indigo-400 animate-sparkle drop-shadow-lg dark:text-indigo-300" style={{ animationDelay: '2.5s' }} />
      </div>

      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none flex justify-center items-center z-50">
          <div className="absolute inset-0 flex justify-center items-center">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className={`absolute h-2 w-2 rounded-full ${['bg-yellow-400', 'bg-pink-400', 'bg-purple-400', 'bg-blue-400', 'bg-green-400'][i % 5]
                  }`}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  transform: `scale(${Math.random() * 2})`,
                  animation: `confetti-fall ${Math.random() * 3 + 2}s linear forwards`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        {/* header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 animate-gradient-shift">
            Support & Policies
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto font-medium">
            We're here to help you with any questions or concerns you might have
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-8 mb-12">
          {[
            {
              title: "Support",
              icon: <Heart className="h-8 w-8 text-pink-600 dark:text-pink-400" />,
              content:
                "Facing any issues? Check our Help Center below or reach out via the contact form. We're here for you 24/7.",
              borderColor: "border-purple-400",
              gradient: "from-purple-100 to-pink-100",
            },
            {
              title: "Help Center",
              icon: <HelpCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
              content: (
                <div>
                  <p className="mb-2">
                    Welcome to our Help Center! Here are some quick tips to get started:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Create your profile to personalize your experience</li>
                    <li>Explore mood tracking and journaling features</li>
                    <li>Check updates and new features regularly</li>
                    <li>If you need assistance, use the contact form below</li>
                  </ul>
                  <p className="mt-3">
                    We're committed to helping you have the best experience possible!
                  </p>
                </div>
              ),
              borderColor: "border-pink-400",
              gradient: "from-pink-100 to-purple-100",
            },
            {
              title: "Privacy Policy",
              icon: <Shield className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
              content:
                "We protect your privacy with top-notch encryption and never share your data without your consent.",
              borderColor: "border-blue-400",
              gradient: "from-blue-100 to-indigo-100",
            },
            {
              title: "Terms of Service",
              icon: <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />,
              content:
                "Using the Mood app means agreeing to our terms: respect, responsible use, and community care.",
              borderColor: "border-purple-400",
              gradient: "from-indigo-100 to-purple-100",
            },
          ].map(({ title, icon, content, borderColor, gradient }, index) => (
            <Card
              key={title}
              className={`bg-white/90 dark:bg-white/10 backdrop-blur-md border-2 rounded-3xl shadow-lg ${borderColor} hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] animate-fade-in`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-full bg-gradient-to-r ${gradient} shadow-md`}>
                    {icon}
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
                    {title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 text-lg">
                {content}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Form */}
        <Card
          className="bg-white/90 dark:bg-white/10 backdrop-blur-md border-2 border-pink-400 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.01] animate-fade-in"
          style={{ animationDelay: '0.8s' }}
        >
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 shadow-md">
                <MessageCircle className="h-7 w-7 text-pink-600 dark:text-pink-400" />
              </div>
              <CardTitle className="text-xl text-pink-600 dark:text-pink-400">
                Contact Us
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-fade-in">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-fade-in">
                  {success}
                </div>
              )}

              <div className="animate-fade-in" style={{ animationDelay: '1s' }}>
                <Label htmlFor="name" className="text-gray-900 dark:text-gray-100 flex items-center">
                  <User className="h-5 w-5 mr-2 text-pink-500" />
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  className="bg-white border-pink-300 focus:ring-pink-400 dark:bg-white/10 dark:border-pink-600 dark:focus:ring-pink-500 mt-2"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '1.1s' }}>
                <Label htmlFor="email" className="text-gray-900 dark:text-gray-100 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-pink-500" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="bg-white border-pink-300 focus:ring-pink-400 dark:bg-white/10 dark:border-pink-600 dark:focus:ring-pink-500 mt-2"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '1.2s' }}>
                <Label htmlFor="message" className="text-gray-900 dark:text-gray-100 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-pink-500" />
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Your message here..."
                  value={form.message}
                  onChange={handleChange}
                  className="bg-white border-pink-300 focus:ring-pink-400 dark:bg-white/10 dark:border-pink-600 dark:focus:ring-pink-500 resize-none mt-2"
                  rows={5}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '1.3s' }}>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full font-extrabold text-lg ${isSubmitting
                      ? "bg-pink-300 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-pink-600 via-pink-500 to-pink-600 text-white hover:from-pink-700 hover:via-pink-600 hover:to-pink-700"
                    } transition-all duration-300 shadow-lg hover:shadow-2xl group`}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <span className="flex items-center justify-center">
                        <Sparkles className="mr-2 h-5 w-5 group-hover:animate-spin" />
                        Send Message
                        <Heart className="ml-2 h-5 w-5 group-hover:animate-pulse" />
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Chat Bubble */}
        <Link
          to="/emotionalchatbot"
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="relative group">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 dark:from-pink-500 dark:to-purple-400 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-600 animate-bounce">
              <Heart className="h-7 w-7 text-white dark:text-white animate-pulse" />
            </div>
            <div className="absolute right-20 bottom-2 bg-white dark:bg-gray-800 text-sm font-semibold text-purple-600 dark:text-gray-200 px-4 py-2 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-fade-in">
              Chat for support 💬
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Support;
