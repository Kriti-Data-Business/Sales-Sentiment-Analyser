import streamlit as st
import anthropic
import json
import datetime
from typing import Dict, List, Optional
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# Configuration
ANTHROPIC_API_KEY = "your-anthropic-api-key-here"  # Replace with your  API key
MODEL_NAME = "claude-3-5-sonnet-20241022"  # Latest Claude model

class PharmaSentimentAnalyzer:
    def __init__(self, api_key: str):
        """Initialize the sentiment analyzer with Anthropic Claude API"""
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = MODEL_NAME
        
        self.stakeholder_types = {
            'doctor': {
                'label': 'Doctors/Clinicians',
                'icon': '🩺',
                'color': '#3B82F6',
                'focus_areas': [
                    'Clinical efficacy concerns or enthusiasm',
                    'Patient safety considerations', 
                    'Treatment protocol alignment',
                    'Evidence-based decision factors',
                    'Professional reputation impact'
                ]
            },
            'clinic': {
                'label': 'Clinic Management',
                'icon': '🏥',
                'color': '#10B981',
                'focus_areas': [
                    'Operational efficiency impact',
                    'Cost-benefit considerations',
                    'Staff training requirements',
                    'Patient throughput effects',
                    'Administrative burden assessment'
                ]
            },
            'hospital': {
                'label': 'Hospital Systems',
                'icon': '🏢',
                'color': '#8B5CF6',
                'focus_areas': [
                    'System-wide implementation feasibility',
                    'Budget and procurement concerns',
                    'Patient outcome improvements',
                    'Regulatory compliance factors',
                    'Integration with existing protocols'
                ]
            },
            'retail': {
                'label': 'Retail Customers',
                'icon': '🛒',
                'color': '#F59E0B',
                'focus_areas': [
                    'Product accessibility and availability',
                    'Pricing and insurance coverage',
                    'Side effects and contraindications',
                    'Alternative treatment options',
                    'Patient education needs'
                ]
            },
            'insurance': {
                'label': 'Insurance Providers',
                'icon': '📊',
                'color': '#EF4444',
                'focus_areas': [
                    'Cost-effectiveness analysis',
                    'Coverage policy implications',
                    'Prior authorization requirements',
                    'Clinical outcome justification',
                    'Formulary placement considerations'
                ]
            }
        }

    def generate_analysis_prompt(self, text: str, stakeholder_type: str) -> str:
        """Generate sophisticated prompt for sentiment analysis"""
        
        stakeholder_info = self.stakeholder_types[stakeholder_type]
        focus_areas = '\n   - '.join(stakeholder_info['focus_areas'])
        
        prompt = f"""You are an expert pharmaceutical industry sentiment analyst with deep experience in sales representative interactions and stakeholder relationship management. Your task is to provide a comprehensive sentiment analysis of the following communication.

**CONTEXT INFORMATION:**
- Stakeholder Type: {stakeholder_info['label']}
- Industry: Pharmaceutical Sales & Marketing
- Analysis Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}

**TEXT TO ANALYZE:**
"{text}"

**ANALYSIS FRAMEWORK:**
Please provide a structured analysis in the following JSON format:

{{
    "sentiment_score": [number between -5.0 and 5.0],
    "confidence_level": "[Low/Medium/High]",
    "sentiment_category": "[Very Negative/Negative/Neutral/Positive/Very Positive]",
    "key_emotional_indicators": [
        "list of specific words/phrases that drive sentiment"
    ],
    "stakeholder_specific_insights": {{
        "primary_concerns": ["list of main concerns or interests"],
        "decision_factors": ["key factors influencing their decision"],
        "relationship_status": "assessment of current relationship health",
        "engagement_level": "assessment of stakeholder engagement"
    }},
    "focus_area_analysis": {{
        "areas_addressed": [
            {focus_areas}
        ]
    }},
    "actionable_recommendations": [
        "specific, tactical recommendations for sales rep"
    ],
    "follow_up_strategy": {{
        "immediate_actions": ["actions for next 1-3 days"],
        "short_term_actions": ["actions for next 1-2 weeks"],
        "long_term_strategy": ["strategic approach for next 1-3 months"]
    }},
    "risk_assessment": {{
        "risk_level": "[Low/Medium/High/Critical]",
        "potential_issues": ["list of potential problems"],
        "escalation_recommended": [true/false],
        "mitigation_strategies": ["ways to address risks"]
    }},
    "competitive_intelligence": {{
        "competitor_mentions": ["any competitors referenced"],
        "competitive_advantages": ["our strengths vs competition"],
        "competitive_threats": ["competitive risks identified"]
    }},
    "next_meeting_preparation": [
        "specific items to prepare for next interaction"
    ],
    "kpi_impact": {{
        "sales_probability": "[percentage estimate of closing probability]",
        "timeline_estimate": "[estimated timeline to decision]",
        "potential_value": "[High/Medium/Low value opportunity assessment]"
    }}
}}

**ANALYSIS GUIDELINES:**
1. Consider pharmaceutical industry regulations (FDA, compliance)
2. Account for clinical evidence requirements and medical decision-making
3. Recognize budget cycles and procurement processes for institutional stakeholders
4. Understand patient advocacy and safety concerns
5. Consider competitive landscape and market dynamics
6. Factor in relationship-building aspects crucial for pharmaceutical sales

Provide thorough, actionable insights that a pharmaceutical sales manager could immediately implement for strategic advantage."""

        return prompt

    def analyze_sentiment(self, text: str, stakeholder_type: str) -> Dict:
        """Analyze sentiment using Claude API"""
        try:
            prompt = self.generate_analysis_prompt(text, stakeholder_type)
            
            message = self.client.messages.create(
                model=self.model,
                max_tokens=4000,
                temperature=0.3,  # Lower temperature for more consistent analysis
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            # Parse the JSON response
            response_text = message.content[0].text
            
            # Extract JSON from response (handle cases where Claude adds explanation text)
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_text = response_text[json_start:json_end]
            
            analysis = json.loads(json_text)
            analysis['raw_response'] = response_text
            analysis['stakeholder_type'] = stakeholder_type
            analysis['timestamp'] = datetime.datetime.now().isoformat()
            
            return analysis
            
        except Exception as e:
            st.error(f"Error in sentiment analysis: {str(e)}")
            return self._get_fallback_analysis(text, stakeholder_type)
    
    def _get_fallback_analysis(self, text: str, stakeholder_type: str) -> Dict:
        """Fallback analysis if API fails"""
        return {
            "sentiment_score": 0.0,
            "confidence_level": "Low",
            "sentiment_category": "Neutral",
            "error": "API call failed - showing fallback analysis",
            "stakeholder_type": stakeholder_type,
            "timestamp": datetime.datetime.now().isoformat()
        }

def create_sentiment_chart(analyses: List[Dict]) -> go.Figure:
    """Create sentiment trend chart"""
    if not analyses:
        return go.Figure()
    
    df = pd.DataFrame([
        {
            'timestamp': a['timestamp'],
            'sentiment_score': a.get('sentiment_score', 0),
            'stakeholder_type': a['stakeholder_type'],
            'confidence': a.get('confidence_level', 'Unknown')
        }
        for a in analyses
    ])
    
    fig = px.line(df, x='timestamp', y='sentiment_score', 
                  color='stakeholder_type', 
                  title='Sentiment Trend Over Time',
                  range_y=[-5, 5])
    
    fig.add_hline(y=0, line_dash="dash", line_color="gray", 
                  annotation_text="Neutral")
    
    return fig

def main():
    st.set_page_config(
        page_title="Pharma Sentiment Analyzer",
        page_icon="💊",
        layout="wide"
    )
    
    st.title("🧬 Pharmaceutical Sales Sentiment Analyzer")
    st.markdown("**AI-Powered Analysis Using Claude API for Sales Rep Communications**")
    
    # Initialize session state
    if 'analyses' not in st.session_state:
        st.session_state.analyses = []
    if 'analyzer' not in st.session_state:
        # Initialize with placeholder API key
        st.session_state.analyzer = PharmaSentimentAnalyzer(ANTHROPIC_API_KEY)
    
    # Sidebar configuration
    with st.sidebar:
        st.header("⚙️ Configuration")
        
        # API Key input
        api_key = st.text_input(
            "Anthropic API Key", 
            value=ANTHROPIC_API_KEY if ANTHROPIC_API_KEY != "your-anthropic-api-key-here" else "",
            type="password",
            help="Get your API key from https://console.anthropic.com"
        )
        
        if api_key and api_key != ANTHROPIC_API_KEY:
            st.session_state.analyzer = PharmaSentimentAnalyzer(api_key)
            st.success("✅ API Key Updated")
        
        st.markdown("---")
        
        # Model information
        st.info(f"""
        **Using Claude Model:**
        `{MODEL_NAME}`
        
        **Features:**
        - Advanced reasoning
        - Context-aware analysis
        - JSON structured output
        - Pharmaceutical domain expertise
        """)
        
        st.markdown("---")
        
        # Clear history
        if st.button("🗑️ Clear Analysis History"):
            st.session_state.analyses = []
            st.rerun()
    
    # Main interface
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.header("📝 Communication Analysis")
        
        # Stakeholder selection
        stakeholder_options = {
            k: f"{v['icon']} {v['label']}" 
            for k, v in st.session_state.analyzer.stakeholder_types.items()
        }
        
        selected_stakeholder = st.selectbox(
            "Select Stakeholder Type:",
            options=list(stakeholder_options.keys()),
            format_func=lambda x: stakeholder_options[x],
            key="stakeholder_select"
        )
        
        # Text input
        communication_text = st.text_area(
            "Enter sales interaction notes or client communication:",
            height=200,
            placeholder="Example: Dr. Smith expressed concerns about the side effect profile but was impressed with the efficacy data from the Phase III trials. He mentioned he'd like to see more real-world evidence before prescribing to his diabetic patients.",
            key="comm_text"
        )
        
        # Analysis button
        col_btn1, col_btn2 = st.columns([1, 3])
        with col_btn1:
            analyze_btn = st.button("🔍 Analyze Sentiment", type="primary")
        
        # Sample texts
        with st.expander("📋 Sample Communications"):
            samples = {
                "Doctor - Mixed Sentiment": {
                    "text": "Dr. Smith expressed concerns about the side effect profile but was impressed with the efficacy data from the Phase III trials. He mentioned he'd like to see more real-world evidence before prescribing to his diabetic patients.",
                    "stakeholder": "doctor"
                },
                "Hospital - Positive": {
                    "text": "The hospital pharmacy committee is very interested in adding our medication to formulary, especially given the cost savings analysis we presented. They want to schedule a pilot program for Q2.",
                    "stakeholder": "hospital"
                },
                "Insurance - Negative": {
                    "text": "The insurance medical director rejected our formulary application citing insufficient cost-effectiveness data and concerns about budget impact. They want a full pharmacoeconomic analysis before reconsidering.",
                    "stakeholder": "insurance"
                }
            }
            
            for sample_name, sample_data in samples.items():
                if st.button(f"Load: {sample_name}", key=f"sample_{sample_name}"):
                    st.session_state.comm_text = sample_data["text"]
                    st.session_state.stakeholder_select = sample_data["stakeholder"]
                    st.rerun()
        
        # Perform analysis
        if analyze_btn and communication_text.strip():
            if not api_key or api_key == "your-anthropic-api-key-here":
                st.error("⚠️ Please enter your Anthropic API key in the sidebar")
            else:
                with st.spinner("🤖 Analyzing sentiment with Claude..."):
                    analysis = st.session_state.analyzer.analyze_sentiment(
                        communication_text, 
                        selected_stakeholder
                    )
                    
                    analysis['input_text'] = communication_text
                    st.session_state.analyses.append(analysis)
                    
                    st.success("✅ Analysis complete!")
                    st.rerun()
    
    with col2:
        st.header("📊 Analysis Results")
        
        if st.session_state.analyses:
            latest_analysis = st.session_state.analyses[-1]
            
            # Sentiment score display
            sentiment_score = latest_analysis.get('sentiment_score', 0)
            col_metric1, col_metric2 = st.columns(2)
            
            with col_metric1:
                st.metric(
                    "Sentiment Score", 
                    f"{sentiment_score:+.1f}",
                    delta=None
                )
            
            with col_metric2:
                st.metric(
                    "Confidence", 
                    latest_analysis.get('confidence_level', 'Unknown')
                )
            
            # Risk assessment
            risk_level = latest_analysis.get('risk_assessment', {}).get('risk_level', 'Unknown')
            risk_colors = {
                'Low': '🟢', 'Medium': '🟡', 'High': '🟠', 'Critical': '🔴'
            }
            st.markdown(f"**Risk Level:** {risk_colors.get(risk_level, '⚪')} {risk_level}")
            
        else:
            st.info("No analyses yet. Enter communication text and click 'Analyze Sentiment' to begin.")
    
    # Detailed results
    if st.session_state.analyses:
        st.header("📋 Detailed Analysis Results")
        
        # Analysis selection
        analysis_options = [
            f"Analysis {i+1} - {a['stakeholder_type'].title()} ({a['timestamp'][:16]})"
            for i, a in enumerate(reversed(st.session_state.analyses))
        ]
        
        selected_idx = st.selectbox(
            "Select Analysis to View:",
            range(len(analysis_options)),
            format_func=lambda x: analysis_options[x]
        )
        
        selected_analysis = st.session_state.analyses[-(selected_idx + 1)]
        
        # Display detailed analysis
        tab1, tab2, tab3, tab4 = st.tabs(["🎯 Key Insights", "📈 Recommendations", "⚠️ Risk Assessment", "🔍 Raw Data"])
        
        with tab1:
            col_a, col_b = st.columns(2)
            
            with col_a:
                st.subheader("Emotional Indicators")
                indicators = selected_analysis.get('key_emotional_indicators', [])
                for indicator in indicators:
                    st.write(f"• {indicator}")
            
            with col_b:
                st.subheader("Stakeholder Insights")
                insights = selected_analysis.get('stakeholder_specific_insights', {})
                for key, value in insights.items():
                    if isinstance(value, list):
                        st.write(f"**{key.replace('_', ' ').title()}:**")
                        for item in value:
                            st.write(f"  • {item}")
                    else:
                        st.write(f"**{key.replace('_', ' ').title()}:** {value}")
        
        with tab2:
            recommendations = selected_analysis.get('actionable_recommendations', [])
            st.subheader("Immediate Actions")
            for rec in recommendations:
                st.write(f"• {rec}")
            
            follow_up = selected_analysis.get('follow_up_strategy', {})
            for strategy_type, actions in follow_up.items():
                st.subheader(strategy_type.replace('_', ' ').title())
                if isinstance(actions, list):
                    for action in actions:
                        st.write(f"• {action}")
        
        with tab3:
            risk_info = selected_analysis.get('risk_assessment', {})
            
            col_risk1, col_risk2 = st.columns(2)
            with col_risk1:
                st.metric("Risk Level", risk_info.get('risk_level', 'Unknown'))
                st.write("**Escalation Needed:**", 
                        "Yes" if risk_info.get('escalation_recommended') else "No")
            
            with col_risk2:
                issues = risk_info.get('potential_issues', [])
                st.write("**Potential Issues:**")
                for issue in issues:
                    st.write(f"• {issue}")
        
        with tab4:
            st.json(selected_analysis)

if __name__ == "__main__":
    main()
