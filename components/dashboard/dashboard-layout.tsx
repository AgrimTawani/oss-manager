"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PageBackground } from "@/components/ui/page-background";
import { CommandBar } from "./command-bar";
import { RepoSidebar } from "./repo-sidebar";
import { NotificationFeed } from "./notification-feed";
import type { FeedFilter, NotificationItem, TrackedRepo } from "./types";

type DashboardLayoutProps = {
  username?: string | null;
  avatarUrl?: string | null;
  repos: TrackedRepo[];
  notifications: NotificationItem[];
  filteredNotifications: NotificationItem[];
  loading: boolean;
  adding: boolean;
  formError: string | null;
  selectedRepoId: string | null;
  unreadByRepoId: Map<string, number>;
  unreadCount: number;
  feedFilter: FeedFilter;
  feedTitle: string;
  searchQuery: string;
  onSelectRepo: (id: string | null) => void;
  onClearSelection: () => void;
  onAddRepo: (input: string) => Promise<boolean>;
  onRemoveRepo: (id: string) => void;
  onMarkRead: (id: string) => void;
  onFeedFilterChange: (filter: FeedFilter) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
};

export function DashboardLayout({
  username,
  avatarUrl,
  repos,
  notifications,
  filteredNotifications,
  loading,
  adding,
  formError,
  selectedRepoId,
  unreadByRepoId,
  unreadCount,
  feedFilter,
  feedTitle,
  searchQuery,
  onSelectRepo,
  onClearSelection,
  onAddRepo,
  onRemoveRepo,
  onMarkRead,
  onFeedFilterChange,
  onSearchChange,
  onClearFilters,
}: DashboardLayoutProps) {
  const [mobileReposOpen, setMobileReposOpen] = useState(false);

  const hasActiveFilters =
    feedFilter !== "all" || !!selectedRepoId || searchQuery.trim().length > 0;

  return (
    <div className="relative h-[100dvh] overflow-hidden">
      <PageBackground />

      <div className="relative flex h-full flex-col">
        <CommandBar
          reposCount={repos.length}
          unreadCount={unreadCount}
          feedFilter={feedFilter}
          onFeedFilterChange={onFeedFilterChange}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onOpenRepos={() => setMobileReposOpen(true)}
          username={username}
          avatarUrl={avatarUrl}
        />

        <div className="mx-auto grid min-h-0 w-full max-w-[1600px] flex-1 grid-cols-1 gap-4 px-4 pb-4 pt-2 lg:grid-cols-[300px_1fr] lg:px-6 lg:pb-6">
          <RepoSidebar
            repos={repos}
            loading={loading}
            adding={adding}
            formError={formError}
            selectedRepoId={selectedRepoId}
            unreadByRepoId={unreadByRepoId}
            onSelectRepo={onSelectRepo}
            onClearSelection={onClearSelection}
            onAddRepo={onAddRepo}
            onRemoveRepo={onRemoveRepo}
            className="hidden lg:flex"
          />

          <NotificationFeed
            notifications={filteredNotifications}
            allNotificationsCount={notifications.length}
            reposCount={repos.length}
            loading={loading}
            feedTitle={feedTitle}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onMarkRead={onMarkRead}
          />
        </div>
      </div>

      <AnimatePresence>
        {mobileReposOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close repositories panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileReposOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
              className={cn(
                "fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col lg:hidden",
                "rounded-t-[1.75rem] border border-white/10 bg-[#0c0d14] p-4 shadow-[0_-20px_60px_rgba(0,0,0,0.5)]"
              )}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
              <RepoSidebar
                repos={repos}
                loading={loading}
                adding={adding}
                formError={formError}
                selectedRepoId={selectedRepoId}
                unreadByRepoId={unreadByRepoId}
                onSelectRepo={(id) => {
                  onSelectRepo(id);
                  setMobileReposOpen(false);
                }}
                onClearSelection={() => {
                  onClearSelection();
                  setMobileReposOpen(false);
                }}
                onAddRepo={onAddRepo}
                onRemoveRepo={onRemoveRepo}
                className="min-h-0 flex-1"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
