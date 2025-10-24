# 🧬 OncoGraph Knowledge Assistant

A sophisticated biomedical AI assistant powered by an enhanced oncology knowledge graph, featuring interactive visualizations and comprehensive cancer biology insights.

![OncoGraph Demo](https://img.shields.io/badge/Status-Production_Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Vite](https://img.shields.io/badge/Vite-4.4.5-purple)
![D3.js](https://img.shields.io/badge/D3.js-7.9.0-orange)

## 🌟 Features

### 🤖 **AI-Powered Chat Interface**
- **GPT-4o-mini Integration**: Sophisticated natural language understanding for cancer biology queries
- **Structured Responses**: Point-wise, organized answers with proper formatting and bold text rendering
- **Futuristic Dark UI**: Cyberpunk-inspired design with neon accents and glass morphism effects
- **Context-Aware Intelligence**: Leverages enhanced knowledge graph for scientifically accurate responses

### 📊 **Interactive Knowledge Graph Visualization**
- **D3.js-Powered Graphs**: Dynamic, interactive network visualizations with smooth animations
- **Entity-Relationship Mapping**: Visual connections between genes, drugs, pathways, biomarkers, and diseases
- **Color-Coded Entities**: Intuitive visual distinction with neon styling
- **Real-time Filtering**: Context-aware graph generation based on user queries
- **Export Functionality**: Download visualizations as high-quality PNG images

### 🧬 **Comprehensive Oncology Database v2.0**
- **Enhanced Knowledge Graph**: Scientifically curated data from TCGA, OncoKB, DrugBank, ClinVar, KEGG, Reactome
- **Molecular Mechanisms**: Detailed protein structures, mutation hotspots, and pathway interactions
- **Clinical Intelligence**: Drug mechanisms, resistance patterns, biomarker significance, and FDA approval data
- **Multi-Cancer Coverage**: Lung, breast, colorectal, pancreatic, prostate, melanoma, ovarian cancers with detailed epidemiology

### 🎯 **Precision Medicine Focus**
- **Mutation-Specific Insights**: Detailed information on hotspot mutations (EGFR L858R, KRAS G12C, etc.)
- **Therapeutic Targeting**: Drug-gene interactions, resistance mechanisms, and combination strategies
- **Biomarker Interpretation**: Clinical assessment methods, cutoff values, and predictive significance
- **Pathway Analysis**: Molecular network analysis with regulatory mechanisms and therapeutic implications

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

## � Usage Examples

### Basic Queries
- "What is EGFR and its role in lung cancer?"
- "Show me drugs for breast cancer treatment"
- "Explain the PI3K pathway in cancer"
- "Drugs related to colorectal cancer"

### Advanced Molecular Queries
- "What are the specific EGFR mutations and their drug sensitivities?"
- "How does trastuzumab resistance develop in HER2+ breast cancer?"
- "What biomarkers predict immunotherapy response?"
- "Explain the mechanism of osimertinib in T790M-positive NSCLC"

### Pathway and Network Analysis
- "Show me the RAS-MAPK signaling pathway"
- "What genes are involved in DNA repair?"
- "How do different cancer pathways interact?"
- "PI3K-AKT-mTOR pathway therapeutic targets"

### Precision Medicine Queries
- "KRAS G12C mutation and targeted therapy"
- "PD-L1 biomarker assessment methods"
- "BRCA1 mutations and synthetic lethality"
- "HER2 amplification and antibody-drug conjugates"

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
