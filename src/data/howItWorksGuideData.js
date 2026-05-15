// src/data/howItWorksGuideData.js
// ─── Content data for the How It Works guide ─────────────────────────────────

export const buyerSteps = [
  {
    num: 1,
    title: 'Browse Marketplace',
    loginRequired: false,
    desc: 'User bisa langsung lihat semua listing tanpa daftar.',
    tips: [
      'Filter by city untuk hemat ongkos kirim',
      'Filter Material Type untuk kategori utama (Structural, Finishing, Architectural, MEP)',
      'Sort "Highest Volume" untuk listing kuantitas besar',
    ],
  },
  {
    num: 2,
    title: 'Lihat Detail Listing',
    loginRequired: false,
    desc: 'Klik listing untuk lihat foto, kondisi, estimasi berat, harga per unit, total harga, estimasi CO₂ saved.',
    tips: [
      'CO₂ saved dihitung dari EPA WARM emission factor (angka nyata)',
      'Cek ikon "Delivery Available" — tidak semua seller kirim',
    ],
  },
  {
    num: 3,
    title: 'Daftar & Verifikasi Email',
    loginRequired: true,
    desc: 'Untuk transaksi perlu akun: isi email, buat password, klik link verifikasi.',
    notes: 'Sudah punya akun? Langsung login, skip ke step berikutnya.',
  },
  {
    num: 4,
    title: 'Chat dengan Seller',
    loginRequired: true,
    desc: 'Dari detail listing, klik "Chat with Seller" untuk chat langsung di platform.',
    tips: [
      'Cek rating seller sebelum chat',
      'Minta foto tambahan jika kondisi kurang jelas',
    ],
  },
  {
    num: 5,
    title: 'Buat Order & Bayar',
    loginRequired: true,
    desc: 'Setelah sepakat, buat order via platform, tunggu konfirmasi seller, lalu lanjut pembayaran.',
    tips: [
      'Bayar via platform (lebih aman, ada rekam jejak)',
      'Riwayat order ada di dashboard "My Orders"',
    ],
  },
]

export const sellerSteps = [
  {
    num: 1,
    title: 'Daftar sebagai Seller',
    loginRequired: true,
    desc: 'Daftar dan pilih role "Seller" atau "Both" (bisa jual sekaligus beli).',
    notes: 'Sudah punya akun Buyer? Upgrade role ke "Both" di profile settings.',
  },
  {
    num: 2,
    title: 'Submit Listing Material',
    loginRequired: true,
    desc: 'Klik "Submit Listing" di dashboard/navbar.',
    tips: [
      'Judul & Deskripsi — jujur soal kondisi',
      'Kategori & sub-kategori — pilih yang spesifik',
      'Kuantitas + unit + estimasi berat kg (untuk kalkulasi CO₂ otomatis)',
      'Harga per unit',
      'Kota',
      'Foto (minimal 1, lebih banyak lebih baik)',
    ],
  },
  {
    num: 3,
    title: 'Listing Muncul di Marketplace',
    loginRequired: false,
    badgeLabel: 'OTOMATIS',
    desc: 'Setelah submit langsung status "Available", tidak ada review manual.',
    tips: [
      'CO₂ saved dikalkulasi otomatis: berat × emission factor kategori',
      'View count bisa dipantau dari "My Listings"',
    ],
  },
  {
    num: 4,
    title: 'Tanggapi Chat dari Buyer',
    loginRequired: true,
    desc: 'Buyer akan chat via platform, balas cepat untuk meningkatkan rating.',
    tips: [
      'Aktifkan notifikasi',
      'Listing bisa diedit kapan saja (update kuantitas/harga)',
    ],
  },
  {
    num: 5,
    title: 'Konfirmasi Order & Selesaikan Transaksi',
    loginRequired: true,
    desc: 'Buyer buat order → kamu dapat notifikasi untuk konfirmasi.',
    tips: [
      'Setelah terjual, tandai listing "Sold Out" dari dashboard',
      'Update status segera setelah terjual',
      'Rating naik tiap transaksi sukses',
    ],
  },
]

export const faqItems = [
  {
    question: 'Apakah saya harus daftar untuk bisa lihat listing?',
    answer:
      'Tidak. Browse dan lihat detail listing bisa tanpa login. Login hanya untuk chat seller atau transaksi.',
  },
  {
    question: 'Apa perbedaan kondisi "New/Surplus", "Pre-loved", dan "Needs Repair"?',
    answer:
      'New/Surplus = material baru tidak terpakai dari proyek, kondisi prima. Pre-loved = bekas tapi masih layak pakai dan kondisi baik. Needs Repair = masih bisa digunakan tapi perlu perbaikan/perawatan dulu.',
  },
  {
    question: 'Bagaimana cara kerja estimasi CO₂ yang dihemat?',
    answer:
      'Setiap kategori material punya emission factor dari data EPA WARM. Estimasi = berat (kg) × emission factor = CO₂ eq yang dihemat jika material dipakai ulang vs diproduksi baru.',
  },
  {
    question: 'Apakah harga bisa dinegosiasikan?',
    answer:
      'Ya. Harga di listing adalah penawaran awal seller. Buyer bisa diskusikan harga via chat sebelum buat order.',
  },
  {
    question: 'Apakah seller menyediakan pengiriman?',
    answer:
      'Tidak semua. Cek indikator "Delivery Available" di detail listing. Kalau tidak tersedia, buyer perlu ambil sendiri atau atur pengiriman mandiri.',
  },
  {
    question: 'Berapa lama listing aktif?',
    answer:
      'Tanpa batas waktu, sampai seller mengubah status ke "Sold Out" atau menghapus dari "My Listings".',
  },
  {
    question: 'Bisakah satu akun untuk jual dan beli sekaligus?',
    answer:
      'Ya. Pilih role "Both" saat daftar, atau upgrade di profile settings.',
  },
]

// Condensed steps for the landing page section (shown to non-logged-in users only)
export const landingPreviewSteps = [
  {
    num: '01',
    title: 'Browse & Temukan Material',
    desc: 'Jelajahi marketplace tanpa perlu login. Filter by kota, kategori, dan volume.',
    iconKey: 'search',
  },
  {
    num: '02',
    title: 'Daftar & Chat Seller',
    desc: 'Buat akun gratis, lalu chat langsung dengan seller untuk negosiasi harga.',
    iconKey: 'chat',
  },
  {
    num: '03',
    title: 'Order & Transaksi',
    desc: 'Buat order via platform, bayar aman, dan pantau riwayat di dashboard.',
    iconKey: 'order',
  },
  {
    num: '04',
    title: 'Jual Material Sisa',
    desc: 'Punya sisa material? Submit listing dan langsung tampil di marketplace.',
    iconKey: 'sell',
  },
]
