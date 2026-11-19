import { useEffect } from "react";
import { AppRoutes } from "@/routes/app-routes";
import { WorkspaceProvider } from "@/stores/workspace-store";

export function App() {
  useEffect(() => {
    let timer: number | undefined;
    const onGlobalScroll = () => {
      document.documentElement.classList.add("is-scrolling");
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        document.documentElement.classList.remove("is-scrolling");
      }, 900);
    };
    window.addEventListener("scroll", onGlobalScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onGlobalScroll);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return (
    <WorkspaceProvider>
      <AppRoutes />
    </WorkspaceProvider>
  );
}

export default App;
