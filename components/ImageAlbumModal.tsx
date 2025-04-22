// components/ImageAlbumModal.tsx
import React from 'react';

type ImageAlbumModalProps = {
  album: { imgs: string[]; idx: number };
  setAlbum: (a: null | { imgs: string[]; idx: number }) => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  offset: { x: number; y: number };
  setOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  dragging: boolean;
  setDragging: React.Dispatch<React.SetStateAction<boolean>>;
  start: { x: number; y: number } | null;
  setStart: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  hasDragged: boolean;
  setHasDragged: React.Dispatch<React.SetStateAction<boolean>>;
  handleImgMouseDown: (e: React.MouseEvent<HTMLImageElement>) => void;
  handleImgMouseMove: (e: React.MouseEvent<HTMLImageElement>) => void;
  handleImgMouseUp: () => void;
  handleImgClick: () => void;
  handleImgMouseLeave: () => void;
  handleBackdropClick: (e: React.MouseEvent<HTMLDivElement>) => void;
};

const ImageAlbumModal: React.FC<ImageAlbumModalProps> = ({
  album,
  setAlbum,
  zoom,
  setZoom,
  offset,
  setOffset,
  dragging,
  handleImgMouseDown,
  handleImgMouseMove,
  handleImgMouseUp,
  handleImgClick,
  handleImgMouseLeave,
  handleBackdropClick,
}) => (
  <div
    className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50"
    onClick={handleBackdropClick}
    aria-modal="true"
    role="dialog"
    tabIndex={-1}
  >
    <div
      className="relative max-w-3xl w-[96vw] sm:w-[90vw] flex flex-col items-center"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex items-center justify-center w-full h-[60vh] sm:h-[80vh] bg-black rounded-xl overflow-hidden">
        <img
          src={album.imgs[album.idx]}
          alt={`Imagen ampliada ${album.idx + 1}`}
          className="object-contain w-full h-full max-w-full max-h-full bg-black rounded-xl shadow-lg select-none"
          draggable={false}
          style={{
            transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
            cursor: zoom > 1 ? (dragging ? 'grabbing' : 'zoom-in') : 'zoom-in',
            userSelect: 'none'
          }}
          onMouseDown={handleImgMouseDown}
          onMouseMove={handleImgMouseMove}
          onMouseUp={handleImgMouseUp}
          onClick={handleImgClick}
          onMouseLeave={handleImgMouseLeave}
          onDragStart={e => e.preventDefault()}
        />
      </div>
      <div className="mt-4 flex justify-center items-center gap-6 w-full">
        <button
          className={`text-2xl font-bold p-2 rounded-full border-2 transition ${
            album.idx === 0
              ? 'bg-gray-300 border-gray-300 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 border-blue-400 text-white hover:bg-blue-700 hover:border-blue-600 hover:scale-110'
          }`}
          onClick={() =>
            setAlbum({ ...album, idx: album.idx > 0 ? album.idx - 1 : album.idx })
          }
          disabled={album.idx === 0}
          aria-label="Anterior"
        >
          ‹
        </button>
        <button
          className={`text-2xl font-bold p-2 rounded-full border-2 transition ${
            album.idx === album.imgs.length - 1
              ? 'bg-gray-300 border-gray-300 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 border-blue-400 text-white hover:bg-blue-700 hover:border-blue-600 hover:scale-110'
          }`}
          onClick={() =>
            setAlbum({
              ...album,
              idx: album.idx < album.imgs.length - 1 ? album.idx + 1 : album.idx,
            })
          }
          disabled={album.idx === album.imgs.length - 1}
          aria-label="Siguiente"
        >
          ›
        </button>
      </div>
      <button
        className="absolute top-3 right-3 bg-pink-600 border-2 border-white text-white font-bold p-2 rounded-full text-xl shadow-lg hover:bg-pink-700 hover:scale-110 transition"
        onClick={() => {
          setAlbum(null);
          setZoom(1);
          setOffset({ x: 0, y: 0 });
        }}
        title="Cerrar"
        aria-label="Cerrar"
      >
        ×
      </button>
      {zoom > 1 && (
        <button
          className="absolute bottom-4 right-4 bg-gray-800/80 text-white px-3 py-1 rounded shadow"
          onClick={() => {
            setZoom(1);
            setOffset({ x: 0, y: 0 });
          }}
        >
          Restablecer zoom
        </button>
      )}
    </div>
  </div>
);

export default ImageAlbumModal;
