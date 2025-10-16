import { Message } from '../App'
import KnowledgeGraphVisualization from './KnowledgeGraphVisualization'

interface ChatMessageProps {
  message: Message
}

function ChatMessage({ message }: ChatMessageProps) {
  const hasGraphData = message.graphData && message.graphData.nodes.length > 0

  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`${message.isUser ? 'max-w-xs lg:max-w-md' : hasGraphData ? 'max-w-full' : 'max-w-xs lg:max-w-md'} px-4 py-3 rounded-2xl shadow-sm ${
          message.isUser
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        
        {/* Show graph visualization for bot messages with graph data */}
        {!message.isUser && hasGraphData && message.graphData && (
          <div className="mt-4">
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
        
        <div className={`text-xs mt-1 opacity-70 ${
          message.isUser ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {!message.isUser && hasGraphData && (
            <span className="ml-2">📊 Interactive graph included</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage