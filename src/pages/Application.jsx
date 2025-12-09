import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Shield, TrendingUp, Phone } from 'lucide-react';

export default function Application() {
  useEffect(() => {
    // Get rep ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const repId = urlParams.get('repId') || '';
    
    // Load JotForm script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://form.jotform.com/jsform/252957146872065';
    script.async = true;
    
    // Add rep ID as query parameter to the form after it loads
    script.onload = () => {
      if (repId && window.JotForm) {
        const form = document.querySelector('[data-form-id="252957146872065"]');
        if (form) {
          const input = form.querySelector('[name="q103_rep"]');
          if (input) {
            input.value = repId;
          }
        }
      }
    };
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const reasons = [
    {
      icon: Clock,
      title: 'Fast Funding',
      description: 'Get approved and funded in as little as 24 hours'
    },
    {
      icon: CheckCircle,
      title: '95% Approval Rate',
      description: 'We work with businesses across all industries'
    },
    {
      icon: Shield,
      title: 'Transparent Terms',
      description: 'No hidden fees, clear and straightforward pricing'
    },
    {
      icon: TrendingUp,
      title: 'Flexible Options',
      description: 'Customized funding solutions that fit your needs'
    }
  ];

  return (
    <div className="bg-slate-50 pt-32 pb-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-6">
              <div id="jotform-container"></div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#08708E] rounded-2xl p-8 text-white sticky top-24">
              <h3 className="text-2xl font-bold mb-6">Why Choose OnTrak?</h3>
              <div className="space-y-6">
                {reasons.map((reason, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <reason.icon className="w-6 h-6 text-[#22d3ee]" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{reason.title}</h4>
                      <p className="text-sm text-white/80">{reason.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-sm text-white/80 mb-4">
                  Questions? Our funding specialists are here to help.
                </p>
                <div className="space-y-2">
                  <p className="font-semibold flex items-center gap-2"><Phone className="w-4 h-4 text-white" /> (302) 520-5200</p>
                  <p className="text-sm text-white/80">Mon-Fri 9am - 6pm EST</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}