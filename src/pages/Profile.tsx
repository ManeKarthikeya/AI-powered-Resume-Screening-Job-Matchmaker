import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Save, Shield, Plus, X, Phone, Link, Github, Code, FileText } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  linkedin_url: string;
  github_url: string;
  leetcode_url: string;
  skills: string[];
  bio: string;
  resume_count: number;
  created_at: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    linkedin_url: '',
    github_url: '',
    leetcode_url: '',
    skills: [] as string[],
    bio: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          email: data.email || user!.email || '',
          phone_number: data.phone_number || '',
          linkedin_url: data.linkedin_url || '',
          github_url: data.github_url || '',
          leetcode_url: data.leetcode_url || '',
          skills: data.skills || [],
          bio: data.bio || ''
        });
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user!.id,
            email: user!.email || '',
            full_name: '',
            phone_number: '',
            linkedin_url: '',
            github_url: '',
            leetcode_url: '',
            skills: [],
            bio: '',
            resume_count: 0
          })
          .select()
          .single();

        if (createError) throw createError;

        setProfile(newProfile);
        setFormData({
          full_name: '',
          email: user!.email || '',
          phone_number: '',
          linkedin_url: '',
          github_url: '',
          leetcode_url: '',
          skills: [],
          bio: ''
        });
      }
      
      // Get resume count
      const { count } = await supabase
        .from('resumes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);
      
      // Update resume count in profile
      if (count !== null) {
        await supabase
          .from('profiles')
          .update({ resume_count: count })
          .eq('user_id', user!.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          email: formData.email,
          phone_number: formData.phone_number,
          linkedin_url: formData.linkedin_url,
          github_url: formData.github_url,
          leetcode_url: formData.leetcode_url,
          skills: formData.skills,
          bio: formData.bio
        })
        .eq('user_id', user!.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      fetchProfile(); // Refresh profile data
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full sm:max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Manage your account information and preferences
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                type="text"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <p className="text-sm text-muted-foreground">
                This is used for account notifications and login
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                placeholder="Tell us about yourself..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
              />
            </div>

            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Professional Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Professional Links
          </CardTitle>
          <CardDescription>
            Add links to your professional profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              LinkedIn Profile
            </Label>
            <Input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/your-profile"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub Profile
            </Label>
            <Input
              id="github"
              type="url"
              placeholder="https://github.com/your-username"
              value={formData.github_url}
              onChange={(e) => setFormData({...formData, github_url: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leetcode" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              LeetCode Profile
            </Label>
            <Input
              id="leetcode"
              type="url"
              placeholder="https://leetcode.com/your-username"
              value={formData.leetcode_url}
              onChange={(e) => setFormData({...formData, leetcode_url: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>
            Add your technical and professional skills
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button type="button" onClick={addSkill} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            View your account status and security information
          </CardDescription>
        </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">User ID</Label>
                <p className="text-sm text-muted-foreground font-mono break-all">
                  {user?.id || 'Not available'}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Account Created</Label>
                <p className="text-sm text-muted-foreground">
                  {profile?.created_at ? formatDate(profile.created_at) : 'Not available'}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Email Verified</Label>
                <p className="text-sm text-muted-foreground">
                  {user?.email_confirmed_at ? 'Verified' : 'Not verified'}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Last Sign In</Label>
                <p className="text-sm text-muted-foreground">
                  {user?.last_sign_in_at 
                    ? formatDate(user.last_sign_in_at) 
                    : 'Not available'
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Resumes Uploaded
                </Label>
                <p className="text-sm text-muted-foreground">
                  {profile?.resume_count || 0} resume{(profile?.resume_count || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

          {!user?.email_confirmed_at && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Email Verification Required
                </p>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Please check your email and click the verification link to fully activate your account.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;