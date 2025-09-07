import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker using the latest version and more reliable configuration
if (typeof window !== 'undefined') {
  // Use the same version as imported to avoid conflicts
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

export interface ExtractedData {
  text: string;
  error?: string;
}

/**
 * Extract text from PDF file
 */
export async function extractPdfText(file: File): Promise<ExtractedData> {
  try {
    console.log('Starting PDF text extraction for:', file.name, 'Size:', file.size);
    
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('File loaded into memory, size:', arrayBuffer.byteLength);
    
    // Configure PDF.js with simplified but effective settings
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer, // Use arrayBuffer directly
      verbosity: 0,
      disableFontFace: true,
      useSystemFonts: true,
      disableAutoFetch: false,
      disableStream: false,
      disableRange: false
    });
    
    console.log('Loading PDF document...');
    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    
    let fullText = '';
    let totalChars = 0;

    // Extract text from each page with better error handling
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        console.log(`Processing page ${pageNum}/${pdf.numPages}`);
        const page = await pdf.getPage(pageNum);
        
        // Get text content with simpler configuration
        const textContent = await page.getTextContent();
        
        // Extract text with better spacing logic
        let pageText = '';
        let lastY = null;
        
        for (const item of textContent.items) {
          // Type guard to ensure we're working with TextItem
          if ('str' in item && item.str && typeof item.str === 'string') {
            const text = item.str.trim();
            if (text) {
              // Detect new lines based on Y coordinate changes
              if (lastY !== null && 'transform' in item && item.transform && 
                  Math.abs(lastY - item.transform[5]) > 3) {
                pageText += '\n';
              } else if (pageText && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
                // Add space between words on the same line
                pageText += ' ';
              }
              
              pageText += text;
              
              if ('transform' in item && item.transform) {
                lastY = item.transform[5];
              }
            }
          }
        }
        
        if (pageText.trim()) {
          fullText += pageText.trim() + '\n\n';
          totalChars += pageText.length;
          console.log(`Page ${pageNum}: extracted ${pageText.length} characters`);
        } else {
          console.warn(`Page ${pageNum}: no text extracted`);
        }
        
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }

    console.log(`PDF text extraction completed. Total characters: ${totalChars}`);
    
    const extractedText = fullText.trim();
    
    // Check if we got meaningful text - be more lenient
    if (extractedText.length < 10) {
      console.warn('Very little text extracted, might be image-based PDF');
      return {
        text: `PDF Document: ${file.name}\nThis appears to be an image-based PDF with minimal text content. If this is a valid resume, please try converting it to a text-based PDF format.`,
        error: 'minimal_text_extracted'
      };
    }
    
    // Clean up the text a bit
    const cleanedText = extractedText
      .replace(/\n{3,}/g, '\n\n')  // Replace multiple newlines with double newlines
      .replace(/\s{2,}/g, ' ')     // Replace multiple spaces with single space
      .trim();
    
    return {
      text: cleanedText
    };
    
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    
    // Provide more specific error information
    let errorMessage = `PDF Document: ${file.name}\n`;
    
    if (error.message?.includes('Invalid PDF')) {
      errorMessage += 'This file appears to be corrupted or is not a valid PDF document.';
    } else if (error.message?.includes('Password')) {
      errorMessage += 'This PDF is password protected and cannot be processed.';
    } else {
      errorMessage += 'This PDF could not be processed for text extraction. It may be image-based, encrypted, or have an unsupported format.';
    }
    
    return {
      text: errorMessage,
      error: error.message
    };
  }
}

/**
 * Extract text from DOCX file
 */
export async function extractDocxText(file: File): Promise<ExtractedData> {
  try {
    console.log('Starting DOCX text extraction...');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    console.log('DOCX text extraction completed, length:', result.value.length);
    
    return {
      text: result.value.trim()
    };
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    
    // Fallback for DOCX files
    return {
      text: `Word Document: ${file.name}\nThis is a Word resume document that could not be fully parsed. Please analyze this as a resume document.`,
      error: undefined
    };
  }
}

/**
 * Extract text from DOC file (legacy format)
 */
export async function extractDocText(file: File): Promise<ExtractedData> {
  try {
    console.log('Starting DOC text extraction...');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    console.log('DOC text extraction completed, length:', result.value.length);
    
    return {
      text: result.value.trim()
    };
  } catch (error) {
    console.error('Error extracting DOC text:', error);
    
    // Fallback for DOC files  
    return {
      text: `Word Document: ${file.name}\nThis is a Word resume document that could not be fully parsed. Please analyze this as a resume document.`,
      error: undefined
    };
  }
}

/**
 * Extract text from any supported file type
 */
export async function extractFileText(file: File): Promise<ExtractedData> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  // Check file type and extract accordingly
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return extractPdfText(file);
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
    return extractDocxText(file);
  } else if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
    return extractDocText(file);
  } else {
    return {
      text: '',
      error: `Unsupported file type: ${fileType || 'unknown'}`
    };
  }
}