import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fetchCustomers, deleteCustomer } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

const CustomerList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    data: customers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Phone",
      accessorKey: "phone",
    },
    {
      header: "Created",
      accessorKey: (customer) =>
        format(new Date(customer.createdAt), "MMM d, yyyy"),
    },
  ];

  const handleDelete = async (id: string) => {
    const success = await deleteCustomer(id);

    if (success) {
      toast({
        title: "Customer deleted",
        description: "The customer has been successfully deleted.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete the customer. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout
        title="Customers"
        description="Manage your customer information and details."
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Customer List</h2>
            <Skeleton className="h-4 w-24 mt-1" />
          </div>

          <Button onClick={() => navigate("/customers/new")}>
            <UserPlus size={16} className="mr-2" />
            Add Customer
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
        title="Customers"
        description="Manage your customer information and details."
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Customer List</h2>
            <p className="text-muted-foreground">Error loading customers</p>
          </div>

          <Button onClick={() => navigate("/customers/new")}>
            <UserPlus size={16} className="mr-2" />
            Add Customer
          </Button>
        </div>

        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            There was a problem loading the customer list. Please try refreshing
            the page.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Customers"
      description="Manage your customer information and details."
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Customer List</h2>
          <p className="text-muted-foreground">
            {customers.length} customers total
          </p>
        </div>

        <Button onClick={() => navigate("/customers/new")}>
          <UserPlus size={16} className="mr-2" />
          Add Customer
        </Button>
      </div>

      <DataTable
        data={customers}
        columns={columns}
        getRowId={(row) => row.id}
        onDelete={handleDelete}
        searchable
        searchKeys={["name", "email", "phone"]}
        basePath="/customers"
      />
    </Layout>
  );
};

export default CustomerList;
