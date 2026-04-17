import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

const HrPlaceholder = () => {
  const { pathname } = useLocation();
  const section = pathname.split("/hr/")[1] || "section";

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-8">
          <Construction className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground capitalize mb-2">
            {section.replace(/-/g, " ")}
          </h2>
          <p className="text-muted-foreground">
            This module is coming soon in Phase 2.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HrPlaceholder;
