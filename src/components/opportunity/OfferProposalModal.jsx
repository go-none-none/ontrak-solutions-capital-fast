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
    subject: 'Offer Proposal',
    body: ''
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedOffers([]);
      setSent(false);
      const today = formatDate(new Date());
      setPdfData({
        linkLabel: `Offer Proposal - ${opportunity.Name || ''} - ${today}`,
        fileName: `Offer Proposal - ${opportunity.Name || ''} - ${today.replace(/\//g, '-')}`
      });
      setEmailData({
        to: contactEmail || '',
        cc: '',
        bcc: '',
        subject: 'Offer Proposal',
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
      // Validate PDF fields
      if (!pdfData.linkLabel.trim() || !pdfData.fileName.trim()) {
        alert('Please fill in both PDF Link Label and File Name');
        return;
      }
      
      // Generate email body with selected offers
      const selected = offers.filter(o => selectedOffers.includes(o.Id));
      let bodyContent = '<p>Offer Proposal</p>';
      
      selected.forEach((offer, idx) => {
        bodyContent += `<p>Offer ${idx + 1} - ${formatCurrency(offer.csbs__Funded__c)}</p>`;
        bodyContent += `<p><strong>Payment Amount:</strong>${formatCurrency(offer.csbs__Payment_Amount__c)} <strong>Term:</strong>${offer.csbs__Term__c || 0} <strong>Payment Frequency:</strong>${offer.csbs__Payment_Frequency__c || 'N/A'}</p>`;
      });
      
      bodyContent += `<p>${pdfData.linkLabel}</p>`;
      
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
      // Generate PDF from selected offers
      const selected = offers.filter(o => selectedOffers.includes(o.Id));
      
      // Create PDF content
      const pdfContent = selected.map((offer, idx) => {
        return `Offer ${idx + 1}\n` +
               `Funded: ${formatCurrency(offer.csbs__Funded__c)}\n` +
               `Payment: ${formatCurrency(offer.csbs__Payment_Amount__c)}\n` +
               `Term: ${offer.csbs__Term__c} months\n` +
               `Frequency: ${offer.csbs__Payment_Frequency__c}\n\n`;
      }).join('');

      // Send email
      await base44.functions.invoke('sendClientEmail', {
        to: emailData.to,
        cc: emailData.cc || undefined,
        bcc: emailData.bcc || undefined,
        subject: emailData.subject,
        body: emailData.body,
        recordId: opportunity.Id,
        recordType: 'Opportunity',
        token: session.token,
        instanceUrl: session.instanceUrl
      });

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
          <div className="flex justify-between items-center mb-2">
            <div className={`flex-1 h-2 rounded ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`flex-1 h-2 rounded mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`flex-1 h-2 rounded ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Step {step} of 3
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

        {/* Step 2: Email Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Email Details</h3>
            
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

            <div className="grid grid-cols-2 gap-4">
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

            <div>
              <Label htmlFor="subject">*Subject</Label>
              <Input
                id="subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You'll customize the email body in the next step.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Compose Email */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Compose Message</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                The PDF Link will activate after you click "Send".
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600">To</p>
                <p className="font-medium">{emailData.to}</p>
              </div>
              {emailData.cc && (
                <div>
                  <p className="text-slate-600">CC</p>
                  <p className="font-medium">{emailData.cc}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-slate-600 text-sm mb-2">Subject</p>
              <p className="font-medium text-slate-900">{emailData.subject}</p>
            </div>

            <div>
              <Label htmlFor="body" className="mb-2 block">*Email Body</Label>
              <ReactQuill
                theme="snow"
                value={emailData.body}
                onChange={(content) => setEmailData({ ...emailData, body: content })}
                modules={modules}
                className="bg-white"
                style={{ height: '300px', marginBottom: '40px' }}
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