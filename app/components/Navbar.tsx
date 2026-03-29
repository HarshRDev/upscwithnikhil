import Logo from "./Logo";
export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#F5EBDD]/80 border-b border-[#E5D5C3]">

      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        
        <Logo />

        {/* LINKS */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-700">
          <a href="#" className="hover:text-black transition">
            Courses
          </a>
          <a href="#" className="hover:text-black transition">
            Test Series
          </a>
          <a href="#" className="hover:text-black transition">
            Articles
          </a>
        </div>

        {/* CTA */}
        <button className="bg-pink-500 text-white px-4 py-2 rounded-lg text-sm 
        hover:scale-105 hover:shadow-md transition-all duration-200">
          Login
        </button>

      </div>
    </nav>
  );
}