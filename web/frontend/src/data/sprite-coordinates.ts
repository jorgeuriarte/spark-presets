// Sprite coordinates for amplifiers and effects
// Image base: full_image_map.jpg (1920x1080)

export interface SpriteCoordinate {
  name: string;
  dspId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  category?: string;
  row?: string;
}

export interface AmplifierCoordinates {
  [key: string]: SpriteCoordinate[];
}

export interface EffectCoordinates {
  [key: string]: SpriteCoordinate[];
}

export const amplifierCoordinates: AmplifierCoordinates = {
  clean: [
    { name: "Silver 120", dspId: "RolandJC120", row: "clean", x: 22, y: 71, width: 150, height: 64 },
    { name: "Black Duo", dspId: "BlackDuo", row: "clean", x: 187, y: 69, width: 153, height: 67 },
    { name: "AD Clean", dspId: "ADClean", row: "clean", x: 353, y: 68, width: 157, height: 68 },
    { name: "Match DC", dspId: "MatchDC", row: "clean", x: 520, y: 66, width: 157, height: 69 }
  ],
  glassy: [
    { name: "Sunny 3000", dspId: "Sunny3000", row: "glassy", x: 17, y: 216, width: 156, height: 70 },
    { name: "AC Boost", dspId: "ACBoost", row: "glassy", x: 186, y: 216, width: 156, height: 70 },
    { name: "Checkmate", dspId: "Checkmate", row: "glassy", x: 353, y: 217, width: 156, height: 70 },
    { name: "Two Stone SP50", dspId: "TwoStoneSP50", row: "glassy", x: 519, y: 216, width: 156, height: 70 }
  ],
  crunch: [
    { name: "Tweed Lux", dspId: "TweedLux", row: "crunch", x: 20, y: 367, width: 156, height: 70 },
    { name: "Plexi", dspId: "Plexi", row: "crunch", x: 185, y: 365, width: 156, height: 70 },
    { name: "JM45", dspId: "JM45", row: "crunch", x: 352, y: 367, width: 156, height: 70 },
    { name: "Bluesbreaker", dspId: "Bluesbreaker", row: "crunch", x: 520, y: 367, width: 156, height: 70 }
  ],
  highGain: [
    { name: "RB 101", dspId: "RB101", row: "highGain", x: 20, y: 518, width: 157, height: 70 },
    { name: "Silverline", dspId: "Silverline", row: "highGain", x: 186, y: 517, width: 154, height: 72 },
    { name: "YJM100", dspId: "YJM100", row: "highGain", x: 354, y: 521, width: 152, height: 73 },
    { name: "Solo 100", dspId: "Solo100", row: "highGain", x: 523, y: 516, width: 155, height: 72 },
    { name: "Rectified", dspId: "Rectified", row: "highGain", x: 690, y: 519, width: 151, height: 69 }
  ],
  metal: [
    { name: "Crush", dspId: "Crush", row: "metal", x: 20, y: 669, width: 155, height: 71 },
    { name: "Treadplate", dspId: "Treadplate", row: "metal", x: 187, y: 669, width: 155, height: 67 },
    { name: "PowerStage", dspId: "PowerStage", row: "metal", x: 355, y: 669, width: 151, height: 71 },
    { name: "Rocker V", dspId: "RockerV", row: "metal", x: 521, y: 670, width: 153, height: 69 },
    { name: "Line 6", dspId: "Line6", row: "metal", x: 689, y: 669, width: 151, height: 70 }
  ],
  acoustic: [
    { name: "Jumbo", dspId: "AcousticAmpV2", row: "acoustic", x: 20, y: 820, width: 156, height: 68 },
    { name: "Fishboy", dspId: "Fishboy", row: "acoustic", x: 188, y: 821, width: 155, height: 68 },
    { name: "Natural", dspId: "Natural", row: "acoustic", x: 354, y: 823, width: 155, height: 68 },
    { name: "AG Club", dspId: "AGClub", row: "acoustic", x: 521, y: 822, width: 155, height: 67 }
  ]
};

