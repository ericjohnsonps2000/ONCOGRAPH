import { useState, useRef, useEffect } from 'react'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import OpenAI from 'openai'
import { knowledgeGraphService } from './services/knowledgeGraphService'

export interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  graphData?: {
    nodes: any[]
    edges: any[]
  }
}

// Initialize OpenAI client with error handling
let openai: OpenAI | null = null;

try {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (apiKey && apiKey !== 'your_openai_api_key_here') {
    openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  }
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
}

// Enhanced debug function with system info
const debugApiKey = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  console.log('🔍 Environment Debug Info:')
  console.log('- Platform:', navigator.platform)
  console.log('- User Agent:', navigator.userAgent.substring(0, 50) + '...')
  console.log('- API Key exists:', !!apiKey)
  console.log('- API Key length:', apiKey?.length || 0)
  console.log('- API Key format valid:', apiKey?.startsWith('sk-') || false)
  console.log('- API Key is placeholder:', apiKey === 'your_openai_api_key_here')
  console.log('- OpenAI client initialized:', !!openai)
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Debug API key on component mount
  useEffect(() => {
    debugApiKey()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    try {
      // Check API key first
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY
      if (!apiKey || apiKey === 'your_openai_api_key_here') {
        throw new Error('OpenAI API key is not configured. Please check your .env file and set VITE_OPENAI_API_KEY.')
      }
      
      if (!apiKey.startsWith('sk-')) {
        throw new Error('Invalid OpenAI API key format. The key should start with "sk-".')
      }

      if (!openai) {
        throw new Error('OpenAI client is not initialized. Please check your API key configuration.')
      }

      // Query the knowledge graph for relevant information
      const { nodes, relations, context } = knowledgeGraphService.queryKnowledgeGraph(text)
      const knowledgeContext = knowledgeGraphService.formatKnowledgeForAI(nodes, relations, context)
      
      console.log('🔍 Graph query results:', {
        query: text,
        nodesFound: nodes.length,
        relationsFound: relations.length,
        nodeTypes: nodes.map(n => n.type),
        nodeLabels: nodes.map(n => n.label)
      })
      
      // Create system prompt with knowledge graph context
      const systemPrompt = `You are a specialized biomedical AI assistant with access to a curated oncology knowledge graph. Your role is to answer questions about genes, drugs, pathways, biomarkers, and diseases based on the provided knowledge graph data.

RESPONSE FORMAT REQUIREMENTS:
- Always structure your responses with clear headings and bullet points
- Use numbered lists for sequential information
- Use bullet points (•) for related items
- Include clear section headers like "Overview:", "Key Functions:", "Related Entities:", etc.
- Break down complex information into digestible points
- Highlight important terms and relationships
- Use consistent formatting throughout

CONTENT GUIDELINES:
1. Use the provided knowledge graph data to answer questions about:
   • Specific genes (e.g., FGFR1, MYC, EGFR, BRCA1, etc.)
   • Drugs and their targets
   • Pathways and signaling networks
   • Biomarkers and their associations
   • Cancer types and related entities

2. Structure every response with:
   • **Overview:** Brief introduction to the topic
   • **Key Details:** Main points organized as bullet points
   • **Relationships:** How entities connect to each other
   • **Clinical Relevance:** Medical significance when applicable

3. When describing entities from the knowledge graph:
   • Explain their primary functions
   • List their connections and relationships
   • Highlight therapeutic targets and biomarkers
   • Reference specific pathways and disease associations

4. Format guidelines:
   • Use **bold** for entity names and important terms
   • Use bullet points for lists of related items
   • Use numbered lists for processes or sequential steps
   • Include clear section breaks with headers

5. If information is incomplete, acknowledge limitations but provide available data
6. Only respond with "I'm sorry, I can only answer questions related to the provided knowledge base" if the question is completely unrelated to oncology/biology OR if no relevant entities are found

KNOWLEDGE GRAPH DATA:
${knowledgeContext}`

      // Send message to OpenAI with knowledge graph context
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })

      const botResponse = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response."
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isUser: false,
        timestamp: new Date(),
        graphData: {
          nodes: nodes,
          edges: relations
        }
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error: any) {
      console.error('OpenAI API error:', error)
      
      let errorText = 'Sorry, I encountered an error.'
      
      if (error.message?.includes('API key')) {
        errorText = error.message
      } else if (error.status === 401) {
        errorText = 'Authentication failed. Please check your OpenAI API key is valid and has sufficient credits.'
      } else if (error.status === 429) {
        errorText = 'Rate limit exceeded. Please wait a moment and try again.'
      } else if (error.status === 500) {
        errorText = 'OpenAI server error. Please try again later.'
      } else if (error.message?.includes('fetch')) {
        errorText = 'Network error. Please check your internet connection.'
      } else if (error.message) {
        errorText = `Error: ${error.message}`
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <div className="bg-black/80 border-b border-cyan-500/30 px-4 py-3 shadow-lg backdrop-blur-sm">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse">OncoGraph Knowledge Assistant</h1>
        <p className="text-sm text-cyan-300/80 font-mono">Ask questions about cancer biology, pathways, drugs, and biomarkers</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-cyan-400 mt-20">
              <div className="text-6xl mb-6 dna-glow">🧬</div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-4">Welcome to OncoGraph Knowledge Assistant!</h2>
              <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 mx-auto max-w-2xl backdrop-blur-sm">
                <p className="text-cyan-300 font-mono mb-4">Ask questions about cancer biology, genes, pathways, drugs, and biomarkers.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <button 
                    className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded px-3 py-2 hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/40 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    onClick={() => handleSendMessage("What is EGFR?")}
                    aria-label="Ask about EGFR"
                  >
                    <span className="text-cyan-400">"What is EGFR?"</span>
                  </button>
                  <button 
                    className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded px-3 py-2 hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-400/40 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    onClick={() => handleSendMessage("Tell me about PI3K pathway")}
                    aria-label="Ask about PI3K pathway"
                  >
                    <span className="text-purple-400">"Tell me about PI3K pathway"</span>
                  </button>
                  <button 
                    className="bg-gradient-to-r from-pink-500/10 to-red-500/10 border border-pink-500/20 rounded px-3 py-2 hover:from-pink-500/20 hover:to-red-500/20 hover:border-pink-400/40 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-400/50"
                    onClick={() => handleSendMessage("Drugs for lung cancer")}
                    aria-label="Ask about drugs for lung cancer"
                  >
                    <span className="text-pink-400">"Drugs for lung cancer"</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-900/80 border border-cyan-500/30 rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm max-w-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce shadow-lg shadow-cyan-400/50"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce shadow-lg shadow-purple-400/50" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce shadow-lg shadow-pink-400/50" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="bg-black/80 border-t border-cyan-500/30 px-4 py-4 shadow-lg backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
    </div>
  )
}

export default App