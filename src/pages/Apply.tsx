import { useState, useEffect } from "react";
import { motion } from "framer-motion";
 import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { Music, Upload, CheckCircle, User, Mail, Phone, MapPin, Mic } from "lucide-react";
 import { useAuth } from "@/hooks/useAuth";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";

export default function Apply() {
   const navigate = useNavigate();
   const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
   const [loading, setLoading] = useState(false);
  const [isApprovedArtist, setIsApprovedArtist] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    stageName: "",
    email: "",
    phone: "",
    location: "",
    genre: "",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      checkArtistStatus();
    } else {
      setCheckingStatus(false);
    }
  }, [user]);

  const checkArtistStatus = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("user_approvals")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .maybeSingle();
      
      setIsApprovedArtist(!!data);
    } catch (error) {
      console.error("Error checking artist status:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     
     if (!user) {
       toast.error("Please sign in first to apply as an artist");
       navigate("/auth");
       return;
     }
 
     setLoading(true);
     try {
       // Check if user already has an approval record
       const { data: existingApproval } = await supabase
         .from("user_approvals")
         .select("id, status")
         .eq("user_id", user.id)
         .maybeSingle();
 
       if (existingApproval) {
         if (existingApproval.status === "pending") {
           toast.info("You already have a pending application");
           navigate("/pending-approval");
           return;
         } else if (existingApproval.status === "approved") {
           toast.info("You're already approved as an artist!");
           navigate("/profile");
           return;
         }
       }
 
       // Create approval record for artist application
       const { error } = await supabase.from("user_approvals").insert({
         user_id: user.id,
         email: formData.email || user.email || "",
         display_name: formData.stageName || formData.fullName,
         auth_provider: "artist_application",
         status: "pending",
       });
 
       if (error) throw error;
 
       setSubmitted(true);
     } catch (error: any) {
       console.error("Application error:", error);
       toast.error(error.message || "Failed to submit application");
     } finally {
       setLoading(false);
     }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // If user is already an approved artist, show message
  if (!checkingStatus && isApprovedArtist) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-32 pb-20 px-4">
          <div className="container mx-auto flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md"
            >
              <GlassCard className="text-center py-12" hover={false}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-primary" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-3">You're Already an Artist!</h2>
                <p className="text-muted-foreground mb-6">
                  You're approved as a ZAMVEKA artist. Head to your profile to upload music and manage your content.
                </p>
                <GradientButton onClick={() => navigate("/profile")}>
                  Go to Profile
                </GradientButton>
              </GlassCard>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-32 pb-20 px-4">
          <div className="container mx-auto flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md"
            >
              <GlassCard className="text-center py-12" hover={false}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-3">Application Submitted!</h2>
                <p className="text-muted-foreground mb-6">
                  Thank you for applying to ZAMVEKA. We'll review your application and get back to you soon.
                </p>
                <GradientButton onClick={() => window.location.href = "/"}>
                  Back to Home
                </GradientButton>
              </GlassCard>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-28 pb-20">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full bg-secondary/20 blur-[150px]"
          />
          <motion.div
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute bottom-20 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/20 blur-[120px]"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6">
              <Music className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">For Artists</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Join </span>
              <span className="gradient-text">ZAMVEKA</span>
            </h1>
            <p className="text-muted-foreground">
              Apply to become a ZAMVEKA artist and share your music with thousands of listeners across Malawi.
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <GlassCard className="p-8" hover={false}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-full bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Stage Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mic className="w-4 h-4 text-muted-foreground" />
                    Stage Name
                  </label>
                  <input
                    type="text"
                    name="stageName"
                    value={formData.stageName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-full bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                    placeholder="Your artist/stage name"
                  />
                </div>

                {/* Email & Phone Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-full bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-full bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                      placeholder="+265..."
                    />
                  </div>
                </div>

                {/* Location & Genre Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-full bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                      placeholder="City, Malawi"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Music className="w-4 h-4 text-muted-foreground" />
                      Genre
                    </label>
                    <select
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-full bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
                    >
                      <option value="" className="bg-background">Select genre</option>
                      <option value="afrobeats" className="bg-background">Afrobeats</option>
                      <option value="hiphop" className="bg-background">Hip Hop</option>
                      <option value="gospel" className="bg-background">Gospel</option>
                      <option value="reggae" className="bg-background">Reggae</option>
                      <option value="rnb" className="bg-background">R&B</option>
                      <option value="dancehall" className="bg-background">Dancehall</option>
                      <option value="traditional" className="bg-background">Traditional</option>
                      <option value="other" className="bg-background">Other</option>
                    </select>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tell us about yourself</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-2xl bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground resize-none"
                    placeholder="Share your story, musical journey, and what makes your sound unique..."
                  />
                </div>

                {/* Upload Notice */}
                <div className="glass-card rounded-2xl p-4 flex items-start gap-3">
                  <Upload className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Music Uploads</p>
                    <p className="text-xs text-muted-foreground">
                      Once approved, you'll be able to upload your tracks directly through your artist dashboard.
                    </p>
                  </div>
                </div>

                {/* Submit */}
                 <GradientButton type="submit" className="w-full" size="lg" disabled={loading}>
                   {loading ? "Submitting..." : "Submit Application"}
                </GradientButton>
                 
                 {!user && (
                   <p className="text-xs text-center text-muted-foreground">
                     You'll need to sign in before submitting your application.
                   </p>
                 )}
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
