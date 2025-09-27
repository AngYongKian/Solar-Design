import { useEffect, useRef } from "react";

interface PanelLayoutResult {
  totalPanels: number;
  rows: number;
  columns: number;
  totalArea: number;
  roofCoverage: number;
  availableSpace: number;
  panelArrangement: { row: number; col: number }[];
}

interface PanelLayoutInput {
  roofLength: number;
  roofWidth: number;
  panelLength: number;
  panelWidth: number;
  orientation: 'portrait' | 'landscape';
  rowGap: number;
  columnGap: number;
}

interface Props {
  results: PanelLayoutResult | null;
  inputs: PanelLayoutInput;
}

export default function PanelLayoutDiagram({ results, inputs }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !results) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Convert millimeters to meters for display
    const roofLengthM = inputs.roofLength / 1000;
    const roofWidthM = inputs.roofWidth / 1000;
    const panelLengthM = inputs.panelLength / 1000;
    const panelWidthM = inputs.panelWidth / 1000;
    const rowGapM = inputs.rowGap / 1000;
    const columnGapM = inputs.columnGap / 1000;

    // Calculate scaling
    const padding = 40;
    const canvasWidth = canvas.width - 2 * padding;
    const canvasHeight = canvas.height - 2 * padding;
    
    const scaleX = canvasWidth / roofLengthM;
    const scaleY = canvasHeight / roofWidthM;
    const scale = Math.min(scaleX, scaleY);

    // Center the drawing
    const startX = padding + (canvasWidth - roofLengthM * scale) / 2;
    const startY = padding + (canvasHeight - roofWidthM * scale) / 2;

    // Draw roof outline
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, roofLengthM * scale, roofWidthM * scale);

    // Add roof label
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px Inter';
    ctx.fillText(`Roof: ${roofLengthM.toFixed(1)}m × ${roofWidthM.toFixed(1)}m`, startX, startY - 10);

    // Draw panels with proper alignment
    const effectivePanelWidthM = inputs.orientation === 'portrait' ? panelWidthM : panelLengthM;
    const effectivePanelHeightM = inputs.orientation === 'portrait' ? panelLengthM : panelWidthM;

    ctx.fillStyle = '#3B82F6';
    ctx.strokeStyle = '#1E40AF';
    ctx.lineWidth = 1;

    // Start with proper edge clearance (0.5m from roof edge)
    const edgeClearance = 0.5;
    let currentY = startY + (edgeClearance * scale);
    
    for (let row = 0; row < results.rows; row++) {
      let currentX = startX + (edgeClearance * scale);
      
      for (let col = 0; col < results.columns; col++) {
        const rectWidth = effectivePanelWidthM * scale;
        const rectHeight = effectivePanelHeightM * scale;
        
        // Fill panel
        ctx.fillRect(currentX, currentY, rectWidth, rectHeight);
        // Stroke panel border
        ctx.strokeRect(currentX, currentY, rectWidth, rectHeight);
        
        currentX += rectWidth + (columnGapM * scale);
      }
      
      currentY += effectivePanelHeightM * scale + (rowGapM * scale);
    }

    // Add dimensions
    ctx.fillStyle = '#6B7280';
    ctx.font = '10px Inter';
    ctx.fillText(`${results.rows} rows × ${results.columns} columns`, startX, startY + roofWidthM * scale + 25);
    ctx.fillText(`${results.totalPanels} panels total`, startX, startY + roofWidthM * scale + 40);

  }, [results, inputs]);

  if (!results) {
    return (
      <div className="bg-muted rounded-lg p-4 h-96 flex items-center justify-center" data-testid="diagram-placeholder">
        <div className="text-center">
          <div className="text-muted-foreground mb-2">Panel Layout Diagram</div>
          <p className="text-sm text-muted-foreground">Calculate panel layout to see diagram</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted rounded-lg p-4 h-96" data-testid="panel-layout-diagram">
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className="w-full h-full"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
}
