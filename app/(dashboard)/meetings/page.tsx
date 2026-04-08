import Sidebar from "@/components/layout/Sidebar";
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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-6 py-10 sm:px-8">
        <MeetingsPage
          meetings={meetings}
          pickablePages={pickablePages}
          meetingsSchemaMissing={schemaMissing}
        />
      </main>
    </div>
  );
}
