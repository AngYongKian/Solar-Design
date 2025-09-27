import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const calculations = pgTable("calculations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  type: text("type").notNull(), // 'panel-layout', 'inverter-sizing', 'cable-sizing'
  inputs: jsonb("inputs").notNull(),
  results: jsonb("results").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCalculationSchema = createInsertSchema(calculations).pick({
  userId: true,
  type: true,
  inputs: true,
  results: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
export type Calculation = typeof calculations.$inferSelect;

// Calculation types
export const panelLayoutInputSchema = z.object({
  roofLength: z.number().min(1),
  roofWidth: z.number().min(1),
  panelLength: z.number().min(1),
  panelWidth: z.number().min(1),
  orientation: z.enum(['portrait', 'landscape']),
  rowGap: z.number().min(0),
  columnGap: z.number().min(0),
});

export const inverterSizingInputSchema = z.object({
  // Panel specs
  panelModel: z.string(),
  pmax: z.number().min(0),
  vmp: z.number().min(0),
  imp: z.number().min(0),
  voc: z.number().min(0),
  isc: z.number().min(0),
  tempCoeffVoc: z.number(), // Allow negative values
  tempCoeffPmax: z.number(), // Allow negative values
  // Inverter specs
  inverterModel: z.string(),
  acPower: z.number().min(0),
  mpptRangeMin: z.number().min(0),
  mpptRangeMax: z.number().min(0),
  maxInputVoltage: z.number().min(0),
  maxInputCurrent: z.number().min(0),
  startupVoltage: z.number().min(0), // Added startup voltage
  numMppts: z.number().min(1),
  stringsPerMppt: z.number().min(1),
  numInverters: z.number().min(1),
});

export const cableSizingInputSchema = z.object({
  // DC Cable
  dcMaxStringCurrent: z.number().min(0),
  dcSafetyFactor: z.number().min(1),
  dcCableLength: z.number().min(0),
  dcVoltageDropLimit: z.number().min(0),
  dcInstallationMethod: z.enum(['conduit', 'tray', 'buried', 'free-air']),
  dcCableMaterial: z.enum(['copper', 'aluminum']),
  dcOperatingTemp: z.number(),
  // AC Cable
  acPower: z.number().min(0),
  acVoltage: z.number().min(0),
  acCableLength: z.number().min(0),
  acPowerFactor: z.number().min(0.8).max(1),
  acCableMaterial: z.enum(['copper', 'aluminum']),
  acVoltageDropLimit: z.number().min(0),
  acInstallationMethod: z.enum(['conduit', 'tray', 'buried', 'overhead']),
});

export type PanelLayoutInput = z.infer<typeof panelLayoutInputSchema>;
export type InverterSizingInput = z.infer<typeof inverterSizingInputSchema>;
export type CableSizingInput = z.infer<typeof cableSizingInputSchema>;
