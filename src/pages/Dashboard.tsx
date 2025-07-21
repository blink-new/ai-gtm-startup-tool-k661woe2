import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { 
  Users, 
  Mail, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Bot,
  Zap,
  Target,
  FileText,
  Scale,
  MessageSquare,
  Rocket
} from 'lucide-react'
import { blink } from '../lib/blink'
import { toast } from 'sonner'
import { NoMVPConnected } from '../components/NoMVPConnected'
import { MVPConnection } from '../components/MVPConnection'

const aiAgents = [
  {
    id: 'lex',
    name: 'Lex',
    role: 'Legal Agent',
    description: 'Handles TOS, privacy policies, and contracts',
    icon: Scale,
    status: 'active',
    lastAction: 'Generated privacy policy',
    color: 'bg-blue-500'
  },
  {
    id: 'maya',
    name: 'Maya',
    role: 'Marketing Agent',
    description: 'Creates copy, campaigns, and content',
    icon: FileText,
    status: 'active',
    lastAction: 'Optimized landing page copy',
    color: 'bg-purple-500'
  },
  {
    id: 'sam',
    name: 'Sam',
    role: 'Sales Agent',
    description: 'Manages outreach and prospecting',
    icon: Target,
    status: 'working',
    lastAction: 'Sent 25 cold emails',
    color: 'bg-green-500'
  },
  {
    id: 'alex',
    name: 'Alex',
    role: 'Analytics Agent',
    description: 'Tracks metrics and suggests optimizations',
    icon: TrendingUp,
    status: 'idle',
    lastAction: 'Weekly report generated',
    color: 'bg-orange-500'
  }
]

const quickActions = [
  { title: 'Generate ICP', description: 'Create ideal customer profile', icon: Users, action: 'icp' },
  { title: 'Competitor Analysis', description: 'Research your competition', icon: TrendingUp, action: 'competitors' },
  { title: 'Cold Outreach', description: 'Start prospecting campaign', icon: Mail, action: 'outreach' },
  { title: 'Landing Page Copy', description: 'Generate compelling copy', icon: FileText, action: 'copy' },
]

