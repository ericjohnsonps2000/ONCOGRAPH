import knowledgeGraphData from '../knowledge_graph_final.json'

export interface KnowledgeNode {
  id: string
  label: string
  type: string
  color: string
  properties?: any
}

export interface KnowledgeRelation {
  source: string
  target: string
  relation: string
  properties?: any
}

export interface KnowledgeGraph {
  meta: any
  nodes: KnowledgeNode[]
  edges: KnowledgeRelation[]
}

class KnowledgeGraphService {
  private kg: KnowledgeGraph
  private contextInfo: string

  constructor() {
    try {
      this.kg = knowledgeGraphData as KnowledgeGraph
      
      // Validate the data structure
      if (!this.kg) {
        throw new Error('Knowledge graph data is null or undefined')
      }
      
      if (!Array.isArray(this.kg.nodes)) {
        console.error('Knowledge graph nodes is not an array:', this.kg.nodes)
        this.kg.nodes = []
      }
      
      if (!Array.isArray(this.kg.edges)) {
        console.error('Knowledge graph edges is not an array:', this.kg.edges)
        this.kg.edges = []
      }
      
      console.log('✅ Knowledge Graph loaded successfully:', {
        nodes: this.kg.nodes?.length || 0,
        edges: this.kg.edges?.length || 0
      })
    } catch (error) {
      console.error('❌ Error loading knowledge graph:', error)
      // Initialize with empty data as fallback
      this.kg = {
        meta: { description: 'Fallback empty knowledge graph' },
        nodes: [],
        edges: []
      }
    }
    this.contextInfo = `
ENHANCED ONCOLOGY KNOWLEDGE GRAPH v2.0:
This comprehensive knowledge graph contains detailed molecular mechanisms, clinical data, and therapeutic information curated from authoritative sources including TCGA, cBioPortal, OncoKB, ClinVar, DrugBank, KEGG, Reactome, and UniProt.

ENTITY TYPES WITH DETAILED ANNOTATIONS:
- Disease: Comprehensive cancer information including epidemiology, molecular subtypes, staging, and biomarkers
- Gene: Detailed protein structure, function, clinical significance, mutation hotspots, and therapeutic implications  
- Pathway: Molecular mechanisms, regulatory networks, cancer relevance, and therapeutic targets
- Biomarker: Clinical utility, assessment methods, predictive/prognostic value, and limitations
- Drug: Mechanism of action, pharmacology, clinical applications, resistance mechanisms, and adverse effects

KEY MOLECULAR INSIGHTS:
- Mutation frequencies and hotspots with clinical significance
- Drug mechanisms of action and resistance pathways
- Biomarker assessment methods and clinical cutoffs
- Pathway crosstalk and regulatory mechanisms
- Structure-function relationships of key proteins

THERAPEUTIC INTELLIGENCE:
- FDA-approved targeted therapies with approval histories
- Combination therapy rationales and evidence
- Resistance mechanisms and overcome strategies
- Biomarker-guided treatment selection
- Clinical trial outcomes and efficacy data

PRECISION MEDICINE FOCUS:
Each entity includes clinically actionable information for personalized cancer treatment, including mutation-specific drug sensitivities, biomarker-guided therapy selection, and resistance pattern analysis.
`
  }

