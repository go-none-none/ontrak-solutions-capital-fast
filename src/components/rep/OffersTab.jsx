import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle } from 'lucide-react';

export default function OffersTab({ offers }) {
  const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value) => {
    if (!value) return '-';
    return `${value}%`;
  };

  if (!offers || offers.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>No offers found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <Card key={offer.Id} className={`hover:shadow-md transition-shadow ${offer.csbs__Selected__c ? 'border-green-500 border-2' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{offer.Name}</CardTitle>
                  {offer.csbs__Selected__c && (
                    <Badge className="bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Selected
                    </Badge>
                  )}
                  {offer.csbs__Accepted_with_Lender__c && (
                    <Badge className="bg-blue-600">Accepted with Lender</Badge>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  {offer.csbs__Product__c && (
                    <Badge variant="outline">{offer.csbs__Product__c}</Badge>
                  )}
                  {offer.csbs__Payment_Frequency__c && (
                    <Badge variant="secondary">{offer.csbs__Payment_Frequency__c}</Badge>
                  )}
                </div>
              </div>
              {offer.csbs__URL__c && (
                <a
                  href={offer.csbs__URL__c}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#08708E] hover:text-[#065a6e]"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-600 block text-xs">Funded</span>
                <span className="font-semibold text-lg text-[#08708E]">{formatCurrency(offer.csbs__Funded__c)}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-xs">Net Funded</span>
                <span className="font-semibold text-lg">{formatCurrency(offer.csbs__Net_Funded__c)}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-xs">Payback</span>
                <span className="font-semibold text-lg">{formatCurrency(offer.csbs__Payback__c)}</span>
              </div>
              {offer.csbs__Payment_Amount__c && (
                <div>
                  <span className="text-slate-600 block text-xs">Payment</span>
                  <span className="font-medium">{formatCurrency(offer.csbs__Payment_Amount__c)}</span>
                </div>
              )}
              {offer.csbs__Term__c && (
                <div>
                  <span className="text-slate-600 block text-xs">Term</span>
                  <span className="font-medium">{offer.csbs__Term__c} months</span>
                </div>
              )}
              {offer.csbs__Factor_Rate__c && (
                <div>
                  <span className="text-slate-600 block text-xs">Factor Rate</span>
                  <span className="font-medium">{offer.csbs__Factor_Rate__c}</span>
                </div>
              )}
              {offer.csbs__Buy_Rate__c && (
                <div>
                  <span className="text-slate-600 block text-xs">Buy Rate</span>
                  <span className="font-medium">{formatPercent(offer.csbs__Buy_Rate__c)}</span>
                </div>
              )}
              {offer.csbs__Commission_Amount__c && (
                <div>
                  <span className="text-slate-600 block text-xs">Commission</span>
                  <span className="font-medium text-green-600">{formatCurrency(offer.csbs__Commission_Amount__c)}</span>
                </div>
              )}
              {offer.csbs__Commission_Percentage__c && (
                <div>
                  <span className="text-slate-600 block text-xs">Commission %</span>
                  <span className="font-medium">{formatPercent(offer.csbs__Commission_Percentage__c)}</span>
                </div>
              )}
            </div>
            {(offer.csbs__Origination_Fee_Amount__c || offer.csbs__Origination_Fee_Percentage__c || offer.csbs__Holdback_Percentage__c) && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {offer.csbs__Origination_Fee_Amount__c && (
                    <div>
                      <span className="text-slate-600 block text-xs">Origination Fee</span>
                      <span className="font-medium">{formatCurrency(offer.csbs__Origination_Fee_Amount__c)}</span>
                    </div>
                  )}
                  {offer.csbs__Holdback_Percentage__c && (
                    <div>
                      <span className="text-slate-600 block text-xs">Holdback</span>
                      <span className="font-medium">{formatPercent(offer.csbs__Holdback_Percentage__c)}</span>
                    </div>
                  )}
                  {offer.csbs__Payment_Method__c && (
                    <div>
                      <span className="text-slate-600 block text-xs">Payment Method</span>
                      <span className="font-medium">{offer.csbs__Payment_Method__c}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {offer.csbs__Notes__c && (
              <div className="mt-4 pt-4 border-t">
                <span className="text-slate-600 block mb-1 text-xs">Notes:</span>
                <p className="text-slate-700 text-sm">{offer.csbs__Notes__c}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}