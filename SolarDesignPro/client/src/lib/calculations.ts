import {
  type PanelLayoutInput,
  type InverterSizingInput,
  type CableSizingInput,
} from "@shared/schema";

export function calculatePanelLayout(inputs: PanelLayoutInput) {
  const {
    roofLength,
    roofWidth,
    panelLength,
    panelWidth,
    orientation,
    rowGap,
    columnGap,
  } = inputs;

  // Convert from millimeters to meters for calculations
  const roofLengthM = roofLength / 1000;
  const roofWidthM = roofWidth / 1000;
  const panelLengthM = panelLength / 1000;
  const panelWidthM = panelWidth / 1000;
  const rowGapM = rowGap / 1000;
  const columnGapM = columnGap / 1000;

  // Determine effective panel dimensions based on orientation
  const effectivePanelLength =
    orientation === "portrait" ? panelLengthM : panelWidthM;
  const effectivePanelWidth =
    orientation === "portrait" ? panelWidthM : panelLengthM;

  // Calculate number of panels that can fit
  const availableLength = roofLengthM - 2 * 0.5; // 0.5m edge clearance
  const availableWidth = roofWidthM - 2 * 0.5;

  // Calculate columns (along roof length)
  const columnsWithGaps = Math.floor(
    (availableLength + columnGapM) / (effectivePanelWidth + columnGapM),
  );
  const columns = Math.max(0, columnsWithGaps);

  // Calculate rows (along roof width)
  const rowsWithGaps = Math.floor(
    (availableWidth + rowGapM) / (effectivePanelLength + rowGapM),
  );
  const rows = Math.max(0, rowsWithGaps);

  const totalPanels = rows * columns;
  const totalArea = totalPanels * panelLengthM * panelWidthM;
  const roofArea = roofLengthM * roofWidthM;
  const roofCoverage = (totalArea / roofArea) * 100;
  const availableSpace = roofArea - totalArea;

  // Generate panel arrangement
  const panelArrangement = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      panelArrangement.push({ row, col });
    }
  }

  return {
    totalPanels,
    rows,
    columns,
    totalArea: Math.floor(totalArea * 100) / 100, // Round down to 2 decimals
    roofCoverage: Math.floor(roofCoverage * 10) / 10, // Round down to 1 decimal
    availableSpace: Math.floor(availableSpace * 100) / 100, // Round down to 2 decimals
    panelArrangement,
  };
}

export function calculateInverterSizing(inputs: InverterSizingInput) {
  const {
    pmax,
    vmp,
    imp,
    voc,
    isc,
    tempCoeffVoc,
    tempCoeffPmax,
    acPower,
    mpptRangeMin,
    mpptRangeMax,
    maxInputVoltage,
    maxInputCurrent,
    startupVoltage,
    numMppts,
    stringsPerMppt,
    numInverters,
  } = inputs;

  // Temperature correction for voltage (assuming -10°C to +70°C range)
  const minTemp = -10;
  const maxTemp = 70;
  const stdTemp = 25;

  // Maximum voltage occurs at minimum temperature (using Voc coefficient)
  const vocMax = voc * (1 + (tempCoeffVoc / 100) * (minTemp - stdTemp));
  const vmpMax = vmp * (1 + (tempCoeffPmax / 100) * (minTemp - stdTemp));

  // Minimum MPPT voltage occurs at maximum temperature (using Vmp coefficient if available, otherwise Voc)
  // For proper calculation, we should use tempCoeffPmax for Vmp, but simplified here
  const vocMin = voc * (1 + (tempCoeffPmax / 100) * (maxTemp - stdTemp));
  const vmpMin = vmp * (1 + (tempCoeffPmax / 100) * (maxTemp - stdTemp));

  // Startup voltage consideration (using Min Voc for more conservative estimate)
  const minPanelsStartup = Math.ceil(startupVoltage / vocMin);

  // Calculate maximum panels per string based on voltage constraints
  const maxPanelsVoltage = Math.floor(maxInputVoltage / vocMax);
  const maxPanelsMppt = Math.floor(mpptRangeMax / vmpMax);
  const minPanelsMppt = Math.max(
    Math.ceil(mpptRangeMin / vmpMin),
    minPanelsStartup,
  );

  // Calculate maximum panels per string based on current constraint
  const maxPanelsCurrent = Math.floor(maxInputCurrent / isc);

  // Overall maximum panels per string
  const maxPanelsPerString = Math.min(
    maxPanelsVoltage,
    maxPanelsMppt,
    maxPanelsCurrent,
  );

  // Recommended panels per string (ensure within limits)
  const recommendedPanelsPerString = Math.floor(maxPanelsPerString * 0.95); // Slightly more conservative

  // Ensure minimum requirements are met (startup and MPPT)
  const finalPanelsPerString = Math.max(
    recommendedPanelsPerString,
    minPanelsMppt,
  );

  // Calculate system configuration
  const stringsPerInverter = numMppts * stringsPerMppt;
  const totalStrings = stringsPerInverter * numInverters;
  const totalPanelsUsed = totalStrings * finalPanelsPerString;

  // Calculate power values
  const totalSystemPower = totalPanelsUsed * pmax;
  const inverterCapacity = acPower;
  const dcAcRatio = totalSystemPower / (inverterCapacity * numInverters);
  const systemEfficiency = 97.8; // Typical inverter efficiency

  // Generate string configuration
  const stringConfiguration = [];
  for (let inv = 0; inv < numInverters; inv++) {
    for (let mppt = 0; mppt < numMppts; mppt++) {
      for (let str = 0; str < stringsPerMppt; str++) {
        stringConfiguration.push({
          inverter: inv + 1,
          mppt: mppt + 1,
          string: str + 1,
          panels: finalPanelsPerString,
        });
      }
    }
  }

  return {
    maxPanelsPerString,
    recommendedPanelsPerString: finalPanelsPerString,
    totalStrings,
    totalPanelsUsed,
    totalSystemPower,
    inverterCapacity,
    dcAcRatio,
    systemEfficiency,
    stringsPerInverter,
    stringConfiguration,
  };
}

