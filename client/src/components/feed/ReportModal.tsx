import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FeedItem } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { reportContent } from "@/lib/socialApi";
import { useToast } from "@/hooks/use-toast";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FeedItem | null;
}

export default function ReportModal({ isOpen, onClose, item }: ReportModalProps) {
  const [reason, setReason] = useState<string>("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const { toast } = useToast();
  
  const reportMutation = useMutation({
    mutationFn: reportContent,
    onSuccess: () => {
      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep our platform safe",
        variant: "success",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to submit report",
        description: (error as Error).message || "Please try again later",
        variant: "destructive",
      });
    },
  });
  
  if (!item) return null;
  
  const handleSubmit = () => {
    if (!reason) {
      toast({
        title: "Please select a reason",
        description: "You must select a reason for reporting this content",
        variant: "destructive",
      });
      return;
    }
    
    reportMutation.mutate({
      contentId: item.id,
      source: item.source,
      reason,
      additionalDetails,
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-600 mb-4">Please let us know why you're reporting this content:</p>
          
          <RadioGroup value={reason} onValueChange={setReason} className="space-y-2 mb-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="inappropriate" id="inappropriate" />
              <Label htmlFor="inappropriate">Inappropriate content</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="spam" id="spam" />
              <Label htmlFor="spam">Spam or misleading</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="duplicate" id="duplicate" />
              <Label htmlFor="duplicate">Duplicate content</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="harmful" id="harmful" />
              <Label htmlFor="harmful">Harmful or dangerous content</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Other</Label>
            </div>
          </RadioGroup>
          
          <div>
            <Label htmlFor="additional-details" className="block text-sm font-medium mb-2">
              Additional Details (Optional)
            </Label>
            <Textarea
              id="additional-details"
              placeholder="Please provide any additional details about your report..."
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit}
            disabled={reportMutation.isPending}
          >
            {reportMutation.isPending ? "Submitting..." : "Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
