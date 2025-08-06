import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle, Plus, Edit, Trash2, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

const erpConfigSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  name_ar: z.string().min(1, "الاسم باللغة العربية مطلوب"),
  type: z.enum(["SAP", "Oracle", "Odoo", "QuickBooks", "Custom"]),
  endpoint: z.string().url("رابط غير صحيح"),
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
  is_active: z.boolean().default(true),
  sync_frequency: z.number().min(5, "الحد الأدنى 5 دقائق").default(60)
});

type ERPConfigFormValues = z.infer<typeof erpConfigSchema>;

export default function ERPIntegration() {
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch ERP configurations
  const { data: configurations = [], isLoading: configsLoading } = useQuery({
    queryKey: ["/api/erp/configurations"],
  });

  // Fetch sync logs
  const { data: syncLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["/api/erp/sync-logs"],
  });

  const form = useForm<ERPConfigFormValues>({
    resolver: zodResolver(erpConfigSchema),
    defaultValues: {
      name: "",
      name_ar: "",
      type: "SAP",
      endpoint: "",
      username: "",
      password: "",
      is_active: true,
      sync_frequency: 60
    }
  });

  // Create configuration mutation
  const createConfig = useMutation({
    mutationFn: async (data: ERPConfigFormValues) => {
      const response = await fetch("/api/erp/configurations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("فشل في إنشاء الإعدادات");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/erp/configurations"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({ title: "تم إنشاء إعدادات ERP بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في إنشاء الإعدادات", variant: "destructive" });
    }
  });

  // Test connection mutation
  const testConnection = useMutation({
    mutationFn: async (config: any) => {
      const response = await fetch("/api/erp/test-connection", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      return result;
    },
    onSuccess: (data) => {
      toast({ 
        title: "نجح اختبار الاتصال", 
        description: `الوقت المستغرق: ${data.details?.responseTime}ms` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "فشل اختبار الاتصال", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Sync entities mutation
  const syncEntities = useMutation({
    mutationFn: async ({ configId, entityType }: { configId: number; entityType: string }) => {
      const response = await fetch(`/api/erp/sync/${configId}/${entityType}`, {
        method: "POST"
      });
      if (!response.ok) throw new Error("فشل في المزامنة");
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/erp/sync-logs"] });
      toast({ 
        title: "تمت المزامنة بنجاح", 
        description: `تم معالجة ${data.success} عنصر بنجاح${data.failed > 0 ? ` و ${data.failed} فشل` : ''}` 
      });
    },
    onError: () => {
      toast({ title: "خطأ في المزامنة", variant: "destructive" });
    }
  });

  const onSubmit = (data: ERPConfigFormValues) => {
    createConfig.mutate(data);
  };

  const handleTestConnection = (config: any) => {
    testConnection.mutate(config);
  };

  const handleSync = (configId: number, entityType: string) => {
    syncEntities.mutate({ configId, entityType });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      success: "default",
      failed: "destructive", 
      partial: "secondary",
      pending: "outline"
    };
    
    const icons: Record<string, React.ReactElement> = {
      success: <CheckCircle className="h-3 w-3" />,
      failed: <XCircle className="h-3 w-3" />,
      partial: <AlertTriangle className="h-3 w-3" />,
      pending: <Clock className="h-3 w-3" />
    };

    return (
      <Badge variant={variants[status] || "outline"} className="flex items-center gap-1">
        {icons[status] || <Clock className="h-3 w-3" />}
        {status === 'success' ? 'نجح' : status === 'failed' ? 'فشل' : status === 'partial' ? 'جزئي' : 'في الانتظار'}
      </Badge>
    );
  };

  const getSystemIcon = (type: string) => {
    const icons: Record<string, string> = {
      SAP: "🏢",
      Oracle: "🔶", 
      Odoo: "🟣",
      QuickBooks: "💰",
      Custom: "⚙️"
    };
    return icons[type] || "⚙️";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">تكامل أنظمة ERP</h1>
          <p className="text-muted-foreground">إدارة التكامل مع أنظمة ERP الخارجية</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              إضافة نظام ERP
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة نظام ERP جديد</DialogTitle>
              <DialogDescription>
                قم بإعداد التكامل مع نظام ERP خارجي
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم النظام</FormLabel>
                        <FormControl>
                          <Input placeholder="SAP Production System" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name_ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم النظام بالعربية</FormLabel>
                        <FormControl>
                          <Input placeholder="نظام ساب للإنتاج" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع النظام</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نوع النظام" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SAP">SAP</SelectItem>
                            <SelectItem value="Oracle">Oracle</SelectItem>
                            <SelectItem value="Odoo">Odoo</SelectItem>
                            <SelectItem value="QuickBooks">QuickBooks</SelectItem>
                            <SelectItem value="Custom">مخصص</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sync_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تكرار المزامنة (دقيقة)</FormLabel>
                        <FormControl>
                          <Input type="number" min="5" {...field} onChange={e => field.onChange(+e.target.value)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="endpoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط النظام</FormLabel>
                      <FormControl>
                        <Input placeholder="https://sap-server.company.com:8000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المستخدم</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كلمة المرور</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">تفعيل النظام</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          تفعيل المزامنة التلقائية مع هذا النظام
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleTestConnection(form.getValues())}
                    disabled={testConnection.isPending}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {testConnection.isPending ? "جاري الاختبار..." : "اختبار الاتصال"}
                  </Button>
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      إلغاء
                    </Button>
                    <Button type="submit" disabled={createConfig.isPending}>
                      {createConfig.isPending ? "جاري الحفظ..." : "حفظ"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="configurations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configurations">إعدادات الأنظمة</TabsTrigger>
          <TabsTrigger value="sync-logs">سجلات المزامنة</TabsTrigger>
          <TabsTrigger value="mappings">ربط البيانات</TabsTrigger>
        </TabsList>

        <TabsContent value="configurations" className="space-y-4">
          {configsLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(configurations as any[]).map((config: any) => (
                <Card key={config.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getSystemIcon(config.type)}</span>
                        <div>
                          <CardTitle className="text-lg">{config.name_ar || config.name}</CardTitle>
                          <CardDescription>{config.type}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={config.is_active ? "default" : "secondary"}>
                        {config.is_active ? "نشط" : "غير نشط"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-1">
                      <div><strong>الخدمة:</strong> {config.endpoint}</div>
                      <div><strong>تكرار المزامنة:</strong> كل {config.sync_frequency} دقيقة</div>
                      {config.last_sync && (
                        <div><strong>آخر مزامنة:</strong> {new Date(config.last_sync).toLocaleString('ar-SA')}</div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSync(config.id, "customers")}
                        disabled={syncEntities.isPending}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        العملاء
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSync(config.id, "products")}
                        disabled={syncEntities.isPending}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        المنتجات
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSync(config.id, "orders")}
                        disabled={syncEntities.isPending}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        الطلبات
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sync-logs" className="space-y-4">
          {logsLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>سجلات المزامنة</CardTitle>
                <CardDescription>تتبع عمليات المزامنة مع أنظمة ERP</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>النظام</TableHead>
                      <TableHead>نوع البيانات</TableHead>
                      <TableHead>العملية</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>المعالج</TableHead>
                      <TableHead>نجح</TableHead>
                      <TableHead>فشل</TableHead>
                      <TableHead>المدة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(syncLogs as any[]).map((log: any) => {
                      const config = (configurations as any[]).find((c: any) => c.id === log.erp_config_id);
                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            {new Date(log.created_at).toLocaleString('ar-SA')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{getSystemIcon(config?.type || 'Custom')}</span>
                              {config?.name_ar || config?.name || 'غير معروف'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {log.entity_type === 'customers' ? 'العملاء' : 
                             log.entity_type === 'products' ? 'المنتجات' : 
                             log.entity_type === 'orders' ? 'الطلبات' : log.entity_type}
                          </TableCell>
                          <TableCell>
                            {log.operation === 'sync_in' ? 'استيراد' :
                             log.operation === 'sync_out' ? 'تصدير' :
                             log.operation === 'manual_sync' ? 'مزامنة يدوية' : log.operation}
                          </TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                          <TableCell>{log.records_processed}</TableCell>
                          <TableCell className="text-green-600 font-medium">{log.records_success}</TableCell>
                          <TableCell className="text-red-600 font-medium">{log.records_failed}</TableCell>
                          <TableCell>{log.sync_duration}ث</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mappings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ربط البيانات</CardTitle>
              <CardDescription>إدارة ربط البيانات بين النظام المحلي وأنظمة ERP</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>سيتم إضافة إعدادات ربط البيانات قريباً</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </main>
      </div>
    </div>
  );
}