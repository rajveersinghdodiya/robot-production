import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { apiCall, API_CONFIG } from "@/lib/api";
import { DragEvent, FormEvent, useEffect, useMemo, useState } from "react";

type Section = "dashboard" | "products" | "inquiries" | "blogs" | "admin_users";

type ProductImage = {
  id?: number;
  image_path?: string;
  image_url?: string;
  image_full_url?: string;
  sort_order?: number;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  video_url?: string;
  created_at?: string;
  images?: ProductImage[];
};

type Inquiry = {
  id: number;
  name: string;
  organization: string;
  email: string;
  phone: string;
  inquiry_type: string;
  message: string;
  created_at?: string;
};

type BlockImageItem = {
  image_url?: string;
  image_path?: string;
  alt?: string;
  upload_field?: string;
  localFile?: File;
};

type BlogBlock =
  | { type: 'hero-image'; image_url?: string; image_path?: string; caption?: string; upload_field?: string; localFile?: File }
  | { type: 'text'; heading?: string; subheading?: string; paragraph?: string }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'video'; url?: string; source?: string; caption?: string; upload_field?: string; localFile?: File }
  | { type: 'image-gallery'; images: BlockImageItem[] }
  | { type: 'heading'; text: string; level?: 'h1' | 'h2' | 'h3' }
  | { type: 'paragraph'; text: string }
  | { type: 'two-column'; image_url?: string; image_path?: string; title?: string; text?: string; image_position?: 'left' | 'right'; upload_field?: string; localFile?: File }
  | { type: 'divider' };

type AdminBlog = {
  id: number;
  title: string;
  image_url?: string;
  image_path?: string;
  image_full_url?: string;
  video_url?: string;
  created_at?: string;
  content?: BlogBlock[];
};

