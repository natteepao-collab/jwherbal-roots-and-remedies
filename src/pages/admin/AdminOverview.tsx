import { useEffect, useState } from "react";
import { FileText, Users, MessageSquare, Eye, ShoppingCart, Package, TrendingUp, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/admin/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Stats {
  articles: number;
  users: number;
  communityPosts: number;
  totalViews: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalProducts: number;
}

interface RecentOrder {
  id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

interface DailySales {
  date: string;
  sales: number;
  orders: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  confirmed: "ยืนยันแล้ว",
  shipped: "จัดส่งแล้ว",
  delivered: "ส่งมอบแล้ว",
  cancelled: "ยกเลิก",
};

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({
    articles: 0,
    users: 0,
    communityPosts: 0,
    totalViews: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);

    // Fetch counts in parallel
    const [articlesRes, usersRes, communityRes, ordersRes, productsRes, pendingOrdersRes] = await Promise.all([
      supabase.from("articles").select("id", { count: "exact" }),
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("community_posts").select("id, views", { count: "exact" }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("id", { count: "exact" }),
      supabase.from("orders").select("id", { count: "exact" }).eq("status", "pending"),
    ]);

    const totalViews = communityRes.data?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;
    const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

    setStats({
      articles: articlesRes.count || 0,
      users: usersRes.count || 0,
      communityPosts: communityRes.count || 0,
      totalViews,
      totalOrders: ordersRes.data?.length || 0,
      totalRevenue,
      pendingOrders: pendingOrdersRes.count || 0,
      totalProducts: productsRes.count || 0,
    });

    // Recent orders
    setRecentOrders((ordersRes.data || []).slice(0, 5));

    // Calculate daily sales for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return format(date, "yyyy-MM-dd");
    });

    const salesByDate = last7Days.map((date) => {
      const dayOrders = ordersRes.data?.filter(
        (order) => format(new Date(order.created_at), "yyyy-MM-dd") === date
      ) || [];
      return {
        date: format(new Date(date), "d MMM", { locale: th }),
        sales: dayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0),
        orders: dayOrders.length,
      };
    });
    setDailySales(salesByDate);

    // Orders by status
    const statusCounts = (ordersRes.data || []).reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setOrdersByStatus(
      Object.entries(statusCounts).map(([name, value]) => ({
        name: statusLabels[name] || name,
        value,
      }))
    );

    setLoading(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">ภาพรวม Dashboard</h1>
        <p className="text-muted-foreground mt-1">สรุปยอดขาย คำสั่งซื้อ และสถิติของระบบ</p>
      </div>

      {/* Sales Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="ยอดขายรวม"
          value={`฿${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          description="รายได้ทั้งหมด"
        />
        <StatsCard
          title="คำสั่งซื้อทั้งหมด"
          value={stats.totalOrders}
          icon={ShoppingCart}
          description="จำนวนคำสั่งซื้อ"
        />
        <StatsCard
          title="รอดำเนินการ"
          value={stats.pendingOrders}
          icon={TrendingUp}
          description="คำสั่งซื้อที่รอดำเนินการ"
        />
        <StatsCard
          title="สินค้าทั้งหมด"
          value={stats.totalProducts}
          icon={Package}
          description="จำนวนสินค้าในระบบ"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ยอดขาย 7 วันล่าสุด</CardTitle>
            <CardDescription>กราฟแสดงยอดขายรายวัน</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                กำลังโหลด...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(value) => `฿${value.toLocaleString()}`} />
                  <Tooltip
                    formatter={(value: number) => [`฿${value.toLocaleString()}`, "ยอดขาย"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">สถานะคำสั่งซื้อ</CardTitle>
            <CardDescription>สัดส่วนคำสั่งซื้อตามสถานะ</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                กำลังโหลด...
              </div>
            ) : ordersByStatus.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                ยังไม่มีคำสั่งซื้อ
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={ordersByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {ordersByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Orders Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">จำนวนคำสั่งซื้อ 7 วันล่าสุด</CardTitle>
          <CardDescription>กราฟแสดงจำนวนคำสั่งซื้อรายวัน</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              กำลังโหลด...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  formatter={(value: number) => [value, "คำสั่งซื้อ"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Other Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="บทความทั้งหมด"
          value={stats.articles}
          icon={FileText}
          description="บทความสุขภาพ"
        />
        <StatsCard
          title="ผู้ใช้ทั้งหมด"
          value={stats.users}
          icon={Users}
          description="ผู้ใช้ที่ลงทะเบียน"
        />
        <StatsCard
          title="โพสต์คอมมูนิตี้"
          value={stats.communityPosts}
          icon={MessageSquare}
          description="โพสต์ในชุมชน"
        />
        <StatsCard
          title="ยอดเข้าชมรวม"
          value={stats.totalViews.toLocaleString()}
          icon={Eye}
          description="ยอดเข้าชมโพสต์"
        />
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">คำสั่งซื้อล่าสุด</CardTitle>
          <CardDescription>คำสั่งซื้อล่าสุด 5 รายการ</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>
          ) : recentOrders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">ยังไม่มีคำสั่งซื้อ</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>หมายเลข</TableHead>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>ยอดรวม</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>วันที่</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell className="font-medium">{order.customer_name}</TableCell>
                    <TableCell className="font-semibold">
                      ฿{Number(order.total_amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status] || "bg-gray-100 text-gray-800"}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(order.created_at), "d MMM yyyy", { locale: th })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
