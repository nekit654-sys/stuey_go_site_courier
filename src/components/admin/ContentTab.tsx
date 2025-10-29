import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import StoriesTab from './StoriesTab';
import HeroEditorTab from './HeroEditorTab';

interface ContentTabProps {
  authToken: string;
}

export default function ContentTab({ authToken }: ContentTabProps) {
  return (
    <Tabs defaultValue="stories" className="space-y-3 sm:space-y-4">
      <TabsList className="grid w-full grid-cols-2 h-auto">
        <TabsTrigger value="stories" className="flex items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
          <Icon name="BookOpen" size={14} className="sm:w-4 sm:h-4" />
          <span>Stories</span>
        </TabsTrigger>
        <TabsTrigger value="hero" className="flex items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
          <Icon name="Monitor" size={14} className="sm:w-4 sm:h-4" />
          <span>Hero</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stories" className="space-y-3 sm:space-y-4">
        <StoriesTab />
      </TabsContent>

      <TabsContent value="hero" className="space-y-3 sm:space-y-4">
        <HeroEditorTab authToken={authToken} />
      </TabsContent>
    </Tabs>
  );
}