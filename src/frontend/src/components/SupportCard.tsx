import React from 'react';
import { SiWhatsapp } from 'react-icons/si';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '01831097802';
const WHATSAPP_LINK = 'https://wa.me/8801831097802';

export default function SupportCard() {
  return (
    <div className="bg-card border border-primary/30 rounded-2xl p-5 relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />

      <div className="relative flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl green-gradient flex items-center justify-center shrink-0">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">সাপোর্ট / যোগাযোগ</h3>
          <p className="text-xs text-muted-foreground">যেকোনো সমস্যায় আমাদের সাথে যোগাযোগ করুন</p>
        </div>
      </div>

      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between w-full bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 rounded-xl px-4 py-3 transition-all duration-200 group"
      >
        <div className="flex items-center gap-3">
          <SiWhatsapp className="w-6 h-6 text-primary shrink-0" />
          <div>
            <p className="text-sm font-bold text-foreground">{WHATSAPP_NUMBER}</p>
            <p className="text-xs text-muted-foreground">WhatsApp-এ মেসেজ করুন</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/30 rounded-full px-3 py-1 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
          চ্যাট করুন
        </span>
      </a>
    </div>
  );
}
