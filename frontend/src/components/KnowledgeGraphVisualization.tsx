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
  const getNodeColor = (type: string): string => {
    const colorMap: { [key: string]: string } = {
      disease: '#9b5de5',    // Purple
      gene: '#e63946',       // Red
      pathway: '#2a9d8f',    // Teal
      biomarker: '#4361ee',  // Blue
      drug: '#f4a261'        // Orange
    }
    return colorMap[type.toLowerCase()] || '#6c757d' // Default gray
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
      .attr('fill', '#666')
      .style('stroke', 'none')

    // Create links
    const link = container.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(validLinks)
      .enter().append('line')
      .attr('stroke', '#666')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)')

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
      .attr('fill', '#666')
      .text((d: D3Link) => d.relation?.replace('_', ' ') || '')

    // Create nodes
    const node = container.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', 20)
      .attr('fill', (d: D3Node) => getNodeColor(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
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
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '10px')
          .style('border-radius', '5px')
          .style('pointer-events', 'none')
          .style('font-size', '12px')
          .style('z-index', '1000')

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
      .attr('fill', '#333')
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
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-gray-500">No graph data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      {/* Header with controls */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Knowledge Graph Visualization</h3>
          <p className="text-sm text-gray-600">
            {data.nodes.length} entities, {data.edges.length} relationships
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => downloadGraph('json')}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            title="Download as JSON"
          >
            📄 JSON
          </button>
          <button
            onClick={() => downloadGraph('png')}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            title="Download as PNG"
          >
            🖼️ PNG
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
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
        
        {/* Legend */}
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-md">
          <h4 className="text-sm font-semibold mb-2">Entity Types</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9b5de5' }}></div>
              <span>Disease</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#e63946' }}></div>
              <span>Gene</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#2a9d8f' }}></div>
              <span>Pathway</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#4361ee' }}></div>
              <span>Biomarker</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f4a261' }}></div>
              <span>Drug</span>
            </div>
          </div>
        </div>

        {/* Node details panel */}
        {selectedNode && (
          <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-xs">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-800">{selectedNode.label}</h4>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Type:</strong> {selectedNode.type}</p>
              <p><strong>ID:</strong> {selectedNode.id}</p>
              {selectedNode.properties?.description && (
                <p><strong>Description:</strong> {selectedNode.properties.description}</p>
              )}
              {selectedNode.properties?.aliases && (
                <p><strong>Aliases:</strong> {selectedNode.properties.aliases.join(', ')}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
        <div className="flex flex-wrap gap-4">
          <span>💡 <strong>Tip:</strong> Drag nodes to rearrange</span>
          <span>🔍 <strong>Zoom:</strong> Mouse wheel or +/- buttons</span>
          <span>👆 <strong>Click:</strong> Select node for details</span>
          <span>🏷️ <strong>Hover:</strong> View node tooltip</span>
        </div>
      </div>
    </div>
  )
}

export default KnowledgeGraphVisualization