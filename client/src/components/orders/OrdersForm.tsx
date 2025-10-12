import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Search, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

// Master batch colors mapping
const masterBatchColors = [
  {
    id: "PT-111111",
    name: "WHITE",
    name_ar: "أبيض",
    color: "#FFFFFF",
    textColor: "#000000",
  },
  {
    id: "PT-000000",
    name: "BLACK",
    name_ar: "أسود",
    color: "#000000",
    textColor: "#FFFFFF",
  },
  {
    id: "PT-8B0000",
    name: "DARK_RED",
    name_ar: "أحمر غامق",
    color: "#8B0000",
    textColor: "#FFFFFF",
  },
  {
    id: "PT-006400",
    name: "DARK_GREEN",
    name_ar: "أخضر غامق",
    color: "#006400",
    textColor: "#FFFFFF",
  },
  {
    id: "PT-000080",
    name: "NAVY_BLUE",
    name_ar: "أزرق بحري",
    color: "#000080",
    textColor: "#FFFFFF",
  },
  {
    id: "PT-2F4F4F",
    name: "DARK_GRAY",
    name_ar: "رمادي غامق",
    color: "#2F4F4F",
    textColor: "#FFFFFF",
  },
  {
    id: "PT-FF0000",
    name: "RED",
    name_ar: "أحمر",
    color: "#FF0000",
    textColor: "#FFFFFF",
  },
  {
    id: "PT-0000FF",
    name: "BLUE",
    name_ar: "أزرق",
    color: "#0000FF",
    textColor: "#FFFFFF",
  },
  {
    id: "PT-00FF00",
    name: "GREEN",
    name_ar: "أخضر",
    color: "#00FF00",
    textColor: "#000000",
  },
  {
    id: "PT-FFFF00",
    name: "YELLOW",
    name_ar: "أصفر",
    color: "#FFFF00",
    textColor: "#000000",
  },
  {
    id: "PT-FFA500",
    name: "ORANGE",
    name_ar: "برتقالي",
    color: "#FFA500",
    textColor: "#000000",
  },
  {
    id: "PT-800080",
    name: "PURPLE",
    name_ar: "بنفسجي",
    color: "#800080",
    textColor: "#FFFFFF",
  },
  {
    id: "PT-FFC0CB",
    name: "PINK",
    name_ar: "وردي",
    color: "#FFC0CB",
    textColor: "#000000",
  },
  {
    id: "PT-A52A2A",
    name: "BROWN",
    name_ar: "بني",
    color: "#A52A2A",
    textColor: "#FFFFFF",
  },
  {
    id: "PT-C0C0C0",
    name: "SILVER",
    name_ar: "فضي",
    color: "#C0C0C0",
    textColor: "#000000",
  },
  {
    id: "PT-FFD700",
    name: "GOLD",
    name_ar: "ذهبي",
    color: "#FFD700",
    textColor: "#000000",
  },
  {
    id: "PT-E2DCC8",
    name: "BEIGE",
    name_ar: "بيج",
    color: "#E2DCC8",
    textColor: "#000000",
  },
  {
    id: "PT-ADD8E6",
    name: "LIGHT_BLUE",
    name_ar: "أزرق فاتح",
    color: "#ADD8E6",
    textColor: "#000000",
  },
  {
    id: "PT-90EE90",
    name: "LIGHT_GREEN",
    name_ar: "أخضر فاتح",
    color: "#90EE90",
    textColor: "#000000",
  },
  {
    id: "PT-D3D3D3",
    name: "LIGHT_GRAY",
    name_ar: "رمادي فاتح",
    color: "#D3D3D3",
    textColor: "#000000",
  },
  {
    id: "PT-MIX",
    name: "MIX",
    name_ar: "مخلوط",
    color: "#E2DCC8",
    textColor: "#000000",
  },
  {
    id: "PT-CLEAR",
    name: "CLEAR",
    name_ar: "شفاف",
    color: "#E2DCC8",
    textColor: "#000000",
  },
];

const getMasterBatchArabicName = (masterBatchId: string): string => {
  if (!masterBatchId) return "غير محدد";
  const color = masterBatchColors.find((c) => c.id === masterBatchId);
  return color?.name_ar || masterBatchId;
};

