import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Auth = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login - in production, integrate with backend
    setTimeout(() => {
      setIsLoading(false);
      toast.success(t("auth.loginSuccess"));
    }, 1500);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate signup - in production, integrate with backend
    setTimeout(() => {
      setIsLoading(false);
      toast.success(t("auth.signupSuccess"));
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับหน้าแรก
            </Link>
          </Button>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">เข้าสู่ระบบ</TabsTrigger>
              <TabsTrigger value="signup">สมัครสมาชิก</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>เข้าสู่ระบบ</CardTitle>
                  <CardDescription>
                    เข้าสู่ระบบเพื่อเข้าถึงบัญชีของคุณ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">อีเมล</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">รหัสผ่าน</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                      <a href="#" className="hover:text-primary">
                        ลืมรหัสผ่าน?
                      </a>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>สมัครสมาชิก</CardTitle>
                  <CardDescription>
                    สร้างบัญชีใหม่เพื่อเริ่มใช้งาน
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <Label htmlFor="signup-name">ชื่อ-นามสกุล</Label>
                      <Input
                        id="signup-name"
                        placeholder="สมชาย ใจดี"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-email">อีเมล</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-password">รหัสผ่าน</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-confirm">ยืนยันรหัสผ่าน</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
                    </Button>
                    <div className="text-center text-xs text-muted-foreground">
                      การสมัครสมาชิก ถือว่าคุณยอมรับ
                      <a href="#" className="text-primary hover:underline"> เงื่อนไขการใช้งาน </a>
                      และ
                      <a href="#" className="text-primary hover:underline"> นโยบายความเป็นส่วนตัว</a>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;
