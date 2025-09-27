import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu } from "lucide-react";

interface InverterSizingResult {
  maxPanelsPerString: number;
  recommendedPanelsPerString: number;
  totalStrings: number;
  totalPanelsUsed: number;
  totalSystemPower: number;
  inverterCapacity: number;
  dcAcRatio: number;
  systemEfficiency: number;
  stringsPerInverter: number;
  stringConfiguration: {
    inverter: number;
    mppt: number;
    string: number;
    panels: number;
  }[];
}

interface InverterSizingInput {
  numMppts: number;
  stringsPerMppt: number;
  numInverters: number;
  inverterModel: string;
}

interface Props {
  results: InverterSizingResult;
  inputs: InverterSizingInput;
}

export default function StringConfigurationDiagram({ results, inputs }: Props) {
  const renderPanelString = (panels: number, stringIndex: number) => {
    const panelElements = [];
    const maxVisible = 6;
    
    for (let i = 0; i < Math.min(panels, maxVisible); i++) {
      panelElements.push(
        <div 
          key={i}
          className="w-3 h-6 bg-primary rounded-sm"
          data-testid={`panel-${stringIndex}-${i}`}
        />
      );
    }
    
    if (panels > maxVisible) {
      panelElements.push(
        <span 
          key="more"
          className="text-muted-foreground text-xs self-center ml-1"
          data-testid={`panel-count-${stringIndex}`}
        >
          ...{panels}
        </span>
      );
    }
    
    return panelElements;
  };

  const renderInverter = (inverterIndex: number) => {
    const stringsPerInverter = inputs.numMppts * inputs.stringsPerMppt;
    const mppts = [];
    
    for (let mppt = 0; mppt < inputs.numMppts; mppt++) {
      const strings = [];
      
      for (let string = 0; string < inputs.stringsPerMppt; string++) {
        const globalStringIndex = inverterIndex * stringsPerInverter + mppt * inputs.stringsPerMppt + string;
        
        strings.push(
          <div key={string} className="mb-3">
            <div className="text-xs text-muted-foreground mb-1" data-testid={`string-label-${globalStringIndex}`}>
              String {string + 1} ({results.recommendedPanelsPerString} panels)
            </div>
            <div className="flex space-x-1 justify-center">
              {renderPanelString(results.recommendedPanelsPerString, globalStringIndex)}
            </div>
          </div>
        );
      }
      
      mppts.push(
        <div key={mppt} className="text-center">
          <div className="bg-accent text-accent-foreground px-4 py-2 rounded mb-3 font-medium" data-testid={`mppt-${inverterIndex}-${mppt}`}>
            MPPT {mppt + 1}
          </div>
          {strings}
        </div>
      );
    }
    
    return (
      <div key={inverterIndex} className="space-y-6">
        {/* Inverter representation */}
        <div className="text-center">
          <div className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold inline-block" data-testid={`inverter-${inverterIndex}`}>
            <Cpu className="mr-2 h-4 w-4 inline" />
            Inverter {inverterIndex + 1} ({(results.inverterCapacity / 1000).toFixed(1)}kW)
          </div>
        </div>
        
        {/* MPPT representations */}
        <div className={`grid grid-cols-${inputs.numMppts} gap-8`}>
          {mppts}
        </div>
        
        {inputs.numInverters > 1 && inverterIndex < inputs.numInverters - 1 && (
          <div className="border-b border-border my-8"></div>
        )}
      </div>
    );
  };

  return (
    <Card data-testid="string-configuration-diagram">
      <CardHeader>
        <CardTitle className="flex items-center">
          String Configuration Diagram
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-lg p-6">
          <div className="flex justify-center items-center">
            <div className="space-y-6">
              {Array.from({ length: inputs.numInverters }, (_, i) => renderInverter(i))}
            </div>
          </div>
        </div>
        
        {/* Configuration Summary */}
        <div className="mt-4 text-sm text-muted-foreground space-y-1">
          <div data-testid="config-summary-strings">Total Strings: {results.totalStrings}</div>
          <div data-testid="config-summary-panels">Total Panels: {results.totalPanelsUsed}</div>
          <div data-testid="config-summary-power">System Power: {(results.totalSystemPower / 1000).toFixed(1)} kW</div>
          <div data-testid="config-summary-efficiency">DC/AC Ratio: {results.dcAcRatio.toFixed(2)}</div>
        </div>
      </CardContent>
    </Card>
  );
}
