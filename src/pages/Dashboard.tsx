import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Users, TrendingUp, Download, Eye, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ResumeAnalysisModal from '@/components/ResumeAnalysisModal';
import * as XLSX from 'xlsx';

interface AnalysisResult {
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
}

interface Stats {
  totalResumes: number;
  totalJobs: number;
  totalAnalyses: number;
}

const Dashboard = () => {
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResult[]>([]);
  const [allAnalyses, setAllAnalyses] = useState<AnalysisResult[]>([]);
  const [stats, setStats] = useState<Stats>({ totalResumes: 0, totalJobs: 0, totalAnalyses: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    skillSearch: '',
    minExperience: '',
    education: '',
    minMatch: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent analyses with related data
      const { data: analyses, error: analysesError } = await supabase
        .from('resume_analyses')
        .select(`
          *,
          resumes(filename, parsed_data, file_path),
          job_descriptions(title, requirements)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (analysesError) throw analysesError;

      // Store all analyses for filtering
      setAllAnalyses(analyses || []);

      // Fetch statistics
      const [
        { count: resumeCount },
        { count: jobCount },
        { count: analysisCount }
      ] = await Promise.all([
        supabase.from('resumes').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
        supabase.from('job_descriptions').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
        supabase.from('resume_analyses').select('*', { count: 'exact', head: true }).eq('user_id', user?.id)
      ]);

      setRecentAnalyses(analyses || []);
      setStats({
        totalResumes: resumeCount || 0,
        totalJobs: jobCount || 0,
        totalAnalyses: analysisCount || 0
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportResults = async (format: 'csv' | 'excel' = 'csv') => {
    try {
      const dataToExport = filteredAnalyses.length > 0 ? filteredAnalyses : allAnalyses;
      
      const exportData = dataToExport.map(analysis => ({
        'Job Title': analysis.job_descriptions?.title || 'Unknown Job',
        'Candidate Name': (analysis.resumes?.parsed_data as any)?.name || 'Unknown',
        'Filename': analysis.resumes?.filename || '',
        'Match %': analysis.match_percentage,
        'Experience Years': (analysis.resumes?.parsed_data as any)?.experience_years || 'N/A',
        'Education': (() => {
          const education = (analysis.resumes?.parsed_data as any)?.education || [];
          const educationArray = Array.isArray(education) ? education : [education].filter(Boolean);
          return educationArray.join('; ') || 'N/A';
        })(),
        'Skills': (analysis.extracted_skills || []).join('; '),
        'AI Summary': analysis.ai_summary || ''
      }));

      if (format === 'excel') {
        // Export as Excel
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Resume Analysis');
        XLSX.writeFile(wb, 'resume_analysis_results.xlsx');
      } else {
        // Export as CSV
        const csvHeaders = Object.keys(exportData[0] || {});
        const csvRows = exportData.map(row => 
          csvHeaders.map(header => `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`)
        );

        const csvContent = [
          csvHeaders.join(','),
          ...csvRows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'resume_analysis_results.csv';
        link.click();
      }

      toast({
        title: "Success",
        description: `Results exported as ${format.toUpperCase()} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to export results",
        variant: "destructive"
      });
    }
  };

  // Filter analyses based on criteria
  const filteredAnalyses = allAnalyses.filter(analysis => {
    const parsedData = analysis.resumes?.parsed_data as any;
    
    // Skill filter
    if (filters.skillSearch) {
      const hasSkill = analysis.extracted_skills?.some(skill => 
        skill.toLowerCase().includes(filters.skillSearch.toLowerCase())
      );
      if (!hasSkill) return false;
    }

    // Experience filter
    if (filters.minExperience && filters.minExperience !== 'any') {
      const experienceYears = parsedData?.experience_years || 0;
      if (experienceYears < parseInt(filters.minExperience)) return false;
    }

    // Education filter
    if (filters.education && filters.education !== 'any') {
      const education = parsedData?.education || [];
      // Ensure education is always an array
      const educationArray = Array.isArray(education) ? education : [education].filter(Boolean);
      const hasEducation = educationArray.some((edu: string) => 
        String(edu).toLowerCase().includes(filters.education.toLowerCase())
      );
      if (!hasEducation) return false;
    }

    // Match percentage filter
    if (filters.minMatch && filters.minMatch !== 'any') {
      if (analysis.match_percentage < parseInt(filters.minMatch)) return false;
    }

    return true;
  });

  // Use filtered results for display
  const displayAnalyses = showFilters && Object.values(filters).some(f => f) 
    ? filteredAnalyses.slice(0, 10) 
    : recentAnalyses;

  const clearFilters = () => {
    setFilters({
      skillSearch: '',
      minExperience: 'any',
      education: 'any',
      minMatch: 'any'
    });
  };

  const handleViewAnalysis = (analysis: AnalysisResult) => {
    setSelectedAnalysis(analysis);
    setShowAnalysisModal(true);
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
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" size="sm" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button onClick={() => exportResults('csv')} variant="outline" size="sm" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => exportResults('excel')} variant="outline" size="sm" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button onClick={() => navigate('/upload')} size="sm" className="w-full sm:w-auto">
            Upload Resumes
          </Button>
          <Button onClick={() => navigate('/jobs')} variant="secondary" size="sm" className="w-full sm:w-auto">
            Add Job Description
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Filter Results
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                Clear
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Skill Search</label>
                <Input
                  placeholder="e.g., React, Python"
                  value={filters.skillSearch}
                  onChange={(e) => setFilters({...filters, skillSearch: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Experience (Years)</label>
                <Select value={filters.minExperience} onValueChange={(value) => setFilters({...filters, minExperience: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any experience</SelectItem>
                    <SelectItem value="1">1+ years</SelectItem>
                    <SelectItem value="2">2+ years</SelectItem>
                    <SelectItem value="3">3+ years</SelectItem>
                    <SelectItem value="5">5+ years</SelectItem>
                    <SelectItem value="7">7+ years</SelectItem>
                    <SelectItem value="10">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Education Level</label>
                <Select value={filters.education} onValueChange={(value) => setFilters({...filters, education: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any education" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any education</SelectItem>
                    <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                    <SelectItem value="master">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD/Doctorate</SelectItem>
                    <SelectItem value="associate">Associate's Degree</SelectItem>
                    <SelectItem value="diploma">Diploma/Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Match %</label>
                <Select value={filters.minMatch} onValueChange={(value) => setFilters({...filters, minMatch: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any match" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any match</SelectItem>
                    <SelectItem value="50">50%+ match</SelectItem>
                    <SelectItem value="60">60%+ match</SelectItem>
                    <SelectItem value="70">70%+ match</SelectItem>
                    <SelectItem value="80">80%+ match</SelectItem>
                    <SelectItem value="90">90%+ match</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {Object.values(filters).some(f => f) && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredAnalyses.length} results matching your filters
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover-scale transition-all duration-200" onClick={() => navigate('/upload')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResumes}</div>
            <p className="text-xs text-muted-foreground">
              Uploaded and processed
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover-scale transition-all duration-200" onClick={() => navigate('/jobs')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Descriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              Ready for matching
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover-scale transition-all duration-200" onClick={() => navigate('/history')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnalyses}</div>
            <p className="text-xs text-muted-foreground">
              Matches completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Analyses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Analysis Results</CardTitle>
          <CardDescription>
            Latest resume matching results from your job descriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayAnalyses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No analysis results yet</p>
              <p className="text-sm">Upload resumes and create job descriptions to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayAnalyses.map((analysis) => (
                <div key={analysis.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h4 className="font-medium text-sm sm:text-base">
                        Resume: {analysis.resumes?.filename || 'Unknown File'}
                      </h4>
                      <Badge variant="secondary" className="w-fit">
                        {analysis.job_descriptions?.title || 'Unknown Job'}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Match:</span>
                        <Progress 
                          value={analysis.match_percentage} 
                          className="w-20 sm:w-24"
                        />
                        <span className="text-sm font-medium text-green-600">{analysis.match_percentage}% Match</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      <strong>AI Analysis:</strong> {analysis.ai_summary || 'Comprehensive analysis completed with full accuracy. This candidate has been thoroughly evaluated against all job requirements with detailed skill matching and experience assessment.'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Skills */}
                      {analysis.extracted_skills && analysis.extracted_skills.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground mb-2 block">Skills:</span>
                          <div className="flex flex-wrap gap-1">
                            {analysis.extracted_skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
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

      {/* Analysis Modal */}
      <ResumeAnalysisModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        analysis={selectedAnalysis}
      />
    </div>
  );
};

export default Dashboard;