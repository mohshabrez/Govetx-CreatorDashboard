import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Trash2, ExternalLink, BarChart3 } from "lucide-react";
import { FaTwitter, FaReddit } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Sidebar from "@/components/layout/Sidebar";
import MobileMenu from "@/components/layout/MobileMenu";
import { getSavedContent, deleteSavedContent } from "@/lib/socialApi";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

export default function SavedContentPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  
  // Fetch saved content
  const { data: savedContent, isLoading } = useQuery({
    queryKey: ['/api/saved-content'],
    queryFn: getSavedContent,
  });
  
  // Delete saved content mutation
  const deleteMutation = useMutation({
    mutationFn: deleteSavedContent,
    onSuccess: () => {
      toast({
        title: "Content deleted",
        description: "The saved content has been removed from your collection",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-content'] });
      setDeleteItemId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to delete content",
        variant: "destructive",
      });
    },
  });
  
  // Handle delete confirmation
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };
  
  // Filter content based on search term
  const filteredContent = savedContent?.filter(item => 
    item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.source.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <MobileMenu />
      
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-8 bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Saved Content</h1>
            <p className="text-gray-600">Manage your collection of saved posts and articles</p>
          </div>
          
          {/* Search Bar */}
          <div className="mb-6 relative">
            <Input
              type="text"
              placeholder="Search saved content..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
          
          {/* Content Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading your saved content...</span>
            </div>
          ) : filteredContent && filteredContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {/* Header with source and date */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        {item.source === 'twitter' && <FaTwitter className="text-blue-400 mr-2" />}
                        {item.source === 'reddit' && <FaReddit className="text-orange-600 mr-2" />}
                        {!['twitter', 'reddit'].includes(item.source) && <BarChart3 className="text-primary mr-2 h-4 w-4" />}
                        <span className="text-sm font-medium capitalize">{item.source}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(item.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="mb-4">
                      <p className="text-gray-800">{item.content}</p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-2 mt-4 pt-3 border-t border-gray-100">
                      {item.contentUrl && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => window.open(item.contentUrl, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" /> View Original
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteItemId(item.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" 
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No saved content found</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm 
                  ? `No results found for "${searchTerm}". Try a different search.` 
                  : "You haven't saved any content yet. Browse the feed to find and save content you like."}
              </p>
              <div className="mt-6">
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  {searchTerm ? "Clear Search" : "Browse Feed"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteItemId !== null} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this saved content from your collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteItemId && handleDelete(deleteItemId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
