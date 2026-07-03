import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  PackageSearch,
  Search,
  Store,
} from "lucide-react";
import { db } from "@/lib/auth";
import { PRODUCT_CATEGORIES } from "@/lib/categories";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PRODUCTS_PER_PAGE = 9;

function getPageNumber(value) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

function getNumberValue(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return null;
  }

  return numberValue;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount || 0));
}

function getPageLink(page, filters) {
  const params = new URLSearchParams();

  params.set("page", String(page));

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (filters.sort) {
    params.set("sort", filters.sort);
  }

  if (filters.minPrice) {
    params.set("minPrice", filters.minPrice);
  }

  if (filters.maxPrice) {
    params.set("maxPrice", filters.maxPrice);
  }

  return `/products?${params.toString()}`;
}

function buildFilterQuery(filters) {
  const query = { status: "approved" };

  if (filters.q) {
    const searchText = new RegExp(escapeRegex(filters.q), "i");

    query.$or = [
      { name: searchText },
      { category: searchText },
      { description: searchText },
    ];
  }

  if (filters.category) {
    query.category = new RegExp(`^${escapeRegex(filters.category)}$`, "i");
  }

  const minPrice = getNumberValue(filters.minPrice);
  const maxPrice = getNumberValue(filters.maxPrice);

  if (minPrice !== null || maxPrice !== null) {
    query.price = {};

    if (minPrice !== null) {
      query.price.$gte = minPrice;
    }

    if (maxPrice !== null) {
      query.price.$lte = maxPrice;
    }
  }

  return query;
}

function getSortValue(sort) {
  if (sort === "price-asc") {
    return { price: 1, createdAt: -1 };
  }

  if (sort === "price-desc") {
    return { price: -1, createdAt: -1 };
  }

  return { createdAt: -1 };
}

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const currentPage = getPageNumber(params?.page);
  const filters = {
    q: params?.q || "",
    category: params?.category || "",
    sort: params?.sort || "",
    minPrice: params?.minPrice || "",
    maxPrice: params?.maxPrice || "",
  };

  const filterQuery = buildFilterQuery(filters);
  const totalProducts = await db.collection("products").countDocuments(filterQuery);
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const products = await db
    .collection("products")
    .find(filterQuery)
    .sort(getSortValue(filters.sort))
    .skip((safePage - 1) * PRODUCTS_PER_PAGE)
    .limit(PRODUCTS_PER_PAGE)
    .toArray();

  const pageNumbers = Array.from({ length: totalPages }, (_item, index) => index + 1);
  const hasActiveFilters =
    filters.q || filters.category || filters.sort || filters.minPrice || filters.maxPrice;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-lg border bg-white p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Browse products
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">
                Approved marketplace products
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Search by product name or category, filter by price, and sort
                low to high or high to low.
              </p>
            </div>

            <div className="rounded-lg border bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase text-slate-500">
                Total approved
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                {totalProducts}
              </p>
            </div>
          </div>
        </div>

        <form
          action="/products"
          method="GET"
          className="rounded-lg border bg-white p-5"
        >
          <div className="flex items-center gap-2 border-b pb-4">
            <Filter className="h-5 w-5 text-slate-600" />
            <h2 className="font-semibold text-slate-950">Filters</h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Search
              </label>
              <div className="flex items-center gap-2 rounded-lg border bg-white px-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  name="q"
                  defaultValue={filters.q}
                  placeholder="Product name or category"
                  className="h-11 w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                name="category"
                defaultValue={filters.category}
                className="h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none"
              >
                <option value="">All categories</option>
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Sort by price
              </label>
              <select
                name="sort"
                defaultValue={filters.sort}
                className="h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none"
              >
                <option value="">Newest first</option>
                <option value="price-asc">Price low to high</option>
                <option value="price-desc">Price high to low</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Min price
              </label>
              <input
                name="minPrice"
                type="number"
                min="0"
                defaultValue={filters.minPrice}
                placeholder="0"
                className="h-11 w-full rounded-lg border px-3 text-sm outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Max price
              </label>
              <input
                name="maxPrice"
                type="number"
                min="0"
                defaultValue={filters.maxPrice}
                placeholder="1000"
                className="h-11 w-full rounded-lg border px-3 text-sm outline-none"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Apply filters
            </button>

            <button
              type="submit"
              formAction="/products"
              className="inline-flex h-11 items-center justify-center rounded-lg border px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>

            {hasActiveFilters ? (
              <p className="flex items-center text-sm text-slate-500">
                Showing filtered products
              </p>
            ) : null}
          </div>
        </form>

        {products.length === 0 ? (
          <div className="rounded-lg border bg-white p-10 text-center">
            <PackageSearch className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-4 font-medium text-slate-950">
              No approved products found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product._id.toString()}
                className="overflow-hidden rounded-lg border bg-white"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-3">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-contain object-center"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <PackageSearch className="h-10 w-10" />
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-semibold text-slate-950">
                        {product.name}
                      </h2>
                      <p className="shrink-0 font-semibold text-slate-950">
                        {formatMoney(product.price)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {product.category || "General"}
                    </p>
                  </div>

                  <p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">
                    {product.description || "No description added."}
                  </p>

                  <div className="flex items-center justify-between gap-3 border-t pt-4 text-sm">
                    <div className="flex min-w-0 items-center gap-2 text-slate-500">
                      <Store className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {product.sellerName || "Seller"}
                      </span>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      Stock {Number(product.stock || 0)}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      Approved
                    </span>
                  </div>

                  <Link
                    href={`/products/${product._id.toString()}`}
                    className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-950 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    View details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-4 rounded-lg border bg-white px-4 py-4 sm:flex-row">
          <p className="text-sm text-slate-500">
            Page {safePage} of {totalPages}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href={getPageLink(Math.max(1, safePage - 1), filters)}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                safePage === 1
                  ? "pointer-events-none text-slate-300"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Link>

            {pageNumbers.map((page) => (
              <Link
                key={page}
                href={getPageLink(page, filters)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium ${
                  page === safePage
                    ? "bg-slate-950 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {page}
              </Link>
            ))}

            <Link
              href={getPageLink(Math.min(totalPages, safePage + 1), filters)}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                safePage === totalPages
                  ? "pointer-events-none text-slate-300"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
