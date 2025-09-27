import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  panelLayoutInputSchema,
  inverterSizingInputSchema, 
  cableSizingInputSchema
} from "@shared/schema";
import { calculatePanelLayout, calculateInverterSizing, calculateCableSizing } from "../client/src/lib/calculations.js";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Panel Layout Calculation
  app.post("/api/calculate/panel-layout", async (req, res) => {
    try {
      const inputs = panelLayoutInputSchema.parse(req.body);
      const results = calculatePanelLayout(inputs);
      
      // Store calculation
      const calculation = await storage.createCalculation({
        userId: null,
        type: 'panel-layout',
        inputs: inputs as any,
        results: results as any,
      });

      res.json({ success: true, results, calculationId: calculation.id });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Inverter Sizing Calculation
  app.post("/api/calculate/inverter-sizing", async (req, res) => {
    try {
      const inputs = inverterSizingInputSchema.parse(req.body);
      const results = calculateInverterSizing(inputs);
      
      // Store calculation
      const calculation = await storage.createCalculation({
        userId: null,
        type: 'inverter-sizing',
        inputs: inputs as any,
        results: results as any,
      });

      res.json({ success: true, results, calculationId: calculation.id });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Cable Sizing Calculation
  app.post("/api/calculate/cable-sizing", async (req, res) => {
    try {
      const inputs = cableSizingInputSchema.parse(req.body);
      const results = calculateCableSizing(inputs);
      
      // Store calculation
      const calculation = await storage.createCalculation({
        userId: null,
        type: 'cable-sizing',
        inputs: inputs as any,
        results: results as any,
      });

      res.json({ success: true, results, calculationId: calculation.id });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Get calculation history
  app.get("/api/calculations", async (req, res) => {
    try {
      const calculations = await storage.getCalculationsByUserId('anonymous');
      res.json(calculations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
