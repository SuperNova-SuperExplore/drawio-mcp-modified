import { z } from "zod";
import { ToolRegistrar } from "./types.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const NodeSchema = z.object({
  id: z.string().describe("Unique node identifier"),
  label: z.string().describe("Display label for the node"),
  type: z.enum(["server", "database", "service", "client", "gateway", "cache", "queue", "loadbalancer", "firewall", "cloud", "custom"]).optional().default("custom").describe("Node type"),
  group: z.string().optional().describe("Optional group name"),
});

const EdgeSchema = z.object({
  from: z.string().describe("Source node ID"),
  to: z.string().describe("Target node ID"),
  label: z.string().optional().default("").describe("Edge label"),
});

const NODE_STYLES: Record<string, string> = {
  server: "shape=mxgraph.cisco.servers.standard_server;sketch=0;fillColor=#036897;strokeColor=#ffffff;fontColor=#ffffff;fontStyle=1;fontSize=11;whiteSpace=wrap;html=1;",
  database: "shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#2D7600;strokeColor=#23B14D;fontColor=#ffffff;fontStyle=1;fontSize=11;",
  service: "rounded=1;whiteSpace=wrap;html=1;fillColor=#1BA1E2;strokeColor=#006EAF;fontColor=#ffffff;fontStyle=1;fontSize=11;arcSize=20;",
  client: "shape=mxgraph.cisco.computers_and_peripherals.laptop;sketch=0;fillColor=#036897;strokeColor=#ffffff;fontColor=#ffffff;fontStyle=1;fontSize=11;whiteSpace=wrap;html=1;",
  gateway: "shape=hexagon;perimeter=hexagonPerimeter2;whiteSpace=wrap;html=1;fixedSize=1;fillColor=#6d8764;strokeColor=#3A5431;fontColor=#ffffff;fontStyle=1;fontSize=11;",
  cache: "shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fixedSize=1;fillColor=#a0522d;strokeColor=#6D1F00;fontColor=#ffffff;fontStyle=1;fontSize=11;",
  queue: "shape=mxgraph.arrows2.arrow;dy=0.6;dx=40;notch=0;whiteSpace=wrap;html=1;fillColor=#a20025;strokeColor=#6F0000;fontColor=#ffffff;fontStyle=1;fontSize=11;",
  loadbalancer: "shape=mxgraph.cisco.switches.multilayer_switch;sketch=0;fillColor=#036897;strokeColor=#ffffff;fontColor=#ffffff;fontStyle=1;fontSize=11;whiteSpace=wrap;html=1;",
  firewall: "shape=mxgraph.cisco.firewalls.firewall;sketch=0;fillColor=#FF0000;strokeColor=#ffffff;fontColor=#ffffff;fontStyle=1;fontSize=11;whiteSpace=wrap;html=1;",
  cloud: "ellipse;shape=cloud;whiteSpace=wrap;html=1;fillColor=#0050ef;strokeColor=#001DBC;fontColor=#ffffff;fontStyle=1;fontSize=11;",
  custom: "rounded=1;whiteSpace=wrap;html=1;fillColor=#76608a;strokeColor=#432D57;fontColor=#ffffff;fontStyle=1;fontSize=11;",
};

function getPositions(count: number, layout: string) {
  const pos: {x:number;y:number}[] = [];
  if (layout === "radial" && count > 1) {
    pos.push({x:500,y:400});
    const r = Math.max(250,(count-1)*45);
    for (let i=1;i<count;i++) { const a=(2*Math.PI*(i-1))/(count-1); pos.push({x:500+r*Math.cos(a),y:400+r*Math.sin(a)}); }
    return pos;
  }
  if (layout === "force") {
    const r = Math.max(200,count*40);
    for (let i=0;i<count;i++) { const a=(2*Math.PI*i)/count; pos.push({x:500+r*Math.cos(a),y:400+r*Math.sin(a)}); }
    return pos;
  }
  const cols = Math.ceil(Math.sqrt(count));
  for (let i=0;i<count;i++) pos.push({x:(i%cols)*220+50,y:Math.floor(i/cols)*150+50});
  return pos;
}

export const registerGenerateFromJsonTool: ToolRegistrar = (server, _context) => {
  server.tool("generate-from-json",
    "Generate a complete Draw.io diagram from structured JSON data with auto-layout.",
    {
      nodes: z.array(NodeSchema).describe("Array of nodes"),
      edges: z.array(EdgeSchema).optional().default([]).describe("Array of edges"),
      layout: z.enum(["hierarchical","force","radial","grid"]).optional().default("hierarchical"),
      title: z.string().optional().default("Generated Diagram"),
      background: z.string().optional().default("#1a1a2e"),
    },
    async (args) => {
      const {nodes,edges,layout,title,background} = args;
      const positions = getPositions(nodes.length, layout);
      let cellId = 2; const nodeIdMap: Record<string,number> = {}; let cells = "";
      for (let i=0;i<nodes.length;i++) {
        const n=nodes[i], p=positions[i], style=NODE_STYLES[n.type||"custom"]||NODE_STYLES.custom;
        const id=cellId++; nodeIdMap[n.id]=id;
        const w=n.type==="database"?80:140, h=n.type==="database"?80:70;
        cells+=`<mxCell id="${id}" value="${n.label}" style="${style}" vertex="1" parent="1"><mxGeometry x="${Math.round(p.x)}" y="${Math.round(p.y)}" width="${w}" height="${h}" as="geometry"/></mxCell>\n`;
      }
      for (const e of edges) {
        const s=nodeIdMap[e.from],t=nodeIdMap[e.to]; if(s===undefined||t===undefined) continue;
        const id=cellId++;
        cells+=`<mxCell id="${id}" value="${e.label}" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#B0B0B0;fontColor=#CCC;fontSize=11;" edge="1" parent="1" source="${s}" target="${t}"><mxGeometry relative="1" as="geometry"/></mxCell>\n`;
      }
      const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<mxfile host="rex-diagram-engine" agent="REX v1.0">\n  <diagram id="gen" name="${title}">\n    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1920" pageHeight="1080" background="${background}">\n      <root><mxCell id="0"/><mxCell id="1" parent="0"/>${cells}</root>\n    </mxGraphModel>\n  </diagram>\n</mxfile>`;
      return {content:[{type:"text",text:`Diagram generated: "${title}"\nNodes: ${nodes.length} | Edges: ${edges.length} | Layout: ${layout}\nUse import-diagram to load.\n\n${xml}`}]};
    });
};
