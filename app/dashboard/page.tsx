"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageBackground } from "@/components/ui/page-background";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useDashboardData } from "@/components/dashboard/use-dashboard-data";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const authenticated = status === "authenticated";

  const data = useDashboardData(authenticated);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="relative flex h-[100dvh] items-center justify-center text-sm text-ink/60">
        <PageBackground />
        Loading…
      </div>
    );
  }

  return (
    <DashboardLayout
      username={session?.user?.name}
      avatarUrl={session?.user?.image}
      repos={data.repos}
      notifications={data.notifications}
      filteredNotifications={data.filteredNotifications}
      loading={data.loading}
      adding={data.adding}
      formError={data.formError}
      selectedRepoId={data.selectedRepoId}
      unreadByRepoId={data.unreadByRepoId}
      unreadCount={data.unreadCount}
      feedFilter={data.feedFilter}
      feedTitle={data.feedTitle}
      searchQuery={data.searchQuery}
      onSelectRepo={data.setSelectedRepoId}
      onClearSelection={() => data.setSelectedRepoId(null)}
      onAddRepo={data.addRepo}
      onRemoveRepo={data.removeRepo}
      onMarkRead={data.markRead}
      onFeedFilterChange={data.setFeedFilter}
      onSearchChange={data.setSearchQuery}
      onClearFilters={data.clearFilters}
    />
  );
}
