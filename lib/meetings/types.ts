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
  /** Page « … - Compte rendu » si créée à l’ouverture du RDV ; sinon `null`. */
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
  /**
   * Par défaut `true` côté serveur.
   * Si `false`, aucune page « … - Compte rendu » n’est créée (`minutes_page_id` null).
   */
  createMinutesPage?: boolean;
};

export type PickablePage = {
  id: string;
  title: string;
  scope: PageScope;
};

export type CreateMeetingWithPageResult = {
  meeting: Meeting;
  /** `null` lorsque `createMinutesPage: false`. */
  minutesPageId: string | null;
};
