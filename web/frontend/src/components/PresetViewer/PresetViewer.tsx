import React from 'react';
import { Preset, SignalPathItem } from '../../types/preset';
import { getSpriteByDspId, generateSpriteStyle } from '../../data/sprite-coordinates';
import './PresetViewer.css';

interface PresetViewerProps {
  preset: Preset;
}

const PresetViewer: React.FC<PresetViewerProps> = ({ preset }) => {
  if (!preset.sigpath || preset.sigpath.length === 0) {
    return (
      <div className="preset-viewer-error">
        <p>No signal path data available for this preset</p>
      </div>
    );
  }

  const signalPath = preset.sigpath;

  // Order effects according to signal chain
  const orderedEffects = signalPath.sort((a, b) => {
    const aSprite = getSpriteByDspId(a.dspId);
    const bSprite = getSpriteByDspId(b.dspId);
    
    const aType = aSprite?.category || aSprite?.row || 'unknown';
    const bType = bSprite?.category || bSprite?.row || 'unknown';
    
    // Map amp rows to 'amp' category for sorting
    const getCategory = (type: string) => {
      if (['clean', 'glassy', 'crunch', 'highGain', 'metal', 'acoustic', 'bass'].includes(type)) {
        return 'amp';
      }
      return type;
    };
    
    const signalOrder = ['gate', 'compressor', 'drive', 'amp', 'modulation', 'delay', 'reverb'];
    const aIndex = signalOrder.indexOf(getCategory(aType));
    const bIndex = signalOrder.indexOf(getCategory(bType));
    
    return aIndex - bIndex;
  });

  return (
    <div className="preset-viewer">
      <div className="preset-header">
        <h2>{preset.meta.name}</h2>
        {preset.meta.description && <p className="preset-description">{preset.meta.description}</p>}
      </div>

      <div className="signal-chain">
        {orderedEffects.map((effect, index) => {
          const sprite = getSpriteByDspId(effect.dspId);
          const style = generateSpriteStyle(effect.dspId);
          
          if (!sprite || !style) {
            return (
              <div key={index} className="effect-item unknown">
                <div className="effect-placeholder">?</div>
                <span className="effect-name">{effect.dspId}</span>
              </div>
            );
          }

          const isActive = effect.params && effect.params.length > 0 && 
                          effect.params.some(p => p.value > 0);
          const effectClass = `effect-item ${isActive ? 'active' : 'bypassed'}`;

          return (
            <React.Fragment key={index}>
              {index > 0 && <div className="signal-arrow">→</div>}
              <div className={effectClass}>
                <div 
                  className="effect-sprite" 
                  style={style}
                  title={sprite.name}
                />
                <span className="effect-name">{sprite.name}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="preset-details">
        <div className="detail-section">
          <h3>Preset Info</h3>
          <div className="info-grid">
            {preset.bpm && (
              <div className="info-item">
                <span className="info-label">BPM:</span>
                <span className="info-value">{preset.bpm}</span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Type:</span>
              <span className="info-value">{preset.type || 'Unknown'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Version:</span>
              <span className="info-value">{preset.meta.version || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Effects:</span>
              <span className="info-value">{signalPath.length}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Active Effects</h3>
          <div className="effects-list">
            {orderedEffects.map((effect, index) => {
              const sprite = getSpriteByDspId(effect.dspId);
              const isActive = effect.params && effect.params.length > 0 && 
                             effect.params.some(p => p.value > 0);
              
              return (
                <div key={index} className={`effect-list-item ${isActive ? 'active' : 'bypassed'}`}>
                  <span className="effect-number">{index + 1}.</span>
                  <span className="effect-name">{sprite?.name || effect.dspId}</span>
                  <span className="effect-status">{isActive ? '✓' : '○'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresetViewer;