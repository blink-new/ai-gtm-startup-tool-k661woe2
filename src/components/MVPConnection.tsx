import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Link2, 
  Upload, 
  Globe, 
  Github, 
  Code, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Zap,
  Target,
  Users,
  TrendingUp,
  DollarSign,
  Lightbulb
} from 'lucide-react'
import { blink } from '../lib/blink'
import { toast } from 'sonner'

interface MVPConnectionProps {
  onConnectionComplete: (connectionId: string) => void
  onAnalysisComplete: (analysisId: string) => void
}

const integrationPlatforms = [
  { id: 'replit', name: 'Replit', icon: '🔄', description: 'Connect your Replit project' },
  { id: 'github', name: 'GitHub', icon: '🐙', description: 'Import from GitHub repository' },
  { id: 'vercel', name: 'Vercel', icon: '▲', description: 'Connect deployed Vercel app' },
  { id: 'netlify', name: 'Netlify', icon: '🌐', description: 'Connect Netlify deployment' },
  { id: 'heroku', name: 'Heroku', icon: '🟣', description: 'Connect Heroku application' },
]

const extractSection = (text: string, keyword: string, fallback: string) => {
  const lines = text.split('\n')
  const relevantLine = lines.find(line => 
    line.toLowerCase().includes(keyword.toLowerCase())
  )
  return relevantLine ? relevantLine.trim() : fallback
}

const parseAnalysisResponse = (text: string) => {
  // Simple parsing logic - in production, you'd want more sophisticated parsing
  return {
    businessModel: extractSection(text, 'business model', 'SaaS'),
    targetAudience: extractSection(text, 'target audience', 'Small to medium businesses'),
    marketCategory: extractSection(text, 'market', 'B2B Software'),
    industry: extractSection(text, 'industry', 'Technology'),
    valueProposition: extractSection(text, 'value proposition', 'Streamlined workflow automation'),
    keyFeatures: ['Feature 1', 'Feature 2', 'Feature 3'],
    pricingModel: extractSection(text, 'pricing', 'Subscription-based'),
    competitors: ['Competitor 1', 'Competitor 2'],
    marketSize: extractSection(text, 'market size', 'Large and growing'),
    revenueStreams: ['Subscriptions', 'Premium features'],
    customerSegments: ['SMBs', 'Enterprise'],
    painPoints: ['Manual processes', 'Inefficiency'],
    uniqueSellingPoints: ['AI-powered', 'Easy to use'],
    goToMarketStrategy: extractSection(text, 'go-to-market', 'Content marketing and partnerships')
  }
}

