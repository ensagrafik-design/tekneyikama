"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProgressBadge } from "@/components/ui/progress-badge";
import { Clock, Ship, PlayCircle } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

export default function CrewDashboard() {
  const { data: jobs, isLoading } = trpc.jobs.myJobs.useQuery();

  if (isLoading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  const calculateProgress = (progress: any[]) => {
    if (progress.length === 0) return 0;
    const totalPercent = progress.reduce((sum, p) => sum + p.percent, 0);
    return Math.round(totalPercent / progress.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">İşlerim</h1>
          <p className="text-gray-600 mt-2">Size atanan temizlik işleri</p>
        </div>

        {!jobs || jobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Ship className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz atanmış iş bulunmuyor
              </h3>
              <p className="text-gray-500 text-center max-w-sm">
                Size yeni işler atandığında burada görüntülenecektir.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const progress = calculateProgress(job.progress);
              const isInProgress = job.status === 'IN_PROGRESS';
              
              return (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {job.vessel.name}
                        </CardTitle>
                        <CardDescription>
                          {job.vessel.client.name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={isInProgress ? "default" : "secondary"}>
                          {job.status === 'DRAFT' ? 'Bekliyor' : 'Devam Ediyor'}
                        </Badge>
                        {job.scheduledAt && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Intl.DateTimeFormat('tr-TR', { 
                              dateStyle: 'short',
                              timeStyle: 'short'
                            }).format(new Date(job.scheduledAt))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">İlerleme</span>
                          <ProgressBadge percent={progress} />
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      {job.notes && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Notlar:</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                            {job.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button asChild>
                          <Link href={`/crew/jobs/${job.id}`}>
                            <PlayCircle className="mr-2 h-4 w-4" />
                            İşe Devam Et
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}