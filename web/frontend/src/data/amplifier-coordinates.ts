// Coordenadas finales de amplificadores mapeadas manualmente
// Imagen base: full_image_map.jpg (1920x1080)

export const amplifierCoordinates = {
  "clean": [
    {
      "name": "Silver 120",
      "dspId": "RolandJC120",
      "row": "clean",
      "x": 22,
      "y": 71,
      "width": 150,
      "height": 64
    },
    {
      "name": "Black Duo",
      "dspId": "BlackDuo",
      "row": "clean",
      "x": 187,
      "y": 69,
      "width": 153,
      "height": 67
    },
    {
      "name": "AD Clean",
      "dspId": "ADClean",
      "row": "clean",
      "x": 353,
      "y": 68,
      "width": 157,
      "height": 68
    },
    {
      "name": "Match DC",
      "dspId": "MatchDC",
      "row": "clean",
      "x": 520,
      "y": 66,
      "width": 157,
      "height": 69
    }
  ],
  "glassy": [
    {
      "name": "Sunny 3000",
      "dspId": "Sunny3000",
      "row": "glassy",
      "x": 17,
      "y": 216,
      "width": 156,
      "height": 70
    },
    {
      "name": "AC Boost",
      "dspId": "ACBoost",
      "row": "glassy",
      "x": 186,
      "y": 216,
      "width": 156,
      "height": 70
    },
    {
      "name": "Checkmate",
      "dspId": "Checkmate",
      "row": "glassy",
      "x": 353,
      "y": 217,
      "width": 156,
      "height": 70
    },
    {
      "name": "Two Stone SP50",
      "dspId": "TwoStoneSP50",
      "row": "glassy",
      "x": 519,
      "y": 216,
      "width": 156,
      "height": 70
    }
  ],
  "crunch": [
    {
      "name": "Tweed Lux",
      "dspId": "TweedLux",
      "row": "crunch",
      "x": 20,
      "y": 367,
      "width": 156,
      "height": 70
    },
    {
      "name": "Plexi",
      "dspId": "Plexi",
      "row": "crunch",
      "x": 185,
      "y": 365,
      "width": 156,
      "height": 70
    },
    {
      "name": "JM45",
      "dspId": "JM45",
      "row": "crunch",
      "x": 352,
      "y": 367,
      "width": 156,
      "height": 70
    },
    {
      "name": "Bluesbreaker",
      "dspId": "Bluesbreaker",
      "row": "crunch",
      "x": 520,
      "y": 367,
      "width": 156,
      "height": 70
    }
  ],
  "highGain": [
    {
      "name": "RB 101",
      "dspId": "RB101",
      "row": "highGain",
      "x": 20,
      "y": 518,
      "width": 157,
      "height": 70
    },
    {
      "name": "Silverline",
      "dspId": "Silverline",
      "row": "highGain",
      "x": 186,
      "y": 517,
      "width": 154,
      "height": 72
    },
    {
      "name": "YJM100",
      "dspId": "YJM100",
      "row": "highGain",
      "x": 354,
      "y": 521,
      "width": 152,
      "height": 73
    },
    {
      "name": "Solo 100",
      "dspId": "Solo100",
      "row": "highGain",
      "x": 523,
      "y": 516,
      "width": 155,
      "height": 72
    },
    {
      "name": "Rectified",
      "dspId": "Rectified",
      "row": "highGain",
      "x": 690,
      "y": 519,
      "width": 151,
      "height": 69
    }
  ],
  "metal": [
    {
      "name": "Crush",
      "dspId": "Crush",
      "row": "metal",
      "x": 20,
      "y": 669,
      "width": 155,
      "height": 71
    },
    {
      "name": "Treadplate",
      "dspId": "Treadplate",
      "row": "metal",
      "x": 187,
      "y": 669,
      "width": 155,
      "height": 67
    },
    {
      "name": "PowerStage",
      "dspId": "PowerStage",
      "row": "metal",
      "x": 355,
      "y": 669,
      "width": 151,
      "height": 71
    },
    {
      "name": "Rocker V",
      "dspId": "RockerV",
      "row": "metal",
      "x": 521,
      "y": 670,
      "width": 153,
      "height": 69
    },
    {
      "name": "Line 6",
      "dspId": "Line6",
      "row": "metal",
      "x": 689,
      "y": 669,
      "width": 151,
      "height": 70
    }
  ],
  "acoustic": [
    {
      "name": "Jumbo",
      "dspId": "AcousticAmpV2",
      "row": "acoustic",
      "x": 20,
      "y": 820,
      "width": 156,
      "height": 68
    },
    {
      "name": "Fishboy",
      "dspId": "Fishboy",
      "row": "acoustic",
      "x": 188,
      "y": 821,
      "width": 155,
      "height": 68
    },
    {
      "name": "Natural",
      "dspId": "Natural",
      "row": "acoustic",
      "x": 354,
      "y": 823,
      "width": 155,
      "height": 68
    },
    {
      "name": "AG Club",
      "dspId": "AGClub",
      "row": "acoustic",
      "x": 521,
      "y": 822,
      "width": 155,
      "height": 67
    }
  ],
  "bass": [
    // TODO: Mapear amplificadores de bass
  ]
};

// Crear mapeo directo de dspId a coordenadas
export const dspIdToCoordinates = {};
Object.values(amplifierCoordinates).forEach(category => {
  category.forEach(amp => {
    dspIdToCoordinates[amp.dspId] = amp;
  });
});

// Función para generar CSS dinámico
export function generateAmplifierCSS(amp) {
  return {
    backgroundImage: 'url("/full_image_map.jpg")',
    backgroundPosition: `-${amp.x}px -${amp.y}px`,
    backgroundRepeat: 'no-repeat',
    width: `${amp.width}px`,
    height: `${amp.height}px`,
    display: 'inline-block'
  };
}

// Función para generar clase CSS por nombre
export function generateCSSClassName(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

// Función para obtener amplificador por dspId
export function getAmplifierByDspId(dspId) {
  return dspIdToCoordinates[dspId] || null;
}

export default amplifierCoordinates;