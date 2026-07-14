import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  GraduationCap,
  HeartPulse,
  ListChecks,
  MessagesSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/config/constants";

const features: { title: string; description: string; icon: typeof Users }[] = [
  {
    title: "Öğretmen Randevu Sistemi",
    description: "Öğretmenin müsait saatlerine göre randevu al.",
    icon: CalendarClock,
  },
  {
    title: "Öğrenci Takibi",
    description: "Günlük görevler ve ders bazlı çalışma kayıtlarıyla ilerlemeni takip et.",
    icon: ListChecks,
  },
  {
    title: "Net Analizi",
    description: "Deneme sonuçlarını gir; netlerini ve zaman içindeki gelişimini grafiklerle gör.",
    icon: TrendingUp,
  },
  {
    title: "Koç Takibi",
    description: "Danışmanlar öğrencilerinin çalışma durumunu tek ekrandan izler.",
    icon: Users,
  },
  {
    title: "İyilik Hali (PDR)",
    description: "Günlük iyilik hali kaydı ve PDR desteğiyle psikolojik takip.",
    icon: HeartPulse,
  },
  {
    title: "Topluluk",
    description: "Not paylaş, soru sor, cevapla — birlikte öğrenin.",
    icon: MessagesSquare,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-start gap-6">
        <Badge variant="brand" className="gap-1.5">
          <GraduationCap className="size-3" />
          Eğitim Koçluğu Platformu
        </Badge>
        <div className="flex max-w-2xl flex-col gap-4">
          <h1 className="t-display">Hedefe giden yolda öğrencinin yanında.</h1>
          <p className="t-body-lg">
            Koçluk; randevu, öğrenci takibi, net analizi, koçluk görüşmeleri ve iyilik hali izlemini tek platformda
            birleştirir. Öğrenci, danışman, öğretmen, idare ve veli — herkes aynı yerde.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" asChild>
            <Link href={ROUTES.register}>
              Hemen başla
              <ArrowRight />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={ROUTES.login}>Giriş yap</Link>
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="t-h2">Neler sunuyoruz?</h2>
          <p className="text-sm text-muted-foreground">
            Öğrenciyi ve danışmanı sınav yolculuğunun her adımında destekleyen araçlar.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <Card
              key={title}
              className="h-full transition-colors duration-[--duration-normal] hover:border-foreground/20"
            >
              <CardContent className="flex flex-col gap-3 p-5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Icon className="size-4" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="t-h4">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
