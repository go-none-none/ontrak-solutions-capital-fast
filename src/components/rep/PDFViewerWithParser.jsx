import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, X, AlertCircle, FileSearch, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewerWithParser({ file, session, isOpen, onClose }) {
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [parsedData, setParsedData] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    if (isOpen && file) {
      loadPDF();
    } else {
      setPdfData(null);
      setError(null);
      setParsedData(null);
      setPageNumber(1);
    }
  }, [isOpen, file]);

  const loadPDF = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await base44.functions.invoke('getSalesforceFileContent', {
        contentDocumentId: file.ContentDocumentId,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      if (!response.data || !response.data.file) {
        throw new Error('No file content received');
      }

      // Convert base64 to Uint8Array for react-pdf
      const base64 = response.data.file;
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      setPdfData(bytes);
    } catch (error) {
      console.error('PDF load error:', error);
      setError(error.message || 'Failed to load PDF');
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const parsePDFForBankData = async () => {
    if (!pdfData) return;
    
    setParsing(true);
    try {
      // Use PDF.js to extract text
      const loadingTask = pdfjs.getDocument(pdfData);
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      // Parse financial data
      const results = {
        avgDailyBalance: extractAvgDailyBalance(fullText),
        totalDeposits: extractTotalDeposits(fullText),
        totalWithdrawals: extractTotalWithdrawals(fullText),
        lenderPayments: extractLenderPayments(fullText),
        negativeBalances: extractNegativeBalances(fullText),
        largeTransactions: extractLargeTransactions(fullText)
      };

      setParsedData(results);
    } catch (error) {
      console.error('Parse error:', error);
      alert('Failed to parse PDF: ' + error.message);
    } finally {
      setParsing(false);
    }
  };

  const extractAvgDailyBalance = (text) => {
    const patterns = [
      /average\s+daily\s+balance[:\s]+\$?([\d,]+\.?\d*)/i,
      /avg\s+daily\s+balance[:\s]+\$?([\d,]+\.?\d*)/i,
      /daily\s+average[:\s]+\$?([\d,]+\.?\d*)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return parseFloat(match[1].replace(/,/g, ''));
    }
    return null;
  };

  const extractTotalDeposits = (text) => {
    const patterns = [
      /total\s+deposits[:\s]+\$?([\d,]+\.?\d*)/i,
      /deposits[:\s]+\$?([\d,]+\.?\d*)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return parseFloat(match[1].replace(/,/g, ''));
    }
    return null;
  };

  const extractTotalWithdrawals = (text) => {
    const patterns = [
      /total\s+withdrawals[:\s]+\$?([\d,]+\.?\d*)/i,
      /withdrawals[:\s]+\$?([\d,]+\.?\d*)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return parseFloat(match[1].replace(/,/g, ''));
    }
    return null;
  };

  const extractLenderPayments = (text) => {
    const lenderKeywords = ['ACH', 'LOAN', 'PAYMENT', 'LENDING', 'MERCHANT', 'ADVANCE', 'CAPITAL'];
    const lines = text.split('\n');
    const payments = [];
    
    lines.forEach(line => {
      const hasLenderKeyword = lenderKeywords.some(keyword => 
        line.toUpperCase().includes(keyword)
      );
      
      if (hasLenderKeyword) {
        const amountMatch = line.match(/\$?([\d,]+\.?\d*)/);
        if (amountMatch) {
          const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
          if (amount > 100) {
            payments.push({ description: line.substring(0, 50), amount });
          }
        }
      }
    });
    
    return payments;
  };

  const extractNegativeBalances = (text) => {
    const lines = text.split('\n');
    let count = 0;
    
    lines.forEach(line => {
      if (line.match(/\(-?\$?[\d,]+\.?\d*\)/i) || line.match(/-\$?[\d,]+\.?\d*/)) {
        count++;
      }
    });
    
    return count;
  };

  const extractLargeTransactions = (text) => {
    const lines = text.split('\n');
    const largeTransactions = [];
    
    lines.forEach(line => {
      const amountMatch = line.match(/\$?([\d,]+\.?\d*)/);
      if (amountMatch) {
        const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        if (amount > 5000) {
          largeTransactions.push({ description: line.substring(0, 50), amount });
        }
      }
    });
    
    return largeTransactions.slice(0, 10);
  };

  const handleDownload = () => {
    if (pdfData) {
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.ContentDocument.Title + '.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleClose = () => {
    setPdfData(null);
    setError(null);
    setParsedData(null);
    onClose();
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>{file.ContentDocument.Title}</DialogTitle>
            <div className="flex gap-2">
              {pdfData && (
                <>
                  <Button variant="outline" size="sm" onClick={parsePDFForBankData} disabled={parsing}>
                    {parsing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileSearch className="w-4 h-4 mr-2" />}
                    Parse Bank Data
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex">
          {/* PDF Viewer */}
          <div className="flex-1 overflow-auto bg-slate-100 p-4">
            {loading && (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="w-12 h-12 text-[#08708E] animate-spin mb-4" />
                <p className="text-slate-600">Loading PDF...</p>
              </div>
            )}
            
            {error && (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-slate-900 font-semibold mb-2">Failed to load PDF</p>
                <p className="text-slate-600 mb-4">{error}</p>
                <Button onClick={loadPDF}>Try Again</Button>
              </div>
            )}
            
            {pdfData && !loading && !error && (
              <div className="flex flex-col items-center">
                <div className="mb-4 flex gap-2 items-center bg-white rounded-lg p-2 shadow-sm">
                  <Button size="sm" variant="outline" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>-</Button>
                  <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
                  <Button size="sm" variant="outline" onClick={() => setScale(s => Math.min(2, s + 0.1))}>+</Button>
                  <div className="w-px h-6 bg-slate-200 mx-2" />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                    disabled={pageNumber <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">Page {pageNumber} of {numPages}</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                    disabled={pageNumber >= numPages}
                  >
                    Next
                  </Button>
                </div>
                <Document
                  file={pdfData}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<Loader2 className="w-8 h-8 animate-spin text-[#08708E]" />}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </Document>
              </div>
            )}
          </div>

          {/* Parsed Data Panel */}
          {parsedData && (
            <div className="w-96 bg-white border-l overflow-y-auto p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Parsed Bank Data</h3>
              
              <div className="space-y-4">
                {parsedData.avgDailyBalance !== null && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-slate-900">Avg Daily Balance</p>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      ${parsedData.avgDailyBalance.toLocaleString()}
                    </p>
                  </div>
                )}

                {parsedData.totalDeposits !== null && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <p className="font-semibold text-slate-900">Total Deposits</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                      ${parsedData.totalDeposits.toLocaleString()}
                    </p>
                  </div>
                )}

                {parsedData.totalWithdrawals !== null && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                      <p className="font-semibold text-slate-900">Total Withdrawals</p>
                    </div>
                    <p className="text-2xl font-bold text-red-700">
                      ${parsedData.totalWithdrawals.toLocaleString()}
                    </p>
                  </div>
                )}

                {parsedData.lenderPayments && parsedData.lenderPayments.length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="font-semibold text-slate-900 mb-2">Potential Lender Payments</p>
                    <div className="space-y-2">
                      {parsedData.lenderPayments.slice(0, 5).map((payment, idx) => (
                        <div key={idx} className="text-sm">
                          <p className="text-slate-600 truncate">{payment.description}</p>
                          <p className="font-semibold text-orange-700">${payment.amount.toLocaleString()}</p>
                        </div>
                      ))}
                      {parsedData.lenderPayments.length > 5 && (
                        <p className="text-xs text-slate-500 mt-2">
                          +{parsedData.lenderPayments.length - 5} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {parsedData.negativeBalances > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-semibold text-slate-900">Negative Balances</p>
                    <p className="text-2xl font-bold text-red-700">{parsedData.negativeBalances}</p>
                    <p className="text-xs text-slate-600 mt-1">Instances found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}