import React, { useState, useRef, useEffect } from 'react';
import { PresetWithEffects, SignalPathItem } from '../../types/preset';
import { getSpriteByDspId, generateSpriteStyle } from '../../data/sprite-coordinates';
import { getDisplayName } from '../../data/dsp-mappings';
import './PresetViewer.css';

interface PresetViewerProps {
  preset: PresetWithEffects;
  mode?: 'compact' | 'expanded';
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

const PresetViewer: React.FC<PresetViewerProps> = ({ preset, mode = 'expanded' }) => {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const effectRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click was outside all effect elements
      const clickedOnEffect = effectRefs.current.some(ref => 
        ref && ref.contains(event.target as Node)
      );
      
      if (!clickedOnEffect && activeTooltip !== null) {
        setActiveTooltip(null);
        setTooltipPosition(null);
      }
    };

    // Add event listener when component mounts
    document.addEventListener('click', handleClickOutside);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeTooltip]);
  
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
    event.stopPropagation();
    
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

  // Effect colors for badges
  const getEffectColor = (dspId: string) => {
    const name = getDisplayName(dspId);
    const upperName = name.toUpperCase();
    
    // Drives & Distortions
    if (upperName.includes('OVERDRIVE') || upperName.includes('DRIVE') || upperName.includes('TUBE') || upperName.includes('BOOSTER')) {
      return 'bg-blue-900/30 text-blue-400 border-blue-700';
    }
    if (upperName.includes('DISTORTION') || upperName.includes('FUZZ') || upperName.includes('MUFF') || upperName.includes('BLACK OP')) {
      return 'bg-red-900/30 text-red-400 border-red-700';
    }
    
    // Time-based effects
    if (upperName.includes('DELAY') || upperName.includes('ECHO')) {
      return 'bg-green-900/30 text-green-400 border-green-700';
    }
    if (upperName.includes('REVERB') || upperName.includes('HALL') || upperName.includes('ROOM') || upperName.includes('PLATE') || upperName.includes('SPRING')) {
      return 'bg-yellow-900/30 text-yellow-400 border-yellow-700';
    }
    
    // Modulation
    if (upperName.includes('CHORUS') || upperName.includes('FLANGER') || upperName.includes('PHASER') || upperName.includes('VIBRATO') || upperName.includes('VIBE') || upperName.includes('TREMOLO')) {
      return 'bg-purple-900/30 text-purple-400 border-purple-700';
    }
    
    // Dynamics
    if (upperName.includes('COMP') || upperName.includes('SUSTAINER')) {
      return 'bg-gray-700 text-gray-300 border-gray-600';
    }
    if (upperName.includes('GATE')) {
      return 'bg-indigo-900/30 text-indigo-400 border-indigo-700';
    }
    
    // Amplifiers
    if (dspId.includes('Amp') || upperName.includes('TWIN') || upperName.includes('PLEXI') || upperName.includes('JCM') || upperName.includes('ACOUSTIC')) {
      return 'bg-orange-900/30 text-orange-400 border-orange-700';
    }
    
    return 'bg-gray-700 text-gray-300 border-gray-600'; // default
  };


  return (
    <div className="preset-viewer">
      <div className="signal-chain flex items-center gap-2 flex-wrap">
        {orderedEffects.map((effect, index) => {
          const sprite = getSpriteByDspId(effect.dspId);
          const style = generateSpriteStyle(effect.dspId);
          const isActive = effect.active !== false && effect.isEnabled !== false && 
                          effect.params && effect.params.length > 0 && 
                          effect.params.some(p => p.value > 0);
          const effectName = getDisplayName(effect.dspId);
          const effectColor = getEffectColor(effect.dspId);
          
          return (
            <React.Fragment key={index}>
              {/* Show arrows only in expanded mode */}
              {index > 0 && mode === 'expanded' && (
                <div className="signal-arrow text-gray-400">→</div>
              )}
              
              <div className="effect-item-container">
                {/* Show sprite/placeholder only in expanded mode */}
                {mode === 'expanded' && (
                  <div 
                    className={`effect-item ${isActive ? 'active' : 'bypassed'} relative cursor-pointer`}
                    onClick={(e) => handleEffectClick(index, e)}
                    ref={(el) => { effectRefs.current[index] = el; }}
                  >
                    {(!sprite || !style) ? (
                      <div className="effect-placeholder">?</div>
                    ) : (
                      <div 
                        className="effect-sprite" 
                        style={style}
                      />
                    )}
                  </div>
                )}
                
                {/* Always show badge as the name */}
                <span
                  onClick={(e) => handleEffectClick(index, e)}
                  ref={(el) => { effectRefs.current[index] = el as any; }}
                  className={`px-2 py-0.5 text-xs font-medium rounded-full border cursor-pointer transition-all inline-block mt-1 ${
                    effectColor
                  } ${!isActive ? 'opacity-40 line-through' : ''} ${
                    activeTooltip === index ? 'ring-2 ring-blue-400' : ''
                  }`}
                >
                  {effectName}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Stats section */}
      <div className="mt-3 text-sm text-gray-400">
        <span>
          {orderedEffects.filter(e => 
            e.active !== false && e.isEnabled !== false && 
            e.params?.some(p => p.value > 0)
          ).length} de {signalPath.length} efectos activos
        </span>
        {preset.bpm && <span className="ml-4">BPM: {preset.bpm}</span>}
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
    </div>
  );
};

export { PresetViewer };
export default PresetViewer;