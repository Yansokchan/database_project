import { useNavigate } from "react-router-dom";
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
import {
  Users,
  Briefcase,
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
  Home,
  Plus,
  Hash,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { customers, employees, products, orders } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

// Custom hook for counting animation
const useCountAnimation = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return count;
};

const Index = () => {
  const navigate = useNavigate();

  // Calculate total revenue
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  // Animated counts
  const animatedCustomers = useCountAnimation(customers.length);
  const animatedEmployees = useCountAnimation(employees.length);
  const animatedProducts = useCountAnimation(products.length);
  const animatedOrders = useCountAnimation(orders.length);
  const animatedRevenue = useCountAnimation(totalRevenue);

  // Get 5 most recent orders
  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const menuItems = [
    {
      title: "Customers",
      description: "Manage customer information and details",
      icon: Users,
      stats: `${animatedCustomers} total`,
      primaryPath: "/customers",
      secondaryPath: "/customers/new",
      primaryText: "View All",
      secondaryText: "Add New",
    },
    {
      title: "Employees",
      description: "Manage employee records and information",
      icon: Briefcase,
      stats: `${animatedEmployees} total`,
      primaryPath: "/employees/list",
      secondaryPath: "/employees/new",
      primaryText: "View All",
      secondaryText: "Add New",
    },
    {
      title: "Products",
      description: "Manage product catalog and inventory",
      icon: Package,
      stats: `${animatedProducts} total`,
      primaryPath: "/products",
      secondaryPath: "/products/new",
      primaryText: "View All",
      secondaryText: "Add New",
    },
    {
      title: "Orders",
      description: "Track and manage customer orders",
      icon: ShoppingCart,
      stats: `${animatedOrders} total`,
      primaryPath: "/orders",
      secondaryPath: "/orders/new",
      primaryText: "View All",
      secondaryText: "Add New",
    },
  ];

  return (
    <Layout
      title="Dashboard"
      description="Welcome to your business management dashboard."
    >
      <div className="space-y-6">
        {/* Revenue Overview */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              <CardTitle>Total Revenue</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              ${animatedRevenue.toLocaleString()}
            </div>
            <p className="text-muted-foreground mt-2">
              Total revenue across all orders
            </p>
          </CardContent>
        </Card>

        {/* Main Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {menuItems.map((item, index) => (
            <Card
              key={index}
              className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] glass-card"
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {item.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{item.stats}</div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2 border-t pt-4">
                <Button
                  variant="default"
                  onClick={() => navigate(item.primaryPath)}
                  className="flex-1"
                >
                  {item.primaryText}
                </Button>
                {item.secondaryPath && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(item.secondaryPath)}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Recent Orders</CardTitle>
            </div>
            <CardDescription>
              Latest 5 orders from your customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      Order ID
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Customer
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      Status
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      Total
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status === "completed" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : order.status === "pending" ? (
                          <AlertCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>${order.total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