export const effectCoordinates: EffectCoordinates = {
  gate: [
    { name: "Noise Gate", dspId: "NoiseGate", category: "gate", x: 1367, y: 448, width: 61, height: 101 }
  ],
  compressor: [
    { name: "LA Comp", dspId: "LAComp", category: "compressor", x: 1506, y: 447, width: 61, height: 101 },
    { name: "Sustainer", dspId: "Sustainer", category: "compressor", x: 1577, y: 448, width: 95, height: 102 },
    { name: "Red Comp", dspId: "RedComp", category: "compressor", x: 1682, y: 447, width: 65, height: 102 },
    { name: "Odar", dspId: "Odar", category: "compressor", x: 1756, y: 446, width: 63, height: 102 },
    { name: "Comp", dspId: "Comp", category: "compressor", x: 1826, y: 448, width: 62, height: 102 }
  ],
  drive: [
    { name: "Booster", dspId: "Booster", category: "drive", x: 1275, y: 572, width: 55, height: 102 },
    { name: "Tube Drive", dspId: "TubeDrive", category: "drive", x: 1340, y: 572, width: 58, height: 102 },
    { name: "Over Drive", dspId: "OverDrive", category: "drive", x: 1410, y: 573, width: 58, height: 102 },
    { name: "Fuzz", dspId: "Fuzz", category: "drive", x: 1478, y: 572, width: 60, height: 102 },
    { name: "Black Op", dspId: "BlackOp", category: "drive", x: 1551, y: 572, width: 60, height: 102 },
    { name: "Bass Muff", dspId: "BassMuff", category: "drive", x: 1621, y: 571, width: 60, height: 102 },
    { name: "Guitar Muff", dspId: "GuitarMuff", category: "drive", x: 1691, y: 574, width: 60, height: 102 },
    { name: "Bassmaster", dspId: "Bassmaster", category: "drive", x: 1763, y: 573, width: 60, height: 102 },
    { name: "Sab Driver", dspId: "SabDriver", category: "drive", x: 1832, y: 571, width: 60, height: 102 }
  ],
  modulation: [
    { name: "Tremolo", dspId: "Tremolo", category: "modulation", x: 1171, y: 700, width: 60, height: 102 },
    { name: "Digital Chorus", dspId: "DigitalChorus", category: "modulation", x: 1243, y: 697, width: 94, height: 102 },
    { name: "Flanger", dspId: "Flanger", category: "modulation", x: 1349, y: 696, width: 59, height: 105 },
    { name: "Phaser", dspId: "Phaser", category: "modulation", x: 1418, y: 696, width: 60, height: 104 },
    { name: "Vibrato", dspId: "Vibrato", category: "modulation", x: 1490, y: 697, width: 60, height: 104 },
    { name: "Vibe", dspId: "Vibe", category: "modulation", x: 1560, y: 696, width: 60, height: 104 },
    { name: "Cloner", dspId: "Cloner", category: "modulation", x: 1631, y: 697, width: 56, height: 102 },
    { name: "Mini Vibe", dspId: "MiniVibe", category: "modulation", x: 1698, y: 699, width: 56, height: 101 },
    { name: "Tremolator", dspId: "Tremolator", category: "modulation", x: 1765, y: 698, width: 58, height: 101 },
    { name: "Trance Synth", dspId: "TranceSync", category: "modulation", x: 1835, y: 699, width: 58, height: 101 }
  ],
  delay: [
    { name: "Digital Delay", dspId: "DigitalDelay", category: "delay", x: 1298, y: 824, width: 94, height: 101 },
    { name: "Delay Echo", dspId: "DelayEcho", category: "delay", x: 1405, y: 825, width: 94, height: 101 },
    { name: "Vintage Delay", dspId: "VintageDelay", category: "delay", x: 1512, y: 823, width: 60, height: 101 },
    { name: "Reverse", dspId: "Reverse", category: "delay", x: 1583, y: 825, width: 92, height: 101 },
    { name: "Multi Head", dspId: "MultiHead", category: "delay", x: 1692, y: 823, width: 92, height: 101 },
    { name: "Echotape", dspId: "Echotape", category: "delay", x: 1797, y: 825, width: 95, height: 101 }
  ],
  reverb: [
    { name: "Room Studio A", dspId: "RoomStudioA", category: "reverb", x: 928, y: 949, width: 95, height: 101 },
    { name: "Chamber", dspId: "Chamber", category: "reverb", x: 1038, y: 949, width: 95, height: 101 },
    { name: "Hall Natural", dspId: "HallNatural", category: "reverb", x: 1146, y: 950, width: 95, height: 101 },
    { name: "Plate", dspId: "Plate", category: "reverb", x: 1255, y: 949, width: 95, height: 101 },
    { name: "Ambience", dspId: "Ambience", category: "reverb", x: 1361, y: 949, width: 95, height: 101 },
    { name: "Classic Plate", dspId: "ClassicPlate", category: "reverb", x: 1469, y: 950, width: 95, height: 101 },
    { name: "Holy Grail", dspId: "HolyGrail", category: "reverb", x: 1577, y: 951, width: 95, height: 101 },
    { name: "Reflection", dspId: "Reflection", category: "reverb", x: 1685, y: 952, width: 95, height: 101 },
    { name: "Room Studio B", dspId: "RoomStudioB", category: "reverb", x: 1791, y: 951, width: 95, height: 101 }
  ]
};

// Create mapping from dspId to coordinates
export const dspIdToSprite: { [key: string]: SpriteCoordinate } = {};

