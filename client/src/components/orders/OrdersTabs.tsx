import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { Alert, AlertDescription } from "../ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Plus, Trash2, RefreshCw, ChevronDown } from "lucide-react";
import OrdersSearch from "./OrdersSearch";
import OrdersTable from "./OrdersTable";
import OrdersForm from "./OrdersForm";

interface OrdersTabsProps {
  orders: any[];
  productionOrders: any[];
  customers: any[];
  customerProducts: any[];
  users: any[];
  items: any[];
  categories: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  productionSearchTerm: string;
  setProductionSearchTerm: (term: string) => void;
  productionStatusFilter: string;
  setProductionStatusFilter: (status: string) => void;
  filteredOrders: any[];
  filteredProductionOrders: any[];
  isOrderDialogOpen: boolean;
  setIsOrderDialogOpen: (open: boolean) => void;
  editingOrder: any;
  onAddOrder: () => void;
  onEditOrder: (order: any) => void;
  onDeleteOrder: (order: any) => void;
  onStatusChange: (order: any, status: string) => void;
  onViewOrder: (order: any) => void;
  onPrintOrder: (order: any) => void;
  onOrderSubmit: (data: any, productionOrders: any[]) => void;
  onBulkDelete?: (orderIds: number[]) => Promise<void>;
  onBulkStatusChange?: (orderIds: number[], status: string) => Promise<void>;
  currentUser?: any;
  isAdmin?: boolean;
}

