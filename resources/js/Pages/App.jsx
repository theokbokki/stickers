import { Head, router } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, MotionConfig, correctParentTransform  } from "motion/react";

function loadImage(file) {
    return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => {
            URL.revokeObjectURL(img.src);

            resolve(img);
        };

        img.src = URL.createObjectURL(file);
    });
}

function canvasToFile(canvas, filename) {
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            const name = filename.replace(/\.[^.]+$/, ".webp");

            resolve(new File([blob], name, { type: "image/webp" }));
        }, "image/webp");
    });
}

function resizeImage(size = 800) {
    return async (file) => {
        const img = await loadImage(file);
        let { width, height } = img;

        if (width > height) {
            height = (height * size) / width;
            width = size;
        } else {
            width = (width * size) / height;
            height = size;
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);

        return canvasToFile(canvas, file.name);
    };
}

function addBorder(borderSize = 20, borderColor = "white") {
    return async (file) => {
        const img = await loadImage(file);
        const w = img.width + borderSize * 2;
        const h = img.height + borderSize * 2;
        const canvas = document.createElement("canvas");

        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");

        ctx.globalCompositeOperation = "source-over";

        for (let angle = 0; angle < 360; angle += 5) {
            const x = borderSize + Math.cos((angle * Math.PI) / 180) * borderSize;
            const y = borderSize + Math.sin((angle * Math.PI) / 180) * borderSize;

            ctx.drawImage(img, x, y);
        }

        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = borderColor;
        ctx.fillRect(0, 0, w, h);

        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(img, borderSize, borderSize);

        return canvasToFile(canvas, file.name);
    };
}

async function applyEffects(file, effects) {
    let result = file;

    for (const effect of effects) {
        result = await effect(result);
    }

    return result;
}

export default function App({ stickers: initialStickers }) {
    const canvasX = useMotionValue(0);
    const canvasY = useMotionValue(0);
    const canvasScale = useMotionValue(1);
    const canvasRef = useRef(null);

    const [stickers, setStickers] = useState(initialStickers);

    useEffect(() => {
        const sticker = initialStickers.find(s => s.x === null && s.y === null);

        if (!sticker) {
            setStickers(initialStickers);

            return;
        }

        const x = 100000 - canvasX.get() + window.innerWidth / 2 - 120;
        const y = 100000 - canvasY.get() + window.innerHeight / 2 - 120;

        setStickers(initialStickers.map(s =>
            s.id === sticker.id ? { ...s, x, y } : s
        ));

        router.post(`/stickers/${sticker.id}`, { x, y }, { preserveScroll: true });
    }, [initialStickers]);

    useEffect(() => {
        const el = canvasRef.current;
        if (!el) return;

        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, []);

    async function handleFileChange(e) {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        const sticker = await applyEffects(file, [
            resizeImage(),
            addBorder(),
        ]);

        router.post("/stickers/create", { image: sticker }, {
            forceFormData: true,
        });
    }

    function handleWheel(e) {
        e.preventDefault();

        const oldScale = canvasScale.get();
        const newScale = Math.min(Math.max(oldScale + e.deltaY * -0.001, 0.1), 3);

        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const scaleRatio = newScale / oldScale;

        canvasX.set(mouseX - scaleRatio * (mouseX - canvasX.get()));
        canvasY.set(mouseY - scaleRatio * (mouseY - canvasY.get()));

        canvasScale.set(newScale);
    }

    const randomRotation = () => {
        const value = Math.floor(Math.random() * 5) + 4;

        return Math.random() < 0.5 ? value : -value;
    };

    const imageTags = stickers.map(sticker =>
        <motion.img
            key={sticker.id}
            src={sticker.src}
            alt=""
            className="sticker"
            style={{ x: sticker.x ?? 0, y: sticker.y ?? 0 }}
            drag
            dragMomentum={false}
            onPointerDown={(e) => e.stopPropagation()}
            whileDrag={{
                scale: 1.15,
                filter: "drop-shadow(0 0 16px rgba(0, 0, 0, .15))",
                rotate: randomRotation(),
                cursor: "grabbing",
            }}
            onDragEnd={(event, info) => {
                router.post(`/stickers/${sticker.id}`, {
                    x: (sticker.x ?? 0) + info.offset.x,
                    y: (sticker.y ?? 0) + info.offset.y,
                }, { preserveScroll: true });
            }}
        />
    );

    return (
        <>
            <Head title="Stickers app" />
            <div style={{ height: "30px", WebkitAppRegion: "drag" }}></div>
            <h1 className="sro">Stickers</h1>

            <motion.div
                ref={canvasRef}
                className="canvas"
                drag
                dragMomentum={false}
                style={{ x: canvasX, y: canvasY, scale: canvasScale, cursor: 'grab' }}
                whileDrag={{ cursor: 'grabbing' }}
            >
                <MotionConfig transformPagePoint={correctParentTransform(canvasRef)}>
                    {imageTags}
                </MotionConfig>
            </motion.div>

            <label className="btn">
                <span>Add sticker</span>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sro"
                />
            </label>
        </>
    );
}
