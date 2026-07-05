"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { CategoryColorPicker } from "@/components/categories/category-color-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants";
import {
  CATEGORY_COLOR_PRESETS,
  createCategorySchema,
} from "@/lib/validations/category";

type CategoryItem = {
  id: string;
  name: string;
  color: string;
  count: number;
};

type CategoryManagementPanelProps = {
  categories: CategoryItem[];
  uncategorizedCount: number;
  totalCards: number;
};

export function CategoryManagementPanel({
  categories: initialCategories,
  uncategorizedCount,
  totalCards,
}: CategoryManagementPanelProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(CATEGORY_COLOR_PRESETS[0]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const parsed = createCategorySchema.safeParse({ name, color });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid category details");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to create category");
      }

      setCategories((current) =>
        [...current, { ...result.data, count: 0 }].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
      setName("");
      setColor(CATEGORY_COLOR_PRESETS[0]);
      setMessage("Category created successfully.");
      router.refresh();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create category"
      );
    } finally {
      setIsCreating(false);
    }
  }

  function startEdit(category: CategoryItem) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditColor(category.color);
    setError(null);
    setMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditColor("");
  }

  async function handleUpdate(categoryId: string) {
    setError(null);
    setMessage(null);

    const parsed = createCategorySchema.safeParse({
      name: editName,
      color: editColor,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid category details");
      return;
    }

    setSavingId(categoryId);

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to update category");
      }

      setCategories((current) =>
        current
          .map((category) =>
            category.id === categoryId
              ? { ...category, name: result.data.name, color: result.data.color }
              : category
          )
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      cancelEdit();
      setMessage("Category updated successfully.");
      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update category"
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(category: CategoryItem) {
    const confirmed = window.confirm(
      `Delete "${category.name}"? Contacts in this category will become uncategorized.`
    );

    if (!confirmed) return;

    setDeletingId(category.id);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to delete category");
      }

      setCategories((current) =>
        current.filter((item) => item.id !== category.id)
      );
      setMessage(`"${category.name}" deleted.`);
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete category"
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {message ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="size-4" />
            Create category
          </CardTitle>
          <CardDescription>
            Add a new category with a custom color label
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category name</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Client, Vendor, Partner"
              />
            </div>
            <CategoryColorPicker value={color} onChange={setColor} />
            <div className="lg:col-span-2">
              <Button type="submit" disabled={isCreating} className="gap-2">
                {isCreating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Create category
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="border-border/60 shadow-sm">
            {editingId === category.id ? (
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor={`edit-name-${category.id}`}>Name</Label>
                  <Input
                    id={`edit-name-${category.id}`}
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                  />
                </div>
                <CategoryColorPicker
                  value={editColor}
                  onChange={setEditColor}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleUpdate(category.id)}
                    disabled={savingId === category.id}
                    className="gap-2"
                  >
                    {savingId === category.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            ) : (
              <>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <CardTitle className="text-base">
                          {category.name}
                        </CardTitle>
                        <CardDescription>
                          {category.count} contact
                          {category.count === 1 ? "" : "s"}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{category.count}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: `${category.color}25` }}
                  >
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${totalCards ? Math.max((category.count / totalCards) * 100, 4) : 0}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link href={ROUTES.categoryDetail(category.id)}>
                      <Button size="sm" variant="outline">
                        View contacts
                      </Button>
                    </Link>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => startEdit(category)}
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="gap-1.5"
                      onClick={() => handleDelete(category)}
                      disabled={deletingId === category.id}
                    >
                      {deletingId === category.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Uncategorized</CardTitle>
            <CardDescription>
              Contacts without a category assignment
            </CardDescription>
          </div>
          <Badge variant="secondary">{uncategorizedCount}</Badge>
        </CardHeader>
        <CardContent>
          <Link href={ROUTES.categoryUncategorized}>
            <Button variant="outline">View uncategorized contacts</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
