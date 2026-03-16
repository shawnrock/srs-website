export interface Question {
  text: string;
  category: string;
  keywords?: string[];
  difficulty?: string;
}

export interface ScoreResult {
  questionIndex: number;
  questionCategory: string;
  score: number;
  confidence: number;
  keywordsExpected: string[];
  keywordsHit: string[];
  keywordsCount: string;
  fluency: 'High' | 'Medium' | 'Low';
  wordCount: number;
}

export class ScoringEngine {
  private questions: Question[];

  constructor(questions: Question[]) {
    this.questions = questions;
  }

  scoreAnswer(questionIndex: number, answerText: string): ScoreResult | null {
    const q = this.questions[questionIndex];
    if (!q || !answerText) return null;
    const lower = answerText.toLowerCase();

    const keywords = q.keywords || [];
    const keywordsHit = keywords.filter(kw => lower.includes(kw.toLowerCase()));
    const keywordScore = keywords.length > 0 ? (keywordsHit.length / keywords.length) * 10 : 5;

    const wordCount = answerText.split(/\s+/).length;
    const depthScore = Math.min(wordCount / 50, 1) * 10;

    const sentences = answerText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLen = sentences.reduce((a, s) => a + s.trim().split(/\s+/).length, 0) / Math.max(sentences.length, 1);
    const fluency: 'High' | 'Medium' | 'Low' = avgSentenceLen > 5 && avgSentenceLen < 25 ? 'High' : avgSentenceLen >= 25 ? 'Medium' : 'Low';

    const confidentPhrases = ['i led', 'i managed', 'i configured', 'i implemented', 'i designed', 'i resolved', 'we achieved', 'resulted in', 'successfully'];
    const confidentHits = confidentPhrases.filter(p => lower.includes(p)).length;
    const confidence = Math.min(50 + confidentHits * 10, 98);

    const rawScore = (keywordScore * 0.4) + (depthScore * 0.35) + (confidentHits * 0.5);
    const finalScore = Math.min(Math.max(Math.round(rawScore * 10) / 10, 1), 10);

    return {
      questionIndex,
      questionCategory: q.category,
      score: finalScore,
      confidence,
      keywordsExpected: keywords,
      keywordsHit,
      keywordsCount: `${keywordsHit.length}/${keywords.length}`,
      fluency,
      wordCount,
    };
  }

  scoreAllAnswers(answerTranscripts: Record<number, string>): Record<number, ScoreResult | null> {
    const results: Record<number, ScoreResult | null> = {};
    for (const [qi, text] of Object.entries(answerTranscripts)) {
      const idx = parseInt(qi);
      if (text && text.trim()) {
        results[idx] = this.scoreAnswer(idx, text.trim());
      }
    }
    return results;
  }
}
