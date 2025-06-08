import { FeedbackSection } from '@/types/pronunciation';

interface PronunciationFeedbackProps {
  sections: FeedbackSection[];
  className?: string;
}

export function PronunciationFeedback({ sections, className = '' }: PronunciationFeedbackProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {sections.map((section, index) => (
        <div key={index} className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {section.title}
          </h3>
          <div className="prose dark:prose-invert max-w-none">
            {section.content.split('\n').map((paragraph, pIndex) => (
              <p key={pIndex} className="text-gray-700 dark:text-gray-300">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 