  // Extract relevant nodes and relationships based on user query - INTENT-AWARE VERSION
  public queryKnowledgeGraph(userQuery: string): { nodes: KnowledgeNode[], relations: KnowledgeRelation[], context: string } {
    const queryLower = userQuery.toLowerCase()
    const finalNodes: KnowledgeNode[] = []
    const finalNodeIds = new Set<string>()
    const relevantRelations: KnowledgeRelation[] = []

    // Step 1: Analyze query intent to determine desired entity types
    const queryIntent = this.analyzeQueryIntent(queryLower)
    console.log(`🔍 Query intent analysis:`, queryIntent)

    // Step 2: Handle specific gene requests
    if (queryIntent.specificGenes.length > 0) {
      console.log(`🧬 Looking for specific genes:`, queryIntent.specificGenes)
      return this.handleSpecificGeneRequest(queryIntent.specificGenes, queryIntent.wantedTypes, queryIntent.limitToOne)
    }

    // Step 3: Find target entity (disease, general entity, etc.)
    let targetEntity: KnowledgeNode | null = null
    
    if (Array.isArray(this.kg.nodes)) {
      // Look for the main subject of the query
      for (const node of this.kg.nodes) {
        const nodeLabel = node.label?.toLowerCase() || ''
        const nodeAliases = node.properties?.aliases || []
        
        // Check if this node matches the disease/entity mentioned in query
        if (
          queryLower.includes(nodeLabel) || 
          nodeAliases.some((alias: string) => queryLower.includes(alias.toLowerCase()))
        ) {
          if (queryIntent.contextEntity === 'disease' && node.type === 'disease') {
            targetEntity = node
            break
          } else if (queryIntent.contextEntity === 'specific' && 
                    (nodeLabel.length > 2 && queryLower.includes(nodeLabel))) {
            targetEntity = node
            break
          }
        }
      }
    }

    // Step 3: Based on intent, find the requested entity types (STRICT VERSION)
    if (targetEntity && Array.isArray(this.kg.edges)) {
      console.log(`🎯 Target entity found: ${targetEntity.label} (${targetEntity.type})`)
      
      if (queryIntent.wantedTypes.length > 0) {
        // Strict limits per entity type
        const maxPerType = 4
        const typeCount: { [key: string]: number } = {}
        
        // Find nodes of the requested types that are connected to the target entity
        this.kg.edges.forEach((relation: KnowledgeRelation) => {
          let connectedNode: KnowledgeNode | null = null
          
          // Check if the target entity is involved in this relationship
          if (relation.source === targetEntity.id) {
            connectedNode = this.kg.nodes.find(n => n.id === relation.target) || null
          } else if (relation.target === targetEntity.id) {
            connectedNode = this.kg.nodes.find(n => n.id === relation.source) || null
          }
          
          // Add the connected node if it matches criteria and limits
          if (connectedNode && 
              queryIntent.wantedTypes.includes(connectedNode.type) && 
              !finalNodeIds.has(connectedNode.id)) {
            
            // Initialize type counter
            if (!typeCount[connectedNode.type]) {
              typeCount[connectedNode.type] = 0
            }
            
            // Only add if under the limit for this type
            if (typeCount[connectedNode.type] < maxPerType && finalNodes.length < 10) {
              finalNodes.push(connectedNode)
              finalNodeIds.add(connectedNode.id)
              relevantRelations.push(relation)
              typeCount[connectedNode.type]++
              console.log(`➕ Added ${connectedNode.type}: ${connectedNode.label} (${typeCount[connectedNode.type]}/${maxPerType})`)
            } else {
              console.log(`⏭️ Skipped ${connectedNode.type}: ${connectedNode.label} (limit reached)`)
            }
          }
        })
        
        // Also add the target entity if it's relevant to show context
        if (queryIntent.includeContext && !finalNodeIds.has(targetEntity.id)) {
          finalNodes.push(targetEntity)
          finalNodeIds.add(targetEntity.id)
        }
      }
    }

    // Step 4: Fallback for direct entity queries (e.g., "What is EGFR?")
    if (finalNodes.length === 0) {
      const directMatches = this.findDirectMatches(queryLower)
      finalNodes.push(...directMatches.nodes)
      directMatches.nodes.forEach(node => finalNodeIds.add(node.id))
      relevantRelations.push(...directMatches.relations)
    }

    // Step 5: Filter relations to only include those between our final nodes
    const filteredRelations = relevantRelations.filter(relation => 
      finalNodeIds.has(relation.source) && finalNodeIds.has(relation.target)
    )

    console.log(`🎯 Query: "${userQuery}" -> Found ${finalNodes.length} focused nodes (${finalNodes.map(n => n.type).join(', ')}), ${filteredRelations.length} relations`)

    return {
      nodes: finalNodes,
      relations: filteredRelations,
      context: this.contextInfo
    }
  }

