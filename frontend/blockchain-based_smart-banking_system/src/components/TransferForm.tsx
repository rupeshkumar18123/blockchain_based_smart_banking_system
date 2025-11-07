import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function TransferForm() {
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [biometricVerified, setBiometricVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const createTransfer = useMutation(api.banking.createTransfer);
  const accounts = useQuery(api.banking.getAllAccounts);
  const profile = useQuery(api.banking.getBankingProfile);

  const handleBiometricAuth = async () => {
    // Simulate biometric authentication
    setBiometricVerified(true);
    toast.success("Biometric authentication successful!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!biometricVerified) {
      toast.error("Please complete biometric authentication first");
      return;
    }

    if (!toAccount || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    if (profile && transferAmount > profile.balance) {
      toast.error("Insufficient funds");
      return;
    }

    if (toAccount === profile?.accountNumber) {
      toast.error("Cannot transfer to your own account");
      return;
    }

    setIsLoading(true);

    try {
      await createTransfer({
        toAccount,
        amount: transferAmount,
        description: description || undefined,
        biometricVerified,
      });
      
      toast.success("Transfer completed successfully!");
      setToAccount("");
      setAmount("");
      setDescription("");
      setBiometricVerified(false);
    } catch (error: any) {
      toast.error(error.message || "Transfer failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">💸</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Money</h2>
          <p className="text-gray-600">Transfer funds securely with blockchain technology</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Account
            </label>
            <select
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              required
            >
              <option value="">Select recipient account</option>
              {accounts?.map((account) => (
                <option key={account.accountNumber} value={account.accountNumber}>
                  {account.accountNumber} ({account.accountType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              required
            />
            {profile && (
              <p className="text-sm text-gray-500 mt-1">
                Available balance: ${profile.balance.toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this for?"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>

          {/* Biometric Authentication */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">🔐</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Biometric Authentication</p>
                  <p className="text-sm text-gray-600">
                    {biometricVerified ? "Authentication successful" : "Required for secure transfer"}
                  </p>
                </div>
              </div>
              {!biometricVerified ? (
                <button
                  type="button"
                  onClick={handleBiometricAuth}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Authenticate
                </button>
              ) : (
                <div className="text-green-600 font-semibold">✓ Verified</div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !biometricVerified}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing Transfer..." : "Send Money"}
          </button>
        </form>
      </div>
    </div>
  );
}
