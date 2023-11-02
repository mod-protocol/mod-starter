"use client";

import { Button } from "@mod-protocol/react-ui-shadcn/dist/components/ui/button";
import { useState } from "react";
import EditorExample from "../components/editor-example";
import { CastFeed } from "../components/feed";

export default function Home() {
  const [feedFid, setFeedFid] = useState<string | null>("3");

  const [feedInput, setFeedInput] = useState("");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="max-w-lg space-y-6 min-w-[600px]">
        <EditorExample />
        <form
          action="#"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setFeedFid(feedInput);
          }}
          className="flex h-full w-full space-x-2 justify-start"
        >
          <input
            className="border rounded-sm pl-2"
            placeholder="Enter a user FID"
            type="text"
            onChange={(e) => setFeedInput(e.target.value)}
          />
          <Button variant="outline" type="submit" className="h-full">
            Load feed
          </Button>
        </form>
        {feedFid && <CastFeed fid={feedFid} />}
      </div>
    </main>
  );
}
