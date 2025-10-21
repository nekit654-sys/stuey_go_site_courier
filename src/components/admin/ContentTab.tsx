import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import StoriesTab from './StoriesTab';
import HeroEditorTab from './HeroEditorTab';

interface ContentTabProps {
  authToken: string;
}

export default function ContentTab({ authToken }: ContentTabProps) {
  return (
    <Tabs defaultValue="stories" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="stories" className="flex items-center gap-2">
          <Icon name="BookOpen" size={16} />
          <span>Stories</span>
        </TabsTrigger>
        <TabsTrigger value="hero" className="flex items-center gap-2">
          <Icon name="Monitor" size={16} />
          <span>Hero-блок</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stories" className="space-y-4">
        <StoriesTab />
      </TabsContent>

      <TabsContent value="hero" className="space-y-4">
        <HeroEditorTab authToken={authToken} />
      </TabsContent>
    </Tabs>
  );
}
