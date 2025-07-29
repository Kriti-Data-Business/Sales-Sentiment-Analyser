import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, BarChart3, Users, Building2, Stethoscope, ShoppingCart, Activity } from 'lucide-react';

const PharmaSentimentChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState('doctor');
  const messagesEndRef = useRef(null);

  const stakeholderTypes = {
    doctor: { label: 'Doctors/Clinicians', icon: Stethoscope, color: 'bg-blue-500' },
    clinic: { label: 'Clinic Management', icon: Building2, color: 'bg-green-500' },
    hospital: { label: 'Hospital Systems', icon: Activity, color: 'bg-purple-500' },
    retail: { label: 'Retail Customers', icon: ShoppingCart, color: 'bg-orange-500' },
    insurance: { label: 'Insurance Providers', icon: BarChart3, color: 'bg-red-500' }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generatePrompt = (text, stakeholderType) => {
    const basePrompt = `You are an expert pharmaceutical industry sentiment analyst specializing in sales representative interactions. Analyze the following communication for sentiment, key insights, and actionable recommendations.

**Context**: This is a communication between a pharmaceutical sales representative and a ${stakeholderTypes[stakeholderType].label}.

**Text to Analyze**: "${text}"

**Analysis Framework**:
1. **Sentiment Score**: Rate from -5 (very negative) to +5 (very positive)
2. **Confidence Level**: How certain are you? (Low/Medium/High)
3. **Key Emotional Indicators**: Identify specific words/phrases driving sentiment
4. **Stakeholder-Specific Insights**: `;

    const stakeholderSpecificPrompts = {
      doctor: `
   - Clinical efficacy concerns or enthusiasm
   - Patient safety considerations
   - Treatment protocol alignment
   - Evidence-based decision factors
   - Professional reputation impact`,
      
      clinic: `
   - Operational efficiency impact
   - Cost-benefit considerations
   - Staff training requirements
   - Patient throughput effects
   - Administrative burden assessment`,
      
      hospital: `
   - System-wide implementation feasibility
   - Budget and procurement concerns
   - Patient outcome improvements
   - Regulatory compliance factors
   - Integration with existing protocols`,
      
      retail: `
   - Product accessibility and availability
   - Pricing and insurance coverage
   - Side effects and contraindications
   - Alternative treatment options
   - Patient education needs`,
      
      insurance: `
   - Cost-effectiveness analysis
   - Coverage policy implications
   - Prior authorization requirements
   - Clinical outcome justification
   - Formulary placement considerations`
    };

    return basePrompt + stakeholderSpecificPrompts[stakeholderType] + `

**Actionable Recommendations**:
- Immediate follow-up actions
- Relationship building opportunities
- Potential objection handling strategies
- Next meeting preparation points

**Risk Assessment**: Identify any red flags or concerns that need escalation.

Provide a structured, professional analysis that a pharmaceutical sales manager could use for strategic decision-making.`;
  };

  const analyzeSentiment = async (text, stakeholderType) => {
    // Simulate AI analysis with realistic pharmaceutical industry insights
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const prompt = generatePrompt(text, stakeholderType);
    
    // Mock analysis based on common pharmaceutical sales scenarios
    const mockAnalyses = {
      positive: {
        sentiment: 4.2,
        confidence: 'High',
        keyIndicators: ['interested', 'effective', 'positive outcomes', 'willing to try'],
        insights: `Strong receptivity to the product proposition. ${stakeholderTypes[stakeholderType].label} shows genuine interest in clinical benefits and patient outcomes.`,
        recommendations: [
          'Schedule follow-up clinical data presentation',
          'Provide sample materials for evaluation',
          'Connect with key opinion leaders in their network',
          'Prepare implementation timeline proposal'
        ],
        riskAssessment: 'Low risk - proceed with confidence'
      },
      neutral: {
        sentiment: 0.5,
        confidence: 'Medium',
        keyIndicators: ['considering', 'need more information', 'reviewing options'],
        insights: `Cautious but open approach. ${stakeholderTypes[stakeholderType].label} requires additional evidence and reassurance before commitment.`,
        recommendations: [
          'Provide comprehensive clinical trial data',
          'Address specific concerns raised',
          'Offer pilot program or trial period',
          'Schedule meeting with clinical specialists'
        ],
        riskAssessment: 'Medium risk - requires nurturing'
      },
      negative: {
        sentiment: -2.8,
        confidence: 'High',
        keyIndicators: ['concerned', 'side effects', 'cost prohibitive', 'not convinced'],
        insights: `Significant resistance identified. ${stakeholderTypes[stakeholderType].label} has substantial concerns about efficacy, safety, or cost-effectiveness.`,
        recommendations: [
          'Address safety concerns with peer-reviewed studies',
          'Explore alternative pricing models',
          'Provide competitive analysis data',
          'Schedule meeting with medical affairs team'
        ],
        riskAssessment: 'High risk - requires strategic intervention'
      }
    };

    // Simple sentiment detection based on keywords
    const positiveWords = ['effective', 'interested', 'beneficial', 'positive', 'excellent', 'impressed', 'satisfied'];
    const negativeWords = ['concerned', 'expensive', 'side effects', 'worried', 'disappointed', 'ineffective'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    let analysisType;
    if (positiveCount > negativeCount) {
      analysisType = 'positive';
    } else if (negativeCount > positiveCount) {
      analysisType = 'negative';
    } else {
      analysisType = 'neutral';
    }
    
    return mockAnalyses[analysisType];
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!inputText.trim() || isAnalyzing) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText,
      stakeholder: selectedStakeholder,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsAnalyzing(true);

    try {
      const analysis = await analyzeSentiment(inputText, selectedStakeholder);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        analysis: analysis,
        stakeholder: selectedStakeholder,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderAnalysis = (analysis, stakeholder) => {
    const StakeholderIcon = stakeholderTypes[stakeholder].icon;
    const sentimentColor = analysis.sentiment > 2 ? 'text-green-600' : 
                          analysis.sentiment < -1 ? 'text-red-600' : 'text-yellow-600';
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-full ${stakeholderTypes[stakeholder].color} text-white`}>
            <StakeholderIcon size={20} />
          </div>
          <h3 className="font-semibold text-gray-800">
            Analysis for {stakeholderTypes[stakeholder].label}
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">Sentiment Score</p>
            <p className={`text-2xl font-bold ${sentimentColor}`}>
              {analysis.sentiment > 0 ? '+' : ''}{analysis.sentiment}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">Confidence</p>
            <p className="text-lg font-semibold text-gray-800">{analysis.confidence}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Key Emotional Indicators</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.keyIndicators.map((indicator, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                {indicator}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Stakeholder-Specific Insights</h4>
          <p className="text-gray-700">{analysis.insights}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Actionable Recommendations</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm">{rec}</li>
            ))}
          </ul>
        </div>
        
        <div className="border-t pt-3">
          <h4 className="font-medium text-gray-800 mb-1">Risk Assessment</h4>
          <p className={`text-sm font-medium ${
            analysis.riskAssessment.includes('Low') ? 'text-green-600' :
            analysis.riskAssessment.includes('Medium') ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {analysis.riskAssessment}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Activity className="text-blue-600" />
            Pharmaceutical Sales Sentiment Analyzer
          </h1>
          <p className="text-gray-600">
            AI-powered sentiment analysis for pharmaceutical sales interactions across different stakeholder types
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg h-96 mb-4 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Bot size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>Start by entering a sales interaction note or client communication</p>
                    <p className="text-sm mt-2">Select the stakeholder type and I'll provide detailed sentiment analysis</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="space-y-3">
                      {message.type === 'user' ? (
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-500 p-2 rounded-full text-white">
                            <User size={16} />
                          </div>
                          <div className="flex-1">
                            <div className="bg-blue-100 rounded-lg p-3">
                              <p className="text-gray-800">{message.content}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {message.timestamp} • {stakeholderTypes[message.stakeholder].label}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <div className="bg-green-500 p-2 rounded-full text-white">
                            <Bot size={16} />
                          </div>
                          <div className="flex-1">
                            {renderAnalysis(message.analysis, message.stakeholder)}
                            <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isAnalyzing && (
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 p-2 rounded-full text-white">
                        <Bot size={16} />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="animate-pulse w-2 h-2 bg-gray-400 rounded-full"></div>
                          <div className="animate-pulse w-2 h-2 bg-gray-400 rounded-full" style={{animationDelay: '0.2s'}}></div>
                          <div className="animate-pulse w-2 h-2 bg-gray-400 rounded-full" style={{animationDelay: '0.4s'}}></div>
                          <span className="text-gray-600 ml-2">Analyzing sentiment...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter sales interaction notes, client communications, or feedback to analyze..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  disabled={isAnalyzing}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey && !isAnalyzing && inputText.trim()) {
                      handleSubmit(e);
                    }
                  }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!inputText.trim() || isAnalyzing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={16} />
                  Analyze
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users size={20} />
                Stakeholder Type
              </h3>
              <div className="space-y-3">
                {Object.entries(stakeholderTypes).map(([key, { label, icon: Icon, color }]) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="stakeholder"
                      value={key}
                      checked={selectedStakeholder === key}
                      onChange={(e) => setSelectedStakeholder(e.target.value)}
                      className="text-blue-600"
                    />
                    <div className={`p-2 rounded-full ${color} text-white`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Sample Interactions</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                     onClick={() => setInputText("Dr. Smith expressed concerns about the side effect profile but was impressed with the efficacy data from the Phase III trials. He mentioned he'd like to see more real-world evidence before prescribing to his diabetic patients.")}>
                  <p className="font-medium text-gray-800">Doctor Interaction</p>
                  <p className="text-gray-600">Mixed sentiment with efficacy interest</p>
                </div>
                <div className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                     onClick={() => setInputText("The hospital pharmacy committee is very interested in adding our medication to formulary, especially given the cost savings analysis we presented. They want to schedule a pilot program for Q2.")}>
                  <p className="font-medium text-gray-800">Hospital System</p>
                  <p className="text-gray-600">Positive engagement with cost focus</p>
                </div>
                <div className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                     onClick={() => setInputText("Patient called asking about coverage for the new treatment. Their insurance requires prior authorization and they're worried about out-of-pocket costs. They want to know about patient assistance programs.")}>
                  <p className="font-medium text-gray-800">Retail Customer</p>
                  <p className="text-gray-600">Access and affordability concerns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmaSentimentChatbot;
