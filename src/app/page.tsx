import Image from "next/image";
import EditorExample from "./editor-example";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="max-w-lg">
        <EditorExample />
      </div>
    </main>
  );
}
