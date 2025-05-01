import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Loader2,
  Search,
  UserCog,
  Shield,
  User,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/layout/Sidebar";
import MobileMenu from "@/components/layout/MobileMenu";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Redirect } from "wouter";
import { api } from "@/lib/socialApi";

// User type from the API
type AdminUser = {
  id: number;
  username: string;
  email: string;
  role: string;
  profileCompleted: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export default function UserManagementPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  
  // Fetch users list
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await api.get('/api/admin/users');
      return response.data;
    },
  });
  
  // Change role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const response = await api.post("/api/admin/user-role", { userId, role });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Role updated",
        description: `User role has been updated to ${newRole}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setRoleDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update role",
        description: (error as Error).message || "Please try again later",
        variant: "destructive",
      });
    },
  });
  
  // Handle role change
  const handleRoleChange = () => {
    if (!selectedUser || !newRole) return;
    
    updateRoleMutation.mutate({
      userId: selectedUser.id,
      role: newRole,
    });
  };
  
  // Open role dialog
  const openRoleDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleDialogOpen(true);
  };
  
  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if already sorting by this field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new sort field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Filter and sort users
  const filteredUsers = users?.filter(
    (user: AdminUser) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const sortedUsers = [...filteredUsers].sort((a: AdminUser, b: AdminUser) => {
    if (!sortField) return 0;
    
    const direction = sortDirection === "asc" ? 1 : -1;
    
    switch (sortField) {
      case "username":
        return a.username.localeCompare(b.username) * direction;
      case "email":
        return a.email.localeCompare(b.email) * direction;
      case "role":
        return a.role.localeCompare(b.role) * direction;
      case "createdAt":
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          direction
        );
      case "lastLoginAt":
        if (!a.lastLoginAt) return direction;
        if (!b.lastLoginAt) return -direction;
        return (
          (new Date(a.lastLoginAt).getTime() -
            new Date(b.lastLoginAt).getTime()) *
          direction
        );
      default:
        return 0;
    }
  });
  
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-600">Manage users and their roles</p>
          </div>
          
          {/* Search and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="col-span-1 md:col-span-2">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users by name or email..."
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
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-xl font-bold">{users?.length || 0}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg mr-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Admins</p>
                  <p className="text-xl font-bold">
                    {users?.filter((u: AdminUser) => u.role === "admin").length || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage all registered users on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
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
                          Username
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-medium"
                          onClick={() => handleSort("email")}
                        >
                          Email
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-medium"
                          onClick={() => handleSort("role")}
                        >
                          Role
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Profile</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-medium"
                          onClick={() => handleSort("createdAt")}
                        >
                          Created
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-medium"
                          onClick={() => handleSort("lastLoginAt")}
                        >
                          Last Login
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedUsers.length > 0 ? (
                      sortedUsers.map((user: AdminUser) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              user.role === "admin" 
                                ? "bg-blue-100 text-blue-800" 
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {user.role === "admin" ? (
                                <Shield className="mr-1 h-3 w-3" />
                              ) : (
                                <User className="mr-1 h-3 w-3" />
                              )}
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            {user.profileCompleted ? (
                              <span className="inline-flex items-center text-green-600">
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Complete
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-orange-600">
                                <XCircle className="mr-1 h-4 w-4" />
                                Incomplete
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "Never"}
                          </TableCell>
                          <TableCell>
                            {user.lastLoginAt 
                              ? format(new Date(user.lastLoginAt), "MMM d, yyyy")
                              : "Never"
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openRoleDialog(user)}
                                  className="cursor-pointer"
                                >
                                  <UserCog className="mr-2 h-4 w-4" />
                                  Change Role
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                          {searchTerm
                            ? `No users found matching "${searchTerm}"`
                            : "No users found"
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
                Showing {sortedUsers.length} of {users?.length || 0} users
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      {/* Change Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change the role for user {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select 
              value={newRole} 
              onValueChange={setNewRole}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleRoleChange}
              disabled={
                updateRoleMutation.isPending || 
                !newRole || 
                newRole === selectedUser?.role
              }
            >
              {updateRoleMutation.isPending ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
