import React from 'react';

import { FormData } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

interface ParameterFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  disabled: boolean;
}

const ParameterForm: React.FC<ParameterFormProps> = ({ formData, setFormData, disabled }) => {
  const { t } = useLanguage();
  const floorLevels = [
    'Ground Floor', 'First Floor', 'Second Floor', 'Third Floor', 
    'Fourth Floor', 'Fifth Floor', 'Basement', 'Mezzanine'
  ];

  const columnWidthOptions = [
    '200mm', '250mm', '300mm', '350mm', '400mm', '450mm', '500mm'
  ];

  const distanceOptions = [
    '3.0m', '4.0m', '5.0m', '6.0m', '7.0m', '8.0m', '9.0m', '10.0m'
  ];

  const toleranceOptions = [
    '±1mm', '±1.5mm', '±2mm', '±2.5mm', '±3mm', '±3.5mm', '±4mm'
  ];

  const SelectField = ({ 
    label, 
    value, 
    onChange, 
    options, 
    required = false 
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    required?: boolean;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-orange-600 uppercase tracking-wide">
        {t(label.toLowerCase().replace(/\s+/g, '.').replace(/\(|\)/g, ''))} {required && '*'}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-4 py-3 border rounded-lg appearance-none bg-white
                     focus:ring-2 focus:ring-orange-500 focus:border-transparent
                     transition-all duration-200 text-gray-700
                     ${disabled 
                       ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                       : 'border-orange-400 hover:border-orange-500'
                     }`}
        >
          <option value="">ENTER HERE</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-0 h-0 
                        border-l-4 border-r-4 border-t-6 border-transparent
                        ${disabled ? 'border-t-gray-400' : 'border-t-orange-600'}`} 
             style={{borderTopColor: disabled ? '#9CA3AF' : '#EA580C'}} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <SelectField
        label="Floor Level"
        value={formData.floorLevel}
        onChange={(value) => setFormData(prev => ({ ...prev, floorLevel: value }))}
        options={floorLevels}
        required
      />

      <SelectField
        label="Minimum Column Width (Optional)"
        value={formData.minColumnWidth}
        onChange={(value) => setFormData(prev => ({ ...prev, minColumnWidth: value }))}
        options={columnWidthOptions}
      />

      <SelectField
        label="Maximum Distance Between Columns (Optional)"
        value={formData.maxDistance}
        onChange={(value) => setFormData(prev => ({ ...prev, maxDistance: value }))}
        options={distanceOptions}
      />

      <SelectField
        label="Deviation Tolerance Threshold (Optional)"
        value={formData.deviationTolerance}
        onChange={(value) => setFormData(prev => ({ ...prev, deviationTolerance: value }))}
        options={toleranceOptions}
      />
    </div>
  );
};

export default ParameterForm;