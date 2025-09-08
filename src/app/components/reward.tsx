"use client"
import React from 'react';
import Image from 'next/image'
import RewardImg from '../../Assets/referral-gift.png';

const Reward = () => {
  return (
    <div className='rewards-container'>
      <div className='reward-section' >
        <Image src={RewardImg} alt='Rewards' className='reward-image' />
        <h4>Refer a Friend & Earn Rewards</h4>
        <p>Share the benefits of solar energy with your friends and family. For every successful referral, you&apos;ll receive $100 in store credit, and your friend will get a 5% discount on their first purchase.</p>
        <button className='rewards-btn'>Join Referral Program</button>
      </div>
    </div>
  )
}

export default Reward;