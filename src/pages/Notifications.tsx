import React, { useState } from 'react';
import { Bell, Volume2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import type { Notification } from '../types';

export const Notifications: React.FC = () => {
  const {
    notifications,
    unreadCount,
    fcmConfig,
    requestNotificationPermission,
    saveFCMConfig,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    triggerAdminPush
  } = useNotifications();

  // Settings tab or list view selector
  const [activeTab, setActiveTab] = useState<'list' | 'settings' | 'admin'>('list');

  // Simulated Admin Push Form
  const [adminTitle, setAdminTitle] = useState('Weekend Flash Offer! ⚡');
  const [adminBody, setAdminBody] = useState('Get extra 15% discount on all custom sofa foams and pillow blocks. Valid today!');
  const [adminType, setAdminType] = useState<Notification['type']>('offer');

  const handleAdminTriggerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminTitle.trim() || !adminBody.trim()) return;

    triggerAdminPush(adminTitle, adminBody, adminType, '/categories');
    setAdminTitle('');
    setAdminBody('');
    setActiveTab('list');
  };

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

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-400">Communication Desk</span>
          <h2 className="font-sans font-extrabold text-2xl sm:text-3xl mt-0.5 tracking-tight">Notification Center</h2>
        </div>
        {unreadCount > 0 && activeTab === 'list' && (
          <button
            onClick={markAllNotificationsAsRead}
            className="text-xs font-bold text-amber-700 dark:text-amber-405 hover:underline cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* FCM Permission Popup trigger if Default */}
      {fcmConfig.permission === 'default' && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Bell size={20} className="text-amber-705 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <h4 className="font-sans font-bold text-xs">Enable Push Notifications</h4>
              <p className="font-sans text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed mt-0.5">
                Receive real-time order tracking updates, back-in-stock alerts, and custom discount codes directly.
              </p>
            </div>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="bg-luxury-gold hover:opacity-90 py-2 px-4 rounded-xl text-stone-100 font-sans font-bold text-xs cursor-pointer shadow-md self-start sm:self-center flex-shrink-0"
          >
            Enable Now
          </button>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex border-b border-stone-200/40 dark:border-stone-850/40 pb-px">
        {(['list', 'settings', 'admin'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-grow sm:flex-grow-0 sm:px-6 py-2.5 font-sans font-bold text-xs border-b-2 capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? 'border-amber-700 text-amber-700 font-extrabold'
                : 'border-transparent text-stone-400 hover:text-stone-605'
            }`}
          >
            {tab === 'list' ? `Alerts (${notifications.length})` : tab === 'settings' ? 'Preferences' : 'Admin Panel (FCM)'}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: ALERTS LIST */}
      {activeTab === 'list' && (
        <div className="flex flex-col gap-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center max-w-xs mx-auto">
              <div className="p-4 bg-stone-100 dark:bg-stone-900 rounded-full text-stone-450">
                <Bell size={32} />
              </div>
              <h4 className="font-sans font-bold text-base">All Clear</h4>
              <p className="font-sans text-xs text-stone-500 dark:text-stone-400">
                You have no new alerts in your notification queue.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-4 rounded-2xl border transition-all relative flex gap-3.5 cursor-pointer ${
                  notif.isRead
                    ? 'bg-white dark:bg-stone-900 border-stone-200/40 dark:border-stone-850/30 opacity-75'
                    : 'bg-amber-50/10 dark:bg-amber-955/5 border-amber-600/30'
                }`}
              >
                {/* Visual Unread dot */}
                {!notif.isRead && (
                  <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-700 animate-pulse" />
                )}

                {/* Left icon wrapper */}
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-500 dark:text-stone-400 h-max flex-shrink-0">
                  <Bell size={16} />
                </div>

                {/* Body details */}
                <div className="flex-grow flex flex-col gap-1 pr-6 text-left">
                  <h4 className="font-sans font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                    {notif.title}
                  </h4>
                  <p className="font-sans text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    {notif.body}
                  </p>
                  <span className="text-[9px] text-stone-400 mt-1">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: SETTINGS PREFERENCES */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-850 pb-4">
            <div className="flex flex-col">
              <span className="font-bold text-sm">Allow System Notifications</span>
              <p className="text-xs text-stone-400 mt-0.5">Toggle push alerts globally across this PWA environment.</p>
            </div>
            <button
              onClick={handleToggleGlobal}
              className={`w-11 h-6 rounded-full transition-all relative ${
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
                { key: 'deliveryUpdate', label: 'Delivery Handover progress', desc: 'Simulated courier out for delivery notifications.' }
              ] as const).map(item => (
                <div key={item.key} className="flex items-center justify-between text-xs py-1">
                  <div className="flex flex-col pr-6">
                    <span className="font-bold">{item.label}</span>
                    <span className="text-[11px] text-stone-450 dark:text-stone-400 mt-0.5 leading-relaxed">{item.desc}</span>
                  </div>
                  <button
                    onClick={() => handleToggleSetting(item.key)}
                    className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${
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

      {/* TAB CONTENT: ADMIN SIMULATED PUSHER */}
      {activeTab === 'admin' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-start gap-3 border-b border-stone-100 dark:border-stone-850/30 pb-3">
            <Volume2 className="text-amber-700 flex-shrink-0 mt-0.5" size={18} />
            <div className="flex flex-col">
              <span className="font-bold text-sm">FCM simulated Broadcaster</span>
              <p className="text-xs text-stone-400 mt-0.5">Use this administrative sandbox tool to mock incoming push updates.</p>
            </div>
          </div>

          <form onSubmit={handleAdminTriggerSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-stone-400 font-bold uppercase">Push Notification Title</span>
              <input
                type="text" required
                value={adminTitle} onChange={(e) => setAdminTitle(e.target.value)}
                placeholder="Title text"
                className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-stone-400 font-bold uppercase">Push message Body details</span>
              <textarea
                required rows={3}
                value={adminBody} onChange={(e) => setAdminBody(e.target.value)}
                placeholder="Alert description"
                className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-stone-400 font-bold uppercase">Alert type Channel</span>
              <select
                value={adminType}
                onChange={(e) => setAdminType(e.target.value as any)}
                className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none"
              >
                <option value="offer">Flash Offer Promotion</option>
                <option value="product">New Product Alert</option>
                <option value="festival">Festival Campaign</option>
                <option value="price_drop">Price Drop Alert</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-luxury-gold hover:opacity-90 py-3 rounded-xl font-sans font-bold text-xs text-stone-100 mt-2 shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Broadcast Push Broadcast</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
