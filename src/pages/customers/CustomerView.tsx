
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Edit, Trash, ArrowLeft, ShoppingCart, User, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchCustomerById, getCustomerPurchaseCount, deleteCustomer } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { getCustomerById } from "@/lib/data";

const CustomerView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomerById(id || ""),
    enabled: !!id
  });
  
  const { data: purchaseCount, isLoading: isLoadingPurchases } = useQuery({
    queryKey: ['customer-purchases', id],
    queryFn: () => getCustomerPurchaseCount(id || ""),
    enabled: !!id
  });
  
  if (isLoadingCustomer) {
    return (
      <Layout title="Customer Details">
        <Card className="glass-card">
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full md:col-span-2" />
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }
  
  if (!customer) {
    return (
      <Layout title="Customer Not Found">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <p>The requested customer could not be found.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => navigate("/customers")}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Customers
            </Button>
          </CardFooter>
        </Card>
      </Layout>
    );
  }
  
  const handleDelete = async () => {
    const success = await deleteCustomer(id || "");
    
    if (success) {
      toast({
        title: "Customer deleted",
        description: "The customer has been successfully deleted."
      });
      navigate("/customers");
    } else {
      toast({
        title: "Error",
        description: "Failed to delete the customer. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Layout 
      title="Customer Details" 
      description="View detailed customer information."
    >
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate("/customers")}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Customers
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/customers/${id}/edit`)}>
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <Card className="glass-card mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{customer.name}</CardTitle>
              <CardDescription className="mt-2">
                Customer since {format(new Date(customer.createdAt), "MMMM d, yyyy")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-2">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Customer ID</h3>
                <p className="text-lg font-mono">{customer.id}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Email Address</h3>
              <p className="text-lg">{customer.email}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone Number</h3>
              <p className="text-lg">{customer.phone}</p>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Address</h3>
              <p className="text-lg">{customer.address}</p>
            </div>
            
            <div className="flex items-start gap-2">
              <ShoppingCart className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Number of Purchases</h3>
                {isLoadingPurchases ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <p className="text-lg font-medium">{customer.purchaseCount || purchaseCount || 0}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default CustomerView;
