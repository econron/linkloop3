'use client';

interface PhonemeCardProps {
  ipa: string;
  arpabet: string;
  example: string;
  status: 'not_started' | 'in_progress' | 'completed';
  averageScore?: number;
}

export const PhonemeCard = ({
  ipa,
  arpabet,
  example,
  status,
  averageScore,
}: PhonemeCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'in_progress':
        return '練習中';
      case 'not_started':
        return '未開始';
    }
  };

  return (
    <div className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{ipa}</h3>
            <span className="text-base text-gray-500">({arpabet})</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">例: {example}</p>
        </div>
        <span className={`ml-4 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {status !== 'not_started' && averageScore !== undefined && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">平均スコア</span>
            <span className="text-sm font-medium text-gray-900">{averageScore}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${averageScore}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 