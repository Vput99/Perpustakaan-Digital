import React, { useState, useRef, forwardRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import { motion } from 'motion/react';
import { ChevronLeft, Home, ChevronRight, Loader2 } from 'lucide-react';
import { useRive } from '@rive-app/react-canvas';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Konfigurasi worker react-pdf agar kompatibel dengan versi terbaru (v9+)
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface PdfModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

// Komponen Sampul Depan & Belakang Buku
const PageCover = forwardRef((props: any, ref: any) => {
  return (
    <div className="page page-cover bg-blue-700 shadow-inner" ref={ref} data-density="hard">
      <div className="page-content w-full h-full bg-gradient-to-br from-blue-600 to-indigo-800 text-white flex items-center justify-center p-8 text-center border-l-8 border-indigo-900 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
        <h2 className="text-3xl font-black drop-shadow-lg">{props.children}</h2>
      </div>
    </div>
  );
});

// Komponen Halaman Dalam Buku yang Merender PDF
const PdfPage = forwardRef((props: any, ref: any) => {
  return (
    <div className="page bg-white shadow-md relative overflow-hidden" ref={ref}>
      <div className="page-content w-full h-full flex items-center justify-center overflow-hidden bg-white relative">
        <Page 
          pageNumber={props.number} 
          scale={2} // Resolusi super tinggi, CSS yang akan mengecilkannya agar pas
          renderTextLayer={false} 
          renderAnnotationLayer={false} 
        />
        {/* Bayangan tengah (binding) agar terlihat seperti lipatan buku */}
        <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
});

export default function PdfModal({ url, title, onClose }: PdfModalProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const flipBook = useRef<any>(null);
  const { RiveComponent } = useRive({
    src: '/assets/loading.riv',
    stateMachines: "State Machine 1",
    autoplay: true,
  });
  
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  const nextButtonClick = () => {
    flipBook.current?.pageFlip()?.flipNext();
  };

  const prevButtonClick = () => {
    flipBook.current?.pageFlip()?.flipPrev();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#eef2f6]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239ba9b4' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}
    >
      <style>{`
        .react-pdf__Page {
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .react-pdf__Page__canvas {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
        }
      `}</style>
      
      {/* Header Bar */}
      <div className="flex items-center justify-between w-full px-4 py-3 bg-blue-50/80 backdrop-blur-md border-b border-blue-100/50 shadow-sm relative z-20">
        <div className="flex items-center gap-2">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-blue-800 font-black hover:text-blue-600 transition-colors"
          >
            <Home size={20} />
            <span className="hidden sm:inline">SmartLibrary SD</span>
          </button>
        </div>
        <h2 className="text-sm font-black text-slate-700 absolute left-1/2 -translate-x-1/2 max-w-[50%] truncate text-center">
          {title}
        </h2>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Area Flipbook */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center p-4 md:p-10">
        <div className="relative w-full h-full flex items-center justify-center">
          
          {/* Tombol Halaman Sebelumnya */}
          {!loading && numPages > 0 && (
            <button 
              onClick={prevButtonClick}
              className="absolute left-2 md:left-10 z-30 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <ChevronLeft size={24} className="text-slate-700" />
            </button>
          )}

          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => {
              console.error("Gagal memuat PDF:", error);
              setLoading(false);
            }}
            loading={
              <div className="flex flex-col items-center justify-center text-slate-500 z-10 relative">
                <div className="relative w-64 h-64 flex items-center justify-center">
                  <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="relative z-10 w-full h-full object-contain mix-blend-multiply"
                  >
                    <source src="/loading.webm" type="video/webm" />
                  </video>
                </div>
                <motion.h3 
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-2xl font-black text-slate-800 mb-2 mt-4"
                >
                  Menyiapkan Buku...
                </motion.h3>
                <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Membuka setiap halamannya untukmu!</p>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center text-center p-10">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Ups! Gagal Memuat Buku</h3>
                <p className="text-slate-500 max-w-xs">Pastikan koneksi internetmu lancar atau coba buka buku yang lain ya!</p>
                <button 
                  onClick={onClose}
                  className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-colors"
                >
                  Kembali ke Perpustakaan
                </button>
              </div>
            }
            className="flex items-center justify-center w-full h-full max-w-5xl"
          >
            {!loading && numPages > 0 && (
               // @ts-ignore
              <HTMLFlipBook 
                width={400} 
                height={560} 
                size="stretch"
                minWidth={315}
                maxWidth={1000}
                minHeight={400}
                maxHeight={1533}
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport={true}
                className="flip-book shadow-2xl mx-auto"
                ref={flipBook}
                usePortrait={true}
              >
                <PageCover>{title}</PageCover>
                
                {Array.from(new Array(numPages), (el, index) => (
                  <PdfPage key={`page_${index + 1}`} number={index + 1} width={400} />
                ))}

                <PageCover>Selesai Membaca!</PageCover>
              </HTMLFlipBook>
            )}
          </Document>

          {/* Tombol Halaman Berikutnya */}
          {!loading && numPages > 0 && (
            <button 
              onClick={nextButtonClick}
              className="absolute right-2 md:right-10 z-30 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <ChevronRight size={24} className="text-slate-700" />
            </button>
          )}
        </div>
      </div>
      
      {/* Tombol Kembali ke Daftar Buku */}
      <button 
        onClick={onClose}
        className="absolute bottom-6 left-6 bg-slate-800/90 backdrop-blur text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 z-40 shadow-lg hover:bg-slate-700 transition-colors border border-slate-600"
      >
        <ChevronLeft size={16} /> 
        Kembali ke Daftar Buku
      </button>
    </motion.div>
  );
}
