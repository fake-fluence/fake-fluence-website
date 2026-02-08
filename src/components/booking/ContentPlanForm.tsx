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
import { Plus, Trash2, Sparkles, Loader2, Linkedin, Instagram } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

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

const ContentPlanForm = ({ onSubmit, isGenerating }: ContentPlanFormProps) => {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<ContentPlanEntry[]>([
    {
      id: crypto.randomUUID(),
      postType: "",
      platform: "Both",
      constraints: "",
      designElements: "",
    },
  ]);

  const postTypeOptions = [
    { key: "announceProduct", value: t.booking.contentPlan.postTypes.announceProduct },
    { key: "promoteHackathon", value: t.booking.contentPlan.postTypes.promoteHackathon },
    { key: "announcePartnership", value: t.booking.contentPlan.postTypes.announcePartnership },
    { key: "promoteDemoDay", value: t.booking.contentPlan.postTypes.promoteDemoDay },
    { key: "custom", value: t.booking.contentPlan.postTypes.custom },
  ];

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
  const postTypeValues = postTypeOptions.map((o) => o.value);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground">
            {t.booking.contentPlan.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t.booking.contentPlan.description}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addEntry}>
          <Plus className="w-4 h-4 mr-2" />
          {t.booking.contentPlan.addPost}
        </Button>
      </div>

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <Card key={entry.id} className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  {t.booking.contentPlan.post} {index + 1}
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
                  <Label htmlFor={`postType-${entry.id}`}>{t.booking.contentPlan.postType} *</Label>
                  <Select
                    value={postTypeValues.includes(entry.postType) ? entry.postType : t.booking.contentPlan.postTypes.custom}
                    onValueChange={(value) => {
                      if (value === t.booking.contentPlan.postTypes.custom) {
                        updateEntry(entry.id, "postType", "");
                      } else {
                        updateEntry(entry.id, "postType", value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.booking.contentPlan.postType} />
                    </SelectTrigger>
                    <SelectContent>
                      {postTypeOptions.map((type) => (
                        <SelectItem key={type.key} value={type.value}>
                          {type.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(!postTypeValues.includes(entry.postType) || entry.postType === "") && (
                    <Input
                      id={`postType-${entry.id}`}
                      placeholder={t.booking.contentPlan.postTypes.custom + "..."}
                      value={entry.postType}
                      onChange={(e) => updateEntry(entry.id, "postType", e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`platform-${entry.id}`}>{t.booking.contentPlan.platform}</Label>
                  <Select
                    value={entry.platform}
                    onValueChange={(value) =>
                      updateEntry(entry.id, "platform", value as ContentPlanEntry["platform"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue>
                        <span className="flex items-center gap-2">
                          {entry.platform === "LinkedIn" && (
                            <>
                              <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                              {t.booking.contentPlan.platforms.linkedin}
                            </>
                          )}
                          {entry.platform === "Instagram" && (
                            <>
                              <Instagram className="w-4 h-4 text-[#E4405F]" />
                              {t.booking.contentPlan.platforms.instagram}
                            </>
                          )}
                          {entry.platform === "Both" && (
                            <>
                              <span className="flex items-center gap-1">
                                <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                                <Instagram className="w-4 h-4 text-[#E4405F]" />
                              </span>
                              {t.booking.contentPlan.platforms.both}
                            </>
                          )}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LinkedIn">
                        <span className="flex items-center gap-2">
                          <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                          {t.booking.contentPlan.platforms.linkedin}
                        </span>
                      </SelectItem>
                      <SelectItem value="Instagram">
                        <span className="flex items-center gap-2">
                          <Instagram className="w-4 h-4 text-[#E4405F]" />
                          {t.booking.contentPlan.platforms.instagram}
                        </span>
                      </SelectItem>
                      <SelectItem value="Both">
                        <span className="flex items-center gap-2">
                          <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                          <Instagram className="w-4 h-4 text-[#E4405F]" />
                          {t.booking.contentPlan.platforms.both}
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`constraints-${entry.id}`}>
                  {t.booking.contentPlan.constraints}{" "}
                  <span className="text-muted-foreground font-normal">
                    {t.booking.contentPlan.constraintsHint}
                  </span>
                </Label>
                <Input
                  id={`constraints-${entry.id}`}
                  placeholder={t.booking.contentPlan.constraintsPlaceholder}
                  value={entry.constraints}
                  onChange={(e) => updateEntry(entry.id, "constraints", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`designElements-${entry.id}`}>
                  {t.booking.contentPlan.designElements}{" "}
                  <span className="text-muted-foreground font-normal">{t.booking.contentPlan.designElementsHint}</span>
                </Label>
                <Textarea
                  id={`designElements-${entry.id}`}
                  placeholder={t.booking.contentPlan.designElementsPlaceholder}
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
              {t.booking.contentPlan.generating}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              {t.booking.contentPlan.generate}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ContentPlanForm;
