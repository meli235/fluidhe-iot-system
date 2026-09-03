import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Canvas untuk menambahkan nomor halaman otomatis 'Halaman X dari Y' dan header/footer formal"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        # Skip header/footer on cover page (Page 1)
        if self._pageNumber == 1:
            return

        self.saveState()
        
        # Header
        self.setStrokeColor(colors.HexColor('#CBD5E1'))
        self.setLineWidth(0.75)
        self.line(2 * cm, 28 * cm, 19 * cm, 28 * cm)
        
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor('#0F172A'))
        self.drawString(2 * cm, 28.2 * cm, "MANUAL BOOK · FLUIDHE SCADA IOT SYSTEM")
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor('#64748B'))
        self.drawRightString(19 * cm, 28.2 * cm, "Teknik Kimia · Universitas Ahmad Dahlan")

        # Footer
        self.line(2 * cm, 1.8 * cm, 19 * cm, 1.8 * cm)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor('#64748B'))
        self.drawString(2 * cm, 1.3 * cm, "PT Anugrah Tripple Cycle © 2026 · Hak Cipta Dilindungi")
        
        page_str = f"Halaman {self._pageNumber} dari {page_count}"
        self.drawRightString(19 * cm, 1.3 * cm, page_str)
        
        self.restoreState()


