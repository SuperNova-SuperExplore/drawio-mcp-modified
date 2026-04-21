import { z } from "zod";
import { ToolRegistrar } from "./types.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const DoorSchema = z.object({ wall: z.enum(["north","south","east","west"]), position: z.number().min(0).max(1).default(0.5), width: z.number().optional().default(0.9) });
const WindowSchema = z.object({ wall: z.enum(["north","south","east","west"]), position: z.number().min(0).max(1).default(0.5), width: z.number().optional().default(1.2) });
const RoomSchema = z.object({
  name: z.string().describe("Room name"), width: z.number().min(1).describe("Width in meters"), height: z.number().min(1).describe("Height in meters"),
  type: z.enum(["bedroom","bathroom","kitchen","living","dining","garage","garden","hallway","office","laundry","storage"]).optional().default("living"),
  doors: z.array(DoorSchema).optional().default([]), windows: z.array(WindowSchema).optional().default([]),
});

const ROOM_COLORS: Record<string, {fill:string;stroke:string;label:string}> = {
  bedroom:{fill:"#E8D5E0",stroke:"#9E7B8E",label:"Bedroom"}, bathroom:{fill:"#D5E8F0",stroke:"#7BA3B8",label:"Bathroom"},
  kitchen:{fill:"#F0E8D5",stroke:"#B89E7B",label:"Kitchen"}, living:{fill:"#E0E8D5",stroke:"#8E9E7B",label:"Living"},
  dining:{fill:"#F5E6D0",stroke:"#C4A882",label:"Dining"}, garage:{fill:"#D0D0D0",stroke:"#808080",label:"Garage"},
  garden:{fill:"#C8E6C9",stroke:"#66BB6A",label:"Garden"}, hallway:{fill:"#E0E0E0",stroke:"#999999",label:"Hallway"},
  office:{fill:"#D5DEE8",stroke:"#7B8E9E",label:"Office"}, laundry:{fill:"#E0D5E8",stroke:"#8E7B9E",label:"Laundry"},
  storage:{fill:"#D8D8D8",stroke:"#888888",label:"Storage"},
};

const FURNITURE: Record<string, Array<{name:string;relX:number;relY:number;w:number;h:number;style:string}>> = {
  bedroom: [
    {name:"Bed",relX:0.5,relY:0.4,w:1.6,h:2.0,style:"rounded=1;fillColor=#8B4513;strokeColor=#5C2E00;fontColor=#fff;fontSize=9;"},
    {name:"Wardrobe",relX:0.15,relY:0.1,w:0.6,h:1.8,style:"fillColor=#A0522D;strokeColor=#6D3600;fontColor=#fff;fontSize=8;"},
  ],
  bathroom: [
    {name:"Toilet",relX:0.25,relY:0.7,w:0.4,h:0.6,style:"rounded=1;fillColor=#FFFFFF;strokeColor=#666;fontColor=#333;fontSize=8;"},
    {name:"Sink",relX:0.25,relY:0.2,w:0.5,h:0.4,style:"rounded=1;fillColor=#E0E0E0;strokeColor=#666;fontColor=#333;fontSize=8;"},
    {name:"Shower",relX:0.75,relY:0.5,w:0.9,h:0.9,style:"fillColor=#B0D4E8;strokeColor=#4A90A4;fontColor=#333;fontSize=8;dashed=1;"},
  ],
  kitchen: [
    {name:"Counter",relX:0.5,relY:0.1,w:2.4,h:0.6,style:"fillColor=#D2B48C;strokeColor=#8B7355;fontColor=#333;fontSize=8;"},
    {name:"Stove",relX:0.3,relY:0.1,w:0.6,h:0.6,style:"fillColor=#333;strokeColor=#000;fontColor=#fff;fontSize=8;"},
    {name:"Fridge",relX:0.85,relY:0.1,w:0.7,h:0.7,style:"fillColor=#C0C0C0;strokeColor=#888;fontColor=#333;fontSize=8;"},
  ],
  living: [
    {name:"Sofa",relX:0.5,relY:0.7,w:2.0,h:0.8,style:"rounded=1;fillColor=#4A6741;strokeColor=#2E4A27;fontColor=#fff;fontSize=9;"},
    {name:"TV",relX:0.5,relY:0.1,w:1.2,h:0.1,style:"fillColor=#1a1a1a;strokeColor=#000;fontColor=#fff;fontSize=8;"},
    {name:"Coffee Table",relX:0.5,relY:0.45,w:1.0,h:0.5,style:"rounded=1;fillColor=#8B6914;strokeColor=#5C4600;fontColor=#fff;fontSize=8;"},
  ],
};

