import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calculator, Zap, Plug, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { cableSizingInputSchema, type CableSizingInput } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface CableSizingResult {
  dcCableSize: number;
  dcVoltageDrop: number;
  dcCurrentCapacity: number;
  dcDesignCurrent: number;
  dcDeratingFactor: number;
  dcCableResistance: number;
  acCableSize: number;
  acVoltageDrop: number;
  acCurrentCapacity: number;
  acOperatingCurrent: number;
  acLoadFactor: number;
  acPowerLoss: number;
  totalDCCableLength: number;
  recommendedBreaker: number;
}

export default function CableSizingCalculator() {
  const [results, setResults] = useState<CableSizingResult | null>(null);
  const { toast } = useToast();

  const form = useForm<CableSizingInput>({
    resolver: zodResolver(cableSizingInputSchema),
    defaultValues: {
      dcMaxStringCurrent: 13.9,
      dcSafetyFactor: 1.25,
      dcCableLength: 50,
      dcVoltageDropLimit: 1.0,
      dcInstallationMethod: 'conduit',
      dcCableMaterial: 'copper',
      dcOperatingTemp: 70,
      acPower: 12000,
      acVoltage: 400,
      acCableLength: 30,
      acPowerFactor: 0.95,
      acCableMaterial: 'copper',
      acVoltageDropLimit: 2.0,
      acInstallationMethod: 'conduit',
    },
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: CableSizingInput) => {
      const response = await apiRequest('POST', '/api/calculate/cable-sizing', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setResults(data.results);
        toast({
          title: "Calculation Complete",
          description: "Cable sizing calculated successfully",
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
        description: error.message || "Failed to calculate cable sizing",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CableSizingInput) => {
    calculateMutation.mutate(data);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        {/* DC Cable Parameters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="text-primary mr-3 h-5 w-5" />
              DC Cable Sizing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dcMaxStringCurrent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max String Current (A)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="13.9"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-dc-string-current"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dcSafetyFactor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Safety Factor</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseFloat(value))} defaultValue={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger data-testid="select-dc-safety-factor">
                              <SelectValue placeholder="Select safety factor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1.25">1.25 (Standard)</SelectItem>
                            <SelectItem value="1.5">1.5 (High Safety)</SelectItem>
                            <SelectItem value="1.1">1.1 (Minimal)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dcCableLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cable Length (m)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-dc-cable-length"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dcVoltageDropLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voltage Drop Limit (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="1.0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-dc-voltage-drop-limit"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dcInstallationMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Installation Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-dc-installation">
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="conduit">In Conduit</SelectItem>
                            <SelectItem value="tray">Cable Tray</SelectItem>
                            <SelectItem value="buried">Buried</SelectItem>
                            <SelectItem value="free-air">Free Air</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dcCableMaterial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cable Material</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-dc-cable-material">
                              <SelectValue placeholder="Select material" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="copper">Copper (σ = 56 m/Ω·mm²)</SelectItem>
                            <SelectItem value="aluminum">Aluminum (σ = 34 m/Ω·mm²)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="dcOperatingTemp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating Temperature (°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="70"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-dc-operating-temp"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                onClick={() => onSubmit(form.getValues())}
                className="w-full mt-6" 
                disabled={calculateMutation.isPending}
                data-testid="button-calculate-dc-cable"
              >
                <Calculator className="mr-2 h-4 w-4" />
                {calculateMutation.isPending ? "Calculating..." : "Calculate DC Cable Size"}
              </Button>
            </Form>
          </CardContent>
        </Card>

        {/* AC Cable Parameters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plug className="text-secondary mr-3 h-5 w-5" />
              AC Cable Sizing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="acPower"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AC Power (W)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="100"
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
                    name="acVoltage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AC Voltage (V)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseFloat(value))} defaultValue={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger data-testid="select-ac-voltage">
                              <SelectValue placeholder="Select voltage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="230">230V (1-Phase)</SelectItem>
                            <SelectItem value="400">400V (3-Phase)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="acCableLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cable Length (m)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="30"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-ac-cable-length"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="acPowerFactor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Power Factor</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.8"
                            max="1.0"
                            placeholder="0.95"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-ac-power-factor"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="acCableMaterial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cable Material</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-ac-cable-material">
                              <SelectValue placeholder="Select material" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="copper">Copper (σ = 56 m/Ω·mm²)</SelectItem>
                            <SelectItem value="aluminum">Aluminum (σ = 34 m/Ω·mm²)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="acVoltageDropLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voltage Drop Limit (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="2.0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-ac-voltage-drop-limit"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="acInstallationMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Installation Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-ac-installation">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="conduit">In Conduit</SelectItem>
                          <SelectItem value="tray">Cable Tray</SelectItem>
                          <SelectItem value="buried">Buried Direct</SelectItem>
                          <SelectItem value="overhead">Overhead</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                onClick={() => onSubmit(form.getValues())}
                className="w-full mt-6 bg-secondary text-secondary-foreground hover:bg-secondary/90" 
                disabled={calculateMutation.isPending}
                data-testid="button-calculate-ac-cable"
              >
                <Calculator className="mr-2 h-4 w-4" />
                {calculateMutation.isPending ? "Calculating..." : "Calculate AC Cable Size"}
              </Button>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {/* DC Cable Results */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="text-primary mr-3 h-5 w-5" />
                DC Cable Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-primary font-mono" data-testid="result-dc-cable-size">
                        {results.dcCableSize.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Cable Size (mm²)</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-secondary font-mono" data-testid="result-dc-voltage-drop">
                        {results.dcVoltageDrop.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Voltage Drop</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Carrying Capacity:</span>
                    <span className="font-mono" data-testid="result-dc-current-capacity">{results.dcCurrentCapacity}A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Design Current:</span>
                    <span className="font-mono" data-testid="result-dc-design-current">{results.dcDesignCurrent.toFixed(1)}A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Derating Factor:</span>
                    <span className="font-mono" data-testid="result-dc-derating-factor">{results.dcDeratingFactor.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cable Resistance:</span>
                    <span className="font-mono" data-testid="result-dc-resistance">{results.dcCableResistance.toFixed(3)} Ω</span>
                  </div>
                </div>
                <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                  <div className="flex items-center text-success">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span className="font-medium" data-testid="result-dc-recommendation">
                      Recommended: {results.dcCableSize.toFixed(1)}mm² {form.watch('dcCableMaterial')} Cable
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AC Cable Results */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plug className="text-secondary mr-3 h-5 w-5" />
                AC Cable Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-secondary font-mono" data-testid="result-ac-cable-size">
                        {results.acCableSize}
                      </div>
                      <div className="text-sm text-muted-foreground">Cable Size (mm²)</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary font-mono" data-testid="result-ac-voltage-drop">
                        {results.acVoltageDrop.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Voltage Drop</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Carrying Capacity:</span>
                    <span className="font-mono" data-testid="result-ac-current-capacity">{results.acCurrentCapacity}A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Operating Current:</span>
                    <span className="font-mono" data-testid="result-ac-operating-current">{results.acOperatingCurrent.toFixed(1)}A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Load Factor:</span>
                    <span className="font-mono" data-testid="result-ac-load-factor">{results.acLoadFactor.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Power Loss:</span>
                    <span className="font-mono" data-testid="result-ac-power-loss">{results.acPowerLoss.toFixed(0)}W</span>
                  </div>
                </div>
                <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                  <div className="flex items-center text-success">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span className="font-medium" data-testid="result-ac-recommendation">
                      Recommended: {results.acCableSize}mm² {form.watch('acCableMaterial')} Cable
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cable Summary */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Cable Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <div className="font-medium text-primary mb-1">DC String Cables</div>
                  <div className="text-sm text-muted-foreground">
                    <span data-testid="result-dc-summary">
                      {results.dcCableSize.toFixed(1)}mm² {form.watch('dcCableMaterial')}, {form.watch('dcCableLength')}m length per string
                    </span><br />
                    <span className="font-mono">
                      Total required: <span data-testid="result-total-dc-length">{results.totalDCCableLength}m</span>
                    </span>
                  </div>
                </div>
                <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-3">
                  <div className="font-medium text-secondary mb-1">AC Inverter Cables</div>
                  <div className="text-sm text-muted-foreground">
                    <span data-testid="result-ac-summary">
                      {results.acCableSize}mm² {form.watch('acCableMaterial')}, 3-core + earth, {form.watch('acCableLength')}m length
                    </span><br />
                    <span className="font-mono">
                      Protection: <span data-testid="result-recommended-breaker">{results.recommendedBreaker}A MCB</span>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
