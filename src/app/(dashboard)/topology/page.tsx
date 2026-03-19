"use client";

import { useEffect, useState, useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MarkerType,
  ConnectionMode,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface AgentData {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string | null;
  _count: { traces: number; spans: number };
}

interface ConnectionData {
  id: string;
  sourceAgentId: string;
  targetAgentId: string;
  messageCount: number;
  errorCount: number;
  avgLatencyMs: number;
  sourceAgent: { name: string; type: string };
  targetAgent: { name: string; type: string };
}

const nodeColors: Record<string, string> = {
  orchestrator: "#6366f1",
  worker: "#22c55e",
  tool: "#f59e0b",
  router: "#06b6d4",
};

function AgentNode({ data }: { data: AgentData & { color: string } }) {
  return (
    <div
      className="rounded-xl border-2 bg-zinc-900 px-4 py-3 shadow-lg"
      style={{ borderColor: data.color, minWidth: 160 }}
    >
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <span className="text-sm font-semibold text-zinc-100">{data.name}</span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-xs text-zinc-500">{data.type}</span>
        <StatusBadge status={data.status} />
      </div>
      <div className="mt-2 text-xs text-zinc-600">
        {data._count.traces} traces &middot; {data._count.spans} spans
      </div>
    </div>
  );
}

const nodeTypes = { agentNode: AgentNode };

export default function TopologyPage() {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConn, setSelectedConn] = useState<ConnectionData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/agents");
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents);
        setConnections(data.connections);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (agents.length === 0) return;

    // Layout agents in a circle
    const centerX = 400;
    const centerY = 300;
    const radius = 220;

    const newNodes: Node[] = agents.map((agent, i) => {
      const angle = (2 * Math.PI * i) / agents.length - Math.PI / 2;
      return {
        id: agent.id,
        type: "agentNode",
        position: {
          x: centerX + radius * Math.cos(angle) - 80,
          y: centerY + radius * Math.sin(angle) - 40,
        },
        data: {
          ...agent,
          color: nodeColors[agent.type] ?? "#6366f1",
        },
      };
    });

    const newEdges: Edge[] = connections.map((conn) => ({
      id: conn.id,
      source: conn.sourceAgentId,
      target: conn.targetAgentId,
      animated: true,
      style: {
        stroke: conn.errorCount > 0 ? "#ef4444" : "#3f3f46",
        strokeWidth: Math.min(1 + conn.messageCount / 50, 4),
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#52525b" },
      label: `${conn.messageCount} msgs`,
      labelStyle: { fill: "#71717a", fontSize: 10 },
      labelBgStyle: { fill: "#09090b", fillOpacity: 0.8 },
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [agents, connections, setNodes, setEdges]);

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      const conn = connections.find((c) => c.id === edge.id);
      setSelectedConn(conn ?? null);
    },
    [connections]
  );

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Agent Topology</h1>
        <p className="text-sm text-zinc-500">
          Visualize agent connections and communication flow
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Card className="h-[600px] p-0 overflow-hidden">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onEdgeClick={onEdgeClick}
              nodeTypes={nodeTypes}
              connectionMode={ConnectionMode.Loose}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#1a1a2e" gap={20} />
              <Controls
                style={{ background: "#18181b", border: "1px solid #27272a" }}
              />
            </ReactFlow>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle>Legend</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {Object.entries(nodeColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs capitalize text-zinc-400">{type}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Connection Detail */}
          {selectedConn && (
            <Card>
              <CardHeader>
                <CardTitle>Connection Detail</CardTitle>
              </CardHeader>
              <div className="space-y-2 text-sm">
                <p className="text-zinc-200">
                  {selectedConn.sourceAgent.name} → {selectedConn.targetAgent.name}
                </p>
                <div className="space-y-1 text-xs text-zinc-500">
                  <p>Messages: {selectedConn.messageCount}</p>
                  <p>Errors: {selectedConn.errorCount}</p>
                  <p>Avg Latency: {selectedConn.avgLatencyMs.toFixed(0)}ms</p>
                </div>
              </div>
            </Card>
          )}

          {/* Agent Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Agents ({agents.length})</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-zinc-300">{agent.name}</span>
                  <StatusBadge status={agent.status} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
