import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCrmRole } from "@/hooks/useCrmRole";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Upload, Image as ImageIcon, Download, Search, X, CheckCircle, XCircle, Flag } from "lucide-react";
import { toast } from "sonner";

interface MediaItem {
  name: string;
  id: string;
  created_at: string;
  metadata: any;
}

interface MediaMeta {
  id: string;
  file_path: string;
  activity_tag: string | null;
  approval_status: string;
}

const CrmGallery = () => {
  const { user } = useAuth();
  const { hasAnyRole, isAdmin, canWrite, isFunder } = useCrmRole();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [metaMap, setMetaMap] = useState<Record<string, MediaMeta>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const [uploadMeta, setUploadMeta] = useState({ school: "", activity: "", date: new Date().toISOString().split("T")[0] });

  const fetchMedia = async () => {
    const [filesRes, metaRes] = await Promise.all([
      supabase.storage.from("crm-media").list("gallery", { limit: 200, sortBy: { column: "created_at", order: "desc" } }),
      supabase.from("crm_media_metadata").select("*"),
    ]);
    if (filesRes.data) setMedia(filesRes.data.filter(f => f.name !== ".emptyFolderPlaceholder"));
    const map: Record<string, MediaMeta> = {};
    (metaRes.data || []).forEach((m: any) => { map[m.file_path] = m; });
    setMetaMap(map);
    setLoading(false);
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    let uploaded = 0;
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const tag = [uploadMeta.school, uploadMeta.activity, uploadMeta.date].filter(Boolean).join("_");
      const fileName = `gallery/${tag}_${Date.now()}_${uploaded}.${ext}`;
      const { error } = await supabase.storage.from("crm-media").upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (error) { toast.error(`Failed: ${file.name}`); } else {
        uploaded++;
        await supabase.from("crm_media_metadata").insert({
          file_path: fileName.replace("gallery/", ""),
          activity_tag: uploadMeta.activity || null,
          uploaded_by: user?.id,
          approval_status: "pending",
        });
      }
    }
    toast.success(`${uploaded} file(s) uploaded`);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    fetchMedia();
  };

  const getPublicUrl = (name: string) => {
    const { data } = supabase.storage.from("crm-media").getPublicUrl(`gallery/${name}`);
    return data.publicUrl;
  };

  const handleDownload = async (name: string) => {
    const { data, error } = await supabase.storage.from("crm-media").download(`gallery/${name}`);
    if (error || !data) { toast.error("Download failed"); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a"); a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkDownload = async () => {
    for (const name of selectedItems) { await handleDownload(name); }
    toast.success(`Downloaded ${selectedItems.size} files`);
    setSelectedItems(new Set());
  };

  const handleDelete = async (name: string) => {
    const { error } = await supabase.storage.from("crm-media").remove([`gallery/${name}`]);
    if (error) { toast.error(error.message); return; }
    toast.success("File deleted");
    setSelectedImage(null);
    fetchMedia();
  };

  const updateApproval = async (name: string, status: string) => {
    const meta = metaMap[name];
    if (meta) {
      await supabase.from("crm_media_metadata").update({
        approval_status: status, approved_by: user?.id, approved_at: new Date().toISOString(),
      }).eq("id", meta.id);
    } else {
      await supabase.from("crm_media_metadata").insert({
        file_path: name, approval_status: status, approved_by: user?.id, approved_at: new Date().toISOString(),
      });
    }
    toast.success(`Image ${status}`);
    fetchMedia();
  };

  const toggleSelect = (name: string) => {
    const next = new Set(selectedItems);
    next.has(name) ? next.delete(name) : next.add(name);
    setSelectedItems(next);
  };

  const getApproval = (name: string) => metaMap[name]?.approval_status || "pending";

  const filtered = media
    .filter(m => {
      if (statusFilter === "all") return true;
      return getApproval(m.name) === statusFilter;
    })
    .filter(m => {
      if (isFunder()) return getApproval(m.name) === "approved";
      return true;
    })
    .filter(m => search ? m.name.toLowerCase().includes(search.toLowerCase()) : true);

  const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(name);

  const approvalBadge = (status: string) => {
    if (status === "approved") return <Badge className="bg-green-100 text-green-800 border-green-300 text-[10px]">Approved</Badge>;
    if (status === "flagged") return <Badge className="bg-destructive/10 text-destructive border-destructive/30 text-[10px]">Flagged</Badge>;
    return <Badge variant="outline" className="text-[10px]">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Media Gallery</h1>
          <p className="text-sm text-muted-foreground">{media.length} files in program documentation</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search files..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48" />
          </div>
          {!isFunder() && (
            <>
              {["all", "pending", "approved", "flagged"].map(s => (
                <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)} className="capitalize text-xs">
                  {s}
                </Button>
              ))}
            </>
          )}
          {selectedItems.size > 0 && (
            <Button variant="outline" size="sm" onClick={handleBulkDownload} className="gap-1">
              <Download className="h-3 w-3" /> Download ({selectedItems.size})
            </Button>
          )}
          {!isFunder() && (
            <div>
              <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
              <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-2">
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload Photos"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {!isFunder() && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div><Label className="text-xs">School Tag</Label><Input value={uploadMeta.school} onChange={e => setUploadMeta({...uploadMeta, school: e.target.value})} placeholder="e.g. PS-Mohanlalganj" className="w-44 h-9 text-sm" /></div>
              <div><Label className="text-xs">Activity Tag</Label><Input value={uploadMeta.activity} onChange={e => setUploadMeta({...uploadMeta, activity: e.target.value})} placeholder="e.g. handwash-demo" className="w-44 h-9 text-sm" /></div>
              <div><Label className="text-xs">Date</Label><Input type="date" value={uploadMeta.date} onChange={e => setUploadMeta({...uploadMeta, date: e.target.value})} className="w-40 h-9 text-sm" /></div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading media...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ImageIcon className="mx-auto h-12 w-12 mb-3 opacity-30" />
          <p>No media files found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(item => (
            <div
              key={item.name}
              className={`group relative rounded-lg overflow-hidden border bg-card aspect-square cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all ${selectedItems.has(item.name) ? "ring-2 ring-primary" : "border-border"}`}
            >
              {/* Select checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input type="checkbox" checked={selectedItems.has(item.name)} onChange={() => toggleSelect(item.name)} className="rounded border-border" onClick={e => e.stopPropagation()} />
              </div>
              {/* Approval badge */}
              {!isFunder() && (
                <div className="absolute top-2 right-2 z-10">{approvalBadge(getApproval(item.name))}</div>
              )}
              <div onClick={() => setSelectedImage(item.name)} className="w-full h-full">
                {isImage(item.name) ? (
                  <img src={getPublicUrl(item.name)} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-white truncate">{item.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="font-heading text-sm truncate flex items-center gap-2">
                {selectedImage} {approvalBadge(getApproval(selectedImage))}
              </DialogTitle>
            </DialogHeader>
            {isImage(selectedImage) && (
              <img src={getPublicUrl(selectedImage)} alt={selectedImage} className="w-full rounded-lg" />
            )}
            <div className="flex gap-2 justify-between flex-wrap">
              {canWrite() && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { updateApproval(selectedImage, "approved"); setSelectedImage(null); }} className="gap-1 text-green-700">
                    <CheckCircle className="h-3 w-3" /> Approve
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { updateApproval(selectedImage, "flagged"); setSelectedImage(null); }} className="gap-1 text-destructive">
                    <Flag className="h-3 w-3" /> Flag
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload(selectedImage)} className="gap-1">
                  <Download className="h-3 w-3" /> Download
                </Button>
                {isAdmin() && (
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedImage)} className="gap-1">
                    <X className="h-3 w-3" /> Delete
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CrmGallery;
