import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { getTierColor, getTierBadgeColor } from '@/lib/achievements';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  unlocked: boolean;
  progress: number;
  requirement: number;
}

interface AchievementCategory {
  id: string;
  name: string;
  icon: string;
  achievements: Achievement[];
}

interface AchievementsTabProps {
  achievementCategories: AchievementCategory[];
}

export default function AchievementsTab({ achievementCategories }: AchievementsTabProps) {
  return (
    <div className="space-y-6">
      {achievementCategories.map((category) => (
        <Card key={category.id}>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <Icon name={category.icon as any} className="h-6 w-6" />
              {category.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    achievement.unlocked
                      ? `bg-gradient-to-br ${getTierColor(achievement.tier)} text-white shadow-lg`
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Icon
                      name={achievement.icon as any}
                      className={`h-10 w-10 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}
                    />
                    <Badge className={achievement.unlocked ? 'bg-white/20 text-white border-white/30' : getTierBadgeColor(achievement.tier)}>
                      {achievement.tier}
                    </Badge>
                  </div>
                  <h3 className={`font-bold text-lg mb-1 ${!achievement.unlocked && 'text-gray-700'}`}>
                    {achievement.name}
                  </h3>
                  <p className={`text-sm mb-3 ${achievement.unlocked ? 'text-white/80' : 'text-gray-500'}`}>
                    {achievement.description}
                  </p>
                  {!achievement.unlocked && (
                    <div className="space-y-1">
                      <Progress value={(achievement.progress / achievement.requirement) * 100} className="h-2" />
                      <p className="text-xs text-gray-500">
                        {achievement.progress}/{achievement.requirement}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
