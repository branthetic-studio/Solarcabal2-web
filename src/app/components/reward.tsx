import React, { useState } from "react";
import Image from "next/image";
import { Copy, Check } from "lucide-react";

const Reward = () => {
  const [copied, setCopied] = useState(false);
  const referralCode = "Solarcabal/jhondea";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-linear-to-r from-[#f94848] via-[#ff0000] to-[#f94848] py-10 sm:py-14 md:py-20 pt-16 sm:pt-20 md:pt-28 px-4 sm:px-6 md:px-10 overflow-hidden -mx-4">

      {/* Background gradient decorations */}
      <div
        className="absolute bottom-0 left-0 w-52 h-52 sm:w-64 sm:h-64 md:w-96 md:h-96 pointer-events-none opacity-100 z-10"
        style={{
          background:
            "radial-gradient(circle, rgba(250, 82, 82, 0.951) 0%, rgba(243, 27, 27, 0.814) 30%, transparent 70%)",
          transform: "translate(-30%, 30%)",
          filter: "blur(60px)",
        }}
      />

      <div
        className="absolute top-0 right-0 w-52 h-52 sm:w-64 sm:h-64 md:w-96 md:h-96 pointer-events-none opacity-100 z-10"
        style={{
          background:
            "radial-gradient(circle, rgba(250, 82, 82, 0.951) 0%, rgba(243, 27, 27, 0.814) 30%, transparent 70%)",
          transform: "translate(30%, -30%)",
          filter: "blur(60px)",
        }}
      />

      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-[url('/texture.png')] opacity-80" />

      {/* Content */}
      <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center gap-4 sm:gap-6 md:gap-8">

        {/* Gift Icon */}
        <Image
          src="/bonus.gif"
          alt="Rewards"
          width={56}
          height={56}
          className="sm:w-[60px] sm:h-[60px]"
        />

        {/* Heading */}
        <h4 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
          Refer a Friend & Earn Rewards
        </h4>

        {/* Description */}
        <p className="text-sm sm:text-base md:text-lg text-white leading-relaxed max-w-2xl">
          Help your friends go green and save on energy! Share your referral
          code, and you'll both earn rewards.
        </p>

        {/* Referral Code Box */}
        <div
          className="
            w-full max-w-md
            bg-[#f43a3a]
            rounded-xl
            flex flex-col sm:flex-row
            items-center justify-between
            gap-3
            px-4 sm:px-5
            py-3 sm:py-4
            mt-2
          "
        >
          <span className="text-white text-sm sm:text-base md:text-lg font-medium break-all">
            {referralCode}
          </span>

          <button
            onClick={handleCopy}
            className="
              flex items-center gap-2
              text-white
              hover:text-gray-200
              transition-colors
              text-sm sm:text-base
            "
            aria-label="Copy referral code"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reward;