const orderFormSchema = z.object({
  customer_id: z.string().min(1, "العميل مطلوب"),
  delivery_days: z.coerce
    .number()
    .int()
    .positive()
    .max(365, "عدد أيام التسليم يجب أن يكون بين 1 و 365"),
  notes: z.string().optional(),
});

interface OrdersFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any, productionOrders: any[]) => void;
  customers: any[];
  customerProducts: any[];
  items: any[];
  editingOrder?: any;
}

export default function OrdersForm({
  isOpen,
  onClose,
  onSubmit,
  customers,
  customerProducts,
  items,
  editingOrder,
}: OrdersFormProps) {
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [productionOrdersInForm, setProductionOrdersInForm] = useState<any[]>(
    [],
  );
  const [quantityPreviews, setQuantityPreviews] = useState<{
    [key: number]: any;
  }>({});

  const orderForm = useForm({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customer_id: "",
      delivery_days: 15,
      notes: "",
    },
  });

  // Load editing order data when dialog opens for editing
  useEffect(() => {
    const loadEditingOrderData = async () => {
      if (isOpen && editingOrder) {
        // Load order data
        orderForm.reset({
          customer_id: editingOrder.customer_id || "",
          delivery_days: editingOrder.delivery_days || 15,
          notes: editingOrder.notes || "",
        });
        setSelectedCustomerId(editingOrder.customer_id || "");
        
        // Load existing production orders for this order
        try {
          const response = await fetch(`/api/production-orders?order_id=${editingOrder.id}`);
          if (response.ok) {
            const data = await response.json();
            const existingProdOrders = data.data || [];
            
            // Convert existing production orders to form format
            const formattedOrders = existingProdOrders.map((po: any) => ({
              id: po.id,
              customer_product_id: po.customer_product_id,
              quantity_kg: parseFloat(po.quantity_kg),
              overrun_percentage: parseFloat(po.overrun_percentage || 5),
            }));
            
            setProductionOrdersInForm(formattedOrders);
            
            // Load previews for existing orders
            for (let i = 0; i < formattedOrders.length; i++) {
              const order = formattedOrders[i];
              if (order.customer_product_id && order.quantity_kg > 0) {
                await updateQuantityPreview(i, order.customer_product_id, order.quantity_kg);
              }
            }
          }
        } catch (error) {
          console.error("فشل تحميل أوامر الإنتاج:", error);
          setProductionOrdersInForm([]);
        }
      } else if (isOpen && !editingOrder) {
        // Reset form for new order
        orderForm.reset({
          customer_id: "",
          delivery_days: 15,
          notes: "",
        });
        setSelectedCustomerId("");
        setProductionOrdersInForm([]);
        setQuantityPreviews({});
      }
    };

    loadEditingOrderData();
  }, [isOpen, editingOrder]);

  // Function to preview quantity calculations
  const previewQuantityCalculation = async (
    customerProductId: number,
    baseQuantityKg: number,
  ) => {
    if (!customerProductId || !baseQuantityKg || baseQuantityKg <= 0) {
      return null;
    }

    try {
      const response = await fetch(
        "/api/production-orders/preview-quantities",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_product_id: customerProductId,
            quantity_kg: baseQuantityKg,
          }),
        },
      );

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error("Error previewing quantity calculation:", error);
      return null;
    }
  };

  // Function to update quantity preview for a production order
  const updateQuantityPreview = async (
    index: number,
    customerProductId?: number,
    baseQuantityKg?: number,
  ) => {
    const prodOrder = productionOrdersInForm[index];
    const productId = customerProductId || prodOrder.customer_product_id;
    const quantity = baseQuantityKg || prodOrder.quantity_kg;

    if (productId && quantity > 0) {
      const preview = await previewQuantityCalculation(productId, quantity);
      if (preview) {
        setQuantityPreviews((prev) => ({
          ...prev,
          [index]: preview,
        }));
      }
    } else {
      setQuantityPreviews((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    }
  };

  const addProductionOrder = () => {
    setProductionOrdersInForm((prev) => [
      ...prev,
      {
        customer_product_id: null,
        quantity_kg: null,
        overrun_percentage: 5.0,
      },
    ]);
  };

  const removeProductionOrder = (index: number) => {
    setProductionOrdersInForm((prev) => prev.filter((_, i) => i !== index));
    setQuantityPreviews((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const updateProductionOrder = async (
    index: number,
    field: string,
    value: any,
  ) => {
    setProductionOrdersInForm((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Update preview when customer_product_id or quantity_kg changes
    if (field === "customer_product_id" || field === "quantity_kg") {
      const prodOrder = productionOrdersInForm[index];
      const productId =
        field === "customer_product_id" ? value : prodOrder.customer_product_id;
      const quantity = field === "quantity_kg" ? value : prodOrder.quantity_kg;

      if (productId && quantity > 0) {
        await updateQuantityPreview(index, productId, quantity);
      }
    }
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer: any) => {
    if (!customerSearchTerm) return true;

    const searchLower = customerSearchTerm.toLowerCase();
    return (
      (customer.name || "").toLowerCase().includes(searchLower) ||
      (customer.name_ar || "").toLowerCase().includes(searchLower) ||
      (customer.id || "").toLowerCase().includes(searchLower)
    );
  });

  // Filter customer products based on selected customer
  const filteredCustomerProducts = customerProducts.filter((product: any) =>
    selectedCustomerId ? product.customer_id === selectedCustomerId : true,
  );

  const handleSubmit = (data: any) => {
    onSubmit(data, productionOrdersInForm);
  };

  const handleClose = () => {
    orderForm.reset();
    setProductionOrdersInForm([]);
    setQuantityPreviews({});
    setSelectedCustomerId("");
    setCustomerSearchTerm("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingOrder ? "تعديل الطلب" : "إضافة طلب جديد"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {editingOrder
              ? "تعديل تفاصيل الطلب"
              : "إضافة طلب جديد مع أوامر الإنتاج والمواصفات المطلوبة"}
          </DialogDescription>
        </DialogHeader>
        <Form {...orderForm}>
          <form
            onSubmit={orderForm.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Customer Selection with Search */}
            <FormField
              control={orderForm.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العميل</FormLabel>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="البحث بالاسم العربي أو الإنجليزي..."
                        value={customerSearchTerm}
                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-customers"
                      />
                    </div>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedCustomerId(value);
                        // Reset production orders when customer changes
                        setProductionOrdersInForm([]);
                      }}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-customer">
                          <SelectValue placeholder="اختر العميل" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCustomers.map((customer: any) => (
                          <SelectItem
                            key={customer.id}
                            value={customer.id.toString()}
                          >
                            {customer.name_ar || customer.name}{customer.name && customer.name_ar ? ` - ${customer.name}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Delivery Days & Notes in one row */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={orderForm.control}
                name="delivery_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>أيام التسليم</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="عدد أيام التسليم"
                        data-testid="input-delivery-days"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={orderForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>ملاحظات</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="ملاحظات إضافية..."
                        className="min-h-[40px] resize-none"
                        data-testid="textarea-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Production Orders Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">أوامر الإنتاج</h3>
                <Button
                  type="button"
                  onClick={addProductionOrder}
                  variant="outline"
                  size="sm"
                  data-testid="button-add-production-order"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة أمر إنتاج
                </Button>
              </div>

              {productionOrdersInForm.length === 0 && (
                <div className="text-center py-6 text-sm text-gray-500">
                  يجب إضافة أمر إنتاج واحد على الأقل
                </div>
              )}

              <div className="space-y-3">
                {productionOrdersInForm.map((prodOrder, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg bg-gray-50"
                    data-testid={`production-order-${index}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">أمر إنتاج #{index + 1}</h4>
                      <Button
                        type="button"
                        onClick={() => removeProductionOrder(index)}
                        variant="ghost"
                        size="sm"
                        data-testid={`button-remove-production-order-${index}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-700">
                          منتج العميل
                        </label>
                        <Select
                          onValueChange={(value) =>
                            updateProductionOrder(
                              index,
                              "customer_product_id",
                              parseInt(value),
                            )
                          }
                          value={
                            prodOrder.customer_product_id?.toString() || ""
                          }
                        >
                          <SelectTrigger
                            className="h-auto min-h-[50px] w-full"
                            data-testid={`select-product-${index}`}
                          >
                            <SelectValue placeholder="اختر المنتج">
                              {prodOrder.customer_product_id && (() => {
                                const selectedProduct = filteredCustomerProducts.find(
                                  (p: any) => p.id === prodOrder.customer_product_id
                                );
                                if (selectedProduct) {
                                  const item = items.find(
                                    (item: any) => item.id === selectedProduct.item_id
                                  );
                                  const parts = [
                                    item?.name_ar || item?.name || "منتج غير محدد",
                                    selectedProduct.size_caption,
                                    selectedProduct.cutting_length_cm ? `${selectedProduct.cutting_length_cm} سم` : null,
                                    selectedProduct.master_batch_id ? getMasterBatchArabicName(selectedProduct.master_batch_id) : null,
                                    selectedProduct.raw_material
                                  ].filter(Boolean);
                                  
                                  return (
                                    <div className="text-right text-sm">
                                      {parts.join(' - ')}
                                    </div>
                                  );
                                }
                                return "اختر المنتج";
                              })()}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-w-[750px] w-[750px]">
                            {filteredCustomerProducts.map((product: any) => (
                              <SelectItem
                                key={product.id}
                                value={product.id.toString()}
                                className="h-auto min-h-[70px] py-2"
                              >
                                <div className="w-full text-right py-1 min-w-[650px]">
                                  <div className="font-semibold text-gray-900 mb-1 text-sm leading-relaxed">
                                    {(() => {
                                      const item = items.find(
                                        (item: any) =>
                                          item.id === product.item_id,
                                      );
                                      return (
                                        <>
                                          <div>
                                            {item?.name_ar ||
                                              item?.name ||
                                              "منتج غير محدد"}
                                          </div>
                                          {product?.size_caption && (
                                            <div>{product.size_caption}</div>
                                          )}
                                          {product.cutting_length_cm && (
                                            <div>
                                              طول القطع:{" "}
                                              {product.cutting_length_cm} سم
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                  <div className="grid grid-cols-2 gap-6 text-sm text-gray-600">
                                    <div className="space-y-2">
                                      {product.thickness && (
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-gray-700">
                                            السماكة:
                                          </span>
                                          <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                                            {product.thickness} ميكرون
                                          </span>
                                        </div>
                                      )}
                                      {product.master_batch_id && (
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-gray-700">
                                            الماستر باتش:
                                          </span>
                                          <span className="text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded">
                                            {getMasterBatchArabicName(
                                              product.master_batch_id,
                                            )}
                                          </span>
                                        </div>
                                      )}
                                      {product.raw_material && (
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-gray-700">
                                            المادة الخام:
                                          </span>
                                          <span className="text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded">
                                            {product.raw_material}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="space-y-2">
                                      {product.width && (
                                        <div>
                                          <span className="font-medium text-gray-700">
                                            العرض:
                                          </span>{" "}
                                          <span className="text-orange-600 font-medium">
                                            {product.width} سم
                                          </span>
                                        </div>
                                      )}
                                      {product.punching && (
                                        <div>
                                          <span className="font-medium text-gray-700">
                                            التخريم:
                                          </span>{" "}
                                          <span className="text-teal-600 font-medium">
                                            {product.punching}
                                          </span>
                                        </div>
                                      )}
                                      {product.cutting_unit && (
                                        <div>
                                          <span className="font-medium text-gray-700">
                                            وحدة القطع:
                                          </span>{" "}
                                          <span className="text-indigo-600 font-medium">
                                            {product.cutting_unit}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {product.notes && (
                                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
                                      <span className="font-medium">
                                        ملاحظات:
                                      </span>{" "}
                                      {product.notes}
                                    </div>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          الكمية الأساسية (كيلو)
                        </label>
                        <Input
                          type="number"
                          placeholder="الكمية"
                          value={prodOrder.quantity_kg || ""}
                          onChange={(e) =>
                            updateProductionOrder(
                              index,
                              "quantity_kg",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-full"
                          data-testid={`input-base-quantity-${index}`}
                        />
                        {quantityPreviews[index] && (
                          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <div className="text-xs font-medium text-blue-800 mb-1">
                              معاينة:
                            </div>
                            <div className="text-xs space-y-1">
                              <div className="text-blue-700">
                                <span className="font-medium">نسبة الزيادة:</span>{" "}
                                {quantityPreviews[index].overrun_percentage}%
                              </div>
                              <div className="text-blue-700">
                                <span className="font-medium">الكمية النهائية:</span>{" "}
                                {quantityPreviews[index].final_quantity_kg} كيلو
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2 space-x-reverse pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                data-testid="button-cancel"
              >
                إلغاء
              </Button>
              <Button type="submit" data-testid="button-submit">
                {editingOrder ? "تحديث الطلب" : "حفظ الطلب"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