  // Analyze what the user is asking for
  private analyzeQueryIntent(query: string): {
    wantedTypes: string[],
    contextEntity: 'disease' | 'specific' | 'general',
    includeContext: boolean,
    specificGenes: string[],
    limitToOne: boolean
  } {
    const intent = {
      wantedTypes: [] as string[],
      contextEntity: 'general' as 'disease' | 'specific' | 'general',
      includeContext: false,
      specificGenes: [] as string[],
      limitToOne: false
    }

    // Check if user wants only one gene
    const singularRequests = [
      'one gene', 'a gene', 'single gene', 'name the gene', 
      'which gene', 'what gene', 'any gene', 'one specific gene'
    ]
    intent.limitToOne = singularRequests.some(phrase => query.toLowerCase().includes(phrase))

    // Extract specific gene names from the query (more precise matching)
    const knownGenes = ['FGFR1', 'MYC', 'EGFR', 'KRAS', 'TP53', 'BRCA1', 'BRCA2', 'HER2', 'ERBB2', 'PIK3CA', 'ALK', 'ROS1', 'RET', 'MET', 'BRAF', 'APC', 'AR', 'NRAS', 'CDKN2A', 'SMAD4', 'MLH1']
    
    // Look for exact gene name matches in the query
    intent.specificGenes = knownGenes.filter(gene => 
      query.toUpperCase().includes(gene) || 
      query.toLowerCase().includes(gene.toLowerCase())
    )
    
    // If user wants only one gene and we found multiple, take the first one
    if (intent.limitToOne && intent.specificGenes.length > 1) {
      intent.specificGenes = [intent.specificGenes[0]]
      console.log(`🎯 Limited to one gene: ${intent.specificGenes[0]}`)
    }

    // Detect what types of entities the user wants
    if (query.includes('gene') || query.includes('genes') || intent.specificGenes.length > 0) {
      intent.wantedTypes.push('gene')
      intent.includeContext = true
    }
    if (query.includes('drug') || query.includes('drugs') || query.includes('treatment') || query.includes('therapy') || query.includes('associated drugs')) {
      intent.wantedTypes.push('drug')
      intent.includeContext = true
    }
    if (query.includes('pathway') || query.includes('pathways') || query.includes('signaling') || query.includes('associated pathways')) {
      intent.wantedTypes.push('pathway')
      intent.includeContext = true
    }
    if (query.includes('biomarker') || query.includes('biomarkers') || query.includes('marker') || query.includes('associated biomarkers')) {
      intent.wantedTypes.push('biomarker')
      intent.includeContext = true
    }

    // Detect context entity
    if (query.includes('breast cancer') || query.includes('lung cancer') || 
        query.includes('colorectal cancer') || query.includes('pancreatic cancer') || 
        query.includes('prostate cancer') || query.includes('melanoma') || 
        query.includes('ovarian cancer')) {
      intent.contextEntity = 'disease'
    } else if (intent.specificGenes.length > 0) {
      intent.contextEntity = 'specific'
    } else if (this.extractSpecificTerms(query).length > 0) {
      intent.contextEntity = 'specific'
    }

    // If specific genes mentioned, include all connected entity types unless restricted
    if (intent.specificGenes.length > 0) {
      if (intent.wantedTypes.length === 0) {
        // User mentioned specific genes but didn't specify what they want - show everything connected
        intent.wantedTypes.push('gene', 'pathway', 'drug', 'biomarker')
      }
      intent.includeContext = true
    }

    // If no specific types requested, infer from context
    if (intent.wantedTypes.length === 0) {
      if (query.includes('target') || query.includes('treatment')) {
        intent.wantedTypes.push('drug', 'gene')
      } else if (query.includes('involve') || query.includes('associated')) {
        intent.wantedTypes.push('gene', 'pathway')
      } else {
        // Default: show connected entities
        intent.wantedTypes.push('gene', 'pathway', 'drug', 'biomarker')
        intent.includeContext = true
      }
    }

    return intent
  }

