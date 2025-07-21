import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { 
  TrendingUp, 
  Users, 
  Mail, 
  MousePointer,
  DollarSign,
  Target,
  BarChart3,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

const metrics = [
  {
    title: 'Total Visitors',
    value: '2,847',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    title: 'Conversion Rate',
    value: '3.2%',
    change: '+0.8%',
    trend: 'up',
    icon: Target,
    color: 'text-green-600'
  },
  {
    title: 'Email Signups',
    value: '156',
    change: '+23.1%',
    trend: 'up',
    icon: Mail,
    color: 'text-purple-600'
  },
  {
    title: 'Revenue',
    value: '$1,247',
    change: '-5.2%',
    trend: 'down',
    icon: DollarSign,
    color: 'text-orange-600'
  }
]

const trafficSources = [
  { source: 'Direct', visitors: 1247, percentage: 44 },
  { source: 'Social Media', visitors: 856, percentage: 30 },
  { source: 'Email', visitors: 423, percentage: 15 },
  { source: 'Referral', visitors: 321, percentage: 11 }
]

const topPages = [
  { page: '/landing', views: 1847, bounceRate: '32%' },
  { page: '/pricing', views: 923, bounceRate: '28%' },
  { page: '/features', views: 756, bounceRate: '45%' },
  { page: '/about', views: 432, bounceRate: '52%' }
]

export function Analytics() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your launch progress and optimize performance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Export Report</Button>
          <Button className="bg-gradient-to-r from-primary to-accent">
            <BarChart3 className="w-4 h-4 mr-2" />
            Alex AI Insights
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                {metric.trend === 'up' ? (
                  <ArrowUp className="w-3 h-3 text-green-500" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-red-500" />
                )}
                <span className={metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {metric.change}
                </span>
                <span className="text-muted-foreground">from last week</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <p className="text-sm text-muted-foreground">Where your visitors are coming from</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trafficSources.map((source) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="font-medium">{source.source}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-muted-foreground">{source.visitors}</span>
                    <Badge variant="outline">{source.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <p className="text-sm text-muted-foreground">Most visited pages</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPages.map((page) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{page.page}</div>
                    <div className="text-sm text-muted-foreground">{page.views} views</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Bounce Rate</div>
                    <div className="text-sm text-muted-foreground">{page.bounceRate}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            AI Insights & Recommendations
          </CardTitle>
          <p className="text-sm text-muted-foreground">Alex AI has analyzed your data and found these opportunities</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-green-900">Opportunity Identified</h3>
                    <p className="text-sm text-green-800 mt-1">
                      Your pricing page has a 28% bounce rate, which is 15% better than industry average. 
                      Consider A/B testing different pricing tiers to increase conversions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Traffic Insight</h3>
                    <p className="text-sm text-blue-800 mt-1">
                      Social media traffic increased 23% this week. Your LinkedIn posts are performing well. 
                      Consider increasing posting frequency.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-orange-900">Action Required</h3>
                    <p className="text-sm text-orange-800 mt-1">
                      Revenue dropped 5.2% this week. The main cause appears to be fewer email signups. 
                      Review your email capture strategy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-purple-900">Growth Tip</h3>
                    <p className="text-sm text-purple-800 mt-1">
                      Users who visit both your features and pricing pages are 3x more likely to convert. 
                      Add feature highlights to your pricing page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Open Rate</span>
                <span className="font-medium">24.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Click Rate</span>
                <span className="font-medium">3.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Unsubscribe Rate</span>
                <span className="font-medium">0.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Sent</span>
                <span className="font-medium">1,247</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Visitors</span>
                <span className="font-medium">2,847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Email Signups</span>
                <span className="font-medium">156 (5.5%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Trial Starts</span>
                <span className="font-medium">47 (30.1%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Conversions</span>
                <span className="font-medium">12 (25.5%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Avg. Session Duration</span>
                <span className="font-medium">2m 34s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Pages per Session</span>
                <span className="font-medium">3.2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Bounce Rate</span>
                <span className="font-medium">42%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Return Visitors</span>
                <span className="font-medium">18%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}