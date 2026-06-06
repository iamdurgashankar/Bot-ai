import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Search, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  BookOpen, 
  Tag, 
  Info, 
  HelpCircle, 
  Cpu, 
  Zap, 
  ArrowRight,
  Shield,
  FileText
} from 'lucide-react';

interface KnowledgeGraphProps {
  knowledgeBaseText: string;
  botName: string;
  themeColor?: string;
  onSelectNode?: (nodeInfo: any) => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'core' | 'document' | 'concept' | 'demo';
  content?: string;
  category?: string;
  weight?: number;
  val?: number; // Size key
  clusterId?: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  knowledgeBaseText,
  botName,
  themeColor = "bg-indigo-600",
  onSelectNode
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);

  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<string>('all');
  const [simulationActive, setSimulationActive] = useState(true);
  const [zoomScale, setZoomScale] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 600, height: 420 });

  // Simulated query state
  const [ragQuery, setRagQuery] = useState('');
  const [retrievedNodeIds, setRetrievedNodeIds] = useState<Set<string>>(new Set());
  const [isSimulatingRag, setIsSimulatingRag] = useState(false);

  // Common stopwords to exclude from concept node generation
  const STOP_WORDS = useMemo(() => new Set([
    "the", "and", "for", "with", "from", "this", "that", "your", "have", "will", 
    "about", "their", "should", "enable", "would", "under", "these", "there", 
    "which", "after", "through", "during", "before", "where", "into", "over",
    "such", "than", "then", "them", "they", "some", "more", "most", "been",
    "were", "noun", "verb", "fully", "mode", "base", "with", "each", "both"
  ]), []);

  // 1. Resize observer to keep the canvas strictly responsive and correct sizing
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      // Guarantee minimum height and reasonable width
      setDimensions({
        width: Math.max(width, 300),
        height: Math.max(height, 420)
      });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Parse Knowledge base content or use beautiful demo data
  const { nodes, links, clusters } = useMemo(() => {
    const text = knowledgeBaseText?.trim();

    // Default graph structure if no knowledge base yet
    if (!text) {
      const demoNodes: GraphNode[] = [
        { id: 'core', label: botName, type: 'core', content: "Primary operational neural engine core anchor.", clusterId: 0, val: 26 },
        { id: 'doc-instructions', label: 'System Instructions Protocol', type: 'document', content: "Determines communication values, cognitive boundaries, default formatting paradigms.", clusterId: 1, val: 16 },
        { id: 'concept-tone', label: 'Tone Temperament', type: 'concept', content: "Maintains specific, respectful, contextual conversation standards.", clusterId: 1, val: 10 },
        { id: 'concept-safety', label: 'Safety Rails', type: 'concept', content: "Guards against hallucinations, prompt injection, and toxic outputs.", clusterId: 1, val: 10 },
        { id: 'concept-persona', label: 'Agent Brand Persona', type: 'concept', content: "Authentic, tailored responses suited to corporate goals.", clusterId: 1, val: 10 },

        { id: 'doc-websearch', label: 'Google Search Grounding', type: 'document', content: "Injects live, verified knowledge context mapped securely to standard search engines.", clusterId: 2, val: 16 },
        { id: 'concept-citations', label: 'Dynamic Citations', type: 'concept', content: "Supports direct visual links tracing backend results.", clusterId: 2, val: 10 },
        { id: 'concept-freshness', label: 'Real-time Grounding', type: 'concept', content: "Protects against standard training threshold bottlenecks.", clusterId: 2, val: 10 },

        { id: 'doc-multimodal', label: 'Document & Table Parser', type: 'document', content: "Extracts metadata, tabular arrays, and textual contents from documents.", clusterId: 3, val: 16 },
        { id: 'concept-pdf', label: 'PDF Structure Indexing', type: 'concept', content: "Tokenizes complex visual assets into clean vectors.", clusterId: 3, val: 10 },
        { id: 'concept-spreadsheets', label: 'Raw Tabular Querying', type: 'concept', content: "Enables natural language mathematical insights on columns.", clusterId: 3, val: 10 },
      ];

      const demoLinks: GraphLink[] = [
        { source: 'core', target: 'doc-instructions', value: 3 },
        { source: 'doc-instructions', target: 'concept-tone', value: 2 },
        { source: 'doc-instructions', target: 'concept-safety', value: 2 },
        { source: 'doc-instructions', target: 'concept-persona', value: 2 },

        { source: 'core', target: 'doc-websearch', value: 3 },
        { source: 'doc-websearch', target: 'concept-citations', value: 2 },
        { source: 'doc-websearch', target: 'concept-freshness', value: 2 },

        { source: 'core', target: 'doc-multimodal', value: 3 },
        { source: 'doc-multimodal', target: 'concept-pdf', value: 2 },
        { source: 'doc-multimodal', target: 'concept-spreadsheets', value: 2 },
      ];

      return {
        nodes: demoNodes,
        links: demoLinks,
        clusters: ['System Directives', 'Grounded Search', 'Context Parsing']
      };
    }

    // Dynamic parsing logic based on actual user input
    // Split into paragraphs (document chunks)
    const paragraphs = text
      .split(/(?:\r?\n){2,}/)
      .map(p => p.trim())
      .filter(p => p.length > 8);

    const parsedNodes: GraphNode[] = [
      { id: 'core', label: botName, type: 'core', content: `Core anchor linking total semantic index universe. [Total parsed sources: ${paragraphs.length}]`, clusterId: 0, val: 26 }
    ];
    const parsedLinks: GraphLink[] = [];
    const generatedClustersMap = new Map<string, number>();

    // Cap at 25 paragraphs to preserve UI layout density
    const processingParagraphs = paragraphs.slice(0, 25);
    const globalConceptCount: Record<string, number> = {};

    // First scan to extract distinct concept keywords across the dataset
    processingParagraphs.forEach((para, idx) => {
      const cleanWords = para
        .toLowerCase()
        .replace(/[^\w\s-]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 4 && !STOP_WORDS.has(w));
      
      cleanWords.forEach(word => {
        globalConceptCount[word] = (globalConceptCount[word] || 0) + 1;
      });
    });

    // Create chunks and associate keywords
    processingParagraphs.forEach((para, idx) => {
      const docId = `doc-chunk-${idx}`;
      
      // Generate clean header
      let heading = para.split('\n')[0].replace(/^[#\-\*\s]+/, '').trim();
      if (heading.length > 38) {
        heading = heading.substring(0, 35) + '...';
      }
      if (!heading || heading.length < 3) {
        heading = `Section Chunk #${idx + 1}`;
      }

      // Assign to semantic category derived from heading keywords
      const categoryKeyword = para
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .find(w => w.length > 4 && !STOP_WORDS.has(w)) || "General";
      
      const capitalizedCategory = categoryKeyword.charAt(0).toUpperCase() + categoryKeyword.slice(1);
      if (!generatedClustersMap.has(capitalizedCategory)) {
        generatedClustersMap.set(capitalizedCategory, generatedClustersMap.size + 1);
      }
      const clusterId = generatedClustersMap.get(capitalizedCategory) || 1;

      // Add Document Chunk Node
      parsedNodes.push({
        id: docId,
        label: heading,
        type: 'document',
        content: para,
        category: capitalizedCategory,
        clusterId,
        val: 15
      });

      // Link from core to chunk
      parsedLinks.push({
        source: 'core',
        target: docId,
        value: 3
      });

      // Extract top distinctive keyword concepts for this chunk
      const localWords = para
        .toLowerCase()
        .replace(/[^\w\s-]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 5 && !STOP_WORDS.has(w));

      // Retrieve unique terms sorted by distinct global value
      const uniqueLocalTerms = Array.from(new Set(localWords))
        .sort((a, b) => (globalConceptCount[a] || 0) - (globalConceptCount[b] || 0)) // Prefer rarer distinctive tags
        .slice(0, 4);

      uniqueLocalTerms.forEach(tag => {
        const conceptId = `concept-${tag}`;
        
        // Add Concept Node if it doesn't exist yet
        if (!parsedNodes.find(n => n.id === conceptId)) {
          const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
          parsedNodes.push({
            id: conceptId,
            label: capitalizedTag,
            type: 'concept',
            content: `Core indexed search index token matching contexts discussing "${tag}".`,
            category: capitalizedCategory,
            clusterId,
            val: 9
          });
        }

        // Link document chunk to its concept token
        parsedLinks.push({
          source: docId,
          target: conceptId,
          value: 1.5
        });
      });
    });

    return {
      nodes: parsedNodes,
      links: parsedLinks,
      clusters: Array.from(generatedClustersMap.keys())
    };
  }, [knowledgeBaseText, botName, STOP_WORDS]);

  // 3. Simulated RAG Engine Matcher
  const handleSimulateQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;

    setIsSimulatingRag(true);
    const queryLower = ragQuery.toLowerCase().trim();
    
    // Find closest document nodes or concept nodes that match query fragments
    const matchingNodeIds = new Set<string>();
    
    nodes.forEach(node => {
      const labelMatch = node.label.toLowerCase().includes(queryLower);
      const contentMatch = node.content?.toLowerCase().includes(queryLower);
      
      if (labelMatch || contentMatch) {
        matchingNodeIds.add(node.id);
        
        // Also capture neighbors
        links.forEach(link => {
          const sId = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
          const tId = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
          
          if (sId === node.id) {
            matchingNodeIds.add(tId);
          } else if (tId === node.id) {
            matchingNodeIds.add(sId);
          }
        });
      }
    });

    // Flash results
    if (matchingNodeIds.size === 0) {
      // Pick random 2 to show dynamic simulated matches
      const nonCore = nodes.filter(n => n.type !== 'core');
      if (nonCore.length > 0) {
        matchingNodeIds.add(nonCore[Math.floor(Math.random() * nonCore.length)].id);
      }
    }

    setRetrievedNodeIds(matchingNodeIds);
    setTimeout(() => {
      setIsSimulatingRag(false);
    }, 4500); // Pulse particles animation duration
  };

  // Re-heat or restart physics engine
  const restartPhysics = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
      setSimulationActive(true);
    }
  };

  // 4. Main D3 forcegraph rendering loop
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Reset prior layouts

    const { width, height } = dimensions;

    // Create a deep copy of node/link arrays to prevent mutation of props
    const d3Nodes: GraphNode[] = nodes.map(n => ({ ...n }));
    const d3Links: GraphLink[] = links.map(l => ({ ...l }));

    // Create groupings inside SVG
    const gContainer = svg.append('g').attr('class', 'graph-g-container');

    // Zoom setup
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 4.5])
      .on('zoom', (event) => {
        gContainer.attr('transform', event.transform);
        setZoomScale(event.transform.k);
      });

    svg.call(zoomBehavior);

    // Initial center fit offset logic
    const initialTransform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(0.85);
    svg.call(zoomBehavior.transform, initialTransform);

    // Grid backdrop helper lines that pan beautifully
    const gridLines = gContainer.append('g')
      .attr('class', 'bg-grid-scaffolding')
      .lower()
      .style('opacity', 0.15);

    // Grid coordinates
    const spacing = 40;
    const gridLimit = 2000;
    for (let x = -gridLimit; x <= gridLimit; x += spacing) {
      gridLines.append('line')
        .attr('x1', x).attr('y1', -gridLimit)
        .attr('x2', x).attr('y2', gridLimit)
        .attr('stroke', '#475569')
        .attr('stroke-width', 0.4);
    }
    for (let y = -gridLimit; y <= gridLimit; y += spacing) {
      gridLines.append('line')
        .attr('x1', -gridLimit).attr('y1', y)
        .attr('x2', gridLimit).attr('y2', y)
        .attr('stroke', '#475569')
        .attr('stroke-width', 0.4);
    }

    // Force simulation
    const simulation = d3.forceSimulation<GraphNode, GraphLink>(d3Nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(d3Links)
        .id(d => d.id)
        .distance((d) => {
          // Keep key hubs compact, concepts dynamic
          if (d.source === 'core' || d.target === 'core') return 120;
          return 55;
        })
      )
      .force('charge', d3.forceManyBody<GraphNode>().strength((d) => {
        if (d.type === 'core') return -550;
        if (d.type === 'document') return -220;
        return -55;
      }))
      .force('centerX', d3.forceX(0).strength(0.065))
      .force('centerY', d3.forceY(0).strength(0.065))
      .force('collide', d3.forceCollide<GraphNode>().radius(d => (d.val || 10) + 16).iterations(2));

    simulationRef.current = simulation;

    // Filter validation matcher
    const matchesFilter = (node: GraphNode) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const needle = searchQuery.toLowerCase();
        const labelText = node.label.toLowerCase();
        const contentText = (node.content || '').toLowerCase();
        if (!labelText.includes(needle) && !contentText.includes(needle)) {
          return false;
        }
      }
      // 2. Tab filters
      if (selectedClusterFilter !== 'all') {
        if (node.category !== selectedClusterFilter && node.type !== 'core') {
          return false;
        }
      }
      return true;
    };

    // Color mapper based on cluster id
    const getNodeThemeColor = (node: GraphNode) => {
      if (node.type === 'core') return '#6366f1'; // Indigo base
      
      const colors = [
        '#f59e0b', // Amber
        '#10b981', // Emerald
        '#14b8a6', // Teal
        '#3b82f6', // Blue
        '#a855f7', // Purple
        '#ec4899', // Pink
      ];

      const id = node.clusterId || 0;
      return colors[id % colors.length];
    };

    // Render Web Links/Connections
    const linkElements = gContainer.append('g')
      .attr('class', 'links-group')
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(d3Links)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        const sNode = d.source as GraphNode;
        const tNode = d.target as GraphNode;
        const isRetrievedMatch = retrievedNodeIds.has(sNode.id) && retrievedNodeIds.has(tNode.id);
        return isRetrievedMatch ? '#22c55e' : '#1e293b';
      })
      .attr('stroke-opacity', (d) => {
        const sNode = d.source as GraphNode;
        const tNode = d.target as GraphNode;
        if (retrievedNodeIds.size > 0) {
          return retrievedNodeIds.has(sNode.id) && retrievedNodeIds.has(tNode.id) ? 0.95 : 0.15;
        }
        return 0.5;
      })
      .attr('stroke-width', (d) => {
        const sNode = d.source as GraphNode;
        const tNode = d.target as GraphNode;
        if (retrievedNodeIds.has(sNode.id) && retrievedNodeIds.has(tNode.id)) return 2.5;
        return d.value;
      });

    // Interactive Node container group
    const nodeElements = gContainer.append('g')
      .attr('class', 'nodes-group')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(d3Nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group-g')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNode(d);
        if (onSelectNode) onSelectNode(d);
        event.stopPropagation();
      })
      .on('mouseenter', (event, d) => {
        setHoveredNode(d);
        // Highlight logic
        const sIds = new Set<string>([d.id]);
        d3Links.forEach(l => {
          const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
          const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
          if (s === d.id) sIds.add(t);
          if (t === d.id) sIds.add(s);
        });

        gContainer.selectAll('.node-group-g')
          .style('opacity', (n: any) => sIds.has(n.id) ? 1 : 0.25);

        gContainer.selectAll('line')
          .style('stroke-opacity', (l: any) => {
            const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
            const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
            return (s === d.id || t === d.id) ? 0.9 : 0.08;
          })
          .style('stroke', (l: any) => {
            const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
            const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
            return (s === d.id || t === d.id) ? getNodeThemeColor(d) : '#1e293b';
          });
      })
      .on('mouseleave', () => {
        setHoveredNode(null);

        // Reset elements opacity
        gContainer.selectAll('.node-group-g').style('opacity', 1);
        gContainer.selectAll('line')
          .style('stroke-opacity', (d: any) => {
            const sNode = d.source as GraphNode;
            const tNode = d.target as GraphNode;
            if (retrievedNodeIds.size > 0) {
              return retrievedNodeIds.has(sNode.id) && retrievedNodeIds.has(tNode.id) ? 0.95 : 0.15;
            }
            return 0.5;
          })
          .style('stroke', (d: any) => {
            const sNode = d.source as GraphNode;
            const tNode = d.target as GraphNode;
            const isRetrievedMatch = retrievedNodeIds.has(sNode.id) && retrievedNodeIds.has(tNode.id);
            return isRetrievedMatch ? '#22c55e' : '#1e293b';
          });
      });

    // Custom Glowing outer circles for different nodes
    nodeElements.append('circle')
      .attr('r', d => (d.val || 10) + 4)
      .attr('fill', 'transparent')
      .attr('stroke', d => getNodeThemeColor(d))
      .attr('stroke-width', d => d.type === 'core' ? 2 : 1)
      .style('stroke-dasharray', d => d.type === 'concept' ? '3,3' : 'none')
      .style('opacity', d => {
        const baseMatch = matchesFilter(d);
        if (retrievedNodeIds.size > 0) {
          return retrievedNodeIds.has(d.id) ? 0.95 : 0.2;
        }
        return baseMatch ? 0.75 : 0.15;
      });

    // Core Solid visual dots
    nodeElements.append('circle')
      .attr('r', d => d.val || 10)
      .attr('fill', d => {
        const baseColor = getNodeThemeColor(d);
        return d.type === 'concept' ? '#090d16' : baseColor;
      })
      .attr('stroke', d => {
        if (d.type === 'concept') return getNodeThemeColor(d);
        return 'rgba(255,255,255,0.15)';
      })
      .attr('stroke-width', d => d.type === 'concept' ? 1.5 : 1)
      .style('opacity', d => {
        const baseMatch = matchesFilter(d);
        if (retrievedNodeIds.size > 0) {
          return retrievedNodeIds.has(d.id) ? 1.0 : 0.25;
        }
        return baseMatch ? 1.0 : 0.15;
      });

    // Icons inside document chunks or anchor cores
    nodeElements.filter(d => d.type === 'core')
      .append('path')
      .attr('d', "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z") // Info anchor SVG glyph
      .attr('fill', '#ffffff')
      .attr('transform', 'translate(-12, -12) scale(1.0)')
      .style('pointer-events', 'none');

    nodeElements.filter(d => d.type === 'document')
      .append('path')
      .attr('d', "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z") // Document SVG glyph
      .attr('fill', '#ffffff')
      .attr('transform', 'translate(-10, -10) scale(0.85)')
      .style('pointer-events', 'none')
      .style('opacity', 0.85);

    // Glowing particle animations mapped for query retrieved states
    nodeElements.filter(d => retrievedNodeIds.has(d.id))
      .append('circle')
      .attr('r', d => (d.val || 10) + 12)
      .attr('fill', 'none')
      .attr('stroke', '#22c55e')
      .attr('stroke-width', 2.5)
      .style('opacity', 0.5)
      .append('animate')
      .attr('attributeName', 'r')
      .attr('values', `${(nodes[0].val || 10)} ; ${(nodes[0].val || 10) + 24}`)
      .attr('dur', '1.6s')
      .attr('repeatCount', 'indefinite');

    // Human Text labels
    nodeElements.append('text')
      .text(d => d.label)
      .attr('y', d => d.type === 'core' ? 36 : d.type === 'document' ? 24 : 18)
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.type === 'core' ? '#ffffff' : '#94a3b8')
      .style('font-family', '"Inter", sans-serif')
      .style('font-weight', d => d.type === 'core' ? '800' : '500')
      .style('font-size', d => d.type === 'core' ? '12px' : '9.5px')
      .style('pointer-events', 'none')
      .style('opacity', d => {
        const baseMatch = matchesFilter(d);
        if (retrievedNodeIds.size > 0) {
          return retrievedNodeIds.has(d.id) ? 1.0 : 0.15;
        }
        return baseMatch ? 1.0 : 0.08;
      });

    // D3 Drag Event Hooks with TypeScript support
    const dragBehavior = d3.drag<SVGGElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        setSimulationActive(true);
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeElements.call(dragBehavior as any);

    // Simulation tick callback
    simulation.on('tick', () => {
      // Direct link coordinates
      linkElements
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      // Group nodes coordinates
      nodeElements.attr('transform', d => `translate(${d.x!},${d.y!})`);
    });

    // Stop physics once settled
    const timer = setTimeout(() => {
      simulation.alphaMin(0.0125);
    }, 4000);

    return () => {
      clearTimeout(timer);
      simulation.stop();
    };
  }, [nodes, links, dimensions, searchQuery, selectedClusterFilter, retrievedNodeIds]);

  // Zoom Helpers
  const handleZoom = (type: 'in' | 'out' | 'reset') => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    
    if (type === 'reset') {
      const initialTransform = d3.zoomIdentity
        .translate(dimensions.width / 2, dimensions.height / 2)
        .scale(0.85);
      svg.transition().duration(400).call(
        d3.zoom().transform as any, 
        initialTransform
      );
    } else {
      const multiplier = type === 'in' ? 1.3 : 0.7;
      svg.transition().duration(300).call(
        d3.zoom().scaleBy as any, 
        multiplier
      );
    }
  };

  return (
    <div className="bg-[#0e0e11]/85 border border-zinc-900 rounded-3xl p-6.5 shadow-2xl relative overflow-hidden flex flex-col gap-5">
      {/* Dynamic Cyber Ambient Glow */}
      <div className="absolute -left-20 -bottom-20 w-52 h-52 rounded-full filter blur-[100px] bg-indigo-600/10 pointer-events-none" />
      <div className="absolute -right-20 -top-20 w-52 h-52 rounded-full filter blur-[100px] bg-amber-500/10 pointer-events-none" />

      {/* Header and Index status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4.5 border-b border-zinc-900 relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              Neural Index & Search Map
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 leading-none">Interactive semantic clusters mapping RAG pathways</p>
          </div>
        </div>

        {/* Dynamic Badge indicating context parse state */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] uppercase tracking-widest font-black text-emerald-450 bg-emerald-950/20 border border-emerald-900/40 px-2.5 py-1 rounded-lg">
            {knowledgeBaseText?.trim() ? 'VECTORIZED INDEX LIVE' : 'AWAITING CUSTOM DATA'}
          </span>
        </div>
      </div>

      {/* Controls panel: Search - Clusters filter - Zoom controls */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 relative z-10 text-white">
        {/* Search */}
        <div className="xl:col-span-4 relative flex items-center bg-zinc-950/70 border border-zinc-850 rounded-2xl px-3.5 py-1.5 focus-within:border-indigo-500/50 transition-all">
          <Search className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search chunks, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs outline-none focus:ring-0 w-full placeholder-zinc-500 text-zinc-200"
          />
        </div>

        {/* Semantic Cluster Filters */}
        <div className="xl:col-span-5 flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider shrink-0 mr-1.5">Clusters:</span>
          {['all', ...clusters.slice(0, 4)].map(c => (
            <button
              key={c}
              onClick={() => setSelectedClusterFilter(c)}
              className={`px-3 py-1 text-[10.5px] rounded-full border transition-all cursor-pointer whitespace-nowrap font-bold active:scale-95 ${
                selectedClusterFilter === c
                  ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400 font-extrabold'
                  : 'bg-zinc-950/45 border-zinc-850 text-zinc-400 hover:text-white'
              }`}
            >
              {c === 'all' ? 'All Clusters' : c}
            </button>
          ))}
        </div>

        {/* Engine action and Zoom actions */}
        <div className="xl:col-span-3 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={restartPhysics}
            className="p-2 bg-zinc-950/75 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Thermal Reset / Heat Neural Network Simulation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <div className="h-6 w-[1px] bg-zinc-850/60 mx-1" />
          <button
            onClick={() => handleZoom('in')}
            className="px-2.5 py-1.5 bg-zinc-950/75 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-400 hover:text-white text-[11px] font-bold cursor-pointer active:scale-95"
          >
            +
          </button>
          <button
            onClick={() => handleZoom('out')}
            className="px-2.5 py-1.5 bg-zinc-950/75 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-400 hover:text-white text-[11px] font-bold cursor-pointer active:scale-95"
          >
            -
          </button>
          <button
            onClick={() => handleZoom('reset')}
            className="px-2 py-1.5 bg-zinc-950/75 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-400 hover:text-white text-[10px] font-semibold cursor-pointer active:scale-95"
          >
            Fit Screen
          </button>
        </div>
      </div>

      {/* Main split display: LHS Force-directed Canvas, RHS Selected Node contextual details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[440px]">
        {/* Graph Canvas Container */}
        <div 
          ref={containerRef}
          className="lg:col-span-8 bg-zinc-950/90 border border-zinc-900 rounded-3xl relative overflow-hidden select-none shadow-inner min-h-[400px] flex-1"
        >
          {/* Futuristic subtle cyber overlays */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none z-10 bg-black/40 backdrop-blur-md border border-zinc-850/50 p-2.5 rounded-xl">
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              <span>D3 PHYSICS RACK ACTIVE</span>
            </div>
            <div className="text-[9px] text-zinc-500 font-mono">Zoom: {(zoomScale * 100).toFixed(0)}% | Entities: {nodes.length} | Anchors: {links.length}</div>
          </div>

          {/* Actual SVG Graphic Node */}
          <svg 
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="outline-none"
          />

          {/* Quick guide watermark when no dynamic RAG content */}
          {!knowledgeBaseText?.trim() && (
            <div className="absolute bottom-4 right-4 pointer-events-none z-10 max-w-xs text-[10px] text-zinc-500 bg-zinc-950/70 border border-zinc-850 p-3 rounded-xl leading-relaxed">
              <span className="font-extrabold text-amber-500 block mb-1">💡 Sandbox Blueprint Mode</span>
              Pasting real documentation or FAQs into the text space above will instantly compile custom vector structures and semantic node clusters mapping your unique dataset!
            </div>
          )}
        </div>

        {/* Selected Hub/Node visual metadata reader panels */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Quick Simulated query sandbox */}
          <div className="bg-zinc-950/50 border border-zinc-900 p-4.5 rounded-2xl flex flex-col gap-3 relative z-10 text-white">
            <h4 className="text-[10px] uppercase font-black tracking-widest text-[#00e676] flex items-center gap-1.5 leading-none">
              <Zap className="w-3.5 h-3.5 text-[#00ff88]" />
              <span>RAG Query Simulator</span>
            </h4>
            <p className="text-[10.5px] text-zinc-400 mt-0.5 leading-snug">Type a simulated query keyword to flash mapped paragraphs and concepts queried by the model.</p>
            <form onSubmit={handleSimulateQuery} className="flex gap-2.5">
              <input
                type="text"
                placeholder="Type query (e.g. 'tone', 'citations')"
                value={ragQuery}
                onChange={e => setRagQuery(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#00e676] text-zinc-150"
              />
              <button
                type="submit"
                disabled={isSimulatingRag || !ragQuery.trim()}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600/95 hover:bg-emerald-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center shrink-0 active:scale-95 transition-all"
              >
                {isSimulatingRag ? 'Retrieving...' : 'Trigger'}
              </button>
            </form>
            {retrievedNodeIds.size > 0 && (
              <div className="text-[9px] text-[#00ff88] bg-emerald-950/15 border border-emerald-900/30 px-2.5 py-1 rounded-lg font-mono">
                Successfully routed {retrievedNodeIds.size} semantic node hits! Pulsing path particles.
              </div>
            )}
          </div>

          {/* Node Metadata Viewer */}
          <div className="bg-zinc-950/70 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between flex-1 relative overflow-hidden min-h-[220px]">
            {/* Ambient edge flare details */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />
            
            <AnimatePresence mode="wait">
              {selectedNode || hoveredNode ? (
                <motion.div
                  key={(selectedNode || hoveredNode)?.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4 text-white"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full select-none tracking-widest ${
                      (selectedNode || hoveredNode)?.type === 'core'
                        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/15'
                        : (selectedNode || hoveredNode)?.type === 'document'
                          ? 'bg-amber-600/10 text-amber-400 border border-amber-500/15'
                          : 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/15'
                    }`}>
                      {(selectedNode || hoveredNode)?.type === 'core' ? 'Primary Core Node' : (selectedNode || hoveredNode)?.type === 'document' ? 'Doc Segment (Chunk)' : 'Concept Tag Token'}
                    </span>
                    
                    {/* Clear selection */}
                    {selectedNode && (
                      <button 
                        onClick={() => setSelectedNode(null)}
                        className="text-[9px] font-bold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 px-2 py-0.5 rounded cursor-pointer duration-100 uppercase"
                      >
                        Reset Hub
                      </button>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-white hover:text-indigo-400 cursor-default transition-colors">
                      {(selectedNode || hoveredNode)?.label}
                    </h4>
                    {/* ID indicators */}
                    <div className="text-[9px] text-[#475569] font-mono mt-1">ID Ref: {(selectedNode || hoveredNode)?.id}</div>
                  </div>

                  {/* Metadata characteristics specs */}
                  <div className="space-y-2 bg-[#0c0c10]/40 border border-[#202026]/40 p-3 rounded-xl">
                    <span className="text-[8.5px] uppercase font-black text-zinc-500 tracking-wider block">Context / Payload Preview:</span>
                    <p className="text-[11px] text-zinc-300 leading-relaxed font-sans max-h-36 overflow-y-auto pr-1 select-text">
                      {(selectedNode || hoveredNode)?.content || "No structural content payload is saved inside conceptual tag references. Concept tags help route specific text clusters dynamically."}
                    </p>
                  </div>

                  {/* Proximity metrics */}
                  <div className="grid grid-cols-2 gap-2.5 text-[9.5px]">
                    <div className="p-2 bg-zinc-950/50 border border-zinc-900 rounded-lg">
                      <span className="text-zinc-500 block">Cluster Category:</span>
                      <span className="font-extrabold text-[#fafafa] truncate block">{(selectedNode || hoveredNode)?.category || "Central Mesh"}</span>
                    </div>
                    <div className="p-2 bg-zinc-950/50 border border-zinc-900 rounded-lg">
                      <span className="text-zinc-500 block">Relative Node Size:</span>
                      <span className="font-extrabold text-[#fafafa] block">{(selectedNode || hoveredNode)?.val || 10}px radius</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-8 text-zinc-500 flex-1">
                  <div className="w-10 h-10 border border-zinc-850/60 bg-zinc-950/40 rounded-xl flex items-center justify-center text-zinc-650 mb-3.5">
                    <Info className="w-4.5 h-4.5" />
                  </div>
                  <h5 className="text-xs font-bold text-zinc-400">Semantic Entity Inspector</h5>
                  <p className="text-[10.5px] text-zinc-500 max-w-[210px] mx-auto mt-1 mb-2.5 leading-snug">
                    MouseOver or Click on any element node to inspect vector details, connected chunks, and database key variables.
                  </p>
                  <div className="flex items-center gap-1.5 text-[8.5px] bg-zinc-905 border border-zinc-900 text-zinc-450 px-2 py-0.5 rounded-full select-none">
                    <ArrowRight className="w-3 h-3 text-indigo-500 animate-pulse" />
                    <span>Supports node drag & drop!</span>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
export default KnowledgeGraph;
