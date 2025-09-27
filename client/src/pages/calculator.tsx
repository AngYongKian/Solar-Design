import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PanelLayoutCalculator from "@/components/panel-layout-calculator";
import InverterSizingCalculator from "@/components/inverter-sizing-calculator";
import CableSizingCalculator from "@/components/cable-sizing-calculator";
import { Sun, Download } from "lucide-react";

export default function Calculator() {
  const [activeTab, setActiveTab] = useState("panel-layout");

  const handleExportReport = () => {
    // TODO: Implement export functionality
    console.log("Export report");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sun className="text-primary text-2xl mr-3 h-8 w-8" data-testid="logo-icon" />
              <h1 className="text-xl font-semibold text-foreground" data-testid="app-title">
                PV System Calculator
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleExportReport}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-export"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8" data-testid="nav-tabs">
            <TabsTrigger value="panel-layout" data-testid="tab-panel-layout">
              Panel Layout
            </TabsTrigger>
            <TabsTrigger value="inverter-sizing" data-testid="tab-inverter-sizing">
              Inverter Sizing
            </TabsTrigger>
            <TabsTrigger value="cable-sizing" data-testid="tab-cable-sizing">
              Cable Sizing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="panel-layout" className="space-y-8" data-testid="content-panel-layout">
            <PanelLayoutCalculator />
          </TabsContent>

          <TabsContent value="inverter-sizing" className="space-y-8" data-testid="content-inverter-sizing">
            <InverterSizingCalculator />
          </TabsContent>

          <TabsContent value="cable-sizing" className="space-y-8" data-testid="content-cable-sizing">
            <CableSizingCalculator />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                PV System Calculator - Professional Solar Design Tool
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Calculate panel layouts, inverter sizing, and cable specifications
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
