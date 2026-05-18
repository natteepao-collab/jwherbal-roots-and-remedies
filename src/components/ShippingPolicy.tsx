import { Truck, PackageCheck, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShippingPolicyProps {
  variant?: "default" | "compact";
  title?: string;
}

const ShippingPolicy = ({ variant = "default", title = "นโยบายการจัดส่ง" }: ShippingPolicyProps) => {
  const items = [
    {
      icon: Truck,
      title: "จัดส่งฟรีทั่วประเทศ",
      desc: "จัดส่งโดย Kerry / Flash / ไปรษณีย์ไทย ฟรีค่าจัดส่งทุกออเดอร์",
    },
    {
      icon: Clock,
      title: "ระยะเวลาจัดส่ง 2–4 วันทำการ",
      desc: "จัดส่งภายใน 1–2 วันทำการหลังยืนยันการชำระเงิน (จันทร์–ศุกร์)",
    },
    {
      icon: PackageCheck,
      title: "แจ้งเลขพัสดุทุกออเดอร์",
      desc: "ทีมงานจะส่งเลขพัสดุให้ทาง LINE / อีเมล หลังจัดส่งสินค้า",
    },
    {
      icon: AlertCircle,
      title: "เปลี่ยน/คืนสินค้าได้ภายใน 7 วัน",
      desc: "กรณีสินค้าเสียหายหรือผิดรายการ กรุณาถ่ายรูปและติดต่อทีมงานทันที",
    },
  ];

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className={variant === "compact" ? "pb-3" : ""}>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Truck className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <div key={i} className="flex gap-3">
              <Icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-foreground">{it.title}</p>
                <p className="text-muted-foreground text-xs sm:text-sm">{it.desc}</p>
              </div>
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground pt-2 border-t border-primary/10">
          * โอนเงินแล้วกรุณาแนบสลิปเพื่อให้ทีมงานตรวจสอบและจัดส่งภายในวันทำการถัดไป
        </p>
      </CardContent>
    </Card>
  );
};

export default ShippingPolicy;
