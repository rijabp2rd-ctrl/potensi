export const KODE_GS_TEMPLATE = `/**
 * ============================================================================
 * KODE.GS - BACKEND DATABASE GOOGLE SPREADSHEET (GOOGLE APPS SCRIPT)
 * Sistem Informasi Potensi Pajak & Retribusi Daerah (SIPOTENSI)
 * BP2RD Kabupaten Hulu Sungai Utara (HSU)
 * ============================================================================
 *
 * CARA PENGGUNAAN & DEPLOYMENT:
 * 1. Buka Google Spreadsheet baru atau yang sudah ada di Google Drive Anda.
 * 2. Klik menu: Ekstensi (Extensions) -> Apps Script.
 * 3. Hapus seluruh kode bawaan di file "Kode.gs" (atau "Code.gs"), lalu tempelkan
 *    (Paste) seluruh kode di bawah ini dan tekan Ctrl+S (Simpan).
 * 4. (Opsional) Pilih fungsi "setupDatabaseSheets" di toolbar atas lalu klik "Jalankan" (Run)
 *    untuk membuat otomatis seluruh Sheet & Header Tabel untuk pertama kali.
 * 5. Klik tombol "Terapkan" (Deploy) di kanan atas -> "Deployment baru" (New deployment).
 * 6. Pilih jenis: "Aplikasi Web" (Web app):
 *    - Deskripsi       : API Database SIPOTENSI BP2RD HSU
 *    - Jalankan sebagai: Saya (Me)
 *    - Siapa yang memiliki akses: Siapa saja (Anyone)
 * 7. Klik "Terapkan" (Deploy), berikan izin akses (Authorize access), lalu salin
 *    URL Aplikasi Web (berakhiran /exec) ke menu Koneksi Google Spreadsheet di aplikasi.
 * ============================================================================
 */

const SHEET_NAMES = {
  SUMMARY: 'Ringkasan_PAD_HSU',
  POTENSI: 'Data_Potensi_Pajak',
  RETRIBUSI: 'Data_Retribusi_Daerah',
  PBB: 'Data_PBB_P2',
  IKM: 'Data_Survei_IKM',
  LIBRARY: 'Data_Library_Berkas'
};

/**
 * 1. Inisialisasi & Format Otomatis Seluruh Sheet Database
 */
function setupDatabaseSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  ensureSheetWithHeaders(ss, SHEET_NAMES.SUMMARY, [
    'No',
    'Sektor Pendapatan Asli Daerah (PAD)',
    'Jumlah Rekaman Data',
    'Total Nilai Fiskal / Potensi Tahunan (Rp)',
    'Keterangan'
  ], '#065f46');

  ensureSheetWithHeaders(ss, SHEET_NAMES.POTENSI, [
    'No',
    'ID Sistem',
    'Nomor Formulir',
    'Tanggal Pendataan',
    'Nama Objek / Usaha',
    'Nama Wajib Pajak',
    'NPWPD',
    'Jenis Pajak',
    'Kecamatan',
    'Kelurahan / Desa',
    'Alamat Lengkap',
    'Koordinat GPS Lat',
    'Koordinat GPS Long',
    'Potensi Bulanan (Rp)',
    'Potensi Tahunan (Rp)',
    'Status Verifikasi',
    'Petugas Pendata',
    'Diverifikasi Oleh',
    'Catatan Petugas',
    'Waktu Update'
  ], '#047857');

  ensureSheetWithHeaders(ss, SHEET_NAMES.RETRIBUSI, [
    'No',
    'ID Sistem',
    'Nomor Register',
    'Tanggal Pendataan',
    'Golongan Retribusi',
    'Sub Rekening',
    'Sub Objek Retribusi',
    'Nama Pengelola / PIC',
    'No. Kontrak / SK',
    'Tarif Satuan Dasar (Rp)',
    'Satuan Tarif',
    'Jumlah Satuan / Objek',
    'Potensi Perbulan (Rp)',
    'Potensi Pertahun (Rp)',
    'Kecamatan',
    'Kelurahan / Desa',
    'Alamat Lengkap',
    'Koordinat GPS Lat',
    'Koordinat GPS Long',
    'Status Verifikasi',
    'Petugas Pendata',
    'Diverifikasi Oleh',
    'Keterangan Objek',
    'Waktu Update'
  ], '#b45309');

  ensureSheetWithHeaders(ss, SHEET_NAMES.PBB, [
    'No',
    'ID Sistem',
    'Nomor NOP',
    'Status NOP',
    'Tahun Pajak',
    'Nama Wajib Pajak',
    'NIK Wajib Pajak',
    'Kecamatan',
    'Kelurahan / Desa',
    'Alamat Objek PBB',
    'Luas Bumi (m2)',
    'NJOP Bumi / m2 (Rp)',
    'Total NJOP Bumi (Rp)',
    'Luas Bangunan (m2)',
    'NJOP Bangunan / m2 (Rp)',
    'Total NJOP Bangunan (Rp)',
    'NJOP Total (Rp)',
    'NJOPTKP (Rp)',
    'NJOP Kena Pajak (Rp)',
    'Tarif PBB (%)',
    'Stimulus / Pengurangan (Rp)',
    'Denda Administrasi (Rp)',
    'PBB Terhutang / Harus Dibayar (Rp)',
    'Status Pembayaran',
    'Status Verifikasi',
    'Petugas Validasi',
    'Waktu Update'
  ], '#1d4ed8');

  ensureSheetWithHeaders(ss, SHEET_NAMES.IKM, [
    'No',
    'ID Sistem',
    'Nomor Responden',
    'Tanggal Survei',
    'Nama Responden',
    'Nomor Kontak',
    'Alamat Responden',
    'Jenis Layanan / Kegiatan',
    'U1 - Prosedur',
    'U2 - Kecepatan',
    'U3 - Keramahan',
    'U4 - Sarana & Sistem',
    'U5 - Kepuasan Hasil',
    'Total Nilai IKM',
    'Predikat Mutu',
    'Saran & Masukan',
    'Petugas Pencatat'
  ], '#6d28d9');

  ensureSheetWithHeaders(ss, SHEET_NAMES.LIBRARY, [
    'No',
    'ID Berkas',
    'Nomor Berkas',
    'Judul Dokumen',
    'Kategori',
    'Nama File',
    'Ukuran',
    'Tipe File',
    'Akses Publik',
    'Diupload Oleh',
    'Tanggal Upload',
    'Status Verifikasi',
    'Deskripsi'
  ], '#334155');

  return {
    status: 'success',
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    title: ss.getName()
  };
}

/**
 * Helper membuat Sheet & mengatur tampilan baris Header
 */
function ensureSheetWithHeaders(ss, sheetName, headers, headerColor) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    formatHeaderRange(sheet, headers.length, headerColor);
  }
  return sheet;
}

function formatHeaderRange(sheet, colCount, bgColor) {
  const headerRange = sheet.getRange(1, 1, 1, colCount);
  headerRange
    .setBackground(bgColor || '#047857')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setFrozenRows(1);
}

/**
 * 2. Endpoint HTTP GET (Membaca Status & Seluruh Data dari Spreadsheet)
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'status';

    if (action === 'setup') {
      const info = setupDatabaseSheets();
      return jsonResponse(info);
    }

    if (action === 'readAll') {
      setupDatabaseSheets();
      return jsonResponse({
        status: 'success',
        spreadsheetId: ss.getId(),
        spreadsheetUrl: ss.getUrl(),
        title: ss.getName(),
        timestamp: new Date().toISOString(),
        data: {
          potensi: readSheetObjects(ss.getSheetByName(SHEET_NAMES.POTENSI)),
          retribusi: readSheetObjects(ss.getSheetByName(SHEET_NAMES.RETRIBUSI)),
          pbb: readSheetObjects(ss.getSheetByName(SHEET_NAMES.PBB)),
          ikm: readSheetObjects(ss.getSheetByName(SHEET_NAMES.IKM)),
          library: readSheetObjects(ss.getSheetByName(SHEET_NAMES.LIBRARY))
        }
      });
    }

    return jsonResponse({
      status: 'success',
      message: 'Web App Google Apps Script SIPOTENSI BP2RD HSU Aktif.',
      spreadsheetId: ss.getId(),
      spreadsheetUrl: ss.getUrl(),
      title: ss.getName(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return jsonResponse({
      status: 'error',
      message: err.toString()
    });
  }
}

/**
 * 3. Endpoint HTTP POST (Menyimpan / Sinkronisasi Database ke Spreadsheet)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    setupDatabaseSheets();

    const rawBody = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    const payload = JSON.parse(rawBody);
    const action = payload.action || 'syncAll';

    // A. Sinkronisasi Penuh Seluruh Database (syncAll)
    if (action === 'syncAll') {
      const potensiList = Array.isArray(payload.potensi) ? payload.potensi : [];
      const retribusiList = Array.isArray(payload.retribusi) ? payload.retribusi : [];
      const pbbList = Array.isArray(payload.pbb) ? payload.pbb : [];
      const ikmList = Array.isArray(payload.ikm) ? payload.ikm : [];
      const libraryList = Array.isArray(payload.library) ? payload.library : [];

      writePotensiSheet(ss, potensiList);
      writeRetribusiSheet(ss, retribusiList);
      writePbbSheet(ss, pbbList);
      if (ikmList.length > 0) writeIkmSheet(ss, ikmList);
      if (libraryList.length > 0) writeLibrarySheet(ss, libraryList);
      writeSummarySheet(ss, potensiList, retribusiList, pbbList, ikmList);

      SpreadsheetApp.flush();

      return jsonResponse({
        status: 'success',
        action: 'syncAll',
        spreadsheetId: ss.getId(),
        spreadsheetUrl: ss.getUrl(),
        title: ss.getName(),
        syncedCounts: {
          potensi: potensiList.length,
          retribusi: retribusiList.length,
          pbb: pbbList.length,
          ikm: ikmList.length,
          library: libraryList.length
        },
        timestamp: new Date().toISOString()
      });
    }

    // B. Hapus 1 Baris Berdasarkan ID Sistem (deleteRecord)
    if (action === 'deleteRecord') {
      const sheetName = payload.sheetName;
      const recordId = String(payload.id || '');
      const deleted = deleteRowById(ss, sheetName, recordId);
      return jsonResponse({
        status: 'success',
        action: 'deleteRecord',
        deleted: deleted,
        id: recordId,
        timestamp: new Date().toISOString()
      });
    }

    return jsonResponse({
      status: 'error',
      message: 'Action tidak dikenali: ' + action
    });
  } catch (err) {
    return jsonResponse({
      status: 'error',
      message: err.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Penulisan Sheet 1: Data_Potensi_Pajak
 */
function writePotensiSheet(ss, list) {
  const headers = [
    'No',
    'ID Sistem',
    'Nomor Formulir',
    'Tanggal Pendataan',
    'Nama Objek / Usaha',
    'Nama Wajib Pajak',
    'NPWPD',
    'Jenis Pajak',
    'Kecamatan',
    'Kelurahan / Desa',
    'Alamat Lengkap',
    'Koordinat GPS Lat',
    'Koordinat GPS Long',
    'Potensi Bulanan (Rp)',
    'Potensi Tahunan (Rp)',
    'Status Verifikasi',
    'Petugas Pendata',
    'Diverifikasi Oleh',
    'Catatan Petugas',
    'Waktu Update'
  ];

  const rows = list.map(function(p, idx) {
    return [
      idx + 1,
      p.id || '',
      p.nomorFormulir || p.id || '',
      p.tanggalPendataan || '',
      p.namaUsaha || '',
      p.namaWajibPajak || '',
      p.npwpd ? "'" + p.npwpd : '-',
      p.jenisPajak || '',
      p.kecamatan || '',
      p.kelurahanDesa || '',
      p.alamatLengkap || '',
      p.latitude !== undefined ? p.latitude : '',
      p.longitude !== undefined ? p.longitude : '',
      Number(p.potensiRupiahBulanan || 0),
      Number(p.potensiRupiahTahunan || 0),
      p.statusVerifikasi || 'Menunggu Verifikasi',
      p.petugasPendata || '',
      p.verifiedBy || '-',
      p.catatanPetugas || '',
      p.updatedAt || p.createdAt || new Date().toISOString()
    ];
  });

  overwriteSheetData(ss, SHEET_NAMES.POTENSI, headers, rows, '#047857');
}

/**
 * Penulisan Sheet 2: Data_Retribusi_Daerah
 */
function writeRetribusiSheet(ss, list) {
  const headers = [
    'No',
    'ID Sistem',
    'Nomor Register',
    'Tanggal Pendataan',
    'Golongan Retribusi',
    'Sub Rekening',
    'Sub Objek Retribusi',
    'Nama Pengelola / PIC',
    'No. Kontrak / SK',
    'Tarif Satuan Dasar (Rp)',
    'Satuan Tarif',
    'Jumlah Satuan / Objek',
    'Potensi Perbulan (Rp)',
    'Potensi Pertahun (Rp)',
    'Kecamatan',
    'Kelurahan / Desa',
    'Alamat Lengkap',
    'Koordinat GPS Lat',
    'Koordinat GPS Long',
    'Status Verifikasi',
    'Petugas Pendata',
    'Diverifikasi Oleh',
    'Keterangan Objek',
    'Waktu Update'
  ];

  const rows = list.map(function(r, idx) {
    return [
      idx + 1,
      r.id || '',
      r.nomorRegister || r.id || '',
      r.tanggalPendataan || '',
      r.golonganRetribusi || '',
      r.subRekening || '',
      r.subObjekRetribusi || '',
      r.namaPengelola || '-',
      r.nomorKontrakOrSK ? "'" + r.nomorKontrakOrSK : '-',
      Number(r.tarifSatuan || 0),
      r.satuanTarif || 'Per Unit',
      Number(r.jumlahSatuan || 1),
      Number(r.potensiPerbulan || 0),
      Number(r.potensiPertahun || 0),
      r.kecamatan || '',
      r.kelurahanDesa || '',
      r.alamatLengkap || '',
      r.latitude !== undefined ? r.latitude : '',
      r.longitude !== undefined ? r.longitude : '',
      r.statusVerifikasi || 'Menunggu Verifikasi',
      r.petugasPendata || '',
      r.verifiedBy || '-',
      r.keterangan || '',
      r.updatedAt || r.createdAt || new Date().toISOString()
    ];
  });

  overwriteSheetData(ss, SHEET_NAMES.RETRIBUSI, headers, rows, '#b45309');
}

/**
 * Penulisan Sheet 3: Data_PBB_P2 (Termasuk NJOP Bumi/m2 & NJOP Bangunan/m2 Sesuai Inputan)
 */
function writePbbSheet(ss, list) {
  const headers = [
    'No',
    'ID Sistem',
    'Nomor NOP',
    'Status NOP',
    'Tahun Pajak',
    'Nama Wajib Pajak',
    'NIK Wajib Pajak',
    'Kecamatan',
    'Kelurahan / Desa',
    'Alamat Objek PBB',
    'Luas Bumi (m2)',
    'NJOP Bumi / m2 (Rp)',
    'Total NJOP Bumi (Rp)',
    'Luas Bangunan (m2)',
    'NJOP Bangunan / m2 (Rp)',
    'Total NJOP Bangunan (Rp)',
    'NJOP Total (Rp)',
    'NJOPTKP (Rp)',
    'NJOP Kena Pajak (Rp)',
    'Tarif PBB (%)',
    'Stimulus / Pengurangan (Rp)',
    'Denda Administrasi (Rp)',
    'PBB Terhutang / Harus Dibayar (Rp)',
    'Status Pembayaran',
    'Status Verifikasi',
    'Petugas Validasi',
    'Waktu Update'
  ];

  const rows = list.map(function(p, idx) {
    const luasBumi = Number(p.luasBumiM2 || 0);
    const njopBumiM2 = Number(p.njopBumiPerM2 || 0);
    const totalBumi = p.totalNjopBumi !== undefined ? Number(p.totalNjopBumi) : (luasBumi * njopBumiM2);

    const luasBng = Number(p.luasBangunanM2 || 0);
    const njopBngM2 = Number(p.njopBangunanPerM2 || 0);
    const totalBng = p.totalNjopBangunan !== undefined ? Number(p.totalNjopBangunan) : (luasBng * njopBngM2);

    const njopTotal = p.njopTotal !== undefined ? Number(p.njopTotal) : (totalBumi + totalBng);
    const njoptkp = p.njoptkp !== undefined ? Number(p.njoptkp) : 10000000;
    const njopkp = p.njopKenaPajak !== undefined ? Number(p.njopKenaPajak) : Math.max(0, njopTotal - njoptkp);

    return [
      idx + 1,
      p.id || '',
      p.nop ? "'" + p.nop : 'TIDAK ADA NOP',
      p.statusNop || 'ada',
      Number(p.tahunPajak || 2026),
      p.namaWajibPajak || '',
      p.nikWajibPajak ? "'" + p.nikWajibPajak : '-',
      p.kecamatan || '',
      p.kelurahanDesa || '',
      p.alamatObjek || '',
      luasBumi,
      njopBumiM2,
      totalBumi,
      luasBng,
      njopBngM2,
      totalBng,
      njopTotal,
      njoptkp,
      njopkp,
      Number(p.tarifPbbPersen || 0.15),
      Number(p.stimulusPengurangan || 0),
      Number(p.dendaAdministrasi || 0),
      Number(p.totalPbbHarusDibayar || p.pbbTerhutang || 0),
      p.statusPembayaran || 'BELUM LUNAS',
      p.statusVerifikasi || 'Menunggu Verifikasi',
      p.petugasValidasi || '',
      p.updatedAt || p.createdAt || new Date().toISOString()
    ];
  });

  overwriteSheetData(ss, SHEET_NAMES.PBB, headers, rows, '#1d4ed8');
}

/**
 * Penulisan Sheet 4: Data_Survei_IKM
 */
function writeIkmSheet(ss, list) {
  const headers = [
    'No',
    'ID Sistem',
    'Nomor Responden',
    'Tanggal Survei',
    'Nama Responden',
    'Nomor Kontak',
    'Alamat Responden',
    'Jenis Layanan / Kegiatan',
    'U1 - Prosedur',
    'U2 - Kecepatan',
    'U3 - Keramahan',
    'U4 - Sarana & Sistem',
    'U5 - Kepuasan Hasil',
    'Total Nilai IKM',
    'Predikat Mutu',
    'Saran & Masukan',
    'Petugas Pencatat'
  ];

  const rows = list.map(function(item, idx) {
    return [
      idx + 1,
      item.id || '',
      item.nomorResponden || '',
      item.tanggalSurvey || '',
      item.nama || '',
      item.nomorKontak ? "'" + item.nomorKontak : '-',
      item.alamat || '',
      item.kegiatan || '',
      Number(item.pernyataan1 || 20),
      Number(item.pernyataan2 || 20),
      Number(item.pernyataan3 || 20),
      Number(item.pernyataan4 || 20),
      Number(item.pernyataan5 || 20),
      Number(item.totalNilai || 100),
      item.predikat || 'Sangat Baik',
      item.saranMasukan || '',
      item.petugasPencatat || ''
    ];
  });

  overwriteSheetData(ss, SHEET_NAMES.IKM, headers, rows, '#6d28d9');
}

/**
 * Penulisan Sheet 5: Data_Library_Berkas
 */
function writeLibrarySheet(ss, list) {
  const headers = [
    'No',
    'ID Berkas',
    'Nomor Berkas',
    'Judul Dokumen',
    'Kategori',
    'Nama File',
    'Ukuran',
    'Tipe File',
    'Akses Publik',
    'Diupload Oleh',
    'Tanggal Upload',
    'Status Verifikasi',
    'Deskripsi'
  ];

  const rows = list.map(function(doc, idx) {
    return [
      idx + 1,
      doc.id || '',
      doc.nomorBerkas || '',
      doc.title || '',
      doc.categoryLabel || doc.category || '',
      doc.fileName || '',
      doc.fileSize || '-',
      doc.fileType || 'pdf',
      doc.isPublic ? 'Publik' : 'Internal',
      doc.uploadedBy || '',
      doc.tanggalUpload || '',
      doc.statusVerifikasi || 'Aktif',
      doc.description || ''
    ];
  });

  overwriteSheetData(ss, SHEET_NAMES.LIBRARY, headers, rows, '#334155');
}

/**
 * Penulisan Sheet Ringkasan Eksekutif PAD HSU
 */
function writeSummarySheet(ss, potensiList, retribusiList, pbbList, ikmList) {
  const sheet = ensureSheetWithHeaders(ss, SHEET_NAMES.SUMMARY, ['Ringkasan'], '#065f46');
  sheet.clearContents();

  const totalPotensiTahunan = potensiList.reduce(function(acc, cur) {
    return acc + Number(cur.potensiRupiahTahunan || 0);
  }, 0);
  const totalRetribusiTahunan = retribusiList.reduce(function(acc, cur) {
    return acc + Number(cur.potensiPertahun || 0);
  }, 0);
  const totalPbbTerhutang = pbbList.reduce(function(acc, cur) {
    return acc + Number(cur.totalPbbHarusDibayar || cur.pbbTerhutang || 0);
  }, 0);
  const grandTotal = totalPotensiTahunan + totalRetribusiTahunan + totalPbbTerhutang;

  const summaryRows = [
    ['SIPOTENSI BP2RD KABUPATEN HULU SUNGAI UTARA', '', '', '', ''],
    ['REKAPITULASI SINKRONISASI DATABASE PAD VIA GOOGLE APPS SCRIPT', '', '', '', ''],
    ['Waktu Sinkronisasi Terakhir', Utilities.formatDate(new Date(), 'Asia/Makassar', 'dd-MM-yyyy HH:mm:ss') + ' WITA', '', '', ''],
    ['', '', '', '', ''],
    ['No', 'Sektor Pendapatan Asli Daerah (PAD)', 'Jumlah Rekaman Data', 'Total Nilai Fiskal / Potensi Tahunan (Rp)', 'Keterangan'],
    [1, 'Potensi Pajak Daerah (10 Jenis Pajak)', potensiList.length, totalPotensiTahunan, 'PBJT Restoran, Hotel, Parkir, Reklame, MBLB, dsb.'],
    [2, 'Retribusi Daerah (UU HKPD & Perda HSU No. 01/2024)', retribusiList.length, totalRetribusiTahunan, 'Jasa Umum, Jasa Usaha & Perizinan Tertentu'],
    [3, 'Pajak Bumi dan Bangunan (PBB-P2)', pbbList.length, totalPbbTerhutang, 'Ketetapan Nilai PBB Terhutang & Objek Baru'],
    [4, 'Survei Indeks Kepuasan Masyarakat (IKM)', (ikmList || []).length, '-', 'Responden Layanan Publik BP2RD HSU'],
    ['', '', '', '', ''],
    ['', 'TOTAL ESTIMASI POTENSI KESELURUHAN', potensiList.length + retribusiList.length + pbbList.length, grandTotal, 'Kabupaten Hulu Sungai Utara']
  ];

  sheet.getRange(1, 1, summaryRows.length, 5).setValues(summaryRows);
  sheet.getRange(5, 1, 1, 5)
    .setBackground('#065f46')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  sheet.getRange(11, 1, 1, 5)
    .setBackground('#ecfdf5')
    .setFontWeight('bold');
}

/**
 * Helper Menimpa Isi Sheet dengan Header & Baris Data Terbaru
 */
function overwriteSheetData(ss, sheetName, headers, rows, headerColor) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  sheet.clearContents();

  const allValues = [headers].concat(rows);
  sheet.getRange(1, 1, allValues.length, headers.length).setValues(allValues);
  formatHeaderRange(sheet, headers.length, headerColor);
}

/**
 * Helper Menghapus Baris Berdasarkan ID Sistem pada Kolom ke-2
 */
function deleteRowById(ss, sheetName, recordId) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || !recordId) return false;
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  const data = sheet.getRange(2, 2, lastRow - 1, 2).getValues();
  for (let i = data.length - 1; i >= 0; i--) {
    if (String(data[i][0]) === recordId || String(data[i][1]) === recordId) {
      sheet.deleteRow(i + 2);
      return true;
    }
  }
  return false;
}

/**
 * Helper Membaca Sheet Menjadi Array of Objects
 */
function readSheetObjects(sheet) {
  if (!sheet || sheet.getLastRow() <= 1) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const results = [];

  for (let r = 1; r < values.length; r++) {
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = values[r][c];
    }
    results.push(obj);
  }
  return results;
}

/**
 * Helper Output JSON
 */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