  // Fallback method for direct entity matching
  private findDirectMatches(query: string): { nodes: KnowledgeNode[], relations: KnowledgeRelation[] } {
    const nodes: KnowledgeNode[] = []
    const relations: KnowledgeRelation[] = []
    const nodeIds = new Set<string>()

    if (Array.isArray(this.kg.nodes)) {
      this.kg.nodes.forEach((node: KnowledgeNode) => {
        const nodeLabel = node.label?.toLowerCase() || ''
        if (query.includes(nodeLabel) && nodeLabel.length > 2) {
          nodes.push(node)
          nodeIds.add(node.id)
        }
      })
    }

    // Add a few connected nodes for context
    if (Array.isArray(this.kg.edges) && nodes.length > 0) {
      this.kg.edges.forEach((relation: KnowledgeRelation) => {
        if ((nodeIds.has(relation.source) || nodeIds.has(relation.target)) && nodes.length < 8) {
          relations.push(relation)
          
          if (nodeIds.has(relation.source) && !nodeIds.has(relation.target)) {
            const targetNode = this.kg.nodes.find(n => n.id === relation.target)
            if (targetNode) {
              nodes.push(targetNode)
              nodeIds.add(targetNode.id)
            }
          }
        }
      })
    }

    return { nodes, relations }
  }

  // Handle requests for specific genes - STRICT VERSION
  private handleSpecificGeneRequest(geneNames: string[], wantedTypes: string[], limitToOne: boolean = false): { nodes: KnowledgeNode[], relations: KnowledgeRelation[], context: string } {
    const finalNodes: KnowledgeNode[] = []
    const finalNodeIds = new Set<string>()
    const strictRelations: KnowledgeRelation[] = []

    console.log(`🧬 Processing STRICT gene request for: ${geneNames.join(', ')} with types: ${wantedTypes.join(', ')}, limitToOne: ${limitToOne}`)

    if (!Array.isArray(this.kg.nodes) || !Array.isArray(this.kg.edges)) {
      return { nodes: [], relations: [], context: this.contextInfo }
    }

    // Step 1: Find the specific genes mentioned
    const targetGenes: KnowledgeNode[] = []
    this.kg.nodes.forEach((node: KnowledgeNode) => {
      if (node.type === 'gene' && geneNames.includes(node.label?.toUpperCase() || '')) {
        targetGenes.push(node)
        console.log(`✅ Found target gene: ${node.label}`)
      }
    })
    
    // If user wants only one gene, limit to the first match
    const genesToProcess = limitToOne ? targetGenes.slice(0, 1) : targetGenes
    console.log(`🎯 Processing ${genesToProcess.length} gene(s): ${genesToProcess.map(g => g.label).join(', ')}`)
    
    // Add the target genes to final nodes
    genesToProcess.forEach(gene => {
      finalNodes.push(gene)
      finalNodeIds.add(gene.id)
    })

    // Handle case where no specific genes were mentioned but user wants genes related to a disease
    if (targetGenes.length === 0) {
      console.log(`⚠️ No specific genes found for: ${geneNames.join(', ')}, checking for disease-related genes`)
      
      // If limitToOne is true and we have wantedTypes including 'gene', find one gene related to the context
      if (limitToOne && wantedTypes.includes('gene')) {
        const diseaseRelatedGenes = this.findGenesRelatedToContext(geneNames.join(' '))
        if (diseaseRelatedGenes.length > 0) {
          const selectedGene = diseaseRelatedGenes[0]
          finalNodes.push(selectedGene)
          finalNodeIds.add(selectedGene.id)
          console.log(`🎯 Found one disease-related gene: ${selectedGene.label}`)
          
          // Find limited connections for this gene
          this.addLimitedConnections(selectedGene, wantedTypes, finalNodes, finalNodeIds, strictRelations, 2)
        }
      }
      
      if (finalNodes.length === 0) {
        return { nodes: [], relations: [], context: this.contextInfo }
      }
    }

    // Step 2: Add biomarkers with same names first (highest priority)
    if (wantedTypes.includes('biomarker')) {
      this.kg.nodes.forEach((node: KnowledgeNode) => {
        if (node.type === 'biomarker' && 
            geneNames.includes(node.label?.toUpperCase() || '') &&
            !finalNodeIds.has(node.id)) {
          finalNodes.push(node)
          finalNodeIds.add(node.id)
          console.log(`🔬 Added matching biomarker: ${node.label}`)
        }
      })
    }

    // Step 3: Find ONLY directly connected entities (very strict)
    const maxNodesPerType = limitToOne ? 2 : 3 // Even stricter limits for single gene requests
    const nodeCountByType: { [key: string]: number } = {}
    
    genesToProcess.forEach(gene => {
      this.kg.edges.forEach((relation: KnowledgeRelation) => {
        let connectedNode: KnowledgeNode | null = null

        // Check direct connections to our target genes
        if (relation.source === gene.id) {
          connectedNode = this.kg.nodes.find(n => n.id === relation.target) || null
        } else if (relation.target === gene.id) {
          connectedNode = this.kg.nodes.find(n => n.id === relation.source) || null
        }

        // Very strict criteria for adding nodes
        if (connectedNode && 
            wantedTypes.includes(connectedNode.type) && 
            !finalNodeIds.has(connectedNode.id)) {
          
          // Initialize counter for this type
          if (!nodeCountByType[connectedNode.type]) {
            nodeCountByType[connectedNode.type] = 0
          }
          
          // Only add if we haven't exceeded the limit for this type
          if (nodeCountByType[connectedNode.type] < maxNodesPerType) {
            finalNodes.push(connectedNode)
            finalNodeIds.add(connectedNode.id)
            strictRelations.push(relation)
            nodeCountByType[connectedNode.type]++
            console.log(`🔗 Added ${connectedNode.type}: ${connectedNode.label} -> ${gene.label} (${nodeCountByType[connectedNode.type]}/${maxNodesPerType})`)
          } else {
            console.log(`⏭️ Skipped ${connectedNode.type}: ${connectedNode.label} (limit reached for ${connectedNode.type})`)
          }
        }
      })
    })

    // Step 4: Only include relations between our selected nodes (no expansion)
    const finalRelations = strictRelations.filter(relation => 
      finalNodeIds.has(relation.source) && finalNodeIds.has(relation.target)
    )

    console.log(`🎯 STRICT gene request result: ${finalNodes.length} nodes, ${finalRelations.length} relations`)
    console.log(`📊 Final nodes: ${finalNodes.map(n => `${n.type}:${n.label}`).join(', ')}`)
    console.log(`🔗 Final relations: ${finalRelations.map(r => `${r.source.split(':')[1] || r.source}->${r.relation}->${r.target.split(':')[1] || r.target}`).join(', ')}`)
    
    return {
      nodes: finalNodes,
      relations: finalRelations,
      context: this.contextInfo
    }
  }

