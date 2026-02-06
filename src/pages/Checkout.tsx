import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { QrCode, ArrowLeft, CheckCircle, Building2, Copy } from "lucide-react";

interface PaymentSettings {
  promptpay_number: string;
  promptpay_name: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  is_promptpay_enabled: boolean;
  is_bank_transfer_enabled: boolean;
}

const checkoutSchema = z.object({
  customer_name: z.string().min(2, "กรุณากรอกชื่อ").max(100),
  customer_email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  customer_phone: z
    .string()
    .min(9, "กรุณากรอกเบอร์โทร")
    .max(15)
    .regex(/^[0-9]+$/, "เบอร์โทรต้องเป็นตัวเลขเท่านั้น"),
  customer_address: z.string().min(10, "กรุณากรอกที่อยู่"),
  payment_method: z.enum(["promptpay", "bank_transfer"]),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Generate PromptPay QR URL with amount
const getPromptPayQRUrl = (number: string, amount: number) => {
  const cleanNumber = number.replace(/[^0-9]/g, "");
  if (!cleanNumber) return null;
  return `https://promptpay.io/${cleanNumber}/${amount}.png`;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("promptpay");
  const [user, setUser] = useState<{ id: string } | null>(null);

  // Fetch payment settings
  const { data: paymentSettings } = useQuery({
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

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      customer_address: "",
      payment_method: "promptpay",
    },
  });

  // Update default payment method when settings load
  useEffect(() => {
    if (paymentSettings) {
      const defaultMethod = paymentSettings.is_promptpay_enabled ? "promptpay" : "bank_transfer";
      form.setValue("payment_method", defaultMethod);
      setSelectedPaymentMethod(defaultMethod);
    }
  }, [paymentSettings, form]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({ id: user.id });
        form.setValue("customer_email", user.email || "");
      }
    });
  }, [form]);

  if (items.length === 0 && !orderComplete) {
    navigate("/cart");
    return null;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("คัดลอกแล้ว!");
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          customer_address: data.customer_address,
          total_amount: totalPrice,
          payment_method: data.payment_method,
          status: "pending",
          payment_status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: null,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Send admin notification
      try {
        await supabase.functions.invoke("send-admin-notification", {
          body: {
            type: "new_order",
            data: {
              order_id: orderData.id,
              customer_name: data.customer_name,
              total_amount: totalPrice,
            },
          },
        });
      } catch (notifyError) {
        console.error("Failed to send notification:", notifyError);
        // Don't fail the order if notification fails
      }

      setOrderId(orderData.id);
      setOrderTotal(totalPrice);
      setSelectedPaymentMethod(data.payment_method);
      setOrderComplete(true);
      clearCart();
      toast.success("สร้างคำสั่งซื้อเรียบร้อย!");
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete && orderId) {
    return (
      <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-4">
                ขอบคุณสำหรับคำสั่งซื้อ!
              </h1>
              <p className="text-muted-foreground mb-6">
                หมายเลขคำสั่งซื้อ: {orderId.slice(0, 8).toUpperCase()}
              </p>

              {selectedPaymentMethod === "promptpay" && paymentSettings?.is_promptpay_enabled && (
                <Card className="bg-secondary mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2">
                      <QrCode className="h-5 w-5" />
                      สแกน PromptPay เพื่อชำระเงิน
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white p-4 rounded-lg inline-block mb-4">
                      {paymentSettings.promptpay_number ? (
                        <img
                          src={getPromptPayQRUrl(paymentSettings.promptpay_number, orderTotal) || ""}
                          alt="PromptPay QR Code"
                          className="w-48 h-48 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center text-muted-foreground">
                          ไม่สามารถสร้าง QR Code ได้
                        </div>
                      )}
                    </div>
                    <p className="text-lg font-medium mb-1">
                      {paymentSettings.promptpay_name}
                    </p>
                    <p className="text-2xl font-bold text-primary mb-2">
                      ฿{orderTotal.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      กรุณาชำระเงินภายใน 24 ชั่วโมง
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedPaymentMethod === "bank_transfer" && paymentSettings?.is_bank_transfer_enabled && (
                <Card className="bg-secondary mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2">
                      <Building2 className="h-5 w-5" />
                      โอนเงินผ่านธนาคาร
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-background p-4 rounded-lg text-left">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">ธนาคาร:</span>
                          <span className="font-medium">{paymentSettings.bank_name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">เลขที่บัญชี:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{paymentSettings.bank_account_number}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(paymentSettings.bank_account_number)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">ชื่อบัญชี:</span>
                          <span className="font-medium">{paymentSettings.bank_account_name}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      ฿{orderTotal.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      กรุณาชำระเงินภายใน 24 ชั่วโมง
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2 text-sm text-muted-foreground mb-6">
                <p>หลังจากชำระเงินแล้ว ทีมงานจะตรวจสอบและยืนยันคำสั่งซื้อ</p>
                <p>คุณจะได้รับอีเมลยืนยันเมื่อคำสั่งซื้อถูกจัดส่ง</p>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate("/")}>
                  กลับหน้าแรก
                </Button>
                <Button onClick={() => navigate("/shop")}>
                  ซื้อสินค้าเพิ่ม
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/cart")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          กลับไปตะกร้าสินค้า
        </Button>

        <h1 className="text-4xl font-bold mb-8">ชำระเงิน</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>ข้อมูลการจัดส่ง</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customer_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ชื่อ-นามสกุล</FormLabel>
                          <FormControl>
                            <Input placeholder="กรอกชื่อ-นามสกุล" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customer_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>อีเมล</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="email@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customer_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>เบอร์โทรศัพท์</FormLabel>
                            <FormControl>
                              <Input placeholder="0812345678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="customer_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ที่อยู่จัดส่ง</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>วิธีการชำระเงิน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="payment_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="space-y-4"
                            >
                              {paymentSettings?.is_promptpay_enabled && (
                                <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary">
                                  <RadioGroupItem value="promptpay" id="promptpay" />
                                  <Label
                                    htmlFor="promptpay"
                                    className="flex items-center gap-3 cursor-pointer flex-1"
                                  >
                                    <QrCode className="h-8 w-8 text-primary" />
                                    <div>
                                      <p className="font-medium">PromptPay QR</p>
                                      <p className="text-sm text-muted-foreground">
                                        สแกน QR Code เพื่อชำระเงิน
                                      </p>
                                    </div>
                                  </Label>
                                </div>
                              )}

                              {paymentSettings?.is_bank_transfer_enabled && (
                                <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary">
                                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                                  <Label
                                    htmlFor="bank_transfer"
                                    className="flex items-center gap-3 cursor-pointer flex-1"
                                  >
                                    <Building2 className="h-8 w-8 text-blue-500" />
                                    <div>
                                      <p className="font-medium">โอนผ่านธนาคาร</p>
                                      <p className="text-sm text-muted-foreground">
                                        {paymentSettings?.bank_name} - {paymentSettings?.bank_account_number}
                                      </p>
                                    </div>
                                  </Label>
                                </div>
                              )}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "กำลังดำเนินการ..." : "ยืนยันคำสั่งซื้อ"}
                </Button>
              </form>
            </Form>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>สรุปคำสั่งซื้อ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-2 border-b"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-sm line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          x{item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}

                <div className="pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ยอดรวมสินค้า</span>
                    <span>฿{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ค่าจัดส่ง</span>
                    <span className="text-primary">ฟรี</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-xl font-bold">
                      <span>ยอดรวมทั้งหมด</span>
                      <span className="text-primary">
                        ฿{totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </PageTransition>
  );
};

export default Checkout;
