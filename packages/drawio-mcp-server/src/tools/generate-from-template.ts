import { z } from "zod";
import { ToolRegistrar } from "./types.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const TEMPLATES: Record<string, {description:string;generator:(p:any)=>string}> = {
  "network-topology":{description:"Network topology with hosts, routers, connections",generator:genNetwork},
  "system-architecture":{description:"System architecture with frontend, backend, database layers",generator:genArch},
  "gantt-chart":{description:"Project timeline / Gantt chart",generator:genGantt},
  "org-chart":{description:"Organization hierarchy chart",generator:genOrg},
  "business-model-canvas":{description:"Business Model Canvas (BMC)",generator:genBMC},
  "swot-analysis":{description:"SWOT analysis",generator:genSWOT},
  "user-flow":{description:"User flow / journey diagram",generator:genUserFlow},
  "er-diagram":{description:"Entity-Relationship database diagram",generator:genER},
};

function wrap(title:string,cells:string,bg:string):string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<mxfile host="rex-diagram-engine" agent="REX v1.0">\n  <diagram id="tmpl" name="${title}">\n    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1920" pageHeight="1080" background="${bg}">\n      <root><mxCell id="0"/><mxCell id="1" parent="0"/>${cells}</root>\n    </mxGraphModel>\n  </diagram>\n</mxfile>`;
}

function genNetwork(p:any):string {
  const hosts=p.hosts||[{name:"Router",ip:"192.168.1.1",type:"router"},{name:"Web Server",ip:"192.168.1.10",type:"server"},{name:"DB Server",ip:"192.168.1.20",type:"database"},{name:"Client 1",ip:"192.168.1.100",type:"client"}];
  let id=2,c="";const m:Record<string,number>={};
  const st:Record<string,string>={router:"shape=mxgraph.cisco.routers.router;fillColor=#036897;strokeColor=#fff;fontColor=#fff;fontSize=10;whiteSpace=wrap;html=1;",server:"shape=mxgraph.cisco.servers.standard_server;fillColor=#036897;strokeColor=#fff;fontColor=#fff;fontSize=10;whiteSpace=wrap;html=1;",database:"shape=cylinder3;fillColor=#2D7600;strokeColor=#23B14D;fontColor=#fff;fontSize=10;whiteSpace=wrap;html=1;boundedLbl=1;size=12;",client:"shape=mxgraph.cisco.computers_and_peripherals.laptop;fillColor=#036897;strokeColor=#fff;fontColor=#fff;fontSize=10;whiteSpace=wrap;html=1;"};
  for(let i=0;i<hosts.length;i++){const h=hosts[i];c+=`<mxCell id="${id}" value="${h.name}\\n${h.ip||''}" style="${st[h.type]||st.server}" vertex="1" parent="1"><mxGeometry x="${200+(i%3)*300}" y="${100+Math.floor(i/3)*250}" width="100" height="80" as="geometry"/></mxCell>\n`;m[h.name]=id++;}
  if(hosts[0])for(let i=1;i<hosts.length;i++)c+=`<mxCell id="${id++}" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#666;strokeWidth=2;" edge="1" parent="1" source="${m[hosts[0].name]}" target="${m[hosts[i].name]}"><mxGeometry relative="1" as="geometry"/></mxCell>\n`;
  return wrap("Network Topology",c,"#1a1a2e");
}

