import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from 'lucide-react';

export default function SubmissionsTab({ submissions }) {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>No submissions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission.Id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{submission.Name}</CardTitle>
                <div className="flex gap-2 mt-2">
                  {submission.csbs__Status__c && (
                    <Badge variant="outline">{submission.csbs__Status__c}</Badge>
                  )}
                  {submission.csbs__Type__c && (
                    <Badge variant="secondary">{submission.csbs__Type__c}</Badge>
                  )}
                </div>
              </div>
              {submission.csbs__URL__c && (
                <a
                  href={submission.csbs__URL__c}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#08708E] hover:text-[#065a6e]"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {submission.csbs__API_Lender_Status__c && (
              <div className="flex justify-between">
                <span className="text-slate-600">API Lender Status:</span>
                <span className="font-medium">{submission.csbs__API_Lender_Status__c}</span>
              </div>
            )}
            {submission.csbs__Lender__c && (
              <div className="flex justify-between">
                <span className="text-slate-600">Lender:</span>
                <span className="font-medium">{submission.csbs__Lender__c}</span>
              </div>
            )}
            {(submission.csbs__Min_Term__c || submission.csbs__Max_Term__c) && (
              <div className="flex justify-between">
                <span className="text-slate-600">Term Range:</span>
                <span className="font-medium">
                  {submission.csbs__Min_Term__c || 0} - {submission.csbs__Max_Term__c || 0} months
                </span>
              </div>
            )}
            {submission.csbs__Email__c && (
              <div className="flex justify-between">
                <span className="text-slate-600">Email:</span>
                <span className="font-medium">{submission.csbs__Email__c}</span>
              </div>
            )}
            {submission.csbs__Notes__c && (
              <div className="mt-3 pt-3 border-t">
                <span className="text-slate-600 block mb-1">Notes:</span>
                <p className="text-slate-700">{submission.csbs__Notes__c}</p>
              </div>
            )}
            {submission.csbs__Status_Detail__c && (
              <div className="mt-3 pt-3 border-t">
                <span className="text-slate-600 block mb-1">Status Detail:</span>
                <p className="text-slate-700 text-xs">{submission.csbs__Status_Detail__c}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}