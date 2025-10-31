//dynamic form changing -- body type changes according to the gender chosen by the user
document.addEventListener('DOMContentLoaded', () => {
    const genderSelect = document.getElementById('g');
    const bodyTypeSelect = document.getElementById('bT');
    const heightInput = document.getElementById('h');
    const weightInput = document.getElementById('w');
    const hError = document.getElementById('h-error');
    const wError = document.getElementById('w-error');
    const btn = document.getElementById('findStyleBtn');
    const bodyHint = document.getElementById('body-type-hint');

    // define body types for each gender
    const bodyTypes = {
        male: [
            { value: 'triangle', text: 'Triangle' },
            { value: 'trapezoid', text: 'Trapezoid' },
            { value: 'round', text: 'Round' },
            { value: 'inverted-triangle', text: 'Inverted Triangle' },
            { value: 'rectangle', text: 'Rectangle' },
            { value: 'hourglass', text: 'Hourglass' }
        ],
        female: [
            { value: 'hourglass', text: 'Hourglass' },
            { value: 'round', text: 'Round' },
            { value: 'pear', text: 'Pear' },
            { value: 'inverted-triangle', text: 'Inverted Triangle' },
            { value: 'diamond', text: 'Diamond' },
            { value: 'triangle', text: 'Triangle' },
            { value: 'rectangle', text: 'Rectangle' }
        ]
    };

    // function to populate body type dropdown
    function updateBodyTypes() {
        const selectedGender = genderSelect.value;
        const options = bodyTypes[selectedGender];
        bodyTypeSelect.innerHTML = '';
        options.forEach(opt => {
            const optionEl = document.createElement('option');
            optionEl.value = opt.value;
            optionEl.text = opt.text;
            bodyTypeSelect.appendChild(optionEl);
        });
    }

    // validation function
    function validateInput(input, errorSpan) {
        if (input.value === "" || input.value < 0) {
            errorSpan.textContent = "Value cannot be negative";
            return false;
        } else {
            errorSpan.textContent = "";
            return true;
        }
    }

    // initialize
    updateBodyTypes();
    genderSelect.addEventListener('change', updateBodyTypes);

    heightInput.addEventListener('input', () => validateInput(heightInput, hError));
    weightInput.addEventListener('input', () => validateInput(weightInput, wError));

    // handle findStyle button
    btn.addEventListener('click', () => {
        const isHeightValid = validateInput(heightInput, hError);
        const isWeightValid = validateInput(weightInput, wError);

        if (isHeightValid && isWeightValid) {
            const userProfile = {
                height: heightInput.value,
                weight: weightInput.value,
                gender: genderSelect.value,
                bodyType: bodyTypeSelect.value
            };

            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            console.log("✅ User profile saved:", userProfile);

            window.location.href = 'drip.html';
        }
    });

    // body type hint image download
    if (bodyHint) {
        bodyHint.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = 'assets/body-types.png';
            link.download = 'body-types.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
});

//body type image
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('body-type-hint').addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = 'assets/body-types.png'; // your image path
        link.download = 'body-types.png';   // suggested filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});