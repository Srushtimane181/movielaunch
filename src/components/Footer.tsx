import { Facebook, Twitter, Instagram, Youtube, Smartphone } from "lucide-react";

const footerLinks = {
  company: [
    { name: "About Us", href: "#" },
    { name: "Contact Us", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Press", href: "#" },
  ],
  help: [
    { name: "Help & Support", href: "#" },
    { name: "FAQs", href: "#" },
    { name: "Terms & Conditions", href: "#" },
    { name: "Privacy Policy", href: "#" },
  ],
  categories: [
    { name: "Movies", href: "#" },
    { name: "Events", href: "#" },
    { name: "Sports", href: "#" },
    { name: "Plays", href: "#" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <a href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-xl font-bold text-primary-foreground">B</span>
              </div>
              <span className="text-xl font-bold text-card-foreground">BookMyShow</span>
            </a>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Your one-stop destination for booking movie tickets, events, plays, and sports
              online. Experience entertainment like never before.
            </p>
            {/* App Download */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-card-foreground">Get the App</span>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 transition-colors hover:bg-secondary/80"
                >
                  <Smartphone className="h-5 w-5 text-card-foreground" />
                  <div className="text-left">
                    <div className="text-[10px] text-muted-foreground">Download on</div>
                    <div className="text-xs font-semibold text-card-foreground">App Store</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 transition-colors hover:bg-secondary/80"
                >
                  <Smartphone className="h-5 w-5 text-card-foreground" />
                  <div className="text-left">
                    <div className="text-[10px] text-muted-foreground">Get it on</div>
                    <div className="text-xs font-semibold text-card-foreground">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-card-foreground">
              Company
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-card-foreground">
              Help
            </h4>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-card-foreground">
              Categories
            </h4>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          {/* Copyright */}
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} BookMyShow. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
