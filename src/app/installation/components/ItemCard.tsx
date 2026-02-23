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
    <div className="my-4 mx-auto">
      <div className='relative h-full w-full'>
        {item.img ? (
          <img
            src={item.img}
            alt={item.name}
            className='w-40 h-40 object-cover'
          />
        ) : (
          <div className='w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400'>
            No image
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;  