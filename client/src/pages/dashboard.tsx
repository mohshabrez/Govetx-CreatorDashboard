import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  BookMarked, 
  Coins, 
  Users, 
  ArrowRight, 
  RefreshCw,
  CalendarClock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Sidebar from "@/components/layout/Sidebar";
import MobileMenu from "@/components/layout/MobileMenu";
import { useAuth } from "@/hooks/use-auth";
import { getCredits, getSavedContent } from "@/lib/socialApi";
import { format } from "date-fns";

const mockActivityData = [
  { day: "Mon", credits: 25 },
  { day: "Tue", credits: 40 },
  { day: "Wed", credits: 35 },
  { day: "Thu", credits: 50 },
  { day: "Fri", credits: 65 },
  { day: "Sat", credits: 35 },
  { day: "Sun", credits: 25 },
];

const mockCreditStats = [
  { name: "Apr", credits: 400 },
  { name: "May", credits: 300 },
  { name: "Jun", credits: 620 },
  { name: "Jul", credits: 540 },
  { name: "Aug", credits: 800 },
  { name: "Sep", credits: 600 },
  { name: "Oct", credits: 950 },
];

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: creditData, refetch: refetchCredits } = useQuery({
    queryKey: ['/api/credits'],
    queryFn: getCredits,
  });
  
  const { data: savedContent = [] } = useQuery({
    queryKey: ['/api/saved-content'],
    queryFn: getSavedContent,
  });
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchCredits();
    setTimeout(() => setIsRefreshing(false), 1000);
  };
  
  const totalCredits = creditData?.total || 0;
  const creditHistory = creditData?.credits || [];
  const recentSavedContent = Array.isArray(savedContent) ? savedContent.slice(0, 5) : [];
  
  // Progress value for profile completion (mock data - would come from user profile)
  const profileProgress = 65;
  
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <MobileMenu />
      
      <main className="flex-1 md:ml-64 bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.username}! Here's your latest creator stats.</p>
            </div>
            
            <Button 
              variant="outline" 
              className="mt-4 md:mt-0 flex items-center"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <Coins className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="ml-3 text-lg font-semibold">Credits</h3>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/profile">
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="text-3xl font-bold">{totalCredits}</div>
                <p className="text-sm text-gray-500 mt-1">Total accumulated credits</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <BookMarked className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="ml-3 text-lg font-semibold">Saved</h3>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/saved">
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="text-3xl font-bold">{savedContent?.length || 0}</div>
                <p className="text-sm text-gray-500 mt-1">Saved content items</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <CalendarClock className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="ml-3 text-lg font-semibold">Streak</h3>
                  </div>
                </div>
                <div className="text-3xl font-bold">7</div>
                <p className="text-sm text-gray-500 mt-1">Day login streak</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="ml-3 text-lg font-semibold">Profile</h3>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/profile">
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span className="font-medium">{profileProgress}%</span>
                  </div>
                  <Progress value={profileProgress} className="h-2" />
                </div>
                <p className="text-sm text-gray-500 mt-2">Complete your profile for more credits</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Your credit earning activity this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockActivityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="credits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Credit Growth</CardTitle>
                <CardDescription>Your credit accumulation over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockCreditStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="credits" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#colorCredits)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Credits Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Credit Activity</CardTitle>
                <CardDescription>Your latest credit transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {creditHistory.length > 0 ? (
                  <div className="space-y-4">
                    {creditHistory.slice(0, 5).map((credit) => (
                      <div key={credit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Coins className="h-5 w-5 text-primary mr-3" />
                          <div>
                            <p className="font-medium">{credit.reason}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(credit.createdAt), "MMM d, yyyy • h:mm a")}
                            </p>
                          </div>
                        </div>
                        <span className={`font-bold ${credit.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {credit.amount >= 0 ? '+' : ''}{credit.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No credit activity yet</p>
                    <Button variant="outline" className="mt-3" asChild>
                      <Link href="/feed">Browse Feed</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/profile">View All Activity</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recently Saved Content</CardTitle>
                <CardDescription>Content you've saved from your feed</CardDescription>
              </CardHeader>
              <CardContent>
                {recentSavedContent.length > 0 ? (
                  <div className="space-y-4">
                    {recentSavedContent.map((item) => (
                      <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          {item.source === 'twitter' && (
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <BarChart3 className="h-4 w-4 text-blue-600" />
                            </div>
                          )}
                          {item.source === 'reddit' && (
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <BarChart3 className="h-4 w-4 text-orange-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium capitalize">{item.source}</p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(item.createdAt), "MMM d")}
                              </p>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">{item.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No saved content yet</p>
                    <Button variant="outline" className="mt-3" asChild>
                      <Link href="/feed">Browse Feed</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/saved">View All Saved</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
