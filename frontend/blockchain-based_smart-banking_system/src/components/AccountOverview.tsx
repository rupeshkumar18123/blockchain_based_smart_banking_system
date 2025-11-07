import { Doc } from "../../convex/_generated/dataModel";

interface AccountOverviewProps {
  profile: Doc<"bankingProfiles">;
  transactions: Doc<"transactions">[];
  loans: Doc<"loans">[];
}

export function AccountOverview({ profile, transactions, loans }: AccountOverviewProps) {
  const totalLoanBalance = loans.reduce((sum, loan) => sum + loan.remainingBalance, 0);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Account Balance Card */}
      <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Balance</p>
            <h2 className="text-4xl font-bold">${profile.balance.toLocaleString()}</h2>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Account</p>
            <p className="font-mono text-lg">{profile.accountNumber}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-blue-100 text-sm">Account Type</p>
            <p className="font-semibold capitalize">{profile.accountType}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">KYC Status</p>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              profile.kycStatus === 'verified' 
                ? 'bg-green-500 text-white' 
                : 'bg-yellow-500 text-white'
            }`}>
              {profile.kycStatus}
            </span>
          </div>
        </div>

        {profile.walletAddress && (
          <div className="mt-4 pt-4 border-t border-blue-400">
            <p className="text-blue-100 text-sm">Connected Wallet</p>
            <p className="font-mono text-sm">{profile.walletAddress}</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Loans</p>
              <p className="text-2xl font-bold text-gray-900">{loans.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🏦</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Loan Balance</p>
              <p className="text-2xl font-bold text-gray-900">${totalLoanBalance.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">💳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'transfer' ? 'bg-blue-100 text-blue-600' :
                    transaction.type === 'deposit' ? 'bg-green-100 text-green-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'transfer' ? '💸' : 
                     transaction.type === 'deposit' ? '💰' : '🏦'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">{transaction.type}</p>
                    <p className="text-sm text-gray-600">
                      {transaction.description || `To: ${transaction.toAccount}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction._creationTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
