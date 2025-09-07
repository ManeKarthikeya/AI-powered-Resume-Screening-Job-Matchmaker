import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Retry function with exponential backoff
async function retryWithBackoff(fn: () => Promise<Response>, maxRetries = 3, baseDelay = 1000): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fn();
      if (response.ok || response.status !== 429) {
        return response;
      }
      
      if (i === maxRetries - 1) {
        return response; // Return the last response if all retries failed
      }
      
      // Wait with exponential backoff
      const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
      console.log(`Rate limited, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Request failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, resumeId, fileName } = await req.json();
    console.log('Processing resume:', resumeId, 'File:', fileName);
    console.log('Resume text length:', resumeText?.length || 0);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.log('No OpenAI API key found, using demo mode');
      
      // Generate varied demo data based on filename and content
      const skillSets = [
        ["JavaScript", "React", "Node.js", "MongoDB", "Express", "TypeScript"],
        ["Python", "Django", "PostgreSQL", "Redis", "Docker", "AWS"],
        ["Java", "Spring Boot", "MySQL", "Kubernetes", "Git", "Jenkins"],
        ["C#", ".NET", "SQL Server", "Azure", "PowerBI", "Entity Framework"],
        ["PHP", "Laravel", "Vue.js", "MySQL", "Apache", "Linux"],
        ["Go", "Microservices", "Kubernetes", "Docker", "gRPC", "MongoDB"],
        ["Ruby", "Rails", "Sidekiq", "PostgreSQL", "Heroku", "Redis"]
      ];
      
      const experienceWords = ["Senior", "Lead", "Principal", "Junior", "Mid-level"];
      const techWords = ["Full Stack", "Backend", "Frontend", "DevOps", "Mobile", "Data"];
      
      // Try to extract actual name from text or use filename
      let extractedName = "Professional";
      if (resumeText && resumeText.length > 50) {
        // Simple name extraction - look for common patterns
        const nameMatch = resumeText.match(/(?:Name|I am|My name is)\s*:?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i) ||
                         resumeText.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)/m) ||
                         fileName?.match(/([A-Z][a-z]+)/);
        
        if (nameMatch) {
          extractedName = nameMatch[1] || nameMatch[0];
        }
      }
      
      // Enhanced skills extraction from text with comprehensive patterns
      const text = resumeText || '';
      console.log('Processing resume text of length:', text.length);
      
      // If we have actual text, try to extract real information instead of using random data
      if (text.length > 100 && !text.includes('could not be processed')) {
        console.log('Actual resume text detected, extracting real skills...');
      } else {
        console.log('Using demo mode due to text extraction failure or short text');
      }
      
      const skillPatterns = [
        /(?:skills?|technologies?|technical skills?|programming languages?|tools?|expertise)[:.]?\s*([^.!?\n]*)/gi,
        /(?:proficient in|experienced with|knowledge of|familiar with|worked with)[:.]?\s*([^.!?\n]*)/gi,
        /(?:languages?|frameworks?|libraries?|platforms?)[:.]?\s*([^.!?\n]*)/gi,
        /(?:software|applications?|systems?)[:.]?\s*([^.!?\n]*)/gi
      ];

      let extractedSkills = new Set<string>();
      
      // Comprehensive tech skills database with variations
      const commonSkills = [
        // Programming Languages
        'javascript', 'js', 'python', 'java', 'typescript', 'ts', 'c++', 'c#', 'csharp', 'php', 'ruby', 'go', 'golang', 
        'kotlin', 'swift', 'rust', 'scala', 'r', 'matlab', 'perl', 'objective-c',
        // Web Technologies
        'html', 'html5', 'css', 'css3', 'react', 'reactjs', 'vue', 'vuejs', 'angular', 'angularjs', 'svelte', 'jquery',
        'next.js', 'nextjs', 'nuxt.js', 'nuxtjs', 'gatsby', 'webpack', 'vite', 'parcel', 'rollup',
        'sass', 'scss', 'less', 'stylus', 'tailwind', 'bootstrap', 'material-ui', 'chakra-ui',
        // Backend & Frameworks
        'node.js', 'nodejs', 'express', 'expressjs', 'django', 'flask', 'fastapi', 'spring', 'spring boot',
        'laravel', 'symfony', 'rails', 'ruby on rails', 'asp.net', 'nestjs', 'koa', 'hapi',
        // Databases
        'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'mongo', 'redis', 'elasticsearch', 'sqlite',
        'oracle', 'sql server', 'cassandra', 'couchbase', 'dynamodb', 'firebase', 'supabase',
        // Cloud & DevOps
        'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp', 'google cloud', 'heroku',
        'docker', 'kubernetes', 'k8s', 'jenkins', 'gitlab ci', 'github actions', 'travis ci', 'circleci',
        'terraform', 'ansible', 'puppet', 'chef', 'vagrant', 'ci/cd', 'cicd',
        // Tools & Platforms
        'git', 'github', 'gitlab', 'bitbucket', 'svn', 'jira', 'confluence', 'slack', 'teams',
        'trello', 'asana', 'notion', 'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
        // Operating Systems
        'linux', 'ubuntu', 'centos', 'debian', 'redhat', 'windows', 'macos', 'unix',
        // Mobile Development
        'react native', 'flutter', 'ios', 'android', 'swift', 'kotlin', 'xamarin', 'cordova', 'phonegap',
        // Testing
        'jest', 'mocha', 'chai', 'cypress', 'selenium', 'puppeteer', 'testing library', 'junit', 'pytest',
        // Other Technologies
        'api', 'rest', 'restful', 'graphql', 'grpc', 'websocket', 'json', 'xml', 'yaml',
        'microservices', 'serverless', 'lambda', 'functions',
        // Methodologies & Practices
        'agile', 'scrum', 'kanban', 'devops', 'tdd', 'bdd', 'ddd', 'solid', 'design patterns',
        // Data & Analytics
        'machine learning', 'ml', 'deep learning', 'ai', 'artificial intelligence', 'data science',
        'big data', 'hadoop', 'spark', 'kafka', 'tableau', 'power bi', 'excel', 'pandas', 'numpy',
        'tensorflow', 'pytorch', 'scikit-learn', 'jupyter'
      ];

      // Extract skills using patterns with better parsing
      skillPatterns.forEach(pattern => {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          if (match[1]) {
            const skillList = match[1]
              .split(/[,;|&\n]/)
              .map(s => s.trim())
              .filter(s => s.length > 1 && s.length < 50);
            skillList.forEach(skill => {
              const cleanSkill = skill.replace(/[^\w\s+#.-]/g, '').trim().toLowerCase();
              if (cleanSkill.length > 2) {
                extractedSkills.add(cleanSkill);
              }
            });
          }
        }
      });

      // Look for common skills with word boundaries and variations
      commonSkills.forEach(skill => {
        const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (regex.test(text)) {
          extractedSkills.add(skill.toLowerCase());
        }
      });

      // Extract skills from bullet points and structured lists
      const bulletMatches = text.match(/[•▪▫-]\s*([^\n]{2,60})/g) || [];
      bulletMatches.forEach(bullet => {
        const cleanBullet = bullet.replace(/[•▪▫-]\s*/, '').trim();
        commonSkills.forEach(skill => {
          const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
          if (regex.test(cleanBullet)) {
            extractedSkills.add(skill.toLowerCase());
          }
        });
      });

      // Extract skills from section headers like "Technical Skills:", "Programming Languages:", etc.
      const sectionMatches = text.matchAll(/(?:technical skills?|programming languages?|technologies?|tools?|expertise)[:.]?\s*([^.!?\n]{10,300})/gi);
      for (const match of sectionMatches) {
        if (match[1]) {
          const skillsText = match[1];
          const skillList = skillsText.split(/[,;|&\n]/).map(s => s.trim().toLowerCase()).filter(s => s.length > 2 && s.length < 30);
          skillList.forEach(skill => extractedSkills.add(skill));
        }
      }

      // Normalize and clean skills
      const normalizedSkills = new Set<string>();
      extractedSkills.forEach(skill => {
        let normalized = skill.toLowerCase().trim();
        
        // Handle common variations and normalize
        if (normalized.includes('node') && normalized.includes('js')) normalized = 'node.js';
        if (normalized.includes('next') && (normalized.includes('js') || normalized.includes('react'))) normalized = 'next.js';
        if (normalized.includes('react') && normalized.includes('native')) normalized = 'react native';
        if (normalized === 'js') normalized = 'javascript';
        if (normalized === 'ts') normalized = 'typescript';
        if (normalized === 'postgres') normalized = 'postgresql';
        if (normalized === 'mongo') normalized = 'mongodb';
        if (normalized === 'k8s') normalized = 'kubernetes';
        
        if (normalized.length > 2 && normalized.length < 30) {
          normalizedSkills.add(normalized);
        }
      });
      
      const skills = Array.from(normalizedSkills).slice(0, 25); // Increased to 25 skills
      console.log('Extracted and normalized skills from resume:', skills);

      // Extract experience years
      const experiencePatterns = [
        /(\d+)(?:\+)?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi,
        /(?:experience|exp).*?(\d+)(?:\+)?\s*(?:years?|yrs?)/gi,
        /(\d+)(?:\+)?\s*(?:years?|yrs?).*?(?:experience|exp)/gi
      ];

      let experienceYears = 0;
      experiencePatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const years = parseInt(match[1]);
          if (years > experienceYears && years <= 50) { // Reasonable range
            experienceYears = years;
          }
        }
      });

      // Extract education information
      const educationPatterns = [
        /(bachelor'?s?\s*(?:of\s*)?(?:science|arts|engineering|computer\s*science)?)/gi,
        /(master'?s?\s*(?:of\s*)?(?:science|arts|engineering|computer\s*science|business\s*administration)?)/gi,
        /(phd|doctorate|doctoral)/gi,
        /(associate'?s?\s*degree)/gi,
        /(diploma|certificate)/gi
      ];

      let education = [];
      const educationSet = new Set<string>();
      
      educationPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const degree = match[1].trim();
          educationSet.add(degree);
        }
      });

      education = Array.from(educationSet);

      // Use extracted skills if we found enough, otherwise use fallback
      let selectedSkills = skills.length >= 3 ? skills : skillSets[Math.floor(Math.random() * skillSets.length)];
      
      // If we have actual resume text but didn't extract many skills, try matching from skillsets
      if (skills.length < 3 && resumeText && resumeText.length > 100 && !resumeText.includes('could not be processed')) {
        console.log('Attempting enhanced skill extraction from resume text...');
        const foundSkills: string[] = [];
        const allSkills = skillSets.flat();
        
        allSkills.forEach(skill => {
          // More flexible matching - case insensitive and partial matches
          const skillLower = skill.toLowerCase();
          const textLower = resumeText.toLowerCase();
          
          if (textLower.includes(skillLower) || 
              textLower.includes(skillLower.replace(/\./g, '')) || // node.js -> nodejs
              textLower.includes(skillLower.replace(/\s+/g, ''))) { // spring boot -> springboot
            foundSkills.push(skill);
          }
        });
        
        if (foundSkills.length >= 3) {
          selectedSkills = foundSkills.slice(0, 8); // Increased to 8 skills
          console.log('Enhanced extraction found skills:', selectedSkills);
        }
      }
      
      console.log('Final selected skills:', selectedSkills);
      
        const demoData = {
          name: extractedName,
          email: `${extractedName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
          skills: selectedSkills,
          experience_years: experienceYears || 2 + Math.floor(Math.random() * 8),
          education: education.length > 0 ? education : ["Bachelor's degree in Computer Science"],
          experience: `${experienceWords[Math.floor(Math.random() * experienceWords.length)]} ${techWords[Math.floor(Math.random() * techWords.length)]} Developer`,
          summary: `Experienced developer with expertise in ${selectedSkills.slice(0, 2).join(' and ')} and strong problem-solving skills`
        };
        
          const { error } = await supabase
            .from('resumes')
            .update({
              parsed_data: demoData,
              embedding_text: resumeText.substring(0, 8000),
              extracted_text: resumeText.substring(0, 10000)
            })
            .eq('id', resumeId);

      if (error) throw error;

      return new Response(JSON.stringify({ 
        success: true, 
        parsedData: demoData,
        mode: 'demo'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse resume using OpenAI with retry logic
    const parseResponse = await retryWithBackoff(() => 
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
          content: `You are a resume parser. Extract key information from resumes and return JSON with these fields:
              - name: Full name
              - email: Email address
              - phone: Phone number
              - skills: Array of technical skills
              - experience: Years of experience or experience summary
              - experience_years: Number of years of experience (integer)
              - education: Array of education qualifications
              - summary: Brief professional summary
              
              Return only valid JSON, no other text.`
            },
            { role: 'user', content: `Parse this resume:\n\n${resumeText}` }
          ],
          max_tokens: 1000,
          temperature: 0.1
        }),
      })
    );

    if (!parseResponse.ok) {
      const errorText = await parseResponse.text();
      console.error('OpenAI API error:', parseResponse.status, errorText);
      
      if (parseResponse.status === 429) {
        // Rate limited - use demo mode as fallback with content analysis
        console.log('Rate limited, falling back to demo mode');
        
        // Use the same improved logic as the main demo mode
        const skillSets = [
          ["JavaScript", "React", "Node.js", "MongoDB", "Express", "TypeScript"],
          ["Python", "Django", "PostgreSQL", "Redis", "Docker", "AWS"],
          ["Java", "Spring Boot", "MySQL", "Kubernetes", "Git", "Jenkins"],
          ["C#", ".NET", "SQL Server", "Azure", "PowerBI", "Entity Framework"],
          ["PHP", "Laravel", "Vue.js", "MySQL", "Apache", "Linux"],
          ["Go", "Microservices", "Kubernetes", "Docker", "gRPC", "MongoDB"],
          ["Ruby", "Rails", "Sidekiq", "PostgreSQL", "Heroku", "Redis"]
        ];
        
        const experienceWords = ["Senior", "Lead", "Principal", "Junior", "Mid-level"];
        const techWords = ["Full Stack", "Backend", "Frontend", "DevOps", "Mobile", "Data"];
        
        // Try to extract actual name from text or use filename
        let extractedName = "Professional";
        if (resumeText && resumeText.length > 50) {
          const nameMatch = resumeText.match(/(?:Name|I am|My name is)\s*:?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i) ||
                           resumeText.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)/m) ||
                           fileName?.match(/([A-Z][a-z]+)/);
          
          if (nameMatch) {
            extractedName = nameMatch[1] || nameMatch[0];
          }
        }
        
        // Select skills based on content or random
        let selectedSkills = skillSets[Math.floor(Math.random() * skillSets.length)];
        
        // If we have actual resume text, try to match skills from it
        if (resumeText && resumeText.length > 100) {
          const foundSkills: string[] = [];
          const allSkills = skillSets.flat();
          
          allSkills.forEach(skill => {
            if (resumeText.toLowerCase().includes(skill.toLowerCase())) {
              foundSkills.push(skill);
            }
          });
          
          if (foundSkills.length >= 3) {
            selectedSkills = foundSkills.slice(0, 6);
          }
        }
        
        const randomExp = experienceWords[Math.floor(Math.random() * experienceWords.length)];
        const randomTech = techWords[Math.floor(Math.random() * techWords.length)];
        
        const demoData = {
          name: extractedName,
          email: `${extractedName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
          skills: selectedSkills,
          experience_years: 2 + Math.floor(Math.random() * 8),
          experience: `${randomExp} ${randomTech} Developer with ${2 + Math.floor(Math.random() * 8)} years of experience`,
          education: ["Bachelor's degree in Computer Science or related field"],
          summary: `Experienced ${randomTech.toLowerCase()} developer with expertise in ${selectedSkills.slice(0, 2).join(' and ')} and strong problem-solving skills`
        };
        
        const { error } = await supabase
          .from('resumes')
          .update({
            parsed_data: demoData,
            embedding_text: resumeText.substring(0, 8000),
            extracted_text: resumeText.substring(0, 10000)
          })
          .eq('id', resumeId);

        if (error) throw error;

        return new Response(JSON.stringify({ 
          success: true, 
          parsedData: demoData,
          mode: 'demo_fallback'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`OpenAI API error: ${parseResponse.status} ${errorText}`);
    }

    const parseData = await parseResponse.json();
    const parsedContent = parseData.choices[0].message.content;
    
    let parsedData;
    try {
      parsedData = JSON.parse(parsedContent);
      // Ensure experience_years is a number
      if (parsedData.experience_years && typeof parsedData.experience_years === 'string') {
        parsedData.experience_years = parseInt(parsedData.experience_years) || 0;
      }
      // Ensure education is an array
      if (parsedData.education && typeof parsedData.education === 'string') {
        parsedData.education = [parsedData.education];
      }
    } catch (e) {
      console.error('Failed to parse OpenAI response as JSON:', parsedContent);
      throw new Error('Invalid JSON response from AI');
    }

    // Generate embedding with retry logic
    const embeddingText = resumeText.substring(0, 8000); // Limit input size
    const embeddingResponse = await retryWithBackoff(() => 
      fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: embeddingText
        }),
      })
    );

    let embedding;
    if (!embeddingResponse.ok) {
      console.error('Embedding API error:', embeddingResponse.status);
      // Continue without embedding
      embedding = null;
    } else {
      const embeddingData = await embeddingResponse.json();
      embedding = embeddingData.data[0].embedding;
      console.log('Generated embedding with dimensions:', embedding.length);
    }

    // Update resume with parsed data, embedding, and extracted text
    const updateData: any = {
      parsed_data: parsedData,
      embedding_text: embeddingText,
      extracted_text: resumeText.substring(0, 10000) // Store first 10k chars of extracted text
    };

    if (embedding) {
      updateData.embedding = embedding;
    }

    const { error } = await supabase
      .from('resumes')
      .update(updateData)
      .eq('id', resumeId);

    if (error) throw error;

    console.log('Resume processed successfully:', resumeId);
    
    return new Response(JSON.stringify({ 
      success: true, 
      parsedData,
      mode: 'ai'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing resume:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});