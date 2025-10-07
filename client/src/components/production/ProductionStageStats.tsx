import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Package, Weight, Clock, CheckCircle2 } from "lucide-react";

interface ProductionStageStatsProps {
  stage: "film" | "printing" | "cutting";
  data: any[];
}

export default function ProductionStageStats({ stage, data }: ProductionStageStatsProps) {
  const calculateStats = () => {
    let totalOrders = 0;
    let totalRolls = 0;
    let totalWeight = 0;
    let completedRolls = 0;

    if (stage === "film") {
      const ordersSet = new Set();
      data.forEach((order: any) => {
        ordersSet.add(order.id);
        if (order.production_orders) {
          order.production_orders.forEach((po: any) => {
            if (po.rolls) {
              totalRolls += po.rolls.length;
              po.rolls.forEach((roll: any) => {
                totalWeight += parseFloat(roll.weight_kg) || 0;
                if (roll.stage !== "film") {
                  completedRolls++;
                }
              });
            }
          });
        }
      });
      totalOrders = ordersSet.size;
    } else if (stage === "printing") {
      const ordersSet = new Set();
      const productionOrdersSet = new Set();
      
      data.forEach((item: any) => {
        ordersSet.add(item.order_id);
        productionOrdersSet.add(item.production_order_id);
        totalRolls++;
        totalWeight += parseFloat(item.weight_kg) || 0;
        if (item.stage && (item.stage === "cutting" || item.stage === "done")) {
          completedRolls++;
        }
      });
      
      totalOrders = ordersSet.size;
    } else if (stage === "cutting") {
      const ordersSet = new Set();
      
      data.forEach((order: any) => {
        ordersSet.add(order.id);
        if (order.production_orders) {
          order.production_orders.forEach((po: any) => {
            if (po.rolls) {
              totalRolls += po.rolls.length;
              po.rolls.forEach((roll: any) => {
                totalWeight += parseFloat(roll.weight_kg) || 0;
                if (roll.stage === "done" || (roll.cut_weight_total_kg && parseFloat(roll.cut_weight_total_kg) > 0)) {
                  completedRolls++;
                }
              });
            }
          });
        }
      });
      totalOrders = ordersSet.size;
    }

    const progressPercentage = totalRolls > 0 
      ? Math.round((completedRolls / totalRolls) * 100) 
      : 0;

    return {
      totalOrders,
      totalRolls,
      totalWeight,
      completedRolls,
      progressPercentage,
    };
  };

  const stats = calculateStats();

  const getStageName = () => {
    switch (stage) {
      case "film":
        return "مرحلة الفيلم";
      case "printing":
        return "مرحلة الطباعة";
      case "cutting":
        return "مرحلة التقطيع";
      default:
        return "";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {getStageName()}
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
          <p className="text-xs text-muted-foreground">طلب في الطابور</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">عدد الرولات</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRolls}</div>
          <p className="text-xs text-muted-foreground">رول في الطابور</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الوزن</CardTitle>
          <Weight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalWeight.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">كيلوجرام</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">نسبة التقدم</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.progressPercentage}%
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.completedRolls} / {stats.totalRolls} رول مكتمل
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
