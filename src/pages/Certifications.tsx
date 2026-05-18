import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award,
  BadgeCheck,
  Shield,
  Factory,
  FlaskConical,
  Building2,
  Phone,
  Mail,
  MessageCircle,
  Truck,
  Lock,
  RefreshCw,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import SeoHead from "@/components/SeoHead";

import certHerbalQuality from "@/assets/certifications/herbal-quality-2022.jpg";
import certCompanyReg from "@/assets/certifications/company-registration.jpg";
import certTrademark from "@/assets/certifications/trademark-vflow.jpg";
import certPatent from "@/assets/certifications/patent-thai.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: "easeOut" as const },
  }),
};

const fdaList = [
  {
    code: "50-1-16657-5-0107",
    name: "วีโฟลว์ แคปซูล",
    type: "ผลิตภัณฑ์เสริมอาหาร",
  },
  {
    code: "50-1-16657-2-0226",
    name: "เครื่องดื่ม วีโฟลว์ เฮอร์เบิล ดริ้ง",
    type: "ผลิตภัณฑ์เสริมอาหาร ชนิดเครื่องดื่ม",
  },
];

const awards = [
  {
    year: "2022",
    title: "ผลิตภัณฑ์สมุนไพรคุณภาพ ประจำปี 2565",
    org: "กรมการแพทย์แผนไทยและการแพทย์ทางเลือก กระทรวงสาธารณสุข",
  },
  {
    year: "2023",
    title: "รางวัลชนะเลิศ สาขานวัตกรรมเชิงพาณิชย์",
    org: "NSP INNOVATION AWARDS 2023 — ประเภทผลิตภัณฑ์ / กระบวนการนวัตกรรม",
  },
  {
    year: "2023",
    title: "รางวัลชนะเลิศ สาขานวัตกรรมเชิงพาณิชย์ (ระดับประเทศ)",
    org: "RSP Innovation Awards 2023",
  },
  {
    year: "2023",
    title: "รางวัลสุดยอดนวัตกรรม Inventor Awards ด้านเศรษฐกิจ",
    org: "งาน 7 Innovation Awards 2023",
  },
  {
    year: "2023",
    title: "Silver Medal — เวทีนวัตกรรมระดับโลก IWIS 2023",
    org: "กรุงวอร์ซอ ประเทศโปแลนด์",
  },
];

const standards = [
  { code: "GHPs", desc: "Good Hygiene Practices" },
  { code: "HACCP", desc: "Hazard Analysis Critical Control Point" },
  { code: "ISO 9001", desc: "ระบบบริหารคุณภาพ" },
  { code: "ISO 22000", desc: "ระบบบริหารความปลอดภัยอาหาร" },
];

const documents = [
  { src: certHerbalQuality, title: "ผลิตภัณฑ์สมุนไพรคุณภาพ 2565", subtitle: "กรมการแพทย์แผนไทยฯ" },
  { src: certPatent, title: "อนุสิทธิบัตร เลขที่ 21539", subtitle: "องค์ประกอบสมุนไพรสูตร V Flow" },
  { src: certTrademark, title: "เครื่องหมายการค้า V FLOW", subtitle: "ทะเบียนเลขที่ 211114060" },
  { src: certCompanyReg, title: "หนังสือรับรองบริษัท", subtitle: "บริษัท เจดับบลิว เฮอร์เบิล จำกัด" },
];

