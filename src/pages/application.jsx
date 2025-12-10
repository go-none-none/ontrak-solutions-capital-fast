import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Shield, TrendingUp, Phone, Zap } from 'lucide-react';

export default function Application() {
  useEffect(() => {
    // Load JotForm scripts
    const scripts = [
      'https://cdn.jotfor.ms/s/static/8ae8dc8556c/js/vendor/jquery-3.7.1.min.js',
      'https://cdn.jotfor.ms/s/static/8ae8dc8556c/js/vendor/jSignature/jSignature.js',
      'https://cdn.jotfor.ms/s/static/8ae8dc8556c/js/vendor/jSignature/jSignature.CompressorBase30.js',
      'https://cdn.jotfor.ms/s/static/8ae8dc8556c/js/vendor/jSignature/jSignature.CompressorSVG.js',
      'https://cdn.jotfor.ms/s/static/8ae8dc8556c/js/vendor/jSignature/jSignature.UndoButton.js',
      'https://cdn.jotfor.ms/s/static/8ae8dc8556c/js/vendor/jotform.signaturepad.new.js',
      'https://cdn.jotfor.ms/s/static/8ae8dc8556c/static/prototype.forms.js',
      'https://cdn.jotfor.ms/s/static/8ae8dc8556c/static/jotform.forms.js',
      'https://cdn.jotfor.ms/s/static/8ae8dc8556c/js/vendor/maskedinput_5.0.9.min.js',
      'https://cdn.jotfor.ms/s/static/8ae8dc8556c/js/punycode-1.4.1.min.js',
      'https://cdn.jotfor.ms/s/static/8ae8dc8556c/js/vendor/imageinfo.js',
      'https://cdn.jotfor.ms/s/static/8ae8dc8556c/file-uploader/fileuploader.js',
      'https://cdn.jotfor.ms/s/umd/3cd7fdc8bce/for-widgets-server.js',
      'https://cdn.jotfor.ms/s/umd/3cd7fdc8bce/for-live-prefill.js',
      'https://cdn.jotfor.ms/s/static/8ae8dc8556c/js/vendor/smoothscroll.min.js',
      'https://cdn.jotfor.ms/s/static/8ae8dc8556c/js/errorNavigation.js'
    ];

    // Enable event observer
    window.enableEventObserver = true;

    // Load scripts sequentially
    scripts.forEach((src) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      document.head.appendChild(script);
    });

    // Load CSS
    const cssLinks = [
      'https://cdn.jotfor.ms/stylebuilder/static/form-common.css?v=7df20c2',
      'https://cdn.jotfor.ms/themes/CSS/defaultV2.css?v=7df20c2',
      'https://cdn.jotfor.ms/themes/CSS/548b1325700cc48d318b4567.css?v=3.3.67259&themeRevisionID=64ff099762313412041c01ae',
      'https://cdn.jotfor.ms/s/static/8ae8dc8556c/css/styles/payment/payment_styles.css?3.3.67259',
      'https://cdn.jotfor.ms/s/static/8ae8dc8556c/css/styles/payment/payment_feature.css?3.3.67259',
      'https://cdn.jotfor.ms/stylebuilder/static/color-scheme.css?v=3.3.67259'
    ];

    cssLinks.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = href;
      document.head.appendChild(link);
    });

    // Pre-fill rep ID from URL if present
    setTimeout(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const repId = urlParams.get('repId');
      if (repId) {
        const repInput = document.getElementById('input_103');
        if (repInput) {
          repInput.value = repId;
        }
      }
    }, 1000);
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
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[400px] bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#08708E]/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="grid lg:grid-cols-2 gap-8 items-center w-full">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                Apply for Funding
              </h1>
              <p className="text-base text-white/70 mb-4">
                Complete your application in minutes and get a decision within 24 hours.
              </p>
              <div className="flex items-center gap-3 text-white/90">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#22d3ee]" />
                  <span className="text-xs">A+ BBB Rating</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#22d3ee]" />
                  <span className="text-xs">24hr Funding</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block"
            >
              <img 
                src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop" 
                alt="Apply for Funding"
                className="rounded-2xl shadow-2xl h-64 w-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-6">
                <div dangerouslySetInnerHTML={{__html: `
                  <form class="jotform-form" action="https://submit.jotform.com/submit/252957146872065" method="post" enctype="multipart/form-data" name="form_252957146872065" id="252957146872065" accept-charset="utf-8" autocomplete="on">
                    <input type="hidden" name="formID" value="252957146872065" />
                    <div role="main" class="form-all">
                      <p style="text-align: center; padding: 40px; color: #08708E; font-size: 18px;">
                        Loading application form...
                      </p>
                    </div>
                  </form>
                `}} />
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
    </section>
    </div>
  );
}