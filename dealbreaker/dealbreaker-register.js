document.addEventListener('DOMContentLoaded', () => {
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const progressBar = document.getElementById('formProgress');
    let currentStep = 0;

    function updateProgress(index) {
        if (progressBar) {
            const percent = (index / (steps.length - 1)) * 100;
            progressBar.style.width = `${percent}%`;
        }
    }

    function showStep(index) {
        steps.forEach((step, i) => {
            step.classList.toggle('d-none', i !== index);
        });
        updateProgress(index);
    }

    const form = document.getElementById('registrationForm');
    form.addEventListener('click', (e) => {
        if (e.target.classList.contains('next-step')) {
            e.preventDefault();
            if (currentStep < steps.length - 1) {
                currentStep++;
                showStep(currentStep);
            }
        }
        if (e.target.classList.contains('prev-step')) {
            e.preventDefault();
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('name').value,
            gender: document.getElementById('gender').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            bio: '',
        };
        const fileInput = document.getElementById('profileImage');
        const finalize = () => {
            localStorage.setItem('registrationData', JSON.stringify(data));
            window.location.href = 'dealbreaker-app.html';
        };
        if (fileInput && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                data.profileImage = ev.target.result;
                finalize();
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            finalize();
        }
    });

    showStep(currentStep);
});
