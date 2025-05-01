import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Coins, Loader2, Globe, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/Sidebar";
import MobileMenu from "@/components/layout/MobileMenu";
import FeedCard from "@/components/feed/FeedCard";
import FeedFilters from "@/components/feed/FeedFilters";
import CreditToast from "@/components/feed/CreditToast";
import ShareModal from "@/components/feed/ShareModal";
import ReportModal from "@/components/feed/ReportModal";
import { queryClient } from "@/lib/queryClient";
import { 
  fetchRedditFeedDirect, 
  fetchTwitterFeedDirect, 
  fetchCombinedFeed, 
  getCredits, 
  getSavedContent 
} from "@/lib/socialApi";
import { FeedItem } from "@shared/schema";

type SavedContent = {
  contentId: string;
  source: string;
  content: string;
  contentUrl?: string;
}[];

export default function FeedPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    source: "all",
    contentType: "all",
    searchTerm: "",
  });
  
  // Credit toast state
  const [creditToast, setCreditToast] = useState({
    show: false,
    amount: 0,
  });
  
  // Modal states
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Load more state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // API status state
  const [apiStatus, setApiStatus] = useState({
    reddit: {
      connected: false,
      direct: true // Reddit uses direct API
    },
    twitter: {
      connected: false,
      direct: true, // Twitter now uses API proxy (still considered direct)
      proxy: true // Using proxy
    }
  });
  
  // Fetch combined feed when source is 'all'
  const { data: combinedFeed = { redditFeed: [], twitterFeed: [] }, isLoading: loadingCombined } = useQuery({
    queryKey: ['/api/feed/combined', filters],
    queryFn: () => fetchCombinedFeed({
      subreddit: 'javascript',
      query: filters.searchTerm || undefined,
      limit: 20,
    }),
    enabled: filters.source === 'all'
  });
  
  // Fetch Reddit feed using direct API (only when not using combined feed)
  const { data: redditFeed = { items: [], nextPageToken: null }, isLoading: loadingReddit } = useQuery({
    queryKey: ['/api/feed/reddit/direct', filters],
    queryFn: () => fetchRedditFeedDirect({
      subreddit: 'javascript',
      query: filters.searchTerm || undefined,
      limit: 20,
    }),
    enabled: filters.source === 'reddit'
  });
  
  // Fetch Twitter feed using direct API (only when not using combined feed)
  const { data: twitterFeed = { items: [], nextPageToken: null }, isLoading: loadingTwitter } = useQuery({
    queryKey: ['/api/feed/twitter/direct', filters],
    queryFn: () => fetchTwitterFeedDirect({
      query: filters.searchTerm || undefined,
      limit: 20,
    }),
    enabled: filters.source === 'twitter'
  });
  
  // Fetch credits data (for the credit card)
  const { data: creditData, refetch: refetchCredits } = useQuery({
    queryKey: ['/api/credits'],
    queryFn: getCredits,
    refetchInterval: 5000, // Refetch every 5 seconds
  });
  
  // Fetch saved content to mark items as saved
  const { data: savedContent = [] } = useQuery<SavedContent>({
    queryKey: ['/api/saved-content'],
    queryFn: getSavedContent,
  });
  
  // Combine and sort feed items based on filters
  const feedItems = (() => {
    let items: FeedItem[] = [];
    
    if (filters.source === 'all') {
      // Use the combined feed when source is 'all'
      items = [...combinedFeed.redditFeed, ...combinedFeed.twitterFeed];
    } else if (filters.source === 'reddit') {
      items = [...redditFeed.items];
    } else if (filters.source === 'twitter') {
      items = [...twitterFeed.items];
    }
    
    // Sort by date
    items.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    
    // Filter by content type
    if (filters.contentType !== 'all') {
      items = items.filter(item => {
        if (filters.contentType === 'images' && item.media?.type === 'image') return true;
        if (filters.contentType === 'polls' && item.media?.type === 'poll') return true;
        if (filters.contentType === 'posts' && !item.media) return true;
        return false;
      });
    }
    
    return items;
  })();
  
  // Handle filter changes
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
    setHasMore(true);
  };
  
  // Handle showing credit toast
  const handleCreditEarned = async (amount: number) => {
    try {
      setCreditToast({ show: true, amount });
      
      // Immediately update the local state optimistically
      if (creditData) {
        queryClient.setQueryData(['/api/credits'], {
          ...creditData,
          total: (creditData.total || 0) + amount,
          credits: [
            {
              amount,
              reason: "Earned from interaction",
              createdAt: new Date().toISOString()
            },
            ...(creditData.credits || [])
          ]
        });
      }
      
      // Then refetch to ensure we have the latest data
      await refetchCredits();
    } catch (error) {
      console.error('Error handling credit earned:', error);
    }
  };
  
  // Handle share button click
  const handleShare = (item: FeedItem) => {
    setSelectedItem(item);
    setShowShareModal(true);
  };
  
  // Handle report button click
  const handleReport = (item: FeedItem) => {
    setSelectedItem(item);
    setShowReportModal(true);
  };
  
  // Check if an item is saved
  const isItemSaved = (itemId: string) => {
    return Array.isArray(savedContent) && savedContent.some((saved) => saved.contentId === itemId);
  };
  
  const isLoading = loadingCombined || loadingReddit || loadingTwitter;
  
  // Update API status when feeds are successfully loaded
  useEffect(() => {
    if (filters.source === 'all' && !loadingCombined) {
      setApiStatus({
        reddit: {
          connected: combinedFeed.redditFeed.length > 0,
          direct: true
        },
        twitter: {
          connected: combinedFeed.twitterFeed.length > 0,
          direct: true,
          proxy: true
        }
      });
    } else if (filters.source === 'reddit' && !loadingReddit) {
      setApiStatus(prev => ({
        ...prev,
        reddit: {
          connected: redditFeed.items.length > 0,
          direct: true
        }
      }));
    } else if (filters.source === 'twitter' && !loadingTwitter) {
      setApiStatus(prev => ({
        ...prev,
        twitter: {
          connected: twitterFeed.items.length > 0,
          direct: true,
          proxy: true
        }
      }));
    }
  }, [combinedFeed, redditFeed, twitterFeed, filters.source, loadingCombined, loadingReddit, loadingTwitter]);
  
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <MobileMenu />
      
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-8 bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {/* Feed Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-800">Your Feed</h1>
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                  Direct API
                </Badge>
              </div>
              <p className="text-gray-600">Discover and interact with content from your favorite platforms</p>
              
              {/* API Status Indicators */}
              <div className="flex mt-2 space-x-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`flex items-center text-xs ${apiStatus.reddit.connected ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-1 ${apiStatus.reddit.connected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Reddit API
                        {apiStatus.reddit.connected && <Check className="h-3 w-3 ml-1" />}
                        {apiStatus.reddit.direct && <Badge variant="outline" className="ml-1 text-[10px] py-0 h-4">Direct</Badge>}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reddit API: {apiStatus.reddit.connected ? 'Connected' : 'Not connected'}</p>
                      <p className="text-xs text-gray-500">{apiStatus.reddit.direct ? 'Using direct API connection' : 'Using backend API'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`flex items-center text-xs ${apiStatus.twitter.connected ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-1 ${apiStatus.twitter.connected ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        Twitter API
                        {apiStatus.twitter.connected && <Check className="h-3 w-3 ml-1" />}
                        {apiStatus.twitter.direct && <Badge variant="outline" className="ml-1 text-[10px] py-0 h-4">
                          {apiStatus.twitter.proxy ? 'Proxy' : 'Direct'}
                        </Badge>}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Twitter API: {apiStatus.twitter.connected ? 'Connected' : 'Not connected'}</p>
                      <p className="text-xs text-gray-500">
                        {apiStatus.twitter.direct 
                          ? (apiStatus.twitter.proxy 
                              ? 'Using server proxy to Twitter API' 
                              : 'Using direct API connection')
                          : 'Using backend API'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            {/* Credit Status Card */}
            <Card className="mt-4 md:mt-0 shadow-sm">
              <CardContent className="p-4 flex items-center">
                <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center text-white">
                  <Coins className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Your Credits</p>
                  <p className="text-xl font-bold text-gray-800">{creditData?.total || 0}</p>
                </div>
                <Link href="/profile" className="ml-4 text-primary hover:text-primary-dark">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          {/* Feed Filters */}
          <FeedFilters onFilterChange={handleFilterChange} />
          
          {/* Feed Content */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading your feed...</span>
            </div>
          ) : feedItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedItems.map((item) => (
                <FeedCard
                  key={item.id}
                  item={item}
                  onShare={handleShare}
                  onReport={handleReport}
                  onCreditEarned={handleCreditEarned}
                  isSaved={isItemSaved(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 mx-auto text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No content found</h3>
              <p className="mt-1 text-gray-500">
                {filters.searchTerm 
                  ? `No results found for "${filters.searchTerm}". Try a different search.` 
                  : "Try adjusting your filters or check back later for new content."}
              </p>
              <div className="mt-6">
                <Button onClick={() => {
                  setFilters({ source: "all", contentType: "all", searchTerm: "" });
                }}>
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
          
          {/* Credit Toast */}
          <CreditToast 
            show={creditToast.show} 
            amount={creditToast.amount} 
            onClose={() => setCreditToast({ show: false, amount: 0 })} 
          />
          
          {/* Share Modal */}
          <ShareModal 
            isOpen={showShareModal} 
            onClose={() => setShowShareModal(false)} 
            item={selectedItem} 
          />
          
          {/* Report Modal */}
          <ReportModal 
            isOpen={showReportModal} 
            onClose={() => setShowReportModal(false)} 
            item={selectedItem} 
          />
        </div>
      </main>
    </div>
  );
}
