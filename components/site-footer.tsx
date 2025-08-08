export function SiteFooter() {
  return (
    <footer className="border-t mt-10 bg-white">
      <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground">
        <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
          <div>© {new Date().getFullYear()} Amari — African Magazines Marketplace</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Sellers</a>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