export default function Certifications() {
  return (
    <PageTransition>
      <SeoHead
        title="ใบรับรองและความน่าเชื่อถือ"
        description="รวมเลข อย. มาตรฐาน GMP/HACCP/ISO รางวัล ใบรับรอง ที่มาของแบรนด์ JW Herbal และข้อมูลบริษัท ที่อยู่ ติดต่อ รวมถึงนโยบายจัดส่งและความเป็นส่วนตัว"
        path="/certifications"
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="max-w-3xl mx-auto text-center"
            >
              <Badge variant="secondary" className="mb-4 gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                Trust & Credibility
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                ใบรับรอง มาตรฐาน และความน่าเชื่อถือ
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                JW HERBAL ดำเนินงานภายใต้มาตรฐานสากล มีเลข อย. รับรอง ผ่านการคัดเลือกเป็นผลิตภัณฑ์สมุนไพรคุณภาพ
                และได้รับรางวัลนวัตกรรมทั้งในและต่างประเทศ
              </p>
            </motion.div>
          </div>
        </section>

        {/* FDA / อย. */}
        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                <BadgeCheck className="h-3.5 w-3.5" /> เลข อย. รับรอง
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                ขึ้นทะเบียนสำนักงานคณะกรรมการอาหารและยา
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4">
              {fdaList.map((f, i) => (
                <motion.div key={f.code} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <BadgeCheck className="h-6 w-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">เลข อย.</p>
                          <p className="text-lg md:text-xl font-bold text-foreground break-all">{f.code}</p>
                          <p className="text-sm font-medium text-foreground mt-2">{f.name}</p>
                          <p className="text-xs text-muted-foreground">{f.type}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Standards */}
        <section className="py-14 md:py-20 bg-secondary/40">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                <Factory className="h-3.5 w-3.5" /> มาตรฐานโรงงานผลิต
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                ผลิตในโรงงานที่ได้รับมาตรฐานสากล
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                คัดสรรวัตถุดิบอย่างเคร่งครัด ผลิตภัณฑ์ V Flow ทำมาจากสมุนไพร 100% ไม่มีส่วนผสมของสารเคมี
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {standards.map((s, i) => (
                <motion.div key={s.code} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card className="text-center hover:-translate-y-1 transition-transform">
                    <CardContent className="p-4 sm:p-6">
                      <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="font-bold text-foreground">{s.code}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Awards */}
        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                <Award className="h-3.5 w-3.5" /> รางวัลและการรับรอง
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                รางวัลที่ JW HERBAL ได้รับ
              </h2>
            </motion.div>

            <div className="grid gap-3 md:gap-4">
              {awards.map((a, i) => (
                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card>
                    <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                        <Award className="h-5 w-5 text-primary" />
                        <span className="text-[10px] font-bold text-primary mt-0.5">{a.year}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{a.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{a.org}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="py-14 md:py-20 bg-secondary/40">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                <FlaskConical className="h-3.5 w-3.5" /> เอกสารและใบรับรอง
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                ภาพใบรับรองและเอกสารที่เกี่ยวข้อง
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {documents.map((d, i) => (
                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card className="overflow-hidden h-full">
                    <a href={d.src} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="aspect-[3/4] overflow-hidden bg-secondary">
                        <img src={d.src} alt={d.title} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    </a>
                    <CardContent className="p-3 sm:p-4">
                      <p className="text-sm font-semibold text-foreground">{d.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{d.subtitle}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Story */}
        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                <Building2 className="h-3.5 w-3.5" /> ที่มาของแบรนด์
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                JW HERBAL — จากงานวิจัยสู่ผลิตภัณฑ์เพื่อคนไทย
              </h2>
            </motion.div>

            <Card>
              <CardContent className="p-6 md:p-8 space-y-4 text-[15px] leading-relaxed text-foreground/90">
                <p>
                  ผลิตภัณฑ์เสริมอาหาร <strong>V Flow</strong> ผลิตจาก <strong>ขิง พุทราจีน และเห็ดหูหนูดำ</strong>{" "}
                  เป็นผลิตภัณฑ์ที่ได้จากงานวิจัยของ <strong>คณะแพทยศาสตร์ และเภสัชศาสตร์ มหาวิทยาลัยเชียงใหม่</strong>{" "}
                  บริหารงานโดยคุณวิสิษฐ กอวรกุล
                </p>
                <p className="text-muted-foreground">
                  จุดเริ่มต้นมาจากการได้รับรู้ข่าวคราวอาการป่วยด้วยโรคหลอดเลือดสมองของคนใกล้ตัวอยู่บ่อยครั้ง
                  จนเห็นว่าเป็นปัญหาสุขภาพที่ส่งผลกระทบต่อผู้คนจำนวนมาก
                  จึงได้ศึกษาและพัฒนาสูตรสมุนไพรร่วมกับทีมวิจัย
                  เพื่อเป็นทางเลือกในการดูแลสุขภาพควบคู่กับการแพทย์แผนปัจจุบัน
                </p>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mt-4">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Vision</p>
                  <p className="italic text-foreground">
                    “V Flow จะเป็นส่วนหนึ่งที่ช่วยให้คนในโลกดูแลสุขภาพหลอดเลือดและมีอายุยืนยาวมากขึ้น
                    พร้อมยกระดับผลิตภัณฑ์สมุนไพรไทยให้มีมาตรฐานระดับสากล”
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Company Info */}
        <section className="py-14 md:py-20 bg-secondary/40">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                <Building2 className="h-3.5 w-3.5" /> ข้อมูลบริษัท
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">บริษัท เจดับบลิว เฮอร์เบิล จำกัด</h2>
            </motion.div>

            <Card>
              <CardContent className="p-6 md:p-8 grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">ที่อยู่</p>
                      <p className="text-sm text-foreground">
                        เลขที่ 9 ซอยสรณคมน์ 12 ถนนสรณคมน์ แขวงสีกัน เขตดอนเมือง กรุงเทพมหานคร 10210
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">โทรศัพท์</p>
                      <a href="tel:0813264444" className="text-sm text-foreground hover:text-primary">081-326-4444</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                      <a href="mailto:Herbal.jwgroup@gmail.com" className="text-sm text-foreground hover:text-primary break-all">
                        Herbal.jwgroup@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">ช่องทางออนไลน์</p>
                  {[
                    { label: "LINE: @jwherbal", url: "https://lin.ee/Nm1P0kw" },
                    { label: "Facebook: JW Herbal", url: "https://www.facebook.com/jwherbal" },
                    { label: "Instagram: JWHerbalThailand", url: "https://bit.ly/3m0VHVa" },
                    { label: "YouTube", url: "https://bit.ly/3AKNsD1" },
                    { label: "TikTok: @jwherbal", url: "https://www.tiktok.com/@jwherbal" },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors text-sm"
                    >
                      <span className="text-foreground">{s.label}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Policies */}
        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                <Lock className="h-3.5 w-3.5" /> นโยบาย
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">นโยบายจัดส่งและความเป็นส่วนตัว</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <Card>
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-foreground">นโยบายการจัดส่งสินค้า</h3>
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    <div>
                      <p className="font-semibold text-foreground mb-1">ระยะเวลาการจัดส่ง</p>
                      <p>ดำเนินการจัดส่งสินค้าภายใน 1–3 วันทำการ หลังจากได้รับการยืนยันคำสั่งซื้อและชำระเงินเรียบร้อยแล้ว (ไม่รวมวันเสาร์–อาทิตย์ และวันหยุดนักขัตฤกษ์)</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">พื้นที่การจัดส่ง</p>
                      <p>จัดส่งสินค้าทั่วประเทศไทย สำหรับพื้นที่ห่างไกลหรือเกาะ อาจใช้ระยะเวลาเพิ่มเติมตามเงื่อนไขของบริษัทขนส่ง</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                        <RefreshCw className="h-4 w-4 text-primary" /> กรณีสินค้าเสียหายระหว่างขนส่ง
                      </p>
                      <p>กรุณาถ่ายภาพสินค้าและบรรจุภัณฑ์ พร้อมแจ้งกลับภายใน 24 ชั่วโมงหลังได้รับสินค้า เพื่อให้บริษัทตรวจสอบและดำเนินการช่วยเหลือ ผ่านช่องทาง LINE: <a href="https://lin.ee/Nm1P0kw" target="_blank" rel="noopener noreferrer" className="text-primary underline">@jwherbal</a></p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-foreground">นโยบายความเป็นส่วนตัว</h3>
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    <div>
                      <p className="font-semibold text-foreground mb-1">การเก็บรวบรวมข้อมูล</p>
                      <p>บริษัทฯ อาจเก็บข้อมูลส่วนบุคคลของลูกค้า เช่น ชื่อ–นามสกุล เบอร์โทรศัพท์ ที่อยู่จัดส่ง อีเมล และข้อมูลการสั่งซื้อ เพื่อใช้ในการให้บริการ จัดส่งสินค้า และดูแลหลังการขาย</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">การรักษาความปลอดภัยของข้อมูล</p>
                      <p>บริษัทฯ ให้ความสำคัญกับความปลอดภัยของข้อมูลลูกค้า และจะไม่เปิดเผยข้อมูลส่วนบุคคลแก่บุคคลภายนอก เว้นแต่ได้รับความยินยอมจากลูกค้า หรือเป็นไปตามที่กฎหมายกำหนด</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">มีคำถามเพิ่มเติม?</h2>
            <p className="text-muted-foreground mb-6">ทีมงาน JW HERBAL พร้อมให้คำปรึกษาผ่านทุกช่องทาง</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <a href="https://lin.ee/Nm1P0kw" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" /> แชท LINE
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">ติดต่อเรา</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/products/vflow">ดูสินค้า V Flow</Link>
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