export default function OrdersTabs({
  orders,
  productionOrders,
  customers,
  customerProducts,
  users,
  items,
  categories,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  productionSearchTerm,
  setProductionSearchTerm,
  productionStatusFilter,
  setProductionStatusFilter,
  filteredOrders,
  filteredProductionOrders,
  isOrderDialogOpen,
  setIsOrderDialogOpen,
  editingOrder,
  onAddOrder,
  onEditOrder,
  onDeleteOrder,
  onStatusChange,
  onViewOrder,
  onPrintOrder,
  onOrderSubmit,
  onBulkDelete,
  onBulkStatusChange,
  currentUser,
  isAdmin = false,
}: OrdersTabsProps) {
  // Bulk selection state
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  const handleCloseOrderDialog = () => {
    setIsOrderDialogOpen(false);
  };

  // Bulk selection handlers
  const handleOrderSelect = (orderId: number, selected: boolean) => {
    if (selected) {
      setSelectedOrders((prev) => [...prev, orderId]);
    } else {
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedOrders(filteredOrders.map((order: any) => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedOrders.length === 0 || !isAdmin) return;

    const confirmMessage = `هل أنت متأكد من حذف ${selectedOrders.length} طلب؟ هذا الإجراء لا يمكن التراجع عنه.`;
    if (!confirm(confirmMessage)) return;

    try {
      await onBulkDelete(selectedOrders);
      setSelectedOrders([]);
    } catch (error) {
      console.error("خطأ في الحذف الجماعي:", error);
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (!onBulkStatusChange || selectedOrders.length === 0) return;

    try {
      await onBulkStatusChange(selectedOrders, status);
      setSelectedOrders([]);
    } catch (error) {
      console.error("خطأ في تغيير الحالة الجماعية:", error);
    }
  };

  return (
    <Tabs defaultValue="orders" className="space-y-4">
      <TabsList>
        <TabsTrigger value="orders">الطلبات</TabsTrigger>
        <TabsTrigger value="production-orders">أوامر الإنتاج</TabsTrigger>
      </TabsList>

      <TabsContent value="orders" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>إدارة الطلبات</CardTitle>
              <div className="flex items-center space-x-2 space-x-reverse">
                <OrdersSearch
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                />
                <Dialog
                  open={isOrderDialogOpen}
                  onOpenChange={setIsOrderDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button onClick={onAddOrder} data-testid="button-add-order">
                      <Plus className="h-4 w-4 mr-2" />
                      إضافة طلب
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Bulk Actions Bar */}
            {selectedOrders.length > 0 && (
              <Alert className="mb-4">
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      تم تحديد {selectedOrders.length} طلب
                    </span>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-orange-600 border-orange-600 hover:bg-orange-50"
                            data-testid="button-bulk-status-change"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            تغيير الحالة
                            <ChevronDown className="h-3 w-3 mr-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() =>
                              handleBulkStatusChange("for_production")
                            }
                          >
                            <div className="flex items-center w-full">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                              إلى الإنتاج
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleBulkStatusChange("on_hold")}
                          >
                            <div className="flex items-center w-full">
                              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                              إيقاف مؤقت
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleBulkStatusChange("pending")}
                          >
                            <div className="flex items-center w-full">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                              في الانتظار
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleBulkStatusChange("completed")}
                          >
                            <div className="flex items-center w-full">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                              مكتمل
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {isAdmin && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleBulkDelete}
                          data-testid="button-bulk-delete"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          حذف المحدد ({selectedOrders.length})
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrders([])}
                        data-testid="button-clear-selection"
                      >
                        إلغاء التحديد
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <OrdersTable
              orders={filteredOrders}
              customers={customers}
              users={users}
              productionOrders={productionOrders}
              onViewOrder={onViewOrder}
              onPrintOrder={onPrintOrder}
              onEditOrder={isAdmin ? onEditOrder : undefined}
              onDeleteOrder={onDeleteOrder}
              onStatusChange={onStatusChange}
              currentUser={currentUser}
              isAdmin={isAdmin}
              selectedOrders={selectedOrders}
              onOrderSelect={handleOrderSelect}
              onSelectAll={handleSelectAll}
            />
          </CardContent>
        </Card>

        {/* Orders Form Dialog */}
        <OrdersForm
          isOpen={isOrderDialogOpen}
          onClose={handleCloseOrderDialog}
          onSubmit={onOrderSubmit}
          customers={customers}
          customerProducts={customerProducts}
          items={items}
          editingOrder={editingOrder}
        />
      </TabsContent>

      <TabsContent value="production-orders" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>أوامر الإنتاج</CardTitle>
              <OrdersSearch
                searchTerm={productionSearchTerm}
                setSearchTerm={setProductionSearchTerm}
                statusFilter={productionStatusFilter}
                setStatusFilter={setProductionStatusFilter}
                type="production"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredProductionOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {productionOrders.length === 0 
                  ? "لا توجد أوامر إنتاج" 
                  : "لا توجد نتائج مطابقة للبحث"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم أمر الإنتاج
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم الطلب
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        العميل
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الفئة / المنتج
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المنتج
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الكمية (كجم)
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        نسبة الزيادة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الكمية النهائية (كجم)
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProductionOrders.map((po: any) => {
                      const order = orders.find((o: any) => o.id === po.order_id);
                      const customer = customers.find((c: any) => c.id === order?.customer_id);
                      const customerProduct = customerProducts.find((cp: any) => cp.id === po.customer_product_id);
                      const category = categories.find((cat: any) => cat.id === customerProduct?.category_id);
                      const item = items.find((itm: any) => itm.id === customerProduct?.item_id);
                      
                      return (
                        <tr key={po.id} className="hover:bg-gray-50" data-testid={`row-production-order-${po.id}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {po.production_order_number || po.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order?.order_number || "غير محدد"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer?.name_ar || customer?.name || "غير محدد"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="text-right">
                              <div className="font-medium text-gray-900">
                                {category?.name_ar || category?.name || "غير محدد"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item?.name_ar || item?.name || "غير محدد"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customerProduct?.size_caption || "غير محدد"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {po.quantity_kg || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-overrun-percentage-${po.id}`}>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {po.overrun_percentage || 5}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-testid={`text-final-quantity-${po.id}`}>
                            {po.final_quantity_kg || po.quantity_kg || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              po.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              po.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              po.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {po.status === 'pending' ? 'معلق' :
                               po.status === 'in_progress' ? 'قيد التنفيذ' :
                               po.status === 'completed' ? 'مكتمل' :
                               po.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
