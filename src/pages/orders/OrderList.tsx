import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { fetchOrders, deleteOrder, fetchCustomerById } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

const OrderList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const orders = await fetchOrders();

      // Fetch customer names for each order
      const ordersWithCustomers = await Promise.all(
        orders.map(async (order) => {
          const customer = await fetchCustomerById(order.customerId);
          return {
            ...order,
            customerName: customer?.name || "Unknown Customer",
          };
        })
      );

      return ordersWithCustomers;
    },
  });

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

  const columns = [
    {
      header: "Order ID",
      accessorKey: (order) => order.id.toUpperCase().substring(0, 8),
    },
    {
      header: "Customer",
      accessorKey: "customerName",
    },
    {
      header: "Total",
      accessorKey: (order) => `$${order.total.toFixed(2)}`,
    },
    {
      header: "Date",
      accessorKey: (order) => format(new Date(order.createdAt), "MMM d, yyyy"),
    },
    {
      header: "Status",
      accessorKey: (order) => getStatusBadge(order.status),
    },
  ];

  const handleDelete = async (id: string) => {
    const result = await deleteOrder(id);

    if (result.success) {
      toast({
        title: "Order deleted",
        description: "The order has been successfully deleted.",
      });
    } else {
      toast({
        title: "Cannot delete order",
        description:
          result.error || "Failed to delete the order. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout
        title="Orders"
        description="Manage customer orders and processing."
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Order List</h2>
            <Skeleton className="h-4 w-24 mt-1" />
          </div>

          <Button onClick={() => navigate("/orders/new")}>
            <ShoppingCart size={16} className="mr-2" />
            Create Order
          </Button>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        title="Orders"
        description="Manage customer orders and processing."
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Order List</h2>
            <p className="text-muted-foreground">Error loading orders</p>
          </div>

          <Button onClick={() => navigate("/orders/new")}>
            <ShoppingCart size={16} className="mr-2" />
            Create Order
          </Button>
        </div>

        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            There was a problem loading the order list. Please try refreshing
            the page.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Orders" description="Manage customer orders and processing.">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Order List</h2>
          <p className="text-muted-foreground">{orders.length} orders total</p>
        </div>

        <Button onClick={() => navigate("/orders/new")}>
          <ShoppingCart size={16} className="mr-2" />
          Create Order
        </Button>
      </div>

      <DataTable
        data={orders}
        columns={columns}
        getRowId={(row) => row.id}
        onDelete={handleDelete}
        searchable
        searchKeys={["id", "customerName"]}
        basePath="/orders"
      />
    </Layout>
  );
};

export default OrderList;
