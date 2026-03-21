 export default function ThemePreview() {
  return (
    <div className="p-8 bg-background min-h-screen text-foreground space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary">
          Skill-Link Design System
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
          A high-contrast, professional theme inspired by the CarBook design. 
          Built with Tailwind CSS and CSS Variables.
        </p>
      </section>

      {/* Color Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-primary text-primary-foreground shadow-xl">
          <h3 className="font-bold text-lg">Primary (Midnight Navy)</h3>
          <p className="text-sm opacity-80">Main actions and brand identity.</p>
        </div>
        <div className="p-6 rounded-2xl bg-secondary text-secondary-foreground">
          <h3 className="font-bold text-lg">Secondary (Soft Sky)</h3>
          <p className="text-sm opacity-80">Card backgrounds and inputs.</p>
        </div>
        <div className="p-6 rounded-2xl bg-white text-foreground shadow-sm">
          <h3 className="font-bold text-lg">Surface White</h3>
          <p className="text-sm text-muted-foreground">Clean background fallback.</p>
        </div>
      </div>

      {/* Button Preview */}
      <div className="flex flex-wrap gap-4 items-center justify-center p-8 bg-secondary rounded-2xl border-2 border-dashed border-muted">
        <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all active:scale-95 shadow-md">
          Sign In
        </button>
        <button className="px-6 py-2 bg-white text-primary border-2 border-primary rounded-lg font-medium hover:bg-muted transition-all">
          Learn More
        </button>
        <button className="px-6 py-2 text-destructive font-semibold hover:underline">
          Delete Account
        </button>
      </div>

      {/* Input Preview */}
      <div className="max-w-md mx-auto space-y-2">
        <label className="text-sm font-semibold opacity-80">Email Address</label>
        <input 
          type="text" 
          placeholder="Enter your email"
          className="w-full px-4 py-3 rounded-lg border bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">We'll never share your email with anyone.</p>
      </div>
    </div>
  );
}
