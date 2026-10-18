import React, { useState } from 'react';
import { 
  BarChart3, 
  Printer, 
  Download, 
  FileText, 
  Building2, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Layers, 
  Copy, 
  Check, 
  ChevronRight,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  MapPin,
  X,
  Eye,
  ShieldCheck,
  CheckCircle,
  Clock3,
  HelpCircle,
  FileCheck,
  Send,
  ExternalLink,
  UserCheck,
  Trash2,
  Coins,
  Camera,
  Paperclip,
  FileDown
} from 'lucide-react';
import { PotensiPajakEntry, PbbP2Entry, RetribusiDaerahEntry, AppUser, VerificationStatus } from '../types';
import { KABUPATEN_HSU, KECAMATAN_HSU_OPTIONS } from '../constants/wilayahHsu';
import { VerifikasiMapModal } from './VerifikasiMapModal';

interface RealtimeReportsManagerProps {
  potensiList: PotensiPajakEntry[];
  pbbList: PbbP2Entry[];
  retribusiList?: RetribusiDaerahEntry[];
  currentUser: AppUser | null;
  onUpdatePotensiStatus?: (id: string, newStatus: VerificationStatus, note?: string) => void;
  onUpdatePbbStatus?: (id: string, newStatus: VerificationStatus, note?: string) => void;
  onUpdateRetribusiStatus?: (id: string, newStatus: VerificationStatus, note?: string) => void;
  onDeletePotensi?: (id: string) => void;
  onDeletePbb?: (id: string) => void;
  onDeleteRetribusi?: (id: string) => void;
  onOpenSpreadsheetModal?: () => void;
  onNavigateToMap?: (location?: { lat: number; lng: number; title: string; type: string }) => void;
}

