import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover'
import { ScrollArea } from './ui/scroll-area'
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X,
  Trash2
} from 'lucide-react'
import { blink } from '../lib/blink'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  readStatus: number
  actionUrl?: string
  createdAt: string
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const currentUser = await blink.auth.me()
        setUser(currentUser)
        
        // Load user notifications
        const userNotifications = await blink.db.userNotifications.list({
          where: { userId: currentUser.id },
          orderBy: { createdAt: 'desc' },
          limit: 20
        })
        
        setNotifications(userNotifications)
      } catch (error) {
        console.error('Error loading notifications:', error)
        // Add some default notifications for demo
        setNotifications([
          {
            id: 'demo_1',
            title: 'Welcome to Launchbase!',
            message: 'Connect your MVP to get started with AI-powered go-to-market insights.',
            type: 'info',
            readStatus: 0,
            createdAt: new Date().toISOString()
          },
          {
            id: 'demo_2',
            title: 'AI Analysis Ready',
            message: 'Your MVP analysis is complete. Check out the insights!',
            type: 'success',
            readStatus: 0,
            createdAt: new Date(Date.now() - 3600000).toISOString()
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [])

  const unreadCount = notifications.filter(n => n.readStatus === 0).length

  const markAsRead = async (notificationId: string) => {
    try {
      if (user) {
        await blink.db.userNotifications.update(notificationId, { readStatus: 1 })
      }
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, readStatus: 1 } : n
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      if (user) {
        const unreadNotifications = notifications.filter(n => n.readStatus === 0)
        for (const notification of unreadNotifications) {
          await blink.db.userNotifications.update(notification.id, { readStatus: 1 })
        }
      }
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, readStatus: 1 }))
      )
      
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Failed to mark notifications as read')
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      if (user) {
        await blink.db.userNotifications.delete(notificationId)
      }
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      toast.success('Notification deleted')
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b hover:bg-muted/50 transition-colors ${
                        notification.readStatus === 0 ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className={`text-sm font-medium ${
                              notification.readStatus === 0 ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1 ml-2">
                              {notification.readStatus === 0 && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-6 h-6 p-0"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {notification.readStatus === 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6 px-2"
                                onClick={() => markAsRead(notification.id)}
                              >
                                Mark read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}