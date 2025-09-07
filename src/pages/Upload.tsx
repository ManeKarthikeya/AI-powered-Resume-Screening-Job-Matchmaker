import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload as UploadIcon, FileText, X, CheckCircle } from 'lucide-react';
import ResumeHistorySection from '@/components/ResumeHistorySection';
import { extractFileText } from '@/lib/fileExtraction';

interface UploadedFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  parsedData?: any;
}

const Upload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const isValidType = file.type === 'application/pdf' || 
                         file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                         file.type === 'application/msword';
      
      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a supported format. Please upload PDF or DOCX files.`,
          variant: "destructive"
        });
      }
      return isValidType;
    });

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: 'pending',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Process each file
    newFiles.forEach(uploadFile => {
      processFile(uploadFile);
    });
  };

  const processFile = async (uploadedFile: UploadedFile) => {
    try {
      // Update status to uploading
      updateFileStatus(uploadedFile.id, 'uploading', 25);

      // Upload file to Supabase Storage with unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const fileExtension = uploadedFile.file.name.split('.').pop();
      const uniqueFileName = `${uploadedFile.file.name.replace(/\.[^/.]+$/, "")}_${timestamp}_${randomId}.${fileExtension}`;
      const filePath = `${user!.id}/${uniqueFileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, uploadedFile.file);

      if (uploadError) throw uploadError;

      updateFileStatus(uploadedFile.id, 'uploading', 50);

      // Create resume record in database
      const { data: resumeData, error: dbError } = await supabase
        .from('resumes')
        .insert({
          user_id: user!.id,
          filename: uploadedFile.file.name,
          file_path: filePath,
          extracted_text: '' // Will be updated by processing function
        })
        .select()
        .single();

      if (dbError) throw dbError;

      updateFileStatus(uploadedFile.id, 'processing', 75);

      // Extract actual text from the file
      console.log('Extracting text from file:', uploadedFile.file.name);
      const extractionResult = await extractFileText(uploadedFile.file);
      
      // Only fail if there's an explicit error and no text at all
      if (extractionResult.error && !extractionResult.text.trim()) {
        console.error('Text extraction failed:', extractionResult.error);
        updateFileStatus(uploadedFile.id, 'error', 0, extractionResult.error || 'Failed to extract text from file');
        return;
      }

      console.log('Extracted text length:', extractionResult.text.length);
      
      // Ensure we have some text to process
      const textToProcess = extractionResult.text.trim() || `Resume file: ${uploadedFile.file.name}. Please extract skills and information from this resume document.`;
      
      // Call edge function to process resume with actual text
      const { error: processError } = await supabase.functions.invoke('process-resume', {
        body: {
          resumeText: textToProcess,
          resumeId: resumeData.id,
          fileName: uploadedFile.file.name
        }
      });

      if (processError) {
        console.error('Processing error:', processError);
        updateFileStatus(uploadedFile.id, 'error', 0, 'Failed to process resume');
        return;
      }

      updateFileStatus(uploadedFile.id, 'completed', 100);
      
      toast({
        title: "Success",
        description: `${uploadedFile.file.name} has been processed successfully!`,
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      updateFileStatus(uploadedFile.id, 'error', 0, error.message);
      
      toast({
        title: "Upload Error",
        description: `Failed to upload ${uploadedFile.file.name}: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const updateFileStatus = (id: string, status: UploadedFile['status'], progress: number, error?: string) => {
    setUploadedFiles(prev => prev.map(file => 
      file.id === id 
        ? { ...file, status, progress, error }
        : file
    ));
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'processing': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'uploading': return 'Uploading';
      case 'processing': return 'Processing';
      case 'completed': return 'Completed';
      case 'error': return 'Error';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Upload Resumes</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Upload PDF or DOCX resume files for AI-powered analysis and matching
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Upload Files</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Drag and drop your resume files here or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-base sm:text-lg font-medium">Drop your resume files here</p>
              <p className="text-muted-foreground text-sm sm:text-base">
                Supports PDF and DOCX files up to 10MB each
              </p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                accept=".pdf,.docx,.doc"
                onChange={handleFileSelect}
              />
              <Button asChild variant="outline" className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  Browse Files
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Upload Progress</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Track the processing status of your uploaded files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border rounded-lg">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="font-medium truncate text-sm sm:text-base">{file.file.name}</span>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Badge variant="outline" className={`text-white text-xs ${getStatusColor(file.status)}`}>
                          {getStatusText(file.status)}
                        </Badge>
                        {file.status !== 'completed' && file.status !== 'error' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(file.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                        {file.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    
                    {file.status !== 'completed' && file.status !== 'error' && (
                      <Progress value={file.progress} className="w-full h-2" />
                    )}
                    
                    {file.error && (
                      <p className="text-sm text-red-600 break-words">{file.error}</p>
                    )}
                    
                    <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                      <span>{(file.file.size / 1024 / 1024).toFixed(2)} MB</span>
                      <span>{file.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resume History Section */}
      <ResumeHistorySection />
    </div>
  );
};

export default Upload;