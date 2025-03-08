import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Package, Battery, Cable, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { Product, ProductCategory } from "@/lib/types";
import { fetchProducts, deleteProduct } from "@/lib/supabase";
import { format } from "date-fns";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";

function ProductList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      const formattedData = data.map((product) => ({
        ...product,
        createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
      }));
      setProducts(formattedData);
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        await loadProducts();
        toast({
          title: "Success",
          description: "Product deleted successfully.",
        });
      } catch (error) {
        console.error("Error deleting product:", error);
        toast({
          title: "Error",
          description: "Failed to delete product. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const getCategoryIcon = (category: ProductCategory) => {
    switch (category) {
      case "iPhone":
        return <Package className="h-4 w-4" />;
      case "Charger":
        return <Battery className="h-4 w-4" />;
      case "Cable":
        return <Cable className="h-4 w-4" />;
      case "AirPod":
        return <Headphones className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getProductDetails = (product: Product) => {
    switch (product.category) {
      case "iPhone":
        return `${product.color} - ${product.storage}`;
      case "Charger":
        return `${product.wattage} - ${
          product.isFastCharging ? "Fast Charging" : "Standard"
        }`;
      case "Cable":
        return `${product.type} - ${product.length}`;
      case "AirPod":
        return product.name;
      default:
        return "";
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return "Invalid Date";
      }
      return format(dateObj, "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const columns: Column<Product>[] = [
    {
      header: "Category",
      accessorKey: "category",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getCategoryIcon(row.original.category)}
          <span>{row.original.category}</span>
        </div>
      ),
    },
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Details",
      accessorKey: "details",
      cell: ({ row }) => getProductDetails(row.original),
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: ({ row }) => `$${row.original.price.toFixed(2)}`,
    },
    {
      header: "Stock",
      accessorKey: "stock",
      cell: ({ row }) => (
        <span
          className={`font-medium ${
            row.original.stock === 0
              ? "text-red-600"
              : row.original.stock < 10
              ? "text-amber-600"
              : "text-green-600"
          }`}
        >
          {row.original.stock}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const isAvailable = row.original.status === "available";
        const hasStock = row.original.stock > 0;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isAvailable && hasStock
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isAvailable && hasStock ? "Available" : "Unavailable"}
            </span>
            {isAvailable && !hasStock && (
              <span className="text-xs text-red-600">(Out of Stock)</span>
            )}
          </div>
        );
      },
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];

  if (loading) {
    return (
      <Layout title="Products" description="Loading products...">
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Products"
      description="Manage your product catalog"
      action={
        <Button onClick={() => navigate("/products/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Product List</h2>
            <p className="text-muted-foreground">
              {products.length} products total
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={products}
          searchKeys={["name", "category"]}
          basePath="/products"
          onDelete={handleDelete}
        />
      </div>
    </Layout>
  );
}

export default ProductList;
