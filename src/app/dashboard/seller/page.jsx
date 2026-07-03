import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { BadgeCheck, Clock3, DollarSign, PackageCheck } from "lucide-react";
import { auth, db } from "@/lib/auth";

const productRequestCollections = [
  "productRequests",
  "ProductRequests",
  "addProductRequests",
  "AddProductRequests",
  "products",
  "Products",
];

const saleCollections = [
  "buyerPurchases",
  "orders",
  "Orders",
  "transactions",
  "Transactions",
  "sales",
  "Sales",
];

function getSellerFilter(user) {
  const sellerOptions = [
    { sellerId: user.id },
    { sellerId: String(user.id) },
    { sellerEmail: user.email },
    { email: user.email },
    { userId: user.id },
    { userId: String(user.id) },
  ];

  if (ObjectId.isValid(user.id)) {
    const userObjectId = new ObjectId(user.id);

    sellerOptions.push(
      { sellerId: userObjectId },
      { userId: userObjectId },
      { ownerId: userObjectId }
    );
  }

  return { $or: sellerOptions };
}

async function collectionExists(collectionName) {
  const collections = await db
    .listCollections({ name: collectionName })
    .toArray();

  return collections.length > 0;
}

async function countProductRequests(user, statusList) {
  let total = 0;
  const sellerFilter = getSellerFilter(user);

  for (const collectionName of productRequestCollections) {
    const exists = await collectionExists(collectionName);

    if (!exists) {
      continue;
    }

    const count = await db.collection(collectionName).countDocuments({
      $and: [
        sellerFilter,
        {
          $or: [
            { status: { $in: statusList } },
            { requestStatus: { $in: statusList } },
            { approvalStatus: { $in: statusList } },
          ],
        },
      ],
    });

    total = total + count;
  }

  return total;
}

async function getTotalSales(user) {
  let totalSales = 0;
  const sellerFilter = getSellerFilter(user);

  for (const collectionName of saleCollections) {
    const exists = await collectionExists(collectionName);

    if (!exists) {
      continue;
    }

    const result = await db
      .collection(collectionName)
      .aggregate([
        {
          $match: {
            $and: [
              sellerFilter,
              {
                $or: [
                  { paymentStatus: "paid" },
                  { paymentStatus: "completed" },
                  { status: "paid" },
                  { status: "completed" },
                  { status: "delivered" },
                ],
              },
            ],
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $ifNull: [
                  "$totalAmount",
                  {
                    $ifNull: [
                      "$amount",
                      {
                        $ifNull: [
                          "$totalPrice",
                          {
                            $ifNull: ["$price", 0],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      ])
      .toArray();

    totalSales = totalSales + (result[0]?.total || 0);
  }

  return totalSales;
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default async function SellerOverViewPage() {
  let session = null;

  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    session = null;
  }

  if (!session?.user) {
    redirect("/signin");
  }

  const user = session.user;
  const approvedCount = await countProductRequests(user, [
    "approved",
    "approve",
    "accepted",
  ]);
  const pendingCount = await countProductRequests(user, [
    "pending",
    "requested",
    "waiting",
  ]);
  const totalSales = await getTotalSales(user);

  const stats = [
    {
      title: "Approved products",
      value: approvedCount,
      text: "Admin approved add requests",
      icon: BadgeCheck,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      title: "Pending requests",
      value: pendingCount,
      text: "Waiting for admin review",
      icon: Clock3,
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      title: "Total sales",
      value: formatMoney(totalSales),
      text: "Completed paid orders",
      icon: DollarSign,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Seller overview
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">
              Welcome back, {user.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Your product approval status and sales summary are shown from the
              database.
            </p>
          </div>

          <div className="rounded-lg border bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase text-slate-500">
              Current plan
            </p>
            <p className="mt-1 text-lg font-semibold capitalize text-slate-950">
              {user.sellerPlanName || user.plan || "Free"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.title} className="rounded-lg border bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">{stat.text}</p>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-950">
                Product request summary
              </h2>
              <p className="text-sm text-slate-500">
                Approved and pending counts update automatically from the
                database.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">
                Approved requests
              </span>
              <span className="font-semibold text-slate-950">
                {approvedCount}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">
                Pending requests
              </span>
              <span className="font-semibold text-slate-950">
                {pendingCount}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Seller account</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">
            {user.email}
          </h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Role</span>
              <span className="font-medium capitalize text-slate-950">
                {user.role}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Plan</span>
              <span className="font-medium capitalize text-slate-950">
                {user.sellerPlanName || user.plan || "Free"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Total sales</span>
              <span className="font-medium text-slate-950">
                {formatMoney(totalSales)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
