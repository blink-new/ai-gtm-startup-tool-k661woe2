import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  Target, 
  Users, 
  TrendingUp, 
  DollarSign, 
  MessageSquare,
  Lightbulb,
  Zap,
  CheckCircle
} from 'lucide-react'
import { blink } from '../lib/blink'
import { toast } from 'sonner'

const strategySteps = [
  {
    id: 'icp',
    title: 'Ideal Customer Profile',
    description: 'Define who your perfect customer is',
    icon: Users,
    status: 'completed',
    aiGenerated: true
  },
  {
    id: 'positioning',
    title: 'Market Positioning',
    description: 'How you differentiate from competitors',
    icon: Target,
    status: 'in-progress',
    aiGenerated: true
  },
  {
    id: 'pricing',
    title: 'Pricing Strategy',
    description: 'Optimal pricing for your market',
    icon: DollarSign,
    status: 'pending',
    aiGenerated: false
  },
  {
    id: 'channels',
    title: 'Go-to-Market Channels',
    description: 'Where to find and reach customers',
    icon: TrendingUp,
    status: 'pending',
    aiGenerated: false
  }
]

const icpData = {
  demographics: {
    title: 'Demographics',
    data: [
      { label: 'Age Range', value: '28-45' },
      { label: 'Job Title', value: 'Product Manager, Founder, Marketing Director' },
      { label: 'Company Size', value: '10-100 employees' },
      { label: 'Industry', value: 'SaaS, Tech Startups, Digital Agencies' }
    ]
  },
  psychographics: {
    title: 'Psychographics',
    data: [
      { label: 'Pain Points', value: 'Overwhelmed by manual processes, lacks technical expertise' },
      { label: 'Goals', value: 'Launch faster, reduce costs, automate workflows' },
      { label: 'Behavior', value: 'Active on LinkedIn, reads tech blogs, attends webinars' },
      { label: 'Values', value: 'Efficiency, innovation, data-driven decisions' }
    ]
  },
  channels: {
    title: 'Preferred Channels',
    data: [
      { label: 'Primary', value: 'LinkedIn, Email' },
      { label: 'Secondary', value: 'Twitter, Product Hunt' },
      { label: 'Content', value: 'Case studies, How-to guides' },
      { label: 'Events', value: 'SaaS conferences, Startup meetups' }
    ]
  }
}

