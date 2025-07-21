import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Label } from '../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  FileText, 
  Mail, 
  Globe, 
  MessageSquare,
  Copy,
  Download,
  Sparkles,
  RefreshCw,
  CheckCircle
} from 'lucide-react'
import { blink } from '../lib/blink'
import { toast } from 'sonner'

const contentTypes = [
  {
    id: 'landing',
    title: 'Landing Page Copy',
    description: 'High-converting headlines and copy',
    icon: Globe,
    template: 'landing-page'
  },
  {
    id: 'email',
    title: 'Email Sequences',
    description: 'Nurture and sales email campaigns',
    icon: Mail,
    template: 'email-sequence'
  },
  {
    id: 'social',
    title: 'Social Media',
    description: 'Posts for LinkedIn, Twitter, etc.',
    icon: MessageSquare,
    template: 'social-media'
  },
  {
    id: 'sales',
    title: 'Sales Copy',
    description: 'Cold outreach and sales materials',
    icon: FileText,
    template: 'sales-copy'
  }
]

export function ContentGenerator() {
  const [activeTab, setActiveTab] = useState('landing')
  const [generating, setGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [user, setUser] = useState(null)
  const [recentContent, setRecentContent] = useState([])

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await blink.auth.me()
        setUser(currentUser)
        
        // Load recent content
        const content = await blink.db.generatedContent.list({
          where: { userId: currentUser.id },
          orderBy: { createdAt: 'desc' },
          limit: 4
        })
        setRecentContent(content)
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
    
    loadUserData()
  }, [])

  const handleGenerateContent = async (type: string, customInput?: string) => {
    if (!user) {
      toast.error('Please sign in to generate content')
      return
    }
    
    setGenerating(true)
    
    try {
      let prompt = ''
      let title = ''
      
      switch (type) {
        case 'landing':
          title = 'Landing Page Copy'
          prompt = `Generate high-converting landing page copy for a SaaS startup. Include:
          - Compelling headline
          - Value proposition
          - Key benefits (3-4 points)
          - Social proof section
          - Call-to-action
          
          ${customInput ? `Additional context: ${customInput}` : ''}`
          break
          
        case 'email':
          title = 'Email Sequence'
          prompt = `Create a 5-email welcome sequence for new SaaS users. Include:
          - Welcome email
          - Product tour email
          - Value demonstration
          - Success stories
          - Upgrade prompt
          
          ${customInput ? `Additional context: ${customInput}` : ''}`
          break
          
        case 'social':
          title = 'Social Media Posts'
          prompt = `Generate 10 social media posts for LinkedIn about SaaS startup journey. Include:
          - Mix of educational and personal content
          - Engagement-driving questions
          - Industry insights
          - Behind-the-scenes content
          
          ${customInput ? `Additional context: ${customInput}` : ''}`
          break
          
        case 'sales':
          title = 'Sales Copy Templates'
          prompt = `Create cold outreach email templates for B2B SaaS. Include:
          - Subject lines (5 variations)
          - Email body templates (3 variations)
          - Follow-up sequence (3 emails)
          - Personalization guidelines
          
          ${customInput ? `Additional context: ${customInput}` : ''}`
          break
      }
      
      const { text } = await blink.ai.generateText({
        prompt,
        maxTokens: 1000
      })
      
      setGeneratedContent(text)
      
      // Save to database
      const contentId = `content_${Date.now()}`
      await blink.db.generatedContent.create({
        id: contentId,
        userId: user.id,
        type,
        title,
        content: text,
        prompt: customInput || '',
        status: 'draft'
      })
      
      // Refresh recent content
      const updatedContent = await blink.db.generatedContent.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 4
      })
      setRecentContent(updatedContent)
      
      toast.success('Content generated successfully!')
      
    } catch (error) {
      console.error('Error generating content:', error)
      toast.error('Failed to generate content. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent)
    toast.success('Content copied to clipboard!')
  }

  const markContentAsUsed = async (contentId: string) => {
    try {
      await blink.db.generatedContent.update(contentId, { status: 'used' })
      
      // Refresh recent content
      const updatedContent = await blink.db.generatedContent.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 4
      })
      setRecentContent(updatedContent)
      
      toast.success('Content marked as used!')
    } catch (error) {
      console.error('Error updating content status:', error)
      toast.error('Failed to update content status')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Generator</h1>
          <p className="text-muted-foreground">AI-powered content creation for your launch</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
          <Button className="bg-gradient-to-r from-primary to-accent">
            <Sparkles className="w-4 h-4 mr-2" />
            Maya AI
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Types */}
        <Card>
          <CardHeader>
            <CardTitle>Content Types</CardTitle>
            <p className="text-sm text-muted-foreground">Choose what to generate</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contentTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={activeTab === type.id ? "default" : "ghost"}
                  className="w-full justify-start h-auto p-3"
                  onClick={() => setActiveTab(type.id)}
                >
                  <type.icon className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{type.title}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                </Button>
              ))}
            </div>
            
            <div className="mt-6 space-y-3">
              <Label>Custom Instructions</Label>
              <Textarea
                placeholder="Add specific requirements or context..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
              />
              <Button 
                onClick={() => handleGenerateContent(activeTab, customPrompt)}
                disabled={generating}
                className="w-full"
              >
                {generating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Generate Content
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Content */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  {(() => {
                    const activeType = contentTypes.find(t => t.id === activeTab)
                    const IconComponent = activeType?.icon
                    return (
                      <>
                        {IconComponent && <IconComponent className="w-5 h-5 mr-2" />}
                        {activeType?.title}
                      </>
                    )
                  })()}
                </CardTitle>
                {generatedContent && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleGenerateContent(activeTab, customPrompt)}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generating ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Maya is crafting your content...</p>
                  </div>
                </div>
              ) : generatedContent ? (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">AI Generated</Badge>
                    <Badge variant="outline">Ready to use</Badge>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-center">
                  <div>
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No content generated yet</h3>
                    <p className="text-muted-foreground">
                      Select a content type and click generate to get started
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Content */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Content</CardTitle>
          <p className="text-sm text-muted-foreground">Your previously generated content</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentContent.length > 0 ? recentContent.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{item.type}</Badge>
                  <Badge variant={item.status === 'used' ? 'default' : 'secondary'}>
                    {item.status}
                  </Badge>
                </div>
                <h3 className="font-medium mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
                <div className="flex space-x-2 mt-3">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setGeneratedContent(item.content)
                      setActiveTab(item.type)
                    }}
                  >
                    View
                  </Button>
                  {item.status === 'draft' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => markContentAsUsed(item.id)}
                    >
                      Mark Used
                    </Button>
                  )}
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No content generated yet. Create your first piece of content above!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

