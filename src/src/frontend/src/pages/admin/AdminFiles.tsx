import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  ExternalLink,
  File,
  FolderOpen,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { DownloadableFile } from "../../backend";
import { ExternalBlob } from "../../backend";
import {
  useDeleteDownloadableFile,
  useGetDownloadableFiles,
  useSaveDownloadableFile,
} from "../../hooks/useAdminSettingsQueries";
import { useGetAllProducts } from "../../hooks/useQueries";

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString();
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminFiles() {
  const { data: files, isLoading } = useGetDownloadableFiles();
  const { data: products } = useGetAllProducts();
  const saveFile = useSaveDownloadableFile();
  const deleteFile = useDeleteDownloadableFile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "General",
    productId: "",
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setSelectedFile(f);
      if (!form.name) setForm((prev) => ({ ...prev, name: f.name }));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Select a file first");
      return;
    }
    if (!form.name.trim()) {
      toast.error("File name is required");
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const bytes = new Uint8Array(await selectedFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });
      const now = BigInt(Date.now()) * BigInt(1_000_000);
      const fileRecord: DownloadableFile = {
        id: BigInt(0),
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        productId:
          form.category === "Per Product" && form.productId
            ? BigInt(form.productId)
            : undefined,
        fileUrl: blob,
        uploadedAt: now,
      };
      await saveFile.mutateAsync(fileRecord);
      toast.success("File uploaded successfully!");
      setSelectedFile(null);
      setForm({
        name: "",
        description: "",
        category: "General",
        productId: "",
      });
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: bigint, name: string) => {
    try {
      await deleteFile.mutateAsync(id);
      toast.success(`Deleted "${name}"`);
    } catch {
      toast.error("Failed to delete file");
    }
  };

  const getProductName = (productId?: bigint) => {
    if (!productId) return null;
    const found = products?.find(([id]) => id === productId);
    return found ? found[1].name : `Product #${productId}`;
  };

  return (
    <div data-ocid="admin.files.page">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-foreground flex items-center gap-2">
          <FolderOpen
            className="w-5 h-5"
            style={{ color: "oklch(0.72 0.135 185)" }}
          />
          File Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload files and PDFs for users to download from their dashboard.
        </p>
      </div>

      {/* Upload Section */}
      <div
        className="rounded-xl border border-border p-5 mb-6"
        style={{ background: "oklch(0.115 0.022 245)" }}
      >
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <Upload
            className="w-4 h-4"
            style={{ color: "oklch(0.72 0.135 185)" }}
          />
          Upload New File
        </h3>

        {/* Drop zone - using label wrapping input for proper file click */}
        <label
          htmlFor="file-upload-input"
          className="border-2 border-dashed rounded-xl p-8 text-center mb-5 cursor-pointer transition-all flex flex-col items-center"
          style={{
            borderColor: "oklch(0.72 0.135 185 / 0.35)",
            background: "oklch(0.72 0.135 185 / 0.04)",
          }}
          data-ocid="admin.files.dropzone"
        >
          <File
            className="w-8 h-8 mb-2"
            style={{ color: "oklch(0.72 0.135 185)" }}
          />
          {selectedFile ? (
            <>
              <p className="text-sm font-semibold text-foreground">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatBytes(selectedFile.size)}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-foreground">Click to select a file</p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports all file types — PDF, EX4, EX5, ALGO, ZIP, etc.
              </p>
            </>
          )}
          <input
            id="file-upload-input"
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            data-ocid="admin.files.upload_button"
          />
        </label>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              File Name *
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. PropFolio MT5 Setup Guide"
              className="bg-secondary border-border"
              data-ocid="admin.files.input"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Category
            </Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
            >
              <SelectTrigger
                className="bg-secondary border-border"
                data-ocid="admin.files.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General (all users)</SelectItem>
                <SelectItem value="Per Product">
                  Per Product (license required)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.category === "Per Product" && (
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Product
              </Label>
              <Select
                value={form.productId}
                onValueChange={(v) => setForm((f) => ({ ...f, productId: v }))}
              >
                <SelectTrigger
                  className="bg-secondary border-border"
                  data-ocid="admin.files.select"
                >
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map(([id, p]) => (
                    <SelectItem key={id.toString()} value={id.toString()}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div
            className={form.category === "Per Product" ? "" : "sm:col-span-2"}
          >
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Description
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Brief description of this file..."
              rows={2}
              className="bg-secondary border-border text-sm resize-none"
              data-ocid="admin.files.textarea"
            />
          </div>
        </div>

        {isUploading && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress
              value={uploadProgress}
              className="h-1.5"
              data-ocid="admin.files.loading_state"
            />
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={isUploading || !selectedFile}
          className="gap-2 font-semibold"
          style={{
            background: "oklch(0.72 0.135 185)",
            color: "oklch(0.065 0.009 258)",
          }}
          data-ocid="admin.files.upload_button"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {isUploading ? `Uploading ${uploadProgress}%...` : "Upload File"}
        </Button>
      </div>

      {/* Files Table */}
      <div
        className="rounded-xl border border-border overflow-hidden"
        style={{ background: "oklch(0.115 0.022 245)" }}
      >
        <div className="px-5 py-4 border-b border-border/50">
          <h3 className="text-sm font-bold text-foreground">
            Uploaded Files ({files?.length ?? 0})
          </h3>
        </div>
        {isLoading ? (
          <div
            className="flex items-center justify-center py-10"
            data-ocid="admin.files.loading_state"
          >
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (files?.length ?? 0) === 0 ? (
          <div
            className="text-center py-12"
            data-ocid="admin.files.empty_state"
          >
            <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No files uploaded yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload files above to make them available to users.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files?.map(
                ([id, file]: [bigint, DownloadableFile], i: number) => (
                  <TableRow
                    key={id.toString()}
                    data-ocid={`admin.files.row.${i + 1}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {file.name}
                          </p>
                          {file.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {file.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={
                          file.category === "General"
                            ? {
                                background: "oklch(0.72 0.135 185 / 0.15)",
                                color: "oklch(0.72 0.135 185)",
                              }
                            : {
                                background: "oklch(0.71 0.115 72 / 0.15)",
                                color: "oklch(0.71 0.115 72)",
                              }
                        }
                      >
                        {file.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {getProductName(file.productId) ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(file.uploadedAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={file.fileUrl.getDirectURL()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                          style={{ color: "oklch(0.72 0.135 185)" }}
                          data-ocid="admin.files.button"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View
                        </a>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(id, file.name)}
                          disabled={deleteFile.isPending}
                          className="text-xs text-destructive hover:bg-destructive/10 gap-1"
                          data-ocid={`admin.files.delete_button.${i + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
