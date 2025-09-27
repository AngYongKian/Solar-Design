import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calculator, Ruler } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { panelLayoutInputSchema, type PanelLayoutInput } from "@shared/schema";
import PanelLayoutDiagram from "./panel-layout-diagram";
import { useToast } from "@/hooks/use-toast";

interface PanelLayoutResult {
  totalPanels: number;
  rows: number;
  columns: number;
  totalArea: number;
  roofCoverage: number;
  availableSpace: number;
  panelArrangement: { row: number; col: number }[];
}

export default function PanelLayoutCalculator() {
  const [results, setResults] = useState<PanelLayoutResult | null>(null);
  const { toast } = useToast();

  const form = useForm<PanelLayoutInput>({
    resolver: zodResolver(panelLayoutInputSchema),
    defaultValues: {
      roofLength: 12500,
      roofWidth: 8000,
      panelLength: 2000,
      panelWidth: 1000,
      orientation: 'portrait',
      rowGap: 500,
      columnGap: 300,
    },
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: PanelLayoutInput) => {
      const response = await apiRequest('POST', '/api/calculate/panel-layout', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setResults(data.results);
        toast({
          title: "Calculation Complete",
          description: `Successfully calculated layout for ${data.results.totalPanels} panels`,
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
        description: error.message || "Failed to calculate panel layout",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PanelLayoutInput) => {
    calculateMutation.mutate(data);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Ruler className="text-primary mr-3 h-5 w-5" />
              Roof & Panel Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Roof Dimensions */}
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground border-b border-border pb-2">
                    Roof Dimensions (millimeters)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="roofLength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Length</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              placeholder="12500"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-roof-length"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="roofWidth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Width</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              placeholder="8000"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-roof-width"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Panel Specifications */}
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground border-b border-border pb-2">
                    Panel Specifications (millimeters)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="panelLength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Panel Length</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              placeholder="2000"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-panel-length"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="panelWidth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Panel Width</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              placeholder="1000"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-panel-width"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Layout Configuration */}
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground border-b border-border pb-2">
                    Layout Configuration
                  </h3>
                  <FormField
                    control={form.control}
                    name="orientation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Panel Orientation</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-orientation">
                              <SelectValue placeholder="Select orientation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="portrait">Portrait</SelectItem>
                            <SelectItem value="landscape">Landscape</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rowGap"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gap Between Rows (mm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              placeholder="500"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-row-gap"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="columnGap"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gap Between Columns (mm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              placeholder="300"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-column-gap"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={calculateMutation.isPending}
                  data-testid="button-calculate-layout"
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  {calculateMutation.isPending ? "Calculating..." : "Calculate Panel Layout"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="text-secondary mr-3 h-5 w-5" />
                Calculation Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary font-mono" data-testid="result-total-panels">
                    {results.totalPanels}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Panels</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-2xl font-bold text-secondary font-mono" data-testid="result-rows">
                    {results.rows}
                  </div>
                  <div className="text-sm text-muted-foreground">Rows</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-2xl font-bold text-secondary font-mono" data-testid="result-columns">
                    {results.columns}
                  </div>
                  <div className="text-sm text-muted-foreground">Columns</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-2xl font-bold text-warning font-mono" data-testid="result-total-area">
                    {results.totalArea.toFixed(1)}m²
                  </div>
                  <div className="text-sm text-muted-foreground">Panel Area</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Diagram Section */}
      <Card>
        <CardHeader>
          <CardTitle>Panel Layout Diagram</CardTitle>
        </CardHeader>
        <CardContent>
          <PanelLayoutDiagram 
            results={results}
            inputs={form.watch()}
          />
          {results && (
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Roof Coverage:</span>
                <span className="font-mono" data-testid="result-roof-coverage">
                  {results.roofCoverage.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available Space:</span>
                <span className="font-mono" data-testid="result-available-space">
                  {results.availableSpace.toFixed(1)}m²
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Orientation:</span>
                <span className="font-semibold" data-testid="result-orientation">
                  {form.watch('orientation')}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
