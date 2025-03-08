import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Edit,
  Trash,
  ArrowLeft,
  Mail,
  Phone,
  Home,
  DollarSign,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchEmployeeById,
  getEmployeeSalesMetrics,
  deleteEmployee,
} from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

const EmployeeView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: employee, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployeeById(id || ""),
    enabled: !!id,
  });

  const { data: salesMetrics, isLoading: isLoadingSales } = useQuery({
    queryKey: ["employee-sales", id],
    queryFn: () => getEmployeeSalesMetrics(id || ""),
    enabled: !!id,
  });

  if (isLoadingEmployee) {
    return (
      <Layout title="Employee Details">
        <Card className="glass-card">
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  if (!employee) {
    return (
      <Layout title="Employee Not Found">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <p>The requested employee could not be found.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => navigate("/employees")}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Employees
            </Button>
          </CardFooter>
        </Card>
      </Layout>
    );
  }

  const handleDelete = async () => {
    const result = await deleteEmployee(id || "");

    if (result.success) {
      toast({
        title: "Employee deleted",
        description: "The employee has been successfully deleted.",
      });
      navigate("/employees");
    } else {
      toast({
        title: "Cannot delete employee",
        description:
          result.error || "Failed to delete the employee. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout
      title="Employee Details"
      description="View detailed employee information."
    >
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate("/employees")}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Employees
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/employees/${id}/edit`)}
          >
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Employee Details Card */}
      <Card className="glass-card mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{employee.name}</CardTitle>
              <CardDescription className="mt-2">
                {employee.position} • {employee.department}
              </CardDescription>
            </div>
            {/* Removed Badge with status that was causing TypeScript errors */}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-2">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Email Address
                </h3>
                <p className="text-lg">{employee.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Phone Number
                </h3>
                <p className="text-lg">{employee.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Address
                </h3>
                <p className="text-lg">{employee.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Salary
                </h3>
                <p className="text-lg">${employee.salary.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Hire Date
              </h3>
              <p className="text-lg">
                {(() => {
                  try {
                    const date = new Date(employee.hireDate);
                    if (isNaN(date.getTime())) {
                      return "Invalid Date";
                    }
                    return format(date, "MMMM d, yyyy");
                  } catch (error) {
                    console.error("Error formatting hire date:", error);
                    return "Invalid Date";
                  }
                })()}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Employee ID
              </h3>
              <p className="text-lg font-mono">{employee.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Performance Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl">Sales Performance</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-2">
              <ShoppingCart className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Orders Processed
                </h3>
                {isLoadingSales ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <p className="text-2xl font-medium">
                    {salesMetrics?.count || 0}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Total Sales Amount
                </h3>
                {isLoadingSales ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <p className="text-2xl font-medium">
                    ${(salesMetrics?.amount || 0).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default EmployeeView;
