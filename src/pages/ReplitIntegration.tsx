import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { ArrowLeft, Zap, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ReplitConnector } from '../components/integrations/ReplitConnector'
import { blink } from '../lib/blink'

interface ConnectedProject {
  id: string
  name: string
  url: string
  status: string
  connectedAt: string
  techStack: string[]
  gtmSuggestions: string[]
}

export function ReplitIntegration() {
  const [connectedProjects, setConnectedProjects] = useState<ConnectedProject[]>([])
  const [loading, setLoading] = useState(true)

  const loadConnectedProjects = async () => {
    try {
      const user = await blink.auth.me()
      const projects = await blink.db.replitProjects.list({
        where: { userId: user.id },
        orderBy: { connectedAt: 'desc' }
      })

      const formattedProjects = projects.map(project => ({
        id: project.id,
        name: project.name,
        url: project.url,
        status: project.status,
        connectedAt: project.connectedAt,
        techStack: JSON.parse(project.techStack || '[]'),
        gtmSuggestions: JSON.parse(project.gtmSuggestions || '[]')
      }))

      setConnectedProjects(formattedProjects)
    } catch (error) {
      console.error('Error loading connected projects:', error)
      // Don't show error to user for loading issues, just log it
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConnectedProjects()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'checking':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-100 text-green-800'
      case 'checking':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/integrations">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Integrations
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-xl">🔄</span>
            </div>
            <span>Replit Integration</span>
          </h1>
          <p className="text-muted-foreground">
            Connect your deployed Replit apps to enable GTM tracking and get AI-powered launch suggestions
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Apps</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              {connectedProjects.filter(p => p.status === 'live').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GTM Suggestions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {connectedProjects.reduce((total, project) => total + project.gtmSuggestions.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              AI-generated recommendations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tech Stacks</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(connectedProjects.flatMap(p => p.techStack)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Different technologies detected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Connected Projects */}
      {connectedProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Projects</CardTitle>
            <p className="text-muted-foreground">
              Your Replit apps that are connected to Launchbase
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {connectedProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">🔄</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.url}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {project.techStack.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.techStack.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{project.techStack.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(project.status)}
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Connected {new Date(project.connectedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.url} target="_blank" rel="noopener noreferrer">
                        Visit App
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Replit Connector */}
      <ReplitConnector />

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Why Connect Your Replit Apps?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Auto-Detection</h3>
              <p className="text-sm text-muted-foreground">
                Automatically detect your tech stack, framework, and API endpoints
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">GTM Suggestions</h3>
              <p className="text-sm text-muted-foreground">
                Get personalized go-to-market recommendations based on your app
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Badge className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Analytics Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor user behavior and conversions with easy-to-integrate tracking
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Insights</h3>
              <p className="text-sm text-muted-foreground">
                Get instant feedback on your app's performance and user engagement
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}