export const RealtimeReportsManager: React.FC<RealtimeReportsManagerProps> = ({
  potensiList,
  pbbList,
  retribusiList = [],
  currentUser,
  onUpdatePotensiStatus,
  onUpdatePbbStatus,
  onUpdateRetribusiStatus,
  onDeletePotensi,
  onDeletePbb,
  onDeleteRetribusi,
  onOpenSpreadsheetModal,
  onNavigateToMap,
}) => {
  // Main view mode: 'hasil_inputan' (Aksi Lihat Hasil Inputan & Status) or 'rekap_cetak' (Rekapitulasi & Cetak)
  const [activeViewMode, setActiveViewMode] = useState<'hasil_inputan' | 'rekap_cetak'>('hasil_inputan');

  // Filters for Hasil Inputan
  const [statusFilter, setStatusFilter] = useState<'all' | 'Menunggu Verifikasi' | 'Verifikasi' | 'Setuju'>('all');
  const [inputTypeFilter, setInputTypeFilter] = useState<'all' | 'potensi' | 'pbb' | 'retribusi'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected item for detail modal
  const [selectedItem, setSelectedItem] = useState<{
    type: 'potensi' | 'pbb' | 'retribusi';
    potensi?: PotensiPajakEntry;
    pbb?: PbbP2Entry;
    retribusi?: RetribusiDaerahEntry;
  } | null>(null);

  // Deletion state
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'potensi' | 'pbb' | 'retribusi';
    id: string;
    label: string;
  } | null>(null);

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'potensi' && onDeletePotensi) {
      onDeletePotensi(itemToDelete.id);
    } else if (itemToDelete.type === 'pbb' && onDeletePbb) {
      onDeletePbb(itemToDelete.id);
    } else if (itemToDelete.type === 'retribusi' && onDeleteRetribusi) {
      onDeleteRetribusi(itemToDelete.id);
    }
    if (selectedItem && (
      (selectedItem.type === 'potensi' && selectedItem.potensi?.id === itemToDelete.id) ||
      (selectedItem.type === 'pbb' && selectedItem.pbb?.id === itemToDelete.id) ||
      (selectedItem.type === 'retribusi' && selectedItem.retribusi?.id === itemToDelete.id)
    )) {
      setSelectedItem(null);
    }
    setItemToDelete(null);
  };

  const [verifikasiNoteInput, setVerifikasiNoteInput] = useState('');

  // Filters for Rekap Cetak Laporan
  const [selectedReportType, setSelectedReportType] = useState<'gabungan' | 'potensi' | 'retribusi' | 'pbb'>('gabungan');
  const [filterKecamatan, setFilterKecamatan] = useState<string>('all');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // File Preview Modal State (Lihat File Hasil Inputan)
  const [previewFileModal, setPreviewFileModal] = useState<{
    title: string;
    fileName: string;
    fileUrl: string;
    fileType: 'image' | 'pdf' | 'doc' | 'other';
    fileSize?: string;
    sourceInfo?: string;
  } | null>(null);

  // Verifikasi Map Modal State (Aksi Verifikasi Lihat Map Geospasial)
  const [verifikasiMapModal, setVerifikasiMapModal] = useState<{
    itemType: 'potensi' | 'pbb' | 'retribusi';
    id: string;
    name: string;
    nomor: string;
    kecamatan: string;
    kelurahanDesa: string;
    alamat: string;
    latitude: number;
    longitude: number;
    statusVerifikasi: VerificationStatus;
    nilaiFiskalLabel: string;
    nilaiFiskalRp: string;
    petugas?: string;
    fotoUrl?: string;
    fotoName?: string;
  } | null>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Helper to normalize status for filtering and badges
  const normalizeStatus = (status?: string): 'Menunggu Verifikasi' | 'Verifikasi' | 'Setuju' => {
    if (!status) return 'Menunggu Verifikasi';
    if (status === 'Setuju') return 'Setuju';
    if (status === 'Verifikasi' || status === 'Terverifikasi') return 'Verifikasi';
    return 'Menunggu Verifikasi';
  };

  // Status counts across all inputs
  const totalMenungguCount = 
    potensiList.filter(p => normalizeStatus(p.statusVerifikasi) === 'Menunggu Verifikasi').length +
    pbbList.filter(p => normalizeStatus(p.statusVerifikasi) === 'Menunggu Verifikasi').length +
    retribusiList.filter(r => normalizeStatus(r.statusVerifikasi) === 'Menunggu Verifikasi').length;

  const totalVerifikasiCount = 
    potensiList.filter(p => normalizeStatus(p.statusVerifikasi) === 'Verifikasi').length +
    pbbList.filter(p => normalizeStatus(p.statusVerifikasi) === 'Verifikasi').length +
    retribusiList.filter(r => normalizeStatus(r.statusVerifikasi) === 'Verifikasi').length;

  const totalSetujuCount = 
    potensiList.filter(p => normalizeStatus(p.statusVerifikasi) === 'Setuju').length +
    pbbList.filter(p => normalizeStatus(p.statusVerifikasi) === 'Setuju').length +
    retribusiList.filter(r => normalizeStatus(r.statusVerifikasi) === 'Setuju').length;

  // Filtered list for "Hasil Inputan"
  const filteredInputList = [
    ...(inputTypeFilter === 'all' || inputTypeFilter === 'potensi' 
      ? potensiList.map(p => ({ type: 'potensi' as const, data: p })) 
      : []),
    ...(inputTypeFilter === 'all' || inputTypeFilter === 'pbb' 
      ? pbbList.map(p => ({ type: 'pbb' as const, data: p })) 
      : []),
    ...(inputTypeFilter === 'all' || inputTypeFilter === 'retribusi' 
      ? retribusiList.map(r => ({ type: 'retribusi' as const, data: r })) 
      : []),
  ].filter(item => {
    const status = normalizeStatus(item.data.statusVerifikasi);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    if (!matchesStatus) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    if (item.type === 'potensi') {
      const p = item.data as PotensiPajakEntry;
      return (
        p.namaWajibPajak.toLowerCase().includes(q) ||
        p.namaUsaha.toLowerCase().includes(q) ||
        p.nomorFormulir.toLowerCase().includes(q) ||
        p.kecamatan.toLowerCase().includes(q) ||
        p.jenisPajak.toLowerCase().includes(q) ||
        p.petugasPendata.toLowerCase().includes(q)
      );
    } else if (item.type === 'pbb') {
      const p = item.data as PbbP2Entry;
      return (
        p.namaWajibPajak.toLowerCase().includes(q) ||
        p.nop.toLowerCase().includes(q) ||
        p.kecamatan.toLowerCase().includes(q) ||
        p.petugasValidasi.toLowerCase().includes(q)
      );
    } else {
      const r = item.data as RetribusiDaerahEntry;
      return (
        r.subObjekRetribusi.toLowerCase().includes(q) ||
        r.subRekening.toLowerCase().includes(q) ||
        r.golonganRetribusi.toLowerCase().includes(q) ||
        r.kecamatan.toLowerCase().includes(q) ||
        r.nomorRegister.toLowerCase().includes(q) ||
        (r.namaPengelola && r.namaPengelola.toLowerCase().includes(q)) ||
        r.petugasPendata.toLowerCase().includes(q)
      );
    }
  });

  // Action: Change Status for Potensi
  const handleChangePotensiStatus = (id: string, newStatus: VerificationStatus, note?: string) => {
    if (onUpdatePotensiStatus) {
      onUpdatePotensiStatus(id, newStatus, note);
    }
    if (selectedItem?.potensi?.id === id) {
      setSelectedItem(prev => prev ? {
        ...prev,
        potensi: {
          ...prev.potensi!,
          statusVerifikasi: newStatus,
          verifiedBy: currentUser?.name || 'Aparatur BP2RD',
          verifiedAt: new Date().toISOString(),
          catatanVerifikasi: note || (newStatus === 'Setuju' ? 'Hasil inputan telah disetujui sah.' : newStatus === 'Verifikasi' ? 'Sedang dalam verifikasi data.' : 'Menunggu verifikasi.'),
        }
      } : null);
    }
  };

  // Action: Change Status for PBB
  const handleChangePbbStatus = (id: string, newStatus: VerificationStatus, note?: string) => {
    if (onUpdatePbbStatus) {
      onUpdatePbbStatus(id, newStatus, note);
    }
    if (selectedItem?.pbb?.id === id) {
      setSelectedItem(prev => prev ? {
        ...prev,
        pbb: {
          ...prev.pbb!,
          statusVerifikasi: newStatus,
          verifiedBy: currentUser?.name || 'Aparatur BP2RD',
          verifiedAt: new Date().toISOString(),
          catatanVerifikasi: note || (newStatus === 'Setuju' ? 'Ketetapan PBB telah disetujui.' : newStatus === 'Verifikasi' ? 'Sedang dalam verifikasi.' : 'Menunggu verifikasi.'),
        }
      } : null);
    }
  };

  // Action: Change Status for Retribusi
  const handleChangeRetribusiStatus = (id: string, newStatus: VerificationStatus, note?: string) => {
    if (onUpdateRetribusiStatus) {
      onUpdateRetribusiStatus(id, newStatus, note);
    }
    if (selectedItem?.retribusi?.id === id) {
      setSelectedItem(prev => prev ? {
        ...prev,
        retribusi: {
          ...prev.retribusi!,
          statusVerifikasi: newStatus,
          verifiedBy: currentUser?.name || 'Aparatur BP2RD',
          verifiedAt: new Date().toISOString(),
          catatanVerifikasi: note || (newStatus === 'Setuju' ? 'Potensi retribusi daerah telah disetujui sah.' : newStatus === 'Verifikasi' ? 'Sedang dalam verifikasi data.' : 'Menunggu verifikasi.'),
        }
      } : null);
    }
  };

  // Open detail modal
  const handleOpenDetailModal = (item: { type: 'potensi' | 'pbb' | 'retribusi'; data: PotensiPajakEntry | PbbP2Entry | RetribusiDaerahEntry }) => {
    if (item.type === 'potensi') {
      const pot = item.data as PotensiPajakEntry;
      setSelectedItem({ type: 'potensi', potensi: pot });
      setVerifikasiNoteInput(pot.catatanVerifikasi || '');
    } else if (item.type === 'pbb') {
      const pbb = item.data as PbbP2Entry;
      setSelectedItem({ type: 'pbb', pbb });
      setVerifikasiNoteInput(pbb.catatanVerifikasi || '');
    } else {
      const ret = item.data as RetribusiDaerahEntry;
      setSelectedItem({ type: 'retribusi', retribusi: ret });
      setVerifikasiNoteInput(ret.catatanVerifikasi || '');
    }
  };

  // Filtered datasets for Rekap Cetak Laporan
  const filteredPotensi = potensiList.filter((p) => {
    return filterKecamatan === 'all' || p.kecamatan === filterKecamatan;
  });

  const filteredPbb = pbbList.filter((p) => {
    return filterKecamatan === 'all' || p.kecamatan === filterKecamatan;
  });

  const filteredRetribusi = (retribusiList || []).filter((r) => {
    return filterKecamatan === 'all' || r.kecamatan === filterKecamatan;
  });

  // Aggregated calculations for Rekap Cetak
  const totalPotensiRupiah = filteredPotensi.reduce((acc, curr) => acc + (curr.potensiRupiahTahunan || 0), 0);
  const totalRetribusiRupiah = filteredRetribusi.reduce((acc, curr) => acc + (curr.potensiPertahun || 0), 0);
  const totalPbbTerhutang = filteredPbb.reduce((acc, curr) => acc + (curr.pbbTerhutang || 0), 0);
  const totalPbbLunas = filteredPbb
    .filter((p) => p.statusPembayaran === 'LUNAS')
    .reduce((acc, curr) => acc + (curr.pbbTerhutang || 0), 0);
  const totalPbbPiutang = totalPbbTerhutang - totalPbbLunas;

  // Print execution: safely trigger print
  const handleExecutePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Direct print fallback:', err);
      handleDownloadHtmlReport();
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (selectedReportType === 'potensi' || selectedReportType === 'gabungan') {
      csvContent += "DATA POTENSI PAJAK DAERAH BP2RD HSU\n";
      csvContent += "No Formulir,Wajib Pajak,NPWPD,Jenis Pajak,Kecamatan,Kelurahan / Desa,Alamat Lengkap,Potensi Bulanan,Potensi Tahunan,Status Verifikasi,Petugas\n";
      filteredPotensi.forEach((p) => {
        csvContent += `"${p.nomorFormulir}","${p.namaWajibPajak}","${p.npwpd}","${p.jenisPajak}","${p.kecamatan}","${p.kelurahanDesa || '-'}","${(p.alamatLengkap || '-').replace(/"/g, '""')}",${p.potensiRupiahBulanan},${p.potensiRupiahTahunan},"${normalizeStatus(p.statusVerifikasi)}","${p.petugasPendata}"\n`;
      });
      csvContent += "\n";
    }

    if (selectedReportType === 'retribusi' || selectedReportType === 'gabungan') {
      csvContent += "DATA HASIL INPUT POTENSI RETRIBUSI DAERAH BP2RD HSU\n";
      csvContent += "No Register,Tanggal,Golongan Retribusi,Sub Objek Retribusi,Sub Rekening,Pengelola,Kecamatan,Kelurahan / Desa,Alamat Lengkap,Tarif Satuan,Jumlah Satuan,Potensi Bulanan,Potensi Tahunan,Status Verifikasi,Petugas\n";
      filteredRetribusi.forEach((r) => {
        csvContent += `"${r.nomorRegister}","${r.tanggalPendataan}","${r.golonganRetribusi}","${r.subObjekRetribusi}","${r.subRekening || '-'}","${r.namaPengelola || '-'}","${r.kecamatan}","${r.kelurahanDesa || '-'}","${(r.alamatLengkap || '-').replace(/"/g, '""')}",${r.tarifSatuan},${r.jumlahSatuan},${r.potensiPerbulan},${r.potensiPertahun},"${normalizeStatus(r.statusVerifikasi)}","${r.petugasPendata}"\n`;
      });
      csvContent += "\n";
    }

    if (selectedReportType === 'pbb' || selectedReportType === 'gabungan') {
      csvContent += "DATA KETETAPAN DAN PEMBAYARAN PBB-P2 HSU\n";
      csvContent += "NOP,Tahun,Wajib Pajak,Kecamatan,Kelurahan / Desa,Alamat Objek,Luas Bumi (m2),Luas Bangunan (m2),PBB Terhutang,Status Pembayaran,Status Verifikasi,Tanggal Bayar\n";
      filteredPbb.forEach((p) => {
        csvContent += `"${p.nop}",${p.tahunPajak},"${p.namaWajibPajak}","${p.kecamatan}","${p.kelurahanDesa || '-'}","${(p.alamatObjek || '-').replace(/"/g, '""')}",${p.luasBumiM2},${p.luasBangunanM2},${p.pbbTerhutang},"${p.statusPembayaran}","${normalizeStatus(p.statusVerifikasi)}","${p.tanggalBayar || '-'}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Laporan_BP2RD_HSU_${selectedReportType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Standalone HTML Download
  const handleDownloadHtmlReport = () => {
    const reportTitle = selectedReportType === 'gabungan'
      ? 'REKAPITULASI GABUNGAN POTENSI PAJAK DAERAH, RETRIBUSI DAERAH & PBB-P2'
      : selectedReportType === 'potensi'
      ? 'LAPORAN HASIL PENDATAAN POTENSI PAJAK DAERAH'
      : selectedReportType === 'retribusi'
      ? 'LAPORAN REKAPITULASI HASIL INPUT RETRIBUSI DAERAH'
      : 'LAPORAN REALISASI & PIUTANG PBB-P2';

    const officerName = currentUser?.name || 'Rija, S.STP, M.IP';
    const officerNip = currentUser?.nip || '19880512 201001 1 003';
    const officerJabatan = currentUser?.jabatan || 'Kepala Bidang Pendataan & Penilaian BP2RD HSU';

    const htmlDoc = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${reportTitle} - BP2RD HSU</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    body { font-family: 'Times New Roman', Times, serif; color: #000; background: #fff; margin: 0; padding: 20px; line-height: 1.3; }
    .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
    .kop h3 { margin: 0; font-size: 13pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
    .kop h2 { margin: 3px 0; font-size: 15pt; font-weight: bold; text-transform: uppercase; }
    .kop p { margin: 2px 0; font-size: 9.5pt; font-family: Arial, sans-serif; }
    .judul-laporan { text-align: center; margin: 15px 0 20px 0; }
    .judul-laporan h4 { margin: 0; font-size: 12pt; text-transform: uppercase; text-decoration: underline; font-weight: bold; }
    .judul-laporan p { margin: 4px 0 0 0; font-size: 9.5pt; font-family: Arial, sans-serif; }
    .summary-box { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; margin-bottom: 20px; border: 1px solid #000; padding: 10px; font-size: 9.5pt; font-family: Arial, sans-serif; background: #fbfbfb; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 8.5pt; font-family: Arial, sans-serif; }
    th, td { border: 1px solid #000; padding: 5px 6px; text-align: left; }
    th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .ttd-container { display: flex; justify-content: space-between; margin-top: 30px; page-break-inside: avoid; font-family: Arial, sans-serif; }
    .ttd-box { width: 45%; text-align: center; font-size: 9.5pt; }
    .ttd-space { height: 60px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; padding: 12px; background: #e0f2fe; border: 1px solid #0284c7; text-align: center; font-family: Arial, sans-serif;">
    <strong>Dokumen Siap Cetak BP2RD Kab. Hulu Sungai Utara</strong> &bull; 
    <button onclick="window.print()" style="padding: 6px 14px; font-weight: bold; background: #0284c7; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">Cetak Sekarang (Print / Save PDF)</button>
  </div>

  <div class="kop">
    <h3>Pemerintah Kabupaten Hulu Sungai Utara</h3>
    <h2>Badan Pengelola Pajak dan Retribusi Daerah</h2>
    <p>Jl. Basuki Rahmat No. 01, Telp. (0511) 4781234, Amuntai - Kalimantan Selatan 71414</p>
    <p>Email: bp2rd@hulusungaiutarakab.go.id &bull; Laman Resmi: bp2rd.hulusungaiutarakab.go.id</p>
  </div>

  <div class="judul-laporan">
    <h4>${reportTitle}</h4>
    <p>Wilayah: ${filterKecamatan === 'all' ? 'Seluruh Wilayah Kabupaten Hulu Sungai Utara (10 Kecamatan)' : filterKecamatan} | Tanggal Cetak: ${currentDateFormatted}</p>
  </div>

  <div class="summary-box">
    ${(selectedReportType === 'gabungan' || selectedReportType === 'potensi') ? `<div><strong>Potensi Pajak Daerah:</strong> ${formatRupiah(totalPotensiRupiah)} (${filteredPotensi.length} Objek)</div>` : ''}
    ${(selectedReportType === 'gabungan' || selectedReportType === 'retribusi') ? `<div><strong>Potensi Retribusi Daerah:</strong> ${formatRupiah(totalRetribusiRupiah)} (${filteredRetribusi.length} Objek)</div>` : ''}
    ${(selectedReportType === 'gabungan' || selectedReportType === 'pbb') ? `
      <div><strong>Ketetapan PBB-P2:</strong> ${formatRupiah(totalPbbTerhutang)}</div>
      <div><strong>Realisasi Lunas PBB-P2:</strong> ${formatRupiah(totalPbbLunas)}</div>
      <div><strong>Sisa Piutang PBB-P2:</strong> ${formatRupiah(totalPbbPiutang)}</div>
    ` : ''}
  </div>

  ${(selectedReportType === 'gabungan' || selectedReportType === 'potensi') ? `
    <h5 style="margin: 10px 0 6px 0; font-size: 10pt; text-transform: uppercase; font-family: Arial, sans-serif;">
      ${selectedReportType === 'gabungan' ? 'I. ' : ''}Rincian Objek Potensi Pajak Daerah (${filteredPotensi.length} Data)
    </h5>
    <table>
      <thead>
        <tr>
          <th width="3%">No</th>
          <th width="12%">Nomor Form</th>
          <th width="18%">Nama Wajib Pajak / Usaha</th>
          <th width="13%">Jenis Pajak</th>
          <th width="12%">Kecamatan / Desa</th>
          <th width="18%">Alamat Lengkap</th>
          <th width="12%" class="text-right">Potensi Tahunan</th>
          <th width="12%" class="text-center">Status Verifikasi</th>
        </tr>
      </thead>
      <tbody>
        ${filteredPotensi.map((p, idx) => `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td style="font-family: monospace;">${p.nomorFormulir}</td>
            <td><strong>${p.namaWajibPajak}</strong><br><small>${p.namaUsaha}</small></td>
            <td>${p.jenisPajak}</td>
            <td>${p.kecamatan}<br><small style="color: #047857; font-weight: bold;">${p.kelurahanDesa || '-'}</small></td>
            <td style="font-size: 8.5pt;">${p.alamatLengkap || '-'}</td>
            <td class="text-right" style="font-weight: bold;">${formatRupiah(p.potensiRupiahTahunan)}</td>
            <td class="text-center"><strong>${normalizeStatus(p.statusVerifikasi)}</strong></td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr style="background: #f2f2f2; font-weight: bold;">
          <td colspan="6" class="text-right">TOTAL POTENSI PAJAK DAERAH:</td>
          <td class="text-right">${formatRupiah(totalPotensiRupiah)}</td>
          <td class="text-center">${filteredPotensi.length} Objek</td>
        </tr>
      </tfoot>
    </table>
  ` : ''}

  ${(selectedReportType === 'gabungan' || selectedReportType === 'retribusi') ? `
    <h5 style="margin: 15px 0 6px 0; font-size: 10pt; text-transform: uppercase; font-family: Arial, sans-serif;">
      ${selectedReportType === 'gabungan' ? 'II. ' : ''}Rincian Hasil Input Potensi Retribusi Daerah (${filteredRetribusi.length} Data)
    </h5>
    <table>
      <thead>
        <tr>
          <th width="3%">No</th>
          <th width="12%">No. Register</th>
          <th width="18%">Sub Objek & Pengelola</th>
          <th width="13%">Golongan Retribusi</th>
          <th width="12%">Kecamatan / Desa</th>
          <th width="18%">Alamat Lengkap</th>
          <th width="12%" class="text-right">Tarif & Volume</th>
          <th width="12%" class="text-right">Potensi Tahunan</th>
        </tr>
      </thead>
      <tbody>
        ${filteredRetribusi.map((r, idx) => `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td style="font-family: monospace;">${r.nomorRegister}</td>
            <td><strong>${r.subObjekRetribusi}</strong><br><small>${r.namaPengelola || '-'}</small></td>
            <td>${r.golonganRetribusi}</td>
            <td>${r.kecamatan}<br><small style="color: #b45309; font-weight: bold;">${r.kelurahanDesa || '-'}</small></td>
            <td style="font-size: 8.5pt;">${r.alamatLengkap || '-'}</td>
            <td class="text-right">${formatRupiah(r.tarifSatuan)} / ${r.satuanTarif} (${r.jumlahSatuan})</td>
            <td class="text-right" style="font-weight: bold;">${formatRupiah(r.potensiPertahun)}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr style="background: #f2f2f2; font-weight: bold;">
          <td colspan="7" class="text-right">TOTAL POTENSI RETRIBUSI DAERAH:</td>
          <td class="text-right">${formatRupiah(totalRetribusiRupiah)}</td>
        </tr>
      </tfoot>
    </table>
  ` : ''}

  ${(selectedReportType === 'gabungan' || selectedReportType === 'pbb') ? `
    <h5 style="margin: 15px 0 6px 0; font-size: 10pt; text-transform: uppercase; font-family: Arial, sans-serif;">
      ${selectedReportType === 'gabungan' ? 'III. ' : ''}Rincian Ketetapan & Pembayaran PBB-P2 (${filteredPbb.length} Data)
    </h5>
    <table>
      <thead>
        <tr>
          <th width="3%">No</th>
          <th width="14%">NOP (18 Digit)</th>
          <th width="16%">Nama Wajib Pajak</th>
          <th width="13%">Kecamatan / Desa</th>
          <th width="18%">Alamat Objek Pajak</th>
          <th width="12%" class="text-right">Ketetapan PBB</th>
          <th width="12%" class="text-center">Status Pembayaran</th>
          <th width="12%" class="text-center">Status Verifikasi</th>
        </tr>
      </thead>
      <tbody>
        ${filteredPbb.map((p, idx) => `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td style="font-family: monospace;">${p.nop}</td>
            <td>${p.namaWajibPajak}</td>
            <td>${p.kecamatan}<br><small style="color: #1d4ed8; font-weight: bold;">${p.kelurahanDesa || '-'}</small></td>
            <td style="font-size: 8.5pt;">${p.alamatObjek || '-'}</td>
            <td class="text-right" style="font-weight: bold;">${formatRupiah(p.pbbTerhutang)}</td>
            <td class="text-center"><strong>${p.statusPembayaran}</strong></td>
            <td class="text-center">${normalizeStatus(p.statusVerifikasi)}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr style="background: #f2f2f2; font-weight: bold;">
          <td colspan="4" class="text-right">TOTAL KETETAPAN PBB-P2:</td>
          <td class="text-right">${formatRupiah(totalPbbTerhutang)}</td>
          <td colspan="2" class="text-center">Lunas: ${formatRupiah(totalPbbLunas)} | Piutang: ${formatRupiah(totalPbbPiutang)}</td>
        </tr>
      </tfoot>
    </table>
  ` : ''}

  <div class="ttd-container">
    <div class="ttd-box">
      <p>Mengetahui,</p>
      <p><strong>${officerJabatan}</strong></p>
      <div class="ttd-space"></div>
      <p style="text-decoration: underline; font-weight: bold; margin: 0;">${officerName}</p>
      <p style="margin: 2px 0 0 0;">NIP. ${officerNip}</p>
    </div>
    <div class="ttd-box">
      <p>Amuntai, ${currentDateFormatted}</p>
      <p><strong>Petugas Verifikator / Surveyor Lapangan</strong></p>
      <div class="ttd-space"></div>
      <p style="text-decoration: underline; font-weight: bold; margin: 0;">( .................................................... )</p>
      <p style="margin: 2px 0 0 0;">Petugas Tim Pendataan Pajak & Retribusi HSU</p>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Resmi_BP2RD_HSU_${selectedReportType}_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy quick summary to clipboard
  const handleCopySummary = () => {
    const text = `=== REKAP LAPORAN FISKAL BP2RD KAB. HULU SUNGAI UTARA ===
Wilayah Cakupan: ${filterKecamatan === 'all' ? 'Seluruh Kabupaten HSU (10 Kecamatan)' : filterKecamatan}
Tanggal Rekap  : ${currentDateFormatted}

STATUS HASIL INPUTAN:
- Menunggu Verifikasi : ${totalMenungguCount} Berkas
- Verifikasi / Proses : ${totalVerifikasiCount} Berkas
- Disetujui (Setuju)  : ${totalSetujuCount} Berkas

RINGKASAN FISKAL:
- Potensi Pajak Daerah : ${filteredPotensi.length} Usaha (${formatRupiah(totalPotensiRupiah)})
- Potensi Retribusi    : ${filteredRetribusi.length} Objek (${formatRupiah(totalRetribusiRupiah)})
- Total Ketetapan PBB  : ${formatRupiah(totalPbbTerhutang)}
- Realisasi Lunas PBB  : ${formatRupiah(totalPbbLunas)}
- Sisa Piutang PBB     : ${formatRupiah(totalPbbPiutang)}

Diterbitkan oleh: Sistem Informasi SIPOTENSI BP2RD Kabupaten Hulu Sungai Utara`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Manajemen Laporan &amp; Verifikasi Hasil Inputan
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Akses Admin &amp; User
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pusat monitoring, telaah verifikasi status hasil inputan potensi pajak dan cetak rekapitulasi fiskal Kabupaten Hulu Sungai Utara.
          </p>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-lg">
          <button
            onClick={() => setActiveViewMode('hasil_inputan')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeViewMode === 'hasil_inputan'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Lihat Hasil Inputan</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/60 text-emerald-200">
              {potensiList.length + pbbList.length + retribusiList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveViewMode('rekap_cetak')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeViewMode === 'rekap_cetak'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Rekap &amp; Cetak Laporan</span>
          </button>

          {onOpenSpreadsheetModal && (
            <button
              onClick={onOpenSpreadsheetModal}
              title="Hubungkan atau Sinkronkan Database ke Google Spreadsheet"
              className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950/40 cursor-pointer active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Koneksi Spreadsheet</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: HASIL INPUTAN DENGAN STATUS MENUNGGU VERIFIKASI, VERIFIKASI, DAN SETUJU */}
      {activeViewMode === 'hasil_inputan' && (
        <div className="mt-6 space-y-6">

          {/* Status Counter Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Status: Menunggu Verifikasi */}
            <div 
              onClick={() => setStatusFilter(statusFilter === 'Menunggu Verifikasi' ? 'all' : 'Menunggu Verifikasi')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-lg ${
                statusFilter === 'Menunggu Verifikasi'
                  ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/50'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Menunggu Verifikasi
                </span>
                <p className="mt-1.5 text-3xl font-black text-white">
                  {totalMenungguCount}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Inputan baru perlu ditelaah &amp; divalidasi
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Clock3 className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            {/* Status: Verifikasi */}
            <div 
              onClick={() => setStatusFilter(statusFilter === 'Verifikasi' ? 'all' : 'Verifikasi')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-lg ${
                statusFilter === 'Verifikasi'
                  ? 'bg-blue-500/15 border-blue-500 ring-2 ring-blue-500/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-blue-500/50'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                  Sedang Diverifikasi
                </span>
                <p className="mt-1.5 text-3xl font-black text-white">
                  {totalVerifikasiCount}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Dalam proses verifikasi lapangan &amp; berkas
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
            </div>

            {/* Status: Setuju */}
            <div 
              onClick={() => setStatusFilter(statusFilter === 'Setuju' ? 'all' : 'Setuju')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-lg ${
                statusFilter === 'Setuju'
                  ? 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/50'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Disetujui (Setuju)
                </span>
                <p className="mt-1.5 text-3xl font-black text-white">
                  {totalSetujuCount}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Sah dan masuk penetapan ketetapan fiskal
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* Filter Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama wajib pajak, usaha, formulir/NOP, kecamatan, petugas..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-slate-200 text-slate-900'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Semua ({potensiList.length + pbbList.length + retribusiList.length})
              </button>
              <button
                onClick={() => setStatusFilter('Menunggu Verifikasi')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  statusFilter === 'Menunggu Verifikasi'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-950 text-amber-400 hover:bg-slate-800'
                }`}
              >
                <span>Menunggu Verifikasi</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900/40">
                  {totalMenungguCount}
                </span>
              </button>
              <button
                onClick={() => setStatusFilter('Verifikasi')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  statusFilter === 'Verifikasi'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-950 text-blue-400 hover:bg-slate-800'
                }`}
              >
                <span>Verifikasi</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900/40">
                  {totalVerifikasiCount}
                </span>
              </button>
              <button
                onClick={() => setStatusFilter('Setuju')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  statusFilter === 'Setuju'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-950 text-emerald-400 hover:bg-slate-800'
                }`}
              >
                <span>Setuju</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900/40">
                  {totalSetujuCount}
                </span>
              </button>
            </div>

            {/* Input Type Select */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setInputTypeFilter('all')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                  inputTypeFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua Tipe
              </button>
              <button
                onClick={() => setInputTypeFilter('potensi')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                  inputTypeFilter === 'potensi' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Potensi Pajak
              </button>
              <button
                onClick={() => setInputTypeFilter('pbb')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                  inputTypeFilter === 'pbb' ? 'bg-blue-500/20 text-blue-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                PBB-P2
              </button>
              <button
                onClick={() => setInputTypeFilter('retribusi')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                  inputTypeFilter === 'retribusi' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Coins className="w-3 h-3 text-amber-400" />
                <span>Retribusi Daerah</span>
              </button>
            </div>

          </div>

          {/* Table of Results */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">
                  Daftar Hasil Inputan Lapangan ({filteredInputList.length})
                </h3>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (inputTypeFilter === 'retribusi') {
                      setSelectedReportType('retribusi');
                    } else if (inputTypeFilter === 'potensi') {
                      setSelectedReportType('potensi');
                    } else if (inputTypeFilter === 'pbb') {
                      setSelectedReportType('pbb');
                    } else {
                      setSelectedReportType('gabungan');
                    }
                    setIsPrintModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all cursor-pointer active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>Cetak Rekap Input {inputTypeFilter === 'retribusi' ? 'Retribusi' : inputTypeFilter === 'potensi' ? 'Pajak' : inputTypeFilter === 'pbb' ? 'PBB' : 'Semua'}</span>
                </button>
                <span className="text-xs text-slate-400 hidden md:inline">
                  Pilih aksi status pada masing-masing data untuk memvalidasi
                </span>
              </div>
            </div>

            {filteredInputList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Tidak ada hasil inputan yang sesuai dengan filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">No. Form / NOP</th>
                      <th className="py-3 px-4">Wajib Pajak &amp; Objek</th>
                      <th className="py-3 px-4 text-emerald-400">Kelurahan / Desa</th>
                      <th className="py-3 px-4">Alamat Lengkap</th>
                      <th className="py-3 px-4">Kecamatan</th>
                      <th className="py-3 px-4 text-right">Nilai Fiskal</th>
                      <th className="py-3 px-4 text-center">Status Verifikasi</th>
                      <th className="py-3 px-4">Petugas / Tanggal</th>
                      <th className="py-3 px-4 text-center">Aksi Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredInputList.map((item, idx) => {
                      const isPotensi = item.type === 'potensi';
                      const isPbb = item.type === 'pbb';
                      const isRetribusi = item.type === 'retribusi';
                      const pot = isPotensi ? (item.data as PotensiPajakEntry) : null;
                      const pbb = isPbb ? (item.data as PbbP2Entry) : null;
                      const ret = isRetribusi ? (item.data as RetribusiDaerahEntry) : null;
                      const status = normalizeStatus(item.data.statusVerifikasi);

                      const kelurahanDesaVal = isPotensi ? (pot?.kelurahanDesa || '-') : isRetribusi ? (ret?.kelurahanDesa || '-') : (pbb?.kelurahanDesa || '-');
                      const alamatVal = isPotensi ? (pot?.alamatLengkap || '-') : isRetribusi ? (ret?.alamatLengkap || '-') : (pbb?.alamatObjek || '-');
                      const latVal = isPotensi ? pot?.latitude : isRetribusi ? ret?.latitude : pbb?.latitude;
                      const lngVal = isPotensi ? pot?.longitude : isRetribusi ? ret?.longitude : pbb?.longitude;
                      const hasGps = Boolean(latVal && lngVal && latVal !== 0 && lngVal !== 0);

                      return (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          
                          {/* Nomor Formulir / NOP / Register */}
                          <td className="py-3 px-4 font-mono font-semibold text-slate-300">
                            {isPotensi ? (
                              pot?.nomorFormulir
                            ) : isRetribusi ? (
                              <span className="text-amber-400 font-bold">{ret?.nomorRegister}</span>
                            ) : pbb?.nop === 'TIDAK ADA NOP' || pbb?.statusNop === 'tidak_ada' ? (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-sans font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Tanpa NOP
                              </span>
                            ) : (
                              pbb?.nop
                            )}
                            <span className={`block text-[10px] font-sans font-bold uppercase mt-0.5 ${
                              isPotensi ? 'text-emerald-400' : isRetribusi ? 'text-amber-400' : 'text-blue-400'
                            }`}>
                              {isPotensi ? pot?.jenisPajak : isRetribusi ? ret?.golonganRetribusi : `PBB-P2 Th. ${pbb?.tahunPajak}`}
                            </span>
                          </td>

                          {/* Wajib Pajak & Objek */}
                          <td className="py-3 px-4">
                            <span className="font-bold text-white block">
                              {isRetribusi ? ret?.subObjekRetribusi : item.data.namaWajibPajak}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {isPotensi 
                                ? pot?.namaUsaha 
                                : isRetribusi 
                                ? `${ret?.subRekening}${ret?.namaPengelola ? ` • ${ret.namaPengelola}` : ''}`
                                : `Luas Bumi ${pbb?.luasBumiM2}m² / Bangunan ${pbb?.luasBangunanM2}m²`}
                            </span>
                          </td>

                          {/* Kelurahan / Desa */}
                          <td className="py-3 px-4">
                            <span className="font-bold text-emerald-400 block">
                              {kelurahanDesaVal}
                            </span>
                            <span className="text-[10px] text-slate-500">Kelurahan/Desa</span>
                          </td>

                          {/* Alamat Lengkap */}
                          <td className="py-3 px-4">
                            <span className="text-slate-200 block text-xs max-w-[180px] leading-tight truncate" title={alamatVal}>
                              {alamatVal}
                            </span>
                            {hasGps ? (
                              <span className="text-[10px] text-teal-400 font-mono flex items-center gap-0.5 mt-0.5">
                                <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                                <span>{latVal?.toFixed(4)}, {lngVal?.toFixed(4)}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic block mt-0.5">
                                Titik Pusat Kec.
                              </span>
                            )}
                          </td>

                          {/* Kecamatan */}
                          <td className="py-3 px-4">
                            <span className="text-slate-200 block font-medium">{item.data.kecamatan}</span>
                            <span className="text-[10px] text-slate-500">Kab. HSU</span>
                          </td>

                          {/* Nilai Fiskal */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-white">
                            {isPotensi 
                              ? formatRupiah(pot?.potensiRupiahTahunan || 0)
                              : isRetribusi
                              ? formatRupiah(ret?.potensiPertahun || 0)
                              : formatRupiah(pbb?.pbbTerhutang || 0)
                            }
                            <span className="block text-[10px] text-slate-500 font-sans">
                              {isPotensi 
                                ? 'Potensi/Th' 
                                : isRetribusi 
                                ? `${formatRupiah(ret?.potensiPerbulan || 0)}/bln` 
                                : (pbb?.statusPembayaran || 'PBB')}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              status === 'Setuju'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : status === 'Verifikasi'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}>
                              {status === 'Setuju' && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                              {status === 'Verifikasi' && <FileCheck className="w-3 h-3 text-blue-400" />}
                              {status === 'Menunggu Verifikasi' && <Clock className="w-3 h-3 text-amber-400" />}
                              <span>{status}</span>
                            </span>

                            {item.data.verifiedBy && (
                              <span className="block text-[9px] text-slate-500 mt-0.5 truncate max-w-[120px] mx-auto">
                                Oleh: {item.data.verifiedBy}
                              </span>
                            )}
                          </td>

                          {/* Petugas & Tanggal */}
                          <td className="py-3 px-4 text-slate-400">
                            <span className="text-white block font-medium">
                              {isPotensi ? pot?.petugasPendata : isRetribusi ? ret?.petugasPendata : pbb?.petugasValidasi}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {isPotensi ? pot?.tanggalPendataan : isRetribusi ? ret?.tanggalPendataan : pbb?.createdAt?.split('T')[0] || '-'}
                            </span>
                          </td>

                          {/* Aksi Verifikasi */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              
                              {/* Aksi Verifikasi: Lihat Map */}
                              <button
                                type="button"
                                onClick={() => {
                                  const lat = isPotensi ? pot!.latitude : isRetribusi ? ret!.latitude : pbb!.latitude;
                                  const lng = isPotensi ? pot!.longitude : isRetribusi ? ret!.longitude : pbb!.longitude;
                                  const title = isPotensi ? `${pot!.namaWajibPajak} (${pot!.namaUsaha})` : isRetribusi ? ret!.subObjekRetribusi : pbb!.namaWajibPajak;
                                  const no = isPotensi ? pot!.nomorFormulir : isRetribusi ? ret!.nomorRegister : pbb!.nop;
                                  const foto = isPotensi ? pot?.fotoObjekUrl : isRetribusi ? ret?.fotoObjekRetribusiUrl : pbb?.fotoObjekPbbUrl;
                                  const fotoN = isPotensi ? pot?.fotoObjekName : isRetribusi ? ret?.fotoObjekRetribusiName : pbb?.fotoObjekPbbName;

                                  setVerifikasiMapModal({
                                    itemType: item.type,
                                    id: item.data.id,
                                    name: title,
                                    nomor: no,
                                    kecamatan: item.data.kecamatan,
                                    kelurahanDesa: kelurahanDesaVal,
                                    alamat: alamatVal,
                                    latitude: lat || 0,
                                    longitude: lng || 0,
                                    statusVerifikasi: (item.data.statusVerifikasi as VerificationStatus) || 'Menunggu Verifikasi',
                                    nilaiFiskalLabel: isPotensi ? 'Potensi Pajak Tahunan' : isRetribusi ? 'Potensi Retribusi Tahunan' : 'PBB Terhutang',
                                    nilaiFiskalRp: formatRupiah(isPotensi ? (pot?.potensiRupiahTahunan || 0) : isRetribusi ? (ret?.potensiPertahun || 0) : (pbb?.pbbTerhutang || 0)),
                                    petugas: isPotensi ? pot?.petugasPendata : isRetribusi ? ret?.petugasPendata : pbb?.petugasValidasi,
                                    fotoUrl: foto,
                                    fotoName: fotoN,
                                  });
                                }}
                                title="Verifikasi Titik Koordinat GPS & Lihat Map"
                                className="px-2.5 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 hover:text-white font-bold text-[11px] flex items-center gap-1 border border-teal-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
                              >
                                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                                <span>Lihat Map</span>
                              </button>

                              {/* Lihat Hasil Inputan Detail */}
                              <button
                                onClick={() => handleOpenDetailModal(item)}
                                title="Lihat Hasil Inputan Lengkap"
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white font-bold text-[11px] flex items-center gap-1 border border-slate-700 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Lihat</span>
                              </button>

                              {/* Lihat File Hasil Inputan (Foto Objek / DPA / Struk Bayar) */}
                              {(() => {
                                const hasPhoto = Boolean(
                                  isPotensi
                                    ? pot?.fotoObjekUrl
                                    : isRetribusi
                                    ? ret?.fotoObjekRetribusiUrl
                                    : pbb?.fotoObjekPbbUrl
                                );
                                const hasDpa = Boolean(isPotensi && pot?.dpaFileUrl);
                                const hasStruk = Boolean(isPbb && pbb?.strukBayarUrl);
                                const hasAnyFile = hasPhoto || hasDpa || hasStruk;

                                return (
                                  <button
                                    onClick={() => {
                                      if (isPotensi) {
                                        if (pot?.fotoObjekUrl) {
                                          setPreviewFileModal({
                                            title: `Foto Objek Pajak: ${pot.namaUsaha}`,
                                            fileName: pot.fotoObjekName || 'Foto_Objek_PJRD.jpg',
                                            fileUrl: pot.fotoObjekUrl,
                                            fileType: 'image',
                                            fileSize: pot.fotoObjekSize || 'Foto Lapangan',
                                            sourceInfo: `No. Form: ${pot.nomorFormulir} • ${pot.jenisPajak} • ${pot.kecamatan}`,
                                          });
                                        } else if (pot?.dpaFileUrl) {
                                          setPreviewFileModal({
                                            title: `Dokumen DPA / Kertas Kerja: ${pot.namaUsaha}`,
                                            fileName: pot.dpaFileName || 'Dokumen_DPA.pdf',
                                            fileUrl: pot.dpaFileUrl,
                                            fileType: 'pdf',
                                            fileSize: pot.dpaFileSize || 'Dokumen Valid',
                                            sourceInfo: `No. Form: ${pot.nomorFormulir} • ${pot.jenisPajak}`,
                                          });
                                        } else {
                                          handleOpenDetailModal(item);
                                        }
                                      } else if (isRetribusi) {
                                        if (ret?.fotoObjekRetribusiUrl) {
                                          setPreviewFileModal({
                                            title: `Foto Objek Retribusi: ${ret.subObjekRetribusi}`,
                                            fileName: ret.fotoObjekRetribusiName || 'Foto_Objek_Retribusi.jpg',
                                            fileUrl: ret.fotoObjekRetribusiUrl,
                                            fileType: 'image',
                                            fileSize: ret.fotoObjekRetribusiSize || 'Foto Lapangan',
                                            sourceInfo: `No. Register: ${ret.nomorRegister} • ${ret.subRekening} • ${ret.kecamatan}`,
                                          });
                                        } else {
                                          handleOpenDetailModal(item);
                                        }
                                      } else {
                                        if (pbb?.fotoObjekPbbUrl) {
                                          setPreviewFileModal({
                                            title: `Foto Objek Persil PBB NOP: ${pbb.nop}`,
                                            fileName: pbb.fotoObjekPbbName || 'Foto_Persil_PBB.jpg',
                                            fileUrl: pbb.fotoObjekPbbUrl,
                                            fileType: 'image',
                                            fileSize: pbb.fotoObjekPbbSize || 'Foto Lapangan',
                                            sourceInfo: `NOP: ${pbb.nop} • ${pbb.namaWajibPajak} • ${pbb.kecamatan}`,
                                          });
                                        } else if (pbb?.strukBayarUrl) {
                                          setPreviewFileModal({
                                            title: `Struk Bayar PBB NOP: ${pbb.nop}`,
                                            fileName: pbb.strukBayarName || 'Struk_Bayar_PBB.pdf',
                                            fileUrl: pbb.strukBayarUrl,
                                            fileType: 'pdf',
                                            fileSize: 'Struk Sah',
                                            sourceInfo: `NOP: ${pbb.nop} • ${pbb.namaWajibPajak}`,
                                          });
                                        } else {
                                          handleOpenDetailModal(item);
                                        }
                                      }
                                    }}
                                    title={hasAnyFile ? "Lihat Berkas / Foto Hasil Inputan Lapangan" : "Buka Detail Berkas Inputan"}
                                    className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 border transition-all ${
                                      hasAnyFile
                                        ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30 hover:border-amber-500/50'
                                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700'
                                    }`}
                                  >
                                    <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Lihat File</span>
                                  </button>
                                );
                              })()}

                              {/* Action: Ubah Status Cepat */}
                              {status !== 'Verifikasi' && (
                                <button
                                  onClick={() => {
                                    if (isPotensi) {
                                      handleChangePotensiStatus(pot!.id, 'Verifikasi');
                                    } else if (isPbb) {
                                      handleChangePbbStatus(pbb!.id, 'Verifikasi');
                                    } else {
                                      handleChangeRetribusiStatus(ret!.id, 'Verifikasi');
                                    }
                                  }}
                                  title="Ubah status menjadi Verifikasi"
                                  className="px-2 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  Verifikasi
                                </button>
                              )}

                              {status !== 'Setuju' && (
                                <button
                                  onClick={() => {
                                    if (isPotensi) {
                                      handleChangePotensiStatus(pot!.id, 'Setuju');
                                    } else if (isPbb) {
                                      handleChangePbbStatus(pbb!.id, 'Setuju');
                                    } else {
                                      handleChangeRetribusiStatus(ret!.id, 'Setuju');
                                    }
                                  }}
                                  title="Setujui hasil inputan ini"
                                  className="px-2 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  Setuju
                                </button>
                              )}

                              {status !== 'Menunggu Verifikasi' && (
                                <button
                                  onClick={() => {
                                    if (isPotensi) {
                                      handleChangePotensiStatus(pot!.id, 'Menunggu Verifikasi');
                                    } else if (isPbb) {
                                      handleChangePbbStatus(pbb!.id, 'Menunggu Verifikasi');
                                    } else {
                                      handleChangeRetribusiStatus(ret!.id, 'Menunggu Verifikasi');
                                    }
                                  }}
                                  title="Kembalikan ke status Menunggu Verifikasi"
                                  className="px-2 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  Tunda
                                </button>
                              )}

                              {/* Action: Menu Hapus di Aksi Verifikasi */}
                              <button
                                onClick={() => setItemToDelete({
                                  type: isPotensi ? 'potensi' : isPbb ? 'pbb' : 'retribusi',
                                  id: isPotensi ? pot!.id : isPbb ? pbb!.id : ret!.id,
                                  label: isPotensi 
                                    ? `${pot!.namaUsaha} (${pot!.nomorFormulir})` 
                                    : isPbb 
                                    ? `NOP ${pbb!.nop} (${pbb!.namaWajibPajak})`
                                    : `${ret!.subObjekRetribusi} (${ret!.nomorRegister})`
                                })}
                                title="Hapus data hasil inputan ini"
                                className="px-2 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Hapus</span>
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* VIEW 2: REKAPITULASI & CETAK RESMI LAPORAN */}
      {activeViewMode === 'rekap_cetak' && (
        <div className="mt-6 space-y-6">

          {/* Action buttons & export */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xl">
            
            {/* Report Type Selector */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedReportType('gabungan')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedReportType === 'gabungan'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
                    : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                Rekap Gabungan PAD
              </button>
              <button
                onClick={() => setSelectedReportType('potensi')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedReportType === 'potensi'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
                    : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                Potensi Pajak Daerah
              </button>
              <button
                onClick={() => setSelectedReportType('retribusi')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedReportType === 'retribusi'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40 font-extrabold'
                    : 'bg-slate-950/70 text-amber-300 hover:text-white hover:bg-slate-800 border border-amber-500/30'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Input Retribusi Daerah</span>
              </button>
              <button
                onClick={() => setSelectedReportType('pbb')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedReportType === 'pbb'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
                    : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                Ketetapan PBB-P2
              </button>
            </div>

            {/* Kecamatan Filter & Cetak Action */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={filterKecamatan}
                  onChange={(e) => setFilterKecamatan(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="all">Seluruh Kecamatan di Kab. HSU</option>
                  {KECAMATAN_HSU_OPTIONS.map((kec, idx) => (
                    <option key={idx} value={kec}>{kec}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Cetak Rekap</span>
              </button>

              {onOpenSpreadsheetModal && (
                <button
                  onClick={onOpenSpreadsheetModal}
                  title="Koneksi & Sinkronisasi ke Google Spreadsheet"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-500/50 text-emerald-300 text-xs font-bold transition-all shadow-md shadow-emerald-950/40 cursor-pointer active:scale-95"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Spreadsheet</span>
                </button>
              )}

              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>CSV</span>
              </button>

              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSuccess ? 'Disalin' : 'Salin'}</span>
              </button>
            </div>

          </div>

          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className={`p-4 rounded-2xl border shadow-lg transition-all ${
              selectedReportType === 'potensi'
                ? 'bg-emerald-500/15 border-emerald-500'
                : 'bg-slate-900/80 border-slate-800'
            }`}>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Potensi Pajak Daerah
              </span>
              <p className="mt-2 text-xl font-black text-emerald-400">
                {formatRupiah(totalPotensiRupiah)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {filteredPotensi.length} Wajib Pajak terdata
              </p>
            </div>

            <div className={`p-4 rounded-2xl border shadow-lg transition-all ${
              selectedReportType === 'retribusi'
                ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30'
                : 'bg-slate-900/80 border-slate-800'
            }`}>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                <span>Potensi Retribusi Daerah</span>
              </span>
              <p className="mt-2 text-xl font-black text-amber-300">
                {formatRupiah(totalRetribusiRupiah)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {filteredRetribusi.length} Objek terdata
              </p>
            </div>

            <div className={`p-4 rounded-2xl border shadow-lg transition-all ${
              selectedReportType === 'pbb'
                ? 'bg-blue-500/15 border-blue-500'
                : 'bg-slate-900/80 border-slate-800'
            }`}>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Ketetapan PBB-P2
              </span>
              <p className="mt-2 text-xl font-black text-white">
                {formatRupiah(totalPbbTerhutang)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {filteredPbb.length} NOP terdaftar
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                PBB-P2 Lunas
              </span>
              <p className="mt-2 text-xl font-black text-blue-400">
                {formatRupiah(totalPbbLunas)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {filteredPbb.filter(p => p.statusPembayaran === 'LUNAS').length} NOP terverifikasi bank
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Sisa Piutang PBB
              </span>
              <p className="mt-2 text-xl font-black text-amber-400">
                {formatRupiah(totalPbbPiutang)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {filteredPbb.filter(p => p.statusPembayaran !== 'LUNAS').length} NOP belum bayar
              </p>
            </div>
          </div>

          {/* Tables Preview for Rekap */}
          <div className="space-y-6">
            {(selectedReportType === 'gabungan' || selectedReportType === 'potensi') && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Rincian Potensi Pajak Daerah ({filteredPotensi.length})</span>
                  </h3>
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Kab. HSU
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">No. Form</th>
                        <th className="py-2.5 px-3">Wajib Pajak &amp; Usaha</th>
                        <th className="py-2.5 px-3">Jenis Pajak</th>
                        <th className="py-2.5 px-3">Kecamatan</th>
                        <th className="py-2.5 px-3 text-emerald-400">Kelurahan / Desa</th>
                        <th className="py-2.5 px-3">Alamat Lengkap</th>
                        <th className="py-2.5 px-3 text-right">Potensi Tahunan</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-center">Aksi Map</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredPotensi.map(p => (
                        <tr key={p.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono text-slate-400">{p.nomorFormulir}</td>
                          <td className="py-2.5 px-3 font-semibold text-white">
                            <div>{p.namaWajibPajak}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{p.namaUsaha}</span>
                          </td>
                          <td className="py-2.5 px-3 text-emerald-400">{p.jenisPajak}</td>
                          <td className="py-2.5 px-3">{p.kecamatan}</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-400">{p.kelurahanDesa || '-'}</td>
                          <td className="py-2.5 px-3 text-slate-300 max-w-[180px] truncate" title={p.alamatLengkap}>{p.alamatLengkap || '-'}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-white">{formatRupiah(p.potensiRupiahTahunan)}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700">
                              {normalizeStatus(p.statusVerifikasi)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setVerifikasiMapModal({
                                  itemType: 'potensi',
                                  id: p.id,
                                  name: `${p.namaWajibPajak} (${p.namaUsaha})`,
                                  nomor: p.nomorFormulir,
                                  kecamatan: p.kecamatan,
                                  kelurahanDesa: p.kelurahanDesa || '-',
                                  alamat: p.alamatLengkap || '-',
                                  latitude: p.latitude || 0,
                                  longitude: p.longitude || 0,
                                  statusVerifikasi: (p.statusVerifikasi as VerificationStatus) || 'Menunggu Verifikasi',
                                  nilaiFiskalLabel: 'Potensi Pajak Tahunan',
                                  nilaiFiskalRp: formatRupiah(p.potensiRupiahTahunan || 0),
                                  petugas: p.petugasPendata,
                                  fotoUrl: p.fotoObjekUrl,
                                  fotoName: p.fotoObjekName,
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[10px] font-bold flex items-center gap-1 mx-auto transition-all cursor-pointer"
                            >
                              <MapPin className="w-3 h-3 text-teal-400" />
                              <span>Lihat Map</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(selectedReportType === 'gabungan' || selectedReportType === 'retribusi') && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>Rincian Hasil Input Potensi Retribusi Daerah ({filteredRetribusi.length})</span>
                  </h3>
                  <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    Kab. HSU
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">No. Register</th>
                        <th className="py-2.5 px-3">Sub Objek &amp; Pengelola</th>
                        <th className="py-2.5 px-3">Golongan Retribusi</th>
                        <th className="py-2.5 px-3">Kecamatan</th>
                        <th className="py-2.5 px-3 text-amber-300">Kelurahan / Desa</th>
                        <th className="py-2.5 px-3">Alamat Lengkap</th>
                        <th className="py-2.5 px-3 text-right">Tarif &amp; Satuan</th>
                        <th className="py-2.5 px-3 text-right">Potensi Tahunan</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-center">Aksi Map</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredRetribusi.map(r => (
                        <tr key={r.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{r.nomorRegister}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-white block">{r.subObjekRetribusi}</span>
                            {r.namaPengelola && <span className="text-[10px] text-slate-400 block">Pengelola: {r.namaPengelola}</span>}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">{r.golonganRetribusi}</td>
                          <td className="py-2.5 px-3">{r.kecamatan}</td>
                          <td className="py-2.5 px-3 font-bold text-amber-300">{r.kelurahanDesa || '-'}</td>
                          <td className="py-2.5 px-3 text-slate-300 max-w-[180px] truncate" title={r.alamatLengkap}>{r.alamatLengkap || '-'}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                            {formatRupiah(r.tarifSatuan)} / {r.satuanTarif} ({r.jumlahSatuan})
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-white">{formatRupiah(r.potensiPertahun)}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700">
                              {normalizeStatus(r.statusVerifikasi)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setVerifikasiMapModal({
                                  itemType: 'retribusi',
                                  id: r.id,
                                  name: `${r.subObjekRetribusi}${r.namaPengelola ? ` • ${r.namaPengelola}` : ''}`,
                                  nomor: r.nomorRegister,
                                  kecamatan: r.kecamatan,
                                  kelurahanDesa: r.kelurahanDesa || '-',
                                  alamat: r.alamatLengkap || '-',
                                  latitude: r.latitude || 0,
                                  longitude: r.longitude || 0,
                                  statusVerifikasi: (r.statusVerifikasi as VerificationStatus) || 'Menunggu Verifikasi',
                                  nilaiFiskalLabel: 'Potensi Retribusi Tahunan',
                                  nilaiFiskalRp: formatRupiah(r.potensiPertahun || 0),
                                  petugas: r.petugasPendata,
                                  fotoUrl: r.fotoObjekRetribusiUrl,
                                  fotoName: r.fotoObjekRetribusiName,
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[10px] font-bold flex items-center gap-1 mx-auto transition-all cursor-pointer"
                            >
                              <MapPin className="w-3 h-3 text-teal-400" />
                              <span>Lihat Map</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(selectedReportType === 'gabungan' || selectedReportType === 'pbb') && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-blue-400" />
                    <span>Rincian Ketetapan &amp; Pembayaran PBB-P2 ({filteredPbb.length})</span>
                  </h3>
                  <span className="text-[11px] text-blue-400 font-bold bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                    Tahun 2026
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">NOP (18 Digit)</th>
                        <th className="py-2.5 px-3">Nama Wajib Pajak</th>
                        <th className="py-2.5 px-3">Kecamatan</th>
                        <th className="py-2.5 px-3 text-blue-300">Kelurahan / Desa</th>
                        <th className="py-2.5 px-3">Alamat Objek</th>
                        <th className="py-2.5 px-3 text-right">PBB Terhutang</th>
                        <th className="py-2.5 px-3 text-center">Status Bayar</th>
                        <th className="py-2.5 px-3 text-center">Status Verifikasi</th>
                        <th className="py-2.5 px-3 text-center">Aksi Map</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredPbb.map(p => (
                        <tr key={p.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono text-slate-300">{p.nop}</td>
                          <td className="py-2.5 px-3 font-semibold text-white">{p.namaWajibPajak}</td>
                          <td className="py-2.5 px-3">{p.kecamatan}</td>
                          <td className="py-2.5 px-3 font-bold text-blue-300">{p.kelurahanDesa || '-'}</td>
                          <td className="py-2.5 px-3 text-slate-300 max-w-[180px] truncate" title={p.alamatObjek}>{p.alamatObjek || '-'}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-white">{formatRupiah(p.pbbTerhutang)}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.statusPembayaran === 'LUNAS' ? 'bg-blue-500/20 text-blue-300' : 'bg-red-500/20 text-red-300'
                            }`}>
                              {p.statusPembayaran}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700">
                              {normalizeStatus(p.statusVerifikasi)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setVerifikasiMapModal({
                                  itemType: 'pbb',
                                  id: p.id,
                                  name: p.namaWajibPajak,
                                  nomor: p.nop,
                                  kecamatan: p.kecamatan,
                                  kelurahanDesa: p.kelurahanDesa || '-',
                                  alamat: p.alamatObjek || '-',
                                  latitude: p.latitude || 0,
                                  longitude: p.longitude || 0,
                                  statusVerifikasi: (p.statusVerifikasi as VerificationStatus) || 'Menunggu Verifikasi',
                                  nilaiFiskalLabel: 'PBB Terhutang',
                                  nilaiFiskalRp: formatRupiah(p.pbbTerhutang || 0),
                                  petugas: p.petugasValidasi,
                                  fotoUrl: p.fotoObjekPbbUrl,
                                  fotoName: p.fotoObjekPbbName,
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[10px] font-bold flex items-center gap-1 mx-auto transition-all cursor-pointer"
                            >
                              <MapPin className="w-3 h-3 text-teal-400" />
                              <span>Lihat Map</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODAL LIHAT DETAIL HASIL INPUTAN & UBAH STATUS */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedItem.type === 'potensi'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : selectedItem.type === 'retribusi'
                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                    : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                }`}>
                  {selectedItem.type === 'potensi' ? (
                    <FileSpreadsheet className="w-5 h-5" />
                  ) : selectedItem.type === 'retribusi' ? (
                    <Coins className="w-5 h-5" />
                  ) : (
                    <Receipt className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      Detail Hasil Inputan &amp; Tindakan Verifikasi
                    </h3>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      selectedItem.type === 'potensi'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : selectedItem.type === 'retribusi'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                    }`}>
                      {selectedItem.type === 'potensi' 
                        ? 'Potensi Pajak Daerah' 
                        : selectedItem.type === 'retribusi' 
                        ? 'Retribusi Daerah' 
                        : 'Layanan PBB-P2'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    ID:{' '}
                    {selectedItem.type === 'potensi'
                      ? selectedItem.potensi?.nomorFormulir
                      : selectedItem.type === 'retribusi'
                      ? selectedItem.retribusi?.nomorRegister
                      : selectedItem.pbb?.nop === 'TIDAK ADA NOP' || selectedItem.pbb?.statusNop === 'tidak_ada'
                      ? 'Tanpa NOP (Objek Baru)'
                      : selectedItem.pbb?.nop}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Status Banner */}
            {(() => {
              const currentStatus = normalizeStatus(
                selectedItem.type === 'potensi' 
                  ? selectedItem.potensi?.statusVerifikasi 
                  : selectedItem.type === 'retribusi'
                  ? selectedItem.retribusi?.statusVerifikasi
                  : selectedItem.pbb?.statusVerifikasi
              );
              const verifiedBy = (
                selectedItem.type === 'potensi'
                  ? selectedItem.potensi?.verifiedBy
                  : selectedItem.type === 'retribusi'
                  ? selectedItem.retribusi?.verifiedBy
                  : selectedItem.pbb?.verifiedBy
              ) || 'Belum diverifikasi';
              return (
                <div className={`mt-5 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  currentStatus === 'Setuju'
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : currentStatus === 'Verifikasi'
                    ? 'bg-blue-950/30 border-blue-500/40 text-blue-300'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-900 border border-slate-800">
                      {currentStatus === 'Setuju' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                      {currentStatus === 'Verifikasi' && <FileCheck className="w-5 h-5 text-blue-400" />}
                      {currentStatus === 'Menunggu Verifikasi' && <Clock className="w-5 h-5 text-amber-400" />}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                        Status Verifikasi Saat Ini
                      </span>
                      <h4 className="text-sm font-black tracking-wide">
                        {currentStatus === 'Setuju' && 'STATUS: SETUJU (TELAH DISETUJUI & SAH)'}
                        {currentStatus === 'Verifikasi' && 'STATUS: VERIFIKASI (DALAM PROSES PEMERIKSAAN)'}
                        {currentStatus === 'Menunggu Verifikasi' && 'STATUS: MENUNGGU VERIFIKASI'}
                      </h4>
                    </div>
                  </div>

                  <div className="text-right sm:text-right text-[11px] opacity-90">
                    <span>Diverifikasi oleh: </span>
                    <strong className="text-white">
                      {verifiedBy}
                    </strong>
                  </div>
                </div>
              );
            })()}

            {/* Details Grid */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Kolom Kiri: Identitas Subjek/Objek & Nilai Fiskal */}
              <div className="space-y-4">
                
                {/* 1. Identitas Objek / Subjek */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
                  <h5 className="font-extrabold text-white text-xs pb-2 border-b border-slate-800 flex items-center gap-1.5">
                    {selectedItem.type === 'retribusi' ? (
                      <Coins className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Building2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>
                      {selectedItem.type === 'retribusi'
                        ? 'Identitas Objek & Rekening Retribusi'
                        : 'Identitas Subjek & Objek Pajak'}
                    </span>
                  </h5>
                  
                  {selectedItem.type === 'potensi' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nama Wajib Pajak:</span>
                        <strong className="text-white">{selectedItem.potensi?.namaWajibPajak}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nama Usaha:</span>
                        <strong className="text-emerald-300">{selectedItem.potensi?.namaUsaha}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">NPWPD:</span>
                        <span className="font-mono text-slate-300">{selectedItem.potensi?.npwpd || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Jenis Pajak:</span>
                        <span className="text-amber-300 font-semibold">{selectedItem.potensi?.jenisPajak}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Petugas Pendata:</span>
                        <span className="text-slate-200">{selectedItem.potensi?.petugasPendata}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tanggal Pendataan:</span>
                        <span className="text-slate-300">{selectedItem.potensi?.tanggalPendataan}</span>
                      </div>
                    </>
                  ) : selectedItem.type === 'retribusi' ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Sub Objek Retribusi:</span>
                        <strong className="text-white text-sm font-black">{selectedItem.retribusi?.subObjekRetribusi}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Golongan Retribusi:</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {selectedItem.retribusi?.golonganRetribusi}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sub Rekening:</span>
                        <strong className="text-amber-200">{selectedItem.retribusi?.subRekening}</strong>
                      </div>
                      {selectedItem.retribusi?.namaPengelola && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pengelola / PIC:</span>
                          <span className="text-slate-200">{selectedItem.retribusi?.namaPengelola}</span>
                        </div>
                      )}
                      {selectedItem.retribusi?.nomorKontrakOrSK && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">No. Kontrak / SK:</span>
                          <span className="font-mono text-slate-300">{selectedItem.retribusi?.nomorKontrakOrSK}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Petugas Pendata:</span>
                        <span className="text-slate-200 font-medium">{selectedItem.retribusi?.petugasPendata}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tanggal Pendataan:</span>
                        <span className="text-slate-300 font-mono">{selectedItem.retribusi?.tanggalPendataan}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nama Wajib Pajak:</span>
                        <strong className="text-white">{selectedItem.pbb?.namaWajibPajak}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Nomor NOP:</span>
                        {selectedItem.pbb?.nop === 'TIDAK ADA NOP' || selectedItem.pbb?.statusNop === 'tidak_ada' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-sans font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            TIDAK ADA NOP (Objek Baru)
                          </span>
                        ) : (
                          <span className="font-mono text-blue-300 font-bold">{selectedItem.pbb?.nop}</span>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">NIK Wajib Pajak:</span>
                        <span className="font-mono text-slate-300">{selectedItem.pbb?.nikWajibPajak || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tahun Pajak SPPT:</span>
                        <span className="text-white font-bold">{selectedItem.pbb?.tahunPajak}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Luas Persil:</span>
                        <span className="text-slate-300">
                          Bumi {selectedItem.pbb?.luasBumiM2} m² / Bangunan {selectedItem.pbb?.luasBangunanM2} m²
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* 2. Nilai Fiskal / Perhitungan Potensi */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
                  <h5 className="font-extrabold text-white text-xs pb-2 border-b border-slate-800 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>
                      {selectedItem.type === 'retribusi'
                        ? 'Tarif & Potensi Retribusi Daerah'
                        : 'Perhitungan & Ketetapan Nilai Fiskal'}
                    </span>
                  </h5>

                  {selectedItem.type === 'potensi' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Estimasi Potensi Bulanan:</span>
                        <span className="font-mono text-white">
                          {formatRupiah(selectedItem.potensi?.potensiRupiahBulanan || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800/60">
                        <span className="text-slate-300 font-bold">Total Potensi Tahunan:</span>
                        <span className="font-mono text-emerald-400 text-sm font-black">
                          {formatRupiah(selectedItem.potensi?.potensiRupiahTahunan || 0)}
                        </span>
                      </div>
                    </>
                  ) : selectedItem.type === 'retribusi' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tarif Satuan Dasar:</span>
                        <span className="font-mono text-white font-bold">
                          {formatRupiah(selectedItem.retribusi?.tarifSatuan || 0)}{' '}
                          <span className="text-slate-400 text-[11px] font-normal">
                            ({selectedItem.retribusi?.satuanTarif || 'Per Unit'})
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Jumlah Satuan / Volume:</span>
                        <span className="font-bold text-white">
                          {selectedItem.retribusi?.jumlahSatuan || 1} Unit / Objek
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800/60">
                        <span className="text-slate-300 font-bold">Potensi Perbulan:</span>
                        <span className="font-mono text-amber-300 text-xs font-bold">
                          {formatRupiah(selectedItem.retribusi?.potensiPerbulan || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800/60">
                        <span className="text-slate-200 font-extrabold">Potensi Pertahun:</span>
                        <span className="font-mono text-emerald-400 text-base font-black">
                          {formatRupiah(selectedItem.retribusi?.potensiPertahun || 0)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1.5 py-1 text-[11px] font-mono border-b border-slate-800/80">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Total NJOP Bumi:</span>
                          <span className="text-emerald-400 font-bold">
                            {formatRupiah(selectedItem.pbb?.totalNjopBumi || ((selectedItem.pbb?.luasBumiM2 || 0) * (selectedItem.pbb?.njopBumiPerM2 || 0)))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-sans">
                          <span>{selectedItem.pbb?.luasBumiM2} m&sup2; &times; {formatRupiah(selectedItem.pbb?.njopBumiPerM2 || 0)}</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                            Kelas {selectedItem.pbb?.kelasBumi || 'A35'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 py-1 text-[11px] font-mono border-b border-slate-800/80">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Total NJOP Bangunan:</span>
                          <span className="text-blue-400 font-bold">
                            {(selectedItem.pbb?.luasBangunanM2 || 0) > 0 
                              ? formatRupiah(selectedItem.pbb?.totalNjopBangunan || ((selectedItem.pbb?.luasBangunanM2 || 0) * (selectedItem.pbb?.njopBangunanPerM2 || 0)))
                              : 'Rp 0 (Tanpa Bangunan)'}
                          </span>
                        </div>
                        {(selectedItem.pbb?.luasBangunanM2 || 0) > 0 && (
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-sans">
                            <span>{selectedItem.pbb?.luasBangunanM2} m&sup2; &times; {formatRupiah(selectedItem.pbb?.njopBangunanPerM2 || 0)}</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                              Kelas {selectedItem.pbb?.kelasBangunan || 'B12'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-slate-300 font-semibold">Total NJOP Objek:</span>
                        <span className="font-mono text-white font-bold">
                          {formatRupiah(selectedItem.pbb?.njopTotal || 0)}
                        </span>
                      </div>

                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>NJOPTKP (Tidak Kena Pajak):</span>
                        <span className="font-mono text-amber-400">
                          (-) {formatRupiah(selectedItem.pbb?.njoptkp || 10000000)}
                        </span>
                      </div>

                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Tarif PBB-P2:</span>
                        <span className="font-mono text-slate-200 font-bold">
                          {selectedItem.pbb?.tarifPbbPersen || 0.15}%
                        </span>
                      </div>

                      <div className="flex justify-between pt-1 border-t border-slate-800/60">
                        <span className="text-slate-200 font-bold">Ketetapan PBB Terhutang:</span>
                        <span className="font-mono text-emerald-400 text-sm font-black">
                          {formatRupiah(selectedItem.pbb?.pbbTerhutang || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Status Pembayaran:</span>
                        <span className={`font-bold px-2 py-0.5 rounded ${
                          selectedItem.pbb?.statusPembayaran === 'LUNAS' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {selectedItem.pbb?.statusPembayaran}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Geospasial & Catatan / Keterangan */}
              <div className="space-y-4">
                
                {/* 1. Lokasi Geospasial */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
                  <h5 className="font-extrabold text-white text-xs pb-2 border-b border-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-teal-400" />
                    <span>Lokasi Geospasial GPS Presisi HSU</span>
                  </h5>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Kecamatan:</span>
                    <strong className="text-white">
                      {selectedItem.type === 'potensi'
                        ? selectedItem.potensi?.kecamatan
                        : selectedItem.type === 'retribusi'
                        ? selectedItem.retribusi?.kecamatan
                        : selectedItem.pbb?.kecamatan}
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Kelurahan/Desa:</span>
                    <span className="text-slate-200">
                      {selectedItem.type === 'potensi'
                        ? selectedItem.potensi?.kelurahanDesa
                        : selectedItem.type === 'retribusi'
                        ? (selectedItem.retribusi?.kelurahanDesa || '-')
                        : selectedItem.pbb?.kelurahanDesa}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Titik Koordinat GPS:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {(() => {
                        const lat = selectedItem.type === 'potensi' 
                          ? selectedItem.potensi?.latitude 
                          : selectedItem.type === 'retribusi'
                          ? selectedItem.retribusi?.latitude
                          : selectedItem.pbb?.latitude;
                        const lng = selectedItem.type === 'potensi' 
                          ? selectedItem.potensi?.longitude 
                          : selectedItem.type === 'retribusi'
                          ? selectedItem.retribusi?.longitude
                          : selectedItem.pbb?.longitude;
                        return (lat !== undefined && lng !== undefined)
                          ? `${lat.toFixed(6)}, ${lng.toFixed(6)}`
                          : '-';
                      })()}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-1">
                    <span className="block text-slate-500">Alamat Lengkap:</span>
                    <span className="text-slate-300">
                      {selectedItem.type === 'potensi'
                        ? selectedItem.potensi?.alamatLengkap
                        : selectedItem.type === 'retribusi'
                        ? selectedItem.retribusi?.alamatLengkap
                        : selectedItem.pbb?.alamatObjek}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const isPot = selectedItem.type === 'potensi';
                      const isRet = selectedItem.type === 'retribusi';
                      const pot = selectedItem.potensi;
                      const ret = selectedItem.retribusi;
                      const pbb = selectedItem.pbb;

                      const lat = isPot ? pot!.latitude : isRet ? ret!.latitude : pbb!.latitude;
                      const lng = isPot ? pot!.longitude : isRet ? ret!.longitude : pbb!.longitude;
                      const kel = isPot ? pot!.kelurahanDesa : isRet ? ret!.kelurahanDesa : pbb!.kelurahanDesa;
                      const alm = isPot ? pot!.alamatLengkap : isRet ? ret!.alamatLengkap : pbb!.alamatObjek;
                      const title = isPot ? `${pot!.namaWajibPajak} (${pot!.namaUsaha})` : isRet ? ret!.subObjekRetribusi : pbb!.namaWajibPajak;
                      const no = isPot ? pot!.nomorFormulir : isRet ? ret!.nomorRegister : pbb!.nop;
                      const foto = isPot ? pot?.fotoObjekUrl : isRet ? ret?.fotoObjekRetribusiUrl : pbb?.fotoObjekPbbUrl;
                      const fotoN = isPot ? pot?.fotoObjekName : isRet ? ret?.fotoObjekRetribusiName : pbb?.fotoObjekPbbName;

                      setVerifikasiMapModal({
                        itemType: selectedItem.type,
                        id: isPot ? pot!.id : isRet ? ret!.id : pbb!.id,
                        name: title,
                        nomor: no,
                        kecamatan: isPot ? pot!.kecamatan : isRet ? ret!.kecamatan : pbb!.kecamatan,
                        kelurahanDesa: kel || '-',
                        alamat: alm || '-',
                        latitude: lat || 0,
                        longitude: lng || 0,
                        statusVerifikasi: (isPot ? pot!.statusVerifikasi : isRet ? ret!.statusVerifikasi : pbb!.statusVerifikasi) || 'Menunggu Verifikasi',
                        nilaiFiskalLabel: isPot ? 'Potensi Pajak Tahunan' : isRet ? 'Potensi Retribusi Tahunan' : 'PBB Terhutang',
                        nilaiFiskalRp: formatRupiah(isPot ? (pot?.potensiRupiahTahunan || 0) : isRet ? (ret?.potensiPertahun || 0) : (pbb?.pbbTerhutang || 0)),
                        petugas: isPot ? pot?.petugasPendata : isRet ? ret?.petugasPendata : pbb?.petugasValidasi,
                        fotoUrl: foto,
                        fotoName: fotoN,
                      });
                    }}
                    className="mt-2 w-full py-2 px-3 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    <span>Lihat Titik Geospasial &amp; Verifikasi Map</span>
                  </button>
                </div>

                {/* 2. Catatan Petugas / Keterangan Objek */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
                  <span className="text-slate-400 font-bold block">
                    {selectedItem.type === 'retribusi' ? 'Keterangan Objek Retribusi:' : 'Catatan Petugas Lapangan:'}
                  </span>
                  <p className="text-slate-300 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-[11px] leading-relaxed">
                    &quot;{selectedItem.type === 'potensi' 
                      ? (selectedItem.potensi?.catatanPetugas || 'Tidak ada catatan tambahan')
                      : selectedItem.type === 'retribusi'
                      ? (selectedItem.retribusi?.keterangan || 'Tidak ada keterangan tambahan')
                      : 'Data NOP dan pembayaran tercatat tertib'
                    }&quot;
                  </p>
                </div>
              </div>

            </div>

            {/* Berkas & Dokumen Lampiran Hasil Input Lapangan (Foto Objek, Dokumen DPA/ARKAS, Struk Bayar PBB) */}
            {(() => {
              const isPot = selectedItem.type === 'potensi';
              const isRet = selectedItem.type === 'retribusi';
              const isPbb = selectedItem.type === 'pbb';

              const fotoUrl = isPot
                ? selectedItem.potensi?.fotoObjekUrl
                : isRet
                ? selectedItem.retribusi?.fotoObjekRetribusiUrl
                : selectedItem.pbb?.fotoObjekPbbUrl;

              const fotoName = isPot
                ? selectedItem.potensi?.fotoObjekName
                : isRet
                ? selectedItem.retribusi?.fotoObjekRetribusiName
                : selectedItem.pbb?.fotoObjekPbbName;

              const fotoSize = isPot
                ? selectedItem.potensi?.fotoObjekSize
                : isRet
                ? selectedItem.retribusi?.fotoObjekRetribusiSize
                : selectedItem.pbb?.fotoObjekPbbSize;

              const dpaUrl = isPot ? selectedItem.potensi?.dpaFileUrl : undefined;
              const dpaName = isPot ? selectedItem.potensi?.dpaFileName : undefined;
              const dpaSize = isPot ? selectedItem.potensi?.dpaFileSize : undefined;

              const strukUrl = isPbb ? selectedItem.pbb?.strukBayarUrl : undefined;
              const strukName = isPbb ? selectedItem.pbb?.strukBayarName : undefined;
              const nomorStruk = isPbb ? selectedItem.pbb?.nomorStruk : undefined;

              const hasFiles = Boolean(fotoUrl || dpaUrl || strukUrl);

              return (
                <div className="mt-4 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-amber-400" />
                      <span>Berkas &amp; Foto Hasil Upload Lapangan</span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      {isPot ? 'Input Potensi' : isRet ? 'Input Retribusi' : 'PBB-P2'}
                    </span>
                  </div>

                  {!hasFiles ? (
                    <div className="py-4 text-center text-xs text-slate-400 italic">
                      Tidak ada file foto/berkas yang diunggah saat inputan lapangan ini.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* 1. Foto Objek Fisik Lapangan */}
                      {fotoUrl && (
                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                              <Camera className="w-4 h-4 text-emerald-400" />
                              <span>Foto Objek Fisik Lapangan: <span className="text-white font-normal">{fotoName || 'Foto Lapangan'}</span></span>
                            </span>
                            <div className="flex items-center gap-2">
                              {fotoSize && <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{fotoSize}</span>}
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewFileModal({
                                    title: isPot
                                      ? `Foto Objek: ${selectedItem.potensi?.namaUsaha}`
                                      : isRet
                                      ? `Foto Objek: ${selectedItem.retribusi?.subObjekRetribusi}`
                                      : `Foto Persil: NOP ${selectedItem.pbb?.nop}`,
                                    fileName: fotoName || 'Foto_Objek_Lapangan.jpg',
                                    fileUrl: fotoUrl,
                                    fileType: 'image',
                                    fileSize: fotoSize || 'Foto Lapangan',
                                    sourceInfo: isPot
                                      ? `${selectedItem.potensi?.jenisPajak} • ${selectedItem.potensi?.kecamatan}`
                                      : isRet
                                      ? `${selectedItem.retribusi?.subRekening} • ${selectedItem.retribusi?.kecamatan}`
                                      : `NOP ${selectedItem.pbb?.nop}`,
                                  });
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Lihat Foto Penuh</span>
                              </button>
                            </div>
                          </div>

                          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-56 flex items-center justify-center p-2">
                            <img
                              src={fotoUrl}
                              alt={fotoName || 'Foto Fisik Objek'}
                              className="max-h-52 rounded-lg object-contain cursor-pointer hover:scale-[1.01] transition-transform"
                              onClick={() => {
                                setPreviewFileModal({
                                  title: isPot
                                    ? `Foto Objek: ${selectedItem.potensi?.namaUsaha}`
                                    : isRet
                                    ? `Foto Objek: ${selectedItem.retribusi?.subObjekRetribusi}`
                                    : `Foto Persil: NOP ${selectedItem.pbb?.nop}`,
                                  fileName: fotoName || 'Foto_Objek_Lapangan.jpg',
                                  fileUrl: fotoUrl,
                                  fileType: 'image',
                                  fileSize: fotoSize || 'Foto Lapangan',
                                });
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* 2. Berkas Dokumen DPA / Kertas Kerja Potensi */}
                      {dpaUrl && (
                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <strong className="text-xs text-white block">{dpaName || 'Dokumen_DPA_ARKAS.pdf'}</strong>
                              <span className="text-[10px] text-slate-400">
                                Dokumen DPA / Kertas Kerja Survei Potensi {dpaSize ? `(${dpaSize})` : ''}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewFileModal({
                                title: `Dokumen DPA: ${selectedItem.potensi?.namaUsaha}`,
                                fileName: dpaName || 'Dokumen_DPA.pdf',
                                fileUrl: dpaUrl,
                                fileType: 'pdf',
                                fileSize: dpaSize || 'Dokumen Valid',
                                sourceInfo: `No. Form: ${selectedItem.potensi?.nomorFormulir}`,
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Lihat Berkas</span>
                          </button>
                        </div>
                      )}

                      {/* 3. Struk / Bukti Bayar PBB-P2 */}
                      {strukUrl && (
                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                              <Receipt className="w-5 h-5" />
                            </div>
                            <div>
                              <strong className="text-xs text-white block">{strukName || 'Struk_Bayar_PBB.pdf'}</strong>
                              <span className="text-[10px] text-slate-400">
                                Bukti Pembayaran Sah {nomorStruk ? `(No: ${nomorStruk})` : ''}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewFileModal({
                                title: `Struk Bayar PBB NOP: ${selectedItem.pbb?.nop}`,
                                fileName: strukName || 'Struk_Bayar_PBB.pdf',
                                fileUrl: strukUrl,
                                fileType: strukUrl.startsWith('data:image') ? 'image' : 'pdf',
                                fileSize: 'Bukti Bayar Sah',
                                sourceInfo: `NOP: ${selectedItem.pbb?.nop} • ${selectedItem.pbb?.namaWajibPajak}`,
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Lihat Struk</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Bagian Tindakan Status Verifikasi */}
            <div className="mt-6 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Aksi Verifikasi &amp; Persetujuan Laporan</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sebagai Aparatur BP2RD ({currentUser?.name}), tentukan status verifikasi terhadap data hasil inputan ini:
                </p>
              </div>

              {/* Input Catatan Verifikasi */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan / Rekomendasi Verifikator:
                </label>
                <input
                  type="text"
                  value={verifikasiNoteInput}
                  onChange={(e) => setVerifikasiNoteInput(e.target.value)}
                  placeholder="Contoh: Berkas dan titik GPS telah dikonfirmasi valid sesuai Perda..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Action Buttons: Hapus, Menunggu Verifikasi, Verifikasi, Setuju */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                
                {/* 0. Hapus Data */}
                <button
                  type="button"
                  onClick={() => {
                    const isPot = selectedItem.type === 'potensi';
                    const isRet = selectedItem.type === 'retribusi';
                    setItemToDelete({
                      type: isPot ? 'potensi' : isRet ? 'retribusi' : 'pbb',
                      id: isPot ? selectedItem.potensi!.id : isRet ? selectedItem.retribusi!.id : selectedItem.pbb!.id,
                      label: isPot 
                        ? `${selectedItem.potensi!.namaUsaha} (${selectedItem.potensi!.nomorFormulir})` 
                        : isRet
                        ? `${selectedItem.retribusi!.subObjekRetribusi} (${selectedItem.retribusi!.nomorRegister})`
                        : `NOP ${selectedItem.pbb!.nop} (${selectedItem.pbb!.namaWajibPajak})`
                    });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer mr-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Data</span>
                </button>

                {/* 1. Menunggu Verifikasi */}
                <button
                  onClick={() => {
                    if (selectedItem.type === 'potensi') {
                      handleChangePotensiStatus(selectedItem.potensi!.id, 'Menunggu Verifikasi', verifikasiNoteInput);
                    } else if (selectedItem.type === 'retribusi') {
                      handleChangeRetribusiStatus(selectedItem.retribusi!.id, 'Menunggu Verifikasi', verifikasiNoteInput);
                    } else {
                      handleChangePbbStatus(selectedItem.pbb!.id, 'Menunggu Verifikasi', verifikasiNoteInput);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Clock3 className="w-4 h-4" />
                  <span>Tandai Menunggu Verifikasi</span>
                </button>

                {/* 2. Verifikasi */}
                <button
                  onClick={() => {
                    if (selectedItem.type === 'potensi') {
                      handleChangePotensiStatus(selectedItem.potensi!.id, 'Verifikasi', verifikasiNoteInput);
                    } else if (selectedItem.type === 'retribusi') {
                      handleChangeRetribusiStatus(selectedItem.retribusi!.id, 'Verifikasi', verifikasiNoteInput);
                    } else {
                      handleChangePbbStatus(selectedItem.pbb!.id, 'Verifikasi', verifikasiNoteInput);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-950/40 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Proses Verifikasi</span>
                </button>

                {/* 3. Setuju */}
                <button
                  onClick={() => {
                    if (selectedItem.type === 'potensi') {
                      handleChangePotensiStatus(selectedItem.potensi!.id, 'Setuju', verifikasiNoteInput);
                    } else if (selectedItem.type === 'retribusi') {
                      handleChangeRetribusiStatus(selectedItem.retribusi!.id, 'Setuju', verifikasiNoteInput);
                    } else {
                      handleChangePbbStatus(selectedItem.pbb!.id, 'Setuju', verifikasiNoteInput);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950/50 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Setuju (Sahkan Laporan)</span>
                </button>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS DATA INPUTAN */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Konfirmasi Hapus Data
                </h3>
                <span className="text-[11px] text-slate-400">
                  {itemToDelete.type === 'potensi' ? 'Potensi Pajak Daerah' : 'Ketetapan PBB-P2'}
                </span>
              </div>
            </div>

            <div className="py-4 space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                Apakah Anda yakin ingin menghapus data inputan berikut?
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300">
                {itemToDelete.label}
              </div>
              <p className="text-[11px] text-red-400/90 leading-relaxed">
                Tindakan ini akan menghapus data dari daftar verifikasi dan database secara permanen.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-950/40 transition-all cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL LIHAT FILE HASIL INPUTAN (FOTO FISIK OBJEK / DPA / STRUK BAYAR) */}
      {previewFileModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Paperclip className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Lihat File Hasil Inputan</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Tersimpan Valid
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    {previewFileModal.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewFileModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-info banner */}
            <div className="my-3 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
              <div className="truncate max-w-[400px]">
                <span className="text-slate-500 font-bold mr-1.5">Keterangan:</span>
                <span>{previewFileModal.sourceInfo || previewFileModal.fileName}</span>
              </div>
              {previewFileModal.fileSize && (
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                  {previewFileModal.fileSize}
                </span>
              )}
            </div>

            {/* File Viewer Body */}
            <div className="flex-1 my-2 min-h-[300px] max-h-[55vh] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-4">
              {previewFileModal.fileType === 'image' || previewFileModal.fileUrl.startsWith('data:image') || previewFileModal.fileName.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
                  <img
                    src={previewFileModal.fileUrl}
                    alt={previewFileModal.fileName}
                    className="max-h-[48vh] max-w-full rounded-xl object-contain shadow-2xl border border-slate-800"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 font-mono">
                    {previewFileModal.fileName}
                  </span>
                </div>
              ) : (
                <div className="text-center p-8 space-y-4 max-w-md">
                  <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-700 mx-auto flex items-center justify-center text-emerald-400">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      {previewFileModal.fileName}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Dokumen resmi lampiran hasil inputan lapangan tersimpan dalam format berkas digital aman SIPOTENSI HSU.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 font-mono text-left">
                    <div className="text-slate-500 font-bold mb-1">DATA DOKUMEN:</div>
                    <div>Nama: {previewFileModal.fileName}</div>
                    <div>Format: Dokumen Digital Valid (PDF/DPA)</div>
                    <div>Status: Terverifikasi Lapangan</div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 font-mono truncate max-w-[260px]">
                {previewFileModal.fileName}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewFileModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <a
                  href={previewFileModal.fileUrl}
                  download={previewFileModal.fileName}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer active:scale-95"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Unduh File</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
      {/* MODAL CETAK REKAP LAPORAN RESMI (Kop Surat Pemkab HSU & BP2RD) */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] flex flex-col justify-between">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Pratinjau &amp; Cetak Rekapitulasi Laporan Resmi
                  </h3>
                  <p className="text-xs text-slate-400">
                    Format Kop Surat Resmi Badan Pengelola Pajak dan Retribusi Daerah Kab. Hulu Sungai Utara
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Sheet Simulation */}
            <div className="my-6 overflow-y-auto max-h-[55vh] p-6 bg-white text-slate-950 rounded-2xl shadow-inner font-serif printable-area">
              
              {/* Kop Surat Resmi */}
              <div className="text-center border-b-2 border-black pb-3 mb-4">
                <h4 className="text-sm font-bold tracking-widest uppercase m-0">
                  PEMERINTAH KABUPATEN HULU SUNGAI UTARA
                </h4>
                <h2 className="text-lg font-black tracking-wide uppercase mt-1 mb-1">
                  BADAN PENGELOLA PAJAK DAN RETRIBUSI DAERAH
                </h2>
                <p className="text-[10px] font-sans text-slate-700 m-0">
                  Jl. Basuki Rahmat No. 01, Telp. (0511) 4781234, Amuntai - Kalimantan Selatan 71414
                </p>
                <p className="text-[9px] font-sans text-slate-600 m-0">
                  Email: bp2rd@hulusungaiutarakab.go.id &bull; Laman: bp2rd.hulusungaiutarakab.go.id
                </p>
              </div>

              {/* Judul Laporan */}
              <div className="text-center my-4 font-sans">
                <h3 className="text-sm font-bold underline uppercase tracking-wide">
                  {selectedReportType === 'retribusi'
                    ? 'REKAPITULASI HASIL INPUT POTENSI RETRIBUSI DAERAH'
                    : selectedReportType === 'potensi'
                    ? 'REKAPITULASI LAPORAN POTENSI PAJAK DAERAH'
                    : selectedReportType === 'pbb'
                    ? 'REKAPITULASI KETETAPAN & PEMBAYARAN PBB-P2'
                    : 'REKAPITULASI GABUNGAN POTENSI PAJAK DAERAH, RETRIBUSI DAERAH & PBB-P2'}
                </h3>
                <p className="text-[10px] text-slate-600 mt-1">
                  Wilayah: <strong>{filterKecamatan === 'all' ? 'Seluruh Kecamatan di Kab. HSU (10 Kecamatan)' : filterKecamatan}</strong> &bull; Per: {currentDateFormatted}
                </p>
              </div>

              {/* Rangkuman Angka */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 border border-black text-[10px] font-sans mb-4 bg-slate-50">
                {selectedReportType === 'retribusi' ? (
                  <>
                    <div>
                      <span className="text-slate-600 block">Total Potensi Retribusi:</span>
                      <strong className="text-xs text-amber-800">{formatRupiah(totalRetribusiRupiah)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-600 block">Jumlah Objek Terdata:</span>
                      <strong className="text-xs">{filteredRetribusi.length} Lokasi / Objek</strong>
                    </div>
                    <div>
                      <span className="text-slate-600 block">Status Validasi:</span>
                      <strong className="text-xs text-emerald-700">
                        {filteredRetribusi.filter(r => normalizeStatus(r.statusVerifikasi) === 'Setuju').length} Setuju &bull; {filteredRetribusi.filter(r => normalizeStatus(r.statusVerifikasi) === 'Verifikasi').length} Verifikasi
                      </strong>
                    </div>
                  </>
                ) : selectedReportType === 'potensi' ? (
                  <>
                    <div>
                      <span className="text-slate-600 block">Total Potensi Pajak:</span>
                      <strong className="text-xs text-emerald-800">{formatRupiah(totalPotensiRupiah)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-600 block">Jumlah Wajib Pajak:</span>
                      <strong className="text-xs">{filteredPotensi.length} Usaha Terdaftar</strong>
                    </div>
                    <div>
                      <span className="text-slate-600 block">Status Verifikasi:</span>
                      <strong className="text-xs text-blue-700">
                        {filteredPotensi.filter(p => normalizeStatus(p.statusVerifikasi) === 'Setuju').length} Disetujui
                      </strong>
                    </div>
                  </>
                ) : selectedReportType === 'pbb' ? (
                  <>
                    <div>
                      <span className="text-slate-600 block">Ketetapan PBB-P2:</span>
                      <strong className="text-xs">{formatRupiah(totalPbbTerhutang)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-600 block">Realisasi Lunas PBB:</span>
                      <strong className="text-xs text-blue-700">{formatRupiah(totalPbbLunas)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-600 block">Sisa Piutang PBB:</span>
                      <strong className="text-xs text-amber-700">{formatRupiah(totalPbbPiutang)}</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-slate-600 block">Potensi Pajak Daerah:</span>
                      <strong className="text-xs text-emerald-800">{formatRupiah(totalPotensiRupiah)} ({filteredPotensi.length})</strong>
                    </div>
                    <div>
                      <span className="text-slate-600 block">Potensi Retribusi Daerah:</span>
                      <strong className="text-xs text-amber-800">{formatRupiah(totalRetribusiRupiah)} ({filteredRetribusi.length})</strong>
                    </div>
                    <div>
                      <span className="text-slate-600 block">Ketetapan PBB-P2:</span>
                      <strong className="text-xs text-blue-800">{formatRupiah(totalPbbTerhutang)}</strong>
                    </div>
                  </>
                )}
              </div>

              {/* Table Data Preview & Print */}
              <div className="font-sans text-[10px] mb-6 space-y-4">
                
                {/* Tabel Retribusi Daerah */}
                {(selectedReportType === 'retribusi' || selectedReportType === 'gabungan') && (
                  <div>
                    {selectedReportType === 'gabungan' && (
                      <h5 className="font-bold uppercase text-[11px] mb-1.5 text-slate-800">
                        II. Rincian Hasil Input Potensi Retribusi Daerah ({filteredRetribusi.length} Data)
                      </h5>
                    )}
                    <table className="w-full border-collapse border border-black print-table text-[9px]">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-black p-1 text-center w-6">No</th>
                          <th className="border border-black p-1 text-left">No. Register</th>
                          <th className="border border-black p-1 text-left">Sub Objek &amp; Pengelola</th>
                          <th className="border border-black p-1 text-left">Golongan</th>
                          <th className="border border-black p-1 text-left">Kecamatan</th>
                          <th className="border border-black p-1 text-left font-bold">Kelurahan / Desa</th>
                          <th className="border border-black p-1 text-left">Alamat Lengkap</th>
                          <th className="border border-black p-1 text-right">Tarif &amp; Satuan</th>
                          <th className="border border-black p-1 text-right">Potensi Tahunan (Rp)</th>
                          <th className="border border-black p-1 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRetribusi.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="border border-black p-2 text-center text-slate-500 italic">
                              Tidak ada data retribusi daerah untuk wilayah ini.
                            </td>
                          </tr>
                        ) : (
                          filteredRetribusi.map((r, idx) => (
                            <tr key={r.id}>
                              <td className="border border-black p-1 text-center">{idx + 1}</td>
                              <td className="border border-black p-1 font-mono font-bold">{r.nomorRegister}</td>
                              <td className="border border-black p-1">
                                <strong>{r.subObjekRetribusi}</strong>
                                {r.namaPengelola && <div className="text-[8px] text-slate-600">PIC: {r.namaPengelola}</div>}
                              </td>
                              <td className="border border-black p-1">{r.golonganRetribusi}</td>
                              <td className="border border-black p-1">{r.kecamatan}</td>
                              <td className="border border-black p-1 font-semibold">{r.kelurahanDesa || '-'}</td>
                              <td className="border border-black p-1 text-slate-700">{r.alamatLengkap || '-'}</td>
                              <td className="border border-black p-1 text-right text-[8px]">
                                {formatRupiah(r.tarifSatuan)} / {r.satuanTarif} ({r.jumlahSatuan})
                              </td>
                              <td className="border border-black p-1 text-right font-bold">{formatRupiah(r.potensiPertahun)}</td>
                              <td className="border border-black p-1 text-center">{normalizeStatus(r.statusVerifikasi)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-100 font-bold">
                          <td colSpan={8} className="border border-black p-1 text-right">TOTAL POTENSI RETRIBUSI DAERAH:</td>
                          <td className="border border-black p-1 text-right">{formatRupiah(totalRetribusiRupiah)}</td>
                          <td className="border border-black p-1 text-center">{filteredRetribusi.length} Objek</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                {/* Tabel Potensi Pajak Daerah */}
                {(selectedReportType === 'potensi' || selectedReportType === 'gabungan') && (
                  <div>
                    {selectedReportType === 'gabungan' && (
                      <h5 className="font-bold uppercase text-[11px] mb-1.5 text-slate-800">
                        I. Rincian Objek Potensi Pajak Daerah ({filteredPotensi.length} Data)
                      </h5>
                    )}
                    <table className="w-full border-collapse border border-black print-table text-[9px]">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-black p-1 text-center w-6">No</th>
                          <th className="border border-black p-1 text-left">No. Formulir</th>
                          <th className="border border-black p-1 text-left">Wajib Pajak &amp; Usaha</th>
                          <th className="border border-black p-1 text-left">Jenis Pajak</th>
                          <th className="border border-black p-1 text-left">Kecamatan</th>
                          <th className="border border-black p-1 text-left font-bold">Kelurahan / Desa</th>
                          <th className="border border-black p-1 text-left">Alamat Lengkap</th>
                          <th className="border border-black p-1 text-right">Potensi Tahunan (Rp)</th>
                          <th className="border border-black p-1 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPotensi.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="border border-black p-2 text-center text-slate-500 italic">
                              Tidak ada data potensi pajak untuk wilayah ini.
                            </td>
                          </tr>
                        ) : (
                          filteredPotensi.map((p, idx) => (
                            <tr key={p.id}>
                              <td className="border border-black p-1 text-center">{idx + 1}</td>
                              <td className="border border-black p-1 font-mono">{p.nomorFormulir}</td>
                              <td className="border border-black p-1">
                                <strong>{p.namaWajibPajak}</strong> ({p.namaUsaha})
                              </td>
                              <td className="border border-black p-1">{p.jenisPajak}</td>
                              <td className="border border-black p-1">{p.kecamatan}</td>
                              <td className="border border-black p-1 font-semibold">{p.kelurahanDesa || '-'}</td>
                              <td className="border border-black p-1 text-slate-700">{p.alamatLengkap || '-'}</td>
                              <td className="border border-black p-1 text-right font-bold">{formatRupiah(p.potensiRupiahTahunan)}</td>
                              <td className="border border-black p-1 text-center">{normalizeStatus(p.statusVerifikasi)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-100 font-bold">
                          <td colSpan={7} className="border border-black p-1 text-right">TOTAL POTENSI PAJAK DAERAH:</td>
                          <td className="border border-black p-1 text-right">{formatRupiah(totalPotensiRupiah)}</td>
                          <td className="border border-black p-1 text-center">{filteredPotensi.length} Objek</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                {/* Tabel PBB-P2 */}
                {(selectedReportType === 'pbb' || selectedReportType === 'gabungan') && (
                  <div>
                    {selectedReportType === 'gabungan' && (
                      <h5 className="font-bold uppercase text-[11px] mb-1.5 text-slate-800">
                        III. Rincian Ketetapan &amp; Pembayaran PBB-P2 ({filteredPbb.length} Data)
                      </h5>
                    )}
                    <table className="w-full border-collapse border border-black print-table text-[9px]">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-black p-1 text-center w-6">No</th>
                          <th className="border border-black p-1 text-left">NOP (18 Digit)</th>
                          <th className="border border-black p-1 text-left">Nama Wajib Pajak</th>
                          <th className="border border-black p-1 text-left">Kecamatan</th>
                          <th className="border border-black p-1 text-left font-bold">Kelurahan / Desa</th>
                          <th className="border border-black p-1 text-left">Alamat Objek Pajak</th>
                          <th className="border border-black p-1 text-right">Ketetapan PBB (Rp)</th>
                          <th className="border border-black p-1 text-center">Status Bayar</th>
                          <th className="border border-black p-1 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPbb.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="border border-black p-2 text-center text-slate-500 italic">
                              Tidak ada data PBB-P2 untuk wilayah ini.
                            </td>
                          </tr>
                        ) : (
                          filteredPbb.map((p, idx) => (
                            <tr key={p.id}>
                              <td className="border border-black p-1 text-center">{idx + 1}</td>
                              <td className="border border-black p-1 font-mono">{p.nop}</td>
                              <td className="border border-black p-1 font-semibold">{p.namaWajibPajak}</td>
                              <td className="border border-black p-1">{p.kecamatan}</td>
                              <td className="border border-black p-1 font-semibold">{p.kelurahanDesa || '-'}</td>
                              <td className="border border-black p-1 text-slate-700">{p.alamatObjek || '-'}</td>
                              <td className="border border-black p-1 text-right font-bold">{formatRupiah(p.pbbTerhutang)}</td>
                              <td className="border border-black p-1 text-center font-bold">
                                {p.statusPembayaran === 'LUNAS' ? 'LUNAS' : 'TERTUNGGAK'}
                              </td>
                              <td className="border border-black p-1 text-center">{normalizeStatus(p.statusVerifikasi)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-100 font-bold">
                          <td colSpan={6} className="border border-black p-1 text-right">TOTAL KETETAPAN PBB-P2:</td>
                          <td className="border border-black p-1 text-right">{formatRupiah(totalPbbTerhutang)}</td>
                          <td colSpan={2} className="border border-black p-1 text-center">
                            Lunas: {formatRupiah(totalPbbLunas)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

              </div>

              {/* Kolom Tanda Tangan */}
              <div className="flex justify-between items-center text-[11px] font-sans pt-4 border-t border-slate-300">
                <div className="text-center w-48">
                  <p>Mengetahui,</p>
                  <p className="font-bold">Kabid Pendataan &amp; Penilaian</p>
                  <div className="h-14"></div>
                  <p className="font-bold underline">{currentUser?.name || 'Rija, S.STP, M.IP'}</p>
                  <p className="text-[9px] text-slate-600">NIP. {currentUser?.nip || '19880512 201001 1 003'}</p>
                </div>

                <div className="text-center w-48">
                  <p>Amuntai, {currentDateFormatted}</p>
                  <p className="font-bold">Petugas Surveyor Lapangan</p>
                  <div className="h-14"></div>
                  <p className="font-bold underline">( Petugas Lapangan )</p>
                  <p className="text-[9px] text-slate-600">Tim Surveyor Geospasial HSU</p>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Pilih format cetak langsung atau unduh berkas HTML siap pakai:
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  onClick={handleDownloadHtmlReport}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Unduh File HTML format Kop Surat Resmi"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Unduh File HTML Cetak</span>
                </button>

                <button
                  onClick={handleExecutePrint}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Sekarang (Print / PDF)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL VERIFIKASI GEOSPASIAL & LIHAT MAP */}
      {verifikasiMapModal && (
        <VerifikasiMapModal
          isOpen={true}
          onClose={() => setVerifikasiMapModal(null)}
          itemType={verifikasiMapModal.itemType}
          id={verifikasiMapModal.id}
          name={verifikasiMapModal.name}
          nomor={verifikasiMapModal.nomor}
          kecamatan={verifikasiMapModal.kecamatan}
          kelurahanDesa={verifikasiMapModal.kelurahanDesa}
          alamat={verifikasiMapModal.alamat}
          latitude={verifikasiMapModal.latitude}
          longitude={verifikasiMapModal.longitude}
          statusVerifikasi={verifikasiMapModal.statusVerifikasi}
          nilaiFiskalLabel={verifikasiMapModal.nilaiFiskalLabel}
          nilaiFiskalRp={verifikasiMapModal.nilaiFiskalRp}
          fotoUrl={verifikasiMapModal.fotoUrl}
          fotoName={verifikasiMapModal.fotoName}
          petugas={verifikasiMapModal.petugas}
          onUpdateStatus={(id, newStatus, note) => {
            if (verifikasiMapModal.itemType === 'potensi') {
              handleChangePotensiStatus(id, newStatus, note);
            } else if (verifikasiMapModal.itemType === 'pbb') {
              handleChangePbbStatus(id, newStatus, note);
            } else {
              handleChangeRetribusiStatus(id, newStatus, note);
            }
            setVerifikasiMapModal(prev => prev ? { ...prev, statusVerifikasi: newStatus } : null);
          }}
          onOpenFullMap={() => {
            if (onNavigateToMap) {
              onNavigateToMap({
                lat: verifikasiMapModal.latitude,
                lng: verifikasiMapModal.longitude,
                title: verifikasiMapModal.name,
                type: verifikasiMapModal.itemType,
              });
            }
          }}
        />
      )}

    </div>
  );
};
