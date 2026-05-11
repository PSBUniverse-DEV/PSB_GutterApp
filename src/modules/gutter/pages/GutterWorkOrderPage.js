import { loadGutterProject } from "../data/gutter.actions";
import GutterWorkOrderView from "./GutterWorkOrderView";

export const dynamic = "force-dynamic";

export default async function GutterWorkOrderPage({ params }) {
  const resolvedParams = await params;
  const projectId = resolvedParams?.id || null;

  const projectData = await loadGutterProject(projectId);

  return (
    <GutterWorkOrderView
      projectId={projectId}
      projectData={projectData}
    />
  );
}
