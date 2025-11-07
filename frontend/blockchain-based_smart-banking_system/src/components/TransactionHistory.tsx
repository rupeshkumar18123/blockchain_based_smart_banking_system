import { Doc } from "../../convex/_generated/dataModel";

interface TransactionHistoryProps {
  transactions: Doc<"transactions">[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'transfer': return '💸';
      case 'deposit': return '💰';
      case 'withdrawal': return '🏧';
      case 'loan_payment': return '🏦';
      case 'loan_disbursement': return '💳';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-blue-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
        <p className="text-gray-600 mt-1">All your blockchain transactions</p>
      </div>

      <div className="p-6">
        {transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction._id} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">{getTransactionIcon(transaction.type)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {transaction.type.replace('_', ' ')}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {transaction.description || `To: ${transaction.toAccount}`}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                        {transaction.biometricVerified && (
                          <span className="text-xs text-green-600 font-medium">🔐 Biometric Verified</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.type === 'deposit' || transaction.type === 'loan_disbursement' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'deposit' || transaction.type === 'loan_disbursement' ? '+' : '-'}
                      ${transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction._creationTime).toLocaleDateString()}
                    </p>
                    {transaction.blockchainHash && (
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        {transaction.blockchainHash.substring(0, 10)}...
                      </p>
                    )}
                  </div>
                </div>

                {transaction.gasUsed && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Gas Used:</span>
                      <span>{transaction.gasUsed.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-600">Your transaction history will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
