import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AccountOverview } from "./AccountOverview";
import { TransactionHistory } from "./TransactionHistory";
import { TransferForm } from "./TransferForm";
import { LoanManagement } from "./LoanManagement";
import { BiometricAuth } from "./BiometricAuth";
import { Doc } from "../../convex/_generated/dataModel";

interface DashboardProps {
  profile: Doc<"bankingProfiles">;
}

export function Dashboard({ profile }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const transactions = useQuery(api.banking.getTransactionHistory, { limit: 10 });
  const loans = useQuery(api.loans.getUserLoans);

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "transfer", label: "Transfer", icon: "💸" },
    { id: "transactions", label: "Transactions", icon: "📋" },
    { id: "loans", label: "Loans", icon: "🏦" },
    { id: "security", label: "Security", icon: "🔐" },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-2">
        <nav className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === "overview" && (
          <AccountOverview 
            profile={profile} 
            transactions={transactions || []} 
            loans={loans || []} 
          />
        )}
        
        {activeTab === "transfer" && (
          <TransferForm />
        )}
        
        {activeTab === "transactions" && (
          <TransactionHistory transactions={transactions || []} />
        )}
        
        {activeTab === "loans" && (
          <LoanManagement loans={loans || []} />
        )}
        
        {activeTab === "security" && (
          <BiometricAuth />
        )}
      </div>
    </div>
  );
}
