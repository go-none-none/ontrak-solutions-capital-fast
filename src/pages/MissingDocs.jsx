import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, Shield, Clock } from 'lucide-react';

export default function MissingDocs() {
  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const leadId = urlParams.get('id149') || '';
    const company = urlParams.get('cn') || '';
    const lastName = urlParams.get('ln') || '';
    
    // Build iframe src with parameters
    let iframeSrc = 'https://form.jotform.com/253446533291155';
    const params = [];
    if (leadId) params.push(`id149=${encodeURIComponent(leadId)}`);
    if (company) params.push(`cn=${encodeURIComponent(company)}`);
    if (lastName) params.push(`ln=${encodeURIComponent(lastName)}`);
    
    if (params.length > 0) {
      iframeSrc += `?${params.join('&')}`;
    }
    
    // Create and inject iframe
    const container = document.getElementById('jotform-container');
    if (container) {
      container.innerHTML = `
        <iframe
          id="JotFormIFrame-253446533291155"
          title="Missing Documents Upload"
          allowtransparency="true"
          allow="geolocation; microphone; camera; fullscreen"
          src="${iframeSrc}"
          frameborder="0"
          style="min-width:100%;max-width:100%;height:539px;border:none;"
          scrolling="no"
        >
        </iframe>
      `;
      
      // Load JotForm embed handler
      const script = document.createElement('script');
      script.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
      script.onload = () => {
        if (window.jotformEmbedHandler) {
          window.jotformEmbedHandler("iframe[id='JotFormIFrame-253446533291155']", "https://form.jotform.com/");
        }
      };
      document.body.appendChild(script);
      
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, []);

  const info = [
    {
      icon: FileCheck,
      title: 'Quick Upload',
      description: 'Upload all required documents in one simple form'
    },
    {
      icon: Shield,
      title: 'Secure Process',
      description: 'Your documents are encrypted and protected'
    },
    {
      icon: Clock,
      title: 'Fast Processing',
      description: 'We\'ll review your documents within 24 hours'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[300px] bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#08708E]/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center w-full"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Upload Missing Documents
            </h1>
            <p className="text-base text-white/70">
              Please upload the required documents to complete your application
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {info.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-[#08708E]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-[#08708E]" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-6">
            <div id="jotform-container">
              <p style={{textAlign: 'center', padding: '40px', color: '#08708E', fontSize: '18px'}}>
                Loading upload form...
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}