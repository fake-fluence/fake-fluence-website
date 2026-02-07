import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Sparkles, Loader2 } from "lucide-react";

export interface ContentPlanEntry {
  id: string;
  postType: string;
  platform: "LinkedIn" | "Instagram" | "Both";
  constraints: string;
  designElements: string;
}

interface ContentPlanFormProps {
  onSubmit: (entries: ContentPlanEntry[]) => void;
  isGenerating: boolean;
}

const postTypeOptions = [
  "Announce a new product",
  "Promote an upcoming hackathon",
  "Announce a partnership",
  "Promote a venture track or demo day",
  "Custom",
];

const ContentPlanForm = ({ onSubmit, isGenerating }: ContentPlanFormProps) => {
  const [entries, setEntries] = useState<ContentPlanEntry[]>([
    {
      id: crypto.randomUUID(),
      postType: "",
      platform: "Both",
      constraints: "",
      designElements: "",
    },
  ]);

  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        postType: "",
        platform: "Both",
        constraints: "",
        designElements: "",
      },
    ]);
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const updateEntry = (id: string, field: keyof ContentPlanEntry, value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validEntries = entries.filter((e) => e.postType.trim() !== "");
    if (validEntries.length > 0) {
      onSubmit(validEntries);
    }
  };

  const isValid = entries.some((e) => e.postType.trim() !== "");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground">
            Content Plan
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Define the posts you want the creator to make. We'll generate variations for each.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addEntry}>
          <Plus className="w-4 h-4 mr-2" />
          Add Post
        </Button>
      </div>

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <Card key={entry.id} className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  Post {index + 1}
                </CardTitle>
                {entries.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeEntry(entry.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`postType-${entry.id}`}>Post Type / Intent *</Label>
                  <Select
                    value={postTypeOptions.includes(entry.postType) ? entry.postType : "Custom"}
                    onValueChange={(value) => {
                      if (value === "Custom") {
                        updateEntry(entry.id, "postType", "");
                      } else {
                        updateEntry(entry.id, "postType", value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select post type" />
                    </SelectTrigger>
                    <SelectContent>
                      {postTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(!postTypeOptions.includes(entry.postType) || entry.postType === "") && (
                    <Input
                      id={`postType-${entry.id}`}
                      placeholder="Enter custom post type..."
                      value={entry.postType}
                      onChange={(e) => updateEntry(entry.id, "postType", e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`platform-${entry.id}`}>Platform</Label>
                  <Select
                    value={entry.platform}
                    onValueChange={(value) =>
                      updateEntry(entry.id, "platform", value as ContentPlanEntry["platform"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Both">Both Platforms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`constraints-${entry.id}`}>
                  Constraints{" "}
                  <span className="text-muted-foreground font-normal">
                    (date, tone, CTA - optional)
                  </span>
                </Label>
                <Input
                  id={`constraints-${entry.id}`}
                  placeholder="e.g., Launch date: March 15, Professional tone, CTA: Sign up now"
                  value={entry.constraints}
                  onChange={(e) => updateEntry(entry.id, "constraints", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`designElements-${entry.id}`}>
                  Design Elements / Content Details{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id={`designElements-${entry.id}`}
                  placeholder="e.g., Speaker names, prize announcements, specific images to include, brand colors..."
                  value={entry.designElements}
                  onChange={(e) => updateEntry(entry.id, "designElements", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg" disabled={!isValid || isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Variations...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Post Variations
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ContentPlanForm;
