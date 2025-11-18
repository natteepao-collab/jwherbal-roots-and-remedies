import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simple authentication check - INSECURE for production
    if (username === "administrator" && password === "Jwreal999@") {
      // Store admin session (localStorage is insecure - for demo only)
      sessionStorage.setItem("adminAuth", "true");
      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        description: "ยินดีต้อนรับสู่ระบบจัดการ",
      });
      navigate("/admin/dashboard");
    } else {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">ระบบจัดการหลังบ้าน</CardTitle>
          <CardDescription className="text-center">
            กรุณาเข้าสู่ระบบเพื่อจัดการบทความ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
              <strong>คำเตือน:</strong> ระบบนี้ใช้การยืนยันตัวตนแบบพื้นฐาน ไม่เหมาะสมสำหรับการใช้งานจริง 
              แนะนำให้ใช้ Lovable Cloud เพื่อความปลอดภัยที่ดีกว่า
            </AlertDescription>
          </Alert>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">ชื่อผู้ใช้</Label>
              <Input
                id="username"
                type="text"
                placeholder="administrator"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              เข้าสู่ระบบ
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
