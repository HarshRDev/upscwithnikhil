export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[#E5D5C3] bg-[#F5EBDD]">

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* TOP */}
        <div className="grid md:grid-cols-3 gap-8">

          {/* BRAND */}
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">
              UPSC Prep
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Helping aspirants crack UPSC with structured learning,
              courses, and test series.
            </p>
          </div>

          {/* LINKS */}
          <div>
            <h3 className="font-semibold text-[#0F172A] mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="hover:text-black cursor-pointer">Courses</li>
              <li className="hover:text-black cursor-pointer">Test Series</li>
              <li className="hover:text-black cursor-pointer">Articles</li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="font-semibold text-[#0F172A] mb-3">
              Contact
            </h3>
            <p className="text-sm text-gray-600">
              Email: support@upscwithnikhil.com
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Phone: +91 90969 39366
            </p>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="mt-10 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} UPSC Prep. All rights reserved.
        </div>

      </div>
    </footer>
  );
}