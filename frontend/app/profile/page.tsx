"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, CheckCircle2 } from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import apiClient from "@/lib/api/client";

export default function ProfilePage() {
  const { user, checkSession, isAuthenticated, loading: sessionLoading } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    profilePhoto: "",
    emergencyContactName: "",
    relationship: "",
    emergencyContactPhone: "",
    emergencyContactEmail: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, sessionLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        dob: (user as any).dob ? new Date((user as any).dob).toISOString().split('T')[0] : "",
        gender: (user as any).gender || "",
        phone: (user as any).phone || "",
        email: user.email || "",
        profilePhoto: (user as any).profilePhoto || "",
        emergencyContactName: (user as any).emergencyContact?.name || "",
        relationship: (user as any).emergencyContact?.relationship || "",
        emergencyContactPhone: (user as any).emergencyContact?.phone || "",
        emergencyContactEmail: (user as any).emergencyContact?.email || "",
      });
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
         alert('File size should be less than 5MB');
         return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      await apiClient.put("/auth/me", formData);
      await checkSession();
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      console.error("Failed to update profile", err);
      setError(
        err?.response?.data?.message ||
        "Failed to save changes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  if (!user || sessionLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "AA";
  const avatarUrl = formData.profilePhoto || (user as any).profilePhoto;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 pt-24 pb-12">
      <Container className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={handleCancel} className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-extrabold tracking-tight ml-auto">My Profile</h1>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
            <span className="font-medium">⚠ {error}</span>
          </div>
        )}

        {/* Success Toast / Notification */}
        {success && (
          <div className="p-4 rounded-xl bg-[#D1E1F7] border border-[#297194] text-[#1a4a5e] flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 text-[#297194]" />
            <p className="font-medium">Profile completely updated! Redirecting to dashboard...</p>
          </div>
        )}

        <Card className="p-6 md:p-8 rounded-3xl shadow-xl border-primary/10 bg-card/90 backdrop-blur-sm space-y-8">
          
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center gap-3 pb-8 border-b border-primary/10">
            <label className="w-32 h-32 rounded-full bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center relative group cursor-pointer hover:border-primary transition-colors overflow-hidden">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-primary text-4xl">{initials}</span>
              )}
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white mb-1" />
                <span className="text-white text-xs font-semibold">Upload Photo</span>
              </div>
            </label>
            <p className="text-sm text-muted-foreground">Click to upload a new profile picture</p>
          </div>

          {/* Personal Info */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-foreground tracking-tight border-l-4 border-primary pl-3">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Full Name</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-background text-foreground py-2" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Email Address</label>
                <Input value={formData.email} disabled className="bg-muted text-muted-foreground py-2 cursor-not-allowed border-dashed" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Date of Birth</label>
                <Input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="bg-background text-foreground py-2" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Gender</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold">Phone Number</label>
                <Input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-background text-foreground py-2" />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-5 pt-8 border-t border-primary/10">
            <h3 className="text-lg font-bold text-foreground tracking-tight border-l-4 border-primary pl-3">Emergency Contact</h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Contact Name</label>
                <Input value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})} className="bg-background text-foreground py-2" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Relationship</label>
                <Input value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value})} className="bg-background text-foreground py-2" placeholder="e.g. Parent, Sibling" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Phone Number</label>
                <Input type="tel" value={formData.emergencyContactPhone} onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})} className="bg-background text-foreground py-2" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Contact Email <span className="text-xs font-normal text-muted-foreground ml-1">(Optional)</span></label>
                <Input type="email" value={formData.emergencyContactEmail} onChange={e => setFormData({...formData, emergencyContactEmail: e.target.value})} className="bg-background text-foreground py-2" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-primary/10">
            <Button variant="outline" size="lg" onClick={handleCancel} disabled={loading} className="w-full">
              Cancel
            </Button>
            <Button size="lg" onClick={handleSave} disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
}
