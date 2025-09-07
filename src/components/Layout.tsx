import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Upload, 
  User, 
  History, 
  LogOut,
  FileText,
  Menu
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Upload, label: 'Upload Resumes', path: '/upload' },
    { icon: FileText, label: 'Job Descriptions', path: '/jobs' },
    { icon: History, label: 'History', path: '/history' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const Sidebar = ({ className = "" }: { className?: string }) => (
    <div className={`bg-card border-r border-border flex flex-col ${className}`}>
      <div className="p-4 sm:p-6">
        <h1 
          className="text-lg sm:text-xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
          onClick={() => navigate('/dashboard')}
        >
          AI-powered Resume Screening & Job Matchmaker
        </h1>
      </div>
      
      <nav className="flex-1 px-3 sm:px-4 space-y-1 sm:space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start text-sm sm:text-base py-2 h-auto"
              onClick={() => handleNavigate(item.path)}
            >
              <Icon className="mr-2 sm:mr-3 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Button>
          );
        })}
      </nav>
      
      <div className="p-3 sm:p-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full justify-start text-sm sm:text-base py-2 h-auto"
          onClick={signOut}
        >
          <LogOut className="mr-2 sm:mr-3 h-4 w-4 flex-shrink-0" />
          <span className="truncate">Sign Out</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-card border-b border-border p-4 flex justify-between items-center">
        <h1 
          className="text-lg font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
          onClick={() => navigate('/dashboard')}
        >
          AI-powered Resume Screening
        </h1>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 lg:w-72">
        <Sidebar className="w-full" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;