import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const Cart = () => {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart();

  const handleCheckout = () => {
    toast.success("ระบบชำระเงินกำลังอยู่ในขั้นตอนการพัฒนา");
    // Simulate checkout - in production, integrate with payment gateway
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold mb-4">ตะกร้าสินค้าว่างเปล่า</h1>
          <p className="text-muted-foreground mb-8">เพิ่มสินค้าลงในตะกร้าเพื่อเริ่มช้อปปิ้ง</p>
          <Button asChild>
            <Link to="/shop">เลือกซื้อสินค้า</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">ตะกร้าสินค้า</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg bg-secondary"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{item.name}</h3>
                      <p className="text-lg font-bold text-primary mb-4">
                        ฿{item.price}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">฿{item.price * item.quantity}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">สรุปคำสั่งซื้อ</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ยอดรวมสินค้า</span>
                    <span>฿{totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ค่าจัดส่ง</span>
                    <span className="text-primary">ฟรี</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>ยอดรวมทั้งหมด</span>
                      <span className="text-primary">฿{totalPrice}</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full mb-3" onClick={handleCheckout}>
                  ดำเนินการชำระเงิน
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/shop">เลือกซื้อสินค้าเพิ่มเติม</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
