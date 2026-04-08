import type { PageScope } from "@/lib/db/types";

/** Page liée à un rendez-vous (aperçu pour liste / formulaire). */
export type MeetingLinkedPage = {
  id: string;
  title: string;
  scope: PageScope;
};

export type Meeting = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string;
  createdAt: string;
  updatedAt: string;
  /** Page auto-créée « … - Compte rendu » (migration `minutes_page_id`). */
  minutesPageId: string | null;
  linkedPages: MeetingLinkedPage[];
};

/** Données sérialisables pour les formulaires et le client. */
export type MeetingInput = {
  title: string;
  description?: string | null;
  location?: string | null;
  startAt: string;
  endAt: string;
  pageIds: string[];
};

export type PickablePage = {
  id: string;
  title: string;
  scope: PageScope;
};

export type CreateMeetingWithPageResult = {
  meeting: Meeting;
  minutesPageId: string;
};
