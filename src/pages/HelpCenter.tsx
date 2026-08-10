import React from 'react';
import { Phone, Mail, Clock, MapPin, ShieldAlert, Award, MessageCircle } from 'lucide-react';
import { FaqSection } from '../components/home/FaqSection';
import { useLanguage } from '../context/LanguageContext';

export const HelpCenter: React.FC = () => {
  const { t } = useLanguage();

  const handleWhatsApp = () => {
    window.open('https://wa.me/917352502508?text=Hello%20Siraj%20Bedding%20House', '_blank');
  };

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col text-center">
        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-705">Customer Support</span>
        <h2 className="font-sans font-extrabold text-2xl sm:text-3xl mt-0.5 tracking-tight">{t('helpCenter')}</h2>
        <p className="font-sans text-xs text-stone-500 max-w-md mx-auto mt-1">
          Have questions about mattress sizing, shipping logistics, or custom upholstery? We are here to assist.
        </p>
      </div>

      {/* Grid: Contacts & Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Contact panel */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 border-b border-stone-50 dark:border-stone-850 pb-2">Direct Contact channels</span>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Phone className="text-amber-700 mt-0.5" size={16} />
              <div className="flex flex-col text-left">
                <span className="font-bold text-xs">Call Support</span>
                <div className="flex flex-col gap-0.5 mt-0.5">
                  <a href="tel:+919800094590" className="text-[11px] text-stone-600 dark:text-stone-400 hover:text-amber-700 font-medium">
                    +91 98000 94590
                  </a>
                  <a href="tel:+917352502508" className="text-[11px] text-stone-600 dark:text-stone-400 hover:text-amber-700 font-medium">
                    +91 73525 02508
                  </a>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MessageCircle className="text-emerald-600 mt-0.5" size={16} />
              <div className="flex flex-col text-left">
                <span className="font-bold text-xs">WhatsApp Support</span>
                <button
                  onClick={handleWhatsApp}
                  className="text-[11px] text-emerald-600 hover:underline mt-0.5 font-bold cursor-pointer text-left"
                >
                  +91 73525 02508 (Click to Chat on WhatsApp)
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="text-amber-700 mt-0.5" size={16} />
              <div className="flex flex-col text-left">
                <span className="font-bold text-xs">Email Correspondence</span>
                <a href="mailto:mdshussain8725@gmail.com" className="text-[11px] text-stone-600 dark:text-stone-400 hover:text-amber-700 mt-0.5 font-medium">
                  mdshussain8725@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="text-amber-700 mt-0.5" size={16} />
              <div className="flex flex-col text-left">
                <span className="font-bold text-xs">Studio Timings</span>
                <span className="text-[11px] text-stone-400 mt-0.5">Mon - Sat: 10:00 AM - 08:30 PM (Sunday Open)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Address and Maps */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 border-b border-stone-50 dark:border-stone-850 pb-2">Bedding studio location</span>
          <div className="flex items-start gap-3 text-left">
            <MapPin className="text-amber-700 mt-0.5 flex-shrink-0" size={16} />
            <div className="flex flex-col">
              <span className="font-bold text-xs">Store Address</span>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed mt-0.5">
                <strong>Janai Subeder More</strong>, Vill: Janai, Post: Janai, P.S: Chanditala, Dist: Hooghly, West Bengal - 712304
              </p>
            </div>
          </div>
          
          {/* Studio Map Location Card */}
          <div className="h-32 w-full rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200/30 flex items-center justify-center overflow-hidden">
            <div className="flex flex-col items-center gap-1 text-[10px] text-stone-400 p-4 text-center">
              <MapPin size={20} className="text-amber-750" />
              <span className="font-bold text-stone-700 dark:text-stone-200">Siraj Bedding House</span>
              <span>Janai Subeder More, Hooghly, Pin: 712304</span>
            </div>
          </div>
        </div>

      </div>

      {/* Accordion FAQ block */}
      <FaqSection />

      {/* System Policy cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Policy 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/50 flex flex-col gap-2">
          <Award className="text-amber-700" size={20} />
          <h4 className="font-bold text-xs uppercase tracking-wider">Shipping & Logistics</h4>
          <p className="text-[11px] text-stone-450 leading-relaxed">
            Free shipping on mattresses and bedding rolls nationwide. Custom blocks or bulk upholstery foams delivered via regional vans.
          </p>
        </div>

        {/* Policy 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/50 flex flex-col gap-2">
          <MessageCircle className="text-amber-700" size={20} />
          <h4 className="font-bold text-xs uppercase tracking-wider">Payment Gateways</h4>
          <p className="text-[11px] text-stone-455 leading-relaxed">
            We support secured payment checkouts using UPI portals, cards, wallets, net banking, or Cash On Delivery (COD) services.
          </p>
        </div>

        {/* Policy 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/50 flex flex-col gap-2">
          <ShieldAlert className="text-amber-700" size={20} />
          <h4 className="font-bold text-xs uppercase tracking-wider">Warranties & Returns</h4>
          <p className="text-[11px] text-stone-455 leading-relaxed">
            Mattresses carry up to 10-15 year warranties against sagging. 10 days return policy for manufacturing faults or shipping damages.
          </p>
        </div>

      </section>

    </div>
  );
};
