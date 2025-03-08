import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { fetchEmployees, deleteEmployee } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Employee } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Column } from "@/components/ui/data-table";

const EmployeeList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const employees = await fetchEmployees();
        setEmployeeList(employees);
      } catch (error) {
        console.error("Error loading employees:", error);
        toast({
          title: "Error",
          description: "Failed to load employees. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployees();
  }, [toast]);

  const columns: Column<Employee>[] = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Position",
      accessorKey: "position",
    },
    {
      header: "Department",
      accessorKey: "department",
    },
    {
      header: "Hire Date",
      accessorKey: (employee: Employee) => {
        try {
          const date = new Date(employee.hireDate);
          if (isNaN(date.getTime())) {
            return "Invalid Date";
          }
          return format(date, "MMM d, yyyy");
        } catch (error) {
          console.error("Error formatting date:", error);
          return "Invalid Date";
        }
      },
    },
  ];

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteEmployee(id);
      if (result.success) {
        setEmployeeList(employeeList.filter((employee) => employee.id !== id));
        toast({
          title: "Employee deleted",
          description: "The employee has been successfully deleted.",
        });
      } else {
        toast({
          title: "Cannot delete employee",
          description:
            result.error || "Failed to delete the employee. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Error",
        description:
          "An unexpected error occurred while deleting the employee.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout
      title="Employees"
      description="Manage your employee information and records."
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Employee List</h2>
          <p className="text-muted-foreground">
            {employeeList.length} employees total
          </p>
        </div>

        <Button onClick={() => navigate("/employees/new")}>
          <UserPlus size={16} className="mr-2" />
          Add Employee
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="relative">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="rounded-lg border glass-card overflow-hidden">
            <div className="p-4">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <DataTable
          data={employeeList}
          columns={columns}
          getRowId={(row) => row.id}
          onDelete={handleDelete}
          searchable
          searchKeys={["name", "position", "department"]}
          basePath="/employees"
        />
      )}
    </Layout>
  );
};

export default EmployeeList;
