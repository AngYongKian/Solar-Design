import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, Cpu, Sun } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { inverterSizingInputSchema, type InverterSizingInput } from "@shared/schema";
import StringConfigurationDiagram from "./string-configuration-diagram";
import { useToast } from "@/hooks/use-toast";

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

export default function InverterSizingCalculator() {
  const [results, setResults] = useState<InverterSizingResult | null>(null);
  const { toast } = useToast();

  const form = useForm<InverterSizingInput>({
    resolver: zodResolver(inverterSizingInputSchema),
    defaultValues: {
      panelModel: "JA Solar 540W",
      pmax: 540,
      vmp: 41.2,
      imp: 13.1,
      voc: 49.8,
      isc: 13.9,
      tempCoeffVoc: -0.29,
      tempCoeffPmax: -0.34,
      inverterModel: "Huawei SUN2000-12KTL",
      acPower: 12000,
      mpptRangeMin: 160,
      mpptRangeMax: 950,
      maxInputVoltage: 1100,
      maxInputCurrent: 26,
      startupVoltage: 150,
      numMppts: 2,
      stringsPerMppt: 2,
      numInverters: 1,
    },
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: InverterSizingInput) => {
      const response = await apiRequest('POST', '/api/calculate/inverter-sizing', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setResults(data.results);
        toast({
          title: "Calculation Complete",
          description: `String configuration calculated successfully`,
        });
      } else {
        toast({
          title: "Calculation Failed",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to calculate inverter sizing",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InverterSizingInput) => {
    calculateMutation.mutate(data);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Panel Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sun className="text-primary mr-3 h-5 w-5" />
            Panel Specifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="panelModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Panel Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., JA Solar 540W" {...field} data-testid="input-panel-model" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="pmax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pmax (W)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="540"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-pmax"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vmp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vmp (V)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="41.2"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-vmp"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="imp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imp (A)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="13.1"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-imp"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="voc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voc (V)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="49.8"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-voc"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="isc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Isc (A)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="13.9"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-isc"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="tempCoeffVoc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temp Coeff Voc (%/°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="-0.29"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-temp-coeff-voc"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tempCoeffPmax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temp Coeff Pmax (%/°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="-0.34"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-temp-coeff-pmax"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>

      {/* Inverter Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cpu className="text-secondary mr-3 h-5 w-5" />
            Inverter Specifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="inverterModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inverter Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Huawei SUN2000-12KTL" {...field} data-testid="input-inverter-model" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="acPower"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AC Power (W)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="12000"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-ac-power"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startupVoltage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Startup Voltage (V)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="150"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-startup-voltage"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="mpptRangeMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MPPT Range Min (V)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="160"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-mppt-min"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mpptRangeMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MPPT Range Max (V)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="950"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-mppt-max"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="maxInputVoltage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Input Voltage (V)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1100"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-max-input-voltage"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxInputCurrent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Input Current (A)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="26"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-max-input-current"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="numMppts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of MPPTs</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-num-mppts"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stringsPerMppt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strings per MPPT</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-strings-per-mppt"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="numInverters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Inverters</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-num-inverters"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </CardContent>
      </Card>

      {/* Calculation Results */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="text-warning mr-3 h-5 w-5" />
              String Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                className="w-full mb-4" 
                disabled={calculateMutation.isPending}
                data-testid="button-calculate-inverter"
              >
                {calculateMutation.isPending ? "Calculating..." : "Calculate String Configuration"}
              </Button>
            </Form>
            {results && (
              <div className="space-y-3">
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-xl font-bold text-primary font-mono" data-testid="result-max-panels-string">
                    {results.maxPanelsPerString}
                  </div>
                  <div className="text-xs text-muted-foreground">Max Panels per String</div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-xl font-bold text-secondary font-mono" data-testid="result-recommended-panels-string">
                    {results.recommendedPanelsPerString}
                  </div>
                  <div className="text-xs text-muted-foreground">Recommended per String</div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-xl font-bold text-success font-mono" data-testid="result-total-strings">
                    {results.totalStrings}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Strings</div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-xl font-bold text-warning font-mono" data-testid="result-total-panels">
                    {results.totalPanelsUsed}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Panels</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>System Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Total System Power:</span>
                  <span className="font-bold font-mono" data-testid="result-system-power">
                    {(results.totalSystemPower / 1000).toFixed(1)} kW
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Inverter Capacity:</span>
                  <span className="font-mono" data-testid="result-inverter-capacity">
                    {(results.inverterCapacity / 1000).toFixed(1)} kW
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">DC/AC Ratio:</span>
                  <span className="font-mono" data-testid="result-dc-ac-ratio">
                    {results.dcAcRatio.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Efficiency:</span>
                  <span className="font-mono" data-testid="result-efficiency">
                    {results.systemEfficiency.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* String Configuration Diagram */}
      {results && (
        <div className="col-span-full mt-8">
          <StringConfigurationDiagram results={results} inputs={form.watch()} />
        </div>
      )}
    </div>
  );
}
