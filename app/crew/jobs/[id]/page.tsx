"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressBadge } from "@/components/ui/progress-badge";
import { 
  Camera, 
  Save, 
  CheckCircle, 
  ArrowLeft, 
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

interface JobPageProps {
  params: {
    id: string;
  };
}

export default function JobPage({ params }: JobPageProps) {
  const router = useRouter();
  const [progressUpdates, setProgressUpdates] = useState<Record<string, { percent: number; note: string }>>({});
  
  const { data: job, isLoading, refetch } = trpc.jobs.byId.useQuery({
    id: params.id,
  });

  const updateProgressMutation = trpc.progress.updatePercent.useMutation({
    onSuccess: () => {
      toast.success("İlerleme güncellendi");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateJobStatusMutation = trpc.jobs.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("İş durumu güncellendi");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  if (!job) {
    return <div className="p-6">İş bulunamadı.</div>;
  }

  const calculateOverallProgress = () => {
    if (job.progress.length === 0) return 0;
    const totalPercent = job.progress.reduce((sum, p) => sum + p.percent, 0);
    return Math.round(totalPercent / job.progress.length);
  };

  const handleProgressUpdate = async (sectionId: string, percent: number, note: string) => {
    await updateProgressMutation.mutateAsync({
      cleaningJobId: job.id,
      vesselSectionId: sectionId,
      percent,
      note,
    });
  };

  const handleStatusUpdate = async (status: 'IN_PROGRESS' | 'DONE') => {
    await updateJobStatusMutation.mutateAsync({
      id: job.id,
      status,
    });
    
    if (status === 'DONE') {
      router.push('/crew');
    }
  };

  const overallProgress = calculateOverallProgress();
  const isComplete = overallProgress === 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{job.vessel.name}</h1>
            <p className="text-gray-600">{job.vessel.client.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={job.status === 'IN_PROGRESS' ? "default" : "secondary"}>
              {job.status === 'DRAFT' ? 'Bekliyor' : 
               job.status === 'IN_PROGRESS' ? 'Devam Ediyor' : 'Tamamlandı'}
            </Badge>
            {job.status === 'DRAFT' && (
              <Button 
                onClick={() => handleStatusUpdate('IN_PROGRESS')}
                disabled={updateJobStatusMutation.isLoading}
              >
                İşi Başlat
              </Button>
            )}
            {job.status === 'IN_PROGRESS' && isComplete && (
              <Button 
                onClick={() => handleStatusUpdate('DONE')}
                disabled={updateJobStatusMutation.isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                İşi Tamamla
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Genel İlerleme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Toplam İlerleme</span>
                <ProgressBadge percent={overallProgress} />
              </div>
              <Progress value={overallProgress} className="h-3" />
              <p className="text-sm text-gray-600">
                {job.progress.filter(p => p.percent === 100).length} / {job.progress.length} bölüm tamamlandı
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {job.vessel.sections.map((section) => {
          const progressRecord = job.progress.find(p => p.vesselSectionId === section.id);
          const currentPercent = progressUpdates[section.id]?.percent ?? progressRecord?.percent ?? 0;
          const currentNote = progressUpdates[section.id]?.note ?? progressRecord?.note ?? "";

          return (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{section.name}</CardTitle>
                  <ProgressBadge percent={currentPercent} />
                </div>
                {section.description && (
                  <CardDescription>{section.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    İlerleme: %{currentPercent}
                  </label>
                  <Slider
                    value={[currentPercent]}
                    onValueChange={(value) => {
                      setProgressUpdates(prev => ({
                        ...prev,
                        [section.id]: {
                          percent: value[0],
                          note: currentNote,
                        }
                      }));
                    }}
                    max={100}
                    step={5}
                    className="mb-4"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Notlar</label>
                  <Textarea
                    value={currentNote}
                    onChange={(e) => {
                      setProgressUpdates(prev => ({
                        ...prev,
                        [section.id]: {
                          percent: currentPercent,
                          note: e.target.value,
                        }
                      }));
                    }}
                    placeholder="Bu bölüm hakkında notlarınızı yazın..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Camera className="mr-2 h-4 w-4" />
                      Önce Fotoğrafı
                    </Button>
                    <Button variant="outline" size="sm">
                      <Camera className="mr-2 h-4 w-4" />
                      Sonra Fotoğrafı
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleProgressUpdate(
                      section.id, 
                      currentPercent, 
                      currentNote
                    )}
                    disabled={updateProgressMutation.isLoading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
                  </Button>
                </div>

                {progressRecord?.media && progressRecord.media.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Fotoğraflar</h4>
                    <Tabs defaultValue="before" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="before">Önce</TabsTrigger>
                        <TabsTrigger value="after">Sonra</TabsTrigger>
                      </TabsList>
                      <TabsContent value="before" className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          {progressRecord.media
                            .filter(m => m.kind === 'BEFORE')
                            .map((media) => (
                                <div key={media.id} className="relative">
                                  <Image
                                    src={media.url}
                                    alt={media.caption || "Önce"}
                                    className="w-full h-32 object-cover rounded-md"
                                    width={500}
                                    height={500}
                                  />
                                  {media.caption && (
                                    <p className="text-xs text-gray-600 mt-1">{media.caption}</p>
                                  )}
                                </div>
                            ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="after" className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          {progressRecord.media
                            .filter(m => m.kind === 'AFTER')
                            .map((media) => (
                                <div key={media.id} className="relative">
                                  <Image
                                    src={media.url}
                                    alt={media.caption || "Sonra"}
                                    className="w-full h-32 object-cover rounded-md"
                                    width={500}
                                    height={500}
                                  />
                                  {media.caption && (
                                    <p className="text-xs text-gray-600 mt-1">{media.caption}</p>
                                  )}
                                </div>
                            ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}