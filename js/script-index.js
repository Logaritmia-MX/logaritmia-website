const steps = document.getElementsByClassName('methodology-step');
const nextBtn = document.getElementById('next-methodology-step');
const prevBtn = document.getElementById('prev-methodology-step');
const progressPoints = []

const addTranslateToStep = function(step) {
    const translateValue = step * 100;
    const transform = `translate(-${translateValue}%, 0)`
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const progressDot = progressPoints[i];
        step.style.transform = transform;
        progressDot.classList.add('transparent');
    }
    progressPoints[step].classList.remove('transparent')
}

const blockBtnNumbericOverflow = function(step) {
    nextBtn.disabled = step == steps.length - 1;
    prevBtn.disabled = step == 0;
}

const carouselControl = function() {
    let currentStep = 0;
    const progressContainer = document.querySelector('.progress-dots');
    for (let i = 0; i < steps.length; i++) {
        const progressDot = document.createElement('div');
        progressPoints.push(progressDot);
        progressContainer.appendChild(progressDot)
    }
    nextBtn.addEventListener('click', function() {
        currentStep = currentStep + 1;
        addTranslateToStep(currentStep);
        blockBtnNumbericOverflow(currentStep);
    })
    prevBtn.addEventListener('click', function() {
        currentStep = currentStep - 1;
        addTranslateToStep(currentStep);
        blockBtnNumbericOverflow(currentStep);
    })
    addTranslateToStep(currentStep);
    blockBtnNumbericOverflow(currentStep);
}

carouselControl()