export function Dashboard() {
  const [user, setUser] = useState(null)
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    emailsSent: 0,
    responseRate: 0,
    conversionRate: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [suggestions, setSuggestions] = useState([])
  const [mvpConnections, setMvpConnections] = useState([])
  const [mvpAnalysis, setMvpAnalysis] = useState(null)
  const [showConnectionDialog, setShowConnectionDialog] = useState(false)
  const [showLaunchAssistant, setShowLaunchAssistant] = useState(false)

  const loadDashboardData = async () => {
    try {
      const currentUser = await blink.auth.me()
      setUser(currentUser)

      // Check for MVP connections
      const connections = await blink.db.mvpConnections.list({
        where: { userId: currentUser.id },
        orderBy: { createdAt: 'desc' }
      })
      setMvpConnections(connections)

      // Load MVP analysis if available
      if (connections.length > 0) {
        const analysis = await blink.db.mvpAnalysis.list({
          where: { userId: currentUser.id },
          orderBy: { createdAt: 'desc' },
          limit: 1
        })
        if (analysis.length > 0) {
          setMvpAnalysis(analysis[0])
        }
      }

      // Load user metrics (mock data for now, but would be real if MVP connected)
      setMetrics({
        totalLeads: connections.length > 0 ? 47 : 0,
        emailsSent: connections.length > 0 ? 156 : 0,
        responseRate: connections.length > 0 ? 12.5 : 0,
        conversionRate: connections.length > 0 ? 3.2 : 0
      })

      // Load recent activity from database
      const activities = await blink.db.agentActivities.list({
        where: { userId: currentUser.id },
        orderBy: { createdAt: 'desc' },
        limit: 4
      })
      
      if (activities.length > 0) {
        setRecentActivity(activities.map(activity => ({
          id: activity.id,
          agent: activity.agentName,
          action: activity.action,
          time: new Date(activity.createdAt).toLocaleString(),
          type: activity.action.toLowerCase().includes('email') ? 'outreach' : 
                activity.action.toLowerCase().includes('content') ? 'content' :
                activity.action.toLowerCase().includes('legal') ? 'legal' : 'analysis'
        })))
      } else {
        // Default activities if none exist
        setRecentActivity([
          { id: 1, agent: 'Sam', action: 'Ready to help with outreach', time: 'Just now', type: 'outreach' },
          { id: 2, agent: 'Maya', action: 'Ready to create content', time: 'Just now', type: 'content' },
          { id: 3, agent: 'Lex', action: 'Ready to handle legal tasks', time: 'Just now', type: 'legal' },
          { id: 4, agent: 'Alex', action: 'Ready to analyze data', time: 'Just now', type: 'analysis' },
        ])
      }

      // Load AI suggestions
      const userSuggestions = await blink.db.aiSuggestions.list({
        where: { userId: currentUser.id },
        orderBy: { createdAt: 'desc' },
        limit: 5
      })
      setSuggestions(userSuggestions)

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleConnectionComplete = (connectionId: string) => {
    setShowConnectionDialog(false)
    loadDashboardData() // Refresh data
    toast.success('MVP connected successfully! Analysis will begin shortly.')
  }

  const handleAnalysisComplete = (analysisId: string) => {
    loadDashboardData() // Refresh data to show analysis
    toast.success('MVP analysis completed! Check your insights.')
  }

  const handleLaunchAssistant = () => {
    if (mvpConnections.length === 0) {
      toast.error('Please connect your MVP first to use the Launch Assistant')
      setShowConnectionDialog(true)
      return
    }
    setShowLaunchAssistant(true)
  }

  const handleQuickAction = async (action: string) => {
    if (!user) {
      toast.error('Please sign in to use quick actions')
      return
    }

    try {
      let prompt = ''
      let title = ''
      let type = ''

      switch (action) {
        case 'icp':
          title = 'Ideal Customer Profile'
          type = 'icp'
          prompt = `Generate a comprehensive Ideal Customer Profile (ICP) for a SaaS startup. Include:
          - Demographics (age, job title, company size, industry)
          - Psychographics (pain points, goals, behavior, values)
          - Preferred channels and communication methods
          - Budget and decision-making process
          - Key characteristics that make them ideal customers`
          break
        case 'competitors':
          title = 'Competitor Analysis'
          type = 'competitors'
          prompt = `Conduct a comprehensive competitor analysis for a SaaS startup. Include:
          - Direct and indirect competitors
          - Pricing strategies and models
          - Key features and differentiators
          - Market positioning and messaging
          - Strengths and weaknesses
          - Market share and growth trends
          - Opportunities for differentiation`
          break
        case 'outreach':
          title = 'Cold Outreach Campaign'
          type = 'outreach'
          prompt = `Create a cold outreach campaign strategy for B2B SaaS. Include:
          - Target prospect criteria
          - Email templates (initial, follow-up sequence)
          - LinkedIn outreach messages
          - Personalization strategies
          - Timing and frequency recommendations
          - Success metrics to track`
          break
        case 'copy':
          title = 'Landing Page Copy'
          type = 'copy'
          prompt = `Generate high-converting landing page copy for a SaaS startup. Include:
          - Compelling headline and subheadline
          - Clear value proposition
          - Key benefits and features
          - Social proof elements
          - Strong call-to-action
          - FAQ section addressing common objections`
          break
      }

      toast.loading('AI is generating your content...')

      const { text } = await blink.ai.generateText({
        prompt,
        maxTokens: 800
      })

      // Save as AI suggestion
      const suggestionId = `suggestion_${Date.now()}`
      await blink.db.aiSuggestions.create({
        id: suggestionId,
        userId: user.id,
        type,
        title,
        description: `AI-generated ${title.toLowerCase()}`,
        content: text,
        status: 'pending',
        priority: 'high'
      })

      // Add to recent activity
      const activityId = `activity_${Date.now()}`
      await blink.db.agentActivities.create({
        id: activityId,
        userId: user.id,
        agentName: 'Maya',
        action: `Generated ${title}`,
        details: `Created comprehensive ${title.toLowerCase()} with actionable insights`,
        status: 'completed'
      })

      toast.dismiss()
      toast.success(`${title} generated successfully! Check your suggestions.`)

    } catch (error) {
      console.error('Error in quick action:', error)
      toast.dismiss()
      toast.error('Failed to generate content. Please try again.')
    }
  }

  const handleAgentChat = async (agentId: string) => {
    if (!user) {
      toast.error('Please sign in to chat with agents')
      return
    }

    const agent = aiAgents.find(a => a.id === agentId)
    if (!agent) return

    try {
      let prompt = ''
      let title = ''

      switch (agentId) {
        case 'lex':
          title = 'Legal Document Review'
          prompt = `As a legal AI agent, provide a comprehensive legal checklist for a SaaS startup launch. Include:
          - Terms of Service requirements
          - Privacy Policy essentials
          - GDPR compliance checklist
          - Business registration steps
          - Intellectual property protection
          - Liability considerations`
          break
        case 'maya':
          title = 'Marketing Strategy'
          prompt = `As a marketing AI agent, create a comprehensive marketing strategy for a SaaS startup. Include:
          - Brand positioning and messaging
          - Content marketing plan
          - Social media strategy
          - Email marketing campaigns
          - SEO and content optimization
          - Conversion optimization tactics`
          break
        case 'sam':
          title = 'Sales Outreach Plan'
          prompt = `As a sales AI agent, develop a comprehensive sales strategy for a SaaS startup. Include:
          - Lead generation tactics
          - Cold outreach templates
          - Sales funnel optimization
          - Prospect qualification criteria
          - Follow-up sequences
          - Closing techniques and objection handling`
          break
        case 'alex':
          title = 'Analytics Setup Guide'
          prompt = `As an analytics AI agent, provide a comprehensive analytics setup guide for a SaaS startup. Include:
          - Key metrics to track
          - Analytics tools setup
          - Conversion tracking implementation
          - Dashboard creation
          - Reporting automation
          - Performance optimization insights`
          break
      }

      toast.loading(`${agent.name} is preparing your strategy...`)

      const { text } = await blink.ai.generateText({
        prompt,
        maxTokens: 1000
      })

      // Save as AI suggestion
      const suggestionId = `suggestion_${Date.now()}`
      await blink.db.aiSuggestions.create({
        id: suggestionId,
        userId: user.id,
        type: agentId,
        title,
        description: `${agent.name} generated ${title.toLowerCase()}`,
        content: text,
        status: 'pending',
        priority: 'medium'
      })

      // Add to recent activity
      const activityId = `activity_${Date.now()}`
      await blink.db.agentActivities.create({
        id: activityId,
        userId: user.id,
        agentName: agent.name,
        action: `Generated ${title}`,
        details: `Created comprehensive ${title.toLowerCase()} with actionable recommendations`,
        status: 'completed'
      })

      // Refresh data
      loadDashboardData()

      toast.dismiss()
      toast.success(`${agent.name} has created your ${title}! Check your suggestions.`)

    } catch (error) {
      console.error('Error in agent chat:', error)
      toast.dismiss()
      toast.error(`Failed to get response from ${agent.name}. Please try again.`)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show MVP connection prompt if no MVP is connected
  if (!loading && mvpConnections.length === 0) {
    return (
      <div className="p-6">
        <NoMVPConnected onConnectClick={() => setShowConnectionDialog(true)} />
        
        {/* MVP Connection Dialog */}
        <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Connect Your MVP</DialogTitle>
            </DialogHeader>
            <MVPConnection 
              onConnectionComplete={handleConnectionComplete}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">
            {mvpAnalysis ? 'Your MVP analysis is complete! Here are your insights:' : 'Here\'s what your AI team has been working on'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {mvpConnections.length === 0 && (
            <Button 
              variant="outline"
              onClick={() => setShowConnectionDialog(true)}
            >
              <Rocket className="w-4 h-4 mr-2" />
              Connect MVP
            </Button>
          )}
          <Button 
            className="bg-gradient-to-r from-primary to-accent"
            onClick={handleLaunchAssistant}
          >
            <Zap className="w-4 h-4 mr-2" />
            Launch Assistant
          </Button>
        </div>
      </div>

      {/* MVP Analysis Summary */}
      {mvpAnalysis && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-primary" />
              <span>MVP Analysis Complete</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-sm mb-1">Business Model</h4>
                <p className="text-sm text-muted-foreground">{mvpAnalysis.businessModel || 'SaaS Platform'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Target Market</h4>
                <p className="text-sm text-muted-foreground">{mvpAnalysis.targetAudience || 'Small to medium businesses'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Market Category</h4>
                <p className="text-sm text-muted-foreground">{mvpAnalysis.marketCategory || 'B2B Software'}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Badge variant="default" className="bg-green-500">
                Analysis Confidence: {Math.round((mvpAnalysis.analysisConfidence || 0.85) * 100)}%
              </Badge>
              <Button variant="outline" size="sm">
                View Full Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.emailsSent}</div>
            <p className="text-xs text-muted-foreground">+25 today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseRate}%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">+0.5% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Agents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            Your AI Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiAgents.map((agent) => (
              <div key={agent.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 ${agent.color} rounded-lg flex items-center justify-center`}>
                    <agent.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{agent.role}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{agent.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant={agent.status === 'active' ? 'default' : agent.status === 'working' ? 'secondary' : 'outline'}>
                    {agent.status}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleAgentChat(agent.id)}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{agent.lastAction}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground">One-click tasks to accelerate your launch</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.action}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start space-y-2"
                onClick={() => handleQuickAction(action.action)}
              >
                <action.icon className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              AI Suggestions
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your AI team has generated these actionable recommendations
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.slice(0, 3).map((suggestion) => (
                <div key={suggestion.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{suggestion.title}</h3>
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                    </div>
                    <Badge variant={suggestion.priority === 'high' ? 'destructive' : suggestion.priority === 'medium' ? 'default' : 'secondary'}>
                      {suggestion.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <Badge variant="outline">{suggestion.status}</Badge>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          // Show suggestion content in a modal or navigate to detailed view
                          toast.info('Suggestion details: ' + suggestion.content.substring(0, 100) + '...')
                        }}
                      >
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          try {
                            await blink.db.aiSuggestions.update(suggestion.id, { status: 'completed' })
                            loadDashboardData()
                            toast.success('Suggestion marked as completed!')
                          } catch (error) {
                            toast.error('Failed to update suggestion')
                          }
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.agent}</span> {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Launch Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>MVP Development</span>
                  <span>85%</span>
                </div>
                <Progress value={85} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Market Research</span>
                  <span>70%</span>
                </div>
                <Progress value={70} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Content Creation</span>
                  <span>60%</span>
                </div>
                <Progress value={60} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Legal Setup</span>
                  <span>40%</span>
                </div>
                <Progress value={40} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MVP Connection Dialog */}
      <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Connect Your MVP</DialogTitle>
          </DialogHeader>
          <MVPConnection 
            onConnectionComplete={handleConnectionComplete}
            onAnalysisComplete={handleAnalysisComplete}
          />
        </DialogContent>
      </Dialog>

      {/* Launch Assistant Dialog */}
      <Dialog open={showLaunchAssistant} onOpenChange={setShowLaunchAssistant}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Rocket className="w-5 h-5" />
              <span>Launch Assistant</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Your AI-powered launch assistant is ready to help you take your MVP to market!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2">
                <Target className="w-6 h-6 text-blue-500" />
                <div className="text-left">
                  <h3 className="font-semibold">Launch Strategy</h3>
                  <p className="text-sm text-muted-foreground">Get a comprehensive launch plan</p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2">
                <Users className="w-6 h-6 text-green-500" />
                <div className="text-left">
                  <h3 className="font-semibold">Customer Acquisition</h3>
                  <p className="text-sm text-muted-foreground">Find and reach your first customers</p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2">
                <TrendingUp className="w-6 h-6 text-purple-500" />
                <div className="text-left">
                  <h3 className="font-semibold">Growth Tactics</h3>
                  <p className="text-sm text-muted-foreground">Scale your user base effectively</p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2">
                <FileText className="w-6 h-6 text-orange-500" />
                <div className="text-left">
                  <h3 className="font-semibold">Content & Copy</h3>
                  <p className="text-sm text-muted-foreground">Create compelling marketing materials</p>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}