function genArch(p:any):string {
  const layers=p.layers||{frontend:["React App","Mobile App"],gateway:["API Gateway"],backend:["Auth Service","User Service","Order Service"],data:["PostgreSQL","Redis","S3"]};
  let id=2,c="";const lc:Record<string,{fill:string;stroke:string}>={frontend:{fill:"#4ECDC4",stroke:"#36A89E"},gateway:{fill:"#FF6B6B",stroke:"#CC4444"},backend:{fill:"#45B7D1",stroke:"#2E8BA8"},data:{fill:"#96CEB4",stroke:"#6DAA8E"}};
  let y=50;const prev:number[]=[];
  for(const [layer,services] of Object.entries(layers) as [string,string[]][]){
    const col=lc[layer]||{fill:"#76608a",stroke:"#432D57"};const cur:number[]=[];
    c+=`<mxCell id="${id++}" value="${layer.toUpperCase()}" style="text;fontSize=14;fontStyle=1;fontColor=#888;align=left;" vertex="1" parent="1"><mxGeometry x="30" y="${y+15}" width="100" height="30" as="geometry"/></mxCell>\n`;
    for(let i=0;i<services.length;i++){const x=150+i*200;const st=layer==="data"?`shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;size=12;fillColor=${col.fill};strokeColor=${col.stroke};fontColor=#fff;fontSize=11;fontStyle=1;`:`rounded=1;whiteSpace=wrap;html=1;fillColor=${col.fill};strokeColor=${col.stroke};fontColor=#fff;fontSize=11;fontStyle=1;arcSize=20;shadow=1;`;c+=`<mxCell id="${id}" value="${services[i]}" style="${st}" vertex="1" parent="1"><mxGeometry x="${x}" y="${y}" width="140" height="60" as="geometry"/></mxCell>\n`;cur.push(id++);}
    if(prev.length>0)for(const pi of prev)for(const ci of cur)c+=`<mxCell id="${id++}" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#666;strokeWidth=1;endArrow=classic;" edge="1" parent="1" source="${pi}" target="${ci}"><mxGeometry relative="1" as="geometry"/></mxCell>\n`;
    prev.length=0;prev.push(...cur);y+=150;
  }
  return wrap("System Architecture",c,"#1a1a2e");
}

function genGantt(p:any):string {
  const tasks=p.tasks||[{name:"Planning",weeks:2,start:0},{name:"Design",weeks:3,start:1},{name:"Development",weeks:6,start:3},{name:"Testing",weeks:2,start:8},{name:"Launch",weeks:1,start:10}];
  let id=2,c="";const colors=["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#F7DC6F","#BB8FCE"];const ww=80,rh=50,hh=40,lw=150;
  const maxW=Math.max(...tasks.map((t:any)=>t.start+t.weeks));
  for(let w=0;w<maxW;w++)c+=`<mxCell id="${id++}" value="W${w+1}" style="text;fontSize=11;fontStyle=1;fontColor=#666;align=center;fillColor=#f0f0f0;strokeColor=#ddd;" vertex="1" parent="1"><mxGeometry x="${lw+w*ww}" y="20" width="${ww}" height="${hh}" as="geometry"/></mxCell>\n`;
  for(let i=0;i<tasks.length;i++){const t=tasks[i],y=20+hh+i*rh+5,col=colors[i%colors.length];c+=`<mxCell id="${id++}" value="${t.name}" style="text;fontSize=11;fontStyle=1;fontColor=#333;align=right;spacingRight=10;" vertex="1" parent="1"><mxGeometry x="0" y="${y}" width="${lw}" height="${rh-10}" as="geometry"/></mxCell>\n`;c+=`<mxCell id="${id++}" value="${t.weeks}w" style="rounded=1;whiteSpace=wrap;html=1;fillColor=${col};strokeColor=none;fontColor=#fff;fontSize=10;fontStyle=1;arcSize=30;shadow=1;" vertex="1" parent="1"><mxGeometry x="${lw+t.start*ww}" y="${y+5}" width="${t.weeks*ww-5}" height="${rh-20}" as="geometry"/></mxCell>\n`;}
  return wrap("Gantt Chart",c,"#FFFFFF");
}

function genOrg(p:any):string {
  const people=p.people||[{name:"CEO",role:"Chief Executive",reports_to:null},{name:"CTO",role:"Technology",reports_to:"CEO"},{name:"CFO",role:"Finance",reports_to:"CEO"},{name:"CMO",role:"Marketing",reports_to:"CEO"},{name:"Dev Lead",role:"Development",reports_to:"CTO"},{name:"DevOps",role:"Operations",reports_to:"CTO"}];
  let id=2,c="";const m:Record<string,number>={};
  const levels:Record<number,typeof people>={};
  const getL=(n:string,d=0):number=>{const pp=people.find((x:any)=>x.name===n);if(!pp||!pp.reports_to)return d;return getL(pp.reports_to,d+1);};
  for(const pp of people){const l=getL(pp.name);if(!levels[l])levels[l]=[];levels[l].push(pp);}
  for(const [ls,members] of Object.entries(levels)){const l=parseInt(ls);for(let i=0;i<members.length;i++){const mm=members[i],x=400+(i-(members.length-1)/2)*200,y=80+l*140;const st=l===0?"rounded=1;whiteSpace=wrap;html=1;fillColor=#2C3E50;strokeColor=#1A252F;fontColor=#ECF0F1;fontSize=12;fontStyle=1;shadow=1;arcSize=15;":"rounded=1;whiteSpace=wrap;html=1;fillColor=#3498DB;strokeColor=#2980B9;fontColor=#fff;fontSize=11;fontStyle=1;shadow=1;arcSize=15;";c+=`<mxCell id="${id}" value="${mm.name}\\n${mm.role}" style="${st}" vertex="1" parent="1"><mxGeometry x="${x}" y="${y}" width="140" height="60" as="geometry"/></mxCell>\n`;m[mm.name]=id++;}}
  for(const pp of people)if(pp.reports_to&&m[pp.reports_to]!==undefined)c+=`<mxCell id="${id++}" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#888;strokeWidth=2;" edge="1" parent="1" source="${m[pp.reports_to]}" target="${m[pp.name]}"><mxGeometry relative="1" as="geometry"/></mxCell>\n`;
  return wrap("Organization Chart",c,"#FFFFFF");
}

