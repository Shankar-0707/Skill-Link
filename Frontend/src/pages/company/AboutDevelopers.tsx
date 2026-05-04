import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { 
  ArrowLeft, 
  Github, 
  Linkedin, 
  Mail, 
  Code2, 
  Database, 
  Server, 
  Sparkles,
  Globe,
  Zap
} from "lucide-react";

interface SocialLink {
  icon: React.ElementType;
  url: string;
  label: string;
}

interface Developer {
  id: string;
  name: string;
  role: string;
  image: string;
  description: string;
  contributions: string[];
  socials: SocialLink[];
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
}

const developers: Developer[] = [
  {
    id: "shankar",
    name: "Shankar Jangid",
    role: "Full Stack Developer",
    image: "/Shankar-skill-link.jpg",
    description: "Passionate about building scalable marketplace solutions and crafting seamless user experiences. Orchestrated the core foundation of SkillLink.",
    contributions: [
      "Designed and implemented the core application architecture.",
      "Engineered the matching & search algorithms for the marketplace.",
      "Ensured end-to-end integration and responsive frontend styling."
    ],
    socials: [
      { icon: Linkedin, url: "https://www.linkedin.com/in/shankar-07jangid/", label: "LinkedIn" },
      { icon: Github, url: "https://github.com/Shankar-0707/", label: "GitHub" },
      
      { icon: Mail, url: "mailto:shankarjangid550@gmail.com", label: "Email" }
    ],
    accentColor: "#afc8f0",
    gradientFrom: "#001f3f",
    gradientTo: "#afc8f0"
  },
  {
    id: "udit",
    name: "Udit Bansal",
    role: "Full Stack Developer",
    image: "/Udit-skill-link.jpeg",
    description: "Expert in building robust backend systems and real-time features. Focused on API performance and secure data flows across SkillLink.",
    contributions: [
      "Built the real-time chat and notification systems via WebSockets.",
      "Implemented secure escrow payment logic and transaction flows.",
      "Optimized postgres queries and backend REST endpoints."
    ],
    socials: [
      { icon: Linkedin, url: "https://www.linkedin.com/in/udit-bansal-4515712b2/", label: "LinkedIn" },
      { icon: Github, url: "https://github.com/Udi2312", label: "GitHub" },
      
      { icon: Mail, url: "mailto:udit.ban2312@gmail.com", label: "Email" }
    ],
    accentColor: "#fdb69a",
    gradientFrom: "#391303",
    gradientTo: "#fdb69a"
  },
  {
    id: "vidhit",
    name: "Vidhit Sikri",
    role: "Full Stack Developer",
    image: "/Vidhit-skill-link.jpg",
    description: "Dedicated to creating secure authentication systems and intuitive user interfaces. Handled critical user journeys and security implementations.",
    contributions: [
      "Developed robust JWT authentication and KYC verification pipelines.",
      "Integrated Cloudinary for high-performance media storage & delivery.",
      "Created sleek, highly interactive UI components and dashboards."
    ],
    socials: [
      { icon: Linkedin, url: "https://www.linkedin.com/in/vidhit-sikri/", label: "LinkedIn" },
      { icon: Github, url: "https://github.com/VidhitSikri", label: "GitHub" },
      { icon: Mail, url: "mailto:sikrividhit@gmail.com", label: "Email" }
    ],
    accentColor: "#b7c8de",
    gradientFrom: "#38485a",
    gradientTo: "#d2e4fb"
  }
];

