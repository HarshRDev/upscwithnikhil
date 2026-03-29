export default function Logo() {
  return (
    <div className="flex items-center gap-3 cursor-pointer">

      {/* ICON */}
      <div className="w-10 h-10 rounded-xl bg-linear-to-r from-pink-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-md">

        {/* SVG ICON (better than emoji) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6l4 2M12 2a10 10 0 100 20 10 10 0 000-20z"
          />
        </svg>
      </div>

      {/* TEXT */}
      <div className="flex flex-col leading-tight">
        <span className="text-[15px] font-bold tracking-tight text-[#0F172A]">
          UPSCWITHNIKHIL
        </span>
        <span className="text-[10px] text-gray-500">
          Learn Smart. Crack UPSC.
        </span>
      </div>

    </div>
  );
}