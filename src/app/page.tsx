import EditorExample from "../components/editor-example";
import { CastFeed } from "../components/feed";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="max-w-lg">
        <EditorExample />
        <CastFeed url={`/api/casts?limit=10&offset=0`} />
      </div>
    </main>
  );
}