export const AboutDevelopers: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20"
          style={{ background: `radial-gradient(circle, ${developers[0].accentColor}, transparent)` }}
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-20"
          style={{ background: `radial-gradient(circle, ${developers[1].accentColor}, transparent)` }}
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${developers[2].accentColor}, transparent)` }}
          animate={{ 
            scale: [1, 1.4, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 p-6 pointer-events-none">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/"
            className="pointer-events-auto inline-flex items-center gap-2 px-6 py-3 rounded-full bg-surface-container/80 backdrop-blur-xl border border-outline-variant text-sm font-medium text-foreground hover:bg-surface-container-high hover:border-outline transition-all duration-300 group shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Hero Section - Team Introduction */}
      <motion.section 
        style={{ opacity, scale }}
        className="relative pt-32 pb-20 px-6"
      >
        <div className="max-w-6xl mx-auto">
          {/* Team Image Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative mb-16"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary-container to-tertiary-container opacity-20 blur-3xl rounded-full" />
            <div className="relative bg-surface-container-high backdrop-blur-xl border border-outline-variant rounded-3xl p-8 md:p-12 shadow-2xl">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Team Photo Placeholder */}
                <div className="relative w-full md:w-1/2 group">
                  <div className="aspect-video rounded-2xl overflow-hidden border-2 border-outline-variant shadow-xl bg-surface-container relative">
                    <img 
                      src="/skill-llink-team.jpg" 
                      alt="SkillLink Team"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <motion.div
                    className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary-container opacity-30 blur-2xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>

                {/* Team Description */}
                <div className="w-full md:w-1/2 space-y-6">
                  <div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container/50 border border-primary/20 mb-4"
                    >
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">Meet the Team</span>
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-4">
                      The Minds Behind{" "}
                      <span className="bg-gradient-to-r from-primary via-secondary-fixed-dim to-tertiary-fixed-dim bg-clip-text text-transparent">
                        SkillLink
                      </span>
                    </h1>
                  </div>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    We are a passionate team of full-stack developers dedicated to revolutionizing how people connect with skilled professionals and quality products. SkillLink is our vision of a seamless marketplace that empowers workers, organisations, and customers alike.
                  </p>
                  
                  <p className="text-base text-muted-foreground leading-relaxed">
                    With expertise spanning modern web technologies, cloud architecture, and user experience design, we've built SkillLink from the ground up to be secure, scalable, and delightful to use. Every feature is crafted with care, every interaction designed with purpose.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container border border-outline-variant">
                      <Code2 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Full Stack</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container border border-outline-variant">
                      <Database className="w-4 h-4 text-secondary-fixed-dim" />
                      <span className="text-sm font-medium">Scalable</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container border border-outline-variant">
                      <Globe className="w-4 h-4 text-tertiary-fixed-dim" />
                      <span className="text-sm font-medium">Modern</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section Divider */}
          <div className="flex items-center gap-4 mb-16">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-outline to-transparent" />
            <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-surface-container border border-outline-variant">
              <Server className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Our Developers</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-outline to-transparent" />
          </div>
        </div>
      </motion.section>

      {/* Individual Developer Profiles */}
      <section className="pb-32 px-6">
        <div className="max-w-4xl mx-auto space-y-32">
          {developers.map((dev) => (
            <DeveloperProfile 
              key={dev.id} 
              developer={dev} 
            />
          ))}
        </div>
      </section>
    </div>
  );
};

interface DeveloperProfileProps {
  developer: Developer;
}

const DeveloperProfile: React.FC<DeveloperProfileProps> = ({ developer }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative"
    >
      {/* Glow Effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl -z-10"
        style={{ 
          background: `radial-gradient(circle at center, ${developer.accentColor}20, transparent)` 
        }}
      />

      <div className={`flex flex-col lg:flex-col gap-12 items-center group text-center`}>
        {/* Image Side */}
        <motion.div 
          className="w-full relative flex justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="relative">
            {/* Decorative Elements */}
            <motion.div
              className="absolute -inset-4 rounded-full opacity-50 blur-2xl"
              style={{ background: `linear-gradient(135deg, ${developer.gradientFrom}, ${developer.gradientTo})` }}
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Image Container Make it circular */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-outline-variant shadow-2xl bg-surface-container mx-auto">
              <img 
                src={developer.image} 
                alt={developer.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{ background: `linear-gradient(135deg, ${developer.gradientFrom}, ${developer.gradientTo})` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Content Side */}
        <motion.div 
          className="w-full lg:w-3/4 space-y-6 flex flex-col items-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Name & Role */}
          <div className="flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-2">
              {developer.name}
            </h2>
            <div className="flex items-center gap-3">
              <div 
                className="h-1 w-8 rounded-full"
                style={{ background: `linear-gradient(90deg, ${developer.gradientFrom}, ${developer.gradientTo})` }}
              />
              <p 
                className="text-xl font-semibold"
                style={{ color: developer.accentColor }}
              >
                {developer.role}
              </p>
              <div 
                className="h-1 w-8 rounded-full"
                style={{ background: `linear-gradient(90deg, ${developer.gradientFrom}, ${developer.gradientTo})` }}
              />
            </div>
          </div>

          {/* Description */}
          <p className="text-lg text-muted-foreground leading-relaxed">
            {developer.description}
          </p>

          {/* Key Contributions */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: developer.accentColor }} />
              Key Contributions
            </h3>
            
            <div className="space-y-3">
              <ul className="space-y-2">
                {developer.contributions.map((contribution, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: developer.accentColor }} />
                    <span className="text-sm md:text-base text-muted-foreground">{contribution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4 pt-6">
            {developer.socials.map((social, i) => (
              <motion.a
                key={i}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-surface-container border border-outline-variant hover:border-outline transition-all duration-300 group/social"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label={social.label}
              >
                <social.icon 
                  className="w-5 h-5 text-muted-foreground group-hover/social:text-foreground transition-colors" 
                />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};