import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Eye, Calendar, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Resume {
  id: string;
  filename: string;
  file_path: string;
  created_at: string;
  parsed_data: any;
  extracted_text: string;
}

const ResumeHistorySection = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user]);

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load resume history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewResume = async (filePath: string, filename: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(filePath);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Create blob URL and open in new tab
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL after a short delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        toast({
          title: "Error",
          description: "Could not download resume file",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to open resume: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Resume History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Resume History ({resumes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {resumes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No resumes uploaded yet</p>
            <p className="text-sm">Your uploaded resumes will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div key={resume.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-2 min-w-0 flex-1">
                    <h4 className="font-medium text-sm sm:text-base break-words">
                      {resume.filename}
                    </h4>
                    <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>Uploaded {formatDistanceToNow(new Date(resume.created_at))} ago</span>
                      </div>
                      {resume.parsed_data?.name && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 flex-shrink-0" />
                          <span className="break-words">{resume.parsed_data.name}</span>
                        </div>
                      )}
                    </div>
                    {resume.parsed_data?.skills && resume.parsed_data.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {resume.parsed_data.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs break-all">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeHistorySection;