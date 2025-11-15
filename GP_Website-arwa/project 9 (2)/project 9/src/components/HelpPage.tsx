import React from 'react';
import { ArrowLeft, AlertTriangle, FileText, Users } from 'lucide-react';


interface HelpPageProps {
  onBack: () => void;
}

const HelpPage: React.FC<HelpPageProps> = ({ onBack }) => {

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <header className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-orange-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/logo3.jpeg" alt="Smart Construction Logo" className="h-16 w-auto object-contain mix-blend-multiply" />
              <div>
                <h1 className="text-3xl font-bold text-orange-500">SMART</h1>
                <h2 className="text-3xl font-bold text-orange-600">CONSTRUCTION</h2>
              </div>
            </div>
            
            <button
              onClick={onBack}
              className="px-6 py-2 bg-white border border-orange-300 rounded-lg text-orange-600 
                       hover:bg-orange-50 transition-colors duration-200 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl shadow-xl p-8 border border-orange-200">
          <div className="text-center mb-8">
            <ArrowLeft className="w-12 h-12 text-red-500 mx-auto mb-4 p-2 bg-red-100 rounded-full" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Help & Support</h1>
            <p className="text-gray-600">Learn how to use the Smart Construction BIM analysis system</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">1</div>
                <FileText className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Upload your BIM file in the first box.</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• file rejected? or an error occurred?</li>
                <li>• make sure your file is in a supported format such as IFC,</li>
                <li>• and try again.</li>
              </ul>
            </div>

            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">2</div>
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">choose the floor level, and optionally fill the other boxes.</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• don't find the value your looking for in the drop box's options?</li>
                <li>• it must've been outside the building codes we support and not</li>
                <li>• included here.</li>
              </ul>
            </div>

            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">3</div>
                <Users className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">click start, wait for it to finish and it will download the resulting report automatically.</h3>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
            <h3 className="text-xl font-semibold text-amber-800 mb-4">System Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-700">
              <div>
                <h4 className="font-semibold mb-2">AI Analysis Capabilities:</h4>
                <ul className="space-y-1">
                  <li>• Automatic column detection</li>
                  <li>• Deviation measurement</li>
                  <li>• Column width analysis</li>
                  <li>• Distance calculations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Supported File Formats:</h4>
                <ul className="space-y-1">
                  <li>• IFC (Industry Foundation Classes)</li>
                  <li>• STP (Standard for Exchange of Product Data)</li>
                  <li>• STEP files</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Technical Support</h3>
            <p className="text-gray-600 mb-4">
              Need additional help? Our technical support team is here to assist you with any issues or questions.
            </p>
            <div className="text-center">
              <p className="text-lg font-semibold text-red-600">
                contact us: 443007559@pnu.edu.sa
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpPage;