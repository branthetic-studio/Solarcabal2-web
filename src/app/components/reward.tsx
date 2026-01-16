import React, { useState } from "react";
import Image from "next/image";
import { Copy, Check } from "lucide-react";
import RewardImg from "../../Assets/referral-gift.png";

const Reward = () => {
  const [copied, setCopied] = useState(false);
  const referralCode = "Solarcabal/jhondea";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-linear-to-r from-[#f94848] via-[#ff0000] to-[#f94848] py-10 md:py-16 pt-20 md:pt-30 px-4 overflow-hidden -mx-4">
      {/* Background gradient decorations */}
      <div
        className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 pointer-events-none opacity-100 z-10"
        style={{
          background:
            "radial-gradient(circle, rgba(250, 82, 82, 0.951) 0%, rgba(243, 27, 27, 0.814) 30%, transparent 70%)",
          transform: "translate(-30%, 30%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 pointer-events-none opacity-100 z-100"
        style={{
          background:
            "radial-gradient(circle, rgba(250, 82, 82, 0.951) 0%, rgba(243, 27, 27, 0.814) 30%, transparent 70%)",
          transform: "translate(30%, -30%)",
          filter: "blur(60px)",
        }}
      />

       <div className="absolute inset-0 bg-[url('/texture.png')] opacity-80"></div>

      <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center gap-6 md:gap-8">
        {/* Gift Icon */}
        <Image
          src="/bonus.gif"
          alt="Rewards"
          className="w-28 h-28 md:w-36 md:h-36 object-contain"
          width={60}
          height={60}
        />

        {/* Heading */}
        <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
          Refer a Friend & Earn Rewards
        </h4>

        {/* Description */}
        <p className="text-xl md:text-xl text-[#ffffff] leading-relaxed max-w-4xl">
          Help your friends go green and save on energy! Share your referral
          code, and you'll both earn rewards.
        </p>

        {/* Referral Code Box */}
        <div className="w-full max-w-md bg-[#f43a3a] rounded-xl flex items-center justify-between px-5 py-4 mt-2">
          <span className="text-white text-base md:text-lg font-medium">
            {referralCode}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
            aria-label="Copy referral code"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                <span className="text-sm font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span className="text-sm font-medium">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reward;