  // Find genes related to a disease context
  private findGenesRelatedToContext(context: string): KnowledgeNode[] {
    const contextLower = context.toLowerCase()
    const relatedGenes: KnowledgeNode[] = []
    
    // Disease-specific gene mappings
    const diseaseGeneMap: { [key: string]: string[] } = {
      'breast cancer': ['BRCA1', 'BRCA2', 'ERBB2', 'PIK3CA', 'ESR1', 'TP53'],
      'lung cancer': ['EGFR', 'KRAS', 'ALK', 'ROS1', 'MET', 'BRAF'],
      'colorectal cancer': ['APC', 'KRAS', 'PIK3CA', 'TP53', 'MLH1'],
      'pancreatic cancer': ['KRAS', 'TP53', 'SMAD4', 'PIK3CA'],
      'prostate cancer': ['AR', 'TP53', 'PIK3CA'],
      'melanoma': ['BRAF', 'NRAS', 'CDKN2A', 'TP53'],
      'ovarian cancer': ['BRCA1', 'BRCA2', 'TP53', 'PIK3CA'],
      'cancer': ['TP53', 'KRAS', 'EGFR', 'MYC', 'BRCA1']
    }
    
    // Find matching disease context
    for (const [disease, genes] of Object.entries(diseaseGeneMap)) {
      if (contextLower.includes(disease)) {
        // Find the first available gene from this disease context
        for (const geneName of genes) {
          const gene = this.kg.nodes.find(node => 
            node.type === 'gene' && node.label?.toUpperCase() === geneName
          )
          if (gene) {
            relatedGenes.push(gene)
            break // Only return the first match for single gene requests
          }
        }
        break
      }
    }
    
    return relatedGenes
  }
  
