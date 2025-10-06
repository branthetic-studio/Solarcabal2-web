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
    <div className="relative bg-[#1c1c1c] py-8 md:py-12 px-4 overflow-hidden">
      {/* Background gradient decorations */}
      <div
        className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 pointer-events-none opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(82, 82, 82, 0.4) 0%, rgba(82, 82, 82, 0.2) 30%, transparent 70%)",
          transform: "translate(-30%, 30%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 pointer-events-none opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(82, 82, 82, 0.4) 0%, rgba(82, 82, 82, 0.2) 30%, transparent 70%)",
          transform: "translate(30%, -30%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center gap-6 md:gap-8">
        {/* Gift Icon */}
        <Image
          src={RewardImg}
          alt="Rewards"
          className="w-28 h-28 md:w-36 md:h-36 object-contain"
        />

        {/* Heading */}
        <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
          Refer a Friend & Earn Rewards
        </h4>

        {/* Description */}
        <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-2xl px-2">
          Help your friends go green and save on energy! Share your referral
          code, and you'll both earn rewards.
        </p>

        {/* Referral Code Box */}
        <div className="w-full max-w-md bg-[#2a2a2a] rounded-xl flex items-center justify-between px-5 py-4 mt-2">
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
