import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { LogOut, Settings, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RANK_INFO } from '@/types';

export const DashboardHeader = () => {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const currentRank = profile?.current_rank || 'padatik';
  const rankInfo = RANK_INFO[currentRank];
  
  // Find next rank
  const rankKeys = Object.keys(RANK_INFO) as (keyof typeof RANK_INFO)[];
  const currentRankIndex = rankKeys.indexOf(currentRank);
  const nextRank = currentRankIndex < rankKeys.length - 1 ? rankKeys[currentRankIndex + 1] : null;
  const nextRankInfo = nextRank ? RANK_INFO[nextRank] : null;
  
  const progressPercentage = nextRankInfo 
    ? Math.min(((profile?.sadhana_points || 0) / nextRankInfo.pointsRequired) * 100, 100)
    : 100;

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Logo size="md" />
          
          {/* Navigation Menu */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/yoga"
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  >
                    Yoga Studio
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/astrology"
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  >
                    Astrology
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          
          <div className="flex items-center gap-6">
            {/* Rank Progress */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-gold" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-devanagari text-xs">
                      {rankInfo.sanskrit}
                    </Badge>
                    <span className="text-sm font-semibold text-sacred">
                      {rankInfo.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-32">
                    <span className="text-xs text-muted-foreground">
                      {profile?.sadhana_points || 0} SP
                    </span>
                    {nextRankInfo && (
                      <>
                        <Progress value={progressPercentage} className="h-1 flex-1" />
                        <span className="text-xs text-muted-foreground">
                          {nextRankInfo.pointsRequired}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* User Avatar & Menu */}
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                <AvatarImage src={`https://avatar.vercel.sh/${user?.email}`} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="p-2">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="p-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};