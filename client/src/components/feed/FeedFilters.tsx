import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FeedFiltersProps {
  onFilterChange: (filters: {
    source: string;
    contentType: string;
    searchTerm: string;
  }) => void;
}

export default function FeedFilters({ onFilterChange }: FeedFiltersProps) {
  const [source, setSource] = useState("all");
  const [contentType, setContentType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSourceChange = (value: string) => {
    setSource(value);
    onFilterChange({ source: value, contentType, searchTerm });
  };
  
  const handleContentTypeChange = (value: string) => {
    setContentType(value);
    onFilterChange({ source, contentType: value, searchTerm });
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onFilterChange({ source, contentType, searchTerm: value });
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <Label htmlFor="source-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </Label>
            <Select value={source} onValueChange={handleSourceChange}>
              <SelectTrigger id="source-filter" className="w-full">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="reddit">Reddit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* <div className="flex-1">
            <Label htmlFor="content-type" className="block text-sm font-medium text-gray-700 mb-1">
              Content Type
            </Label>
            <Select value={contentType} onValueChange={handleContentTypeChange}>
              <SelectTrigger id="content-type" className="w-full">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="posts">Posts</SelectItem>
                <SelectItem value="images">Images</SelectItem>
                <SelectItem value="polls">Polls</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          
          {/* <div className="flex-1">
            <Label htmlFor="search-feed" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </Label> */}
            {/* <div className="relative">
              <Input
                id="search-feed"
                type="text"
                placeholder="Search content..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div> */}
          {/* </div> */}
        </div>
      </CardContent>
    </Card>
  );
}
