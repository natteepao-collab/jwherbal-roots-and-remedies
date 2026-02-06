import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, Eye, ShoppingBag, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  customer_name: string;
  customer_address: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  confirmed: "ยืนยันแล้ว",
  shipped: "จัดส่งแล้ว",
  delivered: "ส่งมอบแล้ว",
  cancelled: "ยกเลิก",
};

const paymentLabels: Record<string, string> = {
  pending: "รอชำระเงิน",
  paid: "ชำระแล้ว",
  failed: "ชำระไม่สำเร็จ",
};

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchOrders(session.user.id);
    };

    checkAuth();
  }, [navigate]);

  const fetchOrders = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const fetchOrderItems = async (orderId: string) => {
    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    if (error) {
      console.error("Error fetching order items:", error);
    } else {
      setOrderItems(data || []);
    }
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    await fetchOrderItems(order.id);
  };

  return (
    <PageTransition>
    <div className="min-h-screen flex flex-col bg-background">
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            ย้อนกลับ
          </Button>
          <h1 className="text-3xl font-bold font-prompt text-foreground">
            ประวัติคำสั่งซื้อ
          </h1>
          <p className="text-muted-foreground mt-2">
            ดูรายละเอียดและสถานะคำสั่งซื้อทั้งหมดของคุณ
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">ยังไม่มีคำสั่งซื้อ</h2>
              <p className="text-muted-foreground mb-4">
                คุณยังไม่มีประวัติการสั่งซื้อ เริ่มช้อปปิ้งเลย!
              </p>
              <Button onClick={() => navigate("/shop")}>
                ไปหน้าร้านค้า
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="font-prompt flex items-center gap-2">
                <Package className="h-5 w-5" />
                คำสั่งซื้อทั้งหมด ({orders.length} รายการ)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>หมายเลขคำสั่งซื้อ</TableHead>
                      <TableHead>วันที่สั่งซื้อ</TableHead>
                      <TableHead>ยอดรวม</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>การชำระเงิน</TableHead>
                      <TableHead className="text-right">ดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          {order.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.created_at), "d MMM yyyy HH:mm", { locale: th })}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ฿{Number(order.total_amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[order.status] || "bg-gray-100 text-gray-800"}>
                            {statusLabels[order.status] || order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={paymentStatusColors[order.payment_status] || "bg-gray-100 text-gray-800"}>
                            {paymentLabels[order.payment_status] || order.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            ดูรายละเอียด
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-prompt">
                รายละเอียดคำสั่งซื้อ #{selectedOrder?.id.slice(0, 8).toUpperCase()}
              </DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">วันที่สั่งซื้อ</p>
                    <p className="font-medium">
                      {format(new Date(selectedOrder.created_at), "d MMMM yyyy HH:mm น.", { locale: th })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">สถานะคำสั่งซื้อ</p>
                    <Badge className={statusColors[selectedOrder.status] || "bg-gray-100 text-gray-800"}>
                      {statusLabels[selectedOrder.status] || selectedOrder.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">สถานะการชำระเงิน</p>
                    <Badge className={paymentStatusColors[selectedOrder.payment_status] || "bg-gray-100 text-gray-800"}>
                      {paymentLabels[selectedOrder.payment_status] || selectedOrder.payment_status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">วิธีการชำระเงิน</p>
                    <p className="font-medium">
                      {selectedOrder.payment_method === "promptpay" ? "PromptPay" : selectedOrder.payment_method}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">ที่อยู่จัดส่ง</p>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_address}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">รายการสินค้า</p>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>สินค้า</TableHead>
                          <TableHead className="text-center">จำนวน</TableHead>
                          <TableHead className="text-right">ราคา</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              ฿{(Number(item.price) * item.quantity).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-lg font-semibold">ยอดรวมทั้งหมด</span>
                  <span className="text-2xl font-bold text-primary">
                    ฿{Number(selectedOrder.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
    </PageTransition>
  );
};

export default OrderHistory;
