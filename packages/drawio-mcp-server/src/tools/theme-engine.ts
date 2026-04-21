import { z } from "zod";
import { ToolRegistrar } from "./types.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const THEMES: Record<string, { description: string; background: string; nodeStyle: string; edgeStyle: string; fontColor: string }> = {
  dark: { description:"Dark mode with neon accents", background:"#1a1a2e", nodeStyle:"rounded=1;whiteSpace=wrap;html=1;fillColor=#16213e;strokeColor=#0f3460;fontColor=#e0e0e0;fontSize=12;fontStyle=1;shadow=1;arcSize=15;", edgeStyle:"edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#535C91;strokeWidth=2;fontColor=#888;", fontColor:"#e0e0e0" },
  light: { description:"Clean light mode", background:"#FFFFFF", nodeStyle:"rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#333333;fontColor=#333333;fontSize=12;fontStyle=1;shadow=1;arcSize=15;", edgeStyle:"edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#999;strokeWidth=2;fontColor=#666;", fontColor:"#333333" },
  cyber: { description:"Cyberpunk hacker aesthetic", background:"#0a0a0a", nodeStyle:"rounded=1;whiteSpace=wrap;html=1;fillColor=#0d1117;strokeColor=#00ff41;fontColor=#00ff41;fontSize=12;fontStyle=1;shadow=1;arcSize=10;strokeWidth=2;", edgeStyle:"edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#00ff41;strokeWidth=2;fontColor=#00ff41;opacity=70;", fontColor:"#00ff41" },
  blueprint: { description:"Engineering blueprint style", background:"#1a3a5c", nodeStyle:"rounded=0;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#FFFFFF;fontColor=#FFFFFF;fontSize=12;fontStyle=0;strokeWidth=2;", edgeStyle:"edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#FFFFFF;strokeWidth=1;fontColor=#FFFFFF;dashed=1;", fontColor:"#FFFFFF" },
  minimal: { description:"Minimalist monochrome", background:"#FAFAFA", nodeStyle:"rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#E0E0E0;fontColor=#424242;fontSize=11;fontStyle=0;arcSize=8;", edgeStyle:"edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#BDBDBD;strokeWidth=1;fontColor=#9E9E9E;", fontColor:"#424242" },
  ocean: { description:"Deep ocean blues and teals", background:"#0a192f", nodeStyle:"rounded=1;whiteSpace=wrap;html=1;fillColor=#172a45;strokeColor=#64ffda;fontColor=#ccd6f6;fontSize=12;fontStyle=1;shadow=1;arcSize=15;", edgeStyle:"edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#64ffda;strokeWidth=2;fontColor=#8892b0;", fontColor:"#ccd6f6" },
  sunset: { description:"Warm sunset gradient vibes", background:"#1a1423", nodeStyle:"rounded=1;whiteSpace=wrap;html=1;fillColor=#2d1b3d;strokeColor=#ff6b6b;fontColor=#ffecd2;fontSize=12;fontStyle=1;shadow=1;arcSize=15;", edgeStyle:"edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#fc5c7d;strokeWidth=2;fontColor=#ffecd2;", fontColor:"#ffecd2" },
  pastel: { description:"Soft pastel colors", background:"#FFF5F5", nodeStyle:"rounded=1;whiteSpace=wrap;html=1;fillColor=#FFE4E1;strokeColor=#FFB6C1;fontColor=#555;fontSize=12;fontStyle=1;arcSize=20;", edgeStyle:"edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#DDA0DD;strokeWidth=2;fontColor=#888;", fontColor:"#555555" },
};

export const registerThemeTools: ToolRegistrar = (server, _context) => {
  server.tool("list-themes", "List all available diagram themes.", {},
    async () => {
      let text = "Available Themes:\n\n";
      for (const [name, theme] of Object.entries(THEMES)) text += `  - ${name}: ${theme.description}\n    Background: ${theme.background} | Font: ${theme.fontColor}\n\n`;
      return { content: [{ type: "text", text }] };
    });
  server.tool("get-theme-styles", "Get style strings for a specific theme.",
    { theme: z.enum(Object.keys(THEMES) as [string, ...string[]]).describe("Theme name") },
    async (args) => {
      const theme = THEMES[args.theme];
      if (!theme) return { content: [{ type: "text", text: `Theme not found: ${args.theme}` }] };
      const result: CallToolResult = { content: [{ type: "text", text: `Theme: ${args.theme}\n${theme.description}\n\nBackground: ${theme.background}\nNode style: ${theme.nodeStyle}\nEdge style: ${theme.edgeStyle}\nFont color: ${theme.fontColor}` }] };
      return result;
    });
};
