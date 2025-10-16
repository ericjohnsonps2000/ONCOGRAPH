# OncoGraph Knowledge Assistant 🧬

A sophisticated biomedical AI assistant that combines OpenAI's GPT-4o-mini with an interactive knowledge graph visualization for oncology research and education.

![OncoGraph Demo](https://img.shields.io/badge/Status-Production_Ready-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![D3.js](https://img.shields.io/badge/D3.js-7.9.0-orange)

## ✨ Features

### 🤖 **AI-Powered Chat Interface**
- **GPT-4o-mini Integration**: Advanced conversational AI for biomedical queries
- **Structured Responses**: Point-wise, organized answers with clear headings
- **Context-Aware**: Utilizes knowledge graph data for accurate responses

### 📊 **Interactive Knowledge Graph Visualization**
- **D3.js-Powered**: Smooth, interactive force-directed graph layouts
- **Entity Types**: Genes, Drugs, Pathways, Biomarkers, Diseases
- **Smart Filtering**: Shows only relevant entities based on user queries
- **Export Functionality**: Download visualizations as PNG images

### 🎯 **Intelligent Query Processing**
- **Intent Recognition**: Understands specific gene requests vs. general queries
- **Single Entity Focus**: When asking for "one gene", shows exactly one result
- **Disease Context**: Automatically finds relevant genes for cancer types
- **Relationship Mapping**: Displays connections between biological entities

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **OpenAI API Key** (GPT-4o-mini access)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ericjohnsonps2000/oncograph.git
   cd oncograph
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in frontend directory
   echo "VITE_OPENAI_API_KEY=your_openai_api_key_here" > .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## 🔧 Configuration

### OpenAI API Key Setup
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env` file:
   ```env
   VITE_OPENAI_API_KEY=sk-your-key-here
   ```

### Knowledge Graph Data
The project includes a curated oncology knowledge graph with:
- **1,000+ entities** across 5 types
- **2,000+ relationships** 
- **Cancer-focused** genes, pathways, and drugs

## 📋 Usage Examples

### 🧬 **Gene Queries**
```
"What is EGFR?"
"One gene related to breast cancer"
"FGFR1 and MYC associated drugs"
```

### 💊 **Drug Information**
```
"Drugs targeting EGFR"
"Tell me about Trastuzumab"
"Treatments for lung cancer"
```

### 🔬 **Pathway Analysis**
```
"PI3K pathway components"
"Pathways involved in breast cancer"
"MAPK signaling network"
```

## 🏗️ Project Structure

```
oncograph/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── KnowledgeGraphVisualization.tsx
│   │   ├── services/         # Business logic
│   │   │   └── knowledgeGraphService.ts
│   │   └── App.tsx          # Main application
│   ├── package.json
│   └── .env                 # Environment variables
├── backend/                 # Python backend (optional)
│   ├── knowledge_graph_final.json
│   └── main.py
└── README.md
```

## 🛠️ Tech Stack

### **Frontend**
- **React 18.2.0** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first styling
- **D3.js 7.9.0** - Data visualization

### **AI Integration**
- **OpenAI SDK 4.104.0** - GPT-4o-mini integration
- **Custom Knowledge Graph** - Oncology domain expertise

### **Data Processing**
- **Knowledge Graph Service** - Query processing and filtering
- **Intent Recognition** - Smart query analysis
- **Relationship Mapping** - Entity connection discovery

## 🎨 Key Components

### `KnowledgeGraphVisualization.tsx`
- Force-directed graph layout using D3.js
- Interactive zoom, pan, and drag functionality
- Color-coded entity types
- Tooltip information on hover
- Export to PNG functionality

### `knowledgeGraphService.ts`
- Query intent analysis and processing
- Entity filtering and relationship mapping
- Knowledge graph data management
- AI context formatting

### `App.tsx`
- OpenAI GPT-4o-mini integration
- Chat state management
- Error handling and debugging
- Response formatting

## 🔍 Advanced Features

### **Smart Query Processing**
- Detects singular vs. plural requests
- Limits results for focused visualizations
- Disease-context gene discovery
- Relationship depth control

### **Visualization Controls**
- Fullscreen mode toggle
- Graph reset and re-layout
- Export functionality
- Interactive node selection

### **AI Response Enhancement**
- Structured, point-wise responses
- Bold formatting for key terms
- Clear section headers
- Clinical relevance highlighting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **ericjohnsonps2000** - Initial development and design

## 🆘 Support

If you encounter any issues:

1. **Check the console** for error messages
2. **Verify API key** configuration
3. **Ensure dependencies** are installed
4. **Open an issue** on GitHub

## 🔮 Future Enhancements

- [ ] Real-time collaboration features
- [ ] Enhanced entity filtering options
- [ ] Additional cancer type support
- [ ] API endpoint development
- [ ] Mobile responsive design improvements

---

**Built with ❤️ for the oncology research community**
