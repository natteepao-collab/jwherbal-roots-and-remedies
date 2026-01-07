import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";
import FAQImageCarousel from "@/components/FAQImageCarousel";

const AdminFAQImages = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Image className="h-8 w-8 text-primary" />
            จัดการรูปภาพถามตอบ
          </h1>
          <p className="text-muted-foreground mt-1">
            อัพโหลดและจัดการรูปภาพสำหรับหน้าถามตอบ
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รูปภาพถามตอบ</CardTitle>
        </CardHeader>
        <CardContent>
          <FAQImageCarousel isAdmin={true} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFAQImages;