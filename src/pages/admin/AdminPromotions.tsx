import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Save } from "lucide-react";
import { toast } from "sonner";

const AdminPromotions = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["promotion-settings-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotion_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [title, setTitle] = useState("");
  const [isMonthly, setIsMonthly] = useState(true);
  const [customDate, setCustomDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Sync state from DB once loaded
  if (settings && !initialized) {
    setTitle(settings.title);
    setIsMonthly(settings.is_monthly);
    setCustomDate(settings.custom_end_date ? new Date(settings.custom_end_date).toISOString().slice(0, 16) : "");
    setIsActive(settings.is_active);
    setInitialized(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!settings) return;
      const { error } = await supabase
        .from("promotion_settings")
        .update({
          title,
          is_monthly: isMonthly,
          custom_end_date: isMonthly ? null : (customDate ? new Date(customDate).toISOString() : null),
          is_active: isActive,
        })
        .eq("id", settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion-settings"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-settings-admin"] });
      toast.success("บันทึกการตั้งค่าโปรโมชั่นเรียบร้อย");
    },
    onError: () => {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">กำลังโหลด...</p>
      </div>
    );
  }

  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">จัดการโปรโมชั่น</h1>
        <p className="text-muted-foreground">ตั้งค่าโปรโมชั่นประจำเดือนและวันหมดเขต</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            การตั้งค่าโปรโมชั่น
          </CardTitle>
          <CardDescription>กำหนดชื่อโปรโมชั่น, โหมด countdown และสถานะการแสดงผล</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label>ชื่อโปรโมชั่น</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="โปรโมชั่นประจำเดือน"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium text-foreground">แสดงโปรโมชั่น</p>
              <p className="text-sm text-muted-foreground">เปิด/ปิดการแสดง Section โปรโมชั่นบนหน้าแรก</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* Mode toggle */}
          <div className="space-y-4">
            <Label>โหมด Countdown</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsMonthly(true)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  isMonthly
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">รายเดือนอัตโนมัติ</span>
                  {isMonthly && <Badge variant="default" className="text-[10px]">ใช้งานอยู่</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  นับถอยหลังจนถึงสิ้นเดือนปัจจุบัน แล้วรีเซ็ตอัตโนมัติ
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIsMonthly(false)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  !isMonthly
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">กำหนดวันเอง</span>
                  {!isMonthly && <Badge variant="default" className="text-[10px]">ใช้งานอยู่</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  เลือกวันและเวลาหมดเขตโปรโมชั่นด้วยตนเอง
                </p>
              </button>
            </div>
          </div>

          {/* Custom date input */}
          {!isMonthly && (
            <div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border">
              <Label>วันหมดเขตโปรโมชั่น</Label>
              <Input
                type="datetime-local"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
              {customDate && (
                <p className="text-xs text-muted-foreground">
                  หมดเขต: {new Date(customDate).toLocaleString("th-TH", { dateStyle: "full", timeStyle: "short" })}
                </p>
              )}
            </div>
          )}

          {/* Preview info */}
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <p className="text-sm font-medium text-foreground mb-1">ตัวอย่าง Countdown</p>
            <p className="text-xs text-muted-foreground">
              {isMonthly
                ? `นับถอยหลังจนถึง: ${endOfMonth.toLocaleString("th-TH", { dateStyle: "full", timeStyle: "short" })} (สิ้นเดือนนี้)`
                : customDate
                  ? `นับถอยหลังจนถึง: ${new Date(customDate).toLocaleString("th-TH", { dateStyle: "full", timeStyle: "short" })}`
                  : "กรุณาเลือกวันหมดเขต"
              }
            </p>
          </div>

          {/* Save button */}
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPromotions;
