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

    document.getElementById('registrationForm').addEventListener('click', (e) => {
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

    showStep(currentStep);
});
