import { useState } from "react";
import { Copy, X } from "lucide-react";
import { FaFacebookF, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FeedItem } from "@shared/schema";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FeedItem | null;
}

export default function ShareModal({ isOpen, onClose, item }: ShareModalProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [note, setNote] = useState("");
  
  if (!item) return null;
  
  const shareUrl = item.contentUrl || `https://govertx.com/share/${item.id}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    });
  };
  
  const handleShare = () => {
    // In a real app, this would submit the sharing info to the backend
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Content</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <Label className="mb-2">Share Link</Label>
            <div className="flex">
              <Input 
                value={shareUrl} 
                readOnly 
                className="flex-1 rounded-r-none"
              />
              <Button 
                className="rounded-l-none" 
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {linkCopied && (
              <p className="text-xs text-green-500 mt-1">Link copied to clipboard!</p>
            )}
          </div>
          
          <div className="mb-4">
            <Label className="mb-2">Share on Social Media</Label>
            <div className="flex space-x-3">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                <FaFacebookF className="mr-2" /> Facebook
              </Button>
              <Button className="flex-1 bg-blue-400 hover:bg-blue-500">
                <FaTwitter className="mr-2" /> Twitter
              </Button>
              <Button className="flex-1 bg-green-500 hover:bg-green-600">
                <FaWhatsapp className="mr-2" /> WhatsApp
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="share-note" className="mb-2">Add a Note</Label>
            <Textarea 
              id="share-note"
              placeholder="Write a note about this content..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleShare}>
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
