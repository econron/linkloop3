import { PrismaClient } from '@prisma/client';
import { PHONEME_ADVICE, HABIT_ADVICE, GENERAL_ADVICE } from './adviceKnowledgeBase';

const prisma = new PrismaClient();

interface FeedbackOptions {
  focusOn?: string[];
  includeGeneralAdvice?: boolean;
}

interface FeedbackSection {
  title: string;
  content: string[];
}

export async function generatePersonalizedFeedback(
  analysisId: number,
  options: FeedbackOptions = {}
): Promise<string> {
  // 分析データの取得
  const analysis = await prisma.pronunciationAnalysis.findUnique({
    where: { id: analysisId },
    include: {
      findings: true,
      unit: true,
    },
  });

  if (!analysis) {
    throw new Error('Analysis not found');
  }

  const feedbackSections: FeedbackSection[] = [];

  // 1. 全体的なスコアのフィードバック
  if (options.includeGeneralAdvice) {
    feedbackSections.push(generateOverallScoreFeedback(analysis));
  }

  // 2. エラーのフィードバック
  const errorFindings = analysis.findings.filter(f => f.type === 'ERROR');
  if (errorFindings.length > 0) {
    feedbackSections.push(generateErrorFeedback(errorFindings));
  }

  // 3. 癖のフィードバック
  const habitFindings = analysis.findings.filter(f => f.type === 'HABIT');
  if (habitFindings.length > 0) {
    feedbackSections.push(generateHabitFeedback(habitFindings));
  }

  // 4. ユニット固有のフィードバック
  if (analysis.unit.metadata) {
    const unitMetadata = JSON.parse(analysis.unit.metadata);
    if (unitMetadata.focus_phonemes) {
      feedbackSections.push(generateUnitSpecificFeedback(unitMetadata.focus_phonemes, analysis.findings));
    }
  }

  // フィードバックの組み立て
  return formatFeedback(feedbackSections);
}

function generateOverallScoreFeedback(analysis: any): FeedbackSection {
  const content: string[] = [];
  
  if (analysis.accuracyScore < 70) {
    content.push(GENERAL_ADVICE.lowAccuracy);
  }
  if (analysis.fluencyScore < 70) {
    content.push(GENERAL_ADVICE.lowFluency);
  }
  if (analysis.prosodyScore < 70) {
    content.push(GENERAL_ADVICE.lowProsody);
  }

  return {
    title: '全体的な評価',
    content: content.length > 0 ? content : ['全体的に良い発音です。引き続き練習を続けましょう。']
  };
}

function generateErrorFeedback(findings: any[]): FeedbackSection {
  const content: string[] = [];
  
  for (const finding of findings) {
    const details = JSON.parse(finding.details);
    const advice = PHONEME_ADVICE[finding.phoneme];
    
    if (advice) {
      content.push(`${finding.phoneme}音の発音について：`);
      content.push(advice.description);
      content.push('改善のポイント：');
      content.push(...advice.tips.map(tip => `・${tip}`));
      content.push('練習単語：' + advice.practiceWords.join(', '));
    }
  }

  return {
    title: '発音の修正点',
    content: content.length > 0 ? content : ['特に修正が必要な点はありません。']
  };
}

function generateHabitFeedback(findings: any[]): FeedbackSection {
  const content: string[] = [];
  
  for (const finding of findings) {
    const details = JSON.parse(finding.details);
    const habitKey = `${finding.phoneme}-${details.confusedWith}`;
    const advice = HABIT_ADVICE[habitKey];
    
    if (advice) {
      content.push(advice.description);
      content.push('改善のためのアドバイス：');
      content.push(...advice.improvementTips.map(tip => `・${tip}`));
      content.push('推奨される練習：');
      content.push(...advice.practiceExercises.map(ex => `・${ex}`));
    }
  }

  return {
    title: '発音の癖について',
    content: content.length > 0 ? content : ['特に注意が必要な癖は見られません。']
  };
}

function generateUnitSpecificFeedback(focusPhonemes: string[], findings: any[]): FeedbackSection {
  const content: string[] = [];
  const relevantFindings = findings.filter(f => focusPhonemes.includes(f.phoneme));
  
  if (relevantFindings.length > 0) {
    content.push('このユニットの重点音素について：');
    for (const finding of relevantFindings) {
      const advice = PHONEME_ADVICE[finding.phoneme];
      if (advice) {
        content.push(`${finding.phoneme}音：${advice.description}`);
      }
    }
  }

  return {
    title: 'ユニットの重点音素',
    content: content.length > 0 ? content : ['重点音素は良好に発音できています。']
  };
}

function formatFeedback(sections: FeedbackSection[]): string {
  return sections
    .map(section => `【${section.title}】\n${section.content.join('\n')}`)
    .join('\n\n');
} 