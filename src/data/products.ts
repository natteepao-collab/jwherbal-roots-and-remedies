import productTea from "@/assets/product-tea.jpg";
import productCapsule from "@/assets/product-capsule.jpg";
import productCream from "@/assets/product-cream.jpg";
import productOil from "@/assets/product-oil.jpg";

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  rating: number;
}

export const products: Product[] = [
  {
    id: 1,
    name: "ชาเขียวสมุนไพร GreenEase",
    price: 299,
    image: productTea,
    category: "ชาสมุนไพร",
    description: "ชาเขียวผสมสมุนไพรธรรมชาติ ช่วยผ่อนคลาย ชูกำลัง และดีท็อกซ์ร่างกาย",
    rating: 4.8,
  },
  {
    id: 2,
    name: "แคปซูลขมิ้นชัน Turmerix",
    price: 450,
    image: productCapsule,
    category: "สมุนไพรแคปซูล",
    description: "แคปซูลขมิ้นชันสกัดเข้มข้น ช่วยบำรุงตับ ต้านอนุมูลอิสระ และเสริมสร้างภูมิคุ้มกัน",
    rating: 4.9,
  },
  {
    id: 3,
    name: "ครีมสมุนไพรลดปวด HerbaRelief",
    price: 350,
    image: productCream,
    category: "ครีมสมุนไพร",
    description: "ครีมสมุนไพรธรรมชาติ บรรเทาอาการปวดกล้ามเนื้อ ปวดข้อ ผ่อนคลายร่างกาย",
    rating: 4.7,
  },
  {
    id: 4,
    name: "น้ำมันมะพร้าวสกัดเย็น CocoBalance",
    price: 380,
    image: productOil,
    category: "น้ำมันสมุนไพร",
    description: "น้ำมันมะพร้าวสกัดเย็น 100% ช่วยบำรุงผิว ผม และสุขภาพโดยรวม",
    rating: 4.6,
  },
  {
    id: 5,
    name: "ชาฟ้าทะลายโจร ImmuniTea",
    price: 320,
    image: productTea,
    category: "ชาสมุนไพร",
    description: "ชาฟ้าทะลายโจรผสมสมุนไพร เสริมภูมิคุ้มกัน ลดอาการเจ็บคอ",
    rating: 4.8,
  },
  {
    id: 6,
    name: "แคปซูลกระชายดำ BlackGinger Plus",
    price: 480,
    image: productCapsule,
    category: "สมุนไพรแคปซูล",
    description: "กระชายดำสกัดเข้มข้น บำรุงกำลัง เพิ่มพลังงาน และสุขภาพโดยรวม",
    rating: 4.7,
  },
  {
    id: 7,
    name: "ครีมว่านหางจระเข้ AloeVera Care",
    price: 280,
    image: productCream,
    category: "ครีมสมุนไพร",
    description: "ครีมว่านหางจระเข้บริสุทธิ์ บำรุงผิว ลดการอักเสบ ให้ความชุ่มชื้น",
    rating: 4.9,
  },
  {
    id: 8,
    name: "น้ำมันสกัดกัญชง HempOil Wellness",
    price: 520,
    image: productOil,
    category: "น้ำมันสมุนไพร",
    description: "น้ำมันสกัดจากกัญชง ช่วยผ่อนคลาย ลดความเครียด และบำรุงสุขภาพ",
    rating: 4.5,
  },
];

export const categories = Array.from(new Set(products.map((p) => p.category)));
