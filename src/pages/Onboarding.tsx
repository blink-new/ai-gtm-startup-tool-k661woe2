import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Rocket, Target, Users, Lightbulb } from 'lucide-react'
import { blink } from '../lib/blink'
import { toast } from 'sonner'

interface OnboardingProps {
  onComplete: () => void
}

const steps = [
  {
    id: 1,
    title: "Tell us about your MVP",
    description: "Help us understand what you're building",
    icon: Lightbulb
  },
  {
    id: 2,
    title: "Define your target market",
    description: "Who are you building this for?",
    icon: Target
  },
  {
    id: 3,
    title: "Set your goals",
    description: "What does success look like?",
    icon: Users
  },
  {
    id: 4,
    title: "Connect your tools",
    description: "Link your development platforms",
    icon: Rocket
  }
]

const platforms = [
  { id: 'replit', name: 'Replit' },
  { id: 'cursor', name: 'Cursor.sh' },
  { id: 'solar', name: 'Solar.dev' },
  { id: 'lovable', name: 'Lovable.so' },
  { id: 'github', name: 'GitHub' },
]

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    targetAudience: '',
    problemSolving: '',
    goals: '',
    timeline: '',
    connectedPlatforms: []
  })
  
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>(() => {
    const stored = localStorage.getItem('connected_integrations')
    return stored ? JSON.parse(stored) : []
  })
  
  const [connectingPlatforms, setConnectingPlatforms] = useState<string[]>([])

  const handleConnectPlatform = (platformId: string) => {
    // Simulate connection process with loading state
    const platform = platforms.find(p => p.id === platformId)
    if (!platform) return
    
    // Add to connecting state
    setConnectingPlatforms(prev => [...prev, platformId])
    toast.loading(`Connecting to ${platform.name}...`, { id: platformId })
    
    // Show connecting state briefly
    setTimeout(() => {
      const newConnected = [...connectedIntegrations, platformId]
      setConnectedIntegrations(newConnected)
      localStorage.setItem('connected_integrations', JSON.stringify(newConnected))
      
      // Remove from connecting state
      setConnectingPlatforms(prev => prev.filter(id => id !== platformId))
      
      // Show success feedback
      toast.success(`Successfully connected to ${platform.name}!`, { id: platformId })
    }, 1500) // 1.5 second delay to simulate connection
  }

  const handleComplete = async () => {
    try {
      const user = await blink.auth.me()
      
      // Save onboarding completion to localStorage
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true')
      
      // Save onboarding data to localStorage as well
      localStorage.setItem(`user_profile_${user.id}`, JSON.stringify({
        productName: formData.productName,
        productDescription: formData.productDescription,
        targetAudience: formData.targetAudience,
        problemSolving: formData.problemSolving,
        goals: formData.goals,
        timeline: formData.timeline,
        createdAt: new Date().toISOString()
      }))
      
      onComplete()
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="e.g., TaskFlow, MindMap Pro"
              />
            </div>
            <div>
              <Label htmlFor="productDescription">What does your MVP do?</Label>
              <Textarea
                id="productDescription"
                value={formData.productDescription}
                onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                placeholder="Describe your product in 2-3 sentences..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="problemSolving">What problem does it solve?</Label>
              <Textarea
                id="problemSolving"
                value={formData.problemSolving}
                onChange={(e) => setFormData({ ...formData, problemSolving: e.target.value })}
                placeholder="Explain the main problem your product addresses..."
                rows={3}
              />
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="targetAudience">Who is your target audience?</Label>
              <Textarea
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g., Small business owners, Freelance designers, Students..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Industry</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['SaaS', 'E-commerce', 'Healthcare', 'Education', 'Finance', 'Other'].map((industry) => (
                    <Badge key={industry} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Company Size</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Solo', '2-10', '11-50', '51-200', '200+'].map((size) => (
                    <Badge key={size} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="goals">What are your launch goals?</Label>
              <Textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                placeholder="e.g., 100 users in first month, $1K MRR, Product Hunt launch..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="timeline">When do you want to launch?</Label>
              <Input
                id="timeline"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                placeholder="e.g., 2 weeks, 1 month, 3 months"
              />
            </div>
          </div>
        )
      
      case 4:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Connect your development platforms so we can sync your MVP progress automatically.
            </p>
            <div className="space-y-3">
              {platforms.map((platform) => {
                const isConnected = connectedIntegrations.includes(platform.id)
                const isConnecting = connectingPlatforms.includes(platform.id)
                return (
                  <div key={platform.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xs font-medium">{platform.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium">{platform.name}</span>
                    </div>
                    <Button 
                      variant={isConnected ? "default" : "outline"} 
                      size="sm"
                      onClick={() => !isConnected && !isConnecting && handleConnectPlatform(platform.id)}
                      disabled={isConnected || isConnecting}
                    >
                      {isConnecting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>Connecting...</span>
                        </div>
                      ) : isConnected ? 'Connected' : 'Connect'}
                    </Button>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Don't worry, you can connect these later from the Integrations page.
            </p>
          </div>
        )
      
      default:
        return null
    }
  }

  const currentStepData = steps[currentStep - 1]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index + 1 <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    index + 1 < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Step {currentStep} of {steps.length}
          </p>
        </div>

        {/* Content */}
        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <currentStepData.icon className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
            <p className="text-muted-foreground">{currentStepData.description}</p>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              <Button onClick={handleNext}>
                {currentStep === steps.length ? 'Complete Setup' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}