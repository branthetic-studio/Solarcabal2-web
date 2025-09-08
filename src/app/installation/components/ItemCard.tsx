"use client"
import React from 'react';


interface Item {
  name: string;
  desc: string;
  img: string;
}

interface Props {
  item: Item;
}

const ItemCard: React.FC<Props> = ({ item }) => {
  return (
    <div className="item-card">
      <div className='item-img'>
        <img src={item.img} alt={item.name} />
      </div>
      <p className="item-title">{item.name}</p>
      <p className="item-desc">{item.desc}</p>
    </div>
  );
};

export default ItemCard;
