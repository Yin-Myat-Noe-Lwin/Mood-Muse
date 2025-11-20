
import { useState, useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AvatarUploadProps {
  currentAvatar?: string;
  userInitials: string;
  onAvatarChange?: (avatarUrl: string) => void;
}

const AvatarUpload = ({ currentAvatar, userInitials, onAvatarChange }: AvatarUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update preview
      setPreviewUrl(avatarUrl);
      onAvatarChange?.(avatarUrl);

      toast({
        title: "Avatar updated!",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <Avatar className="w-32 h-32 cursor-pointer shadow-2xl border-4 border-white">
          <AvatarImage src={previewUrl || ''} alt="Profile" className="object-cover" />
          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl font-bold">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        
        <div 
          className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={handleFileSelect}
        >
          {uploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          ) : (
            <Camera className="h-8 w-8 text-white" />
          )}
        </div>
        
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-2 right-2 rounded-full shadow-lg hover:shadow-xl transition-all"
          onClick={handleFileSelect}
          disabled={uploading}
        >
          <Upload className="h-4 w-4" />
        </Button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />
      
      <Button
        variant="outline"
        onClick={handleFileSelect}
        className="flex items-center space-x-2"
        disabled={uploading}
      >
        <Camera className="h-4 w-4" />
        <span>{uploading ? 'Uploading...' : 'Change Avatar'}</span>
      </Button>
    </div>
  );
};

export default AvatarUpload;
