import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship, Users, ClipboardList, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-20 pb-16 text-center">
          <div className="flex justify-center mb-8">
            <Ship className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            ReefClean
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Profesyonel tekne ve yat temizlik hizmet yönetimi platformu
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/admin">Admin Paneli</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/crew">Saha Ekibi</Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-blue-600" />
                <CardTitle>Müşteri Yönetimi</CardTitle>
                <CardDescription>
                  Müşteri bilgilerini ve teknelerini kolayca yönetin
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <ClipboardList className="h-8 w-8 text-green-600" />
                <CardTitle>İş Takibi</CardTitle>
                <CardDescription>
                  Temizlik işlerini baştan sona takip edin ve yönetin
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <CardTitle>Raporlama</CardTitle>
                <CardDescription>
                  Detaylı raporlar ve analizlerle performansı izleyin
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Login Section */}
        <div className="py-16 border-t border-gray-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Sisteme Giriş</h2>
            <p className="mt-4 text-gray-600">
              Rolünüze göre uygun paneli seçin
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/signin?callbackUrl=/admin">
                  Yönetici Girişi
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/signin?callbackUrl=/crew">
                  Saha Ekibi Girişi
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/signin?callbackUrl=/portal">
                  Müşteri Girişi
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}