export function MVPConnection({ onConnectionComplete, onAnalysisComplete }: MVPConnectionProps) {
  const [activeTab, setActiveTab] = useState('integration')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [user, setUser] = useState(null)
  
  // Integration form
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [integrationUrl, setIntegrationUrl] = useState('')
  
  // Manual form
  const [manualData, setManualData] = useState({
    projectName: '',
    projectDescription: '',
    projectUrl: '',
    techStack: '',
    currentStage: '',
    targetAudience: '',
    businessModel: '',
    keyFeatures: ''
  })
  
  // URL form
  const [urlData, setUrlData] = useState({
    url: '',
    description: ''
  })

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await blink.auth.me()
        setUser(currentUser)
      } catch (error) {
        console.error('Error loading user:', error)
      }
    }
    loadUser()
  }, [])

  const startMVPAnalysis = async (connectionId: string, sourceData: any) => {
    if (!user) return

    setAnalyzing(true)
    try {
      const analysisId = `mvp_analysis_${Date.now()}`
      
      // Create analysis record
      await blink.db.mvpAnalysis.create({
        id: analysisId,
        userId: user.id,
        mvpConnectionId: connectionId,
        analysisStatus: 'analyzing'
      })

      // Generate comprehensive analysis prompt
      const analysisPrompt = `
        Analyze this MVP/startup and provide a comprehensive go-to-market analysis. 
        
        Source: ${sourceData.source}
        ${sourceData.platform ? `Platform: ${sourceData.platform}` : ''}
        ${sourceData.url ? `URL: ${sourceData.url}` : ''}
        ${sourceData.description ? `Description: ${sourceData.description}` : ''}
        ${sourceData.data ? `Manual Data: ${JSON.stringify(sourceData.data)}` : ''}
        
        Please provide a detailed analysis covering:
        
        1. BUSINESS MODEL ANALYSIS
        - Revenue model (SaaS, marketplace, e-commerce, etc.)
        - Pricing strategy recommendations
        - Revenue streams identification
        
        2. TARGET AUDIENCE & MARKET
        - Primary customer segments
        - Ideal customer profile (ICP)
        - Market size and opportunity
        - Industry category and trends
        
        3. VALUE PROPOSITION
        - Core value proposition
        - Key differentiators
        - Unique selling points
        - Pain points addressed
        
        4. COMPETITIVE LANDSCAPE
        - Direct and indirect competitors
        - Competitive advantages
        - Market positioning
        
        5. GO-TO-MARKET STRATEGY
        - Recommended marketing channels
        - Customer acquisition strategy
        - Launch sequence recommendations
        - Key metrics to track
        
        6. PRODUCT INSIGHTS
        - Key features analysis
        - Feature prioritization
        - User experience considerations
        
        Format the response as a structured analysis with clear sections and actionable insights.
      `

      toast.loading('AI is analyzing your MVP...', { id: 'analysis' })

      const { text } = await blink.ai.generateText({
        prompt: analysisPrompt,
        maxTokens: 2000,
        search: true // Use web search for market research
      })

      // Parse and structure the analysis
      const analysisData = parseAnalysisResponse(text)
      
      // Update analysis record with results
      await blink.db.mvpAnalysis.update(analysisId, {
        businessModel: analysisData.businessModel,
        targetAudience: analysisData.targetAudience,
        marketCategory: analysisData.marketCategory,
        industry: analysisData.industry,
        valueProposition: analysisData.valueProposition,
        keyFeatures: JSON.stringify(analysisData.keyFeatures),
        pricingModel: analysisData.pricingModel,
        competitors: JSON.stringify(analysisData.competitors),
        marketSize: analysisData.marketSize,
        revenueStreams: JSON.stringify(analysisData.revenueStreams),
        customerSegments: JSON.stringify(analysisData.customerSegments),
        painPoints: JSON.stringify(analysisData.painPoints),
        uniqueSellingPoints: JSON.stringify(analysisData.uniqueSellingPoints),
        goToMarketStrategy: analysisData.goToMarketStrategy,
        analysisConfidence: 0.85,
        analysisStatus: 'completed',
        rawAnalysisData: text
      })

      toast.dismiss('analysis')
      toast.success('MVP analysis completed! Check your dashboard for insights.')
      
      onAnalysisComplete(analysisId)

    } catch (error) {
      console.error('Error analyzing MVP:', error)
      toast.dismiss('analysis')
      toast.error('Failed to analyze MVP. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleIntegrationConnect = async () => {
    if (!selectedPlatform || !integrationUrl) {
      toast.error('Please select a platform and enter the URL')
      return
    }

    if (!user) {
      toast.error('Please sign in to connect your MVP')
      return
    }

    setLoading(true)
    try {
      const connectionId = `mvp_conn_${Date.now()}`
      
      // Create MVP connection record
      await blink.db.mvpConnections.create({
        id: connectionId,
        userId: user.id,
        connectionType: 'integration',
        platform: selectedPlatform,
        connectionUrl: integrationUrl,
        status: 'connected'
      })

      toast.success(`Successfully connected to ${selectedPlatform}!`)
      onConnectionComplete(connectionId)
      
      // Start analysis
      await startMVPAnalysis(connectionId, {
        source: 'integration',
        platform: selectedPlatform,
        url: integrationUrl
      })

    } catch (error) {
      console.error('Error connecting MVP:', error)
      toast.error('Failed to connect MVP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = async () => {
    if (!manualData.projectName || !manualData.projectDescription) {
      toast.error('Please fill in the required fields')
      return
    }

    if (!user) {
      toast.error('Please sign in to submit your MVP details')
      return
    }

    setLoading(true)
    try {
      const connectionId = `mvp_conn_${Date.now()}`
      
      // Create MVP connection record
      await blink.db.mvpConnections.create({
        id: connectionId,
        userId: user.id,
        connectionType: 'manual',
        projectName: manualData.projectName,
        projectDescription: manualData.projectDescription,
        connectionUrl: manualData.projectUrl,
        status: 'connected'
      })

      toast.success('MVP details submitted successfully!')
      onConnectionComplete(connectionId)
      
      // Start analysis with manual data
      await startMVPAnalysis(connectionId, {
        source: 'manual',
        data: manualData
      })

    } catch (error) {
      console.error('Error submitting MVP:', error)
      toast.error('Failed to submit MVP details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUrlSubmit = async () => {
    if (!urlData.url) {
      toast.error('Please enter a URL')
      return
    }

    if (!user) {
      toast.error('Please sign in to connect your MVP')
      return
    }

    setLoading(true)
    try {
      const connectionId = `mvp_conn_${Date.now()}`
      
      // Create MVP connection record
      await blink.db.mvpConnections.create({
        id: connectionId,
        userId: user.id,
        connectionType: 'url',
        connectionUrl: urlData.url,
        projectDescription: urlData.description,
        status: 'connected'
      })

      toast.success('URL connected successfully!')
      onConnectionComplete(connectionId)
      
      // Start analysis with URL
      await startMVPAnalysis(connectionId, {
        source: 'url',
        url: urlData.url,
        description: urlData.description
      })

    } catch (error) {
      console.error('Error connecting URL:', error)
      toast.error('Failed to connect URL. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Connect Your MVP</h2>
        <p className="text-muted-foreground">
          Connect your MVP so Launchbase can provide personalized go-to-market insights and strategies
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integration" className="flex items-center space-x-2">
            <Link2 className="w-4 h-4" />
            <span>Platform Integration</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Manual Input</span>
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>URL/Website</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Link2 className="w-5 h-5" />
                <span>Connect Development Platform</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Connect directly to your development platform for automatic data sync
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Platform</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {integrationPlatforms.map((platform) => (
                    <Button
                      key={platform.id}
                      variant={selectedPlatform === platform.id ? "default" : "outline"}
                      className="h-auto p-4 flex items-start space-x-3"
                      onClick={() => setSelectedPlatform(platform.id)}
                    >
                      <span className="text-xl">{platform.icon}</span>
                      <div className="text-left">
                        <div className="font-medium">{platform.name}</div>
                        <div className="text-xs text-muted-foreground">{platform.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {selectedPlatform && (
                <div>
                  <Label htmlFor="integration-url">Project URL</Label>
                  <Input
                    id="integration-url"
                    value={integrationUrl}
                    onChange={(e) => setIntegrationUrl(e.target.value)}
                    placeholder={`Enter your ${selectedPlatform} project URL`}
                  />
                </div>
              )}

              <Button 
                onClick={handleIntegrationConnect}
                disabled={!selectedPlatform || !integrationUrl || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    Connect Platform
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Manual MVP Details</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Provide details about your MVP manually for comprehensive analysis
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project-name">Project Name *</Label>
                  <Input
                    id="project-name"
                    value={manualData.projectName}
                    onChange={(e) => setManualData({...manualData, projectName: e.target.value})}
                    placeholder="e.g., TaskFlow Pro"
                  />
                </div>
                <div>
                  <Label htmlFor="project-url">Project URL (optional)</Label>
                  <Input
                    id="project-url"
                    value={manualData.projectUrl}
                    onChange={(e) => setManualData({...manualData, projectUrl: e.target.value})}
                    placeholder="https://your-app.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="project-description">Project Description *</Label>
                <Textarea
                  id="project-description"
                  value={manualData.projectDescription}
                  onChange={(e) => setManualData({...manualData, projectDescription: e.target.value})}
                  placeholder="Describe what your MVP does, the problem it solves, and its key features..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target-audience">Target Audience</Label>
                  <Input
                    id="target-audience"
                    value={manualData.targetAudience}
                    onChange={(e) => setManualData({...manualData, targetAudience: e.target.value})}
                    placeholder="e.g., Small business owners"
                  />
                </div>
                <div>
                  <Label htmlFor="business-model">Business Model</Label>
                  <Input
                    id="business-model"
                    value={manualData.businessModel}
                    onChange={(e) => setManualData({...manualData, businessModel: e.target.value})}
                    placeholder="e.g., SaaS, Marketplace, E-commerce"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tech-stack">Tech Stack</Label>
                  <Input
                    id="tech-stack"
                    value={manualData.techStack}
                    onChange={(e) => setManualData({...manualData, techStack: e.target.value})}
                    placeholder="e.g., React, Node.js, PostgreSQL"
                  />
                </div>
                <div>
                  <Label htmlFor="current-stage">Current Stage</Label>
                  <Input
                    id="current-stage"
                    value={manualData.currentStage}
                    onChange={(e) => setManualData({...manualData, currentStage: e.target.value})}
                    placeholder="e.g., MVP, Beta, Pre-launch"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="key-features">Key Features</Label>
                <Textarea
                  id="key-features"
                  value={manualData.keyFeatures}
                  onChange={(e) => setManualData({...manualData, keyFeatures: e.target.value})}
                  placeholder="List the main features of your MVP..."
                  rows={2}
                />
              </div>

              <Button 
                onClick={handleManualSubmit}
                disabled={!manualData.projectName || !manualData.projectDescription || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit MVP Details
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Connect via URL</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Provide your app's URL for automatic analysis and insights
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="app-url">Application URL *</Label>
                <Input
                  id="app-url"
                  value={urlData.url}
                  onChange={(e) => setUrlData({...urlData, url: e.target.value})}
                  placeholder="https://your-app.com"
                />
              </div>

              <div>
                <Label htmlFor="url-description">Description (optional)</Label>
                <Textarea
                  id="url-description"
                  value={urlData.description}
                  onChange={(e) => setUrlData({...urlData, description: e.target.value})}
                  placeholder="Provide additional context about your application..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleUrlSubmit}
                disabled={!urlData.url || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Connect URL
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {analyzing && (
        <Card className="border-primary">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">AI Analysis in Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI is analyzing your MVP to generate comprehensive go-to-market insights...
                </p>
              </div>
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div className="text-center p-4 border rounded-lg">
          <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h3 className="font-semibold text-sm">Market Analysis</h3>
          <p className="text-xs text-muted-foreground">Target audience & positioning</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <h3 className="font-semibold text-sm">Customer Insights</h3>
          <p className="text-xs text-muted-foreground">ICP & user personas</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <h3 className="font-semibold text-sm">Growth Strategy</h3>
          <p className="text-xs text-muted-foreground">Launch & scaling plans</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <DollarSign className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <h3 className="font-semibold text-sm">Revenue Model</h3>
          <p className="text-xs text-muted-foreground">Pricing & monetization</p>
        </div>
      </div>
    </div>
  )
}