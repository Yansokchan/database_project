import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Customer pages
import CustomerList from "./pages/customers/CustomerList";
import CustomerNew from "./pages/customers/CustomerNew";
import CustomerView from "./pages/customers/CustomerView";
import CustomerEdit from "./pages/customers/CustomerEdit";

// Employee pages
import EmployeeList from "./pages/employees/EmployeeList";
import EmployeeNew from "./pages/employees/EmployeeNew";
import EmployeeView from "./pages/employees/EmployeeView";
import EmployeeEdit from "./pages/employees/EmployeeEdit";

// Product pages
import ProductList from "@/pages/products/ProductList";
import ProductForm from "@/pages/products/ProductForm";
import ProductView from "@/pages/products/ProductView";

// Order pages
import OrderList from "./pages/orders/OrderList";
import OrderNew from "./pages/orders/OrderNew";
import OrderView from "./pages/orders/OrderView";
import OrderEdit from "./pages/orders/OrderEdit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Customer routes */}
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/new" element={<CustomerNew />} />
          <Route path="/customers/:id" element={<CustomerView />} />
          <Route path="/customers/:id/edit" element={<CustomerEdit />} />

          {/* Employee routes */}
          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/employees/new" element={<EmployeeNew />} />
          <Route path="/employees/:id" element={<EmployeeView />} />
          <Route path="/employees/:id/edit" element={<EmployeeEdit />} />

          {/* Product routes */}
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id" element={<ProductView />} />
          <Route path="/products/:id/edit" element={<ProductForm />} />

          {/* Order routes */}
          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/new" element={<OrderNew />} />
          <Route path="/orders/:id" element={<OrderView />} />
          <Route path="/orders/:id/edit" element={<OrderEdit />} />

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
