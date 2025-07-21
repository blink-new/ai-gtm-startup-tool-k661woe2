import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  AlertCircle, 
  Link2, 
  TrendingDown, 
  Users, 
  Target, 
  BarChart3,
  Zap,
  ArrowRight,
  Database,
  Brain,
  Rocket
} from 'lucide-react'

interface NoMVPConnectedProps {
  onConnectClick: () => void
}

const limitedFeatures = [
  {
    icon: TrendingDown,
    title: 'Limited Analytics',
    description: 'Cannot track real user metrics or conversion data',
    status: 'unavailable'
  },
  {
    icon: Users,
    title: 'Generic Insights',
    description: 'No personalized customer analysis or ICP generation',
    status: 'unavailable'
  },
  {
    icon: Target,
    title: 'Basic Strategy',
    description: 'Only generic go-to-market templates available',
    status: 'unavailable'
  },
  {
    icon: BarChart3,
    title: 'No Real Data',
    description: 'Cannot pull actual performance metrics or user behavior',
    status: 'unavailable'
  }
]

const availableAfterConnection = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Deep analysis of your business model, target market, and competitive landscape',
    color: 'text-blue-500'
  },
  {
    icon: Users,
    title: 'Customer Intelligence',
    description: 'Detailed ICP generation, user personas, and behavior insights',
    color: 'text-green-500'
  },
  {
    icon: Target,
    title: 'Personalized Strategy',
    description: 'Custom go-to-market plans based on your specific MVP and market',
    color: 'text-purple-500'
  },
  {
    icon: Rocket,
    title: 'Launch Optimization',
    description: 'Data-driven recommendations for pricing, positioning, and growth',
    color: 'text-orange-500'
  }
]

export function NoMVPConnected({ onConnectClick }: NoMVPConnectedProps) {
  return (
    <div className="space-y-6">
      {/* Main Alert */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                MVP Not Connected
              </h3>
              <p className="text-orange-700 mb-4">
                To unlock Launchbase's full potential as your go-to-market operating system, 
                you need to connect your MVP. Without this connection, we cannot provide 
                personalized insights, real data analysis, or tailored strategies.
              </p>
              <Button 
                onClick={onConnectClick}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Link2 className="w-4 h-4 mr-2" />
                Connect Your MVP Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Limitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-red-500" />
            <span>Current Limitations</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Without MVP connection, these features are limited or unavailable
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {limitedFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg bg-red-50">
                <feature.icon className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-red-900">{feature.title}</h4>
                    <Badge variant="destructive" className="text-xs">
                      Unavailable
                    </Badge>
                  </div>
                  <p className="text-sm text-red-700">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* What You'll Get After Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary" />
            <span>Unlock After Connection</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Connect your MVP to access these powerful features
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableAfterConnection.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg hover:shadow-md transition-shadow">
                <feature.icon className={`w-5 h-5 ${feature.color} mt-0.5`} />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connection Options Preview */}
      <Card>
        <CardHeader>
          <CardTitle>How to Connect</CardTitle>
          <p className="text-sm text-muted-foreground">
            Multiple ways to connect your MVP for comprehensive analysis
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Link2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Platform Integration</h3>
              <p className="text-sm text-muted-foreground">
                Connect directly from Replit, GitHub, Vercel, or other platforms
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Manual Input</h3>
              <p className="text-sm text-muted-foreground">
                Provide detailed information about your MVP manually
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">URL Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Let our AI analyze your live application automatically
              </p>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <Button 
              onClick={onConnectClick}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Start MVP Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}