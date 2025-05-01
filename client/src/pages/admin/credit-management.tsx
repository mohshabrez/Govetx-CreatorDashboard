import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Loader2, 
  Search, 
  Plus, 
  Coins, 
  ArrowUpDown,
  FileText
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Sidebar from "@/components/layout/Sidebar";
import MobileMenu from "@/components/layout/MobileMenu";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect } from "wouter";
import { api } from "@/lib/socialApi";

// Credit form schema
const creditFormSchema = z.object({
  userId: z.string(),
  amount: z.number().int().min(1, "Amount must be at least 1"),
  reason: z.string().min(3, "Reason is required"),
});

type CreditFormValues = z.infer<typeof creditFormSchema>;

// User type from the API
type AdminUser = {
  _id: string;
  username: string;
  email: string;
  role: string;
};

// Credit history entry
type CreditEntry = {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
    role: string;
  };
  amount: number;
  reason: string;
  createdAt: string;
};

// Credit history response type
interface CreditHistoryResponse {
  transactions: CreditEntry[];
  total: number;
}

export default function CreditManagementPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [addCreditDialogOpen, setAddCreditDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Fetch users list for the dropdown
  const { data: users = [], isLoading: loadingUsers } = useQuery<AdminUser[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      try {
        console.log('Fetching users...');
        const response = await api.get('/api/admin/users');
        console.log('Users response:', response.data);
        
        if (!response.data || !Array.isArray(response.data)) {
          console.error('Invalid users response format:', response.data);
          return [];
        }
        
        // Transform the data to match our expected format
        return response.data.map(user => ({
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }));
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    },
  });
  
  // Log users data for debugging
  console.log('Current users data:', users);
  
  // Fetch all credit history
  const { data: creditHistoryData, isLoading: loadingCredits } = useQuery<CreditHistoryResponse>({
    queryKey: ['/api/admin/credits/all'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/admin/credits/all');
        console.log('Credit history response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching credit history:', error);
        return {
          transactions: [],
          total: 0
        };
      }
    },
  });

  // Extract credit history array with default empty array
  const creditHistory = creditHistoryData?.transactions || [];
  
  // Filter and sort credit history
  const filteredHistory = creditHistory.filter((entry: CreditEntry) => 
    entry.userId && (
      entry.userId.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reason.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  const sortedHistory = [...filteredHistory].sort((a: CreditEntry, b: CreditEntry) => {
    if (!sortField) return 0;
    
    const direction = sortDirection === "asc" ? 1 : -1;
    
    switch (sortField) {
      case "username":
        return a.userId.username.localeCompare(b.userId.username) * direction;
      case "amount":
        return (a.amount - b.amount) * direction;
      case "reason":
        return a.reason.localeCompare(b.reason) * direction;
      case "createdAt":
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          direction
        );
      default:
        return 0;
    }
  });
  
  // Add credits mutation
  const addCreditsMutation = useMutation({
    mutationFn: async (values: CreditFormValues) => {
      const response = await api.post("/api/admin/credits", values);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Credits added",
        description: "Credits have been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/credits/all'] });
      setAddCreditDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to add credits",
        description: (error as Error).message || "Please try again later",
        variant: "destructive",
      });
    },
  });
  
  // Credit form
  const form = useForm<CreditFormValues>({
    resolver: zodResolver(creditFormSchema),
    defaultValues: {
      userId: "",
      amount: 0,
      reason: "",
    },
  });
  
  // Update form when selected user changes
  useState(() => {
    if (selectedUserId) {
      form.setValue("userId", selectedUserId);
    }
  });
  
  // Handle credit form submission
  function onSubmit(data: CreditFormValues) {
    addCreditsMutation.mutate(data);
  }
  
  // Open add credits dialog
  const openAddCreditsDialog = (userId?: string) => {
    form.reset({
      userId: userId || "",
      amount: 0,
      reason: ""
    });
    setAddCreditDialogOpen(true);
  };
  
  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if already sorting by this field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new sort field and default to descending for dates, ascending for others
      setSortField(field);
      setSortDirection(field === "createdAt" ? "desc" : "asc");
    }
  };
  
  // If not admin, redirect to home
  if (!isAdmin) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <MobileMenu />
      
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-8 bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Credit Management</h1>
              <p className="text-gray-600">Manage credit transactions for all users</p>
            </div>
            
            <Button 
              className="mt-4 md:mt-0" 
              onClick={() => openAddCreditsDialog()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Credits
            </Button>
          </div>
          
          {/* Search and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="col-span-1 md:col-span-2">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by username or reason..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 flex items-center">
                <div className="bg-primary-100 p-3 rounded-lg mr-3">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Transactions</p>
                  <p className="text-xl font-bold">{creditHistoryData?.total || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Credit History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Credit History</CardTitle>
              <CardDescription>View all credit transactions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCredits || loadingUsers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-medium"
                          onClick={() => handleSort("username")}
                        >
                          User
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-medium"
                          onClick={() => handleSort("amount")}
                        >
                          Amount
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-medium"
                          onClick={() => handleSort("reason")}
                        >
                          Reason
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-medium"
                          onClick={() => handleSort("createdAt")}
                        >
                          Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedHistory.length > 0 ? (
                      sortedHistory.map((entry: CreditEntry) => (
                        <TableRow key={entry._id}>
                          <TableCell>
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage 
                                  src={`https://ui-avatars.com/api/?name=${entry.userId.username || 'User'}&background=random`}
                                  alt={entry.userId.username || 'User'} 
                                />
                                <AvatarFallback>
                                  {entry.userId.username?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{entry.userId.username}</p>
                                <p className="text-xs text-gray-500">{entry.userId.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`font-semibold ${
                              entry.amount >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {entry.amount >= 0 ? '+' : ''}{entry.amount}
                            </span>
                          </TableCell>
                          <TableCell>{entry.reason}</TableCell>
                          <TableCell>
                            {format(new Date(entry.createdAt), "MMM d, yyyy • h:mm a")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openAddCreditsDialog(entry.userId._id)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add More
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                          {searchTerm
                            ? `No credit history found matching "${searchTerm}"`
                            : "No credit history found"
                          }
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-gray-500">
                Showing {sortedHistory.length} of {creditHistoryData?.total || 0} transactions
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      {/* Add Credits Dialog */}
      <Dialog open={addCreditDialogOpen} onOpenChange={setAddCreditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Credits</DialogTitle>
            <DialogDescription>
              Add credits to a user's account
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.isArray(users) && users.map((user: AdminUser) => (
                          user && user._id ? (
                            <SelectItem 
                              key={user._id} 
                              value={user._id.toString()}
                            >
                              {user.username || 'Unknown User'}
                            </SelectItem>
                          ) : null
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select a user to add credits to their account
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input 
                          type="number"
                          className="pl-10"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter a positive number to add credits
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Contest winner, Bug bounty" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a reason for adding these credits
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddCreditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={addCreditsMutation.isPending || !form.getValues("userId")}
                >
                  {addCreditsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>Add Credits</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
