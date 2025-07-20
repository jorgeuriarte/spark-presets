import React from 'react';
import PresetViewer from '../components/PresetViewer';
import { Preset } from '../types/preset';

// Datos de ejemplo para la demo
const demoPreset: Preset = {
  meta: {
    id: 'demo-1',
    name: 'Stone Breaker Blues',
    description: 'Warm blues tone with classic overdrive and ambient effects',
    version: '0.7',
    icon: 'icon.png'
  },
  type: 'jamup_speaker',
  bpm: 120,
  sigpath: [
    {
      dspId: 'NoiseGate',
      params: [
        { value: 0.316 },
        { value: 0.244 }
      ]
    },
    {
      dspId: 'Comp',
      params: [
        { value: 0.5 },
        { value: 0.7 }
      ]
    },
    {
      dspId: 'TS9',
      params: [
        { value: 0.65 },
        { value: 0.5 },
        { value: 0.7 }
      ]
    },
    {
      dspId: 'TwoStoneSP50',
      params: [
        { value: 0.5 },
        { value: 0.5 },
        { value: 0.5 },
        { value: 0.5 },
        { value: 0.5 }
      ]
    },
    {
      dspId: 'Tremolo',
      params: [
        { value: 0 }, // Bypassed
        { value: 0 },
        { value: 0 }
      ]
    },
    {
      dspId: 'Echotape',
      params: [
        { value: 0.25 },
        { value: 0.4 },
        { value: 0.6 }
      ]
    },
    {
      dspId: 'Plate',
      params: [
        { value: 0.3 },
        { value: 0.4 }
      ]
    }
  ]
};

const demoPreset2: Preset = {
  meta: {
    id: 'demo-2',
    name: 'Metal Mayhem',
    description: 'Heavy distortion with tight gate for chugging riffs',
    version: '0.7',
    icon: 'icon.png'
  },
  type: 'jamup_speaker',
  bpm: 140,
  sigpath: [
    {
      dspId: 'NoiseGate',
      params: [
        { value: 0.7 },
        { value: 0.3 }
      ]
    },
    {
      dspId: 'BlackOp',
      params: [
        { value: 0.8 },
        { value: 0.7 },
        { value: 0.9 }
      ]
    },
    {
      dspId: 'Crush',
      params: [
        { value: 0.6 },
        { value: 0.5 },
        { value: 0.7 },
        { value: 0.8 },
        { value: 0.5 }
      ]
    },
    {
      dspId: 'Plate',
      params: [
        { value: 0.15 },
        { value: 0.2 }
      ]
    }
  ]
};

const demoPreset3: Preset = {
  meta: {
    id: 'demo-3',
    name: 'Clean Jazz',
    description: 'Pristine clean tone with chorus and reverb',
    version: '0.7',
    icon: 'icon.png'
  },
  type: 'jamup_speaker',
  bpm: 90,
  sigpath: [
    {
      dspId: 'LAComp',
      params: [
        { value: 0.4 },
        { value: 0.6 }
      ]
    },
    {
      dspId: 'RolandJC120',
      params: [
        { value: 0.5 },
        { value: 0.5 },
        { value: 0.5 },
        { value: 0.5 },
        { value: 0.5 }
      ]
    },
    {
      dspId: 'DigitalChorus',
      params: [
        { value: 0.3 },
        { value: 0.5 },
        { value: 0.7 }
      ]
    },
    {
      dspId: 'RoomStudioA',
      params: [
        { value: 0.35 },
        { value: 0.4 }
      ]
    }
  ]
};

export const PresetViewerDemo: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = React.useState<Preset>(demoPreset);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Preset Viewer Demo</h1>
          <p className="text-gray-600 mt-2">
            Demostración del componente PresetViewer con visualización de sprites
          </p>
        </div>

        {/* Preset selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Selecciona un preset de ejemplo:</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedPreset(demoPreset)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedPreset.meta.id === 'demo-1' 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold">{demoPreset.meta.name}</h3>
              <p className="text-sm text-gray-600">{demoPreset.meta.description}</p>
            </button>
            
            <button
              onClick={() => setSelectedPreset(demoPreset2)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedPreset.meta.id === 'demo-2' 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold">{demoPreset2.meta.name}</h3>
              <p className="text-sm text-gray-600">{demoPreset2.meta.description}</p>
            </button>
            
            <button
              onClick={() => setSelectedPreset(demoPreset3)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedPreset.meta.id === 'demo-3' 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold">{demoPreset3.meta.name}</h3>
              <p className="text-sm text-gray-600">{demoPreset3.meta.description}</p>
            </button>
          </div>
        </div>

        {/* Preset Viewer */}
        <div className="bg-white rounded-lg shadow">
          <PresetViewer preset={selectedPreset} />
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> Esta es una demo del componente PresetViewer. 
                Los sprites se cargan desde la imagen <code>full_image_map.jpg</code> usando las coordenadas mapeadas.
                Los efectos activos se muestran con colores brillantes, mientras que los bypassed aparecen atenuados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};