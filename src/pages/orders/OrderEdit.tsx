import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Order } from "@/lib/types";
import { ArrowLeft, Plus, Trash } from "lucide-react";
import {
  fetchOrderById,
  fetchCustomers,
  fetchProducts,
  fetchEmployees,
  updateOrder,
} from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

const OrderEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [items, setItems] = useState<
    Array<{
      id: string;
      productId: string;
      productName: string;
      quantity: number;
      price: number;
    }>
  >([]);
  const [customerId, setCustomerId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [status, setStatus] = useState<
    "pending" | "processing" | "completed" | "cancelled"
  >("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch order data
  const {
    data: order,
    isLoading: isLoadingOrder,
    error: orderError,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrderById(id || ""),
    enabled: !!id,
  });

  // Fetch customers, products, and employees
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });

  // Update form state when order data is loaded
  useEffect(() => {
    if (order) {
      setItems(order.items || []);
      setCustomerId(order.customerId || "");
      setEmployeeId(order.employeeId || "");
      setStatus(order.status || "pending");
      setHasChanges(false);
    }
  }, [order]);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        productId: "",
        productName: "",
        quantity: 1,
        price: 0,
      },
    ]);
    setHasChanges(true);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
      setHasChanges(true);
    } else {
      toast({
        title: "Cannot remove item",
        description: "Orders must have at least one item",
        variant: "destructive",
      });
    }
  };

  const updateItemPrice = (id: string, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setItems(
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: 1,
              }
            : item
        )
      );
      setHasChanges(true);
    }
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    const validQuantity = Math.max(1, Math.floor(quantity));
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: validQuantity,
            }
          : item
      )
    );
    setHasChanges(true);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      if (!item.productId) return sum;
      return sum + (item.price || 0) * (item.quantity || 1);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || isSubmitting) return;

    // Validate form
    if (!customerId) {
      toast({
        title: "Customer required",
        description: "Please select a customer for this order",
        variant: "destructive",
      });
      return;
    }

    if (!employeeId) {
      toast({
        title: "Employee required",
        description: "Please select an employee who processed this order",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0 || items.some((item) => !item.productId)) {
      toast({
        title: "Products required",
        description: "Please add at least one product to the order",
        variant: "destructive",
      });
      return;
    }

    // Find the customer and employee
    const customer = customers.find((c) => c.id === customerId);
    const employee = employees.find((e) => e.id === employeeId);

    if (!customer) {
      toast({
        title: "Error",
        description: "Selected customer not found",
        variant: "destructive",
      });
      return;
    }

    if (!employee) {
      toast({
        title: "Error",
        description: "Selected employee not found",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate total
      const total = calculateTotal();

      // Update order
      const updatedOrder = await updateOrder(id, {
        customerId,
        customerName: customer.name,
        employeeId,
        employeeName: employee.name,
        items: items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName || "",
          quantity: item.quantity || 1,
          price: item.price || 0,
        })),
        total,
        status,
      });

      if (updatedOrder) {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["order", id] });

        toast({
          title: "Order updated",
          description: `Order #${updatedOrder.id
            .substring(0, 8)
            .toUpperCase()} updated successfully`,
        });

        navigate(`/orders/${id}`);
      } else {
        throw new Error("Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Update failed",
        description:
          "There was a problem updating the order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoadingOrder) {
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </Layout>
    );
  }

  if (orderError || !order) {
    return (
      <Layout>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p>Failed to load order details</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => navigate("/orders")}
          >
            <ArrowLeft size={16} />
            Back to Orders
          </Button>
          <h1 className="text-2xl font-bold">
            Edit Order #{order.id.substring(0, 8).toUpperCase()}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Customer
                  </label>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Processed By
                  </label>
                  <Select value={employeeId} onValueChange={setEmployeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select
                  value={status}
                  onValueChange={(
                    value: "pending" | "processing" | "completed" | "cancelled"
                  ) => setStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Items</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus size={16} className="mr-1" /> Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 py-2 font-medium text-sm">
                  <div className="col-span-5">Product</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-1"></div>
                </div>

                {items.map((item) => {
                  const selectedProduct = products.find(
                    (p) => p.id === item.productId
                  );
                  const maxQuantity = selectedProduct?.stock || 0;
                  const isOriginalItem = order?.items.some(
                    (i) => i.id === item.id
                  );

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-4 items-center border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="col-span-5">
                        <Select
                          value={item.productId}
                          onValueChange={(value) =>
                            updateItemPrice(item.id, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products
                              .filter(
                                (product) =>
                                  product.status === "available" &&
                                  (product.stock > 0 ||
                                    product.id === item.productId)
                              )
                              .map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  <div className="flex flex-col">
                                    <div>{product.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      Stock: {product.stock} | $
                                      {product.price.toFixed(2)}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {isOriginalItem && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Original order item
                          </div>
                        )}
                      </div>

                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const price = parseFloat(e.target.value);
                            if (!isNaN(price) && price >= 0) {
                              setItems(
                                items.map((i) =>
                                  i.id === item.id ? { ...i, price } : i
                                )
                              );
                              setHasChanges(true);
                            }
                          }}
                          min={0}
                          step={0.01}
                          className="text-right"
                        />
                      </div>

                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const quantity = parseInt(e.target.value);
                            if (!isNaN(quantity) && quantity >= 1) {
                              updateItemQuantity(item.id, quantity);
                            }
                          }}
                          min={1}
                          max={maxQuantity}
                          className="text-right"
                        />
                        {selectedProduct && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Available: {maxQuantity}
                          </div>
                        )}
                      </div>

                      <div className="col-span-2 text-right font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8"
                          disabled={items.length === 1}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                <div className="pt-4 border-t">
                  <div className="flex justify-end gap-4 text-sm">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-medium">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-end gap-4 text-sm mt-2">
                    <span className="font-medium">Total:</span>
                    <span className="font-medium">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/orders/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Order"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default OrderEdit;
