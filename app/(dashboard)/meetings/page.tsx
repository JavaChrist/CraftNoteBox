import MeetingsPage from "@/components/meetings/MeetingsPage";
import {
  listMeetingsWithLinks,
  listPagesForMeetingPicker,
} from "@/lib/actions/meetings";

export default async function MeetingsRoute() {
  const [{ meetings, schemaMissing }, pickablePages] = await Promise.all([
    listMeetingsWithLinks(),
    listPagesForMeetingPicker(),
  ]);

  return (
    <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
      <MeetingsPage
        meetings={meetings}
        pickablePages={pickablePages}
        meetingsSchemaMissing={schemaMissing}
      />
    </main>
  );
}