function genBMC(p:any):string {
  const s=p.segments||{};let id=2,c="";
  const secs=[{key:"key_partners",label:"Key Partners",x:0,y:0,w:200,h:350},{key:"key_activities",label:"Key Activities",x:200,y:0,w:200,h:175},{key:"key_resources",label:"Key Resources",x:200,y:175,w:200,h:175},{key:"value_propositions",label:"Value Props",x:400,y:0,w:200,h:350},{key:"customer_relationships",label:"Customer Rel.",x:600,y:0,w:200,h:175},{key:"channels",label:"Channels",x:600,y:175,w:200,h:175},{key:"customer_segments",label:"Customer Seg.",x:800,y:0,w:200,h:350},{key:"cost_structure",label:"Cost Structure",x:0,y:350,w:500,h:150},{key:"revenue_streams",label:"Revenue Streams",x:500,y:350,w:500,h:150}];
  const colors=["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#F7DC6F","#BB8FCE","#85C1E9"];
  for(let i=0;i<secs.length;i++){const sc=secs[i],ct=s[sc.key]||"",col=colors[i%colors.length];c+=`<mxCell id="${id++}" value="<b>${sc.label}</b><br/><br/>${ct}" style="whiteSpace=wrap;html=1;fillColor=${col}22;strokeColor=${col};fontColor=#333;fontSize=10;verticalAlign=top;spacingTop=5;overflow=hidden;" vertex="1" parent="1"><mxGeometry x="${sc.x+50}" y="${sc.y+50}" width="${sc.w}" height="${sc.h}" as="geometry"/></mxCell>\n`;}
  return wrap("Business Model Canvas",c,"#FFFFFF");
}

function genSWOT(p:any):string {
  let id=2,c="";
  const q=[{l:"Strengths",ct:p.strengths||"",x:50,y:80,f:"#4ECDC4"},{l:"Weaknesses",ct:p.weaknesses||"",x:450,y:80,f:"#FF6B6B"},{l:"Opportunities",ct:p.opportunities||"",x:50,y:380,f:"#45B7D1"},{l:"Threats",ct:p.threats||"",x:450,y:380,f:"#FFEAA7"}];
  c+=`<mxCell id="${id++}" value="SWOT Analysis" style="text;fontSize=22;fontStyle=1;fontColor=#333;align=center;" vertex="1" parent="1"><mxGeometry x="200" y="20" width="400" height="40" as="geometry"/></mxCell>\n`;
  for(const qi of q){const fc=qi.f==="#FFEAA7"?"#333":"#fff";c+=`<mxCell id="${id++}" value="<b>${qi.l}</b><br/><hr/>${qi.ct}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=${qi.f};strokeColor=${qi.f}88;fontColor=${fc};fontSize=12;verticalAlign=top;spacingTop=10;arcSize=10;shadow=1;overflow=hidden;" vertex="1" parent="1"><mxGeometry x="${qi.x}" y="${qi.y}" width="350" height="260" as="geometry"/></mxCell>\n`;}
  return wrap("SWOT Analysis",c,"#FFFFFF");
}

