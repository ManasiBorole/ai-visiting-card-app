"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, UserPlus, UserMinus } from "lucide-react";

import {
  CategoryContactsCard,
  type CategoryContact,
} from "@/components/categories/category-contacts-list";
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

type AssignableCard = {
  id: string;
  name: string;
  company: string | null;
  mobile: string | null;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
};

type AssignCardsPanelProps = {
  categoryId: string;
  categoryName: string;
  contacts: CategoryContact[];
  assignableCards: AssignableCard[];
};

export function AssignCardsPanel({
  categoryId,
  categoryName,
  contacts: initialContacts,
  assignableCards: initialAssignable,
}: AssignCardsPanelProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState(initialContacts);
  const [assignableCards, setAssignableCards] = useState(initialAssignable);
  const [selectedAssignIds, setSelectedAssignIds] = useState<string[]>([]);
  const [selectedRemoveIds, setSelectedRemoveIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  useEffect(() => {
    setAssignableCards(initialAssignable);
  }, [initialAssignable]);

  const filteredAssignable = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return assignableCards;

    return assignableCards.filter((card) =>
      [card.name, card.company, card.mobile, card.category?.name]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }, [assignableCards, search]);

  function toggleAssign(id: string) {
    setSelectedAssignIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleRemove(id: string) {
    setSelectedRemoveIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  async function handleAssign() {
    if (selectedAssignIds.length === 0) return;

    setIsAssigning(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/categories/${categoryId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardIds: selectedAssignIds }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to assign cards");
      }

      setMessage(result.message ?? "Cards assigned successfully.");
      setSelectedAssignIds([]);
      router.refresh();
    } catch (assignError) {
      setError(
        assignError instanceof Error
          ? assignError.message
          : "Failed to assign cards"
      );
    } finally {
      setIsAssigning(false);
    }
  }

  async function handleRemove() {
    if (selectedRemoveIds.length === 0) return;

    setIsRemoving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/categories/${categoryId}/assign`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardIds: selectedRemoveIds }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to remove cards");
      }

      setContacts((current) =>
        current.filter((contact) => !selectedRemoveIds.includes(contact.id))
      );
      setSelectedRemoveIds([]);
      setMessage(result.message ?? "Cards removed from category.");
      router.refresh();
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Failed to remove cards"
      );
    } finally {
      setIsRemoving(false);
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

      <CategoryContactsCard
        title={`${categoryName} contacts`}
        description={`${contacts.length} contact${contacts.length === 1 ? "" : "s"} in this category`}
        contacts={contacts}
        emptyMessage="No contacts assigned to this category yet."
      />

      {contacts.length > 0 ? (
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Remove from category</CardTitle>
            <CardDescription>
              Select contacts to unassign from {categoryName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {contacts.map((contact) => (
                <label
                  key={contact.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 px-4 py-3 transition-colors hover:bg-muted/20"
                >
                  <input
                    type="checkbox"
                    checked={selectedRemoveIds.includes(contact.id)}
                    onChange={() => toggleRemove(contact.id)}
                    className="size-4 rounded border-input"
                  />
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    {contact.company ? (
                      <p className="text-sm text-muted-foreground">
                        {contact.company}
                      </p>
                    ) : null}
                  </div>
                </label>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={selectedRemoveIds.length === 0 || isRemoving}
              onClick={handleRemove}
            >
              {isRemoving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserMinus className="size-4" />
              )}
              Remove selected
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Assign cards</CardTitle>
          <CardDescription>
            Add contacts from your library to {categoryName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search contacts to assign..."
              className="pl-9"
            />
          </div>

          {filteredAssignable.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No available contacts to assign.
            </p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {filteredAssignable.map((card) => (
                <label
                  key={card.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 px-4 py-3 transition-colors hover:bg-muted/20"
                >
                  <input
                    type="checkbox"
                    checked={selectedAssignIds.includes(card.id)}
                    onChange={() => toggleAssign(card.id)}
                    className="size-4 rounded border-input"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{card.name}</p>
                    {card.company ? (
                      <p className="text-sm text-muted-foreground">
                        {card.company}
                      </p>
                    ) : null}
                  </div>
                  {card.category ? (
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: `${card.category.color}40`,
                        color: card.category.color,
                        backgroundColor: `${card.category.color}12`,
                      }}
                    >
                      {card.category.name}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Uncategorized</Badge>
                  )}
                </label>
              ))}
            </div>
          )}

          <Button
            type="button"
            className="gap-2"
            disabled={selectedAssignIds.length === 0 || isAssigning}
            onClick={handleAssign}
          >
            {isAssigning ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            Assign selected
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
