import { Message } from '../App'
import KnowledgeGraphVisualization from './KnowledgeGraphVisualization'

interface ChatMessageProps {
  message: Message
}

function ChatMessage({ message }: ChatMessageProps) {
  const hasGraphData = message.graphData && message.graphData.nodes.length > 0

  // Function to parse markdown bold syntax and convert to HTML
  const parseMarkdownText = (text: string) => {
    // Replace **text** with <strong>text</strong>
    const parsedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    return parsedText
  }

  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`${message.isUser ? 'max-w-xs lg:max-w-md' : hasGraphData ? 'max-w-full' : 'max-w-xs lg:max-w-md'} px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm ${
          message.isUser
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-md border border-cyan-400/30 shadow-cyan-400/20'
            : 'bg-gray-900/80 text-cyan-100 border border-purple-500/30 rounded-bl-md shadow-purple-500/20'
        }`}
      >
        <div 
          className="text-sm leading-relaxed whitespace-pre-wrap font-mono"
          dangerouslySetInnerHTML={{ __html: parseMarkdownText(message.text) }}
        />
        
        {/* Show graph visualization for bot messages with graph data */}
        {!message.isUser && hasGraphData && message.graphData && (
          <div className="mt-4 border border-cyan-500/20 rounded-lg overflow-hidden">
            <KnowledgeGraphVisualization 
              data={{
                nodes: message.graphData.nodes,
                edges: message.graphData.edges
              }}
              width={700}
              height={500}
              onNodeClick={(node) => {
                console.log('Node clicked:', node)
              }}
            />
          </div>
        )}
        
        <div className={`text-xs mt-1 opacity-70 font-mono ${
          message.isUser ? 'text-cyan-100' : 'text-purple-300'
        }`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {!message.isUser && hasGraphData && (
            <span className="ml-2 text-cyan-400">🌐 Interactive graph included</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage