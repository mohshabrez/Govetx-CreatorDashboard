import { useState } from "react";
import { 
  Bookmark, 
  Share, 
  MoreHorizontal, 
  Heart, 
  MessageSquare, 
  Repeat, 
  Award, 
  ThumbsUp, 
  BookmarkCheck 
} from "lucide-react";
import { FaTwitter, FaReddit, FaLinkedin } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FeedItem } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { saveContent } from "@/lib/socialApi";
import { queryClient } from "@/lib/queryClient";

interface FeedCardProps {
  item: FeedItem;
  onShare: (item: FeedItem) => void;
  onReport: (item: FeedItem) => void;
  onCreditEarned: (amount: number) => void;
  isSaved?: boolean;
}

export default function FeedCard({ 
  item, 
  onShare, 
  onReport,
  onCreditEarned,
  isSaved = false
}: FeedCardProps) {
  const [saved, setSaved] = useState(isSaved);
  
  // Mutation for saving content
  const saveMutation = useMutation({
    mutationFn: saveContent,
    onSuccess: () => {
      setSaved(true);
      onCreditEarned(10);
      queryClient.invalidateQueries({ queryKey: ['/api/saved-content'] });
    },
  });
  
  const handleSave = () => {
    if (saved) return;
    
    saveMutation.mutate({
      contentId: item.id,
      source: item.source,
      content: item.content,
      contentUrl: item.contentUrl,
    });
  };
  
  const handleShare = () => {
    onShare(item);
    onCreditEarned(5);
  };
  
  // Format date
  const formattedDate = formatDistanceToNow(new Date(item.postedAt), { addSuffix: true });
  
  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-4">
        {/* Source and Time */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {item.source === 'twitter' && <FaTwitter className="text-blue-400 mr-2" />}
            {item.source === 'reddit' && <FaReddit className="text-orange-600 mr-2" />}
            {item.source === 'linkedin' && <FaLinkedin className="text-blue-700 mr-2" />}
            <span className="text-sm font-medium capitalize">{item.source}</span>
          </div>
          <span className="text-xs text-gray-500">{formattedDate}</span>
        </div>
        
        {/* Author */}
        <div className="flex items-center mb-3">
          {item.source === 'reddit' ? (
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <FaReddit size={20} />
            </div>
          ) : (
            <Avatar className="w-10 h-10">
              <AvatarImage 
                src={item.authorProfileImage || `https://ui-avatars.com/api/?name=${item.authorName}&background=random`} 
                alt={item.authorName} 
              />
              <AvatarFallback>{item.authorName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          )}
          
          <div className="ml-3">
            <p className="text-sm font-medium">{item.authorName}</p>
            {item.authorUsername && (
              <p className="text-xs text-gray-500">@{item.authorUsername}</p>
            )}
            {item.subreddit && (
              <p className="text-xs text-gray-500">{item.subreddit}</p>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="mb-3">
          <p className="text-gray-800">{item.content}</p>
        </div>
        
        {/* Media (if available) */}
        {item.media && item.media.type === 'image' && item.media.url && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img 
              src={item.media.url} 
              alt="Media content" 
              className="w-full h-48 object-cover"
            />
          </div>
        )}
        
        {/* Poll (if available) */}
        {item.media && item.media.type === 'poll' && item.media.pollOptions && (
          <div className="space-y-2 mb-3">
            {item.media.pollOptions.map((option, index) => (
              <div key={index} className="bg-gray-100 rounded-lg p-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{option.text}</span>
                  <span className="text-sm">{option.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full progress-animated" 
                    style={{ width: `${option.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 mb-3">
          {item.engagementStats?.likes && (
            <span><Heart size={14} className="inline mr-1" /> {item.engagementStats.likes} likes</span>
          )}
          {item.engagementStats?.upvotes && (
            <span><ThumbsUp size={14} className="inline mr-1" /> {item.engagementStats.upvotes} upvotes</span>
          )}
          {item.engagementStats?.comments && (
            <span><MessageSquare size={14} className="inline mr-1" /> {item.engagementStats.comments} comments</span>
          )}
          {item.engagementStats?.retweets && (
            <span><Repeat size={14} className="inline mr-1" /> {item.engagementStats.retweets} retweets</span>
          )}
          {item.engagementStats?.shares && (
            <span><Share size={14} className="inline mr-1" /> {item.engagementStats.shares} shares</span>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant={saved ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={handleSave}
            disabled={saved || saveMutation.isPending}
          >
            {saved ? (
              <>
                <BookmarkCheck className="mr-2 h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleShare}
          >
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="w-10 px-0"
            onClick={() => onReport(item)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
