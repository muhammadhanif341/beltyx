"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { categoryFormSchema, slugify, type CategoryFormInput } from "@/lib/validations/admin";
import type { Category } from "@/lib/types";
import { toast } from "sonner";

const ICONS = ["wallet", "circle-dot", "credit-card", "banknote", "gift", "sparkles", "badge-percent"];

export function CategoryFormDialog({ category }: { category?: Category }) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const router = useRouter();
  const isEdit = Boolean(category);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      icon: category?.icon ?? "wallet",
    },
  });

  async function onSubmit(data: CategoryFormInput) {
    setSubmitting(true);
    const supabase = createClient();
    const payload = {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      icon: data.icon || null,
    };

    const { error } = isEdit
      ? await supabase.from("categories").update(payload).eq("id", category!.id)
      : await supabase.from("categories").insert(payload);

    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(isEdit ? "Category updated" : "Category created");
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              className="mt-1.5"
              {...register("name")}
              onBlur={(e) => {
                if (!watch("slug")) setValue("slug", slugify(e.target.value));
              }}
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="cat-slug">Slug</Label>
            <Input id="cat-slug" className="mt-1.5" {...register("slug")} />
            {errors.slug && <p className="mt-1 text-xs text-destructive">{errors.slug.message}</p>}
          </div>
          <div>
            <Label htmlFor="cat-description">Description</Label>
            <Textarea id="cat-description" rows={3} className="mt-1.5" {...register("description")} />
          </div>
          <div>
            <Label>Icon</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setValue("icon", icon)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    watch("icon") === icon ? "border-accent bg-accent/10 text-accent" : "border-border"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" variant="hero" disabled={submitting}>
              {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="icon-sm" />
          ) : (
            <Button variant="hero" />
          )
        }
      >
        {isEdit ? (
          <Pencil className="size-3.5" />
        ) : (
          <>
            <Plus className="size-4" data-icon="inline-start" />
            Add Category
          </>
        )}
      </DialogTrigger>
    </Dialog>
  );
}
