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
    <div className="my-4">
      <div className='flex gap-3 items-center'>
        <div className='flex-1'>
          <p className="text-xs">{item.name}</p>
          <p className="text-xs">{item.desc}</p>
        </div>
        <img src={item.img} alt={item.name} className='flex-1' width={12} height={12}/>
      </div>

    </div>
  );
};

export default ItemCard;
