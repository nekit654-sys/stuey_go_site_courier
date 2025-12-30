import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { TapButton } from '@/components/tapper-game/TapButton';
import { StatsPanel } from '@/components/tapper-game/StatsPanel';
import { UpgradesModal } from '@/components/tapper-game/UpgradesModal';
import { LeaderboardModal } from '@/components/tapper-game/LeaderboardModal';
import { AchievementsModal } from '@/components/tapper-game/AchievementsModal';
import Icon from '@/components/ui/icon';
import { motion } from 'framer-motion';

const API_URL = 'https://functions.poehali.dev/c28393b1-a89b-4ce1-8fd8-8e9e4838a8e2';

interface Profile {
  id: number;
  user_id: number;
  coins: number;
  total_taps: number;
  coins_per_tap: number;
  energy: number;
  max_energy: number;
  energy_recharge_rate: number;
  level: number;
  experience: number;
}

interface Upgrade {
  id: number;
  code: string;
  name: string;
  description: string;
  type: string;
  icon: string;
  player_level: number;
  max_level: number;
  current_cost: number;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  reward_coins: number;
  earned: boolean;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  coins: number;
  level: number;
}

export default function TapperGame() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [upgrades, setUpgrades] = useState<Upgrade[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgrades, setShowUpgrades] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const res = await fetch(`${API_URL}?action=profile`, {
        headers: { 'X-User-Id': user.id.toString() }
      });
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Ошибка загрузки профиля');
    }
  }, [user?.id]);

  const fetchUpgrades = useCallback(async () => {
    if (!user?.id) return;

    try {
      const res = await fetch(`${API_URL}?action=upgrades`, {
        headers: { 'X-User-Id': user.id.toString() }
      });
      const data = await res.json();
      setUpgrades(data);
    } catch (error) {
      console.error('Error fetching upgrades:', error);
    }
  }, [user?.id]);

  const fetchAchievements = useCallback(async () => {
    if (!user?.id) return;

    try {
      const res = await fetch(`${API_URL}?action=achievements`, {
        headers: { 'X-User-Id': user.id.toString() }
      });
      const data = await res.json();
      setAchievements(data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  }, [user?.id]);

  const fetchLeaderboard = useCallback(async () => {
    if (!user?.id) return;

    try {
      const res = await fetch(`${API_URL}?action=leaderboard`, {
        headers: { 'X-User-Id': user.id.toString() }
      });
      const data = await res.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProfile(),
        fetchUpgrades(),
        fetchAchievements(),
        fetchLeaderboard()
      ]);
      setLoading(false);
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id, fetchProfile, fetchUpgrades, fetchAchievements, fetchLeaderboard]);

  useEffect(() => {
    if (!profile) return;

    const interval = setInterval(() => {
      setProfile(prev => {
        if (!prev) return prev;
        const newEnergy = Math.min(
          prev.max_energy,
          prev.energy + prev.energy_recharge_rate
        );
        return { ...prev, energy: newEnergy };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [profile]);

  const handleTap = async () => {
    if (!user?.id || !profile || profile.energy <= 0) return;

    const optimisticProfile = {
      ...profile,
      coins: profile.coins + profile.coins_per_tap,
      total_taps: profile.total_taps + 1,
      energy: Math.max(0, profile.energy - 1)
    };
    setProfile(optimisticProfile);

    try {
      const res = await fetch(`${API_URL}?action=tap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString()
        },
        body: JSON.stringify({ taps: 1 })
      });

      if (!res.ok) {
        setProfile(profile);
        return;
      }

      const data = await res.json();
      setProfile(data);

      if (data.level > profile.level) {
        toast.success(`🎉 Поздравляем! Вы достигли ${data.level} уровня!`);
      }
    } catch (error) {
      setProfile(profile);
      console.error('Error tapping:', error);
    }
  };

  const handleBuyUpgrade = async (upgradeId: number) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=buy_upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString()
        },
        body: JSON.stringify({ upgrade_id: upgradeId })
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Ошибка покупки');
        setLoading(false);
        return;
      }

      toast.success('✅ Улучшение куплено!');
      await Promise.all([fetchProfile(), fetchUpgrades(), fetchAchievements()]);
    } catch (error) {
      console.error('Error buying upgrade:', error);
      toast.error('Ошибка покупки');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl"
        >
          <div className="text-6xl mb-4">🚴</div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Courier Tapper</h1>
          <p className="text-gray-600 mb-6">
            Войдите в систему, чтобы начать играть и сохранять свой прогресс!
          </p>
          <Button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            Войти
          </Button>
        </motion.div>
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-white text-2xl">Загрузка игры...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4 relative">
            <Button
              onClick={() => window.location.href = '/dashboard'}
              variant="outline"
              className="absolute left-0 bg-white/20 hover:bg-white/30 text-white border-white/40 backdrop-blur-sm"
            >
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Выход
            </Button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            🚴 Courier Tapper
          </h1>
          <p className="text-white/90 text-lg">Тапай и становись лучшим курьером!</p>
        </motion.div>

        <div className="mb-8">
          <StatsPanel
            coins={profile.coins}
            level={profile.level}
            totalTaps={profile.total_taps}
            coinsPerTap={profile.coins_per_tap}
          />
        </div>

        <div className="mb-8">
          <TapButton
            onTap={handleTap}
            energy={profile.energy}
            maxEnergy={profile.max_energy}
            coinsPerTap={profile.coins_per_tap}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <Button
            onClick={() => {
              setShowUpgrades(true);
              fetchUpgrades();
            }}
            className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-6 rounded-2xl shadow-lg"
          >
            <div className="flex flex-col items-center gap-1">
              <Icon name="ShoppingCart" size={24} />
              <span className="text-xs">Магазин</span>
            </div>
          </Button>

          <Button
            onClick={() => {
              setShowLeaderboard(true);
              fetchLeaderboard();
            }}
            className="bg-white text-pink-600 hover:bg-gray-100 font-bold py-6 rounded-2xl shadow-lg"
          >
            <div className="flex flex-col items-center gap-1">
              <Icon name="Trophy" size={24} />
              <span className="text-xs">Лидеры</span>
            </div>
          </Button>

          <Button
            onClick={() => {
              setShowAchievements(true);
              fetchAchievements();
            }}
            className="bg-white text-red-600 hover:bg-gray-100 font-bold py-6 rounded-2xl shadow-lg"
          >
            <div className="flex flex-col items-center gap-1">
              <Icon name="Award" size={24} />
              <span className="text-xs">Награды</span>
            </div>
          </Button>
        </div>
      </div>

      <UpgradesModal
        open={showUpgrades}
        onClose={() => setShowUpgrades(false)}
        upgrades={upgrades}
        coins={profile.coins}
        onBuyUpgrade={handleBuyUpgrade}
        loading={loading}
      />

      <LeaderboardModal
        open={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        leaderboard={leaderboard}
      />

      <AchievementsModal
        open={showAchievements}
        onClose={() => setShowAchievements(false)}
        achievements={achievements}
      />
    </div>
  );
}