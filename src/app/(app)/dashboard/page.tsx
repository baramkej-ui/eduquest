'use client';

import { ProblemGenerator } from '@/components/dashboard/problem-generator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { History } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Generate and manage English problems.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProblemGenerator />
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12 problems</div>
            <p className="text-xs text-muted-foreground">
              generated in the last hour
            </p>
            <div className="mt-4 space-y-4">
              <div className="flex items-center">
                <p className="text-sm font-medium leading-none">
                  Generated 5 'easy' grammar problems.
                </p>
                <p className="ml-auto text-xs text-muted-foreground">10m ago</p>
              </div>
              <div className="flex items-center">
                <p className="text-sm font-medium leading-none">
                  Generated 7 'medium' vocabulary problems.
                </p>
                <p className="ml-auto text-xs text-muted-foreground">45m ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
