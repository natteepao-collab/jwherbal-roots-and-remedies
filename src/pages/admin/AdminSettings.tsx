import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const AdminSettings = () => {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">ตั้งค่าระบบ</h1>
        <p className="text-muted-foreground mt-1">การตั้งค่าและข้อมูลระบบ</p>
      </div>

      <div className="grid gap-6">
        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลแอปพลิเคชัน</CardTitle>
            <CardDescription>ข้อมูลทั่วไปของระบบ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">ชื่อแอป</p>
                <p className="font-medium">JWHERBAL BY JWGROUP</p>
              </div>
              <div>
                <p className="text-muted-foreground">เวอร์ชัน</p>
                <p className="font-medium">1.0.0</p>
              </div>
              <div>
                <p className="text-muted-foreground">สถานะ</p>
                <p className="font-medium text-green-600">ออนไลน์</p>
              </div>
              <div>
                <p className="text-muted-foreground">ภาษาที่รองรับ</p>
                <p className="font-medium">ไทย, English, 中文</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>ลิงก์ด่วน</CardTitle>
            <CardDescription>เข้าถึงหน้าต่างๆ ของเว็บไซต์</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="justify-start gap-2" onClick={() => window.open("/", "_blank")}>
                <ExternalLink className="h-4 w-4" />
                หน้าหลัก
              </Button>
              <Button variant="outline" className="justify-start gap-2" onClick={() => window.open("/shop", "_blank")}>
                <ExternalLink className="h-4 w-4" />
                ร้านค้า
              </Button>
              <Button variant="outline" className="justify-start gap-2" onClick={() => window.open("/articles", "_blank")}>
                <ExternalLink className="h-4 w-4" />
                บทความ
              </Button>
              <Button variant="outline" className="justify-start gap-2" onClick={() => window.open("/community", "_blank")}>
                <ExternalLink className="h-4 w-4" />
                คอมมูนิตี้
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help */}
        <Card>
          <CardHeader>
            <CardTitle>ความช่วยเหลือ</CardTitle>
            <CardDescription>ข้อมูลเพิ่มเติมและการสนับสนุน</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              หากต้องการความช่วยเหลือในการจัดการระบบ กรุณาติดต่อทีมพัฒนา
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
