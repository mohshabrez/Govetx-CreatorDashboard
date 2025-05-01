import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  BarChart3, 
  Podcast, 
  Bookmark, 
  User, 
  Coins, 
  Users, 
  BadgeDollarSign, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { getCredits } from "@/lib/socialApi";

export default function MobileMenu() {
  const [location] = useLocation();
  const { user, isAdmin, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: creditData } = useQuery({
    queryKey: ['/api/credits'],
    queryFn: getCredits,
    enabled: !!user,
  });
  
  // Close menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);
  
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
    closeMenu();
  };
  
  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-sidebar z-10 text-sidebar-foreground p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center">
          <BarChart3 className="mr-2 text-primary" />
          GoVertX
        </h1>
        <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-sidebar-foreground">
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-20" 
          onClick={closeMenu}
        ></div>
      )}
      
      {/* Mobile Menu Sidebar */}
      <aside 
        className={`md:hidden fixed top-0 right-0 bottom-0 w-64 bg-sidebar text-sidebar-foreground shadow-lg z-30 transition-transform transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-sidebar-border flex justify-between items-center">
          <h1 className="text-xl font-bold">GoVertX</h1>
          <Button variant="ghost" size="icon" onClick={closeMenu} className="text-sidebar-foreground">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="py-4">
          <Link 
            href="/"
            className={`flex items-center px-4 py-3 ${location === '/' ? 'bg-sidebar-accent/20 text-sidebar-foreground' : 'text-gray-300'}`}
          >
            <BarChart3 className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link 
            href="/feed"
            className={`flex items-center px-4 py-3 ${location === '/feed' ? 'bg-sidebar-accent/20 text-sidebar-foreground' : 'text-gray-300'}`}
          >
            <Podcast className="w-5 h-5 mr-3" />
            Feed
          </Link>
          <Link 
            href="/saved"
            className={`flex items-center px-4 py-3 ${location === '/saved' ? 'bg-sidebar-accent/20 text-sidebar-foreground' : 'text-gray-300'}`}
          >
            <Bookmark className="w-5 h-5 mr-3" />
            Saved Content
          </Link>
          <Link 
            href="/profile"
            className={`flex items-center px-4 py-3 ${location === '/profile' ? 'bg-sidebar-accent/20 text-sidebar-foreground' : 'text-gray-300'}`}
          >
            <User className="w-5 h-5 mr-3" />
            Profile
          </Link>
          <div className="flex items-center px-4 py-3 text-gray-300">
            <Coins className="w-5 h-5 mr-3" />
            <span>Credits</span>
            <span className="ml-auto font-semibold text-sidebar-primary">{creditData?.total || 0}</span>
          </div>
          
          {isAdmin && (
            <>
              <div className="px-4 mt-3 mb-1 text-xs font-semibold text-gray-400 uppercase">Admin</div>
              <Link href="/admin/users">
                <a className={`flex items-center px-4 py-3 ${location === '/admin/users' ? 'bg-sidebar-accent/20 text-sidebar-foreground' : 'text-gray-300'}`}>
                  <Users className="w-5 h-5 mr-3" />
                  User Management
                </a>
              </Link>
              <Link href="/admin/credits">
                <a className={`flex items-center px-4 py-3 ${location === '/admin/credits' ? 'bg-sidebar-accent/20 text-sidebar-foreground' : 'text-gray-300'}`}>
                  <BadgeDollarSign className="w-5 h-5 mr-3" />
                  Credit Management
                </a>
              </Link>
            </>
          )}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="flex items-center mb-3">
            <Avatar className="w-8 h-8 mr-2">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random`} alt={user?.username || 'User'} />
              <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user?.username}</p>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                <p className="text-xs text-gray-400">Online</p>
              </div>
            </div>
          </div>
          <Button 
            variant="outline"
            className="w-full bg-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </aside>
    </>
  );
}
