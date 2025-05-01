import { useState, useEffect } from "react";
import { useLocation, Redirect } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { BarChart3, ChevronRight } from "lucide-react";
import { insertUserSchema } from "@shared/schema";

// Login schema 
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Register schema with validation
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [location] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const { user, loginMutation, registerMutation } = useAuth();
  
  // Add form state
  const [formState, setFormState] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user"
  });
  
  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: formState,
  });

  // Handle form field changes
  const handleFieldChange = (field: string, value: string) => {
    setFormState(prev => {
      const newState = { ...prev, [field]: value };
      console.log("Form state updated:", newState);
      return newState;
    });
    registerForm.setValue(field as any, value);
  };

  // Add form watching with field-specific logging
  const watchUsername = registerForm.watch("username");
  const watchEmail = registerForm.watch("email");
  
  useEffect(() => {
    console.log("Username changed:", watchUsername);
    console.log("Email changed:", watchEmail);
  }, [watchUsername, watchEmail]);
  
  // Handle login submission
  const onLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate(values);
  };
  
  // Enhanced register submission with logging
  const onRegisterSubmit = (values: RegisterValues) => {
    console.log("Form submitted with values:", values);
    const { confirmPassword, ...registrationData } = values;
    registerMutation.mutate(registrationData);
  };
  
  // If user is already logged in, redirect to home
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Hero Section - Right side on desktop, top on mobile */}
      <div className="md:w-1/2 bg-gradient-to-br from-primary to-blue-800 text-white p-6 md:p-12 flex flex-col justify-center order-1 md:order-2">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-6">
            <BarChart3 className="h-10 w-10 mr-2" />
            <h1 className="text-3xl font-bold">GoVertX</h1>
          </div>
          
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            Connect, Create, and Earn
          </h2>
          
          <p className="text-lg mb-6 opacity-90">
            GoVertX helps content creators manage their profiles, earn credits, and interact with aggregated social media content in one place.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <ChevronRight className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Social Feed Aggregator</h3>
                <p className="opacity-80">Get content from Twitter, Reddit, and more in one unified feed.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <ChevronRight className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Credit Points System</h3>
                <p className="opacity-80">Earn credits by logging in, completing your profile, and engaging with content.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <ChevronRight className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Creator Dashboard</h3>
                <p className="opacity-80">Track your performance, saved content, and credit balance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Form - Left side on desktop, bottom on mobile */}
      <div className="md:w-1/2 flex items-center justify-center p-6 md:p-12 order-2 md:order-1">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{isLogin ? "Login to your account" : "Create an account"}</CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your credentials to access your account"
                : "Fill out the form to create your creator account"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLogin ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="johndoe" 
                            value={formState.username}
                            onChange={(e) => handleFieldChange("username", e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="john@example.com" 
                            value={formState.email}
                            onChange={(e) => handleFieldChange("email", e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            value={formState.password}
                            onChange={(e) => handleFieldChange("password", e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            value={formState.confirmPassword}
                            onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          
          <CardFooter>
            <div className="text-center w-full">
              {isLogin ? (
                <p className="text-sm">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-primary hover:underline font-medium"
                  >
                    Register
                  </button>
                </p>
              ) : (
                <p className="text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-primary hover:underline font-medium"
                  >
                    Login
                  </button>
                </p>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
