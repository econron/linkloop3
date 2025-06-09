'use client';

interface PhonemeCardProps {
  ipa: string;
  arpabet: string;
  example: string;
  status: 'not_started' | 'in_progress' | 'completed';
  count?: number;
  scoreMode?: number;
}

export const PhonemeCard = ({
  ipa,
  arpabet,
  example,
  status,
  count,
  scoreMode,
}: PhonemeCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'not_started':
        return 'bg-gray-100 text-black';
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
            <h3 className="text-3xl font-bold text-black">{ipa}</h3>
            <span className="text-base text-black">({arpabet})</span>
          </div>
          <p className="mt-1 text-sm text-black">例: {example}</p>
        </div>
      </div>

      {count !== undefined && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-black">発音回数</span>
            <span className={`text-sm ${count > 0 ? 'text-blue-700 font-bold' : 'text-black font-medium'}`}>{count} 回</span>
          </div>
        </div>
      )}
      {scoreMode !== undefined && (
        <div className="mt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-black">最頻スコア</span>
            <span className={`text-sm font-bold ${scoreMode >= 79 ? 'text-green-700' : 'text-red-600'}`}>{scoreMode} 点</span>
          </div>
        </div>
      )}
    </div>
  );
}; 