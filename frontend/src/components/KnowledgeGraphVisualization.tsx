import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import html2canvas from 'html2canvas'
import { KnowledgeNode, KnowledgeRelation } from '../services/knowledgeGraphService'

export interface GraphData {
  nodes: KnowledgeNode[]
  edges: KnowledgeRelation[]
}

interface KnowledgeGraphVisualizationProps {
  data: GraphData
  width?: number
  height?: number
  onNodeClick?: (node: KnowledgeNode) => void
}

interface D3Node extends KnowledgeNode {
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface D3Link {
  source: D3Node | string
  target: D3Node | string
  relation: string
}

const KnowledgeGraphVisualization: React.FC<KnowledgeGraphVisualizationProps> = ({
  data,
  width = 800,
  height = 600,
  onNodeClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Color mapping for different entity types
  // Color mapping for different entity types - NEON THEME
  const colorMap: { [key: string]: string } = {
    disease: '#ff006e',    // Hot Pink
    gene: '#00f5ff',       // Cyan
    pathway: '#39ff14',    // Neon Green
    biomarker: '#bf00ff',  // Electric Purple
    drug: '#ff8500'        // Neon Orange
  }

  const getNodeColor = (type: string): string => {
    return colorMap[type.toLowerCase()] || '#6c757d' // Default gray
  }

  // Get unique entity types present in the current data with counts
  const getActiveEntityTypes = (): Array<{type: string, color: string, label: string, count: number}> => {
    const typeCounts: { [key: string]: number } = {}
    
    // Count occurrences of each type
    data.nodes.forEach(node => {
      const type = node.type.toLowerCase()
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })
    
    const typeLabels: { [key: string]: string } = {
      disease: 'Disease',
      gene: 'Gene', 
      pathway: 'Pathway',
      biomarker: 'Biomarker',
      drug: 'Drug'
    }
    
    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      color: colorMap[type] || '#6c757d',
      label: typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1),
      count
    })).sort((a, b) => a.label.localeCompare(b.label))
  }

  const downloadGraph = async (format: 'png' | 'json') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'knowledge-graph.json'
      link.click()
      URL.revokeObjectURL(url)
    } else if (format === 'png') {
      const svgElement = svgRef.current
      if (svgElement) {
        try {
          const canvas = await html2canvas(svgElement.parentElement as HTMLElement)
          const link = document.createElement('a')
          link.download = 'knowledge-graph.png'
          link.href = canvas.toDataURL()
          link.click()
        } catch (error) {
          console.error('Error downloading graph:', error)
        }
      }
    }
  }

  useEffect(() => {
    if (!data.nodes.length || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // Clear previous content

    const actualWidth = isFullscreen ? window.innerWidth - 40 : width
    const actualHeight = isFullscreen ? window.innerHeight - 200 : height

    svg.attr('width', actualWidth).attr('height', actualHeight)
      .style('background', 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)')

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event: any) => {
        container.attr('transform', event.transform)
      })

    svg.call(zoom)

    // Create container group for zooming
    const container = svg.append('g')

    // Prepare data with debugging
    const nodes: D3Node[] = data.nodes.map(d => ({ ...d }))
    const links: D3Link[] = data.edges.map(d => ({
      source: d.source,
      target: d.target, 
      relation: d.relation
    }))
    
    console.log('📊 Visualization Data:')
    console.log('Nodes:', nodes.map(n => `${n.id} (${n.label})`))
    console.log('Links:', links.map(l => `${l.source} -> ${l.target} (${l.relation})`))
    
    // Verify all link sources and targets exist in nodes
    const nodeIds = new Set(nodes.map(n => n.id))
    const validLinks = links.filter(link => {
      const sourceExists = nodeIds.has(typeof link.source === 'string' ? link.source : link.source.id)
      const targetExists = nodeIds.has(typeof link.target === 'string' ? link.target : link.target.id)
      if (!sourceExists || !targetExists) {
        console.warn('⚠️ Invalid link:', link, 'Source exists:', sourceExists, 'Target exists:', targetExists)
      }
      return sourceExists && targetExists
    })
    
    console.log(`✅ Using ${validLinks.length} valid links out of ${links.length} total`)

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink<D3Node, D3Link>(validLinks)
        .id((d: any) => d.id)
        .distance(100)
        .strength(0.5)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(actualWidth / 2, actualHeight / 2))
      .force('collision', d3.forceCollide().radius(30))

    // Create arrow markers for directed edges
    const defs = container.append('defs')
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#00f5ff')
      .style('stroke', 'none')
      .style('filter', 'drop-shadow(0 0 3px #00f5ff)')

    // Create links
    const link = container.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(validLinks)
      .enter().append('line')
      .attr('stroke', '#00f5ff')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)')
      .style('filter', 'drop-shadow(0 0 2px #00f5ff)')

    // Create link labels
    const linkLabels = container.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(validLinks)
      .enter().append('text')
      .attr('class', 'link-label')
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .attr('font-size', '10px')
      .attr('font-family', 'Monaco, monospace')
      .attr('fill', '#39ff14')
      .style('text-shadow', '0 0 3px #39ff14')
      .text((d: D3Link) => d.relation?.replace('_', ' ') || '')

    // Create nodes
    const node = container.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', 20)
      .attr('fill', (d: D3Node) => getNodeColor(d.type))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('filter', (d: D3Node) => `drop-shadow(0 0 8px ${getNodeColor(d.type)})`)
      .call(d3.drag<SVGCircleElement, D3Node>()
        .on('start', (event: any, d: D3Node) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event: any, d: D3Node) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event: any, d: D3Node) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
      )
      .on('click', (_event: any, d: D3Node) => {
        setSelectedNode(d)
        onNodeClick?.(d)
      })
      .on('mouseover', function(event: any, d: D3Node) {
        d3.select(this).attr('r', 25)
        
        // Show tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0)
          .style('position', 'absolute')
          .style('background', 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(26, 26, 46, 0.9))')
          .style('color', '#00f5ff')
          .style('padding', '12px')
          .style('border-radius', '8px')
          .style('border', '1px solid #00f5ff')
          .style('pointer-events', 'none')
          .style('font-size', '12px')
          .style('font-family', 'Monaco, monospace')
          .style('z-index', '1000')
          .style('box-shadow', '0 0 20px rgba(0, 245, 255, 0.3)')

        tooltip.transition().duration(200).style('opacity', .9)
        tooltip.html(
          `<strong>${d.label}</strong><br/>
          Type: ${d.type}<br/>
          ${d.properties?.description ? `Description: ${d.properties.description}` : ''}
          ${d.properties?.aliases ? `<br/>Aliases: ${d.properties.aliases.join(', ')}` : ''}`
        )
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this as any).attr('r', 20)
        d3.selectAll('.tooltip').remove()
      })

    // Create node labels
    const nodeLabels = container.append('g')
      .attr('class', 'node-labels')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', 35)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Monaco, monospace')
      .attr('fill', '#ffffff')
      .style('text-shadow', '0 0 4px #00f5ff')
      .text((d: D3Node) => d.label.length > 15 ? d.label.substring(0, 15) + '...' : d.label)
      .style('pointer-events', 'none')

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as D3Node).x!)
        .attr('y1', d => (d.source as D3Node).y!)
        .attr('x2', d => (d.target as D3Node).x!)
        .attr('y2', d => (d.target as D3Node).y!)

      linkLabels
        .attr('x', d => ((d.source as D3Node).x! + (d.target as D3Node).x!) / 2)
        .attr('y', d => ((d.source as D3Node).y! + (d.target as D3Node).y!) / 2)

      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!)

      nodeLabels
        .attr('x', d => d.x!)
        .attr('y', d => d.y!)
    })

    // Add zoom controls
    const controls = svg.append('g')
      .attr('class', 'zoom-controls')
      .attr('transform', `translate(${actualWidth - 60}, 20)`)

    const zoomIn = controls.append('g')
      .style('cursor', 'pointer')
      .on('click', () => {
        svg.transition().call(zoom.scaleBy, 1.5)
      })

    zoomIn.append('rect')
      .attr('width', 30)
      .attr('height', 30)
      .attr('fill', 'white')
      .attr('stroke', '#ccc')
      .attr('rx', 3)

    zoomIn.append('text')
      .attr('x', 15)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .text('+')

    const zoomOut = controls.append('g')
      .attr('transform', 'translate(0, 35)')
      .style('cursor', 'pointer')
      .on('click', () => {
        svg.transition().call(zoom.scaleBy, 0.67)
      })

    zoomOut.append('rect')
      .attr('width', 30)
      .attr('height', 30)
      .attr('fill', 'white')
      .attr('stroke', '#ccc')
      .attr('rx', 3)

    zoomOut.append('text')
      .attr('x', 15)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .text('−')

    return () => {
      simulation.stop()
    }
  }, [data, width, height, isFullscreen])

  if (!data.nodes.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900/80 rounded-lg border-2 border-dashed border-cyan-500/30 backdrop-blur-sm">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-pulse">🔍</div>
          <p className="text-cyan-400 font-mono">No graph data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-2xl border border-cyan-500/20 ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      {/* Header with controls */}
      <div className="flex justify-between items-center p-4 border-b border-cyan-500/30 bg-black/40">
        <div>
          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Knowledge Graph Visualization</h3>
          <p className="text-sm text-cyan-300 font-mono">
            {data.nodes.length} entities, {data.edges.length} relationships
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => downloadGraph('json')}
            className="px-3 py-1 text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded border border-cyan-400/30 hover:from-blue-400 hover:to-cyan-400 transition-all duration-200 shadow-lg shadow-blue-500/20 font-mono"
            title="Download as JSON"
          >
            📄 JSON
          </button>
          <button
            onClick={() => downloadGraph('png')}
            className="px-3 py-1 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded border border-green-400/30 hover:from-green-400 hover:to-emerald-400 transition-all duration-200 shadow-lg shadow-green-500/20 font-mono"
            title="Download as PNG"
          >
            🖼️ PNG
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded border border-purple-400/30 hover:from-purple-400 hover:to-pink-400 transition-all duration-200 shadow-lg shadow-purple-500/20 font-mono"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? '⤓' : '⤢'}
          </button>
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Graph container */}
      <div className="relative">
        <svg ref={svgRef} className="w-full"></svg>
        
        {/* Legend - Dynamic based on present entity types */}
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-cyan-500/30 p-3 rounded-lg shadow-lg shadow-cyan-500/20">
          <h4 className="text-sm font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Entity Types</h4>
          <div className="space-y-1 text-xs font-mono">
            {getActiveEntityTypes().map(entityType => (
              <div key={entityType.type} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full shadow-lg" 
                  style={{ 
                    backgroundColor: entityType.color,
                    boxShadow: `0 0 8px ${entityType.color}60`
                  }}
                ></div>
                <span className="text-cyan-100">{entityType.label}</span>
                <span className="text-purple-400 ml-1">({entityType.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Node details panel */}
        {selectedNode && (
          <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm border border-purple-500/30 p-4 rounded-lg shadow-lg shadow-purple-500/20 max-w-xs">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">{selectedNode.label}</h4>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-purple-400 hover:text-cyan-400 text-lg leading-none transition-colors duration-200"
              >
                ×
              </button>
            </div>
            <div className="text-sm text-cyan-100 space-y-1 font-mono">
              <p><strong className="text-purple-400">Type:</strong> <span className="text-cyan-300">{selectedNode.type}</span></p>
              <p><strong className="text-purple-400">ID:</strong> <span className="text-cyan-300 text-xs">{selectedNode.id}</span></p>
              {selectedNode.properties?.description && (
                <p><strong className="text-purple-400">Description:</strong> <span className="text-cyan-300">{selectedNode.properties.description}</span></p>
              )}
              {selectedNode.properties?.aliases && (
                <p><strong className="text-purple-400">Aliases:</strong> <span className="text-cyan-300">{Array.isArray(selectedNode.properties.aliases) ? selectedNode.properties.aliases.join(', ') : selectedNode.properties.aliases}</span></p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-3 bg-black/60 border-t border-cyan-500/30 text-xs text-cyan-300 font-mono backdrop-blur-sm">
        <div className="flex flex-wrap gap-4">
          <span>💡 <strong className="text-cyan-400">Tip:</strong> Drag nodes to rearrange</span>
          <span>🔍 <strong className="text-purple-400">Zoom:</strong> Mouse wheel or +/- buttons</span>
          <span>👆 <strong className="text-pink-400">Click:</strong> Select node for details</span>
          <span>🏷️ <strong className="text-green-400">Hover:</strong> View node tooltip</span>
        </div>
      </div>
    </div>
  )
}

export default KnowledgeGraphVisualization