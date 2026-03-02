import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/sam/AppLayout";
import ManagerView from "./pages/ManagerView";
import AttentionQueue from "./pages/AttentionQueue";
import PrepPack from "./pages/PrepPack";
import RunSession from "./pages/RunSession";
import PostSummary from "./pages/PostSummary";
import Insights from "./pages/Insights";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<ManagerView />} />
            <Route path="/queue" element={<AttentionQueue />} />
            <Route path="/prep" element={<PrepPack />} />
            <Route path="/session" element={<RunSession />} />
            <Route path="/summary" element={<PostSummary />} />
            <Route path="/insights" element={<Insights />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
