import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' });

export class GeminiService {
  async generateQuestions(jd: { title: string; description: string; client: string }, resume: string): Promise<any[]> {
    const prompt = `You are an expert technical interviewer for ${jd.client || 'a technology company'}.

Job Title: ${jd.title}
Job Description: ${jd.description}
Candidate Resume: ${resume}

Generate exactly 5 interview questions tailored to this candidate and role. Questions should be progressive in difficulty.

Return ONLY valid JSON array with this exact structure:
[
  {
    "text": "question text",
    "category": "Technical|Behavioral|Situational|Problem-Solving|Cultural Fit",
    "difficulty": "Easy|Medium|Hard",
    "keywords": ["keyword1", "keyword2"],
    "followUp": "optional follow-up question"
  }
]`;

    const model = genAI.models;
    const response = await model.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });

    const text = response.text ?? '[]';
    return JSON.parse(text);
  }

  async generateInterviewReport(data: {
    jd: { title: string; description: string; client: string };
    candidate: { name: string; email: string };
    questions: any[];
    answerTranscripts: Record<number, string>;
    proctorAlerts: any[];
  }): Promise<any> {
    const questionsWithAnswers = data.questions.map((q, i) => ({
      question: q.text,
      category: q.category,
      answer: data.answerTranscripts[i] || '(no answer recorded)',
      keywords: q.keywords || [],
    }));

    const prompt = `You are evaluating an interview for ${data.candidate.name} for the role of ${data.jd.title} at ${data.jd.client}.

Questions and Answers:
${JSON.stringify(questionsWithAnswers, null, 2)}

Proctoring Alerts: ${data.proctorAlerts.length} total (${data.proctorAlerts.filter(a => a.severity === 'high').length} high severity)

Generate a comprehensive evaluation report. Return ONLY valid JSON with this structure:
{
  "overallScore": 0-100,
  "recommendation": "Strongly Recommended|Recommended|Conditional Pass|Not Recommended",
  "summary": "2-3 sentence executive summary",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "technicalDepth": 0-100,
  "communicationScore": 0-100,
  "confidenceLevel": 0-100,
  "sections": [
    { "label": "Technical Knowledge", "score": 0-100 },
    { "label": "Problem Solving", "score": 0-100 },
    { "label": "Communication", "score": 0-100 },
    { "label": "Cultural Fit", "score": 0-100 },
    { "label": "Video Proctoring", "score": 0-100 }
  ],
  "questionEvaluations": [
    {
      "questionIndex": 0,
      "score": 0-10,
      "feedback": "specific feedback",
      "keywordsUsed": ["keyword"]
    }
  ]
}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });

    const text = response.text ?? '{}';
    return JSON.parse(text);
  }

  async checkJDResumeCompatibility(
    jd: { title: string; description: string; client: string },
    resume: string
  ): Promise<{ compatible: boolean; matchScore: number; reason: string; mismatches: string[] }> {
    const prompt = `You are a senior recruiter. Compare this job description with this candidate resume and assess how well they match.

Job Title: ${jd.title}
Client: ${jd.client}
Job Description:
${jd.description}

Candidate Resume:
${resume || '(no resume provided)'}

Assess the compatibility. A score below 25 means the resume is completely unrelated to the role (e.g. a chef applying for a software engineer role). A score of 25-50 means partial match. Above 50 means reasonable or strong match.

Return ONLY valid JSON:
{
  "matchScore": 0-100,
  "compatible": true or false (false if matchScore < 25),
  "reason": "1-2 sentence explanation of why the resume does or does not match the JD",
  "mismatches": ["specific mismatch 1", "specific mismatch 2"]
}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });

    const text = response.text ?? '{}';
    const result = JSON.parse(text);
    return {
      compatible: result.matchScore >= 25,
      matchScore: result.matchScore ?? 0,
      reason: result.reason ?? 'Could not assess compatibility.',
      mismatches: result.mismatches ?? [],
    };
  }

  async analyzeResumeProfile(candidate: { name: string; resume: string }): Promise<any> {
    const prompt = `Analyze this resume/profile for ${candidate.name}:

${candidate.resume}

Return ONLY valid JSON:
{
  "matchScore": 0-100,
  "experienceYears": number,
  "keySkills": ["skill1", "skill2"],
  "careerProgression": "brief assessment",
  "redFlags": ["flag1"] or [],
  "summary": "2 sentence profile summary"
}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });

    const text = response.text ?? '{}';
    return JSON.parse(text);
  }
}

export const geminiService = new GeminiService();
