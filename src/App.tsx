
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";
import Agents from "./pages/Agents";
import AgentForm from "./pages/AgentForm";
import Tools from "./pages/Tools";
import ToolForm from "./pages/ToolForm";
import Admin from "./pages/Admin";
import Workflows from "./pages/Workflows";
import WorkflowForm from "./pages/WorkflowForm";
import WorkflowExecutions from "./pages/WorkflowExecutions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/agents/new" element={<AgentForm />} />
          <Route path="/agents/:id" element={<AgentForm />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/new" element={<ToolForm />} />
          <Route path="/tools/:id" element={<ToolForm />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/workflows/new" element={<WorkflowForm />} />
          <Route path="/workflows/:id" element={<WorkflowForm />} />
          <Route path="/workflows/:id/executions" element={<WorkflowExecutions />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