export const registerFloorPlanTool: ToolRegistrar = (server, _context) => {
  server.tool("generate-floor-plan",
    "Generate a floor plan (denah rumah) from room specifications. Supports auto-furniture, doors, windows. Room types: bedroom, bathroom, kitchen, living, dining, garage, garden, hallway, office, laundry, storage.",
    {
      rooms: z.array(RoomSchema).describe("Array of rooms with dimensions"),
      title: z.string().optional().default("Floor Plan"),
      scale: z.number().optional().default(50).describe("Pixels per meter"),
      show_furniture: z.boolean().optional().default(true),
    },
    async (args) => {
      const {rooms,title,scale,show_furniture} = args;
      let cellId=2, cells="", curX=40, curY=40, maxH=0, totalArea=0;
      const perRow = Math.ceil(Math.sqrt(rooms.length));
      let col=0;

      for (const room of rooms) {
        const w=room.width*scale, h=room.height*scale;
        const colors = ROOM_COLORS[room.type]||ROOM_COLORS.living;
        const area = room.width*room.height; totalArea+=area;
        const label = `${colors.label}\\n${room.name}\\n${room.width}x${room.height}m (${area.toFixed(1)}m2)`;
        const style = `whiteSpace=wrap;html=1;fillColor=${colors.fill};strokeColor=${colors.stroke};fontColor=#333;fontSize=12;fontStyle=1;verticalAlign=top;spacingTop=8;`;
        cells+=`<mxCell id="${cellId++}" value="${label}" style="${style}" vertex="1" parent="1"><mxGeometry x="${curX}" y="${curY}" width="${w}" height="${h}" as="geometry"/></mxCell>\n`;

        for (const door of room.doors||[]) {
          const dw=door.width!*scale; let dx=curX,dy=curY;
          if(door.wall==="north"){dx+=door.position*w-dw/2;dy-=5;} else if(door.wall==="south"){dx+=door.position*w-dw/2;dy+=h-5;} else if(door.wall==="west"){dy+=door.position*h-5;dx-=5;} else{dy+=door.position*h-5;dx+=w-5;}
          cells+=`<mxCell id="${cellId++}" value="" style="shape=mxgraph.floorplan.door;fillColor=#FFF;strokeColor=#333;" vertex="1" parent="1"><mxGeometry x="${dx}" y="${dy}" width="${dw}" height="10" as="geometry"/></mxCell>\n`;
        }

        for (const win of room.windows||[]) {
          const ww=win.width!*scale; let wx=curX,wy=curY;
          if(win.wall==="north"){wx+=win.position*w-ww/2;wy-=3;} else if(win.wall==="south"){wx+=win.position*w-ww/2;wy+=h-3;} else if(win.wall==="west"){wy+=win.position*h-3;wx-=3;} else{wy+=win.position*h-3;wx+=w-3;}
          cells+=`<mxCell id="${cellId++}" value="" style="fillColor=#ADD8E6;strokeColor=#4682B4;opacity=60;" vertex="1" parent="1"><mxGeometry x="${wx}" y="${wy}" width="${ww}" height="6" as="geometry"/></mxCell>\n`;
        }

        if (show_furniture && FURNITURE[room.type]) {
          for (const f of FURNITURE[room.type]) {
            const fw=f.w*scale, fh=f.h*scale, fx=curX+f.relX*w-fw/2, fy=curY+f.relY*h-fh/2+15;
            cells+=`<mxCell id="${cellId++}" value="${f.name}" style="${f.style}whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="${Math.round(fx)}" y="${Math.round(fy)}" width="${Math.round(fw)}" height="${Math.round(fh)}" as="geometry"/></mxCell>\n`;
          }
        }

        maxH=Math.max(maxH,h); col++;
        if(col>=perRow){curX=40;curY+=maxH+30;maxH=0;col=0;} else curX+=w+20;
      }

      const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<mxfile host="rex-diagram-engine" agent="REX v1.0">\n  <diagram id="fp" name="${title}">\n    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1920" pageHeight="1080" background="#FAFAFA">\n      <root><mxCell id="0"/><mxCell id="1" parent="0"/>${cells}</root>\n    </mxGraphModel>\n  </diagram>\n</mxfile>`;

      const roomSummary = rooms.map(r=>`  - ${r.name}: ${r.width}x${r.height}m = ${(r.width*r.height).toFixed(1)}m2`).join("\n");
      return {content:[{type:"text",text:`Floor plan generated: "${title}"\nTotal area: ${totalArea.toFixed(1)}m2\nRooms (${rooms.length}):\n${roomSummary}\nFurniture: ${show_furniture?"Yes":"No"}\nScale: 1m = ${scale}px\n\nUse import-diagram to load.\n\n${xml}`}]};
    });
};
