import { useState } from 'react';
import jsPDF from 'jspdf';

import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ParameterForm from './components/ParameterForm';
import LoadingModal from './components/LoadingModal';
import MessageModal from './components/MessageModal';
import HelpPage from './components/HelpPage';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

export interface FormData {
  file: File | null;
  floorLevel: string;
  minColumnWidth: string;
  maxDistance: string;
  deviationTolerance: string;
}

export interface ProcessingState {
  isUploading: boolean;
  isProcessing: boolean;
  uploadSuccess: boolean;
  processingComplete: boolean;
  error: string | null;
}

function AppContent() {
  const [showHelp, setShowHelp] = useState(false);
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    file: null,
    floorLevel: '',
    minColumnWidth: '',
    maxDistance: '',
    deviationTolerance: ''
  });
  
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isUploading: false,
    isProcessing: false,
    uploadSuccess: false,
    processingComplete: false,
    error: null
  });

  const handleFileSelect = async (file: File) => {
    // Validate file format
    const validExtensions = ['.ifc', '.stp', '.step'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      setProcessingState(prev => ({
        ...prev,
        error: 'FILE FORMAT UNSUPPORTED!'
      }));
      return;
    }

    setProcessingState(prev => ({
      ...prev,
      isUploading: true,
      error: null
    }));

    // Simulate file upload
    setTimeout(() => {
      setFormData(prev => ({ ...prev, file }));
      setProcessingState(prev => ({
        ...prev,
        isUploading: false,
        uploadSuccess: true
      }));

      // Hide success message after 2 seconds
      setTimeout(() => {
        setProcessingState(prev => ({
          ...prev,
          uploadSuccess: false
        }));
      }, 2000);
    }, 2000);
  };

  const handleStartAnalysis = async () => {
    if (!formData.file || !formData.floorLevel) {
      setProcessingState(prev => ({
        ...prev,
        error: 'Please upload a file and select floor level!'
      }));
      return;
    }

    setProcessingState(prev => ({
      ...prev,
      isProcessing: true,
      error: null
    }));

    try {
      const fd = new FormData();
      // Backend expects 'file' in multipart form
      fd.append('file', formData.file);
      // Include optional UI parameters as form fields (starting with deviation tolerance)
      if (formData.deviationTolerance) {
        fd.append('deviation_tolerance', formData.deviationTolerance);
      }

      const resp = await fetch('http://localhost:8000/extract_and_predict', {
        method: 'POST',
        body: fd
      });

      if (!resp.ok) {
        throw new Error(`Backend error: ${resp.status}`);
      }

      const data = await resp.json();
      const results = data.results || [];

      // Preserve backend feature field names and add id/type
      const transformedResults = results.map((item: any) => {
        const numeric = (v: any) => {
          if (typeof v === 'number') return v;
          const n = Number(v);
          return Number.isFinite(n) ? n : undefined;
        };
        const predictionVal =
          numeric(item?.prediction) ??
          numeric(item?.tilt_ratio) ??
          numeric(item?.tilt_class);

        const tiltRatio = numeric(item?.tilt_ratio);
        const tiltClass = item?.tilt_class;

        return {
          id: item.element_id || 'unknown',
          type: 'column',
          prediction: predictionVal,
          leaning_status: item.leaning_status,
          tilt_ratio: tiltRatio,
          tilt_class: tiltClass,
          base_z: item.base_z,
          top_z: item.top_z,
          centroid_z: item.centroid_z,
          base_x: item.base_x,
          base_y: item.base_y,
          top_x: item.top_x,
          top_y: item.top_y,
          min_x: item.min_x,
          min_y: item.min_y,
          min_z: item.min_z,
          max_x: item.max_x,
          max_y: item.max_y,
          max_z: item.max_z,
          column_height_mm: item.column_height_mm,
          width_mm: item.width_mm,
          length_mm: item.length_mm,
          cross_section_area_mm2: item.cross_section_area_mm2,
          aspect_ratio: item.aspect_ratio,
          height_to_width_ratio: item.height_to_width_ratio,
          height_above_ground: item.height_above_ground,
          source_file: item.source_file,
        };
      });

      // Build report and export as left-aligned PDF
      const reportData = buildReportFromResults(transformedResults);
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const margin = 15;
      const pageWidth = 210;
      const pageHeight = 297;
      const contentWidth = pageWidth - margin * 2;
      const lineHeight = 6;

      // Split text into wrapped lines within the usable width
      const linesRaw = (doc as any).splitTextToSize
        ? (doc as any).splitTextToSize(reportData, contentWidth)
        : [reportData];
      const lines: string[] = Array.isArray(linesRaw) ? linesRaw : [String(linesRaw)];
      let y = margin;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      lines.forEach((line) => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        // Left-to-right alignment by positioning text at left margin
        doc.text(line, margin, y, { align: 'left' });
        y += lineHeight;
      });

      const pdfName = `BIM_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(pdfName);

      setProcessingState(prev => ({
        ...prev,
        isProcessing: false,
        processingComplete: true
      }));

      setTimeout(() => {
        setProcessingState(prev => ({
          ...prev,
          processingComplete: false
        }));
      }, 3000);
    } catch (err: any) {
      setProcessingState(prev => ({
        ...prev,
        isProcessing: false,
        error: err?.message || 'Failed to process file'
      }));
    }
  };

  const buildReportFromResults = (results: any[]) => {
    const count = results.length;

    // Feature names in original backend order
    const featureNames = [
      'base_z','top_z','centroid_z','base_x','base_y','top_x','top_y',
      'min_x','min_y','min_z','max_x','max_y','max_z',
      'column_height_mm','width_mm','length_mm','cross_section_area_mm2',
      'aspect_ratio','height_to_width_ratio','height_above_ground'
    ];

    // Format detailed element information
    let elementsDetails = '';
    results.forEach((element, index) => {
      if (element) {
        elementsDetails += `
ELEMENT ${index + 1}:
ID: ${element.id || 'N/A'}
Type: ${element.type || 'N/A'}
Tilt Ratio: ${typeof element.tilt_ratio === 'number' ? element.tilt_ratio.toFixed(3) : 'N/A'}
Tilt Class: ${
  typeof element.tilt_class === 'number' || typeof element.tilt_class === 'string'
    ? element.tilt_class
    : 'N/A'
}
Leaning Status: ${element.leaning_status ?? 'N/A'}
`;
        // Print all feature values with original names
        featureNames.forEach((name) => {
          const val = element[name];
          const formatted = typeof val === 'number' ? val.toFixed(2) : (val ?? 'N/A');
          elementsDetails += `${name}: ${formatted}\n`;
        });
      }
    });

    // Calculate averages if data exists
    const avg = (arr: number[]) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    
    const heights = results.map(r => r.column_height_mm).filter((v: number) => typeof v === 'number');
    const widths = results.map(r => r.width_mm).filter((v: number) => typeof v === 'number');
    const lengths = results.map(r => r.length_mm).filter((v: number) => typeof v === 'number');
    const areas = results.map(r => r.cross_section_area_mm2).filter((v: number) => typeof v === 'number');
    const ratios = results.map(r => r.aspect_ratio).filter((v: number) => typeof v === 'number');

    const avgHeight = avg(heights).toFixed(2);
    const avgWidth = avg(widths).toFixed(2);
    const avgLength = avg(lengths).toFixed(2);
    const avgArea = avg(areas).toFixed(2);
    const avgRatio = avg(ratios).toFixed(2);

    return `
SMART CONSTRUCTION - BIM ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}
File: ${formData.file?.name}
Floor Level: ${formData.floorLevel}

