import Image from "next/image";
import { useState } from "react";

interface Props {
  imagen: string;
  setAlbum: (value: string | null) => void;
}

export default function ModalImagen({ imagen, setAlbum }: Props) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [wasDragged, setWasDragged] = useState(false);

  // Mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    setStart({ x: e.clientX, y: e.clientY });
    setDragging(true);
    setWasDragged(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      setWasDragged(true);
    }

    setOffset({ x: dx, y: dy });
  };

  const handleMouseUp = () => {
    setDragging(false);
    setStart(null);
  };

  // Touch
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStart({ x: touch.clientX, y: touch.clientY });
    setDragging(true);
    setWasDragged(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging || !start) return;
    const touch = e.touches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      setWasDragged(true);
    }

    setOffset({ x: dx, y: dy });
  };

  const handleTouchEnd = () => {
    setDragging(false);
    setStart(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={() => {
        setAlbum(null);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
      }}
    >
      <div
        className="relative max-w-3xl w-[90vw] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()} // No cerrar si se clickea dentro
      >
        <Image
          src={imagen}
          alt="Imagen ampliada"
          width={800}
          height={600}
          className="object-contain transition-transform duration-300 cursor-zoom-in touch-none"
          style={{
            transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => {
            handleTouchEnd();
            if (!wasDragged) {
              setZoom((z) => (z === 1 ? 2 : z === 2 ? 3 : 1));
              setOffset({ x: 0, y: 0 });
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (!wasDragged) {
              setZoom((z) => (z === 1 ? 2 : z === 2 ? 3 : 1));
              setOffset({ x: 0, y: 0 });
            }
          }}
        />
        <button
          className="absolute top-2 right-2 text-white text-3xl font-bold"
          onClick={() => {
            setAlbum(null);
            setZoom(1);
            setOffset({ x: 0, y: 0 });
          }}
        >
          &times;
        </button>
      </div>
    </div>
  );
}
