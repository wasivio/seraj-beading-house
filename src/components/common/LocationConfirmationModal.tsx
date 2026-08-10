import React from 'react';
import { MapPin, Check, AlertTriangle, X, RefreshCw, Edit3, ShieldCheck, Navigation } from 'lucide-react';
import type { ReverseGeocodedAddress } from '../../services/ReverseGeocodingService';
import type { LocationErrorDetails } from '../../services/LocationPermissionHandler';

interface LocationConfirmationModalProps {
  isOpen: boolean;
  isDetecting: boolean;
  address: ReverseGeocodedAddress | null;
  accuracy: number | null;
  isAccuracyPoor: boolean;
  errorDetails: LocationErrorDetails | null;
  onConfirm: (address: ReverseGeocodedAddress) => void;
  onEdit: (address: ReverseGeocodedAddress) => void;
  onRetry: () => void;
  onClose: () => void;
  onManualEntry: () => void;
}

export const LocationConfirmationModal: React.FC<LocationConfirmationModalProps> = ({
  isOpen,
  isDetecting,
  address,
  accuracy,
  isAccuracyPoor,
  errorDetails,
  onConfirm,
  onEdit,
  onRetry,
  onClose,
  onManualEntry
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5 text-stone-900 dark:text-stone-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <X size={18} />
        </button>

        {/* 1. Detecting State */}
        {isDetecting && (
          <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center animate-ping absolute" />
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400">
                <Navigation size={28} className="animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-sans font-extrabold text-base">Detecting your location...</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs">
                Requesting satellite GPS and reverse geocoding your delivery address.
              </p>
            </div>
          </div>
        )}

        {/* 2. Error State */}
        {!isDetecting && errorDetails && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Location Alert</span>
                <h3 className="font-sans font-bold text-base">{errorDetails.title}</h3>
              </div>
            </div>

            <div className="bg-stone-50 dark:bg-stone-850/60 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 text-xs flex flex-col gap-2">
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed">{errorDetails.message}</p>
              <p className="text-stone-500 dark:text-stone-400 text-[11px] leading-relaxed italic">{errorDetails.actionHint}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              {errorDetails.canRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex-1 flex items-center justify-center gap-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 font-bold text-xs py-3 px-4 rounded-xl transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>Try Again</span>
                </button>
              )}
              <button
                type="button"
                onClick={onManualEntry}
                className="flex-1 flex items-center justify-center gap-2 bg-luxury-gold hover:opacity-90 text-stone-100 font-bold text-xs py-3 px-4 rounded-xl transition-opacity cursor-pointer shadow-md"
              >
                <Edit3 size={14} />
                <span>Enter Manually</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. Detected Address Confirmation */}
        {!isDetecting && address && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <MapPin size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Location Detected Successfully
                </span>
                <h3 className="font-sans font-bold text-base">Confirm Delivery Address</h3>
              </div>
            </div>

            {/* Low Accuracy Warning Banner */}
            {isAccuracyPoor && accuracy && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-[11px]">Low GPS Accuracy (±{Math.round(accuracy)}m)</span>
                  <span className="text-[11px] leading-relaxed">
                    Your location accuracy is low. Please review and edit the address fields if needed.
                  </span>
                </div>
              </div>
            )}

            {/* Address Details Card */}
            <div className="bg-stone-50 dark:bg-stone-850/60 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 flex flex-col gap-2.5 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-stone-900 dark:text-stone-100">{address.addressLine}</span>
                {accuracy && (
                  <span className="text-[10px] px-2 py-0.5 bg-stone-200 dark:bg-stone-800 rounded-full font-medium text-stone-600 dark:text-stone-300 flex-shrink-0">
                    ±{Math.round(accuracy)}m
                  </span>
                )}
              </div>

              <div className="text-stone-600 dark:text-stone-400 flex flex-col gap-1 leading-relaxed text-[11px]">
                {address.area && <span><strong>Area/Locality:</strong> {address.area}</span>}
                <span><strong>City / District:</strong> {address.city}{address.district && address.district !== address.city ? `, ${address.district}` : ''}</span>
                <span><strong>State & PIN Code:</strong> {address.state} - {address.pincode}</span>
                <span><strong>Country:</strong> {address.country}</span>
              </div>

              <div className="border-t border-stone-200/50 dark:border-stone-750 pt-2 flex items-center justify-between text-[10px] text-stone-400">
                <span>Coordinates: {address.latitude.toFixed(4)}°N, {address.longitude.toFixed(4)}°E</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck size={12} /> Verified
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-1">
              <button
                type="button"
                onClick={() => onEdit(address)}
                className="flex-1 flex items-center justify-center gap-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 font-bold text-xs py-3 px-4 rounded-xl transition-colors cursor-pointer"
              >
                <Edit3 size={14} />
                <span>Edit Address</span>
              </button>
              <button
                type="button"
                onClick={() => onConfirm(address)}
                className="flex-1 flex items-center justify-center gap-2 bg-luxury-gold hover:opacity-90 text-stone-100 font-bold text-xs py-3 px-4 rounded-xl transition-opacity cursor-pointer shadow-md"
              >
                <Check size={14} />
                <span>Confirm Location</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