=== COLUMN ANALYSIS SUMMARY ===

Columns Detected: ${count}
Average Column Height: ${avgHeight} mm
Average Width: ${avgWidth} mm
Average Length: ${avgLength} mm
Average Cross-section Area: ${avgArea} mm²
Average Aspect Ratio: ${avgRatio}

=== DETAILED ELEMENTS INFORMATION ===
${elementsDetails || 'No elements found'}

Compliance Status: ${count > 0 ? 'DATA GENERATED' : 'NO DATA'}

Report generated by Smart Construction AI Analysis Engine (Backend IFC extractor)
    `;
  };

  const closeModal = () => {
    setProcessingState(prev => ({
      ...prev,
      error: null,
      uploadSuccess: false,
      processingComplete: false
    }));
  };

  if (showHelp) {
    return <HelpPage onBack={() => setShowHelp(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <Header onHelpClick={() => setShowHelp(true)} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl shadow-xl p-8 border border-orange-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - File Upload */}
            <div className="space-y-6">
              <FileUpload
                file={formData.file}
                onFileSelect={handleFileSelect}
                disabled={processingState.isUploading || processingState.isProcessing}
              />
            </div>

            {/* Right Column - Parameters */}
            <div className="space-y-6">
              <ParameterForm
                formData={formData}
                setFormData={setFormData}
                disabled={processingState.isUploading || processingState.isProcessing}
              />
            </div>
          </div>

          {/* Start Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleStartAnalysis}
              disabled={processingState.isUploading || processingState.isProcessing}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 
                       disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                       text-white font-bold py-4 px-16 rounded-lg shadow-lg 
                       transform transition-all duration-200 hover:scale-105 hover:shadow-xl
                       text-lg min-w-[140px]"
            >
              {processingState.isProcessing ? t('processing') : t('start')}
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      {processingState.isUploading && (
        <LoadingModal message="LOADING..." />
      )}

      {processingState.isProcessing && (
        <LoadingModal message="ANALYZING BIM FILE..." />
      )}

      {processingState.uploadSuccess && (
        <MessageModal
          type="success"
          title="UPLOADED SUCCESSFULLY"
          onClose={closeModal}
        />
      )}

      {processingState.processingComplete && (
        <MessageModal
          type="success"
          title="ANALYSIS REPORT DOWNLOADED SUCCESSFULLY"
          onClose={closeModal}
        />
      )}

      {processingState.error && (
        <MessageModal
          type="error"
          title="ERROR!"
          message={processingState.error}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;