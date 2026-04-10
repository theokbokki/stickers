import { Head, router } from "@inertiajs/react";
import { motion } from "motion/react"

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

function resizeImage(maxSize = 800) {
    return async (file) => {
        const img = await loadImage(file);
        let { width, height } = img;

        if (width <= maxSize && height <= maxSize) {
            return file;
        }

        if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
        } else {
            width = (width * maxSize) / height;
            height = maxSize;
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);

        return canvasToFile(canvas, file.name);
    };
}

function addBorder(borderSize = 10, borderColor = "white") {
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

export default function App({ images }) {
    async function handleFileChange(e) {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        const sticker = await applyEffects(file, [
            resizeImage(800),
            addBorder(10, "white"),
        ]);

        router.post("/create-sticker", { image: sticker }, {
            forceFormData: true,
        });
    }

    const randomRotation = () => {
        const value = Math.floor(Math.random() * 5) + 4;

        return Math.random() < 0.5 ? value : -value;
    };

    const imageTags = images.map(image =>
        <motion.img
            src={'storage/'+image}
            alt=""
            className="sticker"
            drag
            dragMomentum={false}
            whileDrag={{
                scale: 1.15,
                filter: "drop-shadow(0 0 16px rgba(0, 0, 0, .15))",
                rotate: randomRotation(),
                cursor: "grabbing",
            }}
        />
    );

    return (
        <>
            <Head title="Stickers app" />
            <h1 className="sro">Stickers</h1>

            <label className="btn">
                <span>Add sticker</span>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sro"
                />
            </label>

            { imageTags }
        </>
    );
}
