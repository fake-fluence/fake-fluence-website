import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Instagram,
  Link2,
  Unlink,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface InstagramConnectDialogProps {
  influencerId: string;
  influencerName: string;
}

interface CredentialsState {
  connected: boolean;
  username?: string;
  tokenExpiresAt?: string;
  updatedAt?: string;
}

const callInstagramApi = async (action: string, body: Record<string, unknown>) => {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/instagram-api?action=${action}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Instagram API error: ${response.status}`);
  }
  return data;
};

const InstagramConnectDialog = ({
  influencerId,
  influencerName,
}: InstagramConnectDialogProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [credentials, setCredentials] = useState<CredentialsState>({ connected: false });
  const [accessToken, setAccessToken] = useState("");

  // Fetch existing credentials when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchCredentials();
    }
  }, [isOpen]);

  const fetchCredentials = async () => {
    setIsFetching(true);
    try {
      const result = await callInstagramApi("get-credentials", { influencerId });
      setCredentials({
        connected: result.connected,
        username: result.credentials?.username,
        tokenExpiresAt: result.credentials?.tokenExpiresAt,
        updatedAt: result.credentials?.updatedAt,
      });
    } catch (error) {
      console.error("Error fetching credentials:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleConnect = async () => {
    if (!accessToken.trim()) return;

    setIsLoading(true);
    try {
      const result = await callInstagramApi("save-credentials", {
        influencerId,
        accessToken: accessToken.trim(),
      });

      setCredentials({
        connected: true,
        username: result.username,
      });
      setAccessToken("");

      toast({
        title: "Instagram Connected!",
        description: `Successfully connected @${result.username} for ${influencerName}.`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect Instagram account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await callInstagramApi("delete-credentials", { influencerId });
      setCredentials({ connected: false });
      toast({
        title: "Disconnected",
        description: `Instagram account disconnected for ${influencerName}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect Instagram account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tokenExpiresSoon = credentials.tokenExpiresAt
    ? new Date(credentials.tokenExpiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
    : false;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={credentials.connected ? "outline" : "secondary"}
          size="sm"
          className="gap-2"
        >
          <Instagram className="w-4 h-4" />
          {credentials.connected ? "IG Connected" : "Connect Instagram"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="w-5 h-5" />
            Instagram Graph API — {influencerName}
          </DialogTitle>
          <DialogDescription>
            Connect an Instagram Business/Creator account to enable automatic publishing via the Graph API.
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : credentials.connected ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Connected as @{credentials.username}</p>
                {credentials.updatedAt && (
                  <p className="text-xs text-muted-foreground">
                    Last updated: {new Date(credentials.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              {tokenExpiresSoon && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Token expiring
                </Badge>
              )}
            </div>

            {tokenExpiresSoon && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Your access token is expiring soon. Enter a new one to keep publishing:
                </p>
                <Input
                  type="password"
                  placeholder="New long-lived access token"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
                <Button
                  onClick={handleConnect}
                  disabled={!accessToken.trim() || isLoading}
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Link2 className="w-4 h-4 mr-2" />
                  )}
                  Update Token
                </Button>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
                disabled={isLoading}
              >
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-2">
                <p className="font-medium">How to get your access token:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
                  <li>Go to the <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-0.5">Graph API Explorer <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Select your Facebook App</li>
                  <li>Add permissions: <code className="bg-background px-1 rounded">instagram_basic</code>, <code className="bg-background px-1 rounded">instagram_content_publish</code>, <code className="bg-background px-1 rounded">pages_show_list</code></li>
                  <li>Generate an access token</li>
                  <li>Exchange for a long-lived token (60 days)</li>
                </ol>
              </div>

              <div className="space-y-2">
                <Label htmlFor="access-token">Instagram Access Token</Label>
                <Input
                  id="access-token"
                  type="password"
                  placeholder="Paste your long-lived access token here"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your token is stored securely and only accessible by backend functions.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                disabled={!accessToken.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Link2 className="w-4 h-4 mr-2" />
                )}
                Connect Account
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InstagramConnectDialog;
