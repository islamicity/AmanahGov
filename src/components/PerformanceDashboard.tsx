import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  ShieldCheck,
  Building,
  Zap,
  Sparkles,
  BarChart3,
  Award,
  ArrowDownRight,
  ArrowUpRight,
  FileDown,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Check,
  Filter,
  X,
  Layers,
  Heart,
  Trophy,
  Info,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { DepartmentMetric, Complaint, ComplaintCategory } from '../types';
import { DEPARTMENT_METRICS, INITIAL_COMPLAINTS } from '../data/initialData';
import { ExportReportModal } from './ExportReportModal';
import { SlaWorkloadCalendar } from './SlaWorkloadCalendar';
import { LeaderboardInstansiTerbaik } from './LeaderboardInstansiTerbaik';
import { CategoryComparisonBarChart } from './CategoryComparisonBarChart';
import {
  exportPerformanceReportToCsv,
  exportPerformanceReportToPdf,
} from '../utils/performanceReportExport';

export const CATEGORY_FILTER_OPTIONS: {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  border: string;
  bgActive: string;
  textColor: string;
  defaultOpd: string;
}[] = [
  {
    id: 'SEMUA',
    label: 'Semua Kategori',
    shortLabel: 'Semua Kategori',
    color: '#10b981',
    border: '#10b981',
    bgActive: 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40',
    textColor: 'text-slate-300',
    defaultOpd: 'Seluruh OPD Pemerintah Kota',
  },
  {
    id: 'Infrastruktur Jalan',
    label: 'Infrastruktur Jalan',
    shortLabel: 'Infrastruktur Jalan',
    color: '#10b981',
    border: '#059669',
    bgActive: 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-md',
    textColor: 'text-emerald-400',
    defaultOpd: 'Dinas Pekerjaan Umum & Tata Ruang',
  },
  {
    id: 'Bansos & Bantuan Sosial',
    label: 'Bansos & Bantuan Sosial',
    shortLabel: 'Bansos & Sosial',
    color: '#0ea5e9',
    border: '#0284c7',
    bgActive: 'bg-sky-950/90 border-sky-500 text-sky-300 shadow-md',
    textColor: 'text-sky-400',
    defaultOpd: 'Dinas Sosial & Khidmat Dhuafa',
  },
  {
    id: 'Kesehatan & Puskesmas',
    label: 'Kesehatan & Puskesmas',
    shortLabel: 'Kesehatan & Medis',
    color: '#f59e0b',
    border: '#d97706',
    bgActive: 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-md',
    textColor: 'text-amber-400',
    defaultOpd: 'Dinas Kesehatan & Pelayanan Medis',
  },
  {
    id: 'Perizinan Usaha & UMKM',
    label: 'Perizinan Usaha & UMKM',
    shortLabel: 'Perizinan UMKM',
    color: '#a855f7',
    border: '#9333ea',
    bgActive: 'bg-purple-950/90 border-purple-500 text-purple-300 shadow-md',
    textColor: 'text-purple-400',
    defaultOpd: 'Dinas Penanaman Modal & PTSP',
  },
  {
    id: 'Laporan Pungli & Integritas',
    label: 'Laporan Pungli & Integritas',
    shortLabel: 'Pungli & Integritas',
    color: '#f43f5e',
    border: '#e11d48',
    bgActive: 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-md',
    textColor: 'text-rose-400',
    defaultOpd: 'Satgas Khusus Anti-Risywah & Integritas Aparatur',
  },
  {
    id: 'Administrasi Kependudukan',
    label: 'Administrasi Kependudukan',
    shortLabel: 'Adminduk KTP/KK',
    color: '#14b8a6',
    border: '#0d9488',
    bgActive: 'bg-teal-950/90 border-teal-500 text-teal-300 shadow-md',
    textColor: 'text-teal-400',
    defaultOpd: 'Dinas Kependudukan & Pencatatan Sipil',
  },
];

