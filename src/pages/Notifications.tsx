import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Sliders, 
  Tag, 
  Sparkles, 
  Package, 
  Truck, 
  Percent, 
  ExternalLink,
  CheckCheck
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import type { Notification } from '../types';

export const Notifications: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    fcmConfig,
    requestNotificationPermission,
    saveFCMConfig,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useNotifications();

  // Settings tab or list view selector
  const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list');

  const handleToggleSetting = (key: keyof typeof fcmConfig.settings) => {
    const updated = {
      ...fcmConfig,
      settings: {
        ...fcmConfig.settings,
        [key]: !fcmConfig.settings[key]
      }
    };
    saveFCMConfig(updated);
  };

  const handleToggleGlobal = () => {
    const updated = {
      ...fcmConfig,
      enabled: !fcmConfig.enabled
    };
    saveFCMConfig(updated);
  };

  const handleNotificationClick = (notif: Notification) => {
    markNotificationAsRead(notif.id);
    if (notif.link) {
      if (notif.link.startsWith('http')) {
        window.open(notif.link, '_blank');
      } else {
        navigate(notif.link);
      }
    }
  };

  const getNotifIcon = (type: Notification['type']) => {
    switch (type) {
      case 'offer':
      case 'flashSale':
      case 'price_drop':
        return <Percent size={18} className="text-amber-600 dark:text-amber-400" />;
      case 'festival':
        return <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />;
      case 'order':
        return <Package size={18} className="text-blue-600 dark:text-blue-400" />;
      case 'delivery':
        return <Truck size={18} className="text-emerald-600 dark:text-emerald-400" />;
      case 'product':
      case 'back_in_stock':
        return <Tag size={18} className="text-rose-600 dark:text-rose-400" />;
      default:
        return <Bell size={18} className="text-amber-700 dark:text-amber-400" />;
    }
  };

  const getNotifBadge = (type: Notification['type']) => {
    switch (type) {
      case 'offer':
      case 'flashSale':
        return 'Flash Offer';
      case 'festival':
        return 'Festival Special';
      case 'order':
        return 'Order Alert';
      case 'delivery':
        return 'Delivery Update';
      case 'product':
        return 'New Arrival';
      case 'price_drop':
        return 'Price Drop';
      default:
        return 'Announcement';
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col text-left">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-400">Communication Desk</span>
          <h2 className="font-sans font-extrabold text-2xl sm:text-3xl mt-0.5 tracking-tight">{t('notifications')}</h2>
        </div>
        {unreadCount > 0 && activeTab === 'list' && (
          <button
            onClick={markAllNotificationsAsRead}
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded-xl border border-amber-200/40 dark:border-amber-800/40"
          >
            <CheckCheck size={14} />
            <span>{t('markAllRead')}</span>
          </button>
        )}
      </div>

      {/* Permission Box if not granted */}
      {fcmConfig.permission !== 'granted' && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-600/30 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm text-left">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-600 text-white rounded-2xl flex-shrink-0">
              <Bell size={20} />
            </div>
            <div className="flex flex-col">
              <h4 className="font-sans font-bold text-sm text-stone-900 dark:text-stone-100">Enable Device Notifications</h4>
              <p className="font-sans text-xs text-stone-500 dark:text-stone-400 leading-relaxed mt-0.5">
                Receive live order tracking status, flash sales, festival offers, and exclusive discount codes directly on this device.
              </p>
            </div>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="bg-luxury-gold hover:opacity-90 active:scale-[0.98] py-2.5 px-5 rounded-xl text-stone-100 font-sans font-bold text-xs cursor-pointer shadow-md self-start sm:self-center flex-shrink-0 whitespace-nowrap transition-all"
          >
            Allow Notifications
          </button>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex border-b border-stone-200/40 dark:border-stone-850/40 pb-px">
        {(['list', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-grow sm:flex-grow-0 sm:px-6 py-2.5 font-sans font-bold text-xs border-b-2 capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? 'border-amber-700 text-amber-700 dark:text-amber-400 font-extrabold'
                : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            {tab === 'list' ? `Alerts (${notifications.length})` : 'Preferences'}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: ALERTS LIST */}
      {activeTab === 'list' && (
        <div className="flex flex-col gap-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center max-w-xs mx-auto">
              <div className="p-4 bg-stone-100 dark:bg-stone-900 rounded-full text-stone-400">
                <Bell size={32} />
              </div>
              <h4 className="font-sans font-bold text-base">{t('noNotifications')}</h4>
              <p className="font-sans text-xs text-stone-500 dark:text-stone-400">
                You have no active alerts. Admin FMC broadcasts and order updates will appear here in real-time.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all relative flex flex-col gap-3 cursor-pointer ${
                  notif.isRead
                    ? 'bg-white dark:bg-stone-900 border-stone-200/40 dark:border-stone-850/30 opacity-80'
                    : 'bg-white dark:bg-stone-900 border-amber-600/40 shadow-sm ring-1 ring-amber-600/10'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Left icon wrapper */}
                  <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-stone-800 h-max flex-shrink-0 border border-amber-200/40 dark:border-stone-700/50">
                    {getNotifIcon(notif.type)}
                  </div>

                  {/* Body details */}
                  <div className="flex-grow flex flex-col gap-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] uppercase font-extrabold tracking-wider bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md">
                        {getNotifBadge(notif.type)}
                      </span>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                      )}
                    </div>

                    <h4 className="font-sans font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 mt-0.5">
                      {notif.title}
                    </h4>
                    
                    <p className="font-sans text-xs text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                      {notif.body}
                    </p>

                    {/* Image preview if provided by admin */}
                    {notif.imageUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden max-h-48 w-full border border-stone-200/50 dark:border-stone-800">
                        <img 
                          src={notif.imageUrl} 
                          alt="Notification banner" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 dark:border-stone-850/50 text-[10px] text-stone-400">
                      <span>
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                      {notif.link && (
                        <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1 hover:underline">
                          <span>View Details</span>
                          <ExternalLink size={10} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: SETTINGS PREFERENCES */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm flex flex-col gap-6 text-left">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-850 pb-4">
            <div className="flex flex-col">
              <span className="font-bold text-sm flex items-center gap-1.5 text-stone-900 dark:text-stone-100">
                <Sliders size={16} className="text-amber-700 dark:text-amber-400" />
                <span>Allow Push Notifications</span>
              </span>
              <p className="text-xs text-stone-400 mt-0.5">Toggle push alerts and live updates on this device.</p>
            </div>
            <button
              onClick={handleToggleGlobal}
              className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                fcmConfig.enabled ? 'bg-amber-700' : 'bg-stone-200 dark:bg-stone-800'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                fcmConfig.enabled ? 'right-1' : 'left-1'
              }`} />
            </button>
          </div>

          {fcmConfig.enabled && (
            <div className="flex flex-col gap-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Subscription Channels</span>
              
              {([
                { key: 'welcome', label: 'Welcome Alerts', desc: 'Greeting instructions and setup vouchers.' },
                { key: 'newProduct', label: 'New Collections', desc: 'Notification on mattress protectors or luxury curtains launches.' },
                { key: 'festivalOffer', label: 'Festival Offer Updates', desc: 'Seasonal discount campaigns during major holidays.' },
                { key: 'flashSale', label: 'Flash Offers', desc: 'Limited hour stock clearance deals.' },
                { key: 'priceDrop', label: 'Wishlist Price Drops', desc: 'Alerts when saved mattress price decreases.' },
                { key: 'orderUpdate', label: 'Order Status Changes', desc: 'Timeline confirmations, packing details.' },
                { key: 'deliveryUpdate', label: 'Delivery Handover progress', desc: 'Courier dispatch and out for delivery notifications.' }
              ] as const).map(item => (
                <div key={item.key} className="flex items-center justify-between text-xs py-1">
                  <div className="flex flex-col pr-6">
                    <span className="font-bold text-stone-800 dark:text-stone-200">{item.label}</span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">{item.desc}</span>
                  </div>
                  <button
                    onClick={() => handleToggleSetting(item.key)}
                    className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 cursor-pointer ${
                      fcmConfig.settings[item.key] ? 'bg-amber-700' : 'bg-stone-200 dark:bg-stone-800'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                      fcmConfig.settings[item.key] ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
