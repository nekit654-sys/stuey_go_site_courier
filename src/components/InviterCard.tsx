import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface InviterCardProps {
  inviterName?: string;
  inviterAvatar?: string;
  inviterCode?: string;
}

export default function InviterCard({ inviterName, inviterAvatar, inviterCode }: InviterCardProps) {
  if (!inviterName) {
    return null;
  }

  return (
    <Card className="bg-white border-3 border-black rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,1)] mb-4 sm:mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex-shrink-0">
            {inviterAvatar ? (
              <img 
                src={inviterAvatar} 
                alt={inviterName}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)]"
              />
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] flex items-center justify-center">
                <Icon name="User" className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="UserPlus" className="h-4 w-4 text-black/70 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-bold text-black/70">Вас пригласил</p>
            </div>
            <p className="text-base sm:text-lg font-extrabold text-black truncate">{inviterName}</p>
            {inviterCode && (
              <p className="text-xs sm:text-sm text-black/60 font-bold">Код: {inviterCode}</p>
            )}
          </div>
          
          <div className="flex-shrink-0">
            <div className="bg-yellow-400 border-2 border-black rounded-xl p-2 sm:p-3 shadow-[0_3px_0_0_rgba(0,0,0,1)]">
              <Icon name="Gift" className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
