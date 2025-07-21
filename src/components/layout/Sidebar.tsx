import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Target, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  Settings,
  Zap,
  Rocket
} from 'lucide-react'
import { cn } from '../../lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Strategy Builder', href: '/strategy', icon: Target },
  { name: 'Content Generator', href: '/content', icon: FileText },
  { name: 'Launch Checklist', href: '/checklist', icon: CheckSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Integrations', href: '/integrations', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Rocket className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Launchbase</h1>
            <p className="text-xs text-muted-foreground">MVP to Market</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Upgrade CTA */}
      <div className="p-4 border-t border-border">
        <div className="bg-gradient-to-r from-primary to-accent p-4 rounded-lg text-center">
          <Zap className="w-6 h-6 text-white mx-auto mb-2" />
          <p className="text-white text-sm font-medium mb-2">Unlock AI Agents</p>
          <button 
            className="bg-white text-primary text-xs px-3 py-1 rounded-md font-medium hover:bg-gray-100 transition-colors"
            onClick={() => {
              window.open('https://blink.new/pricing', '_blank')
            }}
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  )
}