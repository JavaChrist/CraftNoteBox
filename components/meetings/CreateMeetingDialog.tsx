"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { createMeetingWithPage, updateMeeting } from "@/lib/actions/meetings";
import type { Meeting, PickablePage } from "@/lib/meetings/types";
import MeetingForm from "@/components/meetings/MeetingForm";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pickablePages: PickablePage[];
  /** Si défini, le formulaire passe en mode édition. */
  editing: Meeting | null;
  onEditingClear: () => void;
};

export default function CreateMeetingDialog({
  open,
  onOpenChange,
  pickablePages,
  editing,
  onEditingClear,
}: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const close = useCallback(() => {
    onOpenChange(false);
    onEditingClear();
  }, [onOpenChange, onEditingClear]);

  const handleSubmit = useCallback(
    async (data: {
      title: string;
      description: string | null;
      location: string | null;
      startAt: string;
      endAt: string;
      pageIds: string[];
      createMinutesPage: boolean;
    }) => {
      setSubmitting(true);
      try {
        if (editing) {
          const { createMinutesPage: _c, ...rest } = data;
          await updateMeeting(editing.id, rest);
          close();
          router.refresh();
        } else {
          const { minutesPageId } = await createMeetingWithPage({
            title: data.title,
            description: data.description,
            location: data.location,
            startAt: data.startAt,
            endAt: data.endAt,
            pageIds: data.pageIds,
            createMinutesPage: data.createMinutesPage,
          });
          close();
          if (minutesPageId) {
            router.push(`/pages/${minutesPageId}`);
          } else {
            router.refresh();
          }
        }
      } finally {
        setSubmitting(false);
      }
    },
    [editing, close, router],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="meeting-dialog-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-4 py-3">
          <h2
            id="meeting-dialog-title"
            className="text-sm font-semibold text-foreground"
          >
            {editing ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {editing ?
              "Heure locale."
            : "Heure locale · ouverture de la page de compte rendu seulement si l’option est cochée."}
          </p>
        </div>
        <div className="p-4">
          <MeetingForm
            key={editing?.id ?? "new"}
            pickablePages={pickablePages}
            editing={editing}
            onSubmit={handleSubmit}
            onCancel={close}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
