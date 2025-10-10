import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function TabSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 w-48 bg-gray-300 rounded" />
          <div className="h-4 w-64 bg-gray-200 rounded mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
          <div className="h-20 w-full bg-gray-100 rounded" />
        </CardContent>
      </Card>
    </div>
  );
}
