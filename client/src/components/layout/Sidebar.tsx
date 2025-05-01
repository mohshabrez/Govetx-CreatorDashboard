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
  ChevronRight 
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { getCredits } from "@/lib/socialApi";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, isAdmin, logoutMutation } = useAuth();
  
  const { data: creditData } = useQuery({
    queryKey: ['/api/credits'],
    queryFn: getCredits,
    enabled: !!user,
  });
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <aside className="hidden md:flex fixed top-0 left-0 bottom-0 flex-col w-64 bg-sidebar text-sidebar-foreground shadow-lg">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold flex items-center">
          <BarChart3 className="mr-2 text-primary" />
          GoVertX
        </h1>
        <p className="text-xs text-gray-400 mt-1">Creator Platform</p>
      </div>
      
      <nav className="flex-1 py-4">
        <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">Main</div>
        <NavLink href="/" icon={<BarChart3 className="w-5 h-5 mr-2" />} label="Dashboard" currentPath={location} />
        <NavLink href="/feed" icon={<Podcast className="w-5 h-5 mr-2" />} label="Feed" currentPath={location} />
        <NavLink href="/saved" icon={<Bookmark className="w-5 h-5 mr-2" />} label="Saved Content" currentPath={location} />
        
        <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase">Account</div>
        <NavLink href="/profile" icon={<User className="w-5 h-5 mr-2" />} label="Profile" currentPath={location} />
        <div className="flex items-center px-4 py-2 text-gray-300 group">
          <Coins className="w-5 h-5 mr-2" />
          <span>Credits</span>
          <span className="ml-auto font-semibold text-sidebar-primary">{creditData?.total || 0}</span>
        </div>
        
        {isAdmin && (
          <>
            <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase">Admin</div>
            <NavLink href="/admin/users" icon={<Users className="w-5 h-5 mr-2" />} label="User Management" currentPath={location} />
            <NavLink href="/admin/credits" icon={<BadgeDollarSign className="w-5 h-5 mr-2" />} label="Credit Management" currentPath={location} />
          </>
        )}
      </nav>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center">
          <Avatar className="w-8 h-8 mr-2">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random`} alt={user?.username || 'User'} />
            <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{user?.username || 'User'}</p>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
              <p className="text-xs text-gray-400">Online</p>
            </div>
          </div>
        </div>
        <Button 
          variant="outline"
          className="mt-4 w-full bg-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
    </aside>
  );
}

type NavLinkProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  currentPath: string;
};

function NavLink({ href, icon, label, currentPath }: NavLinkProps) {
  const isActive = currentPath === href || 
    (href !== '/' && currentPath.startsWith(href));
    
  return (
    <Link 
      href={href}
      className={`flex items-center px-4 py-2 mb-1 transition-colors ${
        isActive 
          ? 'bg-sidebar-accent/20 text-sidebar-foreground font-medium' 
          : 'text-gray-300 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground'
      }`}
    >
      {icon}
      <span>{label}</span>
      {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
    </Link>
  );
}