def create_manual_book(output_pdf_path):
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2.5 * cm
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor('#0B2545')
    secondary_color = colors.HexColor('#0284C7')
    dark_text = colors.HexColor('#1E293B')
    muted_text = colors.HexColor('#475569')

    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=primary_color,
        alignment=1, # Center
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=18,
        textColor=secondary_color,
        alignment=1,
        spaceAfter=25
    )

    meta_cover_style = ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        textColor=muted_text,
        alignment=1
    )

    h1_style = ParagraphStyle(
        'Heading1Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=20,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=secondary_color,
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Heading3Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=dark_text,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=dark_text,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=dark_text,
        leftIndent=15,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F172A')
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white,
        alignment=1
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=dark_text
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=dark_text
    )

    story = []

    # ═════════════════════════════════════════════════════════════════════════
    # HALAMAN COVER
    # ═════════════════════════════════════════════════════════════════════════
    story.append(Spacer(1, 2.5 * cm))
    
    # Decorative Top Bar
    top_badge = Table(
        [[Paragraph("<b>BUKU PANDUAN PENGOPERASIAN RESMI (MANUAL BOOK)</b>", ParagraphStyle('Bdg', fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor('#0284C7'), alignment=1))]],
        colWidths=[17 * cm]
    )
    top_badge.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#E0F2FE')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#BAE6FD')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    story.append(top_badge)
    story.append(Spacer(1, 1.2 * cm))

    story.append(Paragraph("SISTEM SCADA & KENDALI IOT<br/>HEAT EXCHANGER RIG", title_style))
    story.append(Paragraph("Platform Digital Monitoring Telemetri Real-Time & Praktikum Termodinamika", subtitle_style))
    story.append(HRFlowable(width="60%", thickness=2, color=secondary_color, spaceAfter=25, spaceBefore=5))

    # Cover Metadata Box
    meta_data = [
        [Paragraph("<b>Nama Sistem:</b>", table_cell_bold), Paragraph("FluidHE Dashboard v2.5 (Industrial SCADA)", table_cell_style)],
        [Paragraph("<b>Instansi / Lokasi:</b>", table_cell_bold), Paragraph("Laboratorium Teknik Kimia, Universitas Ahmad Dahlan (Kampus IV)", table_cell_style)],
        [Paragraph("<b>Pengembang / Vendor:</b>", table_cell_bold), Paragraph("PT Anugrah Tripple Cycle (IoT & Industrial Automation Provider)", table_cell_style)],
        [Paragraph("<b>Sasaran Pengguna:</b>", table_cell_bold), Paragraph("Dosen Pengampu, Pranata Lab (Admin), & Mahasiswa Praktikan (Operator)", table_cell_style)],
        [Paragraph("<b>Edisi / Tahun:</b>", table_cell_bold), Paragraph("Edisi Revisi 2026 · Standar Operasional Lab", table_cell_style)]
    ]
    meta_table = Table(meta_data, colWidths=[4.5 * cm, 11.5 * cm])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 3.5 * cm))
    story.append(Paragraph("<b>YOGYAKARTA, INDONESIA</b><br/>2026", meta_cover_style))
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # DAFTAR ISI & RINGKASAN
    # ═════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("DAFTAR ISI", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceAfter=12, spaceBefore=4))

    toc_data = [
        [Paragraph("<b>BAB I: PENDAHULUAN & ARSITEKTUR SISTEM</b>", table_cell_bold), Paragraph("Halaman 3", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;1.1 Latar Belakang & Tujuan Praktikum", table_cell_style), Paragraph("3", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;1.2 Arsitektur SCADA & Alur Komunikasi IoT", table_cell_style), Paragraph("3", table_cell_style)],
        [Paragraph("<b>BAB II: SPESIFIKASI INSTRUMENTASI & SENSOR</b>", table_cell_bold), Paragraph("Halaman 4", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.1 Daftar Sensor Suhu (TI1–TI6) & Tekanan (PI1–PI4)", table_cell_style), Paragraph("4", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.2 Aktuator Pemanas Ganda (Dual Heater) & Solenoid Valve", table_cell_style), Paragraph("4", table_cell_style)],
        [Paragraph("<b>BAB III: PANDUAN AKSES & AUTENTIKASI</b>", table_cell_bold), Paragraph("Halaman 5", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.1 Hak Akses Akun (Admin vs Operator)", table_cell_style), Paragraph("5", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.2 Prosedur Login & Pemulihan Kata Sandi (OTP)", table_cell_style), Paragraph("5", table_cell_style)],
        [Paragraph("<b>BAB IV: PROSEDUR OPERASIONAL STANDAR (SOP)</b>", table_cell_bold), Paragraph("Halaman 6", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;4.1 Prosedur Persiapan Awal (Pre-Start Checklist)", table_cell_style), Paragraph("6", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;4.2 Pengujian Mode Aliran Co-Current & Counter-Current", table_cell_style), Paragraph("6", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;4.3 Pengaturan Tingkat Daya Pemanas (Level P1 – P7)", table_cell_style), Paragraph("7", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;4.4 Pemantauan Kamera Pengawas CCTV PTZ", table_cell_style), Paragraph("7", table_cell_style)],
        [Paragraph("<b>BAB V: KESELAMATAN KERJA & PENANGANAN DARURAT</b>", table_cell_bold), Paragraph("Halaman 8", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;5.1 Tombol Emergency Stop (Trip) & Logika Proteksi", table_cell_style), Paragraph("8", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;5.2 Proteksi Dry-Run & High Temperature Trip", table_cell_style), Paragraph("8", table_cell_style)],
        [Paragraph("<b>BAB VI: PEREKAMAN DATA & KALKULASI LMTD</b>", table_cell_bold), Paragraph("Halaman 9", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;6.1 Ekspor Data Log ke Format Excel / CSV / PDF", table_cell_style), Paragraph("9", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;6.2 Rumus Perhitungan LMTD & Koefisien Perpindahan Kalor", table_cell_style), Paragraph("9", table_cell_style)],
        [Paragraph("<b>BAB VII: TROUBLESHOOTING & PEMELIHARAAN</b>", table_cell_bold), Paragraph("Halaman 10", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;7.1 Solusi Masalah Umum (Troubleshooting Matrix)", table_cell_style), Paragraph("10", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;7.2 Kontak Dukungan Teknis PT Anugrah Tripple Cycle", table_cell_style), Paragraph("10", table_cell_style)]
    ]
    toc_table = Table(toc_data, colWidths=[13.5 * cm, 2.5 * cm])
    toc_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LINEBELOW', (0, 0), (-1, -1), 0.3, colors.HexColor('#F1F5F9'))
    ]))
    story.append(toc_table)
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # BAB I: PENDAHULUAN & ARSITEKTUR
    # ═════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("BAB I: PENDAHULUAN & ARSITEKTUR SISTEM", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceAfter=10, spaceBefore=2))

    story.append(Paragraph("1.1 Latar Belakang & Tujuan Praktikum", h2_style))
    story.append(Paragraph(
        "Alat praktikum <b>Heat Exchanger (Penukar Panas)</b> di Laboratorium Teknik Kimia Universitas Ahmad Dahlan dirancang untuk memberikan pemahaman mendalam mengenai fenomena perpindahan kalor antara dua fluida cair (fluida panas dan fluida dingin). "
        "Untuk meningkatkan efisiensi, akurasi, dan keselamatan kerja laboratorium, sistem ini diintegrasikan dengan <b>FluidHE SCADA IoT Dashboard</b> yang dikembangkan bersama <b>PT Anugrah Tripple Cycle</b>.",
        body_style
    ))
    story.append(Paragraph(
        "Tujuan utama sistem digital ini mencakup:",
        body_style
    ))
    story.append(Paragraph("• <b>Visualisasi P&ID Real-Time:</b> Memantau arah aliran fluida dan status katup secara langsung pada layar monitor/tablet.", bullet_style))
    story.append(Paragraph("• <b>Akurasi Telemetri:</b> Merekam perubahan temperatur pada 6 titik kritis dengan presisi 0.1°C dan interval waktu hingga 1 detik.", bullet_style))
    story.append(Paragraph("• <b>Kendali Terpusat:</b> Mengatur daya pemanas ganda dan membalikkan mode aliran (Co-Current / Counter-Current) secara otomatis.", bullet_style))
    story.append(Paragraph("• <b>Keselamatan Terjamin:</b> Mencegah kerusakan alat melalui pemutus arus darurat otomatis (*Emergency Trip*).", bullet_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("1.2 Arsitektur Sistem SCADA & Alur Komunikasi IoT", h2_style))
    story.append(Paragraph(
        "Sistem FluidHE SCADA beroperasi menggunakan arsitektur *Industrial Internet of Things (IIoT)* berlapis yang menghubungkan perangkat keras laboratorium dengan antarmuka web secara *real-time*:",
        body_style
    ))

    arch_data = [
        [Paragraph("<b>Lapisan (Layer)</b>", table_header_style), Paragraph("<b>Komponen / Teknologi</b>", table_header_style), Paragraph("<b>Fungsi Utama</b>", table_header_style)],
        [
            Paragraph("<b>Edge Device</b>", table_cell_bold),
            Paragraph("ESP32 Dual-Core 240MHz (Firmware Arduino/C++)", table_cell_style),
            Paragraph("Membaca sensor fisik (DS18B20, Pressure, Flow) dan mengontrol SSR heater serta relay solenoid valve.", table_cell_style)
        ],
        [
            Paragraph("<b>Cloud & Realtime</b>", table_cell_bold),
            Paragraph("Supabase PostgreSQL & Realtime Channels", table_cell_style),
            Paragraph("Sinkronisasi perintah kontrol dan telemetri sensor via WebSocket berlatensi rendah (~40ms).", table_cell_style)
        ],
        [
            Paragraph("<b>User Interface</b>", table_cell_bold),
            Paragraph("Next.js (App Router), React, TypeScript & Tailwind CSS", table_cell_style),
            Paragraph("Dashboard operator responsif (Desktop & Tablet Lab) untuk visualisasi P&ID, grafik tren, dan ekspor data.", table_cell_style)
        ],
        [
            Paragraph("<b>Surveillance</b>", table_cell_bold),
            Paragraph("Ezviz RTSP/WebRTC Service + Python PTZ API", table_cell_style),
            Paragraph("Live streaming kamera CCTV laboratorium dan kendali arah kamera (*Pan-Tilt-Zoom*).", table_cell_style)
        ]
    ]
    arch_table = Table(arch_data, colWidths=[3.2 * cm, 5.8 * cm, 7.0 * cm])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')
    ]))
    story.append(arch_table)
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # BAB II: SPESIFIKASI INSTRUMENTASI & SENSOR
    # ═════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("BAB II: SPESIFIKASI INSTRUMENTASI & SENSOR", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceAfter=10, spaceBefore=2))

    story.append(Paragraph("2.1 Titik Sensor Telemetri Laboratorium", h2_style))
    story.append(Paragraph(
        "Alat penukar panas ini dilengkapi dengan 6 sensor suhu (*Temperature Indicator*), 4 transduser tekanan (*Pressure Indicator*), dan 2 sensor laju alir fluida (*Flow Controller*):",
        body_style
    ))

    sensor_data = [
        [Paragraph("<b>Kode Tag</b>", table_header_style), Paragraph("<b>Nama Parameter & Lokasi Pemasangan</b>", table_header_style), Paragraph("<b>Rentang Kerja</b>", table_header_style), Paragraph("<b>Keterangan</b>", table_header_style)],
        [Paragraph("<b>TI1</b>", table_cell_bold), Paragraph("Hot Fluid Inlet Temperature (Masuk Shell)", table_cell_style), Paragraph("20°C – 100°C", table_cell_style), Paragraph("Suhu air panas keluaran pemanas", table_cell_style)],
        [Paragraph("<b>TI2</b>", table_cell_bold), Paragraph("Hot Fluid Outlet Temperature (Keluar Shell)", table_cell_style), Paragraph("20°C – 100°C", table_cell_style), Paragraph("Suhu air panas setelah bertukar kalor", table_cell_style)],
        [Paragraph("<b>TI3</b>", table_cell_bold), Paragraph("Cold Fluid Inlet Temperature (Masuk Tube)", table_cell_style), Paragraph("10°C – 60°C", table_cell_style), Paragraph("Suhu air dingin dari tangki penampung", table_cell_style)],
        [Paragraph("<b>TI4</b>", table_cell_bold), Paragraph("Cold Fluid Outlet Temperature (Keluar Tube)", table_cell_style), Paragraph("10°C – 80°C", table_cell_style), Paragraph("Suhu air dingin setelah menyerap kalor", table_cell_style)],
        [Paragraph("<b>TI5</b>", table_cell_bold), Paragraph("Shell Midpoint 1 Temperature", table_cell_style), Paragraph("20°C – 100°C", table_cell_style), Paragraph("Distribusi temperatur tengah 1", table_cell_style)],
        [Paragraph("<b>TI6</b>", table_cell_bold), Paragraph("Shell Midpoint 2 Temperature", table_cell_style), Paragraph("20°C – 100°C", table_cell_style), Paragraph("Distribusi temperatur tengah 2", table_cell_style)],
        [Paragraph("<b>PI1 – PI2</b>", table_cell_bold), Paragraph("Pressure Drop Hot Stream (Inlet / Outlet)", table_cell_style), Paragraph("0 – 3.0 Bar", table_cell_style), Paragraph("Evaluasi penurunan tekanan sisi panas", table_cell_style)],
        [Paragraph("<b>PI3 – PI4</b>", table_cell_bold), Paragraph("Pressure Drop Cold Stream (Inlet / Outlet)", table_cell_style), Paragraph("0 – 3.0 Bar", table_cell_style), Paragraph("Evaluasi penurunan tekanan sisi dingin", table_cell_style)],
        [Paragraph("<b>FC1 – FC2</b>", table_cell_bold), Paragraph("Flow Rate Sensor (Hot & Cold Streams)", table_cell_style), Paragraph("1 – 30 L/min", table_cell_style), Paragraph("Laju alir volumetrik cairan", table_cell_style)]
    ]
    sensor_table = Table(sensor_data, colWidths=[2.2 * cm, 6.6 * cm, 3.2 * cm, 4.0 * cm])
    sensor_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')
    ]))
    story.append(sensor_table)

    story.append(Spacer(1, 8))
    story.append(Paragraph("2.2 Spesifikasi Aktuator & Sistem Kelistrikan", h2_style))
    story.append(Paragraph(
        "• <b>Dual Immersion Heater (2x 500W):</b> Total daya pemanas 1000 Watt yang dikendalikan secara bertingkat melalui Solid State Relay (SSR) dengan isolasi optocoupler untuk keamanan sirkuit.<br/>"
        "• <b>Solenoid Valve Array (SV1 – SV4):</b> 4 unit katup elektromagnetik 12V DC berstandar industri dengan susunan Normally Closed (NC) dan Normally Open (NO) yang difungsikan untuk membalik aliran fluida dingin secara instan tanpa perlu memindahkan selang/pipa fisik.",
        body_style
    ))

    # Safety Notice Callout
    notice_box = Table(
        [[Paragraph("<b>PERHATIAN KESELAMATAN KELISTRIKAN:</b><br/>Pastikan grounding instalasi laboratorium terhubung dengan benar. Dilarang menyalakan pemanas (Heater) saat sirkulasi air dalam tangki belum mengalir.", callout_style)]],
        colWidths=[16 * cm]
    )
    notice_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FEF3C7')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#F59E0B')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    story.append(notice_box)
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # BAB III: PANDUAN AKSES & AUTENTIKASI
    # ═════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("BAB III: PANDUAN AKSES & AUTENTIKASI", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceAfter=10, spaceBefore=2))

    story.append(Paragraph("3.1 Tingkatan Hak Akses (*Role-Based Access Control*)", h2_style))
    story.append(Paragraph(
        "Sistem FluidHE membagi hak akses ke dalam dua tingkatan (*2-tier roles*) untuk memastikan tata kelola laboratorium yang tertib:",
        body_style
    ))

    role_data = [
        [Paragraph("<b>Peran (Role)</b>", table_header_style), Paragraph("<b>Wewenang & Hak Akses Fitur</b>", table_header_style), Paragraph("<b>Pengguna</b>", table_header_style)],
        [
            Paragraph("<b>Admin Lab</b>", table_cell_bold),
            Paragraph("• Kendali penuh seluruh aktuator dan sistem trip<br/>• Mengatur jadwal izin akses & durasi praktikum mahasiswa<br/>• Kalibrasi sensor & reset alarm darurat<br/>• Manajemen akun pengguna (tambah, edit, hapus)", table_cell_style),
            Paragraph("Dosen Pengampu / Kepala Laboratorium / Pranata Lab", table_cell_style)
        ],
        [
            Paragraph("<b>Operator</b>", table_cell_bold),
            Paragraph("• Monitoring telemetri multi-sensor real-time<br/>• Pengujian mode aliran (Co-Current / Counter-Current)<br/>• Menjalankan pemanas sesuai alokasi durasi sesi praktikum<br/>• Mengunduh log data praktikum ke format Excel / CSV / PDF", table_cell_style),
            Paragraph("Mahasiswa Praktikan Teknik Kimia UAD", table_cell_style)
        ]
    ]
    role_table = Table(role_data, colWidths=[3.2 * cm, 8.8 * cm, 4.0 * cm])
    role_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')
    ]))
    story.append(role_table)

    story.append(Spacer(1, 10))
    story.append(Paragraph("3.2 Prosedur Masuk Sistem & Pemulihan Kata Sandi", h2_style))
    story.append(Paragraph("1. <b>Buka Browser:</b> Akses alamat web SCADA (contoh: <code>http://localhost:3000</code> atau subdomain resmi UAD).", bullet_style))
    story.append(Paragraph("2. <b>Pilih Role Login:</b> Klik tab peran yang sesuai (<b>Admin</b> atau <b>Operator</b>).", bullet_style))
    story.append(Paragraph("3. <b>Masukkan Kredensial:</b> Ketikkan email resmi dan kata sandi yang telah didaftarkan oleh admin lab.", bullet_style))
    story.append(Paragraph("4. <b>Pemulihan Sandi (Lupa Sandi):</b> Klik tautan <i>'Lupa / Ganti Sandi?'</i>, masukkan alamat email terdaftar, lalu verifikasi kode OTP 6-digit yang dikirimkan via email untuk membuat kata sandi baru.", bullet_style))
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # BAB IV: SOP PRAKTIKUM
    # ═════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("BAB IV: PROSEDUR OPERASIONAL STANDAR (SOP)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceAfter=10, spaceBefore=2))

    story.append(Paragraph("4.1 Prosedur Persiapan Awal (*Pre-Start Checklist*)", h2_style))
    story.append(Paragraph(
        "Sebelum menyalakan saklar daya pemanas pada dashboard, lakukan pemeriksaan fisik berikut:",
        body_style
    ))
    story.append(Paragraph("1. Pastikan tangki fluida dingin dan tangki penampung air panas terisi air minimal <b>70% kapasitas</b>.", bullet_style))
    story.append(Paragraph("2. Periksa selang sirkulasi fluida, pastikan tidak ada kebocoran atau lipatan pada jalur pipa.", bullet_style))
    story.append(Paragraph("3. Nyalakan pompa sirkulasi air hingga laju alir pada sensor <b>FC1</b> dan <b>FC2</b> terdeteksi stabil di atas 2.0 L/menit.", bullet_style))
    story.append(Paragraph("4. Pastikan indikator status mikrokontroler pada header dashboard menampilkan status <b>ESP32: ONLINE</b>.", bullet_style))

    story.append(Spacer(1, 8))
    story.append(Paragraph("4.2 Pengujian Konfigurasi Aliran Fluida", h2_style))
    story.append(Paragraph(
        "Pada panel kontrol web (*Control Panel*), operator dapat memilih arah aliran dengan mengklik tombol <b>Mode Aliran</b>:",
        body_style
    ))

    flow_data = [
        [Paragraph("<b>Mode Aliran</b>", table_header_style), Paragraph("<b>Konfigurasi Solenoid Valve</b>", table_header_style), Paragraph("<b>Karakteristik Perpindahan Panas</b>", table_header_style)],
        [
            Paragraph("<b>Counter-Current<br/>(Berlawanan Arah)</b>", table_cell_bold),
            Paragraph("SV1: OFF (Jalur A)<br/>SV2: ON (Jalur B)<br/>SV3: OFF, SV4: ON", table_cell_style),
            Paragraph("Fluida dingin mengalir berlawanan arah dengan fluida panas. Menghasilkan selisih suhu logaritmik (LMTD) yang lebih tinggi dan efisiensi termal maksimal.", table_cell_style)
        ],
        [
            Paragraph("<b>Co-Current<br/>(Searah)</b>", table_cell_bold),
            Paragraph("SV1: ON (Jalur A)<br/>SV2: OFF (Jalur B)<br/>SV3: ON, SV4: OFF", table_cell_style),
            Paragraph("Fluida dingin mengalir searah dengan fluida panas dari ujung yang sama. Suhu fluida dingin keluar tidak dapat melampaui suhu fluida panas keluar.", table_cell_style)
        ]
    ]
    flow_table = Table(flow_data, colWidths=[3.8 * cm, 4.8 * cm, 7.4 * cm])
    flow_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')
    ]))
    story.append(flow_table)

    story.append(Spacer(1, 8))
    story.append(Paragraph("4.3 Pengaturan Tingkat Daya Pemanas (Level P1 – P7)", h2_style))
    story.append(Paragraph(
        "Tingkat daya pemanas diatur melalui panel <b>Pengaturan Level Pemanas (P1 – P7)</b>. Pengaturan ini murni mengatur *step power level* elemen pemanas tanpa mengubah posisi katup maupun laju alir air. "
        "Operator dapat mengklik langsung tombol level <b>P1 s.d. P7</b> atau menggunakan tombol <b>Naik Level (P+)</b> dan <b>Turun Level (P-)</b>.",
        body_style
    ))
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # BAB V: KESELAMATAN KERJA & ALARM
    # ═════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("BAB V: KESELAMATAN KERJA & PENANGANAN DARURAT", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceAfter=10, spaceBefore=2))

    story.append(Paragraph("5.1 Logika Proteksi & Sistem Alarm Otomatis", h2_style))
    story.append(Paragraph(
        "Sistem FluidHE dilengkapi dengan algoritma proteksi bertingkat untuk menjamin keselamatan operator dan mencegah insiden kebakaran atau kerusakan elemen pemanas:",
        body_style
    ))

    safety_data = [
        [Paragraph("<b>Jenis Proteksi</b>", table_header_style), Paragraph("<b>Kondisi Pemicu (Trigger)</b>", table_header_style), Paragraph("<b>Aksi Otomatis Sistem SCADA</b>", table_header_style)],
        [
            Paragraph("<b>High Temp Trip</b>", table_cell_bold),
            Paragraph("Suhu pada sensor TI1 atau TI2 melebihi ambang batas kritis (&gt; 85.0°C).", table_cell_style),
            Paragraph("Memutus seketika daya Dual Heater (Heater 1 & 2 OFF), membunyikan alarm visual, dan mencatat insiden ke log alarm.", table_cell_style)
        ],
        [
            Paragraph("<b>Dry-Run Protection</b>", table_cell_bold),
            Paragraph("Laju alir fluida pada FC1 atau FC2 &lt; 0.5 L/menit saat pemanas dalam kondisi aktif.", table_cell_style),
            Paragraph("Mematikan heater secara instan untuk mencegah pemanasan tabung dalam keadaan kering (tanpa air).", table_cell_style)
        ],
        [
            Paragraph("<b>Manual Emergency Stop</b>", table_cell_bold),
            Paragraph("Operator atau admin menekan tombol merah <b>EMERGENCY STOP</b> di dashboard atau tombol fisik rig.", table_cell_style),
            Paragraph("Menonaktifkan seluruh aktuator listrik dan mengunci sistem hingga dilakukan prosedur *Reset Alarm*.", table_cell_style)
        ]
    ]
    safety_table = Table(safety_data, colWidths=[3.8 * cm, 5.8 * cm, 6.4 * cm])
    safety_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')
    ]))
    story.append(safety_table)

    story.append(Spacer(1, 10))
    story.append(Paragraph("5.2 Prosedur Pemulihan Pasca Trip (*Emergency Reset*)", h2_style))
    story.append(Paragraph("1. Identifikasi penyebab trip pada tab <b>Alarm System</b> (misal: suhu berlebih atau aliran air terhenti).", bullet_style))
    story.append(Paragraph("2. Perbaiki kondisi fisik alat (buka katup aliran air atau biarkan suhu turun ke bawah batas aman).", bullet_style))
    story.append(Paragraph("3. Masuk dengan akun <b>Admin Lab</b>, lalu klik tombol <b>RESET EMERGENCY TRIP</b> pada panel kontrol.", bullet_style))
    story.append(Paragraph("4. Nyalakan kembali sirkulasi dan pemanas secara bertahap mulai dari level daya terendah (Level P1).", bullet_style))
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # BAB VI: PEREKAMAN DATA & KALKULASI LMTD
    # ═════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("BAB VI: PEREKAMAN DATA & KALKULASI LMTD", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceAfter=10, spaceBefore=2))

    story.append(Paragraph("6.1 Pengambilan Log Data Praktikum", h2_style))
    story.append(Paragraph(
        "Pada tab <b>Data Logs & Laporan</b>, seluruh data telemetri dicatat secara kontinu. Mahasiswa dapat memilih interval sampling (1 detik, 2 detik, 5 detik, 30 detik, atau 1 menit). "
        "Untuk kebutuhan pengolahan laporan praktikum, klik tombol ekspor:",
        body_style
    ))
    story.append(Paragraph("• <b>Export Excel (.xlsx):</b> Menghasilkan berkas spreadsheet terformat rapi berisi timestamp, TI1–TI6, PI1–PI4, status heater, dan mode aliran.", bullet_style))
    story.append(Paragraph("• <b>Export CSV:</b> Format data mentah untuk analisis statistik atau komputasi Python / MATLAB.", bullet_style))
    story.append(Paragraph("• <b>Cetak Laporan PDF:</b> Menghasilkan lembar laporan monitoring resmi berlogo Teknik Kimia UAD.", bullet_style))

    story.append(Spacer(1, 8))
    story.append(Paragraph("6.2 Dasar Perhitungan LMTD & Koefisien Perpindahan Kalor ($U$)", h2_style))
    story.append(Paragraph(
        "Mahasiswa dapat menggunakan data telemetri untuk menghitung nilai-nilai termodinamika berikut:",
        body_style
    ))
    story.append(Paragraph("<b>1. Log Mean Temperature Difference (LMTD):</b>", h3_style))
    story.append(Paragraph(
        "$$\\Delta T_{lm} = \\frac{\\Delta T_1 - \\Delta T_2}{\\ln\\left(\\frac{\\Delta T_1}{\\Delta T_2}\\right)}$$",
        body_style
    ))
    story.append(Paragraph(
        "• Untuk <b>Counter-Current:</b> $\\Delta T_1 = T_{h,in} - T_{c,out} = TI1 - TI4$ dan $\\Delta T_2 = T_{h,out} - T_{c,in} = TI2 - TI3$<br/>"
        "• Untuk <b>Co-Current:</b> $\\Delta T_1 = T_{h,in} - T_{c,in} = TI1 - TI3$ dan $\\Delta T_2 = T_{h,out} - T_{c,out} = TI2 - TI4$",
        body_style
    ))

    story.append(Paragraph("<b>2. Laju Perpindahan Kalor ($q$):</b>", h3_style))
    story.append(Paragraph(
        "$$q = \\dot{m}_h \\cdot C_{p,h} \\cdot (TI1 - TI2) = \\dot{m}_c \\cdot C_{p,c} \\cdot (TI4 - TI3)$$",
        body_style
    ))

    story.append(Paragraph("<b>3. Koefisien Perpindahan Panas Menyeluruh ($U$):</b>", h3_style))
    story.append(Paragraph(
        "$$U = \\frac{q}{A \\cdot \\Delta T_{lm} \\cdot F}$$",
        body_style
    ))
    story.append(Paragraph("Di mana $A$ adalah luas area perpindahan panas pipa penukar kalor dan $F$ adalah faktor koreksi geometri.", body_style))
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # BAB VII: TROUBLESHOOTING & PEMELIHARAAN
    # ═════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("BAB VII: TROUBLESHOOTING & PEMELIHARAAN", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceAfter=10, spaceBefore=2))

    story.append(Paragraph("7.1 Matriks Solusi Masalah Umum (*Troubleshooting Matrix*)", h2_style))

    trouble_data = [
        [Paragraph("<b>Gejala Masalah</b>", table_header_style), Paragraph("<b>Kemungkinan Penyebab</b>", table_header_style), Paragraph("<b>Tindakan Perbaikan yang Disarankan</b>", table_header_style)],
        [
            Paragraph("Status Dashboard:<br/><b>ESP32: OFFLINE</b>", table_cell_bold),
            Paragraph("1. Kabel power adaptor ESP32 terlepas.<br/>2. Jaringan Wi-Fi lab terputus atau SSID berubah.", table_cell_style),
            Paragraph("Periksa lampu LED daya pada box mikrokontroler. Pastikan router lab aktif dan restart mikrokontroler dengan menekan tombol reset.", table_cell_style)
        ],
        [
            Paragraph("Suhu salah satu sensor terbaca <b>-127°C</b> atau <b>85°C konstan</b>", table_cell_bold),
            Paragraph("Kabel sensor DS18B20 kendor atau terjadi gangguan komunikasi OneWire bus.", table_cell_style),
            Paragraph("Periksa terminal konektor sensor di terminal block. Kencangkan baut terminal dengan obeng presisi.", table_cell_style)
        ],
        [
            Paragraph("Heater aktif (ON) tetapi suhu air tidak naik", table_cell_bold),
            Paragraph("1. MCB pemanas pada panel trip.<br/>2. Relay SSR gagal mentrigger arus AC.", table_cell_style),
            Paragraph("Periksa MCB utama pada panel daya lab. Pastikan kabel beban 220V terhubung kokoh ke elemen pemanas.", table_cell_style)
        ],
        [
            Paragraph("Tampilan video <b>CCTV Disconnected / Loading</b>", table_cell_bold),
            Paragraph("Kamera Ezviz offline atau layanan service Python lokal belum berjalan.", table_cell_style),
            Paragraph("Jalankan script background pengawas kamera via <code>python scripts/ezviz_ptz_service.py</code> atau restart adaptor daya kamera.", table_cell_style)
        ]
    ]
    trouble_table = Table(trouble_data, colWidths=[4.2 * cm, 5.4 * cm, 6.4 * cm])
    trouble_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')
    ]))
    story.append(trouble_table)

    story.append(Spacer(1, 14))
    story.append(Paragraph("7.2 Kontak Bantuan & Dukungan Teknis", h2_style))
    story.append(Paragraph(
        "Untuk bantuan teknis pemeliharaan hardware, kalibrasi instrumen sensorik, atau pembaruan software SCADA, silakan menghubungi tim pengembang resmi:",
        body_style
    ))

    contact_data = [
        [Paragraph("<b>Pengembang Sistem & Penyedia Jasa:</b>", table_cell_bold), Paragraph("<b>PT ANUGRAH TRIPPLE CYCLE</b> (Industrial Automation & IoT Division)", table_cell_style)],
        [Paragraph("<b>Email Kontak:</b>", table_cell_bold), Paragraph("anugrahtriplecycle@gmail.com", table_cell_style)],
        [Paragraph("<b>Pengelola Fasilitas:</b>", table_cell_bold), Paragraph("Laboratorium Teknik Kimia, Universitas Ahmad Dahlan (Kampus IV)", table_cell_style)],
        [Paragraph("<b>Alamat:</b>", table_cell_bold), Paragraph("Jl. Ringroad Selatan, Kragilan, Tamanan, Kec. Banguntapan, Bantul, D.I. Yogyakarta 55191", table_cell_style)]
    ]
    contact_table = Table(contact_data, colWidths=[5.5 * cm, 10.5 * cm])
    contact_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(contact_table)

    # Build PDF using NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Manual book PDF successfully generated at: {output_pdf_path}")


if __name__ == '__main__':
    output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Manual_Book_FluidHE_SCADA_UAD.pdf")
    create_manual_book(output_path)
