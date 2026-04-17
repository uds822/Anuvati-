import { Linkedin, Twitter, Facebook, Share2, Mail, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  title?: string;
  url?: string;
  description?: string;
  variant?: "icons" | "buttons";
}

const ShareButtons = ({ title, url, description, variant = "icons" }: ShareButtonsProps) => {
  const { toast } = useToast();
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareTitle = title || "Check this out from ANUVATI";

  if (variant === "buttons") {
    const handleCopyLink = async () => {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link Copied!", description: "Share it with someone who might be interested." });
    };

    const handleWhatsApp = () => {
      const text = `${shareTitle}\n\n${description || ""}\n\nApply here: ${shareUrl}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    };

    const handleEmail = () => {
      const subject = encodeURIComponent(shareTitle);
      const body = encodeURIComponent(`Hi,\n\nI thought you might be interested in this opportunity:\n\n${shareTitle}\n${description || ""}\n\nApply here: ${shareUrl}\n\nBest regards`);
      window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    };

    return (
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="lg" onClick={handleWhatsApp} className="font-heading font-semibold gap-2 text-green-700 border-green-200 hover:bg-green-50">
          <Share2 size={16} /> Share on WhatsApp
        </Button>
        <Button variant="outline" size="lg" onClick={handleEmail} className="font-heading font-semibold gap-2">
          <Mail size={16} /> Email to Someone
        </Button>
        <Button variant="ghost" size="lg" onClick={handleCopyLink} className="font-heading font-semibold gap-2">
          <Copy size={16} /> Copy Link
        </Button>
      </div>
    );
  }

  const links = [
    {
      label: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
  ];

  return (
    <div className="flex items-center gap-4 py-6 border-t border-border mt-8">
      <span className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider">
        Share this page
      </span>
      <div className="flex items-center gap-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${link.label}`}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:-translate-y-0.5 transition-all duration-200"
          >
            <link.icon size={16} strokeWidth={1.5} />
          </a>
        ))}
      </div>
    </div>
  );
};

export default ShareButtons;