interface PerformanceDashboardProps {
  metrics?: DepartmentMetric[];
  complaints?: Complaint[];
  onSelectComplaint?: (complaintId: string) => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  metrics = DEPARTMENT_METRICS,
  complaints = INITIAL_COMPLAINTS,
  onSelectComplaint,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleQuickExportPdf = () => {
    setIsDropdownOpen(false);
    try {
      const res = exportPerformanceReportToPdf(metrics);
      showToast(`Laporan PDF resmi (${res.filename}) berhasil diunduh!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickExportCsv = (customPeriod?: string) => {
    setIsDropdownOpen(false);
    try {
      const currentMonthName = new Date().toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      });
      const period = customPeriod || `Laporan Kinerja Bulanan (${currentMonthName})`;
      const res = exportPerformanceReportToCsv(metrics, {
        period,
        agencyName: 'Pemerintah Kota Amanah Sejahtera - Bagian Organisasi & Tata Laksana',
        includeExecutiveSummary: true,
        includeOpdDetails: true,
        includeDailyTrends: true,
        includeAiRecommendations: true,
        includeCryptoSignature: true,
      });
      showToast(`Statistik kinerja departemen bulanan (${res.filename}) berhasil diekspor ke file CSV!`);
    } catch (e) {
      console.error(e);
      showToast('Gagal mengekspor data statistik ke file CSV.');
    }
  };

  const totalHandledAll = metrics.reduce((acc, m) => acc + m.totalHandled, 0);
  const totalResolvedOnTime = metrics.reduce((acc, m) => acc + m.resolvedOnTime, 0);
  const overallOnTimeRate = ((totalResolvedOnTime / totalHandledAll) * 100).toFixed(1);
  const avgHoursOverall = (
    metrics.reduce((acc, m) => acc + m.avgResolutionHours * m.totalHandled, 0) / totalHandledAll
  ).toFixed(1);
  const avgSatisfaction = (
    metrics.reduce((acc, m) => acc + m.satisfactionScore, 0) / metrics.length
  ).toFixed(2);

  // Complaint count per category for badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      SEMUA: complaints.length,
    };
    complaints.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [complaints]);

  // Filtered complaints based on selected category
  const filteredComplaints = useMemo(() => {
    if (selectedCategory === 'SEMUA') return complaints;
    return complaints.filter((c) => c.category === selectedCategory);
  }, [complaints, selectedCategory]);

  // Department distribution calculation for the selected category
  const departmentDistribution = useMemo(() => {
    const counts: Record<string, { count: number; onTimeCount: number; totalHours: number; activeCount: number }> = {};

    filteredComplaints.forEach((c) => {
      const dept = c.assignedDepartment || 'Dinas Terkait';
      if (!counts[dept]) {
        counts[dept] = { count: 0, onTimeCount: 0, totalHours: 0, activeCount: 0 };
      }
      counts[dept].count += 1;
      if (c.elapsedHours <= c.slaTargetHours) {
        counts[dept].onTimeCount += 1;
      }
      counts[dept].totalHours += c.elapsedHours;
      if (c.status !== 'Selesai_Teruji') {
        counts[dept].activeCount += 1;
      }
    });

    const totalFiltered = filteredComplaints.length;
    const list = Object.entries(counts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        percentage: totalFiltered > 0 ? (data.count / totalFiltered) * 100 : 0,
        onTimeRate: data.count > 0 ? (data.onTimeCount / data.count) * 100 : 100,
        avgHours: data.count > 0 ? (data.totalHours / data.count).toFixed(1) : '0.0',
        activeCount: data.activeCount,
      }))
      .sort((a, b) => b.count - a.count);

    const topRecipient = list[0] || null;

    return {
      list,
      topRecipient,
      totalFiltered,
    };
  }, [filteredComplaints]);

  // Dynamic KPI stats based on category filter
  const dynamicStats = useMemo(() => {
    if (selectedCategory === 'SEMUA') {
      return {
        totalDisplay: totalHandledAll.toLocaleString('id-ID'),
        totalCountBadge: `${complaints.length} Berjalan`,
        totalLabel: 'Total Aduan Publik Terpantau',
        onTimeRate: overallOnTimeRate,
        avgHours: avgHoursOverall,
        satisfaction: avgSatisfaction,
        integrity: '99.7%',
        speedSubtext: '38% lebih cepat dari target 24 jam',
        slaSubtext: '2.720 dari 2.740 aduan tuntas tepat waktu',
        scopeLabel: 'Seluruh Kategori & OPD Terintegrasi',
        isFiltered: false,
      };
    }

    const count = filteredComplaints.length;
    const onTime = filteredComplaints.filter((c) => c.elapsedHours <= c.slaTargetHours).length;
    const onTimeRate = count > 0 ? ((onTime / count) * 100).toFixed(1) : '100.0';
    const avgHours = count > 0
      ? (filteredComplaints.reduce((acc, c) => acc + c.elapsedHours, 0) / count).toFixed(1)
      : '0.0';

    // Matched department metric
    const matchedOpt = CATEGORY_FILTER_OPTIONS.find((o) => o.id === selectedCategory);
    const matchedDept = metrics.find(
      (m) =>
        matchedOpt &&
        (m.name.toLowerCase().includes(matchedOpt.defaultOpd.toLowerCase()) ||
          matchedOpt.defaultOpd.toLowerCase().includes(m.name.toLowerCase()))
    );

    const satScore = matchedDept ? matchedDept.satisfactionScore.toFixed(2) : '4.92';
    const integrityScore = matchedDept ? `${matchedDept.integrityIndex}%` : '99.8%';

    return {
      totalDisplay: `${count} Aduan`,
      totalCountBadge: `${count} Tiket Aktif`,
      totalLabel: `Total Aduan ${selectedCategory}`,
      onTimeRate,
      avgHours,
      satisfaction: satScore,
      integrity: integrityScore,
      speedSubtext: `Target SLA rata-rata: ${filteredComplaints[0]?.slaTargetHours || 24} Jam`,
      slaSubtext: `${onTime} dari ${count} aduan tuntas tepat waktu SLA`,
      scopeLabel: `Kategori: ${selectedCategory}`,
      isFiltered: true,
    };
  }, [selectedCategory, filteredComplaints, totalHandledAll, overallOnTimeRate, avgHoursOverall, avgSatisfaction, metrics, complaints.length]);

  // Enriched department ranking table with category-specific metrics
  const enrichedMetrics = useMemo(() => {
    return metrics.map((m) => {
      // Find complaints assigned to this department for the chosen category
      const matchedComplaints = filteredComplaints.filter(
        (c) =>
          c.assignedDepartment.toLowerCase().includes(m.name.toLowerCase()) ||
          m.name.toLowerCase().includes(c.assignedDepartment.toLowerCase())
      );
      const countInFiltered = matchedComplaints.length;
      const isTopRecipient =
        selectedCategory !== 'SEMUA' &&
        departmentDistribution.topRecipient &&
        (departmentDistribution.topRecipient.name.toLowerCase().includes(m.name.toLowerCase()) ||
          m.name.toLowerCase().includes(departmentDistribution.topRecipient.name.toLowerCase()));

      return {
        ...m,
        countInFiltered,
        isTopRecipient,
      };
    }).sort((a, b) => {
      if (selectedCategory !== 'SEMUA') {
        if (b.countInFiltered !== a.countInFiltered) {
          return b.countInFiltered - a.countInFiltered;
        }
      }
      return b.totalHandled - a.totalHandled;
    });
  }, [metrics, filteredComplaints, selectedCategory, departmentDistribution]);

  // Daily trend mock data for SVG chart
  const dailyTrend = [
    { day: 'Sen', hours: 9.2, complaints: 42 },
    { day: 'Sel', hours: 8.4, complaints: 58 },
    { day: 'Rab', hours: 7.6, complaints: 64 },
    { day: 'Kam', hours: 6.9, complaints: 51 },
    { day: 'Jum', hours: 5.8, complaints: 49 },
    { day: 'Sab', hours: 5.4, complaints: 38 },
    { day: 'Min', hours: 4.8, complaints: 29 },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Prinsip Fathanah: Kecerdasan &amp; Efisiensi Birokrasi</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Dasbor Statistik Kinerja Layanan &amp; Efisiensi Birokrasi
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Memantau kecepatan respons, kepatuhan batas SLA, kepuasan masyarakat, dan mengeliminasi proses berbelit-belit sesuai ajaran Rasulullah SAW: <em>“Permudahlah dan jangan mempersulit.”</em>
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Optimasi AI Aktif
            </span>

            {/* Tombol Utama: Ekspor Data CSV Bulanan */}
            <button
              onClick={() => handleQuickExportCsv()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer group active:scale-95"
              id="btn-export-data-csv-main"
              title="Unduh statistik kinerja departemen dalam format file CSV untuk keperluan pelaporan bulanan"
            >
              <FileSpreadsheet className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>Ekspor Data</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-700/90 text-emerald-100 border border-emerald-400/30">
                CSV Bulanan
              </span>
            </button>

            {/* Ekspor Laporan Kinerja Dropdown (PDF & Kustomisasi) */}
            <div className="relative">
              <div className="flex items-center rounded-xl overflow-hidden shadow-sm border border-slate-700 bg-slate-800">
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-200 hover:text-white font-semibold text-xs hover:bg-slate-700 transition-colors cursor-pointer"
                  id="btn-export-performance-main"
                  title="Buka panel kustomisasi laporan resmi (PDF / CSV)"
                >
                  <FileDown className="w-4 h-4 text-emerald-400" />
                  <span>Laporan LAKIP / PDF</span>
                </button>

                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-2 py-2 text-slate-400 hover:text-white hover:bg-slate-700 border-l border-slate-700 transition-colors cursor-pointer"
                  title="Pilihan cepat unduh format lain"
                  id="btn-export-dropdown-toggle"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Export Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Opsi Unduh Laporan
                  </div>
                  <button
                    onClick={() => handleQuickExportCsv()}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-left"
                    id="btn-quick-export-csv"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Ekspor Data CSV (Excel)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Statistik kinerja OPD untuk pelaporan bulanan</div>
                    </div>
                  </button>

                  <button
                    onClick={handleQuickExportPdf}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-left"
                    id="btn-quick-export-pdf"
                  >
                    <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Unduh PDF Resmi (LAKIP)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Format cetak A4 ber-KOP &amp; TTE</div>
                    </div>
                  </button>

                  <div className="border-t border-slate-800 pt-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsExportModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-emerald-950/40 transition-colors cursor-pointer"
                      id="btn-open-custom-export-modal"
                    >
                      <span>Kustomisasi Format &amp; Periode</span>
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Quick Toast Notification */}
        {toastMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/80 text-emerald-200 flex items-center justify-between text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-400 hover:text-white text-[11px] font-semibold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Kontrol Filter Kategori Aduan & Deep Department Insight */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Filter Statistik Kategori Aduan</span>
                  {selectedCategory !== 'SEMUA' && (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full animate-pulse">
                      Filter Aktif: {selectedCategory}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  Filter metrik kecepatan, kepatuhan batas SLA, kepuasan warga, serta analisis departemen (OPD) yang paling sering menerima aduan.
                </p>
              </div>
            </div>

            {selectedCategory !== 'SEMUA' && (
              <button
                onClick={() => setSelectedCategory('SEMUA')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-sm self-start sm:self-auto"
                title="Tampilkan kembali data untuk semua kategori"
                id="btn-reset-category-filter"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reset ke Semua Kategori</span>
              </button>
            )}
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {CATEGORY_FILTER_OPTIONS.map((opt) => {
              const isSelected = selectedCategory === opt.id;
              const count = categoryCounts[opt.id] ?? 0;

              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedCategory(opt.id)}
                  className={`group relative px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? `${opt.bgActive} border-opacity-100 ring-2 ring-emerald-500/30 font-bold`
                      : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                  style={{
                    borderColor: isSelected ? opt.border : undefined,
                  }}
                  id={`filter-cat-${opt.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform group-hover:scale-125"
                    style={{ backgroundColor: opt.color }}
                  />
                  <span>{opt.shortLabel}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
                      isSelected
                        ? 'bg-black/40 text-white border border-white/20'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Deep Insight Panel: Departemen Penerima Aduan Terbanyak untuk Kategori Ini */}
          {selectedCategory !== 'SEMUA' ? (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-indigo-950/40 border border-slate-800/90 shadow-inner">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                      <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Departemen Penerima Aduan Terbanyak
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Kategori Aduan: <strong className="text-white">{selectedCategory}</strong>
                    </span>
                  </div>

                  <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>
                      {departmentDistribution.topRecipient?.name ||
                        CATEGORY_FILTER_OPTIONS.find((o) => o.id === selectedCategory)?.defaultOpd}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Menerima beban tertinggi sebanyak{' '}
                    <strong className="text-emerald-400 font-mono">
                      {departmentDistribution.topRecipient?.count || filteredComplaints.length} dari{' '}
                      {filteredComplaints.length} aduan kategori ini (
                      {departmentDistribution.topRecipient?.percentage.toFixed(1) || '100.0'}%)
                    </strong>
                    . Kecepatan respon rata-rata{' '}
                    <strong className="text-white font-mono">
                      {departmentDistribution.topRecipient?.avgHours || dynamicStats.avgHours} Jam
                    </strong>{' '}
                    dengan tingkat kepatuhan batas waktu SLA{' '}
                    <strong className="text-sky-300 font-mono">
                      {departmentDistribution.topRecipient?.onTimeRate.toFixed(1) || dynamicStats.onTimeRate}%
                    </strong>
                    .
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center min-w-[84px]">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Aduan Masuk</div>
                    <div className="text-sm font-bold font-mono text-emerald-400">
                      {departmentDistribution.topRecipient?.count || filteredComplaints.length} Tiket
                    </div>
                  </div>
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center min-w-[84px]">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Pangsa Beban</div>
                    <div className="text-sm font-bold font-mono text-amber-300">
                      {departmentDistribution.topRecipient?.percentage.toFixed(0) || '100'}%
                    </div>
                  </div>
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center min-w-[84px]">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Skor IKM</div>
                    <div className="text-sm font-bold font-mono text-white">
                      {dynamicStats.satisfaction} <span className="text-[10px] text-slate-400">/ 5.0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Department Distribution Stack Bar */}
              {departmentDistribution.list.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold flex items-center gap-1.5 text-slate-300">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      Peta Distribusi Aduan Kategori Antar-Departemen:
                    </span>
                    <span className="text-slate-400 font-mono">
                      {departmentDistribution.totalFiltered} Total Aduan ({selectedCategory})
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                    {departmentDistribution.list.map((dept, idx) => {
                      const colors = [
                        'bg-emerald-500',
                        'bg-sky-500',
                        'bg-amber-500',
                        'bg-purple-500',
                        'bg-rose-500',
                      ];
                      const color = colors[idx % colors.length];
                      return (
                        <div
                          key={dept.name}
                          style={{ width: `${dept.percentage}%` }}
                          className={`${color} h-full transition-all`}
                          title={`${dept.name}: ${dept.count} aduan (${dept.percentage.toFixed(1)}%)`}
                        />
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400 pt-0.5">
                    {departmentDistribution.list.map((dept, idx) => {
                      const colors = [
                        'bg-emerald-500',
                        'bg-sky-500',
                        'bg-amber-500',
                        'bg-purple-500',
                        'bg-rose-500',
                      ];
                      const color = colors[idx % colors.length];
                      return (
                        <div key={dept.name} className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${color}`} />
                          <span className="text-slate-300 font-medium truncate max-w-[220px]">
                            {dept.name}:
                          </span>
                          <span className="font-mono text-white font-bold">
                            {dept.count} ({dept.percentage.toFixed(0)}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Mode Semua Kategori (Agregat) */
            <div className="mt-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">
                    Mode Agregat: Menampilkan Seluruh Kategori Aduan Publik
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Klik salah satu kategori di atas untuk melihat wawasan mendalam mengenai OPD mana yang paling sering menerima aduan tersebut, kecepatan penanganan, dan tingkat kepatuhan SLA.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-mono font-semibold border border-slate-700">
                  {metrics.length} OPD Terintegrasi
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 text-[11px] font-mono font-bold border border-emerald-800">
                  {totalHandledAll.toLocaleString('id-ID')} Total Penanganan
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4 Core KPI Cards (Tersinkronisasi Kategori Filter) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Rata-rata Waktu Selesai</span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">
              {dynamicStats.avgHours} <span className="text-sm font-normal text-slate-400">Jam</span>
            </p>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 shrink-0" />
              <span>{dynamicStats.speedSubtext}</span>
            </p>
            {selectedCategory !== 'SEMUA' && (
              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {selectedCategory}
              </span>
            )}
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Tingkat Tepat Waktu SLA</span>
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">
              {dynamicStats.onTimeRate}%
            </p>
            <p className="text-[11px] text-sky-400 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 shrink-0" />
              <span>{dynamicStats.slaSubtext}</span>
            </p>
            {selectedCategory !== 'SEMUA' && (
              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {selectedCategory}
              </span>
            )}
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Indeks Kepuasan (IKM)</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">
              {dynamicStats.satisfaction} <span className="text-sm font-normal text-slate-400">/ 5.00</span>
            </p>
            <p className="text-[11px] text-amber-400 mt-1">
              Predikat: Sangat Memuaskan (A+)
            </p>
            {selectedCategory !== 'SEMUA' && (
              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {selectedCategory}
              </span>
            )}
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Kepatuhan Anti-Risywah</span>
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">
              {dynamicStats.integrity}
            </p>
            <p className="text-[11px] text-indigo-400 mt-1">
              Nol toleransi pungli &amp; gratifikasi
            </p>
            {selectedCategory !== 'SEMUA' && (
              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {selectedCategory}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Bar Chart: Comparison of Complaint Categories Over Time (Real-Time Recharts) */}
      <CategoryComparisonBarChart
        complaints={complaints}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* Visual Charts Grid: SVG Trend Chart & Bureaucracy Speed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Trend of Average Resolution Time */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Tren Kecepatan Penyelesaian Layanan (7 Hari Terakhir)
              </h3>
              <p className="text-[11px] text-slate-400">Penurunan waktu tunggu warga per hari</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Efisien -48%
            </span>
          </div>

          {/* SVG Bar / Area Chart */}
          <div className="pt-4">
            <div className="h-44 w-full flex items-end justify-between gap-3 px-2">
              {dailyTrend.map((item) => {
                // Max height benchmark: 12 hours
                const barHeight = Math.max(15, Math.min(100, (item.hours / 12) * 100));
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-emerald-300 transition-colors">
                      {item.hours}j
                    </span>
                    <div className="w-full bg-slate-800 rounded-t-lg h-36 flex items-end p-1">
                      <div
                        style={{ height: `${barHeight}%` }}
                        className="w-full rounded-t bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300 transition-all shadow-sm"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-300">{item.day}</span>
                    <span className="text-[9px] text-slate-500">{item.complaints} aduan</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Batas Maksimal Toleransi SLA: <strong>24.0 Jam</strong></span>
            <span className="text-emerald-400 font-semibold">Capaian Saat Ini: 4.8 - 9.2 Jam</span>
          </div>
        </div>

        {/* Right: AI Bottleneck & Bureaucracy Elimination Box */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Analisis Bottleneck &amp; Efisiensi Birokrasi AI
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300">Penghapusan Syarat Fotokopi KTP</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">TUNTAS</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Data NIK langsung dicocokkan ke database kependudukan on-chain, menghemat waktu warga rata-rata 45 menit per urusan.
                </p>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300">Pemberian NIB Usaha Mikro Otomatis</span>
                  <span className="text-[10px] font-bold text-sky-400 bg-sky-950 px-1.5 py-0.5 rounded">TERAPKAN</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Pemangkasan 3 meja paraf pejabat menjadi tanda tangan digital terverifikasi kriptografi. Izin terbit dalam hitungan menit.
                </p>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">Antrean Obat Pasien Kronis Puskesmas</span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded">REKOMENDASI</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Disarankan sistem pesan antar rutin via kurir syariah untuk memangkas penumpukan lansia di ruang tunggu.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Audit Otomatis Kepatuhan SOP:</span>
            <span className="text-emerald-400 font-bold">100% Sesuai Sunnah Keadilan</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Instansi Terbaik (OPD Berprestasi) Berdasarkan Kecepatan Respons & Skor Audit */}
      <LeaderboardInstansiTerbaik
        metrics={metrics}
      />

      {/* Visual Calendar Component: Pemetaan Tenggat Waktu SLA & Proyeksi Beban Kerja */}
      <SlaWorkloadCalendar
        complaints={filteredComplaints}
        onSelectComplaint={onSelectComplaint}
      />

      {/* Detailed Department Performance Ranking Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Building className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Evaluasi Kinerja &amp; Integritas Amanah per Organisasi Perangkat Daerah (OPD)
            </h3>
            {selectedCategory !== 'SEMUA' && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Kategori: {selectedCategory}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
              {enrichedMetrics.length} Dinas Terpantau
            </span>
            <button
              onClick={() => handleQuickExportCsv()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              title="Unduh statistik kinerja departemen dalam format file CSV untuk pelaporan bulanan"
              id="btn-export-data-csv-table"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
              <span>Ekspor Data (CSV)</span>
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Kustomisasi opsi dan pratinjau laporan resmi"
              id="btn-export-opd-table"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Laporan Lengkap</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Nama OPD / Dinas</th>
                <th className="py-3 px-4">Kategori Tugas</th>
                {selectedCategory !== 'SEMUA' && (
                  <th className="py-3 px-4 text-center text-emerald-400 bg-emerald-950/30">
                    Aduan ({selectedCategory})
                  </th>
                )}
                <th className="py-3 px-4 text-center">Total Beban</th>
                <th className="py-3 px-4 text-center">Tepat Waktu (%)</th>
                <th className="py-3 px-4 text-center">Rata-rata Waktu</th>
                <th className="py-3 px-4 text-center">Kepuasan (IKM)</th>
                <th className="py-3 px-4 text-right">Skor Integritas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {enrichedMetrics.map((m) => {
                const rate = ((m.resolvedOnTime / m.totalHandled) * 100).toFixed(1);
                const isTop = m.isTopRecipient;

                return (
                  <tr
                    key={m.name}
                    className={`transition-colors ${
                      isTop
                        ? 'bg-emerald-950/25 border-l-4 border-l-amber-400 hover:bg-emerald-950/40'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-white">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>{m.name}</span>
                        {isTop && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <Trophy className="w-3 h-3 text-amber-400" />
                            Penerima Terbanyak ({m.countInFiltered} Aduan)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {m.category}
                    </td>
                    {selectedCategory !== 'SEMUA' && (
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-300 bg-emerald-950/30">
                        {m.countInFiltered > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-700/60 text-emerald-200">
                            {m.countInFiltered} Tiket
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                    )}
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-200">
                      {m.totalHandled}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                        {rate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-200">
                      {m.avgResolutionHours} jam
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-amber-300">
                      {m.satisfactionScore} / 5.0
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-bold text-emerald-400">
                        {m.integrityIndex}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ekspor Laporan Kinerja (PDF/CSV) */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        metrics={metrics}
      />
    </div>
  );
};
