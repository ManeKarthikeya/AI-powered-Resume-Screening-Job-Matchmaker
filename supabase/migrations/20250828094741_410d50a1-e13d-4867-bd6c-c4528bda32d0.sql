-- Update existing resumes with varied realistic skills data
UPDATE resumes 
SET parsed_data = CASE 
    WHEN id = (SELECT id FROM resumes ORDER BY created_at DESC LIMIT 1 OFFSET 0) THEN 
        '{"name": "Alex Johnson", "email": "alex.johnson@email.com", "skills": ["JavaScript", "React", "Node.js", "MongoDB", "Express"], "experience": "5 years of professional experience", "education": "Bachelor''s degree in Computer Science", "summary": "Experienced software developer with expertise in JavaScript and React"}'::jsonb
    WHEN id = (SELECT id FROM resumes ORDER BY created_at DESC LIMIT 1 OFFSET 1) THEN 
        '{"name": "Maria Garcia", "email": "maria.garcia@email.com", "skills": ["Python", "Django", "PostgreSQL", "Redis", "Docker"], "experience": "4 years of professional experience", "education": "Bachelor''s degree in Software Engineering", "summary": "Backend developer with expertise in Python and Django"}'::jsonb
    WHEN id = (SELECT id FROM resumes ORDER BY created_at DESC LIMIT 1 OFFSET 2) THEN 
        '{"name": "David Chen", "email": "david.chen@email.com", "skills": ["Java", "Spring Boot", "MySQL", "AWS", "Kubernetes"], "experience": "6 years of professional experience", "education": "Master''s degree in Computer Science", "summary": "Full-stack developer with expertise in Java and AWS"}'::jsonb
    ELSE 
        '{"name": "Sarah Wilson", "email": "sarah.wilson@email.com", "skills": ["TypeScript", "Angular", "GraphQL", "Firebase", "Jest"], "experience": "3 years of professional experience", "education": "Bachelor''s degree in Information Technology", "summary": "Frontend developer with expertise in TypeScript and Angular"}'::jsonb
END
WHERE parsed_data->>'skills' = '["Communication", "Problem Solving", "Teamwork"]' 
   OR parsed_data->'skills' @> '["Communication", "Problem Solving", "Teamwork"]';