  // Add limited connections for a specific gene
  private addLimitedConnections(
    gene: KnowledgeNode, 
    wantedTypes: string[], 
    finalNodes: KnowledgeNode[], 
    finalNodeIds: Set<string>, 
    relations: KnowledgeRelation[], 
    maxPerType: number
  ): void {
    const nodeCountByType: { [key: string]: number } = {}
    
    this.kg.edges.forEach((relation: KnowledgeRelation) => {
      let connectedNode: KnowledgeNode | null = null

      if (relation.source === gene.id) {
        connectedNode = this.kg.nodes.find(n => n.id === relation.target) || null
      } else if (relation.target === gene.id) {
        connectedNode = this.kg.nodes.find(n => n.id === relation.source) || null
      }

      if (connectedNode && 
          wantedTypes.includes(connectedNode.type) && 
          !finalNodeIds.has(connectedNode.id)) {
        
        if (!nodeCountByType[connectedNode.type]) {
          nodeCountByType[connectedNode.type] = 0
        }
        
        if (nodeCountByType[connectedNode.type] < maxPerType) {
          finalNodes.push(connectedNode)
          finalNodeIds.add(connectedNode.id)
          relations.push(relation)
          nodeCountByType[connectedNode.type]++
          console.log(`🔗 Added ${connectedNode.type}: ${connectedNode.label} -> ${gene.label}`)
        }
      }
    })
  }

  // Helper method to extract specific biological terms from query
  private extractSpecificTerms(query: string): string[] {
    const biologicalTerms = [
      // Common genes
      'egfr', 'kras', 'tp53', 'brca1', 'brca2', 'her2', 'erbb2', 'pik3ca', 'alk', 'ros1', 'ret', 'met', 'braf', 'fgfr1', 'myc',
      // Common pathways
      'pi3k', 'akt', 'mapk', 'ras', 'p53', 'wnt', 'notch', 'jak', 'stat', 'mtor', 'nf-kb', 'fgfr',
      // Common drugs
      'trastuzumab', 'osimertinib', 'gefitinib', 'erlotinib', 'crizotinib', 'lapatinib', 'tamoxifen', 'olaparib',
      // Cancer types
      'lung cancer', 'breast cancer', 'nsclc', 'sclc',
      // General terms
      'pathway', 'signaling', 'mutation', 'inhibitor', 'receptor', 'kinase'
    ]

    return biologicalTerms.filter(term => 
      query.includes(term) || term.includes(query.replace(/[^a-z0-9]/g, ''))
    )
  }

  // Format the extracted knowledge for OpenAI
  public formatKnowledgeForAI(nodes: KnowledgeNode[], relations: KnowledgeRelation[], context: string): string {
    if (nodes.length === 0 && relations.length === 0) {
      return "No relevant information found in the knowledge graph."
    }

    let formattedKnowledge = context + "\n\nRELEVANT KNOWLEDGE FROM GRAPH:\n\n"

    // Format nodes
    if (Array.isArray(nodes) && nodes.length > 0) {
      formattedKnowledge += "ENTITIES:\n"
      nodes.forEach((node: KnowledgeNode) => {
        formattedKnowledge += `- ${(node.type || 'UNKNOWN').toUpperCase()}: ${node.label || 'Unknown'} (ID: ${node.id || 'Unknown'})`
        if (node.properties?.description) {
          formattedKnowledge += ` - ${node.properties.description}`
        }
        if (node.properties?.aliases && Array.isArray(node.properties.aliases)) {
          formattedKnowledge += ` - Also known as: ${node.properties.aliases.join(', ')}`
        }
        formattedKnowledge += "\n"
      })
      formattedKnowledge += "\n"
    }

    // Format relationships
    if (Array.isArray(relations) && relations.length > 0) {
      formattedKnowledge += "RELATIONSHIPS:\n"
      relations.forEach((relation: KnowledgeRelation) => {
        const sourceNode = nodes.find(n => n.id === relation.source)
        const targetNode = nodes.find(n => n.id === relation.target)
        const relationLabel = relation.relation ? relation.relation.replace('_', ' ') : 'related to'
        formattedKnowledge += `- ${sourceNode?.label || relation.source} ${relationLabel} ${targetNode?.label || relation.target}\n`
      })
    }

    return formattedKnowledge
  }
}

export const knowledgeGraphService = new KnowledgeGraphService()