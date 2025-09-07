import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Briefcase, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface JobDescription {
  id: string;
  title: string;
  description: string;
  requirements: any;
  created_at: string;
  _count?: {
    resume_analyses: number;
  };
}

const Jobs = () => {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    requirements: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_descriptions')
        .select(`
          *,
          resume_analyses(count)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load job descriptions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Parse requirements from text
      const requirements = {
        skills: newJob.requirements.split(',').map(s => s.trim()).filter(s => s),
        description: newJob.description
      };

      // Create job description
      const { data: jobData, error: jobError } = await supabase
        .from('job_descriptions')
        .insert({
          user_id: user!.id,
          title: newJob.title,
          description: newJob.description,
          requirements: requirements,
          embedding_text: (newJob.title + ' ' + newJob.description).substring(0, 8000)
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Generate embedding for job description using edge function
      try {
        const embeddingText = newJob.title + '\n' + newJob.description;
        
        const { data: embeddingResult, error: embeddingError } = await supabase.functions.invoke('generate-job-embedding', {
          body: { 
            jobId: jobData.id,
            embeddingText: embeddingText.substring(0, 8000)
          }
        });

        if (embeddingError) {
          console.error('Error generating job embedding:', embeddingError);
          // Continue without embedding - the matching function will generate it later
        } else {
          console.log('Job embedding generated successfully');
        }
      } catch (embeddingError) {
        console.error('Failed to generate job embedding:', embeddingError);
        // Continue without embedding
      }

      toast({
        title: "Success",
        description: "Job description created successfully!",
      });

      setNewJob({ title: '', description: '', requirements: '' });
      setIsCreating(false);
      fetchJobs();

    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to create job description: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleMatchResumes = async (jobId: string, jobTitle: string) => {
    try {
      setProcessing(true);
      
      const { data, error } = await supabase.functions.invoke('match-resumes', {
        body: {
          jobDescriptionId: jobId,
          userId: user!.id
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Found ${data.matches?.length || 0} matching resumes for ${jobTitle}`,
      });

      // Navigate to results or dashboard
      navigate('/dashboard');

    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to match resumes: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Job Descriptions</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Create and manage job descriptions for resume matching
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating} size="sm" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          New Job Description
        </Button>
      </div>

      {/* Create Job Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Job Description</CardTitle>
            <CardDescription>
              Add a new job description for AI-powered resume matching
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-title">Job Title</Label>
                <Input
                  id="job-title"
                  placeholder="e.g., Senior Frontend Developer"
                  value={newJob.title}
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-description">Job Description</Label>
                <Textarea
                  id="job-description"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-requirements">Key Skills & Requirements</Label>
                <Input
                  id="job-requirements"
                  placeholder="React, TypeScript, Node.js, 5+ years experience"
                  value={newJob.requirements}
                  onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                />
                <p className="text-sm text-muted-foreground">
                  Separate skills and requirements with commas
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={processing}>
                  {processing ? 'Creating...' : 'Create Job Description'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreating(false)}
                  disabled={processing}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Job Descriptions List */}
      <div className="grid gap-6">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Job Descriptions</h3>
              <p className="text-muted-foreground mb-4">
                Create your first job description to start matching resumes
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Job Description
              </Button>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <CardDescription>
                      Created on {new Date(job.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => handleMatchResumes(job.id, job.title)}
                    disabled={processing}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {processing ? 'Matching...' : 'Match Resumes'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed">{job.description}</p>
                
                {job.requirements?.skills && job.requirements.skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Required Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {job.requirements.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-1 h-4 w-4" />
                  <span>
                    {job._count?.resume_analyses || 0} resumes analyzed
                  </span>
                </div> */}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Jobs;