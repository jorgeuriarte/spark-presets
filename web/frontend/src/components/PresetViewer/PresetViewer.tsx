import React, { useState, useRef, useEffect } from 'react';
import { PresetWithEffects, SignalPathItem } from '../../types/preset';
import { getSpriteByDspId, generateSpriteStyle } from '../../data/sprite-coordinates';
import { getDisplayName } from '../../data/dsp-mappings';
import './PresetViewer.css';

interface PresetViewerProps {
  preset: PresetWithEffects;
}

interface EffectTooltipProps {
  effect: SignalPathItem;
  sprite: any;
  isActive: boolean;
}

const EffectTooltip: React.FC<EffectTooltipProps> = ({ effect, sprite, isActive }) => {
  const formatParamValue = (value: number, index: number): string => {
    // Format parameter values based on effect type and parameter index
    const percentage = Math.round(value * 100);
    return `${percentage}%`;
  };

  const getParamName = (index: number, spriteName: string): string => {
    // Map parameter indices to names based on effect type
    const paramNames: { [key: string]: string[] } = {
      // Compressors
      'Compressor': ['Sensitivity', 'Attack', 'Squash'],
      'LA Comp': ['Peak Reduction', 'Gain'],
      'Red Comp': ['Sensitivity', 'Attack', 'Squash'],
      'Bass Comp': ['Sensitivity', 'Attack', 'Tone'],
      'Sustainer': ['Sustain', 'Level'],
      
      // Noise Gates
      'Noise Gate': ['Threshold', 'Decay'],
      
      // Drives/Distortion
      'Overdrive': ['Drive', 'Tone', 'Level'],
      'Over Drive': ['Drive', 'Tone', 'Level'],
      'Distortion': ['Drive', 'Tone', 'Level'],
      'Tube Drive': ['Drive', 'Tone', 'Level'],
      'Fuzz': ['Fuzz', 'Level'],
      'Fuzz Face': ['Fuzz', 'Level'],
      'Black Op': ['Distortion', 'Filter', 'Volume'],
      'Bass Muff': ['Sustain', 'Tone', 'Volume'],
      'Guitar Muff': ['Sustain', 'Tone', 'Volume'],
      'Booster': ['Gain'],
      'SAB Driver': ['Drive', 'Tone', 'Level'],
      
      // Modulation
      'Chorus': ['Depth', 'Frequency', 'Mix'],
      'Digital Chorus': ['Depth', 'Frequency', 'Mix'],
      'Flanger': ['Depth', 'Frequency', 'Mix'],
      'Phaser': ['Depth', 'Frequency', 'Mix'],
      'Tremolo': ['Depth', 'Frequency'],
      'Vibrato': ['Depth', 'Frequency'],
      'Vibe': ['Speed', 'Depth', 'Mix'],
      'Mini Vibe': ['Speed', 'Depth', 'Mix'],
      'Uni Vibe': ['Speed', 'Depth', 'Mix'],
      'Voodoo Vibe Jr': ['Speed', 'Depth', 'Mix'],
      
      // Delays
      'Delay': ['Time', 'Feedback', 'Mix'],
      'Digital Delay': ['Time', 'Feedback', 'Mix'],
      'Vintage Delay': ['Time', 'Feedback', 'Mix'],
      'Delay Echo': ['Time', 'Feedback', 'Mix'],
      'Echo Filter': ['Time', 'Feedback', 'Filter', 'Mix'],
      'RE-201 Space Echo': ['Time', 'Feedback', 'Intensity', 'Mix'],
      'Multi Head': ['Time 1', 'Time 2', 'Feedback', 'Mix'],
      
      // Reverbs
      'Reverb': ['Decay', 'Pre-Delay', 'Mix'],
      'Room Reverb': ['Decay', 'Pre-Delay', 'Mix'],
      'Plate Reverb': ['Decay', 'Pre-Delay', 'Mix'],
      'Spring Reverb': ['Decay', 'Pre-Delay', 'Mix'],
      'Hall': ['Decay', 'Pre-Delay', 'Mix'],
      'Chamber': ['Decay', 'Pre-Delay', 'Mix'],
      'Studio A': ['Decay', 'Pre-Delay', 'Mix'],
      
      // Amplifiers (basic controls)
      'Default': ['Gain', 'Bass', 'Mid', 'Treble', 'Volume']
    };

    // Try to find exact match first
    let effectParams = paramNames[spriteName];
    
    // If not found, try to match by effect type
    if (!effectParams) {
      const upperName = spriteName.toUpperCase();
      if (upperName.includes('VIBE')) {
        effectParams = paramNames['Vibe'];
      } else if (upperName.includes('DELAY')) {
        effectParams = paramNames['Delay'];
      } else if (upperName.includes('REVERB')) {
        effectParams = paramNames['Reverb'];
      } else if (upperName.includes('CHORUS')) {
        effectParams = paramNames['Chorus'];
      } else if (upperName.includes('COMP')) {
        effectParams = paramNames['Compressor'];
      } else if (upperName.includes('DRIVE') || upperName.includes('DIST')) {
        effectParams = paramNames['Overdrive'];
      }
    }
    
    effectParams = effectParams || paramNames['Default'] || [];
    return effectParams[index] || `Param ${index + 1}`;
  };

  return (
    <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg ml-2 w-48">
      <div className="text-sm font-medium mb-2">
        {getDisplayName(effect.dspId)}
        {!isActive && <div className="text-xs text-red-400 mt-0.5">(disabled)</div>}
      </div>
      <div className="space-y-1">
        {effect.params.map((param, index) => (
          <div key={index} className="flex justify-between text-xs">
            <span className="text-gray-300">{getParamName(index, sprite.name)}:</span>
            <span className="font-mono">{formatParamValue(param.value, index)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PresetViewer: React.FC<PresetViewerProps> = ({ preset }) => {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const effectRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  if (!preset.sigpath || preset.sigpath.length === 0) {
    return (
      <div className="preset-viewer-error">
        <p className="text-gray-400">No signal path data available for this preset</p>
      </div>
    );
  }

  const signalPath = preset.sigpath;

  // Use the original order from the preset - don't sort
  const orderedEffects = [...signalPath];

  const handleEffectClick = (index: number, event: React.MouseEvent) => {
    if (activeTooltip === index) {
      setActiveTooltip(null);
      setTooltipPosition(null);
    } else {
      setActiveTooltip(index);
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setTooltipPosition({
        x: rect.right + 10,
        y: rect.top
      });
    }
  };

  return (
    <div className="preset-viewer">
      <div className="signal-chain flex items-center gap-2 flex-wrap">
        {orderedEffects.map((effect, index) => {
          const sprite = getSpriteByDspId(effect.dspId);
          const style = generateSpriteStyle(effect.dspId);
          
          if (!sprite || !style) {
            // Check if effect is active based on active/isEnabled fields first, then params
            const isActive = effect.active !== false && effect.isEnabled !== false && 
                            effect.params && effect.params.length > 0 && 
                            effect.params.some(p => p.value > 0);
            const effectClass = `effect-item unknown ${isActive ? 'active' : 'bypassed'}`;
            
            return (
              <React.Fragment key={index}>
                {index > 0 && <div className="signal-arrow text-gray-400">→</div>}
                <div 
                  className={`${effectClass} relative cursor-pointer`}
                  onClick={(e) => handleEffectClick(index, e)}
                  ref={(el) => { effectRefs.current[index] = el; }}
                >
                  <div className="effect-placeholder">?</div>
                  <span className="effect-name text-xs">
                    {getDisplayName(effect.dspId)}
                  </span>
                </div>
              </React.Fragment>
            );
          }

          // Check if effect is active based on active/isEnabled fields first, then params
          const isActive = effect.active !== false && effect.isEnabled !== false && 
                          effect.params && effect.params.length > 0 && 
                          effect.params.some(p => p.value > 0);
          const effectClass = `effect-item ${isActive ? 'active' : 'bypassed'}`;

          return (
            <React.Fragment key={index}>
              {index > 0 && <div className="signal-arrow text-gray-400">→</div>}
              <div 
                className={`${effectClass} relative cursor-pointer`}
                onClick={(e) => handleEffectClick(index, e)}
                ref={(el) => { effectRefs.current[index] = el; }}
              >
                <div 
                  className="effect-sprite" 
                  style={style}
                />
                <span className="effect-name text-xs">
                  {getDisplayName(effect.dspId)}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Render tooltip with fixed positioning to avoid opacity inheritance */}
      {activeTooltip !== null && tooltipPosition && orderedEffects[activeTooltip] && (
        <div 
          className="fixed" 
          style={{ 
            position: 'fixed',
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            zIndex: 99999,
            pointerEvents: 'none'
          }}
        >
          {(() => {
            const effect = orderedEffects[activeTooltip];
            const sprite = getSpriteByDspId(effect.dspId);
            const isActive = effect.active !== false && effect.isEnabled !== false && 
                            effect.params && effect.params.length > 0 && 
                            effect.params.some(p => p.value > 0);
            return (
              <EffectTooltip 
                effect={effect} 
                sprite={sprite || { name: getDisplayName(effect.dspId) }} 
                isActive={isActive} 
              />
            );
          })()}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Efectos activos:</span>
          <span className="ml-2 font-medium">
            {orderedEffects.filter(e => 
              e.active !== false && e.isEnabled !== false && 
              e.params?.some(p => p.value > 0)
            ).length} de {signalPath.length}
          </span>
        </div>
        {preset.bpm && (
          <div>
            <span className="text-gray-400">BPM:</span>
            <span className="ml-2 font-medium">{preset.bpm}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export { PresetViewer };
export default PresetViewer;