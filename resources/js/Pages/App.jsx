import { Head, router } from "@inertiajs/react";

export default function App({ image }) {
    function handleFileChange(e) {
        const file = e.target.files[0];

        if (!file) return;

        router.post("/create-sticker", { image: file }, {
            forceFormData: true,
        });
    }

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
        </>
    );
}
