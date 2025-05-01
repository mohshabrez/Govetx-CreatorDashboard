import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  User, 
  Coins, 
  FileText, 
  Trophy, 
  Calendar, 
  Save, 
  Loader2,
  Share2
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Sidebar from "@/components/layout/Sidebar";
import MobileMenu from "@/components/layout/MobileMenu";
import { useAuth } from "@/hooks/use-auth";
import { getCredits } from "@/lib/socialApi";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

// Profile form schema
const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  bio: z.string().max(160, {
    message: "Bio must not be longer than 160 characters.",
  }).optional(),
  notification: z.object({
    emailNotifications: z.boolean().default(false),
    pushNotifications: z.boolean().default(false),
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileCompletion, setProfileCompletion] = useState(65); // Mock value, should come from API
  
  // Fetch credit data with automatic refetching
  const { data: creditData, isLoading: isLoadingCredits } = useQuery({
    queryKey: ['/api/credits'],
    queryFn: getCredits,
    refetchInterval: 5000, // Refetch every 5 seconds
  });
  
  // Calculate total credits
  const totalCredits = creditData?.total || 0;
  console.log('Credit data from query:', creditData);
  console.log('Calculated total credits:', totalCredits);
  
  // Organize credit history by types
  const creditHistory = creditData?.credits || [];
  console.log('Credit history:', creditHistory);
  
  // Calculate credit stats
  const creditStats = {
    dailyStreak: 7, // This would come from the API
    nextDailyBonus: "Tomorrow at 12:00 AM", // This would come from the API
    dailyBonusAmount: 50, // This would come from the API
  };
  
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const res = await apiRequest("PATCH", `/api/user/${user?.id}/profile`, values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      // If profile completion changed, add credits
      if (profileCompletion < 100) {
        setProfileCompletion(100);
        // Add credits for completing profile (would be handled by the server)
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to update profile",
        description: (error as Error).message || "Please try again later",
        variant: "destructive",
      });
    },
  });
  
  // Default form values
  const defaultValues: Partial<ProfileFormValues> = {
    username: user?.username || "",
    email: user?.email || "",
    bio: "", // Would come from extended profile data
    notification: {
      emailNotifications: false,
      pushNotifications: false,
    },
  };
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });
  
  function onSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data);
  }
  
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <MobileMenu />
      
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-8 bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Profile & Credits</h1>
            <p className="text-gray-600">Manage your profile and view your credit history</p>
          </div>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="w-full justify-start mb-6">
              <TabsTrigger value="profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="credits" className="flex items-center">
                <Coins className="mr-2 h-4 w-4" />
                Credits
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Info Card */}
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your public profile details</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random`} alt={user?.username || 'User'} />
                      <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-bold">{user?.username}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <div className="mt-4 w-full">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Profile Completion</span>
                        <span className="font-medium">{profileCompletion}%</span>
                      </div>
                      <Progress value={profileCompletion} className="h-2" />
                    </div>
                    <div className="mt-6 w-full pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Account Type</span>
                        <span className="text-sm capitalize">{user?.role}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Member Since</span>
                        <span className="text-sm">September 2023</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Profile Edit Form */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>Update your profile information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                This is your public display name.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                Your email address for notifications.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us a little about yourself"
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Brief description for your profile. Max 160 characters.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="space-y-3">
                          <FormField
                            control={form.control}
                            name="notification.emailNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Email Notifications
                                  </FormLabel>
                                  <FormDescription>
                                    Receive email notifications about your account.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="notification.pushNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Push Notifications
                                  </FormLabel>
                                  <FormDescription>
                                    Receive push notifications about your content.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full md:w-auto"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>Save Changes</>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Credits Tab */}
            <TabsContent value="credits">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Credit Summary */}
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Credit Summary</CardTitle>
                    <CardDescription>Your credit balance and stats</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="bg-primary/10 rounded-full p-6 mb-4">
                        <Coins className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-3xl font-bold text-primary">
                        {isLoadingCredits ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          totalCredits
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 mb-6">Total Credits</p>
                      
                      <div className="w-full space-y-4">
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <Trophy className="h-5 w-5 text-green-600 mr-3" />
                          <div>
                            <p className="font-medium">Daily Streak</p>
                            <p className="text-xs text-gray-500">{creditStats.dailyStreak} days in a row</p>
                          </div>
                          <div className="ml-auto text-green-600 font-bold">+{creditStats.dailyBonusAmount}</div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                          <div>
                            <p className="font-medium">Next Daily Bonus</p>
                            <p className="text-xs text-gray-500">{creditStats.nextDailyBonus}</p>
                          </div>
                          <div className="ml-auto text-blue-600 font-bold">+{creditStats.dailyBonusAmount}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Credit History */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Credit History</CardTitle>
                    <CardDescription>Recent credit transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingCredits ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : creditHistory.length > 0 ? (
                      <div className="space-y-4">
                        {creditHistory.map((credit) => (
                          <div key={credit.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            {credit.reason.includes("login") && (
                              <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                            )}
                            {credit.reason.includes("save") && (
                              <Save className="h-5 w-5 text-green-600 mr-3" />
                            )}
                            {credit.reason.includes("share") && (
                              <Share2 className="h-5 w-5 text-purple-600 mr-3" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{credit.reason}</p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(credit.createdAt), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                            <div className={`font-bold ${credit.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {credit.amount > 0 ? '+' : ''}{credit.amount}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No credit history available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent actions and interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Example activity items - would be fetched from API */}
                    <div className="relative pl-8 pb-8 border-l border-gray-200">
                      <div className="absolute left-0 top-0 transform -translate-x-1/2 bg-primary rounded-full w-4 h-4"></div>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h4 className="text-base font-medium">Saved a Twitter post about AI</h4>
                          <p className="text-sm text-gray-500">You earned 10 credits for saving content</p>
                        </div>
                        <time className="text-xs text-gray-500 mt-1 md:mt-0">Today, 2:30 PM</time>
                      </div>
                    </div>
                    
                    <div className="relative pl-8 pb-8 border-l border-gray-200">
                      <div className="absolute left-0 top-0 transform -translate-x-1/2 bg-primary rounded-full w-4 h-4"></div>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h4 className="text-base font-medium">Shared content to Twitter</h4>
                          <p className="text-sm text-gray-500">You earned 5 credits for sharing content</p>
                        </div>
                        <time className="text-xs text-gray-500 mt-1 md:mt-0">Yesterday, 10:15 AM</time>
                      </div>
                    </div>
                    
                    <div className="relative pl-8 pb-8 border-l border-gray-200">
                      <div className="absolute left-0 top-0 transform -translate-x-1/2 bg-primary rounded-full w-4 h-4"></div>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h4 className="text-base font-medium">Daily login bonus</h4>
                          <p className="text-sm text-gray-500">You earned 50 credits for logging in</p>
                        </div>
                        <time className="text-xs text-gray-500 mt-1 md:mt-0">Yesterday, 9:00 AM</time>
                      </div>
                    </div>
                    
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-0 transform -translate-x-1/2 bg-primary rounded-full w-4 h-4"></div>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h4 className="text-base font-medium">Account created</h4>
                          <p className="text-sm text-gray-500">Welcome bonus of 100 credits</p>
                        </div>
                        <time className="text-xs text-gray-500 mt-1 md:mt-0">September 15, 2023</time>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
