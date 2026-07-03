"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@heroui/react";
import { PackagePlus } from "lucide-react";
import { uploadImageFile } from "@/lib/upload-image";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
import { toast } from "react-toastify";

const emptyForm = {
  name: "",
  category: "",
  price: "",
  stock: "",
  image: "",
  description: "",
};

export default function AddProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImageName, setSelectedImageName] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    setMessage("");
    setSelectedImageName(file.name);

    try {
      const imageUrl = await uploadImageFile(file);

      setFormData({
        ...formData,
        image: imageUrl,
      });
      toast.success("Product image uploaded successfully.");
    } catch (error) {
      setMessage(error.message);
      toast.error(error.message || "Image upload failed.");
    }

    setIsUploading(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const response = await fetch("/api/seller/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      setFormData(emptyForm);
      setSelectedImageName("");
      setMessage("Product request submitted. Admin approval is pending.");
      toast.success("Product created successfully. It is waiting for admin approval.");
      setIsSubmitting(false);
      router.refresh();
      return;
    }

    const data = await response.json();
    setMessage(data.error || "Something went wrong");
    toast.error(data.error || "Product create failed.");
    setIsSubmitting(false);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <PackagePlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">
              Add new product
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Submit a product request. Admin approval is needed before it goes live.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 rounded-lg border bg-white p-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Product name</Label>
            <Input
              required
              name="name"
              placeholder="Wireless keyboard"
              value={formData.name}
              onChange={handleChange}
              variant="secondary"
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <select
              required
              name="category"
              value={formData.category}
              onChange={handleChange}
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
              placeholder="49"
              value={formData.price}
              onChange={handleChange}
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
              placeholder="20"
              value={formData.stock}
              onChange={handleChange}
              variant="secondary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Product image</Label>
          <input
            name="imageFile"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
          />
          <p className="text-xs text-slate-500">
            {isUploading
              ? "Uploading image to imgbb..."
              : selectedImageName || "Choose an image file"}
          </p>
          {formData.image ? (
            <p className="text-xs text-emerald-700">Image uploaded successfully.</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <textarea
            required
            name="description"
            rows={5}
            placeholder="Write a short product description"
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
          />
        </div>

        {message && (
          <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {message}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? "Submitting..." : "Submit product request"}
          </Button>
        </div>
      </form>
    </section>
  );
}
