import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactQuill from 'react-quill';

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['link'],
    ['clean']
  ]
};

const formatCurrency = (amount) => {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
};

export default function OfferProposalModal({ isOpen, onClose, offers = [], contactEmail = '', opportunity = {}, session = {}, onSuccess = () => {} }) {
  const [step, setStep] = useState(1);
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  
  const [pdfData, setPdfData] = useState({
    linkLabel: '',
    fileName: ''
  });

  const [emailData, setEmailData] = useState({
    to: contactEmail || '',
    cc: '',
    bcc: '',
    subject: 'Your Offer Proposal',
    body: ''
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedOffers([]);
      setSent(false);
      setPdfData({});
      setEmailData({
        to: contactEmail || '',
        cc: '',
        bcc: '',
        subject: 'Your Offer Proposal',
        body: ''
      });
    }
  }, [isOpen, contactEmail, opportunity.Name]);

  const toggleOfferSelection = (offerId) => {
    setSelectedOffers(prev =>
      prev.includes(offerId)
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

  const handleNextStep = () => {
    if (step === 1 && selectedOffers.length === 0) {
      alert('Please select at least one offer');
      return;
    }

    if (step === 2) {
    // Auto-generate email body based on selected offers
        const selected = offers.filter(o => selectedOffers.includes(o.Id));
        let bodyContent = 'Review the offers below:';

        selected.forEach((offer, idx) => {
          bodyContent += `\n\nOffer ${idx + 1}: ${formatCurrency(offer.csbs__Funded__c)}`;
          bodyContent += `\nPayment: ${formatCurrency(offer.csbs__Payment_Amount__c)} ${offer.csbs__Payment_Frequency__c}`;
          bodyContent += `\nTerm: ${offer.csbs__Term__c} months`;
        });

        setEmailData(prev => ({
          ...prev,
          body: bodyContent
        }));
      }
    
    setStep(step + 1);
  };

  const handleSendProposal = async () => {
    if (!emailData.to) {
      alert('Please enter a recipient email');
      return;
    }

    setLoading(true);
    try {
      const selected = offers.filter(o => selectedOffers.includes(o.Id));

      // Send email with session data included in payload
      console.log('Sending proposal with session:', { hasToken: !!session.token, hasInstanceUrl: !!session.instanceUrl });
      
      const response = await base44.functions.invoke('sendClientEmail', {
        recipientEmail: emailData.to,
        recipientName: opportunity.Account?.Name || 'Valued Customer',
        subject: emailData.subject,
        message: emailData.body,
        senderName: session.name || 'OnTrak Capital',
        offers: selected,
        opportunityId: opportunity.Id,
        sessionToken: session.token,
        sessionInstanceUrl: session.instanceUrl
      });

      console.log('Send proposal response:', response.data);

      if (!response.data.pdfUploaded) {
        console.warn('PDF was not uploaded to Salesforce');
      }

      setSent(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Send error:', error);
      alert('Failed to send proposal: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Offer Proposal</DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`flex-1 h-1 rounded ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          </div>
        </div>

        {/* Step 1: Select Offers */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Select Offers to Include</h3>
            {offers.length === 0 ? (
              <p className="text-slate-500 text-sm">No offers available</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {offers.map(offer => (
                  <div key={offer.Id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50">
                    <Checkbox
                      checked={selectedOffers.includes(offer.Id)}
                      onCheckedChange={() => toggleOfferSelection(offer.Id)}
                      id={offer.Id}
                    />
                    <label htmlFor={offer.Id} className="flex-1 cursor-pointer">
                      <p className="font-medium text-slate-900">{offer.csbs__Lender__c || 'Unknown Lender'}</p>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-slate-600">
                        <div>
                          <p className="text-xs text-slate-500">Funded</p>
                          <p className="font-semibold">{formatCurrency(offer.csbs__Funded__c)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Payment</p>
                          <p className="font-semibold">{formatCurrency(offer.csbs__Payment_Amount__c)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Term</p>
                          <p className="font-semibold">{offer.csbs__Term__c} mo</p>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: PDF & Email Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Email Details</h3>

            <div className="border-t pt-4">
              <h4 className="font-medium text-slate-900 mb-4">Email Recipients</h4>
              
              <div>
                <Label htmlFor="to">*To</Label>
                <Input
                  id="to"
                  type="email"
                  value={emailData.to}
                  onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                  placeholder="recipient@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="cc">CC</Label>
                  <Input
                    id="cc"
                    type="email"
                    value={emailData.cc}
                    onChange={(e) => setEmailData({ ...emailData, cc: e.target.value })}
                    placeholder="cc@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="bcc">BCC</Label>
                  <Input
                    id="bcc"
                    type="email"
                    value={emailData.bcc}
                    onChange={(e) => setEmailData({ ...emailData, bcc: e.target.value })}
                    placeholder="bcc@example.com"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="subject">*Subject</Label>
                <Input
                  id="subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Send */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Review & Send</h3>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-600 font-medium">To</p>
                <p className="text-slate-900">{emailData.to}</p>
              </div>
              {emailData.cc && (
                <div>
                  <p className="text-slate-600 font-medium">CC</p>
                  <p className="text-slate-900">{emailData.cc}</p>
                </div>
              )}
              <div>
                <p className="text-slate-600 font-medium">Subject</p>
                <p className="text-slate-900">{emailData.subject}</p>
              </div>
            </div>

            <div className="bg-slate-50 border rounded-lg p-4">
              <p className="text-slate-600 font-medium text-sm mb-3">Preview:</p>
              <p className="text-slate-900 text-sm whitespace-pre-wrap">{emailData.body}</p>
              <p className="text-slate-600 text-xs mt-4 pt-4 border-t">Your offers and PDF link will be included in the email automatically.</p>
            </div>

            <div>
              <Label htmlFor="customMessage" className="mb-2 block font-medium">Add Custom Message (Optional)</Label>
              <textarea
                id="customMessage"
                placeholder="Add any additional message before the offers..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ height: '100px' }}
                onChange={(e) => setEmailData(prev => ({
                  ...prev,
                  customMessage: e.target.value
                }))}
              />
            </div>
          </div>
        )}

        {/* Success State */}
        {sent && (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-600 mb-3" />
            <p className="text-lg font-semibold text-slate-900">Proposal Sent!</p>
            <p className="text-sm text-slate-600">Your offer proposal has been sent successfully.</p>
          </div>
        )}

        {/* Action Buttons */}
        {!sent && (
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                if (step === 1) onClose();
                else setStep(step - 1);
              }}
              disabled={loading}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            {step < 3 ? (
              <Button
                onClick={handleNextStep}
                disabled={loading || (step === 1 && selectedOffers.length === 0)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSendProposal}
                disabled={loading || !emailData.to}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Send'}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}