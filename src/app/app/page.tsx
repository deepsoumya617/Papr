"use client";

import { useState, useEffect } from "react";
import { getCollectionsWithReminders } from "@/server/queries/collections";
import { cn } from "@/lib/utils";
import { container } from "@/components/ui/container";
import ShowCollection from "@/components/collections/showCollection";
import BlankCollection from "@/components/collections/blankCollection";
import CollectionGroup from "@/components/collections/collectionGroup";
import CreateCollection from "@/components/collections/createCollection";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";

export default function AppHomepage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchCollections() {
    try {
      const result = await getCollectionsWithReminders();
      setData(result);
    } catch (error) {
      console.error("Failed to load collections", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCollections();
  }, []);

  return (
    <>
      <Header
        title="Home"
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        {!loading && (
          <CreateCollection onCreate={fetchCollections}>
            <Button className="text-sm font-medium">Create Collection</Button>
          </CreateCollection>
        )}
      </Header>

      <main className={cn(container, "mt-6")}>
        {loading ? (
          <p className="text-center opacity-50">Loading...</p>
        ) : data && data.length === 0 ? (
          <BlankCollection>
            <CreateCollection onCreate={fetchCollections}>
              <p className="mt-6 text-center opacity-50">
                Start organizing your things by creating a collection
              </p>
            </CreateCollection>
          </BlankCollection>
        ) : (
          <CollectionGroup>
            {data?.map((item, idx) => (
              <ShowCollection
                key={item.collection.id ?? idx}
                collection={item.collection}
                reminders={item.reminders}
                fetchCollections={fetchCollections}
              />
            ))}
          </CollectionGroup>
        )}
      </main>
    </>
  );
}