export function calculateCableSizing(inputs: CableSizingInput) {
  const {
    dcMaxStringCurrent,
    dcSafetyFactor,
    dcCableLength,
    dcVoltageDropLimit,
    dcInstallationMethod,
    dcCableMaterial,
    dcOperatingTemp,
    acPower,
    acVoltage,
    acCableLength,
    acPowerFactor,
    acCableMaterial,
    acVoltageDropLimit,
    acInstallationMethod,
  } = inputs;

  // Cable material conductivity (m/Ω·mm²)
  const conductivity = {
    copper: 56,
    aluminum: 34,
  };

  // Installation method derating factors
  const deratingFactors = {
    conduit: 0.8,
    tray: 0.85,
    buried: 0.9,
    "free-air": 1.0,
    overhead: 0.95,
  };

  // Temperature derating (for operating temperature above 30°C)
  const tempDerating =
    dcOperatingTemp > 30
      ? Math.max(0.7, 1 - (dcOperatingTemp - 30) * 0.005)
      : 1.0;

  // DC Cable Calculations
  const dcDesignCurrent = dcMaxStringCurrent * dcSafetyFactor;
  const dcDeratingFactor = deratingFactors[dcInstallationMethod] * tempDerating;

  // Standard cable sizes (mm²)
  const standardSizes = [
    1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240,
  ];

  // Current carrying capacities for copper cables in conduit (A)
  const currentCapacities = {
    1.5: 18,
    2.5: 24,
    4: 32,
    6: 41,
    10: 57,
    16: 76,
    25: 101,
    35: 125,
    50: 151,
    70: 192,
    95: 232,
    120: 269,
    150: 309,
    185: 353,
    240: 415,
  };

  // Find minimum cable size for current carrying capacity
  let dcCableSize = 4; // Default minimum
  for (const size of standardSizes) {
    const capacity =
      currentCapacities[size as keyof typeof currentCapacities] *
      dcDeratingFactor;
    if (capacity >= dcDesignCurrent) {
      dcCableSize = size;
      break;
    }
  }

  // Calculate voltage drop
  const dcConductivity = conductivity[dcCableMaterial];
  const dcResistance = (2 * dcCableLength) / (dcConductivity * dcCableSize); // 2-wire DC system
  const dcVoltageDropActual = ((dcDesignCurrent * dcResistance) / 600) * 100; // Assuming 600V DC system

  // If voltage drop is too high, increase cable size
  while (dcVoltageDropActual > dcVoltageDropLimit && dcCableSize < 240) {
    const nextSizeIndex = standardSizes.indexOf(dcCableSize) + 1;
    if (nextSizeIndex < standardSizes.length) {
      dcCableSize = standardSizes[nextSizeIndex];
    } else {
      break;
    }
  }

  const finalDcResistance =
    (2 * dcCableLength) / (dcConductivity * dcCableSize);
  const finalDcVoltageDrop =
    ((dcDesignCurrent * finalDcResistance) / 600) * 100;
  const dcCurrentCapacity =
    currentCapacities[dcCableSize as keyof typeof currentCapacities] *
    dcDeratingFactor;

  // AC Cable Calculations
  const phases = acVoltage > 300 ? 3 : 1; // Assume 3-phase if voltage > 300V
  const acCurrent =
    acPower / (acVoltage * acPowerFactor * (phases === 3 ? Math.sqrt(3) : 1));

  // Find minimum AC cable size
  let acCableSize = 16; // Default minimum for AC
  const acDeratingFactor = deratingFactors[acInstallationMethod];

  for (const size of standardSizes.filter((s) => s >= 16)) {
    const capacity =
      currentCapacities[size as keyof typeof currentCapacities] *
      acDeratingFactor;
    if (capacity >= acCurrent * 1.1) {
      // 10% safety margin
      acCableSize = size;
      break;
    }
  }

  // Calculate AC voltage drop and adjust for voltage drop if needed
  const acConductivity = conductivity[acCableMaterial];
  let acVoltageDropActual = 0;

  // Loop to find appropriate cable size for voltage drop
  while (acCableSize < 240) {
    const acResistance = acCableLength / (acConductivity * acCableSize);
    acVoltageDropActual =
      ((acCurrent * acResistance) / acVoltage) *
      100 *
      (phases === 3 ? Math.sqrt(3) : 2);

    if (acVoltageDropActual <= acVoltageDropLimit) {
      break; // Cable size is adequate
    }

    const nextSizeIndex = standardSizes.indexOf(acCableSize) + 1;
    if (nextSizeIndex < standardSizes.length) {
      acCableSize = standardSizes[nextSizeIndex];
    } else {
      break;
    }
  }

  const finalAcResistance = acCableLength / (acConductivity * acCableSize);
  const finalAcVoltageDrop =
    ((acCurrent * finalAcResistance) / acVoltage) *
    100 *
    (phases === 3 ? Math.sqrt(3) : 2);
  const acCurrentCapacity =
    currentCapacities[acCableSize as keyof typeof currentCapacities] *
    acDeratingFactor;
  const acLoadFactor = (acCurrent / acCurrentCapacity) * 100;
  const acPowerLoss = Math.pow(acCurrent, 2) * finalAcResistance;

  // Calculate total DC cable length (assuming 4 strings)
  const totalDCCableLength = dcCableLength * 4;

  // Recommended breaker size (125% of operating current)
  const recommendedBreaker = Math.ceil((acCurrent * 1.25) / 5) * 5; // Round up to nearest 5A

  return {
    dcCableSize: Math.ceil(dcCableSize), // Round up cable size
    dcVoltageDrop: Math.ceil(finalDcVoltageDrop * 10) / 10, // Round up to 1 decimal
    dcCurrentCapacity: Math.ceil(dcCurrentCapacity), // Round up current capacity
    dcDesignCurrent: Math.ceil(dcDesignCurrent * 10) / 10, // Round up to 1 decimal
    dcDeratingFactor: Math.ceil(dcDeratingFactor * 100) / 100, // Round up to 2 decimals
    dcCableResistance: Math.ceil(finalDcResistance * 1000) / 1000, // Round up to 3 decimals
    acCableSize: Math.ceil(acCableSize), // Round up cable size
    acVoltageDrop: Math.ceil(acVoltageDropActual * 10) / 10, // Round up to 1 decimal - using actual calculated value
    acCurrentCapacity: Math.ceil(acCurrentCapacity), // Round up current capacity
    acOperatingCurrent: Math.ceil(acCurrent * 10) / 10, // Round up to 1 decimal
    acLoadFactor: Math.ceil(acLoadFactor * 10) / 10, // Round up to 1 decimal
    acPowerLoss: Math.ceil(acPowerLoss * 100) / 100, // Round up to 2 decimals
    totalDCCableLength: Math.ceil(totalDCCableLength),
    recommendedBreaker: Math.ceil((acCurrent * 1.25) / 5) * 5, // Already rounds up to nearest 5A
  };
}