function genUserFlow(p:any):string {
  const steps=p.steps||[{label:"Start",type:"start"},{label:"Login Page",type:"process"},{label:"Valid Creds?",type:"decision"},{label:"Dashboard",type:"process"},{label:"Error",type:"process"},{label:"End",type:"end"}];
  let id=2,c="";const st:Record<string,string>={start:"ellipse;whiteSpace=wrap;html=1;fillColor=#2C3E50;fontColor=#fff;fontSize=12;fontStyle=1;",end:"ellipse;whiteSpace=wrap;html=1;fillColor=#C0392B;fontColor=#fff;fontSize=12;fontStyle=1;",process:"rounded=1;whiteSpace=wrap;html=1;fillColor=#3498DB;strokeColor=#2980B9;fontColor=#fff;fontSize=11;fontStyle=1;arcSize=15;shadow=1;",decision:"rhombus;whiteSpace=wrap;html=1;fillColor=#F39C12;strokeColor=#D68910;fontColor=#fff;fontSize=11;fontStyle=1;shadow=1;"};
  const ids:number[]=[];
  for(let i=0;i<steps.length;i++){const s=steps[i],sty=st[s.type]||st.process;const w=s.type==="decision"?120:s.type==="start"||s.type==="end"?100:140,h=s.type==="decision"?80:60;c+=`<mxCell id="${id}" value="${s.label}" style="${sty}" vertex="1" parent="1"><mxGeometry x="400" y="${50+i*130}" width="${w}" height="${h}" as="geometry"/></mxCell>\n`;ids.push(id++);}
  for(let i=0;i<ids.length-1;i++)c+=`<mxCell id="${id++}" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#666;strokeWidth=2;endArrow=classic;" edge="1" parent="1" source="${ids[i]}" target="${ids[i+1]}"><mxGeometry relative="1" as="geometry"/></mxCell>\n`;
  return wrap("User Flow",c,"#FFFFFF");
}

function genER(p:any):string {
  const tables=p.tables||[{name:"users",columns:[{name:"id",type:"INT",pk:true},{name:"name",type:"VARCHAR"},{name:"email",type:"VARCHAR"}]},{name:"orders",columns:[{name:"id",type:"INT",pk:true},{name:"user_id",type:"INT",fk:"users"},{name:"total",type:"DECIMAL"}]}];
  let id=2,c="";const m:Record<string,number>={};
  for(let i=0;i<tables.length;i++){const t=tables[i],x=100+(i%3)*300,y=80+Math.floor(i/3)*280;const cols=t.columns.map((cl:any)=>`${cl.pk?"PK ":cl.fk?"FK ":""}${cl.name}: ${cl.type}`).join("<br/>");c+=`<mxCell id="${id}" value="<b>${t.name}</b><hr/><span style='font-size:10px;color:#ccc;'>${cols}</span>" style="shape=table;startSize=30;container=0;collapsible=0;fillColor=#2C3E50;strokeColor=#1A252F;fontColor=#ECF0F1;fontSize=12;whiteSpace=wrap;html=1;overflow=hidden;" vertex="1" parent="1"><mxGeometry x="${x}" y="${y}" width="220" height="${60+t.columns.length*22}" as="geometry"/></mxCell>\n`;m[t.name]=id++;}
  for(const t of tables)for(const cl of t.columns)if(cl.fk&&m[cl.fk]!==undefined&&m[t.name]!==undefined)c+=`<mxCell id="${id++}" value="${cl.name}" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#E74C3C;strokeWidth=2;fontColor=#E74C3C;fontSize=9;endArrow=ERmandOne;startArrow=ERmandOne;" edge="1" parent="1" source="${m[t.name]}" target="${m[cl.fk]}"><mxGeometry relative="1" as="geometry"/></mxCell>\n`;
  return wrap("ER Diagram",c,"#1a1a2e");
}

export const registerTemplateTool: ToolRegistrar = (server, _context) => {
  server.tool("generate-from-template",
    `Generate a diagram from a pre-built template. Available: ${Object.keys(TEMPLATES).join(", ")}`,
    {
      template_name: z.enum(Object.keys(TEMPLATES) as [string,...string[]]).describe("Template name"),
      params: z.record(z.string(), z.any()).optional().default({}).describe("Template-specific parameters"),
    },
    async (args) => {
      const {template_name,params}=args; const t=TEMPLATES[template_name];
      if(!t)return{content:[{type:"text",text:`Template not found: ${template_name}\nAvailable: ${Object.keys(TEMPLATES).join(", ")}`}]};
      const xml=t.generator(params);
      return {content:[{type:"text",text:`Template generated: ${template_name}\n${t.description}\n\nUse import-diagram to load.\n\n${xml}`}]};
    });
  server.tool("list-templates","List all available diagram templates.",{},
    async ()=>{
      let text="Available Templates:\n\n";
      for(const [n,t] of Object.entries(TEMPLATES))text+=`  - ${n}: ${t.description}\n`;
      return {content:[{type:"text",text}]};
    });
};
