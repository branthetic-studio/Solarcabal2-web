import Star from '../../../Assets/star.png'
import Five from '../../../Assets/star1.png'
import Profile from '../../../Assets/profile.png'
import Like from '../../../Assets/like.png'
import Unlike from '../../../Assets/unlike.png'
import Product from '../page'
import Image from 'next/image'

interface ProductCardProps {
  status: string
}

const ProductCard: React.FC<ProductCardProps> = ({ status }) => {
  const getContent = () => {
    switch (status) {
      case 'Product Detail':
        const reviewsList = [
          {
            img: <Image src={Five} alt="" />,
            text: 'This is an amazing product I have.',
            date: 'July 2, 2020 03:29 PM',
            name: 'John Doe',
            profilePic: <Image src={Profile} alt="" />,
            likeNum: '128',
          },
          {
            img: <Image src={Five} alt="" />,
            text: 'This is an amazing product I have.',
            date: 'July 2, 2020 03:29 PM',
            name: 'John Doe',
            profilePic: <Image src={Profile} alt="" />,
            likeNum: '82',
          },
          {
            img: <Image src={Five} alt="" />,
            text: 'This is an amazing product I have.',
            date: 'July 2, 2020 03:29 PM',
            name: 'John Doe',
            profilePic: <Image src={Profile} alt="" />,
            likeNum: '9',
          },
          {
            img: <Image src={Five} alt="" />,
            text: 'This is an amazing product I have.',
            date: 'July 2, 2020 03:29 PM',
            name: 'John Doe',
            profilePic: <Image src={Profile} alt="" />,
            likeNum: '124',
          },
        ]
        return (
          <div className="content-info">
            <h1>High-Efficiency SKE 3.5KVA Inverter</h1>

            <p>
              Introducing the SKE 3.5KVA Inverter, a cutting-edge solution
              designed for maximum energy efficiency. With a robust 25-year
              warranty, this inverter is perfect for powering your home or
              office. Its sleek design and advanced technology ensure reliable
              performance, making it an ideal choice for residential rooftops.
              Experience uninterrupted power supply and peace of mind with the
              SKE 3.5KVA Inverter.
            </p>

            <h3>Specification</h3>

            <section className="table">
              <div className="table-content">
                <div className="row">
                  <div className="label">Brand</div>
                  <div className="value">Longi</div>
                </div>
                <div className="row">
                  <div className="label">Power Output</div>
                  <div className="value">400W</div>
                </div>
                <div className="row">
                  <div className="label">Efficiency</div>
                  <div className="value">20%</div>
                </div>
                <div className="row">
                  <div className="label">Voltage</div>
                  <div className="value">40V</div>
                </div>
                <div className="row">
                  <div className="label">Dimensions</div>
                  <div className="value">78 × 39 × 1.57 inches</div>
                </div>
              </div>

              <div className="table-content">
                <div className="row">
                  <div className="label">Brand</div>
                  <div className="value">Longi</div>
                </div>
                <div className="row">
                  <div className="label">Power Output</div>
                  <div className="value">400W</div>
                </div>
                <div className="row">
                  <div className="label">Efficiency</div>
                  <div className="value">20%</div>
                </div>
                <div className="row">
                  <div className="label">Voltage</div>
                  <div className="value">40V</div>
                </div>
                <div className="row">
                  <div className="label">Dimensions</div>
                  <div className="value">78 × 39 × 1.57 inches</div>
                </div>
              </div>
            </section>

            <section className="product-reviews">
              <h3>Product Reviews</h3>
              <div className="review-con">
                <div className="review-summary">
                  <div className="rating-text">
                    <span>4.8</span>
                  </div>
                  <div>
                    <div className="stars">
                      <Image src={Five} alt="" />
                    </div>
                    <div className="total-reviews">
                      <p>from 1.25k reviews</p>
                    </div>
                  </div>
                </div>
                <div className="review-breakdown">
                  <div className="star-row">
                    <div className="star-label">
                      <span>5.0</span>
                      <Image src={Star} alt="" />
                    </div>
                    <div className="bar">
                      <div className="filled" style={{ width: '90%' }}></div>
                    </div>
                    <div className="count">
                      <span>2823</span>
                    </div>
                  </div>
                  <div className="star-row">
                    <div className="star-label">
                      <span>4.0</span>
                      <Image src={Star} alt="" />
                    </div>
                    <div className="bar">
                      <div className="filled" style={{ width: '50%' }}></div>
                    </div>
                    <div className="count">
                      <span>38</span>
                    </div>
                  </div>
                  <div className="star-row">
                    <div className="star-label">
                      <span>3.0</span>
                      <Image src={Star} alt="" />
                    </div>
                    <div className="bar">
                      <div className="filled" style={{ width: '20%' }}></div>
                    </div>
                    <div className="count">
                      <span>3</span>
                    </div>
                  </div>
                  <div className="star-row">
                    <div className="star-label">
                      <span>2.0</span>
                      <Image src={Star} alt="" />
                    </div>
                    <div className="bar">
                      <div className="filled" style={{ width: '10%' }}></div>
                    </div>
                    <div className="count">
                      <span>1</span>
                    </div>
                  </div>
                  <div className="star-row">
                    <div className="star-label">
                      <span>1.0</span>
                      <Image src={Star} alt="" />
                    </div>
                    <div className="bar">
                      <div className="filled" style={{ width: '0%' }}></div>
                    </div>
                    <div className="count">
                      <span>0</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="review-filter">
              <aside>
                <h3>Reviews Filter</h3>

                <hr />

                <div className="filter filter-rating">
                  <p>Rating</p>
                  <label>
                    <input type="checkbox" />
                    <div>
                      <Image src={Star} alt="" />
                      <span>5</span>
                    </div>
                  </label>
                  <label>
                    <input type="checkbox" />
                    <div>
                      <Image src={Star} alt="" />
                      <span>4</span>
                    </div>
                  </label>
                  <label>
                    <input type="checkbox" />
                    <div>
                      <Image src={Star} alt="" />
                      <span>3</span>
                    </div>
                  </label>
                  <label>
                    <input type="checkbox" />
                    <div>
                      <Image src={Star} alt="" />
                      <span>2</span>
                    </div>
                  </label>
                  <label>
                    <input type="checkbox" />
                    <div>
                      <Image src={Star} alt="" />
                      <span>1</span>
                    </div>
                  </label>
                </div>

                <hr />

                <div className="filter filter-topics">
                  <p>Review Topics</p>
                  <label>
                    <input type="checkbox" />
                    <span>Product Quality</span>
                  </label>
                  <label>
                    <input type="checkbox" />
                    <span>Seller Services</span>
                  </label>
                  <label>
                    <input type="checkbox" />
                    <span>Product Price</span>
                  </label>
                  <label>
                    <input type="checkbox" />
                    <span>Shipment</span>
                  </label>
                  <label>
                    <input type="checkbox" />
                    <span>Match with Description</span>
                  </label>
                </div>
              </aside>

              <div className="review-list">
                <h3>Review List</h3>

                <div className="review-btn">
                  <button>All Reviews</button>
                  <button>With Photo & Video</button>
                  <button>With Description</button>
                </div>
                {reviewsList.map((review, index) => (
                  <div className="review-item" key={index}>
                    <div className="review-content">
                      <div className="review-text">
                        {review.img}
                        <p>{review.text}</p>
                        <span className="review-date">{review.date}</span>
                      </div>
                      <div className="review-profile">
                        <div className="profile-pic">{review.profilePic}</div>
                        <span className="review-name">{review.name}</span>
                      </div>
                    </div>
                    <div className="likes">
                      <div className="like">
                        <Image src={Like} alt="" />
                        <span>{review.likeNum}</span>
                      </div>
                      <div className="unlike">
                        <Image src={Unlike} alt="" />
                      </div>
                    </div>
                    <hr />
                  </div>
                ))}
              </div>
            </section>

            <Product />
          </div>
        )

      case 'Reviews':
        return <div>Work</div>

      case 'Related Product':
        return <div>only</div>

      default:
        return <div>Unknown status</div>
    }
  }

  return <div>{getContent()}</div>
}

export default ProductCard
