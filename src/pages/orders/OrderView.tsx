import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchOrderById,
  fetchCustomerById,
  fetchEmployeeById,
  deleteOrder,
} from "@/lib/supabase";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

const OrderView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: order,
    isLoading: isLoadingOrder,
    error: orderError,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrderById(id || ""),
    enabled: !!id,
  });

  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ["customer", order?.customerId],
    queryFn: () => fetchCustomerById(order?.customerId || ""),
    enabled: !!order?.customerId,
  });

  const { data: employee, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ["employee", order?.employeeId],
    queryFn: () => fetchEmployeeById(order?.employeeId || ""),
    enabled: !!order?.employeeId,
  });

  const handleDelete = async () => {
    if (!id) return;

    const result = await deleteOrder(id);

    if (result.success) {
      toast({
        title: "Order deleted",
        description: "The order has been successfully deleted.",
      });

      // Invalidate orders query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      navigate("/orders");
    } else {
      toast({
        title: "Cannot delete order",
        description:
          result.error || "Failed to delete the order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "secondary",
      processing: "default",
      completed: "success",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status] as any}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoadingOrder || !order) {
    return (
      <Layout title="Order Details" description="Loading order information...">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => navigate("/orders")}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Orders
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>

        <Skeleton className="h-[300px] mt-6" />
      </Layout>
    );
  }

  if (orderError) {
    return (
      <Layout
        title="Order Not Found"
        description="The requested order could not be found."
      >
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => navigate("/orders")}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Orders
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              The order you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout
      title={`Order #${order.id.slice(0, 8).toUpperCase()}`}
      description={`Created on ${format(new Date(order.createdAt), "PPP")}`}
    >
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate("/orders")}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Orders
          </Button>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/orders/${order.id}/edit`)}
            >
              <Edit size={16} className="mr-2" />
              Edit
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash size={16} className="mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the order and remove the data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Order ID
                  </dt>
                  <dd className="text-sm col-span-2">
                    {order.id.toUpperCase().substring(0, 8)}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Date
                  </dt>
                  <dd className="text-sm col-span-2">
                    {format(new Date(order.createdAt), "PPP")}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Status
                  </dt>
                  <dd className="text-sm col-span-2">
                    {getStatusBadge(order.status)}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Total
                  </dt>
                  <dd className="text-sm font-medium col-span-2">
                    ${order.total.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCustomer ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : customer ? (
                <dl className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Name
                    </dt>
                    <dd className="text-sm col-span-2">{customer.name}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Email
                    </dt>
                    <dd className="text-sm col-span-2">{customer.email}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Customer information not available
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User size={18} className="text-muted-foreground" />
                <CardTitle>Processed By</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingEmployee ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : employee ? (
                <dl className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Name
                    </dt>
                    <dd className="text-sm col-span-2">{employee.name}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Department
                    </dt>
                    <dd className="text-sm col-span-2">
                      {employee.department}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Email
                    </dt>
                    <dd className="text-sm col-span-2">{employee.email}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Employee information not available
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-3 font-medium">Product</th>
                    <th className="text-right pb-3 font-medium">Price</th>
                    <th className="text-right pb-3 font-medium">Quantity</th>
                    <th className="text-right pb-3 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3">
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {item.productId.substring(0, 8).toUpperCase()}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="font-medium">
                          ${item.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          per unit
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="font-medium">{item.quantity}</div>
                        <div className="text-sm text-muted-foreground">
                          units
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t">
                    <td colSpan={3} className="py-3 text-right font-medium">
                      Subtotal
                    </td>
                    <td className="py-3 text-right">
                      ${order.total.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-3 text-right font-medium">
                      Total
                    </td>
                    <td className="py-3 text-right font-medium">
                      ${order.total.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default OrderView;
