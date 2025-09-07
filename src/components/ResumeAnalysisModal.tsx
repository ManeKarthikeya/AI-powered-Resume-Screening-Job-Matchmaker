import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, Target, CheckCircle2, XCircle, Download, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ResumeAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: {
    id: string;
    resume_id: string;
    match_percentage: number;
    ai_summary: string;
    extracted_skills: string[];
    resumes: {
      filename: string;
      parsed_data: any;
      file_path: string;
    };
  job_descriptions: {
    title: string;
    requirements?: any;
  };
  } | null;
}

const ResumeAnalysisModal = ({ isOpen, onClose, analysis }: ResumeAnalysisModalProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'resume'>('overview');

  if (!analysis) return null;

  const candidateName = analysis.resumes?.parsed_data?.name || 'Unknown Candidate';
  const jobRequirements = analysis.job_descriptions?.requirements?.skills || [];
  const candidateSkills = analysis.extracted_skills || [];
  
  // Skills analysis
  const matchingSkills = candidateSkills.filter(skill => 
    jobRequirements.some((req: string) => 
      req.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(req.toLowerCase())
    )
  );
  
  const missingSkills = jobRequirements.filter((req: string) => 
    !candidateSkills.some(skill => 
      skill.toLowerCase().includes(req.toLowerCase()) || 
      req.toLowerCase().includes(skill.toLowerCase())
    )
  );

  const handleViewResume = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(analysis.resumes.file_path);
      
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
      }
    } catch (error) {
      console.error('Error viewing resume:', error);
    }
  };

  const getMatchQualityColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 75) return 'text-blue-600 bg-blue-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {candidateName} - {analysis.job_descriptions?.title}
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === 'overview' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
            className="flex-1"
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'skills' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('skills')}
            className="flex-1"
          >
            Skills Analysis
          </Button>
          <Button
            variant={activeTab === 'resume' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('resume')}
            className="flex-1"
          >
            Resume Details
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Match Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Match Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Overall Match Score</span>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getMatchQualityColor(analysis.match_percentage)}`}>
                      {analysis.match_percentage}% Match
                    </div>
                  </div>
                  <Progress value={analysis.match_percentage} className="h-3 mb-4" />
                  <div className="text-sm text-muted-foreground">
                    Based on comprehensive AI analysis of skills, experience, and job requirements
                  </div>
                </CardContent>
              </Card>

              {/* AI Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{analysis.ai_summary}</p>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{matchingSkills.length}</div>
                    <div className="text-sm text-muted-foreground">Matching Skills</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-destructive mb-1">{missingSkills.length}</div>
                    <div className="text-sm text-muted-foreground">Missing Skills</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-secondary-foreground mb-1">{candidateSkills.length}</div>
                    <div className="text-sm text-muted-foreground">Total Skills</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-6">
              {/* Skills They Have (Matching) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    Skills They Have ({matchingSkills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {matchingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {matchingSkills.map((skill, index) => (
                        <Badge key={index} variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No matching skills found</p>
                  )}
                </CardContent>
              </Card>

              {/* Skills They Don't Have (Missing) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-5 h-5" />
                    Skills They Don't Have ({missingSkills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {missingSkills.map((skill, index) => (
                        <Badge key={index} variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Candidate has all required skills!</p>
                  )}
                </CardContent>
              </Card>

              {/* All Candidate Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>All Candidate Skills ({candidateSkills.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {candidateSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {candidateSkills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No skills extracted</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="space-y-6">
              {/* Resume Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Resume Details</span>
                    <Button onClick={handleViewResume} size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      View Resume
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm font-medium">Filename:</span>
                    <p className="text-sm text-muted-foreground">{analysis.resumes.filename}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Candidate Name:</span>
                    <p className="text-sm text-muted-foreground">{candidateName}</p>
                  </div>
                  {analysis.resumes.parsed_data?.email && (
                    <div>
                      <span className="text-sm font-medium">Email:</span>
                      <p className="text-sm text-muted-foreground">{analysis.resumes.parsed_data.email}</p>
                    </div>
                  )}
                  {analysis.resumes.parsed_data?.phone && (
                    <div>
                      <span className="text-sm font-medium">Phone:</span>
                      <p className="text-sm text-muted-foreground">{analysis.resumes.parsed_data.phone}</p>
                    </div>
                  )}
                  {analysis.resumes.parsed_data?.experience && (
                    <div>
                      <span className="text-sm font-medium">Experience:</span>
                      <p className="text-sm text-muted-foreground">{analysis.resumes.parsed_data.experience}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Job Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium">Position:</span>
                      <p className="text-sm text-muted-foreground">{analysis.job_descriptions.title}</p>
                    </div>
                    {jobRequirements.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Required Skills:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {jobRequirements.map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-sm">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <Separator />
        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeAnalysisModal;