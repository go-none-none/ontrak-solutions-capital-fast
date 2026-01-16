import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, XCircle, AlertCircle, File, CheckCircle2 as CheckCircleIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SubmitToLendersModal({ isOpen, onClose, opportunity, session, onSuccess }) {
  const [lenders, setLenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLenders, setSelectedLenders] = useState({});
  const [notes, setNotes] = useState({});
  const [filter, setFilter] = useState('All');
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    if (isOpen && session) {
      loadLenders();
      loadFiles();
    }
  }, [isOpen, session]);

  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const response = await base44.functions.invoke('getSalesforceFiles', {
        recordId: opportunity.Id,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      // Map files to include more details
      const mappedFiles = (response.data.files || []).map(file => ({
        id: file.ContentDocumentId,
        title: file.ContentDocument.Title,
        extension: file.ContentDocument.FileExtension,
        size: file.ContentDocument.ContentSize,
        createdDate: file.ContentDocument.CreatedDate,
        lastModifiedDate: file.ContentDocument.LastModifiedDate
      }));

      setFiles(mappedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const loadLenders = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('getSubmissionLenders', {
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      
      console.log('Lenders response:', response.data);
      
      // Evaluate each lender's qualification
      const lendersData = response.data.lenders || [];
      const lendersWithStatus = lendersData.map(lender => ({
        ...lender,
        status: evaluateLenderQualification(lender, opportunity)
      }));
      
      setLenders(lendersWithStatus);
    } catch (error) {
      console.error('Error loading lenders:', error);
      alert('Failed to load lenders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const evaluateLenderQualification = (lender, opp) => {
    const missingFields = [];
    
    // Check credit score
    if (lender.csbs__Minimum_Credit_Score__c && (!opp.csbs__Credit_Score__c || opp.csbs__Credit_Score__c < lender.csbs__Minimum_Credit_Score__c)) {
      return 'unqualified';
    }

    // Check months in business
    if (lender.csbs__Minimum_Months_in_Business__c && (!opp.csbs__Months_In_Business__c || opp.csbs__Months_In_Business__c < lender.csbs__Minimum_Months_in_Business__c)) {
      return 'unqualified';
    }

    // Check monthly deposits
    if (lender.csbs__Minimum_Monthly_Deposit_Amount__c && (!opp.csbs__Avg_Bank_Deposits__c || opp.csbs__Avg_Bank_Deposits__c < lender.csbs__Minimum_Monthly_Deposit_Amount__c)) {
      return 'unqualified';
    }

    if (lender.csbs__Minimum_Monthly_Deposit_Count__c && (!opp.csbs__Avg_Bank_Deposits_Number__c || opp.csbs__Avg_Bank_Deposits_Number__c < lender.csbs__Minimum_Monthly_Deposit_Count__c)) {
      return 'unqualified';
    }

    // Check NSFs
    if (lender.csbs__Maximum_NSFs__c && opp.csbs__Avg_NSFs__c > lender.csbs__Maximum_NSFs__c) {
      return 'unqualified';
    }

    // Check negative days
    if (lender.csbs__Maximum_Negative_Days__c && opp.csbs__Avg_Negative_Days__c > lender.csbs__Maximum_Negative_Days__c) {
      return 'unqualified';
    }

    // Check daily balance
    if (lender.csbs__Minimum_Average_Daily_Balance__c && (!opp.csbs__Avg_Daily_Balance__c || opp.csbs__Avg_Daily_Balance__c < lender.csbs__Minimum_Average_Daily_Balance__c)) {
      return 'unqualified';
    }

    // Check restricted industries
    if (lender.csbs__Restricted_Industries__c && opp.Account?.Industry) {
      const restrictedIndustries = lender.csbs__Restricted_Industries__c.split(';');
      if (restrictedIndustries.includes(opp.Account.Industry)) {
        return 'unqualified';
      }
    }

    // Check restricted states
    if (lender.csbs__Restricted_States__c && opp.Account?.BillingState) {
      const restrictedStates = lender.csbs__Restricted_States__c.split(';');
      if (restrictedStates.includes(opp.Account.BillingState)) {
        return 'unqualified';
      }
    }

    return 'qualified';
  };

  const handleSubmit = async () => {
    const selected = Object.keys(selectedLenders).filter(id => selectedLenders[id]);
    
    if (selected.length === 0) {
      alert('Please select at least one lender');
      return;
    }

    setSubmitting(true);
    try {
      const selectedFileIds = Object.keys(selectedFiles).filter(id => selectedFiles[id]);
      const lendersToSubmit = selected.map(lenderId => ({
        lenderId,
        notes: notes[lenderId] || '',
        fileIds: selectedFileIds
      }));

      await base44.functions.invoke('createSubmissions', {
        opportunityId: opportunity.Id,
        lenders: lendersToSubmit,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating submissions:', error);
      alert('Failed to create submissions');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLender = (lenderId) => {
    setSelectedLenders(prev => ({ ...prev, [lenderId]: !prev[lenderId] }));
  };

  const filteredLenders = lenders.filter(lender => {
    if (filter === 'All') return true;
    if (filter === 'Qualified') return lender.status === 'qualified';
    if (filter === 'Unqualified') return lender.status === 'unqualified';
    return true;
  });

  const getStatusIcon = (status) => {
    if (status === 'qualified') return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (status === 'unqualified') return <XCircle className="w-4 h-4 text-red-600" />;
    return <AlertCircle className="w-4 h-4 text-yellow-600" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit to Lenders</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : (
          <>
            <Tabs defaultValue="lenders" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="lenders">Lenders</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>

              <TabsContent value="lenders" className="space-y-4">
                {/* Filter */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={filter === 'All' ? 'default' : 'outline'}
                    onClick={() => setFilter('All')}
                    size="sm"
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'Qualified' ? 'default' : 'outline'}
                    onClick={() => setFilter('Qualified')}
                    size="sm"
                  >
                    Qualified
                  </Button>
                  <Button
                    variant={filter === 'Unqualified' ? 'default' : 'outline'}
                    onClick={() => setFilter('Unqualified')}
                    size="sm"
                  >
                    Unqualified
                  </Button>
                </div>

                {/* Lenders Table */}
                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="p-2 text-left w-8"></th>
                        <th className="p-2 text-left w-8"></th>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Min Credit</th>
                        <th className="p-2 text-left">Min Deposits</th>
                        <th className="p-2 text-left">Max NSFs</th>
                        <th className="p-2 text-left">Min Months</th>
                        <th className="p-2 text-left">Restricted States</th>
                        <th className="p-2 text-left">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLenders.map(lender => (
                        <tr key={lender.Id} className="border-b hover:bg-slate-50">
                          <td className="p-2">
                            <Checkbox
                              checked={selectedLenders[lender.Id] || false}
                              onCheckedChange={() => toggleLender(lender.Id)}
                            />
                          </td>
                          <td className="p-2">{getStatusIcon(lender.status)}</td>
                          <td className="p-2 font-medium">{lender.Name}</td>
                          <td className="p-2">{lender.csbs__Minimum_Credit_Score__c || '-'}</td>
                          <td className="p-2">{lender.csbs__Minimum_Monthly_Deposit_Amount__c || '-'}</td>
                          <td className="p-2">{lender.csbs__Maximum_NSFs__c || '-'}</td>
                          <td className="p-2">{lender.csbs__Minimum_Months_in_Business__c || '-'}</td>
                          <td className="p-2 text-xs">{lender.csbs__Restricted_States__c || '-'}</td>
                          <td className="p-2">
                            <Input
                              placeholder="Notes..."
                              value={notes[lender.Id] || ''}
                              onChange={(e) => setNotes({ ...notes, [lender.Id]: e.target.value })}
                              className="h-7 text-xs"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="files" className="space-y-4">
                {loadingFiles ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-8 text-center text-slate-600">
                    <File className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p>No files found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files.map(file => (
                      <div 
                        key={file.id} 
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedFiles[file.id]
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                        onClick={() => setSelectedFiles(prev => ({
                          ...prev,
                          [file.id]: !prev[file.id]
                        }))}
                      >
                        <Checkbox
                          checked={selectedFiles[file.id] || false}
                          onCheckedChange={() => {}}
                          className="mt-1"
                        />
                        <File className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{file.title}</p>
                          <div className="flex gap-3 text-xs text-slate-500 mt-1">
                            <span>.{file.extension}</span>
                            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            {file.createdDate && (
                              <span>{new Date(file.createdDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        {selectedFiles[file.id] && (
                          <div className="flex-shrink-0 text-orange-600">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {files.length > 0 && Object.values(selectedFiles).filter(Boolean).length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    {Object.values(selectedFiles).filter(Boolean).length} file(s) selected for submission
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}