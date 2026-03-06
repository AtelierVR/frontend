'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { Icon } from '@iconify/react';

interface ImageUploaderProps {
  value: string | null | undefined;
  onChange: (file: string) => void;
  onFlagChange: (flag: number) => void;
  flag: number;
  currentFlag: number;
  className?: string;
  id: string;
  width: number;
  height: number;
  src: string;
  alt: string;
}

export default function ImageUploader({
  value,
  onChange,
  onFlagChange,
  flag,
  currentFlag,
  className,
  id,
  width,
  height,
  src,
  alt
}: ImageUploaderProps) {
  const [imageError, setImageError] = useState(false);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      console.warn('Dropped file is not an image');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
      setImageError(false);
      onFlagChange(flag | currentFlag);
    };
    reader.readAsDataURL(file);
  }

  function handleUpload() {
    const fileInput = document.getElementById(id) as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
      setImageError(false);
      onFlagChange(flag | currentFlag);
    };
    reader.readAsDataURL(e.target.files[0]);
  }

  return (
    <>
      <input
        type="file"
        onChange={handleChange}
        accept="image/*"
        className="hidden"
        id={id}
      />
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border-2 border-dashed transition-all cursor-pointer group',
          'bg-fd-muted/30 hover:bg-fd-muted/50',
          dragging
            ? 'border-fd-primary bg-fd-primary/10'
            : 'border-fd-border hover:border-fd-muted-foreground/50',
          className
        )}
        style={{ aspectRatio: `${width} / ${height}` }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={handleDrop}
      >
        {!imageError && (value || src) ? (
          <Image
            className="w-full h-full object-cover not-prose"
            src={value || src}
            alt={alt}
            width={width}
            height={height}
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-fd-muted-foreground">
            <Icon icon="material-symbols:image-rounded" className="size-8" />
            <span className="text-sm font-medium">No image</span>
          </div>
        )}

        {/* Overlay on drag */}
        <div
          className={cn(
            'absolute inset-0 bg-fd-primary/20 backdrop-blur-sm transition-opacity',
            'flex flex-col items-center justify-center gap-2 text-fd-primary-foreground',
            dragging ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          <Icon icon="material-symbols:upload-rounded" className="size-8" />
          <span className="text-sm font-semibold">Drop to upload</span>
        </div>

        {/* Overlay on hover */}
        <div
          onClick={handleUpload}
          className={cn(
            'absolute inset-0 bg-fd-background/80 backdrop-blur-sm transition-opacity',
            'flex flex-col items-center justify-center gap-2',
            'opacity-0 group-hover:opacity-100'
          )}
        >
          <Icon icon="material-symbols:upload-rounded" className="size-6 text-fd-muted-foreground" />
          <span className="text-sm font-medium text-fd-muted-foreground">
            Click to upload
          </span>
        </div>
      </div>
    </>
  );
}
