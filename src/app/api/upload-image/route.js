import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image");

    if (!imageFile || typeof imageFile === "string") {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    const apiKey = process.env.IMGBB_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing IMGBB_API_KEY in environment variables" },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64Image = buffer.toString("base64");

    const uploadForm = new FormData();
    uploadForm.append("image", base64Image);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: uploadForm,
    });

    const data = await response.json();

    if (!response.ok || !data?.data?.url) {
      return NextResponse.json(
        { error: data?.error?.message || "Image upload failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: data.data.url,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
