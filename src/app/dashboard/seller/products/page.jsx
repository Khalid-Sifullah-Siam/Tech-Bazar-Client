"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button, Input, Label } from "@heroui/react";
import { Edit, Loader2, PackageSearch, Plus, Trash2, X } from "lucide-react";
import { uploadImageFile } from "@/lib/upload-image";
import Link from "next/link";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
import { toast } from "react-toastify";

const emptyProduct = {
  name: "",
  category: "",
  price: "",
  stock: "",
  image: "",
  description: "",
};

function getStatusStyle(status) {
  if (status === "approved") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "rejected") {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-amber-50 text-amber-700";
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [editForm, setEditForm] = useState(emptyProduct);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editImageName, setEditImageName] = useState("");

  const loadProducts = async () => {
    setIsLoading(true);

    const response = await fetch("/api/seller/products");
    const data = await response.json();

    if (response.ok) {
      setProducts(data.products || []);
    } else {
      setMessage(data.error || "Products could not be loaded");
      toast.error(data.error || "Products could not be loaded.");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    let shouldUpdate = true;

    async function fetchProducts() {
      const response = await fetch("/api/seller/products");
      const data = await response.json();

      if (!shouldUpdate) {
        return;
      }

      if (response.ok) {
        setProducts(data.products || []);
      } else {
        setMessage(data.error || "Products could not be loaded");
        toast.error(data.error || "Products could not be loaded.");
      }

      setIsLoading(false);
    }

    fetchProducts();

    return () => {
      shouldUpdate = false;
    };
  }, []);

  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      category: product.category || "",
      price: product.price || "",
      stock: product.stock || "",
      image: product.image || "",
      description: product.description || "",
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm({
      ...editForm,
      [name]: value,
    });
  };

  const handleEditImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploadingImage(true);
    setMessage("");
    setEditImageName(file.name);

    try {
      const imageUrl = await uploadImageFile(file);

      setEditForm({
        ...editForm,
        image: imageUrl,
      });
      toast.success("Product image uploaded successfully.");
    } catch (error) {
      setMessage(error.message);
      toast.error(error.message || "Image upload failed.");
    }

    setIsUploadingImage(false);
  };

  const handleSaveChanges = async (event) => {
    event.preventDefault();

    if (!editingProduct) {
      return;
    }

    setIsSaving(true);
    setMessage("");

    const response = await fetch(`/api/seller/products/${editingProduct._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editForm),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage("Product updated. Status changed to pending for admin review.");
      setEditingProduct(null);
      toast.success("Product updated successfully.");
      await loadProducts();
    } else {
      setMessage(data.error || "Product update failed");
      toast.error(data.error || "Product update failed.");
    }

    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteProduct) {
      return;
    }

    setIsDeleting(true);
    setMessage("");

    const response = await fetch(`/api/seller/products/${deleteProduct._id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (response.ok) {
      setMessage("Product deleted successfully.");
      setDeleteProduct(null);
      toast.success("Product deleted successfully.");
      await loadProducts();
    } else {
      setMessage(data.error || "Product delete failed");
      toast.error(data.error || "Product delete failed.");
    }

    setIsDeleting(false);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <PackageSearch className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">
              My products
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track approved, pending, and rejected product requests.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <p className="rounded-lg border bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </p>
      )}

      <div className="rounded-lg border bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-slate-950">No products found</p>
            <p className="mt-1 text-sm text-slate-500">
              Add a new product request to see it here.
            </p>
            <Link
              href="/dashboard/seller/add-products"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add a product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b last:border-b-0">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-1">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={48}
                              height={48}
                              unoptimized
                              className="h-full w-full object-contain object-center"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-medium text-slate-950">
                            {product.name}
                          </p>
                          <p className="line-clamp-1 max-w-xs text-xs text-slate-500">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {product.category}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-950">
                      ${product.price}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {product.stock}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(product.status)}`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => openEditModal(product)}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => setDeleteProduct(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSaveChanges}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Edit product
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Saving changes will send it back to pending review.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Product name</Label>
                <Input
                  required
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  variant="secondary"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  required
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none"
                >
                  <option value="">Select category</option>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  required
                  name="price"
                  type="number"
                  min="0"
                  value={editForm.price}
                  onChange={handleEditChange}
                  variant="secondary"
                />
              </div>

              <div className="space-y-2">
                <Label>Stock</Label>
                <Input
                  required
                  name="stock"
                  type="number"
                  min="0"
                  value={editForm.stock}
                  onChange={handleEditChange}
                  variant="secondary"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label>Product image</Label>
              <input
                name="imageFile"
                type="file"
                accept="image/*"
                onChange={handleEditImageChange}
                className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
              />
              <p className="text-xs text-slate-500">
                {isUploadingImage
                  ? "Uploading image to imgbb..."
                  : editImageName || "Choose a new image file"}
              </p>
              {editForm.image ? (
                <p className="text-xs text-emerald-700">
                  Current image is ready to save.
                </p>
              ) : null}
            </div>

            <div className="mt-4 space-y-2">
              <Label>Description</Label>
              <textarea
                required
                name="description"
                rows={5}
                value={editForm.description}
                onChange={handleEditChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditingProduct(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || isUploadingImage}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {deleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-950">
              Delete product?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This will permanently delete &quot;{deleteProduct.name}&quot; from your
              product list.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDeleteProduct(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? "Deleting..." : "Confirm delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
