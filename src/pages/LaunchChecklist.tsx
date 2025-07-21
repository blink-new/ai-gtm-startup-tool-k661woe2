import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Checkbox } from '../components/ui/checkbox'
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertTriangle,
  Rocket,
  Users,
  FileText,
  Globe,
  Shield,
  BarChart3
} from 'lucide-react'

const checklistSections = [
  {
    id: 'product',
    title: 'Product Readiness',
    icon: Rocket,
    color: 'bg-blue-500',
    items: [
      { id: 'mvp-complete', title: 'MVP development complete', completed: true, critical: true },
      { id: 'testing-done', title: 'User testing completed', completed: true, critical: true },
      { id: 'bugs-fixed', title: 'Critical bugs resolved', completed: false, critical: true },
      { id: 'performance', title: 'Performance optimization', completed: false, critical: false },
      { id: 'mobile-responsive', title: 'Mobile responsiveness', completed: true, critical: true },
    ]
  },
  {
    id: 'legal',
    title: 'Legal & Compliance',
    icon: Shield,
    color: 'bg-green-500',
    items: [
      { id: 'terms-service', title: 'Terms of Service', completed: true, critical: true },
      { id: 'privacy-policy', title: 'Privacy Policy', completed: true, critical: true },
      { id: 'gdpr-compliance', title: 'GDPR compliance', completed: false, critical: true },
      { id: 'business-registration', title: 'Business registration', completed: false, critical: false },
      { id: 'trademark', title: 'Trademark application', completed: false, critical: false },
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing Assets',
    icon: Globe,
    color: 'bg-purple-500',
    items: [
      { id: 'landing-page', title: 'Landing page live', completed: true, critical: true },
      { id: 'brand-assets', title: 'Brand assets created', completed: true, critical: false },
      { id: 'email-sequences', title: 'Email sequences ready', completed: false, critical: true },
      { id: 'social-profiles', title: 'Social media profiles', completed: true, critical: false },
      { id: 'content-calendar', title: 'Content calendar', completed: false, critical: false },
    ]
  },
  {
    id: 'sales',
    title: 'Sales & Outreach',
    icon: Users,
    color: 'bg-orange-500',
    items: [
      { id: 'icp-defined', title: 'ICP clearly defined', completed: true, critical: true },
      { id: 'prospect-list', title: 'Prospect database built', completed: false, critical: true },
      { id: 'outreach-templates', title: 'Outreach templates ready', completed: true, critical: true },
      { id: 'crm-setup', title: 'CRM system configured', completed: false, critical: false },
      { id: 'sales-process', title: 'Sales process documented', completed: false, critical: false },
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Tracking',
    icon: BarChart3,
    color: 'bg-red-500',
    items: [
      { id: 'analytics-setup', title: 'Analytics tracking setup', completed: true, critical: true },
      { id: 'conversion-tracking', title: 'Conversion tracking', completed: false, critical: true },
      { id: 'error-monitoring', title: 'Error monitoring', completed: false, critical: false },
      { id: 'user-feedback', title: 'User feedback system', completed: false, critical: false },
      { id: 'kpi-dashboard', title: 'KPI dashboard', completed: false, critical: false },
    ]
  },
  {
    id: 'launch',
    title: 'Launch Preparation',
    icon: FileText,
    color: 'bg-pink-500',
    items: [
      { id: 'launch-plan', title: 'Launch plan finalized', completed: false, critical: true },
      { id: 'press-kit', title: 'Press kit prepared', completed: false, critical: false },
      { id: 'support-docs', title: 'Support documentation', completed: false, critical: true },
      { id: 'backup-plan', title: 'Backup & recovery plan', completed: false, critical: false },
      { id: 'team-briefing', title: 'Team launch briefing', completed: false, critical: false },
    ]
  }
]

export function LaunchChecklist() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  const toggleItem = (itemId: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId)
    } else {
      newChecked.add(itemId)
    }
    setCheckedItems(newChecked)
  }

  const calculateProgress = () => {
    const totalItems = checklistSections.reduce((sum, section) => sum + section.items.length, 0)
    const completedItems = checklistSections.reduce((sum, section) => 
      sum + section.items.filter(item => item.completed || checkedItems.has(item.id)).length, 0
    )
    return Math.round((completedItems / totalItems) * 100)
  }

  const getCriticalItemsRemaining = () => {
    return checklistSections.reduce((sum, section) => 
      sum + section.items.filter(item => item.critical && !item.completed && !checkedItems.has(item.id)).length, 0
    )
  }

  const progress = calculateProgress()
  const criticalRemaining = getCriticalItemsRemaining()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Launch Checklist</h1>
          <p className="text-muted-foreground">Ensure you're ready for a successful launch</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-accent" disabled={progress < 100}>
          <Rocket className="w-4 h-4 mr-2" />
          {progress === 100 ? 'Ready to Launch!' : 'Launch When Ready'}
        </Button>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{progress}%</span>
                <Badge variant={progress === 100 ? 'default' : 'secondary'}>
                  {progress === 100 ? 'Complete' : 'In Progress'}
                </Badge>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {checklistSections.reduce((sum, section) => 
                  sum + section.items.filter(item => item.completed || checkedItems.has(item.id)).length, 0
                )} of {checklistSections.reduce((sum, section) => sum + section.items.length, 0)} tasks completed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Critical Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                {criticalRemaining === 0 ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                )}
                <span className="text-2xl font-bold">{criticalRemaining}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {criticalRemaining === 0 ? 'All critical items complete!' : 'Critical items remaining'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Launch Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                {progress === 100 && criticalRemaining === 0 ? (
                  <Rocket className="w-6 h-6 text-green-500" />
                ) : (
                  <Clock className="w-6 h-6 text-orange-500" />
                )}
                <span className="text-lg font-bold">
                  {progress === 100 && criticalRemaining === 0 ? 'Ready!' : 'Not Ready'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {progress === 100 && criticalRemaining === 0 
                  ? 'You can launch with confidence' 
                  : 'Complete critical items first'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checklist Sections */}
      <div className="space-y-6">
        {checklistSections.map((section) => {
          const sectionProgress = Math.round(
            (section.items.filter(item => item.completed || checkedItems.has(item.id)).length / section.items.length) * 100
          )

          return (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${section.color} rounded-lg flex items-center justify-center`}>
                      <section.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>{section.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {section.items.filter(item => item.completed || checkedItems.has(item.id)).length} of {section.items.length} completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{sectionProgress}%</div>
                    <Progress value={sectionProgress} className="w-20 h-2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.items.map((item) => {
                    const isCompleted = item.completed || checkedItems.has(item.id)
                    
                    return (
                      <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={() => toggleItem(item.id)}
                          disabled={item.completed}
                        />
                        <div className="flex-1">
                          <div className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {item.title}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.critical && (
                            <Badge variant="destructive" className="text-xs">
                              Critical
                            </Badge>
                          )}
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Launch Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Launch Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Before Launch</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Test all critical user flows</li>
                <li>• Prepare customer support responses</li>
                <li>• Set up monitoring and alerts</li>
                <li>• Brief your team on launch day procedures</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Launch Day</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Monitor metrics closely</li>
                <li>• Respond quickly to user feedback</li>
                <li>• Share launch updates on social media</li>
                <li>• Be ready to scale infrastructure</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}