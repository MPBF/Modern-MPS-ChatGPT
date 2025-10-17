import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { FormControl } from "../ui/form";
import type { ProductionOrder } from "../../../../shared/schema";
export function ProductionOrderSelect({ value, onChange, loading, orders }:{ value?: number; onChange:(id:number)=>void; loading?: boolean; orders: ProductionOrder[]; }) {
  return (
    <Select value={value != null ? String(value) : undefined} onValueChange={(val)=>onChange(Number.parseInt(val,10))} disabled={loading}>
      <FormControl><SelectTrigger><SelectValue placeholder="اختر أمر الإنتاج" /></SelectTrigger></FormControl>
      <SelectContent>
        {loading ? <SelectItem value="loading" disabled>جارِ التحميل...</SelectItem> : (orders.length ? orders.filter(o=>o.id).map((o)=>(
          <SelectItem key={o.id} value={String(o.id)}>
            {o.production_order_number} - {(o as any).customer_name_ar || (o as any).customer_name || "غير محدد"} - {(o as any).item_name_ar || (o as any).item_name || (o as any).size_caption || "غير محدد"}
          </SelectItem>
        )) : <SelectItem value="empty" disabled>لا توجد أوامر إنتاج متاحة</SelectItem>)}
      </SelectContent>
    </Select>
  );
}