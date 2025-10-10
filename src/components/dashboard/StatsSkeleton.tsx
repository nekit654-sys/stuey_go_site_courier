import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-4 border-gray-300 bg-gray-200 animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-gray-300 rounded" />
            <div className="h-8 w-8 bg-gray-300 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="h-12 w-20 bg-gray-300 rounded mb-2" />
            <div className="h-3 w-16 bg-gray-300 rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
