import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Switch } from '../components/ui/switch'
import { 
  Settings, 
  Zap, 
  Code, 
  Database,
  Mail,
  CreditCard,
  BarChart3,
  Users,
  FileText,
  Globe,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'

const integrationCategories = [
  {
    id: 'development',
    title: 'Development Platforms',
    description: 'Connect your no-code and AI coding tools',
    icon: Code,
    integrations: [
      { 
        id: 'replit', 
        name: 'Replit', 
        description: 'Connect your deployed Replit apps for GTM tracking',
        status: 'featured',
        logo: '🔄'
      },
      { 
        id: 'cursor', 
        name: 'Cursor.sh', 
        description: 'AI-powered code editor integration',
        status: 'available',
        logo: '⚡'
      },
      { 
        id: 'solar', 
        name: 'Solar.dev', 
        description: 'Solar development platform sync',
        status: 'available',
        logo: '☀️'
      },
      { 
        id: 'lovable', 
        name: 'Lovable.so', 
        description: 'Connect your Lovable projects',
        status: 'available',
        logo: '💜'
      }
    ]
  },
  {
    id: 'productivity',
    title: 'Productivity Tools',
    description: 'Streamline your workflow with these tools',
    icon: Settings,
    integrations: [
      { 
        id: 'notion', 
        name: 'Notion', 
        description: 'Sync tasks and documentation',
        status: 'available',
        logo: '📝'
      },
      { 
        id: 'airtable', 
        name: 'Airtable', 
        description: 'Database and CRM integration',
        status: 'available',
        logo: '🗃️'
      },
      { 
        id: 'zapier', 
        name: 'Zapier', 
        description: 'Automate workflows between apps',
        status: 'available',
        logo: '⚡'
      }
    ]
  },
  {
    id: 'payments',
    title: 'Payments & Billing',
    description: 'Handle payments and subscriptions',
    icon: CreditCard,
    integrations: [
      { 
        id: 'stripe', 
        name: 'Stripe', 
        description: 'Accept payments and manage subscriptions',
        status: 'available',
        logo: '💳'
      },
      { 
        id: 'paypal', 
        name: 'PayPal', 
        description: 'Alternative payment processing',
        status: 'available',
        logo: '🅿️'
      }
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing & Analytics',
    description: 'Track and optimize your marketing efforts',
    icon: BarChart3,
    integrations: [
      { 
        id: 'google-analytics', 
        name: 'Google Analytics', 
        description: 'Website traffic and user behavior',
        status: 'available',
        logo: '📊'
      },
      { 
        id: 'mailchimp', 
        name: 'Mailchimp', 
        description: 'Email marketing automation',
        status: 'available',
        logo: '📧'
      },
      { 
        id: 'hubspot', 
        name: 'HubSpot', 
        description: 'CRM and marketing automation',
        status: 'available',
        logo: '🎯'
      }
    ]
  }
]

export function Integrations() {
  const [activeCategory, setActiveCategory] = useState('development')

  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>(() => {
    const stored = localStorage.getItem('connected_integrations')
    return stored ? JSON.parse(stored) : []
  })
  
  const [connectingIntegrations, setConnectingIntegrations] = useState<string[]>([])

  const handleConnect = (integrationId: string) => {
    // Find the integration details
    const integration = integrationCategories
      .flatMap(cat => cat.integrations)
      .find(int => int.id === integrationId)
    
    if (!integration) return
    
    // Add to connecting state
    setConnectingIntegrations(prev => [...prev, integrationId])
    toast.loading(`Connecting to ${integration.name}...`, { id: integrationId })
    
    // Simulate connection process with delay
    setTimeout(() => {
      const newConnected = [...connectedIntegrations, integrationId]
      setConnectedIntegrations(newConnected)
      localStorage.setItem('connected_integrations', JSON.stringify(newConnected))
      
      // Remove from connecting state
      setConnectingIntegrations(prev => prev.filter(id => id !== integrationId))
      
      // Show success message
      toast.success(`Successfully connected to ${integration.name}!`, { id: integrationId })
    }, 2000) // 2 second delay to simulate connection
  }

  const handleDisconnect = (integrationId: string) => {
    // Find the integration details
    const integration = integrationCategories
      .flatMap(cat => cat.integrations)
      .find(int => int.id === integrationId)
    
    // Remove from connected integrations
    const newConnected = connectedIntegrations.filter(id => id !== integrationId)
    setConnectedIntegrations(newConnected)
    localStorage.setItem('connected_integrations', JSON.stringify(newConnected))
    
    // Show success message
    toast.success(`Disconnected from ${integration?.name || integrationId}`)
  }

  const getConnectedCount = () => {
    return integrationCategories.reduce((total, category) => 
      total + category.integrations.filter(integration => connectedIntegrations.includes(integration.id)).length, 0
    )
  }

  const getTotalCount = () => {
    return integrationCategories.reduce((total, category) => 
      total + category.integrations.length, 0
    )
  }

  const getConnectedCountForCategory = (categoryId: string) => {
    const category = integrationCategories.find(c => c.id === categoryId)
    return category ? category.integrations.filter(integration => connectedIntegrations.includes(integration.id)).length : 0
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">Connect your favorite tools to supercharge your launch</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{getConnectedCount()}/{getTotalCount()}</div>
          <p className="text-sm text-muted-foreground">Connected</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Development</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getConnectedCountForCategory('development')}
            </div>
            <p className="text-xs text-muted-foreground">
              of {integrationCategories.find(c => c.id === 'development')?.integrations.length} connected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getConnectedCountForCategory('productivity')}
            </div>
            <p className="text-xs text-muted-foreground">
              of {integrationCategories.find(c => c.id === 'productivity')?.integrations.length} connected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getConnectedCountForCategory('payments')}
            </div>
            <p className="text-xs text-muted-foreground">
              of {integrationCategories.find(c => c.id === 'payments')?.integrations.length} connected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marketing</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getConnectedCountForCategory('marketing')}
            </div>
            <p className="text-xs text-muted-foreground">
              of {integrationCategories.find(c => c.id === 'marketing')?.integrations.length} connected
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {integrationCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "ghost"}
                  className="w-full justify-start h-auto p-3"
                  onClick={() => setActiveCategory(category.id)}
                >
                  <category.icon className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{category.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {getConnectedCountForCategory(category.id)} connected
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integrations List */}
        <div className="lg:col-span-3">
          {integrationCategories
            .filter(category => category.id === activeCategory)
            .map(category => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <category.icon className="w-6 h-6" />
                    <div>
                      <CardTitle>{category.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.integrations.map((integration) => {
                      const isConnected = connectedIntegrations.includes(integration.id)
                      const isConnecting = connectingIntegrations.includes(integration.id)
                      return (
                        <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">{integration.logo}</div>
                            <div>
                              <h3 className="font-semibold">{integration.name}</h3>
                              <p className="text-sm text-muted-foreground">{integration.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {isConnected ? (
                              <>
                                <Badge variant="default" className="flex items-center space-x-1">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Connected</span>
                                </Badge>
                                <Switch checked={true} />
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDisconnect(integration.id)}
                                >
                                  Disconnect
                                </Button>
                              </>
                            ) : isConnecting ? (
                              <>
                                <Badge variant="outline" className="flex items-center space-x-1">
                                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                                  <span>Connecting</span>
                                </Badge>
                                <Button 
                                  disabled
                                  className="bg-primary/50"
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                                    <span>Connecting...</span>
                                  </div>
                                </Button>
                              </>
                            ) : (
                              <>
                                <Badge variant={integration.status === 'featured' ? 'default' : 'outline'}>
                                  {integration.status === 'featured' ? 'Featured' : 'Available'}
                                </Badge>
                                {integration.id === 'replit' ? (
                                  <Button asChild className="bg-primary hover:bg-primary/90">
                                    <Link to="/integrations/replit">
                                      Connect
                                    </Link>
                                  </Button>
                                ) : (
                                  <Button 
                                    onClick={() => handleConnect(integration.id)}
                                    className="bg-primary hover:bg-primary/90"
                                  >
                                    Connect
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Integration Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Why Connect Your Tools?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Automated Workflows</h3>
              <p className="text-sm text-muted-foreground">
                Sync data automatically between your tools and eliminate manual work
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Better Insights</h3>
              <p className="text-sm text-muted-foreground">
                Get comprehensive analytics by connecting all your data sources
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Unified Experience</h3>
              <p className="text-sm text-muted-foreground">
                Manage everything from one dashboard without switching between tools
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}