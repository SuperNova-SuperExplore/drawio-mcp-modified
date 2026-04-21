import { z } from "zod";
import { ToolRegistrar } from "./types.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const BranchSchema = z.object({
  topic: z.string().describe("Branch topic"),
  sub_topics: z.array(z.string()).optional().default([]).describe("Sub-topics"),
  color: z.string().optional().describe("Custom color"),
});

const COLORS = [
  {fill:"#FF6B6B",stroke:"#CC4444",font:"#FFF"},{fill:"#4ECDC4",stroke:"#36A89E",font:"#FFF"},
  {fill:"#45B7D1",stroke:"#2E8BA8",font:"#FFF"},{fill:"#96CEB4",stroke:"#6DAA8E",font:"#FFF"},
  {fill:"#FFEAA7",stroke:"#CCBB77",font:"#333"},{fill:"#DDA0DD",stroke:"#AA77AA",font:"#FFF"},
  {fill:"#98D8C8",stroke:"#6BB5A5",font:"#333"},{fill:"#F7DC6F",stroke:"#C4AA44",font:"#333"},
  {fill:"#BB8FCE",stroke:"#8866AA",font:"#FFF"},{fill:"#85C1E9",stroke:"#5599BB",font:"#FFF"},
];

export const registerMindMapTool: ToolRegistrar = (server, _context) => {
  server.tool("generate-mind-map",
    "Generate a mind map diagram with radial, tree, or organic layout.",
    {
      central_topic: z.string().describe("Central topic"),
      branches: z.array(BranchSchema).describe("Branches from central topic"),
      style: z.enum(["radial","tree","organic"]).optional().default("radial"),
      title: z.string().optional().default("Mind Map"),
    },
    async (args) => {
      const {central_topic,branches,style,title} = args;
      let cellId=2, cells="";
      const cx=700, cy=500;

      cells+=`<mxCell id="${cellId}" value="${central_topic}" style="ellipse;whiteSpace=wrap;html=1;fillColor=#2C3E50;strokeColor=#1A252F;fontColor=#ECF0F1;fontSize=16;fontStyle=1;shadow=1;" vertex="1" parent="1"><mxGeometry x="${cx-80}" y="${cy-40}" width="160" height="80" as="geometry"/></mxCell>\n`;
      const centralId=cellId++;

      for (let i=0;i<branches.length;i++) {
        const b=branches[i], c=COLORS[i%COLORS.length], fill=b.color||c.fill;
        let bx:number, by:number;
        if(style==="tree"){const tw=branches.length*250;bx=cx-tw/2+i*250+60;by=cy+180;}
        else{const a=(2*Math.PI*i)/branches.length-Math.PI/2;const r=280;bx=cx+r*Math.cos(a)-65;by=cy+r*Math.sin(a)-25;}

        cells+=`<mxCell id="${cellId}" value="${b.topic}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=${fill};strokeColor=${c.stroke};fontColor=${c.font};fontSize=13;fontStyle=1;arcSize=30;shadow=1;" vertex="1" parent="1"><mxGeometry x="${Math.round(bx)}" y="${Math.round(by)}" width="130" height="50" as="geometry"/></mxCell>\n`;
        const bid=cellId++;
        cells+=`<mxCell id="${cellId++}" value="" style="edgeStyle=orthogonalEdgeStyle;curved=1;rounded=1;strokeColor=${fill};strokeWidth=3;endArrow=none;" edge="1" parent="1" source="${centralId}" target="${bid}"><mxGeometry relative="1" as="geometry"/></mxCell>\n`;

        for (let j=0;j<(b.sub_topics||[]).length;j++) {
          let sx:number,sy:number;
          if(style==="tree"){const stw=(b.sub_topics||[]).length*140;sx=bx-stw/2+j*140+65;sy=by+130;}
          else{const sa=(2*Math.PI*i)/branches.length-Math.PI/2;const ss=((j-((b.sub_topics||[]).length-1)/2)*70);sx=bx+65+180*Math.cos(sa)-50+ss*Math.cos(sa+Math.PI/2);sy=by+25+180*Math.sin(sa)-18+ss*Math.sin(sa+Math.PI/2);}
          cells+=`<mxCell id="${cellId}" value="${(b.sub_topics||[])[j]}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFF;strokeColor=${fill};fontColor=#333;fontSize=11;arcSize=20;strokeWidth=2;" vertex="1" parent="1"><mxGeometry x="${Math.round(sx)}" y="${Math.round(sy)}" width="100" height="36" as="geometry"/></mxCell>\n`;
          const sid=cellId++;
          cells+=`<mxCell id="${cellId++}" value="" style="curved=1;rounded=1;strokeColor=${fill};strokeWidth=2;endArrow=none;dashed=1;" edge="1" parent="1" source="${bid}" target="${sid}"><mxGeometry relative="1" as="geometry"/></mxCell>\n`;
        }
      }

      const totalNodes=1+branches.reduce((s,b)=>s+1+(b.sub_topics?.length||0),0);
      const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<mxfile host="rex-diagram-engine" agent="REX v1.0">\n  <diagram id="mm" name="${title}">\n    <mxGraphModel dx="1400" dy="1000" grid="0" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1920" pageHeight="1200" background="#FFFFFF">\n      <root><mxCell id="0"/><mxCell id="1" parent="0"/>${cells}</root>\n    </mxGraphModel>\n  </diagram>\n</mxfile>`;

      return {content:[{type:"text",text:`Mind map generated: "${title}"\nCentral: ${central_topic}\nBranches: ${branches.length}\nTotal nodes: ${totalNodes}\nLayout: ${style}\n\nUse import-diagram to load.\n\n${xml}`}]};
    });
};
