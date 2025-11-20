import { useState, useEffect } from 'react';
import { User, Save, Calendar, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import AvatarUpload from '@/components/AvatarUpload';

interface ProfileData {
  full_name: string;
  username: string;
  email: string;
  date_of_birth: string;
  user_role: string;
  gender: string;
  avatar_url: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    username: '',
    email: '',
    date_of_birth: '',
    user_role: '',
    gender: '',
    avatar_url: ''
  });

  const getUserInitials = () => {
    if (profileData.full_name) {
      const names = profileData.full_name.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
      }
      return names[0].charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setLoading(true);
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
          username: data.username || '',
          email: data.email || user.email || '',
          date_of_birth: data.date_of_birth || '',
          user_role: data.user_role || '',
          gender: data.gender || '',
          avatar_url: data.avatar_url || ''
        });
      } else {
        setProfileData(prev => ({
          ...prev,
          email: user.email || ''
        }));
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileData.full_name || null,
          username: profileData.username || null,
          email: profileData.email,
          date_of_birth: profileData.date_of_birth || null,
          user_role: profileData.user_role || null,
          gender: profileData.gender || null,
          avatar_url: profileData.avatar_url || null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (avatarUrl: string) => {
    setProfileData(prev => ({
      ...prev,
      avatar_url: avatarUrl
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 transition-colors">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 dark:border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 py-12 px-4 relative overflow-hidden transition-colors">
      {/* Floating background elements inspired by Analyze */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-gradient-to-r from-purple-300/30 to-pink-300/30 dark:from-purple-500/20 dark:to-pink-500/20 animate-float blur-2xl"></div>
        <div className="absolute bottom-32 right-20 w-96 h-96 rounded-full bg-gradient-to-r from-blue-300/30 to-cyan-300/30 dark:from-blue-500/20 dark:to-cyan-500/20 animate-float blur-xl" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-gradient-to-r from-pink-300/40 to-purple-300/40 dark:from-pink-500/30 dark:to-purple-500/30 animate-float blur-lg" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/4 right-1/3 w-48 h-48 rounded-full bg-gradient-to-r from-white/30 to-purple-200/30 animate-pulse-glow blur-sm"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header inspired by Analyze */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 rounded-full blur-xl opacity-60 animate-glow"></div>
                <div className="relative p-6 bg-white/90 dark:bg-white/10 backdrop-blur-sm rounded-full shadow-2xl border-4 border-white/60 dark:border-white/20 group-hover:scale-110 transition-transform duration-500">
                  <User className="h-16 w-16 text-purple-600 dark:text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-white mb-4 leading-tight transition-colors">
              Customize Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 animate-gradient-shift">
                Profile Settings
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium max-w-2xl mx-auto transition-colors">
              Personalize your profile with your unique details ✨
            </p>
          </div>

          {/* Profile Section Card */}
          <div className="bg-white/95 dark:bg-transparent backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-white/50 dark:border-white/20 animate-fade-in transition-colors">
            <div className="flex flex-col items-center mb-10">
              <AvatarUpload
                currentAvatar={profileData.avatar_url}
                userInitials={getUserInitials()}
                onAvatarChange={handleAvatarChange}
              />
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-3 transition-colors">Click to change avatar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Username */}
              <div>
                <label className=" text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center transition-colors">
                  <User className="inline h-5 w-5 mr-2 text-purple-600 dark:text-purple-300" />
                  Username
                </label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-purple-300 dark:border-purple-400/50 rounded-2xl focus:ring-4 focus:ring-purple-200/70 dark:focus:ring-purple-800/50 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-all bg-white/80 dark:bg-purple-900/20 backdrop-blur-sm text-base text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-purple-200/60 hover:border-purple-500 dark:hover:border-purple-400"
                  placeholder="Enter your username"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className=" text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center transition-colors">
                  <User className="inline h-5 w-5 mr-2 text-purple-600 dark:text-purple-300" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-purple-300 dark:border-purple-400/50 rounded-2xl focus:ring-4 focus:ring-purple-200/70 dark:focus:ring-purple-800/50 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-all bg-white/80 dark:bg-purple-900/20 backdrop-blur-sm text-base text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-purple-200/60 hover:border-purple-500 dark:hover:border-purple-400"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className=" text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center transition-colors">
                  <Mail className="inline h-5 w-5 mr-2 text-purple-600 dark:text-purple-300" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-purple-300 dark:border-purple-400/50 rounded-2xl focus:ring-4 focus:ring-purple-200/70 dark:focus:ring-purple-800/50 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-all bg-white/80 dark:bg-purple-900/20 backdrop-blur-sm text-base text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-purple-200/60 hover:border-purple-500 dark:hover:border-purple-400 disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                  disabled
                />
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 transition-colors">Email cannot be changed</p>
              </div>

              {/* Date of Birth */}
              <div>
                <label className=" text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center transition-colors">
                  <Calendar className="inline h-5 w-5 mr-2 text-purple-600 dark:text-purple-300" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={profileData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-purple-300 dark:border-purple-400/50 rounded-2xl focus:ring-4 focus:ring-purple-200/70 dark:focus:ring-purple-800/50 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-all bg-white/80 dark:bg-purple-900/20 backdrop-blur-sm text-base text-gray-700 dark:text-white hover:border-purple-500 dark:hover:border-purple-400"
                />
              </div>

              {/* User Role */}
              <div>
                <label className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center transition-colors">
                  Status
                </label>
                <select
                  value={profileData.user_role}
                  onChange={(e) => handleInputChange('user_role', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-purple-300 dark:border-purple-400/50 rounded-2xl focus:ring-4 focus:ring-purple-200/70 dark:focus:ring-purple-800/50 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-all bg-white/80 dark:bg-purple-900/20 backdrop-blur-sm text-base text-gray-700 dark:text-white hover:border-purple-500 dark:hover:border-purple-400"
                >
                  <option value="" disabled>Select your status</option>
                  <option value="Student">Student</option>
                  <option value="Employed">Employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className=" text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center transition-colors">
                  Gender
                </label>
                <select
                  value={profileData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-purple-300 dark:border-purple-400/50 rounded-2xl focus:ring-4 focus:ring-purple-200/70 dark:focus:ring-purple-800/50 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-all bg-white/80 dark:bg-purple-900/20 backdrop-blur-sm text-base text-gray-700 dark:text-white hover:border-purple-500 dark:hover:border-purple-400"
                >
                  <option value="" disabled>Select your gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-center mt-10">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="px-12 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 text-white rounded-2xl font-black text-lg hover:scale-110 hover:shadow-3xl transition-all duration-500 shadow-2xl disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-6 w-6 mr-3" />
                    Save Changes ✨
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;