// Add amplifiers
Object.values(amplifierCoordinates).forEach(category => {
  category.forEach(amp => {
    dspIdToSprite[amp.dspId] = amp;
  });
});

// Add effects
Object.values(effectCoordinates).forEach(category => {
  category.forEach(effect => {
    dspIdToSprite[effect.dspId] = effect;
  });
});

// Map of alternative DSP IDs to canonical ones
const alternativeDspIds: { [key: string]: string } = {
  // Noise Gates
  'bias.noisegate': 'NoiseGate',
  
  // Compressors
  'LA2AComp': 'LAComp',
  'BlueComp': 'Sustainer',
  'Compressor': 'RedComp',
  'BassComp': 'Comp',
  'BBEOpticalComp': 'Comp',
  
  // Drives
  'DistortionTS9': 'TubeDrive',
  'TS9': 'TubeDrive',
  'Overdrive': 'OverDrive',
  'ProCoRat': 'BlackOp',
  'BassBigMuff': 'BassMuff',
  'MaestroBassmaster': 'Bassmaster',
  'SABDriver': 'SabDriver',
  'SABdriver': 'SabDriver', // Note the lowercase 'd'
  
  // Amps
  'Twin': 'BlackDuo',
  '94MatchDCV2': 'MatchDC',
  'ODS50CN': 'Sunny3000',
  'BluesJrTweed': 'TwoStoneSP50',
  'Bassman': 'TwoStoneSP50',
  'AC Boost': 'ACBoost',
  'Plexiglas': 'Plexi',
  'OverDrivenJM45': 'JM45',
  'OverDrivenLuxVerb': 'Bluesbreaker',
  'Bogner': 'RB101',
  'OrangeAD30': 'Silverline',
  'AmericanHighGain': 'Solo100',
  'SLO100': 'Solo100',
  'Rectifier': 'Treadplate',
  'EVH': 'PowerStage',
  '6505Plus': 'PowerStage',
  'SwitchAxeLead': 'PowerStage',
  'Invader': 'RockerV',
  'BE101': 'RockerV',
  'Acoustic': 'AcousticAmpV2',
  'AcousticAmp': 'AcousticAmpV2',
  
  // Bass Amps
  'W600': 'Bassman',
  'GK800': 'Bassman',
  'Hammer500': 'Bassman',
  
  // Jimi Hendrix specific
  'JH.Vox846': 'Vibe', // Vox Wah
  'JH.AxisFuzz': 'Fuzz',
  'JH.SuperLead100': 'Plexi',
  'JH.SuperLeadFull': 'Plexi',
  'JH.VoodooVibeJr': 'Vibe',
  
  // Modulation
  'ChorusAnalog': 'DigitalChorus',
  'Chorus': 'DigitalChorus',
  'UniVibe': 'Vibe',
  'RingModulator': 'Tremolator',
  
  // Delays
  'DelayMono': 'DigitalDelay',
  'DelayEchoFilt': 'DelayEcho',
  'EchoFilter': 'DelayEcho', // Echo Filter
  'DelayReverse': 'Reverse',
  'DelayMultiHead': 'MultiHead',
  'DelayAnalog': 'Echotape',
  'DelayRe201': 'VintageDelay', // Roland RE-201 Space Echo
  
  // Reverbs
  'bias.reverb': 'RoomStudioA',
  'RoomReverb': 'RoomStudioA',
  'PlateReverb': 'Plate',
  'SpringReverb': 'Spring',
  'Room': 'RoomStudioA',
  'Hall': 'HallNatural',
  'Stadium': 'HallNatural',
  'Cathedral': 'HallNatural',
  'AmbientReverb': 'Ambience',
  'VintageRoom': 'ClassicPlate'
};

// Helper functions
export function getSpriteByDspId(dspId: string): SpriteCoordinate | null {
  // First try direct lookup
  if (dspIdToSprite[dspId]) {
    return dspIdToSprite[dspId];
  }
  
  // Then try alternative IDs
  const canonicalId = alternativeDspIds[dspId];
  if (canonicalId && dspIdToSprite[canonicalId]) {
    return dspIdToSprite[canonicalId];
  }
  
  return null;
}

export function generateSpriteStyle(dspId: string): React.CSSProperties | null {
  const sprite = getSpriteByDspId(dspId);
  if (!sprite) return null;
  
  return {
    backgroundImage: 'url("/full_image_map.jpg")',
    backgroundPosition: `-${sprite.x}px -${sprite.y}px`,
    backgroundRepeat: 'no-repeat',
    width: `${sprite.width}px`,
    height: `${sprite.height}px`,
    display: 'inline-block'
  };
}

// Signal chain order
export const signalChainOrder = [
  'gate',
  'compressor',
  'drive',
  'amp',
  'modulation',
  'delay',
  'reverb'
];