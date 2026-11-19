import { createContext, useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Tab } from "@/types/bundle";

interface WorkspaceStoreValue {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  shareModalOpen: boolean;
  setShareModalOpen: (open: boolean) => void;
  magicLink: string | null;
  setMagicLink: (link: string | null) => void;
  toast: string | null;
  showToast: (message: string) => void;
}

const WorkspaceContext = createContext<WorkspaceStoreValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>("write");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const { toast, showToast } = useToast();

  return (
    <WorkspaceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        shareModalOpen,
        setShareModalOpen,
        magicLink,
        setMagicLink,
        toast,
        showToast,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceStore(): WorkspaceStoreValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspaceStore must be used inside WorkspaceProvider");
  }
  return ctx;
}
