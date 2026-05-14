import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Eye, RefreshCw, CheckCircle2, XCircle, MinusCircle, Send, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface NotificationLog {
  id: string;
  notification_type: string;
  channel: string;
  status: string;
  dedupe_key: string | null;
  error_message: string | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  payment_slip_url?: string | null;
  payment_slip_uploaded_at?: string | null;
  created_at: string;
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
  delivered: "ส่งสำเร็จ",
  cancelled: "ยกเลิก",
};

const paymentLabels: Record<string, string> = {
  pending: "รอชำระ",
  paid: "ชำระแล้ว",
  failed: "ไม่สำเร็จ",
};

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders", filter],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Order[];
    },
  });

  const fetchOrderItems = async (orderId: string) => {
    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);
    if (error) {
      toast.error("ไม่สามารถโหลดรายการสินค้าได้");
      return;
    }
    setOrderItems(data as OrderItem[]);
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      field,
      value,
      order,
    }: {
      id: string;
      field: "status" | "payment_status";
      value: string;
      order?: Order;
    }) => {
      const { error } = await supabase
        .from("orders")
        .update({ [field]: value } as any)
        .eq("id", id);
      if (error) throw error;

      // Notify admins when order is cancelled
      if (field === "status" && value === "cancelled" && order && order.status !== "cancelled") {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          await supabase.functions.invoke("send-admin-notification", {
            body: {
              type: "order_cancelled",
              force: true,
              data: {
                order_id: order.id,
                customer_name: order.customer_name,
                total_amount: Number(order.total_amount),
                cancelled_by: user?.email ?? "Admin",
              },
            },
          });
        } catch (e) {
          console.error("Failed to send cancel notification:", e);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("อัปเดตสถานะเรียบร้อย");
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const { data: notifLogs, refetch: refetchLogs } = useQuery({
    queryKey: ["notification-logs", selectedOrder?.id],
    enabled: !!selectedOrder?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_logs" as any)
        .select("*")
        .eq("reference_id", selectedOrder!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as NotificationLog[];
    },
  });

  const retryMutation = useMutation({
    mutationFn: async (notifType: string) => {
      if (!selectedOrder) throw new Error("no order");
      const isSlip = notifType === "slip_uploaded";
      const { error } = await supabase.functions.invoke("send-admin-notification", {
        body: {
          type: notifType,
          force: true,
          data: {
            order_id: selectedOrder.id,
            customer_name: selectedOrder.customer_name,
            total_amount: Number(selectedOrder.total_amount),
            ...(isSlip ? { slip_url: selectedOrder.payment_slip_url ?? "" } : {}),
          },
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("ส่งแจ้งเตือนซ้ำเรียบร้อย");
      refetchLogs();
    },
    onError: (e: any) => toast.error("ส่งซ้ำไม่สำเร็จ: " + e.message),
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderItems(order.id);
  };

  const statusBadge = (s: string) => {
    if (s === "success") return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="h-3 w-3 mr-1" />สำเร็จ</Badge>;
    if (s === "failed") return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />ล้มเหลว</Badge>;
    if (s === "skipped") return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100"><MinusCircle className="h-3 w-3 mr-1" />ข้าม</Badge>;
    if (s === "deduped") return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">ซ้ำ (กันส่งซ้ำ)</Badge>;
    return <Badge variant="outline">{s}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">จัดการคำสั่งซื้อ</h1>
        <p className="text-muted-foreground">ตรวจสอบและอัปเดตสถานะคำสั่งซื้อ</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          ทั้งหมด
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
        >
          รอดำเนินการ
        </Button>
        <Button
          variant={filter === "confirmed" ? "default" : "outline"}
          onClick={() => setFilter("confirmed")}
        >
          ยืนยันแล้ว
        </Button>
        <Button
          variant={filter === "shipped" ? "default" : "outline"}
          onClick={() => setFilter("shipped")}
        >
          จัดส่งแล้ว
        </Button>
        <Button
          variant={filter === "delivered" ? "default" : "outline"}
          onClick={() => setFilter("delivered")}
        >
          ส่งสำเร็จ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            รายการคำสั่งซื้อ ({orders?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>กำลังโหลด...</p>
          ) : orders?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              ยังไม่มีคำสั่งซื้อ
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เลขที่</TableHead>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>ยอดรวม</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การชำระเงิน</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.customer_phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ฿{order.total_amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => {
                          if (value === "cancelled" && order.status !== "cancelled") {
                            setCancelTarget(order);
                            return;
                          }
                          updateStatusMutation.mutate({
                            id: order.id,
                            field: "status",
                            value,
                            order,
                          });
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">รอดำเนินการ</SelectItem>
                          <SelectItem value="confirmed">ยืนยันแล้ว</SelectItem>
                          <SelectItem value="shipped">จัดส่งแล้ว</SelectItem>
                          <SelectItem value="delivered">ส่งสำเร็จ</SelectItem>
                          <SelectItem value="cancelled">ยกเลิก</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.payment_status}
                        onValueChange={(value) =>
                          updateStatusMutation.mutate({
                            id: order.id,
                            field: "payment_status",
                            value,
                          })
                        }
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">รอชำระ</SelectItem>
                          <SelectItem value="paid">ชำระแล้ว</SelectItem>
                          <SelectItem value="failed">ไม่สำเร็จ</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), "d MMM yyyy HH:mm", {
                        locale: th,
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={selectedOrder !== null}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>รายละเอียดคำสั่งซื้อ</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">ชื่อลูกค้า</p>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">เบอร์โทร</p>
                  <p className="font-medium">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">อีเมล</p>
                  <p className="font-medium">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">วิธีชำระเงิน</p>
                  <p className="font-medium">
                    {selectedOrder.payment_method === "promptpay"
                      ? "PromptPay QR"
                      : "Line Pay"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">ที่อยู่จัดส่ง</p>
                <p className="font-medium">{selectedOrder.customer_address}</p>
              </div>
              <div className="border-t pt-4">
                <p className="font-semibold mb-2">สลิปการชำระเงิน</p>
                {selectedOrder.payment_slip_url ? (
                  <div className="space-y-2">
                    <a href={selectedOrder.payment_slip_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={selectedOrder.payment_slip_url}
                        alt="สลิปชำระเงิน"
                        className="max-h-80 rounded-lg border mx-auto hover:opacity-90 transition"
                      />
                    </a>
                    {selectedOrder.payment_slip_uploaded_at && (
                      <p className="text-xs text-muted-foreground text-center">
                        แนบเมื่อ {format(new Date(selectedOrder.payment_slip_uploaded_at), "d MMM yyyy HH:mm", { locale: th })}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">ลูกค้ายังไม่ได้แนบสลิป</p>
                )}
              </div>
              <div className="border-t pt-4">
                <p className="font-semibold mb-2">รายการสินค้า</p>
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between py-2 border-b"
                  >
                    <span>
                      {item.product_name} x {item.quantity}
                    </span>
                    <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-bold text-lg">
                  <span>ยอดรวม</span>
                  <span className="text-primary">
                    ฿{selectedOrder.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">สถานะการแจ้งเตือน LINE / Email</p>
                  <Button size="sm" variant="ghost" onClick={() => refetchLogs()} title="รีเฟรช">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => retryMutation.mutate("new_order")}
                    disabled={retryMutation.isPending}
                  >
                    <Send className="h-3.5 w-3.5 mr-1" />
                    ส่งแจ้งคำสั่งซื้อซ้ำ
                  </Button>
                  {selectedOrder.payment_slip_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retryMutation.mutate("slip_uploaded")}
                      disabled={retryMutation.isPending}
                    >
                      <Send className="h-3.5 w-3.5 mr-1" />
                      ส่งแจ้งสลิปซ้ำ
                    </Button>
                  )}
                </div>

                {!notifLogs || notifLogs.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">ยังไม่มีบันทึกการส่งแจ้งเตือน</p>
                ) : (
                  <div className="space-y-2">
                    {notifLogs.map((log) => {
                      const isFailed = log.status === "failed";
                      return (
                        <div
                          key={log.id}
                          className="flex items-start justify-between gap-2 p-2 rounded border bg-muted/30 text-xs"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium uppercase">{log.channel}</span>
                              {statusBadge(log.status)}
                              <span className="text-muted-foreground">{log.notification_type}</span>
                            </div>
                            <p className="text-muted-foreground mt-1">
                              {format(new Date(log.created_at), "d MMM HH:mm:ss", { locale: th })}
                            </p>
                            {log.dedupe_key && (
                              <p className="text-[10px] text-muted-foreground truncate" title={log.dedupe_key}>
                                dedupe: {log.dedupe_key}
                              </p>
                            )}
                            {log.error_message && (
                              <p className="text-red-600 mt-1 break-words">{log.error_message}</p>
                            )}
                          </div>
                          {isFailed && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="shrink-0"
                              onClick={() => retryMutation.mutate(log.notification_type)}
                              disabled={retryMutation.isPending}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              ลองใหม่
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={cancelTarget !== null} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการยกเลิกคำสั่งซื้อ?</AlertDialogTitle>
            <AlertDialogDescription>
              คุณกำลังจะยกเลิกคำสั่งซื้อของ <strong>{cancelTarget?.customer_name}</strong>
              {" "}ยอดรวม <strong>฿{cancelTarget?.total_amount.toLocaleString()}</strong>
              <br />การกระทำนี้จะส่งแจ้งเตือนไปยังแอดมินทันที และไม่สามารถย้อนกลับได้โดยอัตโนมัติ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ไม่ใช่</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (cancelTarget) {
                  updateStatusMutation.mutate({
                    id: cancelTarget.id,
                    field: "status",
                    value: "cancelled",
                    order: cancelTarget,
                  });
                }
                setCancelTarget(null);
              }}
            >
              ยืนยันยกเลิก
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminOrders;
