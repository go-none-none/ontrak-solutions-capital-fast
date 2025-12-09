import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Shield, TrendingUp, Phone } from 'lucide-react';

export default function Application() {
  const [jotformUrl, setJotformUrl] = useState('');
  useEffect(() => {
    // Get rep ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const repId = urlParams.get('repId') || '';
    
    // Build JotForm URL with rep ID parameter
    const baseUrl = 'https://form.jotform.com/252957146872065';
    const url = repId ? `${baseUrl}?q103_rep=${encodeURIComponent(repId)}` : baseUrl;
    
    setJotformUrl(url);
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
            {jotformUrl && (
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <iframe
                  id="JotFormIFrame-252957146872065"
                  title="OnTrak Business Funding Application"
                  allowFullScreen
                  allow="geolocation; microphone; camera; fullscreen"
                  src={jotformUrl}
                  frameBorder="0"
                  style={{
                    minWidth: '100%',
                    maxWidth: '100%',
                    height: '2000px',
                    border: 'none'
                  }}
                  scrolling="no"
                />
              </div>
            )}
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
      <script type="text/javascript" dangerouslySetInnerHTML={{__html: `
        var ifr = document.getElementById("JotFormIFrame-252957146872065");
        if (ifr) {
          var src = ifr.src;
          var iframeParams = [];
          if (window.location.href && window.location.href.indexOf("?") > -1) {
            iframeParams = iframeParams.concat(window.location.href.substr(window.location.href.indexOf("?") + 1).split('&'));
          }
          if (src && src.indexOf("?") > -1) {
            iframeParams = iframeParams.concat(src.substr(src.indexOf("?") + 1).split("&"));
            src = src.substr(0, src.indexOf("?"))
          }
          iframeParams.push("isIframeEmbed=1");
          ifr.src = src + "?" + iframeParams.join('&');
        }
        window.handleIFrameMessage = function(e) {
          if (typeof e.data === 'object') { return; }
          var args = e.data.split(":");
          if (args.length > 2) { iframe = document.getElementById("JotFormIFrame-" + args[(args.length - 1)]); } else { iframe = document.getElementById("JotFormIFrame"); }
          if (!iframe) { return; }
          switch (args[0]) {
            case "scrollIntoView":
              iframe.scrollIntoView();
              break;
            case "setHeight":
              iframe.style.height = args[1] + "px";
              if (!isNaN(args[1]) && parseInt(iframe.style.minHeight) > parseInt(args[1])) {
                iframe.style.minHeight = args[1] + "px";
              }
              break;
            case "collapseErrorPage":
              if (iframe.clientHeight > window.innerHeight) {
                iframe.style.height = window.innerHeight + "px";
              }
              break;
            case "reloadPage":
              window.location.reload();
              break;
            case "loadScript":
              if( !window.isPermitted(e.origin, ['jotform.com', 'jotform.pro']) ) { break; }
              var src = args[1];
              if (args.length > 3) {
                  src = args[1] + ':' + args[2];
              }
              var script = document.createElement('script');
              script.src = src;
              script.type = 'text/javascript';
              document.body.appendChild(script);
              break;
            case "exitFullscreen":
              if (window.document.exitFullscreen) window.document.exitFullscreen();
              else if (window.document.mozCancelFullScreen) window.document.mozCancelFullScreen();
              else if (window.document.mozCancelFullscreen) window.document.mozCancelFullScreen();
              else if (window.document.webkitExitFullscreen) window.document.webkitExitFullscreen();
              else if (window.document.msExitFullscreen) window.document.msExitFullscreen();
              break;
          }
          var isJotForm = (e.origin.indexOf("jotform") > -1) ? true : false;
          if(isJotForm && "contentWindow" in iframe && "postMessage" in iframe.contentWindow) {
            var urls = {"docurl":encodeURIComponent(document.URL),"referrer":encodeURIComponent(document.referrer)};
            iframe.contentWindow.postMessage(JSON.stringify({"type":"urls","value":urls}), "*");
          }
        };
        window.isPermitted = function(originUrl, whitelisted_domains) {
          var url = document.createElement('a');
          url.href = originUrl;
          var hostname = url.hostname;
          var result = false;
          if( typeof hostname !== 'undefined' ) {
            whitelisted_domains.forEach(function(element) {
                if( hostname.slice((-1 * element.length - 1)) === '.'.concat(element) ||  hostname === element ) {
                    result = true;
                }
            });
            return result;
          }
        };
        if (window.addEventListener) {
          window.addEventListener("message", handleIFrameMessage, false);
        } else if (window.attachEvent) {
          window.attachEvent("onmessage", handleIFrameMessage);
        }
      `}} />
    </div>
  );
}