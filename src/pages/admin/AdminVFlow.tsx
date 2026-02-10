import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Save, Plus, Trash2, Loader2 } from "lucide-react";

const AdminVFlow = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["vflow-page-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vflow_page_settings" as any)
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data as any;
    },
  });

  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [researchTitle, setResearchTitle] = useState("");
  const [researchDescription, setResearchDescription] = useState("");
  const [researchPoints, setResearchPoints] = useState<string[]>([]);
  const [painPoints, setPainPoints] = useState<{ icon: string; text: string }[]>([]);
  const [howToUse, setHowToUse] = useState<{ step: number; text: string; icon: string }[]>([]);
  const [tip, setTip] = useState("");
  const [certificates, setCertificates] = useState<string[]>([]);
  const [brandValues, setBrandValues] = useState<string[]>([]);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);

  useEffect(() => {
    if (settings) {
      setTagline(settings.tagline || "");
      setDescription(settings.description || "");
      setHighlights(settings.highlights || []);
      setResearchTitle(settings.research_title || "");
      setResearchDescription(settings.research_description || "");
      setResearchPoints(settings.research_points || []);
      setPainPoints(settings.pain_points || []);
      setHowToUse(settings.how_to_use || []);
      setTip(settings.tip || "");
      setCertificates(settings.certificates || []);
      setBrandValues(settings.brand_values || []);
      setFaqs(settings.faqs || []);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("vflow_page_settings" as any)
        .update({
          tagline,
          description,
          highlights,
          research_title: researchTitle,
          research_description: researchDescription,
          research_points: researchPoints,
          pain_points: painPoints,
          how_to_use: howToUse,
          tip,
          certificates,
          brand_values: brandValues,
          faqs,
        } as any)
        .eq("id", settings?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vflow-page-settings"] });
      toast({ title: "บันทึกสำเร็จ", description: "ข้อมูลหน้า V Flow ถูกอัปเดตแล้ว" });
    },
    onError: () => {
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถบันทึกข้อมูลได้", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Helper for string array editing
  const StringListEditor = ({
    items,
    setItems,
    label,
    placeholder,
  }: {
    items: string[];
    setItems: (v: string[]) => void;
    label: string;
    placeholder?: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => {
              const updated = [...items];
              updated[i] = e.target.value;
              setItems(updated);
            }}
            placeholder={placeholder}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setItems(items.filter((_, idx) => idx !== i))}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setItems([...items, ""])}
        className="gap-1"
      >
        <Plus className="h-3 w-3" /> เพิ่มรายการ
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">จัดการหน้า V Flow</h1>
          <p className="text-muted-foreground text-sm">แก้ไขเนื้อหาทั้งหมดในหน้าผลิตภัณฑ์ V Flow</p>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          บันทึก
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["hero", "highlights"]} className="space-y-3">
        {/* Hero Section */}
        <AccordionItem value="hero" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger className="font-semibold">ส่วน Hero (หัวเรื่อง)</AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <div>
              <Label>Tagline</Label>
              <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
            </div>
            <div>
              <Label>คำอธิบาย</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Highlights */}
        <AccordionItem value="highlights" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger className="font-semibold">จุดเด่น ({highlights.length} รายการ)</AccordionTrigger>
          <AccordionContent className="pb-4">
            <StringListEditor items={highlights} setItems={setHighlights} label="" placeholder="จุดเด่นของผลิตภัณฑ์" />
          </AccordionContent>
        </AccordionItem>

        {/* Research */}
        <AccordionItem value="research" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger className="font-semibold">ส่วนงานวิจัย</AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <div>
              <Label>หัวข้อ</Label>
              <Input value={researchTitle} onChange={(e) => setResearchTitle(e.target.value)} />
            </div>
            <div>
              <Label>คำอธิบาย</Label>
              <Textarea value={researchDescription} onChange={(e) => setResearchDescription(e.target.value)} rows={3} />
            </div>
            <StringListEditor items={researchPoints} setItems={setResearchPoints} label="จุดเด่นงานวิจัย" placeholder="เช่น ผ่านการทดสอบ..." />
          </AccordionContent>
        </AccordionItem>

        {/* Pain Points */}
        <AccordionItem value="painpoints" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger className="font-semibold">ปัญหาที่เหมาะสำหรับ ({painPoints.length} รายการ)</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            {painPoints.map((pp, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  value={pp.icon}
                  onChange={(e) => {
                    const updated = [...painPoints];
                    updated[i] = { ...pp, icon: e.target.value };
                    setPainPoints(updated);
                  }}
                  className="w-16 text-center"
                  placeholder="🔥"
                />
                <Input
                  value={pp.text}
                  onChange={(e) => {
                    const updated = [...painPoints];
                    updated[i] = { ...pp, text: e.target.value };
                    setPainPoints(updated);
                  }}
                  className="flex-1"
                  placeholder="อาการ..."
                />
                <Button variant="ghost" size="icon" onClick={() => setPainPoints(painPoints.filter((_, idx) => idx !== i))}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setPainPoints([...painPoints, { icon: "❓", text: "" }])} className="gap-1">
              <Plus className="h-3 w-3" /> เพิ่มอาการ
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* How to Use */}
        <AccordionItem value="howtouse" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger className="font-semibold">วิธีใช้ ({howToUse.length} ขั้นตอน)</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            {howToUse.map((step, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-sm font-bold text-muted-foreground w-6">{i + 1}</span>
                <Input
                  value={step.icon}
                  onChange={(e) => {
                    const updated = [...howToUse];
                    updated[i] = { ...step, icon: e.target.value };
                    setHowToUse(updated);
                  }}
                  className="w-16 text-center"
                  placeholder="📦"
                />
                <Input
                  value={step.text}
                  onChange={(e) => {
                    const updated = [...howToUse];
                    updated[i] = { ...step, text: e.target.value };
                    setHowToUse(updated);
                  }}
                  className="flex-1"
                  placeholder="ขั้นตอน..."
                />
                <Button variant="ghost" size="icon" onClick={() => setHowToUse(howToUse.filter((_, idx) => idx !== i))}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHowToUse([...howToUse, { step: howToUse.length + 1, text: "", icon: "📦" }])}
              className="gap-1"
            >
              <Plus className="h-3 w-3" /> เพิ่มขั้นตอน
            </Button>
            <div className="mt-4">
              <Label>เคล็ดลับ</Label>
              <Input value={tip} onChange={(e) => setTip(e.target.value)} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Certificates */}
        <AccordionItem value="certificates" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger className="font-semibold">มาตรฐาน/ใบรับรอง ({certificates.length} รายการ)</AccordionTrigger>
          <AccordionContent className="pb-4">
            <StringListEditor items={certificates} setItems={setCertificates} label="" placeholder="เช่น เลข อย., GMP..." />
          </AccordionContent>
        </AccordionItem>

        {/* Brand Values */}
        <AccordionItem value="brandvalues" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger className="font-semibold">จุดเด่นแบรนด์ ({brandValues.length} รายการ)</AccordionTrigger>
          <AccordionContent className="pb-4">
            <StringListEditor items={brandValues} setItems={setBrandValues} label="" placeholder="คุณค่าของแบรนด์..." />
          </AccordionContent>
        </AccordionItem>

        {/* FAQs */}
        <AccordionItem value="faqs" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger className="font-semibold">คำถามที่พบบ่อย ({faqs.length} ข้อ)</AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <Label className="text-xs text-muted-foreground">ข้อ {i + 1}</Label>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                  <Input
                    value={faq.question}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[i] = { ...faq, question: e.target.value };
                      setFaqs(updated);
                    }}
                    placeholder="คำถาม..."
                  />
                  <Textarea
                    value={faq.answer}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[i] = { ...faq, answer: e.target.value };
                      setFaqs(updated);
                    }}
                    placeholder="คำตอบ..."
                    rows={2}
                  />
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" size="sm" onClick={() => setFaqs([...faqs, { question: "", answer: "" }])} className="gap-1">
              <Plus className="h-3 w-3" /> เพิ่มคำถาม
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Bottom save button */}
      <div className="flex justify-end">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          บันทึกทั้งหมด
        </Button>
      </div>
    </div>
  );
};

export default AdminVFlow;
