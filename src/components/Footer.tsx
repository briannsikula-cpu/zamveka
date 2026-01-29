import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Instagram, Facebook, Twitter, Youtube, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-border/30">
      <div className="glass-card border-0 rounded-none py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <h2 className="text-2xl font-bold gradient-text mb-4">ZAMVEKA</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Malawi's premier music streaming platform. Discover, stream, and rise with local talent.
              </p>
              {/* Social Icons */}
              <div className="flex gap-3 mt-6">
                {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ scale: 1.15, y: -2 }}
                    className="glass-button p-2.5 rounded-full"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Platform</h3>
              <ul className="space-y-3">
                {["Home", "Trending", "Playlists", "Library"].map((item) => (
                  <li key={item}>
                    <Link
                      to="/"
                      className="text-muted-foreground text-sm hover:text-primary transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-foreground">Company</h3>
              <ul className="space-y-3">
                {["About", "Contact", "Careers", "Press"].map((item) => (
                  <li key={item}>
                    <Link
                      to={item === "About" ? "/about" : "/"}
                      className="text-muted-foreground text-sm hover:text-primary transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-foreground">Artists</h3>
              <ul className="space-y-3">
                {["Apply Now", "Artist Portal", "Upload Music", "Guidelines"].map((item) => (
                  <li key={item}>
                    <Link
                      to={item === "Apply Now" ? "/apply" : "/"}
                      className="text-muted-foreground text-sm hover:text-primary transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border/30 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm flex items-center gap-1">
              © 2026 ZAMVEKA. Made with <Heart className="w-4 h-4 text-destructive" /> in Malawi
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
