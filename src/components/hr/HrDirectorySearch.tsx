import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  full_name: string;
  employee_id: string;
  designation: string | null;
  department_name: string | null;
}

const HrDirectorySearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from("hr_employees")
        .select("id, full_name, employee_id, designation, hr_departments(name)")
        .or(`full_name.ilike.%${query}%,employee_id.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(8);
      setResults((data || []).map((e: any) => ({
        id: e.id,
        full_name: e.full_name,
        employee_id: e.employee_id,
        designation: e.designation,
        department_name: e.hr_departments?.name || null,
      })));
      setLoading(false);
      setOpen(true);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div ref={ref} className="relative hidden sm:block">
      <div className="flex items-center gap-2 max-w-md">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees, departments..."
          className="h-9 border-0 bg-muted/50 w-64"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }} className="absolute right-2">
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-80 bg-popover border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-sm text-muted-foreground">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">No results found</div>
          ) : results.map(r => (
            <button
              key={r.id}
              className="w-full flex items-center gap-3 p-3 hover:bg-muted text-left transition-colors"
              onClick={() => {
                setOpen(false);
                setQuery("");
                navigate("/hr/employees");
              }}
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{r.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {r.employee_id}{r.designation ? ` · ${r.designation}` : ""}{r.department_name ? ` · ${r.department_name}` : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HrDirectorySearch;
