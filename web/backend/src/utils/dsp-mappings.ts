// Complete DSP ID to Display Name mappings
// Based on Spark amp effect names and Ignitron project

export const dspIdToDisplayName: { [key: string]: string } = {
  // Noise Gates
  'bias.noisegate': 'Noise Gate',
  'NoiseGate': 'Noise Gate',
  
  // Compressors
  'LA2AComp': 'LA Comp',
  'LAComp': 'LA Comp',
  'BlueComp': 'Sustain Comp',
  'Compressor': 'Red Comp',
  'RedComp': 'Red Comp',
  'BassComp': 'Bass Comp',
  'BBEOpticalComp': 'Optical Comp',
  'Comp': 'Compressor',
  'Sustainer': 'Sustainer',
  'Odar': 'Odar',
  
  // Drives/Distortion
  'Booster': 'Booster',
  'KlonCentaurSilver': 'Clone Drive',
  'DistortionTS9': 'Tube Drive',
  'TubeDrive': 'Tube Drive',
  'TS9': 'Tube Drive',
  'Overdrive': 'Over Drive',
  'OverDrive': 'Over Drive',
  'Fuzz': 'Fuzz Face',
  'ProCoRat': 'Black Op',
  'BlackOp': 'Black Op',
  'BassBigMuff': 'Bass Muff',
  'BassMuff': 'Bass Muff',
  'GuitarMuff': 'Guitar Muff',
  'MaestroBassmaster': 'Bassmaster',
  'Bassmaster': 'Bassmaster',
  'SABDriver': 'SAB Driver',
  'SabDriver': 'SAB Driver',
  
  // Amplifiers - Clean
  'RolandJC120': 'Silver 120',
  'Twin': 'Black Duo',
  'BlackDuo': 'Black Duo',
  'ADClean': 'AD Clean',
  '94MatchDCV2': 'Match DC',
  'MatchDC': 'Match DC',
  
  // Amplifiers - Glassy
  'ODS50CN': 'ODS 50',
  'Sunny3000': 'Sunny 3000',
  'BluesJrTweed': 'Blues Boy',
  'Bassman': 'Tweed Bass',
  'ACBoost': 'AC Boost',
  'AC Boost': 'AC Boost',
  'Checkmate': 'Checkmate',
  'TwoStoneSP50': 'Two Stone SP50',
  
  // Amplifiers - Crunch
  'TweedLux': 'Tweed Lux',
  'Deluxe65': 'American Deluxe',
  'Plexi': 'Plexiglas',
  'Plexiglas': 'Plexiglas',
  'OverDrivenJM45': 'JM45',
  'JM45': 'JM45',
  'OverDrivenLuxVerb': 'Lux Verb',
  'Bluesbreaker': 'Bluesbreaker',
  
  // Amplifiers - High Gain
  'Bogner': 'RB 101',
  'RB101': 'RB 101',
  'OrangeAD30': 'British 30',
  'AmericanHighGain': 'American High Gain',
  'SLO100': 'SLO 100',
  'Solo100': 'Solo 100',
  'YJM100': 'YJM100',
  'Silverline': 'Silverline',
  'Rectified': 'Rectified',
  
  // Amplifiers - Metal
  'Rectifier': 'Treadplate',
  'Treadplate': 'Treadplate',
  'EVH': 'Insane',
  '6505Plus': 'Insane 6508',
  'SwitchAxeLead': 'SwitchAxe',
  'PowerStage': 'PowerStage',
  'Invader': 'Rocker V',
  'RockerV': 'Rocker V',
  'BE101': 'BE 101',
  'Crush': 'Crush',
  'Line6': 'Line 6',
  
  // Amplifiers - Acoustic
  'AcousticAmpV2': 'Jumbo',
  'AcousticAmp': 'Pure Acoustic',
  'Fishboy': 'Fishboy',
  'Natural': 'Natural',
  'AGClub': 'AG Club',
  
  // Bass Amplifiers
  'GK800': 'GK 800',
  'OBassman': 'Tweed Bass',
  'W600': 'W600 Bass',
  'Hammer500': 'Hammer 500',
  
  // Modulation
  'Tremolo': 'Tremolo',
  'ChorusAnalog': 'Analog Chorus',
  'Chorus': 'Digital Chorus',
  'DigitalChorus': 'Digital Chorus',
  'Flanger': 'Flanger',
  'Phaser': 'Phaser',
  'Vibrato': 'Vibrato',
  'UniVibe': 'Vibe',
  'Vibe': 'Vibe',
  'Cloner': 'Cloner',
  'MiniVibe': 'Mini Vibe',
  'Tremolator': 'Tremolator',
  'TranceSync': 'Trance Sync',
  'RingModulator': 'Ring Mod',
  
  // Delays
  'DelayMono': 'Digital Delay',
  'DigitalDelay': 'Digital Delay',
  'DelayEcho': 'Delay Echo',
  'DelayEchoFilt': 'Echo Filter',
  'VintageDelay': 'Vintage Delay',
  'DelayReverse': 'Reverse Delay',
  'DelayMultiHead': 'Multi Head',
  'DelayAnalog': 'Analog Delay',
  'DelayRe201': 'RE-201 Space Echo',
  
  // Reverbs
  'bias.reverb': 'Room Reverb',
  'RoomReverb': 'Room Reverb',
  'PlateReverb': 'Plate Reverb',
  'Plate': 'Plate Reverb',
  'SpringReverb': 'Spring Reverb',
  'Spring': 'Spring Reverb',
  'RoomStudioA': 'Studio A',
  'Chamber': 'Chamber',
  'Hall': 'Hall',
  'Room': 'Room',
  'Stadium': 'Stadium',
  'Cathedral': 'Cathedral',
  'AcousticReverb': 'Acoustic',
  'AmbientReverb': 'Ambient',
  'VintageRoom': 'Vintage Room',
  
  // Jimi Hendrix Pack
  'JH.Vox846': 'Vox 846',
  'JH.AxisFuzz': 'Axis Fuzz',
  'JH.SuperLead100': 'Super Lead 100',
  'JH.SuperLeadFull': 'Super Lead Full',
  'JH.VoodooVibeJr': 'Voodoo Vibe Jr',
  
  // Additional effects
  'SABdriver': 'SAB Driver',
  'EchoFilter': 'Echo Filter'
};