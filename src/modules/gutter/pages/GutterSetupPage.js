import { loadGutterSetup } from "../data/gutter.actions";
import GutterSetupView from "./GutterSetupView";

export const dynamic = "force-dynamic";

export default async function GutterSetupPage() {
  const setup = await loadGutterSetup();
  return <GutterSetupView setup={setup} />;
}
