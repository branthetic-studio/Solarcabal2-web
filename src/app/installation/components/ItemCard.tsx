"use client"
import React from 'react';

interface Item {
  name: string;
  desc: string;
  img: string;
  collectionImg?: string; // ← add this
}

interface Props {
  item: Item;
  collectionImg?: string; // ← or pass as a separate prop
}

const ItemCard: React.FC<Props> = ({ item, collectionImg }) => {
  const displayImg = collectionImg || item.img; // sidebar image takes priority

  return (
    <div className="my-4 mx-auto">
      <div className='relative h-full w-full'>
        {displayImg ? (
          <img
            src={displayImg}
            alt={item.name}
            className='w-full h-50 mx-auto object-cover'
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