import PageView from "@/components/pages/PageView";

type Props = {
  params: Promise<{ pageId: string }>;
};

export default async function PageScreen({ params }: Props) {
  const { pageId } = await params;
  return <PageView pageId={pageId} />;
}

