import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

import { Doc } from "../../convex/_generated/dataModel";

interface LoanManagementProps {
  loans: Doc<"loans">[];
}

export function LoanManagement({ loans }: LoanManagementProps) {
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [loanAmount, setLoanAmount] = useState("");
  const [termMonths, setTermMonths] = useState("12");
  const [collateralType, setCollateralType] = useState("");
  const [collateralValue, setCollateralValue] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [biometricVerified, setBiometricVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const applyForLoan = useMutation(api.loans.applyForLoan);
  const makeLoanPayment = useMutation(api.loans.makeLoanPayment);

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await applyForLoan({
        amount: parseFloat(loanAmount),
        termMonths: parseInt(termMonths),
        collateralType: collateralType || undefined,
        collateralValue: collateralValue ? parseFloat(collateralValue) : undefined,
      });
      
      toast.success("Loan application submitted successfully!");
      setShowApplyForm(false);
      setLoanAmount("");
      setCollateralType("");
      setCollateralValue("");
    } catch (error: any) {
      toast.error(error.message || "Failed to apply for loan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!biometricVerified) {
      toast.error("Please complete biometric authentication first");
      return;
    }

    setIsLoading(true);

    try {
      await makeLoanPayment({
        loanId: selectedLoanId as any,
        amount: parseFloat(paymentAmount),
        biometricVerified,
      });
      
      toast.success("Payment processed successfully!");
      setPaymentAmount("");
      setSelectedLoanId("");
      setBiometricVerified(false);
    } catch (error: any) {
      toast.error(error.message || "Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = () => {
    setBiometricVerified(true);
    toast.success("Biometric authentication successful!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Loan Management</h2>
            <p className="text-gray-600 mt-1">Smart contract powered loans</p>
          </div>
          <button
            onClick={() => setShowApplyForm(!showApplyForm)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold"
          >
            Apply for Loan
          </button>
        </div>
      </div>

      {/* Apply for Loan Form */}
      {showApplyForm && (
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Apply for New Loan</h3>
          <form onSubmit={handleApplyLoan} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Amount ($)
              </label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="10000"
                min="1000"
                step="100"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Term (Months)
              </label>
              <select
                value={termMonths}
                onChange={(e) => setTermMonths(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              >
                <option value="12">12 months</option>
                <option value="24">24 months</option>
                <option value="36">36 months</option>
                <option value="48">48 months</option>
                <option value="60">60 months</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collateral Type (Optional)
              </label>
              <input
                type="text"
                value={collateralType}
                onChange={(e) => setCollateralType(e.target.value)}
                placeholder="e.g., Real Estate, Vehicle"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collateral Value ($)
              </label>
              <input
                type="number"
                value={collateralValue}
                onChange={(e) => setCollateralValue(e.target.value)}
                placeholder="50000"
                min="0"
                step="100"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Submitting Application..." : "Submit Loan Application"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Loans */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Your Loans</h3>
        </div>

        <div className="p-6">
          {loans.length > 0 ? (
            <div className="space-y-4">
              {loans.map((loan) => (
                <div key={loan._id} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        ${loan.amount.toLocaleString()} Loan
                      </h4>
                      <p className="text-sm text-gray-600">
                        {loan.termMonths} months • {(loan.interestRate * 100).toFixed(2)}% APR
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      loan.status === 'active' ? 'bg-green-100 text-green-800' :
                      loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      loan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {loan.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Remaining Balance</p>
                      <p className="font-semibold">${loan.remainingBalance.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Monthly Payment</p>
                      <p className="font-semibold">${loan.monthlyPayment.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Payment</p>
                      <p className="font-semibold">
                        {loan.nextPaymentDate 
                          ? new Date(loan.nextPaymentDate).toLocaleDateString()
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Smart Contract</p>
                      <p className="font-mono text-xs text-gray-500">
                        {loan.smartContractAddress?.substring(0, 10)}...
                      </p>
                    </div>
                  </div>

                  {loan.status === 'active' && (
                    <div className="border-t border-gray-200 pt-4">
                      <form onSubmit={handleMakePayment} className="flex items-end space-x-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Amount ($)
                          </label>
                          <input
                            type="number"
                            value={selectedLoanId === loan._id ? paymentAmount : ""}
                            onChange={(e) => {
                              setPaymentAmount(e.target.value);
                              setSelectedLoanId(loan._id);
                            }}
                            placeholder={loan.monthlyPayment.toFixed(2)}
                            min="0.01"
                            step="0.01"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                          />
                        </div>
                        
                        {selectedLoanId === loan._id && (
                          <>
                            {!biometricVerified ? (
                              <button
                                type="button"
                                onClick={handleBiometricAuth}
                                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                              >
                                🔐 Authenticate
                              </button>
                            ) : (
                              <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isLoading ? "Processing..." : "Make Payment"}
                              </button>
                            )}
                          </>
                        )}
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏦</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No loans yet</h3>
              <p className="text-gray-600">Apply for your first smart contract loan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
