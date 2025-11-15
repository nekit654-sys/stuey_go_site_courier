import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  currentLevel: number;
  cost: number;
}

interface SkillTreeProps {
  courierId: number;
  onClose: () => void;
}

export function SkillTree({ courierId, onClose }: SkillTreeProps) {
  const [skills, setSkills] = useState<Skill[]>([
    { id: 'speed', name: 'Скорость', description: 'Увеличивает скорость передвижения на 10%', icon: '⚡', maxLevel: 5, currentLevel: 0, cost: 1 },
    { id: 'stamina', name: 'Выносливость', description: 'Увеличивает максимальную энергию на 20', icon: '💪', maxLevel: 5, currentLevel: 0, cost: 1 },
    { id: 'earnings', name: 'Доход', description: 'Увеличивает заработок за доставку на 15%', icon: '💰', maxLevel: 5, currentLevel: 0, cost: 1 },
    { id: 'efficiency', name: 'Эффективность', description: 'Снижает расход энергии на 10%', icon: '🔋', maxLevel: 5, currentLevel: 0, cost: 1 },
    { id: 'navigation', name: 'Навигация', description: 'Улучшает GPS и показывает ближайшие заказы', icon: '🗺️', maxLevel: 3, currentLevel: 0, cost: 2 },
    { id: 'reputation', name: 'Репутация', description: 'Привлекает более выгодные заказы', icon: '⭐', maxLevel: 3, currentLevel: 0, cost: 2 },
  ]);
  
  const [availablePoints, setAvailablePoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkills();
  }, [courierId]);

  const loadSkills = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/7f5ddcb0-dc63-46f4-a1a3-f3bbdfbea6b4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_skills',
          courier_id: courierId
        })
      });
      
      const data = await response.json();
      setAvailablePoints(data.available_points);
      
      if (data.skills && data.skills.length > 0) {
        setSkills(prev => prev.map(skill => {
          const serverSkill = data.skills.find((s: any) => s.skill_name === skill.id);
          return serverSkill ? { ...skill, currentLevel: serverSkill.skill_level } : skill;
        }));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load skills:', error);
      setLoading(false);
    }
  };

  const upgradeSkill = async (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill || skill.currentLevel >= skill.maxLevel || availablePoints < skill.cost) {
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/7f5ddcb0-dc63-46f4-a1a3-f3bbdfbea6b4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upgrade_skill',
          courier_id: courierId,
          skill_name: skillId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSkills(prev => prev.map(s => 
          s.id === skillId ? { ...s, currentLevel: s.currentLevel + 1 } : s
        ));
        setAvailablePoints(prev => prev - skill.cost);
        
        (window as any).playSound?.('skillUp');
      }
    } catch (error) {
      console.error('Failed to upgrade skill:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl max-w-2xl w-full border-4 border-yellow-500 shadow-2xl">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-t-xl border-b-4 border-yellow-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <span>🌟</span>
                <span>ДЕРЕВО НАВЫКОВ</span>
              </h2>
              <div className="text-sm font-bold text-white/90">
                Доступно очков: <span className="text-2xl">{availablePoints}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
            >
              <Icon name="X" size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {skills.map(skill => {
            const canUpgrade = skill.currentLevel < skill.maxLevel && availablePoints >= skill.cost;
            const isMaxed = skill.currentLevel >= skill.maxLevel;
            
            return (
              <div
                key={skill.id}
                className={`relative rounded-xl p-4 border-2 transition-all ${
                  isMaxed
                    ? 'bg-gradient-to-br from-green-600 to-green-800 border-green-400'
                    : canUpgrade
                    ? 'bg-gradient-to-br from-blue-600 to-purple-700 border-yellow-400 hover:scale-105 cursor-pointer'
                    : 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 opacity-60'
                }`}
                onClick={() => canUpgrade && upgradeSkill(skill.id)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-4xl">{skill.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{skill.name}</h3>
                    <p className="text-xs text-white/80">{skill.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/90 font-bold">Уровень:</span>
                    <span className="text-yellow-300 font-black">
                      {skill.currentLevel} / {skill.maxLevel}
                    </span>
                  </div>

                  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-500"
                      style={{ width: `${(skill.currentLevel / skill.maxLevel) * 100}%` }}
                    />
                  </div>

                  {!isMaxed && (
                    <div className={`text-center py-1 px-3 rounded-lg font-bold text-sm ${
                      canUpgrade
                        ? 'bg-yellow-400 text-black'
                        : 'bg-gray-600 text-gray-400'
                    }`}>
                      {canUpgrade ? `Улучшить (${skill.cost} очков)` : `Нужно ${skill.cost} очков`}
                    </div>
                  )}

                  {isMaxed && (
                    <div className="text-center py-1 px-3 rounded-lg font-bold text-sm bg-green-400 text-black">
                      ✓ МАКСИМУМ
                    </div>
                  )}
                </div>

                {isMaxed && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full p-1 border-2 border-white">
                    <Icon name="Star" size={20} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-black/30 rounded-b-xl border-t-2 border-yellow-600">
          <div className="text-center text-white/80 text-xs">
            💡 Зарабатывай опыт, повышай уровень и получай очки навыков!
          </div>
        </div>
      </div>
    </div>
  );
}
