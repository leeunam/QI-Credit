import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WalletProvider } from "@/contexts/walletContext";
import { CreditProvider } from "@/contexts/CreditContext";
import Index from "./pages/Index";
import IndexContract from "./pages/IndexContract";
import ContractPage from "./pages/ContractPage";
import Wallet from "./pages/Wallet";
import CreditRequest from "./pages/CreditRequest";
import NotFound from "./pages/NotFound";
import { Dashboard } from "./pages/Dashboard";
import SmartContractPage from "./pages/SmartContractPage";
import PaymentPage from "./pages/PaymentPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WalletProvider>
        <CreditProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/credit-request" element={<CreditRequest />} />
                <Route path="/IndexContract" element={<IndexContract />} />
                <Route path="/contrato/:id" element={<ContractPage />} />
                <Route path="/smart-contract/:id" element={<SmartContractPage />} />
                <Route path="/pagamentos/:id" element={<PaymentPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CreditProvider>
      </WalletProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;