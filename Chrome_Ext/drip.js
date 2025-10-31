document.addEventListener('DOMContentLoaded', () => {
    const uploadCard = document.getElementById('upload-container');
    const styleTalkCard = document.getElementById('stylist-container');
    const outfitFileInput = document.getElementById('outfitFile');

    //UPLOAD OUTFIT flow
    uploadCard.addEventListener('click', () => {
        //trigger file selection
        outfitFileInput.click();
    });

    outfitFileInput.addEventListener('change', () => {
        if (outfitFileInput.files.length > 0) {
            const file = outfitFileInput.files[0];

            //only accept images
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file!');
                return
            }

            const reader = new FileReader();
            reader.onload = () => {
                const imageData = reader.result; //base64 string
                localStorage.setItem('uploadedOutfit', imageData);
                console.log("Outfit saved to local storage!");

                //redirect to chatbot (Auri)
                window.location.href = 'auri.html';
            };

            //start reading the file
            reader.readAsDataURL(file);
        }
    });

    //STYLE TALK flow
    styleTalkCard.addEventListener('click', () => {
        window.location.href = 'auri.html';
    });
});
