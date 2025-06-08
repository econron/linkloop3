import { Button } from '@/components/ui/Button';

interface UnitCardProps {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'unlocked' | 'completed';
  progress: number;
  onClick: () => void;
}

export const UnitCard = ({
  id,
  title,
  description,
  status,
  progress,
  onClick,
}: UnitCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'unlocked':
        return 'bg-blue-100 text-blue-800';
      case 'locked':
        return 'bg-gray-100 text-black';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'unlocked':
        return '開始';
      case 'locked':
        return 'ロック中';
    }
  };

  return (
    <div className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-black">{title}</h3>
          <p className="mt-1 text-sm text-black">{description}</p>
        </div>
        <span className={`ml-4 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {status !== 'locked' && (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-right text-sm text-black">{progress}%</p>
        </div>
      )}

      <div className="mt-6">
        <Button
          variant={status === 'locked' ? 'outline' : 'primary'}
          size="sm"
          className="w-full"
          onClick={onClick}
          disabled={status === 'locked'}
        >
          {status === 'locked' ? 'ロック中' : status === 'completed' ? '再挑戦' : '開始'}
        </Button>
      </div>
    </div>
  );
}; 