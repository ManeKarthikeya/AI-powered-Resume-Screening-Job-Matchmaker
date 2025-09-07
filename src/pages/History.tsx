import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { History as HistoryIcon, Calendar, FileText, Users, Download } from 'lucide-react';

interface SearchHistory {
  id: string;
  total_resumes: number;
  top_matches: any;
  created_at: string;
  job_descriptions: {
    title: string;
    description: string;
  };
}

const History = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSearchHistory();
    }
  }, [user]);

  const fetchSearchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select(`
          *,
          job_descriptions(title, description)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSearchHistory(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load search history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMatchQuality = (matches: any) => {
    const matchArray = Array.isArray(matches) ? matches : [];
    if (matchArray.length === 0) return 'No matches';
    
    const avgMatch = matchArray.reduce((sum, match) => sum + (match.match_percentage || 0), 0) / matchArray.length;
    
    if (avgMatch >= 80) return 'Excellent';
    if (avgMatch >= 60) return 'Good';
    if (avgMatch >= 40) return 'Fair';
    return 'Poor';
  };

  const getMatchQualityColor = (matches: any) => {
    const matchArray = Array.isArray(matches) ? matches : [];
    if (matchArray.length === 0) return 'secondary';
    
    const avgMatch = matchArray.reduce((sum, match) => sum + (match.match_percentage || 0), 0) / matchArray.length;
    
    if (avgMatch >= 80) return 'default'; // Green
    if (avgMatch >= 60) return 'secondary'; // Blue
    if (avgMatch >= 40) return 'outline'; // Yellow
    return 'destructive'; // Red
  };

  const exportSearchHistory = async (search: SearchHistory) => {
    try {
      const exportData = (search.top_matches || []).map((match: any) => ({
        'Job Title': search.job_descriptions?.title || 'Unknown Job',
        'Candidate Name': match.candidate_name || 'Unknown',
        'Filename': match.filename || '',
        'Match %': match.match_percentage || 0,
        'Skills': (match.extracted_skills || []).join('; '),
        'AI Summary': match.ai_summary || ''
      }));
      
      if (exportData.length === 0) {
        toast({
          title: "No Data",
          description: "No matches found to export",
          variant: "destructive"
        });
        return;
      }

      const csvHeaders = Object.keys(exportData[0]);
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
      link.download = `search_history_${search.job_descriptions?.title || 'results'}.csv`;
      link.click();

      toast({
        title: "Success",
        description: "Search history exported successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to export search history",
        variant: "destructive"
      });
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
      <div>
        <h1 className="text-3xl font-bold">Search History</h1>
        <p className="text-muted-foreground mt-2">
          Review your past resume matching results and job searches
        </p>
      </div>

      {searchHistory.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <HistoryIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Search History</h3>
            <p className="text-muted-foreground mb-4">
              Your resume matching history will appear here after you run your first job match
            </p>
            <Button onClick={() => window.location.href = '/jobs'}>
              Start Matching Resumes
            </Button>
          </CardContent>
        </Card>
      ) : (
                <div className="space-y-4">
              {searchHistory.map((search) => (
                <Card key={search.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="space-y-2">
                        <CardTitle className="text-lg sm:text-xl">
                          {search.job_descriptions?.title || 'Unknown Job'}
                        </CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-4 w-4" />
                          {formatDate(search.created_at)}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Badge variant={getMatchQualityColor(search.top_matches)} className="w-fit">
                          {getMatchQuality(search.top_matches)} Matches
                        </Badge>
                        <Badge variant="outline" className="w-fit">
                          {search.total_resumes} Resumes
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-2 w-fit"
                          onClick={() => exportSearchHistory(search)}
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {search.job_descriptions?.description && (
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          <strong>Job Description:</strong> {search.job_descriptions.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <strong>{search.total_resumes}</strong> resumes analyzed
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <strong>{search.top_matches?.length || 0}</strong> quality matches found
                        </span>
                      </div>
                    </div>

                    {search.top_matches && search.top_matches.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 text-primary">All Matching Candidates:</h4>
                        <div className="space-y-3">
                          {search.top_matches.map((match: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border">
                              <div className="space-y-1">
                                <p className="font-medium text-sm">
                                  {match.candidate_name || 'Unknown Candidate'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Resume: {match.filename}
                                </p>
                                <p className="text-xs text-primary font-medium">
                                  100% Accurate Analysis
                                </p>
                                {match.extracted_skills && match.extracted_skills.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {match.extracted_skills.slice(0, 5).map((skill: string, skillIndex: number) => (
                                      <Badge key={skillIndex} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {match.extracted_skills.length > 5 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{match.extracted_skills.length - 5} more skills
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">
                                  {match.match_percentage || 0}%
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Match Score
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
      )}
    </div>
  );
};

export default History;