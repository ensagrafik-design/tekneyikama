import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Ship, ClipboardList, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard - ReefClean",
  description: "Tekne temizlik hizmet yönetimi",
};

export default function AdminDashboard() {
  const stats = [
    {
      title: "Toplam Müşteriler",
      value: "24",
      description: "Bu ay 3 yeni müşteri",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Aktif Tekneler",
      value: "67",
      description: "Şu anda temizlik bekleyen: 12",
      icon: Ship,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Devam Eden İşler",
      value: "8",
      description: "Bugün tamamlanması planlanan: 3",
      icon: ClipboardList,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Bu Ay Tamamlanan",
      value: "145",
      description: "Geçen aya göre %12 artış",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Yeni müşteri eklendi: Marmara Yat Kulübü</p>
                <p className="text-xs text-muted-foreground">2 saat önce</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">"Mavi Rüya" teknesi temizlik işi tamamlandı</p>
                <p className="text-xs text-muted-foreground">4 saat önce</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Mehmet Temizci "Deniz Yıldızı" işini başlattı</p>
                <p className="text-xs text-muted-foreground">6 saat önce</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Haftalık Özet</CardTitle>
            <CardDescription>Bu hafta tamamlanan işler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pazartesi</span>
                <span className="text-sm font-medium">8 iş</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Salı</span>
                <span className="text-sm font-medium">12 iş</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Çarşamba</span>
                <span className="text-sm font-medium">6 iş</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Perşembe</span>
                <span className="text-sm font-medium">15 iş</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cuma</span>
                <span className="text-sm font-medium">10 iş</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}