export function StrategyBuilder() {
  const [activeTab, setActiveTab] = useState('overview')
  const [generatingStrategy, setGeneratingStrategy] = useState(false)
  const [user, setUser] = useState(null)
  const [strategies, setStrategies] = useState({})

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await blink.auth.me()
        setUser(currentUser)
        
        // Load existing strategies
        const userStrategies = await blink.db.aiSuggestions.list({
          where: { 
            userId: currentUser.id,
            type: { in: ['icp', 'positioning', 'pricing', 'channels'] }
          }
        })
        
        const strategiesMap = {}
        userStrategies.forEach(strategy => {
          strategiesMap[strategy.type] = strategy
        })
        setStrategies(strategiesMap)
        
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
    
    loadUserData()
  }, [])

  const handleGenerateStrategy = async (stepId: string) => {
    if (!user) {
      toast.error('Please sign in to generate strategies')
      return
    }
    
    setGeneratingStrategy(true)
    
    try {
      let prompt = ''
      let title = ''
      
      switch (stepId) {
        case 'icp':
          title = 'Ideal Customer Profile Strategy'
          prompt = `Generate a comprehensive Ideal Customer Profile (ICP) strategy for a SaaS startup. Include:
          - Detailed demographics and firmographics
          - Psychographic profiles and pain points
          - Buying behavior and decision-making process
          - Communication preferences and channels
          - Budget considerations and pricing sensitivity
          - Success metrics and KPIs for ICP validation`
          break
        case 'positioning':
          title = 'Market Positioning Strategy'
          prompt = `Create a comprehensive market positioning strategy for a SaaS startup. Include:
          - Unique value proposition development
          - Competitive differentiation analysis
          - Brand messaging framework
          - Target market segmentation
          - Positioning statement and taglines
          - Brand personality and voice guidelines`
          break
        case 'pricing':
          title = 'Pricing Strategy Framework'
          prompt = `Develop a comprehensive pricing strategy for a SaaS startup. Include:
          - Pricing model recommendations (freemium, tiered, usage-based)
          - Competitive pricing analysis
          - Value-based pricing methodology
          - Price testing and optimization strategies
          - Packaging and feature bundling
          - Pricing psychology and anchoring techniques`
          break
        case 'channels':
          title = 'Go-to-Market Channels Strategy'
          prompt = `Create a comprehensive go-to-market channels strategy for a SaaS startup. Include:
          - Channel mix optimization
          - Digital marketing channels (SEO, PPC, social media)
          - Content marketing and thought leadership
          - Partnership and referral programs
          - Sales channel development
          - Channel performance measurement and optimization`
          break
      }
      
      toast.loading('Generating comprehensive strategy...')
      
      const { text } = await blink.ai.generateText({
        prompt,
        maxTokens: 1000
      })
      
      // Save strategy to database
      const strategyId = `strategy_${stepId}_${Date.now()}`
      await blink.db.aiSuggestions.create({
        id: strategyId,
        userId: user.id,
        type: stepId,
        title,
        description: `AI-generated ${title.toLowerCase()}`,
        content: text,
        status: 'completed',
        priority: 'high'
      })
      
      // Update local state
      setStrategies(prev => ({
        ...prev,
        [stepId]: {
          id: strategyId,
          type: stepId,
          title,
          content: text,
          status: 'completed'
        }
      }))
      
      toast.dismiss()
      toast.success(`${title} generated successfully!`)
      
    } catch (error) {
      console.error('Error generating strategy:', error)
      toast.dismiss()
      toast.error('Failed to generate strategy. Please try again.')
    } finally {
      setGeneratingStrategy(false)
    }
  }

  const handleGenerateFullStrategy = async () => {
    if (!user) {
      toast.error('Please sign in to generate full strategy')
      return
    }

    try {
      toast.loading('Generating comprehensive GTM strategy...')
      
      // Generate all strategies in sequence
      for (const step of strategySteps) {
        if (!strategies[step.id]) {
          await handleGenerateStrategy(step.id)
          // Small delay between generations
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      toast.dismiss()
      toast.success('Complete GTM strategy generated successfully!')
      
    } catch (error) {
      console.error('Error generating full strategy:', error)
      toast.dismiss()
      toast.error('Failed to generate full strategy. Please try again.')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Strategy Builder</h1>
          <p className="text-muted-foreground">AI-powered go-to-market strategy development</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-primary to-accent"
          onClick={handleGenerateFullStrategy}
          disabled={generatingStrategy}
        >
          <Zap className="w-4 h-4 mr-2" />
          Generate Full Strategy
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="icp">Customer Profile</TabsTrigger>
          <TabsTrigger value="positioning">Positioning</TabsTrigger>
          <TabsTrigger value="execution">Execution Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Strategy Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Strategy Development Progress</CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete each step to build your comprehensive GTM strategy
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategySteps.map((step) => (
                  <div key={step.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          strategies[step.id] ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {strategies[step.id] ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <step.icon className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      {step.aiGenerated && (
                        <Badge variant="secondary" className="text-xs">
                          <Lightbulb className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant={strategies[step.id] ? 'default' : 'outline'}>
                        {strategies[step.id] ? 'completed' : 'pending'}
                      </Badge>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleGenerateStrategy(step.id)}
                        disabled={generatingStrategy}
                      >
                        {strategies[step.id] ? 'Regenerate' : 'Generate'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">$2.4B</div>
                <p className="text-sm text-muted-foreground">Total Addressable Market</p>
                <div className="mt-4">
                  <div className="text-sm font-medium">Growth Rate: +15% YoY</div>
                  <div className="text-xs text-muted-foreground">Based on industry analysis</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Competition Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">Medium</div>
                <p className="text-sm text-muted-foreground">12 direct competitors</p>
                <div className="mt-4">
                  <div className="text-sm font-medium">Opportunity Score: 7.2/10</div>
                  <div className="text-xs text-muted-foreground">Good market entry potential</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recommended Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">$49/mo</div>
                <p className="text-sm text-muted-foreground">Optimal starting price</p>
                <div className="mt-4">
                  <div className="text-sm font-medium">Price Range: $29-$99</div>
                  <div className="text-xs text-muted-foreground">Based on competitor analysis</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="icp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Ideal Customer Profile
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-generated profile based on your product and market analysis
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(icpData).map(([key, section]) => (
                  <div key={key}>
                    <h3 className="font-semibold mb-4">{section.title}</h3>
                    <div className="space-y-3">
                      {section.data.map((item, index) => (
                        <div key={index} className="border-l-2 border-primary pl-3">
                          <div className="text-sm font-medium">{item.label}</div>
                          <div className="text-sm text-muted-foreground">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Key Insight</h4>
                <p className="text-sm text-muted-foreground">
                  Your ideal customers are tech-savvy professionals who value efficiency and are willing to pay for tools that save time. 
                  Focus on demonstrating ROI and time savings in your messaging.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positioning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Market Positioning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Unique Value Proposition</h3>
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-lg font-medium">
                      "The only AI-powered platform that takes non-technical founders from MVP to profitable launch in 30 days"
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Key Differentiators</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span className="text-sm">AI agents handle complex tasks automatically</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span className="text-sm">Integrates with popular no-code platforms</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span className="text-sm">End-to-end launch management</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span className="text-sm">Built specifically for solo founders</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Competitive Advantages</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start space-x-2">
                        <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5" />
                        <span className="text-sm">50% faster time to market</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <DollarSign className="w-4 h-4 text-green-500 mt-0.5" />
                        <span className="text-sm">90% lower launch costs</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Users className="w-4 h-4 text-purple-500 mt-0.5" />
                        <span className="text-sm">No technical team required</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Lightbulb className="w-4 h-4 text-orange-500 mt-0.5" />
                        <span className="text-sm">AI-powered insights and optimization</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="execution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>30-Day Launch Plan</CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-generated execution roadmap tailored to your goals
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    week: 'Week 1',
                    title: 'Foundation & Research',
                    tasks: [
                      'Complete ICP validation',
                      'Finalize MVP features',
                      'Set up analytics tracking',
                      'Create brand assets'
                    ]
                  },
                  {
                    week: 'Week 2',
                    title: 'Content & Legal',
                    tasks: [
                      'Generate landing page copy',
                      'Create email sequences',
                      'Set up legal documents',
                      'Build prospect database'
                    ]
                  },
                  {
                    week: 'Week 3',
                    title: 'Outreach & Testing',
                    tasks: [
                      'Launch cold email campaigns',
                      'A/B test messaging',
                      'Gather user feedback',
                      'Optimize conversion funnel'
                    ]
                  },
                  {
                    week: 'Week 4',
                    title: 'Launch & Scale',
                    tasks: [
                      'Public launch preparation',
                      'Press and media outreach',
                      'Community engagement',
                      'Monitor and optimize metrics'
                    ]
                  }
                ].map((phase, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{phase.week}: {phase.title}</h3>
                      <Badge variant="outline">{phase.tasks.length} tasks</Badge>
                    </div>
                    <ul className="space-y-2">
                      {phase.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}