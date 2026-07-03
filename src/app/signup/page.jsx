"use client";

import { authClient } from "@/lib/auth-client";
import { uploadImageFile } from "@/lib/upload-image";
import {
  Button,
  Description,
  FieldError,
  Fieldset,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  Surface,
  TextField,
} from "@heroui/react";
import { ArrowRight, Sparkles, ShieldCheck, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function SignUpPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const formData = new FormData(e.currentTarget);
    const user = Object.fromEntries(formData.entries());

    try {
      const result = await authClient.signUp.email({
        ...user,
        image: profileImageUrl,
        plan: "free",
      });

      if (result?.error) {
        toast.error(result.error.message || "Signup failed. Please try again.");
        return;
      }

      toast.success("Signup successful.");
      router.refresh();
      router.push("/");
    } catch (error) {
      toast.error(error?.message || "Signup failed. Please try again.");
    }
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
      setProfileImageUrl(imageUrl);
      setMessage("Profile image uploaded successfully.");
      toast.success("Profile image uploaded successfully.");
    } catch (error) {
      setMessage(error.message);
      toast.error(error.message || "Image upload failed.");
    }

    setIsUploading(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.16),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)] px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative flex flex-col justify-between bg-slate-950 px-8 py-10 text-white md:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.22),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(34,197,94,0.18),_transparent_26%)]" />
          <div className="relative">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100">
              <Sparkles className="h-4 w-4" />
              Start your Tech Bazaar journey
            </div>

            <h1 className="max-w-md text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Create your account in a clean, trusted space.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              Join as a buyer or seller, set up your profile, and get access
              to the marketplace with your free plan.
            </p>
          </div>

          <div className="relative mt-12 grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-white">Secure signup flow</p>
                  <p className="text-sm text-slate-300">
                    Simple, focused, and easy to complete.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-white">Buyer or seller</p>
                  <p className="text-sm text-slate-300">
                    Pick the role that matches your account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center px-6 py-10 md:px-10">
          <Surface className="w-full border-0 bg-transparent shadow-none">
            <Form onSubmit={onSubmit}>
              <Fieldset className="w-full space-y-6">
                <div className="space-y-2">
                  <Fieldset.Legend className="text-3xl font-semibold tracking-tight text-slate-900">
                    Sign up
                  </Fieldset.Legend>
                  <Description className="text-slate-600">
                    Create your account in a few quick steps.
                  </Description>
                </div>

                <Fieldset.Group className="grid gap-4">
                  <TextField isRequired name="name">
                    <Label>Name</Label>
                    <Input placeholder="John Doe" variant="secondary" />
                    <FieldError />
                  </TextField>

                  <div className="space-y-2">
                    <Label>Profile image</Label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
                    />
                    <p className="text-xs text-slate-500">
                      {isUploading
                        ? "Uploading image to imgbb..."
                        : selectedImageName || "Choose a profile image file"}
                    </p>
                    {profileImageUrl ? (
                      <p className="text-xs text-emerald-700">
                        Image uploaded successfully.
                      </p>
                    ) : null}
                  </div>

                  <TextField isRequired name="email" type="email">
                    <Label>Email</Label>
                    <Input placeholder="john@example.com" variant="secondary" />
                    <FieldError />
                  </TextField>

                  <TextField isRequired name="password" type="password">
                    <Label>Password</Label>
                    <Input placeholder="Enter your password" variant="secondary" />
                    <FieldError />
                  </TextField>

                  <Select isRequired name="role" placeholder="Select one">
                    <Label>Signup as</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        <ListBox.Item id="buyer" textValue="buyer">
                          Buyer
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                        <ListBox.Item id="seller" textValue="seller">
                          Seller
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </Fieldset.Group>

                {message && (
                  <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {message}
                  </p>
                )}

                <Button
                  type="submit"
                  className="mt-2 h-12 w-full rounded-xl bg-slate-950 text-base font-medium text-white transition hover:bg-slate-800"
                  disabled={isUploading}
                  endContent={<ArrowRight className="h-4 w-4" />}
                >
                  Create account
                </Button>
              </Fieldset>
            </Form>
          </Surface>
        </div>
      </div>
    </div>
  );
}
