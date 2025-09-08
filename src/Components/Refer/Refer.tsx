import React from 'react'
import './Refer.css'

const Refer = () => {
  return (
    <div>
      <div className='refer'>
        <h3>Refer a Friend & Earn Rewards</h3>
        <p>Subscribe to our newsletter to receive updates on new products, special offers
          and solar energy tips.</p>
        <form className="newsletter-form">
          <input type="email" placeholder="Enter your email address" required />
          <button type="submit">Subscribe</button>
        </form>


      </div>
    </div>
  )
}

export default Refer
