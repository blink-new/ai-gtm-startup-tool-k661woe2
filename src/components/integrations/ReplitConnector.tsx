import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Textarea } from '../ui/textarea'
import { 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Globe, 
  Code, 
  Database,
  Zap,
  Copy,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'
import { blink } from '../../lib/blink'

interface ReplitProject {
  id: string
  name: string
  url: string
  description: string
  techStack: string[]
  endpoints: string[]
  status: 'live' | 'error' | 'checking'
  metadata: {
    title?: string
    favicon?: string
    language?: string
    framework?: string
    lastDeployed?: string
  }
  gtmSuggestions: string[]
  trackingCode?: string
}

export function ReplitConnector() {
  const [replitUrl, setReplitUrl] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedProject, setConnectedProject] = useState<ReplitProject | null>(null)
  const [showTrackingCode, setShowTrackingCode] = useState(false)

  const validateReplitUrl = (url: string): boolean => {
    // Check if it's a valid Replit URL
    const replitPatterns = [
      /^https:\/\/[\w-]+\.replit\.app/,
      /^https:\/\/replit\.com\/@[\w-]+\/[\w-]+/,
      /^https:\/\/[\w-]+--[\w-]+\.repl\.co/
    ]
    
    return replitPatterns.some(pattern => pattern.test(url))
  }

  const detectTechStack = (metadata: any, extract: any): string[] => {
    const stack: string[] = []
    const content = extract.text?.toLowerCase() || ''
    
    // Detect based on common patterns
    if (content.includes('react') || metadata.generator?.includes('react')) stack.push('React')
    if (content.includes('vue') || metadata.generator?.includes('vue')) stack.push('Vue.js')
    if (content.includes('angular')) stack.push('Angular')
    if (content.includes('next.js') || content.includes('nextjs')) stack.push('Next.js')
    if (content.includes('express') || content.includes('node.js')) stack.push('Node.js')
    if (content.includes('python') || content.includes('flask') || content.includes('django')) stack.push('Python')
    if (content.includes('javascript')) stack.push('JavaScript')
    if (content.includes('typescript')) stack.push('TypeScript')
    if (content.includes('tailwind')) stack.push('Tailwind CSS')
    if (content.includes('bootstrap')) stack.push('Bootstrap')
    
    return stack.length > 0 ? stack : ['Web Application']
  }

  const extractEndpoints = (extract: any): string[] => {
    const endpoints: string[] = []
    const content = extract.text || ''
    
    // Look for common API patterns
    const apiPatterns = [
      /\/api\/[\w/]+/g,
      /\/v\d+\/[\w/]+/g,
      /\/graphql/g,
      /\/webhook/g
    ]
    
    apiPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        endpoints.push(...matches)
      }
    })
    
    return [...new Set(endpoints)].slice(0, 10) // Dedupe and limit
  }

  const detectLanguage = (extract: any): string => {
    const content = extract.text?.toLowerCase() || ''
    if (content.includes('javascript') || content.includes('js')) return 'JavaScript'
    if (content.includes('typescript') || content.includes('ts')) return 'TypeScript'
    if (content.includes('python') || content.includes('py')) return 'Python'
    if (content.includes('java')) return 'Java'
    if (content.includes('go') || content.includes('golang')) return 'Go'
    return 'Unknown'
  }

  const detectFramework = (techStack: string[]): string => {
    if (techStack.includes('React')) return 'React'
    if (techStack.includes('Vue.js')) return 'Vue.js'
    if (techStack.includes('Angular')) return 'Angular'
    if (techStack.includes('Next.js')) return 'Next.js'
    if (techStack.includes('Node.js')) return 'Node.js'
    return 'Web Application'
  }

  const generateGTMSuggestions = (metadata: any, techStack: string[], endpoints: string[]): string[] => {
    const suggestions: string[] = []
    
    // Basic suggestions for all apps
    suggestions.push('Add Google Analytics tracking')
    suggestions.push('Implement user feedback collection')
    suggestions.push('Set up error monitoring')
    
    // Tech-specific suggestions
    if (techStack.includes('React') || techStack.includes('Vue.js')) {
      suggestions.push('Add performance monitoring for SPA')
      suggestions.push('Implement A/B testing framework')
    }
    
    if (endpoints.length > 0) {
      suggestions.push('Monitor API performance and usage')
      suggestions.push('Set up API rate limiting alerts')
    }
    
    if (techStack.includes('Node.js') || techStack.includes('Python')) {
      suggestions.push('Add server-side error tracking')
      suggestions.push('Implement health check endpoints')
    }
    
    // Business suggestions
    suggestions.push('Create landing page for user acquisition')
    suggestions.push('Set up email capture for early users')
    suggestions.push('Implement user onboarding flow')
    suggestions.push('Add social sharing capabilities')
    
    return suggestions
  }

  const generateTrackingCode = (projectId: string): string => {
    return `<!-- Launchbase GTM Tracking -->
<script>
  (function(l,a,u,n,c,h,b,a,s,e) {
    l[c] = l[c] || function() { (l[c].q = l[c].q || []).push(arguments) };
    h = a.createElement(u); b = a.getElementsByTagName(u)[0];
    h.async = 1; h.src = n; b.parentNode.insertBefore(h, b);
  })(window, document, 'script', 'https://cdn.launchbase.ai/track.js', 'launchbase');
  
  launchbase('init', '${projectId}');
  launchbase('track', 'pageview');
</script>
<!-- End Launchbase GTM Tracking -->`
  }

  const extractProjectInfo = async (url: string): Promise<ReplitProject> => {
    // Simulate API call to scrape/analyze the Replit app
    // In real implementation, this would use blink.data.scrape() or Replit API
    
    try {
      // Use Blink's scraping capability to analyze the app
      const { metadata, extract } = await blink.data.scrape(url)
      
      // Generate unique project ID from URL
      const urlPart = url.split('/').pop() || url.split('//')[1]?.split('.')[0] || 'unknown'
      const projectId = `${urlPart}_${Date.now()}`
      
      // Detect tech stack from metadata and content
      const techStack = detectTechStack(metadata, extract)
      
      // Extract potential API endpoints
      const endpoints = extractEndpoints(extract)
      
      // Generate GTM suggestions based on app analysis
      const gtmSuggestions = generateGTMSuggestions(metadata, techStack, endpoints)
      
      return {
        id: projectId,
        name: metadata.title || projectId,
        url: url,
        description: metadata.description || 'Replit application',
        techStack,
        endpoints,
        status: 'live',
        metadata: {
          title: metadata.title,
          favicon: metadata.favicon,
          language: detectLanguage(extract),
          framework: detectFramework(techStack),
          lastDeployed: new Date().toISOString()
        },
        gtmSuggestions,
        trackingCode: generateTrackingCode(projectId)
      }
    } catch (error) {
      console.error('Error analyzing Replit app:', error)
      throw new Error('Failed to analyze the Replit application')
    }
  }

  const handleConnect = async () => {
    if (!replitUrl.trim()) {
      toast.error('Please enter a Replit URL')
      return
    }

    if (!validateReplitUrl(replitUrl)) {
      toast.error('Please enter a valid Replit URL (e.g., https://myapp.replit.app)')
      return
    }

    setIsConnecting(true)
    
    try {
      // First, verify the app is live
      toast.loading('Verifying Replit app...', { id: 'connect' })
      
      // Extract and analyze project info
      const projectInfo = await extractProjectInfo(replitUrl)
      
      // Check if URL is already connected
      const user = await blink.auth.me()
      const existingProjects = await blink.db.replitProjects.list({
        where: { 
          userId: user.id,
          url: projectInfo.url 
        }
      })

      if (existingProjects.length > 0) {
        throw new Error('This Replit app is already connected to your account')
      }

      // Save to database
      await blink.db.replitProjects.create({
        id: projectInfo.id,
        userId: user.id,
        name: projectInfo.name,
        url: projectInfo.url,
        description: projectInfo.description,
        techStack: JSON.stringify(projectInfo.techStack),
        endpoints: JSON.stringify(projectInfo.endpoints),
        metadata: JSON.stringify(projectInfo.metadata),
        gtmSuggestions: JSON.stringify(projectInfo.gtmSuggestions),
        trackingCode: projectInfo.trackingCode,
        status: projectInfo.status,
        connectedAt: new Date().toISOString()
      })
      
      setConnectedProject(projectInfo)
      toast.success('Successfully connected to Replit app!', { id: 'connect' })
      
      // Clear the input
      setReplitUrl('')
      
    } catch (error) {
      console.error('Connection error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to connect to Replit app', { id: 'connect' })
    } finally {
      setIsConnecting(false)
    }
  }

  const copyTrackingCode = () => {
    if (connectedProject?.trackingCode) {
      navigator.clipboard.writeText(connectedProject.trackingCode)
      toast.success('Tracking code copied to clipboard!')
    }
  }

  const handleDisconnect = async () => {
    if (!connectedProject) return
    
    try {
      await blink.db.replitProjects.delete(connectedProject.id)
      setConnectedProject(null)
      toast.success('Disconnected from Replit app')
    } catch (error) {
      toast.error('Failed to disconnect')
    }
  }

  return (
    <div className="space-y-6">
      {!connectedProject ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Code className="w-4 h-4 text-white" />
              </div>
              <span>Connect Your Replit App</span>
            </CardTitle>
            <p className="text-muted-foreground">
              Connect your deployed Replit application to enable GTM tracking and get AI-powered launch suggestions
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="replit-url">Replit App URL</Label>
              <Input
                id="replit-url"
                placeholder="https://myapp.replit.app or https://replit.com/@username/project"
                value={replitUrl}
                onChange={(e) => setReplitUrl(e.target.value)}
                disabled={isConnecting}
              />
              <p className="text-sm text-muted-foreground">
                Enter your deployed Replit app URL. We'll automatically detect the tech stack and suggest GTM strategies.
              </p>
            </div>
            
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting || !replitUrl.trim()}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing App...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Connect & Analyze
                </>
              )}
            </Button>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">What happens next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• We'll verify your app is live and accessible</li>
                <li>• Automatically detect your tech stack and framework</li>
                <li>• Analyze your app structure and potential API endpoints</li>
                <li>• Generate personalized GTM suggestions</li>
                <li>• Provide tracking code for analytics integration</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Connected App Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>{connectedProject.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Connected Replit App</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={connectedProject.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit App
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tech Stack</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {connectedProject.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Live & Accessible</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Framework</Label>
                  <p className="text-sm mt-1">{connectedProject.metadata.framework}</p>
                </div>
              </div>
              
              {connectedProject.endpoints.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Detected API Endpoints</Label>
                  <div className="mt-1 space-y-1">
                    {connectedProject.endpoints.slice(0, 5).map((endpoint) => (
                      <code key={endpoint} className="block text-xs bg-muted px-2 py-1 rounded">
                        {endpoint}
                      </code>
                    ))}
                    {connectedProject.endpoints.length > 5 && (
                      <p className="text-xs text-muted-foreground">
                        +{connectedProject.endpoints.length - 5} more endpoints
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GTM Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>AI-Generated GTM Suggestions</span>
              </CardTitle>
              <p className="text-muted-foreground">
                Based on your app analysis, here are personalized go-to-market recommendations
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {connectedProject.gtmSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-white font-medium">{index + 1}</span>
                    </div>
                    <p className="text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tracking Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Analytics Integration</span>
              </CardTitle>
              <p className="text-muted-foreground">
                Add this tracking code to your Replit app to monitor user behavior and conversions
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Tracking Code</Label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTrackingCode(!showTrackingCode)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showTrackingCode ? 'Hide' : 'Show'} Code
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyTrackingCode}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
              
              {showTrackingCode && (
                <Textarea
                  value={connectedProject.trackingCode}
                  readOnly
                  className="font-mono text-xs"
                  rows={8}
                />
              )}
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Integration Instructions</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Copy the tracking code above</li>
                  <li>2. In your Replit project, open your main HTML file (usually index.html)</li>
                  <li>3. Paste the code just before the closing &lt;/head&gt; tag</li>
                  <li>4. Deploy your changes</li>
                  <li>5. Return here to view analytics and insights</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}