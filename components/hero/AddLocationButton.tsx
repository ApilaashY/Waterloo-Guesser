import Link from "next/link";
import Image from "next/image";

interface AddLocationButtonProps {
  animationComplete: boolean;
  size?: "desktop" | "mobile";
}

export default function AddLocationButton({ animationComplete, size = "desktop" }: AddLocationButtonProps) {
  const isDesktop = size === "desktop";
  const containerSize = isDesktop ? "max-w-[6rem] max-h-[6rem]" : "w-12 h-12";
  const textSize = isDesktop ? "text-xs sm:text-sm" : "text-sm";
  const textOpacity = isDesktop ? "opacity-0 group-hover:opacity-100" : "";
  const imageFilter = "hue-rotate(220deg) brightness(1.2) contrast(1.1)";
  const href = size === "desktop" ? "/add-location" : "/add-location";

  return (
    <Link href={href}>
      <button
        className={`group relative transition-all duration-500 ${
          size === "desktop" 
            ? (animationComplete
                ? "opacity-100 scale-100"
                : "opacity-0 scale-75 pointer-events-none")
            : "p-2"
        }`}
      >
        <div className="relative flex flex-col items-center justify-center">
          <div className={`${containerSize} flex items-center justify-center`}>
            <Image
              src="/camera icon clean.png"
              alt="Camera Icon"
              width={96}
              height={96}
              className="max-w-full max-h-full group-hover:scale-110 transition-transform duration-300 relative z-10"
              style={imageFilter ? { filter: imageFilter } : {}}
            />
          </div>
          <div className={`mt-${isDesktop ? '1 sm:mt-2' : '2'} text-[#090C9B] ${textSize} font-semibold ${textOpacity} transition-opacity duration-300 relative z-10`}>
            Add Location
          </div>
        </div>
      </button>
    </Link>
  );
}
