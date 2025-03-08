import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { fetchProductById } from "@/lib/supabase";
import {
  Product,
  iPhoneProduct,
  ChargerProduct,
  CableProduct,
  AirPodProduct,
} from "@/lib/types";
import { format } from "date-fns";
import { ArrowLeft, Pencil } from "lucide-react";
import Layout from "@/components/Layout";

export default function ProductView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      const data = await fetchProductById(productId);
      if (data) {
        setProduct({
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        });
      }
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
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

  const getProductDetails = () => {
    if (!product) return null;

    switch (product.category) {
      case "iPhone": {
        const iPhoneProduct = product as iPhoneProduct;
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Color</Label>
              <p className="text-lg">{iPhoneProduct.color}</p>
            </div>
            <div>
              <Label>Storage</Label>
              <p className="text-lg">{iPhoneProduct.storage}</p>
            </div>
          </div>
        );
      }
      case "Charger": {
        const chargerProduct = product as ChargerProduct;
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Wattage</Label>
              <p className="text-lg">{chargerProduct.wattage}</p>
            </div>
            <div>
              <Label>Fast Charging</Label>
              <p className="text-lg">
                {chargerProduct.isFastCharging ? "Yes" : "No"}
              </p>
            </div>
          </div>
        );
      }
      case "Cable": {
        const cableProduct = product as CableProduct;
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <p className="text-lg">{cableProduct.type}</p>
            </div>
            <div>
              <Label>Length</Label>
              <p className="text-lg">{cableProduct.length}</p>
            </div>
          </div>
        );
      }
      case "AirPod": {
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <p className="text-lg">{product.category}</p>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout title="Product Details" description="Loading product details...">
        <div>Loading...</div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout
        title="Product Not Found"
        description="The requested product could not be found"
      >
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Product not found
          </p>
          <Button variant="outline" onClick={() => navigate("/products")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Product Details"
      description={`View details for ${product.name}`}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/products")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Product Details</h1>
          </div>
          <Button onClick={() => navigate(`/products/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Product
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Basic Information</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Label>Stock Level</Label>
                    <p
                      className={`text-lg font-medium ${
                        product.stock === 0
                          ? "text-red-600"
                          : product.stock < 10
                          ? "text-amber-600"
                          : "text-green-600"
                      }`}
                    >
                      {product.stock} units
                    </p>
                  </div>
                  <div className="text-right">
                    <Label>Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          product.status === "available" && product.stock > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.status === "available" && product.stock > 0
                          ? "Available"
                          : "Unavailable"}
                      </span>
                      {product.status === "available" &&
                        product.stock === 0 && (
                          <span className="text-sm text-red-600">
                            (Out of Stock)
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <p className="text-lg">{product.name}</p>
              </div>
              <div>
                <Label>Category</Label>
                <p className="text-lg">{product.category}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-lg">{product.description}</p>
              </div>
              <div>
                <Label>Price</Label>
                <p className="text-lg">${product.price.toFixed(2)}</p>
              </div>
              <div>
                <Label>Created At</Label>
                <p className="text-lg">{formatDate(product.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>{getProductDetails()}</CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
