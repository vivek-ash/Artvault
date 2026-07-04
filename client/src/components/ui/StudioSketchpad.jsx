import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineTrash, HiOutlineArrowDownTray, HiOutlineArrowPath } from 'react-icons/hi2';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const COLORS = [
  { hex: '#c45d3e', name: 'Terracotta' },
  { hex: '#2d8686', name: 'Teal' },
  { hex: '#c9a84c', name: 'Gold' },
  { hex: '#d97a5e', name: 'Coral' },
  { hex: '#a384cc', name: 'Lavender' },
  { hex: '#1a1a1a', name: 'Charcoal' },
  { hex: '#faf8f5', name: 'Warm White' },
];

const StudioSketchpad = () => {
  const { isDark } = useTheme();
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#c45d3e');
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(0.8);

  useEffect(() => {
    initCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get parent bounds
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = 360 * 2;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `360px`;

    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;
    
    // Fill canvas with white by default (better for downloads)
    context.fillStyle = isDark ? '#1a1a1a' : '#faf8f5';
    context.fillRect(0, 0, rect.width, 360);
  };

  const handleResize = () => {
    // Save drawings, resize and restore if needed, or just re-init for simplicity
    initCanvas();
  };

  const startDrawing = ({ nativeEvent }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (nativeEvent.touches) {
      clientX = nativeEvent.touches[0].clientX;
      clientY = nativeEvent.touches[0].clientY;
    } else {
      clientX = nativeEvent.clientX;
      clientY = nativeEvent.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Apply configurations
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.globalAlpha = opacity;

    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (nativeEvent.touches) {
      clientX = nativeEvent.touches[0].clientX;
      clientY = nativeEvent.touches[0].clientY;
    } else {
      clientX = nativeEvent.clientX;
      clientY = nativeEvent.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = contextRef.current;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    ctx.fillStyle = isDark ? '#1a1a1a' : '#faf8f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    toast.success('Canvas cleared');
  };

  const downloadSketch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'artvault-sketch.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Sketch downloaded! You can attach this to your requests.');
  };

  return (
    <div className={`card overflow-hidden border ${isDark ? 'border-gallery-darkBorder' : 'border-gallery-border'}`}>
      <div className={`p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDark ? 'bg-black/10 border-gallery-darkBorder' : 'bg-black/2.5 border-gallery-border'
      }`}>
        <div>
          <h3 className="font-display font-bold text-lg text-brand-terracotta">Studio Sketchpad</h3>
          <p className={`text-xs ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
            Doodle custom reference concepts, drafts, and ideas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={clearCanvas} className="btn-ghost flex items-center gap-1.5 text-xs text-red-400 !py-1.5 !px-3" title="Clear Canvas">
            <HiOutlineTrash className="w-4 h-4" /> Clear
          </button>
          <button onClick={initCanvas} className="btn-ghost flex items-center gap-1.5 text-xs !py-1.5 !px-3" title="Reset Bounds">
            <HiOutlineArrowPath className="w-4 h-4" /> Reset
          </button>
          <button onClick={downloadSketch} className="btn-primary flex items-center gap-1.5 text-xs !py-1.5 !px-4" title="Save PNG">
            <HiOutlineArrowDownTray className="w-4 h-4" /> Save Sketch
          </button>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Color / Brush Settings */}
        <div className="md:col-span-1 space-y-4 flex flex-col justify-center">
          <div>
            <label className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
              isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
            }`}>
              Brush Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    color === c.hex ? 'scale-125 border-brand-gold' : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className={`text-xs font-semibold uppercase tracking-wider block ${
                isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
              }`}>
                Brush Size
              </label>
              <span className="text-xs font-mono">{brushSize}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full accent-brand-terracotta"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className={`text-xs font-semibold uppercase tracking-wider block ${
                isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
              }`}>
                Watercolor Opacity
              </label>
              <span className="text-xs font-mono">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full accent-brand-terracotta"
            />
          </div>
        </div>

        {/* Drawing Area */}
        <div className="md:col-span-3 border rounded-xl overflow-hidden relative" style={{ height: '360px' }}>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="cursor-crosshair bg-transparent touch-none block"
          />
        </div>
      </div>
    </div>
  );
};

export default StudioSketchpad;
