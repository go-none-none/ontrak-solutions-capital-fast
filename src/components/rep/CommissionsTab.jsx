import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, CheckCircle, Clock } from 'lucide-react';

export default function CommissionsTab({ commissions }) {
  const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!commissions || commissions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>No commissions found</p>
      </div>
    );
  }

  const totalAmount = commissions.reduce((sum, c) => sum + (c.csbs__Amount__c || 0), 0);
  const paidAmount = commissions
    .filter(c => c.csbs__Status__c === 'Paid' || c.csbs__Date_Paid__c)
    .reduce((sum, c) => sum + (c.csbs__Amount__c || 0), 0);
  const pendingAmount = totalAmount - paidAmount;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="text-sm text-blue-700 mb-1">Total</div>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(totalAmount)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="text-sm text-green-700 mb-1">Paid</div>
            <div className="text-2xl font-bold text-green-900">{formatCurrency(paidAmount)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="pt-6">
            <div className="text-sm text-orange-700 mb-1">Pending</div>
            <div className="text-2xl font-bold text-orange-900">{formatCurrency(pendingAmount)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Items */}
      {commissions.map((commission) => {
        const isPaid = commission.csbs__Status__c === 'Paid' || commission.csbs__Date_Paid__c;
        
        return (
          <Card key={commission.Id} className={`hover:shadow-md transition-shadow ${isPaid ? 'border-green-500' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{commission.Name}</CardTitle>
                    {commission.csbs__Status__c && (
                      <Badge 
                        variant={isPaid ? "default" : "secondary"}
                        className={isPaid ? "bg-green-600" : ""}
                      >
                        {isPaid && <CheckCircle className="w-3 h-3 mr-1" />}
                        {!isPaid && <Clock className="w-3 h-3 mr-1" />}
                        {commission.csbs__Status__c}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {commission.csbs__Type__c && (
                      <Badge variant="outline">{commission.csbs__Type__c}</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-2xl font-bold text-[#08708E]">
                    <DollarSign className="w-5 h-5" />
                    {formatCurrency(commission.csbs__Amount__c)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {commission.csbs__Date_Due__c && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-600 block text-xs">Due Date</span>
                      <span className="font-medium">{formatDate(commission.csbs__Date_Due__c)}</span>
                    </div>
                  </div>
                )}
                {commission.csbs__Date_Paid__c && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <div>
                      <span className="text-slate-600 block text-xs">Paid Date</span>
                      <span className="font-medium text-green-700">{formatDate(commission.csbs__Date_Paid__c)}</span>
                    </div>
                  </div>
                )}
              </div>

              {commission.csbs__Account__c && (
                <div className="mt-4 pt-4 border-t text-sm">
                  <span className="text-slate-600 block text-xs">Account</span>
                  <span className="font-medium">{commission.csbs__Account__c}</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}