type AdminStats = {
  total_products: number;
  total_inquiries: number;
  todays_inquiries: number;
};

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — IQNAAX Robotics" },
      { name: "description", content: "IQNAAX admin dashboard." },
      { property: "og:title", content: "Admin Dashboard — IQNAAX Robotics" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [adminUsername, setAdminUsername] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    total_products: 0,
    total_inquiries: 0,
    todays_inquiries: 0,
  });
  const [loadingSection, setLoadingSection] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null);
  const [blogs, setBlogs] = useState<AdminBlog[]>([]);
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogDescription, setBlogDescription] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogCategory, setBlogCategory] = useState("");
  const [blogAuthor, setBlogAuthor] = useState("");
  const [blogPublishDate, setBlogPublishDate] = useState("");
  const [blogBlocks, setBlogBlocks] = useState<BlogBlock[]>([]);
  const [blogBlockType, setBlogBlockType] = useState<BlogBlock['type']>('hero-image');
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [blogImageUrl, setBlogImageUrl] = useState("");
  const [blogVideoUrl, setBlogVideoUrl] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{
    type: "product" | "inquiry" | "blog";
    id: number;
    title: string;
    message: string;
  } | null>(null);

  const adminToken = useMemo(() => localStorage.getItem("iqnaax_token"), []);
  const adminRole = useMemo(() => localStorage.getItem('iqnaax_admin_role') || 'sub_admin', []);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  useEffect(() => {
    if (!adminToken) {
      window.location.href = "/login";
      return;
    }

    const storedUsername = localStorage.getItem("iqnaax_admin_username") || "Admin";
    setAdminUsername(storedUsername);
    fetchStats();
  }, [adminToken]);

  useEffect(() => {
    if (activeSection === "products") {
      fetchProducts();
    }
    if (activeSection === "inquiries") {
      fetchInquiries();
    }
    if (activeSection === "blogs") {
      fetchBlogs();
    }
  }, [activeSection]);

  const fetchBlogs = async () => {
    setLoadingSection(true);
    setErrorMessage(null);
    try {
      const data = await apiCall<any[]>(API_CONFIG.ENDPOINTS.BLOGS, { method: 'GET' });
      setBlogs(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoadingSection(false);
    }
  };

  const handleApiError = (error: unknown) => {
    const message = error instanceof Error ? error.message : "Unable to complete the request.";
    setErrorMessage(message);
    if (message.toLowerCase().includes("unauthorized")) {
      localStorage.removeItem("iqnaax_token");
      window.location.href = "/login";
    }
  };

  const fetchStats = async () => {
    if (!adminToken) return;
    setLoadingSection(true);
    setErrorMessage(null);

    try {
      const data = await apiCall<AdminStats>("/api/admin/stats", {
        method: "GET",
        auth: true,
      });
      setStats(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoadingSection(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingSection(true);
    setErrorMessage(null);

    try {
      const data = await apiCall<Product[]>(API_CONFIG.ENDPOINTS.PRODUCTS, {
        method: "GET",
      });
      setProducts(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoadingSection(false);
    }
  };

  const fetchInquiries = async () => {
    if (!adminToken) return;
    setLoadingSection(true);
    setErrorMessage(null);

    try {
      const data = await apiCall<Inquiry[]>("/api/admin/inquiries", {
        method: "GET",
        auth: true,
      });
      setInquiries(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoadingSection(false);
    }
  };

  const fetchAdminUsers = async () => {
    if (!adminToken) return;
    setLoadingSection(true);
    setErrorMessage(null);
    try {
      const data = await apiCall<any[]>('/api/admin/users', { method: 'GET', auth: true });
      setAdminUsers(data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoadingSection(false);
    }
  };

  const addImageFiles = (files: FileList | null) => {
    if (!files) return;
    setImageFiles((current) => [...current, ...Array.from(files)]);
  };

  const addImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImageUrls((current) => [...current, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const removeNewImage = (index: number) => {
    setImageFiles((current) => current.filter((_, idx) => idx !== index));
  };

  const removeImageUrl = (index: number) => {
    setImageUrls((current) => current.filter((_, idx) => idx !== index));
  };

  const removeExistingImage = (imageId?: number) => {
    if (!imageId) return;
    setProductImages((current) => current.filter((image) => image.id !== imageId));
    setDeletedImageIds((current) => [...current, imageId]);
  };

  const moveExistingImage = (imageId: number, direction: 'left' | 'right') => {
    setProductImages((current) => {
      const currentIndex = current.findIndex((image) => image.id === imageId);
      if (currentIndex === -1) return current;
      const nextIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const updated = [...current];
      const temp = updated[currentIndex];
      updated[currentIndex] = updated[nextIndex];
      updated[nextIndex] = temp;
      return updated;
    });
  };

  const handleImageDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      addImageFiles(event.dataTransfer.files);
    }
  };

  const handleImageDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleCreateAdmin = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!newAdminUsername.trim() || !newAdminPassword) return setErrorMessage('Username and password are required.');
    setSaving(true);
    try {
      const data = await apiCall('/api/admin/users', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({ username: newAdminUsername.trim(), password: newAdminPassword }),
      });
      setAdminUsers((cur) => [data.user, ...cur]);
      setSuccessMessage('Sub admin created.');
      setNewAdminUsername('');
      setNewAdminPassword('');
    } catch (err) {
      handleApiError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!confirm('Delete this admin user?')) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoadingSection(true);
    try {
      await apiCall(`/api/admin/users/${id}`, { method: 'DELETE', auth: true });
      setAdminUsers((cur) => cur.filter((u) => u.id !== id));
      setSuccessMessage('Admin deleted.');
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoadingSection(false);
    }
  };

  const resetForm = () => {
    setEditingProductId(null);
    setName("");
    setDescription("");
    setPrice("");
    setImageUrl("");
    setImageUrls([]);
    setImageUrlInput("");
    setImageFiles([]);
    setProductImages([]);
    setDeletedImageIds([]);
    setVideoUrl("");
  };

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    setErrorMessage(null);
    setSuccessMessage(null);
    if (section === 'admin_users') {
      fetchAdminUsers();
    }
  };

  const resetBlogForm = () => {
    setEditingBlogId(null);
    setBlogTitle("");
    setBlogDescription("");
    setBlogContent("");
    setBlogCategory("");
    setBlogAuthor("");
    setBlogPublishDate("");
    setBlogBlocks([]);
    setBlogBlockType('hero-image');
    setBlogImageFile(null);
    setBlogImageUrl("");
    setBlogVideoUrl("");
  };

  const createEmptyBlock = (type: BlogBlock['type']): BlogBlock => {
    switch (type) {
      case 'hero-image':
        return { type: 'hero-image', image_url: '', caption: '' };
      case 'text':
        return { type: 'text', heading: '', subheading: '', paragraph: '' };
      case 'quote':
        return { type: 'quote', text: '', author: '' };
      case 'video':
        return { type: 'video', url: '', source: 'url', caption: '' };
      case 'image-gallery':
        return { type: 'image-gallery', images: [] };
      case 'heading':
        return { type: 'heading', text: '', level: 'h2' };
      case 'paragraph':
        return { type: 'paragraph', text: '' };
      case 'two-column':
        return { type: 'two-column', image_url: '', title: '', text: '', image_position: 'left' };
      case 'divider':
        return { type: 'divider' };
      default:
        return { type: 'paragraph', text: '' };
    }
  };

  const addBlogBlock = (type: BlogBlock['type']) => {
    setBlogBlocks((current) => [...current, createEmptyBlock(type)]);
  };

  const updateBlogBlock = (index: number, update: Partial<BlogBlock>) => {
    setBlogBlocks((current) => current.map((block, idx) => (idx === index ? { ...block, ...update } : block)));
  };

  const removeBlogBlock = (index: number) => {
    setBlogBlocks((current) => current.filter((_, idx) => idx !== index));
  };

  const moveBlogBlock = (index: number, direction: 'up' | 'down') => {
    setBlogBlocks((current) => {
      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const nextBlocks = [...current];
      [nextBlocks[index], nextBlocks[nextIndex]] = [nextBlocks[nextIndex], nextBlocks[index]];
      return nextBlocks;
    });
  };

  const addGalleryImage = (blockIndex: number, image: BlockImageItem) => {
    setBlogBlocks((current) =>
      current.map((block, idx) =>
        idx === blockIndex && block.type === 'image-gallery'
          ? { ...block, images: [...block.images, image] }
          : block
      )
    );
  };

  const updateGalleryImage = (blockIndex: number, imageIndex: number, update: Partial<BlockImageItem>) => {
    setBlogBlocks((current) =>
      current.map((block, idx) => {
        if (idx !== blockIndex || block.type !== 'image-gallery') return block;
        const images = block.images.map((image, imgIdx) => (imgIdx === imageIndex ? { ...image, ...update } : image));
        return { ...block, images };
      })
    );
  };

  const updateBlogBlockFile = (blockIndex: number, file: File | null) => {
    setBlogBlocks((current) =>
      current.map((block, idx) =>
        idx === blockIndex ? { ...block, localFile: file } : block
      )
    );
  };

  const updateGalleryImageFile = (blockIndex: number, imageIndex: number, file: File | null) => {
    setBlogBlocks((current) =>
      current.map((block, idx) => {
        if (idx !== blockIndex || block.type !== 'image-gallery') return block;
        const images = block.images.map((image, imgIdx) =>
          imgIdx === imageIndex ? { ...image, localFile: file } : image
        );
        return { ...block, images };
      })
    );
  };

  const serializeBlogBlocks = (blocks: BlogBlock[]) => {
    return blocks.map((block) => {
      const base = { ...block } as any;
      delete base.localFile;
      if (base.type === 'hero-image' || base.type === 'two-column') {
        delete base.upload_field;
      }
      if (base.type === 'video') {
        delete base.upload_field;
      }
      if (base.type === 'image-gallery') {
        base.images = base.images.map((image: BlockImageItem) => {
          const item = { ...image } as any;
          delete item.localFile;
          delete item.upload_field;
          return item;
        });
      }
      return base;
    });
  };

  const removeGalleryImage = (blockIndex: number, imageIndex: number) => {
    setBlogBlocks((current) =>
      current.map((block, idx) => {
        if (idx !== blockIndex || block.type !== 'image-gallery') return block;
        const images = block.images.filter((_, imgIdx) => imgIdx !== imageIndex);
        return { ...block, images };
      })
    );
  };

  const handleBlogSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!adminToken) return window.location.href = '/login';
    if (!blogTitle.trim()) return setErrorMessage('Title is required.');
    setSaving(true);

    try {
      const form = new FormData();
      form.append('title', blogTitle.trim());
      form.append('description', blogDescription.trim());
      form.append('author', blogAuthor.trim());
      form.append('publish_date', blogPublishDate);
      form.append('category', blogCategory);
      form.append('image_url', blogImageUrl);
      form.append('video_url', blogVideoUrl.trim());

      let submittedBlocks = serializeBlogBlocks(blogBlocks.length ? blogBlocks : [{ type: 'paragraph', text: blogContent }]);

      blogBlocks.forEach((block, blockIndex) => {
        if (block.type === 'hero-image' && block.localFile) {
          const field = `block_image_${blockIndex}`;
          form.append(field, block.localFile);
          submittedBlocks = submittedBlocks.map((item, idx) => {
            if (idx !== blockIndex) return item;
            return { ...item, upload_field: field, image_url: item.image_url || undefined };
          });
        }

        if (block.type === 'two-column' && block.localFile) {
          const field = `block_two_column_${blockIndex}`;
          form.append(field, block.localFile);
          submittedBlocks = submittedBlocks.map((item, idx) => {
            if (idx !== blockIndex) return item;
            return { ...item, upload_field: field, image_url: item.image_url || undefined };
          });
        }

        if (block.type === 'video' && block.localFile) {
          const field = `block_video_${blockIndex}`;
          form.append(field, block.localFile);
          submittedBlocks = submittedBlocks.map((item, idx) => {
            if (idx !== blockIndex) return item;
            return { ...item, upload_field: field, url: item.url || undefined };
          });
        }

        if (block.type === 'image-gallery') {
          const gallery = block.images || [];
          gallery.forEach((image, imageIndex) => {
            if (image.localFile) {
              const field = `block_gallery_${blockIndex}_${imageIndex}`;
              form.append(field, image.localFile);
              submittedBlocks = submittedBlocks.map((item, idx) => {
                if (idx !== blockIndex) return item;
                return {
                  ...item,
                  images: item.images.map((img: any, imgIdx: number) => {
                    if (imgIdx !== imageIndex) return img;
                    return { ...img, upload_field: field, image_url: img.image_url || undefined };
                  }),
                };
              });
            }
          });
        }
      });

      form.append('content', JSON.stringify(submittedBlocks));

      const endpoint = editingBlogId ? `/api/admin/blogs/${editingBlogId}` : `/api/admin/blogs`;
      const method = editingBlogId ? 'PUT' : 'POST';
      const token = localStorage.getItem('iqnaax_token');
      const res = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Error ${res.status}`);
      }

      const data = await res.json();
      if (editingBlogId) {
        setBlogs((cur) => cur.map((b) => (b.id === editingBlogId ? data.blog : b)));
        setSuccessMessage('Blog updated successfully.');
      } else {
        setBlogs((cur) => [data.blog, ...cur]);
        setSuccessMessage('Blog created successfully.');
      }
      resetBlogForm();
    } catch (err) {
      handleApiError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditBlog = (b: any) => {
    setEditingBlogId(b.id);
    setBlogTitle(b.title || '');
    setBlogDescription(b.description || '');
    setBlogCategory(b.category || '');
    setBlogAuthor(b.author || '');
    setBlogPublishDate(b.publish_date || '');
    setBlogImageUrl(b.image_url || '');
    setBlogVideoUrl(b.video_url || '');

    const blocks = Array.isArray(b.content)
      ? b.content
      : [];

    if (blocks.length) {
      setBlogBlocks(blocks);
    } else {
      const fallbackBlocks: BlogBlock[] = [];
      if (b.image_full_url) {
        fallbackBlocks.push({ type: 'hero-image', image_url: b.image_full_url, caption: '' });
      }
      if (typeof b.content === 'string' && b.content.trim()) {
        fallbackBlocks.push({ type: 'paragraph', text: b.content });
      }
      setBlogBlocks(fallbackBlocks);
    }
  };

  const handleDeleteBlog = (id: number) => {
    setPendingDelete({ type: 'blog', id, title: 'Delete Blog', message: 'Are you sure you want to delete this blog?' });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage("Product name is required.");
      return;
    }

    const priceValue = Number(price);
    if (Number.isNaN(priceValue) || priceValue < 0) {
      setErrorMessage("Price must be a valid number.");
      return;
    }

    if (!adminToken) {
      window.location.href = "/login";
      return;
    }

    setSaving(true);

    try {
      const endpoint = editingProductId
        ? `${API_CONFIG.ENDPOINTS.PRODUCTS}/${editingProductId}`
        : API_CONFIG.ENDPOINTS.PRODUCTS;
      const method = editingProductId ? "PUT" : "POST";

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('price', String(priceValue));
      formData.append('image_url', imageUrl.trim());
      formData.append('video_url', videoUrl.trim());

      if (imageUrls.length > 0) {
        formData.append('image_urls', JSON.stringify(imageUrls));
      }
      if (deletedImageIds.length > 0) {
        formData.append('deleted_image_ids', JSON.stringify(deletedImageIds));
      }
      const orderedIds = productImages.map((image) => image.id).filter(Boolean);
      if (orderedIds.length > 0) {
        formData.append('image_order', JSON.stringify(orderedIds));
      }
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await apiCall<{ message: string; product: Product }>(endpoint, {
        method,
        auth: true,
        body: formData,
      });

      const product = response.product;
      if (editingProductId) {
        setProducts((current) =>
          current.map((item) => (item.id === editingProductId ? product : item))
        );
        setSuccessMessage("Product updated successfully.");
      } else {
        setProducts((current) => [product, ...current]);
        setSuccessMessage("Product created successfully.");
      }

      resetForm();
      fetchStats();
    } catch (error) {
      handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    const existingProductImages = product.images?.filter((image) => image.id != null) ?? [];
    setEditingProductId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setImageUrl(product.image_url || "");
    setImageUrls(existingProductImages.length ? [] : product.image_url ? [product.image_url] : []);
    setProductImages(existingProductImages);
    setImageUrlInput("");
    setImageFiles([]);
    setDeletedImageIds([]);
    setVideoUrl(product.video_url || "");
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleDeleteProduct = (productId: number) => {
    if (!adminToken) {
      window.location.href = "/login";
      return;
    }

    setPendingDelete({
      type: "product",
      id: productId,
      title: "Delete Product",
      message: "Are you sure you want to delete this product?",
    });
  };

  const handleDeleteInquiry = (inquiryId: number) => {
    if (!adminToken) {
      window.location.href = "/login";
      return;
    }

    setPendingDelete({
      type: "inquiry",
      id: inquiryId,
      title: "Delete Inquiry",
      message: "Are you sure you want to delete this inquiry?",
    });
  };

  const confirmDelete = async () => {
    if (!pendingDelete || !adminToken) {
      setPendingDelete(null);
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    if (pendingDelete.type === "product") {
      setSaving(true);
    } else {
      setLoadingSection(true);
    }

    try {
      if (pendingDelete.type === "product") {
        await apiCall(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${pendingDelete.id}`, {
          method: "DELETE",
          auth: true,
        });
        setProducts((current) => current.filter((product) => product.id !== pendingDelete.id));
        setSuccessMessage("Product deleted successfully.");
        if (editingProductId === pendingDelete.id) {
          resetForm();
        }
      } else if (pendingDelete.type === "inquiry") {
        await apiCall(`/api/admin/inquiries/${pendingDelete.id}`, {
          method: "DELETE",
          auth: true,
        });
        setInquiries((current) => current.filter((item) => item.id !== pendingDelete.id));
        setSuccessMessage("Inquiry deleted successfully.");
      } else if (pendingDelete.type === "blog") {
        await apiCall(`/api/admin/blogs/${pendingDelete.id}`, {
          method: "DELETE",
          auth: true,
        });
        setBlogs((current) => current.filter((b) => b.id !== pendingDelete.id));
        setSuccessMessage("Blog deleted successfully.");
      }
      fetchStats();
    } catch (error) {
      handleApiError(error);
    } finally {
      setSaving(false);
      setLoadingSection(false);
      setPendingDelete(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("iqnaax_token");
    localStorage.removeItem("iqnaax_admin_username");
    window.location.href = "/login";
  };

  return (
    <Layout>
      <section className="pt-40 pb-16 container mx-auto px-6">
        <div className="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-border bg-card p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-widest text-primary font-medium">Admin</p>
                <h1 className="mt-3 text-3xl font-semibold text-foreground">Dashboard</h1>
                <p className="mt-2 text-sm text-muted-foreground">{adminUsername}</p>
              </div>

              <nav className="space-y-2">
                {[
                  { label: "Dashboard", value: "dashboard" as Section },
                  { label: "Products", value: "products" as Section },
                  { label: "Inquiries", value: "inquiries" as Section },
                  { label: "Blogs", value: "blogs" as Section },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleSectionChange(item.value)}
                    className={`w-full rounded-3xl px-4 py-3 text-left text-sm font-medium transition-all ${
                      activeSection === item.value
                        ? "bg-foreground text-background"
                        : "border border-border bg-background text-foreground hover:border-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

                {adminRole === 'super_admin' && (
                  <button
                    type="button"
                    onClick={() => handleSectionChange('admin_users')}
                    className={`w-full rounded-3xl px-4 py-3 text-left text-sm font-medium transition-all ${
                      activeSection === 'admin_users'
                        ? "bg-foreground text-background"
                        : "border border-border bg-background text-foreground hover:border-foreground"
                    }`}
                  >
                    Admin Management
                  </button>
                )}
              </nav>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-3xl bg-destructive px-4 py-3 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-all"
              >
                Logout
              </button>
            </div>
          </aside>

          <div className="space-y-6">
            <header className="rounded-3xl border border-border bg-card p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-widest text-primary font-medium">Admin Panel</p>
                <h2 className="mt-2 text-3xl font-semibold text-foreground">{activeSection === "dashboard" ? "Overview" : activeSection === "products" ? "Product Management" : activeSection === "inquiries" ? "Inquiry Management" : "Blog Management"}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {activeSection === "dashboard"
                    ? "Review key metrics and site activity."
                    : activeSection === "products"
                    ? "Add, edit and delete products in the catalog."
                    : activeSection === "inquiries"
                    ? "Browse and manage customer inquiries."
                    : "Create, edit and remove blog posts for the public site."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground">{adminUsername}</div>
                <div className="rounded-full text-xs font-medium px-3 py-1 bg-muted/20 text-muted-foreground">{adminRole === 'super_admin' ? 'SUPER ADMIN' : 'SUB ADMIN'}</div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-primary transition-all"
                >
                  Logout
                </button>
              </div>
            </header>

            {activeSection === "dashboard" && (
              <div className="grid gap-6 xl:grid-cols-3">
                {[
                  {
                    title: "Total Products",
                    value: stats.total_products,
                    description: "All products in inventory.",
                  },
                  {
                    title: "Total Inquiries",
                    value: stats.total_inquiries,
                    description: "All contact submissions received.",
                  },
                  {
                    title: "Today's Inquiries",
                    value: stats.todays_inquiries,
                    description: "Submissions created today.",
                  },
                ].map((card) => (
                  <div key={card.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{card.title}</p>
                    <p className="mt-4 text-4xl font-semibold text-foreground">{loadingSection ? "—" : card.value}</p>
                    <p className="mt-4 text-sm text-muted-foreground">{card.description}</p>
                  </div>
                ))}
              </div>
            )}

            {activeSection === "blogs" && (
              <div className="space-y-8">
                <div className="rounded-3xl border border-border bg-card p-8">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">Create or Edit Blog</h3>
                      <p className="text-sm text-muted-foreground mt-1">Publish content to your public blog.</p>
                    </div>
                    {successMessage && <p className="text-sm text-emerald-600 font-medium">{successMessage}</p>}
                    {errorMessage && <p className="text-sm text-destructive font-medium">{errorMessage}</p>}
                  </div>

                  <form className="mt-8 space-y-6" onSubmit={handleBlogSubmit}>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="text-xs uppercase tracking-widest text-muted-foreground">Title</label>
                        <input
                          type="text"
                          value={blogTitle}
                          onChange={(e) => setBlogTitle(e.target.value)}
                          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                          placeholder="Enter blog title"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-widest text-muted-foreground">Category</label>
                        <input
                          type="text"
                          value={blogCategory}
                          onChange={(e) => setBlogCategory(e.target.value)}
                          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                          placeholder="Category"
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="text-xs uppercase tracking-widest text-muted-foreground">Author</label>
                        <input
                          type="text"
                          value={blogAuthor}
                          onChange={(e) => setBlogAuthor(e.target.value)}
                          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                          placeholder="Author name"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-widest text-muted-foreground">Publish Date</label>
                        <input
                          type="date"
                          value={blogPublishDate}
                          onChange={(e) => setBlogPublishDate(e.target.value)}
                          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">Short Description</label>
                      <textarea
                        value={blogDescription}
                        onChange={(e) => setBlogDescription(e.target.value)}
                        className="mt-2 w-full min-h-[80px] rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                        placeholder="Short summary shown on listings"
                      />
                    </div>

                    <div className="rounded-3xl border border-border bg-background p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-widest text-muted-foreground">Content Builder</p>
                          <p className="mt-1 text-sm text-muted-foreground">Add blocks in any order to compose a long-form blog or vlog page.</p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <select
                            value={blogBlockType}
                            onChange={(e) => setBlogBlockType(e.target.value as BlogBlock['type'])}
                            className="rounded-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary"
                          >
                            <option value="hero-image">Hero Image</option>
                            <option value="heading">Heading</option>
                            <option value="text">Text Block</option>
                            <option value="paragraph">Paragraph</option>
                            <option value="quote">Quote</option>
                            <option value="image-gallery">Gallery</option>
                            <option value="video">Video</option>
                            <option value="two-column">Two Column</option>
                            <option value="divider">Divider</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => addBlogBlock(blogBlockType)}
                            className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background hover:bg-primary transition-all"
                          >
                            Add Block
                          </button>
                        </div>
                      </div>

                      {blogBlocks.length === 0 ? (
                        <p className="mt-6 text-sm text-muted-foreground">Start by adding a block. A hero image or heading is great first content.</p>
                      ) : (
                        <div className="mt-6 space-y-6">
                          {blogBlocks.map((block, index) => (
                            <div key={index} className="rounded-3xl border border-border bg-card p-6">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">Block {index + 1}: {block.type.replace(/-/g, ' ')}</p>
                                  <p className="text-xs text-muted-foreground">Arrange content blocks for the article page.</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => moveBlogBlock(index, 'up')}
                                    disabled={index === 0}
                                    className="rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-50"
                                  >
                                    Move Up
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveBlogBlock(index, 'down')}
                                    disabled={index === blogBlocks.length - 1}
                                    className="rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-50"
                                  >
                                    Move Down
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeBlogBlock(index)}
                                    className="rounded-full bg-destructive px-4 py-2 text-xs font-medium text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>

                              {block.type === 'hero-image' && (
                                <div className="mt-6 grid gap-6 md:grid-cols-2">
                                  <div>
                                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Local Image</label>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => updateBlogBlockFile(index, e.target.files ? e.target.files[0] : null)}
                                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2 focus:outline-none focus:border-primary"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Remote Image URL</label>
                                    <input
                                      type="url"
                                      value={(block as any).image_url || ''}
                                      onChange={(e) => updateBlogBlock(index, { image_url: e.target.value })}
                                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                                      placeholder="https://example.com/hero.jpg"
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Caption</label>
                                    <input
                                      type="text"
                                      value={(block as any).caption || ''}
                                      onChange={(e) => updateBlogBlock(index, { caption: e.target.value })}
                                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                                      placeholder="Optional hero caption"
                                    />
                                  </div>
                                </div>
                              )}

                              {block.type === 'heading' && (
                                <div className="mt-6 grid gap-6 md:grid-cols-2">
                                  <div>
                                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Heading Text</label>
                                    <input
                                      type="text"
                                      value={(block as any).text}
                                      onChange={(e) => updateBlogBlock(index, { text: e.target.value })}
                                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                                      placeholder="Heading text"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Heading Level</label>
                                    <select
                                      value={(block as any).level}
                                      onChange={(e) => updateBlogBlock(index, { level: e.target.value as 'h1' | 'h2' | 'h3' })}
                                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                                    >
                                      <option value="h1">H1</option>
                                      <option value="h2">H2</option>
                                      <option value="h3">H3</option>
                                    </select>
                                  </div>
                                </div>
                              )}

                              {block.type === 'text' && (
                                <div className="mt-6 space-y-4">
                                  <div>
                                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Heading</label>
                                    <input
                                      type="text"
                                      value={(block as any).heading || ''}
                                      onChange={(e) => updateBlogBlock(index, { heading: e.target.value })}
                                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                                      placeholder="Section heading"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Subheading</label>
                                    <input
                                      type="text"
                                      value={(block as any).subheading || ''}
                                      onChange={(e) => updateBlogBlock(index, { subheading: e.target.value })}
                                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                                      placeholder="Section subheading"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Paragraph</label>
                                    <textarea
                                      value={(block as any).paragraph || ''}
                                      onChange={(e) => updateBlogBlock(index, { paragraph: e.target.value })}
                                      className="mt-2 w-full min-h-[120px] rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                                      placeholder="Write paragraph content here"
                                    />
                                  </div>
                                </div>
                              )}

                              {block.type === 'paragraph' && (
                                <div className="mt-6">
                                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Paragraph</label>
                                  <textarea
                                    value={(block as any).text}
                                    onChange={(e) => updateBlogBlock(index, { text: e.target.value })}
                                    className="mt-2 w-full min-h-[140px] rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                                    placeholder="A paragraph is ideal for long-form text."
                                  />
                                </div>
                              )}

                              {block.type === 'quote' && (
                                <div className="mt-6 space-y-4">
                                  <div>
                                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Quote</label>
                                    <textarea
                                      value={(block as any).text}
                                      onChange={(e) => updateBlogBlock(index, { text: e.target.value })}
                                      className="mt-2 w-full min-h-[120px] rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                                      placeholder="Write the quote text"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Author</label>
                                    <input
                                      type="text"
                                      value={(block as any).author || ''}
                                      onChange={(e) => updateBlogBlock(index, { author: e.target.value })}
                                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                                      placeholder="Quote author"
                                    />
                                  </div>
                                </div>
                              )}

                              {block.type === 'video' && (
                                <div className="mt-6 grid gap-6 md:grid-cols-2">
                                  <div>
                                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Video URL</label>
                                    <input
                                      type="url"
                                      value={(block as any).url || ''}
                                      onChange={(e) => updateBlogBlock(index, { url: e.target.value })}
                                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                                      placeholder="YouTube, Vimeo or direct video URL"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Local Video File</label>
                                    <input
                                      type="file"
                                      accept="video/mp4,video/webm"
                                      onChange={(e) => updateBlogBlockFile(index, e.target.files ? e.target.files[0] : null)}
                                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2 focus:outline-none focus:border-primary"
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Caption</label>
                                    <input
                                      type="text"
                                      value={(block as any).caption || ''}
                                      onChange={(e) => updateBlogBlock(index, { caption: e.target.value })}
                                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                                      placeholder="Optional video caption"
                                    />
                                  </div>
                                </div>
                              )}

                              {block.type === 'image-gallery' && (
                                <div className="mt-6 space-y-4">
                                  <button
                                    type="button"
                                    onClick={() => addGalleryImage(index, { image_url: '', alt: '' })}
                                    className="rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background hover:bg-primary transition-all"
                                  >
                                    Add Gallery Image
                                  </button>
                                  {block.images.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Add images by URL or upload them directly.</p>
                                  ) : (
                                    <div className="space-y-4">
                                      {block.images.map((image, imageIndex) => (
                                        <div key={imageIndex} className="rounded-3xl border border-border bg-background p-4">
                                          <div className="grid gap-4 md:grid-cols-3">
                                            <div>
                                              <label className="text-xs uppercase tracking-widest text-muted-foreground">Image URL</label>
                                              <input
                                                type="url"
                                                value={image.image_url || ''}
                                                onChange={(e) => updateGalleryImage(index, imageIndex, { image_url: e.target.value })}
                                                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                                                placeholder="https://example.com/gallery.jpg"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-xs uppercase tracking-widest text-muted-foreground">Alt Text</label>
                                              <input
                                                type="text"
                                                value={image.alt || ''}
                                                onChange={(e) => updateGalleryImage(index, imageIndex, { alt: e.target.value })}
                                                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                                                placeholder="Image description"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-xs uppercase tracking-widest text-muted-foreground">Upload Image</label>
                                              <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => updateGalleryImageFile(index, imageIndex, e.target.files ? e.target.files[0] : null)}
                                                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2 focus:outline-none focus:border-primary"
                                              />
                                            </div>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => removeGalleryImage(index, imageIndex)}
                                            className="mt-4 rounded-full bg-destructive px-4 py-2 text-xs font-medium text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            Remove Image
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {block.type === 'two-column' && (
                                <div className="mt-6 grid gap-6 md:grid-cols-2">
                                  <div>
                                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Local Image</label>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => updateBlogBlockFile(index, e.target.files ? e.target.files[0] : null)}
                                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2 focus:outline-none focus:border-primary"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Remote Image URL</label>
                                    <input
                                      type="url"
                                      value={(block as any).image_url || ''}
                                      onChange={(e) => updateBlogBlock(index, { image_url: e.target.value })}
                                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                                      placeholder="https://example.com/section.jpg"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Section Title</label>
                                    <input
                                      type="text"
                                      value={(block as any).title || ''}
                                      onChange={(e) => updateBlogBlock(index, { title: e.target.value })}
                                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                                      placeholder="Two column title"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Image Position</label>
                                    <select
                                      value={(block as any).image_position || 'left'}
                                      onChange={(e) => updateBlogBlock(index, { image_position: e.target.value as 'left' | 'right' })}
                                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                                    >
                                      <option value="left">Left</option>
                                      <option value="right">Right</option>
                                    </select>
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Section Text</label>
                                    <textarea
                                      value={(block as any).text || ''}
                                      onChange={(e) => updateBlogBlock(index, { text: e.target.value })}
                                      className="mt-2 w-full min-h-[140px] rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                                      placeholder="Describe this section."
                                    />
                                  </div>
                                </div>
                              )}

                              {block.type === 'divider' && (
                                <div className="mt-6 rounded-3xl border border-dashed border-border bg-muted/10 p-6 text-sm text-muted-foreground">
                                  Divider block: inserted to separate sections visually.
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-primary transition-all disabled:opacity-60"
                      >
                        {saving ? "Saving…" : editingBlogId ? "Update Blog" : "Create Blog"}
                      </button>
                      <div className="flex gap-2">
                        {editingBlogId && (
                          <button
                            type="button"
                            onClick={resetBlogForm}
                            className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-medium text-foreground hover:bg-accent transition-all"
                          >
                            Reset
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={fetchBlogs}
                          className="inline-flex items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-all"
                        >
                          Refresh
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="rounded-3xl border border-border bg-card p-8">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">Blog Posts</h3>
                      <p className="text-sm text-muted-foreground mt-1">List of published blog posts and actions.</p>
                    </div>
                  </div>

                  {loadingSection ? (
                    <p className="mt-8 text-sm text-muted-foreground">Loading blogs…</p>
                  ) : blogs.length === 0 ? (
                    <p className="mt-8 text-sm text-muted-foreground">No blog posts found.</p>
                  ) : (
                    <div className="mt-8 overflow-x-auto">
                      <table className="min-w-full text-left divide-y divide-border">
                        <thead className="border-b border-border bg-background text-sm uppercase tracking-widest text-muted-foreground">
                          <tr>
                            <th className="px-4 py-4">ID</th>
                            <th className="px-4 py-4">Preview</th>
                            <th className="px-4 py-4">Title</th>
                            <th className="px-4 py-4">Category</th>
                            <th className="px-4 py-4">Created</th>
                            <th className="px-4 py-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {blogs.map((b) => {
                            const hasImage = b.image_full_url || b.image_url || b.image_path || 
                              (b.content?.some((block: BlogBlock) => {
                                if (block.type === 'hero-image' && (block.image_url || block.image_path)) return true;
                                if (block.type === 'image-gallery' && block.images?.some(img => img.image_url || img.image_path)) return true;
                                if (block.type === 'two-column' && (block.image_url || block.image_path)) return true;
                                return false;
                              }));
                            
                            const initials = b.title
                              .split(' ')
                              .slice(0, 2)
                              .map((w: string) => w[0])
                              .join('')
                              .toUpperCase();
                            
                            return (
                              <tr key={b.id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-4 text-sm font-medium text-foreground">#{b.id}</td>
                                <td className="px-4 py-4">
                                  {hasImage ? (
                                    <img src={b.image_full_url || (b.image_path ? `${API_CONFIG.BASE_URL}${b.image_path}` : b.image_url)} alt={b.title} className="h-16 w-24 rounded-xl object-cover" />
                                  ) : (
                                    <div className="flex h-16 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm text-xs font-medium text-muted-foreground">
                                      <div className="flex flex-col items-center gap-1">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-[10px] font-bold text-white">
                                          {initials || '📄'}
                                        </div>
                                        <span className="text-[10px]">Text</span>
                                      </div>
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-4 text-sm text-foreground">{b.title}</td>
                                <td className="px-4 py-4 text-sm">{b.category || '—'}</td>
                                <td className="px-4 py-4 text-sm text-muted-foreground">{b.created_at ? new Date(b.created_at).toLocaleDateString() : '—'}</td>
                                <td className="px-4 py-4 text-sm">
                                  <div className="flex flex-wrap gap-2">
                                    <button type="button" onClick={() => handleEditBlog(b)} className="rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-accent transition-all">Edit</button>
                                    <button type="button" onClick={() => handleDeleteBlog(b.id)} disabled={saving} className="rounded-full bg-destructive px-4 py-2 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-all disabled:opacity-60">Delete</button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === "admin_users" && (
              <div className="space-y-8">
                <div className="rounded-3xl border border-border bg-card p-8">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">Admin Management</h3>
                      <p className="text-sm text-muted-foreground mt-1">Create and manage sub-admin accounts.</p>
                    </div>
                  </div>

                  {adminRole !== 'super_admin' ? (
                    <p className="mt-6 text-sm text-destructive">Access denied</p>
                  ) : (
                    <div className="mt-6">
                      <form className="grid gap-4 md:grid-cols-3" onSubmit={(e) => { e.preventDefault(); handleCreateAdmin(); }}>
                        <div>
                          <label className="text-xs uppercase tracking-widest text-muted-foreground">Username</label>
                          <input type="text" value={newAdminUsername} onChange={(e) => setNewAdminUsername(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary" placeholder="username" />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-widest text-muted-foreground">Password</label>
                          <input type="password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary" placeholder="password" />
                        </div>
                        <div className="flex items-end">
                          <button type="submit" disabled={saving} className="w-full inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-primary transition-all disabled:opacity-60">{saving ? 'Saving…' : 'Create Sub Admin'}</button>
                        </div>
                      </form>

                      <div className="mt-6 overflow-x-auto">
                        <table className="min-w-full text-left divide-y divide-border">
                          <thead className="border-b border-border bg-background text-sm uppercase tracking-widest text-muted-foreground">
                            <tr>
                              <th className="px-4 py-4">ID</th>
                              <th className="px-4 py-4">Username</th>
                              <th className="px-4 py-4">Role</th>
                              <th className="px-4 py-4">Created</th>
                              <th className="px-4 py-4">Last Login</th>
                              <th className="px-4 py-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {adminUsers.map((u) => (
                              <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-4 text-sm font-medium text-foreground">#{u.id}</td>
                                <td className="px-4 py-4 text-sm text-foreground">{u.username}</td>
                                <td className="px-4 py-4 text-sm">{u.role}</td>
                                <td className="px-4 py-4 text-sm text-muted-foreground">{u.created_at ? new Date(u.created_at).toLocaleString() : '—'}</td>
                                <td className="px-4 py-4 text-sm text-muted-foreground">{u.last_login ? new Date(u.last_login).toLocaleString() : '—'}</td>
                                <td className="px-4 py-4 text-sm">
                                  <div className="flex flex-wrap gap-2">
                                    <button type="button" onClick={() => handleDeleteAdmin(u.id)} className="rounded-full bg-destructive px-4 py-2 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-all">Delete</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === "products" && (

              <div className="space-y-8">
                <div className="rounded-3xl border border-border bg-card p-8">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">Add or Update Product</h3>
                      <p className="text-sm text-muted-foreground mt-1">Use the form below to manage your product catalog.</p>
                    </div>
                    {successMessage && <p className="text-sm text-emerald-600 font-medium">{successMessage}</p>}
                    {errorMessage && <p className="text-sm text-destructive font-medium">{errorMessage}</p>}
                  </div>

                  <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="text-xs uppercase tracking-widest text-muted-foreground">Product Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                          placeholder="Enter product name"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-widest text-muted-foreground">Price</label>
                        <input
                          type="number"
                          value={price}
                          onChange={(event) => setPrice(event.target.value)}
                          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">Description</label>
                      <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        className="mt-2 w-full min-h-[120px] rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                        placeholder="Write a short product description"
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="text-xs uppercase tracking-widest text-muted-foreground">Product images</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(event) => addImageFiles(event.target.files)}
                          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                        />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Upload multiple images or drag-and-drop additional files into the form.
                        </p>

                        {(productImages.length > 0 || imageFiles.length > 0 || imageUrls.length > 0) && (
                          <div className="mt-4 space-y-4">
                            {productImages.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-xs uppercase tracking-widest text-muted-foreground">Existing gallery images</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  {productImages.map((image, idx) => (
                                    <div key={image.id ?? idx} className="rounded-3xl border border-border bg-background p-3">
                                      <img
                                        src={image.image_full_url || image.image_url}
                                        alt={`Product image ${idx + 1}`}
                                        className="h-28 w-full rounded-2xl object-cover"
                                      />
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        <button
                                          type="button"
                                          onClick={() => moveExistingImage(image.id!, 'left')}
                                          disabled={idx === 0}
                                          className="rounded-full border border-border bg-background px-3 py-2 text-[11px] font-medium text-foreground hover:bg-accent transition-all disabled:opacity-40"
                                        >
                                          Move left
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => moveExistingImage(image.id!, 'right')}
                                          disabled={idx === productImages.length - 1}
                                          className="rounded-full border border-border bg-background px-3 py-2 text-[11px] font-medium text-foreground hover:bg-accent transition-all disabled:opacity-40"
                                        >
                                          Move right
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => removeExistingImage(image.id)}
                                          className="rounded-full bg-destructive px-3 py-2 text-[11px] font-medium text-destructive-foreground hover:bg-destructive/90 transition-all"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {imageFiles.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-xs uppercase tracking-widest text-muted-foreground">New files to upload</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  {imageFiles.map((file, idx) => (
                                    <div key={`${file.name}-${idx}`} className="rounded-3xl border border-border bg-background p-3">
                                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                                      <p className="text-xs text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                                      <button
                                        type="button"
                                        onClick={() => removeNewImage(idx)}
                                        className="mt-3 rounded-full border border-border bg-background px-3 py-2 text-[11px] font-medium text-foreground hover:bg-accent transition-all"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {imageUrls.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs uppercase tracking-widest text-muted-foreground">External image URLs</p>
                                <div className="grid gap-2">
                                  {imageUrls.map((url, idx) => (
                                    <div key={`${url}-${idx}`} className="flex items-center justify-between rounded-3xl border border-border bg-background px-3 py-2 text-sm text-foreground">
                                      <span className="truncate">{url}</span>
                                      <button type="button" onClick={() => removeImageUrl(idx)} className="text-xs font-medium text-destructive hover:text-destructive-foreground">Remove</button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-widest text-muted-foreground">Cover image URL</label>
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(event) => setImageUrl(event.target.value)}
                          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                          placeholder="https://example.com/image.jpg"
                        />

                        <div className="mt-4">
                          <label className="text-xs uppercase tracking-widest text-muted-foreground">Add gallery image URL</label>
                          <div className="mt-2 flex gap-2">
                            <input
                              type="url"
                              value={imageUrlInput}
                              onChange={(event) => setImageUrlInput(event.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                              placeholder="https://example.com/image2.jpg"
                            />
                            <button
                              type="button"
                              onClick={addImageUrl}
                              className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background hover:bg-primary transition-all"
                            >
                              Add
                            </button>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">Use a URL if you want remote images to appear in the gallery.</p>
                        </div>

                        <div className="mt-6">
                          <label className="text-xs uppercase tracking-widest text-muted-foreground">Video URL</label>
                          <input
                            type="url"
                            value={videoUrl}
                            onChange={(event) => setVideoUrl(event.target.value)}
                            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary"
                            placeholder="https://youtube.com/..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-primary transition-all disabled:opacity-60"
                      >
                        {saving ? "Saving…" : editingProductId ? "Update Product" : "Add Product"}
                      </button>
                      {editingProductId && (
                        <button
                          type="button"
                          onClick={resetForm}
                          className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-medium text-foreground hover:bg-accent transition-all"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="rounded-3xl border border-border bg-card p-8">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">Product Catalog</h3>
                      <p className="text-sm text-muted-foreground mt-1">Review, edit, or remove products from the store.</p>
                    </div>
                    <button
                      type="button"
                      onClick={fetchProducts}
                      className="inline-flex items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-all"
                    >
                      Refresh List
                    </button>
                  </div>

                  {loadingSection ? (
                    <p className="mt-8 text-sm text-muted-foreground">Loading products…</p>
                  ) : products.length === 0 ? (
                    <p className="mt-8 text-sm text-muted-foreground">No products available yet.</p>
                  ) : (
                    <div className="mt-8 overflow-x-auto">
                      <table className="min-w-full text-left divide-y divide-border">
                        <thead className="border-b border-border bg-background text-sm uppercase tracking-widest text-muted-foreground">
                          <tr>
                            <th className="px-4 py-4">ID</th>
                            <th className="px-4 py-4">Preview</th>
                            <th className="px-4 py-4">Name</th>
                            <th className="px-4 py-4">Price</th>
                            <th className="px-4 py-4">Created</th>
                            <th className="px-4 py-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {products.map((product) => (
                            <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                              <td className="px-4 py-4 text-sm font-medium text-foreground">#{product.id}</td>
                              <td className="px-4 py-4">
                                {product.images?.[0]?.image_full_url || product.image_url ? (
                                  <img
                                    src={product.images?.[0]?.image_full_url || product.image_url}
                                    alt={product.name}
                                    className="h-16 w-24 rounded-xl object-cover"
                                  />
                                ) : (
                                  <div className="flex h-16 w-24 items-center justify-center rounded-xl border border-border text-[11px] uppercase tracking-[.18em] text-muted-foreground">
                                    No image
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4 text-sm text-foreground">{product.name}</td>
                              <td className="px-4 py-4 text-sm">${Number(product.price).toFixed(2)}</td>
                              <td className="px-4 py-4 text-sm text-muted-foreground">
                                {product.created_at ? new Date(product.created_at).toLocaleDateString() : "—"}
                              </td>
                              <td className="px-4 py-4 text-sm">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(product)}
                                    className="rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-accent transition-all"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(product.id)}
                                    disabled={saving}
                                    className="rounded-full bg-destructive px-4 py-2 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-all disabled:opacity-60"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === "inquiries" && (
              <div className="rounded-3xl border border-border bg-card p-8">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Inquiry Submissions</h3>
                    <p className="text-sm text-muted-foreground mt-1">Review customer submissions and remove entries as needed.</p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchInquiries}
                    className="inline-flex items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-all"
                  >
                    Refresh Inquiries
                  </button>
                </div>

                {loadingSection ? (
                  <p className="mt-8 text-sm text-muted-foreground">Loading inquiries…</p>
                ) : inquiries.length === 0 ? (
                  <p className="mt-8 text-sm text-muted-foreground">No inquiry submissions found.</p>
                ) : (
                  <div className="mt-8 overflow-x-auto">
                    <table className="min-w-full text-left divide-y divide-border">
                      <thead className="border-b border-border bg-background text-sm uppercase tracking-widest text-muted-foreground">
                        <tr>
                          <th className="px-4 py-4">Name</th>
                          <th className="px-4 py-4">Company</th>
                          <th className="px-4 py-4">Email</th>
                          <th className="px-4 py-4">Phone</th>
                          <th className="px-4 py-4">Inquiry Type</th>
                          <th className="px-4 py-4">Date</th>
                          <th className="px-4 py-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {inquiries.map((inquiry) => (
                          <tr key={inquiry.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-4 py-4 text-sm text-foreground">{inquiry.name}</td>
                            <td className="px-4 py-4 text-sm">{inquiry.organization || "—"}</td>
                            <td className="px-4 py-4 text-sm">{inquiry.email}</td>
                            <td className="px-4 py-4 text-sm">{inquiry.phone || "—"}</td>
                            <td className="px-4 py-4 text-sm">{inquiry.inquiry_type || "General"}</td>
                            <td className="px-4 py-4 text-sm text-muted-foreground">
                              {inquiry.created_at ? new Date(inquiry.created_at).toLocaleString() : "—"}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => setViewingInquiry(inquiry)}
                                  className="rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-accent transition-all"
                                >
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteInquiry(inquiry.id)}
                                  className="rounded-full bg-destructive px-4 py-2 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-all"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 px-4 py-8">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl">
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-semibold">{pendingDelete.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{pendingDelete.message}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  className="rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground hover:bg-accent transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="rounded-full bg-destructive px-5 py-3 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-all"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 px-4 py-8">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-8 shadow-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-2xl font-semibold">Inquiry Details</h3>
                <p className="text-sm text-muted-foreground mt-1">Review the full message and contact information.</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingInquiry(null)}
                className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-all"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Name</p>
                <p className="mt-2 text-sm font-medium text-foreground">{viewingInquiry.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Company</p>
                <p className="mt-2 text-sm font-medium text-foreground">{viewingInquiry.organization || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Email</p>
                <p className="mt-2 text-sm font-medium text-foreground">{viewingInquiry.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Phone</p>
                <p className="mt-2 text-sm font-medium text-foreground">{viewingInquiry.phone || "—"}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Inquiry Type</p>
              <p className="mt-2 text-sm font-medium text-foreground">{viewingInquiry.inquiry_type || "General"}</p>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Message</p>
              <p className="mt-2 rounded-3xl border border-border bg-background p-5 text-sm leading-relaxed text-foreground">
                {viewingInquiry.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
