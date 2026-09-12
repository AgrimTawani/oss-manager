"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
      refreshing={data.refreshing}
      dataError={data.dataError}
      adding={data.adding}
      formError={data.formError}
      selectedRepoId={data.selectedRepoId}
      selectedOwner={data.selectedOwner}
      organizations={data.organizations}
      unreadByRepoId={data.unreadByRepoId}
      unreadCount={data.unreadCount}
      readyCount={data.readyCount}
      feedFilter={data.feedFilter}
      issueStateFilter={data.issueStateFilter}
      assignmentFilter={data.assignmentFilter}
      pullRequestFilter={data.pullRequestFilter}
      sortOrder={data.sortOrder}
      groupByOrganization={data.groupByOrganization}
      readyViewActive={data.readyViewActive}
      feedTitle={data.feedTitle}
      searchQuery={data.searchQuery}
      onSelectRepo={data.selectRepo}
      onSelectOwner={data.selectOwner}
      onAddRepo={data.addRepo}
      onRemoveRepo={data.removeRepo}
      onMarkRead={data.markRead}
      onIssueStateFilterChange={data.setIssueStateFilter}
      onAssignmentFilterChange={data.setAssignmentFilter}
      onPullRequestFilterChange={data.setPullRequestFilter}
      onSortOrderChange={data.setSortOrder}
      onGroupByOrganizationChange={data.setGroupByOrganization}
      onShowAllIssues={data.showAllIssues}
      onShowUnreadIssues={data.showUnreadIssues}
      onShowReadyIssues={data.showReadyIssues}
      onSearchChange={data.setSearchQuery}
      onClearFilters={data.clearFilters}
      onRefresh={data.refresh}
    />
  );
}
