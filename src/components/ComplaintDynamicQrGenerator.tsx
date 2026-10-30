import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Share2,
  Copy,
  Check,
  Download,
  Printer,
  ExternalLink,
  Sparkles,
  Smartphone,
  Palette,
  ShieldCheck,
  MessageSquare,
  Clock,
  Send,
  Info,
  CheckCircle2,
  Sliders,
  FileDown,
  Layers,
} from 'lucide-react';
import { Complaint } from '../types';

interface ComplaintDynamicQrGeneratorProps {
  complaint: Complaint;
  onOpenPrintModal?: () => void;
  onDownloadPdf?: () => void;
  onOpenWhatsAppModal?: (id: string) => void;
  className?: string;
}

type QrColorTheme = 'emerald' | 'sky' | 'amber' | 'purple' | 'slate';
type QrContentType = 'direct' | 'wa' | 'full';

const COLOR_PALETTES: Record<
  QrColorTheme,
  {
    name: string;
    darkColor: string;
    bgAccent: string;
    borderAccent: string;
    textAccent: string;
    badgeBg: string;
  }
> = {
  emerald: {
    name: 'Zamrud Syariah',
    darkColor: '#064e3b',
    bgAccent: 'bg-emerald-950/40',
    borderAccent: 'border-emerald-500/50',
    textAccent: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  sky: {
    name: 'Biru Tabligh',
    darkColor: '#0369a1',
    bgAccent: 'bg-sky-950/40',
    borderAccent: 'border-sky-500/50',
    textAccent: 'text-sky-400',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  },
  amber: {
    name: 'Emas Khidmat',
    darkColor: '#78350f',
    bgAccent: 'bg-amber-950/40',
    borderAccent: 'border-amber-500/50',
    textAccent: 'text-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  purple: {
    name: 'Ungu Fathanah',
    darkColor: '#581c87',
    bgAccent: 'bg-purple-950/40',
    borderAccent: 'border-purple-500/50',
    textAccent: 'text-purple-400',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  slate: {
    name: 'Monokrom Standar',
    darkColor: '#0f172a',
    bgAccent: 'bg-slate-900/60',
    borderAccent: 'border-slate-600/50',
    textAccent: 'text-slate-300',
    badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
  },
};

export const ComplaintDynamicQrGenerator: React.FC<ComplaintDynamicQrGeneratorProps> = ({
  complaint,
  onOpenPrintModal,
  onDownloadPdf,
  onOpenWhatsAppModal,
  className = '',
}) => {
  const [selectedTheme, setSelectedTheme] = useState<QrColorTheme>('emerald');
  const [contentType, setContentType] = useState<QrContentType>('direct');
  const [errorCorrection, setErrorCorrection] = useState<'M' | 'H'>('H');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute canonical URL for this ticket
  const getTicketUrl = () => {
    if (typeof window === 'undefined') return `https://amanahgov.id/?ticket=${complaint.id}`;
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?ticket=${encodeURIComponent(complaint.id)}`;
  };

  const ticketUrl = getTicketUrl();

  // Create WhatsApp share message and URL
  const getWhatsAppShareUrl = () => {
    const message = `*Layanan Pengaduan AmanahGov - Bukti Tiket Warga*\n\n` +
      `📋 *No. Tiket:* ${complaint.id}\n` +
      `📌 *Judul:* ${complaint.title}\n` +
      `🏢 *Dinas:* ${complaint.assignedDepartment}\n` +
      `⚡ *Status:* ${complaint.status.replace(/_/g, ' ')}\n` +
      `⏳ *SLA:* ${complaint.slaTargetHours} Jam (Berjalan: ${complaint.elapsedHours} Jam)\n\n` +
      `🔍 *Pantau Progres Penanganan & Audit Blockchain:* \n${ticketUrl}\n\n` +
      `_Sistem Pelayanan Terbuka Berlandaskan Shiddiq, Amanah, Tabligh & Fathanah._`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  };

  // Determine payload string encoded in the QR code
  const getEncodedPayload = () => {
    if (contentType === 'wa') {
      return getWhatsAppShareUrl();
    }
    return ticketUrl;
  };

  const encodedPayload = getEncodedPayload();
  const activePalette = COLOR_PALETTES[selectedTheme];

  // Dynamic QR Code Generation
  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);

    QRCode.toDataURL(encodedPayload, {
      errorCorrectionLevel: errorCorrection,
      margin: 2,
      width: 420,
      color: {
        dark: activePalette.darkColor,
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Error generating dynamic QR code:', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [encodedPayload, activePalette.darkColor, errorCorrection]);

  // Mobile Web Share API
  const handleNativeShare = async () => {
    const shareData = {
      title: `Tiket Aduan #${complaint.id} - AmanahGov`,
      text: `Pantau status tindak lanjut aduan warga "${complaint.title}" secara real-time dan transparan berlandaskan prinsip Amanah.`,
      url: ticketUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        setShareSuccess('Berhasil dibagikan melalui perangkat ponsel!');
        setTimeout(() => setShareSuccess(null), 3000);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // If cancelled, do nothing. If error, fall back to copy link
          handleCopyLink();
        }
      }
    } else {
      // Fallback to copy link on desktop browsers
      handleCopyLink();
    }
  };

  // Copy Direct Link
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(ticketUrl);
      } else {
        const input = document.createElement('input');
        input.value = ticketUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setIsCopied(true);
      setShareSuccess('Tautan berhasil disalin ke papan klip!');
      setTimeout(() => {
        setIsCopied(false);
        setShareSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Direct WhatsApp Share Trigger
  const handleDirectWhatsApp = () => {
    const waUrl = getWhatsAppShareUrl();
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Download High-Resolution QR Card with Branding Frame
  const handleDownloadQrImage = () => {
    if (!qrDataUrl) return;

    // Create a high-res framed badge canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      // Fallback to raw QR download
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `QR-AmanahGov-${complaint.id}.png`;
      link.click();
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Canvas size: 600 x 780 px
      canvas.width = 600;
      canvas.height = 780;

      // Background rounded card
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 600, 780);

      // Top Header Bar
      ctx.fillStyle = activePalette.darkColor;
      ctx.fillRect(0, 0, 600, 110);

      // Header Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PORTAL ADUAN WARGA AMANAHGOV', 300, 48);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '14px sans-serif';
      ctx.fillText('Sistem Transparansi Pelayanan Publik Berlandaskan Syariah', 300, 78);

      // Ticket Badge Box
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(40, 130, 520, 65);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(40, 130, 520, 65);

      ctx.fillStyle = activePalette.darkColor;
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`TIKET: #${complaint.id}`, 60, 168);

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Kategori: ${complaint.category}`, 540, 168);

      // Draw QR Code
      const qrSize = 380;
      const qrX = (600 - qrSize) / 2;
      const qrY = 215;
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      // Title & Instruction
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      const shortTitle = complaint.title.length > 55 ? complaint.title.substring(0, 52) + '...' : complaint.title;
      ctx.fillText(shortTitle, 300, 625);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.fillText('Arahkan kamera HP Anda ke QR Code untuk melacak status aduan.', 300, 650);
      ctx.fillText(`OPD Bertugas: ${complaint.assignedDepartment}`, 300, 672);

      // Bottom verification footer
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 710, 600, 70);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(0, 710, 600, 70);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓ TERVERIFIKASI SISTEM AMANAH & TERCATAT PADA BUKU BESAR BLOCKCHAIN', 300, 745);

      // Trigger download
      const framedUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = framedUrl;
      link.download = `QR-Tiket-AmanahGov-${complaint.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    img.src = qrDataUrl;
  };

  const remainingHours = Math.max(0, complaint.slaTargetHours - complaint.elapsedHours);

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 ${className}`}
      id="complaint-dynamic-qr-generator"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <QrCode className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Generator QR Code Dinamis &amp; Bagikan Tiket
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activePalette.badgeBg}`}>
                {activePalette.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Hasilkan QR Code siap pindai untuk pelacakan cepat warga via kamera HP tanpa login.
            </p>
          </div>
        </div>

        {/* Quick Share Pill Banner */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Kustomisasi warna dan pengaturan QR Code"
          >
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            <span>{showAdvanced ? 'Tutup Opsi' : 'Kustomisasi QR'}</span>
          </button>
        </div>
      </div>

      {/* Floating Success Feedback Alert */}
      {shareSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/70 text-emerald-200 flex items-center justify-between text-xs animate-in fade-in duration-200 shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{shareSuccess}</span>
          </div>
          <button
            onClick={() => setShareSuccess(null)}
            className="text-emerald-400 hover:text-white text-xs font-semibold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Interactive Controls & Live Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left Column: QR Code Display Card */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative group w-full max-w-[240px] flex flex-col items-center">
            {/* White Frame Card with Glowing Border */}
            <div
              className={`p-3.5 bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 w-full flex flex-col items-center justify-center ${activePalette.borderAccent} group-hover:shadow-2xl group-hover:scale-[1.02]`}
            >
              {/* Header inside QR Frame */}
              <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-slate-700 border-b border-slate-200 pb-1 mb-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  AMANAHGOV
                </span>
                <span className="text-emerald-800">#{complaint.id}</span>
              </div>

              {/* QR Image or Loading Placeholder */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-2 text-slate-500 text-xs">
                    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <span>Membuat QR...</span>
                  </div>
                ) : qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code Tiket ${complaint.id}`}
                    className="w-44 h-44 object-contain transition-opacity duration-200"
                  />
                ) : (
                  <div className="text-slate-400 text-xs">Memuat QR...</div>
                )}
              </div>

              {/* Footer inside QR Frame */}
              <div className="w-full pt-1.5 mt-1 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-500 font-semibold">
                <span>Pindai via Kamera HP</span>
                <span className="font-mono text-emerald-700">Tingkat {errorCorrection}</span>
              </div>
            </div>

            {/* Sub-label under QR */}
            <p className="text-[11px] text-slate-400 text-center mt-2.5 flex items-center justify-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>Dapat dipindai dari layar HP lain atau lembar cetak</span>
            </p>
          </div>
        </div>

        {/* Right Column: Customization & Direct Actions */}
        <div className="md:col-span-7 space-y-4">
          {/* Advanced Customization Dropdown / Panel */}
          {showAdvanced && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 animate-in fade-in duration-200">
              {/* Color Theme Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Palette className="w-3.5 h-3.5 text-teal-400" />
                  <span>Pilihan Tema Warna QR:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(COLOR_PALETTES) as QrColorTheme[]).map((themeKey) => {
                    const pal = COLOR_PALETTES[themeKey];
                    const isSelected = selectedTheme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        onClick={() => setSelectedTheme(themeKey)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 text-white border-teal-400 shadow-sm'
                            : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                          style={{ backgroundColor: pal.darkColor }}
                        />
                        <span className="truncate text-[11px]">{pal.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QR Content / Share Destination Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Tujuan Tautan QR:
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setContentType('direct')}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        contentType === 'direct'
                          ? 'bg-teal-950 text-teal-300 border-teal-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      Pelacakan Web
                    </button>
                    <button
                      onClick={() => setContentType('wa')}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        contentType === 'wa'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      Langsung ke WA
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Ketahanan Pindai (Koreksi):
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setErrorCorrection('H')}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        errorCorrection === 'H'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                      title="Level Tinggi (30% pemulihan data, ideal untuk cetak fisik)"
                    >
                      Tinggi (H - 30%)
                    </button>
                    <button
                      onClick={() => setErrorCorrection('M')}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        errorCorrection === 'M'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                      title="Level Sedang (15% pemulihan data, respons lebih cepat)"
                    >
                      Sedang (M - 15%)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ticket Information Highlights */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Tautan Pelacakan Langsung:</span>
              <span className="font-mono text-emerald-400 font-semibold">#{complaint.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={ticketUrl}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-teal-300 font-mono select-all focus:outline-none focus:ring-1 focus:ring-teal-500/50"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isCopied
                    ? 'bg-emerald-500 text-white border-emerald-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Salin tautan langsung tiket ini"
                id="btn-copy-ticket-url"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-teal-400" />}
                <span>{isCopied ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* Primary Mobile Sharing Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* Native Mobile Share Button (Web Share API) */}
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/50 transition-all cursor-pointer group"
              id="btn-native-share-mobile"
              title="Bagikan tautan aduan melalui aplikasi di ponsel (WhatsApp, Telegram, SMS, dll)"
            >
              <Share2 className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Bagikan via Ponsel</span>
            </button>

            {/* Direct WhatsApp Share Button */}
            <button
              onClick={handleDirectWhatsApp}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/50 transition-all cursor-pointer group"
              id="btn-share-whatsapp-direct"
              title="Buka WhatsApp untuk mengirimkan laporan tiket aduan ini"
            >
              <MessageSquare className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Bagikan ke WhatsApp</span>
            </button>
          </div>

          {/* Secondary Utility Actions (Download Image, Print Slip, PDF Document) */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
            <button
              onClick={handleDownloadQrImage}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-semibold transition-colors cursor-pointer"
              title="Unduh gambar QR Code kartu berbingkai resmi beresolusi tinggi (PNG)"
              id="btn-download-qr-framed-image"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Unduh Gambar QR (PNG)</span>
            </button>

            {onOpenPrintModal && (
              <button
                onClick={onOpenPrintModal}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                title="Buka lembar cetak tugas & kartu fisik"
                id="btn-open-print-slip"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Cetak Lembar Tugas</span>
              </button>
            )}

            {onDownloadPdf && (
              <button
                onClick={onDownloadPdf}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 text-xs font-semibold transition-colors cursor-pointer"
                title="Unduh Dokumen PDF Ber-TTE Resmi"
                id="btn-trigger-pdf-from-qr-box"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ekspor PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
