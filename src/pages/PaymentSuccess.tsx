import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const orderId = params.get("order");
  const [status, setStatus] = useState<"loading" | "paid" | "failed">("loading");

  useEffect(() => {
    if (!sessionId) {
      setStatus("failed");
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { session_id: sessionId },
        });
        if (error) throw error;
        setStatus(data?.paid ? "paid" : "failed");
      } catch {
        setStatus("failed");
      }
    })();
  }, [sessionId]);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card className="max-w-xl mx-auto">
            <CardContent className="p-8 text-center">
              {status === "loading" && (
                <>
                  <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
                  <h1 className="text-2xl font-bold mb-2">กำลังตรวจสอบการชำระเงิน...</h1>
                  <p className="text-muted-foreground">กรุณารอสักครู่</p>
                </>
              )}

              {status === "paid" && (
                <>
                  <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                  <h1 className="text-3xl font-bold mb-4">ชำระเงินสำเร็จ!</h1>
                  {orderId && (
                    <p className="text-muted-foreground mb-6">
                      หมายเลขคำสั่งซื้อ: {orderId.slice(0, 8).toUpperCase()}
                    </p>
                  )}
                  <p className="text-muted-foreground mb-8">
                    ขอบคุณสำหรับคำสั่งซื้อ ทีมงานจะดำเนินการจัดส่งโดยเร็วที่สุด
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => navigate("/")}>
                      กลับหน้าแรก
                    </Button>
                    <Button onClick={() => navigate("/shop")}>ซื้อสินค้าเพิ่ม</Button>
                  </div>
                </>
              )}

              {status === "failed" && (
                <>
                  <XCircle className="h-20 w-20 text-destructive mx-auto mb-6" />
                  <h1 className="text-3xl font-bold mb-4">ยังไม่ได้รับการชำระเงิน</h1>
                  <p className="text-muted-foreground mb-8">
                    หากคุณชำระเงินแล้วแต่เห็นข้อความนี้ กรุณาติดต่อทีมงาน
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => navigate("/")}>
                      กลับหน้าแรก
                    </Button>
                    <Button onClick={() => navigate("/cart")}>กลับไปตะกร้า</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default PaymentSuccess;
