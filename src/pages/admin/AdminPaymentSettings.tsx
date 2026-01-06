import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, CreditCard, QrCode, Building2 } from "lucide-react";

interface PaymentSettings {
  id: string;
  promptpay_number: string;
  promptpay_name: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  is_promptpay_enabled: boolean;
  is_bank_transfer_enabled: boolean;
  updated_at: string;
}

const AdminPaymentSettings = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<PaymentSettings>>({
    promptpay_number: "",
    promptpay_name: "",
    bank_name: "",
    bank_account_number: "",
    bank_account_name: "",
    is_promptpay_enabled: true,
    is_bank_transfer_enabled: true,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["payment-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_settings")
        .select("*")
        .single();
      
      if (error) throw error;
      return data as PaymentSettings;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<PaymentSettings>) => {
      const { error } = await supabase
        .from("payment_settings")
        .update({
          promptpay_number: data.promptpay_number,
          promptpay_name: data.promptpay_name,
          bank_name: data.bank_name,
          bank_account_number: data.bank_account_number,
          bank_account_name: data.bank_account_name,
          is_promptpay_enabled: data.is_promptpay_enabled,
          is_bank_transfer_enabled: data.is_bank_transfer_enabled,
        })
        .eq("id", settings?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("บันทึกการตั้งค่าเรียบร้อยแล้ว");
      queryClient.invalidateQueries({ queryKey: ["payment-settings"] });
    },
    onError: (error) => {
      console.error("Error updating settings:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof PaymentSettings, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Generate PromptPay QR preview URL
  const getPromptPayQRUrl = (number: string, amount?: number) => {
    const cleanNumber = number.replace(/[^0-9]/g, "");
    if (!cleanNumber) return null;
    const amountParam = amount ? `&amount=${amount}` : "";
    return `https://promptpay.io/${cleanNumber}.png${amountParam}`;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          ตั้งค่าการชำระเงิน
        </h1>
        <p className="text-muted-foreground">
          จัดการข้อมูลบัญชีธนาคารและ PromptPay สำหรับรับชำระเงิน
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PromptPay Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                <CardTitle>PromptPay (พร้อมเพย์)</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="promptpay-enabled">เปิดใช้งาน</Label>
                <Switch
                  id="promptpay-enabled"
                  checked={formData.is_promptpay_enabled}
                  onCheckedChange={(checked) => handleInputChange("is_promptpay_enabled", checked)}
                />
              </div>
            </div>
            <CardDescription>
              ตั้งค่าหมายเลข PromptPay สำหรับสร้าง QR Code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="promptpay-number">หมายเลข PromptPay (เบอร์โทร/เลขบัตรประชาชน)</Label>
                  <Input
                    id="promptpay-number"
                    value={formData.promptpay_number}
                    onChange={(e) => handleInputChange("promptpay_number", e.target.value)}
                    placeholder="0812345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promptpay-name">ชื่อบัญชี</Label>
                  <Input
                    id="promptpay-name"
                    value={formData.promptpay_name}
                    onChange={(e) => handleInputChange("promptpay_name", e.target.value)}
                    placeholder="ชื่อ-นามสกุล หรือ ชื่อบริษัท"
                  />
                </div>
              </div>
              
              {/* QR Preview */}
              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">ตัวอย่าง QR Code</p>
                {formData.promptpay_number && getPromptPayQRUrl(formData.promptpay_number) ? (
                  <img
                    src={getPromptPayQRUrl(formData.promptpay_number)!}
                    alt="PromptPay QR Code"
                    className="w-40 h-40 border rounded bg-white p-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-40 h-40 border rounded bg-background flex items-center justify-center text-muted-foreground text-sm text-center p-4">
                    กรอกหมายเลข PromptPay เพื่อดูตัวอย่าง
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.promptpay_name || "ชื่อบัญชี"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Transfer Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle>โอนเงินผ่านธนาคาร</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="bank-enabled">เปิดใช้งาน</Label>
                <Switch
                  id="bank-enabled"
                  checked={formData.is_bank_transfer_enabled}
                  onCheckedChange={(checked) => handleInputChange("is_bank_transfer_enabled", checked)}
                />
              </div>
            </div>
            <CardDescription>
              ตั้งค่าข้อมูลบัญชีธนาคารสำหรับรับโอนเงิน
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank-name">ชื่อธนาคาร</Label>
                <Input
                  id="bank-name"
                  value={formData.bank_name}
                  onChange={(e) => handleInputChange("bank_name", e.target.value)}
                  placeholder="ธนาคารกสิกรไทย"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-account-number">เลขที่บัญชี</Label>
                <Input
                  id="bank-account-number"
                  value={formData.bank_account_number}
                  onChange={(e) => handleInputChange("bank_account_number", e.target.value)}
                  placeholder="123-4-56789-0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-account-name">ชื่อบัญชี</Label>
              <Input
                id="bank-account-name"
                value={formData.bank_account_name}
                onChange={(e) => handleInputChange("bank_account_name", e.target.value)}
                placeholder="ชื่อ-นามสกุล หรือ ชื่อบริษัท"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminPaymentSettings;
