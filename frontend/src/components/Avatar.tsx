'use client';

import React from 'react';

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  className?: string;
  size?: 8 | 9 | 10 | 12 | 16;
}

const sizeMap = {
  8: 'h-8 w-8 text-xs',
  9: 'h-9 w-9 text-xs',
  10: 'h-10 w-10 text-sm',
  12: 'h-12 w-12 text-base font-bold',
  16: 'h-16 w-16 text-xl font-extrabold',
};

export const Avatar: React.FC<AvatarProps> = ({
  firstName = '',
  lastName = '',
  avatarUrl,
  className = '',
  size = 10,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const first = firstName ? firstName.trim() : '';
  const last = lastName ? lastName.trim() : '';
  const initial = first ? first.charAt(0).toUpperCase() : (last ? last.charAt(0).toUpperCase() : '?');

  // Premium background gradient colors based on name hash
  const colors = [
    'from-teal-500/30 to-cyan-500/20 text-teal-300 border-teal-500/30',
    'from-indigo-500/30 to-purple-500/20 text-indigo-300 border-indigo-500/30',
    'from-pink-500/30 to-rose-500/20 text-pink-300 border-pink-500/30',
    'from-emerald-500/30 to-teal-500/20 text-emerald-300 border-emerald-500/30',
    'from-amber-500/30 to-orange-500/20 text-amber-300 border-amber-500/30',
    'from-blue-500/30 to-indigo-500/20 text-blue-300 border-blue-500/30',
    'from-violet-500/30 to-purple-500/20 text-violet-300 border-violet-500/30',
    'from-fuchsia-500/30 to-pink-500/20 text-fuchsia-300 border-fuchsia-500/30',
  ];

  const charCodeSum = (first + last).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorClass = colors[charCodeSum % colors.length];

  const sizeClass = sizeMap[size] || sizeMap[10];

  const hasValidImage = avatarUrl && !avatarUrl.includes('dicebear.com') && avatarUrl.trim() !== '' && !imageError;

  if (hasValidImage) {
    return (
      <img
        src={avatarUrl}
        alt={`${first} ${last}`}
        className={`rounded-full object-cover border border-slate-800 bg-slate-900 shrink-0 ${sizeClass} ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center bg-gradient-to-br border shadow-inner shrink-0 select-none ${colorClass} ${sizeClass} ${className}`}
    >
      {initial}
    </div>
  );
};
